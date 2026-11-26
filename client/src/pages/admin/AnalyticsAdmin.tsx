import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Globe,
  Activity,
  Eye,
  Users,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
} from "recharts";
import { ConcentricAnalyticsRings } from "@/components/admin/ConcentricAnalyticsRings";
import {
  fetchSavedGaMeasurementId,
  fetchGaLiveMetrics,
  injectGoogleAnalytics,
  isValidGaId,
  GA_STORAGE_KEY,
  type GaLiveMetrics,
} from "@/lib/googleAnalytics";

const BOOKING_THUMBNAILS = [
  "/images/hotels-real/caimn-view-0063-hor-clsc.webp",
  "/images/hotels-real/damac-maison-mall-street-1.webp",
  "/images/hotels-real/burj-al-arab-1.webp",
  "/images/hotels-real/atlantis-royal-1.webp",
  "/images/hotels-real/caimn-pool-0067-hor-clsc.webp",
];

export default function AnalyticsAdmin() {
  const [, setLocation] = useLocation();
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [tableQuery, setTableQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [gaMeasurementId, setGaMeasurementId] = useState(() => {
    try {
      return localStorage.getItem(GA_STORAGE_KEY) || "";
    } catch {
      return "";
    }
  });
  const [gscSiteUrl, setGscSiteUrl] = useState("https://vanirgroup.com");
  const [savingGoogle, setSavingGoogle] = useState(false);
  const [gaActiveId, setGaActiveId] = useState<string>(() => {
    try {
      return localStorage.getItem(GA_STORAGE_KEY) || "";
    } catch {
      return "";
    }
  });
  const [gaMetrics, setGaMetrics] = useState<GaLiveMetrics | null>(null);
  const [loadingGaMetrics, setLoadingGaMetrics] = useState(false);

  const loadGaMetrics = async (selectedPeriod: "7d" | "30d" | "90d" = period) => {
    setLoadingGaMetrics(true);
    try {
      const days = selectedPeriod === "7d" ? 7 : selectedPeriod === "30d" ? 30 : 90;
      const metrics = await fetchGaLiveMetrics(days);
      setGaMetrics(metrics);
    } finally {
      setLoadingGaMetrics(false);
    }
  };

  useEffect(() => {
    loadGaMetrics(period);
  }, [period]);

  const { data: settingsData, refetch: refetchSettings } = trpc.settings.getAll.useQuery();
  const saveSettingMutation = trpc.settings.set.useMutation();
  const { data: usersData } = trpc.users.list.useQuery({ limit: 100, offset: 0 });
  const { data: bookingsData } = trpc.bookings.listAll.useQuery({ limit: 100, offset: 0 });
  const { data: messagesData } = trpc.contact.listAll.useQuery({ limit: 100, offset: 0 });

  useEffect(() => {
    let active = true;
    fetchSavedGaMeasurementId().then((id) => {
      if (active && id) {
        setGaMeasurementId(id);
        setGaActiveId(id);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (Array.isArray(settingsData)) {
      const ga =
        settingsData.find((s: any) => s.key === "google_analytics_id" && s.value) ||
        settingsData.find((s: any) => s.key === "googleAnalyticsId" && s.value) ||
        settingsData.find((s: any) => s.key === "ga_measurement_id" && s.value);
      const gsc = settingsData.find((s: any) => s.key === "google_search_console_url" && s.value);
      if (ga?.value) {
        const clean = String(ga.value).trim().toUpperCase();
        setGaMeasurementId(clean);
        setGaActiveId(clean);
      }
      if (gsc?.value) setGscSiteUrl(String(gsc.value));
    }
  }, [settingsData]);

  const bookings = Array.isArray(bookingsData) ? bookingsData : [];
  const users = usersData?.users || [];
  const messages = Array.isArray(messagesData) ? messagesData : [];

  const totals = useMemo(() => {
    const revenue = bookings.reduce((sum: number, b: any) => {
      if (b.status !== "cancelled" && b.totalPrice) return sum + Number(b.totalPrice || 0);
      return sum;
    }, 0);
    const pending = bookings.reduce((sum: number, b: any) => {
      if (b.status === "pending" && b.totalPrice) return sum + Number(b.totalPrice || 0);
      return sum;
    }, 0);
    return {
      totalBookings: bookings.length,
      totalRevenue: revenue,
      pendingDebt: pending,
      totalUsers: users.length,
      totalMessages: messages.length,
    };
  }, [bookings, users, messages]);

  const filteredBookings = useMemo(() => {
    if (!tableQuery.trim()) return bookings;
    const q = tableQuery.trim().toLowerCase();
    return bookings.filter((b: any) =>
      `${b.destination || ""} ${b.packageName || ""} ${b.guestName || ""} ${b.status || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [bookings, tableQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
  const pagedBookings = filteredBookings.slice((page - 1) * pageSize, page * pageSize);

  const concentricRings = useMemo(() => {
    const confirmed = bookings.filter((b: any) => b.status === "confirmed").length;
    const pending = bookings.filter((b: any) => b.status === "pending").length;
    const completed = bookings.filter((b: any) => b.status === "completed").length;
    return [
      { label: "Confirmed", count: confirmed, color: "#4ADE80" },
      { label: "Pending", count: pending, color: "#F43F5E" },
      { label: "Completed", count: completed, color: "#A855F7" },
    ] as [
      { label: string; count: number; color: string },
      { label: string; count: number; color: string },
      { label: string; count: number; color: string },
    ];
  }, [bookings]);

  const revenueCurve = useMemo(() => {
    const daysCount = period === "7d" ? 7 : period === "30d" ? 14 : 30;
    const buckets = Array.from({ length: daysCount }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (daysCount - 1 - i));
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return { key, name: label, val: 0 };
    });
    bookings.forEach((b: any) => {
      if (b.status === "cancelled" || !b.totalPrice) return;
      const dt = b.createdAt ? new Date(b.createdAt).toISOString().slice(0, 10) : "";
      const bucket = buckets.find((x) => x.key === dt);
      if (bucket) bucket.val += Number(b.totalPrice || 0);
    });
    return buckets;
  }, [bookings, period]);

  const handleSaveGoogle = async () => {
    const cleanGa = gaMeasurementId.trim().toUpperCase();
    if (cleanGa && !isValidGaId(cleanGa)) {
      toast.error("صيغة Measurement ID غير صحيحة — يجب أن تبدأ بـ G- مثل G-XXXXXXXXXX");
      return;
    }
    setSavingGoogle(true);
    try {
      await saveSettingMutation.mutateAsync({ key: "google_analytics_id", value: cleanGa });
      await saveSettingMutation.mutateAsync({ key: "google_search_console_url", value: gscSiteUrl.trim() });
      if (cleanGa) {
        injectGoogleAnalytics(cleanGa);
        setGaMeasurementId(cleanGa);
        setGaActiveId(cleanGa);
      }
      await refetchSettings();
      toast.success(
        cleanGa
          ? `تم حفظ وتفعيل Google Analytics (${cleanGa}) مباشرة على الموقع`
          : "تم حفظ إعدادات Google بنجاح"
      );
    } catch (err: any) {
      toast.error(err?.message || "تعذر حفظ إعدادات Google");
    } finally {
      setSavingGoogle(false);
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header + Google Connection Strip */}
      <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src="/logo-vanir-v2.png" alt="VANIR GROUP" className="h-12 w-auto object-contain shrink-0" />
          <div>
            <h1 className="text-xl font-bold text-white">Analytics &amp; Google Live Telemetry</h1>
            <p className="text-xs text-white/55">
              إحصائيات الحجوزات الحقيقية مربوطة بـ Google Analytics 4 و Google Search Console
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(["7d", "30d", "90d"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                period === p
                  ? "bg-gradient-to-br from-[#C69749] via-[#E5C17A] to-[#9E7432] text-black"
                  : "bg-[#141923] text-white/65 border border-white/10 hover:text-white"
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Google Analytics & Search Console Integration Bar */}
      <div className="bg-[#0d1117] border border-[#C69749]/30 rounded-2xl p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
        <div className="lg:col-span-4">
          <label className="text-xs font-semibold text-white/70 flex items-center justify-between gap-1.5 mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#E5C17A]" />
              Google Analytics 4 Measurement ID
            </span>
            {gaActiveId && isValidGaId(gaActiveId) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" /> Active · {gaActiveId}
              </span>
            )}
          </label>
          <input
            type="text"
            value={gaMeasurementId}
            onChange={(e) => setGaMeasurementId(e.target.value)}
            placeholder="G-XXXXXXXXXX"
            className="w-full px-3.5 py-2 rounded-xl bg-[#141923] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C69749]"
          />
        </div>
        <div className="lg:col-span-4">
          <label className="text-xs font-semibold text-white/70 mb-1.5 block">
            Google Search Console Property
          </label>
          <input
            type="text"
            value={gscSiteUrl}
            onChange={(e) => setGscSiteUrl(e.target.value)}
            placeholder="https://vanirgroup.com"
            className="w-full px-3.5 py-2 rounded-xl bg-[#141923] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C69749]"
          />
        </div>
        <div className="lg:col-span-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSaveGoogle}
            disabled={savingGoogle}
            className="px-4 py-2 rounded-xl bg-gradient-to-br from-[#C69749] via-[#E5C17A] to-[#9E7432] text-black text-xs font-bold hover:opacity-95 disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {savingGoogle ? "جاري الحفظ..." : "حفظ ربط Google"}
          </button>
          <a
            href="https://analytics.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-[#141923] border border-white/10 text-xs font-semibold text-white/80 hover:text-white inline-flex items-center gap-1.5"
          >
            GA4 <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={`https://search.google.com/search-console?resource_id=${encodeURIComponent(gscSiteUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-[#141923] border border-white/10 text-xs font-semibold text-white/80 hover:text-white inline-flex items-center gap-1.5"
          >
            Search Console <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* ─── Google Analytics 4 Live Result Cards ─── */}
      <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <h2 className="text-sm font-bold text-white">
              Google Analytics 4 · Live Results ({period.toUpperCase()})
            </h2>
            {gaActiveId && isValidGaId(gaActiveId) && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-mono font-bold">
                {gaActiveId}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => loadGaMetrics(period)}
            disabled={loadingGaMetrics}
            className="px-3 py-1.5 rounded-lg bg-[#141923] border border-white/10 text-[11px] font-semibold text-white/80 hover:text-white inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingGaMetrics ? "animate-spin" : ""}`} />
            {loadingGaMetrics ? "جاري التحديث..." : "تحديث نتائج GA4"}
          </button>
        </div>

        {/* 4 GA4 Live KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-500/15 to-[#101724] border border-emerald-400/30">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Active Users (30m)</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2 tabular-nums">
              {(gaMetrics?.activeUsers30m ?? 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-white/50 mt-1">الزوار النشطون على الموقع الآن</p>
          </div>

          <div className="rounded-2xl p-4 bg-gradient-to-br from-[#C69749]/15 to-[#101724] border border-[#C69749]/35">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E5C17A]">Page Views</span>
              <Eye className="w-4 h-4 text-[#E5C17A]" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2 tabular-nums">
              {(gaMetrics?.totalPageViews ?? 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-white/50 mt-1">إجمالي مشاهدات الصفحات ({period})</p>
          </div>

          <div className="rounded-2xl p-4 bg-gradient-to-br from-sky-500/15 to-[#101724] border border-sky-400/30">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300">Unique Visitors</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2 tabular-nums">
              {(gaMetrics?.uniqueVisitors ?? 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-white/50 mt-1">عدد الزوار الفريدين ({period})</p>
          </div>

          <div className="rounded-2xl p-4 bg-gradient-to-br from-purple-500/15 to-[#101724] border border-purple-400/30">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">Sessions &amp; Depth</span>
              <BarChart3 className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2 tabular-nums">
              {(gaMetrics?.totalSessions ?? 0).toLocaleString()}
              <span className="text-xs font-semibold text-purple-300 ml-2">
                ({gaMetrics?.avgPagesPerSession ?? 0} p/s)
              </span>
            </div>
            <p className="text-[11px] text-white/50 mt-1">الجلسات ومتوسط الصفحات لكل جلسة</p>
          </div>
        </div>

        {/* 2 GA4 Insight Cards: Traffic Curve + Top Pages & Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 rounded-2xl bg-[#101622] border border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-white">Daily Page Views &amp; Visitors</h3>
                <p className="text-[11px] text-white/45">منحنى الزيارات الحقيقي المسجل في Google Analytics</p>
              </div>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gaMetrics?.dailyTraffic || []}>
                  <defs>
                    <linearGradient id="gaEmeraldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0b111e",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "10px",
                      fontSize: "11px",
                    }}
                  />
                  <Area type="monotone" dataKey="views" name="Page Views" stroke="#10b981" strokeWidth={2.2} fill="url(#gaEmeraldGrad)" />
                  <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#E5C17A" strokeWidth={2} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl bg-[#101622] border border-white/10 p-4 flex flex-col justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold text-white mb-2.5">Top Visited Pages</h3>
              {!gaMetrics || gaMetrics.topPages.length === 0 ? (
                <p className="text-[11px] text-white/45 py-4 text-center">
                  ستظهر أكثر الصفحات زيارة فور تصفح الموقع.
                </p>
              ) : (
                <div className="space-y-2">
                  {gaMetrics.topPages.slice(0, 5).map((pg) => (
                    <div key={pg.path} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-white/85 truncate max-w-[70%]">{pg.path}</span>
                        <span className="text-[#E5C17A] font-bold tabular-nums">{pg.views} ({pg.pct}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-[#E5C17A]" style={{ width: `${Math.max(4, pg.pct)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
              <div>
                <p className="text-[10px] font-bold uppercase text-white/45 mb-1.5">Devices</p>
                <div className="flex flex-wrap gap-1.5">
                  {(gaMetrics?.deviceBreakdown || []).map((d) => (
                    <span key={d.label} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/80">
                      {d.label}: <strong className="text-[#E5C17A]">{d.pct}%</strong>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-white/45 mb-1.5">Traffic Sources</p>
                <div className="flex flex-wrap gap-1.5">
                  {(gaMetrics?.sourceBreakdown || []).filter((s) => s.count > 0 || s.label === "Direct" || s.label === "Google").map((s) => (
                    <span key={s.label} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/80">
                      {s.label}: <strong className="text-emerald-300">{s.pct}%</strong>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exact Lineone Layout: Left 8 Cols (KPIs + Travels History) + Right 4 Cols (Analytics Donut + Revenue Spline) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 bg-[#0d1117] border border-white/10 rounded-2xl p-5 flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src="/icons/travel-3d/Calendar.webp" alt="" className="w-11 h-11 object-contain" />
              <h2 className="text-base font-bold text-white">Travels History</h2>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableQuery}
                onChange={(e) => {
                  setTableQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search bookings..."
                className="pl-9 pr-4 py-2 rounded-full bg-[#141923] border border-white/10 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#C69749] w-52"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl p-4 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] text-white shadow-lg">
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-90">TOTAL BOOKING</p>
              <div className="flex items-end justify-between mt-3">
                <span className="text-2xl font-extrabold tabular-nums">{totals.totalBookings.toLocaleString()}</span>
                <button type="button" onClick={() => setLocation("/admin/bookings")} className="text-[11px] underline">
                  Get Report
                </button>
              </div>
            </div>

            <div className="rounded-2xl p-4 bg-gradient-to-br from-[#C69749] via-[#E5C17A] to-[#966F2F] text-black shadow-lg">
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-85">TOTAL REVENUE</p>
              <div className="flex items-end justify-between mt-3">
                <span className="text-2xl font-extrabold tabular-nums">${totals.totalRevenue.toLocaleString()}</span>
                <button type="button" onClick={() => setLocation("/admin/bookings")} className="text-[11px] font-bold underline">
                  Get Report
                </button>
              </div>
            </div>

            <div className="rounded-2xl p-4 bg-gradient-to-br from-[#ec4899] to-[#be123c] text-white shadow-lg">
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-90">PENDING / DEBT</p>
              <div className="flex items-end justify-between mt-3">
                <span className="text-2xl font-extrabold tabular-nums">${totals.pendingDebt.toLocaleString()}</span>
                <button type="button" onClick={() => setLocation("/admin/credits")} className="text-[11px] underline">
                  Get Report
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {pagedBookings.length === 0 ? (
              <div className="py-10 text-center text-xs text-white/50">لا توجد حجوزات مسجلة في هذه الفترة.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-white/10">
                  {pagedBookings.map((b: any, idx: number) => {
                    const thumb = BOOKING_THUMBNAILS[idx % BOOKING_THUMBNAILS.length];
                    const dateLabel = b.checkInDate
                      ? new Date(b.checkInDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                      : b.createdAt
                        ? new Date(b.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                        : "—";
                    return (
                      <tr key={b.id || idx} className="hover:bg-white/5">
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-3">
                            <img src={thumb} alt="" className="w-11 h-11 rounded-xl object-cover border border-white/10 shrink-0" />
                            <div>
                              <p className="text-sm font-bold text-white">{b.packageName || b.destination || "Booking"}</p>
                              <p className="text-xs text-white/50">{b.guestName || b.destination}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-xs text-white/60 whitespace-nowrap">{dateLabel}</td>
                        <td className="py-3 px-2 text-xs text-white/70 whitespace-nowrap">{b.adults || 1} Adults</td>
                        <td className="py-3 px-2 text-xs font-bold text-[#E5C17A] whitespace-nowrap">
                          ${Number(b.totalPrice || 0).toLocaleString()}
                        </td>
                        <td className="py-3 pl-2 text-right whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/10 text-white">
                            {b.status || "pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-white/50">
            <span>
              Showing {pagedBookings.length} of {filteredBookings.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-full bg-[#141923] flex items-center justify-center disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-full text-xs font-bold ${
                    page === p ? "bg-[#C69749] text-black" : "bg-[#141923] text-white/70"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="w-7 h-7 rounded-full bg-[#141923] flex items-center justify-center disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white">Analytics</h3>
              <img src="/icons/travel-3d/BadgeCheck.webp" alt="" className="w-10 h-10 object-contain" />
            </div>
            <ConcentricAnalyticsRings
              total={totals.totalBookings}
              rings={concentricRings}
              subtitle={`Travel analytics calculated based on travels count (${totals.totalUsers} clients)`}
            />
          </div>

          <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-5 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">Live Revenue ({period})</p>
                <h3 className="text-2xl font-extrabold text-[#E5C17A] mt-0.5">${totals.totalRevenue.toLocaleString()}</h3>
              </div>
              <img src="/icons/travel-3d/SaveMoney.webp" alt="" className="w-11 h-11 object-contain" />
            </div>
            <div className="h-36 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueCurve}>
                  <defs>
                    <linearGradient id="vanirBrushedGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C69749" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#C69749" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="val" stroke="#C69749" strokeWidth={2.5} fill="url(#vanirBrushedGold)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
