import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit2, Trash2, Search, Eye, Archive, Upload, FileText, Sparkles, Layers, Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatDate } from "@/lib/formatDate";
import { toast } from "sonner";
import ImageUploadField from "@/components/admin/ImageUploadField";

export default function BlogAdmin() {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [bulkMode, setBulkMode] = useState<"json" | "csv">("json");
  const [isParsingBulk, setIsParsingBulk] = useState(false);

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

  const utils = trpc.useUtils ? trpc.useUtils() : (trpc as any).useContext?.();

  const { data: articles, isLoading, refetch } = trpc.adminBlog.list.useQuery({
    search,
    limit: 100,
  });

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

  const createMutation = trpc.adminBlog.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء المقالة بنجاح!");
      refetch();
      setIsOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(`خطأ في إنشاء المقالة: ${err.message}`);
    },
  });

  const updateMutation = trpc.adminBlog.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث المقالة بنجاح!");
      refetch();
      setIsOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(`خطأ في تحديث المقالة: ${err.message}`);
    },
  });

  const deleteMutation = trpc.adminBlog.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المقالة بنجاح");
      refetch();
    },
    onError: (err) => {
      toast.error(`خطأ في حذف المقالة: ${err.message}`);
    },
  });

  const publishMutation = trpc.adminBlog.publish.useMutation({
    onSuccess: () => {
      toast.success("تم نشر المقالة");
      refetch();
    },
  });

  const archiveMutation = trpc.adminBlog.archive.useMutation({
    onSuccess: () => {
      toast.success("تم أرشفة المقالة");
      refetch();
    },
  });

  const bulkCreateMutation = (trpc.adminBlog as any).createBulk?.useMutation({
    onSuccess: (res: any) => {
      toast.success(`تم استيراد وإنشاء ${res?.count || 0} مقالة بنجاح دفعة واحدة!`);
      refetch();
      setIsBulkOpen(false);
      setBulkInput("");
    },
    onError: (err: any) => {
      toast.error(`فشل الاستيراد الجماعي: ${err.message}`);
    },
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s\u0621-\u064A-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleOpenEdit = (article: any) => {
    setEditingId(article.id);
    setFormData({
      title: article.title || "",
      slug: article.slug || "",
      content: article.content || "",
      excerpt: article.excerpt || "",
      imageUrl: article.coverImageUrl || article.imageUrl || "",
      category: article.category || "Luxury Travel",
      author: article.authorName || article.author || "Ahmed Roshdi",
      tags: Array.isArray(article.tags) ? article.tags.join(", ") : (article.tags || ""),
      status: article.status || "published",
    });
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.slug) {
      toast.error("العنوان والـ slug مطلوبان");
      return;
    }

    if (!formData.content) {
      toast.error("محتوى المقالة مطلوب");
      return;
    }

    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const excerpt = formData.excerpt || formData.content.slice(0, 160) + "...";

    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        title: formData.title,
        slug: formData.slug,
        excerpt,
        content: formData.content,
        coverImageUrl: formData.imageUrl,
        category: formData.category,
        authorName: formData.author,
        tags,
        status: formData.status,
      });
    } else {
      await createMutation.mutateAsync({
        title: formData.title,
        slug: formData.slug,
        excerpt,
        content: formData.content,
        coverImageUrl: formData.imageUrl,
        category: formData.category,
        authorName: formData.author,
        tags,
      });
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
      coverImageUrl: "/images/hero-egyptian.jpg",
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
      coverImageUrl: "/images/final_cairo_post.png",
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

  const handleBulkSubmit = () => {
    if (!bulkInput.trim()) {
      toast.error("يرجى إدخال المقالات أو رفع الملف");
      return;
    }

    try {
      let parsedArticles: any[] = [];
      if (bulkMode === "json") {
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
          return;
        }
        const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
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
              coverImageUrl: cols[5] || "/images/hero-egyptian.jpg",
              status: "published"
            });
          }
        }
      }

      if (parsedArticles.length === 0) {
        toast.error("لم يتم العثور على أي مقالات صالحة في البيانات المدخلة");
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
        coverImageUrl: String(art.coverImageUrl || art.imageUrl || art.image || "/images/hero-egyptian.jpg"),
        tags: Array.isArray(art.tags) ? art.tags : (typeof art.tags === "string" ? art.tags.split(",").map((t: string) => t.trim()) : ["Luxury"]),
        status: (art.status === "draft" || art.status === "archived") ? art.status : "published",
      }));

      if (bulkCreateMutation) {
        bulkCreateMutation.mutate({ posts: formatted });
      } else {
        // Fallback: create sequentially
        toast.info(`جاري رفع ${formatted.length} مقالة...`);
        Promise.all(formatted.map(p => createMutation.mutateAsync({
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          content: p.content,
          category: p.category,
          authorName: p.authorName,
          coverImageUrl: p.coverImageUrl,
          tags: p.tags,
        }))).then(() => {
          toast.success(`تم إنشاء ${formatted.length} مقالة بنجاح!`);
          refetch();
          setIsBulkOpen(false);
          setBulkInput("");
        }).catch(err => {
          toast.error(`حدث خطأ أثناء الإنشاء: ${err.message}`);
        });
      }
    } catch (e: any) {
      toast.error(`صيغة البيانات غير صحيحة: ${e.message}`);
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
            كتابة ونشر المقالات، رفع الصور من الجهاز مباشرة، واستيراد عدد من المقالات دفعة واحدة.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
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
            ) : articles && articles.length > 0 ? (
              articles.map((article: any) => (
                <TableRow key={article.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                  <TableCell className="w-16">
                    <div className="w-12 h-10 rounded-md overflow-hidden bg-white/5 border border-white/10 shrink-0">
                      <img
                        src={article.coverImageUrl || article.imageUrl || "/images/hero-egyptian.jpg"}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-white text-xs max-w-xs truncate">
                    <div>{article.title}</div>
                    <div className="text-[10px] text-white/40 font-mono mt-0.5 truncate">/blog/{article.slug}</div>
                  </TableCell>
                  <TableCell className="text-xs text-white/70">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[11px] border border-white/10">
                      {article.category || "General"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-white/60">{article.authorName || article.author || "Ahmed Roshdi"}</TableCell>
                  <TableCell>
                    <Badge
                      className={`text-[10px] font-normal ${
                        article.status === "published"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : article.status === "archived"
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          : "bg-white/10 text-white/60 border border-white/20"
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
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف المقالة "${article.title}"؟`)) {
                            deleteMutation.mutate({ id: article.id });
                          }
                        }}
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
              <label className="block text-xs font-medium text-white/80 mb-1">عنوان المقالة (Title)</label>
              <Input
                placeholder="مثال: أسرار السياحة الفاخرة في القاهرة والأهرامات..."
                value={formData.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setFormData({
                    ...formData,
                    title,
                    slug: editingId ? formData.slug : generateSlug(title),
                  });
                }}
                className="bg-[#1f1f1f] border-white/10 text-white text-xs h-10"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">الرابط الودود (URL Slug)</label>
              <Input
                placeholder="egypt-luxury-travel-guide"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                dir="ltr"
                className="bg-[#1f1f1f] border-white/10 text-white text-xs font-mono h-10"
              />
            </div>

            {/* Direct Device Image Upload */}
            <ImageUploadField
              label="صورة غلاف المقالة (Cover Image) - رفع مباشر من الجهاز"
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              helperText="يمكنك اختيار صورة من جهاز الكمبيوتر أو الهاتف مباشرة وسيتم رفعها وحفظها تلقائياً."
            />

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">ملخص المقالة (Excerpt)</label>
              <Textarea
                placeholder="ملخص قصير يظهر في بطاقة المقال وفي نتائج محركات البحث (SEO)..."
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={2}
                className="bg-[#1f1f1f] border-white/10 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">محتوى المقالة الكامل (Article Content)</label>
              <Textarea
                placeholder="اكتب المقال الكامل هنا. يمكنك استخدام فقرات وعناوين منسقة..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
                className="bg-[#1f1f1f] border-white/10 text-white text-xs leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">الفئة (Category)</label>
                <Input
                  placeholder="Luxury Travel, Private Jet, Heritage, Hotels..."
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-[#1f1f1f] border-white/10 text-white text-xs h-10"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">اسم الكاتب (Author)</label>
                <Input
                  placeholder="Ahmed Roshdi"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="bg-[#1f1f1f] border-white/10 text-white text-xs h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">الوسوم (Tags - مفصولة بفواصل)</label>
                <Input
                  placeholder="Luxury, Cairo, Jet, VIP"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="bg-[#1f1f1f] border-white/10 text-white text-xs h-10"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">حالة المقالة (Status)</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full h-10 px-3 bg-[#1f1f1f] border border-white/10 rounded-md text-white text-xs focus:outline-none focus:border-[var(--theme-primary)]"
                >
                  <option value="published">منشورة ومتاحة للزوار (Published)</option>
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
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-[var(--theme-primary)] text-[var(--theme-surface)] hover:bg-[var(--theme-primary-light)] font-semibold text-xs h-10 px-6"
              >
                {createMutation.isPending || updateMutation.isPending ? (
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
              يمكنك رفع ملف JSON أو CSV من جهازك يحتوي على 10 أو 20 أو 50 مقالة، أو لصق البيانات مباشرة هنا وسيتم استيرادها ونشرها فوراً.
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

            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-white/80">
                أو الصق محتوى المقالات يدوياً:
              </label>
              <div className="flex gap-1 text-xs">
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

            <Textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder={
                bulkMode === "json"
                  ? '[\n  {\n    "title": "عنوان المقال الأول",\n    "content": "محتوى المقال الكامل...",\n    "category": "Luxury Travel",\n    "coverImageUrl": "/images/hero-egyptian.jpg"\n  }\n]'
                  : 'Title,Content,Excerpt,Category,Author,Image\n"عنوان المقال الأول","المحتوى الكامل هنا...","ملخص المقال","Luxury Travel","Ahmed Roshdi","/images/hero.jpg"'
              }
              rows={9}
              dir="ltr"
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
                disabled={bulkCreateMutation?.isPending}
                className="bg-[var(--theme-primary)] text-[var(--theme-surface)] hover:bg-[var(--theme-primary-light)] font-semibold text-xs h-10 px-6 gap-2"
              >
                {bulkCreateMutation?.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري رفع وإنشاء المقالات...
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
