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
import { apiBase, getFirebaseApp } from "@/lib/firebase-api";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LogOut,
  PanelLeft,
  ArrowLeft,
  AlertCircle,
  Search,
  Bell,
  LayoutGrid,
  X,
  Globe,
  ShieldCheck,
} from "lucide-react";
import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";

const ADMIN_BOOTSTRAP_EMAILS = [
  "contact@vanirgroup.com",
  "admin@vanirgroup.com",
  "vip.member@vanirgroup.com",
  "vanir.concierge@gmail.com",
  "q2w4115@gmail.com",
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
  // ── Main ──
  { icon3d: "/icons/travel-3d/DestinationsGlobe.webp", label: "Overview", path: "/admin", group: "main" },
  { icon3d: "/icons/travel-3d/SaveMoney.webp", label: "Analytics & Google", path: "/admin/analytics", group: "main" },
  { icon3d: "/icons/travel-3d/SeamlessJourney.webp", label: "AI Studio Hub", path: "/admin/ai-studio", group: "main" },
  { icon3d: "/icons/travel-3d/CameraHat.webp", label: "Social Media Studio", path: "/admin/social-media", group: "main" },

  // ── Operations ──
  { icon3d: "/icons/travel-3d/Contact.webp", label: "User Management", path: "/admin/users", group: "operations" },
  { icon3d: "/icons/travel-3d/Calendar.webp", label: "Bookings", path: "/admin/bookings", group: "operations" },
  { icon3d: "/icons/travel-3d/PlaneInBottle.webp", label: "Order & Booking Hub", path: "/admin/travel-hub", group: "operations" },
  { icon3d: "/icons/travel-3d/NotificationBell.webp", label: "Messenger Chat", path: "/admin/messages", group: "operations" },
  { icon3d: "/icons/travel-3d/Refund.webp", label: "Credits & Billing", path: "/admin/credits", group: "operations" },

  // ── Content & Media ──
  { icon3d: "/icons/travel-3d/CameraHat.webp", label: "Photo Library", path: "/admin/media", group: "content" },
  { icon3d: "/icons/travel-3d/DestinationsGlobe.webp", label: "Destinations", path: "/admin/destinations", group: "content" },
  { icon3d: "/icons/travel-3d/BadgeCheck.webp", label: "Offers & Deals", path: "/admin/offers", group: "content" },
  { icon3d: "/icons/travel-3d/PassporteVisa.webp", label: "Blog & Articles", path: "/admin/blog", group: "content" },
  { icon3d: "/icons/travel-3d/AirportParking.webp", label: "Activities", path: "/admin/activities", group: "content" },
  { icon3d: "/icons/travel-3d/CameraHat.webp", label: "Gallery", path: "/admin/gallery", group: "content" },
  { icon3d: "/icons/travel-3d/BadgeCheck.webp", label: "Reviews & GBP", path: "/admin/reviews", group: "content" },

  // ── Services & App ──
  { icon3d: "/icons/travel-3d/MobileeSim.webp", label: "Mobile App Hub", path: "/admin/mobile-app", group: "services" },
  { icon3d: "/icons/travel-3d/PlaneInBottle.webp", label: "Packages & Jets", path: "/admin/packages", group: "services" },
  { icon3d: "/icons/travel-3d/HotelBed.webp", label: "Hotel Booking", path: "/admin/hotels", group: "services" },
  { icon3d: "/icons/travel-3d/AirportTransfer.webp", label: "Transfers & Cars", path: "/admin/transfers", group: "services" },

  // ── Design ──
  { icon3d: "/icons/travel-3d/SeatingEmpty.webp", label: "Hero Section", path: "/admin/hero", group: "design" },
  { icon3d: "/icons/travel-3d/SeamlessJourney.webp", label: "Navigation Bar", path: "/admin/navbar", group: "design" },
  { icon3d: "/icons/travel-3d/PassporteVisa.webp", label: "Pages Manager", path: "/admin/pages", group: "design" },
  { icon3d: "/icons/travel-3d/CameraHat.webp", label: "Live Editor", path: "/admin/visual-editor", group: "design" },
  { icon3d: "/icons/travel-3d/BadgePlane.webp", label: "Theme & Colors", path: "/admin/theme", group: "design" },

  // ── System & Access ──
  { icon3d: "/icons/travel-3d/Contact.webp", label: "Admin Profile", path: "/admin/profile", group: "tools" },
  { icon3d: "/icons/travel-3d/SecurityShield.webp", label: "Roles & Permissions", path: "/admin/permissions", group: "tools" },
  { icon3d: "/icons/travel-3d/SecurityGate.webp", label: "SEO Manager", path: "/admin/seo", group: "tools" },
  { icon3d: "/icons/travel-3d/CabinBagBundle.webp", label: "Database", path: "/admin/database", group: "tools" },
  { icon3d: "/icons/travel-3d/BadgeCheck.webp", label: "System Health", path: "/admin/system", group: "tools" },
  { icon3d: "/icons/travel-3d/SaveMoney.webp", label: "Backup & Export", path: "/admin/backup", group: "tools" },
  { icon3d: "/icons/travel-3d/AirportParking.webp", label: "Import Data", path: "/admin/import", group: "tools" },
  { icon3d: "/icons/travel-3d/PassporteVisa.webp", label: "Audit Log", path: "/admin/audit-log", group: "tools" },
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
  const [firebaseAdminCheck, setFirebaseAdminCheck] = useState<{
    checked: boolean;
    hasFirebaseUser: boolean;
    isVerifiedAdmin: boolean;
  }>({ checked: false, hasFirebaseUser: false, isVerifiedAdmin: false });

  useEffect(() => {
    const app = getFirebaseApp();
    if (!app) {
      setFirebaseAdminCheck({ checked: true, hasFirebaseUser: false, isVerifiedAdmin: false });
      return;
    }
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setFirebaseAdminCheck({ checked: true, hasFirebaseUser: false, isVerifiedAdmin: false });
        return;
      }
      try {
        const tokenRes = await fbUser.getIdTokenResult();
        const verified = Boolean(tokenRes.claims?.admin === true) || isUserAdmin(fbUser.email);
        setFirebaseAdminCheck({ checked: true, hasFirebaseUser: true, isVerifiedAdmin: verified });
      } catch {
        setFirebaseAdminCheck({
          checked: true,
          hasFirebaseUser: true,
          isVerifiedAdmin: isUserAdmin(fbUser.email),
        });
      }
    });
    return () => unsub();
  }, []);

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

  if (loading || !firebaseAdminCheck.checked) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--theme-surface)]">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30 flex items-center justify-center">
            <img src="/icons/travel-3d/SecurityShield.webp" alt="" className="w-10 h-10 object-contain" />
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

  const isAuthorized = firebaseAdminCheck.hasFirebaseUser
    ? firebaseAdminCheck.isVerifiedAdmin
    : Boolean(user && isUserAdmin(user.email));
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--theme-surface)]">
        <div className="flex flex-col items-center gap-6 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <img src="/icons/travel-3d/SecurityShield.webp" alt="" className="w-10 h-10 object-contain" />
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = adminMenuItems.find((item) => item.path === location);
  const isMobile = useIsMobile();

  const { data: drawerBookings } = trpc.bookings.listAll.useQuery({ limit: 100, offset: 0 });
  const { data: drawerMessages } = trpc.contact.listAll.useQuery({ limit: 100, offset: 0 });
  const { data: drawerUserStats } = trpc.users.stats.useQuery();
  const drawerRevenue = Array.isArray(drawerBookings)
    ? drawerBookings.reduce((s: number, b: any) => (b.status !== "cancelled" ? s + Number(b.totalPrice || 0) : s), 0)
    : 0;
  const drawerBookingsCount = Array.isArray(drawerBookings) ? drawerBookings.length : 0;
  const drawerUnreadMsgs = Array.isArray(drawerMessages)
    ? drawerMessages.filter((m: any) => m.status === "new").length
    : 0;
  const drawerTotalUsers = drawerUserStats?.total ?? 0;

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
    <div className="flex min-h-screen w-full bg-[#090d14] text-white">
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r border-white/10 bg-[#0d1117]"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center border-b border-white/10 bg-[#0d1117]">
            <div className="flex items-center justify-between px-2.5 transition-all w-full">
              {!isCollapsed ? (
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src="/logo-vanir-v2.png"
                    alt="VANIR GROUP"
                    className="h-9 w-auto object-contain shrink-0"
                  />
                  <div className="h-5 w-px bg-white/10 shrink-0" />
                  <span className="font-semibold text-white/70 tracking-wider uppercase truncate text-[11px]">
                    Admin
                  </span>
                </div>
              ) : null}
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors focus:outline-none shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-[#C69749]" />
              </button>
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 bg-[#0d1117] overflow-y-auto">
            <SidebarMenu className="px-2 py-3">
              {(() => {
                const groups = [
                  { key: "main", label: "" },
                  { key: "operations", label: "Clients & Operations" },
                  { key: "content", label: "Content & Media" },
                  { key: "services", label: "Services & App" },
                  { key: "design", label: "Design & Layout" },
                  { key: "tools", label: "System & Access" },
                ];
                return groups.map(group => {
                  const items = adminMenuItems.filter(i => i.group === group.key);
                  if (items.length === 0) return null;
                  return (
                    <div key={group.key}>
                      {group.label && !isCollapsed && (
                        <p className="text-[10px] uppercase tracking-wider text-white/35 font-bold px-3 pt-4 pb-1">{group.label}</p>
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
                              className={`!h-13 py-2 px-2.5 gap-3.5 transition-all text-[12.5px] font-medium rounded-xl mb-1 ${
                                isActive
                                  ? "bg-gradient-to-r from-[#C69749]/20 via-[#E5C17A]/10 to-transparent text-[#E5C17A] font-semibold border border-[#C69749]/40 shadow-sm"
                                  : "text-white/80 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              <img
                                src={item.icon3d}
                                alt=""
                                className="h-10 w-10 min-h-[40px] min-w-[40px] object-contain shrink-0 drop-shadow-[0_4px_10px_rgba(0,0,0,0.75)]"
                              />
                              <span className="truncate">{item.label}</span>
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

          <SidebarFooter className="p-3 border-t border-white/10 bg-[#0d1117]">
            <SidebarMenu className="mb-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setLocation("/")}
                  tooltip="Back to website"
                  className="h-10 text-white/60 hover:text-[#D4A853] hover:bg-white/5 text-sm rounded-xl"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>العودة للموقع</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-white/5 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none">
                  <Avatar className="h-9 w-9 border border-[#D4A853]/40 shrink-0">
                    <AvatarFallback className="text-xs font-bold bg-[#D4A853]/15 text-[#D4A853]">
                      {user?.name?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-semibold truncate leading-none text-white">
                      {user?.name || "Vanir Admin"}
                    </p>
                    <p className="text-xs text-white/45 truncate mt-1">
                      Administrator
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#141923] border-white/10 text-white">
                <DropdownMenuItem
                  onClick={() => setLocation("/admin/profile")}
                  className="cursor-pointer text-white/85 focus:text-[#E5C17A] focus:bg-white/5"
                >
                  <img src="/icons/travel-3d/Contact.webp" alt="" className="mr-2 h-5 w-5 object-contain" />
                  <span>ملفي الشخصي (Profile)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLocation("/admin/permissions")}
                  className="cursor-pointer text-white/85 focus:text-[#E5C17A] focus:bg-white/5"
                >
                  <img src="/icons/travel-3d/SecurityShield.webp" alt="" className="mr-2 h-5 w-5 object-contain" />
                  <span>الأدوار والصلاحيات (Roles)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-500/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#D4A853]/30 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="bg-[#090d14] min-w-0 flex-1">
        {/* Modern Dark Luxury Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#0d1117]/95 backdrop-blur border-b border-white/10 px-4 md:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {isMobile && <SidebarTrigger className="h-9 w-9 rounded-lg bg-white/5 text-white" />}
            <div className="flex items-center gap-3 min-w-0">
              {activeMenuItem ? (
                <img src={activeMenuItem.icon3d} alt="" className="w-11 h-11 object-contain shrink-0" />
              ) : (
                <img src="/logo-vanir-v2.png" alt="VANIR" className="h-10 w-auto object-contain shrink-0" />
              )}
              <span className="font-bold text-white text-sm md:text-base truncate">
                {activeMenuItem?.label ?? "لوحة التحكم"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex items-center relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3" />
              <input
                type="text"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && quickSearch.trim()) {
                    const match = adminMenuItems.find((m) =>
                      m.label.toLowerCase().includes(quickSearch.trim().toLowerCase())
                    );
                    if (match) setLocation(match.path);
                  }
                }}
                placeholder="Search pages..."
                className="pl-9 pr-4 py-1.5 rounded-full bg-[#141923] border border-white/10 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4A853] w-56"
              />
            </div>

            <button
              type="button"
              onClick={() => setLocation("/")}
              title="العودة للموقع (بدون تسجيل خروج)"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141923] hover:bg-[#D4A853]/15 border border-[#D4A853]/40 text-xs font-semibold text-[#E5C17A] transition-colors"
            >
              <img src="/icons/travel-3d/DestinationsGlobe.webp" alt="" className="w-5 h-5 object-contain" />
              <span className="hidden sm:inline">View Site</span>
            </button>

            <button
              type="button"
              onClick={() => setLocation("/admin/ai-studio")}
              title="مركز الذكاء الاصطناعي الموحد"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141923] hover:bg-white/10 border border-[#D4A853]/30 text-xs font-semibold text-white transition-colors"
            >
              <img src="/icons/travel-3d/SeamlessJourney.webp" alt="" className="w-6 h-6 object-contain" />
              <span>AI Hub</span>
            </button>

            <button
              type="button"
              onClick={() => setLocation("/admin/messages")}
              className="w-10 h-10 rounded-full bg-[#141923] hover:bg-white/10 border border-white/10 flex items-center justify-center relative text-white/80"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {drawerUnreadMsgs > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-2 right-2" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setDrawerOpen((v) => !v)}
              className="w-10 h-10 rounded-full bg-[#141923] hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/80"
              aria-label="Quick Workspace Drawer"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto">{children}</main>
      </SidebarInset>

      {/* Right Quick Workspace Slide-Over Drawer (100% Live Data) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end" onClick={() => setDrawerOpen(false)}>
          <div
            className="w-80 bg-[#0d1117] h-full border-l border-white/10 shadow-2xl p-5 flex flex-col gap-5 overflow-y-auto text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <img src="/logo-vanir-v2.png" alt="VANIR" className="h-7 w-auto object-contain" />
                <span className="text-sm font-bold text-white">Quick Workspace</span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Revenue Card */}
            <div className="rounded-2xl p-4 bg-gradient-to-br from-[#D4A853] via-[#b8862d] to-[#8a5f17] text-black shadow-lg">
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">LIVE BOOKINGS REVENUE</p>
              <p className="text-2xl font-extrabold mt-1">${drawerRevenue.toLocaleString()}</p>
              <p className="text-[11px] font-semibold opacity-85 mt-2">{drawerBookingsCount} Total Bookings • Duffel Live</p>
            </div>

            {/* Pinned Modules with Large 3D Icons */}
            <div>
              <p className="text-xs font-bold text-white/50 mb-2.5">Quick Modules</p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "AI Hub", path: "/admin/ai-studio", icon: "/icons/travel-3d/SeamlessJourney.webp" },
                  { label: "Clients & Profiles", path: "/admin/users", icon: "/icons/travel-3d/Contact.webp" },
                  { label: "Photo Library", path: "/admin/media", icon: "/icons/travel-3d/CameraHat.webp" },
                  { label: "Hotels", path: "/admin/hotels", icon: "/icons/travel-3d/HotelBed.webp" },
                ].map((app) => (
                  <button
                    key={app.path}
                    type="button"
                    onClick={() => {
                      setLocation(app.path);
                      setDrawerOpen(false);
                    }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#141923] hover:bg-white/10 border border-white/10 transition-colors text-left"
                  >
                    <img src={app.icon} alt="" className="w-8 h-8 object-contain shrink-0" />
                    <span className="text-xs font-semibold text-white truncate">{app.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Operational Counters */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setLocation("/admin/users");
                  setDrawerOpen(false);
                }}
                className="p-3 rounded-xl bg-[#141923] hover:bg-white/10 border border-white/10 text-left transition-colors"
              >
                <p className="text-xl font-extrabold text-white">{drawerTotalUsers}</p>
                <p className="text-[10px] font-semibold text-white/50 uppercase">Registered Clients</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocation("/admin/messages");
                  setDrawerOpen(false);
                }}
                className="p-3 rounded-xl bg-[#141923] hover:bg-white/10 border border-white/10 text-left transition-colors"
              >
                <p className="text-xl font-extrabold text-[#D4A853]">{drawerUnreadMsgs}</p>
                <p className="text-[10px] font-semibold text-white/50 uppercase">New Messages</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
