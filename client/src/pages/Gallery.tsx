/*
 * Gallery Page - Professional Portfolio Showcase
 * Design: Art Deco Luxe - Black & Gold
 * Features: Masonry grid, category filters, lightbox, hover effects, animations, social sharing
 * Data: Dynamic from DB with static fallback
 */
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import SEO from "@/components/SEO";
import {
  X, ChevronLeft, ChevronRight, MapPin,
  Camera, ZoomIn, Play, Video, Clock, Eye,
  Sparkles, Globe, Award, Heart, Share2, Download,
  Grid3X3, LayoutGrid, Maximize2, Facebook, Instagram, Link2, MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import OptimizedImage from "@/components/OptimizedImage";
import PageMeta from "@/components/PageMeta";

/* ─── Social Links ─── */
const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/share/1DvRyfaQRC/",
  instagram: "https://www.instagram.com/vanir.group?igsh=cnpjczFsZzdrMDhi",
};

/* ─── CDN Base ─── */
const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8";

/* ─── Gallery Item Interface (unified for DB + static) ─── */
interface GalleryItemDisplay {
  id: number;
  src: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  categoryAr: string;
  location: string;
  locationAr: string;
  featured?: boolean;
  aspect: "landscape" | "portrait" | "square";
}

type GalleryLayout = "dynamic-grid" | "masonry" | "swiper-carousel" | "grid-lightbox" | "isotope-filter";
type GalleryAspect = "square" | "landscape" | "portrait" | "original";

/* ─── Static Fallback Data ─── */
const staticGalleryItems: GalleryItemDisplay[] = [
  {
    "id": 1,
    "src": "/images/gallery/vanir_gallery_001_00cbd9709f8db1c72f56d425b7d9b884.jpg",
    "title": "Royal Egyptian Journey #1",
    "titleAr": "رحلة ملكية في ربوع مصر #1",
    "description": "Exclusive luxury travel through iconic pharaonic wonders.",
    "descriptionAr": "رحلة سفر ملكية فاخرة بين عجائب الحضارة المصرية الخالدة.",
    "category": "Luxury Travel",
    "categoryAr": "السفر الفاخر",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": true,
    "aspect": "landscape"
  },
  {
    "id": 2,
    "src": "/images/gallery/vanir_gallery_002_027f87526eeda4373be0d06d5f746310.jpg",
    "title": "Timeless Wonders of Giza #2",
    "titleAr": "عجائب أهرامات الجيزة الخالدة #2",
    "description": "Private access to the majestic pyramids and sphinx.",
    "descriptionAr": "زيارة خاصة وحصرية لأهرامات الجيزة العظيمة وأبو الهول.",
    "category": "Temples & Monuments",
    "categoryAr": "المعابد والآثار",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": true,
    "aspect": "portrait"
  },
  {
    "id": 3,
    "src": "/images/gallery/vanir_gallery_003_037dce4b781b68dfd9fd1138da19d81f.jpg",
    "title": "Golden Desert Safari #3",
    "titleAr": "سفاري الصحراء الذهبية #3",
    "description": "Thrilling expeditions across the serene desert dunes.",
    "descriptionAr": "مغامرات شيقة بين الكثبان الرملية والواحات الساحرة.",
    "category": "Desert Safari",
    "categoryAr": "سفاري الصحراء",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": true,
    "aspect": "square"
  },
  {
    "id": 4,
    "src": "/images/gallery/vanir_gallery_004_038361a7369f0825e9673c26d9385423.jpg",
    "title": "Royal Nile Elegance #4",
    "titleAr": "فخامة النيل الملكية #4",
    "description": "Drifting in bespoke comfort along the ancient river.",
    "descriptionAr": "إبحار فاخر ومريح في هدوء نهر النيل الأسطوري.",
    "category": "Nile Cruises",
    "categoryAr": "رحلات النيل",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": true,
    "aspect": "landscape"
  },
  {
    "id": 5,
    "src": "/images/gallery/vanir_gallery_005_03b8b5e78f11de3d0b633bd882e75c32.jpg",
    "title": "Red Sea Coastal Paradise #5",
    "titleAr": "سحر شواطئ البحر الأحمر #5",
    "description": "Pristine waters, vibrant coral reefs, and luxury resorts.",
    "descriptionAr": "مياه فيروزية ساحرة وشعاب مرجانية خلابة ومنتجعات عالمية.",
    "category": "Beach & Resorts",
    "categoryAr": "شواطئ ومنتجعات",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": true,
    "aspect": "portrait"
  },
  {
    "id": 6,
    "src": "/images/gallery/vanir_gallery_006_04b34b5c8232b6ccf3ff2492a1a70cd5.jpg",
    "title": "Pharaonic Heritage & Grandeur #6",
    "titleAr": "عظمة التراث الفرعوني #6",
    "description": "Echoes of ancient kings in monumental temples.",
    "descriptionAr": "عظمة وتاريخ ملوك الفراعنة في المعابد والصروح التاريخية.",
    "category": "Luxury Hotels",
    "categoryAr": "فنادق فاخرة",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": true,
    "aspect": "square"
  },
  {
    "id": 7,
    "src": "/images/gallery/vanir_gallery_007_04d7fcab44a31a6f6b2eb1a55dcb72ea.jpg",
    "title": "Cairo by Night #7",
    "titleAr": "سحر ليالي القاهرة #7",
    "description": "Vibrant cultural evenings and historic architectural vistas.",
    "descriptionAr": "أمسيات ثقافية ساحرة بين روعة المعالم التاريخية.",
    "category": "City Tours",
    "categoryAr": "جولات المدن",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": true,
    "aspect": "landscape"
  },
  {
    "id": 8,
    "src": "/images/gallery/vanir_gallery_008_05e413f85bf59bd12a56169a02a113941186b2a93fc5349eb0f0ffa1e5fd3e4c.avif",
    "title": "Luxor Valley of the Kings #8",
    "titleAr": "وادي الملوك بالأقصر #8",
    "description": "Magnificent tombs and legendary temples of Thebes.",
    "descriptionAr": "مقابر الملوك العظماء والمعابد الأسطورية في طيبة القديمة.",
    "category": "Adventure",
    "categoryAr": "مغامرات واستكشاف",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": true,
    "aspect": "portrait"
  },
  {
    "id": 9,
    "src": "/images/gallery/vanir_gallery_009_0687c502cdc98dfd130e52d158d1cdbb.jpg",
    "title": "Aswan Nubian Charm #9",
    "titleAr": "سحر النوبة في أسوان #9",
    "description": "Tranquil felucca sailing and authentic Nubian hospitality.",
    "descriptionAr": "إبحار هادئ بالفلوكة وكرم الضيافة النوبية الأصيلة.",
    "category": "Luxury Travel",
    "categoryAr": "السفر الفاخر",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": true,
    "aspect": "square"
  },
  {
    "id": 10,
    "src": "/images/gallery/vanir_gallery_010_07fb66ba71772296fa2bf0c6abce7727.jpg",
    "title": "Alexandria Mediterranean Glow #10",
    "titleAr": "بريق عروس البحر الأبيض المتوسط #10",
    "description": "Cosmopolitan elegance along the historic Mediterranean corniche.",
    "descriptionAr": "أناقة الإسكندرية وإطلالات ساحرة على كورنيش البحر الأبيض.",
    "category": "Temples & Monuments",
    "categoryAr": "المعابد والآثار",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": true,
    "aspect": "landscape"
  },
  {
    "id": 11,
    "src": "/images/gallery/vanir_gallery_011_087656c80cf2f796bb9ae4d1a7513fbb.jpg",
    "title": "Siwa Oasis Serenity #11",
    "titleAr": "هدوء وسحر واحة سيوة #11",
    "description": "Crystal salt lakes, eco-lodges, and starlit desert skies.",
    "descriptionAr": "بحيرات الملح النقية والمنتجعات البيئية تحت سماء الصحراء المرصعة بالنجوم.",
    "category": "Desert Safari",
    "categoryAr": "سفاري الصحراء",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": true,
    "aspect": "portrait"
  },
  {
    "id": 12,
    "src": "/images/gallery/vanir_gallery_012_091c8b276c449950fd7634922be033b2.jpg",
    "title": "Luxury Suite & Fine Hospitality #12",
    "titleAr": "أجنحة فاخرة وضيافة استثنائية #12",
    "description": "Five-star comfort tailored for discerning travelers.",
    "descriptionAr": "إقامة فندقية 5 نجوم مصممة خصيصاً لراحة كبار الضيوف.",
    "category": "Nile Cruises",
    "categoryAr": "رحلات النيل",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": true,
    "aspect": "square"
  },
  {
    "id": 13,
    "src": "/images/gallery/vanir_gallery_013_0d5cef9c05b6dddecd1abd234fb64499.jpg",
    "title": "Royal Egyptian Journey #13",
    "titleAr": "رحلة ملكية في ربوع مصر #13",
    "description": "Exclusive luxury travel through iconic pharaonic wonders.",
    "descriptionAr": "رحلة سفر ملكية فاخرة بين عجائب الحضارة المصرية الخالدة.",
    "category": "Beach & Resorts",
    "categoryAr": "شواطئ ومنتجعات",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": false,
    "aspect": "landscape"
  },
  {
    "id": 14,
    "src": "/images/gallery/vanir_gallery_014_0ecb3ed7291ece16aaee9faa4defd34e65660634d46c8aea224d7de0cb8703d3.avif",
    "title": "Timeless Wonders of Giza #14",
    "titleAr": "عجائب أهرامات الجيزة الخالدة #14",
    "description": "Private access to the majestic pyramids and sphinx.",
    "descriptionAr": "زيارة خاصة وحصرية لأهرامات الجيزة العظيمة وأبو الهول.",
    "category": "Luxury Hotels",
    "categoryAr": "فنادق فاخرة",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": false,
    "aspect": "portrait"
  },
  {
    "id": 15,
    "src": "/images/gallery/vanir_gallery_015_13762f09242d266fa7d772928576bbd5_1_.jpg",
    "title": "Golden Desert Safari #15",
    "titleAr": "سفاري الصحراء الذهبية #15",
    "description": "Thrilling expeditions across the serene desert dunes.",
    "descriptionAr": "مغامرات شيقة بين الكثبان الرملية والواحات الساحرة.",
    "category": "City Tours",
    "categoryAr": "جولات المدن",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": false,
    "aspect": "square"
  },
  {
    "id": 16,
    "src": "/images/gallery/vanir_gallery_016_16d4a29e5c2ad53cba99d2fd8d61e3ef.jpg",
    "title": "Royal Nile Elegance #16",
    "titleAr": "فخامة النيل الملكية #16",
    "description": "Drifting in bespoke comfort along the ancient river.",
    "descriptionAr": "إبحار فاخر ومريح في هدوء نهر النيل الأسطوري.",
    "category": "Adventure",
    "categoryAr": "مغامرات واستكشاف",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": false,
    "aspect": "landscape"
  },
  {
    "id": 17,
    "src": "/images/gallery/vanir_gallery_017_1767962547584377186c0f55c5ebbc75.jpg",
    "title": "Red Sea Coastal Paradise #17",
    "titleAr": "سحر شواطئ البحر الأحمر #17",
    "description": "Pristine waters, vibrant coral reefs, and luxury resorts.",
    "descriptionAr": "مياه فيروزية ساحرة وشعاب مرجانية خلابة ومنتجعات عالمية.",
    "category": "Luxury Travel",
    "categoryAr": "السفر الفاخر",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": false,
    "aspect": "portrait"
  },
  {
    "id": 18,
    "src": "/images/gallery/vanir_gallery_018_18dace39bb149041c9c4681c659022ad.jpg",
    "title": "Pharaonic Heritage & Grandeur #18",
    "titleAr": "عظمة التراث الفرعوني #18",
    "description": "Echoes of ancient kings in monumental temples.",
    "descriptionAr": "عظمة وتاريخ ملوك الفراعنة في المعابد والصروح التاريخية.",
    "category": "Temples & Monuments",
    "categoryAr": "المعابد والآثار",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": false,
    "aspect": "square"
  },
  {
    "id": 19,
    "src": "/images/gallery/vanir_gallery_019_1a2f4f7e9dd4fbf4870d1d7f885d89a996f09a868c58164493dc67dc3d533b8f.avif",
    "title": "Cairo by Night #19",
    "titleAr": "سحر ليالي القاهرة #19",
    "description": "Vibrant cultural evenings and historic architectural vistas.",
    "descriptionAr": "أمسيات ثقافية ساحرة بين روعة المعالم التاريخية.",
    "category": "Desert Safari",
    "categoryAr": "سفاري الصحراء",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": false,
    "aspect": "landscape"
  },
  {
    "id": 20,
    "src": "/images/gallery/vanir_gallery_020_1b89ff0d7ad5906995da4b564427af33.jpg",
    "title": "Luxor Valley of the Kings #20",
    "titleAr": "وادي الملوك بالأقصر #20",
    "description": "Magnificent tombs and legendary temples of Thebes.",
    "descriptionAr": "مقابر الملوك العظماء والمعابد الأسطورية في طيبة القديمة.",
    "category": "Nile Cruises",
    "categoryAr": "رحلات النيل",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": false,
    "aspect": "portrait"
  },
  {
    "id": 21,
    "src": "/images/gallery/vanir_gallery_021_1bb0a1bbbbfa5cf688593a702dbe396d.jpg",
    "title": "Aswan Nubian Charm #21",
    "titleAr": "سحر النوبة في أسوان #21",
    "description": "Tranquil felucca sailing and authentic Nubian hospitality.",
    "descriptionAr": "إبحار هادئ بالفلوكة وكرم الضيافة النوبية الأصيلة.",
    "category": "Beach & Resorts",
    "categoryAr": "شواطئ ومنتجعات",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": false,
    "aspect": "square"
  },
  {
    "id": 22,
    "src": "/images/gallery/vanir_gallery_022_1dc7e0b27fbf1a59d1d748f6ca05f891_1_.jpg",
    "title": "Alexandria Mediterranean Glow #22",
    "titleAr": "بريق عروس البحر الأبيض المتوسط #22",
    "description": "Cosmopolitan elegance along the historic Mediterranean corniche.",
    "descriptionAr": "أناقة الإسكندرية وإطلالات ساحرة على كورنيش البحر الأبيض.",
    "category": "Luxury Hotels",
    "categoryAr": "فنادق فاخرة",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": false,
    "aspect": "landscape"
  },
  {
    "id": 23,
    "src": "/images/gallery/vanir_gallery_023_211e57cf436aa102de17c67d96fe6845.jpg",
    "title": "Siwa Oasis Serenity #23",
    "titleAr": "هدوء وسحر واحة سيوة #23",
    "description": "Crystal salt lakes, eco-lodges, and starlit desert skies.",
    "descriptionAr": "بحيرات الملح النقية والمنتجعات البيئية تحت سماء الصحراء المرصعة بالنجوم.",
    "category": "City Tours",
    "categoryAr": "جولات المدن",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": false,
    "aspect": "portrait"
  },
  {
    "id": 24,
    "src": "/images/gallery/vanir_gallery_024_22cae0eaa08366844a35a13ecdbbe3e1533112abf3049f3236b5f2ab4a6bde64.avif",
    "title": "Luxury Suite & Fine Hospitality #24",
    "titleAr": "أجنحة فاخرة وضيافة استثنائية #24",
    "description": "Five-star comfort tailored for discerning travelers.",
    "descriptionAr": "إقامة فندقية 5 نجوم مصممة خصيصاً لراحة كبار الضيوف.",
    "category": "Adventure",
    "categoryAr": "مغامرات واستكشاف",
    "location": "Egypt",
    "locationAr": "مصر",
    "featured": false,
    "aspect": "square"
  }
];

/* ─── Static Video Fallback ─── */
interface VideoItemDisplay {
  id: number;
  thumbnail: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  duration: string;
  views: string;
  category: string;
  categoryAr: string;
}

const staticVideoItems: VideoItemDisplay[] = [
  {
    id: 1,
    thumbnail: "/images/vanir_adventure_4.png",
    title: "Desert Expedition",
    titleAr: "رحلة الصحراء",
    description: "An exciting journey through Egypt's vast desert landscapes.",
    descriptionAr: "رحلة مثيرة عبر المناظر الصحراوية الشاسعة في مصر.",
    duration: "4:32",
    views: "12.5K",
    category: "Adventure",
    categoryAr: "المغامرة",
  },
  {
    id: 2,
    thumbnail: "/images/The_Nile_River_at_Cairo.jpg",
    title: "Nile River Journey",
    titleAr: "رحلة النيل",
    description: "Experience the magic of a cruise on the legendary Nile.",
    descriptionAr: "استمتع بسحر رحلة على النيل الأسطوري.",
    duration: "5:15",
    views: "18.3K",
    category: "Cruises",
    categoryAr: "الرحلات",
  },
  {
    id: 3,
    thumbnail: "/images/kiosk-roman-island-trajan-agilkia-nile-river.jpg",
    title: "Ancient Temples",
    titleAr: "المعابد القديمة",
    description: "Discover the mysteries of Egypt's most iconic temples.",
    descriptionAr: "اكتشف أسرار أشهر معابد مصر.",
    duration: "6:48",
    views: "22.1K",
    category: "History",
    categoryAr: "التاريخ",
  },
  {
    id: 4,
    thumbnail: "/images/vanir_nightlife_4.png",
    title: "Cairo Nights",
    titleAr: "ليالي القاهرة",
    description: "Experience the vibrant nightlife and culture of Cairo.",
    descriptionAr: "استمتع بالحياة الليلية والثقافة النابضة بالحياة في القاهرة.",
    duration: "3:59",
    views: "15.7K",
    category: "City Tours",
    categoryAr: "جولات المدن",
  },
];

/* ─── Gallery Component ─── */
export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<GalleryItemDisplay | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoItemDisplay | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [layoutMode, setLayoutMode] = useState<GalleryLayout>("dynamic-grid");
  const [forcedAspect, setForcedAspect] = useState<GalleryAspect>("original");
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch gallery data from DB (with fallback to static)
  const { data: dbGalleryItems = [] } = trpc.gallery.listVisible.useQuery(undefined, {
    staleTime: 1000 * 30, // 30 seconds
    refetchOnMount: "always",
  }) as any;
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
      // ignore malformed admin setting
    }
  }, [mediaDisplaySettings]);

  console.log("[Gallery] Fetched items:", dbGalleryItems);

  // Transform DB items to match GalleryItemDisplay format
  // Convert imageUrl to src and ensure all required fields are present
  // Use useMemo to prevent re-transformation on every render
  const transformedDbItems = useMemo(() => {
    if (!dbGalleryItems || dbGalleryItems.length === 0) return [];
    
    return dbGalleryItems.map((item: any, index: number) => ({
      ...item,
      // Use stable ID: prefer _docId, fallback to id, then use deterministic index-based fallback
      id: item._docId || item.id || `db-fallback-${index}`,
      src: item.imageUrl || item.src || "", // Map imageUrl to src
      title: item.title || "Untitled",
      titleAr: item.titleAr || item.title || "بدون عنوان",
      description: item.description || "",
      descriptionAr: item.descriptionAr || "",
      category: item.category || "General",
      categoryAr: item.categoryAr || "عام",
      location: item.location || "",
      locationAr: item.locationAr || "",
      // Keep featured as string ('yes'/'no') for consistency with existing consumers
      featured: item.featured || "no",
      aspect: item.aspect || "landscape",
    }));
  }, [dbGalleryItems]);

  const galleryItems = transformedDbItems.length > 0 ? transformedDbItems : staticGalleryItems;

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(galleryItems.map((item: any) => item.category));
    return ["All", ...Array.from(cats)];
  }, [galleryItems]);

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return galleryItems;
    return galleryItems.filter((item: any) => item.category === activeCategory);
  }, [galleryItems, activeCategory]);

  const getAspectClass = useCallback((item: GalleryItemDisplay) => {
    const chosen = forcedAspect === "original" ? item.aspect : forcedAspect;
    if (chosen === "square") return "aspect-square";
    if (chosen === "portrait") return "aspect-[4/5]";
    if (chosen === "landscape") return "aspect-video";
    return "aspect-auto";
  }, [forcedAspect]);

  // Handle image click
  const handleImageClick = useCallback((item: any) => {
    setSelectedImage(item);
  }, []);

  // Handle video click
  const handleVideoClick = useCallback((item: any) => {
    setSelectedVideo(item);
  }, []);

  // Close lightbox
  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
  }, []);

  // Close video modal
  const closeVideoModal = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  // Navigate to next/prev image
  const navigateImage = useCallback(
    (direction: "next" | "prev") => {
      if (!selectedImage) return;
      // Use id field for comparison to match transformedDbItems logic
      const currentIndex = filteredItems.findIndex((item: any) => item.id === selectedImage.id);
      const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
      if (newIndex >= 0 && newIndex < filteredItems.length) {
        setSelectedImage(filteredItems[newIndex]);
      }
    },
    [selectedImage, filteredItems]
  );

  // Share image
  const shareImage = useCallback(
    (item: any) => {
      const shareText = `Check out this amazing ${item.category} experience from Vanir Travel Group: ${item.title}`;
      if (navigator.share) {
        navigator.share({
          title: item.title,
          text: shareText,
          url: window.location.href,
        });
      } else {
        toast.success("Share link copied to clipboard!");
      }
    },
    []
  );

  return (
    <div className="min-h-screen bg-[var(--theme-background)] text-white">
      <Navbar />
      <SEO
        title="Gallery - Vanir Travel Group"
        description="Explore our stunning gallery of Egyptian luxury travel experiences, from desert safaris to Nile cruises."
        ogImage={galleryItems[0]?.src}
      />

      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 px-3 sm:px-4 md:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/The_Nile_River_at_Cairo.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-background)]/85 via-[var(--theme-background)]/75 to-[var(--theme-background)]" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primary-light)] bg-clip-text text-transparent">
              Gallery
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto px-2">
              Discover the beauty and elegance of our luxury travel experiences
            </p>
          </motion.div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-8 sm:mb-12">
            {(categories as string[]).map((category: string) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(category)}
                className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full transition-all text-xs sm:text-sm ${
                  activeCategory === category
                    ? "bg-[var(--theme-primary)] text-[var(--theme-background)] font-semibold"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "grid" ? "bg-[var(--theme-primary)] text-[var(--theme-background)]" : "bg-gray-800 text-gray-300"
              }`}
            >
              <Grid3X3 size={20} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "list" ? "bg-[var(--theme-primary)] text-[var(--theme-background)]" : "bg-gray-800 text-gray-300"
              }`}
            >
              <LayoutGrid size={20} />
            </button>
          </div>

          {(layoutMode === "isotope-filter" || layoutMode === "dynamic-grid") && (
            <p className="text-center text-xs text-gray-400">
              Layout: {layoutMode === "isotope-filter" ? "Isotope-style Category Filtering" : "Dynamic Grid"} &middot; Aspect: {forcedAspect}
            </p>
          )}
        </div>
      </section>

      {/* Gallery Grid */}
      <section ref={containerRef} className="px-3 sm:px-4 md:px-8 pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            layout
            className={
              layoutMode === "masonry"
                ? "columns-1 sm:columns-2 lg:columns-3 gap-3 sm:gap-4 md:gap-6 space-y-3 sm:space-y-4 md:space-y-6"
                : layoutMode === "swiper-carousel"
                  ? "flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2"
                  : `grid gap-3 sm:gap-4 md:gap-6 ${
                      viewMode === "grid"
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-max"
                        : "grid-cols-1"
                    }`
            }
          >
            <AnimatePresence mode="wait">
              {filteredItems.map((item: GalleryItemDisplay) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleImageClick(item)}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden bg-gray-900 ${
                    layoutMode === "masonry" ? "break-inside-avoid mb-4" : ""
                  } ${
                    layoutMode === "swiper-carousel" ? "snap-start min-w-[300px] sm:min-w-[360px] lg:min-w-[420px]" : ""
                  } ${
                    forcedAspect === "original" && item.aspect === "portrait" && layoutMode !== "masonry" ? "row-span-2" : ""
                  }`}
                  style={{ borderRadius: "var(--theme-radius)", boxShadow: "var(--theme-shadow)" }}
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden ${getAspectClass(item)} ${forcedAspect === "original" ? "h-64 md:h-80" : ""}`}>
                    <OptimizedImage
                      src={item.src}
                      alt={item.title}
                      lazy={false}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-300 mb-2">{item.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <MapPin size={14} />
                        {item.location}
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 right-3 bg-[var(--theme-primary)]/90 text-[var(--theme-background)] px-3 py-1 rounded-full text-xs font-semibold">
                      {item.category}
                    </div>

                    {/* Featured Badge */}
                    {item.featured && (
                      <div className="absolute top-3 left-3 bg-yellow-500/90 text-[var(--theme-background)] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Sparkles size={12} />
                        Featured
                      </div>
                    )}

                    {/* Zoom Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ZoomIn size={40} className="text-[var(--theme-primary)]" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Videos Section */}
          <div className="mt-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5 sm:mb-8 text-center bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primary-light)] bg-clip-text text-transparent">
              Featured Videos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {staticVideoItems.map((video: VideoItemDisplay) => (
                <motion.div
                  key={video.id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleVideoClick(video)}
                  className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-900"
                >
                  <div className="relative h-48 overflow-hidden">
                    <OptimizedImage
                      src={video.thumbnail}
                      alt={video.title}
                      lazy={false}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play size={50} className="text-[var(--theme-primary)] group-hover:scale-125 transition-transform" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                      <Clock size={12} />
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm mb-1">{video.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Eye size={12} />
                      {video.views}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full"
            >
              {/* Image */}
              <OptimizedImage
                src={selectedImage.src}
                alt={selectedImage.title}
                lazy={false}
                className="w-full h-auto rounded-lg"
              />

              {/* Info */}
              <div className="mt-4 text-white">
                <h2 className="text-2xl font-bold mb-2">{selectedImage.title}</h2>
                <p className="text-gray-300 mb-4">{selectedImage.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <MapPin size={16} />
                  {selectedImage.location}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => shareImage(selectedImage)}
                    className="flex items-center gap-2 bg-[var(--theme-primary)] text-[var(--theme-background)] px-4 py-2 rounded-lg hover:bg-[#E5B86B] transition-colors"
                  >
                    <Share2 size={16} />
                    Share
                  </button>
                  <button
                    onClick={() => toast.success("Image downloaded!")}
                    className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <button
                onClick={() => navigateImage("prev")}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 text-[var(--theme-primary)] hover:text-[var(--theme-primary-light)] transition-colors"
              >
                <ChevronLeft size={40} />
              </button>
              <button
                onClick={() => navigateImage("next")}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 text-[var(--theme-primary)] hover:text-[var(--theme-primary-light)] transition-colors"
              >
                <ChevronRight size={40} />
              </button>

              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 text-white hover:text-[var(--theme-primary)] transition-colors"
              >
                <X size={32} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeVideoModal}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full"
            >
              <div className="bg-black rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-900 flex items-center justify-center">
                  <Play size={80} className="text-[var(--theme-primary)]" />
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedVideo.title}</h2>
                  <p className="text-gray-300 mb-4">{selectedVideo.description}</p>
                </div>
              </div>
              <button
                onClick={closeVideoModal}
                className="absolute top-4 right-4 text-white hover:text-[var(--theme-primary)] transition-colors"
              >
                <X size={32} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BackToTop />
      <Footer />
    </div>
  );
}
