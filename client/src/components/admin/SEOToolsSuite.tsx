import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  TrendingUp,
  Link2,
  BarChart3,
  Wrench,
  Gauge,
  FileText,
  Languages,
  Sparkles,
  Loader2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Download,
  Copy,
  Smartphone,
  Monitor,
  Globe,
  RefreshCw,
} from "lucide-react";
import {
  generateStructuredJsonWithGemini,
  askVanirAIAssistant,
  findAndSaveTopicImage,
} from "@/lib/geminiAi";
import {
  DEFAULT_SERVICE_LANDING_PAGES,
  type ServiceLandingPageData,
} from "@/pages/ServiceLandingPage";

export interface SEOPageItem {
  id: string;
  path: string;
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonical: string;
  noIndex: boolean;
  noFollow: boolean;
  lastUpdated: string;
}

interface KeywordIdea {
  keyword: string;
  volume: string;
  difficulty: string;
  intent: string;
  recommendedPath: string;
}

interface BacklinkTarget {
  id: string;
  domain: string;
  targetUrl: string;
  anchorText: string;
  authority: string;
  status: "Pending" | "Outreach Sent" | "Live";
}

interface RankEntry {
  id: string;
  keyword: string;
  url: string;
  currentRank: number;
  previousRank: number;
  targetRank: number;
  volume: string;
}

interface SEOToolsSuiteProps {
  pages: SEOPageItem[];
  onUpdatePages: (updated: SEOPageItem[]) => Promise<void>;
}

export default function SEOToolsSuite({ pages, onUpdatePages }: SEOToolsSuiteProps) {
  const seoQuery = trpc.siteSettings.getByCategory.useQuery({ category: "seo" });
  const saveMutation = trpc.siteSettings.setMany.useMutation();

  // 1. Keyword Research + Google Trends
  const [kwSeed, setKwSeed] = useState("تأجير طائرات خاصة دبي والقاهرة");
  const [kwLang, setKwLang] = useState<"ar" | "en" | "de">("ar");
  const [kwLoading, setKwLoading] = useState(false);
  const [keywordResults, setKeywordResults] = useState<KeywordIdea[]>([]);

  // 2. Backlink Builder
  const [backlinks, setBacklinks] = useState<BacklinkTarget[]>([
    {
      id: "bl-1",
      domain: "forbesmiddleeast.com",
      targetUrl: "https://vanirgroup.com/ar/private-jet-charter",
      anchorText: "تأجير الطائرات الخاصة VIP",
      authority: "DR 84",
      status: "Pending",
    },
    {
      id: "bl-2",
      domain: "cntraveler.com",
      targetUrl: "https://vanirgroup.com/en/egypt-private-tours",
      anchorText: "Private Luxury Tours in Egypt",
      authority: "DR 89",
      status: "Outreach Sent",
    },
  ]);
  const [newBlDomain, setNewBlDomain] = useState("");
  const [newBlUrl, setNewBlUrl] = useState("https://vanirgroup.com/");
  const [newBlAnchor, setNewBlAnchor] = useState("");
  const [outreachTarget, setOutreachTarget] = useState("Robb Report / Condé Nast Traveler");
  const [outreachPitch, setOutreachPitch] = useState("");
  const [outreachLoading, setOutreachLoading] = useState(false);

  // 3. Rank Tracker
  const [ranks, setRanks] = useState<RankEntry[]>([
    { id: "rk-1", keyword: "تأجير طائرات خاصة مصر", url: "/ar/private-jet-charter", currentRank: 14, previousRank: 19, targetRank: 3, volume: "2,400/mo" },
    { id: "rk-2", keyword: "private luxury tours Egypt", url: "/en/egypt-private-tours", currentRank: 9, previousRank: 12, targetRank: 1, volume: "4,900/mo" },
    { id: "rk-3", keyword: "Privatjet Charter Ägypten", url: "/de/private-jet-charter", currentRank: 11, previousRank: 16, targetRank: 3, volume: "1,600/mo" },
  ]);
  const [newRankKw, setNewRankKw] = useState("");
  const [newRankUrl, setNewRankUrl] = useState("/");
  const [newRankPos, setNewRankPos] = useState("15");
  const [rankPlan, setRankPlan] = useState("");
  const [rankPlanLoading, setRankPlanLoading] = useState(false);

  // 4. Technical SEO & Auto-Fix
  const [fixingAll, setFixingAll] = useState(false);

  // 5. Google PageSpeed Insights
  const [psiUrl, setPsiUrl] = useState("https://vanirgroup.com");
  const [psiStrategy, setPsiStrategy] = useState<"mobile" | "desktop">("mobile");
  const [psiLoading, setPsiLoading] = useState(false);
  const [psiData, setPsiData] = useState<any>(null);
  const [psiError, setPsiError] = useState("");

  // 6. Content Optimizer & Topic Gap
  const [gapKeyword, setGapKeyword] = useState("Private Jet Charter Cairo & Dubai");
  const [gapLang, setGapLang] = useState<"ar" | "en" | "de">("en");
  const [gapDraft, setGapDraft] = useState("");
  const [gapLoading, setGapLoading] = useState(false);
  const [gapResult, setGapResult] = useState<{
    coverageScore: number;
    missingTopics: string[];
    recommendedHeadings: string[];
    faqSuggestions: string[];
    optimizedContent: string;
  } | null>(null);

  // 7. Multilingual Service Landing Pages
  const [landingPages, setLandingPages] = useState<ServiceLandingPageData[]>(DEFAULT_SERVICE_LANDING_PAGES);
  const [lpLang, setLpLang] = useState<"ar" | "en" | "de">("de");
  const [lpSlug, setLpSlug] = useState("private-jet-charter");
  const [lpService, setLpService] = useState("Private Jet Charter");
  const [lpGenerating, setLpGenerating] = useState(false);

  useEffect(() => {
    const d = seoQuery.data;
    if (!d) return;
    try {
      if (d.backlinks_data) {
        const parsed = JSON.parse(d.backlinks_data);
        if (Array.isArray(parsed)) setBacklinks(parsed);
      }
      if (d.rank_tracker_data) {
        const parsed = JSON.parse(d.rank_tracker_data);
        if (Array.isArray(parsed)) setRanks(parsed);
      }
      if (d.landing_pages_data) {
        const parsed = JSON.parse(d.landing_pages_data);
        if (Array.isArray(parsed) && parsed.length > 0) setLandingPages(parsed);
      }
    } catch {
      // ignore malformed JSON
    }
  }, [seoQuery.data]);

  const persistSeoKey = async (key: string, value: unknown) => {
    await saveMutation.mutateAsync({
      category: "seo",
      settings: { [key]: JSON.stringify(value) },
    });
  };

  // --- Handlers ---
  const handleKeywordResearch = async () => {
    if (!kwSeed.trim()) return;
    setKwLoading(true);
    try {
      const res = await generateStructuredJsonWithGemini<{ items: KeywordIdea[] }>(
        `Perform luxury travel SEO keyword research for VANIR GROUP around "${kwSeed}" in language "${kwLang}".
Return JSON { "items": [ ...8 items ] } where each item has:
- keyword (high-intent search term in ${kwLang})
- volume (estimated monthly search range e.g. "2,400/mo")
- difficulty ("Low" | "Medium" | "High")
- intent ("Transactional" | "Commercial" | "Informational")
- recommendedPath (single-language path like "/${kwLang}/private-jet-charter" or "/${kwLang}/egypt-private-tours")`
      );
      setKeywordResults(res.items || []);
      toast.success("تم استخراج الكلمات المفتاحية بنجاح");
    } catch (e: any) {
      toast.error("فشل تحليل الكلمات: " + (e?.message || "Error"));
    } finally {
      setKwLoading(false);
    }
  };

  const handleGenerateOutreach = async () => {
    setOutreachLoading(true);
    try {
      const pitch = await askVanirAIAssistant(
        `Write a high-converting luxury PR & Backlink outreach email + 3 guest article topic ideas to "${outreachTarget}" to earn a contextual dofollow backlink to VANIR GROUP (https://vanirgroup.com - Private Jet Charter & Bespoke Egypt Luxury Travel). Include suggested anchor text and email subject line.`,
        "backlink_outreach"
      );
      setOutreachPitch(pitch);
    } catch (e: any) {
      toast.error("تعذر توليد رسالة التواصل: " + (e?.message || "Error"));
    } finally {
      setOutreachLoading(false);
    }
  };

  const handleAddBacklink = async () => {
    if (!newBlDomain.trim() || !newBlAnchor.trim()) {
      toast.error("أدخل الدومين ونص الرابط");
      return;
    }
    const next: BacklinkTarget[] = [
      {
        id: `bl-${Date.now()}`,
        domain: newBlDomain.trim(),
        targetUrl: newBlUrl.trim() || "https://vanirgroup.com/",
        anchorText: newBlAnchor.trim(),
        authority: "DR 70+",
        status: "Pending",
      },
      ...backlinks,
    ];
    setBacklinks(next);
    setNewBlDomain("");
    setNewBlAnchor("");
    await persistSeoKey("backlinks_data", next);
    toast.success("تم حفظ الرابط الخلفي في الخطة");
  };

  const handleAddRank = async () => {
    if (!newRankKw.trim()) return;
    const pos = Math.max(1, Number(newRankPos) || 20);
    const next: RankEntry[] = [
      {
        id: `rk-${Date.now()}`,
        keyword: newRankKw.trim(),
        url: newRankUrl.trim() || "/",
        currentRank: pos,
        previousRank: pos + 3,
        targetRank: 1,
        volume: "1,500+/mo",
      },
      ...ranks,
    ];
    setRanks(next);
    setNewRankKw("");
    await persistSeoKey("rank_tracker_data", next);
    toast.success("تمت إضافة الكلمة لتتبع الترتيب");
  };

  const handleRankActionPlan = async (rk: RankEntry) => {
    setRankPlanLoading(true);
    try {
      const plan = await askVanirAIAssistant(
        `Create a concise, step-by-step SEO action plan to move "${rk.keyword}" (URL: https://vanirgroup.com${rk.url}) from position #${rk.currentRank} to Top 3 on Google. Cover on-page H1/H2, internal links, schema markup, and backlinks.`,
        "rank_boost"
      );
      setRankPlan(plan);
    } catch (e: any) {
      toast.error("تعذر توليد الخطة");
    } finally {
      setRankPlanLoading(false);
    }
  };

  // Technical SEO Audit calculation
  const technicalIssues = pages.flatMap((p) => {
    const issues: Array<{ pageId: string; path: string; issue: string; severity: "error" | "warn" }> = [];
    if (!p.title || p.title.length < 25) issues.push({ pageId: p.id, path: p.path, issue: "عنوان الصفحة قصير أو مفقود", severity: "error" });
    if (p.title.length > 65) issues.push({ pageId: p.id, path: p.path, issue: "عنوان الصفحة أطول من 65 حرفاً", severity: "warn" });
    if (!p.description || p.description.length < 70) issues.push({ pageId: p.id, path: p.path, issue: "الوصف التعريفي (Meta Description) قصير أو مفقود", severity: "error" });
    if (!p.canonical) issues.push({ pageId: p.id, path: p.path, issue: "رابط Canonical مفقود", severity: "error" });
    if (!p.keywords) issues.push({ pageId: p.id, path: p.path, issue: "الكلمات المفتاحية مفقودة", severity: "warn" });
    if (p.noIndex) issues.push({ pageId: p.id, path: p.path, issue: "الصفحة محجوبة عن الفهرسة (noindex)", severity: "error" });
    return issues;
  });

  const handleAutoFixTechnicalIssues = async () => {
    setFixingAll(true);
    try {
      const res = await generateStructuredJsonWithGemini<{
        pages: Array<{
          path: string;
          title: string;
          description: string;
          keywords: string;
          ogTitle: string;
          ogDescription: string;
        }>;
      }>(
        `Fix and optimize all technical SEO metadata for these VANIR GROUP Luxury Travel pages:
${JSON.stringify(pages.map((p) => ({ path: p.path, title: p.title, description: p.description })))}
Return JSON { "pages": [...] } with every path having:
- title (45-60 chars)
- description (125-158 chars)
- keywords (6-10 comma separated)
- ogTitle (<=60 chars)
- ogDescription (<=155 chars)`
      );
      const map = new Map((res.pages || []).map((x) => [x.path, x]));
      const updated = pages.map((p) => {
        const fix = map.get(p.path);
        return {
          ...p,
          title: fix?.title || p.title || `VANIR GROUP | ${p.path}`,
          description: fix?.description || p.description,
          keywords: fix?.keywords || p.keywords || "luxury travel, private jet, Egypt VIP tours, VANIR GROUP",
          ogTitle: fix?.ogTitle || fix?.title || p.ogTitle || p.title,
          ogDescription: fix?.ogDescription || fix?.description || p.ogDescription || p.description,
          canonical: p.canonical || `https://vanirgroup.com${p.path}`,
          noIndex: false,
          lastUpdated: new Date().toISOString().split("T")[0],
        };
      });
      await onUpdatePages(updated);
      toast.success("تم فحص وإصلاح جميع الأخطاء التقنية وحفظها تلقائياً!");
    } catch (e: any) {
      toast.error("فشل الإصلاح التلقائي: " + (e?.message || "Error"));
    } finally {
      setFixingAll(false);
    }
  };

  const buildSitemapXml = () => {
    const allPaths = Array.from(
      new Set([
        ...pages.filter((p) => !p.noIndex).map((p) => p.path),
        ...landingPages.map((lp) => `/${lp.lang}/${lp.slug}`),
      ])
    );
    const urls = allPaths
      .map(
        (path) => `  <url>
    <loc>https://vanirgroup.com${path}</loc>
    <changefreq>weekly</changefreq>
    <priority>${path === "/" ? "1.0" : "0.85"}</priority>
  </url>`
      )
      .join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunPageSpeed = async () => {
    if (!psiUrl.trim()) return;
    setPsiLoading(true);
    setPsiError("");
    setPsiData(null);
    try {
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
        psiUrl.trim()
      )}&strategy=${psiStrategy}&category=performance&category=seo&category=accessibility&category=best-practices`;
      const resp = await fetch(apiUrl);
      const json = await resp.json();
      if (!resp.ok || json.error) {
        throw new Error(json?.error?.message || `HTTP ${resp.status}`);
      }
      setPsiData(json);
      toast.success("تم جلب تقرير Google PageSpeed Insights الحقيقي");
    } catch (e: any) {
      setPsiError(e?.message || "تعذر الاتصال بـ Google PageSpeed API");
    } finally {
      setPsiLoading(false);
    }
  };

  const handleAnalyzeTopicGap = async () => {
    if (!gapKeyword.trim()) return;
    setGapLoading(true);
    try {
      const res = await generateStructuredJsonWithGemini<{
        coverageScore: number;
        missingTopics: string[];
        recommendedHeadings: string[];
        faqSuggestions: string[];
        optimizedContent: string;
      }>(
        `Analyze this draft content for target keyword "${gapKeyword}" in language "${gapLang}" and compare it against top-ranking luxury travel SERP competitors to eliminate topic gaps and match search intent.
Draft:
"""
${gapDraft || "(No draft provided yet — generate an authoritative #1-ranking luxury travel page from scratch)"}
"""
Return JSON with keys:
- coverageScore (integer 0-100 representing current draft's intent coverage)
- missingTopics (array of 5-7 topic gaps competitors cover that must be included)
- recommendedHeadings (array of 5-6 H2/H3 headings in ${gapLang})
- faqSuggestions (array of 4 high-intent FAQ questions in ${gapLang})
- optimizedContent (complete, rich, authoritative SEO-optimized content in ${gapLang} answering full search intent)`
      );
      setGapResult(res);
      toast.success("تم تحليل الفجوات الموضوعية وتحسين المحتوى");
    } catch (e: any) {
      toast.error("فشل تحليل المحتوى: " + (e?.message || "Error"));
    } finally {
      setGapLoading(false);
    }
  };

  const handleCreateLandingPageWithGemini = async () => {
    if (!lpSlug.trim() || !lpService.trim()) {
      toast.error("أدخل الرابط المختصر واسم الخدمة");
      return;
    }
    setLpGenerating(true);
    try {
      const cleanSlug = lpSlug.trim().toLowerCase().replace(/^\/+|\/+$/g, "").replace(/\s+/g, "-");
      const generated = await generateStructuredJsonWithGemini<
        Omit<ServiceLandingPageData, "id" | "lang" | "slug" | "serviceType" | "heroImage"> & {
          imageQuery: string;
        }
      >(
        `Create a dedicated, single-language luxury landing page ONLY in language "${lpLang}" (do NOT mix languages) for VANIR GROUP service "${lpService}" (URL: /${lpLang}/${cleanSlug}).
Return JSON with keys:
- metaTitle (<= 60 chars in ${lpLang}, include VANIR GROUP)
- metaDescription (120-158 chars in ${lpLang})
- keywords (comma-separated keywords in ${lpLang})
- h1 (compelling hero headline in ${lpLang})
- subtitle (persuasive 1-2 sentence subheadline in ${lpLang})
- bodyParagraphs (array of 2 rich paragraphs in ${lpLang})
- highlights (array of 4 bullet benefits in ${lpLang})
- faq (array of 2 objects { "q": "...", "a": "..." } in ${lpLang})
- ctaText (call-to-action button label in ${lpLang})
- ctaHref ("/contact")
- imageQuery (3-5 English keywords for a real luxury photo)`
      );
      const heroImage = await findAndSaveTopicImage(generated.imageQuery || lpService, "");
      const newEntry: ServiceLandingPageData = {
        id: `${lpLang}-${cleanSlug}`,
        lang: lpLang,
        slug: cleanSlug,
        serviceType: lpService.trim(),
        metaTitle: generated.metaTitle,
        metaDescription: generated.metaDescription,
        keywords: generated.keywords,
        h1: generated.h1,
        subtitle: generated.subtitle,
        heroImage,
        bodyParagraphs: generated.bodyParagraphs || [],
        highlights: generated.highlights || [],
        faq: generated.faq || [],
        ctaText: generated.ctaText || "Contact Concierge",
        ctaHref: generated.ctaHref || "/contact",
      };
      const updated = [
        newEntry,
        ...landingPages.filter((x) => !(x.lang === lpLang && x.slug === cleanSlug)),
      ];
      setLandingPages(updated);
      await persistSeoKey("landing_pages_data", updated);
      toast.success(`تم إنشاء صفحة الهبوط المستقلة /${lpLang}/${cleanSlug} بنجاح!`);
    } catch (e: any) {
      toast.error("فشل إنشاء صفحة الهبوط: " + (e?.message || "Error"));
    } finally {
      setLpGenerating(false);
    }
  };

  const cats = psiData?.lighthouseResult?.categories;
  const audits = psiData?.lighthouseResult?.audits;

  return (
    <Card className="bg-black/40 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--theme-primary)]" />
          منظومة SEO المتكاملة (Keywords · Backlinks · Rank · Technical · PageSpeed · Landing Pages)
        </CardTitle>
        <CardDescription className="text-white/50">
          جميع أدوات تصدر نتائج البحث مدعومة بـ Gemini 2.5 Flash و Google PageSpeed Insights API و صفحات هبوط مستقلة لكل لغة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="keywords" className="space-y-5">
          <TabsList className="flex flex-wrap h-auto gap-1.5 bg-black/50 border border-white/10 p-1.5">
            <TabsTrigger value="keywords" className="gap-1.5 text-xs">
              <Search className="w-3.5 h-3.5" /> الكلمات المفتاحية و Trends
            </TabsTrigger>
            <TabsTrigger value="backlinks" className="gap-1.5 text-xs">
              <Link2 className="w-3.5 h-3.5" /> الروابط الخلفية Backlinks
            </TabsTrigger>
            <TabsTrigger value="ranks" className="gap-1.5 text-xs">
              <BarChart3 className="w-3.5 h-3.5" /> تتبع الترتيب
            </TabsTrigger>
            <TabsTrigger value="technical" className="gap-1.5 text-xs">
              <Wrench className="w-3.5 h-3.5" /> الفحص التقني و Screaming Frog
            </TabsTrigger>
            <TabsTrigger value="pagespeed" className="gap-1.5 text-xs">
              <Gauge className="w-3.5 h-3.5" /> سرعة الموقع PageSpeed
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-1.5 text-xs">
              <FileText className="w-3.5 h-3.5" /> تحسين المحتوى والفجوات
            </TabsTrigger>
            <TabsTrigger value="landing" className="gap-1.5 text-xs">
              <Languages className="w-3.5 h-3.5" /> صفحات الهبوط المنفصلة
            </TabsTrigger>
          </TabsList>

          {/* 1. Keyword Research & Google Trends */}
          <TabsContent value="keywords" className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Input
                value={kwSeed}
                onChange={(e) => setKwSeed(e.target.value)}
                placeholder="أدخل موضوعاً أو كلمة مفتاحية..."
                className="bg-black/40 border-white/10 text-white flex-1 min-w-[220px]"
              />
              <select
                value={kwLang}
                onChange={(e) => setKwLang(e.target.value as any)}
                className="px-3 py-2 rounded-md bg-black/40 border border-white/10 text-white text-sm"
              >
                <option value="ar">العربية (AR)</option>
                <option value="en">English (EN)</option>
                <option value="de">Deutsch (DE)</option>
              </select>
              <Button onClick={handleKeywordResearch} disabled={kwLoading} className="gap-2">
                {kwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                بحث وتحليل بالذكاء الاصطناعي
              </Button>
              <a
                href={`https://trends.google.com/trends/explore?q=${encodeURIComponent(kwSeed)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-white/15 text-xs text-white/80 hover:bg-white/5"
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#c9a84c]" />
                فتح في Google Trends
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {keywordResults.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm text-right">
                  <thead className="bg-white/5 text-white/60 text-xs">
                    <tr>
                      <th className="p-3">الكلمة المفتاحية</th>
                      <th className="p-3">حجم البحث</th>
                      <th className="p-3">المنافسة</th>
                      <th className="p-3">نية البحث</th>
                      <th className="p-3">الصفحة المقترحة</th>
                      <th className="p-3">Trends</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/85">
                    {keywordResults.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="p-3 font-medium">{item.keyword}</td>
                        <td className="p-3 text-emerald-400">{item.volume}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="border-white/15 text-xs">
                            {item.difficulty}
                          </Badge>
                        </td>
                        <td className="p-3 text-white/70">{item.intent}</td>
                        <td className="p-3 font-mono text-xs text-[#ecd58e]">{item.recommendedPath}</td>
                        <td className="p-3">
                          <a
                            href={`https://trends.google.com/trends/explore?q=${encodeURIComponent(item.keyword)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-sky-400 hover:underline inline-flex items-center gap-1"
                          >
                            Trends <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* 2. Backlink Builder */}
          <TabsContent value="backlinks" className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input
                value={newBlDomain}
                onChange={(e) => setNewBlDomain(e.target.value)}
                placeholder="الدومين المستهدف (مثال: robbreport.com)"
                className="bg-black/40 border-white/10 text-white"
              />
              <Input
                value={newBlUrl}
                onChange={(e) => setNewBlUrl(e.target.value)}
                placeholder="رابط الصفحة في موقعك"
                className="bg-black/40 border-white/10 text-white"
              />
              <Input
                value={newBlAnchor}
                onChange={(e) => setNewBlAnchor(e.target.value)}
                placeholder="النص الرابط (Anchor Text)"
                className="bg-black/40 border-white/10 text-white"
              />
              <Button onClick={handleAddBacklink} className="gap-1.5">
                <Plus className="w-4 h-4" /> إضافة رابط خلفي
              </Button>
            </div>

            <div className="space-y-2">
              {backlinks.map((b) => (
                <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/10 text-sm">
                  <div>
                    <p className="text-white font-medium">{b.domain} <span className="text-xs text-[#c9a84c]">({b.authority})</span></p>
                    <p className="text-xs text-white/50">Anchor: {b.anchorText} → {b.targetUrl}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={b.status}
                      onChange={async (e) => {
                        const updated = backlinks.map((x) => x.id === b.id ? { ...x, status: e.target.value as any } : x);
                        setBacklinks(updated);
                        await persistSeoKey("backlinks_data", updated);
                      }}
                      className="px-2.5 py-1 rounded bg-black/50 border border-white/15 text-xs text-white"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Outreach Sent">Outreach Sent</option>
                      <option value="Live">Live</option>
                    </select>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        const updated = backlinks.filter((x) => x.id !== b.id);
                        setBacklinks(updated);
                        await persistSeoKey("backlinks_data", updated);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl border border-[#c9a84c]/25 bg-[#c9a84c]/5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Input
                  value={outreachTarget}
                  onChange={(e) => setOutreachTarget(e.target.value)}
                  placeholder="اسم المجلة أو الموقع المستهدف..."
                  className="bg-black/40 border-white/10 text-white flex-1"
                />
                <Button onClick={handleGenerateOutreach} disabled={outreachLoading} className="gap-1.5">
                  {outreachLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  توليد رسالة PR و Guest Post بالذكاء الاصطناعي
                </Button>
              </div>
              {outreachPitch && (
                <Textarea
                  value={outreachPitch}
                  onChange={(e) => setOutreachPitch(e.target.value)}
                  rows={7}
                  className="bg-black/50 border-white/10 text-white text-xs"
                />
              )}
            </div>
          </TabsContent>

          {/* 3. Rank Tracker */}
          <TabsContent value="ranks" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input
                value={newRankKw}
                onChange={(e) => setNewRankKw(e.target.value)}
                placeholder="الكلمة المفتاحية المراد تتبعها"
                className="bg-black/40 border-white/10 text-white"
              />
              <Input
                value={newRankUrl}
                onChange={(e) => setNewRankUrl(e.target.value)}
                placeholder="المسار (مثال: /en/egypt-private-tours)"
                className="bg-black/40 border-white/10 text-white"
              />
              <Input
                type="number"
                value={newRankPos}
                onChange={(e) => setNewRankPos(e.target.value)}
                placeholder="الترتيب الحالي"
                className="bg-black/40 border-white/10 text-white"
              />
              <Button onClick={handleAddRank} className="gap-1.5">
                <Plus className="w-4 h-4" /> إضافة للتتبع
              </Button>
            </div>

            <div className="space-y-2">
              {ranks.map((rk) => {
                const diff = rk.previousRank - rk.currentRank;
                return (
                  <div key={rk.id} className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/10 text-sm">
                    <div>
                      <p className="text-white font-medium">{rk.keyword}</p>
                      <p className="text-xs text-white/50">{rk.url} · {rk.volume}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-[#c9a84c]/20 text-[#ecd58e] border-0">
                        الترتيب #{rk.currentRank} {diff > 0 ? `(+${diff})` : ""}
                      </Badge>
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(rk.keyword)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-sky-400 hover:underline inline-flex items-center gap-1"
                      >
                        فحص SERP <ExternalLink className="w-3 h-3" />
                      </a>
                      <Button size="sm" variant="outline" onClick={() => handleRankActionPlan(rk)} disabled={rankPlanLoading} className="text-xs gap-1">
                        <Sparkles className="w-3 h-3" /> خطة تصدر #1
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            {rankPlan && (
              <Textarea value={rankPlan} readOnly rows={7} className="bg-black/50 border-white/10 text-white text-xs" />
            )}
          </TabsContent>

          {/* 4. Technical SEO & Screaming Frog */}
          <TabsContent value="technical" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div>
                <p className="text-white font-semibold">
                  نتائج الفحص التقني: {technicalIssues.length === 0 ? "لا توجد أخطاء حرجة" : `${technicalIssues.length} مشكلة تحتاج إصلاح`}
                </p>
                <p className="text-xs text-white/50">يفحص العناوين، الوصف التعريفي، Canonical، الفهرسة، وتصدير خريطة الموقع XML</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleAutoFixTechnicalIssues} disabled={fixingAll} className="gap-1.5 bg-[#c9a84c] text-black hover:opacity-90">
                  {fixingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  إصلاح جميع الأخطاء التقنية تلقائياً بـ Gemini
                </Button>
                <Button variant="outline" onClick={() => handleDownloadFile("sitemap.xml", buildSitemapXml())} className="gap-1.5 text-xs">
                  <Download className="w-3.5 h-3.5" /> تحميل sitemap.xml
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    handleDownloadFile(
                      "screaming-frog-urls.txt",
                      Array.from(
                        new Set([
                          ...pages.map((p) => `https://vanirgroup.com${p.path}`),
                          ...landingPages.map((lp) => `https://vanirgroup.com/${lp.lang}/${lp.slug}`),
                        ])
                      ).join("\n")
                    )
                  }
                  className="gap-1.5 text-xs"
                >
                  <Download className="w-3.5 h-3.5" /> تصدير قائمة Screaming Frog
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg border border-white/15 text-xs text-white/80 hover:bg-white/5 inline-flex items-center gap-1.5">
                Google Search Console <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://www.screamingfrog.co.uk/seo-spider/" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg border border-white/15 text-xs text-white/80 hover:bg-white/5 inline-flex items-center gap-1.5">
                Screaming Frog SEO Spider <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://search.google.com/test/rich-results?url=https://vanirgroup.com" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg border border-white/15 text-xs text-white/80 hover:bg-white/5 inline-flex items-center gap-1.5">
                Google Rich Results Test <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {technicalIssues.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {technicalIssues.map((iss, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/10 text-xs">
                    <span className="flex items-center gap-2 text-white/85">
                      <AlertTriangle className={`w-4 h-4 ${iss.severity === "error" ? "text-red-400" : "text-amber-400"}`} />
                      <strong className="font-mono text-[#ecd58e]">{iss.path}</strong> — {iss.issue}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-400 text-sm p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" /> جميع الصفحات المسجلة سليمة تقنياً وجاهزة للفهرسة!
              </div>
            )}
          </TabsContent>

          {/* 5. Google PageSpeed Insights */}
          <TabsContent value="pagespeed" className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
              <Input
                value={psiUrl}
                onChange={(e) => setPsiUrl(e.target.value)}
                placeholder="https://vanirgroup.com"
                className="bg-black/40 border-white/10 text-white flex-1 min-w-[220px]"
              />
              <div className="flex rounded-lg border border-white/10 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setPsiStrategy("mobile")}
                  className={`px-3 py-2 text-xs flex items-center gap-1.5 ${psiStrategy === "mobile" ? "bg-[#c9a84c] text-black font-bold" : "bg-black/40 text-white/70"}`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> موبايل
                </button>
                <button
                  type="button"
                  onClick={() => setPsiStrategy("desktop")}
                  className={`px-3 py-2 text-xs flex items-center gap-1.5 ${psiStrategy === "desktop" ? "bg-[#c9a84c] text-black font-bold" : "bg-black/40 text-white/70"}`}
                >
                  <Monitor className="w-3.5 h-3.5" /> كمبيوتر
                </button>
              </div>
              <Button onClick={handleRunPageSpeed} disabled={psiLoading} className="gap-1.5">
                {psiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                فحص Google PageSpeed الآن
              </Button>
              <a
                href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(psiUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-md border border-white/15 text-xs text-white/80 hover:bg-white/5 inline-flex items-center gap-1"
              >
                فتح PageSpeed Web <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {psiError && <p className="text-xs text-red-400">{psiError}</p>}

            {cats && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Performance", val: Math.round((cats.performance?.score || 0) * 100) },
                    { label: "SEO", val: Math.round((cats.seo?.score || 0) * 100) },
                    { label: "Accessibility", val: Math.round((cats.accessibility?.score || 0) * 100) },
                    { label: "Best Practices", val: Math.round((cats["best-practices"]?.score || 0) * 100) },
                  ].map((m) => (
                    <div key={m.label} className="p-4 rounded-xl bg-black/50 border border-white/10 text-center">
                      <p className="text-xs text-white/50">{m.label}</p>
                      <p className={`text-3xl font-bold mt-1 ${m.val >= 90 ? "text-emerald-400" : m.val >= 50 ? "text-amber-400" : "text-red-400"}`}>
                        {m.val}%
                      </p>
                    </div>
                  ))}
                </div>
                {audits && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">LCP: <strong className="text-white">{audits["largest-contentful-paint"]?.displayValue}</strong></div>
                    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">FCP: <strong className="text-white">{audits["first-contentful-paint"]?.displayValue}</strong></div>
                    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">CLS: <strong className="text-white">{audits["cumulative-layout-shift"]?.displayValue}</strong></div>
                    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">Speed Index: <strong className="text-white">{audits["speed-index"]?.displayValue}</strong></div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* 6. Content Optimizer & Topic Gaps */}
          <TabsContent value="content" className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Input
                value={gapKeyword}
                onChange={(e) => setGapKeyword(e.target.value)}
                placeholder="الكلمة المفتاحية المستهدفة"
                className="bg-black/40 border-white/10 text-white flex-1"
              />
              <select
                value={gapLang}
                onChange={(e) => setGapLang(e.target.value as any)}
                className="px-3 py-2 rounded-md bg-black/40 border border-white/10 text-white text-sm"
              >
                <option value="ar">AR</option>
                <option value="en">EN</option>
                <option value="de">DE</option>
              </select>
              <Button onClick={handleAnalyzeTopicGap} disabled={gapLoading} className="gap-1.5">
                {gapLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                مقارنة بالمتصدرين وسد الفجوات
              </Button>
            </div>
            <Textarea
              value={gapDraft}
              onChange={(e) => setGapDraft(e.target.value)}
              rows={4}
              placeholder="الصق مسودة المقال أو الصفحة هنا (أو اتركه فارغاً ليقوم Gemini بكتابة محتوى متكامل من الصفر)..."
              className="bg-black/40 border-white/10 text-white text-sm"
            />
            {gapResult && (
              <div className="space-y-3 p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">تغطية نية البحث (Search Intent Score):</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0">{gapResult.coverageScore}%</Badge>
                </div>
                <div>
                  <p className="text-xs text-[#ecd58e] font-semibold mb-1">الفجوات الموضوعية المفقودة (Topic Gaps):</p>
                  <ul className="list-disc list-inside text-xs text-white/80 space-y-1">
                    {gapResult.missingTopics.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-[#ecd58e] font-semibold">المحتوى المحسّن الجاهز للنشر:</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(gapResult.optimizedContent);
                        toast.success("تم نسخ المحتوى المحسّن");
                      }}
                      className="text-xs gap-1"
                    >
                      <Copy className="w-3 h-3" /> نسخ
                    </Button>
                  </div>
                  <Textarea value={gapResult.optimizedContent} readOnly rows={8} className="bg-black/50 border-white/10 text-white text-xs" />
                </div>
              </div>
            )}
          </TabsContent>

          {/* 7. Multilingual Service Landing Pages */}
          <TabsContent value="landing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-xl bg-[#c9a84c]/5 border border-[#c9a84c]/25">
              <select
                value={lpLang}
                onChange={(e) => setLpLang(e.target.value as any)}
                className="px-3 py-2 rounded-md bg-black/50 border border-white/15 text-white text-sm"
              >
                <option value="de">Deutsch (/de/...)</option>
                <option value="en">English (/en/...)</option>
                <option value="ar">العربية (/ar/...)</option>
              </select>
              <Input
                value={lpSlug}
                onChange={(e) => setLpSlug(e.target.value)}
                placeholder="slug (مثال: private-jet-charter)"
                className="bg-black/50 border-white/15 text-white"
              />
              <Input
                value={lpService}
                onChange={(e) => setLpService(e.target.value)}
                placeholder="اسم الخدمة (مثال: Private Jet Charter)"
                className="bg-black/50 border-white/15 text-white"
              />
              <Button onClick={handleCreateLandingPageWithGemini} disabled={lpGenerating} className="gap-1.5 bg-[#c9a84c] text-black hover:opacity-90">
                {lpGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                إنشاء صفحة هبوط بالذكاء الاصطناعي
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {landingPages.map((lp) => (
                <div key={lp.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge className="bg-[#c9a84c]/20 text-[#ecd58e] border-0 uppercase">{lp.lang}</Badge>
                      <span className="font-mono text-xs text-white/60">/{lp.lang}/{lp.slug}</span>
                    </div>
                    <h4 className="text-white font-semibold mt-2 text-sm">{lp.h1}</h4>
                    <p className="text-xs text-white/50 mt-1 line-clamp-2">{lp.metaDescription}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <a
                      href={`/${lp.lang}/${lp.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-400 hover:underline inline-flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" /> معاينة الصفحة الحية <ExternalLink className="w-3 h-3" />
                    </a>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        const updated = landingPages.filter((x) => x.id !== lp.id);
                        setLandingPages(updated);
                        await persistSeoKey("landing_pages_data", updated);
                        toast.success("تم حذف صفحة الهبوط");
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
