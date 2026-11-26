import { PRIORITY_SEO_BLOG_POSTS } from "../shared/seo/priorityBlogPosts";

interface Env {}

const SITE_URL = "https://vanirgroup.com";
const FIREBASE_PROJECT_ID = "gen-lang-client-0364375301";
const FALLBACK_OG_IMAGE = `${SITE_URL}/images/blog-luxury/usa-great-pyramid-after-hours.jpg`;

function escapeAttr(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function toAbsoluteImg(url?: string): string {
  const clean = String(url || "").trim();
  if (!clean || clean.startsWith("data:") || clean.includes("hero-egyptian.jpg")) {
    return FALLBACK_OG_IMAGE;
  }
  if (/^https?:\/\//i.test(clean)) return clean;
  if (clean.startsWith("/")) return `${SITE_URL}${clean}`;
  return `${SITE_URL}/${clean}`;
}

async function lookupBlogPostMeta(slug: string): Promise<{
  title: string;
  description: string;
  image: string;
} | null> {
  // 1. Fast path: Priority editorial blog posts
  const priority = PRIORITY_SEO_BLOG_POSTS.find(
    (p) => p.slug === slug || p.slug === decodeURIComponent(slug)
  );
  if (priority) {
    return {
      title: priority.metaTitle || priority.title,
      description: priority.metaDescription || priority.excerpt || priority.title,
      image: toAbsoluteImg(priority.coverImageUrl),
    };
  }

  // 2. Live Firestore lookup for dynamic blog posts
  try {
    const queryUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`;
    const res = await fetch(queryUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "blog_posts" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "slug" },
              op: "EQUAL",
              value: { stringValue: slug },
            },
          },
          limit: 1,
        },
      }),
    });
    if (!res.ok) return null;
    const rows: any[] = await res.json();
    const fields = rows?.[0]?.document?.fields;
    if (!fields) return null;
    const getStr = (k: string) => String(fields?.[k]?.stringValue || "").trim();
    const title = getStr("metaTitle") || getStr("title");
    if (!title) return null;
    let desc = getStr("metaDescription") || getStr("excerpt") || title;
    if (desc.startsWith("{") || desc.includes('"excerpt"')) {
      const m = desc.match(/"excerpt"\s*:\s*"((?:[^"\\]|\\.)*)"/i);
      desc = m?.[1] ? m[1].replace(/\\n/g, " ").replace(/\\"/g, '"') : title;
    }
    const img = getStr("coverImageUrl") || getStr("coverImage") || getStr("imageUrl");
    return {
      title,
      description: desc.slice(0, 260),
      image: toAbsoluteImg(img),
    };
  } catch {
    return null;
  }
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);

  // 301 Redirect www.vanirgroup.com -> vanirgroup.com
  if (url.hostname === "www.vanirgroup.com") {
    url.hostname = "vanirgroup.com";
    return Response.redirect(url.toString(), 301);
  }

  const response = await context.next();

  // Dynamic per-article Open Graph & Twitter Card injection for /blog/:slug
  // Ensures SocialBee, Facebook, LinkedIn, WhatsApp & X always pick the exact article cover photo!
  if (
    url.pathname.startsWith("/blog/") &&
    url.pathname.length > 6 &&
    (response.headers.get("content-type") || "").includes("text/html")
  ) {
    const rawSlug = url.pathname.slice("/blog/".length).replace(/\/+$/, "");
    let decodedSlug = rawSlug;
    try {
      decodedSlug = decodeURIComponent(rawSlug);
    } catch {}

    const meta = await lookupBlogPostMeta(decodedSlug);
    if (meta) {
      let html = await response.text();
      const safeTitle = escapeAttr(meta.title);
      const safeDesc = escapeAttr(meta.description);
      const safeImg = escapeAttr(meta.image);
      const canonicalUrl = escapeAttr(`${SITE_URL}/blog/${encodeURIComponent(decodedSlug)}`);

      html = html
        .replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title data-rh="true">${safeTitle}</title>`)
        .replace(
          /<meta[^>]*property=["']og:title["'][^>]*>/i,
          `<meta data-rh="true" property="og:title" content="${safeTitle}" />`
        )
        .replace(
          /<meta[^>]*name=["']twitter:title["'][^>]*>/i,
          `<meta data-rh="true" name="twitter:title" content="${safeTitle}" />`
        )
        .replace(
          /<meta[^>]*name=["']description["'][^>]*>/i,
          `<meta data-rh="true" name="description" content="${safeDesc}" />`
        )
        .replace(
          /<meta[^>]*property=["']og:description["'][^>]*>/i,
          `<meta data-rh="true" property="og:description" content="${safeDesc}" />`
        )
        .replace(
          /<meta[^>]*name=["']twitter:description["'][^>]*>/i,
          `<meta data-rh="true" name="twitter:description" content="${safeDesc}" />`
        )
        .replace(
          /<meta[^>]*property=["']og:image["'][^>]*>/i,
          `<meta data-rh="true" property="og:image" content="${safeImg}" />\n    <meta data-rh="true" name="twitter:image" content="${safeImg}" />`
        )
        .replace(
          /<meta[^>]*property=["']og:url["'][^>]*>/i,
          `<meta data-rh="true" property="og:url" content="${canonicalUrl}" />`
        )
        .replace(
          /<link[^>]*rel=["']canonical["'][^>]*>/i,
          `<link data-rh="true" rel="canonical" href="${canonicalUrl}" />`
        );

      const headers = new Headers(response.headers);
      headers.delete("content-length");
      headers.set("cache-control", "public, max-age=120");
      return new Response(html, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }
  }

  return response;
};
