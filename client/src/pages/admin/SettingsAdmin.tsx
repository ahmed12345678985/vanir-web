import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings, Save, Globe, Mail, Shield, Bell, Palette, Database,
  CheckCircle, AlertCircle, Loader2, RefreshCw, Upload, Image, X, Camera, Layout
} from "lucide-react";
import { toast } from "sonner";
import ImageUploadField from "@/components/admin/ImageUploadField";

export default function SettingsAdmin() {
  const [activeSection, setActiveSection] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // ─── Load settings from DB ───
  const generalQuery = trpc.siteSettings.getByCategory.useQuery({ category: "general" });
  const socialQuery = trpc.siteSettings.getByCategory.useQuery({ category: "social" });
  const seoQuery = trpc.siteSettings.getByCategory.useQuery({ category: "seo" });
  const notifQuery = trpc.siteSettings.getByCategory.useQuery({ category: "notifications" });
  const homeSectionsQuery = trpc.siteSettings.getByCategory.useQuery({ category: "home_sections" });

  const saveMutation = trpc.siteSettings.setMany.useMutation();
  const singleSetMutation = trpc.siteSettings.set.useMutation();

  // ─── Local state initialized from DB ───
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "",
    siteTagline: "",
    siteDescription: "",
    siteEmail: "",
    sitePhone: "",
    siteAddress: "",
    timezone: "Africa/Cairo",
    language: "ar",
    currency: "USD",
  });

  const [seoSettings, setSeoSettings] = useState({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    googleAnalyticsId: "",
    googleTagManagerId: "",
  });

  const [socialSettings, setSocialSettings] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: "",
    tiktok: "",
    whatsapp: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: "true",
    newBookingAlert: "true",
    newMessageAlert: "true",
    newReviewAlert: "true",
    weeklyReport: "true",
    lowCreditAlert: "true",
  });

  const [aboutSection, setAboutSection] = useState({
    sectionTag: "About Vanir Group",
    headingPart1: "We Orchestrate Sovereign Journeys That Redefine The Art of",
    headingHighlight: "Luxury Travel",
    experienceYears: "15+",
    experienceLabel: "Years of Royal Luxury Experience",
    paragraph1: "Founded on the timeless heritage of Egypt and elevated by modern royal hospitality standards, Vanir Group designs ultra-personalized, confidential itineraries for world leaders, private aviation travelers, and discerning families worldwide.",
    paragraph2: "Every itinerary is a bespoke masterpiece engineered with white-glove precision — from after-hours private pyramid access to chartered private aircraft and private island buyouts.",
    topImage: "/images/about/dubai_skydive.jpg",
    bottomImage: "/images/about/wave_surfing.jpg",
    girlImage: "/images/about/egypt_pyramids_girl.jpg",
    ctaText: "Discover Our Story",
    ctaLink: "/about",
  });

  const [statsCounter, setStatsCounter] = useState([
    { icon: "Users", value: "15K+", label: "Happy Travelers" },
    { icon: "MapPin", value: "200+", label: "Destinations" },
    { icon: "Award", value: "50+", label: "Awards Won" },
    { icon: "Globe", value: "30+", label: "Countries" },
  ]);

  const [popularPlaces, setPopularPlaces] = useState([
    { name: "EGYPT", travelers: "174,688 Travelers", image: "/images/final_cairo_post.png", link: "/destinations/egypt" },
    { name: "Sharm El Sheikh", travelers: "98,420 Travelers", image: "/images/final_sharm_post.png", link: "/destinations" },
    { name: "Luxor & Nile", travelers: "65,320 Travelers", image: "/images/The_Nile_River_at_Cairo.jpg", link: "/destinations" },
    { name: "Dubai & Emirates", travelers: "128,450 Travelers", image: "/images/final_dubai_post.png", link: "/destinations/dubai" },
  ]);

  // ─── Hydrate from DB when data loads ───
  useEffect(() => {
    if (generalQuery.data && Object.keys(generalQuery.data).length > 0) {
      setGeneralSettings(prev => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(generalQuery.data).filter(([k]) => k in prev)
        ),
      }));
    }
  }, [generalQuery.data]);

  useEffect(() => {
    if (homeSectionsQuery.data && Object.keys(homeSectionsQuery.data).length > 0) {
      if (homeSectionsQuery.data.about_section) {
        try {
          setAboutSection(JSON.parse(homeSectionsQuery.data.about_section));
        } catch {}
      }
      if (homeSectionsQuery.data.stats_counter) {
        try {
          setStatsCounter(JSON.parse(homeSectionsQuery.data.stats_counter));
        } catch {}
      }
      if (homeSectionsQuery.data.popular_places) {
        try {
          setPopularPlaces(JSON.parse(homeSectionsQuery.data.popular_places));
        } catch {}
      }
    }
  }, [homeSectionsQuery.data]);

  useEffect(() => {
    if (socialQuery.data && Object.keys(socialQuery.data).length > 0) {
      setSocialSettings(prev => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(socialQuery.data).filter(([k]) => k in prev)
        ),
      }));
    }
  }, [socialQuery.data]);

  useEffect(() => {
    if (seoQuery.data && Object.keys(seoQuery.data).length > 0) {
      setSeoSettings(prev => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(seoQuery.data).filter(([k]) => k in prev)
        ),
      }));
    }
  }, [seoQuery.data]);

  useEffect(() => {
    if (notifQuery.data && Object.keys(notifQuery.data).length > 0) {
      setNotificationSettings(prev => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(notifQuery.data).filter(([k]) => k in prev)
        ),
      }));
    }
  }, [notifQuery.data]);

  // ─── Real save to DB ───
  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      // Save the active section
      if (activeSection === "general") {
        await saveMutation.mutateAsync({ category: "general", settings: generalSettings });
      } else if (activeSection === "home_sections") {
        await singleSetMutation.mutateAsync({ category: "home_sections", key: "about_section", value: JSON.stringify(aboutSection) });
        await singleSetMutation.mutateAsync({ category: "home_sections", key: "stats_counter", value: JSON.stringify(statsCounter) });
        await singleSetMutation.mutateAsync({ category: "home_sections", key: "popular_places", value: JSON.stringify(popularPlaces) });
        homeSectionsQuery.refetch();
      } else if (activeSection === "social") {
        await saveMutation.mutateAsync({ category: "social", settings: socialSettings });
      } else if (activeSection === "seo") {
        await saveMutation.mutateAsync({ category: "seo", settings: seoSettings });
      } else if (activeSection === "notifications") {
        await saveMutation.mutateAsync({ category: "notifications", settings: notificationSettings });
      }
      setSaveStatus("saved");
      // Refetch to confirm
      generalQuery.refetch();
      socialQuery.refetch();
      seoQuery.refetch();
      notifQuery.refetch();
      homeSectionsQuery.refetch();
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error("Save failed:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleSaveAll = async () => {
    setSaveStatus("saving");
    try {
      await saveMutation.mutateAsync({ category: "general", settings: generalSettings });
      await singleSetMutation.mutateAsync({ category: "home_sections", key: "about_section", value: JSON.stringify(aboutSection) });
      await singleSetMutation.mutateAsync({ category: "home_sections", key: "stats_counter", value: JSON.stringify(statsCounter) });
      await singleSetMutation.mutateAsync({ category: "home_sections", key: "popular_places", value: JSON.stringify(popularPlaces) });
      await saveMutation.mutateAsync({ category: "social", settings: socialSettings });
      await saveMutation.mutateAsync({ category: "seo", settings: seoSettings });
      await saveMutation.mutateAsync({ category: "notifications", settings: notificationSettings });
      setSaveStatus("saved");
      generalQuery.refetch();
      socialQuery.refetch();
      seoQuery.refetch();
      notifQuery.refetch();
      homeSectionsQuery.refetch();
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error("Save all failed:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const isLoading = generalQuery.isLoading || socialQuery.isLoading || seoQuery.isLoading || notifQuery.isLoading;

  const socialLabels: Record<string, string> = {
    facebook: "Facebook",
    instagram: "Instagram",
    twitter: "Twitter / X",
    linkedin: "LinkedIn",
    youtube: "YouTube",
    tiktok: "TikTok",
    whatsapp: "WhatsApp",
  };

  const socialPlaceholders: Record<string, string> = {
    facebook: "https://facebook.com/vanirgroup",
    instagram: "https://instagram.com/vanirgroup",
    twitter: "https://twitter.com/vanirgroup",
    linkedin: "https://linkedin.com/company/vanirgroup",
    youtube: "https://youtube.com/@vanirgroup",
    tiktok: "https://tiktok.com/@vanirgroup",
    whatsapp: "+20123456789",
  };

  const notifLabels: Record<string, string> = {
    emailNotifications: "تفعيل إشعارات البريد الإلكتروني",
    newBookingAlert: "إشعار عند حجز جديد",
    newMessageAlert: "إشعار عند رسالة جديدة",
    newReviewAlert: "إشعار عند تقييم جديد",
    weeklyReport: "تقرير أسبوعي",
    lowCreditAlert: "تنبيه انخفاض الرصيد",
  };

  // Branding state
  const brandingQuery = trpc.siteSettings.getByCategory.useQuery({ category: "branding" });
  const [logoUrl, setLogoUrl] = useState("");
  const [logoLight, setLogoLight] = useState("");
  const [favicon, setFavicon] = useState("");
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const uploadMutation = trpc.gallery.uploadImage.useMutation();

  useEffect(() => {
    if (brandingQuery.data && Object.keys(brandingQuery.data).length > 0) {
      if (brandingQuery.data.logoUrl) setLogoUrl(brandingQuery.data.logoUrl);
      if (brandingQuery.data.logoLight) setLogoLight(brandingQuery.data.logoLight);
      if (brandingQuery.data.favicon) setFavicon(brandingQuery.data.favicon);
    }
  }, [brandingQuery.data]);

  const handleLogoUpload = async (field: string, setter: (v: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الملف يجب أن يكون أقل من 5MB");
        return;
      }
      setIsUploading(field);
      try {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const base64 = (ev.target?.result as string).split(',')[1];
          const result = await uploadMutation.mutateAsync({
            filename: `branding-${field}-${Date.now()}.${file.name.split('.').pop()}`,
            fileData: base64,
            mimeType: file.type,
          });
          setter(result.url);
          // Save to DB immediately
          await saveMutation.mutateAsync({
            category: "branding",
            settings: {
              ...(field === 'logoUrl' ? { logoUrl: result.url } : {}),
              ...(field === 'logoLight' ? { logoLight: result.url } : {}),
              ...(field === 'favicon' ? { favicon: result.url } : {}),
            },
          });
          toast.success(`تم رفع ${field === 'logoUrl' ? 'الشعار الرئيسي' : field === 'logoLight' ? 'الشعار الفاتح' : 'الأيقونة'} بنجاح`);
          brandingQuery.refetch();
        };
        reader.readAsDataURL(file);
      } catch (err: any) {
        toast.error(`فشل الرفع: ${err.message || 'خطأ غير معروف'}`);
      } finally {
        setIsUploading(null);
      }
    };
    input.click();
  };

  const sections = [
    { id: "general", label: "عام", icon: Globe },
    { id: "branding", label: "الشعار والهوية", icon: Image },
    { id: "home_sections", label: "أقسام الرئيسية (About & Stats)", icon: Layout },
    { id: "seo", label: "SEO", icon: Globe },
    { id: "social", label: "التواصل الاجتماعي", icon: Mail },
    { id: "notifications", label: "الإشعارات", icon: Bell },
    { id: "appearance", label: "المظهر", icon: Palette },
    { id: "security", label: "الأمان", icon: Shield },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="text-[var(--theme-primary)]" size={24} />
            الإعدادات العامة
          </h1>
          <p className="text-white/50 text-sm mt-1">
            إدارة إعدادات الموقع • جميع التغييرات تُحفظ في قاعدة البيانات
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold"
          >
            {saveStatus === "saved" ? (
              <><CheckCircle size={16} className="ml-2" /> تم الحفظ</>
            ) : saveStatus === "saving" ? (
              <><Loader2 size={16} className="ml-2 animate-spin" /> جاري الحفظ...</>
            ) : saveStatus === "error" ? (
              <><AlertCircle size={16} className="ml-2" /> خطأ في الحفظ</>
            ) : (
              <><Save size={16} className="ml-2" /> حفظ القسم الحالي</>
            )}
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={saveStatus === "saving"}
            variant="outline"
            className="border-[var(--theme-primary)]/20 text-[var(--theme-primary)]"
          >
            <Save size={16} className="ml-2" /> حفظ الكل
          </Button>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-center gap-2">
          <Loader2 size={16} className="text-blue-400 animate-spin" />
          <span className="text-sm text-blue-300">جاري تحميل الإعدادات من قاعدة البيانات...</span>
        </div>
      )}

      {/* Data source indicator */}
      {!isLoading && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={14} className="text-emerald-400" />
            <span className="text-sm text-emerald-300">البيانات محملة من قاعدة البيانات</span>
          </div>
          <button
            onClick={() => { generalQuery.refetch(); socialQuery.refetch(); seoQuery.refetch(); notifQuery.refetch(); }}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <RefreshCw size={12} /> تحديث
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-3 space-y-1 h-fit">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === s.id
                  ? "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <s.icon size={16} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 bg-[var(--theme-surface)] border border-white/5 rounded-lg p-6">
          {activeSection === "general" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">الإعدادات العامة</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white mb-1">اسم الموقع</label>
                  <Input value={generalSettings.siteName} onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" placeholder="VANIR GROUP" />
                </div>
                <div>
                  <label className="block text-sm text-white mb-1">الشعار النصي</label>
                  <Input value={generalSettings.siteTagline} onChange={(e) => setGeneralSettings({ ...generalSettings, siteTagline: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" placeholder="Luxury Travel & Experiences" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white mb-1">وصف الموقع</label>
                <Textarea value={generalSettings.siteDescription} onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" rows={3} placeholder="وصف مختصر عن الموقع..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white mb-1">البريد الإلكتروني</label>
                  <Input value={generalSettings.siteEmail} onChange={(e) => setGeneralSettings({ ...generalSettings, siteEmail: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" dir="ltr" placeholder="info@vanirgroup.com" />
                </div>
                <div>
                  <label className="block text-sm text-white mb-1">رقم الهاتف</label>
                  <Input value={generalSettings.sitePhone} onChange={(e) => setGeneralSettings({ ...generalSettings, sitePhone: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" dir="ltr" placeholder="+20 123 456 789" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white mb-1">العنوان</label>
                <Input value={generalSettings.siteAddress} onChange={(e) => setGeneralSettings({ ...generalSettings, siteAddress: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" placeholder="القاهرة، مصر" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-white mb-1">المنطقة الزمنية</label>
                  <select value={generalSettings.timezone} onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-md px-3 py-2 text-sm">
                    <option value="Africa/Cairo">القاهرة (GMT+2)</option>
                    <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                    <option value="Asia/Dubai">دبي (GMT+4)</option>
                    <option value="Europe/London">لندن (GMT+0)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white mb-1">اللغة</label>
                  <select value={generalSettings.language} onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-md px-3 py-2 text-sm">
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white mb-1">العملة</label>
                  <select value={generalSettings.currency} onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-md px-3 py-2 text-sm">
                    <option value="USD">USD ($)</option>
                    <option value="EGP">EGP (ج.م)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="SAR">SAR (ر.س)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeSection === "branding" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">الشعار والهوية البصرية</h3>
              <p className="text-sm text-white/40 mb-2">ارفع شعار الشركة والأيقونة. يتم الحفظ تلقائياً في قاعدة البيانات والتخزين السحابي. يُفضل استخدام صور PNG أو SVG بخلفية شفافة.</p>

              {/* Main Logo (Dark background) */}
              <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-white font-medium">الشعار الرئيسي (Dark Mode)</h4>
                    <p className="text-white/40 text-xs mt-1">يظهر على الخلفية الداكنة • PNG/SVG • أقصى 5MB</p>
                  </div>
                  <Button
                    onClick={() => handleLogoUpload('logoUrl', setLogoUrl)}
                    disabled={isUploading === 'logoUrl'}
                    size="sm"
                    className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)]"
                  >
                    {isUploading === 'logoUrl' ? (
                      <><Loader2 size={14} className="ml-1 animate-spin" /> جاري الرفع...</>
                    ) : (
                      <><Upload size={14} className="ml-1" /> رفع شعار</>
                    )}
                  </Button>
                </div>
                <div className="bg-[var(--theme-background)] border border-white/5 rounded-lg p-8 flex items-center justify-center min-h-[120px]">
                  {logoUrl ? (
                    <div className="relative group">
                      <img src={logoUrl} alt="Company Logo" className="max-h-24 max-w-[280px] object-contain" />
                      <button
                        onClick={async () => {
                          setLogoUrl("");
                          await saveMutation.mutateAsync({ category: "branding", settings: { logoUrl: "" } });
                          toast.success("تم حذف الشعار");
                        }}
                        className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Camera size={32} className="text-white/10 mx-auto mb-2" />
                      <p className="text-white/20 text-sm">لم يتم رفع شعار بعد</p>
                    </div>
                  )}
                </div>
                {logoUrl && <p className="text-xs text-white/30 mt-2 break-all" dir="ltr">{logoUrl}</p>}
              </div>

              {/* Light Logo */}
              <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-white font-medium">الشعار الفاتح (Light Mode)</h4>
                    <p className="text-white/40 text-xs mt-1">يظهر على الخلفية الفاتحة • اختياري</p>
                  </div>
                  <Button
                    onClick={() => handleLogoUpload('logoLight', setLogoLight)}
                    disabled={isUploading === 'logoLight'}
                    size="sm"
                    variant="outline"
                    className="border-white/10 text-white/70"
                  >
                    {isUploading === 'logoLight' ? (
                      <><Loader2 size={14} className="ml-1 animate-spin" /> جاري الرفع...</>
                    ) : (
                      <><Upload size={14} className="ml-1" /> رفع شعار</>
                    )}
                  </Button>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-8 flex items-center justify-center min-h-[120px]">
                  {logoLight ? (
                    <div className="relative group">
                      <img src={logoLight} alt="Light Logo" className="max-h-24 max-w-[280px] object-contain" />
                      <button
                        onClick={async () => {
                          setLogoLight("");
                          await saveMutation.mutateAsync({ category: "branding", settings: { logoLight: "" } });
                          toast.success("تم حذف الشعار الفاتح");
                        }}
                        className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Camera size={32} className="text-gray-200 mx-auto mb-2" />
                      <p className="text-gray-300 text-sm">لم يتم رفع شعار بعد</p>
                    </div>
                  )}
                </div>
                {logoLight && <p className="text-xs text-white/30 mt-2 break-all" dir="ltr">{logoLight}</p>}
              </div>

              {/* Favicon */}
              <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-white font-medium">أيقونة الموقع (Favicon)</h4>
                    <p className="text-white/40 text-xs mt-1">تظهر في شريط المتصفح • يُفضل 32x32 أو 64x64 بكسل</p>
                  </div>
                  <Button
                    onClick={() => handleLogoUpload('favicon', setFavicon)}
                    disabled={isUploading === 'favicon'}
                    size="sm"
                    variant="outline"
                    className="border-white/10 text-white/70"
                  >
                    {isUploading === 'favicon' ? (
                      <><Loader2 size={14} className="ml-1 animate-spin" /> جاري الرفع...</>
                    ) : (
                      <><Upload size={14} className="ml-1" /> رفع أيقونة</>
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-6">
                  <div className="bg-[var(--theme-background)] border border-white/5 rounded-lg p-4 flex items-center justify-center w-20 h-20">
                    {favicon ? (
                      <div className="relative group">
                        <img src={favicon} alt="Favicon" className="w-10 h-10 object-contain" />
                        <button
                          onClick={async () => {
                            setFavicon("");
                            await saveMutation.mutateAsync({ category: "branding", settings: { favicon: "" } });
                            toast.success("تم حذف الأيقونة");
                          }}
                          className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ) : (
                      <Camera size={20} className="text-white/10" />
                    )}
                  </div>
                  <div className="text-sm text-white/40">
                    <p>الأيقونة تظهر في علامة تبويب المتصفح والمفضلة.</p>
                    <p className="mt-1">الحجم الموصى به: 32×32px أو 64×64px</p>
                    {favicon && <p className="text-xs text-white/20 mt-2 break-all" dir="ltr">{favicon}</p>}
                  </div>
                </div>
              </div>

              {/* Preview */}
              {(logoUrl || logoLight) && (
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                  <h4 className="text-white font-medium mb-4">معاينة</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[var(--theme-background)] rounded-lg p-6 text-center">
                      <p className="text-white/30 text-xs mb-3">خلفية داكنة</p>
                      {logoUrl ? <img src={logoUrl} alt="Preview Dark" className="max-h-16 mx-auto object-contain" /> : <p className="text-white/10 text-sm">لا يوجد شعار</p>}
                    </div>
                    <div className="bg-white rounded-lg p-6 text-center">
                      <p className="text-gray-400 text-xs mb-3">خلفية فاتحة</p>
                      {logoLight ? <img src={logoLight} alt="Preview Light" className="max-h-16 mx-auto object-contain" /> : logoUrl ? <img src={logoUrl} alt="Preview" className="max-h-16 mx-auto object-contain" /> : <p className="text-gray-300 text-sm">لا يوجد شعار</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === "home_sections" && (
            <div className="space-y-8" dir="rtl">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">أقسام الصفحة الرئيسية</h3>
                <p className="text-sm text-white/50">تحكم كامل في نصوص وصور قسم من نحن (About Section)، عدادات الإحصائيات (Stats)، والوجهات الأكثر رواجاً (Popular Places).</p>
              </div>

              {/* 1. About Section */}
              <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 space-y-4">
                <h4 className="text-base font-semibold text-[var(--theme-primary)] flex items-center gap-2">
                  <Layout size={18} /> قسم "من نحن" (About Vanir Group)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/70 mb-1">شارة القسم (Section Tag)</label>
                    <Input
                      value={aboutSection.sectionTag}
                      onChange={(e) => setAboutSection({ ...aboutSection, sectionTag: e.target.value })}
                      className="bg-[#242424] border-white/10 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/70 mb-1">سنوات الخبرة والرقم (مثال: 15+)</label>
                    <Input
                      value={aboutSection.experienceYears}
                      onChange={(e) => setAboutSection({ ...aboutSection, experienceYears: e.target.value })}
                      className="bg-[#242424] border-white/10 text-[var(--theme-primary)] font-bold text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1">وصف شارة الخبرة (Experience Label)</label>
                  <Input
                    value={aboutSection.experienceLabel}
                    onChange={(e) => setAboutSection({ ...aboutSection, experienceLabel: e.target.value })}
                    className="bg-[#242424] border-white/10 text-white text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/70 mb-1">العنوان الرئيسي (الجزء الأول)</label>
                    <Input
                      value={aboutSection.headingPart1}
                      onChange={(e) => setAboutSection({ ...aboutSection, headingPart1: e.target.value })}
                      className="bg-[#242424] border-white/10 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/70 mb-1">النص المميز باللون الذهبي</label>
                    <Input
                      value={aboutSection.headingHighlight}
                      onChange={(e) => setAboutSection({ ...aboutSection, headingHighlight: e.target.value })}
                      className="bg-[#242424] border-white/10 text-[var(--theme-primary)] font-semibold text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1">الفقرة الأولى (Paragraph 1)</label>
                  <Textarea
                    value={aboutSection.paragraph1}
                    onChange={(e) => setAboutSection({ ...aboutSection, paragraph1: e.target.value })}
                    rows={3}
                    className="bg-[#242424] border-white/10 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1">الفقرة الثانية (Paragraph 2)</label>
                  <Textarea
                    value={aboutSection.paragraph2}
                    onChange={(e) => setAboutSection({ ...aboutSection, paragraph2: e.target.value })}
                    rows={2}
                    className="bg-[#242424] border-white/10 text-white text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <ImageUploadField
                      label="الصورة العلوية (Top Image) - رفع من الجهاز"
                      value={aboutSection.topImage}
                      onChange={(url) => setAboutSection({ ...aboutSection, topImage: url })}
                    />
                  </div>
                  <div>
                    <ImageUploadField
                      label="الصورة السفلية (Bottom Image) - رفع من الجهاز"
                      value={aboutSection.bottomImage}
                      onChange={(url) => setAboutSection({ ...aboutSection, bottomImage: url })}
                    />
                  </div>
                  <div>
                    <ImageUploadField
                      label="الصورة الرئيسية (Main Image) - رفع من الجهاز"
                      value={aboutSection.girlImage}
                      onChange={(url) => setAboutSection({ ...aboutSection, girlImage: url })}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Stats Counters */}
              <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 space-y-4">
                <h4 className="text-base font-semibold text-[var(--theme-primary)] flex items-center gap-2">
                  <Database size={18} /> عدادات الإحصائيات (Stats Counters)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {statsCounter.map((stat, idx) => (
                    <div key={idx} className="bg-[#242424] p-4 rounded-lg border border-white/5 space-y-2">
                      <span className="text-xs text-[var(--theme-primary)] font-semibold">عداد #{idx + 1}</span>
                      <div>
                        <label className="block text-[11px] text-white/50 mb-0.5">القيمة (مثال: 15K+)</label>
                        <Input
                          value={stat.value}
                          onChange={(e) => {
                            const updated = [...statsCounter];
                            updated[idx].value = e.target.value;
                            setStatsCounter(updated);
                          }}
                          className="bg-[#1e1e1e] border-white/10 text-white font-bold text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/50 mb-0.5">التسمية (Label)</label>
                        <Input
                          value={stat.label}
                          onChange={(e) => {
                            const updated = [...statsCounter];
                            updated[idx].label = e.target.value;
                            setStatsCounter(updated);
                          }}
                          className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Popular Places */}
              <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 space-y-4">
                <h4 className="text-base font-semibold text-[var(--theme-primary)] flex items-center gap-2">
                  <Globe size={18} /> الوجهات الرائجة (Popular Places)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {popularPlaces.map((place, idx) => (
                    <div key={idx} className="bg-[#242424] p-4 rounded-lg border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--theme-primary)] font-semibold">وجهة #{idx + 1}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-white/50 mb-0.5">اسم الوجهة</label>
                          <Input
                            value={place.name}
                            onChange={(e) => {
                              const updated = [...popularPlaces];
                              updated[idx].name = e.target.value;
                              setPopularPlaces(updated);
                            }}
                            className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-white/50 mb-0.5">عدد المسافرين (Travelers)</label>
                          <Input
                            value={place.travelers}
                            onChange={(e) => {
                              const updated = [...popularPlaces];
                              updated[idx].travelers = e.target.value;
                              setPopularPlaces(updated);
                            }}
                            className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <ImageUploadField
                          label="صورة الوجهة - رفع من الجهاز"
                          value={place.image}
                          onChange={(url) => {
                            const updated = [...popularPlaces];
                            updated[idx].image = url;
                            setPopularPlaces(updated);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === "seo" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">إعدادات SEO</h3>
              <div>
                <label className="block text-sm text-white mb-1">عنوان Meta</label>
                <Input value={seoSettings.metaTitle} onChange={(e) => setSeoSettings({ ...seoSettings, metaTitle: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" placeholder="VANIR GROUP - Luxury Travel" />
                <p className="text-xs text-white/30 mt-1">{seoSettings.metaTitle.length}/60 حرف</p>
              </div>
              <div>
                <label className="block text-sm text-white mb-1">وصف Meta</label>
                <Textarea value={seoSettings.metaDescription} onChange={(e) => setSeoSettings({ ...seoSettings, metaDescription: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" rows={2} placeholder="وصف الموقع لمحركات البحث..." />
                <p className="text-xs text-white/30 mt-1">{seoSettings.metaDescription.length}/160 حرف</p>
              </div>
              <div>
                <label className="block text-sm text-white mb-1">الكلمات المفتاحية</label>
                <Input value={seoSettings.metaKeywords} onChange={(e) => setSeoSettings({ ...seoSettings, metaKeywords: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" placeholder="luxury travel, egypt tourism, vanir group" />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">Google Analytics Measurement ID</label>
                <Input value={seoSettings.googleAnalyticsId} onChange={(e) => setSeoSettings({ ...seoSettings, googleAnalyticsId: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" dir="ltr" placeholder="G-XXXXXXXXXX" />
                <p className="text-xs text-white/30 mt-1">أدخل Measurement ID من Google Analytics 4</p>
              </div>
              <div>
                <label className="block text-sm text-white mb-1">Google Tag Manager ID</label>
                <Input value={seoSettings.googleTagManagerId} onChange={(e) => setSeoSettings({ ...seoSettings, googleTagManagerId: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white" dir="ltr" placeholder="GTM-XXXXXXX" />
              </div>
            </div>
          )}

          {activeSection === "social" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">حسابات التواصل الاجتماعي</h3>
              <p className="text-sm text-white/40 mb-2">أدخل روابط حساباتك الرسمية. اتركها فارغة إذا لم تكن متاحة.</p>
              {Object.entries(socialSettings).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm text-white mb-1">{socialLabels[key] || key}</label>
                  <Input
                    value={value}
                    onChange={(e) => setSocialSettings({ ...socialSettings, [key]: e.target.value })}
                    className="bg-[#1a1a1a] border-white/10 text-white"
                    dir="ltr"
                    placeholder={socialPlaceholders[key] || ""}
                  />
                </div>
              ))}
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">إعدادات الإشعارات</h3>
              {Object.entries(notificationSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg border border-white/5">
                  <span className="text-sm text-white">{notifLabels[key] || key}</span>
                  <button
                    onClick={() => setNotificationSettings({ ...notificationSettings, [key]: value === "true" ? "false" : "true" })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${value === "true" ? "bg-[var(--theme-primary)]" : "bg-white/10"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${value === "true" ? "right-0.5" : "right-5"}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeSection === "appearance" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">إعدادات المظهر</h3>
              <p className="text-sm text-white/40">لتعديل الألوان والخطوط بشكل متقدم، استخدم أداة <a href="/admin/theme" className="text-[var(--theme-primary)] underline">Theme & Colors</a> من القائمة الجانبية.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#1a1a1a] rounded-lg border-2 border-[var(--theme-primary)]/30 text-center">
                  <div className="w-full h-20 bg-[var(--theme-background)] rounded mb-2 flex items-center justify-center">
                    <span className="text-[var(--theme-primary)] text-xs">Dark Theme</span>
                  </div>
                  <p className="text-sm text-white">الوضع الداكن</p>
                  <span className="text-xs text-emerald-400">نشط</span>
                </div>
                <div className="p-4 bg-[#1a1a1a] rounded-lg border border-white/5 text-center opacity-50">
                  <div className="w-full h-20 bg-white rounded mb-2 flex items-center justify-center">
                    <span className="text-black text-xs">Light Theme</span>
                  </div>
                  <p className="text-sm text-white">الوضع الفاتح</p>
                  <span className="text-xs text-white/30">قريباً</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">إعدادات الأمان</h3>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex gap-3">
                <CheckCircle size={20} className="text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-300">SSL مفعّل</p>
                  <p className="text-xs text-emerald-200/60">الاتصال مشفر ومحمي عبر HTTPS</p>
                </div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex gap-3">
                <CheckCircle size={20} className="text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-300">OAuth Authentication</p>
                  <p className="text-xs text-emerald-200/60">المصادقة تتم عبر Supabase OAuth - لا حاجة لكلمات مرور</p>
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3">
                <Shield size={20} className="text-blue-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-300">صلاحيات المستخدمين</p>
                  <p className="text-xs text-blue-200/60">لإدارة الصلاحيات، استخدم أداة <a href="/admin/permissions" className="text-blue-400 underline">Permissions</a> من القائمة الجانبية.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
