import React, { useState, useEffect, useRef } from "react";
import {
  Smartphone,
  UploadCloud,
  DollarSign,
  CreditCard,
  Bell,
  Sparkles,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Image as ImageIcon,
  Plane,
  Building,
  ShipWheel,
  Car,
  ShieldCheck,
  Send,
  Eye,
  AlertTriangle,
  ExternalLink,
  Layers,
  Sliders,
  Filter,
} from "lucide-react";
import {
  fetchFullMobileCatalog,
  saveFullMobileCatalog,
  fetchMobilePaymentConfig,
  saveMobilePaymentConfig,
  sendMobilePushNotification,
  fetchRecentNotifications,
  uploadMobileImage,
  type MobileCatalogEntity,
  type MobilePaymentConfig,
  type PushNotificationPayload,
  type ServiceType,
} from "@/lib/mobileAppApi";

export default function MobileAppAdminHub() {
  const [activeTab, setActiveTab] = useState<"catalog" | "payments" | "push">("catalog");
  const [selectedService, setSelectedService] = useState<"all" | ServiceType>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // 1. Catalog Items (Hotels, Jets, Yachts, Cars)
  const [catalogItems, setCatalogItems] = useState<MobileCatalogEntity[]>([]);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedItemForUpload, setSelectedItemForUpload] = useState<string | null>(null);

  // 2. Payments State
  const [paymentConfig, setPaymentConfig] = useState<MobilePaymentConfig>({
    paypalEnabled: true,
    paypalClientId: "",
    paypalMode: "sandbox",
    stripeEnabled: false,
    stripePublishableKey: "",
    customApiEnabled: false,
    customApiUrl: "",
    customApiKey: "",
    bankWireEnabled: true,
    bankWireIban: "",
    bankWireSwift: "",
    bankWireName: "",
    currency: "USD",
  });

  // 3. Push Notifications State
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [pushImageUrl, setPushImageUrl] = useState("");
  const [pushTarget, setPushTarget] = useState("HomeScreen");
  const [pushHistory, setPushHistory] = useState<PushNotificationPayload[]>([]);
  const [sendingPush, setSendingPush] = useState(false);
  const [uploadingPushImage, setUploadingPushImage] = useState(false);
  const pushFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      const [fetchedItems, fetchedPayments, fetchedNotifs] = await Promise.all([
        fetchFullMobileCatalog(),
        fetchMobilePaymentConfig(),
        fetchRecentNotifications(),
      ]);
      setCatalogItems(fetchedItems);
      setPaymentConfig(fetchedPayments);
      setPushHistory(fetchedNotifs);
    } catch (err) {
      console.error("Error loading mobile data:", err);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  // Handle Photo Upload directly from user machine
  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedItemForUpload) return;

    setUploadingItemId(selectedItemForUpload);
    try {
      const newUrl = await uploadMobileImage(file, "catalog_photos");
      setCatalogItems((prev) =>
        prev.map((c) => (c.id === selectedItemForUpload ? { ...c, image: newUrl } : c))
      );
      showToast("تم رفع واستبدال الصورة مباشرة من جهازك بنجاح!");
    } catch (err: any) {
      alert("خطأ أثناء رفع الصورة: " + (err?.message || "تأكد من اتصالك"));
    } finally {
      setUploadingItemId(null);
      setSelectedItemForUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // Upload Push Notification Banner from device
  async function handlePushImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPushImage(true);
    try {
      const url = await uploadMobileImage(file, "push_banners");
      setPushImageUrl(url);
      showToast("تم رفع صورة الإشعار من جهازك بنجاح!");
    } catch (err: any) {
      alert("خطأ أثناء رفع صورة الإشعار: " + err.message);
    } finally {
      setUploadingPushImage(false);
      if (pushFileInputRef.current) pushFileInputRef.current.value = "";
    }
  }

  async function handleSaveCatalog() {
    setSaving(true);
    try {
      await saveFullMobileCatalog(catalogItems);
      showToast("تم حفظ ونشر كافة الصور والأسعار مباشرة لتطبيق الموبايل لجميع الهواتف!");
    } catch (err: any) {
      alert("خطأ في الحفظ: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePayments() {
    setSaving(true);
    try {
      await saveMobilePaymentConfig(paymentConfig);
      showToast("تم حفظ إعدادات بوابات الدفع و PayPal في التطبيق بنجاح!");
    } catch (err: any) {
      alert("خطأ في حفظ بوابات الدفع: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSendPush(e: React.FormEvent) {
    e.preventDefault();
    if (!pushTitle || !pushBody) {
      alert("يرجى كتابة عنوان ونص الإشعار");
      return;
    }
    setSendingPush(true);
    try {
      await sendMobilePushNotification({
        title: pushTitle,
        body: pushBody,
        imageUrl: pushImageUrl || undefined,
        targetScreen: pushTarget,
      });
      showToast("تم إرسال الإشعار الخارجي (Push Notification) بنجاح لجميع مستخدمي التطبيق!");
      setPushTitle("");
      setPushBody("");
      setPushImageUrl("");
      const notifs = await fetchRecentNotifications();
      setPushHistory(notifs);
    } catch (err: any) {
      alert("خطأ في إرسال الإشعار: " + err.message);
    } finally {
      setSendingPush(false);
    }
  }

  const filteredItems = selectedService === "all"
    ? catalogItems
    : catalogItems.filter((item) => item.type === selectedService);

  return (
    <div className="min-h-screen bg-[#07070a] text-[#F8F9FA] p-6 lg:p-10 font-sans" dir="rtl">
      {/* Hidden file input for catalog images */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c9a84c] to-[#8b6914] flex items-center justify-center shadow-[0_4px_20px_rgba(201,168,76,0.3)]">
              <Smartphone className="w-6 h-6 text-[#07070a]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
                  مركز تحكم تطبيق الموبايل (Vanir Mobile Hub)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#c9a84c]/20 text-[#ecd58e] border border-[#c9a84c]/40">
                  الإصدار 1.7.5 نشط
                </span>
              </div>
              <p className="text-sm text-[#8892B0] mt-1">
                إدارة صور وأسعار كافة الفنادق، الطيران الخاص، اليخوت الفاخرة، والسيارات لحظياً + بوابات الدفع وإشعارات الهواتف.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.1] bg-[#141422] hover:bg-[#1a1a2e] text-sm text-[#CCD6F6] transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#c9a84c]" : ""}`} />
            <span>تحديث البيانات</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "catalog"
              ? "bg-[#c9a84c] text-[#07070a] shadow-[0_4px_20px_rgba(201,168,76,0.3)]"
              : "text-[#8892B0] hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>إدارة كافة خدمات وصور وأسعار التطبيق ({catalogItems.length} عنصر)</span>
        </button>

        <button
          onClick={() => setActiveTab("payments")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "payments"
              ? "bg-[#c9a84c] text-[#07070a] shadow-[0_4px_20px_rgba(201,168,76,0.3)]"
              : "text-[#8892B0] hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>بوابات الدفع و PayPal</span>
        </button>

        <button
          onClick={() => setActiveTab("push")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "push"
              ? "bg-[#c9a84c] text-[#07070a] shadow-[0_4px_20px_rgba(201,168,76,0.3)]"
              : "text-[#8892B0] hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>الإشعارات خارج التطبيق (Push)</span>
        </button>
      </div>

      {/* ======================= TAB 1: COMPREHENSIVE CATALOG ======================= */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          {/* Sub-Filters by Category */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#10101a] p-4 rounded-2xl border border-white/[0.08]">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs text-[#8892B0] font-medium ml-2">تصنيف الخدمة:</span>
              <button
                onClick={() => setSelectedService("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedService === "all"
                    ? "bg-[#c9a84c] text-black"
                    : "bg-[#181828] text-[#CCD6F6] hover:bg-white/10"
                }`}
              >
                الكل ({catalogItems.length})
              </button>
              <button
                onClick={() => setSelectedService("hotel")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedService === "hotel"
                    ? "bg-[#c9a84c] text-black"
                    : "bg-[#181828] text-[#CCD6F6] hover:bg-white/10"
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>الفنادق والمنتجعات ({catalogItems.filter((i) => i.type === "hotel").length})</span>
              </button>
              <button
                onClick={() => setSelectedService("jet")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedService === "jet"
                    ? "bg-[#c9a84c] text-black"
                    : "bg-[#181828] text-[#CCD6F6] hover:bg-white/10"
                }`}
              >
                <Plane className="w-3.5 h-3.5" />
                <span>الطيران الخاص ({catalogItems.filter((i) => i.type === "jet").length})</span>
              </button>
              <button
                onClick={() => setSelectedService("yacht")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedService === "yacht"
                    ? "bg-[#c9a84c] text-black"
                    : "bg-[#181828] text-[#CCD6F6] hover:bg-white/10"
                }`}
              >
                <ShipWheel className="w-3.5 h-3.5" />
                <span>اليخوت الفاخرة ({catalogItems.filter((i) => i.type === "yacht").length})</span>
              </button>
              <button
                onClick={() => setSelectedService("car")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedService === "car"
                    ? "bg-[#c9a84c] text-black"
                    : "bg-[#181828] text-[#CCD6F6] hover:bg-white/10"
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>السيارات الفارهة ({catalogItems.filter((i) => i.type === "car").length})</span>
              </button>
            </div>

            <button
              onClick={handleSaveCatalog}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#8b6914] text-[#07070a] font-bold text-sm hover:brightness-110 shadow-[0_4px_20px_rgba(201,168,76,0.3)] transition-all shrink-0 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "جاري الحفظ..." : "نشر جميع التعديلات للتطبيق"}</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl border border-white/[0.08] bg-[#10101a] overflow-hidden hover:border-[#c9a84c]/50 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex flex-col justify-between"
              >
                <div>
                  {/* Image Preview with direct upload trigger */}
                  <div className="relative h-48 w-full overflow-hidden bg-black/40">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#10101a] via-transparent to-black/40" />

                    {/* Service Type Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-bold bg-[#07070a]/80 text-[#ecd58e] border border-[#c9a84c]/30 backdrop-blur-sm flex items-center gap-1.5">
                      {item.type === "hotel" && <Building className="w-3 h-3 text-[#c9a84c]" />}
                      {item.type === "jet" && <Plane className="w-3 h-3 text-[#c9a84c]" />}
                      {item.type === "yacht" && <ShipWheel className="w-3 h-3 text-[#c9a84c]" />}
                      {item.type === "car" && <Car className="w-3 h-3 text-[#c9a84c]" />}
                      <span>
                        {item.type === "hotel"
                          ? "فندق"
                          : item.type === "jet"
                          ? "طيران خاص"
                          : item.type === "yacht"
                          ? "يخت فاخر"
                          : "سيارة فاخرة"}
                      </span>
                    </div>

                    {/* Price Tag badge */}
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#c9a84c] text-[#07070a] shadow-md">
                      {item.price} {item.pricePer ? `/ ${item.pricePer}` : ""}
                    </div>
                  </div>

                  {/* Editable Fields */}
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="text-[11px] text-[#8892B0] font-medium block mb-1">
                        اسم الخدمة / الفندق / الطائرة:
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCatalogItems((prev) =>
                            prev.map((c) => (c.id === item.id ? { ...c, name: val } : c))
                          );
                        }}
                        className="w-full rounded-lg bg-[#181828] border border-white/[0.08] px-3 py-1.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#8892B0] font-medium block mb-1">
                        الموقع أو المواصفات:
                      </label>
                      <input
                        type="text"
                        value={item.subtitle}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCatalogItems((prev) =>
                            prev.map((c) => (c.id === item.id ? { ...c, subtitle: val } : c))
                          );
                        }}
                        className="w-full rounded-lg bg-[#181828] border border-white/[0.08] px-3 py-1.5 text-xs text-[#CCD6F6] focus:border-[#c9a84c] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-[#8892B0] font-medium block mb-1">
                          السعر الرقمي:
                        </label>
                        <input
                          type="number"
                          value={item.priceNumeric}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setCatalogItems((prev) =>
                              prev.map((c) =>
                                c.id === item.id
                                  ? {
                                      ...c,
                                      priceNumeric: val,
                                      price: `$${val.toLocaleString()}`,
                                    }
                                  : c
                              )
                            );
                          }}
                          className="w-full rounded-lg bg-[#181828] border border-white/[0.08] px-2.5 py-1.5 text-xs text-[#c9a84c] font-bold focus:border-[#c9a84c] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-[#8892B0] font-medium block mb-1">
                          العملة:
                        </label>
                        <select
                          value={item.currency}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setCatalogItems((prev) =>
                              prev.map((c) => (c.id === item.id ? { ...c, currency: val } : c))
                            );
                          }}
                          className="w-full rounded-lg bg-[#181828] border border-white/[0.08] px-2 py-1.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="EGP">EGP (ج.م)</option>
                          <option value="AED">AED (د.إ)</option>
                          <option value="SAR">SAR (ر.س)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload action button directly from device */}
                <div className="p-4 pt-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedItemForUpload(item.id);
                      fileInputRef.current?.click();
                    }}
                    disabled={uploadingItemId === item.id}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.08)] hover:bg-[rgba(201,168,76,0.18)] text-xs font-bold text-[#ecd58e] transition-all"
                  >
                    <UploadCloud className="w-4 h-4 text-[#c9a84c]" />
                    <span>
                      {uploadingItemId === item.id
                        ? "جاري رفع الصورة من جهازك..."
                        : "رفع صورة من جهازك لهذا العنصر"}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB 2: PAYMENTS & PAYPAL ======================= */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">إدارة عمليات الدفع وبوابات الـ API و PayPal</h2>
              <p className="text-xs text-[#8892B0] mt-1">
                ربط حساب PayPal ومفاتيح الـ API لتلقي مدفوعات الحجوزات من داخل التطبيق مباشرة.
              </p>
            </div>
            <button
              onClick={handleSavePayments}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#8b6914] text-[#07070a] font-bold text-sm hover:brightness-110 shadow-[0_4px_20px_rgba(201,168,76,0.3)] transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "جاري الحفظ..." : "حفظ إعدادات الدفع"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PayPal Gateway */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#10101a] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#003087]/20 border border-[#003087]/50 flex items-center justify-center font-bold text-[#0079C1] text-lg">
                    P
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">بوابة PayPal الرسمية</h3>
                    <p className="text-xs text-[#8892B0]">قبول بطاقات الائتمان وحسابات PayPal عالمياً</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={paymentConfig.paypalEnabled}
                  onChange={(e) =>
                    setPaymentConfig((prev) => ({ ...prev, paypalEnabled: e.target.checked }))
                  }
                  className="w-5 h-5 accent-[#c9a84c] cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs text-[#8892B0] font-medium block mb-1.5">
                  PayPal Client ID (معرف العميل):
                </label>
                <input
                  type="text"
                  value={paymentConfig.paypalClientId}
                  onChange={(e) =>
                    setPaymentConfig((prev) => ({ ...prev, paypalClientId: e.target.value }))
                  }
                  placeholder="e.g. A21AAJ... (من لوحة تحكم PayPal Developer)"
                  className="w-full rounded-xl bg-[#181828] border border-white/[0.1] px-4 py-2.5 text-xs text-white font-mono focus:border-[#c9a84c] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#8892B0] font-medium block mb-1.5">
                  بيئة التشغيل (Environment Mode):
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-[#CCD6F6] cursor-pointer">
                    <input
                      type="radio"
                      name="paypalMode"
                      value="sandbox"
                      checked={paymentConfig.paypalMode === "sandbox"}
                      onChange={() =>
                        setPaymentConfig((prev) => ({ ...prev, paypalMode: "sandbox" }))
                      }
                      className="accent-[#c9a84c]"
                    />
                    <span>بيئة تجريبية (Sandbox Testing)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[#CCD6F6] cursor-pointer">
                    <input
                      type="radio"
                      name="paypalMode"
                      value="live"
                      checked={paymentConfig.paypalMode === "live"}
                      onChange={() =>
                        setPaymentConfig((prev) => ({ ...prev, paypalMode: "live" }))
                      }
                      className="accent-[#c9a84c]"
                    />
                    <span>بيئة إنتاج حقيقية (Live Production)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Custom Payment Gateway API */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#10101a] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center font-bold text-purple-400 text-lg">
                    API
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">بوابة دفع مخصصة (Custom Payment API)</h3>
                    <p className="text-xs text-[#8892B0]">ربط أي بوابة دفع مثل Stripe / Paymob / Tap Payments</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={paymentConfig.customApiEnabled}
                  onChange={(e) =>
                    setPaymentConfig((prev) => ({ ...prev, customApiEnabled: e.target.checked }))
                  }
                  className="w-5 h-5 accent-[#c9a84c] cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs text-[#8892B0] font-medium block mb-1.5">
                  رابط الـ Endpoint (API Webhook / URL):
                </label>
                <input
                  type="text"
                  value={paymentConfig.customApiUrl}
                  onChange={(e) =>
                    setPaymentConfig((prev) => ({ ...prev, customApiUrl: e.target.value }))
                  }
                  placeholder="https://api.yourgateway.com/v1/charge"
                  className="w-full rounded-xl bg-[#181828] border border-white/[0.1] px-4 py-2.5 text-xs text-white font-mono focus:border-[#c9a84c] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#8892B0] font-medium block mb-1.5">
                  مفتاح التوثيق (API Secret / Public Key):
                </label>
                <input
                  type="password"
                  value={paymentConfig.customApiKey}
                  onChange={(e) =>
                    setPaymentConfig((prev) => ({ ...prev, customApiKey: e.target.value }))
                  }
                  placeholder="sk_live_..."
                  className="w-full rounded-xl bg-[#181828] border border-white/[0.1] px-4 py-2.5 text-xs text-white font-mono focus:border-[#c9a84c] focus:outline-none"
                />
              </div>
            </div>

            {/* Bank Wire VIP */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#10101a] p-6 space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#c9a84c]/20 border border-[#c9a84c]/40 flex items-center justify-center font-bold text-[#ecd58e] text-lg">
                    🏛️
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">التحويل البنكي الفاخر (VIP Bank Wire)</h3>
                    <p className="text-xs text-[#8892B0]">بيانات الحساب البنكي لحجوزات الطيران واليخوت الكبرى</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={paymentConfig.bankWireEnabled}
                  onChange={(e) =>
                    setPaymentConfig((prev) => ({ ...prev, bankWireEnabled: e.target.checked }))
                  }
                  className="w-5 h-5 accent-[#c9a84c] cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-[#8892B0] font-medium block mb-1.5">اسم المستفيد (Beneficiary):</label>
                  <input
                    type="text"
                    value={paymentConfig.bankWireName}
                    onChange={(e) =>
                      setPaymentConfig((prev) => ({ ...prev, bankWireName: e.target.value }))
                    }
                    className="w-full rounded-xl bg-[#181828] border border-white/[0.1] px-4 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8892B0] font-medium block mb-1.5">رقم الآيبان (IBAN):</label>
                  <input
                    type="text"
                    value={paymentConfig.bankWireIban}
                    onChange={(e) =>
                      setPaymentConfig((prev) => ({ ...prev, bankWireIban: e.target.value }))
                    }
                    className="w-full rounded-xl bg-[#181828] border border-white/[0.1] px-4 py-2 text-xs text-[#c9a84c] font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8892B0] font-medium block mb-1.5">رمز السويفت (SWIFT / BIC):</label>
                  <input
                    type="text"
                    value={paymentConfig.bankWireSwift}
                    onChange={(e) =>
                      setPaymentConfig((prev) => ({ ...prev, bankWireSwift: e.target.value }))
                    }
                    className="w-full rounded-xl bg-[#181828] border border-white/[0.1] px-4 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 3: PUSH NOTIFICATIONS ======================= */}
      {activeTab === "push" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">إرسال إشعارات خارج التطبيق (Push Notifications Hub)</h2>
            <p className="text-xs text-[#8892B0] mt-1">
              إرسال تنبيهات تظهر على شاشة القفل لجميع الهواتف التي قامت بتثبيت تطبيق Vanir Travel Gold.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <form
              onSubmit={handleSendPush}
              className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-[#10101a] p-6 space-y-4"
            >
              <div>
                <label className="text-xs text-[#8892B0] font-medium block mb-1.5">
                  عنوان الإشعار (Notification Title):
                </label>
                <input
                  type="text"
                  required
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  placeholder="مثال: خصم حصري 20% على رحلات الطيران الخاص إلى دبي"
                  className="w-full rounded-xl bg-[#181828] border border-white/[0.1] px-4 py-3 text-sm text-white focus:border-[#c9a84c] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#8892B0] font-medium block mb-1.5">
                  نص الرسالة (Message Body):
                </label>
                <textarea
                  required
                  rows={3}
                  value={pushBody}
                  onChange={(e) => setPushBody(e.target.value)}
                  placeholder="احجز الآن واستمتع بخدمة VIP وسيارات الليموزين المجانية المرافقة لرحلتك..."
                  className="w-full rounded-xl bg-[#181828] border border-white/[0.1] px-4 py-3 text-sm text-[#CCD6F6] focus:border-[#c9a84c] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#8892B0] font-medium block mb-1.5">
                    صورة البانر للإشعار (من جهازك مباشرة):
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => pushFileInputRef.current?.click()}
                      disabled={uploadingPushImage}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.08)] hover:bg-[rgba(201,168,76,0.18)] text-xs font-bold text-[#ecd58e] transition-all"
                    >
                      <UploadCloud className="w-4 h-4 text-[#c9a84c]" />
                      <span>{uploadingPushImage ? "جاري رفع الصورة..." : "اختر صورة من جهازك"}</span>
                    </button>
                    {pushImageUrl && (
                      <button
                        type="button"
                        onClick={() => setPushImageUrl("")}
                        className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs hover:bg-red-500/20"
                        title="حذف الصورة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={pushFileInputRef}
                    onChange={handlePushImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#8892B0] font-medium block mb-1.5">
                    الشاشة المستهدفة عند فتح الإشعار:
                  </label>
                  <select
                    value={pushTarget}
                    onChange={(e) => setPushTarget(e.target.value)}
                    className="w-full rounded-xl bg-[#181828] border border-white/[0.1] px-4 py-2.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
                  >
                    <option value="HomeScreen">الرئيسية (Home Feed)</option>
                    <option value="HotelBooking">حجز الفنادق (Hotels)</option>
                    <option value="PrivateJetBooking">الطيران الخاص (Private Jets)</option>
                    <option value="YachtBooking">اليخوت الفاخرة (Yachts)</option>
                    <option value="CarRental">ليموزين والسيارات (Transfers)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={sendingPush}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#8b6914] text-[#07070a] font-bold text-sm hover:brightness-110 shadow-[0_4px_20px_rgba(201,168,76,0.3)] transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{sendingPush ? "جاري البث والإرسال..." : "إرسال الإشعار الفوري لجميع الهواتف"}</span>
              </button>
            </form>

            {/* Mobile Lockscreen Preview */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#10101a] p-6 flex flex-col items-center justify-center">
              <h3 className="text-xs font-bold text-[#8892B0] mb-4">معاينة الإشعار على شاشة قفل الهاتف:</h3>
              <div className="w-64 rounded-3xl border border-white/[0.15] bg-[#000000]/90 p-4 shadow-[0_15px_35px_rgba(0,0,0,0.8)] backdrop-blur-md">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-md overflow-hidden bg-black flex items-center justify-center border border-[#c9a84c]/40 shrink-0">
                    <img
                      src="/logo-vanir.png"
                      alt="Vanir Logo"
                      className="w-full h-full object-contain p-0.5"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-bold tracking-wider text-[#ecd58e]">VANIR</span>
                  <span className="text-[9px] text-white/50 ml-auto">الآن</span>
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {pushTitle || "عنوان الإشعار التجريبي"}
                </div>
                <div className="text-[11px] text-white/80 line-clamp-2 mt-0.5">
                  {pushBody || "هنا يظهر نص الإشعار الفاخر على هاتف العميل خارج التطبيق..."}
                </div>
                {pushImageUrl && (
                  <div className="mt-2 h-24 w-full rounded-lg overflow-hidden bg-white/5 border border-white/10">
                    <img src={pushImageUrl} alt="banner" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
