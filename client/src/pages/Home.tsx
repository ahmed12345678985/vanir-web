/*
 * Design: Art Deco Luxe - Black & Gold
 * Home Page: Assembles all sections with advanced scroll transition effects
 * Color palette: Black (#0d1117), Gold (#D4A853), Light Gold (#F5E6B8)
 */
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FlightBookingBar from "@/components/FlightBookingBar";

import AboutSection from "@/components/AboutSection";
import ActivitiesSection from "@/components/ActivitiesSection";

import SEO from "@/components/SEO";
import PageMeta from "@/components/PageMeta";
import {
  AnimatedDivider,
  ScrollProgressIndicator,
} from "@/components/ScrollEffects";

const PopularPlaces = lazy(() => import("@/components/PopularPlaces"));
const DestinationsSection = lazy(() => import("@/components/DestinationsSection"));
const GallerySection = lazy(() => import("@/components/GallerySection"));
const StatsSection = lazy(() => import("@/components/StatsSection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const BlogSection = lazy(() => import("@/components/BlogSection"));
const MobileAppSection = lazy(() => import("@/components/MobileAppSection"));
const ElfsightStoreLocatorWidget = lazy(() => import("@/components/ElfsightStoreLocatorWidget"));
const Footer = lazy(() => import("@/components/Footer"));
const BackToTop = lazy(() => import("@/components/BackToTop"));

export default function Home() {
  const [showBelowFold, setShowBelowFold] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activate = () => setShowBelowFold(true);
    window.addEventListener("scroll", activate, { once: true, passive: true });
    window.addEventListener("pointerdown", activate, { once: true, passive: true });

    let observer: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window && sentinelRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            activate();
            observer?.disconnect();
          }
        },
        { rootMargin: "500px" }
      );
      observer.observe(sentinelRef.current);
    }

    const fallbackTimer = setTimeout(activate, 6500);
    return () => {
      clearTimeout(fallbackTimer);
      observer?.disconnect();
      window.removeEventListener("scroll", activate);
      window.removeEventListener("pointerdown", activate);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[var(--theme-surface)]">
      <PageMeta
        title="Vanir Group Luxury Travel - Luxury Egypt Tours, Nile Cruise Luxury & Pyramids of Egypt Tours"
        description="Vanir Group Luxury Travel curates bespoke luxury Egypt tours, Nile cruise luxury aboard private Dahabiyas, after-hours pyramids of Egypt tours, and private jet charters worldwide."
        keywords="luxury egypt tours, nile cruise luxury, pyramids of egypt tours, vanir group luxury travel, Vanir, Vanir Group, luxury travel concierge service, private jet charter, Privatjet mieten, Flugzeug chartern"
        canonicalPath="/"
      />
      <SEO
        title="Vanir Group Luxury Travel - Luxury Egypt Tours, Nile Cruise Luxury & Pyramids of Egypt Tours"
        description="Vanir Group Luxury Travel curates bespoke luxury Egypt tours, Nile cruise luxury aboard private Dahabiyas, after-hours pyramids of Egypt tours, and private jet charters worldwide."
        keywords="luxury egypt tours, nile cruise luxury, pyramids of egypt tours, vanir group luxury travel, Vanir, Vanir Group, luxury travel concierge service, private jet charter"
      />

      {/* Scroll Progress Bar */}
      <ScrollProgressIndicator />

      <Navbar />
      <HeroSection />
      <FlightBookingBar />

      {/* About Section */}
      <AboutSection />

      <AnimatedDivider style="diamond" />

      {/* Activities Section */}
      <ActivitiesSection />

      <AnimatedDivider style="gold-line" />

      <div ref={sentinelRef} />

      {showBelowFold && (
      <Suspense fallback={null}>
        {/* Popular Places */}
        <PopularPlaces />

        <AnimatedDivider style="wave" />

        {/* Destinations Section */}
        <DestinationsSection />

        <AnimatedDivider style="gold-line" />

        {/* Gallery Section */}
        <GallerySection />

        <AnimatedDivider style="wave" />

        {/* Stats Section */}
        <StatsSection />

        <AnimatedDivider style="diamond" />

        {/* Testimonials Section */}
        <TestimonialsSection />

        <AnimatedDivider style="fade" />

        {/* Blog Section */}
        <BlogSection />

        <AnimatedDivider style="gold-line" />

        {/* Official Mobile App Download Showcase */}
        <MobileAppSection />

        {/* Interactive Store & Concierge Locator Map (Home Page) */}
        <section className="py-14 bg-[var(--theme-surface)] border-t border-white/5">
          <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-2xl block mb-2">
                Find Us Worldwide
              </span>
              <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Vanir Group <span className="text-[#D4A853]">Locations &amp; Concierge</span>
              </h2>
            </div>
            <ElfsightStoreLocatorWidget />
          </div>
        </section>

        <Footer />
        <BackToTop />
      </Suspense>
      )}
    </div>
  );
}
