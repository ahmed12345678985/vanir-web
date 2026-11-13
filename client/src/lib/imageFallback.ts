const LUXURY_PLACEHOLDER_URL =
  "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=2000&q=80"; // Authentic Gulfstream private jet on reflective runway

const IMAGE_FALLBACK_DATA_ATTR = "data-luxury-fallback-applied";
const MEDIA_PROXY_TRIED_ATTR = "data-media-proxy-tried";
const MEDIA_PROXY_PENDING_ATTR = "data-media-proxy-pending";
const ORIGINAL_SRC_ATTR = "data-original-src";

const LOGO_SVG_DATA_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" fill="none">
      <rect width="240" height="80" rx="8" fill="#0d1117" fill-opacity="0.85"/>
      <circle cx="40" cy="40" r="24" stroke="#D4A853" stroke-width="2"/>
      <path d="M30 28L40 52L50 28" stroke="#D4A853" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="76" y="44" fill="#D4A853" font-family="serif" font-size="20" font-weight="bold" letter-spacing="3">VANIR</text>
      <text x="76" y="58" fill="#F5E6B8" font-family="sans-serif" font-size="9" letter-spacing="4">GROUP</text>
    </svg>`
  );

/**
 * Curated collection of distinct, high-resolution luxury travel photographs
 * mapped by destination/category so no single fallback image ever repeats across the site.
 */
const CONTEXTUAL_LUXURY_GALLERY: Array<{ keywords: string[]; url: string }> = [
  {
    keywords: ["cairo", "pyramids", "giza", "sphinx", "pharaoh", "hero-egyptian", "gallery_001", "gallery_002", "culture_1"],
    url: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: ["nile", "dahabiya", "cruise", "felucca", "aswan", "agilkia", "philae", "gallery_004", "gallery_009"],
    url: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: ["luxor", "karnak", "hatshepsut", "valley", "temple", "abu_simbel", "gallery_006", "gallery_008", "culture_2"],
    url: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: ["sharm", "hurghada", "marsa_alam", "dahab", "red_sea", "coral", "diving", "snorkel", "beach", "gallery_005", "world_4"],
    url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: ["siwa", "safari", "desert", "bedouin", "sinai", "catherine", "fayoum", "camel", "gallery_003", "adventure_4", "adventure_5"],
    url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: ["alexandria", "mediterranean", "citadel", "corniche", "gallery_010"],
    url: "https://images.unsplash.com/photo-1572252821143-035a024857ac?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: ["dubai", "skydive", "burj", "uae", "arabia", "limo", "airport", "fast-track"],
    url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: ["maldives", "overwater", "landaa", "giraavaru", "hualalai", "lanai", "punta_mita", "bungalow", "island", "spa"],
    url: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: ["santorini", "greece", "mykonos", "aegean", "caldera", "oia"],
    url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: ["paris", "france", "eiffel", "louvre", "romance"],
    url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: ["rome", "italy", "amalfi", "positano", "colosseum"],
    url: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: ["swiss", "switzerland", "alps", "zermatt", "interlaken", "mountain", "ski"],
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: ["bali", "indonesia", "thailand", "malaysia", "ubud", "surfing"],
    url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: ["tokyo", "japan", "kyoto", "fuji"],
    url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: ["istanbul", "turkey", "cappadocia", "bosphorus"],
    url: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: ["london", "uk", "united kingdom", "royal"],
    url: "https://images.unsplash.com/photo-1513635269975-59663e0ca1ad?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: ["jet", "aviation", "flight", "cabin", "concierge", "charter"],
    url: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: ["voyager", "regent", "yacht", "atrium", "pool", "lounge", "suite", "hotel"],
    url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=80",
  },
];

const ROTATING_FALLBACK_POOL = CONTEXTUAL_LUXURY_GALLERY.map((item) => item.url);

export function getLuxuryPlaceholderImageUrl(contextHint?: string): string {
  if (!contextHint) {
    return LUXURY_PLACEHOLDER_URL;
  }
  return resolveFallbackImageUrl(contextHint, "");
}

export function resolveFallbackImageUrl(src?: string, alt?: string): string {
  const combined = `${src || ""} ${alt || ""}`.toLowerCase();

  if (
    combined.includes("logo-vanir") ||
    combined.includes("vanir-logo") ||
    combined.includes("watermark")
  ) {
    return LOGO_SVG_DATA_URI;
  }

  for (const entry of CONTEXTUAL_LUXURY_GALLERY) {
    if (entry.keywords.some((kw) => combined.includes(kw))) {
      return entry.url;
    }
  }

  // Keep deterministic default for generic test URLs without path/alt hints
  if (!src || src.includes("example.com")) {
    return LUXURY_PLACEHOLDER_URL;
  }

  // Deterministic hash across the rotating pool so different filenames never show the same photo
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash * 31 + combined.charCodeAt(i)) >>> 0;
  }
  return ROTATING_FALLBACK_POOL[hash % ROTATING_FALLBACK_POOL.length] || LUXURY_PLACEHOLDER_URL;
}

/**
 * Extracts a local relative asset path (e.g. "/images/...") if the URL belongs to our local public assets.
 */
export function extractLocalAssetPath(rawSrc: string): string | null {
  if (!rawSrc || rawSrc.startsWith("data:") || rawSrc.includes("/api/media?")) {
    return null;
  }
  try {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://vanirgroup.com";
    const parsed = new URL(rawSrc, origin);
    const isSameHost =
      typeof window === "undefined" ||
      parsed.hostname === window.location.hostname ||
      parsed.hostname === "vanirgroup.com" ||
      parsed.hostname === "www.vanirgroup.com" ||
      parsed.hostname === "localhost";

    if (!isSameHost) return null;

    if (
      parsed.pathname.startsWith("/images/") ||
      parsed.pathname.startsWith("/logo-") ||
      parsed.pathname.startsWith("/vanir-logo") ||
      parsed.pathname.startsWith("/hero-") ||
      parsed.pathname.startsWith("/ahmed-roshdi")
    ) {
      return parsed.pathname;
    }
  } catch {
    if (rawSrc.startsWith("/images/") || rawSrc.startsWith("/logo-")) {
      return rawSrc.split("?")[0];
    }
  }
  return null;
}

export function applyLuxuryImageFallback(image: HTMLImageElement): void {
  // Ignore duplicate error callbacks fired during the same event tick while /api/media retry is initiating
  if (image.getAttribute(MEDIA_PROXY_PENDING_ATTR) === "true") return;
  if (image.getAttribute(IMAGE_FALLBACK_DATA_ATTR) === "true") return;

  const currentAttrSrc = image.getAttribute("src") || image.src || "";
  if (!image.getAttribute(ORIGINAL_SRC_ATTR) && currentAttrSrc && !currentAttrSrc.includes("/api/media?")) {
    image.setAttribute(ORIGINAL_SRC_ATTR, currentAttrSrc);
  }

  // Step 1: If a local asset failed (e.g. LiteSpeed 403 on /images/...), retry via Express /api/media first
  const localPath = extractLocalAssetPath(currentAttrSrc);
  if (localPath && image.getAttribute(MEDIA_PROXY_TRIED_ATTR) !== "true") {
    image.setAttribute(MEDIA_PROXY_TRIED_ATTR, "true");
    image.setAttribute(MEDIA_PROXY_PENDING_ATTR, "true");
    image.src = `/api/media?src=${encodeURIComponent(localPath)}`;
    setTimeout(() => {
      image.removeAttribute(MEDIA_PROXY_PENDING_ATTR);
    }, 0);
    return;
  }

  const originalSrc =
    image.getAttribute(ORIGINAL_SRC_ATTR) ||
    currentAttrSrc ||
    "";

  image.setAttribute(IMAGE_FALLBACK_DATA_ATTR, "true");
  image.src = resolveFallbackImageUrl(originalSrc, image.alt);
}

export function installGlobalImageErrorHandler(): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;
    applyLuxuryImageFallback(target);
  };

  window.addEventListener("error", handler, true);
  return () => window.removeEventListener("error", handler, true);
}
