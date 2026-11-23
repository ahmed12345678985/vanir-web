/*
 * Design: Misty Dark Theme
 * Navbar: Fully responsive design with mobile-first approach
 * White links with gold hover, glass-blur background on scroll
 */
import { useState, useEffect, useRef } from "react";
import { Search, Menu, X, ChevronDown, MoreHorizontal, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { ASSETS } from "@/config/assets";

/* ─── Navigation Structure ─── */
interface NavLink {
  label: string;
  href: string;
}

interface NavGroup {
  label: string;
  children: NavLink[];
}

type NavItem = NavLink | NavGroup;

function isGroup(item: NavItem): item is NavGroup {
  return "children" in item;
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [location] = useLocation();
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const isAdminUser = Boolean(
    user && (
      user.role === "admin" ||
      (user.email && (
        ["contact@vanirgroup.com", "admin@vanirgroup.com", "vip.member@vanirgroup.com", "vanir.concierge@gmail.com", "q2w4115@gmail.com", "ahmedroshdi@gmail.com", "roshdi@vanirgroup.com"].includes(user.email.trim().toLowerCase()) ||
        user.email.trim().toLowerCase().endsWith("@vanirgroup.com")
      ))
    )
  );

  const isHome = location === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Main navigation items
  const mainNavItems: NavItem[] = [
    { label: "New Booking", href: "/travel-booking" },
    { label: "Home", href: isHome ? "#" : "/" },
    { label: "Flights", href: "/flights-booking" },
    { label: "Hotels", href: "/hotels-booking" },
    { label: "Villas", href: "/villas" },
    {
      label: "Destinations",
      children: [
        { label: "All Destinations", href: "/destinations" },
        { label: "Egypt & Private Nile", href: "/destinations/egypt" },
        { label: "Dubai & Emirates", href: "/destinations/dubai" },
        { label: "Maldives Private Atolls", href: "/destinations/maldives" },
        { label: "Switzerland & Alps", href: "/destinations/switzerland" },
        { label: "Greece & Cyclades", href: "/destinations/greece" },
        { label: "Italy & Amalfi Coast", href: "/destinations/italy" },
      ],
    },
    {
      label: "Experiences",
      children: [
        { label: "Curated Luxury Packages", href: "/packages" },
        { label: "Private Jet Charter", href: "/private-jet" },
        { label: "VIP Airport Fast Track", href: "/fast-track" },
        { label: "Nile Cruises & Heritage Tours", href: "/tours" },
        { label: "Private Day Trips", href: "/day-trips" },
        { label: "MICE & Corporate Retreats", href: "/mice" },
        { label: "Private Group Travel", href: "/groups" },
      ],
    },
    {
      label: "AI Studio",
      children: [
        { label: "AI Travel Intelligence", href: "/ai" },
        { label: "3D AI Image Studio", href: "/ai-image-generator" },
        { label: "Marketing AI Suite", href: "/marketing" },
        { label: "AI Dashboard", href: "/ai-dashboard" },
        { label: "Pricing & Plans", href: "/pricing" },
      ],
    },
  ];

  // More menu items (shown in "More" dropdown)
  const moreMenuItems: NavItem[] = [
    {
      label: "House of Vanir",
      children: [
        { label: "About Vanir Group", href: "/about" },
        { label: "Founder & Executive Team", href: "/team" },
        { label: "Case Studies & Mission Logs", href: "/case-studies" },
        { label: "Client Reviews (4.9★)", href: "/reviews" },
        { label: "Visual Gallery", href: "/gallery" },
        { label: "Luxury Chronicle & Blog", href: "/blog" },
        { label: "Exclusive Offers", href: "/offers" },
      ],
    },
    {
      label: "Travel Essentials",
      children: [
        { label: "Diplomatic Visa Assistance", href: "/visa" },
        { label: "Global Ultra-Speed eSIM", href: "/esim" },
        { label: "VIP Travel Insurance", href: "/insurance" },
        { label: "Affiliated Luxury Network", href: "/affiliated" },
        { label: "Programs & Itineraries", href: "/programs" },
        { label: "Concierge Services", href: "/services" },
      ],
    },
    {
      label: "Direct Concierge",
      children: [
        { label: "Direct Booking", href: "/booking" },
        { label: "24/7 Aviation Desk", href: "/contact" },
        { label: "Media & Press", href: "/news" },
      ],
    },
  ];

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setOpenDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  const isActiveLink = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && href !== "#" && location === href) return true;
    return false;
  };

  const isGroupActive = (group: NavGroup) => {
    return group.children.some((child) => isActiveLink(child.href));
  };

  return (
    <>
      {/* Main navbar - transparent overlay on home, sticky on other pages */}
      <nav
        className={`w-full z-50 transition-all duration-500 backdrop-blur-md ${
          isHome
            ? scrolled
              ? "fixed top-0 left-0 right-0 bg-slate-900/95 shadow-lg shadow-black/20 border-b border-white/10"
              : "absolute top-0 left-0 right-0 bg-gradient-to-b from-amber-950/30 via-slate-900/20 to-transparent border-b border-transparent"
            : scrolled
            ? "sticky top-0 bg-slate-900/95 shadow-lg shadow-black/20 border-b border-white/10"
            : "sticky top-0 bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 flex items-center justify-between gap-2 py-3 sm:py-4 md:py-5">
          {/* Logo + Brand Name */}
          <a href="/" aria-label="VANIR GROUP Home" className="flex items-center gap-1.5 sm:gap-2 shrink-0 group">
            <div className="relative inline-flex items-center">
              <img
                src={ASSETS.LOGO_WATERMARK}
                alt=""
                className="h-9 sm:h-10 md:h-11 lg:h-12 w-auto object-contain"
              />
              {/* Animated White Santa Hat perched on the Logo */}
              <svg
                viewBox="0 0 64 56"
                aria-hidden="true"
                className="pointer-events-none absolute -top-3.5 -right-2.5 sm:-top-4 sm:-right-3 w-7 h-7 sm:w-8 sm:h-8 drop-shadow-[0_3px_8px_rgba(255,255,255,0.45)] origin-bottom-left"
                style={{
                  animation: "vanirSantaBob 3.2s ease-in-out infinite",
                }}
              >
                <defs>
                  <linearGradient id="santaWhiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="65%" stopColor="#F1F5F9" />
                    <stop offset="100%" stopColor="#CBD5E1" />
                  </linearGradient>
                  <linearGradient id="santaRedTrim" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#DC2626" />
                    <stop offset="50%" stopColor="#EF4444" />
                    <stop offset="100%" stopColor="#991B1B" />
                  </linearGradient>
                </defs>
                {/* Hat Body (White Velvet) */}
                <path
                  d="M12 36 C16 14, 34 6, 52 16 C44 18, 42 26, 44 36 Z"
                  fill="url(#santaWhiteGrad)"
                  stroke="#E2E8F0"
                  strokeWidth="1.2"
                />
                {/* Subtle Crimson Festive Ribbon Accent */}
                <path
                  d="M12.5 34.5 Q28 30 43.5 34.5 L44 37.5 Q28 33 12 37.5 Z"
                  fill="url(#santaRedTrim)"
                />
                {/* Fluffy White Fur Cuff */}
                <rect
                  x="7"
                  y="35"
                  width="40"
                  height="10"
                  rx="5"
                  fill="#FFFFFF"
                  stroke="#E2E8F0"
                  strokeWidth="1.2"
                />
                {/* Fluffy Pom-Pom */}
                <circle
                  cx="53"
                  cy="17"
                  r="6"
                  fill="#FFFFFF"
                  stroke="#E2E8F0"
                  strokeWidth="1.2"
                />
              </svg>
              <style>{`
                @keyframes vanirSantaBob {
                  0%, 100% { transform: rotate(10deg) translateY(0px) scale(1); }
                  35% { transform: rotate(18deg) translateY(-2.5px) scale(1.04); }
                  70% { transform: rotate(6deg) translateY(1px) scale(0.98); }
                }
              `}</style>
            </div>
            <span className="text-white font-bold text-sm sm:text-base md:text-lg lg:text-xl tracking-[0.1em] font-[var(--font-display)] group-hover:text-[var(--theme-primary)] transition-colors duration-300 hidden sm:inline">
              VANIR<span className="text-[var(--theme-primary)] group-hover:text-white transition-colors duration-300"> GROUP</span>
            </span>
          </a>

          {/* Desktop nav links - hidden on md and below */}
          <div className="hidden lg:flex flex-1 justify-center items-center gap-0.5 xl:gap-1 min-w-0">
            {mainNavItems.map((item) =>
              isGroup(item) ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter(item.label)}
                  onMouseLeave={handleDropdownLeave}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className={`flex items-center gap-0.5 px-1.5 xl:px-2 py-1.5 text-[11px] xl:text-[12.5px] font-medium tracking-tight uppercase transition-all duration-300 whitespace-nowrap ${
                      isGroupActive(item) || openDropdown === item.label
                        ? "text-[var(--theme-primary)]"
                        : "text-white/80 hover:text-white"
                    }`}
                    onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                  >
                    {item.label}
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-300 ${
                        openDropdown === item.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {openDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                        exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-1 min-w-[200px] xl:min-w-[220px] origin-top z-50"
                        onMouseEnter={() => handleDropdownEnter(item.label)}
                        onMouseLeave={handleDropdownLeave}
                      >
                        <div className="glass-card rounded-lg shadow-xl shadow-black/40 overflow-hidden">
                          <div className="h-[2px] bg-gradient-to-r from-[var(--theme-primary)] via-[var(--theme-primary-light)] to-[var(--theme-primary)]" />
                          <div className="py-2">
                            {item.children.map((child) => (
                              <a
                                key={child.label}
                                href={child.href}
                                onClick={() => setOpenDropdown(null)}
                                className={`group flex items-center px-4 py-2 text-xs font-medium tracking-tight transition-all duration-300 ${
                                  isActiveLink(child.href)
                                    ? "text-[var(--theme-primary)] bg-[var(--theme-primary)]/10"
                                    : "text-white/80 hover:text-white hover:bg-white/5"
                                }`}
                              >
                                <span
                                  className={`w-1 h-1 rounded-full mr-2 transition-all duration-300 ${
                                    isActiveLink(child.href)
                                      ? "bg-[var(--theme-primary)]"
                                      : "bg-white/20 group-hover:bg-[var(--theme-primary)]"
                                  }`}
                                />
                                {child.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className={`relative px-1.5 xl:px-2 py-1.5 text-[11px] xl:text-[12.5px] font-medium tracking-tight uppercase transition-all duration-300 group whitespace-nowrap ${
                    isActiveLink(item.href)
                      ? "text-[var(--theme-primary)]"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-2 xl:left-2.5 right-2 xl:right-2.5 h-[1px] bg-[var(--theme-primary)] transition-all duration-300 ${
                      isActiveLink(item.href) ? "w-[calc(100%-1rem)] xl:w-[calc(100%-1.25rem)]" : "w-0 group-hover:w-[calc(100%-1rem)] xl:group-hover:w-[calc(100%-1.25rem)]"
                    }`}
                  />
                </a>
              )
            )}

            {/* More menu dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleDropdownEnter("more")}
              onMouseLeave={handleDropdownLeave}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={`flex items-center gap-0.5 px-1.5 xl:px-2 py-1.5 text-xs xl:text-sm font-medium tracking-tight transition-all duration-300 ${
                  openDropdown === "more"
                    ? "text-[var(--theme-primary)]"
                    : "text-white/80 hover:text-white"
                }`}
                onClick={() => setOpenDropdown(openDropdown === "more" ? null : "more")}
                title="More options"
              >
                <MoreHorizontal size={16} />
              </button>

              <AnimatePresence>
                {openDropdown === "more" && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full right-0 mt-1 min-w-[200px] origin-top z-50"
                    onMouseEnter={() => handleDropdownEnter("more")}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <div className="glass-card rounded-lg shadow-xl shadow-black/40 overflow-hidden">
                      <div className="h-[2px] bg-gradient-to-r from-[var(--theme-primary)] via-[var(--theme-primary-light)] to-[var(--theme-primary)]" />
                      <div className="py-2">
                        {moreMenuItems.map((item) =>
                          isGroup(item) ? (
                            <div key={item.label}>
                              <div className="px-4 py-2 text-xs font-bold text-[var(--theme-primary)] uppercase tracking-tight border-b border-white/10">
                                {item.label}
                              </div>
                              {item.children.map((child) => (
                                <a
                                  key={child.label}
                                  href={child.href}
                                  onClick={() => setOpenDropdown(null)}
                                  className={`group flex items-center px-4 py-2 text-xs font-medium tracking-tight transition-all duration-300 ${
                                    isActiveLink(child.href)
                                      ? "text-[var(--theme-primary)] bg-[var(--theme-primary)]/10"
                                      : "text-white/80 hover:text-white hover:bg-white/5"
                                  }`}
                                >
                                  <span
                                    className={`w-1 h-1 rounded-full mr-2 transition-all duration-300 ${
                                      isActiveLink(child.href)
                                        ? "bg-[var(--theme-primary)]"
                                        : "bg-white/20 group-hover:bg-[var(--theme-primary)]"
                                    }`}
                                  />
                                  {child.label}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <a
                              key={item.label}
                              href={item.href}
                              onClick={() => setOpenDropdown(null)}
                              className={`group flex items-center px-4 py-2 text-xs font-medium tracking-tight transition-all duration-300 ${
                                isActiveLink(item.href)
                                  ? "text-[var(--theme-primary)] bg-[var(--theme-primary)]/10"
                                  : "text-white/80 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              <span
                                className={`w-1 h-1 rounded-full mr-2 transition-all duration-300 ${
                                  isActiveLink(item.href)
                                    ? "bg-[var(--theme-primary)]"
                                    : "bg-white/20 group-hover:bg-[var(--theme-primary)]"
                                }`}
                              />
                              {item.label}
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right actions - compressed for mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Search */}
            <button
              type="button"
              aria-label="Search"
              className="text-white/50 hover:text-white transition-colors p-1 shrink-0"
            >
              <Search size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>

            {/* Quick Admin Panel Button for Admins */}
            {isAuthenticated && isAdminUser && (
              <a
                href="/admin"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141923] border border-[#D4A853] text-[#E5C17A] hover:bg-[#D4A853] hover:text-black text-xs font-bold transition-all duration-300 whitespace-nowrap shrink-0 shadow-sm"
              >
                <img src="/icons/travel-3d/SecurityGate.webp" alt="" className="w-4 h-4 object-contain shrink-0" />
                <span>Admin</span>
              </a>
            )}

            {/* Auth-aware Login/Profile Button - hidden on sm and below */}
            {isAuthenticated ? (
              <div
                className="relative hidden md:block"
                onMouseEnter={() => handleDropdownEnter("user-menu")}
                onMouseLeave={handleDropdownLeave}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="flex items-center gap-1.5 px-2 lg:px-2.5 py-1.5 text-white text-xs lg:text-sm font-medium tracking-tight hover:text-[var(--theme-primary)] transition-all duration-300 whitespace-nowrap"
                  onClick={() => setOpenDropdown(openDropdown === "user-menu" ? null : "user-menu")}
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover border border-[var(--theme-primary)]/30" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[var(--theme-primary)]/20 flex items-center justify-center">
                      <User size={12} className="text-[var(--theme-primary)]" />
                    </div>
                  )}
                  <span className="hidden lg:inline">{user?.name?.split(" ")[0] || "Profile"}</span>
                  <ChevronDown size={12} className={`transition-transform duration-300 ${openDropdown === "user-menu" ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openDropdown === "user-menu" && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                      animate={{ opacity: 1, y: 0, scaleY: 1 }}
                      exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full right-0 mt-1 w-[275px] origin-top z-50"
                      onMouseEnter={() => handleDropdownEnter("user-menu")}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <div className="glass-card rounded-xl shadow-2xl shadow-black/60 border border-[var(--theme-primary)]/25 overflow-hidden bg-[#0d1117]/95">
                        <div className="h-[2px] bg-gradient-to-r from-[var(--theme-primary)] via-[var(--theme-primary-light)] to-[var(--theme-primary)]" />
                        {/* Account Header */}
                        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--theme-primary)] to-[#b88933] flex items-center justify-center text-black font-bold text-xs shrink-0 overflow-hidden">
                            {user?.avatarUrl ? (
                              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              (user?.name || "V").charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{user?.name || "Vanir Traveler"}</p>
                            <p className="text-[11px] text-white/50 truncate">{user?.email || ""}</p>
                          </div>
                        </div>

                        {/* Mobile App Promo Mini Card */}
                        <a
                          href="/#mobile-app"
                          onClick={() => setOpenDropdown(null)}
                          className="mx-3 my-2.5 p-2.5 rounded-lg bg-white/[0.04] border border-white/10 hover:border-[var(--theme-primary)]/40 flex items-center justify-between gap-2 transition-colors"
                        >
                          <div>
                            <p className="text-[11px] font-semibold text-[var(--theme-primary)]">Vanir Mobile App</p>
                            <p className="text-[10px] text-white/50">Instant boarding passes &amp; VIP alerts</p>
                          </div>
                          <span className="text-[10px] px-2 py-1 rounded bg-[var(--theme-primary)]/15 text-[var(--theme-primary)] font-semibold shrink-0">
                            Get App
                          </span>
                        </a>

                        <div className="py-1.5">
                          <a
                            href="/profile?tab=bookings"
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-white/85 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <img src="/icons/travel-3d/PlaneInBottle.webp" alt="" className="w-4 h-4 object-contain" />
                            My Trips &amp; Bookings
                          </a>
                          <a
                            href="/profile?tab=settings"
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-white/85 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <img src="/icons/travel-3d/NotificationBell.webp" alt="" className="w-4 h-4 object-contain" />
                            Account Settings
                          </a>
                          <a
                            href="/profile?tab=travelers"
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-white/85 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <img src="/icons/travel-3d/PassporteVisa.webp" alt="" className="w-4 h-4 object-contain" />
                            Saved Travelers
                          </a>
                          <a
                            href="/profile?tab=flight_preferences"
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-white/85 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <img src="/icons/travel-3d/SeatingEmpty.webp" alt="" className="w-4 h-4 object-contain" />
                            Flight Preferences
                          </a>
                          <a
                            href="/profile?tab=privacy"
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-white/85 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <img src="/icons/travel-3d/SecurityShield.webp" alt="" className="w-4 h-4 object-contain" />
                            Privacy &amp; Security
                          </a>
                          <a
                            href="/ai-dashboard"
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-white/85 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <img src="/icons/travel-3d/BadgeCheck.webp" alt="" className="w-4 h-4 object-contain" />
                            AI Concierge &amp; Credits
                          </a>
                          {isAdminUser && (
                            <a
                              href="/admin"
                              onClick={() => setOpenDropdown(null)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[var(--theme-primary)] hover:bg-white/5 transition-colors"
                            >
                              <img src="/icons/travel-3d/SecurityGate.webp" alt="" className="w-4 h-4 object-contain" />
                              Admin Panel
                            </a>
                          )}
                          <div className="border-t border-white/10 mt-1.5 pt-1.5">
                            <button
                              onClick={async () => { setOpenDropdown(null); await logout(); window.location.href = "/"; }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-400/90 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <LogOut size={14} />
                              Sign Out
                            </button>
                          </div>
                          <div className="border-t border-white/10 mt-1 pt-2 px-4 pb-1 flex items-center justify-between text-[10px] text-white/40">
                            <a href="/privacy-policy" onClick={() => setOpenDropdown(null)} className="hover:text-white/70">Privacy Policy</a>
                            <a href="/terms-of-service" onClick={() => setOpenDropdown(null)} className="hover:text-white/70">Terms</a>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <a
                href="/login"
                className="hidden md:inline-flex items-center px-2 lg:px-2.5 py-1.5 text-white text-xs lg:text-sm font-medium tracking-tight hover:text-[var(--theme-primary)] transition-all duration-300 whitespace-nowrap"
              >
                Login
              </a>
            )}

            {/* Request Quote Button - hidden on sm and below */}
            <a
              href="/contact"
              className="hidden md:inline-flex items-center px-2 lg:px-2.5 py-1.5 border border-white/20 text-white text-xs lg:text-sm font-medium tracking-tight rounded hover:bg-white hover:text-[var(--theme-surface)] transition-all duration-300 whitespace-nowrap"
            >
              Quote
            </a>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden text-white p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden bg-[var(--theme-surface)]/95 backdrop-blur-xl border-t border-white/5"
            >
              <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col gap-1">
                {[...mainNavItems, ...moreMenuItems].map((item) =>
                  isGroup(item) ? (
                    <div key={item.label}>
                      <button
                        onClick={() =>
                          setMobileExpanded(mobileExpanded === item.label ? null : item.label)
                        }
                        className={`w-full flex items-center justify-between py-3 text-sm sm:text-base font-medium tracking-tight uppercase border-b border-white/5 transition-colors duration-300 ${
                          mobileExpanded === item.label || isGroupActive(item)
                            ? "text-[var(--theme-primary)]"
                            : "text-white hover:text-white/80"
                        }`}
                      >
                        {item.label}
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-300 ${
                            mobileExpanded === item.label ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {mobileExpanded === item.label && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 py-2 space-y-1 border-b border-white/5">
                              {item.children.map((child) => (
                                <a
                                  key={child.label}
                                  href={child.href}
                                  onClick={() => {
                                    setMobileOpen(false);
                                    setMobileExpanded(null);
                                  }}
                                  className={`flex items-center gap-2 py-3 text-sm font-medium tracking-tight transition-colors duration-300 ${
                                    isActiveLink(child.href)
                                      ? "text-[var(--theme-primary)]"
                                      : "text-white/70 hover:text-white"
                                  }`}
                                >
                                  <span
                                    className={`w-0.5 h-0.5 rounded-full ${
                                      isActiveLink(child.href)
                                        ? "bg-[var(--theme-primary)]"
                                        : "bg-white/30"
                                    }`}
                                  />
                                  {child.label}
                                </a>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`py-3 text-sm sm:text-base font-medium tracking-tight uppercase border-b border-white/5 transition-colors duration-300 ${
                        isActiveLink(item.href)
                          ? "text-[var(--theme-primary)]"
                          : "text-white hover:text-white/80"
                      }`}
                    >
                      {item.label}
                    </a>
                  )
                )}
                {isAuthenticated ? (
                  <>
                    {isAdminUser && (
                      <a
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 py-3 text-sm sm:text-base font-bold tracking-tight uppercase border-b border-white/5 text-[#E5C17A] transition-colors duration-300"
                      >
                        <img src="/icons/travel-3d/SecurityGate.webp" alt="" className="w-5 h-5 object-contain" />
                        <span>Admin Panel</span>
                      </a>
                    )}
                    <a
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="py-3 text-sm sm:text-base font-medium tracking-tight uppercase border-b border-white/5 text-[var(--theme-primary)] transition-colors duration-300"
                    >
                      My Profile
                    </a>
                    <button
                      onClick={async () => { setMobileOpen(false); await logout(); window.location.href = "/"; }}
                      className="py-3 text-sm sm:text-base font-medium tracking-tight uppercase border-b border-white/5 text-red-400 hover:text-red-300 transition-colors duration-300 text-left"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <a
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="py-2 text-xs font-medium tracking-tight uppercase border-b border-white/5 text-white hover:text-white/80 transition-colors duration-300"
                  >
                    Login
                  </a>
                )}
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-3 py-2 border border-white/20 text-white text-xs font-medium tracking-tight rounded hover:bg-white hover:text-[var(--theme-surface)] transition-all duration-300 mt-2 w-full"
                >
                  Request A Quote
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
