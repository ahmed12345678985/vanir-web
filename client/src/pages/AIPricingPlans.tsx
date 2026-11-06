/*
 * AI Pricing & Plans - Ultra-Luxury 3D Sovereign Edition
 * Dedicated 3D glass cards, authentic photographic backdrops,
 * live credit matrix, interactive model comparison, and instant activation.
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Check, Sparkles, Zap, Crown, Shield, ArrowRight,
  ChevronDown, ChevronUp, Image as ImageIcon,
  Plane, Compass, Anchor, ArrowLeft, Lock, Star, Eye
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import PageMeta from "@/components/PageMeta";
import SEO from "@/components/SEO";
import AISidebar from "@/components/AISidebar";
import AI3DHeader from "@/components/AI3DHeader";
import { AmbientGlow, GoldDustParticles } from "@/components/ElegantEffects";
import { toast } from "sonner";

/* ─── Plan Data with Real Photographic Backdrops ─── */
const PLANS = [
  {
    id: "free" as const,
    name: "Sovereign Starter",
    tierLabel: "Exploratory Tier",
    tagline: "Essential neural synthesis for discerning individual voyagers",
    icon: Sparkles,
    image: "/images/final_cairo_post.png",
    monthlyPrice: 0,
    yearlyPrice: 0,
    credits: "10",
    creditsLabel: "free credits / month",
    features: [
      "10 High-res AI visual syntheses / month",
      "DALL-E 3 & Gemini 2.5 Flash engines",
      "Standard 1024x1024 resolution export",
      "Sovereign Concierge chat assistant",
      "Standard synthesis queue (~5s)",
      "Personal non-commercial portfolio rights",
    ],
    notIncluded: [
      "4K Studio Ultra resolution (Banana Pro 4K)",
      "GPT Image 2.5 Sunburst photographic model",
      "Marketing AI Suite & Automated Campaign Writer",
      "Commercial advertising rights",
      "Priority VIP neural cluster queue",
    ],
    cta: "Start with 10 Free Credits",
    popular: false,
    accentColor: "#94A3B8",
  },
  {
    id: "pro" as const,
    name: "Vanir Pro Studio",
    tierLabel: "Flagship Architect",
    tagline: "Engineered for luxury creators, aviation brokers & travel brands",
    icon: Crown,
    image: "/images/GEN013801.jpg",
    monthlyPrice: 29,
    yearlyPrice: 290,
    credits: "500",
    creditsLabel: "credits / month",
    features: [
      "500 Ultra 4K AI generations / month",
      "All Frontier Vision Engines Unlocked (Sunburst 4K, Banana Pro 4K, DALL-E 3)",
      "Reasoning models unlocked: GPT-4o, Claude 3.5 & 3.7 Sonnet, Gemini 2.0",
      "4K Ultra resolution with multi-format download (PNG, JPG, WebP)",
      "Full Automated Marketing Suite (Social, Itinerary, SEO, Ad copy)",
      "Priority VIP Neural Cluster (< 2.5s synthesis)",
      "Full worldwide commercial advertising & copyright license",
      "Rollover protection for up to 250 unused credits / cycle",
    ],
    notIncluded: [
      "Custom fine-tuned private brand checkpoints",
      "Dedicated multi-seat enterprise team billing",
    ],
    cta: "Upgrade to Vanir Pro",
    popular: true,
    accentColor: "#D4A853",
  },
  {
    id: "enterprise" as const,
    name: "Sovereign Enterprise",
    tierLabel: "Private Fleet & Concierge",
    tagline: "Dedicated compute cluster for hotel chains, airlines & VIP agencies",
    icon: Shield,
    image: "/images/final_dubai_post.png",
    monthlyPrice: -1,
    yearlyPrice: -1,
    credits: "Unlimited",
    creditsLabel: "unlimited neural operations",
    features: [
      "Unlimited 4K photorealistic generations & copy runs",
      "Dedicated Vertex AI & AWS Bedrock sovereign VPC endpoints",
      "Custom LoRA model fine-tuning on your private fleet & estates",
      "REST API access, webhooks & automated CMS sync",
      "Dedicated 24/7 Account Director & 99.9% uptime SLA",
      "Multi-seat team workspace & centralized billing",
      "White-label client portal capability",
    ],
    notIncluded: [],
    cta: "Inquire for Enterprise SLA",
    popular: false,
    accentColor: "#F59E0B",
  },
];

/* ─── Visual Output Showcase Benchmarks ─── */
const SHOWCASE_TIERS = [
  {
    title: "Sovereign Aviation 4K",
    model: "GPT Image 2.5 Sunburst",
    image: "/images/GEN013800.jpg",
    aspect: "16:9 Cinema",
  },
  {
    title: "Karnak Starlight Columns",
    model: "DALL-E 3 Studio",
    image: "/images/final_luxor_post.png",
    aspect: "35mm Master",
  },
  {
    title: "Red Sea Megayacht",
    model: "Banana Pro 4K",
    image: "/images/Regent-Seven-Seas-Voyager.jpg",
    aspect: "Ultra-Wide",
  },
  {
    title: "Amalfi Coastline Villa",
    model: "Gemini 3 Pro",
    image: "/images/final_santorini_post.png",
    aspect: "Fine Art",
  },
];

const FAQ_DATA = [
  {
    q: "How are credits consumed across different AI models?",
    a: "Credits reflect computational GPU intensity: Fast ideation (Nano Banana) costs 1 credit; Studio models (DALL-E 3, Banana Flash 2) cost 2 credits; 4K Masterpiece models (GPT Image 2.5 Sunburst, Banana Pro 4K) cost 3 credits. Credits refresh on your monthly billing date.",
  },
  {
    q: "Can I cancel, upgrade, or downgrade at any moment?",
    a: "Yes, you possess absolute sovereignty over your subscription. Upgrade or cancel instantly in 1 click from your AI Dashboard. Prorated balance adjustments apply automatically without penalty.",
  },
  {
    q: "Do I receive full commercial rights for generated assets?",
    a: "Yes. Both Pro and Enterprise tiers convey unrestricted, perpetual worldwide commercial rights for marketing, publishing, website usage, client presentations, and advertising.",
  },
  {
    q: "What happens to unused credits at the end of the month?",
    a: "Pro tier subscribers enjoy credit rollover protection of up to 250 unused credits into the subsequent month. Enterprise members have unlimited credit capacity.",
  },
];

export default function AIPricingPlans() {
  const { isAuthenticated } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { data: dbPlansRaw } = trpc.siteSettings.get.useQuery({
    category: "ai_studio",
    key: "ai_plans",
  });

  const plans = useMemo(() => {
    if (dbPlansRaw) {
      try {
        const parsed = JSON.parse(dbPlansRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: any) => ({
            ...p,
            icon: p.id === "pro" ? Crown : p.id === "enterprise" ? Shield : Sparkles,
          }));
        }
      } catch (e) {
        console.warn("Failed to parse db plans", e);
      }
    }
    return PLANS;
  }, [dbPlansRaw]);

  const { data: subscription, refetch: refetchSub } = trpc.aiStudio.getSubscription.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const upgradeMutation = trpc.aiStudio.upgradePlan.useMutation({
    onSuccess: (data) => {
      toast.success(`Successfully transitioned to ${data.plan.toUpperCase()} tier!`);
      refetchSub();
    },
    onError: (err) => {
      toast.error(`Subscription transition error: ${err.message}`);
    },
  });

  const handleUpgrade = async (plan: "free" | "pro" | "enterprise") => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    if (plan === "enterprise") {
      window.location.href = "/contact?subject=Enterprise%20AI%20Inquiry";
      return;
    }
    try {
      await upgradeMutation.mutateAsync({ plan });
    } catch (error) {
      console.error("Error upgrading plan:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#04060a] text-white selection:bg-[#d4a853] selection:text-black">
      <Navbar />
      <AISidebar />
      <PageMeta
        title="AI Studio Pricing & Membership Plans | Vanir Sovereign AI"
        description="Select your tier for Vanir 3D AI Studio. Access GPT-4o, Claude 3.7 Sonnet, Banana Pro 4K, and automated luxury travel marketing engines."
        keywords="Vanir AI pricing, travel AI subscription, 4K diffusion membership, luxury AI studio"
        canonicalPath="/pricing"
      />
      <SEO
        title="AI Studio Pricing & Membership Plans | Vanir Sovereign AI"
        description="Transparent subscription tiers for ultra-luxury travel visual diffusion and marketing AI."
      />

      <AI3DHeader
        variant="pricing"
        title="MEMBERSHIP ARCHITECTURE"
        subtitle="Unrestricted access to 4K diffusion clusters, private aviation routing & marketing engines."
        ctaText="View Dashboard"
        ctaHref="/ai-dashboard"
      />

      {/* Atmospheric Ambiance */}
      <div className="fixed inset-0 pointer-events-none">
        <AmbientGlow position="top-left" size="lg" />
        <AmbientGlow position="bottom-right" size="md" />
        <GoldDustParticles count={20} />
      </div>

      {/* ─── Billing Switch Section ─── */}
      <section className="relative z-10 pt-6 pb-6 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">

        {/* 3D Billing Switch */}
        <div className="inline-flex items-center bg-[#0a0d14] border border-white/15 rounded-full p-1.5 shadow-2xl backdrop-blur-xl">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 ${
              billingCycle === "monthly"
                ? "bg-[#d4a853] text-[#050608] shadow-lg shadow-[#d4a853]/25"
                : "text-white/60 hover:text-white"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 relative ${
              billingCycle === "yearly"
                ? "bg-[#d4a853] text-[#050608] shadow-lg shadow-[#d4a853]/25"
                : "text-white/60 hover:text-white"
            }`}
          >
            Annual Allocation
            <span className="ml-2 bg-emerald-500 text-black text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase">
              Save 17%
            </span>
          </button>
        </div>
      </section>

      {/* ─── 3D Pricing Cards with Photographic Backdrops ─── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const IconComp = plan.icon;
            const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            const isCurrent = subscription?.plan === plan.id;

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className={`relative rounded-2xl border overflow-hidden flex flex-col justify-between transition-all duration-500 ${
                  plan.popular
                    ? "border-[#d4a853] bg-gradient-to-b from-[#121622] to-[#07090f] shadow-2xl shadow-[#d4a853]/20 md:-translate-y-2"
                    : "border-white/10 hover:border-white/20 bg-[#070a10]"
                }`}
              >
                {/* Visual Photographic Header Accent */}
                <div className="relative h-44 overflow-hidden border-b border-white/10">
                  <img
                    src={plan.image}
                    alt={plan.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070a10] via-black/60 to-black/30" />

                  {/* Popular Crest */}
                  {plan.popular && (
                    <div className="absolute top-3 right-3 bg-[#d4a853] text-[#050608] text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                      Most Selected
                    </div>
                  )}

                  {/* Tier Icon & Label */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center">
                        <IconComp size={20} className="text-[#d4a853]" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-[#d4a853]">
                          {plan.tierLabel}
                        </div>
                        <h3 className="text-lg font-bold text-white font-[var(--font-display)]">
                          {plan.name}
                        </h3>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-white/50 mb-5 leading-relaxed">{plan.tagline}</p>

                    {/* Price Block */}
                    <div className="mb-6 pb-6 border-b border-white/10">
                      <div className="flex items-baseline gap-1.5">
                        {price === -1 ? (
                          <span className="text-3xl font-extrabold text-white">Custom SLA</span>
                        ) : (
                          <>
                            <span className="text-4xl sm:text-5xl font-extrabold text-white">${price}</span>
                            <span className="text-xs text-white/50">
                              /{billingCycle === "monthly" ? "month" : "year"}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#d4a853] bg-[#d4a853]/10 px-2.5 py-1 rounded-md border border-[#d4a853]/20">
                        <Zap size={13} />
                        {plan.credits} {plan.creditsLabel}
                      </div>
                    </div>

                    {/* Feature Matrix Checklist */}
                    <div className="space-y-3 mb-8">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-white/40">
                        Capabilities & Inclusions:
                      </div>
                      {plan.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/80">
                          <Check size={15} className="text-[#d4a853] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                      {plan.notIncluded.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/30 line-through">
                          <Lock size={13} className="text-white/20 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action CTA */}
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgradeMutation.isPending || isCurrent}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                      isCurrent
                        ? "bg-white/10 text-white/40 cursor-default"
                        : plan.popular
                        ? "bg-gradient-to-r from-[#d4a853] via-[#f3e7c4] to-[#b8860b] text-[#050608] hover:shadow-xl hover:shadow-[#d4a853]/25 cursor-pointer"
                        : "bg-white/10 text-white hover:bg-white/20 border border-white/10 cursor-pointer"
                    }`}
                  >
                    {isCurrent ? "Currently Active" : plan.cta}
                    {!isCurrent && <ArrowRight size={15} />}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── Real Photography Caliber Showcase ─── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="border border-white/10 rounded-2xl bg-gradient-to-b from-[#0a0d16] to-[#05070c] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-[#d4a853] tracking-wider mb-1">
                <Eye size={13} /> Visual Benchmark
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-[var(--font-display)]">
                Caliber of Vanir AI Visual Diffusion
              </h2>
            </div>
            <Link href="/ai-image-generator">
              <span className="text-xs text-[#d4a853] hover:underline cursor-pointer inline-flex items-center gap-1">
                Test In 3D Generator Studio <ArrowRight size={13} />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SHOWCASE_TIERS.map((item, idx) => (
              <div key={idx} className="group relative rounded-xl overflow-hidden border border-white/10 bg-black/60">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="p-3 bg-[#080b12]">
                  <div className="text-xs font-semibold text-white truncate">{item.title}</div>
                  <div className="text-[10px] text-[#d4a853] mt-0.5">{item.model} • {item.aspect}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Detailed Model Comparison Table ─── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-display)] text-white mb-2">
            Frontier Model Technical Matrix
          </h2>
          <p className="text-xs sm:text-sm text-white/50">Comprehensive capability breakdown across compute tiers</p>
        </div>

        <div className="overflow-x-auto bg-[#070a12] border border-white/10 rounded-2xl shadow-xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-black/50">
                <th className="p-4 font-semibold text-white/60">Engine & Capability</th>
                <th className="p-4 font-semibold text-white/60 text-center">Starter</th>
                <th className="p-4 font-semibold text-[#d4a853] text-center bg-[#d4a853]/5">Pro Studio</th>
                <th className="p-4 font-semibold text-white/60 text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="p-4 text-white font-medium">GPT Image 2.5 Sunburst (4K Diffusion)</td>
                <td className="p-4 text-center text-white/20">—</td>
                <td className="p-4 text-center text-emerald-400 font-semibold bg-[#d4a853]/5">✓ Full Access</td>
                <td className="p-4 text-center text-emerald-400 font-semibold">✓ Full Access</td>
              </tr>
              <tr>
                <td className="p-4 text-white font-medium">Banana Pro 4K (Gemini 3 Pro)</td>
                <td className="p-4 text-center text-white/20">—</td>
                <td className="p-4 text-center text-emerald-400 font-semibold bg-[#d4a853]/5">✓ Full Access</td>
                <td className="p-4 text-center text-emerald-400 font-semibold">✓ Full Access</td>
              </tr>
              <tr>
                <td className="p-4 text-white font-medium">OpenAI GPT-4o & o1 Reasoning</td>
                <td className="p-4 text-center text-white/20">—</td>
                <td className="p-4 text-center text-emerald-400 font-semibold bg-[#d4a853]/5">✓ Unlimited</td>
                <td className="p-4 text-center text-emerald-400 font-semibold">✓ Unlimited</td>
              </tr>
              <tr>
                <td className="p-4 text-white font-medium">Anthropic Claude 3.5 & 3.7 Sonnet</td>
                <td className="p-4 text-center text-white/20">—</td>
                <td className="p-4 text-center text-emerald-400 font-semibold bg-[#d4a853]/5">✓ Unlimited</td>
                <td className="p-4 text-center text-emerald-400 font-semibold">✓ Unlimited</td>
              </tr>
              <tr>
                <td className="p-4 text-white font-medium">Automated Marketing AI Suite (6 Tools)</td>
                <td className="p-4 text-center text-white/20">—</td>
                <td className="p-4 text-center text-emerald-400 font-semibold bg-[#d4a853]/5">✓ Included</td>
                <td className="p-4 text-center text-emerald-400 font-semibold">✓ Included</td>
              </tr>
              <tr>
                <td className="p-4 text-white font-medium">Commercial Advertising Rights</td>
                <td className="p-4 text-center text-white/20">—</td>
                <td className="p-4 text-center text-emerald-400 font-semibold bg-[#d4a853]/5">✓ Worldwide</td>
                <td className="p-4 text-center text-emerald-400 font-semibold">✓ Worldwide</td>
              </tr>
              <tr>
                <td className="p-4 text-white font-medium">Custom Private VPC / API Endpoints</td>
                <td className="p-4 text-center text-white/20">—</td>
                <td className="p-4 text-center text-white/20 bg-[#d4a853]/5">—</td>
                <td className="p-4 text-center text-emerald-400 font-semibold">✓ Dedicated VPC</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-display)] text-white mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-white/50">Details regarding neural cluster access, billing, and commercial rights</p>
        </div>

        <div className="space-y-3">
          {FAQ_DATA.map((faq, i) => (
            <div
              key={i}
              className="border border-white/10 bg-[#070a12] rounded-xl overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-semibold text-sm sm:text-base text-white hover:text-[#d4a853] transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === i ? <ChevronUp size={18} className="text-[#d4a853] shrink-0" /> : <ChevronDown size={18} className="text-white/40 shrink-0" />}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-white/60 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
