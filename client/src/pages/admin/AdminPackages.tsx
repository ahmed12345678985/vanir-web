import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Plane, Plus, Trash2, Save, RefreshCw, Star, CheckCircle, Image, DollarSign, Clock, Users, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";
import ImageUploadField from "@/components/admin/ImageUploadField";

interface LuxuryPackage {
  id: number;
  name: string;
  tagline: string;
  duration: string;
  destinations: string;
  groupSize: string;
  image: string;
  description: string;
  includes: string[];
  priceFrom: string;
  rating: number;
  featured: boolean;
  badge: string;
}

interface PrivateJetTier {
  id: string;
  name: string;
  capacity: string;
  range: string;
  example: string;
  pricePerHour: string;
  image: string;
  desc: string;
  featured: boolean;
}

const DEFAULT_PACKAGES: LuxuryPackage[] = [
  {
    id: 1,
    name: "Imperial Egypt",
    tagline: "The Complete Egyptian Journey",
    duration: "12 Days / 11 Nights",
    destinations: "Cairo · Luxor · Aswan · Abu Simbel",
    groupSize: "Private (2–12)",
    image: "/images/final_luxor_post.png",
    description: "The definitive luxury Egypt experience. Twelve days covering the full breadth of Egypt's ancient legacy in an uncompromising 5-star environment.",
    includes: [
      "5-Star Hotels Throughout",
      "Private Expert Egyptologist",
      "All Internal Flights",
      "All Meals (Curated Fine Dining)",
      "Airport Fast Track (Arrival & Departure)",
      "Luxury Ground Transport",
      "Nile Sunset Felucca",
      "24/7 Dedicated Concierge"
    ],
    priceFrom: "$8,500/person",
    rating: 5,
    featured: true,
    badge: "Best Seller"
  },
  {
    id: 2,
    name: "Red Sea Reverie",
    tagline: "Barefoot Luxury on the Red Sea",
    duration: "7 Days / 6 Nights",
    destinations: "Hurghada · Soma Bay · Giftun Island",
    groupSize: "2–20 Guests",
    image: "/images/final_sharm_post.png",
    description: "Seven days of absolute Red Sea luxury. A beachfront 5-star resort, private yacht excursions to deserted islands, and world-class diving.",
    includes: [
      "5-Star Beachfront Resort",
      "Private Yacht Full-Day Charter",
      "Snorkeling & Diving Equipment",
      "Half-Board Dining",
      "Luxury Airport Transfer",
      "Watersports Access"
    ],
    priceFrom: "$3,800/person",
    rating: 4.9,
    featured: true,
    badge: "Most Popular"
  },
  {
    id: 3,
    name: "Nile & Monuments",
    tagline: "Sailing Through 5,000 Years",
    duration: "9 Days / 8 Nights",
    destinations: "Cairo · Luxor · Nile Cruise · Aswan",
    groupSize: "Private Cabin",
    image: "/images/Regent-Seven-Seas-Voyager-Pool-Deck.jpg",
    description: "Begin in Cairo grandeur, then board a 5-star Nile cruise ship and sail serenely between Luxor and Aswan with private temple visits.",
    includes: [
      "5-Star Cairo Hotel (2 nights)",
      "5-Star Nile Cruise Ship (5 nights)",
      "5-Star Aswan Hotel (2 nights)",
      "Private Egyptologist",
      "All Temple Entrance Fees",
      "Full Board Throughout",
      "Internal Flight Cairo–Luxor"
    ],
    priceFrom: "$5,200/person",
    rating: 4.9,
    featured: false,
    badge: ""
  },
  {
    id: 4,
    name: "Desert Kingdom",
    tagline: "Into Egypt Eternal Wilderness",
    duration: "6 Days / 5 Nights",
    destinations: "Cairo · Bahariya · White Desert · Siwa",
    groupSize: "Private (2–8)",
    image: "/images/final_siwa_post.png",
    description: "Journey into Egypt's Western Desert — chalk sculptures of the White Desert, thermal springs of Bahariya, and eco-luxury desert lodges.",
    includes: [
      "Luxury Desert Tented Camp",
      "Eco-Lodge Siwa (2 nights)",
      "Expert Desert Guide",
      "Private 4x4 Fleet",
      "All Meals",
      "Hot Springs Experience"
    ],
    priceFrom: "$3,200/person",
    rating: 4.8,
    featured: false,
    badge: ""
  },
  {
    id: 5,
    name: "Pharaohs & Superyacht",
    tagline: "Monuments by Day, Yacht by Night",
    duration: "10 Days / 9 Nights",
    destinations: "Cairo · Luxor · Red Sea Yacht · El Gouna",
    groupSize: "Private Charter (Up to 10)",
    image: "/images/Regent-Seven-Seas-Voyager.jpg",
    description: "The ultimate dual-world itinerary: five days exploring ancient pharaonic monuments by private aircraft, followed by five days aboard a chartered luxury superyacht.",
    includes: [
      "Private Aircraft Cairo–Luxor–Hurghada",
      "Private 40m Superyacht Charter (5 nights)",
      "All Fine Dining & Premium Beverages",
      "On-Board Water Toys & Dive Master",
      "Private Temple Access After Hours"
    ],
    priceFrom: "$12,000/person",
    rating: 5,
    featured: true,
    badge: "Ultra Luxury"
  }
];

const DEFAULT_JETS: PrivateJetTier[] = [
  {
    id: "vlj",
    name: "Very Light Jets",
    capacity: "4–6 Passengers",
    range: "Up to 2,000 km",
    example: "Phenom 300, Citation CJ4",
    pricePerHour: "$3,500 - $4,800 / hr",
    image: "/images/Luxury Airport Limo Service in Chicago.jpeg",
    desc: "Perfect for short regional hops — Cairo to Sharm El Sheikh, or Cairo to Dubai — in supreme comfort.",
    featured: false
  },
  {
    id: "midsize",
    name: "Midsize Jets",
    capacity: "7–9 Passengers",
    range: "Up to 4,500 km",
    example: "Citation XLS+, Hawker 900XP",
    pricePerHour: "$5,500 - $7,200 / hr",
    image: "/images/Luxury Private Jet Interior with Warm Ambient Elegance ✨.jpeg",
    desc: "The optimal balance of cabin comfort and range — ideal for Europe and Middle East routes.",
    featured: false
  },
  {
    id: "heavy",
    name: "Heavy & Ultra Long-Range Jets",
    capacity: "10–16 Passengers",
    range: "Up to 12,000 km",
    example: "Gulfstream G650ER, Bombardier Global 7500",
    pricePerHour: "$9,800 - $14,500 / hr",
    image: "/images/GEN013801.jpg",
    desc: "Full stand-up cabins, lay-flat queen beds, full galley, and intercontinental reach. The pinnacle of private aviation.",
    featured: true
  }
];

export default function AdminPackages() {
  const [packages, setPackages] = useState<LuxuryPackage[]>(DEFAULT_PACKAGES);
  const [jets, setJets] = useState<PrivateJetTier[]>(DEFAULT_JETS);
  const [activeTab, setActiveTab] = useState<"packages" | "jets">("packages");

  // Query DB settings
  const { data: dbPackages, refetch: refetchPackages } = trpc.siteSettings.get.useQuery({
    category: "luxury_services",
    key: "packages_data",
  });

  const { data: dbJets, refetch: refetchJets } = trpc.siteSettings.get.useQuery({
    category: "luxury_services",
    key: "private_jet_data",
  });

  useEffect(() => {
    if (dbPackages) {
      try {
        const parsed = JSON.parse(dbPackages);
        if (Array.isArray(parsed) && parsed.length > 0) setPackages(parsed);
      } catch (e) {
        console.error("Failed to parse packages data", e);
      }
    }
  }, [dbPackages]);

  useEffect(() => {
    if (dbJets) {
      try {
        const parsed = JSON.parse(dbJets);
        if (Array.isArray(parsed) && parsed.length > 0) setJets(parsed);
      } catch (e) {
        console.error("Failed to parse jet data", e);
      }
    }
  }, [dbJets]);

  const saveMutation = trpc.siteSettings.set.useMutation({
    onSuccess: () => {
      toast.success("Successfully saved luxury service changes!");
      refetchPackages();
      refetchJets();
    },
    onError: (err) => {
      toast.error(`Save failed: ${err.message}`);
    }
  });

  const handleSavePackages = () => {
    saveMutation.mutate({
      category: "luxury_services",
      key: "packages_data",
      value: JSON.stringify(packages),
    });
  };

  const handleSaveJets = () => {
    saveMutation.mutate({
      category: "luxury_services",
      key: "private_jet_data",
      value: JSON.stringify(jets),
    });
  };

  const updatePackage = (index: number, field: keyof LuxuryPackage, value: any) => {
    const updated = [...packages];
    updated[index] = { ...updated[index], [field]: value };
    setPackages(updated);
  };

  const updateJet = (index: number, field: keyof PrivateJetTier, value: any) => {
    const updated = [...jets];
    updated[index] = { ...updated[index], [field]: value };
    setJets(updated);
  };

  const addPackage = () => {
    const newPkg: LuxuryPackage = {
      id: Date.now(),
      name: "New Luxury Package",
      tagline: "Exclusive Bespoke Journey",
      duration: "7 Days / 6 Nights",
      destinations: "Cairo · Red Sea",
      groupSize: "Private (2–8)",
      image: "/images/final_cairo_post.png",
      description: "An uncompromised bespoke luxury voyage through the most breathtaking destinations in Egypt.",
      includes: ["5-Star Ultra Luxury Resort", "Private Chauffeur", "VIP Fast Track"],
      priceFrom: "$5,000/person",
      rating: 5,
      featured: false,
      badge: "New"
    };
    setPackages([newPkg, ...packages]);
  };

  const removePackage = (index: number) => {
    setPackages(packages.filter((_, i) => i !== index));
  };

  const addJet = () => {
    const newJet: PrivateJetTier = {
      id: `jet-${Date.now()}`,
      name: "Super Midsize Jet",
      capacity: "8–10 Passengers",
      range: "Up to 6,000 km",
      example: "Challenger 350, Gulfstream G280",
      pricePerHour: "$7,000 - $9,000 / hr",
      image: "/images/GEN013801.jpg",
      desc: "Outstanding transatlantic performance and cabin height.",
      featured: false
    };
    setJets([...jets, newJet]);
  };

  const removeJet = (index: number) => {
    setJets(jets.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8" dir="ltr">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Crown className="text-[var(--theme-primary)]" size={32} />
            Luxury Packages & Private Aviation
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Manage public prices, images, flight rates, and package specifications shown across the website.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === "packages" ? (
            <>
              <Button
                onClick={addPackage}
                variant="outline"
                className="border-[var(--theme-primary)]/40 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10"
              >
                <Plus size={16} className="mr-2" /> Add Package
              </Button>
              <Button
                onClick={handleSavePackages}
                disabled={saveMutation.isPending}
                className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold shadow-lg shadow-[var(--theme-primary)]/20"
              >
                <Save size={16} className="mr-2" />
                {saveMutation.isPending ? "Saving..." : "Save Packages"}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={addJet}
                variant="outline"
                className="border-[var(--theme-primary)]/40 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10"
              >
                <Plus size={16} className="mr-2" /> Add Jet Tier
              </Button>
              <Button
                onClick={handleSaveJets}
                disabled={saveMutation.isPending}
                className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold shadow-lg shadow-[var(--theme-primary)]/20"
              >
                <Save size={16} className="mr-2" />
                {saveMutation.isPending ? "Saving..." : "Save Fleet"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="bg-[#1a1a1a] border border-white/10 p-1 mb-6">
          <TabsTrigger value="packages" className="flex items-center gap-2 data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-black">
            <Crown size={16} />
            Curated Luxury Packages ({packages.length})
          </TabsTrigger>
          <TabsTrigger value="jets" className="flex items-center gap-2 data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-black">
            <Plane size={16} />
            Private Jet Fleet & Hourly Rates ({jets.length})
          </TabsTrigger>
        </TabsList>

        {/* Packages Tab Content */}
        <TabsContent value="packages" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {packages.map((pkg, idx) => (
              <Card key={pkg.id || idx} className="bg-[#141414] border-white/10 overflow-hidden">
                <CardHeader className="bg-white/5 border-b border-white/10 flex flex-row items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] font-bold flex items-center justify-center text-sm">
                      #{idx + 1}
                    </span>
                    <div>
                      <CardTitle className="text-lg text-white font-semibold">{pkg.name}</CardTitle>
                      <CardDescription className="text-xs text-white/50">{pkg.tagline || "No tagline"}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--theme-primary)] font-bold px-3 py-1 rounded bg-[var(--theme-primary)]/10 text-sm">
                      {pkg.priceFrom}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removePackage(idx)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Image Preview & Direct Upload */}
                    <div className="space-y-3">
                      <ImageUploadField
                        label="صورة غلاف الباقة (Cover Image) - رفع من الجهاز"
                        value={pkg.image}
                        onChange={(url) => updatePackage(idx, "image", url)}
                        helperText="يمكنك اختيار صورة الباقة من جهازك مباشرة وسيتم رفعها وعرضها فوراً."
                      />
                      <div className="flex items-center gap-4 pt-2">
                        <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pkg.featured}
                            onChange={(e) => updatePackage(idx, "featured", e.target.checked)}
                            className="rounded border-white/20 bg-black text-[var(--theme-primary)] focus:ring-[var(--theme-primary)]"
                          />
                          Featured on Home & Packages
                        </label>
                      </div>
                    </div>

                    {/* Middle: Details & Rates */}
                    <div className="space-y-4 md:col-span-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-white/70">Package Title</Label>
                          <Input
                            value={pkg.name}
                            onChange={(e) => updatePackage(idx, "name", e.target.value)}
                            className="bg-[#1e1e1e] border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-white/70 flex items-center gap-1">
                            <DollarSign size={13} className="text-[var(--theme-primary)]" /> Starting Price (e.g. $8,500/person)
                          </Label>
                          <Input
                            value={pkg.priceFrom}
                            onChange={(e) => updatePackage(idx, "priceFrom", e.target.value)}
                            className="bg-[#1e1e1e] border-white/10 text-[var(--theme-primary)] font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-xs text-white/70 flex items-center gap-1">
                            <Clock size={13} className="text-[var(--theme-primary)]" /> Duration
                          </Label>
                          <Input
                            value={pkg.duration}
                            onChange={(e) => updatePackage(idx, "duration", e.target.value)}
                            className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-white/70 flex items-center gap-1">
                            <MapPin size={13} className="text-[var(--theme-primary)]" /> Destinations
                          </Label>
                          <Input
                            value={pkg.destinations}
                            onChange={(e) => updatePackage(idx, "destinations", e.target.value)}
                            className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-white/70 flex items-center gap-1">
                            <Sparkles size={13} className="text-[var(--theme-primary)]" /> Badge Label
                          </Label>
                          <Input
                            value={pkg.badge || ""}
                            onChange={(e) => updatePackage(idx, "badge", e.target.value)}
                            placeholder="Best Seller, Ultra Luxury..."
                            className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-white/70">Tagline / Subheading</Label>
                        <Input
                          value={pkg.tagline}
                          onChange={(e) => updatePackage(idx, "tagline", e.target.value)}
                          className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-white/70">Overview Description</Label>
                        <Textarea
                          value={pkg.description}
                          onChange={(e) => updatePackage(idx, "description", e.target.value)}
                          rows={2}
                          className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-white/70">Included Features (comma separated)</Label>
                        <Input
                          value={Array.isArray(pkg.includes) ? pkg.includes.join(", ") : ""}
                          onChange={(e) => updatePackage(idx, "includes", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                          className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                          placeholder="5-Star Hotels, Private Jet, Egyptologist"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Jets Tab Content */}
        <TabsContent value="jets" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jets.map((jet, idx) => (
              <Card key={jet.id || idx} className="bg-[#141414] border-white/10 flex flex-col justify-between">
                <div>
                  <CardHeader className="bg-white/5 border-b border-white/10 flex flex-row items-center justify-between py-3">
                    <CardTitle className="text-base text-white font-semibold flex items-center gap-2">
                      <Plane size={16} className="text-[var(--theme-primary)]" />
                      {jet.name}
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeJet(idx)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 w-7 p-0"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </CardHeader>

                  <CardContent className="p-4 space-y-3">
                    <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-white/10 bg-black">
                      <img
                        src={jet.image}
                        alt={jet.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/GEN013801.jpg";
                        }}
                      />
                    </div>

                    <div>
                      <Label className="text-[11px] text-white/60">Class / Tier Name</Label>
                      <Input
                        value={jet.name}
                        onChange={(e) => updateJet(idx, "name", e.target.value)}
                        className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                      />
                    </div>

                    <div>
                      <Label className="text-[11px] text-white/60">Hourly Rate (Displayed to VIPs)</Label>
                      <Input
                        value={jet.pricePerHour}
                        onChange={(e) => updateJet(idx, "pricePerHour", e.target.value)}
                        className="bg-[#1e1e1e] border-white/10 text-[var(--theme-primary)] font-bold text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[11px] text-white/60">Capacity</Label>
                        <Input
                          value={jet.capacity}
                          onChange={(e) => updateJet(idx, "capacity", e.target.value)}
                          className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] text-white/60">Flight Range</Label>
                        <Input
                          value={jet.range}
                          onChange={(e) => updateJet(idx, "range", e.target.value)}
                          className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-[11px] text-white/60">Representative Aircraft</Label>
                      <Input
                        value={jet.example}
                        onChange={(e) => updateJet(idx, "example", e.target.value)}
                        className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                      />
                    </div>

                    <div>
                      <ImageUploadField
                        label="صورة الطائرة (Aircraft Image) - رفع من الجهاز"
                        value={jet.image}
                        onChange={(url) => updateJet(idx, "image", url)}
                      />
                    </div>

                    <div>
                      <Label className="text-[11px] text-white/60">Cabin Description</Label>
                      <Textarea
                        value={jet.desc}
                        onChange={(e) => updateJet(idx, "desc", e.target.value)}
                        rows={2}
                        className="bg-[#1e1e1e] border-white/10 text-white text-xs"
                      />
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 pt-0">
                  <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={jet.featured}
                      onChange={(e) => updateJet(idx, "featured", e.target.checked)}
                      className="rounded border-white/20 bg-black text-[var(--theme-primary)]"
                    />
                    Flagship Aircraft Badge
                  </label>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
