import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  Plane,
  Compass,
  Shield,
  Sparkles,
  Clock,
  Users,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Award,
  MapPin,
  Gauge,
  Crown,
  Eye,
  ChevronRight,
  Zap,
} from "lucide-react";

interface DepartureHub {
  id: string;
  city: string;
  country: string;
  icao: string;
  flightHoursToCairo: number;
  nauticalMiles: number;
}

interface DestinationSanctuary {
  id: string;
  name: string;
  region: string;
  tagline: string;
  image: string;
  badge: string;
  dailyGroundRatePerGuestEur: number;
  flightMultiplier: number;
  highlights: string[];
}

interface AircraftTier {
  id: string;
  name: string;
  models: string;
  maxPax: number;
  hourlyRateEur: number;
  emptyLegSavingPct: number;
  cabinFeature: string;
  speed: string;
  range: string;
  image: string;
  cabinImage: string;
}

interface SovereignPrivilege {
  id: string;
  title: string;
  subtitle: string;
  flatFeeEur: number;
  iconName?: string;
}

const DEPARTURE_HUBS: DepartureHub[] = [
  { id: "fra", city: "Frankfurt", country: "Germany (DE)", icao: "EDDF", flightHoursToCairo: 3.9, nauticalMiles: 1580 },
  { id: "muc", city: "Munich", country: "Germany (DE)", icao: "EDDM", flightHoursToCairo: 3.6, nauticalMiles: 1420 },
  { id: "ber", city: "Berlin", country: "Germany (DE)", icao: "EDDB", flightHoursToCairo: 4.0, nauticalMiles: 1565 },
  { id: "zrh", city: "Zurich", country: "Switzerland (CH)", icao: "LSZH", flightHoursToCairo: 3.7, nauticalMiles: 1485 },
  { id: "vie", city: "Vienna", country: "Austria (AT)", icao: "LOWW", flightHoursToCairo: 3.3, nauticalMiles: 1280 },
  { id: "lon", city: "London Farnborough", country: "United Kingdom (UK)", icao: "EGLF", flightHoursToCairo: 4.6, nauticalMiles: 1900 },
  { id: "par", city: "Paris Le Bourget", country: "France (FR)", icao: "LFPB", flightHoursToCairo: 4.3, nauticalMiles: 1735 },
  { id: "dxb", city: "Dubai Al Maktoum", country: "UAE", icao: "OMDW", flightHoursToCairo: 3.4, nauticalMiles: 1310 },
];

const DESTINATIONS: DestinationSanctuary[] = [
  {
    id: "egypt-royal",
    name: "Cairo, Luxor & Aswan Sovereign Odyssey",
    region: "Egypt — Nile & Antiquities",
    tagline: "Presidential Nile suites, private after-hours Giza Pyramid entry & private Dahabiya charter",
    image: "/The_Nile_River_at_Cairo.jpg",
    badge: "ROYAL HERITAGE",
    dailyGroundRatePerGuestEur: 1150,
    flightMultiplier: 1.15,
    highlights: [
      "Private tarmac-to-Maybach arrival at Cairo (HECA) & Luxor (HELX)",
      "After-hours private entry into the Great Pyramid of Khufu & Tomb of Nefertari",
      "7-deck or boutique private Dahabiya sanctuary charter with executive chef",
    ],
  },
  {
    id: "red-sea-yacht",
    name: "El Gouna & Red Sea Superyacht Sanctuary",
    region: "Egypt — Red Sea Coast",
    tagline: "50m+ private motor yacht charter, untouched coral atolls & beachfront royal villa",
    image: "/images/Regent-Seven-Seas-Voyager-Pool-Deck.jpg",
    badge: "SUPERYACHT EXPEDITION",
    dailyGroundRatePerGuestEur: 1350,
    flightMultiplier: 1.1,
    highlights: [
      "Direct private jet arrival into Hurghada / El Gouna VIP Terminal (HEGN)",
      "Private superyacht with PADI master diver, sea toys & onboard sommelier",
      "Private helicopter excursion to St. Catherine's Monastery or Luxor temples",
    ],
  },
  {
    id: "siwa-desert",
    name: "Siwa Oasis Eco-Palace & Great Sand Sea",
    region: "Egypt — Western Desert",
    tagline: "Candlelit salt-brick palace at Adrère Amellal & private PC-12 desert airstrip charter",
    image: "/images/final_siwa_post.png",
    badge: "DESERT PALACE BUYOUT",
    dailyGroundRatePerGuestEur: 1250,
    flightMultiplier: 1.25,
    highlights: [
      "Private turboprop/jet transfer directly to Siwa Oasis airstrip",
      "Exclusive desert camp buyout under pristine Saharan skies",
      "Private Temple of the Oracle & Cleopatra Spring thermal sanctuary",
    ],
  },
  {
    id: "med-europe",
    name: "Amalfi, Lake Como & Cote d'Azur Circuit",
    region: "Europe — Mediterranean",
    tagline: "Historic lakeside palazzo buyouts, Riva aquarama tenders & helicopter transfers",
    image: "/images/final_rome_post.png",
    badge: "MEDITERRANEAN PALAZZO",
    dailyGroundRatePerGuestEur: 1650,
    flightMultiplier: 0.75,
    highlights: [
      "Seamless helicopter transfers between Milan, Lake Como, Monaco & Amalfi",
      "Private after-hours Vatican & Uffizi Gallery curator-led access",
      "Michelin 3-star private chef table & superyacht day charters",
    ],
  },
  {
    id: "maldives-island",
    name: "Maldives Private Atoll & Overwater Sanctuary",
    region: "Indian Ocean",
    tagline: "Ultra-private island residence with private seaplane transfer & underwater dining",
    image: "/images/FS-Landaa-Giraavaru-Water-Villa-Maldives.jpeg",
    badge: "PRIVATE ISLAND BUYOUT",
    dailyGroundRatePerGuestEur: 1950,
    flightMultiplier: 2.15,
    highlights: [
      "VIP CIP lounge clearance at Velana International + private Twin Otter seaplane",
      "Dedicated 24/7 Aris Meeha royal butler & private reef yacht",
      "Subsea dining buyout & bespoke wellness longevity program",
    ],
  },
];

const AIRCRAFT_TIERS: AircraftTier[] = [
  {
    id: "light",
    name: "Light Jet",
    models: "Embraer Phenom 300E / Citation CJ4",
    maxPax: 7,
    hourlyRateEur: 3600,
    emptyLegSavingPct: 32,
    speed: "839 km/h (Mach 0.78)",
    range: "3,723 km (2,010 NM)",
    cabinFeature: "Ideal for short-to-medium European hops & domestic Cairo–Luxor–Aswan links",
    image: "/images/Luxury Airport Limo Service in Chicago.jpeg",
    cabinImage: "/images/Luxury Private Jet Interior with Warm Ambient Elegance ✨.jpeg",
  },
  {
    id: "super-mid",
    name: "Super-Midsize Jet",
    models: "Challenger 3500 / Praetor 600",
    maxPax: 9,
    hourlyRateEur: 5400,
    emptyLegSavingPct: 28,
    speed: "882 km/h (Mach 0.83)",
    range: "7,441 km (4,018 NM)",
    cabinFeature: "Non-stop Frankfurt/Munich/Zurich to Cairo with stand-up 6ft flat-floor cabin",
    image: "/images/Luxury Private Jet Interior with Warm Ambient Elegance ✨.jpeg",
    cabinImage: "/images/Luxury Private Jet Interior with Warm Ambient Elegance ✨.jpeg",
  },
  {
    id: "heavy",
    name: "Heavy Jet (Most Popular DE → EG)",
    models: "Challenger 650 / Dassault Falcon 2000LXS",
    maxPax: 12,
    hourlyRateEur: 7600,
    emptyLegSavingPct: 25,
    speed: "890 km/h (Mach 0.84)",
    range: "7,408 km (4,000 NM)",
    cabinFeature: "Dedicated flight attendant, hot gourmet galley, lie-flat berths & high-speed Ka-band Wi-Fi",
    image: "/images/Luxury Private Jet Interior with Warm Ambient Elegance ✨.jpeg",
    cabinImage: "/images/Luxury Private Jet Interior with Warm Ambient Elegance ✨.jpeg",
  },
  {
    id: "ultra-long",
    name: "Ultra-Long-Range Sovereign",
    models: "Gulfstream G650ER / Global 7500",
    maxPax: 16,
    hourlyRateEur: 10800,
    emptyLegSavingPct: 22,
    speed: "956 km/h (Mach 0.90)",
    range: "13,890 km (7,500 NM)",
    cabinFeature: "Four living zones, private stateroom suite, shower & ultra-low cabin altitude",
    image: "/images/Luxury Private Jet Interior with Warm Ambient Elegance ✨.jpeg",
    cabinImage: "/images/Luxury Private Jet Interior with Warm Ambient Elegance ✨.jpeg",
  },
];

const PRIVILEGES: SovereignPrivilege[] = [
  {
    id: "after-hours-pyramids",
    title: "Private After-Hours Great Pyramid & Museum Opening",
    subtitle: "Official Supreme Council of Antiquities permit for solitary evening access",
    flatFeeEur: 6800,
  },
  {
    id: "diplomatic-apron",
    title: "Presidential Tarmac Apron-to-Maybach Protocol",
    subtitle: "Direct aircraft steps pickup bypassing main terminal with diplomatic customs clearance",
    flatFeeEur: 1850,
  },
  {
    id: "phd-egyptologist",
    title: "Dedicated Senior Ph.D. Egyptologist & Historian",
    subtitle: "Published archaeologist accompanying your party throughout the entire journey",
    flatFeeEur: 2400,
  },
  {
    id: "security-detail",
    title: "Executive Close-Protection & Diplomatic Security Detail",
    subtitle: "Discreet multilingual security officers & armored SUV convoy coordination",
    flatFeeEur: 3900,
  },
];

export default function SovereignJourneyArchitect() {
  const [hubId, setHubId] = useState<string>("fra");
  const [destId, setDestId] = useState<string>("egypt-royal");
  const [aircraftId, setAircraftId] = useState<string>("heavy");
  const [guests, setGuests] = useState<number>(4);
  const [days, setDays] = useState<number>(7);
  const [selectedPrivileges, setSelectedPrivileges] = useState<string[]>([
    "diplomatic-apron",
    "phd-egyptologist",
  ]);

  const hub = useMemo(
    () => DEPARTURE_HUBS.find((h) => h.id === hubId) || DEPARTURE_HUBS[0],
    [hubId]
  );
  const destination = useMemo(
    () => DESTINATIONS.find((d) => d.id === destId) || DESTINATIONS[0],
    [destId]
  );
  const aircraft = useMemo(
    () => AIRCRAFT_TIERS.find((a) => a.id === aircraftId) || AIRCRAFT_TIERS[2],
    [aircraftId]
  );

  const togglePrivilege = (id: string) => {
    setSelectedPrivileges((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const calculation = useMemo(() => {
    const oneWayHours = +(hub.flightHoursToCairo * destination.flightMultiplier).toFixed(1);
    const roundTripHours = +(oneWayHours * 2).toFixed(1);
    const distanceNm = Math.round(hub.nauticalMiles * destination.flightMultiplier);

    const charterCostEur = Math.round(roundTripHours * aircraft.hourlyRateEur);
    const emptyLegEstEur = Math.round(
      charterCostEur * (1 - aircraft.emptyLegSavingPct / 100)
    );
    const groundHospitalityEur = Math.round(
      days * guests * destination.dailyGroundRatePerGuestEur
    );
    const privilegesCostEur = selectedPrivileges.reduce((sum, privId) => {
      const found = PRIVILEGES.find((p) => p.id === privId);
      return sum + (found ? found.flatFeeEur : 0);
    }, 0);

    const totalBespokeEur = charterCostEur + groundHospitalityEur + privilegesCostEur;
    const totalUsd = Math.round(totalBespokeEur * 1.09);
    const perGuestEur = Math.round(totalBespokeEur / Math.max(1, guests));

    const hoursWhole = Math.floor(oneWayHours);
    const mins = Math.round((oneWayHours - hoursWhole) * 60);

    return {
      oneWayFormatted: `${hoursWhole}h ${mins.toString().padStart(2, "0")}m`,
      roundTripHours,
      distanceNm,
      charterCostEur,
      emptyLegEstEur,
      groundHospitalityEur,
      privilegesCostEur,
      totalBespokeEur,
      totalUsd,
      perGuestEur,
    };
  }, [hub, destination, aircraft, guests, days, selectedPrivileges]);

  return (
    <section
      id="sovereign-architect"
      aria-label="Interactive Private Jet & Luxury Journey Configurator"
      className="relative pt-6 sm:pt-10 md:pt-16 pb-20 md:pb-28 bg-gradient-to-b from-[#07090e] via-[#0b0e16] to-[#07090e] text-white overflow-hidden"
    >
      {/* ── Soft Art Deco Progressive Blend from Hero (No Hard Lines) ── */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-36 bg-gradient-to-b from-[#D4AF37]/10 via-[#D4AF37]/3 to-transparent blur-2xl" />

      {/* Decorative Art Deco Crest Divider */}
      <div className="flex items-center justify-center gap-3 mb-10 sm:mb-14 relative z-10">
        <div className="w-16 sm:w-28 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]/50" />
        <div className="w-2.5 h-2.5 rotate-45 border border-[#D4AF37] bg-[#D4AF37]/20" />
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold px-2">
          Sovereign Aviation Architecture
        </span>
        <div className="w-2.5 h-2.5 rotate-45 border border-[#D4AF37] bg-[#D4AF37]/20" />
        <div className="w-16 sm:w-28 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]/50" />
      </div>

      <div className="container max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/35 text-[#D4AF37] text-xs uppercase tracking-[0.2em] mb-4">
            <Sparkles size={14} /> Real-Time Private Aviation &amp; Sanctuary Configurator
          </span>
          <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            The Vanir Sovereign Journey &amp; Private Jet Architect™
          </h2>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed">
            Configure your non-stop private aviation corridor from Germany (DE), Switzerland, and Europe, paired with presidential suites, private yacht charters, and solitary after-hours access to Egypt&apos;s antiquities.
          </p>
        </div>

        {/* ── Visual 3D Dual-Lens Preview: Selected Sanctuary & Jet Cabin ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Active Destination Card */}
          <div className="relative group overflow-hidden rounded-lg border border-[#D4AF37]/30 bg-black/60 shadow-2xl h-60 sm:h-72">
            <img
              src={destination.image}
              alt={destination.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
              <span className="px-2.5 py-1 bg-[#D4AF37] text-black font-bold text-[10px] uppercase tracking-wider rounded-sm">
                {destination.badge}
              </span>
              <span className="px-2 py-0.5 bg-black/70 backdrop-blur-md text-white/80 text-[10px] tracking-wider border border-white/10">
                {destination.region}
              </span>
            </div>
            <div className="absolute bottom-3.5 left-3.5 right-3.5">
              <h3 className="font-[var(--font-display)] text-lg sm:text-xl font-bold text-white leading-snug drop-shadow-md">
                {destination.name}
              </h3>
              <p className="text-xs text-white/80 mt-1 line-clamp-2">
                {destination.tagline}
              </p>
            </div>
          </div>

          {/* Active Aircraft Cabin Card */}
          <div className="relative group overflow-hidden rounded-lg border border-[#D4AF37]/30 bg-black/60 shadow-2xl h-60 sm:h-72">
            <img
              src={aircraft.cabinImage}
              alt={`${aircraft.name} VIP Cabin Interior`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
              <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/50 font-bold text-[10px] uppercase tracking-wider rounded-sm flex items-center gap-1.5">
                <Plane size={11} /> {aircraft.name}
              </span>
              <span className="px-2 py-0.5 bg-black/70 backdrop-blur-md text-emerald-400 text-[10px] tracking-wider border border-emerald-500/30">
                EASA Part-NCC Audited
              </span>
            </div>
            <div className="absolute bottom-3.5 left-3.5 right-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-[var(--font-display)] text-lg sm:text-xl font-bold text-white leading-snug drop-shadow-md">
                    {aircraft.models}
                  </h3>
                  <p className="text-xs text-white/80 mt-0.5">
                    Speed: {aircraft.speed} • Range: {aircraft.range} • Up to {aircraft.maxPax} Guests
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] block">Charter Rate</span>
                  <span className="text-base sm:text-lg font-bold text-white">€{aircraft.hourlyRateEur.toLocaleString()}/hr</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Configurator Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Configuration Panel (7 cols) */}
          <div className="lg:col-span-7 bg-[#0f141d]/90 backdrop-blur-md border border-white/10 p-6 sm:p-8 space-y-7 rounded-lg shadow-xl">
            {/* Step 1: Departure & Destination */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-bold flex items-center gap-2">
                  <Plane size={15} /> 1. Select Aviation Corridor (Departure Hub → Sanctuary)
                </h3>
                <span className="text-[11px] text-white/45">Non-Stop Routing</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="departure-hub-select"
                    className="block text-xs text-white/60 mb-1.5"
                  >
                    Departure Private Terminal (FBO / GAT)
                  </label>
                  <select
                    id="departure-hub-select"
                    value={hubId}
                    onChange={(e) => setHubId(e.target.value)}
                    className="w-full bg-[#080b10] border border-white/15 focus:border-[#D4AF37] text-white text-sm px-3.5 py-2.5 outline-none transition-colors rounded-sm"
                  >
                    {DEPARTURE_HUBS.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.city} ({h.icao}) — {h.country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="destination-sanctuary-select"
                    className="block text-xs text-white/60 mb-1.5"
                  >
                    Destination Sanctuary &amp; Odyssey
                  </label>
                  <select
                    id="destination-sanctuary-select"
                    value={destId}
                    onChange={(e) => setDestId(e.target.value)}
                    className="w-full bg-[#080b10] border border-white/15 focus:border-[#D4AF37] text-white text-sm px-3.5 py-2.5 outline-none transition-colors rounded-sm"
                  >
                    {DESTINATIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="mt-2.5 text-xs text-white/55 italic">
                {destination.tagline}
              </p>
            </div>

            {/* Step 2: Aircraft Category */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-bold flex items-center gap-2 mb-3">
                <Gauge size={15} /> 2. Select Private Aircraft Category (Privatjet-Kategorie)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AIRCRAFT_TIERS.map((tier) => {
                  const active = tier.id === aircraftId;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setAircraftId(tier.id)}
                      className={`text-left p-3.5 border transition-all rounded-sm ${
                        active
                          ? "bg-[#D4AF37]/15 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                          : "bg-[#080b10] border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-white">{tier.name}</span>
                        <span className="text-xs font-semibold text-[#D4AF37]">
                          €{tier.hourlyRateEur.toLocaleString()}/hr
                        </span>
                      </div>
                      <p className="text-xs text-white/70 font-medium mb-1">{tier.models}</p>
                      <p className="text-[11px] text-white/45 leading-snug">
                        Up to {tier.maxPax} guests • {tier.cabinFeature}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Party Size & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-white/10">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-white/70 flex items-center gap-1.5">
                    <Users size={14} className="text-[#D4AF37]" /> Principal Party Size
                  </span>
                  <span className="text-[#D4AF37] font-bold">{guests} Guests</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={14}
                  value={guests}
                  aria-label="Principal Party Size"
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-white/40 mt-1">
                  <span>1 Principal</span>
                  <span>6 Guests</span>
                  <span>14 Delegation</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-white/70 flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#D4AF37]" /> Odyssey Duration
                  </span>
                  <span className="text-[#D4AF37] font-bold">{days} Days / {days - 1} Nights</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={14}
                  value={days}
                  aria-label="Odyssey Duration in Days"
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-white/40 mt-1">
                  <span>3 Days (Weekend)</span>
                  <span>7 Days (Classic)</span>
                  <span>14 Days (Grand Tour)</span>
                </div>
              </div>
            </div>

            {/* Step 4: Sovereign Privileges */}
            <div className="pt-2 border-t border-white/10">
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-bold flex items-center gap-2 mb-3">
                <Crown size={15} /> 3. Sovereign Access &amp; Diplomatic Protocols
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRIVILEGES.map((priv) => {
                  const checked = selectedPrivileges.includes(priv.id);
                  return (
                    <button
                      key={priv.id}
                      type="button"
                      onClick={() => togglePrivilege(priv.id)}
                      className={`text-left p-3 border transition-all flex items-start gap-2.5 rounded-sm ${
                        checked
                          ? "bg-[#D4AF37]/15 border-[#D4AF37]/75"
                          : "bg-[#080b10] border-white/10 hover:border-white/25"
                      }`}
                    >
                      <CheckCircle2
                        size={16}
                        className={`shrink-0 mt-0.5 ${
                          checked ? "text-[#D4AF37]" : "text-white/25"
                        }`}
                      />
                      <div>
                        <div className="text-xs font-semibold text-white leading-snug">
                          {priv.title}
                        </div>
                        <div className="text-[11px] text-white/50 mt-0.5 leading-snug">
                          {priv.subtitle} (+€{priv.flatFeeEur.toLocaleString()})
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Live Dossier Output (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#131926] to-[#0a0d14] border-2 border-[#D4AF37]/50 p-6 sm:p-8 shadow-2xl rounded-lg">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] block">
                  Live Architectural Dossier
                </span>
                <h3 className="font-[var(--font-display)] text-xl font-bold text-white mt-0.5">
                  {hub.city} ({hub.icao}) ✈ {destination.region.split("—")[0].trim()}
                </h3>
              </div>
              <Award size={28} className="text-[#D4AF37] shrink-0" />
            </div>

            {/* Key Flight Telemetry */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-black/50 border border-white/10 p-3 text-center rounded-sm">
                <Clock size={16} className="text-[#D4AF37] mx-auto mb-1" />
                <span className="block text-[10px] uppercase tracking-wider text-white/50">
                  Direct Flight
                </span>
                <span className="font-[var(--font-display)] text-base sm:text-lg font-bold text-white">
                  {calculation.oneWayFormatted}
                </span>
              </div>
              <div className="bg-black/50 border border-white/10 p-3 text-center rounded-sm">
                <Compass size={16} className="text-[#D4AF37] mx-auto mb-1" />
                <span className="block text-[10px] uppercase tracking-wider text-white/50">
                  Sector Distance
                </span>
                <span className="font-[var(--font-display)] text-base sm:text-lg font-bold text-white">
                  {calculation.distanceNm.toLocaleString()} NM
                </span>
              </div>
              <div className="bg-black/50 border border-white/10 p-3 text-center rounded-sm">
                <MapPin size={16} className="text-[#D4AF37] mx-auto mb-1" />
                <span className="block text-[10px] uppercase tracking-wider text-white/50">
                  VIP FBO Clearance
                </span>
                <span className="font-[var(--font-display)] text-base sm:text-lg font-bold text-[#D4AF37]">
                  12 Mins
                </span>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-3 text-xs sm:text-sm border-b border-white/10 pb-5 mb-5">
              <div className="flex justify-between text-white/75">
                <span>
                  Round-Trip {aircraft.name} ({calculation.roundTripHours} hrs)
                </span>
                <span className="font-semibold text-white">
                  €{calculation.charterCostEur.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-emerald-400/90 text-xs">
                <span>↳ Empty-Leg Repositioning Window Est.</span>
                <span>from €{calculation.emptyLegEstEur.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white/75">
                <span>
                  5-Star Presidential Suites &amp; Sanctuary ({days}d × {guests} guests)
                </span>
                <span className="font-semibold text-white">
                  €{calculation.groundHospitalityEur.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-white/75">
                <span>
                  Sovereign Permits &amp; Protocols ({selectedPrivileges.length} selected)
                </span>
                <span className="font-semibold text-white">
                  €{calculation.privilegesCostEur.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Total Investment */}
            <div className="bg-black/60 border border-[#D4AF37]/40 p-4 mb-6 rounded-sm">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
                  Estimated All-Inclusive Investment
                </span>
                <span className="text-xs text-white/50">
                  ~€{calculation.perGuestEur.toLocaleString()} / guest
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold text-white">
                  €{calculation.totalBespokeEur.toLocaleString()}
                </span>
                <span className="text-sm text-white/60 font-medium">
                  (approx. ${calculation.totalUsd.toLocaleString()} USD)
                </span>
              </div>
              <p className="text-[11px] text-white/50 mt-2 leading-relaxed">
                Includes zero annual membership fees, 100% escrow protection, VIP tarmac fast-track, and dedicated 24/7 German/English/Arabic aviation desk.
              </p>
            </div>

            {/* Included Destination Highlights */}
            <div className="mb-6">
              <h4 className="text-xs uppercase tracking-wider text-white/70 font-semibold mb-2">
                Included in Your {destination.name}:
              </h4>
              <ul className="space-y-1.5">
                {destination.highlights.map((h, i) => (
                  <li key={i} className="text-xs text-white/65 flex items-start gap-2">
                    <span className="text-[#D4AF37] font-bold">✓</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action CTAs */}
            <div className="space-y-3">
              <Link
                href={`/booking?hub=${hub.icao}&dest=${destination.id}&aircraft=${aircraft.id}&guests=${guests}&days=${days}`}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors rounded-sm"
              >
                Lock Tail-Number &amp; Bespoke Dossier
                <ArrowRight size={15} />
              </Link>
              <a
                href={`https://wa.me/201123988882?text=${encodeURIComponent(
                  `Hello Vanir Group Aviation & Concierge Desk, I configured a ${days}-day ${destination.name} from ${hub.city} (${hub.icao}) on a ${aircraft.name} for ${guests} guests (Est. €${calculation.totalBespokeEur.toLocaleString()}). Please send tail numbers and suite availability.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#D4AF37]/40 text-[#D4AF37] font-semibold text-xs uppercase tracking-widest hover:bg-[#D4AF37]/10 transition-colors rounded-sm"
              >
                <Shield size={14} /> Instant WhatsApp Aviation Desk (+20 112 398 8882)
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
