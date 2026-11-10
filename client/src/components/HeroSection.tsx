/*
 * Design: Art Deco Luxe - Dynamic Theme Colors & Background Slider
 * Features: Multi-image automatic background slider, navigation controls,
 * uploaded media display, and responsive luxury styling without forced text.
 */
import { ChevronLeft, ChevronRight, Facebook, Instagram } from "lucide-react";
import { useRef, useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useThemeColors } from "@/contexts/ThemeColorsProvider";
import { trpc } from "@/lib/trpc";
import { applyLuxuryImageFallback } from "@/lib/imageFallback";
import { useIsMobile } from "@/hooks/useMobile";

/* ── Color utility for opacity-safe color mixing ── */
const colorMix = (color: string, percentage: number): string => {
  return `color-mix(in srgb, ${color} ${percentage}%, transparent)`;
};

const isVideoUrl = (url?: string): boolean => {
  if (!url) return false;
  return /\.(mp4|webm)(\?|$)/i.test(url);
};

const DEFAULT_SLIDES = [
  "/images/The_Nile_River_at_Cairo.jpg",
  "/images/final_cairo_post.png",
  "https://images.unsplash.com/photo-1539650116574-75c0c6d73c0e?w=1600&q=80",
];

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { colors } = useThemeColors();
  const [heroData, setHeroData] = useState<any>(null);
  const [heroImages, setHeroImages] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch hero data from admin
  const { data: savedHeroData } = trpc.siteSettings.get.useQuery(
    { category: "hero", key: "hero_settings" },
    { staleTime: 60000, refetchOnWindowFocus: false }
  );
  const { data: savedLegacyHeroData } = trpc.siteSettings.get.useQuery(
    { category: "hero", key: "hero_data" },
    { staleTime: 60000, refetchOnWindowFocus: false }
  );

  // Fetch hero images from admin
  const { data: savedHeroImages } = trpc.siteSettings.get.useQuery(
    { category: "hero", key: "hero_images" },
    { staleTime: 60000, refetchOnWindowFocus: false }
  );

  useEffect(() => {
    const payload = savedHeroData || savedLegacyHeroData;
    if (payload) {
      try {
        const parsed = JSON.parse(payload);
        setHeroData(parsed);
      } catch (e) {
        console.error("Failed to parse hero data:", e);
      }
    }
  }, [savedHeroData, savedLegacyHeroData]);

  useEffect(() => {
    if (savedHeroImages) {
      try {
        const parsed = JSON.parse(savedHeroImages);
        if (Array.isArray(parsed)) setHeroImages(parsed);
      } catch (e) {}
    }
  }, [savedHeroImages]);

  // Determine active background display mode:
  // "static-image" -> single fixed image, no slider timer, no arrows, no dots
  // "dynamic-slider" -> multi-image slider with transitions and controls
  // "html5-video" -> background looping video
  const bgType = heroData?.backgroundType || (heroData?.mediaType === "video" ? "html5-video" : "static-image");
  const isSlider = bgType === "dynamic-slider";
  const isVideoMode = bgType === "html5-video";
  const isStatic = bgType === "static-image" || (!isSlider && !isVideoMode);

  // Build the list of images strictly according to the chosen mode:
  const slides = useMemo<string[]>(() => {
    // 1. Static Image Mode: Strictly ONE image. Never rotate or slide.
    if (isStatic) {
      if (heroData?.mediaUrl && typeof heroData.mediaUrl === "string" && heroData.mediaUrl.trim() !== "") {
        return [heroData.mediaUrl.trim()];
      }
      if (Array.isArray(heroImages) && heroImages.length > 0 && heroImages[0]?.url) {
        return [heroImages[0].url.trim()];
      }
      return ["/images/The_Nile_River_at_Cairo.jpg"];
    }

    // 2. Video Mode: single video URL
    if (isVideoMode) {
      if (heroData?.mediaUrl && typeof heroData.mediaUrl === "string" && heroData.mediaUrl.trim() !== "") {
        return [heroData.mediaUrl.trim()];
      }
      return ["/images/The_Nile_River_at_Cairo.jpg"];
    }

    // 3. Dynamic Slider Mode: ONLY use the user's active slides from heroImages
    const list: string[] = [];
    if (Array.isArray(heroImages)) {
      heroImages.forEach((item) => {
        if (item?.url && typeof item.url === "string" && item.url.trim() !== "") {
          const u = item.url.trim();
          if (!list.includes(u)) list.push(u);
        }
      });
    }
    // If no images configured in heroImages yet, fallback to heroData.mediaUrl
    if (list.length === 0 && heroData?.mediaUrl && typeof heroData.mediaUrl === "string" && heroData.mediaUrl.trim() !== "") {
      list.push(heroData.mediaUrl.trim());
    }
    // If completely empty, use curated luxury defaults
    if (list.length === 0) {
      return DEFAULT_SLIDES;
    }
    return list;
  }, [isStatic, isVideoMode, heroData?.mediaUrl, heroImages]);

  // Keep currentIndex within bounds if slides list changed
  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  // Auto-play timer for slider (ONLY active in dynamic-slider mode with > 1 slide)
  const autoplayMs = heroData?.autoplayMs && heroData.autoplayMs >= 1500 ? heroData.autoplayMs : 4500;
  useEffect(() => {
    if (!isSlider || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, autoplayMs);
    return () => clearInterval(interval);
  }, [isSlider, slides.length, autoplayMs]);

  // Handle slide navigation
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  // Text values - ONLY render if user explicitly provided non-empty text
  const mainTitle = (heroData?.title && typeof heroData.title === "string") ? heroData.title.trim() : "";
  const subtitle = (heroData?.subtitle && typeof heroData.subtitle === "string") ? heroData.subtitle.trim() : "";
  const hasText = Boolean(mainTitle || subtitle);
  const showText = hasText && heroData?.showText !== false && heroData?.hideText !== true;

  // Buttons
  const showButtons = heroData?.showButtons !== false && heroData?.hideButtons !== true;
  const btn1Text = (heroData?.buttonText1 && typeof heroData.buttonText1 === "string" && heroData.buttonText1.trim() !== "")
    ? heroData.buttonText1.trim()
    : "Explore Destinations";
  const btn2Text = (heroData?.buttonText2 && typeof heroData.buttonText2 === "string" && heroData.buttonText2.trim() !== "")
    ? heroData.buttonText2.trim()
    : "Contact Us";

  const isMobile = useIsMobile();
  const isCustomMobile = isMobile && Boolean(heroData?.mobileMediaUrl);
  const activeCropX = isCustomMobile
    ? (typeof heroData?.mobileMediaCropX === "number" ? heroData.mobileMediaCropX : 50)
    : (typeof heroData?.mediaCropX === "number" ? heroData.mediaCropX : 50);
  const activeCropY = isCustomMobile
    ? (typeof heroData?.mobileMediaCropY === "number" ? heroData.mobileMediaCropY : 50)
    : (typeof heroData?.mediaCropY === "number" ? heroData.mediaCropY : 50);

  const activeSlideUrl = (isCustomMobile && heroData?.mobileMediaUrl)
    ? heroData.mobileMediaUrl
    : (slides[currentIndex] || slides[0] || "/The_Nile_River_at_Cairo.jpg");
  const isVideo = isVideoUrl(activeSlideUrl);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0A0A0A]"
    >
      {/* ── Background Slider Images / Videos ── */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={`slide-${currentIndex}-${activeSlideUrl}`}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 w-full h-full"
        >
          {isVideo ? (
            <video
              src={activeSlideUrl}
              className="w-full h-full object-cover"
              style={{ objectPosition: `${activeCropX}% ${activeCropY}%` }}
              muted
              autoPlay
              loop
              playsInline
            />
          ) : (
            <picture className="w-full h-full block">
              {heroData?.mobileMediaUrl && (
                <source
                  media="(max-width: 768px)"
                  srcSet={heroData.mobileMediaUrl}
                />
              )}
              <img
                src={activeSlideUrl}
                className="w-full h-full object-cover"
                style={{ objectPosition: `${activeCropX}% ${activeCropY}%` }}
                alt="VANIR GROUP Luxury Travel"
                onError={(e) => {
                  applyLuxuryImageFallback(e.currentTarget);
                }}
              />
            </picture>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Subtle Luxury Overlays - keeps imagery bright and vivid ── */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          backgroundColor: heroData?.overlayColor === "light"
            ? `rgba(255,255,255,${Math.min(25, heroData?.overlayOpacity ?? 10) / 100})`
            : `rgba(0,0,0,${Math.min(30, heroData?.overlayOpacity ?? 15) / 100})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/15 pointer-events-none" />

      {/* ── Optional Text Container (Only shown when user wrote text in admin) ── */}
      {showText && (
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center py-16">
          <div
            className="flex flex-col items-center justify-center text-center w-full max-w-4xl mx-auto"
            style={{
              transform: `translate(${heroData?.textPositionX || 0}%, ${heroData?.textPositionY || 0}%)`,
            }}
          >
            {subtitle && (
              <p
                className="text-xs sm:text-sm md:text-base tracking-[0.25em] uppercase mb-4 font-semibold"
                style={{
                  color: heroData?.subtitleStyle?.color || colorMix(colors.primary, 90),
                  fontSize: heroData?.subtitleStyle?.fontSize ? `${heroData.subtitleStyle.fontSize}px` : undefined,
                  fontWeight: heroData?.subtitleStyle?.fontWeight || "600",
                  letterSpacing: heroData?.subtitleStyle?.letterSpacing ? `${heroData.subtitleStyle.letterSpacing}px` : "0.25em",
                  textTransform: (heroData?.subtitleStyle?.textTransform || "uppercase") as any,
                  textShadow: heroData?.subtitleStyle?.textShadow
                    ? `${heroData?.subtitleStyle?.shadowOffsetX || 2}px ${heroData?.subtitleStyle?.shadowOffsetY || 2}px ${heroData?.subtitleStyle?.shadowBlur || 8}px ${heroData?.subtitleStyle?.shadowColor || "rgba(0,0,0,0.7)"}`
                    : "0 2px 8px rgba(0,0,0,0.7)",
                }}
              >
                {subtitle}
              </p>
            )}

            {mainTitle && (
              <h1
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight font-extrabold mb-6 text-white font-[var(--font-display)]"
                style={{
                  fontSize: heroData?.titleStyle?.fontSize ? `${heroData.titleStyle.fontSize}px` : undefined,
                  fontWeight: heroData?.titleStyle?.fontWeight || "800",
                  color: heroData?.titleStyle?.color || "#ffffff",
                  textTransform: (heroData?.titleStyle?.textTransform || "none") as any,
                  lineHeight: heroData?.titleStyle?.lineHeight ? `${heroData.titleStyle.lineHeight}` : "1.15",
                  textShadow: heroData?.titleStyle?.textShadow
                    ? `${heroData?.titleStyle?.shadowOffsetX || 2}px ${heroData?.titleStyle?.shadowOffsetY || 2}px ${heroData?.titleStyle?.shadowBlur || 8}px ${heroData?.titleStyle?.shadowColor || "rgba(0,0,0,0.7)"}`
                    : "0 4px 16px rgba(0,0,0,0.8)",
                }}
              >
                {mainTitle}
              </h1>
            )}
          </div>
        </div>
      )}

      {/* ── Slider Arrows & Controls (ONLY in dynamic-slider mode with > 1 slides) ── */}
      {isSlider && slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white hover:text-[var(--theme-primary)] hover:border-[var(--theme-primary)] flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xl"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white hover:text-[var(--theme-primary)] hover:border-[var(--theme-primary)] flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xl"
          >
            <ChevronRight size={22} />
          </button>

          {/* Slider Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-500 rounded-full ${
                  idx === currentIndex
                    ? "w-7 h-2 bg-[var(--theme-primary)]"
                    : "w-2 h-2 bg-white/40 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* ── CTA Action Buttons (Bottom Left) ── */}
      {showButtons && (btn1Text || btn2Text) && (
        <div className="absolute bottom-8 sm:bottom-12 left-6 sm:left-10 lg:left-16 z-20 flex flex-wrap items-center gap-3 sm:gap-4">
          {btn1Text && btn1Text.trim() !== "" && (
            <a
              href={heroData?.buttonLink1 || "/destinations"}
              className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm uppercase tracking-widest font-bold transition-all duration-300 shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-2"
              style={{
                backgroundColor: colors.primary,
                color: "#0a0a0a",
                boxShadow: `0 4px 25px ${colorMix(colors.primary, 40)}`,
              }}
            >
              {btn1Text}
            </a>
          )}
          {btn2Text && btn2Text.trim() !== "" && (
            <a
              href={heroData?.buttonLink2 || "/contact"}
              className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm uppercase tracking-widest font-semibold transition-all duration-300 border border-white/30 text-white bg-black/40 backdrop-blur-md hover:bg-white/20 hover:border-white hover:scale-105 active:scale-95"
            >
              {btn2Text}
            </a>
          )}
        </div>
      )}

      {/* ── Social Media Icons (Bottom Right) ── */}
      <div className="absolute bottom-8 right-6 sm:right-10 z-20 hidden md:flex flex-col gap-3">
        <a
          href="https://www.facebook.com/share/1DvRyfaQRC/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 focus-visible:outline-none hover:scale-110 bg-black/40 backdrop-blur-md"
          style={{
            border: `1px solid ${colors.primary}`,
            color: colors.primary,
          }}
          aria-label="Facebook"
        >
          <Facebook size={18} />
        </a>
        <a
          href="https://www.instagram.com/vanir.group?igsh=cnpjczFsZzdrMDhi"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 focus-visible:outline-none hover:scale-110 bg-black/40 backdrop-blur-md"
          style={{
            border: `1px solid ${colors.primary}`,
            color: colors.primary,
          }}
          aria-label="Instagram"
        >
          <Instagram size={18} />
        </a>
      </div>

      {/* ── Seamless Bottom Gradient Blend into Sovereign Architect ── */}
      <div className="absolute bottom-0 left-0 right-0 h-44 pointer-events-none bg-gradient-to-t from-[#07090e] via-[#07090e]/80 to-transparent z-20" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent z-30" />
    </section>
  );
}

