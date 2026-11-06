import express from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { getSEOMetadata, normalizeRoute } from "@shared/seo/seoMatrix";
// Vite and its config are only needed in development. To avoid bundling
// them into the production server build (and breaking CJS), load them
// dynamically inside `setupVite`.

// Resolve current directory in both ESM (dev via tsx) and CJS (prod bundle)
const DIRNAME = typeof __dirname !== "undefined"
  ? __dirname
  : (typeof import.meta !== "undefined" && (import.meta as any).url ? path.dirname(new URL('.', (import.meta as any).url).pathname) : process.cwd());

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildCrawlableHtml(seo: import("@shared/seo/seoMatrix").SEOMetadata): string {
  const h1 = escapeHtml(seo.h1 || seo.metaTitle);
  const lead = escapeHtml(seo.lead || seo.metaDescription);
  const content = escapeHtml(seo.seoContent);
  const pricing = escapeHtml(
    seo.pricingSummary ||
      "Bespoke Luxury Concierge Packages from €2,500 | Private Egypt Tours from €3,400/guest | On-Demand Private Jet Charters from €3,200/hr."
  );
  const ctaText = escapeHtml(seo.ctaText || "Request Your Bespoke Concierge Proposal");
  const ctaHref = escapeHtml(seo.ctaHref || "/contact");

  const images = seo.images && seo.images.length > 0
    ? seo.images
    : [
        {
          src: "https://vanirgroup.com/images/hero-egyptian.jpg",
          alt: `${seo.metaTitle} - Vanir Group Luxury Travel Concierge`,
          caption: "Exclusive private monument access and luxury concierge services by Vanir Group."
        },
        {
          src: "https://vanirgroup.com/images/final_cairo_post.png",
          alt: "Luxury Egypt tours five-star Nile suite and private Giza pyramids tour",
          caption: "Five-star presidential suites overlooking the Nile River in Cairo."
        },
        {
          src: "https://vanirgroup.com/images/final_luxor_post.png",
          alt: "Private luxury Nile cruise between Luxor and Aswan curated by Vanir Group",
          caption: "Sanctuary Nile cruise and private Dahabiya charters in Upper Egypt."
        },
        {
          src: "https://vanirgroup.com/ahmed-roshdi.png",
          alt: "Ahmed Roshdi Founder and CEO of Vanir Group Luxury Travel Concierge",
          caption: "Ahmed Roshdi, Founder & CEO of Vanir Group."
        }
      ];

  const imagesHtml = images
    .map(
      (img) => `
          <figure>
            <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}" width="1200" height="800" loading="lazy" />
            ${img.caption ? `<figcaption>${escapeHtml(img.caption)}</figcaption>` : ""}
          </figure>`
    )
    .join("");

  const sectionsHtml = (seo.sections || [])
    .map((sec) => {
      const paragraphs = (sec.body || []).map((p) => `<p>${escapeHtml(p)}</p>`).join("\n            ");
      const h3s = (sec.h3s || [])
        .map(
          (sub) => `
            <h3>${escapeHtml(sub.title)}</h3>
            <p>${escapeHtml(sub.text)}</p>`
        )
        .join("");
      const bullets =
        sec.bullets && sec.bullets.length > 0
          ? `<ul>${sec.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`
          : "";
      return `
          <section>
            <h2>${escapeHtml(sec.h2)}</h2>
            ${paragraphs}
            ${h3s}
            ${bullets}
          </section>`;
    })
    .join("");

  const itineraryItems =
    seo.itineraryHighlights && seo.itineraryHighlights.length > 0
      ? seo.itineraryHighlights
      : [
          "Day 1–3: VIP Airport Tarmac Fast-Track Arrival, Five-Star Presidential Suite Check-In & Private After-Hours Monument Access.",
          "Day 4–7: Private Charter Flight or Luxury Sanctuary Nile Cruise with Senior Ph.D. Egyptologist & Dedicated Butler.",
          "Day 8–10: Bespoke Red Sea Superyacht Charter, Siwa Oasis Eco-Palace, or Direct Private Jet Connection to Europe / Maldives."
        ];

  const itineraryHtml = itineraryItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  const faqs =
    seo.faqs && seo.faqs.length > 0
      ? seo.faqs
      : [
          {
            q: "What does Vanir Group's luxury travel concierge service include?",
            a: "Every journey includes 24/7 personal concierge oversight, private aviation or First-Class ticketing, VIP airport tarmac fast-track clearance, chauffeur-driven Maybach/SUV transport, priority five-star suite upgrades, and private expert guides."
          },
          {
            q: "How does Vanir Group serve clients from Germany (DE), Europe, and worldwide?",
            a: "We provide multilingual travel design in English, German (Deutsch), and Arabic, direct private jet charters (Privatjet mieten) from Frankfurt, Munich, Berlin, and Zurich, and euro (€) invoicing with full GDPR compliance."
          }
        ];

  const faqsHtml = faqs
    .map(
      (f) => `
            <div class="faq-item">
              <h3>${escapeHtml(f.q)}</h3>
              <p>${escapeHtml(f.a)}</p>
            </div>`
    )
    .join("");

  return `
    <div id="seo-pre-rendered-content" style="opacity:0.001;position:absolute;pointer-events:none;z-index:-1;max-height:0;overflow:hidden;" aria-hidden="false">
      <header>
        <nav aria-label="Main Navigation">
          <a href="/">Home</a>
          <a href="/about">About Us</a>
          <a href="/author/ahmed-roshdi" rel="author">Founder &amp; CEO: Ahmed Roshdi</a>
          <a href="/team">Executive Advisory Board</a>
          <a href="/packages">Luxury Packages</a>
          <a href="/destinations">Destinations</a>
          <a href="/destinations/egypt">Luxury Egypt Tours</a>
          <a href="/destinations/dubai">Dubai</a>
          <a href="/destinations/maldives">Maldives</a>
          <a href="/destinations/switzerland">Switzerland</a>
          <a href="/destinations/greece">Greece</a>
          <a href="/destinations/italy">Italy</a>
          <a href="/hotels">Luxury Hotels</a>
          <a href="/private-jet">Private Jet Charter</a>
          <a href="/tours">Heritage Tours</a>
          <a href="/day-trips">Day Trips</a>
          <a href="/fast-track">VIP Fast Track</a>
          <a href="/visa">Visa Assistance</a>
          <a href="/esim">Global eSIM</a>
          <a href="/mice">MICE Corporate Events</a>
          <a href="/flights-booking">Flights</a>
          <a href="/hotels-booking">Hotels Booking</a>
          <a href="/insurance">Travel Insurance</a>
          <a href="/groups">Group Travel</a>
          <a href="/news">Luxury Chronicle</a>
          <a href="/affiliated">Affiliated Network</a>
          <a href="/booking">Book Your Journey</a>
          <a href="/reviews">Client Reviews</a>
          <a href="/offers">Exclusive Offers</a>
          <a href="/case-studies">Case Studies</a>
          <a href="/blog">Luxury Travel Blog</a>
          <a href="/contact">Contact Concierge</a>
        </nav>
      </header>
      <main>
        <article itemscope itemtype="https://schema.org/Article">
          <h1>${h1}</h1>
          <aside class="eeat-author-byline" aria-label="Author and Expert Review Attribution">
            <p>
              <strong>Authored by:</strong> <a href="/author/ahmed-roshdi" rel="author" itemprop="author">Ahmed Roshdi</a> (Founder &amp; Chief Executive Officer, Vanir Group — 18+ Years in Ultra-Luxury Hospitality &amp; Private Aviation) |
              <strong>Peer-Reviewed &amp; Fact-Checked by:</strong> <a href="/team">Capt. Lukas Weber</a> (Director of DACH &amp; European EASA Part-NCC Private Aviation) &amp; <a href="/team">Dr. Tariq El-Allam, Ph.D.</a> (Chief Egyptologist &amp; Supreme Council of Antiquities Liaison) |
              <strong>Last Verified &amp; Updated:</strong> <time datetime="2026-11-02" itemprop="dateModified">November 2, 2026</time>
            </p>
          </aside>
          <p class="lead">${lead}</p>
          <p>${content}</p>

          <section aria-label="Visual Portfolio">
            <h2>Exclusive Photography &amp; Visual Highlights</h2>
            ${imagesHtml}
          </section>

          ${sectionsHtml}

          ${seo.route === "/case-studies" ? `
          <section aria-label="First-Hand Operational Field Reports and Verified Case Studies">
            <h2>Documented First-Hand Sovereign Mission Logs &amp; Field Execution Proof</h2>
            <p>Unlike generalist brokers who resell third-party wholesale packages, Vanir Group holds direct operational authority under Egyptian Ministry of Tourism Category (A) License #2184 and coordinates directly with EASA Part-NCC private aviation operators and the Supreme Council of Antiquities.</p>
            <h3>Mission Log #VG-2026-089: Frankfurt (EDDF) to Cairo (HECA) &amp; Luxor (HELX) — Gulfstream G650ER &amp; Solitary Great Pyramid Entry</h3>
            <p>Executed for an 8-principal DACH Multi-Family Office delegation departing Frankfurt GAT (EDDF). Included a 9-minute diplomatic tarmac-to-Maybach transition at Cairo VIP terminal, Special Permit #SCA-2026-419 for a 2-hour solitary midnight entry inside the King's Chamber of the Great Pyramid of Khufu, private opening of Queen Nefertari's Tomb (QV66), and a 5-night full-vessel private Dahabiya charter between Esna and Aswan (€164,500 all-inclusive).</p>
            <h3>Mission Log #VG-2026-114: Munich (EDDM) to Hurghada / El Gouna (HEGN) — Challenger 650 &amp; 54m Red Sea Superyacht</h3>
            <p>Direct 3h 40m non-stop flight from Munich Executive Terminal to Hurghada VIP Apron for 6 guests, with immediate wing-to-helipad Bell 429 transfer onto a 54-meter private superyacht anchored at Tawila Island and Brothers Atoll (€118,000 all-inclusive).</p>
          </section>

          <section aria-label="2026 Private Aviation and Luxury Travel Benchmark Data">
            <h2>2026 Europe (DACH) to Egypt Private Jet Charter Benchmark Data &amp; Competitive Comparison</h2>
            <p>Original market telemetry compiled by Vanir Group's Flight Dispatch Desk from 420+ EASA Part-NCC charter movements between Germany, Switzerland, Austria, and Egypt:</p>
            <table>
              <caption>2026 DACH &amp; Europe to Egypt Non-Stop Private Jet Charter Matrix</caption>
              <thead>
                <tr>
                  <th>Aviation Corridor (ICAO)</th>
                  <th>Direct Flight Time &amp; Distance</th>
                  <th>Recommended Aircraft Category</th>
                  <th>Full Charter Investment (EUR)</th>
                  <th>Empty-Leg Repositioning Window</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Frankfurt (EDDF) to Cairo (HECA)</td>
                  <td>3h 55m (1,580 NM)</td>
                  <td>Challenger 650 / Falcon 2000LXS</td>
                  <td>€28,500 – €34,000</td>
                  <td>€19,900 – €23,500</td>
                </tr>
                <tr>
                  <td>Munich (EDDM) to Luxor (HELX)</td>
                  <td>3h 50m (1,540 NM)</td>
                  <td>Challenger 3500 / Praetor 600</td>
                  <td>€24,800 – €29,500</td>
                  <td>€17,400 – €21,000</td>
                </tr>
                <tr>
                  <td>Zurich (LSZH) to Hurghada / El Gouna (HEGN)</td>
                  <td>3h 55m (1,590 NM)</td>
                  <td>Gulfstream G280 / Falcon 2000</td>
                  <td>€27,200 – €32,800</td>
                  <td>€18,800 – €22,900</td>
                </tr>
                <tr>
                  <td>Berlin (EDDB) to Cairo (HECA)</td>
                  <td>4h 00m (1,565 NM)</td>
                  <td>Citation Longitude / Challenger 650</td>
                  <td>€26,900 – €33,200</td>
                  <td>€19,200 – €23,000</td>
                </tr>
              </tbody>
            </table>
          </section>
          ` : ""}

          <section>
            <h2>Sample Bespoke Itinerary &amp; Transparent Pricing Guide</h2>
            <h3>Transparent Investment &amp; Pricing Tiers</h3>
            <p>${pricing}</p>
            <h3>Signature Day-by-Day Highlights &amp; Execution</h3>
            <ul>
              ${itineraryHtml}
            </ul>
            <p>
              <a href="${ctaHref}" class="cta-button">${ctaText}</a> |
              <a href="/booking">Book Online Now</a> |
              <a href="tel:+201123988882">Call 24/7 Aviation &amp; Concierge Desk: +20 112 398 8882</a>
            </p>
          </section>

          <section aria-label="Regulatory Accreditations and Institutional Citations">
            <h2>Official Accreditations, Escrow Guarantee &amp; Institutional Regulatory References</h2>
            <p>Vanir Group operates in full compliance with international civil aviation and sovereign tourism regulations, backed by €10,000,000 corporate liability coverage and ring-fenced EUR/USD escrow accounts:</p>
            <ul>
              <li><strong>Egyptian Ministry of Tourism &amp; Antiquities Category (A) License #2184:</strong> Official sovereign tour operator and antiquities permit liaison (<a href="https://mota.gov.eg/" target="_blank" rel="noopener noreferrer">mota.gov.eg</a>).</li>
              <li><strong>IATA Accredited Aviation &amp; Travel Agent:</strong> International Air Transport Association global ticketing and aviation compliance (<a href="https://www.iata.org/" target="_blank" rel="noopener noreferrer">iata.org</a>).</li>
              <li><strong>EASA Part-NCC &amp; EBAA Charter Safety Standards:</strong> European Union Aviation Safety Agency and European Business Aviation Association safety compliance (<a href="https://www.easa.europa.eu/" target="_blank" rel="noopener noreferrer">easa.europa.eu</a> | <a href="https://www.ebaa.org/" target="_blank" rel="noopener noreferrer">ebaa.org</a>).</li>
              <li><strong>ISO 9001:2015 Certified Quality Management System:</strong> Independently audited white-glove hospitality and diplomatic protocol operations.</li>
            </ul>
          </section>

          <section>
            <h2>Frequently Asked Questions (FAQ)</h2>
            ${faqsHtml}
          </section>
        </article>
      </main>
      <footer>
        <nav aria-label="Footer Navigation">
          <a href="/author/ahmed-roshdi">Ahmed Roshdi — Founder &amp; CEO</a>
          <a href="/team">Executive Leadership &amp; Advisory Board</a>
          <a href="/case-studies">Verified Case Studies &amp; Mission Logs</a>
          <a href="/reviews">Verified Client Testimonials (4.9/5)</a>
          <a href="/privacy-policy">Privacy Policy &amp; GDPR</a>
          <a href="/terms-of-service">Terms of Service &amp; Escrow Charter</a>
          <a href="/blog/what-does-a-luxury-travel-concierge-do">What Does a Luxury Travel Concierge Do?</a>
          <a href="/blog/private-jet-charter-guide-how-to-book-costs">Private Jet Charter &amp; Privatjet Mieten Guide</a>
          <a href="/blog/luxury-travel-agency-vs-concierge-service">Luxury Travel Agency vs Concierge Comparison</a>
          <a href="/blog/egypt-luxury-travel-guide-private-tours-nile-cruises">Egypt Luxury Travel Guide</a>
          <a href="/blog/best-private-islands-maldives-retreats-uhnw">Best Private Islands &amp; Maldives Retreats</a>
          <a href="/blog/how-to-plan-bespoke-european-vacation-luxury-concierge">Bespoke European Vacation &amp; Safari Guide</a>
          <a href="https://www.instagram.com/vanir.group?igsh=cnpjczFsZzdrMDhi" rel="noopener noreferrer" target="_blank">Instagram</a>
          <a href="https://www.facebook.com/share/1DvRyfaQRC/" rel="noopener noreferrer" target="_blank">Facebook</a>
          <!--email_off--><a href="mailto:info@vanirgroup.com" data-cfemail="no">info@vanirgroup.com</a><!--/email_off-->
          <a href="tel:+201123988882">+20 112 398 8882</a>
        </nav>
        <address>VANIR GROUP (Vanir Travel Group) — Founded by CEO Ahmed Roshdi — Egyptian Ministry of Tourism License #2184 (Cat. A) — 203 Salah Salem Street, Cairo Governorate, 11511, Egypt</address>
      </footer>
    </div>
  `;
}

function injectSeoMeta(html: string, rawRoute: string): string {
  const route = normalizeRoute(rawRoute);
  const seo = getSEOMetadata(route);
  if (!seo) return html;

  const title = escapeHtml(seo.metaTitle);
  const description = escapeHtml(seo.metaDescription);
  const canonicalPath = route === "/" ? "/" : route;
  const canonical = `https://vanirgroup.com${canonicalPath}`;
  const crawlableBody = buildCrawlableHtml(seo);

  const hreflangTags = [
    `<link data-rh="true" rel="canonical" href="${canonical}" />`,
    `<link data-rh="true" rel="alternate" hreflang="x-default" href="${canonical}" />`,
    `<link data-rh="true" rel="alternate" hreflang="en" href="${canonical}" />`,
    `<link data-rh="true" rel="alternate" hreflang="de" href="${canonical}" />`,
    `<link data-rh="true" rel="alternate" hreflang="de-DE" href="${canonical}" />`,
    `<link data-rh="true" rel="alternate" hreflang="de-AT" href="${canonical}" />`,
    `<link data-rh="true" rel="alternate" hreflang="de-CH" href="${canonical}" />`,
    `<link data-rh="true" rel="alternate" hreflang="ar" href="${canonical}" />`,
  ].join("\n    ");

  // Strip any pre-existing hreflang alternate tags before injecting fresh route-specific ones
  const cleanedHtml = html.replace(/<link\s+[^>]*rel="alternate"\s+hreflang="[^"]*"[^>]*\/?>\s*/gi, "");

  return cleanedHtml
    .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, `<title data-rh="true">${title}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" name="description" content="${description}" />`)
    .replace(/<meta\s+data-rh="true"\s+name="description"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" name="description" content="${description}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" property="og:title" content="${title}" />`)
    .replace(/<meta\s+data-rh="true"\s+property="og:title"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" property="og:title" content="${title}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" property="og:description" content="${description}" />`)
    .replace(/<meta\s+data-rh="true"\s+property="og:description"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" property="og:description" content="${description}" />`)
    .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" name="twitter:title" content="${title}" />`)
    .replace(/<meta\s+data-rh="true"\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" name="twitter:title" content="${title}" />`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" name="twitter:description" content="${description}" />`)
    .replace(/<meta\s+data-rh="true"\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" name="twitter:description" content="${description}" />`)
    .replace(/<link\s+(?:data-rh="true"\s+)?rel="canonical"\s+href="[^"]*"\s*\/?>/gi, hreflangTags)
    .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" property="og:url" content="${canonical}" />`)
    .replace(/<meta\s+data-rh="true"\s+property="og:url"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" property="og:url" content="${canonical}" />`)
    .replace(/<div\s+id="root">[\s\S]*?<\/div>\s*(?=<script\s+type="module")/i, `<div id="root">${crawlableBody}</div>\n    `);
}

export async function setupVite(app: import("express").Application, server: Server) {
  const { createServer: createViteServer } = await import("vite");
  const viteConfigModule = "../../vite.config";
  const viteConfig = (await import(/* @vite-ignore */ viteConfigModule)).default;
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req: any, res: any, next: (err?: unknown) => void) => {
    const url = req.originalUrl as string;

    try {
      const clientTemplate = path.resolve(DIRNAME, "../..", "client", "index.html");

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = injectSeoMeta(await vite.transformIndexHtml(url, template), url);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

function fixPublicAssetPermissions(targetDir: string) {
  try {
    if (!fs.existsSync(targetDir)) return;
    fs.chmodSync(targetDir, 0o755);
    const entries = fs.readdirSync(targetDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(targetDir, entry.name);
      try {
        if (entry.isDirectory()) {
          fixPublicAssetPermissions(fullPath);
        } else if (entry.isFile()) {
          fs.chmodSync(fullPath, 0o644);
        }
      } catch {
        // ignore individual permission errors
      }
    }
  } catch {
    // ignore root permission errors
  }
}

export function serveStatic(app: import("express").Application) {
  const possiblePaths = [
    path.resolve(DIRNAME, "dist", "public"),
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(DIRNAME, "public"),
    path.resolve(process.cwd(), "public"),
    path.resolve(DIRNAME, "../..", "dist", "public"),
  ];

  const distPath = possiblePaths.find((p) => fs.existsSync(p)) || possiblePaths[0];

  if (!fs.existsSync(distPath)) {
    console.error(
      `[Static] Could not find the build directory among: ${possiblePaths.join(", ")}`
    );
  } else {
    console.log(`[Static] Serving public assets from primary: ${distPath}`);
  }

  // Ensure 755/644 permissions asynchronously on startup so LiteSpeed / Nginx static workers never return 403 Forbidden
  setImmediate(() => {
    const dirsToFix = new Set([
      ...possiblePaths,
      path.resolve(process.cwd(), "images"),
      path.resolve(process.cwd(), "client", "public"),
    ]);
    for (const d of dirsToFix) {
      fixPublicAssetPermissions(d);
    }
  });

  // خدمة الملفات الثابتة مع إعدادات كاش ذكية
  app.use(
    "/.well-known",
    express.static(path.resolve(distPath, ".well-known"), {
      dotfiles: "allow",
    })
  );

  // Explicitly serve /images from all candidate image directories
  const imageDirs = [
    path.resolve(distPath, "images"),
    path.resolve(process.cwd(), "public", "images"),
    path.resolve(process.cwd(), "dist", "public", "images"),
    path.resolve(process.cwd(), "client", "public", "images"),
    path.resolve(process.cwd(), "images"),
  ];
  for (const imgDir of imageDirs) {
    if (fs.existsSync(imgDir)) {
      app.use(
        "/images",
        express.static(imgDir, {
          maxAge: "365d",
          immutable: true,
        })
      );
    }
  }

  // Mount static serving on all candidate public directories (dist/public & public)
  const allStaticCandidateDirs = [
    path.resolve(DIRNAME, "dist", "public"),
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(DIRNAME, "public"),
    path.resolve(process.cwd(), "public"),
  ].filter((d) => fs.existsSync(d));

  for (const sDir of Array.from(new Set(allStaticCandidateDirs))) {
    app.use(
      express.static(sDir, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith(".html")) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
          } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            // ملفات assets ذات البصمة (hash): تخزين طويل الأمد
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          }
        },
      })
    );
  }

  const indexPath = path.resolve(distPath, "index.html");
  let cachedIndexTemplate = "";
  try {
    if (fs.existsSync(indexPath)) {
      cachedIndexTemplate = fs.readFileSync(indexPath, "utf-8");
    }
  } catch (error) {
    console.error("[Static] Failed to read static index.html template:", error);
  }

  app.use("*", (req: any, res: any) => {
    const rawUrl = req.originalUrl || req.url || "/";

    // CRITICAL: Never serve index.html for missing static assets (.js, .css, images)
    // Doing so breaks browsers with SyntaxError: Unexpected token '<' and causes white screens
    if (/\.(js|mjs|cjs|css|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot|json|map|xml|txt)$/i.test(rawUrl)) {
      return res.status(404).type("text/plain").send("Asset not found");
    }

    const isPublicStatic = !rawUrl.startsWith("/api") && !rawUrl.startsWith("/admin");
    if (isPublicStatic) {
      // Allow Cloudflare Edge to cache HTML for fast crawler and user delivery (under 20ms)
      res.setHeader("Cache-Control", "public, max-age=120, s-maxage=3600, stale-while-revalidate=86400");
    } else {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }
    const template =
      cachedIndexTemplate ||
      (fs.existsSync(indexPath) ? fs.readFileSync(indexPath, "utf-8") : "<h1>Vanir Group</h1>");
    const assetVersion = "v" + Date.now().toString(36);
    let page = injectSeoMeta(template, rawUrl);
    page = page.replace(
      /(<script[^>]+src=["']\/assets\/[^"']+)(\.js)(["'])/g,
      `$1$2?v=${assetVersion}$3`
    );
    page = page.replace(
      /(<link[^>]+href=["']\/assets\/[^"']+)(\.css)(["'])/g,
      `$1$2?v=${assetVersion}$3`
    );
    res.status(200).set({ "Content-Type": "text/html" }).end(page);
  });
}
