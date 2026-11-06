import { motion } from "framer-motion";
import {
  MapPin,
  Star,
  ArrowRight,
  Plane,
  Shield,
  Clock,
  Crown,
  Compass,
  CheckCircle2,
  Calendar,
  Waves,
  Mountain,
  Landmark,
  Sparkles,
} from "lucide-react";
import { Link, useRoute } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import SovereignJourneyArchitect from "@/components/SovereignJourneyArchitect";

export interface DestinationProfile {
  slug: string;
  name: string;
  nameAr: string;
  country: string;
  tagline: string;
  heroImage: string;
  galleryImages: { url: string; caption: string }[];
  overview: string;
  duration: string;
  priceFrom: string;
  airports: string[];
  highlights: string[];
  itinerary: { day: string; title: string; desc: string }[];
  curatedResidences: { name: string; type: string; image: string; rating: number }[];
  aviationTransfer: string;
}

export const DESTINATION_PROFILES: Record<string, DestinationProfile> = {
  egypt: {
    slug: "egypt",
    name: "Egypt & Private Nile Sanctuary",
    nameAr: "مصر ومحمية النيل الملكية",
    country: "Egypt",
    tagline: "Private Pharaonic access, bespoke Dahabiya Nile charters, and 5-star royal suites.",
    heroImage: "/images/final_cairo_post.png",
    galleryImages: [
      { url: "/images/final_luxor_post.png", caption: "Karnak Temple & Valley of the Kings Private Briefing" },
      { url: "/images/final_aswan_post.png", caption: "Philae Temple at Sunset & Old Cataract Royal Suite" },
      { url: "/images/final_alexandria_post.png", caption: "Mediterranean Royal Palace & Bibliotheca Alexandrina" },
      { url: "/images/final_siwa_post.png", caption: "Siwa Oasis Private Eco-Palace & Salt Lakes" },
    ],
    overview:
      "Experience Egypt with unprecedented sovereign privilege. From private after-hours entry inside the Great Pyramid of Giza to chartered Dahabiyas sailing the tranquil Nile, every moment is managed by Senior Ph.D. Egyptologists and 24/7 personal concierges.",
    duration: "7–10 Days",
    priceFrom: "$4,800",
    airports: ["Cairo VIP (HECA)", "Luxor GAT (HELX)", "Aswan GAT (HESN)", "Abu Simbel (HEBL)"],
    highlights: [
      "Private midnight access between the paws of the Great Sphinx",
      "Full buyout of a luxury 6-cabin Dahabiya sailing Luxor to Aswan",
      "Private flight to Abu Simbel with VIP sunrise monument opening",
      "Tarmac Maybach S680 convoy & diplomatic fast-track immigration",
      "Private curator tour of the Grand Egyptian Museum (GEM) royal treasury",
    ],
    itinerary: [
      {
        day: "Day 1–2",
        title: "Cairo Royal Arrival & The Great Pyramids",
        desc: "Tarmac arrival clearance, Presidential Suite check-in at Four Seasons Nile Plaza. Private midnight access inside the Great Pyramid of Khufu followed by a starlight dinner.",
      },
      {
        day: "Day 3–5",
        title: "Charter Flight to Luxor & Private Dahabiya Buyout",
        desc: "Private flight to Luxor. Board your chartered luxury Dahabiya. Private viewing of Nefertari's tomb in the Valley of the Queens led by our Senior Curator.",
      },
      {
        day: "Day 6–7",
        title: "Sailing Upper Egypt to Aswan & Philae Temple",
        desc: "Gentle private sailing past Kom Ombo and Edfu. Sunset private felucca sail around Elephantine Island. Check into the British Suite at the Historic Old Cataract Hotel.",
      },
      {
        day: "Day 8",
        title: "Abu Simbel Sunrise Flight & Farewell Gala",
        desc: "Early morning charter flight to Abu Simbel before commercial crowds arrive. Private sunset farewell banquet on a secluded Nile island under the Nubian sky.",
      },
    ],
    curatedResidences: [
      { name: "Four Seasons Hotel Cairo at Nile Plaza", type: "Presidential Royal Suite", image: "/images/final_cairo_post.png", rating: 5.0 },
      { name: "Sofitel Legend Old Cataract Aswan", type: "Churchill Historic Suite", image: "/images/final_aswan_post.png", rating: 5.0 },
      { name: "Sanctuary Zein Nile Chateau", type: "Ultra-Private 6-Cabin Dahabiya", image: "/images/final_luxor_post.png", rating: 5.0 },
    ],
    aviationTransfer: "Direct VIP tarmac handling at HECA Cairo with on-demand domestic jet charters.",
  },

  dubai: {
    slug: "dubai",
    name: "Dubai & Emirates Sovereign Desert",
    nameAr: "دبي والإمارات الفاخرة",
    country: "United Arab Emirates",
    tagline: "Royal palatial suites, private desert dune sanctuaries, and Gulfstream charter connectivity.",
    heroImage: "/images/final_dubai_post.png",
    galleryImages: [
      { url: "/images/Luxury Private Jet Interior with Warm Ambient Elegance ✨.jpeg", caption: "VIP Aviation Apron at Dubai Al Maktoum GAT" },
      { url: "/images/Luxury Airport Limo Service in Chicago.jpeg", caption: "Armored Chauffeur Fleet & Supercar Transfers" },
      { url: "/images/vanir_shopping_1.png", caption: "Private After-Hours Haute Horlogerie & High Fashion Concierge" },
      { url: "/images/vanir_nightlife_4.png", caption: "Private Sky Lounge Buyout Overlooking Dubai Skyline" },
    ],
    overview:
      "Immerse yourself in futuristic grandeur and Bedouin sovereignty. Helicopter transfers land directly on your hotel helipad, while private 90ft superyachts cruise the Persian Gulf, complemented by midnight desert glamping in royal conservation reserves.",
    duration: "4–6 Days",
    priceFrom: "$6,200",
    airports: ["Dubai Al Maktoum VIP (OMDW)", "Dubai International (OMDB)", "Abu Dhabi Executive (OMAD)"],
    highlights: [
      "Royal Suite buyout at Burj Al Arab Jumeirah with dedicated 24-karat butler service",
      "Private 90ft Sunseeker superyacht charter around Palm Jumeirah & World Islands",
      "Helicopter transfer from Dubai Al Maktoum GAT directly to your resort helipad",
      "Exclusive royal falconry & private Bedouin oasis dinner under Arabian stars",
      "VIP after-hours shopping suites in The Dubai Mall with private style directors",
    ],
    itinerary: [
      {
        day: "Day 1",
        title: "Helicopter Tarmac Arrival & Burj Al Arab Check-In",
        desc: "Direct airside immigration at Dubai Al Maktoum VIP terminal. AgustaWestland AW109 helicopter transfer directly to the Burj Al Arab helipad.",
      },
      {
        day: "Day 2",
        title: "Private Arabian Gulf Superyacht Voyage",
        desc: "Full-day private charter of a 90ft superyacht with onboard Michelin-trained private chef, watersports suite, and sunset champagne tasting along Dubai Marina.",
      },
      {
        day: "Day 3–4",
        title: "Royal Desert Conservation Reserve Sanctuary",
        desc: "Rolls-Royce Cullinan transfer to a secluded ultra-luxury desert villa. Sunset royal falconry demonstration, dune astronomy, and private bedouin feast.",
      },
      {
        day: "Day 5",
        title: "Abu Dhabi Louvre VIP & Presidential Palace",
        desc: "Private chauffeur transfer to Abu Dhabi. Private viewing of the Louvre Abu Dhabi masterpieces followed by an exclusive tour of Qasr Al Watan.",
      },
    ],
    curatedResidences: [
      { name: "Burj Al Arab Jumeirah", type: "Two-Bedroom Royal Suite", image: "/images/final_dubai_post.png", rating: 5.0 },
      { name: "Bulgari Resort Dubai", type: "Private Beachfront Villa with Marina Berth", image: "/images/vanir_nightlife_4.png", rating: 5.0 },
      { name: "Al Maha Desert Resort & Spa", type: "Presidential Bedouin Villa", image: "/images/final_dubai_post.png", rating: 4.9 },
    ],
    aviationTransfer: "Dedicated private jet slots at OMDW / OMDB with limousine airside access.",
  },

  maldives: {
    slug: "maldives",
    name: "Maldives Ultra-Private Atolls",
    nameAr: "جزر المالديف والمنتجعات المعزولة",
    country: "Maldives",
    tagline: "Secluded overwater residences, private reef diving, and seaplane transfers to your lagoon.",
    heroImage: "/images/final_maldives_post.png",
    galleryImages: [
      { url: "/images/FS-Landaa-Giraavaru-Water-Villa-Maldives.jpeg", caption: "Presidential Overwater Villa with Private Infinity Pool" },
      { url: "/images/four-seasons-lanai.jpeg", caption: "Private Island Lagoon & Turquoise Coral Reefs" },
      { url: "/images/Four-Seasons-Hualalai-1.jpeg", caption: "Exclusive Oceanfront Spa & Wellness Pavilion" },
    ],
    overview:
      "A sanctuary of boundless turquoise waters and complete seclusion. Fly directly over sapphire coral rings in a private VIP seaplane, touch down in a protected lagoon, and unwind in an architectural overwater estate with dedicated sommelier and marine biologists.",
    duration: "5–8 Days",
    priceFrom: "$8,500",
    airports: ["Velana International VIP (VRMM)", "Maafaru International (VRDA)"],
    highlights: [
      "Buyout of a 3-bedroom Overwater Residence with 25-meter lap pool",
      "Private Twin-Otter VIP seaplane transfer directly to your water villa jetty",
      "Private marine biologist expedition to UNESCO Biosphere Reserve Hanifaru Bay",
      "Sandbank midnight gala with bespoke seafood menu prepared by master chef",
      "Overwater private spa pavilion with tailored Ayurvedic treatments",
    ],
    itinerary: [
      {
        day: "Day 1",
        title: "Velana VIP Arrival & Lagoon Seaplane Flight",
        desc: "Meet-and-assist at Male VIP Lounge. Board your private seaplane for a scenic flight over atolls directly to your private island villa jetty.",
      },
      {
        day: "Day 2–3",
        title: "Bespoke Lagoon Sanctuary & Coral Safari",
        desc: "Private breakfast served in your infinity pool. Private yacht cruise to secluded coral reefs for private manta ray and sea turtle diving.",
      },
      {
        day: "Day 4–5",
        title: "Private Deserted Sandbank Buyout",
        desc: "Spend an afternoon stranded in supreme luxury on a private sandbank with Bedouin lounge, iced Krug champagne, and private barbecue chef.",
      },
      {
        day: "Day 6",
        title: "Starlight Sunset Cruise & Farewell Dinner",
        desc: "Sunset champagne catamaran sail with dolphin pods alongside. Five-course farewell dinner at the resort's private underwater dining chamber.",
      },
    ],
    curatedResidences: [
      { name: "Four Seasons Private Island at Voavah", type: "Exclusive Private Island Buyout", image: "/images/FS-Landaa-Giraavaru-Water-Villa-Maldives.jpeg", rating: 5.0 },
      { name: "Cheval Blanc Randheli", type: "Villa Overwater Lagoon", image: "/images/final_maldives_post.png", rating: 5.0 },
      { name: "Soneva Jani", type: "Chapter Two Water Reserve with Slide", image: "/images/FS-Landaa-Giraavaru-Water-Villa-Maldives.jpeg", rating: 4.9 },
    ],
    aviationTransfer: "Direct long-range jet arrivals at VRMM or VRDA with immediate seaplane / yacht transfer.",
  },

  switzerland: {
    slug: "switzerland",
    name: "Switzerland & The Alpine Crest",
    nameAr: "سويسرا وقمم الألب الملكية",
    country: "Switzerland",
    tagline: "St. Moritz private chalets, Matterhorn heli-skiing, and Lake Geneva private estates.",
    heroImage: "/images/Luxury Private Jet Interior with Warm Ambient Elegance ✨.jpeg",
    galleryImages: [
      { url: "/images/final_paris_post.png", caption: "Private Alpine Chalet Living Overlooking Pristine Snow Peaks" },
      { url: "/images/Regent-Seven-Seas-Voyager.jpg", caption: "Lake Geneva Private Riva Yacht Cruise" },
      { url: "/images/GEN006181.jpg", caption: "Matterhorn Mountain Vista at Golden Hour" },
    ],
    overview:
      "Where timeless alpine discretion meets peerless European luxury. From private helicopter flights skimming the peak of the Matterhorn to historic 5-star palace suites in St. Moritz and Gstaad, experience winter and summer in the Swiss Alps with supreme intimacy.",
    duration: "5–7 Days",
    priceFrom: "$9,200",
    airports: ["Zurich VIP (LSZH)", "Geneva GAT (LSGG)", "Samedan St. Moritz (LSZS)"],
    highlights: [
      "Buyout of an ultra-luxury ski-in/ski-out chalet in Zermatt or Gstaad",
      "Private helicopter heli-skiing and glacier landing with certified alpine guide",
      "Glacier Express private VIP panoramic carriage charter",
      "Private watchmaking masterclass at an iconic Geneva manufacture",
      "Private thermal spa buyout with alpine herb therapy",
    ],
    itinerary: [
      {
        day: "Day 1",
        title: "Zurich / Geneva Jet Arrival & Helicopter Transfer",
        desc: "Touch down at Zurich or Geneva GAT. Eurocopter EC135 helicopter transfer directly to the private helipad of your luxury mountain chalet in Zermatt.",
      },
      {
        day: "Day 2–3",
        title: "Matterhorn Heli-Skiing & Glacier Champagne",
        desc: "Exclusive helicopter ascent to untouched alpine powder fields. Private champagne and Swiss fondue picnic served in a heated mountain refuge.",
      },
      {
        day: "Day 4–5",
        title: "St. Moritz Elegance & Historic Palace Buyout",
        desc: "Helicopter transfer to the Engadin Valley. Check in to Badrutt's Palace Hotel. Private bobsleigh run on the historic Cresta Run and evening gala.",
      },
      {
        day: "Day 6",
        title: "Lake Geneva Private Estate Relaxation",
        desc: "Descent to Lake Geneva. Private yacht excursion past Chillon Castle and Michelin 3-star dinner at Hotel de Ville in Crissier.",
      },
    ],
    curatedResidences: [
      { name: "Chalet Zermatt Peak", type: "Ultra-Luxury 5-Bedroom Chalet Buyout", image: "/images/Luxury Private Jet Interior with Warm Ambient Elegance ✨.jpeg", rating: 5.0 },
      { name: "Badrutt's Palace Hotel St. Moritz", type: "The Tower Penthouse Suite", image: "/images/GEN006181.jpg", rating: 5.0 },
      { name: "The Chedi Andermatt", type: "Gotthard Royal Residence", image: "/images/Regent-Seven-Seas-Voyager.jpg", rating: 4.9 },
    ],
    aviationTransfer: "Direct private jet access into Samedan (LSZS) — Europe's highest airport — or Zurich (LSZH).",
  },

  greece: {
    slug: "greece",
    name: "Greece & The Cyclades Riviera",
    nameAr: "اليونان وجزر السيكلاديز الفاخرة",
    country: "Greece",
    tagline: "Santorini cliffside private estates, Aegean catamaran charters, and VIP ancient ruins access.",
    heroImage: "/images/final_santorini_post.png",
    galleryImages: [
      { url: "/images/final_rome_post.png", caption: "Private Caldera Sunset Terrace with Heated Infinity Pool" },
      { url: "/images/GEN009464.jpg", caption: "Aegean Private Catamaran Charter to Delos Island" },
      { url: "/images/GEN010392.jpg", caption: "Mykonos Secluded Beach Villa & Helipad Access" },
    ],
    overview:
      "Perched on the volcanic rim of Santorini or moored in a secret turquoise cove in Mykonos, Greece offers an intoxicating blend of mythology, sapphire Aegean waters, and white-washed architectural masterpieces reserved exclusively for your inner circle.",
    duration: "6–8 Days",
    priceFrom: "$5,900",
    airports: ["Athens VIP (LGAV)", "Santorini Airport (LGSR)", "Mykonos Airport (LGMK)"],
    highlights: [
      "Private cliffside villa buyout in Oia with unobstructed caldera sunset vistas",
      "Full-day private catamaran cruise to the uninhabited sacred island of Delos",
      "Private archaeological access to Akrotiri prehistoric excavations",
      "Inter-island helicopter transfers bypassing all ferry schedules",
      "Private beach cove dinner with Aegean seafood and Greek sommelier pairing",
    ],
    itinerary: [
      {
        day: "Day 1",
        title: "Athens VIP Arrival & Acropolis After-Hours",
        desc: "Tarmac arrival at Athens VIP. Check in to Hotel Grande Bretagne Presidential Suite. Exclusive after-hours private tour of the Parthenon without public entry.",
      },
      {
        day: "Day 2–4",
        title: "Helicopter to Santorini & Caldera Estate",
        desc: "25-minute scenic helicopter flight to Santorini. Settle into your private cliffside villa with infinity pool. Sunset cruise around the volcanic hot springs.",
      },
      {
        day: "Day 5–6",
        title: "Mykonos Private Yacht & Secluded Coves",
        desc: "Private 70ft Riva yacht transfer to Mykonos. Mooring at secluded beaches, private daybed reservation at Nammos, and private villa cliff dinner.",
      },
      {
        day: "Day 7",
        title: "Delos Sacred Sanctuary & Sunset Gala",
        desc: "Morning cruise to sacred Delos for a private tour with Greece's leading classical scholar. Farewell champagne gala overlooking Little Venice.",
      },
    ],
    curatedResidences: [
      { name: "Canaves Oia Epitome", type: "Villa with Private Heated Pool", image: "/images/final_santorini_post.png", rating: 5.0 },
      { name: "Santa Marina Mykonos", type: "Villa Horizon with Private Beach Access", image: "/images/GEN010392.jpg", rating: 4.9 },
      { name: "Amanzoe Peloponnese", type: "Four-Bedroom Villa with 360° Aegean Views", image: "/images/final_santorini_post.png", rating: 5.0 },
    ],
    aviationTransfer: "Direct private jet landings at LGSR Santorini and LGMK Mykonos with dedicated handling.",
  },

  italy: {
    slug: "italy",
    name: "Italy & The Amalfi Coastline",
    nameAr: "إيطاليا وساحل أمالفي وبحيرة كومو",
    country: "Italy",
    tagline: "Lake Como historic villa buyouts, vintage Riva speedboat charters, and private Vatican tours.",
    heroImage: "/images/final_rome_post.png",
    galleryImages: [
      { url: "/images/final_paris_post.png", caption: "Lake Como 16th-Century Waterfront Palazzo Gardens" },
      { url: "/images/final_london_post.png", caption: "Amalfi Coastline Clifftop Estate in Positano" },
      { url: "/images/Regent-Seven-Seas-Voyager.jpg", caption: "Vintage Riva Aquarama Speedboat Charter" },
    ],
    overview:
      "A tribute to 'La Dolce Vita' rendered in the highest key of refinement. Cruise the mirror-like waters of Lake Como in a mahogany Riva Aquarama, walk through the Sistine Chapel in absolute solitude after hours, and retreat to clifftop palazzos overlooking Positano.",
    duration: "7–10 Days",
    priceFrom: "$7,400",
    airports: ["Rome Ciampino VIP (LIRA)", "Milan Linate (LIML)", "Naples Capodichino (LIRN)"],
    highlights: [
      "Full buyout of a 16th-century historic palazzo on the shores of Lake Como",
      "Private vintage Riva Aquarama speedboat charter with captain and champagne bar",
      "After-hours private access to the Sistine Chapel and Vatican secret archives",
      "Private Chianti vineyard estate buyout with master winemaker barrel tasting",
      "Helicopter transfers from Milan to Lake Como and Florence to Positano",
    ],
    itinerary: [
      {
        day: "Day 1–2",
        title: "Rome Imperial Splendor & The Vatican After-Hours",
        desc: "VIP arrival at Rome Ciampino. Hotel de Russie Nijinsky Suite. Private evening entry into the Sistine Chapel and Vatican Museums with no other visitors present.",
      },
      {
        day: "Day 3–5",
        title: "Helicopter to Lake Como & Historic Villa Buyout",
        desc: "Helicopter flight directly to Lake Como. Private check-in at Villa d'Este or private waterfront palazzo. Private Riva Aquarama cruise to Bellagio.",
      },
      {
        day: "Day 6–7",
        title: "Tuscan Vineyard Sanctuary & Truffle Hunting",
        desc: "Chauffeur transfer to a private 500-acre estate in Montalcino. Private truffle hunting with master hounds followed by Brunello vintage tasting.",
      },
      {
        day: "Day 8–10",
        title: "Amalfi Coastline & Clifftop Positano Sanctuary",
        desc: "Helicopter transfer to the Amalfi Coast. Stay at Le Sirenuse in the Two-Bedroom Suite. Private yacht cruise around Capri and the Faraglioni rocks.",
      },
    ],
    curatedResidences: [
      { name: "Villa d'Este Lake Como", type: "Villa Cima Private Lakefront Palazzo", image: "/images/final_rome_post.png", rating: 5.0 },
      { name: "Le Sirenuse Positano", type: "Two-Bedroom Sea View Terrace Suite", image: "/images/final_london_post.png", rating: 5.0 },
      { name: "Rosewood Castiglion del Bosco", type: "Private Tuscan Villa with Heated Pool", image: "/images/final_paris_post.png", rating: 4.9 },
    ],
    aviationTransfer: "Fast-track handling at Milan Linate (LIML) and Rome Ciampino (LIRA) with direct helicopter hookups.",
  },
};

export default function DestinationDetail({ slug }: { slug?: string }) {
  const [, params] = useRoute("/destinations/:slug");
  const targetSlug = slug || params?.slug || "egypt";
  const profile = DESTINATION_PROFILES[targetSlug.toLowerCase()] || DESTINATION_PROFILES["egypt"];

  return (
    <>
      <Navbar />
      <PageMeta
        title={`${profile.name} — Luxury Bespoke Travel & Private Jet | Vanir Group`}
        description={profile.tagline}
        keywords={`${profile.name}, luxury ${profile.country} tours, private jet ${profile.country}, ${profile.slug} travel`}
        canonicalPath={`/destinations/${profile.slug}`}
      />

      <div className="min-h-screen bg-[#07090e] text-white">
        {/* ─── Hero Section with High-Resolution Imagery ─── */}
        <section className="relative pt-32 pb-24 md:pt-44 md:pb-36 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={profile.heroImage}
              alt={profile.name}
              className="w-full h-full object-cover object-center filter brightness-65 scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/60 to-black/70" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
          </div>

          <div className="container relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-[#E5C378]/40 backdrop-blur-md mb-6">
              <Compass size={14} className="text-[#E5C378]" />
              <span className="text-xs uppercase tracking-[0.25em] text-[#E5C378] font-bold">
                CURATED SOVEREIGN SANCTUARY • {profile.country.toUpperCase()}
              </span>
            </div>

            <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] max-w-4xl">
              {profile.name}
            </h1>

            <p className="text-white/80 text-lg sm:text-xl max-w-3xl leading-relaxed mb-10">
              {profile.tagline}
            </p>

            {/* Rainbow Spectrum Search & Booking Quick Bar */}
            <div className="rainbow-glow-border max-w-2xl p-[2px] rounded-xl mb-12 shadow-[0_0_30px_rgba(0,223,216,0.25)]">
              <div className="bg-[#0b0e17] rounded-[10px] p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <MapPin size={20} className="text-[#E5C378] shrink-0 ml-2" />
                  <div className="text-left">
                    <span className="text-xs text-white/50 uppercase tracking-widest block">Selected Sanctuary</span>
                    <span className="text-sm font-bold text-white">{profile.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-white/50 block">Pricing from</span>
                    <span className="text-base font-bold text-[#E5C378]">{profile.priceFrom} / guest</span>
                  </div>
                  <a
                    href="#architect"
                    className="px-6 py-3 bg-gradient-to-r from-[#F3D794] via-[#E5C378] to-[#B8860B] text-black font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all rounded-md shadow-md shrink-0 inline-flex items-center gap-2"
                  >
                    Charter Journey <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl">
              <div className="bg-white/5 border border-white/10 p-4 rounded-lg backdrop-blur-md">
                <span className="text-xs text-white/50 block">Recommended Duration</span>
                <span className="text-lg font-bold text-white mt-1 block flex items-center gap-1.5">
                  <Clock size={16} className="text-[#E5C378]" /> {profile.duration}
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-lg backdrop-blur-md">
                <span className="text-xs text-white/50 block">Guest Rating</span>
                <span className="text-lg font-bold text-white mt-1 block flex items-center gap-1.5">
                  <Star size={16} className="text-[#E5C378] fill-[#E5C378]" /> 4.98 / 5.0
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-lg backdrop-blur-md">
                <span className="text-xs text-white/50 block">Discretion Protocol</span>
                <span className="text-lg font-bold text-white mt-1 block flex items-center gap-1.5">
                  <Shield size={16} className="text-[#E5C378]" /> Sovereign 100%
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-lg backdrop-blur-md">
                <span className="text-xs text-white/50 block">Private Air Clearance</span>
                <span className="text-lg font-bold text-white mt-1 block flex items-center gap-1.5">
                  <Plane size={16} className="text-[#E5C378]" /> GAT Approved
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Curated Destination Gallery (Real Distinct Images!) ─── */}
        <section className="py-20 bg-[#06080d] border-t border-white/5">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-[#E5C378] font-bold block mb-2">
                  EXCLUSIVE VISUAL ARCHIVE
                </span>
                <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-white">
                  Signature Perspectives &amp; Residences
                </h2>
              </div>
              <p className="text-white/60 text-sm max-w-md mt-4 md:mt-0">
                Every residence and excursion is vetted and certified by Vanir Group aviation and hospitality specialists.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {profile.galleryImages.map((img, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -6 }}
                  className="group relative rounded-xl overflow-hidden border border-white/10 bg-[#0c1018]"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-4 bg-[#0a0d14]">
                    <p className="text-xs text-white/80 font-medium leading-relaxed">
                      {img.caption}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Highlights & Private Aviation Access ─── */}
        <section className="py-20 bg-[#090c13] border-t border-white/5">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-[#E5C378] font-bold block mb-2">
                  THE VANIR SOVEREIGN ADVANTAGE
                </span>
                <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-white mb-6">
                  What Sets This Experience Apart
                </h2>
                <p className="text-white/70 leading-relaxed mb-8">
                  {profile.overview}
                </p>

                <div className="space-y-4">
                  {profile.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3.5">
                      <div className="w-5 h-5 rounded-full bg-[#E5C378]/10 border border-[#E5C378]/40 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 size={13} className="text-[#E5C378]" />
                      </div>
                      <span className="text-sm text-white/90 leading-relaxed font-medium">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Private Aviation Card */}
              <div className="bg-[#0e1320] border border-[#E5C378]/30 p-8 rounded-2xl relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#E5C378]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#E5C378]/10 border border-[#E5C378]/30 flex items-center justify-center">
                    <Plane size={24} className="text-[#E5C378]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Private Aviation Logistics</h3>
                    <p className="text-xs text-white/50">Dedicated Air Charter Operations Desk</p>
                  </div>
                </div>

                <p className="text-sm text-white/70 leading-relaxed mb-6">
                  {profile.aviationTransfer}
                </p>

                <div className="space-y-2 mb-6">
                  <span className="text-xs uppercase tracking-wider text-white/40 block font-semibold">Direct Airfield Gateways</span>
                  <div className="flex flex-wrap gap-2">
                    {profile.airports.map((apt, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-[#E5C378] font-mono">
                        {apt}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href="/contact"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-white/10 border border-[#E5C378]/40 text-white font-bold text-xs uppercase tracking-widest hover:bg-[#E5C378] hover:text-black transition-all rounded-md"
                >
                  Request Tail-Number Allocation <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Day-by-Day Private Itinerary ─── */}
        <section className="py-20 bg-[#06080d] border-t border-white/5">
          <div className="container max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <span className="text-xs uppercase tracking-[0.25em] text-[#E5C378] font-bold block mb-2">
                DAY-BY-DAY EXCELLENCE
              </span>
              <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-white mb-4">
                Curated Sovereign Itinerary
              </h2>
              <p className="text-white/60 text-sm max-w-xl mx-auto">
                Every itinerary is completely flexible and customizable to your schedule, security preferences, and aircraft specifications.
              </p>
            </div>

            <div className="relative border-l border-white/10 ml-4 md:ml-32 space-y-12">
              {profile.itinerary.map((item, idx) => (
                <div key={idx} className="relative pl-8 md:pl-12">
                  <div className="absolute -left-3.5 top-1.5 w-7 h-7 rounded-full bg-[#0a0d15] border-2 border-[#E5C378] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#E5C378]">{idx + 1}</span>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#E5C378] uppercase tracking-wider block mb-1">
                    {item.day}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed max-w-3xl">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Curated Residences & Buyouts ─── */}
        <section className="py-20 bg-[#090c13] border-t border-white/5">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <span className="text-xs uppercase tracking-[0.25em] text-[#E5C378] font-bold block mb-2">
                ACCOMMODATIONS OF DISTINCTION
              </span>
              <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-white mb-4">
                Curated Palaces &amp; Presidential Suites
              </h2>
              <p className="text-white/60 text-sm max-w-xl mx-auto">
                We secure full floor and private villa buyouts with dedicated butler service and discrete private security cordons.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {profile.curatedResidences.map((res, i) => (
                <div key={i} className="bg-[#0d111a] border border-white/10 rounded-xl overflow-hidden hover:border-[#E5C378]/40 transition-all duration-300">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={res.image} alt={res.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-1 text-[#E5C378] text-xs font-bold mb-2">
                      <Star size={13} className="fill-[#E5C378]" /> {res.rating} Five-Star Certified
                    </div>
                    <h4 className="text-white font-bold text-base mb-1">{res.name}</h4>
                    <p className="text-xs text-white/50">{res.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Interactive Journey Architect ─── */}
        <div id="architect">
          <SovereignJourneyArchitect />
        </div>

        {/* ─── Switch to Other Destinations ─── */}
        <section className="py-16 bg-[#06080d] border-t border-white/10">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <h3 className="text-xs uppercase tracking-[0.25em] text-[#E5C378] font-bold mb-6">
              EXPLORE OTHER SOVEREIGN SANCTUARIES
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {Object.values(DESTINATION_PROFILES)
                .filter((p) => p.slug !== profile.slug)
                .map((dest) => (
                  <Link
                    key={dest.slug}
                    href={`/destinations/${dest.slug}`}
                    className="px-5 py-2.5 rounded-full bg-white/5 border border-white/15 text-white/80 hover:text-white hover:border-[#E5C378] hover:bg-white/10 text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    {dest.name}
                  </Link>
                ))}
              <Link
                href="/destinations"
                className="px-5 py-2.5 rounded-full bg-[#E5C378]/10 border border-[#E5C378]/40 text-[#E5C378] hover:bg-[#E5C378] hover:text-black text-xs font-bold uppercase tracking-wider transition-all"
              >
                View Full Catalog →
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
