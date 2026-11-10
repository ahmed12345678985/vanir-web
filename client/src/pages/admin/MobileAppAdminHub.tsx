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
} from "lucide-react";
import {
  fetchMobileCards,
  saveMobileCards,
  fetchMobilePricing,
  saveMobilePricing,
  fetchMobilePaymentConfig,
  saveMobilePaymentConfig,
  sendMobilePushNotification,
  fetchRecentNotifications,
  uploadMobileImage,
  type MobileFeedCard,
  type MobilePricingRule,
  type MobilePaymentConfig,
  type PushNotificationPayload,
} from "@/lib/mobileAppApi";

export default function MobileAppAdminHub() {
  const [activeTab, setActiveTab] = useState<"photos" | "pricing" | "payments" | "push">("photos");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // 1. Photos & Cards State
  const [cards, setCards] = useState<MobileFeedCard[]>([]);
  const [uploadingCardId, setUploadingCardId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCardForUpload, setSelectedCardForUpload] = useState<string | null>(null);

  // 2. Pricing State
  const [pricingRules, setPricingRules] = useState<MobilePricingRule[]>([]);

  // 3. Payments State
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

  // 4. Push Notifications State
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [pushImageUrl, setPushImageUrl] = useState("");
  const [pushTarget, setPushTarget] = useState("HomeScreen");
  const [pushHistory, setPushHistory] = useState<PushNotificationPayload[]>([]);
  const [sendingPush, setSendingPush] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      const [fetchedCards, fetchedPricing, fetchedPayments, fetchedNotifs] = await Promise.all([
        fetchMobileCards(),
        fetchMobilePricing(),
        fetchMobilePaymentConfig(),
        fetchRecentNotifications(),
      ]);
      setCards(fetchedCards);
      setPricingRules(fetchedPricing);
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
    if (!file || !selectedCardForUpload) return;

    setUploadingCardId(selectedCardForUpload);
    try {
      const newUrl = await uploadMobileImage(file, "app_cards");
      setCards((prev) =>
        prev.map((c) => (c.id === selectedCardForUpload ? { ...c, image: newUrl } : c))
      );
      showToast("تم رفع واستبدال صورة البطاقة بنجاح!");
    } catch (err: any) {
      alert("خطأ أثناء رفع الصورة: " + (err?.message || "تأكد من اتصالك"));
    } finally {
      setUploadingCardId(null);
      setSelectedCardForUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSaveCards() {
    setSaving(true);
    try {
      await saveMobileCards(cards);
      showToast("تم حفظ ونشر بطاقات وصور التطبيق مباشرة لجميع الهواتف!");
    } catch (err: any) {
      alert("خطأ في الحفظ: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePricing() {
    setSaving(true);
    try {
      await saveMobilePricing(pricingRules);
      showToast("تم تحديث قائمة الأسعار والعملات في التطبيق بنجاح!");
    } catch (err: any) {
      alert("خطأ في حفظ الأسعار: " + err.message);
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

  return (
    <div className="min-h-screen bg-[#07070a] text-[#F8F9FA] p-6 lg:p-10 font-sans" dir="rtl">
      {/* Hidden file input */}
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
                إدارة صور وبانرات التطبيق لحظياً، تحديث الأسعار، بوابات الدفع و PayPal، وإرسال إشعارات الهواتف.
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
          onClick={() => setActiveTab("photos")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "photos"
              ? "bg-[#c9a84c] text-[#07070a] shadow-[0_4px_20px_rgba(201,168,76,0.3)]"
              : "text-[#8892B0] hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>تغيير ورفع صور التطبيق</span>
        </button>

        <button
          onClick={() => setActiveTab("pricing")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "pricing"
              ? "bg-[#c9a84c] text-[#07070a] shadow-[0_4px_20px_rgba(201,168,76,0.3)]"
              : "text-[#8892B0] hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>إدارة وتعديل الأسعار</span>
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

      {/* ======================= TAB 1: PHOTOS & CARDS ======================= */}
      {activeTab === "photos" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">بطاقات وصور شاشة التطبيق الرئيسية</h2>
              <p className="text-xs text-[#8892B0] mt-1">
                اضغط على زر "رفع صورة جديدة من جهازك" على أي بطاقة، وسيتم رفعها وتحديثها فوراً على هواتف المستخدمين.
              </p>
            </div>
            <button
              onClick={handleSaveCards}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#8b6914] text-[#07070a] font-bold text-sm hover:brightness-110 shadow-[0_4px_20px_rgba(201,168,76,0.3)] transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "جاري الحفظ..." : "نشر التغييرات للتطبيق"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card) => (
              <div
                key={card.id}
                className="group relative rounded-2xl border border-white/[0.08] bg-[#10101a] overflow-hidden hover:border-[#c9a84c]/50 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex flex-col justify-between"
              >
                <div>
                  {/* Image Preview */}
                  <div className="relative h-48 w-full overflow-hidden bg-black/40">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#10101a] via-transparent to-black/40" />

                    {/* Tag badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-[#07070a]/80 text-[#ecd58e] border border-[#c9a84c]/30 backdrop-blur-sm">
                      {card.tag}
                    </div>

                    {/* Price tag */}
                    {card.price && (
                      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg text-xs font-bold bg-[#c9a84c] text-[#07070a] shadow-md">
                        {card.price}
                      </div>
                    )}
                  </div>

                  {/* Details Form */}
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="text-[11px] text-[#8892B0] font-medium block mb-1">
                        عنوان البطاقة:
                      </label>
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCards((prev) =>
                            prev.map((c) => (c.id === card.id ? { ...c, title: val } : c))
                          );
                        }}
                        className="w-full rounded-lg bg-[#181828] border border-white/[0.08] px-3 py-1.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#8892B0] font-medium block mb-1">
                        الوصف الفرعي:
                      </label>
                      <input
                        type="text"
                        value={card.subtitle}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCards((prev) =>
                            prev.map((c) => (c.id === card.id ? { ...c, subtitle: val } : c))
                          );
                        }}
                        className="w-full rounded-lg bg-[#181828] border border-white/[0.08] px-3 py-1.5 text-xs text-[#CCD6F6] focus:border-[#c9a84c] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#8892B0] font-medium block mb-1">
                        السعر المعروض في التطبيق:
                      </label>
                      <input
                        type="text"
                        value={card.price || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCards((prev) =>
                            prev.map((c) => (c.id === card.id ? { ...c, price: val } : c))
                          );
                        }}
                        placeholder="مثال: $850 / night"
                        className="w-full rounded-lg bg-[#181828] border border-white/[0.08] px-3 py-1.5 text-xs text-[#c9a84c] font-mono focus:border-[#c9a84c] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Upload action button */}
                <div className="p-4 pt-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCardForUpload(card.id);
                      fileInputRef.current?.click();
                    }}
                    disabled={uploadingCardId === card.id}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.08)] hover:bg-[rgba(201,168,76,0.18)] text-xs font-bold text-[#ecd58e] transition-all"
                  >
                    <UploadCloud className="w-4 h-4 text-[#c9a84c]" />
                    <span>
                      {uploadingCardId === card.id
                        ? "جاري رفع الصورة..."
                        : "رفع صورة من جهازك"}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB 2: PRICING ======================= */}
      {activeTab === "pricing" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">إدارة تسعير الخدمات الفاخرة للتطبيق</h2>
              <p className="text-xs text-[#8892B0] mt-1">
                تعديل الأسعار الأساسية، نسب الخصومات، والعملات المعتمدة داخل التطبيق.
              </p>
            </div>
            <button
              onClick={handleSavePricing}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#8b6914] text-[#07070a] font-bold text-sm hover:brightness-110 shadow-[0_4px_20px_rgba(201,168,76,0.3)] transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "جاري الحفظ..." : "حفظ الأسعار للتطبيق"}</span>
            </button>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#10101a] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-[#141422] text-[#8892B0]">
                    <th className="py-3.5 px-4 font-bold">الخدمة الفاخرة</th>
                    <th className="py-3.5 px-4 font-bold">السعر الأساسي</th>
                    <th className="py-3.5 px-4 font-bold">العملة</th>
                    <th className="py-3.5 px-4 font-bold">الوحدة (لكل)</th>
                    <th className="py-3.5 px-4 font-bold">خصم (%)</th>
                    <th className="py-3.5 px-4 font-bold">حالة الخدمة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {pricingRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#c9a84c]" />
                        <span>{rule.title}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="number"
                          value={rule.basePrice}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setPricingRules((prev) =>
                              prev.map((r) => (r.id === rule.id ? { ...r, basePrice: val } : r))
                            );
                          }}
                          className="w-28 rounded-lg bg-[#181828] border border-white/[0.1] px-2.5 py-1 text-xs text-[#c9a84c] font-bold focus:border-[#c9a84c] focus:outline-none"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={rule.currency}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setPricingRules((prev) =>
                              prev.map((r) => (r.id === rule.id ? { ...r, currency: val } : r))
                            );
                          }}
                          className="rounded-lg bg-[#181828] border border-white/[0.1] px-2.5 py-1 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="EGP">EGP (ج.م)</option>
                          <option value="AED">AED (د.إ)</option>
                          <option value="SAR">SAR (ر.س)</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          value={rule.unit}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPricingRules((prev) =>
                              prev.map((r) => (r.id === rule.id ? { ...r, unit: val } : r))
                            );
                          }}
                          className="w-24 rounded-lg bg-[#181828] border border-white/[0.1] px-2.5 py-1 text-xs text-[#CCD6F6] focus:border-[#c9a84c] focus:outline-none"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="number"
                          value={rule.discountPercent || 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setPricingRules((prev) =>
                              prev.map((r) =>
                                r.id === rule.id ? { ...r, discountPercent: val } : r
                              )
                            );
                          }}
                          className="w-16 rounded-lg bg-[#181828] border border-white/[0.1] px-2 py-1 text-xs text-emerald-400 focus:border-[#c9a84c] focus:outline-none"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => {
                            setPricingRules((prev) =>
                              prev.map((r) =>
                                r.id === rule.id ? { ...r, isActive: !r.isActive } : r
                              )
                            );
                          }}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                            rule.isActive
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                              : "bg-rose-500/10 text-rose-300 border-rose-500/30"
                          }`}
                        >
                          {rule.isActive ? "نشط بالتطبيق" : "موقف مؤقتاً"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 3: PAYMENTS & PAYPAL ======================= */}
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

      {/* ======================= TAB 4: PUSH NOTIFICATIONS ======================= */}
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
                    رابط صورة البانر في الإشعار (اختياري):
                  </label>
                  <input
                    type="url"
                    value={pushImageUrl}
                    onChange={(e) => setPushImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl bg-[#181828] border border-white/[0.1] px-4 py-2.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
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
                  <div className="w-4 h-4 rounded-md bg-[#c9a84c] flex items-center justify-center text-[10px] text-black font-bold">
                    V
                  </div>
                  <span className="text-[11px] font-bold text-white">VANIR TRAVEL</span>
                  <span className="text-[9px] text-white/50 ml-auto">الآن</span>
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {pushTitle || "عنوان الإشعار التجريبي"}
                </div>
                <div className="text-[11px] text-white/80 line-clamp-2 mt-0.5">
                  {pushBody || "هنا يظهر نص الإشعار الفاخر على هاتف العميل خارج التطبيق..."}
                </div>
                {pushImageUrl && (
                  <div className="mt-2 h-20 w-full rounded-lg overflow-hidden bg-white/5">
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
