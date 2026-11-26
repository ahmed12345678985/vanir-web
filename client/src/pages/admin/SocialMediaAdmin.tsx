import { useState, useEffect, useRef } from "react";
import {
  Instagram,
  Facebook,
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
  Copy,
  Download,
  Send,
  Settings2,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Wand2,
  Globe,
  Sliders,
  Upload,
} from "lucide-react";
import { getInstagramTrends } from "@/lib/liveTravelApi";
import { uploadBase64Media } from "@/lib/siteSettingsApi";
import { toast } from "sonner";

const TONE_OPTIONS = [
  { value: "ultra_luxury", label: "Ultra-Luxury Editorial" },
  { value: "vip_offer", label: "VIP Exclusive Offer" },
  { value: "storytelling", label: "Cinematic Storytelling" },
  { value: "diplomatic", label: "Executive & Diplomatic" },
];

const VISUAL_STYLES = [
  { value: "golden_hour", label: "Cinematic Golden Hour" },
  { value: "aviation_yacht", label: "Private Jet & Superyacht" },
  { value: "royal_egypt", label: "Royal Pharaonic & Nile" },
  { value: "resort_villa", label: "5-Star Overwater / Villa" },
];

const CAMPAIGN_GOALS = [
  { value: "direct_booking", label: "Direct Booking CTA" },
  { value: "brand_prestige", label: "Brand Prestige & Awareness" },
  { value: "seasonal_package", label: "Seasonal VIP Package" },
  { value: "concierge_inquiry", label: "WhatsApp / Concierge Lead" },
];

const QUICK_TOPICS = [
  "Private Nile Dahabiya Cruise & After-Hours Pyramids Tour",
  "Dubai Burj Al Arab & Superyacht Charter Weekend",
  "Gulfstream Private Jet Charter from Cairo to Geneva",
  "Maldives Private Island Overwater Villa Escape",
  "@beautifuldestinations",
];

function safeParseAiJson(raw: string): Record<string, any> | null {
  if (!raw) return null;
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  const jsonStr = match[0];

  try {
    return JSON.parse(jsonStr);
  } catch {
    // Escape unescaped control characters (raw newlines/tabs) inside quoted JSON strings
    let out = "";
    let inString = false;
    let escaped = false;
    for (let i = 0; i < jsonStr.length; i++) {
      const ch = jsonStr[i];
      if (escaped) {
        out += ch;
        escaped = false;
        continue;
      }
      if (ch === "\\" && inString) {
        out += ch;
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        out += ch;
        continue;
      }
      if (inString) {
        const code = ch.charCodeAt(0);
        if (ch === "\n") {
          out += "\\n";
          continue;
        }
        if (ch === "\r") continue;
        if (ch === "\t") {
          out += "\\t";
          continue;
        }
        if (code < 0x20) continue;
      }
      out += ch;
    }
    try {
      return JSON.parse(out);
    } catch {
      // Tolerant key extraction fallback
      const extract = (key: string) => {
        const m = out.match(new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, "i"));
        return m ? m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"') : "";
      };
      const topic = extract("topic");
      const instagram = extract("instagram");
      const facebook = extract("facebook");
      const imagePrompt = extract("imagePrompt");
      if (topic || instagram || facebook) {
        return { topic, instagram, facebook, imagePrompt };
      }
      return null;
    }
  }
}

export default function SocialMediaAdmin() {
  const [topic, setTopic] = useState("Private Nile Dahabiya Cruise & After-Hours Pyramids Tour");
  const [language, setLanguage] = useState<"bilingual" | "ar" | "en" | "de">("bilingual");
  const [tone, setTone] = useState("ultra_luxury");
  const [visualStyle, setVisualStyle] = useState("golden_hour");
  const [goal, setGoal] = useState("direct_booking");
  const [ctaUrl, setCtaUrl] = useState("https://vanirgroup.com");
  const [textProvider, setTextProvider] = useState<"auto" | "gemini" | "cloudflare" | "openai" | "deepseek">("auto");
  const [imageEngine, setImageEngine] = useState<"real_photo" | "cf_flux" | "openai" | "gemini" | "auto">("cf_flux");
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);

  const [fetchingTrends, setFetchingTrends] = useState(false);
  const [trendPosts, setTrendPosts] = useState<any[]>([]);

  const [generating, setGenerating] = useState(false);
  const [regeneratingImg, setRegeneratingImg] = useState(false);
  const [igCaption, setIgCaption] = useState("");
  const [fbCaption, setFbCaption] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [uploadingLocalImg, setUploadingLocalImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleLocalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }
    setUploadingLocalImg(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
      const base64Only = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
      // Show preview immediately
      setGeneratedImage(dataUrl);
      // Upload to cloud for a public HTTPS URL (required by Instagram Graph API)
      try {
        const publicUrl = await Promise.race([
          uploadBase64Media(base64Only, `vanir-social-${Date.now()}-${file.name}`, file.type, "social_posts"),
          new Promise<string>((_, reject) => setTimeout(() => reject(new Error("Upload timeout")), 12000)),
        ]);
        if (publicUrl && /^https?:\/\//i.test(publicUrl)) {
          setGeneratedImage(publicUrl);
        }
        toast.success("تم رفع الصورة بنجاح وجاهزة للنشر على Facebook و Instagram!");
      } catch {
        toast.success("تم تحميل الصورة في المعاينة بنجاح!");
      }
    } catch {
      toast.error("تعذر قراءة الصورة من الجهاز.");
    } finally {
      setUploadingLocalImg(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Meta Graph API Direct Publishing
  const [serverMetaStatus, setServerMetaStatus] = useState({
    facebookConfigured: false,
    instagramConfigured: false,
  });
  const [showMetaSettings, setShowMetaSettings] = useState(false);
  const [metaPageId, setMetaPageId] = useState(() => localStorage.getItem("vanir_meta_page_id") || "");
  const [metaIgId, setMetaIgId] = useState(() => localStorage.getItem("vanir_meta_ig_id") || "");
  const [metaToken, setMetaToken] = useState(() => localStorage.getItem("vanir_meta_token") || "");
  const [metaAppSecret, setMetaAppSecret] = useState(() => localStorage.getItem("vanir_meta_app_secret") || "");
  const [publishing, setPublishing] = useState<"facebook" | "instagram" | "both" | null>(null);
  const [verifyingMeta, setVerifyingMeta] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any | null>(null);
  const [publishLog, setPublishLog] = useState<Array<{ platform: string; postId: string; time: string }>>([]);

  const handleVerifyMeta = async () => {
    setVerifyingMeta(true);
    setVerifyResult(null);
    try {
      const res = await fetch("/api/social-publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          pageId: metaPageId.trim() || undefined,
          igUserId: metaIgId.trim() || undefined,
          accessToken: metaToken.trim() || undefined,
          appSecret: metaAppSecret.trim() || undefined,
        }),
      });
      const data = await res.json();
      setVerifyResult(data);
      if (metaToken.trim()) {
        localStorage.setItem("vanir_meta_token", metaToken.trim());
      }
      if (data?.facebook?.ok) {
        toast.success(`Facebook Page Verified: ${data.facebook.name} (ID: ${data.facebook.id})`);
        if (data.facebook.id) {
          setMetaPageId(String(data.facebook.id));
          localStorage.setItem("vanir_meta_page_id", String(data.facebook.id));
        }
        if (data.facebook.linkedIgId) {
          setMetaIgId(String(data.facebook.linkedIgId));
          localStorage.setItem("vanir_meta_ig_id", String(data.facebook.linkedIgId));
        }
      } else if (data?.facebook?.error) {
        toast.error(`Facebook Error: ${data.facebook.error}`);
      }
      if (data?.instagram?.ok) {
        toast.success(`Instagram Verified: @${data.instagram.username}`);
      } else if (data?.instagram?.error) {
        toast.error(`Instagram Error: ${data.instagram.error}`);
      }
      if (data?.error && !data?.facebook && !data?.instagram) {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to verify Meta credentials.");
    } finally {
      setVerifyingMeta(false);
    }
  };

  useEffect(() => {
    fetch("/api/social-publish")
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok) {
          setServerMetaStatus({
            facebookConfigured: Boolean(d.facebookConfigured),
            instagramConfigured: Boolean(d.instagramConfigured),
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleFetchTrends = async () => {
    if (!topic.trim()) return;
    setFetchingTrends(true);
    try {
      const res = await getInstagramTrends(topic.trim());
      if (res.ok) {
        setTrendPosts(res.posts || []);
        toast.success(`Fetched ${res.posts?.length || 0} live Instagram trends.`);
      } else {
        toast.error(res.error || "Could not fetch Instagram trends.");
      }
    } catch {
      toast.error("Failed to fetch Instagram trends.");
    } finally {
      setFetchingTrends(false);
    }
  };

  const generateVisualOnly = async (promptToUse: string) => {
    setRegeneratingImg(true);
    try {
      const imgRes = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_image",
          prompt: promptToUse,
          imageEngine,
        }),
      });
      const imgData = await imgRes.json();
      if (imgData?.imageBase64) {
        const mime = imgData.mimeType || "image/jpeg";
        const dataUrl = `data:${mime};base64,${imgData.imageBase64}`;
        setGeneratedImage(dataUrl);
        // Auto-host to public HTTPS URL (Firebase Storage / Cloudinary) so Instagram Graph API accepts it directly
        try {
          const hostedUrl = await Promise.race([
            uploadBase64Media(imgData.imageBase64, `vanir-ai-${Date.now()}.jpg`, mime, "social_posts"),
            new Promise<string>((_, reject) => setTimeout(() => reject(new Error("timeout")), 12000)),
          ]);
          if (hostedUrl && /^https?:\/\//i.test(hostedUrl)) {
            setGeneratedImage(hostedUrl);
          }
        } catch {}
        toast.success(`Visual ready (${imgData.model || imageEngine})!`);
      } else if (imgData?.imageUrl) {
        setGeneratedImage(imgData.imageUrl);
        toast.success(`Visual ready (${imgData.model || imageEngine})!`);
      } else {
        toast.error(imgData?.error || "Image generation returned no visual.");
      }
    } catch {
      toast.error("Failed to generate AI image.");
    } finally {
      setRegeneratingImg(false);
    }
  };

  const handleGenerateAll = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a campaign topic or @instagram handle.");
      return;
    }
    setGenerating(true);

    const trendContext = trendPosts
      .slice(0, 4)
      .map((p, i) => `${i + 1}. ${String(p.caption || "").slice(0, 180)}`)
      .join("\n");

    const langRule =
      language === "ar"
        ? "Write both posts strictly in refined, persuasive Arabic."
        : language === "en"
        ? "Write both posts in ultra-luxury English."
        : language === "de"
        ? "Write both posts in refined German."
        : "Write both posts bilingually (English first, then Arabic below).";

    const copyPrompt = `You are the Chief Social Media & Brand Director for VANIR GROUP (${ctaUrl}), an ultra-luxury travel concierge, private jet charter & 5-star tour operator.
Campaign Topic: "${topic}"
Tone: ${tone}
Campaign Goal: ${goal}
Visual Style: ${visualStyle}
Emojis: ${includeEmojis ? "Use tasteful luxury emojis" : "No emojis"}
Hashtags: ${includeHashtags ? "Include 10 targeted luxury travel hashtags" : "No hashtags"}
${trendContext ? `Live Instagram Trend Inspiration:\n${trendContext}\n` : ""}
${langRule}
Reply ONLY with valid JSON:
{
  "instagram": "Ready-to-publish Instagram caption with strong hook, luxury storytelling, CTA to ${ctaUrl}",
  "facebook": "Ready-to-publish Facebook post with engaging headline, key highlights, and CTA to ${ctaUrl}",
  "imagePrompt": "Photorealistic editorial luxury travel photography prompt (${visualStyle}), ultra-high detail, 8k, NO text overlays or watermarks"
}`;

    try {
      const copyRes = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          provider: textProvider,
          messages: [{ role: "user", content: copyPrompt }],
        }),
      });
      const copyData = await copyRes.json();
      if (!copyRes.ok || copyData?.error) {
        toast.error(copyData?.error || "AI text generation failed.");
        return;
      }
      const raw = copyData?.reply || copyData?.text || "";
      const parsed = safeParseAiJson(raw);
      let nextImgPrompt = `Ultra-luxury editorial travel photography of ${topic}, style: ${visualStyle}, cinematic golden hour lighting, 8k, no text`;

      if (parsed) {
        setIgCaption(String(parsed.instagram || ""));
        setFbCaption(String(parsed.facebook || ""));
        if (parsed.imagePrompt) nextImgPrompt = String(parsed.imagePrompt);
      } else if (raw.trim()) {
        setIgCaption(raw);
        setFbCaption(raw);
      }

      setImagePrompt(nextImgPrompt);
      await generateVisualOnly(nextImgPrompt);
      toast.success("Campaign posts & AI visual ready for publishing!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate campaign.");
    } finally {
      setGenerating(false);
    }
  };

  // Auto-invent a brand-new luxury travel topic + matching FB/IG posts + matching image in 1 click
  const handleAutoCreateTopicAndVisual = async () => {
    setGenerating(true);
    const langRule =
      language === "ar"
        ? "Write ALL content (topic, instagram, facebook) in eloquent luxury Arabic."
        : language === "en"
          ? "Write ALL content in refined luxury English."
          : language === "de"
            ? "Write ALL content in refined luxury German."
            : "Write each post bilingual: polished English followed by a divider and eloquent luxury Arabic.";

    const autoPrompt = `You are the Creative Director of Vanir Travel (luxury flights, 5-star hotels, private jets, yachts, VIP tours, visas — ${ctaUrl}).
Invent ONE fresh, exciting, specific luxury travel campaign topic right now (different from "${topic || "none"}"). Examples: Private Yacht Sunset in Maldives, First-Class Emirates to Dubai, Luxury Nile Dahabiya Cruise in Luxor & Aswan, VIP Swiss Alps Chalet Escape, Private Helicopter Tour over Santorini, etc.
Tone: ${tone}. Goal: ${goal}. Visual Style: ${visualStyle}.
Emojis: ${includeEmojis ? "Use tasteful luxury emojis" : "No emojis"}.
Hashtags: ${includeHashtags ? "Include 10 targeted luxury travel hashtags" : "No hashtags"}.
${langRule}
Reply ONLY with valid JSON:
{
  "topic": "Short catchy campaign topic title",
  "instagram": "Ready-to-publish Instagram caption strictly about this exact topic with strong hook and CTA to ${ctaUrl}",
  "facebook": "Ready-to-publish Facebook post strictly about this exact topic with engaging headline, highlights, and CTA to ${ctaUrl}",
  "imagePrompt": "Detailed English photorealistic editorial photography prompt depicting THIS EXACT topic (${visualStyle}), ultra-realistic 8k, golden hour lighting, NO text or watermarks"
}`;

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          provider: textProvider,
          messages: [{ role: "user", content: autoPrompt }],
        }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        toast.error(data?.error || "تعذر ابتكار موضوع جديد الآن.");
        return;
      }
      const raw = data?.reply || data?.text || "";
      const parsed = safeParseAiJson(raw);
      if (!parsed) {
        toast.error("تعذر قراءة الموضوع المولّد، يرجى المحاولة مرة أخرى.");
        return;
      }
      const newTopic = String(parsed.topic || "Luxury Private Escape with Vanir Travel").trim();
      setTopic(newTopic);
      setIgCaption(String(parsed.instagram || ""));
      setFbCaption(String(parsed.facebook || ""));
      const nextImgPrompt =
        String(parsed.imagePrompt || "").trim() ||
        `Ultra-luxury editorial travel photography of ${newTopic}, style: ${visualStyle}, cinematic golden hour lighting, 8k, no text`;
      setImagePrompt(nextImgPrompt);
      toast.success(`تم ابتكار الموضوع: ${newTopic} — جاري توليد الصورة المطابقة...`);
      await generateVisualOnly(nextImgPrompt);
    } catch (err: any) {
      toast.error(err?.message || "حدث خطأ أثناء ابتكار الموضوع والصورة.");
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async (platform: "facebook" | "instagram" | "both") => {
    if (!igCaption && !fbCaption) {
      toast.error("Generate or write a post first before publishing.");
      return;
    }
    setPublishing(platform);
    try {
      let finalImageUrl = generatedImage || undefined;
      if (finalImageUrl && finalImageUrl.startsWith("data:image/")) {
        try {
          const mimeMatch = finalImageUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
          if (mimeMatch) {
            const hosted = await Promise.race([
              uploadBase64Media(mimeMatch[2], `vanir-ig-${Date.now()}.jpg`, mimeMatch[1], "social_posts"),
              new Promise<string>((_, reject) => setTimeout(() => reject(new Error("timeout")), 12000)),
            ]);
            if (hosted && /^https?:\/\//i.test(hosted)) {
              finalImageUrl = hosted;
              setGeneratedImage(hosted);
            }
          }
        } catch {}
      }

      const res = await fetch("/api/social-publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          fbCaption: fbCaption || igCaption,
          igCaption: igCaption || fbCaption,
          imageUrl: finalImageUrl,
          pageId: metaPageId.trim() || undefined,
          igUserId: metaIgId.trim() || undefined,
          accessToken: metaToken.trim() || undefined,
          appSecret: metaAppSecret.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data?.needsConfiguration) {
        setShowMetaSettings(true);
        toast.error(data.error || "Please configure your Meta Page Access Token & IDs.");
        return;
      }
      const nowStr = new Date().toLocaleTimeString();
      if (data?.facebook?.ok) {
        toast.success(`Published to Facebook! ID: ${data.facebook.postId}`);
        setPublishLog((prev) => [{ platform: "Facebook", postId: data.facebook.postId, time: nowStr }, ...prev]);
      } else if (data?.facebook) {
        toast.error(`Facebook error: ${data.facebook.error}`);
      }
      if (data?.instagram?.ok) {
        toast.success(`Published to Instagram! ID: ${data.instagram.postId}`);
        setPublishLog((prev) => [{ platform: "Instagram", postId: data.instagram.postId, time: nowStr }, ...prev]);
      } else if (data?.instagram) {
        toast.error(`Instagram error: ${data.instagram.error}`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Publish failed.");
    } finally {
      setPublishing(null);
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-[#141923] via-[#171d29] to-[#141923] border border-[#D4A853]/30 rounded-2xl p-6">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A853]/15 border border-[#D4A853]/30 text-[#E5C17A] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Admin Social Command Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-[var(--font-display)] text-white">
            Facebook &amp; Instagram <span className="text-[#D4A853]">AI Publishing Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/65 mt-1">
            Fetch live Instagram trends, customize campaign tone &amp; visual style, edit captions, generate 4K visuals, and publish directly via Meta Graph API.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              serverMetaStatus.facebookConfigured || (metaPageId && metaToken)
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : "bg-white/5 border-white/10 text-white/60"
            }`}
          >
            <Facebook className="w-3.5 h-3.5" />
            {serverMetaStatus.facebookConfigured || (metaPageId && metaToken) ? "FB Connected" : "FB Setup Needed"}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              serverMetaStatus.instagramConfigured || (metaIgId && metaToken)
                ? "bg-pink-500/15 border-pink-500/30 text-pink-300"
                : "bg-white/5 border-white/10 text-white/60"
            }`}
          >
            <Instagram className="w-3.5 h-3.5" />
            {serverMetaStatus.instagramConfigured || (metaIgId && metaToken) ? "IG Connected" : "IG Setup Needed"}
          </span>
          <button
            type="button"
            onClick={() => setShowMetaSettings((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#D4A853]/15 border border-[#D4A853]/40 text-[#E5C17A] text-xs font-bold hover:bg-[#D4A853] hover:text-black transition"
          >
            <Settings2 className="w-3.5 h-3.5" />
            Meta API Settings
          </button>
        </div>
      </div>

      {/* Meta Graph API Settings Drawer */}
      {showMetaSettings && (
        <div className="rounded-2xl bg-[#12161f] border border-[#D4A853]/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#D4A853] uppercase tracking-wider">
              Meta Graph API Connection (Facebook Page &amp; Instagram Business)
            </h2>
            <span className="text-[11px] text-white/55">Saved locally or via Cloudflare Secrets (`META_PAGE_ACCESS_TOKEN`)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-white/70 block mb-1">Facebook Page ID</label>
              <input
                type="text"
                value={metaPageId}
                onChange={(e) => {
                  setMetaPageId(e.target.value);
                  localStorage.setItem("vanir_meta_page_id", e.target.value);
                }}
                placeholder="e.g. 123456789012345"
                className="w-full h-10 rounded-xl bg-black/50 border border-white/15 px-3 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/70 block mb-1">Instagram Business Account ID</label>
              <input
                type="text"
                value={metaIgId}
                onChange={(e) => {
                  setMetaIgId(e.target.value);
                  localStorage.setItem("vanir_meta_ig_id", e.target.value);
                }}
                placeholder="e.g. 17841400000000000"
                className="w-full h-10 rounded-xl bg-black/50 border border-white/15 px-3 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/70 block mb-1">Meta Page Access Token</label>
              <input
                type="password"
                value={metaToken}
                onChange={(e) => {
                  setMetaToken(e.target.value);
                  localStorage.setItem("vanir_meta_token", e.target.value);
                }}
                placeholder="EAA..."
                className="w-full h-10 rounded-xl bg-black/50 border border-white/15 px-3 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/70 block mb-1">Meta App Secret (for appsecret_proof)</label>
              <input
                type="password"
                value={metaAppSecret}
                onChange={(e) => {
                  setMetaAppSecret(e.target.value);
                  localStorage.setItem("vanir_meta_app_secret", e.target.value);
                }}
                placeholder="App Secret from Meta Dashboard"
                className="w-full h-10 rounded-xl bg-black/50 border border-white/15 px-3 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              disabled={verifyingMeta}
              onClick={handleVerifyMeta}
              className="px-4 py-2 rounded-xl bg-[#D4A853] hover:bg-[#f0cb75] text-black text-xs font-bold inline-flex items-center gap-2 disabled:opacity-50"
            >
              {verifyingMeta ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Verify Token &amp; IDs (اختبار الاتصال)
            </button>

            {verifyResult && (
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {verifyResult.facebook && (
                  <span className={verifyResult.facebook.ok ? "text-emerald-400" : "text-red-400"}>
                    {verifyResult.facebook.ok
                      ? `✓ FB Page: ${verifyResult.facebook.name} (${verifyResult.facebook.id})`
                      : `✗ FB: ${verifyResult.facebook.error}`}
                  </span>
                )}
                {verifyResult.instagram && (
                  <span className={verifyResult.instagram.ok ? "text-pink-300" : "text-red-400"}>
                    {verifyResult.instagram.ok
                      ? `✓ IG: @${verifyResult.instagram.username} (${verifyResult.instagram.id})`
                      : `✗ IG: ${verifyResult.instagram.error}`}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Campaign Builder & Options */}
      <div className="rounded-2xl bg-[#12161f] border border-white/10 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Campaign topic or @instagram_handle..."
            className="flex-1 h-12 rounded-xl bg-black/50 border border-white/15 px-4 text-sm text-white focus:outline-none focus:border-[#D4A853]"
          />
          <button
            type="button"
            disabled={fetchingTrends}
            onClick={handleFetchTrends}
            className="h-12 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center justify-center gap-2 shrink-0"
          >
            {fetchingTrends ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4 text-[#D4A853]" />}
            Fetch Live IG Trends
          </button>
          <button
            type="button"
            disabled={generating}
            onClick={handleAutoCreateTopicAndVisual}
            className="h-12 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black inline-flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 transition"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            ابتكار موضوع + صورة مطابقة
          </button>
          <button
            type="button"
            disabled={generating}
            onClick={handleGenerateAll}
            className="h-12 px-6 rounded-xl bg-gradient-to-r from-[#D4A853] to-[#f0cb75] text-black text-xs font-black inline-flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            Generate Posts &amp; AI Visual
          </button>
        </div>

        {/* Quick Topic Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-white/50">Quick presets:</span>
          {QUICK_TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              className={`px-3 py-1 rounded-full text-[11px] transition ${
                topic === t ? "bg-[#D4A853] text-black font-bold" : "bg-white/5 text-white/75 hover:bg-white/15"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Rich Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-white/10">
          <div>
            <label className="text-[11px] text-[#D4A853] font-semibold flex items-center gap-1 mb-1">
              <Globe className="w-3 h-3" /> Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full h-10 rounded-lg bg-black/50 border border-white/15 px-3 text-xs text-white"
            >
              <option value="bilingual" className="bg-[#0d1117]">Bilingual (EN + AR)</option>
              <option value="ar" className="bg-[#0d1117]">Arabic Only</option>
              <option value="en" className="bg-[#0d1117]">English Only</option>
              <option value="de" className="bg-[#0d1117]">German Only</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-[#D4A853] font-semibold flex items-center gap-1 mb-1">
              <Sliders className="w-3 h-3" /> Copy Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full h-10 rounded-lg bg-black/50 border border-white/15 px-3 text-xs text-white"
            >
              {TONE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#0d1117]">{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-[#D4A853] font-semibold flex items-center gap-1 mb-1">
              <ImageIcon className="w-3 h-3" /> Visual Style
            </label>
            <select
              value={visualStyle}
              onChange={(e) => setVisualStyle(e.target.value)}
              className="w-full h-10 rounded-lg bg-black/50 border border-white/15 px-3 text-xs text-white"
            >
              {VISUAL_STYLES.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#0d1117]">{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-[#D4A853] font-semibold mb-1 block">Campaign Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full h-10 rounded-lg bg-black/50 border border-white/15 px-3 text-xs text-white"
            >
              {CAMPAIGN_GOALS.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#0d1117]">{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-[#D4A853] font-semibold mb-1 block">CTA Link</label>
            <input
              type="text"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              className="w-full h-10 rounded-lg bg-black/50 border border-white/15 px-3 text-xs text-white"
            />
          </div>
        </div>

        {/* AI Engine Selectors (Images + Text Model) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/10">
          <div>
            <label className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1 mb-1">
              <ImageIcon className="w-3 h-3" /> محرك الصور (Image Engine)
            </label>
            <select
              value={imageEngine}
              onChange={(e) => setImageEngine(e.target.value as any)}
              className="w-full h-10 rounded-lg bg-black/50 border border-emerald-500/30 px-3 text-xs text-white"
            >
              <option value="real_photo" className="bg-[#0d1117]">📸 صور حقيقية 4K (Google Images HD — بدون تشويه AI)</option>
              <option value="cf_flux" className="bg-[#0d1117]">⚡ Cloudflare FLUX.1-schnell AI (توليد ذكي نظيف وسريع)</option>
              <option value="openai" className="bg-[#0d1117]">🎨 OpenAI DALL-E 3 HD (يتطلب OPENAI_API_KEY)</option>
              <option value="gemini" className="bg-[#0d1117]">✨ Google Imagen 4 / Gemini Image</option>
              <option value="auto" className="bg-[#0d1117]">🔄 تلقائي (FLUX.1 ثم صور حقيقية 4K)</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-[#E5C17A] font-semibold flex items-center gap-1 mb-1">
              <Sparkles className="w-3 h-3" /> موديل كتابة المنشورات (Text Model)
            </label>
            <select
              value={textProvider}
              onChange={(e) => setTextProvider(e.target.value as any)}
              className="w-full h-10 rounded-lg bg-black/50 border border-[#D4A853]/30 px-3 text-xs text-white"
            >
              <option value="auto" className="bg-[#0d1117]">🔄 تلقائي (Gemini 2.5 Flash ← Cloudflare Llama 3.3)</option>
              <option value="gemini" className="bg-[#0d1117]">✨ Google Gemini 2.5 Flash (الأفضل للعربية)</option>
              <option value="cloudflare" className="bg-[#0d1117]">⚡ Cloudflare Llama 3.3 70B</option>
              <option value="openai" className="bg-[#0d1117]">🤖 OpenAI GPT-4o-mini (يتطلب OPENAI_API_KEY)</option>
              <option value="deepseek" className="bg-[#0d1117]">🧠 DeepSeek V3 (يتطلب DEEPSEEK_API_KEY)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-white/80">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeEmojis}
              onChange={(e) => setIncludeEmojis(e.target.checked)}
              className="accent-[#D4A853]"
            />
            Include Luxury Emojis
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeHashtags}
              onChange={(e) => setIncludeHashtags(e.target.checked)}
              className="accent-[#D4A853]"
            />
            Include Trending Hashtags
          </label>
        </div>

        {/* Live Instagram Trend Cards */}
        {trendPosts.length > 0 && (
          <div className="pt-3 border-t border-white/10 space-y-2">
            <p className="text-xs font-bold text-[#D4A853]">Live Instagram Trends (Click any card to use as topic):</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {trendPosts.slice(0, 4).map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTopic(String(p.caption || "").slice(0, 140))}
                  className="text-left p-3 rounded-xl bg-black/40 border border-white/10 hover:border-[#D4A853]/50 text-[11px] text-white/75 line-clamp-3 transition"
                >
                  {p.caption || "Instagram Trend"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Editable Workspace: Instagram + Facebook + AI Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Instagram Editor */}
        <div className="rounded-2xl bg-[#12161f] border border-white/10 p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-pink-300 flex items-center gap-2">
              <Instagram className="w-4 h-4" /> Instagram Caption
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(igCaption);
                toast.success("Instagram caption copied!");
              }}
              className="text-xs text-white/65 hover:text-white inline-flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
          </div>
          <textarea
            rows={10}
            value={igCaption}
            onChange={(e) => setIgCaption(e.target.value)}
            placeholder="Your Instagram caption will appear here (fully editable)..."
            className="w-full flex-1 rounded-xl bg-black/50 border border-white/15 p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-[#D4A853]"
          />
          <div className="flex items-center justify-between text-[11px] text-white/50">
            <span>{igCaption.length} characters</span>
            <button
              type="button"
              disabled={publishing !== null || !igCaption}
              onClick={() => handlePublish("instagram")}
              className="px-3.5 py-1.5 rounded-lg bg-pink-500/20 border border-pink-500/40 hover:bg-pink-600 text-white font-bold inline-flex items-center gap-1.5 disabled:opacity-40 transition"
            >
              {publishing === "instagram" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Instagram className="w-3.5 h-3.5" />}
              Publish to Instagram
            </button>
          </div>
        </div>

        {/* Facebook Editor */}
        <div className="rounded-2xl bg-[#12161f] border border-white/10 p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-blue-300 flex items-center gap-2">
              <Facebook className="w-4 h-4" /> Facebook Post
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(fbCaption);
                toast.success("Facebook post copied!");
              }}
              className="text-xs text-white/65 hover:text-white inline-flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
          </div>
          <textarea
            rows={10}
            value={fbCaption}
            onChange={(e) => setFbCaption(e.target.value)}
            placeholder="Your Facebook post will appear here (fully editable)..."
            className="w-full flex-1 rounded-xl bg-black/50 border border-white/15 p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-[#D4A853]"
          />
          <div className="flex items-center justify-between text-[11px] text-white/50">
            <span>{fbCaption.length} characters</span>
            <button
              type="button"
              disabled={publishing !== null || !fbCaption}
              onClick={() => handlePublish("facebook")}
              className="px-3.5 py-1.5 rounded-lg bg-[#1877F2]/25 border border-[#1877F2]/40 hover:bg-[#1877F2] text-white font-bold inline-flex items-center gap-1.5 disabled:opacity-40 transition"
            >
              {publishing === "facebook" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Facebook className="w-3.5 h-3.5" />}
              Publish to Facebook
            </button>
          </div>
        </div>

        {/* AI Visual Preview & Custom Image URL */}
        <div className="rounded-2xl bg-[#12161f] border border-white/10 p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#E5C17A] flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Post Visual (AI / Custom)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={regeneratingImg}
                onClick={() => generateVisualOnly(imagePrompt || `Luxury travel photography of ${topic}, 8k`)}
                className="text-xs text-[#D4A853] hover:text-white inline-flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${regeneratingImg ? "animate-spin" : ""}`} /> Regenerate
              </button>
              {generatedImage && (
                <a
                  href={generatedImage}
                  download={`vanir-social-${Date.now()}.png`}
                  className="text-xs text-white/75 hover:text-white inline-flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Save
                </a>
              )}
            </div>
          </div>

          {generatedImage ? (
            <img
              src={generatedImage}
              alt="Generated campaign visual"
              className="w-full h-56 object-cover rounded-xl border border-white/10"
            />
          ) : (
            <div className="h-56 rounded-xl bg-black/40 border border-dashed border-white/15 flex items-center justify-center text-xs text-white/50 text-center px-4">
              {generating || regeneratingImg
                ? "Generating luxury AI visual..."
                : "Click 'Generate Posts & AI Visual' or paste an HTTPS image URL below"}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLocalImageUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploadingLocalImg}
              onClick={() => fileInputRef.current?.click()}
              className="h-9 px-3 rounded-lg bg-[#D4A853]/15 border border-[#D4A853]/40 hover:bg-[#D4A853]/25 text-[#E5C17A] text-xs font-bold inline-flex items-center gap-1.5 shrink-0 disabled:opacity-50 transition"
            >
              {uploadingLocalImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploadingLocalImg ? "جاري الرفع..." : "رفع من الجهاز"}
            </button>
            <input
              type="text"
              value={generatedImage.startsWith("data:") ? "" : generatedImage}
              onChange={(e) => setGeneratedImage(e.target.value)}
              placeholder="Or paste custom HTTPS image URL..."
              className="w-full h-9 rounded-lg bg-black/50 border border-white/15 px-3 text-xs text-white"
            />
          </div>

          <button
            type="button"
            disabled={publishing !== null || (!fbCaption && !igCaption)}
            onClick={() => handlePublish("both")}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-[#D4A853] to-[#f0cb75] text-black font-black text-xs inline-flex items-center justify-center gap-2 disabled:opacity-40 transition"
          >
            {publishing === "both" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Publish Simultaneously to Both (FB + IG)
          </button>
        </div>
      </div>

      {/* Published History Log */}
      {publishLog.length > 0 && (
        <div className="rounded-2xl bg-[#12161f] border border-emerald-500/30 p-4 space-y-2">
          <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Recent Live Publications
          </h3>
          <div className="space-y-1.5">
            {publishLog.map((item, i) => (
              <div key={i} className="text-xs text-white/80 flex items-center justify-between bg-black/40 px-3 py-2 rounded-lg">
                <span>
                  <strong>{item.platform}</strong> — Post ID: <code className="text-[#D4A853]">{item.postId}</code>
                </span>
                <span className="text-white/50">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
