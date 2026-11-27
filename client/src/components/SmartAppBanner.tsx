import { useEffect, useState } from "react";
import { X, Star, Download } from "lucide-react";
import { useLocation } from "wouter";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.vanir.mobile";
const DISMISS_KEY = "vanir_app_banner_dismissed_v1";

export default function SmartAppBanner() {
  const [location] = useLocation();
  const [visible, setVisible] = useState(false);

  // Never show inside /admin
  const isAdmin = location.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {}
    const timer = setTimeout(() => setVisible(true), 2200);
    return () => clearTimeout(timer);
  }, [isAdmin]);

  if (isAdmin || !visible) return null;

  const isArabic =
    typeof document !== "undefined" &&
    (document.documentElement.lang?.startsWith("ar") || document.documentElement.dir === "rtl");

  const handleDismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  return (
    <div
      role="region"
      aria-label="Download VANIR Mobile App"
      className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-[400px] z-[60] animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="relative flex items-center gap-3 rounded-2xl border border-[#D4AF37]/45 bg-[#090D16]/95 p-3 shadow-[0_14px_40px_rgba(0,0,0,0.65)] backdrop-blur-xl">
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close app banner"
          className="absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#0B1220] text-[#D4AF37] shadow hover:bg-[#162033]"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <img
          src="/images/vanir-app-icon.png"
          alt="VANIR App"
          className="h-12 w-12 shrink-0 rounded-xl border border-[#D4AF37]/40 object-cover shadow-md"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold tracking-wider text-white">VANIR</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[#D4AF37]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#F5D67D]">
              <Star className="h-2.5 w-2.5 fill-[#D4AF37] text-[#D4AF37]" /> 5.0
            </span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-slate-300">
            {isArabic
              ? "طيران مباشر، فنادق وفيلات دبي بصور Google، وفحص مجاني لشروط التأشيرات."
              : "Live Flights, Luxury Hotels & Villas with Google Photos + Free Visa Checker."}
          </p>
        </div>

        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#F5D67D] via-[#D4AF37] to-[#B88A1E] px-3 py-2 text-xs font-extrabold text-[#090D16] shadow-md transition hover:brightness-110"
        >
          <Download className="h-3.5 w-3.5" />
          <span>{isArabic ? "حمّل الآن" : "Get App"}</span>
        </a>
      </div>
    </div>
  );
}
