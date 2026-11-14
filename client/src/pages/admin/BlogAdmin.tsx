import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Search, Eye, Upload, FileText, Sparkles, Layers, Download, CheckCircle2, Loader2, RefreshCw, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  listAllBlogPosts,
  saveBlogPost,
  deleteBlogPost,
  bulkImportBlogPosts,
  generateSlug,
  type BlogPostItem
} from "@/lib/blogApi";

export default function BlogAdmin() {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [bulkMode, setBulkMode] = useState<"seo_batch" | "json" | "csv">("seo_batch");
  const [seoCategory, setSeoCategory] = useState("Luxury Travel");
  const [seoLang, setSeoLang] = useState<"ar" | "en">("ar");
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isRefreshingImages, setIsRefreshingImages] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<BlogPostItem[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    imageUrl: "",
    category: "Luxury Travel",
    author: "Ahmed Roshdi",
    tags: "Luxury, Private Jet, Egypt, Concierge",
    status: "published" as "published" | "draft" | "archived",
  });

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const list = await listAllBlogPosts();
      setArticles(list);
    } catch (err: any) {
      console.error("Error loading articles:", err);
      toast.error("فشل تحميل المقالات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      imageUrl: "",
      category: "Luxury Travel",
      author: "Ahmed Roshdi",
      tags: "Luxury, Private Jet, Egypt, Concierge",
      status: "published",
    });
    setEditingId(null);
  };

  const handleOpenEdit = (article: BlogPostItem) => {
    setEditingId(article.id);
    setFormData({
      title: article.title || "",
      slug: article.slug || "",
      content: article.content || "",
      excerpt: article.excerpt || "",
      imageUrl: article.coverImageUrl || "",
      category: article.category || "Luxury Travel",
      author: article.authorName || "Ahmed Roshdi",
      tags: Array.isArray(article.tags) ? article.tags.join(", ") : (article.tags || ""),
      status: article.status || "published",
    });
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.title.trim()) {
      toast.error("عنوان المقالة مطلوب");
      return;
    }

    if (!formData.content || !formData.content.trim()) {
      toast.error("محتوى المقالة مطلوب");
      return;
    }

    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const excerpt = formData.excerpt?.trim() || formData.content.slice(0, 160) + "...";
    const slug = formData.slug?.trim() || generateSlug(formData.title);

    setIsSaving(true);
    try {
      await saveBlogPost({
        id: editingId,
        title: formData.title,
        slug,
        excerpt,
        content: formData.content,
        coverImageUrl: formData.imageUrl || "/The_Nile_River_at_Cairo.jpg",
        category: formData.category,
        authorName: formData.author,
        tags,
        status: formData.status,
      });

      toast.success(editingId ? "تم تحديث المقالة بنجاح!" : "تم إنشاء وحفظ المقالة بنجاح في الموقع!");
      await loadArticles();
      setIsOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Save blog post error:", err);
      toast.error(`خطأ في حفظ المقالة: ${err.message || "فشلت العملية"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (article: BlogPostItem) => {
    if (!confirm(`هل أنت متأكد من حذف المقالة "${article.title}"؟`)) return;
    try {
      await deleteBlogPost(article.id);
      toast.success("تم حذف المقالة بنجاح");
      await loadArticles();
    } catch (err: any) {
      console.error("Delete blog post error:", err);
      toast.error(`خطأ في حذف المقالة: ${err.message || "فشلت العملية"}`);
    }
  };

  // Sample bulk JSON template
  const sampleJson = [
    {
      title: "دليل استئجار الطائرات الخاصة في مصر 2026",
      slug: "private-jet-charter-egypt-guide-2026",
      excerpt: "دليل شامل لكل ما يخص حجز الطائرات الخاصة الفاخرة للرحلات الدبلوماسية ورجال الأعمال.",
      content: "محتوى المقال الكامل هنا بالتفصيل عن تجربة الطيران الخاص وحجوزات كبار الشخصيات...",
      category: "Private Jet",
      authorName: "Ahmed Roshdi",
      coverImageUrl: "/images/The_Nile_River_at_Cairo.jpg",
      tags: ["Private Jet", "Cairo", "Luxury"],
      status: "published"
    },
    {
      title: "أفضل 5 جزر خاصة في العالم للاستجمام",
      slug: "top-5-private-islands-world",
      excerpt: "استكشف أروع الجزر الخاصة المعزولة ذات الخصوصية المطلقة للأثرياء والعائلات الملكية.",
      content: "تفاصيل الجزر الخاصة والمنتجعات الفاخرة التي توفر أقصى درجات الراحة والهدوء...",
      category: "Luxury Travel",
      authorName: "Ahmed Roshdi",
      coverImageUrl: "/images/The_Nile_River_at_Cairo.jpg",
      tags: ["Private Island", "Maldives", "Luxury"],
      status: "published"
    }
  ];

  const handleDownloadSample = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sampleJson, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "articles_sample_template.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const pickTopicCoverImage = (topic: string, idx = 0, usedSet?: Set<string>): string => {
    const t = topic.toLowerCase();
    const diversePool = [
      "/images/destinations/world_iceland_aurora.jpg",
      "/images/destinations/world_switzerland_interlaken.jpg",
      "/images/destinations/world_italy_amalfi.jpg",
      "/images/destinations/world_greece_mykonos.jpg",
      "/images/destinations/world_japan_kyoto.jpg",
      "/images/destinations/world_morocco_marrakech.jpg",
      "/images/destinations/world_thailand_phi_phi.jpg",
      "/images/destinations/world_usa_new_york.jpg",
      "/images/destinations/world_australia_sydney.jpg",
      "/images/destinations/world_brazil_rio.jpg",
      "/images/destinations/egypt_siwa_oasis.jpg",
      "/images/destinations/egypt_aswan_nile.jpg",
      "/images/destinations/egypt_cairo_moez_street.jpg",
      "/images/destinations/egypt_luxor_hatshepsut.jpg",
      "/images/destinations/egypt_abu_simbel.jpg",
      "/images/destinations/egypt_alexandria_citadel.jpg",
      "/images/destinations/egypt_dahab_blue_hole.jpg",
      "/images/destinations/egypt_hurghada_beach.jpg",
      "/images/destinations/egypt_white_desert.jpg",
      "/images/services/service_flight_booking.jpg",
      "/images/services/service_hotel_reservation.jpg",
      "/images/services/service_custom_itinerary.jpg",
      "/images/services/service_corporate_travel.jpg",
      "/images/services/service_transportation.jpg",
      "/images/Regent-Seven-Seas-Voyager-Pool-Deck.jpg",
      "/images/FS-Landaa-Giraavaru-Water-Villa-Maldives.jpeg",
      "/images/Four-Seasons-Hualalai-1.jpeg",
    ];

    let preferred = "";
    // Specific destinations
    if (/dubai|دبي|إمارات|uae/.test(t)) preferred = "/images/final_dubai_post.png";
    else if (/cairo|قاهر|أهرام|pyramids|giza|جيزة/.test(t)) preferred = "/images/destinations/egypt_cairo_moez_street.jpg";
    else if (/luxor|أقصر|الأقصر/.test(t)) preferred = "/images/destinations/egypt_luxor_hatshepsut.jpg";
    else if (/aswan|أسوان/.test(t)) preferred = "/images/destinations/egypt_aswan_nile.jpg";
    else if (/alexandria|إسكندرية|اسكندرية/.test(t)) preferred = "/images/destinations/egypt_alexandria_citadel.jpg";
    else if (/sharm|شرم/.test(t)) preferred = "/images/final_sharm_post.png";
    else if (/dahab|دهب/.test(t)) preferred = "/images/destinations/egypt_dahab_blue_hole.jpg";
    else if (/siwa|سيوة/.test(t)) preferred = "/images/destinations/egypt_siwa_oasis.jpg";
    else if (/marsa|مرسى علم/.test(t)) preferred = "/images/destinations/egypt_marsa_alam_dugong.jpg";
    else if (/london|لندن/.test(t)) preferred = "/images/final_london_post.png";
    else if (/paris|باريس/.test(t)) preferred = "/images/final_paris_post.png";
    else if (/rome|روما|italy|إيطاليا/.test(t)) preferred = "/images/destinations/world_italy_amalfi.jpg";
    else if (/istanbul|إسطنبول|اسطنبول|تركيا/.test(t)) preferred = "/images/final_istanbul_post.png";
    else if (/santorini|سانتوريني|يونان|greece/.test(t)) preferred = "/images/destinations/world_greece_mykonos.jpg";
    else if (/tokyo|طوكيو|japan|يابان/.test(t)) preferred = "/images/destinations/world_japan_kyoto.jpg";
    else if (/bali|بالي/.test(t)) preferred = "/images/final_bali_post.png";
    else if (/malaysia|ماليزيا/.test(t)) preferred = "/images/final_malaysia_post.png";
    else if (/maldives|island|جزر|مالديف/.test(t)) preferred = "/images/FS-Landaa-Giraavaru-Water-Villa-Maldives.jpeg";
    // Travel themes & services
    else if (/noctourism|night|ليل|ليلي|نجوم|سماء/.test(t)) preferred = "/images/destinations/world_iceland_aurora.jpg";
    else if (/slow travel|بطيئ|أهل البلد|ثقاف|محلي/.test(t)) preferred = "/images/destinations/world_switzerland_interlaken.jpg";
    else if (/quiet|escape|calm|crowd|nature|ضوضاء|زحام|هدوء|استجمام|طبيعة/.test(t)) preferred = "/images/destinations/egypt_siwa_oasis.jpg";
    else if (/jet|flight|aviation|airport|ticket|طائر|طيران|تذاكر|مطار/.test(t)) preferred = "/images/services/service_flight_booking.jpg";
    else if (/yacht|cruise|nile|sea|يخت|نيل|بحر|كروز/.test(t)) preferred = "/images/Regent-Seven-Seas-Voyager-Pool-Deck.jpg";
    else if (/hotel|resort|stay|villa|فندق|فنادق|منتجع|إقامة|فيلا/.test(t)) preferred = "/images/services/service_hotel_reservation.jpg";
    else if (/ai|smart|tech|future|ذكاء|ذكية|تقني|مستقبل/.test(t)) preferred = "/images/destinations/world_japan_kyoto.jpg";
    else if (/shop|luxury|brand|تسوق|فاخر/.test(t)) preferred = "/images/destinations/world_usa_new_york.jpg";
    else if (/culture|museum|history|متحف|تاريخ|تراث/.test(t)) preferred = "/images/destinations/egypt_abu_simbel.jpg";
    else if (/adventure|safari|desert|مغامر|سفاري|صحراء/.test(t)) preferred = "/images/destinations/egypt_white_desert.jpg";

    if (preferred && (!usedSet || !usedSet.has(preferred))) {
      usedSet?.add(preferred);
      return preferred;
    }

    // Pick next unused image from diversePool so every article in a batch gets a unique photo
    if (usedSet) {
      for (let offset = 0; offset < diversePool.length; offset++) {
        const candidate = diversePool[(idx + offset) % diversePool.length];
        if (!usedSet.has(candidate)) {
          usedSet.add(candidate);
          return candidate;
        }
      }
    }

    return diversePool[idx % diversePool.length];
  };

  const buildTopicArticleBody = (title: string, seedText: string, lang: "ar" | "en") => {
    const t = `${title} ${seedText}`.toLowerCase();

    if (lang === "ar") {
      let intro = seedText && seedText !== title ? `${seedText}\n\n` : "";
      let sections: string[] = [];
      let faq1Q = `ما هو أفضل وقت لتجربة ${title}؟`;
      let faq1A = `يُفضل التخطيط قبل موعد السفر بـ 4 إلى 8 أسابيع للاستفادة من أفضل أسعار الطيران وتوافر الفنادق، مع اختيار المواسم المعتدلة (الربيع أو الخريف أو الشتاء الدافئ).`;
      let faq2Q = `كيف يمكنني حجز رحلتي بأفضل سعر وجودة؟`;
      let faq2A = `يمكنك مقارنة مواعيد السفر المرنة أو التواصل مع فريق VANIR GROUP لتجهيز برنامج متكامل يشمل الطيران والإقامة والتنقلات بأفضل قيمة.`;

      if (/شتاء|دافئة|اقتصادية|winter|warm|budget/.test(t)) {
        intro += `إذا كنت تبحث عن الهروب من برد الشتاء القارس دون إنفاق ميزانية ضخمة، فإن عام 2026 يقدم خيارات رائعة تجمع بين الشمس الدافئة، التجارب الثقافية الأصيلة، والتكاليف المناسبة.`;
        sections = [
          `## أبرز الوجهات الدافئة في الشتاء بميزانية اقتصادية`,
          `1. **أسوان والأقصر (مصر):** طقس مشمس معتدل نهاراً (22–26°م)، رحلات نيلية ساحرة، ومعابد تاريخية بتكلفة إقامة وتنقل مناسبة جداً مقارنة بأوروبا.`,
          `2. **دهب وشرم الشيخ:** مياه البحر الأحمر الدافئة طوال العام، أنشطة الغوص والسنوركلينج، وإقامات متنوعة تناسب كل الميزانيات.`,
          `3. **مراكش وأكادير (المغرب):** أسواق تراثية، أجواء دافئة، وتكلفة طعام وإقامة اقتصادية مع طيران مباشر من أغلب العواصم العربية.`,
          `4. **مسقط وصلالة (عُمان):** طبيعة خلابة، شواطئ هادئة، وأجواء شتوية معتدلة بعيداً عن الازدحام.`,
          `5. **تايلاند وماليزيا (بانكوك، كوالالمبور):** موسم الجفاف في الشتاء يجعلها مثالية للاستكشاف بأسعار فنادق 4 و5 نجوم منافسة جداً.`,
          `## نصائح ذهبية لتوفير 30% من ميزانية الشتاء`,
          `- احجز تذاكر الطيران قبل السفر بـ 6 أسابيع واختر الرحلات في منتصف الأسبوع (الثلاثاء والأربعاء).`,
          `- اختر الفنادق القريبة من المواصلات أو وسط المدينة لتقليل تكاليف التنقل اليومي.`,
          `- اجمع بين الإقامة الاقتصادية والتجارب المحلية مثل الأسواق الشعبية والجولات الحرة.`,
        ];
        faq1Q = `ما هي أرخص وجهة دافئة في الشتاء للمسافر العربي؟`;
        faq1A = `تُعد أسوان، دهب، ومراكش من أكثر الوجهات الدافئة توفيراً من حيث تكلفة الطيران والإقامة والطعام مع طقس شتوي مشمس ومثالي.`;
      } else if (/ألماتي|ألماني|كازاخستان|kazakhstan|almaty/.test(t)) {
        intro += `أصبحت **ألماتي في كازاخستان** واحدة من أسرع الوجهات الصاعدة جذباً للمسافرين العرب، بفضل طبيعتها الجبلية الخلابة، سهولة الدخول بدون تعقيدات، وتكاليفها الاقتصادية مقارنة بالوجهات الأوروبية.`;
        sections = [
          `## أهم المعالم السياحية التي لا تفوتها في ألماتي`,
          `1. **بحيرة ألماتي الكبرى (Big Almaty Lake):** بحيرة فيروزية محاطة بجبال تيان شان الشاهقة على ارتفاع 2500 متر.`,
          `2. **منتجع شيمبولاك للتزلج (Shymbulak):** يبعد 25 دقيقة فقط عن وسط المدينة، ويوفر تلفريك وإطلالات ثلجية مذهلة طوال الشتاء والربيع.`,
          `3. **تلة كوك توبي (Kok-Tobe):** أفضل مكان لمشاهدة غروب الشمس وبانوراما المدينة بالكامل.`,
          `4. **وادي تشارين (Charyn Canyon):** يُلقب بـ "جراند كانيون آسيا" ويبعد نحو 3 ساعات في رحلة يومية مذهلة.`,
          `## التكلفة المتوقعة وأفضل وقت للزيارة`,
          `- **الميزانية اليومية:** تتراوح بين 50 إلى 90 دولاراً شاملة الإقامة الفندقية الجيدة والمواصلات والمطاعم.`,
          `- **أفضل وقت:** من مايو إلى سبتمبر للطبيعة الخضراء والبحيرات، ومن ديسمبر إلى مارس لعشاق الثلوج والتزلج.`,
        ];
        faq1Q = `هل تحتاج كازاخستان إلى فيزا مسبقة؟`;
        faq1A = `تمنح كازاخستان إعفاءً من التأشيرة أو تسهيلات دخول إلكترونية للعديد من الجنسيات العربية لمدة تصل إلى 30 يوماً، ويُفضل التأكد من جواز السفر قبل السفر.`;
      } else if (/سرية|غير تقليدية|مخفية|جواهر|hidden|secret|offbeat/.test(t)) {
        intro += `مع تزايد الزحام في المدن السياحية الكلاسيكية، يتجه المسافرون الأذكياء في 2026 لاكتشاف وجهات بديلة أقل ازدحاماً وأكثر أصالة وهدوءاً.`;
        sections = [
          `## 5 وجهات سياحية مخفية تستحق الزيارة قبل الجميع`,
          `1. **واحة سيوة (مصر):** بحيرات الملح، العيون الكبريتية، وفنادق الطين البيئية وسط صحراء هادئة وسماء صافية.`,
          `2. **جورجيا (كازبيجي وميستيا):** قرى جبلية خضراء وقمم قوقازية ساحرة بعيداً عن صخب المدن الكبرى.`,
          `3. **ألبانيا (الريفييرا الألبانية):** شواطئ فيروزية تنافس اليونان وإيطاليا بنصف التكلفة تقريباً وبدون زحام.`,
          `4. **الجبل الأخضر (سلطنة عُمان):** مدرجات جبلية، طقس بارد صيفاً، ومنتجعات جبلية معزولة.`,
          `5. **جزر الأزور (البرتغال):** طبيعة بركانية خضراء وبحيرات في قلب المحيط الأطلسي لعشاق الهدوء.`,
          `## كيف تستفيد من السفر إلى الوجهات غير التقليدية؟`,
          `- استمتع بأسعار فنادق وتجارب أقل بنسبة 35% إلى 50% من المدن الشهيرة.`,
          `- اختبر الثقافة المحلية الحقيقية وتناول الطعام في المطاعم العائلية الأصيلة.`,
        ];
      } else if (/ذكاء|الاصطناعي|الذكية|تقنيات|ai|smart/.test(t)) {
        intro += `غيّر الذكاء الاصطناعي طريقة تخطيط الرحلات بالكامل؛ لم يعد المسافر بحاجة لقضاء أيام في مقارنة المواقع، بل يمكنه بناء جدول رحلة متكامل ومقارنة الأسعار خلال دقائق.`;
        sections = [
          `## كيف تستخدم الذكاء الاصطناعي لتخطيط رحلتك بذكاء؟`,
          `1. **توليد جدول يومي مخصص:** اطلب من أدوات الذكاء الاصطناعي خطة بالساعات حسب اهتماماتك (تاريخ، تسوق، طبيعة، عائلة) وميزانيتك.`,
          `2. **مراقبة وتتبع أسعار الطيران:** استخدم خوارزميات التنبؤ بالأسعار لتحديد أفضل يوم للشراء وتوفير حتى 25% من قيمة التذكرة.`,
          `3. **الترجمة الفورية والتواصل:** التطبيقات الذكية تترجم القوائم واللافتات والمحادثات الصوتية فوراً في أي دولة.`,
          `4. **المساعدة الذكية في الفنادق والوجهات:** مثل خدمة **AI Concierge** في موقعنا التي ترشح لك الوجهة والبرنامج الأنسب خلال ثوانٍ.`,
          `## أخطاء يجب تجنبها عند الاعتماد على الذكاء الاصطناعي`,
          `- راجع دائماً مواعيد فتح المتاحف وأيام الإجازات الرسمية يدوياً قبل الحجز.`,
          `- تأكد من سياسات التأشيرة والأمتعة من المصادر الرسمية لشركة الطيران.`,
        ];
      } else if (/تذاكر|طيران|فنادق|أرخص|flight|ticket|hotel|cheap/.test(t)) {
        intro += `الحصول على أفضل أسعار تذاكر الطيران والفنادق لا يعتمد على الحظ، بل على توقيت الحجز واستخدام الأدوات والخطوات الصحيحة.`;
        sections = [
          `## 6 خطوات عملية لحجز أرخص تذاكر الطيران والفنادق`,
          `1. **فعّل تنبيهات الأسعار مبكراً:** احجز الرحلات الدولية قبل 6 إلى 10 أسابيع، وتجنب الحجز في اللحظة الأخيرة إلا في العروض المفاجئة.`,
          `2. **المرونة في أيام السفر:** السفر يومي الثلاثاء والأربعاء أو في الرحلات الليلية غالباً ما يكون أرخص من عطلة نهاية الأسبوع.`,
          `3. **استفد من مواسم الكتف (Shoulder Season):** السفر قبل أو بعد ذروة الموسم بشهر يمنحك طقساً رائعاً وبأسعار أقل بنسبة 40%.`,
          `4. **تواصل مع الفندق أو احجز باقات مجمعة:** دمج الطيران مع الفندق والانتقالات يوفر خصومات لا تظهر في الحجز المنفصل.`,
          `5. **قارن المطارات البديلة:** أحياناً يكون الهبوط في مطار قريب أرخص بكثير من المطار الرئيسي للمدينة.`,
        ];
      } else if (/ليلية|noctourism|حرارة|نجوم|night/.test(t)) {
        intro += `أصبحت **السياحة الليلية (Noctourism)** واحدة من أقوى صيحات السفر في 2026؛ حيث يفضّل المسافرون استكشاف المدن والمعالم بعد غروب الشمس للاستمتاع بالهدوء وتجنب حرارة النهار.`;
        sections = [
          `## أبرز تجارب السياحة الليلية حول العالم`,
          `1. **جولات المتاحف والمعالم المضاءة ليلاً:** زيارات مسائية هادئة للمتاحف الكبرى والقلاع التاريخية بدون طوابير النهار.`,
          `2. **مراقبة النجوم والشفق القطبي:** رحلات صحراوية في سيوة والصحراء البيضاء بمصر، أو مشاهدة الأورورا في أيسلندا والنرويج.`,
          `3. **الأسواق الليلية والمطاعم المفتوحة:** استكشاف ثقافة الطعام في أسواق مراكش، القاهرة، وبانكوك في أجواء ليلية منعشة.`,
          `4. **الرحلات البحرية والنيلية الليلية:** عشاء على متن يخت أو باخرة نيلية مع إطلالات المدينة المضاءة.`,
        ];
      } else if (/بطيئة|slow travel|أهل البلد|ضوضاء|زحام|هدوء|crowd|quiet/.test(t)) {
        intro += `بدلاً من الركض بين 5 مدن في أسبوع واحد، يدعو مفهوم **السياحة البطيئة (Slow Travel)** والهروب من الزحام إلى البقاء فترة أطول في مكان واحد، وتقليل التكاليف، وعيش التجربة كأهل البلد.`;
        sections = [
          `## كيف تعيش تجربة السياحة البطيئة بأقل تكلفة؟`,
          `1. **اختر حياً سكنياً محلياً:** الإقامة بعيداً بـ 15 دقيقة عن المركز السياحي تمنحك هدوءاً حقيقياً وأسعاراً أقل بـ 35%.`,
          `2. **استخدم المواصلات العامة والمشي:** اكتشف الشوارع الجانبية، المقاهي المحلية، والأسواق الأسبوعية على طريقتك الخاصة.`,
          `3. **قلل عدد التنقلات:** التركيز على مدينة أو مدينتين يقلل تكاليف القطارات والطيران الداخلي ويزيد من استمتاعك.`,
          `4. **سافر خارج أوقات الذروة:** استمتع بالمعالم والطبيعة في الصباح الباكر أو في المواسم الهادئة بعيداً عن الزحام.`,
        ];
      } else if (/طائرة خاصة|طائرات خاصة|يخت|يخوت|vip|concierge|fast track|private jet|yacht/.test(t)) {
        intro += `تُعد خدمات **${title}** ركيزة أساسية في تجربة السفر الفاخر لرجال الأعمال وكبار الشخصيات الباحثين عن الخصوصية التامة وسرعة الإنجاز.`;
        sections = [
          `## مزايا الخدمة الحصرية عبر VANIR GROUP`,
          `- **طيران خاص ويخوت فاخرة:** تنسيق رحلات Private Jet Charter واليخوت الخاصة وفق جدولك الزمني الدقيق.`,
          `- **بروتوكول VIP في المطارات:** استقبال من باب الطائرة وإنهاء إجراءات الجوازات عبر صالات كبار الشخصيات (Fast Track).`,
          `- **فريق كونسيرج 24/7:** متابعة مستمرة باللغات العربية والإنجليزية والألمانية لتنفيذ كافة طلباتك الفورية.`,
        ];
      } else {
        intro += `يُعد موضوع **${title}** من أبرز المواضيع التي يبحث عنها المسافرون في 2026 للتخطيط لرحلة ناجحة تجمع بين المتعة، التنظيم الذكي، وأفضل قيمة مقابل التكلفة.`;
        sections = [
          `## دليل عملي للتخطيط لـ ${title}`,
          `1. **تحديد الموعد والميزانية مسبقاً:** الحجز المبكر قبل 4 إلى 8 أسابيع يضمن لك أفضل الخيارات في الطيران والإقامة.`,
          `2. **اختيار الموقع المناسب للإقامة:** احرص على القرب من المعالم الرئيسية أو محطات المواصلات لتوفير الوقت والمجهود.`,
          `3. **موازنة الجدول اليومي:** اجمع بين زيارة المعالم الشهيرة وأوقات الاسترخاء لاكتشاف التجارب المحلية الأصيلة.`,
          `4. **الاستعانة بمستشار سفر موثوق:** لتجنب أي مفاجآت في التأشيرات أو التنقلات والاستفادة من الباقات المصممة خصيصاً لك.`,
        ];
      }

      return [
        `# ${title}`,
        "",
        intro,
        "",
        ...sections,
        "",
        `## الأسئلة الشائعة (FAQ)`,
        `### ${faq1Q}`,
        faq1A,
        "",
        `### ${faq2Q}`,
        faq2A,
        "",
        `---`,
        `> هل تخطط لرحلتك القادمة؟ تواصل مع فريق **VANIR GROUP** للحصول على برنامج سفر مخصص يناسب ميزانيتك وتطلعاتك.`,
      ].join("\n");
    } else {
      const intro = seedText && seedText !== title
        ? `${seedText}\n\nExplore our comprehensive 2026 travel guide to **${title}**, featuring practical tips, curated recommendations, and smart booking strategies.`
        : `Explore our comprehensive 2026 travel guide to **${title}**, featuring practical tips, curated recommendations, and smart booking strategies.`;
      return [
        `# ${title}`,
        "",
        intro,
        "",
        `## Key Highlights & Practical Tips`,
        `1. **Book Early & Stay Flexible:** Booking 6–8 weeks ahead and choosing mid-week departures helps reduce airfare and hotel costs significantly.`,
        `2. **Prioritize Authentic Experiences:** Balance iconic landmarks with hidden local neighborhoods, seasonal cuisine, and crowd-free hours.`,
        `3. **Optimize Your Itinerary:** Group nearby attractions together to minimize transit time and maximize relaxation.`,
        "",
        `## Frequently Asked Questions (FAQ)`,
        `### When is the best time to plan ${title}?`,
        `Shoulder seasons (spring and autumn) or warm winter months offer the best balance of pleasant weather, availability, and value.`,
        "",
        `### Can VANIR GROUP arrange a tailored itinerary?`,
        `Yes — our concierge desk designs customized itineraries including flights, curated hotels, private transfers, and VIP assistance.`,
      ].join("\n");
    }
  };

  const buildSeoBatchArticles = (rawTopics: string, category: string, lang: "ar" | "en") => {
    const cleanBullet = (s: string) => s.replace(/^[\s•\-\*▪◦●\d.)]+/, "").trim();
    const rawLines = rawTopics
      .split("\n")
      .map((l) => cleanBullet(l))
      .filter(Boolean);

    const lines: Array<{ title: string; seedText: string }> = [];
    for (const line of rawLines) {
      if (line.length <= 160) {
        lines.push({ title: line, seedText: line });
      } else {
        const sentences = line
          .split(/(?<=[.!?؟])\s+/)
          .map((s) => cleanBullet(s))
          .filter((s) => s.length > 10);
        if (sentences.length > 1) {
          for (const s of sentences) {
            const cleanTitle = s.replace(/[.!?؟]+$/, "").slice(0, 140).trim();
            if (cleanTitle) lines.push({ title: cleanTitle, seedText: s });
          }
        } else {
          const cleanTitle = line.slice(0, 140).trim();
          lines.push({ title: cleanTitle, seedText: line });
        }
      }
    }

    const usedImages = new Set<string>();
    return lines.map(({ title, seedText }, idx) => {
      const coverImageUrl = pickTopicCoverImage(seedText || title, idx, usedImages);
      const slugBase = generateSlug(title) || `vanir-seo-guide-${Date.now()}-${idx + 1}`;
      const content = buildTopicArticleBody(title, seedText, lang);
      if (lang === "ar") {
        const excerpt = `دليل شامل حول ${title} — نصائح عملية، أفضل الوجهات، وأسرار التوفير والتخطيط الذكي لعام 2026.`.slice(0, 280);
        return {
          title,
          slug: slugBase,
          excerpt,
          content,
          category,
          authorName: "Ahmed Roshdi",
          coverImageUrl,
          tags: [title.slice(0, 60), category, "دليل السفر 2026", "VANIR GROUP"],
          metaTitle: `${title} | VANIR GROUP`.slice(0, 70),
          metaDescription: excerpt.slice(0, 155),
          focusKeyword: title.slice(0, 80),
          status: "published" as const,
        };
      } else {
        const excerpt = `Complete 2026 travel guide to ${title} — top destinations, insider tips, and smart planning strategies.`.slice(0, 280);
        return {
          title,
          slug: slugBase,
          excerpt,
          content,
          category,
          authorName: "Ahmed Roshdi",
          coverImageUrl,
          tags: [title.slice(0, 60), category, "VANIR GROUP", "Luxury Travel"],
          metaTitle: `${title} | VANIR GROUP`.slice(0, 70),
          metaDescription: excerpt.slice(0, 155),
          focusKeyword: title.slice(0, 80),
          status: "published" as const,
        };
      }
    });
  };

  const handleBulkSubmit = async () => {
    if (!bulkInput.trim()) {
      toast.error("يرجى إدخال المواضيع أو المقالات أو رفع الملف");
      return;
    }

    setIsImporting(true);
    try {
      let parsedArticles: any[] = [];
      if (bulkMode === "seo_batch") {
        parsedArticles = buildSeoBatchArticles(bulkInput, seoCategory, seoLang);
      } else if (bulkMode === "json") {
        const parsed = JSON.parse(bulkInput);
        if (Array.isArray(parsed)) {
          parsedArticles = parsed;
        } else if (parsed.posts || parsed.articles) {
          parsedArticles = parsed.posts || parsed.articles;
        } else {
          parsedArticles = [parsed];
        }
      } else {
        // Simple CSV parse: line by line
        const lines = bulkInput.trim().split("\n");
        if (lines.length <= 1) {
          toast.error("ملف CSV يجب أن يحتوي على صف العناوين وبيانات المقالات");
          setIsImporting(false);
          return;
        }
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map(c => c.trim().replace(/^["']|["']$/g, ""));
          if (cols.length >= 2 && cols[0]) {
            const title = cols[0];
            const content = cols[1] || title;
            parsedArticles.push({
              title,
              slug: generateSlug(title),
              content,
              excerpt: cols[2] || content.slice(0, 140),
              category: cols[3] || "Luxury Travel",
              authorName: cols[4] || "Ahmed Roshdi",
              coverImageUrl: cols[5] || "/images/The_Nile_River_at_Cairo.jpg",
              status: "published"
            });
          }
        }
      }

      if (parsedArticles.length === 0) {
        toast.error("لم يتم العثور على أي مقالات صالحة في البيانات المدخلة");
        setIsImporting(false);
        return;
      }

      // Standardize fields
      const usedBulkImages = new Set<string>();
      const formatted = parsedArticles.map((art, idx) => ({
        title: String(art.title || `مقالة رقم ${idx + 1}`),
        slug: String(art.slug || generateSlug(art.title || `article-${Date.now()}-${idx}`)),
        excerpt: String(art.excerpt || (art.content ? art.content.slice(0, 160) : "مقالة فاخرة")),
        content: String(art.content || art.body || "محتوى المقالة"),
        category: String(art.category || "Luxury Travel"),
        authorName: String(art.authorName || art.author || "Ahmed Roshdi"),
        coverImageUrl: String(
          art.coverImageUrl ||
            art.imageUrl ||
            art.image ||
            pickTopicCoverImage(String(art.title || ""), idx, usedBulkImages)
        ),
        tags: Array.isArray(art.tags) ? art.tags : (typeof art.tags === "string" ? art.tags.split(",").map((t: string) => t.trim()) : ["Luxury"]),
        metaTitle: art.metaTitle ? String(art.metaTitle) : undefined,
        metaDescription: art.metaDescription ? String(art.metaDescription) : undefined,
        focusKeyword: art.focusKeyword ? String(art.focusKeyword) : undefined,
        status: (art.status === "draft" || art.status === "archived") ? art.status : ("published" as const),
      }));

      const res = await bulkImportBlogPosts(formatted);
      toast.success(`تم استيراد وحفظ ${res.count} مقالة بنجاح دفعة واحدة في الموقع!`);
      await loadArticles();
      setIsBulkOpen(false);
      setBulkInput("");
    } catch (e: any) {
      console.error("Bulk import error:", e);
      toast.error(`فشل الاستيراد: ${e.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleBulkFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setBulkInput(text);
      if (file.name.endsWith(".csv")) {
        setBulkMode("csv");
      } else {
        setBulkMode("json");
      }
      toast.success(`تم قراءة الملف ${file.name} بنجاح! راجع البيانات ثم اضغط استيراد.`);
    };
    reader.readAsText(file);
  };

  const handleAssignDiverseImages = async () => {
    if (!articles.length) return;
    setIsRefreshingImages(true);
    try {
      const usedSet = new Set<string>();
      let updated = 0;
      for (let i = 0; i < articles.length; i++) {
        const art = articles[i];
        const cleanTitle = art.title.replace(/^[\s•\-\*▪◦●\d.)]+/, "").trim() || art.title;
        const newImg = pickTopicCoverImage(`${cleanTitle} ${art.excerpt || ""}`, i, usedSet);
        const hasOldBoilerplate =
          !art.content ||
          art.content.includes("واحدة من أرقى خدمات السفر السياحي الفاخر التي تقدمها") ||
          art.content.includes("curated exclusively for discerning travelers");
        const isArabic = /[\u0600-\u06FF]/.test(cleanTitle);
        const nextContent = hasOldBoilerplate
          ? buildTopicArticleBody(cleanTitle, cleanTitle, isArabic ? "ar" : "en")
          : art.content;
        const nextExcerpt = hasOldBoilerplate
          ? isArabic
            ? `دليل شامل حول ${cleanTitle} — نصائح عملية، أفضل الوجهات، وأسرار التوفير والتخطيط الذكي لعام 2026.`.slice(0, 280)
            : `Complete 2026 travel guide to ${cleanTitle} — top destinations, insider tips, and smart planning strategies.`.slice(0, 280)
          : art.excerpt;

        await saveBlogPost({
          id: art.id,
          title: cleanTitle,
          slug: art.slug,
          excerpt: nextExcerpt,
          content: nextContent,
          coverImageUrl: newImg,
          category: art.category,
          authorName: art.authorName,
          tags: art.tags,
          status: art.status,
        });
        updated++;
      }
      toast.success(`تم تحديث الصور والمحتوى الفعلي لـ ${updated} مقالة بنجاح!`);
      await loadArticles();
    } catch (e: any) {
      console.error("Assign diverse images error:", e);
      toast.error(`حدث خطأ أثناء تحديث الصور: ${e.message}`);
    } finally {
      setIsRefreshingImages(false);
    }
  };

  const filteredArticles = articles.filter(
    (a) =>
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--theme-surface)] p-6 rounded-xl border border-white/5">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-display)] text-white flex items-center gap-2">
            <FileText className="text-[var(--theme-primary)]" size={24} />
            إدارة مقالات المدونة (Blog Management)
          </h1>
          <p className="text-xs text-white/50 mt-1">
            كتابة ونشر المقالات، رفع الصور من الجهاز مباشرة، واستيراد عدد من المقالات دفعة واحدة سحابياً.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Refresh Button */}
          <Button
            onClick={loadArticles}
            disabled={isLoading}
            variant="outline"
            className="gap-2 bg-white/5 hover:bg-white/10 text-white border-white/10 text-xs h-10"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[var(--theme-primary)]" : ""}`} />
            تحديث
          </Button>

          {/* Auto-Assign Diverse Images Button */}
          <Button
            onClick={handleAssignDiverseImages}
            disabled={isRefreshingImages || articles.length === 0}
            variant="outline"
            className="gap-2 bg-white/5 hover:bg-white/10 text-white border-white/10 text-xs h-10"
          >
            <ImageIcon className={`w-4 h-4 text-[var(--theme-primary)] ${isRefreshingImages ? "animate-pulse" : ""}`} />
            {isRefreshingImages ? "جاري توزيع الصور..." : "توزيع صور متنوعة للمقالات"}
          </Button>

          {/* Bulk Import Button */}
          <Button
            onClick={() => setIsBulkOpen(true)}
            variant="outline"
            className="gap-2 bg-white/5 hover:bg-white/10 text-white border-white/10 text-xs h-10"
          >
            <Layers className="w-4 h-4 text-[var(--theme-primary)]" />
            رفع عدة مقالات (Bulk Import)
          </Button>

          {/* New Article Button */}
          <Button
            onClick={() => {
              resetForm();
              setIsOpen(true);
            }}
            className="gap-2 bg-[var(--theme-primary)] text-[var(--theme-surface)] hover:bg-[var(--theme-primary-light)] font-semibold text-xs h-10 shadow-lg shadow-[var(--theme-primary)]/10"
          >
            <Plus className="w-4 h-4" />
            إضافة مقالة جديدة
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          placeholder="البحث في المقالات بالعنوان أو الفئة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-[var(--theme-surface)] border-white/10 text-white text-xs h-10 placeholder:text-white/30"
        />
      </div>

      {/* Articles Table */}
      <div className="border border-white/10 rounded-xl overflow-hidden bg-[var(--theme-surface)]">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/70 text-xs">الصورة</TableHead>
              <TableHead className="text-white/70 text-xs">العنوان</TableHead>
              <TableHead className="text-white/70 text-xs">الفئة</TableHead>
              <TableHead className="text-white/70 text-xs">المؤلف</TableHead>
              <TableHead className="text-white/70 text-xs">الحالة</TableHead>
              <TableHead className="text-white/70 text-xs text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-white/50 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[var(--theme-primary)]" />
                  جاري تحميل المقالات...
                </TableCell>
              </TableRow>
            ) : filteredArticles && filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <TableRow key={article.id} className="border-white/5 hover:bg-white/[0.02]">
                  <TableCell>
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                      <img
                        src={article.coverImageUrl || "/images/vanir_world_4.png"}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (!img.dataset.fallbackApplied) {
                            img.dataset.fallbackApplied = "1";
                            img.src = "/images/vanir_world_4.png";
                          }
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-white text-sm max-w-md truncate">
                      {article.title}
                    </div>
                    <div className="text-[11px] text-white/40 font-mono mt-0.5">
                      /{article.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs bg-white/5 text-white/80 border-white/10">
                      {article.category || "Luxury Travel"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-white/70">
                    {article.authorName || "Ahmed Roshdi"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`text-[10px] ${
                        article.status === "published"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : article.status === "archived"
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          : "bg-white/10 text-white/60 border-white/20"
                      }`}
                    >
                      {article.status === "published"
                        ? "منشورة"
                        : article.status === "archived"
                        ? "مؤرشفة"
                        : "مسودة"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(`/blog/${article.slug}`, "_blank")}
                        title="معاينة المقال"
                        className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEdit(article)}
                        title="تعديل"
                        className="h-8 w-8 p-0 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(article)}
                        title="حذف"
                        className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-white/40 text-xs">
                  لا توجد أي مقالات بعد. اضغط على "إضافة مقالة جديدة" أو "رفع عدة مقالات" للبدء.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal: Single Article Editor */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto bg-[var(--theme-surface)] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="text-[var(--theme-primary)]" size={20} />
              {editingId ? "تعديل مقالة" : "كتابة ونشر مقالة جديدة"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">
                عنوان المقالة *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    title: val,
                    slug: prev.slug || generateSlug(val),
                  }));
                }}
                placeholder="مثال: أفضل 10 تجارب سياحية فاخرة في القاهرة 2026"
                className="bg-white/5 border-white/10 text-white text-xs h-10"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">
                الرابط الدائم (Slug) *
              </label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="luxury-cairo-experiences-2026"
                className="bg-white/5 border-white/10 text-white text-xs h-10 font-mono"
              />
            </div>

            {/* Direct Device Image Upload */}
            <ImageUploadField
              label="صورة المقال الرئيسية (Cover Image) - رفع مباشر من جهازك"
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              placeholder="ارفع صورة المقال من جهازك..."
            />

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">
                ملخص المقالة (Excerpt)
              </label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="نبذة مختصرة تظهر في نتائج البحث والبطاقات..."
                rows={2}
                className="bg-white/5 border-white/10 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">
                محتوى المقالة الكامل (Content - يدعم Markdown) *
              </label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="اكتب المقال الكامل هنا بالتفصيل..."
                rows={8}
                className="bg-white/5 border-white/10 text-white text-xs leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  الفئة (Category)
                </label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Luxury Travel / Private Jet / Yacht"
                  className="bg-white/5 border-white/10 text-white text-xs h-10"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  المؤلف (Author)
                </label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Ahmed Roshdi"
                  className="bg-white/5 border-white/10 text-white text-xs h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  الكلمات المفتاحية (Tags - مفصولة بفواصل)
                </label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Luxury, Private Jet, Egypt, VIP"
                  className="bg-white/5 border-white/10 text-white text-xs h-10"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  حالة النشر
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-[#121216] border border-white/10 rounded-md px-3 text-xs h-10 text-white focus:outline-none focus:border-[var(--theme-primary)]"
                >
                  <option value="published">منشورة علناً (Published)</option>
                  <option value="draft">مسودة خاصة (Draft)</option>
                  <option value="archived">مؤرشفة (Archived)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-10"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="bg-[var(--theme-primary)] text-[var(--theme-surface)] hover:bg-[var(--theme-primary-light)] font-semibold text-xs h-10 px-6"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin ml-1" />
                    جاري الحفظ...
                  </>
                ) : editingId ? (
                  "تحديث المقالة"
                ) : (
                  "نشر المقالة"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Bulk Article Upload / Import */}
      <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto bg-[var(--theme-surface)] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="text-[var(--theme-primary)]" size={20} />
                رفع عدة مقالات في وقت واحد (Bulk Articles Import)
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadSample}
                className="text-xs h-8 gap-1.5 bg-white/5 border-white/10 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10"
              >
                <Download size={13} />
                تحميل نموذج تجريبي (JSON Template)
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <p className="text-xs text-white/60">
              يمكنك رفع ملف JSON أو CSV من جهازك يحتوي على 10 أو 20 أو 50 مقالة، أو لصق البيانات مباشرة هنا وسيتم استيرادها وحفظها سحابياً فوراً.
            </p>

            {/* Upload File Box */}
            <div className="p-4 rounded-xl border-2 border-dashed border-white/15 bg-white/[0.02] text-center hover:border-[var(--theme-primary)]/50 transition-colors">
              <input
                type="file"
                id="bulk-file-input"
                accept=".json,.csv,text/plain"
                onChange={handleBulkFileUpload}
                className="hidden"
              />
              <label
                htmlFor="bulk-file-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-2 py-4"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--theme-primary)]/10 flex items-center justify-center text-[var(--theme-primary)]">
                  <Upload size={22} />
                </div>
                <span className="text-sm font-semibold text-white">
                  اضغط لاختيار ملف المقالات من جهازك (.JSON أو .CSV)
                </span>
                <span className="text-xs text-white/40">
                  يدعم صيغ JSON و CSV المنظمة
                </span>
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-medium text-white/80">
                اختر طريقة البناء / الاستيراد:
              </label>
              <div className="flex flex-wrap gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setBulkMode("seo_batch")}
                  className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                    bulkMode === "seo_batch"
                      ? "bg-[var(--theme-primary)] text-[var(--theme-surface)] font-semibold"
                      : "bg-white/5 text-white/60 hover:text-white"
                  }`}
                >
                  <Sparkles size={12} />
                  بناء مقالات SEO تلقائياً
                </button>
                <button
                  type="button"
                  onClick={() => setBulkMode("json")}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    bulkMode === "json"
                      ? "bg-[var(--theme-primary)] text-[var(--theme-surface)] font-semibold"
                      : "bg-white/5 text-white/60 hover:text-white"
                  }`}
                >
                  JSON Mode
                </button>
                <button
                  type="button"
                  onClick={() => setBulkMode("csv")}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    bulkMode === "csv"
                      ? "bg-[var(--theme-primary)] text-[var(--theme-surface)] font-semibold"
                      : "bg-white/5 text-white/60 hover:text-white"
                  }`}
                >
                  CSV Mode
                </button>
              </div>
            </div>

            {bulkMode === "seo_batch" && (
              <div className="p-3 rounded-lg bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/25 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-white/80">
                    اكتب كل عنوان/كلمة بحثية في سطر مستقل وسنبني لكل سطر مقالة كاملة متوافقة مع SEO جوجل (Meta Title + Description + FAQ + صورة مناسبة):
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setBulkInput(
                        seoLang === "ar"
                          ? [
                              "أفضل برامج السياحة الفاخرة في القاهرة والأقصر وأسوان 2026",
                              "حجز طائرة خاصة VIP من دبي والرياض إلى القاهرة",
                              "رحلات اليخوت الفاخرة في البحر الأحمر والجونة وشرم الشيخ",
                              "خدمة الاستقبال VIP في مطار القاهرة الدولي Fast Track",
                              "أفخم فنادق ومنتجعات 5 نجوم في مصر والشرق الأوسط",
                            ].join("\n")
                          : [
                              "Best Luxury Private Egypt Tours Cairo Luxor Aswan 2026",
                              "Private Jet Charter from Dubai and Riyadh to Cairo",
                              "Red Sea Superyacht Charter Hurghada and El Gouna",
                              "Cairo International Airport VIP Fast Track Meet and Assist",
                              "Top 5-Star Luxury Hotels and Nile Dahabiya Cruises in Egypt",
                            ].join("\n")
                      )
                    }
                    className="h-7 text-[11px] bg-white/10 border-white/20 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/20"
                  >
                    تعبئة مواضيع عالية البحث في جوجل
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={seoCategory}
                    onChange={(e) => setSeoCategory(e.target.value)}
                    className="bg-[#1a1a1a] border border-white/15 rounded px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="Luxury Travel">Luxury Travel</option>
                    <option value="Private Jet">Private Jet</option>
                    <option value="Egypt VIP">Egypt VIP</option>
                    <option value="Yacht Charter">Yacht Charter</option>
                    <option value="Destinations">Destinations</option>
                  </select>
                  <select
                    value={seoLang}
                    onChange={(e) => setSeoLang(e.target.value as "ar" | "en")}
                    className="bg-[#1a1a1a] border border-white/15 rounded px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="ar">العربية (Arabic SEO)</option>
                    <option value="en">English (Global SEO)</option>
                  </select>
                </div>
              </div>
            )}

            <Textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder={
                bulkMode === "seo_batch"
                  ? "اكتب عنوان كل مقالة في سطر جديد...\nمثال:\nحجز طائرة خاصة من الرياض إلى القاهرة\nأفضل فنادق النيل الفاخرة في القاهرة\nجولة VIP خاصة في الأهرامات والمتحف المصري الكبير"
                  : bulkMode === "json"
                  ? '[\n  {\n    "title": "عنوان المقال الأول",\n    "content": "محتوى المقال الكامل...",\n    "category": "Luxury Travel",\n    "coverImageUrl": "/images/The_Nile_River_at_Cairo.jpg"\n  }\n]'
                  : 'Title,Content,Excerpt,Category,Author,Image\n"عنوان المقال الأول","المحتوى الكامل هنا...","ملخص المقال","Luxury Travel","Ahmed Roshdi","/images/The_Nile_River_at_Cairo.jpg"'
              }
              rows={9}
              dir={bulkMode === "seo_batch" && seoLang === "ar" ? "rtl" : "ltr"}
              className="bg-[#1a1a1a] border-white/10 text-white font-mono text-xs leading-relaxed"
            />

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsBulkOpen(false)}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-10"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleBulkSubmit}
                disabled={isImporting}
                className="bg-[var(--theme-primary)] text-[var(--theme-surface)] hover:bg-[var(--theme-primary-light)] font-semibold text-xs h-10 px-6 gap-2"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري رفع وحفظ المقالات سحابياً...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    استيراد وإنشاء المقالات دفعة واحدة
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
