/**
 * AI Image Generator - Ultra-Luxury 3D Photonic Diffusion Studio
 * High-end 3D perspective viewport, real luxury travel photography presets,
 * interactive 3D aspect ratio frames, frontier model selectors, and seamless synthesis.
 */
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Download, Loader2, Sparkles, Zap, Wand2, X,
  Maximize2, Copy, Share2, ChevronDown, Image as ImageIcon,
  RefreshCw, Settings2, Layers, Palette, ArrowRight, FileImage,
  Coins, Info, Camera, Compass, Sliders, Eye, Plane, Anchor, Flame
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import AISidebar from "@/components/AISidebar";
import AI3DHeader from "@/components/AI3DHeader";
import { GoldDustParticles, AmbientGlow } from "@/components/ElegantEffects";
import { toast } from "sonner";
import { Link } from "wouter";

/* ─── 3D Visual & Gold Luster CSS ─── */
const STYLE_ID = "ai-3d-studio-style";
function injectStudioStyles() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes goldSweep {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes stageFloat {
      0%, 100% { transform: translateY(0px) rotateX(2deg); }
      50% { transform: translateY(-8px) rotateX(4deg); }
    }
    @keyframes hologramScan {
      0% { transform: translateY(-100%); opacity: 0; }
      50% { opacity: 0.8; }
      100% { transform: translateY(200%); opacity: 0; }
    }
    @keyframes pulseAura {
      0%, 100% { box-shadow: 0 0 25px rgba(212,168,83,0.15), inset 0 0 15px rgba(212,168,83,0.05); }
      50% { box-shadow: 0 0 45px rgba(212,168,83,0.35), inset 0 0 25px rgba(212,168,83,0.15); }
    }
    .studio-perspective {
      perspective: 1200px;
    }
    .card-3d-tilt {
      transform-style: preserve-3d;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
    }
    .card-3d-tilt:hover {
      transform: translateY(-4px) rotateX(3deg) rotateY(-2deg);
    }
    .gold-glow-border {
      position: relative;
    }
    .gold-glow-border::before {
      content: "";
      position: absolute;
      inset: -1.5px;
      border-radius: inherit;
      background: linear-gradient(135deg, #d4a853, #f3e7c4, #b8860b, #d4a853);
      background-size: 300% 300%;
      animation: goldSweep 6s ease infinite;
      z-index: -1;
      opacity: 0.75;
      filter: blur(1.5px);
    }
    .stage-3d-shadow {
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 168, 83, 0.15);
    }
    .hologram-line {
      position: absolute;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(212,168,83,0.9), transparent);
      animation: hologramScan 3.5s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

/* ─── Real High-Res Photography Presets (Images from repository) ─── */
interface InspirationPreset {
  id: string;
  title: string;
  category: string;
  icon: typeof Plane;
  image: string;
  prompt: string;
  model: ModelId;
  aspectRatio: string;
  imageSize: string;
  style: string;
  cameraSpecs: string;
}

const INSPIRATION_PRESETS: InspirationPreset[] = [
  {
    id: "global7500-sovereign",
    title: "Bombardier Global 7500 Sovereign Cabin",
    category: "Private Aviation",
    icon: Plane,
    image: "/images/GEN013801.jpg",
    prompt: "Ultra-luxury Bombardier Global 7500 private jet cabin at cruising altitude 45,000ft during golden hour sunset. Hand-stitched Hermès cream leather seats, warm indirect ambient floor lighting, polished Macassar ebony table with crystal champagne flute, panoramic oval windows showing orange horizon clouds, cinematic 8K photorealism.",
    model: "gpt-image-2.5-sunburst",
    aspectRatio: "16:9",
    imageSize: "1536x1024",
    style: "cinematic",
    cameraSpecs: "50mm ƒ/1.8 • 1/500s • ISO 100",
  },
  {
    id: "karnak-temple",
    title: "Karnak Temple Starlight Illumination",
    category: "Nile Sanctuary",
    icon: Compass,
    image: "/images/final_luxor_post.png",
    prompt: "Monolithic sandstone columns of Karnak Temple bathed in warm starlight and soft ground illumination at midnight. Quiet desert breeze, ancient hieroglyphics casting delicate shadows, violet night sky with the Milky Way visible, 35mm film grain, Architectural Digest quality.",
    model: "dall-e-3",
    aspectRatio: "16:9",
    imageSize: "1792x1024",
    style: "vivid",
    cameraSpecs: "35mm ƒ/2.8 • 1/250s • ISO 200",
  },
  {
    id: "superyacht-red-sea",
    title: "Red Sea Megayacht Anchorage",
    category: "Marine Charter",
    icon: Anchor,
    image: "/images/Regent-Seven-Seas-Voyager.jpg",
    prompt: "Sleek 75-meter custom megayacht anchored in a turquoise crystal lagoon in the northern Red Sea, Ras Mohammed. Teak aft deck with infinity jacuzzi, cantilevered sunbeds, sunbeams piercing through crystal clear azure water showing pristine coral reefs below, ultra high dynamic range, architectural drone perspective.",
    model: "nano-banana-pro",
    aspectRatio: "16:9",
    imageSize: "1792x1024",
    style: "natural",
    cameraSpecs: "24mm ƒ/4.0 • 1/1000s • ISO 64",
  },
  {
    id: "maldives-sanctuary",
    title: "Overwater Sovereign Villa Lagoon",
    category: "Island Retreat",
    icon: Flame,
    image: "/images/Four-Seasons-Hualalai-1.jpeg",
    prompt: "Private overwater sanctuary pavilion in the Maldives with private pool suspended above turquoise lagoon. Thatched roof architecture, seamless indoor-outdoor cedar decking, sunset glow bathing the ocean in violet and rose gold, ultra photorealistic, Architectural Digest cover quality.",
    model: "gpt-image-2.5-sunburst",
    aspectRatio: "3:2",
    imageSize: "1536x1024",
    style: "cinematic",
    cameraSpecs: "28mm ƒ/2.0 • 1/400s • ISO 100",
  },
  {
    id: "paris-vendome",
    title: "Place Vendôme Royal Suite at Dusk",
    category: "European Palaces",
    icon: Sparkles,
    image: "/images/final_paris_post.png",
    prompt: "Palatial 18th-century French penthouse suite overlooking Place Vendôme, Paris at twilight. Gold-leaf gilded moldings, crystal chandelier casting prismatic light, vintage champagne bucket with chilled Krug, Parisian zinc rooftops silhouetted in rose-blue sky, masterpiece photography.",
    model: "nano-banana-2",
    aspectRatio: "1:1",
    imageSize: "1024x1024",
    style: "dramatic",
    cameraSpecs: "14mm ƒ/1.4 • 25s • ISO 3200",
  },
  {
    id: "aswan-cataract",
    title: "Old Cataract Royal Suite Over Nile",
    category: "Historic Sanctuary",
    icon: Camera,
    image: "/images/final_aswan_post.png",
    prompt: "Historic Churchill Suite terrace overlooking the legendary pink granite boulders of the First Cataract of the Nile at Aswan. Sunset rays glowing through palm groves, private felucca sailing below with white sail billowing, warm tea service with silver teapot, timeless royal luxury.",
    model: "dall-e-3",
    aspectRatio: "16:9",
    imageSize: "1792x1024",
    style: "cinematic",
    cameraSpecs: "70mm ƒ/4.5 • 1/60s • ISO 400",
  },
];

/* ─── Model Type ─── */
type ModelId = "gpt-image-2.5-sunburst" | "dall-e-3" | "nano-banana" | "nano-banana-pro" | "nano-banana-2";

const AI_MODELS: Array<{
  id: ModelId;
  name: string;
  provider: string;
  icon: string;
  description: string;
  badge: string;
  badgeColor: string;
  creditCost: string;
  costLabel: string;
  tier: string;
}> = [
  {
    id: "gpt-image-2.5-sunburst",
    name: "GPT Image 2.5 Sunburst",
    provider: "OpenAI Cloudflare 4K",
    icon: "☀️",
    description: "Ultra photorealistic diffusion, supreme prompt fidelity, fine textiles & reflections",
    badge: "Sunburst 4K",
    badgeColor: "#F59E0B",
    creditCost: "2-3",
    costLabel: "credits",
    tier: "Masterpiece",
  },
  {
    id: "dall-e-3",
    name: "DALL-E 3 Studio",
    provider: "OpenAI Neural",
    icon: "🎨",
    description: "Premier aesthetic composition, complex prompt comprehension & cinematic lighting",
    badge: "Studio Pro",
    badgeColor: "#D4A853",
    creditCost: "2-3",
    costLabel: "credits",
    tier: "Flagship",
  },
  {
    id: "nano-banana-pro",
    name: "Banana Pro 4K",
    provider: "Gemini 3 Pro Diffusion",
    icon: "🌟",
    description: "Extreme 4K architectural resolution, precise typography, complex multi-subject layouts",
    badge: "Ultra 4K",
    badgeColor: "#A855F7",
    creditCost: "3",
    costLabel: "credits",
    tier: "Architect",
  },
  {
    id: "nano-banana-2",
    name: "Banana Flash 2",
    provider: "Gemini 3.1 Neural",
    icon: "⚡",
    description: "Ultra-low latency synthesis (1.2s), expansive 0.5K-4K dynamic scale",
    badge: "Lightning",
    badgeColor: "#3B82F6",
    creditCost: "2",
    costLabel: "credits",
    tier: "High-Speed",
  },
  {
    id: "nano-banana",
    name: "Nano Banana Standard",
    provider: "Gemini 2.5 Flash",
    icon: "🍌",
    description: "Instant ideation drafts, rapid concept explorations, minimal credit footprint",
    badge: "Draft",
    badgeColor: "#10B981",
    creditCost: "1",
    costLabel: "credit",
    tier: "Rapid",
  },
];

/* ─── Aspect Ratio / Size Options ─── */
const SUNBURST_SIZE_OPTIONS = [
  { value: "1536x1024", label: "Cinema 3:2", ratio: "3:2", credits: 3, icon: "▬", desc: "Classic Photography" },
  { value: "1024x1024", label: "Square 1:1", ratio: "1:1", credits: 2, icon: "⬜", desc: "Fine Art / Social" },
  { value: "1024x1536", label: "Portrait 2:3", ratio: "2:3", credits: 3, icon: "▮", desc: "Editorial Cover" },
];

const DALLE_SIZE_OPTIONS = [
  { value: "1792x1024", label: "Widescreen 16:9", ratio: "16:9", credits: 3, icon: "▬", desc: "Cinematic Film" },
  { value: "1024x1024", label: "Square 1:1", ratio: "1:1", credits: 2, icon: "⬜", desc: "Instagram & Portfolio" },
  { value: "1024x1792", label: "Vertical 9:16", ratio: "9:16", credits: 3, icon: "▮", desc: "Story & Mobile" },
];

const NANO_BANANA_PRO_SIZE_OPTIONS = [
  { value: "16:9", label: "Cinema 16:9", ratio: "16:9", credits: 3, icon: "▬", desc: "4K Panavision" },
  { value: "1:1", label: "Square 1:1", ratio: "1:1", credits: 3, icon: "⬜", desc: "4K Master" },
  { value: "9:16", label: "Vertical 9:16", ratio: "9:16", credits: 3, icon: "▮", desc: "Reels / TikTok" },
  { value: "4:3", label: "Standard 4:3", ratio: "4:3", credits: 3, icon: "📐", desc: "Medium Format" },
  { value: "3:4", label: "Portrait 3:4", ratio: "3:4", credits: 3, icon: "📏", desc: "Editorial" },
];

const NANO_BANANA_2_SIZE_OPTIONS = [
  { value: "16:9", label: "Cinema 16:9", ratio: "16:9", credits: 2, icon: "▬", desc: "Cinematic" },
  { value: "1:1", label: "Square 1:1", ratio: "1:1", credits: 2, icon: "⬜", desc: "Standard" },
  { value: "9:16", label: "Vertical 9:16", ratio: "9:16", credits: 2, icon: "▮", desc: "Story" },
  { value: "4:1", label: "Ultra-Wide 4:1", ratio: "4:1", credits: 2, icon: "🖥️", desc: "Panoramic Hero" },
];

const NANO_BANANA_SIZE_OPTIONS = [
  { value: "16:9", label: "Landscape", ratio: "16:9", credits: 1, icon: "▬", desc: "Landscape" },
  { value: "1:1", label: "Square", ratio: "1:1", credits: 1, icon: "⬜", desc: "Square" },
  { value: "9:16", label: "Portrait", ratio: "9:16", credits: 1, icon: "▮", desc: "Portrait" },
];

function getSizeOptions(model: ModelId) {
  switch (model) {
    case "gpt-image-2.5-sunburst": return SUNBURST_SIZE_OPTIONS;
    case "dall-e-3": return DALLE_SIZE_OPTIONS;
    case "nano-banana-pro": return NANO_BANANA_PRO_SIZE_OPTIONS;
    case "nano-banana-2": return NANO_BANANA_2_SIZE_OPTIONS;
    case "nano-banana": return NANO_BANANA_SIZE_OPTIONS;
  }
}

function getCreditCost(model: ModelId, imageSize: string, aspectRatio: string): number {
  if (model === "gpt-image-2.5-sunburst") {
    return SUNBURST_SIZE_OPTIONS.find((s) => s.value === imageSize)?.credits || 2;
  }
  if (model === "dall-e-3") {
    return DALLE_SIZE_OPTIONS.find((s) => s.value === imageSize)?.credits || 2;
  }
  const options = getSizeOptions(model);
  return options.find((s) => s.value === aspectRatio)?.credits || (model === "nano-banana-pro" ? 3 : model === "nano-banana-2" ? 2 : 1);
}

function isGeminiModel(model: ModelId): boolean {
  return model.startsWith("nano-banana");
}

function getModelLabel(model: ModelId): string {
  switch (model) {
    case "gpt-image-2.5-sunburst": return "GPT Image 2.5 Sunburst";
    case "dall-e-3": return "DALL-E 3";
    case "nano-banana-pro": return "Nano Banana Pro 4K";
    case "nano-banana-2": return "Nano Banana 2";
    case "nano-banana": return "Nano Banana";
  }
}

/* ─── Style Presets ─── */
const STYLE_PRESETS = [
  { id: "cinematic", label: "Cinematic 35mm", color: "#D4A853", dalleStyle: "vivid" as const, prefix: "cinematic 35mm film photography style, anamorphic bokeh, " },
  { id: "vivid", label: "Hyper-Luxe Vivid", color: "#F59E0B", dalleStyle: "vivid" as const, prefix: "vivid hyper-luxury editorial style, vibrant contrast, " },
  { id: "natural", label: "Documentary Raw", color: "#10B981", dalleStyle: "natural" as const, prefix: "documentary National Geographic style, natural ambient daylight, " },
  { id: "dramatic", label: "Chiaroscuro Noir", color: "#EC4899", dalleStyle: "vivid" as const, prefix: "dramatic chiaroscuro lighting, deep shadows, golden rim light, " },
  { id: "vintage", label: "Vintage Kodachrome", color: "#8B5CF6", dalleStyle: "natural" as const, prefix: "1970s Kodachrome archival photography style, warm organic grain, " },
];

export default function AIImageGenerator() {
  const { isAuthenticated, user } = useAuth();

  const { data: dbPresetsRaw } = trpc.siteSettings.get.useQuery({
    category: "ai_studio",
    key: "ai_presets",
  });
  const { data: dbModelsRaw } = trpc.siteSettings.get.useQuery({
    category: "ai_studio",
    key: "ai_models_config",
  });

  const inspirationPresets = useMemo(() => {
    if (dbPresetsRaw) {
      try {
        const parsed = JSON.parse(dbPresetsRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: any) => ({
            ...p,
            icon: Plane,
          }));
        }
      } catch {}
    }
    return INSPIRATION_PRESETS;
  }, [dbPresetsRaw]);

  const aiModels = useMemo(() => {
    if (dbModelsRaw) {
      try {
        const parsed = JSON.parse(dbModelsRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return AI_MODELS.map((m) => {
            const override = parsed.find((item: any) => item.id === m.id);
            if (override) {
              return { ...m, creditCost: override.creditCost || m.creditCost };
            }
            return m;
          });
        }
      } catch {}
    }
    return AI_MODELS;
  }, [dbModelsRaw]);

  const [prompt, setPrompt] = useState(INSPIRATION_PRESETS[0].prompt);
  const [selectedPreset, setSelectedPreset] = useState<InspirationPreset>(INSPIRATION_PRESETS[0]);
  const [selectedModel, setSelectedModel] = useState<ModelId>("gpt-image-2.5-sunburst");
  const [imageSize, setImageSize] = useState("1536x1024");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [selectedStyle, setSelectedStyle] = useState("cinematic");
  const [revisedPrompt, setRevisedPrompt] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);
  const [downloadFormat, setDownloadFormat] = useState<"png" | "jpg" | "webp">("png");
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    injectStudioStyles();
  }, []);

  const { data: credits } = trpc.aiStudio.getCredits.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: subscription } = trpc.aiStudio.getSubscription.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const generateMutation = trpc.aiStudio.generateImage.useMutation();
  const utils = trpc.useUtils();

  const addCreditsMutation = trpc.aiStudio.addCredits.useMutation({
    onSuccess: (data) => {
      toast.success(`تم شحن الرصيد بنجاح! الرصيد الحالي: ${data.balance}`);
      utils.aiStudio.getCredits.invalidate();
    },
    onError: (err) => {
      toast.error(`فشل شحن الرصيد: ${err.message}`);
    },
  });

  const handleAddAdminCredits = (amount = 1000) => {
    addCreditsMutation.mutate({ amount, reason: "bonus" });
  };

  const currentSizeOptions = getSizeOptions(selectedModel);
  const currentCost = getCreditCost(selectedModel, imageSize, aspectRatio);
  const currentStylePreset = STYLE_PRESETS.find((s) => s.id === selectedStyle);

  const applyInspirationPreset = (preset: InspirationPreset) => {
    setSelectedPreset(preset);
    setPrompt(preset.prompt);
    setSelectedModel(preset.model);
    setSelectedStyle(preset.style);
    if (isGeminiModel(preset.model)) {
      setAspectRatio(preset.aspectRatio as "16:9" | "1:1" | "9:16" | "4:3");
    } else {
      setImageSize(preset.imageSize);
    }
    toast.info(`Loaded "${preset.title}" preset & parameters!`);
  };

  const handleDownloadImage = async (url: string, format?: "png" | "jpg" | "webp") => {
    if (isDownloading) return;
    setIsDownloading(true);
    setShowFormatMenu(false);
    const fmt = format || downloadFormat;
    try {
      const baseName = `vanir-ai-${Date.now()}`;
      const proxyUrl = `/api/download-image?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(baseName)}&format=${fmt}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${baseName}.${fmt}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success(`Exported as ${fmt.toUpperCase()} in 4K clarity!`);
    } catch {
      toast.error("Failed to download image. Opening raw link instead.");
      window.open(url, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter or select a prompt to synthesize");
      return;
    }
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    const isAdmin = user?.role === "admin";
    if (!isAdmin && (!credits || parseFloat(credits.balance.toString()) < currentCost)) {
      toast.error("Insufficient credits. Please upgrade your tier.");
      return;
    }

    setIsGenerating(true);
    setRevisedPrompt(null);
    try {
      const stylePrefix = currentStylePreset?.prefix || "";
      const finalPrompt = stylePrefix + prompt.trim();
      const isGemini = isGeminiModel(selectedModel);

      const result = await generateMutation.mutateAsync({
        prompt: finalPrompt,
        model: selectedModel,
        size: !isGemini ? (imageSize as "1024x1024" | "1792x1024" | "1024x1792" | "1536x1024" | "1024x1536") : "1024x1024",
        style: currentStylePreset?.dalleStyle || "vivid",
        quality: !isGemini && currentCost >= 3 ? "hd" : "standard",
        aspectRatio: isGemini ? (aspectRatio as "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "1:4" | "4:1") : "1:1",
        creditCost: currentCost,
      });

      if (result.success && result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        setGenerationHistory((prev) => [result.imageUrl!, ...prev.slice(0, 7)]);
        if (result.revisedPrompt) {
          setRevisedPrompt(result.revisedPrompt);
        }
        toast.success("4K Masterpiece synthesized successfully!");
      }
      utils.aiStudio.getCredits.invalidate();
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Failed to synthesize image";
      toast.error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  // The active display image (either generated or active inspiration preview)
  const activeViewportImage = generatedImage || selectedPreset.image;
  const isShowingRealGenerated = !!generatedImage;

  return (
    <div className="min-h-screen bg-[#04060a] text-white selection:bg-[#d4a853] selection:text-black">
      <Navbar />
      <AISidebar />
      <PageMeta
        title="3D AI Photonic Studio | Ultra-Luxury Travel Visuals & Aviation Synthesis"
        description="Vanir 3D Photonic Diffusion Studio. Synthesize cinematic 4K aviation imagery, Pharaonic sanctuaries, and bespoke travel visuals with OpenAI & Google Gemini engines."
        keywords="AI travel image generator, luxury aviation AI art, 4K travel diffusion, Vanir 3D AI studio"
        canonicalPath="/ai-image-generator"
      />

      {/* Atmospheric Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <AmbientGlow position="top-left" size="lg" />
        <AmbientGlow position="bottom-right" size="md" />
        <GoldDustParticles count={22} />
      </div>

      {/* ─── 3D Visual Synthesis Header ─── */}
      <AI3DHeader
        variant="image"
        title="3D VISUAL SYNTHESIS LAB"
        subtitle="Prompt frontier photonic models to generate hyper-realistic 4K aviation & travel visuals."
        searchPlaceholder="Describe your visual (e.g., 'Gulfstream G650ER private stateroom over Swiss Alps at golden hour')..."
        onSearchSubmit={(promptText) => {
          setPrompt(promptText);
          handleGenerateImage();
          toast.success("Synthesizing 4K travel masterpiece...");
        }}
        ctaText="View Inspiration Gallery"
        ctaHref="#inspiration"
      />

      <main className="relative z-10 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* ─── INSPIRATION CAROUSEL: Real Photography Cards ─── */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Camera size={16} className="text-[#d4a853]" />
                <h2 className="text-sm font-semibold tracking-wider uppercase text-white/80">
                  Curated Sovereign Photography Presets
                </h2>
                <span className="text-[11px] text-white/40 hidden sm:inline">(Click any sanctuary to auto-populate prompt & model)</span>
              </div>
              <span className="text-xs text-[#d4a853] font-medium">6 Ultra-Luxe Benchmarks</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {inspirationPresets.map((preset) => {
                const isSelected = selectedPreset.id === preset.id && !generatedImage;
                const IconComp = preset.icon;
                return (
                  <motion.button
                    key={preset.id}
                    onClick={() => applyInspirationPreset(preset)}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative text-left rounded-xl overflow-hidden border transition-all duration-300 ${
                      isSelected
                        ? "border-[#d4a853] shadow-lg shadow-[#d4a853]/20 ring-1 ring-[#d4a853]"
                        : "border-white/10 hover:border-[#d4a853]/50 bg-white/[0.02]"
                    }`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-black/60">
                      <img
                        src={preset.image}
                        alt={preset.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-medium text-[#d4a853] border border-[#d4a853]/30 flex items-center gap-1">
                        <IconComp size={9} />
                        {preset.category}
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 bg-[#d4a853] text-black p-0.5 rounded-full">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 bg-[#0a0d14]/90">
                      <h3 className="text-xs font-semibold text-white group-hover:text-[#d4a853] transition-colors truncate">
                        {preset.title}
                      </h3>
                      <p className="text-[10px] text-white/40 mt-0.5 truncate">{preset.cameraSpecs}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ─── MAIN 2-COLUMN STUDIO WORKBENCH ─── */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">

            {/* ─── LEFT: CONTROLS & SYNTHESIS PARAMETERS (7 cols) ─── */}
            <div className="lg:col-span-7 space-y-6">

              {/* 1. Prompt Command Console */}
              <div className="rounded-2xl border border-white/10 bg-[#070a10]/80 backdrop-blur-xl p-5 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Wand2 size={16} className="text-[#d4a853]" />
                    <span className="text-sm font-semibold text-white/90">Prompt Command & Direction</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span>{prompt.length} chars</span>
                    {prompt && (
                      <button
                        onClick={() => setPrompt("")}
                        className="text-white/40 hover:text-white px-2 py-0.5 rounded bg-white/5 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative rounded-xl border border-white/10 bg-black/60 p-3 focus-within:border-[#d4a853] transition-colors">
                  <textarea
                    ref={promptRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your desired ultra-luxury travel, private aviation, or sanctuary scene..."
                    rows={4}
                    className="w-full bg-transparent text-white placeholder:text-white/25 resize-none focus:outline-none text-sm leading-relaxed"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleGenerateImage();
                      }
                    }}
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-white/40">
                    <span className="flex items-center gap-1">
                      <Zap size={11} className="text-[#d4a853]" /> Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-[10px]">Ctrl+Enter</kbd> to execute
                    </span>
                    <button
                      onClick={() => setPrompt(INSPIRATION_PRESETS[Math.floor(Math.random() * INSPIRATION_PRESETS.length)].prompt)}
                      className="text-[#d4a853] hover:underline inline-flex items-center gap-1"
                    >
                      <RefreshCw size={10} /> Randomize Prompt
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Frontier Neural Model Selection (3D Bevel Cards) */}
              <div className="rounded-2xl border border-white/10 bg-[#070a10]/80 backdrop-blur-xl p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sliders size={16} className="text-[#d4a853]" />
                    <span className="text-sm font-semibold text-white/90">Frontier Neural Engine</span>
                  </div>
                  <span className="text-xs text-white/40 font-mono">OpenAI & Gemini Multi-Modal</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {aiModels.map((model) => {
                    const isSelected = selectedModel === model.id;
                    return (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => {
                          setSelectedModel(model.id);
                          if (isGeminiModel(model.id)) {
                            setAspectRatio("16:9");
                          } else if (model.id === "gpt-image-2.5-sunburst") {
                            setImageSize("1536x1024");
                          } else {
                            setImageSize("1792x1024");
                          }
                        }}
                        className={`relative text-left p-3.5 rounded-xl border transition-all duration-300 ${
                          isSelected
                            ? "border-[#d4a853] bg-gradient-to-br from-[#d4a853]/15 to-[#d4a853]/5 shadow-lg shadow-[#d4a853]/15"
                            : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{model.icon}</span>
                            <div>
                              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                                {model.name}
                                <span
                                  className="text-[9px] font-bold px-1.5 py-0.2 rounded"
                                  style={{ background: `${model.badgeColor}25`, color: model.badgeColor }}
                                >
                                  {model.badge}
                                </span>
                              </div>
                              <div className="text-[10px] text-white/40">{model.provider}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-[#d4a853]">{model.creditCost}</span>
                            <span className="text-[9px] text-white/40 block">credits</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-white/50 mt-2 line-clamp-2 leading-tight">
                          {model.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Style Alchemy Presets */}
              <div className="rounded-2xl border border-white/10 bg-[#070a10]/80 backdrop-blur-xl p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Palette size={16} className="text-[#d4a853]" />
                    <span className="text-sm font-semibold text-white/90">Visual Aesthetics & Grading</span>
                  </div>
                  <span className="text-xs text-white/40">Atmospheric Tone</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {STYLE_PRESETS.map((st) => {
                    const isSelected = selectedStyle === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSelectedStyle(st.id)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium text-center transition-all ${
                          isSelected
                            ? "bg-[#d4a853] text-black font-semibold shadow-md shadow-[#d4a853]/20"
                            : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/5"
                        }`}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Aspect Ratio & Resolution Frames */}
              <div className="rounded-2xl border border-white/10 bg-[#070a10]/80 backdrop-blur-xl p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-[#d4a853]" />
                    <span className="text-sm font-semibold text-white/90">
                      {isGeminiModel(selectedModel) ? "Spatial Aspect Ratio" : "Resolution & Canvas Ratio"}
                    </span>
                  </div>
                  <span className="text-xs text-white/40">
                    Active: {isGeminiModel(selectedModel) ? aspectRatio : imageSize}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {currentSizeOptions.map((opt) => {
                    const isSelected = isGeminiModel(selectedModel)
                      ? aspectRatio === opt.value
                      : imageSize === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          if (isGeminiModel(selectedModel)) {
                            setAspectRatio(opt.value);
                          } else {
                            setImageSize(opt.value);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-[#d4a853] bg-[#d4a853]/10 ring-1 ring-[#d4a853]/40"
                            : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{opt.icon}</span>
                          <span className="text-[10px] font-semibold text-[#d4a853] bg-[#d4a853]/15 px-1.5 py-0.5 rounded">
                            {opt.credits} cr
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-white mt-1.5">{opt.label}</div>
                        <div className="text-[10px] text-white/40">{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Synthesis Action & Cost Summary Bar */}
              <div className="rounded-2xl border border-[#d4a853]/40 bg-gradient-to-b from-[#0e121c] to-[#080b12] p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#d4a853]/15 border border-[#d4a853]/30 flex items-center justify-center">
                      <Coins size={18} className="text-[#d4a853]" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-white/40 font-semibold">Synthesis Cost</div>
                      <div className="text-sm font-semibold text-white">
                        {getModelLabel(selectedModel)} • <span className="text-[#d4a853]">{currentCost} Credit{currentCost > 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {isAuthenticated ? (
                      <div>
                        <div className="text-xs text-white/50">Your Balance</div>
                        <div className="text-base font-bold text-white">
                          {user?.role === "admin" ? (
                            <span className="text-[#d4a853]">Admin Unlimited ({parseFloat(credits?.balance || "0").toFixed(0)})</span>
                          ) : (
                            `${parseFloat(credits?.balance || "0").toFixed(0)} Credits`
                          )}
                        </div>
                      </div>
                    ) : (
                      <Link href={getLoginUrl()}>
                        <span className="text-xs text-[#d4a853] hover:underline cursor-pointer">
                          Sign in to view credits
                        </span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Main Synthesis Trigger */}
                <motion.button
                  onClick={handleGenerateImage}
                  disabled={isGenerating || !prompt.trim()}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 transition-all duration-300 shadow-xl ${
                    isGenerating
                      ? "bg-white/10 text-white/50 cursor-wait"
                      : prompt.trim()
                      ? "bg-gradient-to-r from-[#d4a853] via-[#f3e7c4] to-[#b8860b] text-[#050608] hover:shadow-2xl hover:shadow-[#d4a853]/25 cursor-pointer"
                      : "bg-white/10 text-white/30 cursor-not-allowed"
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-[#d4a853]" />
                      <span>Synthesizing Photonic 4K Diffusion...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Synthesize 4K Masterpiece</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>

                {/* Admin Quick Recharge */}
                {user?.role === "admin" && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-white/40">Admin Controls:</span>
                    <button
                      type="button"
                      onClick={() => handleAddAdminCredits(1000)}
                      disabled={addCreditsMutation.isPending}
                      className="text-[#d4a853] hover:text-[#f3e7c4] font-medium inline-flex items-center gap-1 transition-colors"
                    >
                      <Sparkles size={11} />
                      {addCreditsMutation.isPending ? "Recharging..." : "Quick Top-Up (+1,000 Credits)"}
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* ─── RIGHT: 3D HOLOGRAPHIC VIEWPORT & MASTERPIECE CANVAS (5 cols) ─── */}
            <div className="lg:col-span-5 space-y-6">

              {/* 3D Masterpiece Hologram Viewport */}
              <div className="studio-perspective">
                <div className="card-3d-tilt rounded-2xl border border-white/15 bg-gradient-to-b from-[#0b0e17] to-[#04060a] p-4 stage-3d-shadow relative overflow-hidden">
                  {/* Subtle 3D Laser Grid at Bottom */}
                  <div
                    className="absolute bottom-0 inset-x-0 h-28 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage: "linear-gradient(to right, #d4a853 1px, transparent 1px), linear-gradient(to bottom, #d4a853 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                      transform: "perspective(300px) rotateX(65deg)",
                    }}
                  />

                  {/* Header Status of Viewport */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isShowingRealGenerated ? "bg-emerald-400 animate-pulse" : "bg-[#d4a853]"}`} />
                      <span className="font-semibold text-white/90">
                        {isShowingRealGenerated ? "Synthesized 4K Canvas" : "Preset Preview & Reference"}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-[#d4a853] bg-[#d4a853]/10 px-2 py-0.5 rounded border border-[#d4a853]/20">
                      {isShowingRealGenerated ? "100% Fidelity Render" : selectedPreset.cameraSpecs}
                    </span>
                  </div>

                  {/* The Image Display */}
                  <div
                    className="relative group cursor-pointer rounded-xl overflow-hidden bg-black/80 border border-white/10"
                    onClick={() => setShowLightbox(true)}
                  >
                    <img
                      src={activeViewportImage}
                      alt="AI Viewport"
                      className="w-full h-auto max-h-[520px] object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Scanline Effect during Generation */}
                    {isGenerating && <div className="hologram-line" />}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <div className="bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-medium text-white flex items-center gap-1.5 border border-white/20">
                        <Maximize2 size={13} className="text-[#d4a853]" />
                        Expand Lightbox View
                      </div>
                    </div>

                    {!isShowingRealGenerated && (
                      <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md p-2.5 rounded-lg border border-white/10 text-[11px]">
                        <div className="font-semibold text-[#d4a853] flex items-center gap-1.5">
                          <Eye size={12} /> {selectedPreset.title}
                        </div>
                        <p className="text-white/60 line-clamp-1 mt-0.5">{selectedPreset.prompt}</p>
                      </div>
                    )}
                  </div>

                  {/* AI Revised Prompt (if returned) */}
                  {revisedPrompt && (
                    <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
                      <div className="text-[10px] uppercase font-semibold text-[#d4a853] tracking-wider mb-1">
                        Neural Model Revised Prompt:
                      </div>
                      <p className="text-white/60 line-clamp-3 leading-relaxed">{revisedPrompt}</p>
                    </div>
                  )}

                  {/* Canvas Operations: Download / Share / Reset */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                    <div className="relative flex-1 flex">
                      <button
                        onClick={() => handleDownloadImage(activeViewportImage)}
                        disabled={isDownloading}
                        className="flex-1 py-2.5 rounded-l-xl bg-[#d4a853]/15 hover:bg-[#d4a853]/25 text-[#d4a853] border border-[#d4a853]/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>Exporting...</span>
                          </>
                        ) : (
                          <>
                            <Download size={13} />
                            <span>Export {downloadFormat.toUpperCase()}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setShowFormatMenu(!showFormatMenu)}
                        className="py-2.5 px-2.5 rounded-r-xl bg-[#d4a853]/15 hover:bg-[#d4a853]/25 text-[#d4a853] border-y border-r border-[#d4a853]/30 text-xs transition-colors"
                        title="Choose format"
                      >
                        <ChevronDown size={13} className={`transition-transform ${showFormatMenu ? "rotate-180" : ""}`} />
                      </button>

                      {/* Format Menu Popup */}
                      <AnimatePresence>
                        {showFormatMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute bottom-full left-0 right-0 mb-1 rounded-xl overflow-hidden z-30 border border-white/15 bg-[#0a0d14]/95 backdrop-blur-2xl shadow-2xl p-1"
                          >
                            {(["png", "jpg", "webp"] as const).map((fmt) => (
                              <button
                                key={fmt}
                                onClick={() => {
                                  setDownloadFormat(fmt);
                                  setShowFormatMenu(false);
                                  handleDownloadImage(activeViewportImage, fmt);
                                }}
                                className={`w-full px-3 py-2 text-left rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                                  downloadFormat === fmt ? "bg-[#d4a853]/20 text-[#d4a853]" : "text-white/70 hover:bg-white/5"
                                }`}
                              >
                                <span className="uppercase">{fmt} Studio</span>
                                {downloadFormat === fmt && <Check size={12} className="text-[#d4a853]" />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(activeViewportImage);
                        toast.success("Image URL copied to clipboard!");
                      }}
                      className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                      title="Copy URL"
                    >
                      <Copy size={14} />
                    </button>

                    {isShowingRealGenerated && (
                      <button
                        onClick={() => {
                          setGeneratedImage(null);
                          setRevisedPrompt(null);
                          toast.info("Returned to reference presets");
                        }}
                        className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                        title="Return to presets"
                      >
                        <RefreshCw size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Generation History Roll */}
              {generationHistory.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-[#070a10]/80 backdrop-blur-xl p-4 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                      <ImageIcon size={13} className="text-[#d4a853]" /> Recent Session Generations
                    </span>
                    <span className="text-[11px] text-white/40">{generationHistory.length} creations</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {generationHistory.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setGeneratedImage(img);
                          setShowLightbox(true);
                        }}
                        className="aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-[#d4a853] transition-all bg-black"
                      >
                        <img src={img} alt={`Session ${i}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pro Studio Tips */}
              <div className="rounded-2xl border border-white/10 bg-[#070a10]/80 backdrop-blur-xl p-4 shadow-xl text-xs space-y-2.5">
                <div className="font-semibold text-white/90 flex items-center gap-1.5">
                  <Info size={13} className="text-[#d4a853]" /> Sovereign Prompt Engineering Guidelines
                </div>
                <ul className="space-y-1.5 text-white/50 text-[11px] leading-relaxed">
                  <li>• <strong className="text-white/80">Aperture & Lens:</strong> Specify "Hasselblad H6D-100c, 50mm ƒ/1.8" for genuine medium format depth.</li>
                  <li>• <strong className="text-white/80">Lighting Physics:</strong> Use "Indirect golden hour sunset, soft cabin floor lighting, volumetric dust rays".</li>
                  <li>• <strong className="text-white/80">Atmospheric Context:</strong> State specific altitudes ("Cruising at FL450", "Nile twilight haze").</li>
                </ul>
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* ─── Lightbox Modal ─── */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4"
            onClick={() => setShowLightbox(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeViewportImage}
                alt="Enlarged"
                className="max-w-full max-h-[80vh] object-contain rounded-xl border border-white/20 shadow-2xl"
              />
              <button
                onClick={() => setShowLightbox(false)}
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => handleDownloadImage(activeViewportImage)}
                  className="px-5 py-2.5 rounded-xl bg-[#d4a853] text-black text-xs font-bold flex items-center gap-2 hover:bg-[#f3e7c4] transition-colors"
                >
                  <Download size={14} /> Download 4K Masterpiece
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeViewportImage);
                    toast.success("Image URL copied!");
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-medium flex items-center gap-2 hover:bg-white/20 transition-colors"
                >
                  <Copy size={14} /> Copy Link
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
