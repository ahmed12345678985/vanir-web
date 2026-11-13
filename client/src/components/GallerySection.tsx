import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useInView } from "@/hooks/useInView";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { GalleryImage, GalleryCategory } from "@/types/gallery";
import { getGalleryErrorMessage } from "@/lib/errorUtils";
import { applyLuxuryImageFallback } from "@/lib/imageFallback";

const UNSPLASH_GALLERY_FALLBACKS: GalleryImage[] = [
  {
    id: "gallery-item-1",
    imageUrl: "/images/gallery/vanir_gallery_001_00cbd9709f8db1c72f56d425b7d9b884.jpg",
    category: "luxury",
    title: "Royal Egyptian Journey",
    description: "Exclusive luxury travel through iconic pharaonic wonders.",
    featured: "yes",
  },
  {
    id: "gallery-item-2",
    imageUrl: "/images/gallery/vanir_gallery_002_027f87526eeda4373be0d06d5f746310.jpg",
    category: "heritage",
    title: "Timeless Wonders of Giza",
    description: "Private access to the majestic pyramids and sphinx.",
    featured: "yes",
  },
  {
    id: "gallery-item-3",
    imageUrl: "/images/gallery/vanir_gallery_003_037dce4b781b68dfd9fd1138da19d81f.jpg",
    category: "safari",
    title: "Golden Desert Safari",
    description: "Thrilling expeditions across the serene desert dunes.",
    featured: "yes",
  },
  {
    id: "gallery-item-4",
    imageUrl: "/images/gallery/vanir_gallery_004_038361a7369f0825e9673c26d9385423.jpg",
    category: "cruises",
    title: "Royal Nile Elegance",
    description: "Drifting in bespoke comfort along the ancient river.",
    featured: "yes",
  },
  {
    id: "gallery-item-5",
    imageUrl: "/images/gallery/vanir_gallery_005_03b8b5e78f11de3d0b633bd882e75c32.jpg",
    category: "beach",
    title: "Red Sea Coastal Paradise",
    description: "Pristine waters, vibrant coral reefs, and luxury resorts.",
    featured: "yes",
  },
  {
    id: "gallery-item-6",
    imageUrl: "/images/gallery/vanir_gallery_006_04b34b5c8232b6ccf3ff2492a1a70cd5.jpg",
    category: "hotels",
    title: "Luxury Suite & Fine Hospitality",
    description: "Five-star comfort tailored for discerning travelers.",
    featured: "yes",
  },
  {
    id: "gallery-item-7",
    imageUrl: "/images/gallery/vanir_gallery_007_04d7fcab44a31a6f6b2eb1a55dcb72ea.jpg",
    category: "city",
    title: "Cairo by Night",
    description: "Vibrant cultural evenings and historic architectural vistas.",
    featured: "yes",
  },
  {
    id: "gallery-item-8",
    imageUrl: "/images/gallery/vanir_gallery_008_05e413f85bf59bd12a56169a02a113941186b2a93fc5349eb0f0ffa1e5fd3e4c.avif",
    category: "adventure",
    title: "Pharaonic Heritage & Grandeur",
    description: "Echoes of ancient kings in monumental temples.",
    featured: "yes",
  },
];

export default function GallerySection() {
  const { ref, inView } = useInView({ threshold: 0.01 });
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory | "all">("all");
  const [layoutMode, setLayoutMode] = useState<"dynamic-grid" | "masonry" | "swiper-carousel" | "grid-lightbox" | "isotope-filter">("dynamic-grid");
  const [forcedAspect, setForcedAspect] = useState<"square" | "landscape" | "portrait" | "original">("original");

  // Fetch gallery items from server (uses permanent Firebase URLs)
  const { data: images = [], isLoading, error } = trpc.gallery.listVisible.useQuery(
    undefined,
    { 
      staleTime: 30 * 1000,
      refetchOnMount: "always",
      enabled: true,
    }
  );
  const { data: mediaDisplaySettings } = trpc.siteSettings.get.useQuery(
    { category: "media", key: "gallery_display" },
    { staleTime: 30000 }
  );

  useEffect(() => {
    if (!mediaDisplaySettings) return;
    try {
      const parsed = JSON.parse(mediaDisplaySettings);
      if (parsed.layout) setLayoutMode(parsed.layout);
      if (parsed.aspectRatio) setForcedAspect(parsed.aspectRatio);
    } catch {
      // ignore malformed display setting
    }
  }, [mediaDisplaySettings]);

  // Debug: Log images when they load
  useEffect(() => {
    if (Array.isArray(images) && images.length > 0) {
      console.log("[GallerySection] Images loaded successfully:", images.length);
      images.forEach((img: any) => {
        console.log("[GallerySection] Image URL:", {
          title: img.title,
          url: img.imageUrl,
          category: img.category,
          featured: img.featured,
        });
      });
    }
  }, [images]);

  // Handle errors safely without alarming visitors (fallback visuals are displayed smoothly)
  useEffect(() => {
    if (error) {
      console.warn("[GallerySection] Notice loading remote gallery (smooth fallback active):", error);
    }
  }, [error]);

  const normalizedImages = useMemo(() => {
    if (!Array.isArray(images)) return [];
    return (images as any[])
      .map((img, index) => ({
        ...img,
        id: String(img.id ?? img._docId ?? img.imageUrl ?? img.title ?? `gallery-item-${index}`),
        imageUrl: img.imageUrl ?? img.url ?? "",
      }))
      .filter((img) => Boolean(img.imageUrl));
  }, [images]);

  const effectiveImages = normalizedImages.length > 0 ? normalizedImages : UNSPLASH_GALLERY_FALLBACKS;

  // Filter images by category
  const filteredImages = selectedCategory === "all"
    ? effectiveImages
    : effectiveImages.filter((img) => img.category === selectedCategory);

  // Showcase only a fast, curated set of 8 images on the home page to keep the DOM light and prevent viewport/gap issues
  const displayedImages = useMemo(() => filteredImages.slice(0, 8), [filteredImages]);

  // Get unique categories
  const categories: (GalleryCategory | "all")[] = ["all", ...Array.from(
    new Set(effectiveImages.map((img) => img.category))
  )];

  const categories_display: Record<string, string> = {
    "all": "All",
    "luxury": "Luxury",
    "safari": "Safari",
    "beach": "Beach",
    "cuisine": "Cuisine",
    "culture": "Culture",
    "adventure": "Adventure",
  };

  return (
    <section id="gallery" className="py-12 sm:py-16 md:py-24 bg-[var(--theme-background)]" ref={ref}>
      <div className="container">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-lg sm:text-xl mb-2 sm:mb-3 block">
            Photo Gallery
          </span>
          <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
            Capture the Moments of Your Journey
          </h2>
          <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent mx-auto mt-4" />
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div
            className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-12"
            role="tablist"
            aria-label="Filter photos by category"
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-surface)] ${
                    isSelected
                      ? "bg-[var(--theme-primary)] text-[var(--theme-surface)]"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {categories_display[cat as keyof typeof categories_display] || cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-white/60">Loading gallery...</p>
          </div>
        )}

        {/* Error/Recovery State */}
        {error && (
          <div className="text-center py-6 px-4 mb-6 rounded-xl border border-amber-400/30 bg-amber-500/10">
            <p className="text-amber-200">Gallery feed is unavailable right now.</p>
            <p className="text-white/60 text-sm mt-2">
              {getGalleryErrorMessage(error)} — showing curated luxury visuals instead.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && displayedImages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60">No photos available in this category</p>
          </div>
        )}

        {/* Gallery Grid */}
        {!isLoading && displayedImages.length > 0 && (
          <>
            <div
              className={
                layoutMode === "masonry"
                  ? "columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-5 md:gap-6 space-y-4"
                  : layoutMode === "swiper-carousel"
                    ? "flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2"
                    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
              }
            >
              {displayedImages.map((img) => {
                const aspectClass = forcedAspect === "square"
                  ? "aspect-square"
                  : forcedAspect === "landscape"
                    ? "aspect-video"
                    : forcedAspect === "portrait"
                      ? "aspect-[4/5]"
                      : "aspect-[4/3]";
                return (
                  <div
                    key={img.id}
                    className={`group relative bg-[var(--theme-surface)] border border-white/8 overflow-hidden cursor-pointer hover:border-[var(--theme-primary)]/40 transition-all duration-500 rounded-xl ${
                      layoutMode === "masonry" ? "break-inside-avoid mb-4" : ""
                    } ${layoutMode === "swiper-carousel" ? "snap-start min-w-[300px] sm:min-w-[340px]" : ""}`}
                  >
                    {/* Image */}
                    <div className={`relative ${aspectClass} bg-black overflow-hidden`}>
                      <img
                        src={img.imageUrl}
                        alt={img.title || img.titleAr || img.description || img.descriptionAr || "Gallery photo from Vanir Travel"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          console.error("[GallerySection] Image failed to load:", {
                            url: img.imageUrl,
                            title: img.title,
                            id: img.id,
                          });
                          applyLuxuryImageFallback(e.currentTarget);
                        }}
                        loading="lazy"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-surface)]/90 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Featured Badge */}
                      {img.featured === "yes" && (
                        <div 
                          className="absolute top-3 right-3 bg-[var(--theme-primary)] text-[var(--theme-surface)] px-3 py-1 rounded-full text-xs font-bold z-10"
                          aria-label="Featured photo"
                        >
                          Featured
                        </div>
                      )}

                      {/* Hover Info */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 text-center">
                        <h3 className="text-white font-semibold text-lg mb-2">
                          {img.title || img.titleAr || "Photo"}
                        </h3>
                        {(img.location || img.locationAr) && (
                          <p className="text-white/70 text-sm mb-3">
                            {img.location || img.locationAr}
                          </p>
                        )}
                        {(img.description || img.descriptionAr) && (
                          <p className="text-white/60 text-xs line-clamp-2">
                            {img.description || img.descriptionAr}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Title Bar */}
                    <div className="p-4">
                      <p className="text-white font-medium truncate">
                        {img.title || img.titleAr || "Photo"}
                      </p>
                      {img.category && (
                        <p className="text-white/40 text-xs mt-1">
                          {categories_display[img.category as keyof typeof categories_display] || img.category}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explore Full Gallery Button */}
            <div className="text-center mt-10 sm:mt-14">
              <Link href="/gallery">
                <button
                  type="button"
                  className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-[var(--theme-primary)] via-[#c59a3e] to-[#9a7424] text-[var(--theme-surface)] font-bold text-base shadow-lg shadow-[var(--theme-primary)]/20 hover:scale-105 hover:shadow-[var(--theme-primary)]/40 transition-all duration-300"
                >
                  <span>Explore Full Gallery ({filteredImages.length}+ Photos)</span>
                  <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
