import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, Zap, TrendingUp, DollarSign, Loader2, Sparkles, Save, Plus, Trash2, Image, Coins, Cpu, BarChart3, Star, CheckCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ImageUploadField from "@/components/admin/ImageUploadField";

interface AIPlan {
  id: string;
  name: string;
  tierLabel: string;
  tagline: string;
  image: string;
  monthlyPrice: number;
  yearlyPrice: number;
  credits: string;
  creditsLabel: string;
  features: string[];
  notIncluded?: string[];
  cta: string;
  popular: boolean;
  accentColor: string;
}

interface AICreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  badge: string;
  popular: boolean;
}

interface AIPreset {
  id: string;
  title: string;
  category: string;
  image: string;
  prompt: string;
  model: string;
  aspectRatio: string;
  imageSize: string;
  style: string;
  cameraSpecs: string;
}

interface AIModelConfig {
  id: string;
  name: string;
  provider: string;
  icon: string;
  creditCost: string;
  enabled: boolean;
  tier: string;
}

export default function AdminAIStudio() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"plans" | "credit_packs" | "presets" | "models" | "analytics">("plans");
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [creditsToAdd, setCreditsToAdd] = useState<number>(0);

  // States for dynamic settings
  const [plans, setPlans] = useState<AIPlan[]>([]);
  const [creditPacks, setCreditPacks] = useState<AICreditPack[]>([]);
  const [presets, setPresets] = useState<AIPreset[]>([]);
  const [models, setModels] = useState<AIModelConfig[]>([]);

  // Queries
  const { data: dbPlans, refetch: refetchPlans } = trpc.siteSettings.get.useQuery({
    category: "ai_studio",
    key: "ai_plans",
  });

  const { data: dbCreditPacks, refetch: refetchCreditPacks } = trpc.siteSettings.get.useQuery({
    category: "ai_studio",
    key: "ai_credit_packs",
  });

  const { data: dbPresets, refetch: refetchPresets } = trpc.siteSettings.get.useQuery({
    category: "ai_studio",
    key: "ai_presets",
  });

  const { data: dbModels, refetch: refetchModels } = trpc.siteSettings.get.useQuery({
    category: "ai_studio",
    key: "ai_models_config",
  });

  useEffect(() => {
    if (dbPlans) {
      try {
        const parsed = JSON.parse(dbPlans);
        if (Array.isArray(parsed)) setPlans(parsed);
      } catch (e) {
        console.error("Failed to parse plans", e);
      }
    }
  }, [dbPlans]);

  useEffect(() => {
    if (dbCreditPacks) {
      try {
        const parsed = JSON.parse(dbCreditPacks);
        if (Array.isArray(parsed)) setCreditPacks(parsed);
      } catch (e) {
        console.error("Failed to parse credit packs", e);
      }
    }
  }, [dbCreditPacks]);

  useEffect(() => {
    if (dbPresets) {
      try {
        const parsed = JSON.parse(dbPresets);
        if (Array.isArray(parsed)) setPresets(parsed);
      } catch (e) {
        console.error("Failed to parse presets", e);
      }
    }
  }, [dbPresets]);

  useEffect(() => {
    if (dbModels) {
      try {
        const parsed = JSON.parse(dbModels);
        if (Array.isArray(parsed)) setModels(parsed);
      } catch (e) {
        console.error("Failed to parse models", e);
      }
    }
  }, [dbModels]);

  const saveSettingMutation = trpc.siteSettings.set.useMutation({
    onSuccess: () => {
      toast.success("AI Studio settings saved successfully!");
      refetchPlans();
      refetchCreditPacks();
      refetchPresets();
      refetchModels();
    },
    onError: (err) => {
      toast.error(`Save failed: ${err.message}`);
    }
  });

  const handleSavePlans = () => {
    saveSettingMutation.mutate({
      category: "ai_studio",
      key: "ai_plans",
      value: JSON.stringify(plans),
    });
  };

  const handleSaveCreditPacks = () => {
    saveSettingMutation.mutate({
      category: "ai_studio",
      key: "ai_credit_packs",
      value: JSON.stringify(creditPacks),
    });
  };

  const handleSavePresets = () => {
    saveSettingMutation.mutate({
      category: "ai_studio",
      key: "ai_presets",
      value: JSON.stringify(presets),
    });
  };

  const handleSaveModels = () => {
    saveSettingMutation.mutate({
      category: "ai_studio",
      key: "ai_models_config",
      value: JSON.stringify(models),
    });
  };

  const addCreditsMutation = trpc.aiStudio.addCredits.useMutation({
    onSuccess: (data) => {
      toast.success(`Successfully added ${creditsToAdd} credits to user #${selectedUser}! New balance: ${data.balance}`);
      setCreditsToAdd(0);
    },
    onError: (err) => {
      toast.error(`Failed to add credits: ${err.message}`);
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]"></div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
        <p className="text-gray-400">You do not have permission to access this page.</p>
      </div>
    );
  }

  // Mock data for analytics
  const subscriptionStats = [
    { plan: "Free", users: 245, revenue: 0 },
    { plan: "Pro", users: 89, revenue: 2581 },
    { plan: "Enterprise", users: 12, revenue: 1188 },
  ];

  const usageStats = [
    { date: "Apr 1", images: 1240, videos: 120, edits: 89 },
    { date: "Apr 2", images: 1398, videos: 221, edits: 129 },
    { date: "Apr 3", images: 980, videos: 229, edits: 200 },
    { date: "Apr 4", images: 1908, videos: 200, edits: 221 },
    { date: "Apr 5", images: 2800, videos: 229, edits: 200 },
    { date: "Apr 6", images: 2390, videos: 200, edits: 221 },
    { date: "Apr 7", images: 2490, videos: 221, edits: 200 },
  ];

  const revenueStats = [
    { date: "Apr 1", revenue: 400 },
    { date: "Apr 2", revenue: 300 },
    { date: "Apr 3", revenue: 200 },
    { date: "Apr 4", revenue: 278 },
    { date: "Apr 5", revenue: 189 },
    { date: "Apr 6", revenue: 239 },
    { date: "Apr 7", revenue: 349 },
  ];

  return (
    <div className="space-y-8" dir="ltr">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Sparkles className="text-[var(--theme-primary)]" size={32} />
            AI Studio Command & Pricing Control
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Complete bi-directional control over AI subscription plans, credit pack prices, inspiration prompts, and model credit fees.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === "plans" && (
            <Button
              onClick={handleSavePlans}
              disabled={saveSettingMutation.isPending}
              className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold shadow-lg shadow-[var(--theme-primary)]/20"
            >
              <Save size={16} className="mr-2" />
              {saveSettingMutation.isPending ? "Saving Plans..." : "Save AI Plans"}
            </Button>
          )}
          {activeTab === "credit_packs" && (
            <Button
              onClick={handleSaveCreditPacks}
              disabled={saveSettingMutation.isPending}
              className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold shadow-lg shadow-[var(--theme-primary)]/20"
            >
              <Save size={16} className="mr-2" />
              {saveSettingMutation.isPending ? "Saving Packs..." : "Save Credit Packs"}
            </Button>
          )}
          {activeTab === "presets" && (
            <Button
              onClick={handleSavePresets}
              disabled={saveSettingMutation.isPending}
              className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold shadow-lg shadow-[var(--theme-primary)]/20"
            >
              <Save size={16} className="mr-2" />
              {saveSettingMutation.isPending ? "Saving Presets..." : "Save Presets"}
            </Button>
          )}
          {activeTab === "models" && (
            <Button
              onClick={handleSaveModels}
              disabled={saveSettingMutation.isPending}
              className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold shadow-lg shadow-[var(--theme-primary)]/20"
            >
              <Save size={16} className="mr-2" />
              {saveSettingMutation.isPending ? "Saving Models..." : "Save Model Config"}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="bg-[#1a1a1a] border border-white/10 p-1 mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="plans" className="flex items-center gap-2 data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-black">
            <DollarSign size={15} />
            Subscription Plans ({plans.length})
          </TabsTrigger>
          <TabsTrigger value="credit_packs" className="flex items-center gap-2 data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-black">
            <Coins size={15} />
            Credit Packs ({creditPacks.length})
          </TabsTrigger>
          <TabsTrigger value="presets" className="flex items-center gap-2 data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-black">
            <Image size={15} />
            Inspiration Gallery & Prompts ({presets.length})
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center gap-2 data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-black">
            <Cpu size={15} />
            AI Models & Cost ({models.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-black">
            <BarChart3 size={15} />
            Analytics & Add Credits
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PLANS */}
        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {plans.map((plan, idx) => (
              <Card key={plan.id || idx} className="bg-[#141414] border-white/10 overflow-hidden flex flex-col justify-between">
                <div>
                  <CardHeader className="bg-white/5 border-b border-white/10 py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider font-semibold text-[var(--theme-primary)]">
                        {plan.tierLabel || "Plan Tier"}
                      </span>
                      {plan.popular && (
                        <span className="bg-[var(--theme-primary)] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                          POPULAR
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-xl text-white font-bold mt-1">{plan.name}</CardTitle>
                    <CardDescription className="text-xs text-white/50">{plan.tagline}</CardDescription>
                  </CardHeader>

                  <CardContent className="p-5 space-y-4">
                    {/* Plan Image */}
                    <div>
                      <ImageUploadField
                        label="صورة الخطة (Showcase Image) - رفع من الجهاز"
                        value={plan.image}
                        onChange={(url) => {
                          const updated = [...plans];
                          updated[idx].image = url;
                          setPlans(updated);
                        }}
                        helperText="اختر صورة من جهازك مباشرة ليتم عرضها في بطاقة الخطة."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-white/70">Monthly Price ($)</Label>
                        <Input
                          type="number"
                          value={plan.monthlyPrice}
                          onChange={(e) => {
                            const updated = [...plans];
                            updated[idx].monthlyPrice = Number(e.target.value);
                            setPlans(updated);
                          }}
                          className="bg-[#1e1e1e] border-white/10 text-white font-bold"
                        />
                        <span className="text-[10px] text-white/40">(-1 = Contact Concierge)</span>
                      </div>
                      <div>
                        <Label className="text-xs text-white/70">Yearly Price ($/mo)</Label>
                        <Input
                          type="number"
                          value={plan.yearlyPrice}
                          onChange={(e) => {
                            const updated = [...plans];
                            updated[idx].yearlyPrice = Number(e.target.value);
                            setPlans(updated);
                          }}
                          className="bg-[#1e1e1e] border-white/10 text-white font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-white/70">Credits Allowance</Label>
                        <Input
                          value={plan.credits}
                          onChange={(e) => {
                            const updated = [...plans];
                            updated[idx].credits = e.target.value;
                            setPlans(updated);
                          }}
                          className="bg-[#1e1e1e] border-white/10 text-[var(--theme-primary)] font-semibold text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-white/70">Credits Label</Label>
                        <Input
                          value={plan.creditsLabel}
                          onChange={(e) => {
                            const updated = [...plans];
                            updated[idx].creditsLabel = e.target.value;
                            setPlans(updated);
                          }}
                          className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-white/70">Plan Name & Tier Subtitle</Label>
                      <Input
                        value={plan.name}
                        onChange={(e) => {
                          const updated = [...plans];
                          updated[idx].name = e.target.value;
                          setPlans(updated);
                        }}
                        className="bg-[#1e1e1e] border-white/10 text-white text-xs mb-2"
                      />
                      <Input
                        value={plan.tierLabel}
                        onChange={(e) => {
                          const updated = [...plans];
                          updated[idx].tierLabel = e.target.value;
                          setPlans(updated);
                        }}
                        className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                        placeholder="e.g. Flagship Architect"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-white/70">Features (one per line)</Label>
                      <Textarea
                        value={Array.isArray(plan.features) ? plan.features.join("\n") : ""}
                        onChange={(e) => {
                          const updated = [...plans];
                          updated[idx].features = e.target.value.split("\n").filter(Boolean);
                          setPlans(updated);
                        }}
                        rows={4}
                        className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-white/70">CTA Button Text</Label>
                      <Input
                        value={plan.cta}
                        onChange={(e) => {
                          const updated = [...plans];
                          updated[idx].cta = e.target.value;
                          setPlans(updated);
                        }}
                        className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                      />
                    </div>
                  </CardContent>
                </div>

                <div className="p-5 pt-0 border-t border-white/5 mt-4">
                  <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer pt-3">
                    <input
                      type="checkbox"
                      checked={plan.popular}
                      onChange={(e) => {
                        const updated = [...plans];
                        updated[idx].popular = e.target.checked;
                        setPlans(updated);
                      }}
                      className="rounded border-white/20 bg-black text-[var(--theme-primary)]"
                    />
                    Mark as Most Popular (Highlighted with Gold border)
                  </label>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 2: CREDIT PACKS */}
        <TabsContent value="credit_packs" className="space-y-6">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                const newPack: AICreditPack = {
                  id: `pack-${Date.now()}`,
                  name: "Custom Credit Bundle",
                  credits: 750,
                  price: 49,
                  badge: "Limited Offer",
                  popular: false
                };
                setCreditPacks([...creditPacks, newPack]);
              }}
              variant="outline"
              className="border-[var(--theme-primary)]/40 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10"
            >
              <Plus size={16} className="mr-2" /> Add Credit Pack
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {creditPacks.map((pack, idx) => (
              <Card key={pack.id || idx} className="bg-[#141414] border-white/10 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[var(--theme-primary)]">${pack.price}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCreditPacks(creditPacks.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 w-7 p-0"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>

                <div>
                  <Label className="text-xs text-white/70">Pack Title</Label>
                  <Input
                    value={pack.name}
                    onChange={(e) => {
                      const updated = [...creditPacks];
                      updated[idx].name = e.target.value;
                      setCreditPacks(updated);
                    }}
                    className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-white/70">Credits Count</Label>
                    <Input
                      type="number"
                      value={pack.credits}
                      onChange={(e) => {
                        const updated = [...creditPacks];
                        updated[idx].credits = Number(e.target.value);
                        setCreditPacks(updated);
                      }}
                      className="bg-[#1e1e1e] border-white/10 text-white text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-white/70">Price in USD ($)</Label>
                    <Input
                      type="number"
                      value={pack.price}
                      onChange={(e) => {
                        const updated = [...creditPacks];
                        updated[idx].price = Number(e.target.value);
                        setCreditPacks(updated);
                      }}
                      className="bg-[#1e1e1e] border-white/10 text-white text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-white/70">Badge Label</Label>
                  <Input
                    value={pack.badge}
                    onChange={(e) => {
                      const updated = [...creditPacks];
                      updated[idx].badge = e.target.value;
                      setCreditPacks(updated);
                    }}
                    placeholder="Most Popular, Starter, etc."
                    className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={pack.popular}
                    onChange={(e) => {
                      const updated = [...creditPacks];
                      updated[idx].popular = e.target.checked;
                      setCreditPacks(updated);
                    }}
                    className="rounded border-white/20 bg-black text-[var(--theme-primary)]"
                  />
                  Featured Pack Badge
                </label>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 3: INSPIRATION PRESETS & PROMPTS */}
        <TabsContent value="presets" className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-xs text-white/50">
              These sample images and neural prompts are displayed in the "Inspiration Presets" gallery on the AI Image Studio.
            </p>
            <Button
              onClick={() => {
                const newPreset: AIPreset = {
                  id: `preset-${Date.now()}`,
                  title: "New Sovereign Synthesis",
                  category: "Private Aviation",
                  image: "/images/GEN013801.jpg",
                  prompt: "Photorealistic luxury interior at 40,000 feet, golden hour sunlight, Hasselblad 80mm lens.",
                  model: "gpt-image-2.5-sunburst",
                  aspectRatio: "16:9",
                  imageSize: "1536x1024",
                  style: "cinematic",
                  cameraSpecs: "50mm ƒ/1.8 • 1/500s • ISO 100"
                };
                setPresets([newPreset, ...presets]);
              }}
              variant="outline"
              className="border-[var(--theme-primary)]/40 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10"
            >
              <Plus size={16} className="mr-2" /> Add Inspiration Preset
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {presets.map((preset, idx) => (
              <Card key={preset.id || idx} className="bg-[#141414] border-white/10 overflow-hidden">
                <CardHeader className="bg-white/5 border-b border-white/10 py-3 flex flex-row items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[var(--theme-primary)]">
                      {preset.category}
                    </span>
                    <CardTitle className="text-sm text-white font-semibold truncate max-w-[220px]">
                      {preset.title}
                    </CardTitle>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPresets(presets.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 w-7 p-0"
                  >
                    <Trash2 size={14} />
                  </Button>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  <div>
                    <ImageUploadField
                      label="صورة النموذج (Preset Image) - رفع من الجهاز"
                      value={preset.image}
                      onChange={(url) => {
                        const updated = [...presets];
                        updated[idx].image = url;
                        setPresets(updated);
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[11px] text-white/60">Title</Label>
                      <Input
                        value={preset.title}
                        onChange={(e) => {
                          const updated = [...presets];
                          updated[idx].title = e.target.value;
                          setPresets(updated);
                        }}
                        className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-white/60">Category</Label>
                      <Input
                        value={preset.category}
                        onChange={(e) => {
                          const updated = [...presets];
                          updated[idx].category = e.target.value;
                          setPresets(updated);
                        }}
                        className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-[11px] text-white/60">Full Neural Prompt</Label>
                    <Textarea
                      value={preset.prompt}
                      onChange={(e) => {
                        const updated = [...presets];
                        updated[idx].prompt = e.target.value;
                        setPresets(updated);
                      }}
                      rows={3}
                      className="bg-[#1e1e1e] border-white/10 text-white text-xs leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[11px] text-white/60">Engine Model ID</Label>
                      <Input
                        value={preset.model}
                        onChange={(e) => {
                          const updated = [...presets];
                          updated[idx].model = e.target.value;
                          setPresets(updated);
                        }}
                        className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-white/60">Camera Specs</Label>
                      <Input
                        value={preset.cameraSpecs}
                        onChange={(e) => {
                          const updated = [...presets];
                          updated[idx].cameraSpecs = e.target.value;
                          setPresets(updated);
                        }}
                        className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 4: AI MODELS CONFIG */}
        <TabsContent value="models" className="space-y-6">
          <Card className="bg-[#141414] border-white/10 p-6">
            <CardHeader className="p-0 pb-4 mb-4 border-b border-white/10">
              <CardTitle className="text-lg text-white">Neural Generation Engines & Credit Pricing</CardTitle>
              <CardDescription className="text-xs text-white/50">
                Configure the credit price required for each AI image engine in the studio.
              </CardDescription>
            </CardHeader>
            <div className="space-y-4">
              {models.map((mod, idx) => (
                <div key={mod.id || idx} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{mod.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-white">{mod.name}</div>
                      <div className="text-[10px] text-white/40">{mod.provider}</div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-[10px] text-white/50">Model Name</Label>
                    <Input
                      value={mod.name}
                      onChange={(e) => {
                        const updated = [...models];
                        updated[idx].name = e.target.value;
                        setModels(updated);
                      }}
                      className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-[10px] text-white/50">Credits Cost</Label>
                    <Input
                      value={mod.creditCost}
                      onChange={(e) => {
                        const updated = [...models];
                        updated[idx].creditCost = e.target.value;
                        setModels(updated);
                      }}
                      className="bg-[#1e1e1e] border-white/10 text-[var(--theme-primary)] font-bold text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-[10px] text-white/50">Tier Tag</Label>
                    <Input
                      value={mod.tier}
                      onChange={(e) => {
                        const updated = [...models];
                        updated[idx].tier = e.target.value;
                        setModels(updated);
                      }}
                      className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-[10px] text-white/50">Provider</Label>
                    <Input
                      value={mod.provider}
                      onChange={(e) => {
                        const updated = [...models];
                        updated[idx].provider = e.target.value;
                        setModels(updated);
                      }}
                      className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-end">
                    <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mod.enabled}
                        onChange={(e) => {
                          const updated = [...models];
                          updated[idx].enabled = e.target.checked;
                          setModels(updated);
                        }}
                        className="rounded border-white/20 bg-black text-[var(--theme-primary)]"
                      />
                      Active
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* TAB 5: ANALYTICS & ADD CREDITS */}
        <TabsContent value="analytics" className="space-y-8">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="bg-[#1a1a1a] border-[var(--theme-primary)]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-[var(--theme-primary)]" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[var(--theme-primary)]">346</div>
                <p className="text-gray-400 text-sm mt-2">+12 this week</p>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-[var(--theme-primary)]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5 text-[var(--theme-primary)]" />
                  Credits Used
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[var(--theme-primary)]">12.5K</div>
                <p className="text-gray-400 text-sm mt-2">This month</p>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-[var(--theme-primary)]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-[var(--theme-primary)]" />
                  Generations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[var(--theme-primary)]">8.2K</div>
                <p className="text-gray-400 text-sm mt-2">Images & Videos</p>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-[var(--theme-primary)]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="w-5 h-5 text-[var(--theme-primary)]" />
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[var(--theme-primary)]">$3,769</div>
                <p className="text-gray-400 text-sm mt-2">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-[#1a1a1a] border-[var(--theme-primary)]/20">
              <CardHeader>
                <CardTitle>Daily Usage</CardTitle>
                <CardDescription>AI generation activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usageStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D4A853/20" />
                    <XAxis dataKey="date" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #D4A853" }} />
                    <Legend />
                    <Line type="monotone" dataKey="images" stroke="#D4A853" strokeWidth={2} />
                    <Line type="monotone" dataKey="videos" stroke="#8B7355" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-[var(--theme-primary)]/20">
              <CardHeader>
                <CardTitle>Daily Revenue</CardTitle>
                <CardDescription>Subscription revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D4A853/20" />
                    <XAxis dataKey="date" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #D4A853" }} />
                    <Bar dataKey="revenue" fill="#D4A853" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* User Credit Management */}
          <Card className="bg-[#1a1a1a] border-[var(--theme-primary)]/20">
            <CardHeader>
              <CardTitle>Add Credits to User Account</CardTitle>
              <CardDescription>Instantly award credits to any registered user</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  placeholder="User ID"
                  type="number"
                  className="bg-[var(--theme-background)] border-[var(--theme-primary)]/20 text-white"
                  onChange={(e) => setSelectedUser(parseInt(e.target.value))}
                />
                <Input
                  placeholder="Credits to add"
                  type="number"
                  className="bg-[var(--theme-background)] border-[var(--theme-primary)]/20 text-white"
                  onChange={(e) => setCreditsToAdd(parseInt(e.target.value))}
                />
                <Button
                  className="bg-[var(--theme-primary)] text-black hover:bg-[#E5B86B]"
                  disabled={addCreditsMutation.isPending || !selectedUser || creditsToAdd <= 0}
                  onClick={() => {
                    if (selectedUser && creditsToAdd > 0) {
                      addCreditsMutation.mutate({
                        userId: selectedUser,
                        amount: creditsToAdd,
                        reason: "bonus",
                      });
                    }
                  }}
                >
                  {addCreditsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Credits"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
