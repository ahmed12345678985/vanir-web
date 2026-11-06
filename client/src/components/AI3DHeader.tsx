import { motion } from "framer-motion";
import { Sparkles, Brain, Wand2, Megaphone, Cpu, Crown, Search, ArrowRight, Zap } from "lucide-react";
import { useState } from "react";

export type AIHeaderVariant = "intelligence" | "image" | "marketing" | "dashboard" | "pricing";

interface AI3DHeaderProps {
  variant: AIHeaderVariant;
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearchSubmit?: (query: string) => void;
  ctaText?: string;
  ctaHref?: string;
}

const VARIANT_CONFIGS = {
  intelligence: {
    badge: "QUANTUM NEURAL ENGINE 3.0",
    defaultTitle: "VANIR NEURAL CORE",
    defaultSubtitle: "Multimodal luxury itinerary synthesis in < 0.8 seconds.",
    icon: Brain,
    accentGlow: "from-[#00dfd8]/20 via-[#7928ca]/20 to-[#ff007a]/20",
    hologramColor: "#00dfd8",
    searchPlaceholder: "Prompt the engine (e.g., 'Private jet from Munich to Cairo with 5-day Nile Dahabiya')...",
  },
  image: {
    badge: "4K OCTANE VISUAL LAB",
    defaultTitle: "3D VISUAL SYNTHESIS",
    defaultSubtitle: "Transform words into cinematic, ultra-luxury travel photography.",
    icon: Wand2,
    accentGlow: "from-[#ff007a]/25 via-[#E5C378]/20 to-[#7928ca]/20",
    hologramColor: "#E5C378",
    searchPlaceholder: "Describe your scene (e.g., 'Gulfstream G650ER interior landing at St. Moritz at sunset')...",
  },
  marketing: {
    badge: "AUTONOMOUS DIPLOMATIC CAMPAIGNS",
    defaultTitle: "SOVEREIGN MARKETING MATRIX",
    defaultSubtitle: "Automated campaigns, editorial newsletters, and VIP dossiers.",
    icon: Megaphone,
    accentGlow: "from-[#7928ca]/25 via-[#0070f3]/20 to-[#43e97b]/20",
    hologramColor: "#0070f3",
    searchPlaceholder: "Campaign topic (e.g., 'Exclusive Red Sea Superyacht retreat invitation for UHNW clients')...",
  },
  dashboard: {
    badge: "REAL-TIME TELEMETRY MONITOR",
    defaultTitle: "QUANTUM TELEMETRY HUD",
    defaultSubtitle: "Live neural latency, cluster health, and token allocation.",
    icon: Cpu,
    accentGlow: "from-[#43e97b]/20 via-[#00dfd8]/20 to-[#7928ca]/20",
    hologramColor: "#43e97b",
    searchPlaceholder: "Search logs, endpoints, or active model sessions...",
  },
  pricing: {
    badge: "SOVEREIGN COMPUTE ALLOCATION",
    defaultTitle: "SOVEREIGN CREDIT VAULT",
    defaultSubtitle: "Transparent compute credits for bespoke AI generation & aviation tracking.",
    icon: Crown,
    accentGlow: "from-[#F3D794]/25 via-[#E5C378]/25 to-[#ff007a]/15",
    hologramColor: "#E5C378",
    searchPlaceholder: "Calculate custom compute tier or private enterprise cluster...",
  },
};

export default function AI3DHeader({
  variant,
  title,
  subtitle,
  searchPlaceholder,
  onSearchSubmit,
  ctaText,
  ctaHref,
}: AI3DHeaderProps) {
  const config = VARIANT_CONFIGS[variant];
  const [query, setQuery] = useState("");
  const Icon = config.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) onSearchSubmit(query);
  };

  return (
    <div className="relative pt-24 pb-12 sm:pt-28 sm:pb-16 overflow-hidden">
      {/* ─── 3D Ambient Holographic Backdrop ─── */}
      <div className={`pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[360px] bg-gradient-to-r ${config.accentGlow} blur-[120px] rounded-full opacity-60`} />

      <div className="container max-w-5xl mx-auto px-4 relative z-10 text-center">
        {/* ─── 3D Floating Central Core Animation with New Rainbow Vanir Logo ─── */}
        <div className="relative inline-flex items-center justify-center mb-5">
          {/* Outer Rotating Orbital Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-dashed border-white/20 absolute -inset-3 sm:-inset-4 pointer-events-none"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_#10b981]" />
          </motion.div>

          {/* Inner Counter-Rotating Prismatic Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border border-dotted border-[#E5C378]/40 absolute -inset-5 sm:-inset-6 pointer-events-none"
          />

          {/* 3D Animated Floating Logo Badge */}
          <motion.div
            animate={{
              y: [0, -6, 0],
              rotateZ: [-0.5, 0.5, -0.5],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{ scale: 1.08, rotateY: 15, rotateX: -5 }}
            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-[2px] rainbow-glow-border shadow-[0_0_35px_rgba(0,223,216,0.35),0_0_20px_rgba(229,195,120,0.3)] cursor-pointer backdrop-blur-xl group"
            style={{ perspective: 1000 }}
          >
            <div className="w-full h-full rounded-[14px] overflow-hidden bg-[#070a12] flex items-center justify-center">
              <img
                src="/logo-vanir-app.jpg"
                alt="VANIR Sovereign AI"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#090d16] shadow-[0_0_8px_#10b981]" />
          </motion.div>
        </div>

        {/* ─── Punchy Concise Badge ─── */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/5 border border-[#E5C378]/30 text-[#E5C378] text-[9.5px] sm:text-[10px] font-mono uppercase tracking-[0.2em] shadow-sm">
            <Sparkles size={11} className="animate-pulse text-[#E5C378]" /> {config.badge}
          </span>
        </div>

        {/* ─── Balanced 3D Headline (Optimized Size to Prevent Text Overflow) ─── */}
        <h1 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-extrabold text-white mb-2.5 tracking-tight leading-snug max-w-3xl mx-auto">
          {title || config.defaultTitle}
        </h1>

        <p className="text-white/70 text-xs sm:text-sm md:text-base max-w-lg mx-auto mb-6 font-light leading-relaxed">
          {subtitle || config.defaultSubtitle}
        </p>

        {/* ─── Animated Rainbow Spectrum Search / Prompt Line ─── */}
        <div className="rainbow-glow-border max-w-xl mx-auto p-[2px] rounded-xl shadow-[0_0_30px_rgba(0,223,216,0.25)]">
          <form
            onSubmit={handleSubmit}
            className="relative bg-[#090d16] rounded-[10px] flex items-center overflow-hidden"
          >
            <Search size={18} className="ml-4 text-[#E5C378] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder || config.searchPlaceholder}
              className="w-full px-4 py-3.5 bg-transparent text-white placeholder:text-white/40 focus:outline-none text-xs sm:text-sm font-medium"
            />
            <button
              type="submit"
              className="px-5 py-2.5 mr-2 rounded-lg bg-gradient-to-r from-[#F3D794] via-[#E5C378] to-[#B8860B] text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <span>Execute</span>
              <ArrowRight size={13} />
            </button>
          </form>
        </div>

        {/* ─── Optional Quick Action Pill ─── */}
        {ctaText && ctaHref && (
          <div className="mt-5">
            <a
              href={ctaHref}
              className="inline-flex items-center gap-2 text-xs text-[#E5C378] hover:text-white transition-colors uppercase tracking-widest font-semibold"
            >
              <Zap size={13} /> {ctaText} →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
