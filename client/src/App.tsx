import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import PageLoadingSkeleton from "./components/PageLoadingSkeleton";

// Core Public Pages (synchronous for instantaneous first paint)
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import Booking from "./pages/Booking";
import Reviews from "./pages/Reviews";
import Offers from "./pages/Offers";
import CaseStudies from "./pages/CaseStudies";
import Destinations from "./pages/Destinations";
import Programs from "./pages/Programs";
import Services from "./pages/Services";
import Vanir from "./pages/Vanir";
import AIStudio from "./pages/AIStudio";
import AIImageGenerator from "./pages/AIImageGenerator";
import AIDashboard from "./pages/AIDashboard";
import AIPricingPlans from "./pages/AIPricingPlans";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AuthorProfile from "./pages/AuthorProfile";
import MarketingSuite from "./pages/MarketingSuite";
import PrivateJet from "./pages/luxury/PrivateJet";
import AdminLayout from "./components/AdminLayout";
import { PublicAIConcierge } from "./components/PublicAIConcierge";

// Lazy-loaded Secondary Luxury Pages
const Hotels = lazy(() => import("./pages/luxury/Hotels"));
const DayTrips = lazy(() => import("./pages/luxury/DayTrips"));
const MICEPage = lazy(() => import("./pages/luxury/MICE"));
const FastTrack = lazy(() => import("./pages/luxury/FastTrack"));
const Visa = lazy(() => import("./pages/luxury/Visa"));
const ESim = lazy(() => import("./pages/luxury/ESim"));
const FlightsBooking = lazy(() => import("./pages/luxury/FlightsBooking"));
const HotelsBooking = lazy(() => import("./pages/luxury/HotelsBooking"));
const Tours = lazy(() => import("./pages/luxury/Tours"));
const Insurance = lazy(() => import("./pages/luxury/Insurance"));
const Groups = lazy(() => import("./pages/luxury/Groups"));
const LuxuryNews = lazy(() => import("./pages/luxury/News"));
const Affiliated = lazy(() => import("./pages/luxury/Affiliated"));
const Packages = lazy(() => import("./pages/luxury/Packages"));
const ComponentShowcase = lazy(() => import("./pages/ComponentShowcase"));

// Lazy-loaded Marketing Generator Pages
const SocialMediaGenerator = lazy(() => import("./pages/marketing/SocialMediaGenerator"));
const EmailGenerator = lazy(() => import("./pages/marketing/EmailGenerator"));
const TripDescriptionGenerator = lazy(() => import("./pages/marketing/TripDescriptionGenerator"));
const BlogSEOGenerator = lazy(() => import("./pages/marketing/BlogSEOGenerator"));
const AdCopyGenerator = lazy(() => import("./pages/marketing/AdCopyGenerator"));
const ContentCalendar = lazy(() => import("./pages/marketing/ContentCalendar"));

// Lazy-loaded Admin Pages (Isolated bundle - 0KB on public site load)
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboardEnhanced = lazy(() => import("./pages/admin/AdminDashboardEnhanced"));
const AnalyticsAdmin = lazy(() => import("./pages/admin/AnalyticsAdmin"));
const DestinationsAdmin = lazy(() => import("./pages/admin/DestinationsAdmin"));
const OffersAdmin = lazy(() => import("./pages/admin/OffersAdmin"));
const BlogAdmin = lazy(() => import("./pages/admin/BlogAdmin"));
const ActivitiesAdmin = lazy(() => import("./pages/admin/ActivitiesAdmin"));
const AdminGallery = lazy(() => import("./pages/admin/AdminGallery"));
const ReviewsAdmin = lazy(() => import("./pages/admin/ReviewsAdmin"));
const BookingsAdmin = lazy(() => import("./pages/admin/BookingsAdmin"));
const MessagesAdmin = lazy(() => import("./pages/admin/MessagesAdmin"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const CreditsAdmin = lazy(() => import("./pages/admin/CreditsAdmin"));
const HeroAdmin = lazy(() => import("./pages/admin/HeroAdmin"));
const NavbarAdmin = lazy(() => import("./pages/admin/NavbarAdmin"));
const PagesAdmin = lazy(() => import("./pages/admin/PagesAdmin"));
const AdminAIStudio = lazy(() => import("./pages/admin/AdminAIStudio"));
const AdminPackages = lazy(() => import("./pages/admin/AdminPackages"));
const SettingsAdmin = lazy(() => import("./pages/admin/SettingsAdmin"));
const PermissionsAdmin = lazy(() => import("./pages/admin/PermissionsAdmin"));
const AuditLogAdmin = lazy(() => import("./pages/admin/AuditLogAdmin"));
const TestimonialsAdmin = lazy(() => import("./pages/admin/TestimonialsAdmin"));
const ThemeAdmin = lazy(() => import("./pages/admin/ThemeAdmin"));
const SEOAdmin = lazy(() => import("./pages/admin/SEOAdmin"));
const MediaLibrary = lazy(() => import("./pages/admin/MediaLibrary"));
const BackupExport = lazy(() => import("./pages/admin/BackupExport"));
const ImportData = lazy(() => import("./pages/admin/ImportData"));
const AICommandCenter = lazy(() => import("./pages/admin/AICommandCenter"));
const LiveVisualEditor = lazy(() => import("./pages/admin/LiveVisualEditor"));
const DatabaseManagerAdmin = lazy(() => import("./pages/admin/DatabaseManagerAdmin"));
const SystemMonitorAdmin = lazy(() => import("./pages/admin/SystemMonitorAdmin"));

function AdminPortal() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={AdminDashboardEnhanced} />
        <Route path="/admin/analytics" component={AnalyticsAdmin} />
        <Route path="/admin/destinations" component={DestinationsAdmin} />
        <Route path="/admin/packages" component={AdminPackages} />
        <Route path="/admin/offers" component={OffersAdmin} />
        <Route path="/admin/blog" component={BlogAdmin} />
        <Route path="/admin/activities" component={ActivitiesAdmin} />
        <Route path="/admin/gallery" component={AdminGallery} />
        <Route path="/admin/reviews" component={ReviewsAdmin} />
        <Route path="/admin/bookings" component={BookingsAdmin} />
        <Route path="/admin/messages" component={MessagesAdmin} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/credits" component={CreditsAdmin} />
        <Route path="/admin/hero" component={HeroAdmin} />
        <Route path="/admin/navbar" component={NavbarAdmin} />
        <Route path="/admin/pages" component={PagesAdmin} />
        <Route path="/admin/ai-studio" component={AdminAIStudio} />
        <Route path="/admin/settings" component={SettingsAdmin} />
        <Route path="/admin/permissions" component={PermissionsAdmin} />
        <Route path="/admin/audit-log" component={AuditLogAdmin} />
        <Route path="/admin/testimonials" component={TestimonialsAdmin} />
        <Route path="/admin/theme" component={ThemeAdmin} />
        <Route path="/admin/seo" component={SEOAdmin} />
        <Route path="/admin/media" component={MediaLibrary} />
        <Route path="/admin/backup" component={BackupExport} />
        <Route path="/admin/import" component={ImportData} />
        <Route path="/admin/ai-command" component={AICommandCenter} />
        <Route path="/admin/visual-editor" component={LiveVisualEditor} />
        <Route path="/admin/database" component={DatabaseManagerAdmin} />
        <Route path="/admin/system" component={SystemMonitorAdmin} />
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoadingSkeleton variant="hero" />}>
      <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/about"} component={About} />
      <Route path={"/team"} component={AuthorProfile} />
      <Route path={"/author/ahmed-roshdi"} component={AuthorProfile} />
      <Route path={"/author/:slug"} component={AuthorProfile} />
      <Route path={"/gallery"} component={Gallery} />
      <Route path={"/booking"} component={Booking} />
      <Route path={"/reviews"} component={Reviews} />
      <Route path={"/offers"} component={Offers} />
      <Route path={"/case-studies"} component={CaseStudies} />
      <Route path={"/destinations"} component={Destinations} />
      <Route path={"/destinations/:slug"} component={Destinations} />
      <Route path={"/programs"} component={Programs} />
      <Route path={"/services"} component={Services} />
      <Route path={"/vanir"} component={Vanir} />
      <Route path={"/ai"} component={AIStudio} />
      <Route path={"/ai-studio"} component={AIStudio} />
      <Route path={"/ai-image-generator"} component={AIImageGenerator} />
      <Route path={"/ai-dashboard"} component={AIDashboard} />
      <Route path={"/ai-pricing"} component={AIStudio} />
      <Route path={"/pricing"} component={AIPricingPlans} />
      <Route path={"/ai-plans"} component={AIPricingPlans} />
      <Route path={"/login"} component={Login} />
      <Route path={"/signup"} component={Login} />
      <Route path={"/sign-in"} component={Login} />
      <Route path={"/sign-up"} component={Login} />
      <Route path={"/register"} component={Login} />

      <Route path={"/profile"} component={Profile} />
      <Route path={"/privacy-policy"} component={PrivacyPolicy} />
      <Route path={"/terms-of-service"} component={TermsOfService} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/:slug"} component={BlogPost} />
      <Route path={"/marketing"} component={MarketingSuite} />
      <Route path={"/marketing/social-media"} component={SocialMediaGenerator} />
      <Route path={"/marketing/email"} component={EmailGenerator} />
      <Route path={"/marketing/trip-description"} component={TripDescriptionGenerator} />
      <Route path={"/marketing/blog-seo"} component={BlogSEOGenerator} />
      <Route path={"/marketing/ad-copy"} component={AdCopyGenerator} />
      <Route path={"/marketing/calendar"} component={ContentCalendar} />
      <Route path={"/components"} component={ComponentShowcase} />

      {/* Luxury Service Pages */}
      <Route path={"/hotels"} component={Hotels} />
      <Route path={"/day-trips"} component={DayTrips} />
      <Route path={"/mice"} component={MICEPage} />
      <Route path={"/private-jet"} component={PrivateJet} />
      <Route path={"/fast-track"} component={FastTrack} />
      <Route path={"/visa"} component={Visa} />
      <Route path={"/esim"} component={ESim} />
      <Route path={"/flights-booking"} component={FlightsBooking} />
      <Route path={"/hotels-booking"} component={HotelsBooking} />
      <Route path={"/tours"} component={Tours} />
      <Route path={"/insurance"} component={Insurance} />
      <Route path={"/groups"} component={Groups} />
      <Route path={"/news"} component={LuxuryNews} />
      <Route path={"/affiliated"} component={Affiliated} />
      <Route path={"/packages"} component={Packages} />

      {/* Admin Login (outside admin layout) */}
      <Route path="/admin/login" component={AdminLogin} />

      {/* Admin Portal (AdminLayout stays mounted, smooth tab navigation) */}
      <Route path="/admin" component={AdminPortal} />
      <Route path="/admin/:subpath*" component={AdminPortal} />

      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        {/* <PromoNotifications /> */} {/* Disabled: Removed popup notifications and offers */}
        <Router />
        <PublicAIConcierge />
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
