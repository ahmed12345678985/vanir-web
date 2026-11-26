/**
 * Dynamic RSS 2.0 Feed Generator for Vanir Group Luxury Travel Blog
 * Pulls live published articles from Firestore (`blog_posts`) and merges them
 * with curated priority SEO editorial posts, sorted newest first.
 */
import { PRIORITY_SEO_BLOG_POSTS } from "../shared/seo/priorityBlogPosts";

const SITE_URL = "https://vanirgroup.com";
const FIREBASE_PROJECT_ID = "gen-lang-client-0364375301";

interface RssPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  authorName: string;
  coverImageUrl: string;
  publishedAt: number;
}

function escapeXml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function safeCdata(str: string): string {
  return String(str || "").replace(/\]\]>/g, "]]]]><![CDATA[>");
}

function toAbsoluteUrl(url?: string): string {
  const clean = String(url || "").trim();
  if (!clean || clean.startsWith("data:") || clean.includes("hero-egyptian.jpg")) {
    return `${SITE_URL}/images/blog-luxury/usa-great-pyramid-after-hours.jpg`;
  }
  if (/^https?:\/\//i.test(clean)) return clean;
  if (clean.startsWith("/")) return `${SITE_URL}${clean}`;
  return `${SITE_URL}/${clean}`;
}

function cleanExcerptText(raw: string, fallbackTitle: string): string {
  let txt = String(raw || "").trim();
  // Unwrap accidental JSON objects like {"excerpt":"...","imageQuery":"..."}
  if (txt.startsWith("{") || txt.includes('"excerpt"')) {
    try {
      const parsed = JSON.parse(txt);
      txt = String(parsed?.excerpt || parsed?.metaDescription || parsed?.description || parsed?.content || "").trim();
    } catch {
      const m = txt.match(/"(?:excerpt|metaDescription|description)"\s*:\s*"((?:[^"\\]|\\.)*)"/i);
      if (m?.[1]) {
        txt = m[1].replace(/\\n/g, " ").replace(/\\"/g, '"').trim();
      } else {
        txt = "";
      }
    }
  }
  txt = txt
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_`>\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!txt || txt.startsWith("{") || txt.length < 12) {
    return fallbackTitle;
  }
  return txt.slice(0, 280);
}

function isCleanEditorialTitle(title: string): boolean {
  const t = title.trim();
  if (t.length < 6) return false;
  // Exclude raw keyword/SEO draft dumps
  if (/^(الكلمات المفتاحية|keywords|seo\s*:|test\s*:|draft\s*:)/i.test(t)) return false;
  // Exclude raw unformatted hyphenated slugs (no spaces, multiple hyphens, e.g. "private-aviation-luxury-transfers")
  if (!t.includes(" ") && /^[a-z0-9-]+$/i.test(t) && t.includes("-")) return false;
  return true;
}

function extractFsValue(field: any): any {
  if (!field || typeof field !== "object") return undefined;
  if ("stringValue" in field) return field.stringValue;
  if ("integerValue" in field) return Number(field.integerValue);
  if ("doubleValue" in field) return Number(field.doubleValue);
  if ("booleanValue" in field) return Boolean(field.booleanValue);
  if ("timestampValue" in field) return Date.parse(field.timestampValue);
  return undefined;
}

function parseTimestamp(val: any): number {
  if (typeof val === "number" && Number.isFinite(val)) {
    return val > 1e12 ? val : val * 1000;
  }
  if (typeof val === "string" && val.trim()) {
    const num = Number(val);
    if (Number.isFinite(num) && num > 1e9) return num > 1e12 ? num : num * 1000;
    const parsed = Date.parse(val);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return Date.now();
}

async function fetchFirestorePublishedPosts(): Promise<RssPost[]> {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/blog_posts?pageSize=100`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data: any = await res.json();
    const docs: any[] = Array.isArray(data?.documents) ? data.documents : [];
    const posts: RssPost[] = [];

    for (const d of docs) {
      const f = d?.fields || {};
      const status = String(extractFsValue(f.status) || "published").toLowerCase();
      if (status !== "published") continue;

      const slug = String(extractFsValue(f.slug) || "").trim();
      const title = String(extractFsValue(f.title) || "").trim();
      if (!slug || !title || !isCleanEditorialTitle(title)) continue;

      const rawExcerpt =
        extractFsValue(f.excerpt) ||
        extractFsValue(f.metaDescription) ||
        extractFsValue(f.content) ||
        "";
      const excerpt = cleanExcerptText(String(rawExcerpt), title);

      const coverImageUrl =
        extractFsValue(f.coverImageUrl) ||
        extractFsValue(f.coverImage) ||
        extractFsValue(f.imageUrl) ||
        "";

      const pubTs = parseTimestamp(
        extractFsValue(f.publishedAt) ||
          extractFsValue(f.updatedAt) ||
          extractFsValue(f.createdAt) ||
          d?.updateTime ||
          d?.createTime
      );

      posts.push({
        slug,
        title,
        excerpt,
        category: String(extractFsValue(f.category) || "Luxury Travel"),
        authorName: String(extractFsValue(f.authorName) || "Vanir Group Editorial"),
        coverImageUrl: toAbsoluteUrl(coverImageUrl),
        publishedAt: pubTs,
      });
    }

    return posts;
  } catch {
    return [];
  }
}

export async function buildRssResponse(): Promise<Response> {
  const firestorePosts = await fetchFirestorePublishedPosts();

  const mergedBySlug = new Map<string, RssPost>();

  // Priority SEO editorial posts as baseline
  for (const p of PRIORITY_SEO_BLOG_POSTS) {
    if (p.status !== "published" || !p.slug) continue;
    mergedBySlug.set(p.slug, {
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt || p.metaDescription || p.title,
      category: p.category || "Luxury Travel",
      authorName: p.authorName || "Ahmed Roshdi, Founder & CEO",
      coverImageUrl: toAbsoluteUrl(p.coverImageUrl),
      publishedAt: parseTimestamp(p.publishedAt || p.updatedAt || p.createdAt),
    });
  }

  // Live Firestore published posts take precedence (newest updates override baseline)
  for (const p of firestorePosts) {
    mergedBySlug.set(p.slug, p);
  }

  const sortedPosts = Array.from(mergedBySlug.values())
    .sort((a, b) => b.publishedAt - a.publishedAt)
    .slice(0, 120);

  const lastBuildDate = new Date(
    sortedPosts[0]?.publishedAt || Date.now()
  ).toUTCString();

  const itemsXml = sortedPosts
    .map((post) => {
      const postUrl = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`;
      const pubDate = new Date(post.publishedAt).toUTCString();
      const imgUrl = escapeXml(post.coverImageUrl);
      const imgType = /\.png(\?|$)/i.test(post.coverImageUrl)
        ? "image/png"
        : /\.webp(\?|$)/i.test(post.coverImageUrl)
          ? "image/webp"
          : "image/jpeg";

      return `    <item>
      <title><![CDATA[${safeCdata(post.title)}]]></title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[${safeCdata(post.category)}]]></category>
      <dc:creator><![CDATA[${safeCdata(post.authorName)}]]></dc:creator>
      <description><![CDATA[${safeCdata(post.excerpt)}]]></description>
      <enclosure url="${imgUrl}" type="${imgType}" length="0" />
      <media:content url="${imgUrl}" medium="image" type="${imgType}" />
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Vanir Group Luxury Travel - Blog &amp; Editorial RSS Feed</title>
    <link>${SITE_URL}/blog</link>
    <description>Latest luxury Egypt tours, Nile cruise luxury guides, pyramids of Egypt tours, private aviation insights, and bespoke travel concierge stories from Vanir Group.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <ttl>30</ttl>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/vanir-favicon-circle.png</url>
      <title>Vanir Group Luxury Travel</title>
      <link>${SITE_URL}</link>
    </image>
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
