/**
 * Dynamic Google Analytics 4 (GA4) Runtime Loader, SPA Route Tracker & Live Telemetry Mirror
 * - Reads the Admin-configured Measurement ID from Firestore (`siteSettings`)
 * - Injects & activates official Google gtag.js live across all routes
 * - Mirrors every real GA4 page_view to Firestore (`ga_pageviews`) so the Admin
 *   Dashboard displays real-time GA4 metric cards immediately without OAuth friction.
 */
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db, getFirestoreSetting } from "./siteSettingsApi";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    __VANIR_GA_IDS__?: Set<string>;
    __VANIR_ACTIVE_GA_ID__?: string;
  }
}

export const GA_STORAGE_KEY = "vanir_ga_measurement_id";
const VISITOR_ID_KEY = "vanir_ga_visitor_id";
const SESSION_ID_KEY = "vanir_ga_session_id";

let lastTrackedPath = "";
let lastTrackedAt = 0;

export function isValidGaId(id: string): boolean {
  return /^(G-[A-Z0-9]{6,16}|GT-[A-Z0-9]{6,16}|AW-[0-9]{6,16}|UA-\d+-\d+)$/i.test(id.trim());
}

function getOrCreateVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return `v_${Math.random().toString(36).slice(2, 10)}`;
  }
}

function getOrCreateSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return `s_${Math.random().toString(36).slice(2, 10)}`;
  }
}

function detectDevice(): "Mobile" | "Tablet" | "Desktop" {
  if (typeof navigator === "undefined") return "Desktop";
  const ua = navigator.userAgent || "";
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return "Tablet";
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return "Mobile";
  return "Desktop";
}

function detectTrafficSource(): "Google" | "Social" | "Direct" | "Referral" {
  if (typeof document === "undefined") return "Direct";
  const ref = (document.referrer || "").toLowerCase();
  if (!ref || ref.includes(window.location.hostname.toLowerCase())) return "Direct";
  if (ref.includes("google.") || ref.includes("bing.") || ref.includes("yahoo.") || ref.includes("duckduckgo.")) {
    return "Google";
  }
  if (
    ref.includes("facebook.") ||
    ref.includes("instagram.") ||
    ref.includes("t.co") ||
    ref.includes("twitter.") ||
    ref.includes("x.com") ||
    ref.includes("tiktok.") ||
    ref.includes("linkedin.") ||
    ref.includes("youtube.")
  ) {
    return "Social";
  }
  return "Referral";
}

/**
 * Dynamically injects gtag.js for the given Measurement ID and configures it.
 */
export function injectGoogleAnalytics(rawId: string): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  const id = rawId.trim().toUpperCase();
  if (!isValidGaId(id)) return false;

  try {
    localStorage.setItem(GA_STORAGE_KEY, id);
  } catch {}

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
  }

  window.__VANIR_GA_IDS__ = window.__VANIR_GA_IDS__ || new Set<string>();
  window.__VANIR_ACTIVE_GA_ID__ = id;

  const scriptId = `ga4-gtag-script-${id}`;
  if (!document.getElementById(scriptId)) {
    const s = document.createElement("script");
    s.id = scriptId;
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(s);
  }

  if (!window.__VANIR_GA_IDS__.has(id)) {
    window.__VANIR_GA_IDS__.add(id);
    window.gtag("config", id, {
      page_path: window.location.pathname + window.location.search,
      page_title: document.title,
      send_page_view: true,
    });
  }

  return true;
}

/**
 * Fires an explicit SPA page_view event to the active GA4 Measurement ID
 * and mirrors the real visit into Firestore (`ga_pageviews`) for Admin GA4 Cards.
 */
export function trackPageView(path: string): void {
  if (typeof window === "undefined") return;
  const cleanPath = (path.split("?")[0] || "/").slice(0, 140);
  const now = Date.now();

  // Deduplicate rapid React StrictMode double-renders
  if (cleanPath === lastTrackedPath && now - lastTrackedAt < 4000) return;
  lastTrackedPath = cleanPath;
  lastTrackedAt = now;

  const activeId = window.__VANIR_ACTIVE_GA_ID__ || "";
  if (typeof window.gtag === "function" && activeId) {
    window.gtag("config", activeId, {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }

  // Non-blocking first-party telemetry mirror for Admin GA4 Cards
  addDoc(collection(db, "ga_pageviews"), {
    path: cleanPath,
    gaMeasurementId: activeId || null,
    visitorId: getOrCreateVisitorId(),
    sessionId: getOrCreateSessionId(),
    device: detectDevice(),
    source: detectTrafficSource(),
    createdAt: now,
  }).catch(() => {});
}

/**
 * Resolves the Admin-saved GA4 Measurement ID from all synced Firestore keys.
 */
export async function fetchSavedGaMeasurementId(): Promise<string> {
  const candidates: Array<[string, string]> = [
    ["analytics", "google_analytics_id"],
    ["seo", "googleAnalyticsId"],
    ["connectors", "ga_measurement_id"],
    ["general", "google_analytics_id"],
  ];

  for (const [category, key] of candidates) {
    const val = await getFirestoreSetting(category, key).catch(() => null);
    if (val && isValidGaId(val)) {
      return val.trim().toUpperCase();
    }
  }

  try {
    const cached = localStorage.getItem(GA_STORAGE_KEY);
    if (cached && isValidGaId(cached)) return cached.trim().toUpperCase();
  } catch {}

  return "";
}

/**
 * Bootstraps GA4 immediately on page load: uses localStorage first for instant
 * tracking, then syncs with Firestore so any Admin update takes effect globally.
 */
export async function initDynamicGoogleAnalytics(): Promise<string> {
  if (typeof window === "undefined") return "";

  try {
    const cached = localStorage.getItem(GA_STORAGE_KEY);
    if (cached && isValidGaId(cached)) {
      injectGoogleAnalytics(cached);
    }
  } catch {}

  const savedId = await fetchSavedGaMeasurementId();
  if (savedId) {
    injectGoogleAnalytics(savedId);
    return savedId;
  }

  return window.__VANIR_ACTIVE_GA_ID__ || "";
}

export interface GaLiveMetrics {
  activeUsers30m: number;
  totalPageViews: number;
  uniqueVisitors: number;
  totalSessions: number;
  avgPagesPerSession: number;
  deviceBreakdown: Array<{ label: string; count: number; pct: number }>;
  sourceBreakdown: Array<{ label: string; count: number; pct: number }>;
  topPages: Array<{ path: string; views: number; pct: number }>;
  dailyTraffic: Array<{ key: string; name: string; views: number; visitors: number }>;
}

/**
 * Queries real GA4-mirrored telemetry from Firestore for the Admin Analytics Cards.
 */
export async function fetchGaLiveMetrics(days: number): Promise<GaLiveMetrics> {
  const now = Date.now();
  const since = now - days * 24 * 60 * 60 * 1000;
  const activeCutoff = now - 30 * 60 * 1000;

  let events: any[] = [];
  try {
    const q = query(collection(db, "ga_pageviews"), where("createdAt", ">=", since));
    const snap = await getDocs(q);
    events = snap.docs.map((d) => d.data());
  } catch {
    try {
      const snap = await getDocs(collection(db, "ga_pageviews"));
      events = snap.docs
        .map((d) => d.data())
        .filter((e: any) => Number(e.createdAt || 0) >= since);
    } catch {
      events = [];
    }
  }

  const activeVisitorSet = new Set<string>();
  const uniqueVisitorSet = new Set<string>();
  const sessionSet = new Set<string>();
  const deviceCounts: Record<string, number> = { Mobile: 0, Desktop: 0, Tablet: 0 };
  const sourceCounts: Record<string, number> = { Google: 0, Direct: 0, Social: 0, Referral: 0 };
  const pageCounts: Record<string, number> = {};

  const bucketCount = Math.min(days, 30);
  const dailyMap = new Map<string, { key: string; name: string; views: number; visitors: Set<string> }>();
  for (let i = 0; i < bucketCount; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (bucketCount - 1 - i));
    const key = d.toISOString().slice(0, 10);
    const name = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    dailyMap.set(key, { key, name, views: 0, visitors: new Set<string>() });
  }

  for (const ev of events) {
    const ts = Number(ev.createdAt || 0);
    const vid = String(ev.visitorId || "anon");
    const sid = String(ev.sessionId || vid);
    const p = String(ev.path || "/");
    const dev = String(ev.device || "Desktop");
    const src = String(ev.source || "Direct");

    uniqueVisitorSet.add(vid);
    sessionSet.add(sid);
    if (ts >= activeCutoff) activeVisitorSet.add(vid);

    deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    pageCounts[p] = (pageCounts[p] || 0) + 1;

    const dayKey = ts ? new Date(ts).toISOString().slice(0, 10) : "";
    const bucket = dailyMap.get(dayKey);
    if (bucket) {
      bucket.views += 1;
      bucket.visitors.add(vid);
    }
  }

  const totalViews = events.length;
  const totalSessions = sessionSet.size;
  const toBreakdown = (rec: Record<string, number>) =>
    Object.entries(rec)
      .map(([label, count]) => ({
        label,
        count,
        pct: totalViews > 0 ? Math.round((count / totalViews) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

  const topPages = Object.entries(pageCounts)
    .map(([path, views]) => ({
      path,
      views,
      pct: totalViews > 0 ? Math.round((views / totalViews) * 100) : 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  return {
    activeUsers30m: activeVisitorSet.size,
    totalPageViews: totalViews,
    uniqueVisitors: uniqueVisitorSet.size,
    totalSessions,
    avgPagesPerSession: totalSessions > 0 ? Number((totalViews / totalSessions).toFixed(1)) : 0,
    deviceBreakdown: toBreakdown(deviceCounts),
    sourceBreakdown: toBreakdown(sourceCounts),
    topPages,
    dailyTraffic: Array.from(dailyMap.values()).map((b) => ({
      key: b.key,
      name: b.name,
      views: b.views,
      visitors: b.visitors.size,
    })),
  };
}
