import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Search, Eye, Upload, FileText, Sparkles, Layers, Download, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
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

  const pickTopicCoverImage = (topic: string, idx = 0): string => {
    const t = topic.toLowerCase();
    // Specific destinations
    if (/dubai|دبي|إمارات|uae/.test(t)) return "/images/final_dubai_post.png";
    if (/cairo|قاهر|أهرام|pyramids|giza|جيزة/.test(t)) return "/images/final_cairo_post.png";
    if (/luxor|أقصر|الأقصر/.test(t)) return "/images/final_luxor_post.png";
    if (/aswan|أسوان/.test(t)) return "/images/final_aswan_post.png";
    if (/alexandria|إسكندرية|اسكندرية/.test(t)) return "/images/final_alexandria_post.png";
    if (/sharm|شرم/.test(t)) return "/images/final_sharm_post.png";
    if (/dahab|دهب/.test(t)) return "/images/final_dahab_post.png";
    if (/siwa|سيوة/.test(t)) return "/images/final_siwa_post.png";
    if (/marsa|مرسى علم/.test(t)) return "/images/final_marsa_alam_post.png";
    if (/london|لندن/.test(t)) return "/images/final_london_post.png";
    if (/paris|باريس/.test(t)) return "/images/final_paris_post.png";
    if (/rome|روما|italy|إيطاليا/.test(t)) return "/images/final_rome_post.png";
    if (/istanbul|إسطنبول|اسطنبول|تركيا/.test(t)) return "/images/final_istanbul_post.png";
    if (/santorini|سانتوريني|يونان|greece/.test(t)) return "/images/final_santorini_post.png";
    if (/tokyo|طوكيو|japan|يابان/.test(t)) return "/images/final_tokyo_post.png";
    if (/bali|بالي/.test(t)) return "/images/final_bali_post.png";
    if (/malaysia|ماليزيا/.test(t)) return "/images/final_malaysia_post.png";
    if (/maldives|island|جزر|مالديف/.test(t)) return "/images/final_maldives_post.png";

    // Travel themes & services
    if (/jet|flight|aviation|airport|ticket|طائر|طيران|تذاكر|مطار/.test(t)) return "/images/hero_jet_luxury.jpg";
    if (/yacht|cruise|nile|sea|يخت|نيل|بحر|كروز/.test(t)) return "/images/Regent-Seven-Seas-Voyager-Pool-Deck.jpg";
    if (/hotel|resort|stay|villa|فندق|فنادق|منتجع|إقامة|فيلا/.test(t)) return "/images/Four-Seasons-Hualalai-1.jpeg";
    if (/ai|smart|tech|future|ذكاء|ذكية|تقني|مستقبل/.test(t)) return "/images/vanir_world_5.png";
    if (/quiet|escape|calm|crowd|nature|ضوضاء|زحام|هدوء|استجمام|طبيعة/.test(t)) return "/images/FS-Landaa-Giraavaru-Water-Villa-Maldives.jpeg";
    if (/shop|luxury|brand|تسوق|فاخر/.test(t)) return "/images/vanir_shopping_1.png";
    if (/culture|museum|history|متحف|تاريخ|تراث|ثقاف/.test(t)) return "/images/vanir_culture_1.png";
    if (/adventure|safari|desert|مغامر|سفاري|صحراء/.test(t)) return "/images/vanir_adventure_4.png";

    // Curated fallback rotation so each article gets a distinct, verified image
    const fallbackPool = [
      "/images/vanir_world_4.png",
      "/images/FS_Punta_Mita.jpg",
      "/images/Regent-Seven-Seas-Voyager-Horizon-Lounge.jpg",
      "/images/four-seasons-lanai.jpeg",
      "/images/vanir_culture_3.png",
      "/images/The_Nile_River_at_Cairo.jpg",
      "/images/vanir_adventure_5.png",
    ];
    return fallbackPool[idx % fallbackPool.length];
  };

  const buildSeoBatchArticles = (rawTopics: string, category: string, lang: "ar" | "en") => {
    // Split by newline first; if a line is a long paragraph (>180 chars), split by sentence boundaries (. ! ؟)
    const rawLines = rawTopics
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const lines: Array<{ title: string; seedText: string }> = [];
    for (const line of rawLines) {
      if (line.length <= 160) {
        lines.push({ title: line, seedText: line });
      } else {
        const sentences = line
          .split(/(?<=[.!?؟])\s+/)
          .map((s) => s.trim())
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

    return lines.map(({ title, seedText }, idx) => {
      const coverImageUrl = pickTopicCoverImage(seedText || title, idx);
      const slugBase = generateSlug(title) || `vanir-seo-guide-${Date.now()}-${idx + 1}`;
      if (lang === "ar") {
        const excerpt = `دليل VANIR GROUP الشامل حول ${title} — برامج VIP مخصصة، طيران خاص، وإقامة فاخرة 5 نجوم بأعلى معايير الخصوصية والاحترافية.`.slice(0, 280);
        const content = [
          `# ${title}`,
          "",
          seedText !== title ? `${seedText}\n` : "",
          `تُعد تجربة **${title}** واحدة من أرقى خدمات السفر السياحي الفاخر التي تقدمها **VANIR GROUP** لعملائها من كبار الشخصيات، العائلات الملكية، ورجال الأعمال حول العالم.`,
          "",
          `## لماذا تختار VANIR GROUP في ${title}؟`,
          `- **خصوصية تامة وبروتوكول VIP:** تنسيق كامل من لحظة الوصول عبر صالات كبار الشخصيات وخدمات Fast Track.`,
          `- **طيران خاص وإقامات فاخرة:** توفير طائرات خاصة (Private Jet Charter) وأجنحة رئاسية في أفخم المنتجعات العالمية.`,
          `- **فريق كونسيرج على مدار 24/7:** متابعة مستمرة لكل تفاصيل الرحلة باللغات العربية والإنجليزية والألمانية.`,
          "",
          `## أبرز المزايا والتفاصيل الحصرية`,
          `عند التخطيط لـ **${title}**، نحرص في VANIR GROUP على تصميم جدول رحلة مخصص بالكامل يناسب تطلعاتك، بدءاً من النقل بسيارات الليموزين الفاخرة وصولاً إلى الجولات الخاصة بعد ساعات العمل الرسمية.`,
          "",
          `## الأسئلة الشائعة (FAQ)`,
          `### كيف يمكنني حجز باقة ${title} عبر VANIR GROUP؟`,
          `يمكنك الحجز مباشرة عبر صفحة الحجز الإلكتروني في الموقع أو التواصل مع مستشار السفر الخاص بك لتجهيز عرض مخصص خلال دقائق.`,
          "",
          `### هل تشمل الخدمة الطيران الخاص والاستقبال بالمطار؟`,
          `نعم، نوفر خدمات الطيران الخاص، الاستقبال من باب الطائرة (Airport Fast Track)، والانتقالات الفاخرة.`,
        ].filter(Boolean).join("\n");

        return {
          title,
          slug: slugBase,
          excerpt,
          content,
          category,
          authorName: "Ahmed Roshdi",
          coverImageUrl,
          tags: [title.slice(0, 60), category, "VANIR GROUP", "VIP Travel"],
          metaTitle: `${title} | VANIR GROUP`.slice(0, 70),
          metaDescription: excerpt.slice(0, 155),
          focusKeyword: title.slice(0, 80),
          status: "published" as const,
        };
      } else {
        const excerpt = `Complete VANIR GROUP luxury guide to ${title} — private aviation, VIP concierge protocol, and bespoke 5-star sanctuary experiences.`.slice(0, 280);
        const content = [
          `# ${title}`,
          "",
          seedText !== title ? `${seedText}\n` : "",
          `Discover **${title}** with **VANIR GROUP**, curated exclusively for discerning travelers, executives, and royal delegations seeking effortless luxury and total discretion.`,
          "",
          `## Why Choose VANIR GROUP for ${title}?`,
          `- **Sovereign VIP Protocol:** Seamless tarmac transfers, private terminal Fast Track, and dedicated diplomatic coordination.`,
          `- **Private Aviation & Buyouts:** On-demand Gulfstream & Bombardier charters paired with ultra-luxury suite and villa buyouts.`,
          `- **24/7 Multilingual Concierge Desk:** Real-time itinerary execution in English, Arabic, and German.`,
          "",
          `## Tailored Highlights & Execution`,
          `Every **${title}** itinerary is custom-engineered from the ground up — combining insider access, after-hours cultural openings, and chauffeured executive fleets.`,
          "",
          `## Frequently Asked Questions (FAQ)`,
          `### How do I book ${title} with VANIR GROUP?`,
          `Reserve directly through our online Booking Desk or request a bespoke proposal from our Executive Advisory Team.`,
          "",
          `### Are private jet charters and VIP airport transfers included?`,
          `Yes. Every journey can be configured with private jet charters, VIP fast-track clearance, and chauffeured transfers.`,
        ].filter(Boolean).join("\n");

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
      const formatted = parsedArticles.map((art, idx) => ({
        title: String(art.title || `مقالة رقم ${idx + 1}`),
        slug: String(art.slug || generateSlug(art.title || `article-${Date.now()}-${idx}`)),
        excerpt: String(art.excerpt || (art.content ? art.content.slice(0, 160) : "مقالة فاخرة")),
        content: String(art.content || art.body || "محتوى المقالة"),
        category: String(art.category || "Luxury Travel"),
        authorName: String(art.authorName || art.author || "Ahmed Roshdi"),
        coverImageUrl: String(art.coverImageUrl || art.imageUrl || art.image || "/images/The_Nile_River_at_Cairo.jpg"),
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
