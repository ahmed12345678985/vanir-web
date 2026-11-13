import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, Save, AlertCircle, Eye, ImageIcon, Type, Link2, Sparkles, Loader2, Film, Layout, Monitor, Columns2, Maximize, X, Plus, Trash2, RotateCcw, Palette, Zap, Smartphone } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { SubPageHero } from "@/contexts/ThemeColorsProvider";
import {
  getFirestoreSetting,
  setFirestoreSetting,
  uploadDirectMedia,
} from "@/lib/siteSettingsApi";

/* ─── Types ─── */
interface HeroImage {
  id: number;
  url: string;
  label: string;
  sublabel: string;
  link: string;
}

interface TextStyle {
  fontSize: number;
  fontWeight: "normal" | "bold" | "900";
  color: string;
  textAlign: "left" | "center" | "right";
  textShadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  opacity: number;
}

interface RotatingWordsStyle {
  animation: "fade" | "slide" | "flip" | "zoom" | "typewriter" | "bounce";
  speed: number; // milliseconds
  textColor: string;
  backgroundColor?: string;
  showBackground: boolean;
  paddingX: number;
  paddingY: number;
  borderRadius: number;
}

interface HeroData {
  title: string;
  rotatingWords: string[];
  subtitle: string;
  buttonText1: string;
  buttonText2: string;
  buttonLink1: string;
  buttonLink2: string;
  mediaType: "image" | "video" | "gradient";
  backgroundType?: "static-image" | "html5-video" | "dynamic-slider";
  sliderEngine?: "framer-motion" | "swiper" | "splide";
  sliderEffect?: "fade" | "cube" | "flip" | "coverflow" | "creative";
  autoplayMs?: number;
  loopSlides?: boolean;
  textFadeInEnabled?: boolean;
  textFadeInDuration?: number;
  mediaUrl: string;
  mobileMediaUrl?: string;
  overlayOpacity: number;
  overlayColor: "dark" | "light";
  mediaCropX?: number;
  mediaCropY?: number;
  mobileMediaCropX?: number;
  mobileMediaCropY?: number;
  featuredImageUrl?: string;
  // Text Styles
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  rotatingWordsStyle?: RotatingWordsStyle;
  button1Style?: TextStyle;
  button2Style?: TextStyle;
  button1BgColor?: string;
  button2BgColor?: string;
  button1HoverBgColor?: string;
  button2HoverBgColor?: string;
  textPositionX?: number;
  textPositionY?: number;
}

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";
const ACCEPTED_VIDEO_TYPES = "video/mp4,video/webm";
const ACCEPTED_MEDIA_TYPES = `${ACCEPTED_IMAGE_TYPES},${ACCEPTED_VIDEO_TYPES}`;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Default Text Style
const DEFAULT_TEXT_STYLE: TextStyle = {
  fontSize: 24,
  fontWeight: "bold",
  color: "#ffffff",
  textAlign: "center",
  textShadow: true,
  shadowColor: "#000000",
  shadowBlur: 8,
  shadowOffsetX: 2,
  shadowOffsetY: 2,
  lineHeight: 1.4,
  letterSpacing: 1,
  textTransform: "none",
  opacity: 1,
};

// Default Rotating Words Style
const DEFAULT_ROTATING_STYLE: RotatingWordsStyle = {
  animation: "fade",
  speed: 3000,
  textColor: "#FFD700",
  backgroundColor: "transparent",
  showBackground: false,
  paddingX: 8,
  paddingY: 4,
  borderRadius: 4,
};

const SUB_PAGES = [
  { id: "about", label: "About Us", labelAr: "من نحن" },
  { id: "services", label: "Services", labelAr: "الخدمات" },
  { id: "contact", label: "Contact", labelAr: "اتصل بنا" },
  { id: "destinations", label: "Destinations", labelAr: "الوجهات" },
  { id: "gallery", label: "Gallery", labelAr: "المعرض" },
  { id: "blog", label: "Blog", labelAr: "المدونة" },
  { id: "programs", label: "Programs", labelAr: "البرامج" },
  { id: "offers", label: "Offers", labelAr: "العروض" },
];

const DEFAULT_SUB_HERO: SubPageHero = {
  page: "",
  layout: "centered",
  title: "",
  subtitle: "",
  mediaUrl: "",
  mediaType: "gradient",
  gradientFrom: "#1A1A2E",
  gradientTo: "#0A0A0A",
  overlayOpacity: 60,
};

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm)(\?|$)/i.test(url);
}

export default function HeroAdmin() {
  /* ─── Main hero state ─── */
  const [heroData, setHeroData] = useState<HeroData>({
    title: "VANIR GROUP — LUXURY TRAVEL",
    rotatingWords: ["Discover", "Explore", "Experience"],
    subtitle: "Egypt's Wonders",
    buttonText1: "Begin Your Journey",
    buttonText2: "Explore Gallery",
    buttonLink1: "/booking",
    buttonLink2: "/gallery",
    mediaType: "image",
    backgroundType: "static-image",
    sliderEngine: "framer-motion",
    sliderEffect: "fade",
    autoplayMs: 3500,
    loopSlides: true,
    textFadeInEnabled: true,
    textFadeInDuration: 900,
    mediaUrl: "",
    mobileMediaUrl: "",
    overlayOpacity: 50,
    overlayColor: "dark",
    mediaCropX: 50,
    mediaCropY: 50,
    mobileMediaCropX: 50,
    mobileMediaCropY: 50,
    featuredImageUrl: "",
    // Default Text Styles
    titleStyle: { ...DEFAULT_TEXT_STYLE, fontSize: 56, fontWeight: "900" },
    subtitleStyle: { ...DEFAULT_TEXT_STYLE, fontSize: 32, fontWeight: "bold" },
    rotatingWordsStyle: DEFAULT_ROTATING_STYLE,
    button1Style: { ...DEFAULT_TEXT_STYLE, fontSize: 16, fontWeight: "bold" },
    button2Style: { ...DEFAULT_TEXT_STYLE, fontSize: 16, fontWeight: "bold" },
    button1BgColor: "#FFD700",
    button2BgColor: "transparent",
    button1HoverBgColor: "#FFC700",
    button2HoverBgColor: "rgba(255, 255, 255, 0.1)",
    textPositionX: 0,
    textPositionY: 0,
  });

  const [heroImages, setHeroImages] = useState<HeroImage[]>([
    { id: 1, url: "", label: "Destinations", sublabel: "ANCIENT WONDERS", link: "/destinations" },
    { id: 2, url: "", label: "Exclusive Offers", sublabel: "PREMIUM DEALS", link: "/offers" },
    { id: 3, url: "", label: "Gallery", sublabel: "CAPTURED MOMENTS", link: "/gallery" },
    { id: 4, url: "", label: "Experiences", sublabel: "UNFORGETTABLE", link: "/programs" },
  ]);

  const [newWord, setNewWord] = useState("");
  const [activeTab, setActiveTab] = useState("media");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [uploadingImageId, setUploadingImageId] = useState<number | null>(null);
  const [uploadingBgMedia, setUploadingBgMedia] = useState(false);
  const [uploadingMobileMedia, setUploadingMobileMedia] = useState(false);
  const [uploadingFeaturedImage, setUploadingFeaturedImage] = useState(false);
  const [addingSlide, setAddingSlide] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  // Advanced Text Management
  const [editingStyle, setEditingStyle] = useState<"title" | "subtitle" | "rotating" | "button1" | "button2" | null>(null);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Rotating words preview effect
  useEffect(() => {
    if (!heroData?.rotatingWords || heroData?.rotatingWords.length === 0) return;
    const speed = heroData?.rotatingWordsStyle?.speed || 3000;
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % heroData.rotatingWords.length);
    }, speed);
    return () => clearInterval(interval);
  }, [heroData?.rotatingWords, heroData?.rotatingWordsStyle?.speed]);

  /* ─── Sub-page hero state ─── */
  const [subHeroes, setSubHeroes] = useState<SubPageHero[]>([]);
  const [activeSubPage, setActiveSubPage] = useState<string>("about");
  const [subSaving, setSubSaving] = useState(false);
  const [subHasChanges, setSubHasChanges] = useState(false);
  const [uploadingSubMedia, setUploadingSubMedia] = useState(false);

  /* ─── tRPC ─── */
  const { data: savedData, isLoading: isLoadingData } = trpc.siteSettings.get.useQuery({ category: "hero", key: "hero_settings" }, { staleTime: 30000 });
  const { data: savedDataLegacy } = trpc.siteSettings.get.useQuery({ category: "hero", key: "hero_data" }, { staleTime: 30000 });
  const { data: savedImages, isLoading: isLoadingImages } = trpc.siteSettings.get.useQuery({ category: "hero", key: "hero_images" }, { staleTime: 30000 });
  const { data: savedSubHeroes, isLoading: isLoadingSub } = trpc.siteSettings.get.useQuery({ category: "hero", key: "sub_page_heroes" }, { staleTime: 30000 });
  const setMut = trpc.siteSettings.set.useMutation();
  const uploadImageMut = trpc.gallery.uploadImage.useMutation();

  // Initial fetch from direct Firestore siteSettings collection (primary)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [settingsVal, imagesVal, subVal] = await Promise.all([
          getFirestoreSetting("hero", "hero_settings"),
          getFirestoreSetting("hero", "hero_images"),
          getFirestoreSetting("hero", "sub_page_heroes"),
        ]);
        if (!mounted) return;
        if (settingsVal) {
          try {
            const p = JSON.parse(settingsVal);
            setHeroData(prev => ({
              ...prev,
              ...p,
              backgroundType: p.backgroundType || (p.mediaType === "video" ? "html5-video" : "static-image"),
              sliderEngine: p.sliderEngine || "framer-motion",
              sliderEffect: p.sliderEffect || "fade",
              autoplayMs: typeof p.autoplayMs === "number" ? p.autoplayMs : 3500,
              loopSlides: typeof p.loopSlides === "boolean" ? p.loopSlides : true,
              textFadeInEnabled: typeof p.textFadeInEnabled === "boolean" ? p.textFadeInEnabled : true,
              textFadeInDuration: typeof p.textFadeInDuration === "number" ? p.textFadeInDuration : 900,
              textPositionX: typeof p.textPositionX === "number" ? p.textPositionX : 0,
              textPositionY: typeof p.textPositionY === "number" ? p.textPositionY : 0,
              mobileMediaUrl: p.mobileMediaUrl || "",
              mobileMediaCropX: typeof p.mobileMediaCropX === "number" ? p.mobileMediaCropX : 50,
              mobileMediaCropY: typeof p.mobileMediaCropY === "number" ? p.mobileMediaCropY : 50,
            }));
          } catch {}
        }
        if (imagesVal) {
          try {
            const p = JSON.parse(imagesVal);
            if (Array.isArray(p) && p.length > 0) setHeroImages(p);
          } catch {}
        }
        if (subVal) {
          try {
            const p = JSON.parse(subVal);
            if (Array.isArray(p)) setSubHeroes(p);
          } catch {}
        }
      } catch (err) {
        console.warn("Direct Firestore hero load error:", err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const payload = savedData || savedDataLegacy;
    if (!payload) return;
    try {
      const p = JSON.parse(payload);
      setHeroData(prev => ({
        ...prev,
        ...p,
        backgroundType: p.backgroundType || (p.mediaType === "video" ? "html5-video" : "static-image"),
        sliderEngine: p.sliderEngine || "framer-motion",
        sliderEffect: p.sliderEffect || "fade",
        autoplayMs: typeof p.autoplayMs === "number" ? p.autoplayMs : 3500,
        loopSlides: typeof p.loopSlides === "boolean" ? p.loopSlides : true,
        textFadeInEnabled: typeof p.textFadeInEnabled === "boolean" ? p.textFadeInEnabled : true,
        textFadeInDuration: typeof p.textFadeInDuration === "number" ? p.textFadeInDuration : 900,
        textPositionX: typeof p.textPositionX === "number" ? p.textPositionX : 0,
        textPositionY: typeof p.textPositionY === "number" ? p.textPositionY : 0,
        mobileMediaUrl: p.mobileMediaUrl || "",
        mobileMediaCropX: typeof p.mobileMediaCropX === "number" ? p.mobileMediaCropX : 50,
        mobileMediaCropY: typeof p.mobileMediaCropY === "number" ? p.mobileMediaCropY : 50,
      }));
    } catch {}
  }, [savedData, savedDataLegacy]);
  useEffect(() => { if (savedImages) { try { const p = JSON.parse(savedImages); if (Array.isArray(p) && p.length > 0) setHeroImages(p); } catch {} } }, [savedImages]);
  useEffect(() => { if (savedSubHeroes) { try { const p = JSON.parse(savedSubHeroes); if (Array.isArray(p)) setSubHeroes(p); } catch {} } }, [savedSubHeroes]);

  /* ─── Main Hero persistence ─── */
  const saveToDb = useCallback(async () => {
    setSaving(true);
    try {
      await setFirestoreSetting("hero", "hero_settings", JSON.stringify(heroData));
      await setFirestoreSetting("hero", "hero_images", JSON.stringify(heroImages));
      setMut.mutateAsync({ category: "hero", key: "hero_settings", value: JSON.stringify(heroData) }).catch(() => {});
      setMut.mutateAsync({ category: "hero", key: "hero_images", value: JSON.stringify(heroImages) }).catch(() => {});
      setHasChanges(false);
      toast.success("تم الحفظ في قاعدة البيانات (Firebase Firestore)");
    } catch (err: unknown) {
      toast.error(`فشل في الحفظ: ${err instanceof Error ? err.message : "خطأ غير متوقع"}`);
    } finally { setSaving(false); }
  }, [setMut, heroData, heroImages]);

  /* ─── Sub-page Hero persistence ─── */
  const saveSubHeroes = useCallback(async () => {
    setSubSaving(true);
    try {
      await setFirestoreSetting("hero", "sub_page_heroes", JSON.stringify(subHeroes));
      setMut.mutateAsync({ category: "hero", key: "sub_page_heroes", value: JSON.stringify(subHeroes) }).catch(() => {});
      setSubHasChanges(false);
      toast.success("تم حفظ الصفحات الفرعية (Firebase Firestore)");
    } catch (err: unknown) {
      toast.error(`فشل في الحفظ: ${err instanceof Error ? err.message : "خطأ غير متوقع"}`);
    } finally { setSubSaving(false); }
  }, [setMut, subHeroes]);

  const markData = (data: HeroData) => { setHeroData(data); setHasChanges(true); };
  const markImages = (images: HeroImage[]) => { setHeroImages(images); setHasChanges(true); };

  /* ─── Media upload (Firebase Storage) ─── */
  const uploadMedia = async (file: File): Promise<string> => {
    if (file.size > MAX_FILE_SIZE) throw new Error("حجم الملف يتجاوز 10MB");
    try {
      // 1. Direct upload to Firebase Storage (reliable on static hosting)
      const downloadUrl = await uploadDirectMedia(file, "hero");
      return downloadUrl;
    } catch (directErr) {
      console.warn("Direct upload fallback to tRPC:", directErr);
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.split(",")[1];
      const res = await uploadImageMut.mutateAsync({
        fileData: base64,
        filename: file.name,
        mimeType: file.type,
      });
      if (res && res.url) return res.url;
      throw directErr;
    }
  };

  const handleImageUpload = async (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImageId(id);
    try {
      const url = await uploadMedia(file);
      markImages(heroImages.map(img => img.id === id ? { ...img, url } : img));
      toast.success("تم رفع الملف بنجاح (Firebase Storage)");
    } catch (err: unknown) {
      toast.error(`فشل الرفع: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally { setUploadingImageId(null); }
  };

  const handleBgMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBgMedia(true);
    try {
      const url = await uploadMedia(file);
      const mType = file.type.startsWith("video/") ? "video" : "image";
      markData({
        ...heroData,
        mediaUrl: url,
        mediaType: mType as "image" | "video",
        backgroundType: mType === "video" ? "html5-video" : "static-image",
      });
      toast.success("تم رفع الوسائط");
    } catch (err: unknown) {
      toast.error(`فشل الرفع: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally { setUploadingBgMedia(false); }
  };

  const handleMobileMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMobileMedia(true);
    try {
      const url = await uploadMedia(file);
      markData({
        ...heroData,
        mobileMediaUrl: url,
      });
      toast.success("تم رفع صورة الهيرو للموبايل بنجاح");
    } catch (err: unknown) {
      toast.error(`فشل الرفع: ${err instanceof Error ? err.message : "خطأ غير متوقع"}`);
    } finally {
      setUploadingMobileMedia(false);
      e.target.value = "";
    }
  };

  const handleSubMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSubMedia(true);
    try {
      const url = await uploadMedia(file);
      const mType = file.type.startsWith("video/") ? "video" : "image";
      updateSubHero(activeSubPage, { mediaUrl: url, mediaType: mType as "image" | "video" });
      toast.success("تم رفع وسائط الصفحة الفرعية");
    } catch (err: unknown) {
      toast.error(`فشل الرفع: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally { setUploadingSubMedia(false); }
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFeaturedImage(true);
    try {
      const url = await uploadMedia(file);
      markData({ ...heroData, featuredImageUrl: url });
      toast.success("تم رفع الصورة المميزة بنجاح");
    } catch (err: unknown) {
      toast.error(`فشل الرفع: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally { setUploadingFeaturedImage(false); }
  };

  const updateImage = (id: number, field: keyof HeroImage, value: string) => {
    markImages(heroImages.map(img => img.id === id ? { ...img, [field]: value } : img));
  };

  const handleAddNewSlide = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAddingSlide(true);
    try {
      const url = await uploadMedia(file);
      const newSlide: HeroImage = {
        id: Date.now(),
        url,
        label: "",
        sublabel: "",
        link: "",
      };
      markImages([...heroImages, newSlide]);
      toast.success("تم رفع وإضافة الصورة إلى السلايدر بنجاح");
    } catch (err: unknown) {
      toast.error(`فشل الرفع: ${err instanceof Error ? err.message : "خطأ غير متوقع"}`);
    } finally {
      setAddingSlide(false);
      e.target.value = "";
    }
  };

  const handleSlideImageReplace = async (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImageId(id);
    try {
      const url = await uploadMedia(file);
      markImages(heroImages.map(img => img.id === id ? { ...img, url } : img));
      toast.success("تم تحديث صورة الشريحة بنجاح");
    } catch (err: unknown) {
      toast.error(`فشل الرفع: ${err instanceof Error ? err.message : "خطأ غير متوقع"}`);
    } finally {
      setUploadingImageId(null);
      e.target.value = "";
    }
  };

  const handleDeleteSlide = (id: number) => {
    markImages(heroImages.filter(img => img.id !== id));
    toast.info("تم حذف الصورة من السلايدر");
  };

  const addRotatingWord = () => {
    if (newWord.trim()) {
      markData({ ...heroData, rotatingWords: [...heroData.rotatingWords, newWord.trim()] });
      setNewWord("");
    }
  };

  const removeRotatingWord = (index: number) => {
    markData({ ...heroData, rotatingWords: heroData.rotatingWords.filter((_, i) => i !== index) });
  };

  /* ─── Advanced Text Style Functions ─── */
  const updateTitleStyle = (updates: Partial<TextStyle>) => {
    markData({
      ...heroData,
      titleStyle: { ...heroData.titleStyle, ...updates } as TextStyle,
    });
  };

  const updateSubtitleStyle = (updates: Partial<TextStyle>) => {
    markData({
      ...heroData,
      subtitleStyle: { ...heroData.subtitleStyle, ...updates } as TextStyle,
    });
  };

  const updateRotatingWordsStyle = (updates: Partial<RotatingWordsStyle>) => {
    markData({
      ...heroData,
      rotatingWordsStyle: { ...heroData.rotatingWordsStyle, ...updates } as RotatingWordsStyle,
    });
  };

  const updateButton1Style = (updates: Partial<TextStyle>) => {
    markData({
      ...heroData,
      button1Style: { ...heroData.button1Style, ...updates } as TextStyle,
    });
  };

  const updateButton2Style = (updates: Partial<TextStyle>) => {
    markData({
      ...heroData,
      button2Style: { ...heroData.button2Style, ...updates } as TextStyle,
    });
  };

  const resetTitleStyle = () => updateTitleStyle({ ...DEFAULT_TEXT_STYLE, fontSize: 56, fontWeight: "900" });
  const resetSubtitleStyle = () => updateSubtitleStyle({ ...DEFAULT_TEXT_STYLE, fontSize: 32, fontWeight: "bold" });
  const resetRotatingStyle = () => updateRotatingWordsStyle(DEFAULT_ROTATING_STYLE);
  const resetButton1Style = () => updateButton1Style({ ...DEFAULT_TEXT_STYLE, fontSize: 16, fontWeight: "bold" });
  const resetButton2Style = () => updateButton2Style({ ...DEFAULT_TEXT_STYLE, fontSize: 16, fontWeight: "bold" });

  /* ─── Sub-page hero helpers ─── */
  const getSubHero = (page: string): SubPageHero => {
    return subHeroes.find(h => h.page === page) || { ...DEFAULT_SUB_HERO, page };
  };

  const updateSubHero = (page: string, updates: Partial<SubPageHero>) => {
    setSubHeroes(prev => {
      const existing = prev.find(h => h.page === page);
      if (existing) return prev.map(h => h.page === page ? { ...h, ...updates } : h);
      return [...prev, { ...DEFAULT_SUB_HERO, page, ...updates }];
    });
    setSubHasChanges(true);
  };

  const mainTabs = [
    { id: "media" as const, label: "الخلفية والوسائط (ثابتة / سلايدر)", icon: Film },
    { id: "images" as const, label: "إدارة شرائح السلايدر", icon: ImageIcon },
    { id: "text" as const, label: "النصوص", icon: Type },
    { id: "advanced" as const, label: "تنسيق الخطوط والألوان", icon: Palette },
    { id: "buttons" as const, label: "الأزرار", icon: Link2 },
  ];

  if (isLoadingData || isLoadingImages || isLoadingSub) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[var(--theme-primary)]" size={48} /></div>;

  const currentSubHero = getSubHero(activeSubPage);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-[var(--theme-primary)]" size={24} />
            إدارة Hero Section
          </h1>
          <p className="text-white/50 text-sm mt-1">إدارة الواجهة الرئيسية والصفحات الفرعية مع دعم الصور والفيديو</p>
        </div>
      </div>

      <Tabs defaultValue="main" className="space-y-4">
        <TabsList className="bg-black/40 border border-white/10">
          <TabsTrigger value="main" className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]">
            <Monitor className="w-4 h-4 ml-1" /> الصفحة الرئيسية
          </TabsTrigger>
          <TabsTrigger value="subpages" className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]">
            <Layout className="w-4 h-4 ml-1" /> الصفحات الفرعية
          </TabsTrigger>
        </TabsList>

        {/* ═══ Main Hero Tab ═══ */}
        <TabsContent value="main" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {mainTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20"
                      : "text-white/50 hover:text-white/80 border border-transparent"
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              {hasChanges && <div className="flex items-center gap-2 text-yellow-400"><AlertCircle size={16} /><span className="text-sm">تغييرات غير محفوظة</span></div>}
              <Button onClick={saveToDb} disabled={saving || !hasChanges} className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold">
                {saving ? <Loader2 size={16} className="ml-2 animate-spin" /> : <Save size={16} className="ml-2" />}
                {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Form */}
            <div className="space-y-4 bg-[var(--theme-surface)] border border-white/5 rounded-lg p-6">
              {activeTab === "text" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">النصوص الرئيسية</h3>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">العنوان الرئيسي</label>
                    <Input value={heroData.title} onChange={(e) => markData({ ...heroData, title: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" placeholder="VANIR GROUP — LUXURY TRAVEL" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">الكلمات المتغيرة</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {heroData.rotatingWords.map((word, i) => (
                        <span key={i} className="flex items-center gap-1 px-3 py-1 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] rounded-full text-sm border border-[var(--theme-primary)]/20">
                          {word}
                          <button onClick={() => removeRotatingWord(i)} className="ml-1 text-[var(--theme-primary)]/60 hover:text-red-400">&times;</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input value={newWord} onChange={(e) => setNewWord(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addRotatingWord()} className="bg-[#1a1a1a] border-white/10 text-white" placeholder="أضف كلمة جديدة..." />
                      <Button onClick={addRotatingWord} variant="outline" className="border-[var(--theme-primary)]/20 text-[var(--theme-primary)]">إضافة</Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">العنوان الفرعي</label>
                    <Input value={heroData.subtitle} onChange={(e) => markData({ ...heroData, subtitle: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" placeholder="Egypt's Wonders" />
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-sm font-semibold text-white mb-4">موضع النص</h4>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white/70 text-sm">المحور الأفقي (X): {heroData.textPositionX ?? 0}%</Label>
                        <Slider value={[heroData.textPositionX ?? 0]} onValueChange={([v]) => markData({ ...heroData, textPositionX: v })} min={-50} max={50} step={1} className="mt-2" />
                      </div>
                      <div>
                        <Label className="text-white/70 text-sm">المحور الرأسي (Y): {heroData.textPositionY ?? 0}%</Label>
                        <Slider value={[heroData.textPositionY ?? 0]} onValueChange={([v]) => markData({ ...heroData, textPositionY: v })} min={-50} max={50} step={1} className="mt-2" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "advanced" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Palette size={20} /> تنسيق النصوص المتقدم</h3>
                  <p className="text-sm text-white/50">التحكم الكامل في مظهر وسلوك النصوص والأزرار</p>

                  {/* Title Style */}
                  <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white flex items-center gap-2"><Type size={16} /> العنوان الرئيسي</span>
                      <Button onClick={resetTitleStyle} variant="ghost" size="sm" className="text-xs text-white/50 hover:text-white/70">
                        <RotateCcw size={14} className="mr-1" /> إعادة تعيين
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-white/60">حجم الخط</Label>
                        <div className="flex items-center gap-2">
                          <Slider value={[heroData.titleStyle?.fontSize || 56]} onValueChange={(v) => updateTitleStyle({ fontSize: v[0] })} min={16} max={96} step={2} className="flex-1" />
                          <span className="text-xs text-white/70 w-8">{heroData.titleStyle?.fontSize || 56}px</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-white/60">سمك الخط</Label>
                        <Select value={heroData.titleStyle?.fontWeight || "bold"} onValueChange={(v) => updateTitleStyle({ fontWeight: v as any })}>
                          <SelectTrigger className="bg-black/40 border-white/10 h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">عادي</SelectItem>
                            <SelectItem value="bold">غامق</SelectItem>
                            <SelectItem value="900">فائق الغموق</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-white/60">اللون</Label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={heroData.titleStyle?.color || "#ffffff"} onChange={(e) => updateTitleStyle({ color: e.target.value })} className="h-8 w-12 rounded cursor-pointer border border-white/10" />
                          <span className="text-xs text-white/70">{heroData.titleStyle?.color || "#ffffff"}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-white/60">التحويل</Label>
                        <Select value={heroData.titleStyle?.textTransform || "none"} onValueChange={(v) => updateTitleStyle({ textTransform: v as any })}>
                          <SelectTrigger className="bg-black/40 border-white/10 h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">عادي</SelectItem>
                            <SelectItem value="uppercase">أحرف كبيرة</SelectItem>
                            <SelectItem value="lowercase">أحرف صغيرة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="border-t border-white/10 pt-3">
                      <Label className="text-xs text-white/60 flex items-center gap-2 mb-2"><Sparkles size={14} /> الظل النصي</Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={heroData.titleStyle?.textShadow || false} onChange={(e) => updateTitleStyle({ textShadow: e.target.checked })} className="w-4 h-4 rounded" />
                          <span className="text-sm text-white/70">تفعيل الظل</span>
                        </div>
                        {heroData.titleStyle?.textShadow && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs text-white/60">لون الظل</Label>
                              <input type="color" value={heroData.titleStyle?.shadowColor || "#000000"} onChange={(e) => updateTitleStyle({ shadowColor: e.target.value })} className="h-6 w-full rounded cursor-pointer border border-white/10" />
                            </div>
                            <div>
                              <Label className="text-xs text-white/60">ضبابية</Label>
                              <Slider value={[heroData.titleStyle?.shadowBlur || 8]} onValueChange={(v) => updateTitleStyle({ shadowBlur: v[0] })} min={0} max={20} step={1} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rotating Words Style */}
                  <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white flex items-center gap-2"><Zap size={16} /> الكلمات الدوارة</span>
                      <Button onClick={resetRotatingStyle} variant="ghost" size="sm" className="text-xs text-white/50 hover:text-white/70">
                        <RotateCcw size={14} className="mr-1" /> إعادة تعيين
                      </Button>
                    </div>
                    <div>
                      <Label className="text-xs text-white/60">نوع الرسوم المتحركة</Label>
                      <Select value={heroData.rotatingWordsStyle?.animation || "fade"} onValueChange={(v) => updateRotatingWordsStyle({ animation: v as any })}>
                        <SelectTrigger className="bg-black/40 border-white/10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fade">تلاشي (Fade)</SelectItem>
                          <SelectItem value="slide">انزلاق (Slide)</SelectItem>
                          <SelectItem value="flip">قلب (Flip)</SelectItem>
                          <SelectItem value="zoom">تكبير (Zoom)</SelectItem>
                          <SelectItem value="typewriter">كاتبة (Typewriter)</SelectItem>
                          <SelectItem value="bounce">ارتداد (Bounce)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-white/60">السرعة (ميلي ثانية)</Label>
                        <div className="flex items-center gap-2">
                          <Slider value={[heroData.rotatingWordsStyle?.speed || 3000]} onValueChange={(v) => updateRotatingWordsStyle({ speed: v[0] })} min={1000} max={10000} step={500} className="flex-1" />
                          <span className="text-xs text-white/70 w-12">{heroData.rotatingWordsStyle?.speed || 3000}ms</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-white/60">اللون</Label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={heroData.rotatingWordsStyle?.textColor || "#FFD700"} onChange={(e) => updateRotatingWordsStyle({ textColor: e.target.value })} className="h-8 w-12 rounded cursor-pointer border border-white/10" />
                          <span className="text-xs text-white/70">{heroData.rotatingWordsStyle?.textColor || "#FFD700"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "media" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">الخلفية والوسائط</h3>
                    <p className="text-sm text-white/50">تحكم كامل في مظهر خلفية الصفحة الرئيسية (صورة ثابتة، سلايدر متعدد، أو فيديو)</p>
                  </div>

                  {/* Mode Selector Cards */}
                  <div>
                    <Label className="text-white font-medium text-sm mb-3 block">اختر نوع الخلفية:</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* 1. Static Image Card */}
                      <div
                        onClick={() => markData({ ...heroData, backgroundType: "static-image", mediaType: "image" })}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          (heroData.backgroundType || "static-image") === "static-image"
                            ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 text-white shadow-lg"
                            : "border-white/10 bg-black/40 text-white/60 hover:border-white/30 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2 font-bold text-sm">
                          <ImageIcon className="w-5 h-5 text-[var(--theme-primary)]" />
                          <span>صورة ثابتة</span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">
                          صورة واحدة ثابتة للموقع دون أي تقليب أو سلايدر (مثالي لمواسم وحملات معينة).
                        </p>
                      </div>

                      {/* 2. Dynamic Slider Card */}
                      <div
                        onClick={() => markData({ ...heroData, backgroundType: "dynamic-slider", mediaType: "image" })}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          heroData.backgroundType === "dynamic-slider"
                            ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 text-white shadow-lg"
                            : "border-white/10 bg-black/40 text-white/60 hover:border-white/30 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2 font-bold text-sm">
                          <Film className="w-5 h-5 text-[var(--theme-primary)]" />
                          <span>سلايدر متعدد الصور</span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">
                          تقليب تلقائي بين عدة صور مع إمكانية حذف أو إضافة أي صور بحرية تامة.
                        </p>
                      </div>

                      {/* 3. HTML5 Video Card */}
                      <div
                        onClick={() => markData({ ...heroData, backgroundType: "html5-video", mediaType: "video" })}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          heroData.backgroundType === "html5-video"
                            ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 text-white shadow-lg"
                            : "border-white/10 bg-black/40 text-white/60 hover:border-white/30 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2 font-bold text-sm">
                          <Zap className="w-5 h-5 text-[var(--theme-primary)]" />
                          <span>فيديو HTML5</span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">
                          مقطع فيديو صامت بحركة مستمرة في خلفية الصفحة الرئيسية.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mode 1: Static Image Settings */}
                  {(heroData.backgroundType || "static-image") === "static-image" && (
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-[var(--theme-primary)]" />
                          <h4 className="font-semibold text-white">إعدادات الصورة الثابتة</h4>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          الوضع النشط حالياً
                        </span>
                      </div>

                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300/90 leading-relaxed">
                        💡 <strong>وضع الصورة الثابتة مفعل:</strong> ستظهر هذه الصورة فقط كخلفية مستقرة للصفحة الرئيسية دون أي دوران أو سلايدر أو أسهم. يمكنك استبدالها أو مسحها أو التبديل للسلايدر عندما ترغب.
                      </div>

                      {heroData.mediaUrl ? (
                        <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black/40">
                          <img
                            src={heroData.mediaUrl}
                            className="w-full h-48 object-cover rounded-lg"
                            style={{ objectPosition: `${heroData.mediaCropX ?? 50}% ${heroData.mediaCropY ?? 50}%` }}
                            alt="Static background"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <label
                              htmlFor="replace-static-bg"
                              className="px-4 py-2 bg-[var(--theme-primary)] text-black rounded-lg text-xs font-bold cursor-pointer hover:bg-[var(--theme-primary-light)] flex items-center gap-1.5"
                            >
                              <Upload size={14} /> تغيير الصورة
                            </label>
                            <button
                              type="button"
                              onClick={() => markData({ ...heroData, mediaUrl: "" })}
                              className="px-4 py-2 bg-red-600/80 text-white rounded-lg text-xs font-bold hover:bg-red-600 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Trash2 size={14} /> إزالة الصورة
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-white/15 rounded-xl p-8 text-center bg-black/20 hover:border-[var(--theme-primary)]/50 transition-colors">
                          <ImageIcon className="w-12 h-12 text-white/30 mx-auto mb-3" />
                          <p className="text-sm text-white/70 mb-2">لا توجد صورة ثابتة محددة حالياً</p>
                          <p className="text-xs text-white/40 mb-4">اضغط على الزر أدناه لاختيار صورة من جهازك</p>
                          <label
                            htmlFor="replace-static-bg"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-primary)] text-black font-bold text-xs rounded-lg cursor-pointer hover:bg-[var(--theme-primary-light)] transition-all shadow-lg"
                          >
                            <Upload size={14} /> رفع صورة ثابتة
                          </label>
                        </div>
                      )}
                      <input
                        type="file"
                        accept={ACCEPTED_IMAGE_TYPES}
                        onChange={handleBgMediaUpload}
                        className="hidden"
                        id="replace-static-bg"
                        disabled={uploadingBgMedia}
                      />

                      {/* Crop sliders */}
                      <div className="space-y-3 pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                            <Maximize size={14} /> ضبط موضع الصورة (Crop X / Y)
                          </span>
                          <span className="text-[11px] text-white/40">
                            X: {heroData.mediaCropX ?? 50}% | Y: {heroData.mediaCropY ?? 50}%
                          </span>
                        </div>
                        <div>
                          <Label className="text-white/60 text-xs">المحور الأفقي (يمين / يسار): {heroData.mediaCropX ?? 50}%</Label>
                          <Slider
                            value={[heroData.mediaCropX ?? 50]}
                            onValueChange={([v]) => markData({ ...heroData, mediaCropX: v })}
                            min={0}
                            max={100}
                            step={5}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-white/60 text-xs">المحور الرأسي (أعلى / أسفل): {heroData.mediaCropY ?? 50}%</Label>
                          <Slider
                            value={[heroData.mediaCropY ?? 50]}
                            onValueChange={([v]) => markData({ ...heroData, mediaCropY: v })}
                            min={0}
                            max={100}
                            step={5}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      {/* Direct Instant Save button right under the image controls */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 bg-black/30 p-3 rounded-lg">
                        <span className="text-[11px] text-[#8892B0]">
                          {hasChanges ? "⚠️ توجد تعديلات جديدة بانتظار الحفظ" : "✓ الصورة الثابتة محفوظة ومتزامنة بالسحابة"}
                        </span>
                        <Button
                          type="button"
                          onClick={saveToDb}
                          disabled={saving}
                          className="bg-gradient-to-r from-[var(--theme-primary)] to-[#e6c875] text-black hover:opacity-95 font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-[0_2px_12px_rgba(201,168,76,0.3)] cursor-pointer"
                        >
                          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                          <span>{saving ? "جاري النشر في السحابة..." : "حفظ ونشر الصورة فورياً"}</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Dynamic Slider Settings */}
                  {heroData.backgroundType === "dynamic-slider" && (
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Film className="w-5 h-5 text-[var(--theme-primary)]" />
                          <h4 className="font-semibold text-white">إدارة صور السلايدر ({heroImages.length} صور)</h4>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] border border-[var(--theme-primary)]/30">
                          سلايدر متعدد الصور
                        </span>
                      </div>

                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300/90 leading-relaxed">
                        🎞️ <strong>حرية كاملة في السلايدر:</strong> يمكنك إضافة أي عدد من الصور ومسح أي صورة بنقرة واحدة. ستقوم الواجهة بالتقليب بين الصور المعروضة هنا فقط.
                      </div>

                      {/* Add new slide button */}
                      <div>
                        <input
                          type="file"
                          accept={ACCEPTED_IMAGE_TYPES}
                          onChange={handleAddNewSlide}
                          className="hidden"
                          id="add-new-slider-slide"
                          disabled={addingSlide}
                        />
                        <label
                          htmlFor="add-new-slider-slide"
                          className={`w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-[var(--theme-primary)]/40 bg-[var(--theme-primary)]/5 hover:bg-[var(--theme-primary)]/15 rounded-xl cursor-pointer text-[var(--theme-primary)] font-bold text-sm transition-all shadow-sm ${
                            addingSlide ? "opacity-60 cursor-not-allowed" : ""
                          }`}
                        >
                          {addingSlide ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                          {addingSlide ? "جاري رفع الصورة وإضافتها للسلايدر..." : "+ إضافة صورة جديدة للسلايدر"}
                        </label>
                      </div>

                      {/* Slides list */}
                      <div className="space-y-3">
                        {heroImages.length === 0 ? (
                          <div className="p-6 text-center border border-white/10 rounded-xl bg-black/20">
                            <p className="text-sm text-white/50">لا توجد صور مضافة للسلايدر حالياً.</p>
                            <p className="text-xs text-white/30 mt-1">اضغط على زر الإضافة بالأعلى لاختيار صور من جهازك.</p>
                          </div>
                        ) : (
                          heroImages.map((img, idx) => (
                            <div
                              key={img.id}
                              className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-black/40 border border-white/10 rounded-xl hover:border-white/20 transition-all"
                            >
                              <div className="flex items-center gap-3 w-full sm:w-auto">
                                <span className="w-6 h-6 rounded-full bg-white/10 text-white/70 text-xs font-bold flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                {img.url ? (
                                  <img
                                    src={img.url}
                                    alt={`Slide ${idx + 1}`}
                                    className="w-24 h-16 object-cover rounded-lg border border-white/10"
                                  />
                                ) : (
                                  <div className="w-24 h-16 bg-white/5 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-white/30 text-xs">
                                    بدون صورة
                                  </div>
                                )}
                                <div className="text-right">
                                  <p className="text-xs font-semibold text-white">شريحة #{idx + 1}</p>
                                  <p className="text-[11px] text-white/40 truncate max-w-[180px]">
                                    {img.url ? img.url.split("/").pop() : "لم يتم تحديد صورة"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <input
                                  type="file"
                                  accept={ACCEPTED_IMAGE_TYPES}
                                  onChange={(e) => handleSlideImageReplace(img.id, e)}
                                  className="hidden"
                                  id={`replace-slide-img-${img.id}`}
                                  disabled={uploadingImageId === img.id}
                                />
                                <label
                                  htmlFor={`replace-slide-img-${img.id}`}
                                  className={`px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
                                    uploadingImageId === img.id ? "opacity-60 cursor-not-allowed" : ""
                                  }`}
                                >
                                  {uploadingImageId === img.id ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                                  {uploadingImageId === img.id ? "جاري التغيير..." : "تغيير الصورة"}
                                </label>

                                <Button
                                  type="button"
                                  onClick={() => handleDeleteSlide(img.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 h-auto text-xs cursor-pointer"
                                >
                                  <Trash2 size={14} className="ml-1 text-red-400" />
                                  حذف الصورة
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Slider Autoplay & Loop Controls */}
                      <div className="pt-3 border-t border-white/10 space-y-3">
                        <h5 className="text-xs font-semibold text-white/80">إعدادات توقيت السلايدر</h5>
                        <div>
                          <Label className="text-white/60 text-xs">
                            سرعة التقليب التلقائي: {((heroData.autoplayMs || 3500) / 1000).toFixed(1)} ثوانٍ
                          </Label>
                          <Slider
                            value={[heroData.autoplayMs || 3500]}
                            onValueChange={([v]) => markData({ ...heroData, autoplayMs: v })}
                            min={2000}
                            max={10000}
                            step={500}
                            className="mt-1"
                          />
                        </div>
                        <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={heroData.loopSlides ?? true}
                            onChange={(e) => markData({ ...heroData, loopSlides: e.target.checked })}
                            className="rounded border-white/20 bg-black/40 text-[var(--theme-primary)]"
                          />
                          تشغيل السلايدر بشكل دائري مستمر (Loop)
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Mode 3: HTML5 Video Settings */}
                  {heroData.backgroundType === "html5-video" && (
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-[var(--theme-primary)]" />
                          <h4 className="font-semibold text-white">فيديو الخلفية (HTML5 Video)</h4>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          فيديو
                        </span>
                      </div>

                      {heroData.mediaUrl && isVideoUrl(heroData.mediaUrl) ? (
                        <div className="space-y-3">
                          <video
                            src={heroData.mediaUrl}
                            className="w-full h-44 object-cover rounded-lg border border-white/10"
                            muted
                            autoPlay
                            loop
                            playsInline
                          />
                          <div className="flex items-center gap-3">
                            <input
                              type="file"
                              accept={ACCEPTED_VIDEO_TYPES}
                              onChange={handleBgMediaUpload}
                              className="hidden"
                              id="replace-bg-video"
                              disabled={uploadingBgMedia}
                            />
                            <label
                              htmlFor="replace-bg-video"
                              className="px-4 py-2 bg-[var(--theme-primary)] text-black rounded-lg text-xs font-bold cursor-pointer hover:bg-[var(--theme-primary-light)] flex items-center gap-1.5"
                            >
                              <Upload size={14} /> تغيير الفيديو
                            </label>
                            <button
                              type="button"
                              onClick={() => markData({ ...heroData, mediaUrl: "" })}
                              className="px-4 py-2 bg-red-600/80 text-white rounded-lg text-xs font-bold hover:bg-red-600 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Trash2 size={14} /> إزالة الفيديو
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-white/15 rounded-xl p-8 text-center bg-black/20">
                          <p className="text-sm text-white/70 mb-2">ارفع ملف فيديو لخلفية الهيرو</p>
                          <p className="text-xs text-white/40 mb-4">يدعم صيغ MP4 و WebM (حد أقصى 10MB)</p>
                          <input
                            type="file"
                            accept={ACCEPTED_VIDEO_TYPES}
                            onChange={handleBgMediaUpload}
                            className="hidden"
                            id="upload-bg-video"
                            disabled={uploadingBgMedia}
                          />
                          <label
                            htmlFor="upload-bg-video"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-primary)] text-black font-bold text-xs rounded-lg cursor-pointer hover:bg-[var(--theme-primary-light)] transition-all"
                          >
                            {uploadingBgMedia ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                            {uploadingBgMedia ? "جاري رفع الفيديو..." : "رفع فيديو خلفية"}
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mobile Hero Image Card */}
                  <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-[var(--theme-primary)]" />
                        <h4 className="font-semibold text-white">صورة الهيرو المخصصة لشاشات الموبايل (Mobile Image)</h4>
                      </div>
                      {heroData.mobileMediaUrl ? (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          محددة ونشطة
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/50 border border-white/10">
                          تلقائي (صورة الكمبيوتر)
                        </span>
                      )}
                    </div>

                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs text-purple-300/90 leading-relaxed">
                      📱 <strong>مظهر مثالي للهواتف:</strong> يمكنك رفع صورة رأسية (طولية Portrait) لتظهر حصرياً للزوار الذين يتصفحون الموقع من الموبايل. في حال عدم رفع صورة هنا، سيستخدم الموقع صورة الكمبيوتر تلقائياً.
                    </div>

                    {heroData.mobileMediaUrl ? (
                      <div className="flex flex-col sm:flex-row items-center gap-5 p-3 bg-black/40 rounded-xl border border-white/10">
                        <div className="w-32 h-52 rounded-xl overflow-hidden border-2 border-[var(--theme-primary)]/50 relative flex-shrink-0 bg-black shadow-lg">
                          <img
                            src={heroData.mobileMediaUrl}
                            alt="Mobile hero preview"
                            className="w-full h-full object-cover"
                            style={{ objectPosition: `${heroData.mobileMediaCropX ?? 50}% ${heroData.mobileMediaCropY ?? 50}%` }}
                          />
                          <div className="absolute top-1.5 right-1.5 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-[var(--theme-primary)] font-bold">
                            Mobile 9:16
                          </div>
                        </div>

                        <div className="space-y-4 flex-1 w-full">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-white">صورة الموبايل الحالية</p>
                            <p className="text-[11px] text-white/40 truncate max-w-xs">{heroData.mobileMediaUrl.split("/").pop()}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept={ACCEPTED_IMAGE_TYPES}
                              onChange={handleMobileMediaUpload}
                              className="hidden"
                              id="replace-mobile-hero-bg"
                              disabled={uploadingMobileMedia}
                            />
                            <label
                              htmlFor="replace-mobile-hero-bg"
                              className={`px-4 py-2 bg-[var(--theme-primary)] text-black rounded-lg text-xs font-bold cursor-pointer hover:bg-[var(--theme-primary-light)] transition-all flex items-center gap-1.5 ${
                                uploadingMobileMedia ? "opacity-60 cursor-not-allowed" : ""
                              }`}
                            >
                              {uploadingMobileMedia ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                              {uploadingMobileMedia ? "جاري الرفع..." : "تغيير صورة الموبايل"}
                            </label>

                            <button
                              type="button"
                              onClick={() => markData({ ...heroData, mobileMediaUrl: "" })}
                              className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold hover:bg-red-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Trash2 size={14} /> إزالة صورة الموبايل
                            </button>
                          </div>

                          {/* Mobile Crop sliders */}
                          <div className="space-y-3 pt-3 border-t border-white/10">
                            <div>
                              <Label className="text-white/70 text-xs">ضبط التوسيط الأفقي للموبايل (X): {heroData.mobileMediaCropX ?? 50}%</Label>
                              <Slider
                                value={[heroData.mobileMediaCropX ?? 50]}
                                onValueChange={([v]) => markData({ ...heroData, mobileMediaCropX: v })}
                                min={0}
                                max={100}
                                step={5}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-white/70 text-xs">ضبط التوسيط الرأسي للموبايل (Y): {heroData.mobileMediaCropY ?? 50}%</Label>
                              <Slider
                                value={[heroData.mobileMediaCropY ?? 50]}
                                onValueChange={([v]) => markData({ ...heroData, mobileMediaCropY: v })}
                                min={0}
                                max={100}
                                step={5}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-white/15 rounded-xl p-6 text-center bg-black/20 hover:border-[var(--theme-primary)]/50 transition-colors">
                        <Smartphone className="w-10 h-10 text-white/30 mx-auto mb-2" />
                        <p className="text-sm text-white/70 mb-1">لا توجد صورة مخصصة للموبايل حالياً</p>
                        <p className="text-xs text-white/40 mb-4">في حال عدم رفع صورة مخصصة، سيتم استخدام صورة الكمبيوتر الافتراضية تلقائياً.</p>
                        <input
                          type="file"
                          accept={ACCEPTED_IMAGE_TYPES}
                          onChange={handleMobileMediaUpload}
                          className="hidden"
                          id="upload-mobile-hero-bg"
                          disabled={uploadingMobileMedia}
                        />
                        <label
                          htmlFor="upload-mobile-hero-bg"
                          className={`inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-primary)]/15 border border-[var(--theme-primary)]/40 text-[var(--theme-primary)] font-bold text-xs rounded-lg cursor-pointer hover:bg-[var(--theme-primary)] hover:text-black transition-all ${
                            uploadingMobileMedia ? "opacity-60 cursor-not-allowed" : ""
                          }`}
                        >
                          {uploadingMobileMedia ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                          {uploadingMobileMedia ? "جاري الرفع..." : "+ رفع صورة مخصصة لشاشات الموبايل"}
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Overlay Settings (common to all modes) */}
                  <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 space-y-4">
                    <h4 className="text-sm font-semibold text-white">إعدادات تراكب الخلفية (Overlay)</h4>
                    <div>
                      <Label className="text-white/70 text-xs">شفافية التراكب: {heroData.overlayOpacity}%</Label>
                      <Slider
                        value={[heroData.overlayOpacity]}
                        onValueChange={([v]) => markData({ ...heroData, overlayOpacity: v })}
                        min={0}
                        max={100}
                        step={5}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-white/70 text-xs mb-1.5 block">لون التراكب</Label>
                      <Select
                        value={heroData.overlayColor}
                        onValueChange={(v) => markData({ ...heroData, overlayColor: v as "dark" | "light" })}
                      >
                        <SelectTrigger className="bg-black/40 border-white/10 text-white h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dark">داكن (أسود)</SelectItem>
                          <SelectItem value="light">فاتح (أبيض)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "images" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">إدارة شرائح السلايدر (Hero Slides)</h3>
                      <p className="text-sm text-white/50">أضف واحذف وعدّل الصور التي تظهر في سلايدر الصفحة الرئيسية</p>
                    </div>
                  </div>

                  {heroData.backgroundType !== "dynamic-slider" && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-amber-300">السلايدر غير مفعل حالياً</p>
                        <p className="text-xs text-amber-300/70">
                          الوضع النشط حالياً هو &quot;{heroData.backgroundType === "html5-video" ? "فيديو" : "صورة ثابتة"}&quot;. لتشغيل هذه الصور كسلايدر على الموقع:
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => markData({ ...heroData, backgroundType: "dynamic-slider", mediaType: "image" })}
                        size="sm"
                        className="bg-[var(--theme-primary)] text-black font-bold hover:bg-[var(--theme-primary-light)] whitespace-nowrap"
                      >
                        تفعيل وضع السلايدر الآن
                      </Button>
                    </div>
                  )}

                  {/* Add Slide */}
                  <div>
                    <input
                      type="file"
                      accept={ACCEPTED_IMAGE_TYPES}
                      onChange={handleAddNewSlide}
                      className="hidden"
                      id="tab-add-new-slide"
                      disabled={addingSlide}
                    />
                    <label
                      htmlFor="tab-add-new-slide"
                      className={`w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-[var(--theme-primary)]/40 bg-[var(--theme-primary)]/5 hover:bg-[var(--theme-primary)]/15 rounded-xl cursor-pointer text-[var(--theme-primary)] font-bold text-sm transition-all shadow-sm ${
                        addingSlide ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    >
                      {addingSlide ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                      {addingSlide ? "جاري رفع وإضافة الصورة..." : "+ إضافة صورة جديدة للسلايدر"}
                    </label>
                  </div>

                  {/* Slides List */}
                  <div className="space-y-3">
                    {heroImages.length === 0 ? (
                      <div className="p-8 text-center border border-white/10 rounded-xl bg-black/20">
                        <ImageIcon className="w-12 h-12 text-white/20 mx-auto mb-2" />
                        <p className="text-sm text-white/60">لا توجد صور في السلايدر حالياً.</p>
                        <p className="text-xs text-white/40 mt-1">اضغط على زر الإضافة أعلاه لإدراج صور.</p>
                      </div>
                    ) : (
                      heroImages.map((img, idx) => (
                        <div
                          key={img.id}
                          className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-black/40 border border-white/10 rounded-xl hover:border-white/20 transition-all"
                        >
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <span className="w-7 h-7 rounded-full bg-white/10 text-white font-bold text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            {img.url ? (
                              <img
                                src={img.url}
                                alt={`Slide ${idx + 1}`}
                                className="w-24 h-16 object-cover rounded-lg border border-white/10"
                              />
                            ) : (
                              <div className="w-24 h-16 bg-white/5 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-white/30 text-xs">
                                بدون صورة
                              </div>
                            )}
                            <div className="text-right">
                              <p className="text-xs font-semibold text-white">شريحة #{idx + 1}</p>
                              <p className="text-[11px] text-white/40 truncate max-w-[200px]">
                                {img.url ? img.url.split("/").pop() : "لم يتم تحديد صورة"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <input
                              type="file"
                              accept={ACCEPTED_IMAGE_TYPES}
                              onChange={(e) => handleSlideImageReplace(img.id, e)}
                              className="hidden"
                              id={`tab-replace-slide-${img.id}`}
                              disabled={uploadingImageId === img.id}
                            />
                            <label
                              htmlFor={`tab-replace-slide-${img.id}`}
                              className={`px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
                                uploadingImageId === img.id ? "opacity-60 cursor-not-allowed" : ""
                              }`}
                            >
                              {uploadingImageId === img.id ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                              {uploadingImageId === img.id ? "جاري التغيير..." : "تغيير الصورة"}
                            </label>

                            <Button
                              type="button"
                              onClick={() => handleDeleteSlide(img.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 h-auto text-xs cursor-pointer"
                            >
                              <Trash2 size={14} className="ml-1 text-red-400" />
                              حذف الصورة
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === "buttons" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">أزرار الـ Hero</h3>
                  <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-medium text-[var(--theme-primary)]">الزر الأول (رئيسي)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-white/50 mb-1">النص</label>
                        <Input value={heroData.buttonText1} onChange={(e) => markData({ ...heroData, buttonText1: e.target.value })} className="bg-[var(--theme-surface)] border-white/10 text-white text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">الرابط</label>
                        <Input value={heroData.buttonLink1} onChange={(e) => markData({ ...heroData, buttonLink1: e.target.value })} className="bg-[var(--theme-surface)] border-white/10 text-white text-sm" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-medium text-[var(--theme-primary)]">الزر الثاني (ثانوي)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-white/50 mb-1">النص</label>
                        <Input value={heroData.buttonText2} onChange={(e) => markData({ ...heroData, buttonText2: e.target.value })} className="bg-[var(--theme-surface)] border-white/10 text-white text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">الرابط</label>
                        <Input value={heroData.buttonLink2} onChange={(e) => markData({ ...heroData, buttonLink2: e.target.value })} className="bg-[var(--theme-surface)] border-white/10 text-white text-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Preview */}
            <div className="bg-[var(--theme-surface)] border-white/5 rounded-lg p-4 lg:p-0 lg:bg-transparent lg:border-none">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Eye className="text-[var(--theme-primary)]" size={20} /> معاينة حية
                  </h3>
                  <div className="flex items-center gap-1 bg-[#1a1a1a] p-1 rounded-lg border border-white/10">
                    <button
                      type="button"
                      onClick={() => setPreviewMode("desktop")}
                      className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all ${
                        previewMode === "desktop"
                          ? "bg-[var(--theme-primary)] text-black shadow"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      <Monitor size={13} /> كمبيوتر
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode("mobile")}
                      className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all ${
                        previewMode === "mobile"
                          ? "bg-[var(--theme-primary)] text-black shadow"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      <Smartphone size={13} /> موبايل
                    </button>
                  </div>
                </div>

                <div className={`transition-all duration-300 relative bg-black overflow-hidden ${
                  previewMode === "mobile"
                    ? "w-64 max-w-full aspect-[9/16] mx-auto rounded-3xl border-4 border-[var(--theme-primary)] shadow-2xl"
                    : "w-full aspect-[16/9] rounded-lg border-2 border-[var(--theme-primary)]"
                }`}>
                  {/* Background media */}
                  {previewMode === "mobile" && heroData.mobileMediaUrl ? (
                    <img
                      src={heroData.mobileMediaUrl}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ objectPosition: `${heroData.mobileMediaCropX ?? 50}% ${heroData.mobileMediaCropY ?? 50}%` }}
                      alt="Mobile preview"
                    />
                  ) : heroData.backgroundType === "dynamic-slider" ? (
                    <img src={heroImages.find((img) => img.url)?.url || heroData.mediaUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
                  ) : heroData.mediaType === "video" && heroData.mediaUrl ? (
                    <video src={heroData.mediaUrl} className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: `${heroData.mediaCropX ?? 50}% ${heroData.mediaCropY ?? 50}%` }} muted autoPlay loop playsInline />
                  ) : heroData.mediaType === "image" && heroData.mediaUrl ? (
                    <img src={heroData.mediaUrl} className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: `${heroData.mediaCropX ?? 50}% ${heroData.mediaCropY ?? 50}%` }} alt="" />
                  ) : (
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, var(--theme-background), var(--theme-surface))` }} />
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0" style={{ backgroundColor: heroData.overlayColor === "dark" ? `rgba(0,0,0,${heroData.overlayOpacity / 100})` : `rgba(255,255,255,${heroData.overlayOpacity / 100})` }} />
                  {/* Text */}
                  <div className="relative z-10 w-full h-full flex flex-col justify-center items-center p-8" style={{ textAlign: (heroData.titleStyle?.textAlign || "center") as any }}>
                    {heroData.title ? (
                      <h1 
                        className="leading-tight tracking-tighter"
                        style={{
                          transition: heroData.textFadeInEnabled ? `opacity ${heroData.textFadeInDuration || 900}ms ease` : undefined,
                          fontSize: `${heroData.titleStyle?.fontSize || 32}px`,
                          fontWeight: heroData.titleStyle?.fontWeight || "bold",
                          color: heroData.titleStyle?.color || "#ffffff",
                          textTransform: (heroData.titleStyle?.textTransform || "none") as any,
                          letterSpacing: `${heroData.titleStyle?.letterSpacing || 1}px`,
                          lineHeight: `${heroData.titleStyle?.lineHeight || 1.4}`,
                          opacity: heroData.titleStyle?.opacity || 1,
                          textShadow: heroData.titleStyle?.textShadow
                            ? `${heroData.titleStyle?.shadowOffsetX || 2}px ${heroData.titleStyle?.shadowOffsetY || 2}px ${heroData.titleStyle?.shadowBlur || 8}px ${heroData.titleStyle?.shadowColor || "rgba(0,0,0,0.5)"}`
                            : "none",
                        }}
                      >
                        {heroData.title}
                      </h1>
                    ) : null}
                    {heroData.rotatingWords && heroData.rotatingWords.length > 0 && heroData.rotatingWords[currentWordIndex] ? (
                      <div 
                        className="font-extrabold tracking-tighter leading-tight my-2 transition-opacity duration-300"
                        style={{
                          fontSize: `${heroData.subtitleStyle?.fontSize || 28}px`,
                          color: heroData.rotatingWordsStyle?.textColor || "#FFD700",
                          backgroundColor: heroData.rotatingWordsStyle?.showBackground 
                            ? (heroData.rotatingWordsStyle?.backgroundColor || "transparent")
                            : "transparent",
                          padding: heroData.rotatingWordsStyle?.showBackground
                            ? `${heroData.rotatingWordsStyle?.paddingY || 4}px ${heroData.rotatingWordsStyle?.paddingX || 8}px`
                            : "0",
                          borderRadius: `${heroData.rotatingWordsStyle?.borderRadius || 4}px`,
                          display: "inline-block",
                          opacity: 0.7,
                        }}
                      >
                        {heroData.rotatingWords[currentWordIndex]}
                      </div>
                    ) : null}
                    {heroData.subtitle ? (
                      <p className="text-sm md:text-lg text-white/80 font-light mt-2" style={{ color: heroData.subtitleStyle?.color || "#ffffff" }}>
                        {heroData.subtitle}
                      </p>
                    ) : null}
                    <div className="mt-4 flex justify-center gap-3">
                      <Button 
                        size="sm" 
                        style={{
                          backgroundColor: heroData.button1BgColor || "#FFD700",
                          color: heroData.button1Style?.color || "#000000",
                          fontSize: `${heroData.button1Style?.fontSize || 14}px`,
                          fontWeight: heroData.button1Style?.fontWeight || "bold",
                        }}
                      >
                        {heroData.buttonText1}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        style={{
                          backgroundColor: heroData.button2BgColor || "transparent",
                          color: heroData.button2Style?.color || "#ffffff",
                          borderColor: "rgba(255,255,255,0.5)",
                          fontSize: `${heroData.button2Style?.fontSize || 14}px`,
                          fontWeight: heroData.button2Style?.fontWeight || "bold",
                        }}
                      >
                        {heroData.buttonText2}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-[#1a1a1a] border border-white/10 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">نمط الخلفية:</span>
                    <span className="font-semibold text-[var(--theme-primary)]">
                      {(heroData.backgroundType || "static-image") === "static-image" && "صورة ثابتة (بدون سلايدر)"}
                      {heroData.backgroundType === "dynamic-slider" && `سلايدر متعدد (${heroImages.length} صور)`}
                      {heroData.backgroundType === "html5-video" && "فيديو HTML5"}
                    </span>
                  </div>

                  {heroData.backgroundType === "dynamic-slider" && heroImages.length > 0 && (
                    <div>
                      <p className="text-[11px] text-white/40 mb-1.5">شرائح السلايدر النشطة:</p>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {heroImages.map((img, idx) => (
                          <div key={img.id || idx} className="relative flex-shrink-0 w-16 h-11 rounded-lg overflow-hidden border border-white/10 group">
                            {img.url ? (
                              <img src={img.url} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full bg-white/5 flex items-center justify-center text-[9px] text-white/30">فارغ</div>
                            )}
                            <span className="absolute top-0.5 right-0.5 bg-black/70 text-white text-[9px] px-1 rounded font-bold">
                              {idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ═══ Sub-Pages Hero Tab ═══ */}
        <TabsContent value="subpages" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/50">تخصيص Hero Section فريد لكل صفحة فرعية مع 3 تخطيطات مختلفة</p>
            <div className="flex items-center gap-3">
              {subHasChanges && <div className="flex items-center gap-2 text-yellow-400"><AlertCircle size={16} /><span className="text-sm">تغييرات غير محفوظة</span></div>}
              <Button onClick={saveSubHeroes} disabled={subSaving || !subHasChanges} className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold">
                {subSaving ? <Loader2 size={16} className="ml-2 animate-spin" /> : <Save size={16} className="ml-2" />}
                {subSaving ? "جاري الحفظ..." : "حفظ الصفحات الفرعية"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Page selector */}
            <div className="lg:col-span-1 space-y-2">
              {SUB_PAGES.map(page => (
                <button
                  key={page.id}
                  onClick={() => setActiveSubPage(page.id)}
                  className={`w-full text-right px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeSubPage === page.id ? "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20" : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <p>{page.label}</p>
                  <p className="text-xs opacity-60">{page.labelAr}</p>
                </button>
              ))}
            </div>

            {/* Editor */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="bg-black/40 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{SUB_PAGES.find(p => p.id === activeSubPage)?.label} Hero</CardTitle>
                  <CardDescription className="text-white/50">اختر التخطيط وخصص المحتوى</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Layout selector */}
                  <div>
                    <Label className="text-white/70 text-sm mb-3 block">التخطي��</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "centered" as const, label: "نص متمركز", desc: "نص نظيف فوق خلفية بسيطة", icon: Monitor },
                        { value: "split" as const, label: "شاشة مقسمة", desc: "نص يسار، صورة يمين", icon: Columns2 },
                        { value: "fullbleed" as const, label: "خلفية كاملة", desc: "نص فوق صورة/فيديو كبير", icon: Maximize },
                      ].map(layout => (
                        <button
                          key={layout.value}
                          onClick={() => updateSubHero(activeSubPage, { layout: layout.value })}
                          className={`p-4 rounded-lg border text-right transition-all ${
                            currentSubHero.layout === layout.value
                              ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/10"
                              : "border-white/10 hover:border-white/20"
                          }`}
                        >
                          <layout.icon size={24} className={currentSubHero.layout === layout.value ? "text-[var(--theme-primary)]" : "text-white/40"} />
                          <p className="text-sm font-medium text-white mt-2">{layout.label}</p>
                          <p className="text-xs text-white/40 mt-1">{layout.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/70 text-sm">العنوان</Label>
                      <Input value={currentSubHero.title} onChange={e => updateSubHero(activeSubPage, { title: e.target.value })} className="bg-black/40 border-white/10 text-white mt-1" placeholder={SUB_PAGES.find(p => p.id === activeSubPage)?.label || ""} />
                    </div>
                    <div>
                      <Label className="text-white/70 text-sm">العنوان الفرعي</Label>
                      <Input value={currentSubHero.subtitle} onChange={e => updateSubHero(activeSubPage, { subtitle: e.target.value })} className="bg-black/40 border-white/10 text-white mt-1" placeholder="وصف مختصر..." />
                    </div>
                  </div>

                  {/* Media */}
                  <div>
                    <Label className="text-white/70 text-sm mb-2 block">نوع الخلفية</Label>
                    <Select value={currentSubHero.mediaType} onValueChange={(v) => updateSubHero(activeSubPage, { mediaType: v as SubPageHero["mediaType"] })}>
                      <SelectTrigger className="bg-black/40 border-white/10 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gradient">تدرج لوني</SelectItem>
                        <SelectItem value="image">صورة</SelectItem>
                        <SelectItem value="video">فيديو</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {currentSubHero.mediaType === "gradient" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/70 text-sm">لون البداية</Label>
                        <div className="flex gap-2 items-center mt-1">
                          <input type="color" value={currentSubHero.gradientFrom} onChange={e => updateSubHero(activeSubPage, { gradientFrom: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-white/10" />
                          <Input value={currentSubHero.gradientFrom} onChange={e => updateSubHero(activeSubPage, { gradientFrom: e.target.value })} className="bg-black/40 border-white/10 text-white text-xs font-mono" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-white/70 text-sm">لون النهاية</Label>
                        <div className="flex gap-2 items-center mt-1">
                          <input type="color" value={currentSubHero.gradientTo} onChange={e => updateSubHero(activeSubPage, { gradientTo: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-white/10" />
                          <Input value={currentSubHero.gradientTo} onChange={e => updateSubHero(activeSubPage, { gradientTo: e.target.value })} className="bg-black/40 border-white/10 text-white text-xs font-mono" />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentSubHero.mediaType !== "gradient" && (
                    <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-4 space-y-3">
                      <div>
                        <Label className="text-white/70 text-sm mb-2 block">رفع الوسائط</Label>
                        <input type="file" accept={currentSubHero.mediaType === "video" ? ACCEPTED_VIDEO_TYPES : ACCEPTED_MEDIA_TYPES} onChange={handleSubMediaUpload} className="hidden" id="sub-hero-media" disabled={uploadingSubMedia} />
                        <label htmlFor="sub-hero-media" className={`flex items-center justify-center gap-2 px-4 py-6 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border-2 border-dashed border-[var(--theme-primary)]/30 rounded-lg cursor-pointer hover:bg-[var(--theme-primary)]/20 hover:border-[var(--theme-primary)]/50 transition-colors ${uploadingSubMedia ? "opacity-60 cursor-not-allowed" : ""}`}>
                          <div className="flex flex-col items-center gap-2">
                            {uploadingSubMedia ? (
                              <>
                                <Loader2 size={24} className="animate-spin" />
                                <span className="text-sm">جاري الرفع إلى Firebase Storage...</span>
                              </>
                            ) : (
                              <>
                                <Upload size={24} />
                                <span className="text-sm">{currentSubHero.mediaType === "video" ? "انقر لرفع فيديو أو اسحب الملف هنا" : "انقر لرفع صورة أو اسحب الملف هنا"}</span>
                                <span className="text-xs text-white/50">{currentSubHero.mediaType === "video" ? "MP4, WebM (حد أقصى 10MB)" : "JPEG, PNG, WebP, GIF (حد أقصى 10MB)"}</span>
                              </>
                            )}
                          </div>
                        </label>
                      </div>

                      {currentSubHero.mediaUrl && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-white/60">معاينة الوسائط المرفوعة</p>
                            <button onClick={() => updateSubHero(activeSubPage, { mediaUrl: "" })} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                              <X size={12} /> إزالة
                            </button>
                          </div>
                          <div className="relative rounded-lg overflow-hidden border border-[var(--theme-primary)]/30 bg-black/30">
                            {isVideoUrl(currentSubHero.mediaUrl) ? (
                              <video src={currentSubHero.mediaUrl} className="w-full h-32 object-cover" muted autoPlay loop playsInline />
                            ) : (
                              <img src={currentSubHero.mediaUrl} className="w-full h-32 object-cover" alt="Hero Media" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <Label className="text-white/70 text-sm">شفافية التراكب: {currentSubHero.overlayOpacity}%</Label>
                    <Slider value={[currentSubHero.overlayOpacity]} onValueChange={([v]) => updateSubHero(activeSubPage, { overlayOpacity: v })} min={0} max={100} step={5} className="mt-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Sub-page Preview */}
              <Card className="bg-black/40 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2"><Eye size={18} /> معاينة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden border border-white/10 relative" style={{ height: "200px" }}>
                    {/* Background */}
                    {currentSubHero.mediaType === "gradient" ? (
                      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${currentSubHero.gradientFrom}, ${currentSubHero.gradientTo})` }} />
                    ) : currentSubHero.mediaType === "video" && currentSubHero.mediaUrl ? (
                      <video src={currentSubHero.mediaUrl} className="absolute inset-0 w-full h-full object-cover" muted autoPlay loop playsInline />
                    ) : currentSubHero.mediaUrl ? (
                      <img src={currentSubHero.mediaUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${currentSubHero.gradientFrom}, ${currentSubHero.gradientTo})` }} />
                    )}
                    <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${currentSubHero.overlayOpacity / 100})` }} />

                    {/* Content by layout */}
                    <div className={`relative z-10 h-full flex ${
                      currentSubHero.layout === "centered" ? "items-center justify-center text-center" :
                      currentSubHero.layout === "split" ? "items-center" :
                      "items-center justify-center text-center"
                    }`}>
                      {currentSubHero.layout === "split" ? (
                        <div className="grid grid-cols-2 w-full h-full">
                          <div className="flex flex-col justify-center px-8">
                            <h2 className="text-2xl font-bold text-white">{currentSubHero.title || SUB_PAGES.find(p => p.id === activeSubPage)?.label}</h2>
                            <p className="text-sm text-white/70 mt-2">{currentSubHero.subtitle}</p>
                          </div>
                          <div className="bg-white/5" />
                        </div>
                      ) : (
                        <div className="px-8">
                          <h2 className="text-2xl font-bold text-white">{currentSubHero.title || SUB_PAGES.find(p => p.id === activeSubPage)?.label}</h2>
                          <p className="text-sm text-white/70 mt-2">{currentSubHero.subtitle}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
