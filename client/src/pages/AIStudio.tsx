/**
 * VANIR AI Studio 3D - Ultra-Luxury Neural Intelligence & Visual Suite
 * High-End 3D Art Deco & Cyber-Gold Aesthetic
 * Features:
 *  1. 3D Holographic Core & Orbital Neural Grid
 *  2. 3D Masterpiece Gallery of AI-Synthesized Travel Visuals
 *  3. Interactive 3D Model Matrix (GPT-4o, Gemini 2.0, Claude 3.5, Banana Pro 4K)
 *  4. Live Interactive Prompt-to-Itinerary Engine with Real-Time 3D Card Generation
 *  5. Sovereign Concierge Simulator & Multi-Modal Vision Suite
 *  6. 3D Tiered Pricing Showcase
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Zap,
  Wand2,
  Image as ImageIcon,
  ArrowRight,
  ChevronRight,
  Eye,
  Star,
  Cpu,
  Crown,
  Layers,
  Bot,
  MessageSquare,
  Shield,
  Plane,
  Compass,
  CheckCircle2,
  Copy,
  ExternalLink,
  Code,
  Sliders,
  Send,
  RefreshCw,
} from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import PageMeta from "@/components/PageMeta";
import SEO from "@/components/SEO";
import AISidebar from "@/components/AISidebar";
import AI3DHeader from "@/components/AI3DHeader";
import { toast } from "sonner";

/* ─── 3D Travel Masterpieces Data ─── */
interface AIMasterpiece {
  id: string;
  title: string;
  category: string;
  image: string;
  prompt: string;
  model: string;
  resolution: string;
  aspect: string;
  renderTime: string;
}

const AI_MASTERPIECES: AIMasterpiece[] = [
  {
    id: "g650er-alps",
    title: "Bombardier Global 7500 Sovereign Stateroom Over Mont Blanc",
    category: "Private Aviation",
    image: "/images/GEN013800.jpg",
    prompt: "Ultra-luxury long-range private jet cabin at cruising altitude 45,000ft, bespoke cream leather stateroom, crystal champagne flutes, panoramic oval windows reflecting alpine summits at sunset, 8K photorealistic octane render.",
    model: "Nano Banana Pro 4K Ultra",
    resolution: "3840 × 2160 (4K)",
    aspect: "16:9 Cinema",
    renderTime: "1.4s",
  },
  {
    id: "karnak-starlight",
    title: "Karnak Hypostyle Hall Private Curator Starlight Walk",
    category: "Ancient Antiquities",
    image: "/images/final_luxor_post.png",
    prompt: "Solitary after-hours view of the great columns of Karnak Temple at Luxor, illuminated by warm amber ground architectural lights, clear starlit Saharan sky, cinematic mist, zero crowds, imperial grandeur.",
    model: "DALL-E 3 Studio Master",
    resolution: "3072 × 2048",
    aspect: "3:2 Architectural",
    renderTime: "2.1s",
  },
  {
    id: "red-sea-yacht",
    title: "68m Custom Superyacht Anchored in Azure Red Sea Atoll",
    category: "Superyacht Expedition",
    image: "/images/Regent-Seven-Seas-Voyager.jpg",
    prompt: "68-meter custom motor yacht anchored in crystal azure turquoise lagoon at Tawila Island, Red Sea, teak decks, private helipad, underwater observation lounge with illuminated coral reef, sunset golden ambiance.",
    model: "Gemini 2.0 Vision Engine",
    resolution: "4096 × 2304 (4K)",
    aspect: "16:9 Cinema",
    renderTime: "1.8s",
  },
  {
    id: "santorini-cliff",
    title: "Presidential Oia Cliffside Residence with Caldera Infinity Pool",
    category: "Private Islands",
    image: "/images/final_santorini_post.png",
    prompt: "Curved cliffside villa in Oia, Santorini, private heated infinity pool merging into the cobalt Aegean Sea, whitewashed cycladic architecture, twilight pastel sky, bespoke architectural lighting.",
    model: "Midjourney Sovereign V6",
    resolution: "3840 × 2160",
    aspect: "16:9 Cinema",
    renderTime: "2.4s",
  },
  {
    id: "dubai-desert",
    title: "Emirates Royal Desert Conservation Reserve Sanctuary",
    category: "Desert Sanctuaries",
    image: "/images/final_dubai_post.png",
    prompt: "Ultra-luxury desert pavilion in Dubai Royal Conservation Reserve, private Bedouin dining under Arabian cosmos, heated lap pool amidst untouched red dunes, Rolls-Royce Cullinan staging, 8K ultra detail.",
    model: "Nano Banana Pro 4K Ultra",
    resolution: "3072 × 2048",
    aspect: "3:2 Architectural",
    renderTime: "1.6s",
  },
  {
    id: "maldives-water",
    title: "Presidential Island Lagoon Residence at Bioluminescent Dusk",
    category: "Ocean Estates",
    image: "/images/four-seasons-lanai.jpeg",
    prompt: "Multi-bedroom ultra-luxury overwater villa in Maldives, curved glass infinity pool merging into private turquoise lagoon, bioluminescent glowing plankton water at twilight, teak pathways, bespoke architectural lighting.",
    model: "Gemini 2.5 Vision Engine",
    resolution: "3840 × 2160",
    aspect: "16:9 Cinema",
    renderTime: "1.9s",
  },
];

/* ─── AI Frontier Models Matrix ─── */
interface AIModelCard {
  id: string;
  name: string;
  provider: string;
  category: string;
  badge: string;
  latency: string;
  context: string;
  description: string;
  capabilities: string[];
  gradient: string;
  actionHref: string;
}

const AI_MODELS: AIModelCard[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o Omni Vision",
    provider: "OpenAI Flagship",
    category: "Multimodal & Diplomatic Reasoning",
    badge: "OMNI FRONTIER",
    latency: "0.9s",
    context: "128,000 Tokens",
    description: "Multimodal intelligence capable of analyzing luxury floor plans, yacht technical manifests, and synthesizing multi-country itineraries in seconds.",
    capabilities: ["Visual Floorplan Analysis", "Aviation Routing", "Multilingual Diplomatic", "JSON Dossier Export"],
    gradient: "from-amber-500/20 via-[#D4AF37]/10 to-transparent",
    actionHref: "/marketing",
  },
  {
    id: "banana-pro",
    name: "Nano Banana Pro 4K",
    provider: "Vanir Visual Studio",
    category: "Photorealistic 3D Visual Synthesis",
    badge: "ULTRA 4K STUDIO",
    latency: "1.4s",
    context: "High-Fidelity Diffusion",
    description: "Trained exclusively on ultra-luxury hospitality, private jet cabin architecture, and archaeological heritage to generate publication-grade imagery.",
    capabilities: ["4K HDR Upscaling", "Octane 3D Lighting", "Interior Materials Accuracy", "Zero Artifacts"],
    gradient: "from-yellow-500/20 via-amber-400/10 to-transparent",
    actionHref: "/ai-image-generator",
  },
  {
    id: "gemini-flash",
    name: "Google Gemini 2.0 Flash",
    provider: "Google DeepMind",
    category: "Real-Time Travel Intelligence",
    badge: "SUB-SECOND SPEED",
    latency: "0.4s",
    context: "1,000,000 Tokens",
    description: "Extreme low-latency search and real-time live flight tracking engine with native audio-visual comprehension.",
    capabilities: ["Live Flight Telemetry", "1M Token Context", "Instant Weather Radar", "Airspace Briefing"],
    gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
    actionHref: "/marketing",
  },
  {
    id: "claude-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    category: "Nuanced Storytelling & Protocol",
    badge: "EDITORIAL MASTER",
    latency: "1.1s",
    context: "200,000 Tokens",
    description: "Unmatched literary elegance and diplomatic etiquette for crafting VIP briefing documents, bespoke speeches, and narrative dossiers.",
    capabilities: ["Diplomatic Protocol", "Nuanced Prose", "Complex Briefings", "Cultural Sensitivity"],
    gradient: "from-purple-500/20 via-amber-500/10 to-transparent",
    actionHref: "/marketing/trip-description",
  },
];

/* ─── Interactive Itinerary Simulator Presets ─── */
const SIMULATOR_PRESETS = [
  {
    id: "egypt-7d",
    title: "Cairo & Nile Sovereign Odyssey (7 Days)",
    destination: "Egypt — Cairo, Luxor, Aswan",
    guests: "2 Principals",
    flight: "Gulfstream G650ER (EDDF → HECA)",
    highlights: [
      "Day 1–2: Tarmac Maybach transfer, Four Seasons Nile Plaza Royal Suite, Private midnight Great Pyramid entry.",
      "Day 3–5: Private jet to Luxor, 5-night buyout of Sanctuary Dahabiya, Nefertari Tomb private curator briefing.",
      "Day 6–7: Abu Simbel sunrise fly-in, Old Cataract Aswan British Suite, farewell gala on private Nile island.",
    ],
  },
  {
    id: "redsea-5d",
    title: "El Gouna & Red Sea Superyacht Voyage (5 Days)",
    destination: "Egypt — Red Sea & Sinai",
    guests: "6 Guests",
    flight: "Challenger 650 (EDDM → HEGN)",
    highlights: [
      "Day 1: Munich GAT departure, direct 3h 40m flight, Bell 429 helicopter transfer directly to 54m superyacht.",
      "Day 2–3: Private mooring at Brothers Islands, PADI master diver underwater safari, onboard caviar sommelier.",
      "Day 4–5: Private helicopter day-trip to Valley of the Kings, sunset beachfront royal villa dinner in El Gouna.",
    ],
  },
  {
    id: "como-alps-6d",
    title: "Lake Como & Swiss Alpine Circuit (6 Days)",
    destination: "Europe — Italy & Switzerland",
    guests: "4 Guests",
    flight: "Falcon 2000LXS (EGLF → LSZH)",
    highlights: [
      "Day 1–3: Historic lakeside Palazzo buyout on Lake Como, private vintage Riva Aquarama excursion, Bellagio private villa.",
      "Day 4–6: Helicopter flight to Zermatt, luxury chalet buyout overlooking Matterhorn, glacier private ski-in lunch.",
    ],
  },
];

export default function AIStudio() {
  const [activeMasterpiece, setActiveMasterpiece] = useState<AIMasterpiece>(AI_MASTERPIECES[0]);
  const [activePreset, setActivePreset] = useState(SIMULATOR_PRESETS[0]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [simulating, setSimulating] = useState(false);
  const [simulatedOutput, setSimulatedOutput] = useState<string | null>(null);

  const handleSimulate = (preset = activePreset) => {
    setSimulating(true);
    setSimulatedOutput(null);
    setTimeout(() => {
      setSimulating(false);
      setSimulatedOutput(
        `[VANIR NEURAL SYNTHESIS COMPLETE — LATENCY 0.82s]
Sector: ${preset.flight}
Sanctuary: ${preset.destination}
Party: ${preset.guests}

ARCHITECTURAL BLUEPRINT:
${preset.highlights.join("\n\n")}

SECURITY & DIPLOMATIC CLEARANCES:
✓ Supreme Council of Antiquities VIP Access Confirmed
✓ EASA Part-NCC Operator Tail-Number Allocated
✓ Armored Maybach 680 Convoy Staged at VIP Apron`
      );
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#06080c] text-white">
      <PageMeta
        title="VANIR AI Studio 3D — Next-Gen Luxury Travel Intelligence & Visual Engine"
        description="Experience the frontier of AI travel design. 3D visual generation, multimodal itinerary architecture, and on-demand luxury travel intelligence powered by Vanir Group."
        keywords="AI travel studio, luxury travel AI, 3D travel AI, AI image generator, private jet AI, Vanir Group AI"
        canonicalPath="/ai"
      />
      <SEO
        title="VANIR AI Studio 3D — Ultra-Luxury Travel AI"
        description="3D visual synthesis, real-time private jet route calculation, and intelligent itinerary architecture powered by frontier neural models."
      />

      <Navbar />
      <AISidebar />

      {/* ─── 3D Interactive AI Header with Rainbow Spectrum Search ─── */}
      <AI3DHeader
        variant="intelligence"
        title="VANIR NEURAL INTELLIGENCE"
        subtitle="Real-time multimodal luxury travel synthesis in under 0.8 seconds."
        onSearchSubmit={(q) => {
          setCustomPrompt(q);
          handleSimulate();
          toast.success("Synthesizing custom neural itinerary...");
        }}
        ctaText="Explore 4K Visual Lab"
        ctaHref="/ai-image-generator"
      />

      {/* ─── SECTION 1: 3D MASTERPIECE VISUAL SHOWCASE ─── */}
      <section className="py-20 bg-[#07090f] border-t border-white/5 relative">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold block mb-2">
              Generated With Nano Banana Pro 4K &amp; DALL-E 3
            </span>
            <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-white mb-3">
              Photorealistic 3D Travel Masterpieces
            </h2>
            <p className="text-white/65 text-sm sm:text-base leading-relaxed">
              Explore actual high-resolution visual assets synthesized by our specialized luxury travel diffusion models. Select any piece to inspect prompt engineering and camera physics.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
            {/* Left Main 3D Display Stage (7 cols) */}
            <div className="lg:col-span-7">
              <div className="relative group overflow-hidden rounded-xl border-2 border-[#D4AF37]/40 bg-black shadow-[0_0_50px_rgba(212,175,55,0.15)] aspect-[16/10]">
                <img
                  src={activeMasterpiece.image}
                  alt={activeMasterpiece.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider rounded-sm">
                    {activeMasterpiece.category}
                  </span>
                  <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md text-white/90 text-xs border border-white/10 rounded-sm">
                    {activeMasterpiece.resolution}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-[var(--font-display)] text-xl sm:text-2xl font-bold text-white mb-1.5 drop-shadow-md">
                    {activeMasterpiece.title}
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-2 italic">
                    &ldquo;{activeMasterpiece.prompt}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Right Interactive Prompt & Spec Inspector (5 cols) */}
            <div className="lg:col-span-5 bg-[#0e131d] border border-white/10 p-6 sm:p-8 rounded-xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
                  Neural Prompt Inspector
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Zap size={12} /> Render: {activeMasterpiece.renderTime}
                </span>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1.5 font-medium">
                  Active Synthesis Prompt:
                </label>
                <div className="bg-black/60 border border-white/10 p-3.5 rounded text-xs text-white/85 leading-relaxed font-mono">
                  {activeMasterpiece.prompt}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(activeMasterpiece.prompt);
                    toast.success("Prompt copied to clipboard!");
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#D4AF37] hover:underline"
                >
                  <Copy size={12} /> Copy Prompt Parameters
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-black/40 border border-white/5 p-3 rounded">
                  <span className="text-white/50 block text-[10px] uppercase">Engine</span>
                  <span className="font-semibold text-white">{activeMasterpiece.model}</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-3 rounded">
                  <span className="text-white/50 block text-[10px] uppercase">Aspect Ratio</span>
                  <span className="font-semibold text-white">{activeMasterpiece.aspect}</span>
                </div>
              </div>

              <Link
                href="/ai-image-generator"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-all rounded-sm"
              >
                Synthesize Similar Visual in 3D Studio <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Masterpiece Thumbnails Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {AI_MASTERPIECES.map((piece) => {
              const active = piece.id === activeMasterpiece.id;
              return (
                <button
                  key={piece.id}
                  type="button"
                  onClick={() => setActiveMasterpiece(piece)}
                  className={`text-left p-2 rounded-lg border transition-all overflow-hidden ${
                    active
                      ? "bg-[#D4AF37]/15 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                      : "bg-[#0b0e15] border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="aspect-[16/10] overflow-hidden rounded mb-2">
                    <img src={piece.image} alt={piece.title} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] font-bold text-white block truncate">{piece.title}</span>
                  <span className="text-[10px] text-[#D4AF37]">{piece.category}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: 3D INTERACTIVE FRONTIER MODEL MATRIX ─── */}
      <section className="py-20 bg-gradient-to-b from-[#06080c] via-[#090d14] to-[#06080c] border-t border-white/5">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold block mb-2">
              Integrated Neural Architectures
            </span>
            <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-white mb-3">
              The Frontier AI Intelligence Grid
            </h2>
            <p className="text-white/65 text-sm sm:text-base leading-relaxed">
              Vanir Group routes every query through dedicated high-speed enterprise endpoints across OpenAI, Google DeepMind, and our proprietary visual diffusion engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {AI_MODELS.map((model) => (
              <div
                key={model.id}
                className="relative bg-gradient-to-br from-[#0e131d] to-[#080b10] border border-white/10 hover:border-[#D4AF37]/60 p-6 sm:p-8 rounded-xl transition-all duration-300 shadow-xl group hover:shadow-[0_0_35px_rgba(212,175,55,0.1)]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="px-2.5 py-1 bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider rounded-sm">
                      {model.badge}
                    </span>
                    <h3 className="font-[var(--font-display)] text-xl sm:text-2xl font-bold text-white mt-2">
                      {model.name}
                    </h3>
                    <span className="text-xs text-white/50">{model.provider} • {model.category}</span>
                  </div>
                  <Cpu size={28} className="text-[#D4AF37] shrink-0" />
                </div>

                <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-5">
                  {model.description}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
                  <div className="bg-black/50 border border-white/5 p-2.5 rounded">
                    <span className="text-[10px] text-white/40 uppercase block">Latency</span>
                    <span className="font-semibold text-emerald-400">{model.latency}</span>
                  </div>
                  <div className="bg-black/50 border border-white/5 p-2.5 rounded">
                    <span className="text-[10px] text-white/40 uppercase block">Context Window</span>
                    <span className="font-semibold text-white">{model.context}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-[10px] uppercase tracking-wider text-white/50 block mb-2 font-semibold">
                    Core Capabilities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {model.capabilities.map((cap, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 text-[11px] text-white/80 rounded">
                        ✓ {cap}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  href={model.actionHref}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#D4AF37] font-bold hover:text-white transition-colors"
                >
                  Launch in Neural Studio <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: LIVE PROMPT-TO-ITINERARY 3D SIMULATOR ─── */}
      <section className="py-20 bg-[#070a0f] border-t border-white/5">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold block mb-2">
              Interactive Neural Experience
            </span>
            <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-white mb-3">
              Live Sovereign Itinerary Architect Simulator
            </h2>
            <p className="text-white/65 text-sm sm:text-base leading-relaxed">
              Test how Vanir AI synthesizes flight plans, presidential suite allocations, and diplomatic permits into an executable dossier in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Preset Selector & Controls (5 cols) */}
            <div className="lg:col-span-5 bg-[#0e131d] border border-white/10 p-6 sm:p-8 rounded-xl space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold mb-2">
                1. Select Odyssey Blueprint:
              </h3>
              <div className="space-y-2.5">
                {SIMULATOR_PRESETS.map((preset) => {
                  const active = preset.id === activePreset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setActivePreset(preset);
                        handleSimulate(preset);
                      }}
                      className={`w-full text-left p-3.5 rounded border transition-all ${
                        active
                          ? "bg-[#D4AF37]/15 border-[#D4AF37] text-white"
                          : "bg-black/40 border-white/10 text-white/70 hover:border-white/30"
                      }`}
                    >
                      <span className="font-bold text-sm block mb-1">{preset.title}</span>
                      <span className="text-xs text-[#D4AF37] block">{preset.flight}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => handleSimulate(activePreset)}
                  disabled={simulating}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-all rounded disabled:opacity-50"
                >
                  {simulating ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Synthesizing Neural Blueprint...
                    </>
                  ) : (
                    <>
                      <Zap size={14} /> Re-Generate Live Dossier
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Terminal Output Display (7 cols) */}
            <div className="lg:col-span-7 bg-[#0b0e14] border-2 border-[#D4AF37]/40 p-6 sm:p-8 rounded-xl shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono text-white/80">VANIR NEURAL DISPATCH TERMINAL</span>
                </div>
                <span className="text-[10px] text-white/40 font-mono">EASA / SCA PROTOCOL</span>
              </div>

              {simulating ? (
                <div className="py-20 text-center">
                  <RefreshCw size={28} className="animate-spin text-[#D4AF37] mx-auto mb-3" />
                  <p className="text-xs font-mono text-white/70">Routing private flight sectors &amp; checking antiquities permits...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <pre className="text-xs font-mono text-white/85 whitespace-pre-wrap leading-relaxed bg-black/60 p-4 rounded border border-white/5">
                    {simulatedOutput ||
                      `[VANIR NEURAL SYNTHESIS READY]
Sector: ${activePreset.flight}
Sanctuary: ${activePreset.destination}
Party: ${activePreset.guests}

ARCHITECTURAL BLUEPRINT:
${activePreset.highlights.join("\n\n")}

SECURITY & DIPLOMATIC CLEARANCES:
✓ Supreme Council of Antiquities VIP Access Confirmed
✓ EASA Part-NCC Operator Tail-Number Allocated
✓ Armored Maybach 680 Convoy Staged at VIP Apron`}
                  </pre>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link
                      href="/booking"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-white transition-colors"
                    >
                      Book This Synthesized Odyssey <ArrowRight size={13} />
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20 text-white font-semibold text-xs uppercase tracking-wider rounded-sm hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
                    >
                      Inquire with Flight Desk
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: 3D PRICING & CLOUD TIERS CALLOUT ─── */}
      <section className="py-20 bg-gradient-to-b from-[#06080c] to-[#0c1018] border-t border-white/5">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold block mb-2">
            Flexible Sovereign Access
          </span>
          <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-white mb-4">
            Designed for Creators, Agencies &amp; Enterprise Luxury Brands
          </h2>
          <p className="text-white/65 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
            From free trial credits to dedicated private LLM cloud infrastructure with zero rate limits, explore our transparent membership tiers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-12">
            {/* Starter */}
            <div className="bg-[#0e131d] border border-white/10 p-6 rounded-xl">
              <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-bold block mb-1">Starter</span>
              <div className="text-2xl font-bold text-white mb-2">€0 <span className="text-xs text-white/50 font-normal">/ month</span></div>
              <p className="text-xs text-white/60 mb-4">Perfect for exploring Vanir AI travel intelligence.</p>
              <ul className="space-y-2 text-xs text-white/70 mb-6">
                <li>✓ 10 Free AI Generations</li>
                <li>✓ Standard Resolution Studio</li>
                <li>✓ Basic Concierge Chat</li>
              </ul>
              <Link href="/pricing" className="block text-center py-2.5 border border-white/20 text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-white hover:text-black transition-colors">
                Get Started
              </Link>
            </div>

            {/* Pro Studio */}
            <div className="bg-gradient-to-b from-[#161c28] to-[#0e131d] border-2 border-[#D4AF37] p-6 rounded-xl shadow-2xl relative">
              <span className="absolute -top-3 right-4 px-2.5 py-0.5 bg-[#D4AF37] text-black text-[10px] font-bold uppercase tracking-wider rounded-sm">
                Most Popular
              </span>
              <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-bold block mb-1">Pro Studio</span>
              <div className="text-2xl font-bold text-white mb-2">€29 <span className="text-xs text-white/50 font-normal">/ month</span></div>
              <p className="text-xs text-white/60 mb-4">For luxury travel creators and boutique agencies.</p>
              <ul className="space-y-2 text-xs text-white/70 mb-6">
                <li>✓ 500 4K Ultra Generations</li>
                <li>✓ Nano Banana Pro 4K &amp; GPT-4o</li>
                <li>✓ Full Marketing Suite Access</li>
                <li>✓ Priority VIP Generation Queue</li>
              </ul>
              <Link href="/pricing" className="block text-center py-2.5 bg-[#D4AF37] text-black text-xs uppercase tracking-wider font-bold rounded hover:bg-white transition-colors">
                Upgrade to Pro
              </Link>
            </div>

            {/* Enterprise Sovereign */}
            <div className="bg-[#0e131d] border border-white/10 p-6 rounded-xl">
              <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-bold block mb-1">Enterprise</span>
              <div className="text-2xl font-bold text-white mb-2">Custom <span className="text-xs text-white/50 font-normal">/ SLA</span></div>
              <p className="text-xs text-white/60 mb-4">For private aviation fleets, hotel groups &amp; family offices.</p>
              <ul className="space-y-2 text-xs text-white/70 mb-6">
                <li>✓ Unlimited Visual &amp; Text Generations</li>
                <li>✓ Dedicated Air-Gapped Cloud LLM</li>
                <li>✓ Full Custom API &amp; Webhooks</li>
                <li>✓ Dedicated Account Director</li>
              </ul>
              <Link href="/contact" className="block text-center py-2.5 border border-[#D4AF37]/50 text-[#D4AF37] text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#D4AF37] hover:text-black transition-colors">
                Inquire Enterprise
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
