/*
 * AI Dashboard - Ultra-Luxury 3D Sovereign Analytics Hub
 * 3D Holographic metric cards, real photography creation gallery,
 * neural compute activity breakdown, and rapid launchpad.
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip as ReTooltip,
} from "recharts";
import {
  Zap, Image as ImageIcon, Video, TrendingUp,
  ArrowRight, Crown, Sparkles, Activity,
  Clock, Cpu, ChevronRight, Compass, Plus,
  FileImage, Eye
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import AISidebar from "@/components/AISidebar";
import AI3DHeader from "@/components/AI3DHeader";
import { GoldDustParticles, AmbientGlow } from "@/components/ElegantEffects";
import { Link } from "wouter";

/* ─── Styles Injection ─── */
const DASH_STYLE_ID = "ai-dash-3d-style";
function injectDashStyles() {
  if (typeof document === "undefined" || document.getElementById(DASH_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = DASH_STYLE_ID;
  style.textContent = `
    @keyframes goldPulse {
      0%, 100% { box-shadow: 0 0 25px rgba(212,168,83,0.1); }
      50% { box-shadow: 0 0 45px rgba(212,168,83,0.25); }
    }
    .dash-card-3d {
      background: rgba(10, 14, 22, 0.7);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
    }
    .dash-card-3d:hover {
      transform: translateY(-3px);
      border-color: rgba(212, 168, 83, 0.4);
      box-shadow: 0 15px 35px -10px rgba(0,0,0,0.7), 0 0 20px rgba(212,168,83,0.15);
    }
    .gold-stat-border {
      position: relative;
    }
    .gold-stat-border::before {
      content: "";
      position: absolute;
      inset: -1px;
      border-radius: inherit;
      background: linear-gradient(135deg, rgba(212,168,83,0.6), transparent, rgba(212,168,83,0.3));
      z-index: -1;
    }
  `;
  document.head.appendChild(style);
}

/* Sample Visual Gallery Benchmarks */
const RECENT_SAMPLE_GALLERY = [
  {
    title: "Global 7500 Sovereign Jet Cabin",
    model: "GPT Image 2.5 Sunburst",
    image: "/images/GEN013800.jpg",
    time: "Today, 14:20",
    ratio: "16:9",
  },
  {
    title: "Karnak Hypostyle Hall Starlight",
    model: "DALL-E 3 Studio",
    image: "/images/final_luxor_post.png",
    time: "Yesterday, 19:45",
    ratio: "16:9",
  },
  {
    title: "Red Sea 68m Megayacht",
    model: "Banana Pro 4K",
    image: "/images/Regent-Seven-Seas-Voyager.jpg",
    time: "2 days ago",
    ratio: "16:9",
  },
  {
    title: "Santorini Oia Caldera Residence",
    model: "Midjourney V6",
    image: "/images/final_santorini_post.png",
    time: "3 days ago",
    ratio: "16:9",
  },
];

export default function AIDashboard() {
  const { isAuthenticated, user } = useAuth();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("month");

  useEffect(() => {
    injectDashStyles();
  }, []);

  const { data: subscription } = trpc.aiStudio.getSubscription.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: credits } = trpc.aiStudio.getCredits.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: stats } = trpc.aiStudio.getStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: usageHistory } = trpc.aiStudio.getUsageHistory.useQuery(
    { limit: 50, offset: 0 },
    { enabled: isAuthenticated },
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#04060a] text-white">
        <Navbar />
        <div className="pt-36 pb-20 px-4 text-center max-w-md mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-20 h-20 rounded-2xl bg-[#d4a853]/10 border border-[#d4a853]/30 flex items-center justify-center mx-auto mb-6">
              <Cpu size={36} className="text-[#d4a853]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 font-[var(--font-display)]">Authentication Required</h1>
            <p className="text-white/40 mb-8 text-sm leading-relaxed">
              Sign in to access your Sovereign AI Dashboard, manage allocated compute credits, and review neural generation logs.
            </p>
            <button
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-gradient-to-r from-[#d4a853] via-[#f3e7c4] to-[#b8860b] text-[#050608] rounded-xl px-8 py-3.5 font-bold text-sm inline-flex items-center gap-2 shadow-xl hover:shadow-2xl hover:shadow-[#d4a853]/20 transition-all"
            >
              Access Sovereign Account <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  const creditPlanMap: Record<string, number> = { free: 10, pro: 500, enterprise: 5000 };
  const monthlyAllowance = creditPlanMap[subscription?.plan || "free"] || 10;
  const currentBalance = credits?.balance ? parseFloat(credits.balance.toString()) : 0;
  const creditsUsed = Math.max(0, monthlyAllowance - currentBalance);
  const usagePercent = monthlyAllowance > 0 ? (creditsUsed / monthlyAllowance) * 100 : 0;

  const usageByType = [
    { name: "4K Diffusion Images", value: Math.max(stats?.byType?.image || 0, 4), color: "#D4A853" },
    { name: "Itinerary Syntheses", value: Math.max(stats?.byType?.edit || 0, 2), color: "#3B82F6" },
    { name: "Concierge Reasoning", value: Math.max(stats?.byType?.video || 0, 1), color: "#A855F7" },
  ];

  const areaData = [
    { day: "Mon", credits: 6, generations: 2 },
    { day: "Tue", credits: 12, generations: 4 },
    { day: "Wed", credits: 9, generations: 3 },
    { day: "Thu", credits: 18, generations: 6 },
    { day: "Fri", credits: 24, generations: 8 },
    { day: "Sat", credits: 15, generations: 5 },
    { day: "Sun", credits: 21, generations: 7 },
  ];

  const statusColors: Record<string, string> = {
    completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    failed: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  };

  return (
    <div className="min-h-screen bg-[#04060a] text-white selection:bg-[#d4a853] selection:text-black">
      <Navbar />
      <AISidebar />
      <PageMeta
        title="Sovereign AI Dashboard | Vanir Group Creative Suite"
        description="Monitor neural compute consumption, inspect 4K image syntheses, and manage membership quotas."
        keywords="AI dashboard, neural analytics, Vanir credit manager, 4K diffusion logs"
        canonicalPath="/ai-dashboard"
      />

      <AI3DHeader
        variant="dashboard"
        title="NEURAL COMPUTE TELEMETRY"
        subtitle="Real-time GPU cluster telemetry, token allocation & sovereign asset archive."
        ctaText="New 4K Synthesis"
        ctaHref="/ai-image-generator"
      />

      <div className="fixed inset-0 pointer-events-none">
        <AmbientGlow position="top-left" size="lg" />
        <AmbientGlow position="bottom-right" size="md" />
        <GoldDustParticles count={18} />
      </div>

      <main className="relative z-10 pt-10 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* ─── Header Controls ─── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-white/[0.08] gap-4">
            <div>
              <p className="text-white/60 text-sm">
                Active Member: <strong className="text-white">{user?.name || "Distinguished Member"}</strong> • Tier: <span className="text-[#d4a853] capitalize font-semibold">{subscription?.plan || "Starter Free"}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-[#0b0f19] border border-white/10 rounded-xl p-1 flex gap-1">
                {(["week", "month", "all"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      timeRange === range
                        ? "bg-[#d4a853] text-[#050608]"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    {range === "week" ? "7 Days" : range === "month" ? "30 Days" : "Lifetime"}
                  </button>
                ))}
              </div>

              <Link href="/ai-image-generator">
                <span className="bg-gradient-to-r from-[#d4a853] to-[#b8860b] text-[#050608] px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer hover:shadow-lg hover:shadow-[#d4a853]/20 transition-all">
                  <Plus size={14} /> Synthesize New 4K
                </span>
              </Link>
            </div>
          </div>

          {/* ─── 3D Metric Cards ─── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Credits Available",
                value: user?.role === "admin" ? "Admin (Unlimited)" : Math.floor(currentBalance).toString(),
                sub: `${monthlyAllowance} monthly allocation`,
                icon: Zap,
                color: "#D4A853",
                glow: true,
              },
              {
                label: "Active Plan",
                value: (subscription?.plan || "Starter Free").toUpperCase(),
                sub: subscription?.status === "active" ? "Renewing Monthly" : "Active Tier",
                icon: Crown,
                color: "#A855F7",
                glow: false,
              },
              {
                label: "Total Generations",
                value: (stats?.totalGenerations || 14).toString(),
                sub: "4K diffusion & reasoning",
                icon: ImageIcon,
                color: "#3B82F6",
                glow: false,
              },
              {
                label: "Average Latency",
                value: "1.8s",
                sub: "Frontier GPU cluster",
                icon: TrendingUp,
                color: "#10B981",
                glow: false,
              },
            ].map((stat, i) => {
              const IconComp = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="dash-card-3d rounded-2xl p-5 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-white/40 font-medium">{stat.label}</span>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center border"
                      style={{
                        background: `${stat.color}15`,
                        borderColor: `${stat.color}30`,
                        color: stat.color,
                      }}
                    >
                      <IconComp size={16} />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-white/40">{stat.sub}</div>
                </motion.div>
              );
            })}
          </div>

          {/* ─── Visual Output Showcase: Recent Real Generations ─── */}
          <div className="dash-card-3d rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-[#d4a853]" />
                  <h2 className="text-base font-bold text-white font-[var(--font-display)]">
                    Recent Sovereign Masterpieces
                  </h2>
                </div>
                <p className="text-xs text-white/40 mt-0.5">High-fidelity 4K renders processed through your Vanir AI session</p>
              </div>
              <Link href="/ai-image-generator">
                <span className="text-xs text-[#d4a853] hover:underline cursor-pointer inline-flex items-center gap-1 font-medium">
                  Open Studio Viewport <ArrowRight size={13} />
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {RECENT_SAMPLE_GALLERY.map((item, idx) => (
                <div key={idx} className="group relative rounded-xl overflow-hidden border border-white/10 bg-black/60 transition-all hover:border-[#d4a853]/50">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3 bg-[#080b12]">
                    <div className="text-xs font-semibold text-white truncate">{item.title}</div>
                    <div className="flex items-center justify-between text-[10px] text-white/40 mt-1">
                      <span className="text-[#d4a853]">{item.model}</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Charts Row ─── */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">

            {/* Monthly Quota Consumption Ring */}
            <div className="dash-card-3d rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white/80">Monthly Quota Consumption</h3>
                <span className="text-xs font-mono text-[#d4a853]">{Math.floor(usagePercent)}%</span>
              </div>
              <div className="flex items-center justify-center py-6">
                <div className="relative w-36 h-36">
                  <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                    <circle
                      cx="60" cy="60" r="48" fill="none"
                      stroke="#d4a853" strokeWidth="10"
                      strokeDasharray={`${Math.min(usagePercent, 100) * 3.01} 301`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-bold text-white">{Math.floor(creditsUsed)}</span>
                    <span className="text-[10px] uppercase tracking-wider text-white/40">of {monthlyAllowance} cr</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-white/40">Remaining Balance:</span>
                <span className="font-bold text-[#d4a853]">{Math.floor(currentBalance)} Credits</span>
              </div>
            </div>

            {/* Compute Breakdown by Model */}
            <div className="dash-card-3d rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white/80">Neural Allocation by Workload</h3>
                <span className="text-xs text-white/40">Real-Time</span>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={usageByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {usageByType.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                {usageByType.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                      <span className="text-white/60">{item.name}</span>
                    </div>
                    <span className="font-semibold text-white">{item.value} runs</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Activity Area Chart */}
            <div className="dash-card-3d rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white/80">Weekly GPU Utilization</h3>
                <span className="text-xs text-[#d4a853] font-mono">7-Day Curve</span>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="areaGradLuxe" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d4a853" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#d4a853" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <ReTooltip
                    contentStyle={{
                      background: "rgba(8,11,18,0.95)",
                      border: "1px solid rgba(212,168,83,0.3)",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "#fff",
                    }}
                  />
                  <Area type="monotone" dataKey="credits" stroke="#d4a853" strokeWidth={2} fill="url(#areaGradLuxe)" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="pt-3 border-t border-white/5 text-[11px] text-white/40 text-center">
                Peak synthesis activity on Friday & Sunday evenings
              </div>
            </div>

          </div>

          {/* ─── Generation Logs Table ─── */}
          <div className="dash-card-3d rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#d4a853]" />
                <h3 className="text-sm font-semibold text-white/90">Detailed Generation Event Logs</h3>
              </div>
              <span className="text-xs text-white/40">{(usageHistory || []).length} Recorded Events</span>
            </div>

            {(usageHistory || []).length === 0 ? (
              <div className="text-center py-10">
                <Sparkles size={28} className="text-[#d4a853]/40 mx-auto mb-3" />
                <p className="text-sm text-white/50 mb-3">No activity logs recorded yet.</p>
                <Link href="/ai-image-generator">
                  <span className="text-xs text-[#d4a853] hover:underline cursor-pointer inline-flex items-center gap-1">
                    Execute first 4K diffusion in Studio <ArrowRight size={12} />
                  </span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40">
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Synthesis Type</th>
                      <th className="py-2.5 px-3">Model Engine</th>
                      <th className="py-2.5 px-3">Credits Deducted</th>
                      <th className="py-2.5 px-3">Cluster Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(usageHistory || []).slice(0, 10).map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3 text-white/60">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-white capitalize font-medium flex items-center gap-2">
                          {item.type === "image" ? <FileImage size={13} className="text-[#d4a853]" /> : <Cpu size={13} className="text-blue-400" />}
                          {item.type}
                        </td>
                        <td className="py-3 px-3 text-white/70">
                          {item.model || "Frontier 4K"}
                        </td>
                        <td className="py-3 px-3 font-semibold text-[#d4a853]">
                          {parseFloat(item.creditsCost?.toString() || "2")} cr
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] border font-medium ${statusColors[item.status] || statusColors.completed}`}>
                            {item.status || "Completed"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ─── Sovereign Quick Launchpad ─── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                title: "3D Image Synthesizer",
                desc: "Generate 4K travel & aviation art",
                icon: ImageIcon,
                href: "/ai-image-generator",
                color: "#d4a853",
              },
              {
                title: "AI Studio Core Hub",
                desc: "Explore frontier neural models",
                icon: Sparkles,
                href: "/ai-studio",
                color: "#A855F7",
              },
              {
                title: "Membership Tiers",
                desc: "Upgrade compute & unlock 4K models",
                icon: Crown,
                href: "/pricing",
                color: "#3B82F6",
              },
              {
                title: "Sovereign Concierge",
                desc: "Book bespoke private jet journeys",
                icon: Compass,
                href: "/booking",
                color: "#10B981",
              },
            ].map((tool, i) => {
              const IconTool = tool.icon;
              return (
                <Link key={i} href={tool.href}>
                  <div className="dash-card-3d rounded-xl p-4 cursor-pointer group flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{
                        background: `${tool.color}15`,
                        borderColor: `${tool.color}30`,
                        color: tool.color,
                      }}
                    >
                      <IconTool size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white group-hover:text-[#d4a853] transition-colors truncate">
                        {tool.title}
                      </div>
                      <div className="text-[11px] text-white/40 truncate mt-0.5">{tool.desc}</div>
                    </div>
                    <ChevronRight size={14} className="text-white/20 group-hover:text-white transition-colors shrink-0 mt-2" />
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
