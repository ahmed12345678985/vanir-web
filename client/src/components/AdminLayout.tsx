import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { apiBase } from "@/lib/firebase-api";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard,
  CalendarCheck,
  Star,
  MessageSquare,
  Tag,
  Image,
  LogOut,
  PanelLeft,
  ArrowLeft,
  Crown,
  Sparkles,
  Users,
  MapPin,
  BookOpen,
  Compass,
  FileText,
  BarChart3,
  ShieldCheck,
  Coins,
  Settings,
  PanelTop,
  Navigation,
  FileStack,
  Palette,
  Globe,
  FolderOpen,
  HardDrive,
  Brain,
  Upload,
  MonitorSmartphone,
  Server,
  Database,
  AlertCircle,
  RotateCcw
} from "lucide-react";
import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation, Link } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";

const ADMIN_BOOTSTRAP_EMAILS = [
  "contact@vanirgroup.com",
  "admin@vanirgroup.com",
  "ahmedroshdi@gmail.com",
  "roshdi@vanirgroup.com",
];

function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (
    ADMIN_BOOTSTRAP_EMAILS.includes(normalized) ||
    normalized.endsWith("@vanirgroup.com")
  );
}

const adminMenuItems = [
  // ── الرئيسية ──
  { icon: LayoutDashboard, label: "نظرة عامة (Overview)", path: "/admin", group: "main" },
  { icon: BarChart3, label: "التحليلات (Analytics)", path: "/admin/analytics", group: "main" },

  // ── المحتوى (CONTENT) ──
  { icon: MapPin, label: "الوجهات (Destinations)", path: "/admin/destinations", group: "content" },
  { icon: Tag, label: "العروض (Offers)", path: "/admin/offers", group: "content" },
  { icon: BookOpen, label: "المدونة (Blog)", path: "/admin/blog", group: "content" },
  { icon: Compass, label: "الأنشطة (Activities)", path: "/admin/activities", group: "content" },
  { icon: Image, label: "معرض الصور (Gallery)", path: "/admin/gallery", group: "content" },
  { icon: Star, label: "التقييمات (Reviews)", path: "/admin/reviews", group: "content" },

  // ── الخدمات والتطبيق (APP & SERVICES) ──
  { icon: MonitorSmartphone, label: "مركز كافة الخدمات والتطبيق (14 خدمة)", path: "/admin/mobile-app", group: "services" },
  { icon: Crown, label: "البرامج السياحية (Packages)", path: "/admin/packages", group: "services" },
  { icon: Compass, label: "الطيران الخاص (Jets)", path: "/admin/jets", group: "services" },
  { icon: Compass, label: "اليخوت الفاخرة (Yachts)", path: "/admin/yachts", group: "services" },
  { icon: Compass, label: "الفنادق والمنتجعات (Hotels)", path: "/admin/hotels", group: "services" },
  { icon: Compass, label: "الليموزين والسيارات (Transfers)", path: "/admin/transfers", group: "services" },
  { icon: Sparkles, label: "المساعد الذكي VIP (AI Studio)", path: "/admin/ai-studio", group: "services" },

  // ── العمليات (OPERATIONS) ──
  { icon: CalendarCheck, label: "الحجوزات (Bookings)", path: "/admin/bookings", group: "operations" },
  { icon: MessageSquare, label: "الرسائل (Messages)", path: "/admin/messages", group: "operations" },
  { icon: Users, label: "العملاء والبروفايل VIP (CRM)", path: "/admin/users", group: "operations" },
  { icon: Coins, label: "الرصيد والمدفوعات (Credits)", path: "/admin/credits", group: "operations" },

  // ── التصميم (DESIGN) ──
  { icon: PanelTop, label: "الواجهة الرئيسية (Hero)", path: "/admin/hero", group: "design" },
  { icon: Navigation, label: "شريط التنقل (Navbar)", path: "/admin/navbar", group: "design" },
  { icon: FileStack, label: "الصفحات (Pages)", path: "/admin/pages", group: "design" },
  { icon: MonitorSmartphone, label: "المحرر المباشر (Editor)", path: "/admin/visual-editor", group: "design" },
  { icon: Palette, label: "المظهر والألوان (Theme)", path: "/admin/theme", group: "design" },

  // ── الأدوات (TOOLS) ──
  { icon: Database, label: "قاعدة البيانات المباشرة", path: "/admin/database", group: "tools" },
  { icon: Server, label: "صحة النظام والملفات", path: "/admin/system", group: "tools" },
  { icon: Brain, label: "مركز الذكاء الاصطناعي", path: "/admin/ai-command", group: "tools" },
  { icon: Globe, label: "إدارة محركات البحث (SEO)", path: "/admin/seo", group: "tools" },
  { icon: FolderOpen, label: "مكتبة الوسائط (Media)", path: "/admin/media", group: "tools" },
  { icon: HardDrive, label: "النسخ الاحتياطي والتصدير", path: "/admin/backup", group: "tools" },
  { icon: Upload, label: "استيراد البيانات", path: "/admin/import", group: "tools" },
  { icon: ShieldCheck, label: "الصلاحيات (Permissions)", path: "/admin/permissions", group: "tools" },
  { icon: FileText, label: "سجل العمليات (Audit Log)", path: "/admin/audit-log", group: "tools" },
];

const SIDEBAR_WIDTH_KEY = "admin-sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

class AdminSectionErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[AdminSectionError]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-[var(--theme-surface)]/80 border border-red-500/20 rounded-2xl max-w-2xl mx-auto my-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertCircle size={28} />
          </div>
          <h3 className="text-xl font-bold text-white font-[var(--font-display)]">
            حدث خطأ أثناء عرض هذا القسم
          </h3>
          <p className="text-xs text-white/60 font-mono bg-black/40 p-3 rounded-lg max-w-full overflow-x-auto text-left">
            {this.state.error?.message || "Unknown error"}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-[var(--theme-primary)] text-[var(--theme-surface)] rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              إعادة المحاولة
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/15 transition-colors"
            >
              تحديث الصفحة
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  // If we're not loading but have no user, wait briefly before redirecting.
  // This gives the session cookie time to propagate after a hard navigation
  // from AdminLogin, preventing a redirect loop if the cookie isn't readable yet.
  useEffect(() => {
    if (!loading && !user && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      if (currentPath === "/admin/login") return;
      // Single retry: poll the session endpoint (on the same origin the login
      // request used) once after a short delay before giving up.
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`${apiBase()}/api/auth/me`, { credentials: "include" });
          if (res.ok) {
            // Session is now readable — reload to pick up the auth state
            window.location.reload();
          } else {
            window.location.href = "/admin/login";
          }
        } catch {
          window.location.href = "/admin/login";
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [loading, user]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--theme-surface)]">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30 flex items-center justify-center">
            <Crown size={28} className="text-[var(--theme-primary)]" />
          </div>
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-2xl font-[var(--font-display)] font-bold text-white text-center">
              Admin Access Required
            </h1>
            <p className="text-sm text-white/50 font-[var(--font-body)] text-center max-w-sm">
              Sign in with your admin account to access the management dashboard.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = "/admin/login";
            }}
            className="w-full bg-[var(--theme-primary)] text-[var(--theme-surface)] hover:bg-[var(--theme-primary-light)] font-[var(--font-body)] font-semibold shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            Sign in
          </Button>
          <Link
            href="/"
            className="text-[var(--theme-primary)]/60 hover:text-[var(--theme-primary)] text-sm font-[var(--font-body)] flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={14} /> Back to website
          </Link>
        </div>
      </div>
    );
  }

  const isAuthorized = user.role === "admin" || isUserAdmin(user.email);
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--theme-surface)]">
        <div className="flex flex-col items-center gap-6 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <Crown size={28} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-[var(--font-display)] font-bold text-white text-center">
            الوصول محظور · Admin Access Denied
          </h1>
          <p className="text-sm text-white/60 font-[var(--font-body)] text-center leading-relaxed">
            عذراً، هذا الحساب ليس لديه صلاحيات الإدارة العليا للوحة تحكم فانير جروب. تم تسجيل الدخول كعميل VIP عادي.
          </p>
          <div className="flex flex-col gap-2 w-full pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--theme-primary)] text-black font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity"
            >
              <ArrowLeft size={14} /> العودة للموقع الرئيسي
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center gap-2 px-5 py-2 border border-white/10 text-white/70 hover:text-white font-medium text-xs rounded-lg transition-colors"
            >
              تسجيل الدخول بحساب الإدارة
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notranslate" translate="no">
      <SidebarProvider
        style={
          {
            "--sidebar-width": `${sidebarWidth}px`,
          } as CSSProperties
        }
      >
        <AdminLayoutContent setSidebarWidth={setSidebarWidth}>
          <AdminSectionErrorBoundary>
            <React.Suspense fallback={<DashboardLayoutSkeleton />}>
              {children}
            </React.Suspense>
          </AdminSectionErrorBoundary>
        </AdminLayoutContent>
      </SidebarProvider>
    </div>
  );
}

type AdminLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function AdminLayoutContent({
  children,
  setSidebarWidth,
}: AdminLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = adminMenuItems.find((item) => item.path === location);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft =
        sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0 bg-[var(--theme-surface)]"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center border-b border-white/5">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-[var(--theme-primary)]/10 rounded-lg transition-colors focus:outline-none shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-[var(--theme-primary)]/60" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <Crown size={16} className="text-[var(--theme-primary)] shrink-0" />
                  <span className="font-[var(--font-display)] font-semibold text-white tracking-tight truncate text-sm">
                    Admin Panel
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 bg-[var(--theme-surface)] overflow-y-auto">
            <SidebarMenu className="px-2 py-3">
              {(() => {
                const groups = [
                  { key: "main", label: "" },
                  { key: "content", label: "المحتوى (CONTENT)" },
                  { key: "services", label: "الخدمات والتطبيق (APP & SERVICES)" },
                  { key: "operations", label: "العمليات (OPERATIONS)" },
                  { key: "design", label: "التصميم (DESIGN)" },
                  { key: "tools", label: "الأدوات (TOOLS)" },
                ];
                return groups.map(group => {
                  const items = adminMenuItems.filter(i => i.group === group.key);
                  if (items.length === 0) return null;
                  return (
                    <div key={group.key}>
                      {group.label && !isCollapsed && (
                        <p className="text-[10px] uppercase tracking-wider text-white/20 font-semibold px-3 pt-4 pb-1">{group.label}</p>
                      )}
                      {group.label && isCollapsed && <div className="h-2" />}
                      {items.map(item => {
                        const isActive = location === item.path;
                        return (
                          <SidebarMenuItem key={item.path}>
                            <SidebarMenuButton
                              isActive={isActive}
                              onClick={() => setLocation(item.path)}
                              tooltip={item.label}
                              className={`h-9 transition-all font-[var(--font-body)] text-sm ${
                                isActive
                                  ? "bg-[var(--theme-primary)]/15 text-[var(--theme-primary)] border border-white/10"
                                  : "text-white/60 hover:text-white hover:bg-[var(--theme-primary)]/5"
                              }`}
                            >
                              <item.icon
                                className={`h-4 w-4 ${isActive ? "text-[var(--theme-primary)]" : ""}`}
                              />
                              <span>{item.label}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </div>
                  );
                });
              })()}
            </SidebarMenu>

          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-white/5 bg-[var(--theme-surface)]">
            {/* Back to website link - moved to footer to prevent overlap */}
            <SidebarMenu className="mb-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setLocation("/")}
                  tooltip="Back to website"
                  className="h-9 text-white/40 hover:text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/5 font-[var(--font-body)] text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Website</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-[var(--theme-primary)]/5 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none">
                  <Avatar className="h-9 w-9 border border-[var(--theme-primary)]/30 shrink-0">
                    <AvatarFallback className="text-xs font-medium bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-[var(--font-body)] font-medium truncate leading-none text-white">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-white/40 truncate mt-1.5 font-[var(--font-body)]">
                      Admin
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[var(--theme-surface)] border-white/10">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="font-[var(--font-body)]">Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--theme-primary)]/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="bg-[var(--theme-surface)]">
        {isMobile && (
          <div className="flex border-b border-white/5 h-14 items-center justify-between bg-[var(--theme-surface)]/95 px-2 backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-[var(--theme-surface)]" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-white font-[var(--font-body)]">
                    {activeMenuItem?.label ?? "Admin"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </>
  );
}
