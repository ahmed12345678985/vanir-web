import "dotenv/config";
import express from "express";

process.on("unhandledRejection", (reason, promise) => {
  console.warn("[Process] Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("[Process] Uncaught Exception:", error);
});
import { createServer } from "http";
import net from "net";
import path from "path";
import cors from 'cors';
import compression from "compression";
import fs from "fs";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { registerDownloadProxy } from "../downloadProxy";
import { registerVideoProxy } from "../videoProxy";
import { registerFirebaseAuthRoutes } from "../authExpressRouter";
import { registerCheckoutAndVerifyRoutes } from "./checkoutRoutes";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { Server as SocketIOServer } from "socket.io";
import { initializeFlightTracker } from "./flightTracker";

const DIRNAME = typeof __dirname !== "undefined"
  ? __dirname
  : (typeof import.meta !== "undefined" && (import.meta as any).url ? path.dirname(new URL('.', (import.meta as any).url).pathname) : process.cwd());

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

/**
 * Build a minimal Express app with only the tRPC + proxy routes.
 * Safe to call in Vercel Serverless — never calls listen() or imports Vite.
 */
export function createApp() {
  const app = express();
  
  // Gzip / Deflate response compression for HTML, CSS, JS, JSON, XML, SVG
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    threshold: 1024,
  }));

  // HTTPS enforcement in production (resolves HTTP to HTTPS & 3XX redirect issues)
  app.use((req, res, next) => {
    if (process.env.NODE_ENV === "production") {
      const proto = req.headers["x-forwarded-proto"];
      const host = req.headers.host;
      if (proto && proto === "http") {
        return res.redirect(301, `https://${host}${req.url}`);
      }
    }
    next();
  });

  // Cloudflare Email Protection redirect - eliminates 404 broken link reports for crawlers
  app.get(["/cdn-cgi/l/email-protection*", "/cdn-cgi/l/email-protection"], (_req, res) => {
    res.redirect(301, "/contact");
  });

  // Dedicated Sitemap and Robots handlers
  app.get("/robots.txt", (_req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    const robotsPath = path.resolve(DIRNAME, "../..", "client", "public", "robots.txt");
    const distRobotsPath = path.resolve(DIRNAME, "public", "robots.txt");
    if (fs.existsSync(robotsPath)) {
      return res.sendFile(robotsPath);
    } else if (fs.existsSync(distRobotsPath)) {
      return res.sendFile(distRobotsPath);
    }
    res.send(
      "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://vanirgroup.com/sitemap.xml\nSitemap: https://vanirgroup.com/sitemap_index.xml\n"
    );
  });

  // Android App Links Digital Asset Links verification endpoint
  app.get("/.well-known/assetlinks.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    const candidatePaths = [
      path.resolve(DIRNAME, "../..", "client", "public", ".well-known", "assetlinks.json"),
      path.resolve(DIRNAME, "public", ".well-known", "assetlinks.json"),
      path.resolve(process.cwd(), "public", ".well-known", "assetlinks.json"),
      path.resolve(process.cwd(), "dist", "public", ".well-known", "assetlinks.json"),
    ];
    const foundPath = candidatePaths.find((p) => fs.existsSync(p));
    if (foundPath) {
      return res.sendFile(foundPath);
    }
    return res.json([
      {
        relation: [
          "delegate_permission/common.handle_all_urls",
          "delegate_permission/common.get_login_creds",
        ],
        target: {
          namespace: "android_app",
          package_name: "com.vanir.mobile",
          sha256_cert_fingerprints: [
            "C7:7D:F4:E1:27:F8:CC:B5:4B:EC:E4:9F:74:82:ED:18:4F:4C:DE:0E:59:D8:06:48:7D:A3:17:04:43:20:43:1B",
            "A6:7E:FF:46:02:68:E0:AC:80:81:0D:96:19:B7:04:1C:21:CD:B8:1F:5C:99:7C:F8:7C:C4:E6:22:94:E0:41:5A",
          ],
        },
      },
    ]);
  });

  const SITEMAP_ROUTES = [
    "", "about", "author/ahmed-roshdi", "team", "packages", "destinations", "destinations/egypt", "destinations/dubai",
    "destinations/maldives", "destinations/switzerland", "destinations/greece", "destinations/italy",
    "hotels", "private-jet", "tours", "day-trips", "fast-track", "visa", "esim", "mice",
    "flights-booking", "hotels-booking", "insurance", "groups", "news", "affiliated",
    "booking", "reviews", "offers", "case-studies", "blog", "contact", "privacy-policy", "terms-of-service",
    "blog/what-does-a-luxury-travel-concierge-do",
    "blog/private-jet-charter-guide-how-to-book-costs",
    "blog/luxury-travel-agency-vs-concierge-service",
    "blog/egypt-luxury-travel-guide-private-tours-nile-cruises",
    "blog/best-private-islands-maldives-retreats-uhnw",
    "blog/how-to-plan-bespoke-european-vacation-luxury-concierge"
  ];

  const generateUrlsetXml = (routes: string[]) => {
    const lastmod = "2026-11-02";
    return (
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
      routes
        .map((u) => {
          const loc = u === "" ? "https://vanirgroup.com/" : `https://vanirgroup.com/${u}`;
          const priority = u === "" ? "1.0" : u.startsWith("destinations/") || u === "private-jet" ? "0.9" : "0.85";
          return (
            `  <url>\n` +
            `    <loc>${loc}</loc>\n` +
            `    <lastmod>${lastmod}</lastmod>\n` +
            `    <changefreq>weekly</changefreq>\n` +
            `    <priority>${priority}</priority>\n` +
            `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />\n` +
            `    <xhtml:link rel="alternate" hreflang="en" href="${loc}" />\n` +
            `    <xhtml:link rel="alternate" hreflang="de" href="${loc}" />\n` +
            `    <xhtml:link rel="alternate" hreflang="de-DE" href="${loc}" />\n` +
            `    <xhtml:link rel="alternate" hreflang="ar" href="${loc}" />\n` +
            `  </url>`
          );
        })
        .join("\n") +
      `\n</urlset>`
    );
  };

  app.get(["/sitemap.xml", "/sitemap_index.xml", "/page-sitemap.xml"], (_req, res) => {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(generateUrlsetXml(SITEMAP_ROUTES));
  });

  app.get("/post-sitemap.xml", (_req, res) => {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    const blogRoutes = SITEMAP_ROUTES.filter((r) => r === "blog" || r.startsWith("blog/"));
    res.send(generateUrlsetXml(blogRoutes));
  });

  // Enable CORS for all origins in development, restrict in production.
  // In production, CORS_ORIGINS (comma-separated) overrides the default allowlist
  // so Render-hosted frontends can be added without a code change.
  let allowedOrigins: string[] | boolean;
  if (process.env.NODE_ENV === 'production') {
    const extra = (process.env.CORS_ORIGINS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    allowedOrigins = [
      'https://vanirgroup.com',
      'https://www.vanirgroup.com',
      ...extra,
    ];
  } else {
    allowedOrigins = true; // allow all in development
  }

  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
  }));

  // Allow Firebase Google Sign-In popup to communicate back.
  // COOP: same-origin blocks popup.closed checks which Firebase signInWithPopup depends on.
  app.use((_req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Serve locally-uploaded files (fallback when Supabase is not configured)
  app.use("/uploads", express.static(path.resolve(DIRNAME, "..", "public", "uploads")));

  // Reliable media streaming endpoint (/api/media?src=/images/...) that bypasses
  // LiteSpeed static file 403 permission checks by serving local public assets via Express
  app.get("/api/media", (req, res) => {
    const rawSrc = typeof req.query.src === "string" ? req.query.src : "";
    if (!rawSrc) {
      return void res.status(400).send("Missing src parameter");
    }

    let decoded = rawSrc;
    try {
      decoded = decodeURIComponent(rawSrc);
    } catch {
      decoded = rawSrc;
    }

    const cleanRel = decoded
      .replace(/^https?:\/\/[^/]+/i, "")
      .replace(/\?.*$/, "")
      .replace(/^\/+/, "");

    if (!cleanRel || cleanRel.includes("..")) {
      return void res.status(400).send("Invalid asset path");
    }

    const roots = [
      path.resolve(DIRNAME, "public"),
      path.resolve(DIRNAME, "dist", "public"),
      path.resolve(process.cwd(), "dist", "public"),
      path.resolve(process.cwd(), "public"),
      path.resolve(DIRNAME, "../..", "dist", "public"),
      path.resolve(DIRNAME, "../..", "client", "public"),
      path.resolve(process.cwd(), "client", "public"),
      path.resolve(process.cwd(), "images"),
    ];

    for (const rootDir of roots) {
      const candidate =
        rootDir.endsWith(`${path.sep}images`) && cleanRel.startsWith("images/")
          ? path.resolve(rootDir, cleanRel.replace(/^images\//, ""))
          : path.resolve(rootDir, cleanRel);

      if (candidate.startsWith(rootDir) && fs.existsSync(candidate)) {
        try {
          const stat = fs.statSync(candidate);
          if (stat.isFile()) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
            return void res.sendFile(candidate);
          }
        } catch {
          // continue searching candidate roots
        }
      }
    }

    return void res.status(404).send("Media asset not found");
  });

  registerStorageProxy(app);
  registerDownloadProxy(app);
  registerVideoProxy(app);
  registerOAuthRoutes(app);
  registerFirebaseAuthRoutes(app);
  registerCheckoutAndVerifyRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );
  
  return app;
}

export async function startServer() {
  console.log("[Server] startServer() invoked successfully");
  const app = createApp();
  const server = createServer(app);

  // Initialize WebSockets for Live Flight Tracking
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*", // Adjust for production
      methods: ["GET", "POST"]
    }
  });
  initializeFlightTracker(io);

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  if (process.env.VERCEL !== "1") {
    // Phusion Passenger hook on cPanel / CloudLinux
    if (typeof (global as any).PhusionPassenger !== "undefined") {
      server.listen("passenger", () => {
        console.log("[Server] Running under Phusion Passenger");
      });
    } else if (process.env.PORT) {
      // In cPanel / Passenger / CloudLinux / Container environments,
      // parse numeric string as integer for TCP; keep non-numeric as pipe/socket path
      const portVal = /^\d+$/.test(process.env.PORT.trim())
        ? parseInt(process.env.PORT.trim(), 10)
        : process.env.PORT;
      server.listen(portVal, () => {
        console.log(`[Server] Running on port/socket: ${process.env.PORT}`);
      });
    } else {
      const preferredPort = 3000;
      server.listen(preferredPort, () => {
        console.log(`[Server] Running on http://localhost:${preferredPort}/`);
      });
    }
  }

  return app;
}

startServer().catch(console.error);
