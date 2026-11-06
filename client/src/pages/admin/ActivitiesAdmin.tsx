import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Save, Trash2, Edit2, Clock, MapPin, Star, DollarSign, X, Loader2, AlertTriangle, Upload, CheckCircle2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface Activity {
  id: number;
  name: string;
  nameAr: string;
  description: string;
  price: number;
  duration: string;
  location: string;
  category: string;
  rating: number;
  image: string;
}

const DEFAULT_ACTIVITIES: Activity[] = [
  {
    id: 1,
    name: "Giza Pyramids Camel Safari",
    nameAr: "سفاري الجمال عند أهرامات الجيزة",
    description: "Experience the timeless wonder of the Giza Plateau on a guided camel trek through the golden desert sands with iconic photo stops.",
    price: 85,
    duration: "3 hours",
    location: "Giza, Cairo",
    category: "Adventure",
    rating: 5,
    image: "/images/vanir_adventure_4.png",
  },
  {
    id: 2,
    name: "Royal Nile Dahabiya Cruise",
    nameAr: "إبحار دهبية النيل الملكية الفاخرة",
    description: "Sail the tranquil waters of the Nile on a private luxury Dahabiya sailboat between Luxor and Aswan with private chef service.",
    price: 450,
    duration: "Full Day",
    location: "Luxor & Aswan",
    category: "Luxury Cruise",
    rating: 5,
    image: "/images/The_Nile_River_at_Cairo.jpg",
  },
  {
    id: 3,
    name: "Red Sea Coral Reef Diving & Snorkeling",
    nameAr: "غوص واستكشاف شعاب البحر الأحمر",
    description: "Immerse yourself in world-class coral gardens and vibrant marine life in the crystal-clear waters of Sharm El-Sheikh and Hurghada.",
    price: 120,
    duration: "5 hours",
    location: "Sharm El-Sheikh / Hurghada",
    category: "Water Sports",
    rating: 5,
    image: "/images/vanir_world_4.png",
  },
  {
    id: 4,
    name: "Sunrise Hot Air Balloon over Luxor",
    nameAr: "منطاد الهواء الساخن عند الشروق في الأقصر",
    description: "Drift serenely over the Valley of the Kings and Hatshepsut Temple as the golden Egyptian sunrise illuminates ancient pharaonic monuments.",
    price: 160,
    duration: "2.5 hours",
    location: "West Bank, Luxor",
    category: "Aviation & Sightseeing",
    rating: 5,
    image: "/images/kiosk-roman-island-trajan-agilkia-nile-river.jpg",
  },
  {
    id: 5,
    name: "Bedouin Desert Stargazing & Dinner",
    nameAr: "سهرة عشاء بدوي ورصد النجوم بالصحراء",
    description: "An enchanting evening under the Sinai night sky featuring astronomical telescope viewing and authentic Bedouin barbecue dining.",
    price: 95,
    duration: "4 hours",
    location: "Sinai Desert",
    category: "Cultural & Stargazing",
    rating: 5,
    image: "/images/final_st_catherine_post.png",
  },
  {
    id: 6,
    name: "White Desert & Bahariya Oasis Expedition",
    nameAr: "استكشاف الصحراء البيضاء وواحة البحرية",
    description: "A surreal 4x4 expedition through chalk rock sculptures, crystal mountain formations, and luxury glamping under unpolluted starry skies.",
    price: 320,
    duration: "2 Days",
    location: "Western Desert",
    category: "Expedition",
    rating: 5,
    image: "/images/vanir_adventure_5.png",
  },
];

export default function ActivitiesAdmin() {
  const [activities, setActivities] = useState<Activity[]>(DEFAULT_ACTIVITIES);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Activity | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<Omit<Activity, 'id' | 'rating'>>({
    name: '',
    nameAr: '',
    description: '',
    price: 0,
    duration: '',
    location: '',
    category: '',
    image: '',
  });

  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const utils = trpc.useUtils();
  const { data: saved, isLoading, refetch } = trpc.siteSettings.get.useQuery(
    { category: "activities", key: "activities_data" },
    { staleTime: 5000 }
  );
  const setMut = trpc.siteSettings.set.useMutation();

  const uploadImageMutation = trpc.gallery.uploadImage.useMutation({
    onSuccess: (result) => {
      setFormData(prev => ({ ...prev, image: result.url }));
      toast.success("تم رفع الصورة بنجاح");
      setIsUploading(false);
    },
    onError: (error: any) => {
      toast.error("خطأ في رفع الصورة: " + (error.message || "Unknown error"));
      setIsUploading(false);
    },
  });

  useEffect(() => {
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (Array.isArray(p) && p.length > 0) {
          setActivities(p);
          return;
        }
      } catch {}
    }
    setActivities(DEFAULT_ACTIVITIES);
  }, [saved]);

  const saveToDb = useCallback(async (items: Activity[]) => {
    setSaving(true);
    try {
      await setMut.mutateAsync({ category: "activities", key: "activities_data", value: JSON.stringify(items) });
      setHasChanges(false);
      toast.success("تم الحفظ في قاعدة البيانات بنجاح");
      refetch();
      utils.siteSettings.get.invalidate();
    } catch (err: any) {
      toast.error("فشل في الحفظ: " + (err.message || "خطأ غير معروف"));
    } finally {
      setSaving(false);
    }
  }, [setMut, refetch, utils]);

  const openDialog = (item: Activity | null = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        nameAr: '',
        description: '',
        price: 90,
        duration: '3 ساعات',
        location: 'القاهرة / الجيزة',
        category: 'مغامرات',
        image: '/images/vanir_adventure_4.png',
      });
    }
    setIsDialogOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الملف يتجاوز 10 ميجابايت");
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(",")[1];
        await uploadImageMutation.mutateAsync({
          fileData: base64,
          filename: file.name,
          mimeType: file.type,
        });
      } catch {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.nameAr.trim() && !formData.name.trim()) {
      toast.error("يرجى إدخال اسم النشاط");
      return;
    }

    let updated: Activity[];
    if (editingItem) {
      updated = activities.map(act => act.id === editingItem.id ? { ...editingItem, ...formData } : act);
      toast.success("تم تعديل النشاط بنجاح");
    } else {
      const newActivity: Activity = {
        id: Date.now(),
        ...formData,
        rating: 5,
      };
      updated = [newActivity, ...activities];
      toast.success("تمت إضافة النشاط بنجاح");
    }

    setActivities(updated);
    setIsDialogOpen(false);
    await saveToDb(updated);
  };

  const deleteItem = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا النشاط؟')) {
      const updated = activities.filter(act => act.id !== id);
      setActivities(updated);
      toast.success("تم حذف النشاط");
      await saveToDb(updated);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-white">
        <Loader2 className="animate-spin mr-2" /> جاري تحميل الأنشطة...
      </div>
    );
  }

  return (
    <div className="p-6 bg-[var(--theme-surface)] min-h-screen text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--theme-primary)] flex items-center gap-2">
            إدارة الأنشطة السياحية (Activities Management)
          </h1>
          <p className="text-xs text-white/50 mt-1">
            إدارة الأنشطة والرحلات الترفيهية والتجارب الفاخرة مع الحفظ التلقائي في قاعدة البيانات.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <div className="flex items-center gap-1.5 text-yellow-400 text-xs bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
              <AlertTriangle size={14} />
              <span>تغييرات غير محفوظة</span>
            </div>
          )}
          <Button
            onClick={() => saveToDb(activities)}
            disabled={saving}
            className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold text-xs"
          >
            {saving ? <Loader2 className="animate-spin ml-2" size={14} /> : <Save className="ml-2" size={14} />}
            حفظ في قاعدة البيانات
          </Button>
          <Button
            onClick={() => openDialog()}
            className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs"
          >
            <PlusCircle size={14} className="ml-2 text-[var(--theme-primary)]" />
            إضافة نشاط جديد
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {activities.map(activity => (
          <div
            key={activity.id}
            className="bg-[#121215] border border-white/10 hover:border-[var(--theme-primary)]/50 rounded-xl p-4 transition-all hover:translate-y-[-2px] flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex items-start justify-between mb-3 gap-3">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0">
                  <img src={activity.image || "/images/vanir_adventure_4.png"} alt={activity.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow min-w-0">
                  <span className="text-[10px] uppercase font-bold text-[var(--theme-primary)] tracking-wider block">
                    {activity.category}
                  </span>
                  <h3 className="font-bold text-white text-base truncate">{activity.nameAr}</h3>
                  <p className="text-xs text-white/50 truncate" dir="ltr">{activity.name}</p>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <button onClick={() => openDialog(activity)} className="p-1.5 text-white/40 hover:text-[var(--theme-primary)] transition-colors" title="تعديل">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => deleteItem(activity.id)} className="p-1.5 text-white/40 hover:text-red-400 transition-colors" title="حذف">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-white/60 mb-4 line-clamp-2 leading-relaxed">
                {activity.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
              <span className="font-bold text-[var(--theme-primary)] flex items-center gap-0.5">
                <DollarSign size={12} />${activity.price}
              </span>
              <span className="text-white/50 flex items-center gap-1">
                <Clock size={11} />{activity.duration}
              </span>
              <span className="text-white/50 flex items-center gap-1">
                <MapPin size={11} />{activity.location}
              </span>
              <span className="text-amber-400 flex items-center gap-0.5">
                <Star size={11} className="fill-amber-400" />{activity.rating}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-white/15 rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-[var(--theme-primary)]">{editingItem ? "تعديل النشاط" : "إضافة نشاط جديد"}</span>
              </h2>
              <button onClick={() => setIsDialogOpen(false)} className="text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-right" dir="rtl">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">الاسم بالعربية *</label>
                  <Input
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    className="bg-black/50 border-white/10 text-white text-xs"
                    placeholder="مثال: رحلة سفاري بالجمال"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">الاسم بالإنجليزية</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-black/50 border-white/10 text-white text-xs"
                    dir="ltr"
                    placeholder="e.g. Camel Safari"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">الوصف التفصيلي</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-black/50 border-white/10 text-white text-xs"
                  rows={3}
                  placeholder="اكتب وصفاً جذاباً للنشاط ومميزاته..."
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">السعر ($)</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: +e.target.value })}
                    className="bg-black/50 border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">المدة</label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="bg-black/50 border-white/10 text-white text-xs"
                    placeholder="3 ساعات"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">الفئة</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="bg-black/50 border-white/10 text-white text-xs"
                    placeholder="مغامرات"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">الموقع / المدينة</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-black/50 border-white/10 text-white text-xs"
                  placeholder="القاهرة، الجيزة، الأقصر، شرم الشيخ..."
                />
              </div>

              {/* Image upload & URL */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">صورة النشاط</label>
                <div className="flex gap-2">
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="bg-black/50 border-white/10 text-white text-xs flex-1"
                    dir="ltr"
                    placeholder="https://... أو مسار الصورة"
                  />
                  <label className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer text-xs flex items-center gap-1 shrink-0 border border-white/10">
                    <Upload size={13} className="text-[var(--theme-primary)]" />
                    <span>{isUploading ? "جاري الرفع..." : "رفع ملف"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} disabled={isUploading} />
                  </label>
                </div>
                {formData.image && (
                  <div className="mt-2 w-24 h-16 rounded-lg overflow-hidden border border-white/10">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-white/10">
              <Button
                onClick={handleSave}
                disabled={saving || isUploading}
                className="flex-1 bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-bold text-xs"
              >
                {saving ? <Loader2 className="animate-spin ml-2" size={14} /> : <Save size={14} className="ml-2" />}
                {editingItem ? "حفظ التعديلات في السيرفر" : "إضافة وحفظ النشاط"}
              </Button>
              <Button
                onClick={() => setIsDialogOpen(false)}
                variant="outline"
                className="border-white/10 text-white/60 hover:text-white text-xs"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
