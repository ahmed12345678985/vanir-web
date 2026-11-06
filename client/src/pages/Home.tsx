/*
 * Design: Art Deco Luxe - Black & Gold
 * Home Page: Assembles all sections with advanced scroll transition effects
 * Color palette: Black (#0d1117), Gold (#D4A853), Light Gold (#F5E6B8)
 */
import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";

import AboutSection from "@/components/AboutSection";
import ActivitiesSection from "@/components/ActivitiesSection";

import PopularPlaces from "@/components/PopularPlaces";
import DestinationsSection from "@/components/DestinationsSection";
import GallerySection from "@/components/GallerySection";
import StatsSection from "@/components/StatsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import BlogSection from "@/components/BlogSection";
import MobileAppSection from "@/components/MobileAppSection";
import SovereignJourneyArchitect from "@/components/SovereignJourneyArchitect";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import SEO from "@/components/SEO";
import PageMeta from "@/components/PageMeta";
import {
  AnimatedDivider,
  ScrollProgressIndicator,
} from "@/components/ScrollEffects";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="relative min-h-screen bg-[var(--theme-surface)]">
      <PageMeta
        title="Vanir Group | Ultra-Luxury Travel Concierge Service & Private Jet Charter"
        description="World-class luxury travel concierge service, private jet charter (Privatjet mieten), luxury Egypt tours, and bespoke global itineraries curated by Vanir Group."
        keywords="luxury travel concierge service, luxury Egypt tours, private jet charter, Privatjet mieten, Flugzeug chartern, VANIR GROUP, Vanir Travel Group, Nile cruise, pyramids tour"
        canonicalPath="/"
      />
      <SEO
        title="Vanir Group | Ultra-Luxury Travel Concierge Service & Private Jet Charter"
        description="World-class luxury travel concierge service, private jet charter (Privatjet mieten), luxury Egypt tours, and bespoke global itineraries curated by Vanir Group."
        keywords="luxury travel concierge service, luxury Egypt tours, private jet charter, Privatjet mieten, Flugzeug chartern, VANIR GROUP, Egypt tours"
      />

      {/* Scroll Progress Bar */}
      <ScrollProgressIndicator />

      <Navbar />
      <HeroSection />

      {/* Signature Interactive Tool: The Vanir Sovereign Journey & Private Jet Architect */}
      <SovereignJourneyArchitect />

      {/* About Section */}
      <AboutSection />

      <AnimatedDivider style="diamond" />

      {/* Activities Section */}
      <ActivitiesSection />

      <AnimatedDivider style="gold-line" />

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

      <Footer />
      <BackToTop />
    </div>
  );
}
