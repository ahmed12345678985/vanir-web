import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Brain,
  Wand2,
  Megaphone,
  Share2,
  Mail,
  Compass,
  Cpu,
  Crown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AISidebarItem {
  title: string;
  titleAr: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const AI_NAV_ITEMS: AISidebarItem[] = [
  {
    title: "AI Travel Intelligence",
    titleAr: "ذكاء السفر الاصطناعي",
    href: "/ai",
    icon: Brain,
    badge: "Core",
  },
  {
    title: "3D Image Studio",
    titleAr: "استوديو الصور ثلاثي الأبعاد",
    href: "/ai-image-generator",
    icon: Wand2,
    badge: "4K",
  },
  {
    title: "Marketing AI Suite",
    titleAr: "منظومة التسويق الذكي",
    href: "/marketing",
    icon: Megaphone,
  },
  {
    title: "Social Media Campaigns",
    titleAr: "حملات التواصل الاجتماعي",
    href: "/marketing/social-media",
    icon: Share2,
  },
  {
    title: "VIP Email Architect",
    titleAr: "رسائل النخبة الدبلوماسية",
    href: "/marketing/email",
    icon: Mail,
  },
  {
    title: "Bespoke Dossier Writer",
    titleAr: "صياغة المذكرات والبرامج",
    href: "/marketing/trip-description",
    icon: Compass,
  },
  {
    title: "Neural Telemetry HUD",
    titleAr: "لوحة مؤشرات الذكاء",
    href: "/ai-dashboard",
    icon: Cpu,
  },
  {
    title: "Sovereign Credit Vault",
    titleAr: "الباقات ورصيد الحوسبة",
    href: "/pricing",
    icon: Crown,
    badge: "VIP",
  },
];

export default function AISidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ─── Mobile Floating Toggle Button ─── */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-6 left-6 z-50 lg:hidden flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-[#F3D794] via-[#E5C378] to-[#B8860B] text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(229,195,120,0.4)]"
      >
        {mobileOpen ? <X size={16} /> : <Menu size={16} />}
        <span>AI Suite Menu</span>
      </button>

      {/* ─── Mobile Drawer Overlay ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-72 h-full bg-[#0a0d15] border-r border-[#E5C378]/30 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src="/logo-vanir-app.jpg"
                        alt="VANIR AI 3D"
                        className="w-10 h-10 rounded-xl object-cover border border-[#E5C378]/50 shadow-[0_0_15px_rgba(229,195,120,0.35)]"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#090d16]" />
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#E5C378] block">
                        VANIR AI 3D
                      </span>
                      <span className="text-[10px] text-white/50">Neural Suite Rail</span>
                    </div>
                  </div>
                  <button onClick={() => setMobileOpen(false)} className="text-white/40 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {AI_NAV_ITEMS.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-3 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? "bg-[#E5C378]/15 border border-[#E5C378]/40 text-[#E5C378]"
                            : "text-white/70 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon size={16} className={isActive ? "text-[#E5C378]" : "text-white/40"} />
                          <span>{item.title}</span>
                        </div>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/10 text-[#E5C378]">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Status Badge */}
              <div className="p-3 bg-[#0e1320] border border-white/10 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-bold text-white">Quantum Engine Online</span>
                </div>
                <span className="text-[10px] text-white/50 block">Latency 0.38s • Frontier Models</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Desktop Left Vertical Rail ─── */}
      <aside
        className={`hidden lg:flex flex-col justify-between fixed top-24 bottom-6 left-6 z-30 transition-all duration-300 rounded-2xl bg-[#090d16]/95 backdrop-blur-xl border border-[#E5C378]/25 shadow-[0_10px_40px_rgba(0,0,0,0.6)] ${
          isCollapsed ? "w-20 p-3" : "w-64 p-4"
        }`}
      >
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            {!isCollapsed && (
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="relative shrink-0">
                  <img
                    src="/logo-vanir-app.jpg"
                    alt="VANIR AI 3D"
                    className="w-10 h-10 rounded-xl object-cover border border-[#E5C378]/50 shadow-[0_0_15px_rgba(229,195,120,0.35)]"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#090d16]" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.18em] font-bold text-[#E5C378] block truncate">
                    VANIR AI 3D
                  </span>
                  <span className="text-[10px] text-white/50 block truncate">Neural Workspace</span>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="relative mx-auto mb-2">
                <img
                  src="/logo-vanir-app.jpg"
                  alt="VANIR AI 3D"
                  className="w-9 h-9 rounded-xl object-cover border border-[#E5C378]/50 shadow-[0_0_15px_rgba(229,195,120,0.35)]"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#090d16]" />
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {AI_NAV_ITEMS.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center ${
                    isCollapsed ? "justify-center" : "justify-between"
                  } px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#E5C378]/20 to-[#E5C378]/5 border border-[#E5C378]/50 text-[#E5C378] shadow-[0_0_20px_rgba(229,195,120,0.15)]"
                      : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                  title={isCollapsed ? item.title : undefined}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      size={18}
                      className={`shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? "text-[#E5C378]" : "text-white/40"
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.title}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#E5C378]/20 border border-[#E5C378]/40 text-[#E5C378]">
                      {item.badge}
                    </span>
                  )}

                  {/* Active Indicator Pip */}
                  {isActive && isCollapsed && (
                    <span className="absolute right-1 w-1.5 h-1.5 rounded-full bg-[#E5C378]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Telemetry Card */}
        <div>
          {!isCollapsed ? (
            <div className="p-3 bg-[#0d121f] border border-white/10 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">Engine State</span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Online
                </span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mb-2">
                <div className="bg-gradient-to-r from-emerald-400 via-[#E5C378] to-[#00dfd8] h-full w-[94%]" />
              </div>
              <Link
                href="/pricing"
                className="w-full py-2 bg-gradient-to-r from-[#F3D794] via-[#E5C378] to-[#B8860B] text-black font-bold text-[10px] uppercase tracking-wider rounded-md flex items-center justify-center gap-1.5 hover:brightness-110 transition-all shadow-md"
              >
                <Zap size={12} /> Top Up Compute Credits
              </Link>
            </div>
          ) : (
            <div className="flex justify-center">
              <Link
                href="/pricing"
                className="w-10 h-10 rounded-xl bg-[#E5C378]/15 border border-[#E5C378]/40 flex items-center justify-center text-[#E5C378] hover:bg-[#E5C378] hover:text-black transition-all"
                title="Top up credits"
              >
                <Zap size={16} />
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
