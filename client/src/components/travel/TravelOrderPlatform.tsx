import React, { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ASSETS } from "@/config/assets";
import { searchLiveFlights, searchLiveHotels, type LiveFlightOffer } from "@/lib/liveTravelApi";
import { OrderDetailView } from "./OrderDetailView";
import { StrictPaymentCheckout } from "./StrictPaymentCheckout";
import { resolveUserAvatar } from "@/lib/pharaonicAvatars";
import { toast } from "sonner";
import {
  Plane,
  Building2,
  Sparkles,
  Palmtree,
  Car,
  Compass,
  Tag,
  Search,
  Calendar,
  Users,
  Star,
  MapPin,
  SlidersHorizontal,
  LayoutGrid,
  List as ListIcon,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ShieldCheck,
  Clock,
  Luggage,
  CreditCard,
  Leaf,
  Printer,
  FileText,
  LifeBuoy,
  Package,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Download,
  ArrowLeft,
  Armchair,
  Bell,
  Mail,
  MessageSquare,
  BarChart3,
  Landmark,
  FolderOpen,
  UserCircle,
  Receipt,
  BookOpen,
  CalendarDays,
  CheckSquare,
  Settings,
  Menu,
  AppWindow,
} from "lucide-react";

export type PlatformMode = "client" | "admin";
type ServiceTab = "flights" | "hotels" | "design" | "holiday" | "transfers" | "activities" | "vip_services" | "offers";
type ClientStep = "search" | "details" | "checkout" | "confirmed";

interface VipExtraService {
  id: string;
  title: string;
  category: string;
  badge: string;
  price: number;
  unit: string;
  description: string;
  image: string;
}

const VIP_EXTRA_SERVICES: VipExtraService[] = [
  {
    id: "vip_fast_track",
    title: "VIP Airport Fast Track & Private Lounge",
    category: "Airport VIP",
    badge: "Most Popular",
    price: 180,
    unit: "per booking",
    description: "Meet & Greet at aircraft gate, private VIP lounge access, and expedited passport & customs clearance.",
    image: "/images/vip-generated/vip_fast_track.jpg",
  },
  {
    id: "vip_private_jet",
    title: "Private Jet / Helicopter Transfer Upgrade",
    category: "Aviation",
    badge: "Ultra-VIP",
    price: 2400,
    unit: "per flight",
    description: "Seamless private charter or helicopter transfer directly from airport tarmac to resort helipad.",
    image: "/images/vip-generated/vip_private_jet.jpg",
  },
  {
    id: "vip_maybach_chauffeur",
    title: "Full-Day Mercedes-Maybach Chauffeur",
    category: "Chauffeur",
    badge: "Executive",
    price: 320,
    unit: "per day",
    description: "Dedicated multilingual chauffeur with flagship Maybach S-Class on standby throughout your stay.",
    image: "/images/vip-generated/vip_maybach_chauffeur.jpg",
  },
  {
    id: "vip_royal_suite_setup",
    title: "Royal Suite Setup & Late Check-out (6 PM)",
    category: "In-Stay Luxury",
    badge: "Guest Favorite",
    price: 150,
    unit: "per stay",
    description: "Guaranteed early check-in / 6 PM late check-out, floral suite styling, and artisanal welcome hospitality.",
    image: "/images/vip-generated/vip_royal_suite_setup.jpg",
  },
  {
    id: "vip_private_yacht",
    title: "Private Sunset Yacht & Chef Experience",
    category: "Yachting",
    badge: "Signature",
    price: 850,
    unit: "per charter",
    description: "Half-day private luxury yacht voyage with onboard chef, chilled refreshments, and coastal itinerary.",
    image: "/images/vip-generated/vip_private_yacht.jpg",
  },
  {
    id: "vip_private_guide",
    title: "Personal Butler & Private Egyptologist",
    category: "Concierge",
    badge: "Bespoke",
    price: 250,
    unit: "per day",
    description: "Dedicated personal concierge or private historian guide with priority access to heritage landmarks.",
    image: "/images/vip-generated/vip_private_guide.jpg",
  },
  {
    id: "vip_esim_insurance",
    title: "Global 5G eSIM & VIP Travel Insurance",
    category: "Travel Essentials",
    badge: "Instant Setup",
    price: 95,
    unit: "per traveler",
    description: "Unlimited high-speed global 5G eSIM activated before landing plus comprehensive cancellation coverage.",
    image: "/images/vip-generated/vip_esim_insurance.jpg",
  },
  {
    id: "vip_diplomatic_visa",
    title: "Diplomatic Visa & Fast-Track Protocol",
    category: "Diplomatic",
    badge: "24/7 Desk",
    price: 160,
    unit: "per traveler",
    description: "End-to-end visa processing, official invitation letters, and embassy protocol coordination.",
    image: "/images/vip-generated/vip_diplomatic_visa.jpg",
  },
];
type AdminSection = "create" | "orders" | "activities" | "suppliers" | "tickets";
type DetailsTab = "overview" | "rooms" | "amenities" | "reviews";
type SortBy = "popular" | "rating_desc" | "price_desc" | "price_asc";

interface RoomOption {
  id: string;
  name: string;
  recommended?: boolean;
  refundable: boolean;
  mealPlan: "RO" | "BB" | "HB" | "FB" | "AI";
  pricePerNight: number;
  inclusions: string[];
  image: string;
}

interface HotelCatalogItem {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  stars: number;
  reviewScore: number;
  reviewsCount: number;
  distanceKm: number;
  discountPct: number;
  payLater: boolean;
  pricePerNight: number;
  mealPlans: ("RO" | "BB" | "HB" | "FB" | "AI")[];
  image: string;
  gallery: string[];
  amenities: string[];
  highlights: string[];
  rooms: RoomOption[];
}

interface TransferOption {
  id: string;
  name: string;
  category: string;
  passengers: number;
  luggage: number;
  airportRate: number;
  hourlyRate: number;
  city: string;
  image: string;
}

interface ActivityItem {
  id: string;
  title: string;
  city: string;
  duration: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPct?: number;
  description: string;
  image: string;
  refundable: boolean;
}

interface GuestForm {
  title: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
}

const DEFAULT_HOTELS: HotelCatalogItem[] = [
  {
    id: "htl_saii_maldives",
    name: "SAii Lagoon Maldives, Curio Collection by Hilton",
    city: "Male Atoll",
    country: "Maldives",
    address: "Bandos Island, 08480 North Male Atoll, Maldives",
    stars: 5,
    reviewScore: 9.2,
    reviewsCount: 108,
    distanceKm: 8,
    discountPct: 27,
    payLater: true,
    pricePerNight: 480,
    mealPlans: ["RO", "BB", "HB", "FB", "AI"],
    image: "/images/hotels-real/luxury_villa_pool.jpg",
    gallery: [
      "/images/hotels-real/luxury_villa_pool.jpg",
      "/images/hotels-real/caimn-guestroom-0037-hor-clsc.webp",
      "/images/hotels-real/caimn-view-0063-hor-clsc.webp",
      "/images/hotels-real/caimn-lobby-8343-hor-clsc.webp",
    ],
    amenities: ["Jacuzzi", "Spa", "Swimming Pool", "Gym", "Private Beach", "Water Sports", "Shuttle Service", "Kids' Meals"],
    highlights: [
      "Offers stunning ocean views from private villas and infinity pool.",
      "On-site dining outlets include the Beach Club with private beach access.",
      "Great for families and couples with spa, water sports, and dive centre.",
      "Direct speedboat transfers from Velana International Airport.",
    ],
    rooms: [
      {
        id: "rm_twin_sky",
        name: "Twin Sky Room",
        recommended: true,
        refundable: false,
        mealPlan: "FB",
        pricePerNight: 480,
        inclusions: ["All meals - Breakfast, Lunch & Dinner", "Free use of Kayak & Snorkel gear", "25% off on Transfers for 4+ nights"],
        image: "/images/hotels-real/caimn-guestroom-0037-hor-clsc.webp",
      },
      {
        id: "rm_deluxe_villa",
        name: "Deluxe Beachfront Villa",
        refundable: true,
        mealPlan: "AI",
        pricePerNight: 690,
        inclusions: ["All Inclusive dining & beverages", "Free Airport Speedboat Transfer", "Complimentary Spa Credit ($100)"],
        image: "/images/hotels-real/luxury_villa_pool.jpg",
      },
    ],
  },
  {
    id: "htl_fs_nile",
    name: "Four Seasons Hotel Cairo at Nile Plaza",
    city: "Cairo",
    country: "Egypt",
    address: "1089 Corniche El Nil, Garden City, Cairo, Egypt",
    stars: 5,
    reviewScore: 9.4,
    reviewsCount: 342,
    distanceKm: 2,
    discountPct: 18,
    payLater: true,
    pricePerNight: 420,
    mealPlans: ["RO", "BB", "HB", "FB"],
    image: "/images/hotels-real/caimn-view-0063-hor-clsc.webp",
    gallery: [
      "/images/hotels-real/caimn-view-0063-hor-clsc.webp",
      "/images/hotels-real/caimn-lobby-8343-hor-clsc.webp",
      "/images/hotels-real/caimn-guestroom-0037-hor-clsc.webp",
    ],
    amenities: ["Spa", "Swimming Pool", "Gym", "Nile View Terrace", "VIP Concierge", "Airport Limousine", "Fine Dining"],
    highlights: [
      "Panoramic Nile River & Citadel views from private marble balconies.",
      "24/7 Vanir VIP Concierge & private Pyramids chauffeur access.",
      "Award-winning spa, heated outdoor pool, and 5 signature restaurants.",
    ],
    rooms: [
      {
        id: "rm_nile_diplomatic",
        name: "Nile View Diplomatic Suite",
        recommended: true,
        refundable: true,
        mealPlan: "BB",
        pricePerNight: 420,
        inclusions: ["Daily Gourmet Breakfast for 2", "Late Check-out until 3 PM", "VIP Fast-Track Airport Meet & Greet"],
        image: "/images/hotels-real/caimn-guestroom-0037-hor-clsc.webp",
      },
      {
        id: "rm_presidential_nile",
        name: "Royal Nile Penthouse",
        refundable: true,
        mealPlan: "HB",
        pricePerNight: 950,
        inclusions: ["Half Board Fine Dining", "Private Maybach Airport Transfer", "Dedicated Butler Service"],
        image: "/images/hotels-real/caimn-view-0063-hor-clsc.webp",
      },
    ],
  },
  {
    id: "htl_burj_arab",
    name: "Burj Al Arab Jumeirah",
    city: "Dubai",
    country: "UAE",
    address: "Jumeirah St, Umm Suqeim 3, Dubai, United Arab Emirates",
    stars: 5,
    reviewScore: 9.6,
    reviewsCount: 512,
    distanceKm: 12,
    discountPct: 15,
    payLater: true,
    pricePerNight: 1450,
    mealPlans: ["BB", "HB", "AI"],
    image: "/images/hotels-real/burj_al_arab.jpg",
    gallery: [
      "/images/hotels-real/burj_al_arab.jpg",
      "/images/hotels-real/luxury_hotel_suite.jpg",
    ],
    amenities: ["Jacuzzi", "Spa", "Swimming Pool", "Helipad", "Private Beach", "Rolls-Royce Fleet", "Butler Service"],
    highlights: [
      "Iconic sail-shaped ultra-luxury suites overlooking the Arabian Gulf.",
      "Private butler service on every floor and Talise Spa access.",
      "Complimentary Wild Wadi Waterpark & private beach cabanas.",
    ],
    rooms: [
      {
        id: "rm_burj_duplex",
        name: "Deluxe One-Bedroom Duplex Suite",
        recommended: true,
        refundable: true,
        mealPlan: "BB",
        pricePerNight: 1450,
        inclusions: ["24-hour Private Butler", "Hermès Amenity Collection", "Breakfast at Bab Al Yam"],
        image: "/images/hotels-real/burj_al_arab.jpg",
      },
    ],
  },
  {
    id: "htl_damac_dubai",
    name: "DAMAC Maison Mall Street",
    city: "Dubai",
    country: "UAE",
    address: "Mohammed Bin Rashid Boulevard, Downtown Dubai, UAE",
    stars: 5,
    reviewScore: 8.7,
    reviewsCount: 215,
    distanceKm: 1,
    discountPct: 27,
    payLater: true,
    pricePerNight: 340,
    mealPlans: ["RO", "BB", "HB"],
    image: "/images/hotels-real/luxury_hotel_suite.jpg",
    gallery: [
      "/images/hotels-real/luxury_hotel_suite.jpg",
      "/images/hotels-real/burj_al_arab.jpg",
    ],
    amenities: ["Swimming Pool", "Spa", "Gym", "Kids Club", "Valet Parking", "Dubai Mall Shuttle"],
    highlights: [
      "Steps away from The Dubai Mall, Burj Khalifa & Dubai Fountain.",
      "Spacious family residences with full kitchen and skyline views.",
    ],
    rooms: [
      {
        id: "rm_damac_3br",
        name: "3-Bedroom Royal Apartment",
        recommended: true,
        refundable: true,
        mealPlan: "BB",
        pricePerNight: 340,
        inclusions: ["Buffet Breakfast Included", "Free Shuttle to Dubai Mall", "Complimentary Kids Club"],
        image: "/images/hotels-real/luxury_hotel_suite.jpg",
      },
    ],
  },
  {
    id: "htl_ritz_paris",
    name: "Ritz Paris — Place Vendôme",
    city: "Paris",
    country: "France",
    address: "15 Place Vendôme, 75001 Paris, France",
    stars: 5,
    reviewScore: 9.7,
    reviewsCount: 418,
    distanceKm: 1,
    discountPct: 15,
    payLater: true,
    pricePerNight: 1250,
    mealPlans: ["RO", "BB", "HB"],
    image: "/images/hotels-real/ritz_paris.jpg",
    gallery: ["/images/hotels-real/ritz_paris.jpg", "/images/hotels-real/luxury_hotel_suite.jpg"],
    amenities: ["Spa", "Swimming Pool", "Gym", "Bar Hemingway", "Butler Service", "Airport Limousine"],
    highlights: [
      "Legendary Parisian palace hotel in the heart of Place Vendôme.",
      "Chanel au Ritz Paris Spa & Michelin-starred gastronomy.",
    ],
    rooms: [
      {
        id: "rm_ritz_prestige",
        name: "Prestige Vendôme Suite",
        recommended: true,
        refundable: true,
        mealPlan: "BB",
        pricePerNight: 1250,
        inclusions: ["Champagne Welcome", "Daily Parisian Breakfast", "Private Chauffeur Transfer"],
        image: "/images/hotels-real/ritz_paris.jpg",
      },
    ],
  },
  {
    id: "htl_winter_palace",
    name: "Sofitel Winter Palace Luxor",
    city: "Luxor",
    country: "Egypt",
    address: "Corniche El Nil Street, Luxor, Egypt",
    stars: 5,
    reviewScore: 9.0,
    reviewsCount: 276,
    distanceKm: 2,
    discountPct: 22,
    payLater: true,
    pricePerNight: 290,
    mealPlans: ["RO", "BB", "HB", "FB"],
    image: "/images/hotels-real/winter_palace_luxor.jpg",
    gallery: ["/images/hotels-real/winter_palace_luxor.jpg", "/images/hotels-real/caimn-view-0063-hor-clsc.webp"],
    amenities: ["Swimming Pool", "Botanical Gardens", "Nile View", "Fine Dining", "Concierge"],
    highlights: [
      "Historic 1886 Victorian palace overlooking the Nile & West Bank.",
      "Lush royal gardens and private felucca sunset departures.",
    ],
    rooms: [
      {
        id: "rm_wp_nile",
        name: "Luxury Nile View Room",
        recommended: true,
        refundable: true,
        mealPlan: "BB",
        pricePerNight: 290,
        inclusions: ["Breakfast on the Royal Terrace", "Private Temple Tour Access"],
        image: "/images/hotels-real/winter_palace_luxor.jpg",
      },
    ],
  },
  {
    id: "htl_fs_hualalai",
    name: "Four Seasons Resort Hualalai",
    city: "Hawaii",
    country: "USA",
    address: "72-100 Ka'upulehu Drive, Kailua-Kona, HI, USA",
    stars: 5,
    reviewScore: 9.5,
    reviewsCount: 192,
    distanceKm: 14,
    discountPct: 20,
    payLater: true,
    pricePerNight: 980,
    mealPlans: ["RO", "BB", "HB"],
    image: "/images/Four-Seasons-Hualalai-1.jpeg",
    gallery: ["/images/Four-Seasons-Hualalai-1.jpeg", "/images/hotels-real/luxury_chalet_beach.jpg"],
    amenities: ["Jacuzzi", "Spa", "Swimming Pool", "Golf Course", "Private Beach"],
    highlights: [
      "Oceanfront Kona-Kohala resort with 7 pools & championship golf.",
      "Private helicopter excursions over volcanic coastlines.",
    ],
    rooms: [
      {
        id: "rm_hualalai_ocean",
        name: "Oceanfront Prime Bungalow",
        recommended: true,
        refundable: true,
        mealPlan: "BB",
        pricePerNight: 980,
        inclusions: ["Daily Breakfast", "Outrigger Canoe Experience"],
        image: "/images/Four-Seasons-Hualalai-1.jpeg",
      },
    ],
  },
  {
    id: "htl_fs_punta_mita",
    name: "Four Seasons Resort Punta Mita",
    city: "Punta Mita",
    country: "Mexico",
    address: "Bahia de Banderas, Nayarit, Mexico",
    stars: 4,
    reviewScore: 8.9,
    reviewsCount: 164,
    distanceKm: 10,
    discountPct: 25,
    payLater: true,
    pricePerNight: 620,
    mealPlans: ["BB", "HB", "AI"],
    image: "/images/FS_Punta_Mita.jpg",
    gallery: ["/images/FS_Punta_Mita.jpg", "/images/hotels-real/luxury_villa_pool.jpg"],
    amenities: ["Spa", "Swimming Pool", "Private Beach", "Surfing", "Kids Club"],
    highlights: [
      "Clifftop casitas overlooking the Pacific Ocean & Marietas Islands.",
    ],
    rooms: [
      {
        id: "rm_punta_casita",
        name: "Ocean View Casita",
        recommended: true,
        refundable: true,
        mealPlan: "HB",
        pricePerNight: 620,
        inclusions: ["Half Board Dining", "Private Beach Cabana"],
        image: "/images/FS_Punta_Mita.jpg",
      },
    ],
  },
  {
    id: "htl_london_mayfair",
    name: "The Mayfair Sovereign Residence",
    city: "London",
    country: "UK",
    address: "Grosvenor Square, Mayfair, London, UK",
    stars: 4,
    reviewScore: 8.6,
    reviewsCount: 140,
    distanceKm: 2,
    discountPct: 18,
    payLater: true,
    pricePerNight: 460,
    mealPlans: ["RO", "BB"],
    image: "/images/hotels-real/caixr-king-guestroom-9567_Classic-Hor.jpeg",
    gallery: ["/images/hotels-real/caixr-king-guestroom-9567_Classic-Hor.jpeg"],
    amenities: ["Gym", "Concierge", "Airport Limousine", "Fine Dining"],
    highlights: [
      "Steps from Bond Street & Hyde Park with bespoke chauffeur service.",
    ],
    rooms: [
      {
        id: "rm_mayfair_king",
        name: "Mayfair King Suite",
        recommended: true,
        refundable: true,
        mealPlan: "BB",
        pricePerNight: 460,
        inclusions: ["Full English Breakfast", "Heathrow VIP Fast Track"],
        image: "/images/hotels-real/caixr-king-guestroom-9567_Classic-Hor.jpeg",
      },
    ],
  },
  {
    id: "htl_bali_cliff",
    name: "Uluwatu Cliffside Sanctuary",
    city: "Bali",
    country: "Indonesia",
    address: "Jalan Goa Lempeh, Uluwatu, Bali, Indonesia",
    stars: 3,
    reviewScore: 8.3,
    reviewsCount: 95,
    distanceKm: 18,
    discountPct: 30,
    payLater: true,
    pricePerNight: 210,
    mealPlans: ["RO", "BB", "AI"],
    image: "/images/hotels-real/luxury_chalet_beach.jpg",
    gallery: ["/images/hotels-real/luxury_chalet_beach.jpg"],
    amenities: ["Swimming Pool", "Spa", "Yoga Pavilion", "Airport Transfer"],
    highlights: [
      "Boutique clifftop retreat with private plunge pool and ocean sunset deck.",
    ],
    rooms: [
      {
        id: "rm_bali_plunge",
        name: "Private Plunge Pool Villa",
        recommended: true,
        refundable: true,
        mealPlan: "BB",
        pricePerNight: 210,
        inclusions: ["Floating Breakfast Included", "Airport Pickup"],
        image: "/images/hotels-real/luxury_chalet_beach.jpg",
      },
    ],
  },
];

const DEFAULT_TRANSFERS: TransferOption[] = [
  {
    id: "tr_limo",
    name: "Limousine (Mercedes-Maybach S680)",
    category: "Ultra-Luxury Sedan",
    passengers: 3,
    luggage: 3,
    airportRate: 180,
    hourlyRate: 95,
    city: "Cairo / Dubai / Paris / London",
    image: "/images/vip-generated/car_maybach_s680.jpg",
  },
  {
    id: "tr_suv",
    name: "Royal SUV (Rolls-Royce Cullinan VIP)",
    category: "Flagship VIP SUV",
    passengers: 4,
    luggage: 4,
    airportRate: 260,
    hourlyRate: 140,
    city: "Dubai / London / Geneva / Cairo",
    image: "/images/vip-generated/car_vip_suv.jpg",
  },
  {
    id: "tr_sedan",
    name: "Executive Sedan (Mercedes E-Class)",
    category: "Executive Sedan",
    passengers: 3,
    luggage: 3,
    airportRate: 95,
    hourlyRate: 55,
    city: "Cairo / Dubai / Rome / Istanbul",
    image: "/images/vip-generated/car_mercedes_eclass.jpg",
  },
  {
    id: "tr_minivan",
    name: "Business Minivan (Mercedes V-Class)",
    category: "VIP Delegation Van",
    passengers: 6,
    luggage: 6,
    airportRate: 135,
    hourlyRate: 75,
    city: "Cairo / Dubai / Maldives / Zurich",
    image: "/images/vip-generated/car_mercedes_vclass.jpg",
  },
];

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    id: "act_museum_future",
    title: "Museum of the Future VIP Timed Entry",
    city: "Dubai",
    duration: "2 - 3 Hours",
    category: "Cultural & Landmark",
    price: 95,
    originalPrice: 120,
    discountPct: 21,
    description: "Priority timed entry to Dubai's iconic Museum of the Future with private chauffeur drop-off.",
    image: "/images/hotels-real/burj_al_arab.jpg",
    refundable: false,
  },
  {
    id: "act_dhow_cruise",
    title: "Dubai Creek Luxury Dhow Cruise with Buffet Dinner",
    city: "Dubai",
    duration: "2 Hours",
    category: "Boat Tours & Dining",
    price: 145,
    originalPrice: 199,
    discountPct: 27,
    description: "An evening cruise on the placid Dubai Creek on a traditional Arabian dhow with 5-star dining.",
    image: "/images/hotels-real/luxury_hotel_suite.jpg",
    refundable: false,
  },
  {
    id: "act_pyramids_private",
    title: "After-Hours Private Pyramids & Sphinx Tour",
    city: "Cairo",
    duration: "4 Hours",
    category: "Private Heritage",
    price: 320,
    originalPrice: 400,
    discountPct: 20,
    description: "Exclusive Egyptologist-guided tour of Giza Plateau with sunset champagne-style tea overlooking the Pyramids.",
    image: "/images/hotels-real/caimn-view-0063-hor-clsc.webp",
    refundable: true,
  },
];

function getAirlineCode(flt: { airlineCode?: string; flightNumber?: string; airline?: string }): string {
  if (flt.airlineCode && flt.airlineCode.length === 2) return flt.airlineCode.toUpperCase();
  const fnMatch = String(flt.flightNumber || "").trim().match(/^([A-Z0-9]{2})\b/i);
  if (fnMatch) return fnMatch[1].toUpperCase();
  const name = String(flt.airline || "").toLowerCase();
  if (name.includes("emirates")) return "EK";
  if (name.includes("qatar")) return "QR";
  if (name.includes("air france")) return "AF";
  if (name.includes("british")) return "BA";
  if (name.includes("swiss")) return "LX";
  if (name.includes("egyptair") || name.includes("egypt air")) return "MS";
  if (name.includes("etihad")) return "EY";
  if (name.includes("lufthansa")) return "LH";
  if (name.includes("turkish")) return "TK";
  if (name.includes("saudia")) return "SV";
  return "EK";
}

function AirlineLogoBadge({ flt, size = "md" }: { flt: { airlineCode?: string; airlineLogo?: string; flightNumber?: string; airline?: string }; size?: "sm" | "md" }) {
  const code = getAirlineCode(flt);
  const logoUrl = flt.airlineLogo || `https://pics.avs.io/140/56/${code}.png`;
  return (
    <div
      className={`bg-white flex items-center justify-center shrink-0 shadow-xs border border-white/20 overflow-hidden ${
        size === "sm" ? "h-6 w-14 px-1.5 rounded-md" : "h-8 w-16 px-2 rounded-lg"
      }`}
      title={flt.airline || code}
    >
      <img
        src={logoUrl}
        alt={flt.airline || code}
        className="max-h-full max-w-full object-contain"
        onError={(e) => {
          const el = e.currentTarget as HTMLImageElement;
          const fallbackUrl = `https://pics.avs.io/140/56/${code}.png`;
          if (el.src !== fallbackUrl && !el.dataset.triedFallback) {
            el.dataset.triedFallback = "1";
            el.src = fallbackUrl;
            return;
          }
          el.style.display = "none";
          const parent = el.parentElement;
          if (parent && !parent.querySelector("span")) {
            const span = document.createElement("span");
            span.className = "text-[10px] font-extrabold text-slate-900 tracking-wider";
            span.textContent = code;
            parent.appendChild(span);
          }
        }}
      />
    </div>
  );
}

const DEFAULT_FLIGHTS: LiveFlightOffer[] = [
  {
    id: "flt_ek_924",
    provider: "duffel",
    liveBookable: false,
    airline: "Emirates · First & Business",
    airlineCode: "EK",
    flightNumber: "EK 924",
    origin: "CAI",
    destination: "DXB",
    departureTime: "07:00",
    arrivalTime: "11:45",
    duration: "3h 45m",
    stops: 0,
    cabin: "Business Class",
    price: 680,
    currency: "USD",
  },
  {
    id: "flt_qr_1304",
    provider: "duffel",
    liveBookable: false,
    airline: "Qatar Airways · Qsuite",
    airlineCode: "QR",
    flightNumber: "QR 1304",
    origin: "CAI",
    destination: "MLE",
    departureTime: "13:10",
    arrivalTime: "01:45",
    duration: "8h 35m",
    stops: 1,
    cabin: "Qsuite Business",
    price: 1290,
    currency: "USD",
  },
  {
    id: "flt_af_567",
    provider: "duffel",
    liveBookable: false,
    airline: "Air France · La Première",
    airlineCode: "AF",
    flightNumber: "AF 567",
    origin: "CAI",
    destination: "CDG",
    departureTime: "08:45",
    arrivalTime: "13:50",
    duration: "5h 05m",
    stops: 0,
    cabin: "Business Class",
    price: 980,
    currency: "USD",
  },
  {
    id: "flt_ba_154",
    provider: "duffel",
    liveBookable: false,
    airline: "British Airways · Club World",
    airlineCode: "BA",
    flightNumber: "BA 154",
    origin: "CAI",
    destination: "LHR",
    departureTime: "09:15",
    arrivalTime: "13:40",
    duration: "5h 25m",
    stops: 0,
    cabin: "Club World",
    price: 940,
    currency: "USD",
  },
  {
    id: "flt_lx_239",
    provider: "duffel",
    liveBookable: false,
    airline: "SWISS · Alpine Business",
    airlineCode: "LX",
    flightNumber: "LX 239",
    origin: "CAI",
    destination: "GVA",
    departureTime: "03:45",
    arrivalTime: "08:15",
    duration: "4h 30m",
    stops: 0,
    cabin: "Business Class",
    price: 890,
    currency: "USD",
  },
  {
    id: "flt_ms_910",
    provider: "duffel",
    liveBookable: false,
    airline: "EgyptAir · Royal Business",
    airlineCode: "MS",
    flightNumber: "MS 910",
    origin: "CAI",
    destination: "DXB",
    departureTime: "15:10",
    arrivalTime: "19:55",
    duration: "3h 45m",
    stops: 0,
    cabin: "Business Class",
    price: 590,
    currency: "USD",
  },
];

export function TravelOrderPlatform({ mode }: { mode: PlatformMode }) {
  // Navigation & View States
  const [adminSection, setAdminSection] = useState<AdminSection>("create");
  const [clientStep, setClientStep] = useState<ClientStep>("search");
  const [serviceTab, setServiceTab] = useState<ServiceTab>("design");
  const [detailsTab, setDetailsTab] = useState<DetailsTab>("overview");
  const [viewLayout, setViewLayout] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortBy>("popular");

  // Search Bar States
  const today = new Date();
  const defaultIn = new Date(today.getTime() + 7 * 86400000).toISOString().split("T")[0];
  const defaultOut = new Date(today.getTime() + 12 * 86400000).toISOString().split("T")[0];

  const [cityQuery, setCityQuery] = useState("");
  const [checkIn, setCheckIn] = useState(defaultIn);
  const [checkOut, setCheckOut] = useState(defaultOut);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);
  const [roomsCount, setRoomsCount] = useState(1);

  // Filters Sidebar States
  const [hotelNameFilter, setHotelNameFilter] = useState("");
  const [minPriceFilter, setMinPriceFilter] = useState(250);
  const [maxPriceFilter, setMaxPriceFilter] = useState(15000);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [maxDistanceKm, setMaxDistanceKm] = useState(30);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [minReviewScore, setMinReviewScore] = useState<number | null>(null);

  // Selected Booking Items
  const [selectedHotel, setSelectedHotel] = useState<HotelCatalogItem>(DEFAULT_HOTELS[0]);
  const [selectedRoom, setSelectedRoom] = useState<RoomOption>(DEFAULT_HOTELS[0].rooms[0]);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(DEFAULT_ACTIVITIES[0]);
  const [selectedFlight, setSelectedFlight] = useState<LiveFlightOffer>(DEFAULT_FLIGHTS[0]);
  const [liveFlights, setLiveFlights] = useState<LiveFlightOffer[]>(DEFAULT_FLIGHTS);
  const [liveHotels, setLiveHotels] = useState<HotelCatalogItem[]>([]);
  const [searchingLive, setSearchingLive] = useState(false);

  // Checkout Add-ons & Passenger Details
  const [selectedTransferId, setSelectedTransferId] = useState<string>("tr_limo");
  const [selectedVipServices, setSelectedVipServices] = useState<string[]>([]);
  const [extraBagsOutbound, setExtraBagsOutbound] = useState(1);
  const [extraBagsReturn, setExtraBagsReturn] = useState(0);
  const [selectedSeatOutbound, setSelectedSeatOutbound] = useState("12A");
  const [selectedSeatReturn, setSelectedSeatReturn] = useState("14C");
  const [carbonOption, setCarbonOption] = useState<"1yr" | "2yr" | "5yr" | "none">("1yr");
  const [luggageProtection, setLuggageProtection] = useState(false);
  const [payLaterMode, setPayLaterMode] = useState(true);
  const [showAllAbout, setShowAllAbout] = useState(false);

  const [guests, setGuests] = useState<GuestForm[]>([
    { title: "Mr.", firstName: "", lastName: "", dob: "", gender: "Male" },
    { title: "Mrs.", firstName: "", lastName: "", dob: "", gender: "Female" },
  ]);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [createdOrderCode, setCreatedOrderCode] = useState<string | null>(null);

  // Admin Modals & Filters
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [activeOrderModal, setActiveOrderModal] = useState<any | null>(null);
  const [ticketTab, setTicketTab] = useState<"all" | "new" | "read" | "replied">("all");
  const [activitySearch, setActivitySearch] = useState("");

  // Left Sidebar & Top Notifications Header State
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orderMenuOpen, setOrderMenuOpen] = useState(true);
  const [inventoryMenuOpen, setInventoryMenuOpen] = useState(false);
  const [chatMenuOpen, setChatMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");

  // Activities & Suppliers Creation Modals
  const [customActivities, setCustomActivities] = useState<ActivityItem[]>([]);
  const [newActivityOpen, setNewActivityOpen] = useState(false);
  const [newActivityForm, setNewActivityForm] = useState({ title: "", city: "Dubai", duration: "3 Hours", category: "VIP Tour", price: 250, description: "" });
  const [customSuppliers, setCustomSuppliers] = useState<any[]>([]);
  const [newSupplierOpen, setNewSupplierOpen] = useState(false);
  const [newSupplierForm, setNewSupplierForm] = useState({ name: "", email: "", status: "Active Integration", revenue: "$18,500" });

  // ─── Live Site Data Queries (Firestore / tRPC) ───────────────────────────
  const { data: settingsData } = (trpc as any).settings.getAll.useQuery();
  const { data: savedActivitiesJson } = trpc.siteSettings.get.useQuery(
    { category: "activities", key: "activities_data" },
    { staleTime: 10000 }
  );
  const { data: destinationsData } = trpc.destinations.list.useQuery();
  const { data: reviewsData } = trpc.reviews.list.useQuery();
  const { data: bookingsData, refetch: refetchBookings } = trpc.bookings.listAll.useQuery(
    { limit: 100, offset: 0 },
    { enabled: mode === "admin" || adminSection === "orders" }
  );
  const { data: ticketsData, refetch: refetchTickets } = trpc.contact.listAll.useQuery(
    { limit: 100, offset: 0 },
    { enabled: mode === "admin" || adminSection === "tickets" }
  );

  const createBookingMutation = trpc.bookings.create.useMutation({
    onSuccess: (res: any) => {
      setCreatedOrderCode(res?.confirmationCode || `VNR-${Date.now().toString().slice(-6)}`);
      setClientStep("confirmed");
      toast.success("Booking created & synced to database!");
      if (mode === "admin") refetchBookings();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create booking");
    },
  });

  const updateBookingStatusMutation = trpc.bookings.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated");
      refetchBookings();
      setActiveOrderModal(null);
    },
  });

  const updateTicketStatusMutation = trpc.contact.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Ticket status updated");
      refetchTickets();
    },
  });

  // Merge Live Google Hotels + Admin Inventory (`admin_hotels_inventory`) + Default Hotels
  const hotelsCatalog = useMemo<HotelCatalogItem[]>(() => {
    const list: HotelCatalogItem[] = [...liveHotels];
    const addUnique = (h: HotelCatalogItem) => {
      if (!list.some((x) => x.id === h.id || x.name.toLowerCase() === h.name.toLowerCase())) {
        list.push(h);
      }
    };
    DEFAULT_HOTELS.forEach(addUnique);
    if (Array.isArray(settingsData)) {
      const inv = settingsData.find((s: any) => s.key === "admin_hotels_inventory");
      if (inv?.value) {
        try {
          const parsed = typeof inv.value === "string" ? JSON.parse(inv.value) : inv.value;
          if (Array.isArray(parsed)) {
            parsed.forEach((h: any) => {
              if (!h?.name || list.some((x) => x.id === h.id || x.name === h.name)) return;
              list.push({
                id: h.id || `htl_${h.name}`,
                name: h.name,
                city: h.city || "Cairo",
                country: h.country || "Egypt",
                address: `${h.city || "Cairo"}, ${h.country || "Egypt"}`,
                stars: Number(h.stars) || 5,
                reviewScore: 9.1,
                reviewsCount: 84,
                distanceKm: 5,
                discountPct: 20,
                payLater: true,
                pricePerNight: Number(h.pricePerNight) || 380,
                mealPlans: ["RO", "BB", "HB"],
                image: h.image || "/images/hotels-real/caimn-view-0063-hor-clsc.webp",
                gallery: [h.image || "/images/hotels-real/caimn-view-0063-hor-clsc.webp"],
                amenities: ["Spa", "Swimming Pool", "Gym", "VIP Concierge"],
                highlights: [`Curated ${h.badge || "LUX"} property in ${h.city || "Cairo"}.`, `Featured suite: ${h.roomType || "Diplomatic Suite"}.`],
                rooms: [
                  {
                    id: `rm_${h.id}`,
                    name: h.roomType || "Luxury Suite",
                    recommended: true,
                    refundable: true,
                    mealPlan: "BB",
                    pricePerNight: Number(h.pricePerNight) || 380,
                    inclusions: ["Daily Breakfast Included", "VIP Airport Greeting"],
                    image: h.image || "/images/hotels-real/caimn-guestroom-0037-hor-clsc.webp",
                  },
                ],
              });
            });
          }
        } catch {
          // ignore
        }
      }
    }
    return list;
  }, [settingsData, liveHotels]);

  // Merge Real Transfers from `admin_transfers_fleet`
  const transfersCatalog = useMemo<TransferOption[]>(() => {
    const carFallbackPool = [
      "/images/vip-generated/car_maybach_s680.jpg",
      "/images/vip-generated/car_vip_suv.jpg",
      "/images/vip-generated/car_mercedes_eclass.jpg",
      "/images/vip-generated/car_mercedes_vclass.jpg",
    ];
    if (Array.isArray(settingsData)) {
      const fleet = settingsData.find((s: any) => s.key === "admin_transfers_fleet");
      if (fleet?.value) {
        try {
          const parsed = typeof fleet.value === "string" ? JSON.parse(fleet.value) : fleet.value;
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((car: any, idx: number) => {
              const img = String(car.image || "");
              const needsRealCarImg = !img || img.includes("hotels-real");
              return {
                ...car,
                image: needsRealCarImg ? carFallbackPool[idx % carFallbackPool.length] : img,
              };
            });
          }
        } catch {
          // ignore
        }
      }
    }
    return DEFAULT_TRANSFERS;
  }, [settingsData]);

  // Merge Real Activities from `activities_data`
  const activitiesCatalog = useMemo<ActivityItem[]>(() => {
    if (savedActivitiesJson) {
      try {
        const parsed = typeof savedActivitiesJson === "string" ? JSON.parse(savedActivitiesJson) : savedActivitiesJson;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((a: any, idx: number) => ({
            id: a.id || `act_${idx}`,
            title: a.name || a.title || "Luxury Experience",
            city: a.location || a.city || "Dubai",
            duration: a.duration || "3 Hours",
            category: a.category || "VIP Tour",
            price: Number(a.price) || 180,
            originalPrice: Number(a.price) ? Math.round(Number(a.price) * 1.25) : 225,
            discountPct: 20,
            description: a.description || "Curated luxury experience.",
            image: a.image || "/images/hotels-real/burj_al_arab.jpg",
            refundable: true,
          }));
        }
      } catch {
        // ignore
      }
    }
    return DEFAULT_ACTIVITIES;
  }, [savedActivitiesJson]);

  useEffect(() => {
    if (transfersCatalog.length > 0 && !transfersCatalog.some((t) => t.id === selectedTransferId)) {
      setSelectedTransferId(transfersCatalog[0].id);
    }
  }, [transfersCatalog, selectedTransferId]);

  const nightsCount = useMemo(() => {
    const s = new Date(checkIn).getTime();
    const e = new Date(checkOut).getTime();
    if (!s || !e || e <= s) return 5;
    return Math.max(1, Math.round((e - s) / 86400000));
  }, [checkIn, checkOut]);

  // Filtered & Sorted Hotels
  const filteredHotels = useMemo(() => {
    return hotelsCatalog
      .filter((h) => {
        const q = (cityQuery || hotelNameFilter).trim().toLowerCase();
        if (q) {
          const hay = `${h.name} ${h.city} ${h.country} ${h.address}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        const total = h.pricePerNight * nightsCount;
        if (total < minPriceFilter || total > maxPriceFilter) return false;
        if (h.distanceKm > maxDistanceKm) return false;
        if (selectedCities.length > 0 && !selectedCities.includes(h.city)) return false;
        if (selectedMeals.length > 0 && !selectedMeals.some((m) => h.mealPlans.includes(m as any))) return false;
        if (selectedStars.length > 0 && !selectedStars.includes(h.stars)) return false;
        if (minReviewScore !== null && h.reviewScore < minReviewScore) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "rating_desc") return b.reviewScore - a.reviewScore;
        if (sortBy === "price_desc") return b.pricePerNight - a.pricePerNight;
        if (sortBy === "price_asc") return a.pricePerNight - b.pricePerNight;
        return b.reviewsCount - a.reviewsCount;
      });
  }, [
    hotelsCatalog,
    cityQuery,
    hotelNameFilter,
    nightsCount,
    minPriceFilter,
    maxPriceFilter,
    maxDistanceKm,
    selectedCities,
    selectedMeals,
    selectedStars,
    minReviewScore,
    sortBy,
  ]);

  // Live API Search Trigger (Google Hotels + Google Flights / Duffel / Amadeus)
  const handleSearchLive = async (silent = false, overrideCity?: string) => {
    setSearchingLive(true);
    try {
      const targetCity = (overrideCity !== undefined ? overrideCity : cityQuery).trim() || "Dubai";
      const cityLower = targetCity.toLowerCase();
      const CITY_TO_IATA: Record<string, string> = {
        dubai: "DXB",
        "abu dhabi": "AUH",
        cairo: "CAI",
        luxor: "LXR",
        aswan: "ASW",
        paris: "CDG",
        london: "LHR",
        maldives: "MLE",
        male: "MLE",
        rome: "FCO",
        geneva: "GVA",
        zurich: "ZRH",
        tokyo: "HND",
        "new york": "JFK",
        hawaii: "HNL",
        bali: "DPS",
        santorini: "JTR",
        istanbul: "IST",
      };
      const matchedKey = Object.keys(CITY_TO_IATA).find((k) => cityLower.includes(k));
      const destIata = matchedKey ? CITY_TO_IATA[matchedKey] : "DXB";
      const originIata = destIata === "CAI" ? "DXB" : "CAI";

      const [hRes, fRes] = await Promise.all([
        searchLiveHotels({ city: targetCity, checkin: checkIn, checkout: checkOut, adults, currency: "USD" }).catch(() => null),
        searchLiveFlights({ origin: originIata, destination: destIata, departureDate: checkIn, returnDate: checkOut, adults, currency: "USD" }).catch(() => null),
      ]);

      let liveFlightsCount = 0;
      if (fRes?.ok && Array.isArray(fRes.offers) && fRes.offers.length > 0) {
        setLiveFlights(fRes.offers);
        setSelectedFlight(fRes.offers[0]);
        liveFlightsCount = fRes.offers.length;
      }

      let liveHotelsCount = 0;
      if (hRes?.ok && Array.isArray(hRes.hotels) && hRes.hotels.length > 0) {
        const mappedHotels: HotelCatalogItem[] = hRes.hotels.map((h, idx) => {
          const rawScore = Number(h.rating || 4.6);
          const normalizedScore = rawScore <= 5 ? Number((rawScore * 2).toFixed(1)) : Number(rawScore.toFixed(1));
          const nightPrice = Number(h.price || (h.totalAmount ? Math.round(h.totalAmount / Math.max(1, nightsCount)) : 390)) || 390;
          const mainImg = h.image || (Array.isArray(h.images) && h.images[0]) || "/images/hotels-real/luxury_hotel_suite.jpg";
          const galleryImgs = Array.isArray(h.images) && h.images.length > 0 ? h.images : [mainImg];
          return {
            id: h.hotelId || h.offerId || `live_htl_${idx}`,
            name: h.name,
            city: h.city || targetCity,
            country: "",
            address: h.address || `${h.city || targetCity} · Live Google Hotels Rate`,
            stars: Math.min(5, Math.max(3, Math.round(Number(h.stars) || 5))),
            reviewScore: normalizedScore,
            reviewsCount: Number(h.reviewsCount) || 128,
            distanceKm: 3,
            discountPct: 18,
            payLater: true,
            pricePerNight: nightPrice,
            mealPlans: ["RO", "BB", "HB"],
            image: mainImg,
            gallery: galleryImgs,
            amenities: Array.isArray(h.amenities) && h.amenities.length > 0 ? h.amenities.slice(0, 8) : ["Free Wi-Fi", "Swimming Pool", "Spa", "VIP Concierge"],
            highlights: [
              `Live real-time rate powered by Google Hotels (${h.provider || "live"}).`,
              `Featured room: ${h.roomName || "Luxury Suite"} (${h.boardType || "Bed & Breakfast"}).`,
            ],
            rooms: [
              {
                id: h.rateId || h.offerId || `live_rm_${idx}`,
                name: h.roomName || "Deluxe Luxury Suite",
                recommended: true,
                refundable: Boolean(h.refundable),
                mealPlan: "BB",
                pricePerNight: nightPrice,
                inclusions: [h.boardType || "Daily Breakfast", h.refundable ? "Free Cancellation" : "Instant Confirmation"],
                image: mainImg,
              },
            ],
          };
        });
        setLiveHotels(mappedHotels);
        liveHotelsCount = mappedHotels.length;
      }

      if (!silent) {
        if (liveHotelsCount > 0 || liveFlightsCount > 0) {
          toast.success(`Live Google results loaded: ${liveHotelsCount} hotels & ${liveFlightsCount} flights`);
        } else {
          toast.success(`Showing ${filteredHotels.length} curated properties`);
        }
      }
    } finally {
      setSearchingLive(false);
    }
  };

  // Auto-load Live Google Flights & Google Hotels on initial open
  useEffect(() => {
    handleSearchLive(true, "Dubai");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleVipService = (id: string) => {
    setSelectedVipServices((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const applyFullVipBundle = () => {
    const bundleIds = ["vip_fast_track", "vip_royal_suite_setup", "vip_esim_insurance"];
    const hasAll = bundleIds.every((id) => selectedVipServices.includes(id));
    if (hasAll) {
      setSelectedVipServices((prev) => prev.filter((id) => !bundleIds.includes(id)));
      toast.info("VIP Signature Bundle removed");
    } else {
      setSelectedVipServices((prev) => Array.from(new Set([...prev, ...bundleIds])));
      toast.success("VIP Signature Bundle applied — 15% Bundle Discount unlocked!");
    }
  };

  // Price Calculations
  const selectedTransfer = transfersCatalog.find((t) => t.id === selectedTransferId) || transfersCatalog[0];
  const hotelTotal = selectedRoom.pricePerNight * nightsCount * roomsCount;
  const flightTotal = (serviceTab === "hotels" ? 0 : selectedFlight.price * adults + Math.round(selectedFlight.price * 0.65 * children));
  const activityTotal = selectedActivity ? selectedActivity.price * adults : 0;
  const transferTotal = selectedTransfer ? selectedTransfer.airportRate : 0;
  const selectedVipServiceObjects = VIP_EXTRA_SERVICES.filter((s) => selectedVipServices.includes(s.id));
  const vipServicesRawTotal = selectedVipServiceObjects.reduce((sum, s) => sum + s.price, 0);
  const vipBundleDiscount = selectedVipServiceObjects.length >= 3 ? Math.round(vipServicesRawTotal * 0.15) : 0;
  const vipServicesTotal = vipServicesRawTotal - vipBundleDiscount;
  const baggageTotal = (extraBagsOutbound + extraBagsReturn) * 38;
  const carbonTotal = carbonOption === "1yr" ? 45 : carbonOption === "2yr" ? 30 : carbonOption === "5yr" ? 20 : 0;
  const luggageProtTotal = luggageProtection ? 29 : 0;
  const baseSubtotal = hotelTotal + flightTotal + activityTotal + transferTotal + vipServicesTotal + baggageTotal + carbonTotal + luggageProtTotal;
  const taxesAndFees = Math.round(baseSubtotal * 0.08);
  const grandTotal = baseSubtotal + taxesAndFees;
  const installmentAmount = Math.round(grandTotal / 3);

  // ── Direct Hosted Payment Gateway Return Verification (Stripe / Tap 3DS2) ─
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment_status");
    const provider = params.get("provider");
    if (!paymentStatus || !provider) return;

    const cleanUrl = () => {
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch {}
    };

    if (paymentStatus === "cancelled") {
      toast.error("Payment was cancelled. Your itinerary is still saved — you can retry anytime.");
      cleanUrl();
      return;
    }

    if (paymentStatus === "success") {
      const sessionId = params.get("session_id") || undefined;
      const chargeId = params.get("tap_id") || params.get("charge_id") || undefined;
      let cancelled = false;

      (async () => {
        try {
          const res = await fetch("/api/payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "verify_payment",
              provider,
              sessionId,
              chargeId,
            }),
          });
          const data: any = await res.json().catch(() => ({}));
          if (cancelled) return;
          if (!data?.ok || !data?.verified) {
            toast.error(data?.error || "Payment verification did not confirm settlement.");
            cleanUrl();
            return;
          }

          let draft: any = null;
          try {
            const raw = sessionStorage.getItem("vanir_pending_payment_draft");
            if (raw) draft = JSON.parse(raw);
            sessionStorage.removeItem("vanir_pending_payment_draft");
          } catch {}

          const verifiedTxn = String(data.transactionId || sessionId || chargeId || "VERIFIED");
          toast.success(`Payment verified via ${provider.toUpperCase()} (${verifiedTxn})`);
          createBookingMutation.mutate({
            packageName: draft?.packageName || `${selectedHotel.name} (${selectedRoom.name})`,
            destination: draft?.destination || `${selectedHotel.city}, ${selectedHotel.country}`,
            guestName: draft?.fullName || "VIP Traveler",
            guestEmail: draft?.email || data.customerEmail || contactEmail || "guest@vanirgroup.com",
            guestPhone: draft?.phone || contactPhone || "+201000000000",
            customerName: draft?.fullName || "VIP Traveler",
            customerEmail: draft?.email || data.customerEmail || contactEmail || "guest@vanirgroup.com",
            customerPhone: draft?.phone || contactPhone || "+201000000000",
            checkInDate: draft?.checkInDate || new Date(checkIn).getTime(),
            checkOutDate: draft?.checkOutDate || new Date(checkOut).getTime(),
            travelDate: draft?.checkIn || checkIn,
            returnDate: draft?.checkOut || checkOut,
            adults: draft?.adults || adults,
            children: draft?.children ?? children,
            guests: (draft?.adults || adults) + (draft?.children ?? children),
            totalPrice: String(data.amountPaid || draft?.grandTotal || grandTotal),
            paymentStatus: "paid",
            notes: [
              draft?.notes,
              `Gateway: ${provider.toUpperCase()} LIVE VERIFIED`,
              `Transaction ID: ${verifiedTxn}`,
            ]
              .filter(Boolean)
              .join(" | "),
          } as any);
          cleanUrl();
        } catch (err: any) {
          if (!cancelled) {
            toast.error(err?.message || "Could not verify payment settlement.");
            cleanUrl();
          }
        }
      })();

      return () => {
        cancelled = true;
      };
    }
  }, []);

  const handleConfirmBooking = () => {
    const primaryGuest = guests[0];
    const fullName = `${primaryGuest?.firstName || ""} ${primaryGuest?.lastName || ""}`.trim() || "VIP Guest";
    if (!contactEmail.trim()) {
      toast.error("Please enter contact email address");
      return;
    }
    createBookingMutation.mutate({
      packageName: `${selectedHotel.name} (${selectedRoom.name})`,
      destination: `${selectedHotel.city}, ${selectedHotel.country}`,
      guestName: fullName,
      guestEmail: contactEmail.trim(),
      guestPhone: contactPhone.trim() || "+201000000000",
      customerName: fullName,
      customerEmail: contactEmail.trim(),
      customerPhone: contactPhone.trim() || "+201000000000",
      checkInDate: new Date(checkIn).getTime(),
      checkOutDate: new Date(checkOut).getTime(),
      travelDate: checkIn,
      returnDate: checkOut,
      adults,
      children,
      guests: adults + children,
      totalPrice: String(grandTotal),
      notes: [
        `Room: ${selectedRoom.name} (${selectedRoom.mealPlan})`,
        selectedActivity ? `Activity: ${selectedActivity.title}` : null,
        selectedTransfer ? `Transfer: ${selectedTransfer.name}` : null,
        selectedVipServiceObjects.length > 0
          ? `VIP Extra Services: ${selectedVipServiceObjects.map((s) => s.title).join(", ")}`
          : null,
        `Seats: ${selectedSeatOutbound} / ${selectedSeatReturn}`,
        `Payment: ${payLaterMode ? "3-Installment Split Pay Later" : "Full Payment"}`,
      ]
        .filter(Boolean)
        .join(" | "),
    } as any);
  };

  const resetFilters = () => {
    setCityQuery("");
    setHotelNameFilter("");
    setMinPriceFilter(250);
    setMaxPriceFilter(15000);
    setMaxDistanceKm(30);
    setSelectedCities([]);
    setSelectedMeals([]);
    setSelectedStars([]);
    setMinReviewScore(null);
  };

  const uniqueCities = useMemo(() => Array.from(new Set(hotelsCatalog.map((h) => h.city))), [hotelsCatalog]);

  const adminOrders = useMemo(() => {
    const rows = Array.isArray(bookingsData) && bookingsData.length > 0 ? bookingsData : [
      {
        id: "6079",
        confirmationCode: "6079",
        packageName: "Flight + Hotel (Cairo → Dubai)",
        customerName: "Jayvion Simon",
        customerEmail: "jayvion@vanirgroup.com",
        customerPhone: "+20 100 555 6079",
        nationality: "Egyptian",
        travelDate: "2026-07-20",
        returnDate: "2026-07-25",
        totalPrice: "2046",
        status: "completed",
        paymentStatus: "paid",
      },
      {
        id: "6080",
        confirmationCode: "6080",
        packageName: "Sofitel Winter Palace Luxor",
        customerName: "Sarah Jenkins",
        customerEmail: "sarah.j@gmail.com",
        customerPhone: "+44 20 7946 0912",
        nationality: "British",
        travelDate: "2026-08-10",
        returnDate: "2026-08-16",
        totalPrice: "3450",
        status: "confirmed",
        paymentStatus: "paid",
      },
      {
        id: "6081",
        confirmationCode: "6081",
        packageName: "Maldives Overwater Sanctuary",
        customerName: "Karim Al-Maktoum",
        customerEmail: "karim@alm-group.ae",
        customerPhone: "+971 50 123 4567",
        nationality: "Emirati",
        travelDate: "2026-09-01",
        returnDate: "2026-09-08",
        totalPrice: "8200",
        status: "pending",
        paymentStatus: "unpaid",
      },
    ];
    return rows.filter((b: any) => {
      if (orderStatusFilter !== "all" && b.status !== orderStatusFilter) return false;
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        const text = `${b.confirmationCode || ""} ${b.customerName || ""} ${b.packageName || ""} ${b.customerEmail || ""}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [bookingsData, orderSearch, orderStatusFilter]);

  const adminTickets = useMemo(() => {
    const rows = Array.isArray(ticketsData) ? ticketsData : [];
    return rows.filter((t: any) => (ticketTab === "all" ? true : t.status === ticketTab));
  }, [ticketsData, ticketTab]);

  // ─── Render Helpers ──────────────────────────────────────────────────────
  const renderSearchAndFilters = () => (
    <div className="space-y-6">
      {/* Service Category Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "flights", label: "Flight Booking", icon: Plane, badgeColor: "bg-sky-500/20 text-sky-300 border-sky-400/30" },
          { id: "hotels", label: "Hotel Booking", icon: Building2, badgeColor: "bg-amber-500/20 text-[#E5C378] border-[#C8A04F]/40" },
          { id: "design", label: "Flight + Hotel", icon: Sparkles, badgeColor: "" },
          { id: "holiday", label: "Holiday", icon: Palmtree, badgeColor: "" },
          { id: "transfers", label: "Transfers", icon: Car, badgeColor: "" },
          { id: "activities", label: "Activities", icon: Compass, badgeColor: "" },
          { id: "vip_services", label: selectedVipServices.length > 0 ? `VIP Services (${selectedVipServices.length})` : "VIP Services", icon: ShieldCheck, badgeColor: "" },
          { id: "offers", label: "All Offers", icon: Tag, badgeColor: "" },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = serviceTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setServiceTab(tab.id as ServiceTab)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                active
                  ? "bg-[#C8A04F] text-[#080E1A] border-[#C8A04F] shadow-sm font-extrabold"
                  : "bg-white/10 text-slate-200 border-white/10 hover:bg-white/15"
              }`}
            >
              {tab.badgeColor ? (
                <span className={`w-5 h-5 rounded-md flex items-center justify-center border ${active ? "bg-[#080E1A]/15 border-[#080E1A]/20 text-[#080E1A]" : tab.badgeColor}`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
              ) : (
                <Icon className="w-3.5 h-3.5" />
              )}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Top Search Bar Card */}
      <div className={`relative ${cityDropdownOpen ? "z-50" : "z-30"} bg-[#0B111E] border border-white/10 rounded-2xl p-4 shadow-xl space-y-4`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className={`md:col-span-5 border border-white/10 rounded-xl px-3.5 py-2.5 relative ${cityDropdownOpen ? "z-50" : "z-10"}`}>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              City, Property Name or Location
            </label>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4 text-[#E5C378] shrink-0" />
              <input
                type="text"
                value={cityQuery}
                onFocus={() => setCityDropdownOpen(true)}
                onBlur={() => setTimeout(() => setCityDropdownOpen(false), 220)}
                onChange={(e) => {
                  setCityQuery(e.target.value);
                  setCityDropdownOpen(true);
                }}
                placeholder="Paris, London, Maldives, Dubai, Cairo, Bali, Geneva..."
                className="w-full text-sm font-semibold text-white placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
              {cityQuery && (
                <button type="button" onClick={() => setCityQuery("")} className="text-slate-400 hover:text-white text-xs">
                  ✕
                </button>
              )}
            </div>

            {cityDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-[#080E1A] border-2 border-[#E5C378]/40 rounded-xl shadow-2xl z-[9999] p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-72 overflow-y-auto">
                {[
                  { label: "All Destinations", val: "" },
                  { label: "Paris, France", val: "Paris" },
                  { label: "London, UK", val: "London" },
                  { label: "Male Atoll, Maldives", val: "Maldives" },
                  { label: "Dubai, UAE", val: "Dubai" },
                  { label: "Abu Dhabi, UAE", val: "Abu Dhabi" },
                  { label: "Cairo, Egypt", val: "Cairo" },
                  { label: "Luxor, Egypt", val: "Luxor" },
                  { label: "Aswan, Egypt", val: "Aswan" },
                  { label: "Rome, Italy", val: "Rome" },
                  { label: "Geneva, Switzerland", val: "Geneva" },
                  { label: "Zurich, Switzerland", val: "Zurich" },
                  { label: "Tokyo, Japan", val: "Tokyo" },
                  { label: "New York, USA", val: "New York" },
                  { label: "Hawaii, USA", val: "Hawaii" },
                  { label: "Bali, Indonesia", val: "Bali" },
                  { label: "Santorini, Greece", val: "Santorini" },
                  { label: "Istanbul, Turkey", val: "Istanbul" },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onMouseDown={() => {
                      setCityQuery(opt.val);
                      setCityDropdownOpen(false);
                      if (opt.val) handleSearchLive(false, opt.val);
                    }}
                    className="text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-[#E5C378]/15 hover:text-[#E5C378] transition flex items-center gap-1.5"
                  >
                    <MapPin className="w-3 h-3 text-[#E5C378]/70 shrink-0" />
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            onClick={(e) => {
              const inp = e.currentTarget.querySelector("input");
              if (inp) {
                inp.focus();
                try { (inp as any).showPicker?.(); } catch {}
              }
            }}
            className="md:col-span-2 border border-white/10 hover:border-[#E5C378]/50 rounded-xl px-3.5 py-2.5 cursor-pointer transition group"
          >
            <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#E5C378] cursor-pointer">
              <CalendarDays className="w-3 h-3 text-[#E5C378]" />
              Check-In
            </label>
            <input
              type="date"
              value={checkIn}
              onClick={(e) => {
                e.stopPropagation();
                try { (e.currentTarget as any).showPicker?.(); } catch {}
              }}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full text-sm font-semibold text-white mt-1 focus:outline-none bg-transparent cursor-pointer [color-scheme:dark]"
            />
          </div>

          <div
            onClick={(e) => {
              const inp = e.currentTarget.querySelector("input");
              if (inp) {
                inp.focus();
                try { (inp as any).showPicker?.(); } catch {}
              }
            }}
            className="md:col-span-2 border border-white/10 hover:border-[#E5C378]/50 rounded-xl px-3.5 py-2.5 cursor-pointer transition group"
          >
            <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#E5C378] cursor-pointer">
              <CalendarDays className="w-3 h-3 text-[#E5C378]" />
              Check-Out
            </label>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onClick={(e) => {
                e.stopPropagation();
                try { (e.currentTarget as any).showPicker?.(); } catch {}
              }}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full text-sm font-semibold text-white mt-1 focus:outline-none bg-transparent cursor-pointer [color-scheme:dark]"
            />
          </div>

          <div className="md:col-span-3 border border-white/10 rounded-xl px-3.5 py-2.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Guests & Rooms</label>
            <div className="flex items-center justify-between mt-1 gap-2">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>
                  {adults} Adults · {children} Child · {roomsCount} Rm
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setAdults((a) => Math.max(1, a - 1))}
                  className="w-5 h-5 rounded bg-white/10 text-slate-200 text-xs font-bold hover:bg-slate-200"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setAdults((a) => Math.min(8, a + 1))}
                  className="w-5 h-5 rounded bg-white/10 text-slate-200 text-xs font-bold hover:bg-slate-200"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Ratings / Meal Plan / CTA Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-400">Ratings</span>
              {[3, 4, 5].map((star) => {
                const active = selectedStars.includes(star);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setSelectedStars((prev) => (prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star]))
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      active ? "bg-amber-50 border-amber-300 text-amber-800" : "bg-[#0B111E]/90 border-white/10 text-slate-200 hover:bg-black/30"
                    }`}
                  >
                    {star} ★
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-400">Meal Plan</span>
              {(["RO", "BB", "HB", "FB", "AI"] as const).map((meal) => {
                const active = selectedMeals.includes(meal);
                return (
                  <button
                    key={meal}
                    type="button"
                    onClick={() =>
                      setSelectedMeals((prev) => (prev.includes(meal) ? prev.filter((m) => m !== meal) : [...prev, meal]))
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      active ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-[#0B111E]/90 border-white/10 text-slate-200 hover:bg-black/30"
                    }`}
                  >
                    {meal}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setCityQuery("");
                setCityDropdownOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-[#080E1A] border border-white/10 text-white text-xs font-semibold hover:bg-[#111C33] hover:border-[#E5C378]/40 transition"
            >
              See our destinations
            </button>
            <button
              type="button"
              onClick={() => handleSearchLive(false)}
              disabled={searchingLive}
              className="px-4 py-2 rounded-lg bg-[#C8A04F] text-[#080E1A] text-xs font-extrabold hover:bg-[#B58D3D] transition disabled:opacity-60"
            >
              {searchingLive ? "Searching..." : "Get Best Quote"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Left Filter Sidebar + Right Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Filter Sidebar */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between bg-[#0B111E]/90 border border-white/10 rounded-xl px-4 py-3">
            <span className="text-xs font-semibold text-slate-300">{filteredHotels.length} Hotels Found</span>
            <button
              type="button"
              onClick={resetFilters}
              className="px-2.5 py-1 rounded-md bg-[#080E1A] text-white text-[11px] font-semibold hover:bg-[#111C33]"
            >
              Reset all
            </button>
          </div>

          {/* Hotel Name Filter */}
          <div className="bg-[#0B111E]/90 border border-white/10 rounded-xl p-4 space-y-2.5">
            <h4 className="text-sm font-bold text-slate-100">Hotel Name</h4>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={hotelNameFilter}
                onChange={(e) => setHotelNameFilter(e.target.value)}
                placeholder="Search Hotel"
                className="w-full pl-9 pr-3 py-2 text-xs border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Dual-Handle Price Range Slider */}
          <div className="bg-[#0B111E]/90 border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-100">Price</h4>
              <span className="text-[11px] font-bold text-[#E5C378]">
                ${minPriceFilter.toLocaleString()} – ${maxPriceFilter.toLocaleString()}
              </span>
            </div>
            <div className="relative h-6 flex items-center">
              <div className="w-full h-1.5 bg-white/15 rounded-full relative">
                <div
                  className="h-1.5 bg-[#C8A04F] rounded-full absolute"
                  style={{
                    left: `${((minPriceFilter - 250) / (15000 - 250)) * 100}%`,
                    right: `${100 - ((maxPriceFilter - 250) / (15000 - 250)) * 100}%`,
                  }}
                />
              </div>
              <input
                type="range"
                min={250}
                max={15000}
                step={250}
                value={minPriceFilter}
                onChange={(e) => setMinPriceFilter(Math.min(Number(e.target.value), maxPriceFilter - 500))}
                className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#E5C378] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#080E1A] [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <input
                type="range"
                min={250}
                max={15000}
                step={250}
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(Math.max(Number(e.target.value), minPriceFilter + 500))}
                className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#E5C378] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#080E1A] [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>$ {minPriceFilter.toLocaleString()}</span>
              <span>$ {maxPriceFilter.toLocaleString()}</span>
            </div>
          </div>

          {/* Location Distance Slider */}
          <div className="bg-[#0B111E]/90 border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-100">Location</h4>
              <span className="text-xs font-semibold text-slate-200 border border-white/10 px-2 py-0.5 rounded">{maxDistanceKm} km</span>
            </div>
            <p className="text-xs text-slate-400">From the City Center</p>
            <input
              type="range"
              min={2}
              max={30}
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Hotel Locations Checkboxes */}
          <div className="bg-[#0B111E]/90 border border-white/10 rounded-xl p-4 space-y-2.5">
            <h4 className="text-sm font-bold text-slate-100">Hotel Locations</h4>
            {uniqueCities.map((city) => {
              const count = hotelsCatalog.filter((h) => h.city === city).length;
              const checked = selectedCities.includes(city);
              return (
                <label key={city} className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSelectedCities((prev) => (prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]))
                      }
                      className="rounded accent-emerald-600"
                    />
                    {city}
                  </span>
                  <span className="text-slate-400">{count}</span>
                </label>
              );
            })}
          </div>

          {/* Meals Checkboxes */}
          <div className="bg-[#0B111E]/90 border border-white/10 rounded-xl p-4 space-y-2.5">
            <h4 className="text-sm font-bold text-slate-100">Meals</h4>
            {[
              { code: "AI", label: "All Inclusive (AI)" },
              { code: "FB", label: "Breakfast + Lunch + Dinner (FB)" },
              { code: "HB", label: "Breakfast + Lunch/Dinner (HB)" },
              { code: "BB", label: "Breakfast (BB)" },
            ].map((m) => (
              <label key={m.code} className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMeals.includes(m.code)}
                  onChange={() =>
                    setSelectedMeals((prev) => (prev.includes(m.code) ? prev.filter((x) => x !== m.code) : [...prev, m.code]))
                  }
                  className="rounded accent-emerald-600"
                />
                {m.label}
              </label>
            ))}
          </div>

          {/* Ratings Checkboxes (Image 1) */}
          <div className="bg-[#0B111E]/90 border border-white/10 rounded-xl p-4 space-y-2.5">
            <h4 className="text-sm font-bold text-slate-100">Ratings</h4>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = hotelsCatalog.filter((h) => h.stars === star).length;
              const checked = selectedStars.includes(star);
              return (
                <label key={star} className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSelectedStars((prev) => (prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star]))
                      }
                      className="rounded accent-[#C8A04F]"
                    />
                    <span className="text-amber-500 tracking-tighter">
                      {"★".repeat(star)}
                      <span className="text-slate-300">{"★".repeat(5 - star)}</span>
                    </span>
                  </span>
                  <span className="text-slate-400">{count}</span>
                </label>
              );
            })}
          </div>

          {/* Reviews Checkboxes (Image 1) */}
          <div className="bg-[#0B111E]/90 border border-white/10 rounded-xl p-4 space-y-2.5">
            <h4 className="text-sm font-bold text-slate-100">Reviews</h4>
            {[
              { label: "Super: 9+", min: 9 },
              { label: "Excellent: 8+", min: 8 },
              { label: "Very Good: 7+", min: 7 },
              { label: "Good: 6+", min: 6 },
              { label: "Fairly Good: 5+", min: 5 },
            ].map((r) => (
              <label key={r.min} className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={minReviewScore === r.min}
                  onChange={() => setMinReviewScore((prev) => (prev === r.min ? null : r.min))}
                  className="rounded accent-[#C8A04F]"
                />
                {r.label}
              </label>
            ))}
          </div>
        </aside>

        {/* Right Results Area */}
        <div className="lg:col-span-9 space-y-4">
          {/* Sort & View Bar */}
          <div className="bg-[#0B111E]/90 border border-white/10 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setViewLayout("grid")}
                className={`p-1.5 rounded-lg ${viewLayout === "grid" ? "bg-emerald-50 text-emerald-700" : "text-slate-400 hover:text-slate-300"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewLayout("list")}
                className={`p-1.5 rounded-lg ${viewLayout === "list" ? "bg-emerald-50 text-emerald-700" : "text-slate-400 hover:text-slate-300"}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider">Sort By:</span>
              {[
                { id: "popular", label: "Popular" },
                { id: "rating_desc", label: "Ratings (Highest First)" },
                { id: "price_desc", label: "Price (Highest First)" },
                { id: "price_asc", label: "Price (Lowest First)" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSortBy(s.id as SortBy)}
                  className={`pb-0.5 font-semibold transition ${
                    sortBy === s.id ? "text-white border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Service-Specific Results: Flights / Transfers / Activities / Holiday / Offers / Hotels */}
          {serviceTab === "flights" ? (
            <div className="space-y-4">
              {(liveFlights.length > 0
                ? liveFlights
                : [
                    { id: "flt_ek", airline: "Emirates · First / Business", flightNumber: "EK 928", origin: "CAI", destination: "DXB", departureTime: "11:00", arrivalTime: "16:25", duration: "3h 25m", stops: 0, cabin: "Business Class", baggage: "40kg Check-in · 14kg Cabin", price: 1480 },
                    { id: "flt_af", airline: "Air France · La Première", flightNumber: "AF 567", origin: "CAI", destination: "CDG", departureTime: "08:45", arrivalTime: "13:50", duration: "5h 05m", stops: 0, cabin: "Business Class", baggage: "32kg × 2 Check-in · Lounge Access", price: 1890 },
                    { id: "flt_ba", airline: "British Airways · Club World", flightNumber: "BA 154", origin: "CAI", destination: "LHR", departureTime: "09:15", arrivalTime: "13:40", duration: "5h 25m", stops: 0, cabin: "Business Class", baggage: "32kg × 2 Check-in · Fast Track", price: 1750 },
                    { id: "flt_qr", airline: "Qatar Airways · Qsuite", flightNumber: "QR 1304", origin: "CAI", destination: "MLE", departureTime: "13:10", arrivalTime: "01:45", duration: "8h 35m", stops: 1, cabin: "Qsuite Business", baggage: "40kg Check-in · Private Suite", price: 2450 },
                    { id: "flt_lx", airline: "SWISS · Alpine Business", flightNumber: "LX 239", origin: "CAI", destination: "GVA", departureTime: "03:45", arrivalTime: "08:15", duration: "4h 30m", stops: 0, cabin: "Business Class", baggage: "32kg × 2 Check-in · Limousine Option", price: 1620 },
                  ]
              ).map((flt: any, idx: number) => (
                <div
                  key={flt.id || idx}
                  className="bg-[#0B111E]/90 border border-white/10 hover:border-[#E5C378]/35 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition"
                >
                  <div className="flex items-center gap-4">
                    <AirlineLogoBadge flt={flt} />
                    <div>
                      <div className="text-sm font-bold text-white flex flex-wrap items-center gap-2">
                        <span>{flt.airline || "Vanir Private Aviation"}</span>
                        <span className="px-2 py-0.5 rounded bg-[#C8A04F]/15 text-[#E5C378] text-[10px] font-bold">
                          {flt.flightNumber || "VNR-VIP"}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-3">
                        <span className="font-bold text-white">
                          {flt.origin || "CAI"} {flt.departureTime || "11:00"} → {flt.destination || "DXB"} {flt.arrivalTime || "16:25"}
                        </span>
                        <span className="text-slate-400">· {flt.duration || "3h 30m"}</span>
                        <span className="text-emerald-400 font-semibold">
                          {flt.stops === 0 ? "Direct Non-Stop" : `${flt.stops || 1} Stop`}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {flt.cabin || "Business Class"} · {flt.baggage || "32kg Check-in & VIP Fast Track"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="block text-[10px] text-slate-400 uppercase">Per Passenger</span>
                      <span className="text-xl font-extrabold text-[#E5C378]">
                        ${Number(flt.price || 1450).toLocaleString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFlight(flt);
                        setClientStep("checkout");
                        toast.success(`Selected ${flt.airline || "Flight"} (${flt.origin || "CAI"} → ${flt.destination || "DXB"})`);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="px-4 py-2.5 rounded-lg bg-[#C8A04F] text-[#080E1A] text-xs font-extrabold hover:bg-[#B58D3D] transition whitespace-nowrap"
                    >
                      Select Flight
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : serviceTab === "activities" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...customActivities, ...activitiesCatalog].map((act: any) => (
                <div key={act.id} className="bg-[#0B111E]/90 border border-white/10 hover:border-[#E5C378]/35 rounded-2xl overflow-hidden flex flex-col transition">
                  <div className="relative h-48">
                    <img
                      src={act.image || "/images/hotels-real/burj_al_arab.jpg"}
                      alt={act.title}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/hotels-real/luxury_villa_pool.jpg"; }}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-[#C8A04F] text-[#080E1A] text-[11px] font-extrabold px-2.5 py-1 rounded-md">
                      {act.duration || "VIP Experience"}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-white">{act.title}</h3>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">{act.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(act.tags || ["VIP Tour"]).map((tg: string) => (
                          <span key={tg} className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-slate-200 font-semibold">
                            {tg}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-end justify-between pt-3 border-t border-white/10">
                      <div>
                        <span className="block text-[11px] text-slate-400">VIP Activity Rate</span>
                        <span className="text-xl font-extrabold text-[#E5C378]">${Number(act.price || 450).toLocaleString()}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setClientStep("checkout");
                          toast.success(`Added "${act.title}" to your itinerary`);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="px-4 py-2 rounded-lg bg-[#C8A04F] text-[#080E1A] text-xs font-extrabold hover:bg-[#B58D3D] transition"
                      >
                        Book Activity
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : serviceTab === "transfers" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transfersCatalog.map((car) => (
                <div key={car.id} className="bg-[#0B111E]/90 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                  <div className="relative h-48">
                    <img
                      src={car.image}
                      alt={car.name}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/hotels-real/caimn-lobby-8343-hor-clsc.webp"; }}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-[#C8A04F] text-[#080E1A] text-[11px] font-extrabold px-2.5 py-1 rounded-md">
                      {car.category}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-white">{car.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{car.city} · Up to {car.passengers} Passengers · {car.luggage} Luggage</p>
                      <p className="text-xs text-emerald-400 font-semibold mt-1">90 min waiting included · Free cancellation</p>
                    </div>
                    <div className="flex items-end justify-between pt-3 border-t border-white/10">
                      <div>
                        <span className="block text-[11px] text-slate-400">Airport Transfer Rate</span>
                        <span className="text-xl font-extrabold text-white">${car.airportRate}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTransferId(car.id);
                          setClientStep("checkout");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="px-4 py-2 rounded-lg bg-[#C8A04F] text-[#080E1A] text-xs font-extrabold hover:bg-[#B58D3D] transition"
                      >
                        Book Transfer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : serviceTab === "holiday" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Array.isArray(destinationsData) && destinationsData.length > 0
                ? destinationsData.slice(0, 6)
                : [
                    { id: "hol_maldives", name: "Maldives Private Atoll", description: "7-Night Overwater Pool Villa with seaplane transfer, sunset yacht & private butler.", price: 6850, imageUrl: "/images/hotels-real/luxury_villa_pool.jpg" },
                    { id: "hol_paris", name: "Paris Royal Palace Escape", description: "5-Night Place Vendôme Suite, private Louvre after-hours & chauffeur Mercedes-Maybach.", price: 5400, imageUrl: "/images/hotels-real/ritz_paris.jpg" },
                    { id: "hol_dubai", name: "Dubai Ultra-Luxury Week", description: "5-Night Burj Al Arab / Royal Suite, helicopter tour & private desert dining.", price: 4900, imageUrl: "/images/hotels-real/burj_al_arab.jpg" },
                    { id: "hol_egypt", name: "Cairo & Luxor Royal Nile", description: "6-Night Pyramids private access, Sofitel Winter Palace & private Dahabiya Nile cruise.", price: 3950, imageUrl: "/images/hotels-real/winter_palace_luxor.jpg" },
                  ]
              ).map((dest: any) => (
                <div key={`hol_${dest.id}`} className="bg-[#0B111E]/90 border border-[#E5C378]/25 rounded-2xl overflow-hidden flex flex-col">
                  <div className="relative h-48">
                    <img
                      src={dest.imageUrl || "/images/hotels-real/luxury_villa_pool.jpg"}
                      alt={dest.name}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/hotels-real/luxury_hotel_suite.jpg"; }}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-[#C8A04F] text-[#080E1A] text-[11px] font-extrabold px-2.5 py-1 rounded-md">
                      HOLIDAY PACKAGE
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-white">{dest.name} Luxury Escape</h3>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">{dest.description || "All-inclusive curated holiday with private transfers & VIP concierge."}</p>
                    </div>
                    <div className="flex items-end justify-between pt-3 border-t border-white/10">
                      <div>
                        <span className="block text-[11px] text-slate-400">{nightsCount} Nights · Flight + Hotel</span>
                        <span className="text-xl font-extrabold text-[#E5C378]">${(Number(dest.price || 1850)).toLocaleString()}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCityQuery(dest.name || "");
                          setClientStep("checkout");
                          toast.success(`Selected ${dest.name} Holiday Package`);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="px-4 py-2 rounded-lg bg-[#C8A04F] text-[#080E1A] text-xs font-extrabold hover:bg-[#B58D3D] transition"
                      >
                        Book Holiday
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : serviceTab === "vip_services" ? (
            <div className="space-y-4">
              {/* VIP Bundle Offer Banner */}
              <div className="bg-gradient-to-r from-[#0B111E] via-[#131B2E] to-[#0B111E] border border-[#C8A04F]/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#E5C378]">
                    <Sparkles className="w-3.5 h-3.5" />
                    Bespoke VIP Add-On Concierge
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                    Select any 3+ VIP Services &amp; Save 15% Automatically
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {selectedVipServiceObjects.length > 0
                      ? `${selectedVipServiceObjects.length} service(s) added · Total: $${vipServicesTotal.toLocaleString()}${vipBundleDiscount > 0 ? ` (Saved $${vipBundleDiscount.toLocaleString()})` : ""}`
                      : "Elevate your flight & stay with Fast Track, Maybach Chauffeur, Private Yacht & 5G eSIM."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={applyFullVipBundle}
                    className="px-3.5 py-2 rounded-lg border border-[#C8A04F]/50 bg-[#C8A04F]/15 text-[#E5C378] text-xs font-extrabold hover:bg-[#C8A04F] hover:text-[#080E1A] transition"
                  >
                    + Full VIP Bundle (15% Off)
                  </button>
                  {selectedVipServiceObjects.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setClientStep("checkout");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="px-4 py-2 rounded-lg bg-[#C8A04F] text-[#080E1A] text-xs font-extrabold hover:bg-[#B58D3D] transition"
                    >
                      Proceed to Checkout →
                    </button>
                  )}
                </div>
              </div>

              {/* Photo-Illustrated VIP Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {VIP_EXTRA_SERVICES.map((svc) => {
                  const isAdded = selectedVipServices.includes(svc.id);
                  return (
                    <div
                      key={svc.id}
                      className={`bg-[#0B111E]/95 rounded-2xl overflow-hidden flex flex-col border transition-all duration-300 ${
                        isAdded
                          ? "border-[#E5C378] shadow-lg shadow-[#C8A04F]/15"
                          : "border-white/10 hover:border-[#E5C378]/40"
                      }`}
                    >
                      <div className="relative h-48 overflow-hidden bg-[#02050B]">
                        <img
                          src={svc.image}
                          alt={svc.title}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/hotels-real/luxury_hotel_suite.jpg"; }}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B111E] via-transparent to-black/30" />
                        <span className="absolute top-3 left-3 bg-[#080E1A]/90 border border-[#C8A04F]/40 text-[#E5C378] text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md">
                          {svc.category}
                        </span>
                        <span className="absolute top-3 right-3 bg-[#C8A04F] text-[#080E1A] text-[10px] font-extrabold px-2.5 py-1 rounded-md">
                          {svc.badge}
                        </span>
                        {isAdded && (
                          <span className="absolute bottom-3 left-3 bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Added to Booking
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h3 className="text-base font-bold text-white leading-snug">{svc.title}</h3>
                          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{svc.description}</p>
                        </div>
                        <div className="flex items-end justify-between pt-3 border-t border-white/10">
                          <div>
                            <span className="block text-[10px] uppercase tracking-wider text-slate-400">{svc.unit}</span>
                            <span className="text-xl font-extrabold text-[#E5C378]">+${svc.price.toLocaleString()}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              toggleVipService(svc.id);
                              if (!isAdded) toast.success(`Added "${svc.title}" to your booking`);
                              else toast.info(`Removed "${svc.title}"`);
                            }}
                            className={`px-4 py-2 rounded-lg text-xs font-extrabold transition ${
                              isAdded
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-400/40"
                                : "bg-[#C8A04F] text-[#080E1A] hover:bg-[#B58D3D]"
                            }`}
                          >
                            {isAdded ? "✓ Added (Remove)" : "+ Add Service"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className={viewLayout === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
              {(serviceTab === "offers"
                ? [...filteredHotels].sort((a, b) => b.discountPct - a.discountPct)
                : filteredHotels
              ).map((hotel) => {
              const totalPrice = hotel.pricePerNight * nightsCount * roomsCount;
              return (
                <div
                  key={hotel.id}
                  className={`bg-[#0B111E]/90 border border-white/10 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition ${
                    viewLayout === "list" ? "flex flex-col sm:flex-row" : ""
                  }`}
                >
                  <div className={`relative ${viewLayout === "list" ? "sm:w-72 h-52 sm:h-auto shrink-0" : "h-52"}`}>
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/hotels-real/luxury_hotel_suite.jpg"; }}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-[#C8A04F] text-[#080E1A] text-[11px] font-extrabold px-2.5 py-1 rounded-md shadow">
                      {hotel.discountPct}% OFF
                    </span>
                    {hotel.payLater && (
                      <span className="absolute bottom-3 left-3 bg-[#080E1A]/85 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md ">
                        Pay later
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-white leading-snug">{hotel.name}</h3>
                        <div className="flex items-center gap-1 shrink-0 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[11px] font-bold">
                          <span>{hotel.reviewScore}</span>
                          <span>/10</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {hotel.city}, {hotel.country}
                        </span>
                        <span className="text-amber-500 font-bold">{"★".repeat(hotel.stars)}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {checkIn}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {adults} Adults, {nightsCount} Nights
                        </span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between pt-2 border-t border-white/10">
                      <div>
                        <span className="block text-[11px] text-slate-400">Total Price</span>
                        <span className="text-xl font-extrabold text-white">${totalPrice.toLocaleString()}</span>
                        <span className="block text-[10px] text-slate-400">
                          ({serviceTab === "hotels" ? "Hotel Only" : "Hotel + Flight Ready"})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedHotel(hotel);
                          setSelectedRoom(hotel.rooms[0]);
                          setClientStep("details");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="px-4 py-2 rounded-lg bg-[#080E1A] text-[#E5C378] text-xs font-bold hover:bg-[#111C33] transition"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderHotelDetails = () => {
    const approvedReviews = Array.isArray(reviewsData) ? reviewsData.slice(0, 4) : [];
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setClientStep("search")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search Results
        </button>

        {/* Hero Banner + Floating Booking Card */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0B111E]/90 shadow-xs">
          <div className="relative h-72 md:h-96">
            <img src={selectedHotel.image} alt={selectedHotel.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 md:right-96 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-600 text-[11px] font-bold px-2.5 py-0.5 rounded">{selectedHotel.discountPct}% OFF</span>
                <span className="text-amber-400 text-sm">{"★".repeat(selectedHotel.stars)}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">{selectedHotel.name}</h2>
              <p className="text-xs md:text-sm text-slate-200 flex items-center gap-1.5 mt-1.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                {selectedHotel.address}
              </p>
            </div>
          </div>

          {/* Sticky Tabs Header */}
          <div className="flex items-center gap-6 px-6 border-t border-white/10 bg-[#0B111E]/90">
            {(["overview", "rooms", "amenities", "reviews"] as DetailsTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setDetailsTab(tab)}
                className={`py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                  detailsTab === tab ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-400 hover:text-slate-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Details + Floating Right Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* About */}
            <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl p-6 space-y-3">
              <h3 className="text-lg font-bold text-white">About {selectedHotel.name}</h3>
              <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
                {(showAllAbout ? selectedHotel.highlights : selectedHotel.highlights.slice(0, 3)).map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setShowAllAbout((v) => !v)}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                {showAllAbout ? "Show Less" : "See More"}
              </button>
            </div>

            {/* Choose Your Room */}
            <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Choose your room</h3>
              <div className="space-y-4">
                {selectedHotel.rooms.map((room) => {
                  const isSelected = selectedRoom.id === room.id;
                  return (
                    <div
                      key={room.id}
                      className={`border rounded-xl p-4 flex flex-col sm:flex-row gap-4 transition ${
                        isSelected ? "border-emerald-500 bg-emerald-50/30" : "border-white/10"
                      }`}
                    >
                      <div className="relative w-full sm:w-44 h-36 rounded-lg overflow-hidden shrink-0">
                        <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                        {room.recommended && (
                          <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            RECOMMENDED
                          </span>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-base font-bold text-white">{room.name}</h4>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/10 text-slate-200">
                              Meal: {room.mealPlan}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className={`text-xs font-semibold ${room.refundable ? "text-emerald-700" : "text-rose-600"}`}>
                              {room.refundable ? "✓ Free Cancellation" : "✕ Non-Refundable"}
                            </p>
                            {room.inclusions.map((inc, idx) => (
                              <p key={idx} className="text-xs text-slate-300">
                                ✓ {inc}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-end justify-between mt-4 pt-3 border-t border-white/10">
                          <div>
                            <span className="block text-[11px] text-slate-400">per night</span>
                            <span className="text-lg font-extrabold text-white">${room.pricePerNight.toLocaleString()}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedRoom(room)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                              isSelected
                                ? "bg-emerald-600 text-white"
                                : "border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {isSelected ? "✓ Selected" : "Select Room"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedHotel.amenities.map((am) => (
                  <div key={am} className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/10 text-xs font-semibold text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    {am}
                  </div>
                ))}
              </div>
            </div>

            {/* User Ratings & Reviews */}
            <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">User Ratings & Reviews</h3>
              <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <div className="text-center px-4">
                  <div className="text-3xl font-extrabold text-emerald-700">{(selectedHotel.reviewScore / 2).toFixed(1)}</div>
                  <div className="text-xs text-slate-400">{selectedHotel.reviewsCount} Reviews</div>
                  <div className="text-amber-500 text-xs mt-1">★★★★★</div>
                </div>
                <div className="flex-1 text-xs text-slate-300 space-y-1">
                  <div className="flex justify-between"><span>EXCELLENT</span><span className="font-semibold">89%</span></div>
                  <div className="flex justify-between"><span>VERY GOOD</span><span className="font-semibold">8%</span></div>
                  <div className="flex justify-between"><span>AVERAGE</span><span className="font-semibold">3%</span></div>
                </div>
              </div>

              {approvedReviews.length > 0 && (
                <div className="space-y-3">
                  {approvedReviews.map((rev: any, idx: number) => (
                    <div key={rev.id || idx} className="p-4 rounded-xl border border-white/10 bg-black/25">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{rev.authorName || rev.name || "Verified Guest"}</span>
                        <span className="text-amber-500 text-xs">{"★".repeat(Number(rev.rating) || 5)}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{rev.comment || rev.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Floating Booking + Pay Later Card */}
          <aside className="lg:col-span-4 space-y-4 sticky top-4">
            <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
              <img src={selectedRoom.image} alt={selectedRoom.name} className="w-full h-36 object-cover rounded-xl" />
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-white">{selectedRoom.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    For {adults} Adults · {nightsCount} Nights
                  </p>
                  <p className={`text-xs font-semibold mt-1 ${selectedRoom.refundable ? "text-emerald-700" : "text-rose-600"}`}>
                    {selectedRoom.refundable ? "✓ Free Cancellation" : "✕ Non-Refundable"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-[11px] text-slate-400">Per Night</span>
                  <span className="text-xl font-extrabold text-white">${selectedRoom.pricePerNight.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setClientStep("checkout");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full py-3 rounded-xl bg-[#C8A04F] text-[#080E1A] text-sm font-extrabold hover:bg-[#B58D3D] transition shadow-sm"
              >
                BOOK NOW
              </button>
            </div>

            {/* Pay Later Split Card */}
            <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="bg-[#080E1A] text-white px-3 py-1.5 rounded-lg text-xs font-bold">Pay later · Split</div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-white">${installmentAmount.toLocaleString()}</span>
                  <span className="text-xs text-slate-400">/mo</span>
                </div>
              </div>
              <div className="text-xs font-bold text-slate-200 text-center border-b border-white/10 pb-2">3 Installments (0% Interest)</div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between"><span>Booking Deposit</span><span className="font-semibold">${installmentAmount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>1st Installment</span><span className="font-semibold">${installmentAmount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>2nd Final Installment</span><span className="font-semibold">${(grandTotal - installmentAmount * 2).toLocaleString()}</span></div>
                <div className="flex justify-between pt-2 border-t border-white/10 font-bold text-emerald-700">
                  <span>Total Amount</span>
                  <span>${grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  };

  const renderCheckout = () => (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => setClientStep("details")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Property Details
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Hotel + Activity + Flights + Baggage + Guest Details */}
        <div className="lg:col-span-8 space-y-5">
          {/* Selected Hotel Summary */}
          <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <img src={selectedHotel.image} alt={selectedHotel.name} className="w-24 h-24 rounded-xl object-cover shrink-0" />
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">{selectedHotel.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedHotel.address}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-sky-50 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded">COUPLE & VIP FRIENDLY</span>
                  <span className="text-amber-500 text-xs">{"★".repeat(selectedHotel.stars)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-black/30 text-xs">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold">CHECK IN</span>
                <span className="font-bold text-white">{checkIn}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold">CHECK OUT</span>
                <span className="font-bold text-white">{checkOut}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold">GUESTS</span>
                <span className="font-bold text-white">
                  {nightsCount} Nights | {adults} Adults
                </span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-3 flex items-center gap-3">
              <img src={selectedRoom.image} alt={selectedRoom.name} className="w-16 h-16 rounded-lg object-cover" />
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-white">{selectedRoom.name}</div>
                <div className="text-slate-400">Meal Plan: {selectedRoom.mealPlan} · {selectedRoom.refundable ? "Refundable" : "Non-Refundable"}</div>
              </div>
            </div>
          </div>

          {/* Activity Add-On Card */}
          <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Curated Activity / Excursion</h4>
              <select
                value={selectedActivity?.id || ""}
                onChange={(e) => setSelectedActivity(activitiesCatalog.find((a) => a.id === e.target.value) || null)}
                className="text-xs border border-white/10 rounded-lg px-2.5 py-1.5 bg-[#0B111E]/90"
              >
                <option value="">No Activity</option>
                {activitiesCatalog.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.title} (${act.price})
                  </option>
                ))}
              </select>
            </div>
            {selectedActivity && (
              <div className="flex items-center gap-4 p-3 rounded-xl bg-black/30">
                <img src={selectedActivity.image} alt={selectedActivity.title} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1 text-xs">
                  <div className="font-bold text-white">{selectedActivity.title}</div>
                  <div className="text-slate-400">{selectedActivity.city} · {selectedActivity.duration}</div>
                </div>
                <div className="text-sm font-extrabold text-emerald-700">${(selectedActivity.price * adults).toLocaleString()}</div>
              </div>
            )}
          </div>

          {/* Ticket Details (Flights) */}
          {serviceTab !== "hotels" && (
            <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl p-5 space-y-4">
              <h4 className="text-base font-bold text-white">Ticket Details</h4>
              {liveFlights.slice(0, 2).map((flt, idx) => (
                <div key={flt.id || idx} className="border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <Plane className="w-4 h-4 text-emerald-600" />
                      {flt.origin} → {flt.destination}
                    </span>
                    <span className="text-slate-400">
                      {flt.stops === 0 ? "Direct" : `${flt.stops} Stops`} · Total duration: {flt.duration}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <AirlineLogoBadge flt={flt} size="sm" />
                      <div>
                        <div className="text-xs font-bold text-[#E5C378]">{flt.airline}</div>
                        <div className="text-[11px] text-slate-400">{flt.flightNumber} · {flt.cabin}</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-base font-extrabold text-white">{flt.departureTime}</div>
                      <div className="text-[11px] text-slate-400">{flt.origin}</div>
                    </div>
                    <div className="flex-1 border-t border-dashed border-slate-300 relative text-center">
                      <span className="text-[10px] text-slate-400 bg-[#0B111E]/90 px-2 -top-2.5 relative">{flt.duration}</span>
                    </div>
                    <div className="text-center">
                      <div className="text-base font-extrabold text-white">{flt.arrivalTime}</div>
                      <div className="text-[11px] text-slate-400">{flt.destination}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Baggage Selector */}
          <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl p-5 space-y-3">
            <h4 className="text-base font-bold text-white">Baggage</h4>
            {[
              { label: "Outbound Flight (Extra Checked Bag 23kg)", count: extraBagsOutbound, setCount: setExtraBagsOutbound },
              { label: "Return Flight (Extra Checked Bag 23kg)", count: extraBagsReturn, setCount: setExtraBagsReturn },
            ].map((row, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-black/25 text-xs">
                <div>
                  <div className="font-bold text-slate-100">{row.label}</div>
                  <div className="text-slate-400">Included: 1 cabin + 1 checked bag · Additional: $38/bag</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => row.setCount((c) => Math.max(0, c - 1))}
                    className="w-7 h-7 rounded-lg border border-white/10 bg-[#0B111E]/90 flex items-center justify-center hover:bg-white/10"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-bold">{row.count}</span>
                  <button
                    type="button"
                    onClick={() => row.setCount((c) => Math.min(5, c + 1))}
                    className="w-7 h-7 rounded-lg border border-white/10 bg-[#0B111E]/90 flex items-center justify-center hover:bg-white/10"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Guest Details */}
          <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl p-5 space-y-4">
            <h4 className="text-base font-bold text-white">Guest Details</h4>
            {guests.map((g, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-white/10 space-y-3">
                <span className="inline-block bg-sky-50 text-sky-700 text-[11px] font-bold px-2.5 py-0.5 rounded">
                  ADULT {idx + 1}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Title*</label>
                    <select
                      value={g.title}
                      onChange={(e) => {
                        const next = [...guests];
                        next[idx].title = e.target.value;
                        setGuests(next);
                      }}
                      className="w-full border border-white/10 rounded-lg px-3 py-2 text-xs"
                    >
                      <option>Mr.</option>
                      <option>Mrs.</option>
                      <option>Ms.</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">First Name*</label>
                    <input
                      type="text"
                      value={g.firstName}
                      onChange={(e) => {
                        const next = [...guests];
                        next[idx].firstName = e.target.value;
                        setGuests(next);
                      }}
                      placeholder="Enter first name"
                      className="w-full border border-white/10 rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Last Name*</label>
                    <input
                      type="text"
                      value={g.lastName}
                      onChange={(e) => {
                        const next = [...guests];
                        next[idx].lastName = e.target.value;
                        setGuests(next);
                      }}
                      placeholder="Enter last name"
                      className="w-full border border-white/10 rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={g.dob}
                      onChange={(e) => {
                        const next = [...guests];
                        next[idx].dob = e.target.value;
                        setGuests(next);
                      }}
                      className="w-full border border-white/10 rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Gender</label>
                    <select
                      value={g.gender}
                      onChange={(e) => {
                        const next = [...guests];
                        next[idx].gender = e.target.value;
                        setGuests(next);
                      }}
                      className="w-full border border-white/10 rounded-lg px-3 py-2 text-xs"
                    >
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Photo-Illustrated VIP Extra Services Add-Ons */}
          <div className="bg-[#0B111E]/95 border border-[#C8A04F]/30 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#E5C378]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Enhance Your Journey
                </div>
                <h4 className="text-base font-bold text-white mt-0.5">VIP Extra Services &amp; Concierge Add-Ons</h4>
                <p className="text-[11px] text-slate-400">Select 3 or more services to unlock an automatic 15% VIP Bundle Discount.</p>
              </div>
              <button
                type="button"
                onClick={applyFullVipBundle}
                className="px-3.5 py-2 rounded-lg border border-[#C8A04F]/50 bg-[#C8A04F]/15 text-[#E5C378] text-xs font-extrabold hover:bg-[#C8A04F] hover:text-[#080E1A] transition whitespace-nowrap"
              >
                + Full VIP Bundle (15% Off)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {VIP_EXTRA_SERVICES.map((svc) => {
                const isAdded = selectedVipServices.includes(svc.id);
                return (
                  <div
                    key={svc.id}
                    onClick={() => toggleVipService(svc.id)}
                    className={`cursor-pointer rounded-xl overflow-hidden border transition-all flex flex-col ${
                      isAdded
                        ? "border-[#E5C378] bg-[#C8A04F]/10 shadow-md shadow-[#C8A04F]/10"
                        : "border-white/10 bg-[#080E1A]/80 hover:border-[#E5C378]/40"
                    }`}
                  >
                    <div className="relative h-28 overflow-hidden bg-[#02050B]">
                      <img
                        src={svc.image}
                        alt={svc.title}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/hotels-real/luxury_hotel_suite.jpg"; }}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080E1A] via-transparent to-black/25" />
                      <span className="absolute top-2 left-2 bg-[#080E1A]/90 text-[#E5C378] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        {svc.category}
                      </span>
                      <span className="absolute top-2 right-2 bg-[#C8A04F] text-[#080E1A] text-[10px] font-extrabold px-2 py-0.5 rounded">
                        +${svc.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-white leading-snug">{svc.title}</div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{svc.description}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <span className="text-[10px] text-slate-400">{svc.unit}</span>
                        <span
                          className={`text-[11px] font-extrabold ${
                            isAdded ? "text-emerald-400" : "text-[#E5C378]"
                          }`}
                        >
                          {isAdded ? "✓ Added" : "+ Add"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strict 4-Stage Modern Payment Gateway */}
          <div id="strict-payment-gateway">
            <StrictPaymentCheckout
              packageTitle={`${selectedHotel.name} (${selectedRoom.name})`}
              destination={`${selectedHotel.city}${selectedHotel.country ? `, ${selectedHotel.country}` : ""}`}
              checkIn={checkIn}
              checkOut={checkOut}
              guestsSummary={`${adults} Adults · ${children} Child · ${roomsCount} Room`}
              totalAmount={grandTotal}
              dueTodayAmount={payLaterMode ? installmentAmount : grandTotal}
              payLaterMode={payLaterMode}
              initialName={`${guests[0]?.firstName || ""} ${guests[0]?.lastName || ""}`.trim() || user?.name || ""}
              initialEmail={contactEmail || user?.email || ""}
              initialPhone={contactPhone}
              isSubmitting={createBookingMutation.isPending}
              prepareHostedRedirect={(kyc) => {
                try {
                  sessionStorage.setItem(
                    "vanir_pending_payment_draft",
                    JSON.stringify({
                      packageName: `${selectedHotel.name} (${selectedRoom.name})`,
                      destination: `${selectedHotel.city}${selectedHotel.country ? `, ${selectedHotel.country}` : ""}`,
                      fullName: kyc.fullName,
                      email: kyc.email,
                      phone: kyc.phone,
                      checkIn,
                      checkOut,
                      checkInDate: new Date(checkIn).getTime(),
                      checkOutDate: new Date(checkOut).getTime(),
                      adults,
                      children,
                      grandTotal,
                      notes: [
                        `Room: ${selectedRoom.name} (${selectedRoom.mealPlan})`,
                        `Passport: ${kyc.passportNumber} (${kyc.nationality})`,
                        selectedActivity ? `Activity: ${selectedActivity.title}` : null,
                        selectedTransfer ? `Transfer: ${selectedTransfer.name}` : null,
                        selectedVipServiceObjects.length > 0
                          ? `VIP Extra Services: ${selectedVipServiceObjects.map((s) => s.title).join(", ")}`
                          : null,
                        `Seats: ${selectedSeatOutbound} / ${selectedSeatReturn}`,
                        `Plan: ${payLaterMode ? "3-Installment Split Pay Later" : "Full Payment"}`,
                      ]
                        .filter(Boolean)
                        .join(" | "),
                    })
                  );
                } catch {}
              }}
              onCompletePayment={(payRes) => {
                setContactEmail(payRes.email);
                setContactPhone(payRes.phone);
                createBookingMutation.mutate({
                  packageName: `${selectedHotel.name} (${selectedRoom.name})`,
                  destination: `${selectedHotel.city}${selectedHotel.country ? `, ${selectedHotel.country}` : ""}`,
                  guestName: payRes.fullName,
                  guestEmail: payRes.email,
                  guestPhone: payRes.phone,
                  customerName: payRes.fullName,
                  customerEmail: payRes.email,
                  customerPhone: payRes.phone,
                  checkInDate: new Date(checkIn).getTime(),
                  checkOutDate: new Date(checkOut).getTime(),
                  travelDate: checkIn,
                  returnDate: checkOut,
                  adults,
                  children,
                  guests: adults + children,
                  totalPrice: String(grandTotal),
                  notes: [
                    `Room: ${selectedRoom.name} (${selectedRoom.mealPlan})`,
                    `Passport: ${payRes.passportNumber} (${payRes.nationality})`,
                    `Payment: ${payRes.method.toUpperCase()}${payRes.cardLast4 ? ` ${payRes.cardBrand} •••• ${payRes.cardLast4}` : ""}${payRes.wireReference ? ` Ref:${payRes.wireReference}` : ""}`,
                    `3DS Auth: ${payRes.authCode}`,
                    selectedActivity ? `Activity: ${selectedActivity.title}` : null,
                    selectedTransfer ? `Transfer: ${selectedTransfer.name}` : null,
                    selectedVipServiceObjects.length > 0
                      ? `VIP Extra Services: ${selectedVipServiceObjects.map((s) => s.title).join(", ")}`
                      : null,
                    `Seats: ${selectedSeatOutbound} / ${selectedSeatReturn}`,
                    `Plan: ${payLaterMode ? "3-Installment Split Pay Later" : "Full Payment"}`,
                  ]
                    .filter(Boolean)
                    .join(" | "),
                } as any);
              }}
            />
          </div>
        </div>

        {/* Right Column: Pay Later + Eco + Transfers + Seats + Fare Summary */}
        <aside className="lg:col-span-4 space-y-5">
          {/* Pay Later Split Toggle */}
          <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="bg-[#080E1A] text-white text-xs font-bold px-3 py-1 rounded-lg">Pay later</span>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={payLaterMode}
                  onChange={(e) => setPayLaterMode(e.target.checked)}
                  className="accent-emerald-600"
                />
                3 Installments
              </label>
            </div>
            <div className="text-xs text-slate-300 flex justify-between pt-2 border-t border-white/10">
              <span>Due Today (1st Installment)</span>
              <span className="font-bold text-white">${(payLaterMode ? installmentAmount : grandTotal).toLocaleString()}</span>
            </div>
          </div>

          {/* Carbon Neutral */}
          <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl overflow-hidden">
            <div className="bg-emerald-900 text-white p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <Leaf className="w-4 h-4" />
                CARBON NEUTRAL TRAVEL
              </div>
              <p className="text-xs text-emerald-100 mt-1">We plant 10 trees for every passenger</p>
            </div>
            <div className="p-4 space-y-2 text-xs">
              {[
                { id: "1yr", label: "Travel Neutral in 1 year (996 kg CO2)", price: "$45" },
                { id: "2yr", label: "Travel Neutral in 2 years", price: "$30" },
                { id: "5yr", label: "Travel Neutral in 5 years", price: "$20" },
                { id: "none", label: "No Offset", price: "$0" },
              ].map((opt) => (
                <label key={opt.id} className="flex items-center justify-between cursor-pointer py-1">
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="carbon"
                      checked={carbonOption === opt.id}
                      onChange={() => setCarbonOption(opt.id as any)}
                      className="accent-emerald-600"
                    />
                    {opt.label}
                  </span>
                  <span className="font-bold text-slate-200">{opt.price}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Transfers Selector (Real Fleet) */}
          <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl p-5 space-y-3">
            <h4 className="text-base font-bold text-white">Transfers</h4>
            <div className="space-y-3">
              {transfersCatalog.map((car) => {
                const active = selectedTransferId === car.id;
                return (
                  <div
                    key={car.id}
                    onClick={() => setSelectedTransferId(car.id)}
                    className={`border rounded-xl p-3 cursor-pointer transition ${
                      active ? "border-sky-500 bg-sky-50/40" : "border-white/10 hover:border-slate-300"
                    }`}
                  >
                    <img src={car.image} alt={car.name} className="w-full h-24 object-cover rounded-lg mb-2" />
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-bold text-white">
                        <input type="radio" checked={active} readOnly className="accent-sky-600" />
                        {car.name}
                      </span>
                      <span className="text-xs font-extrabold text-white">${car.airportRate}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Upto {car.passengers} guests · Upto {car.luggage} bags · 90 min waiting included
                    </p>
                    <p className="text-[11px] text-emerald-700 font-semibold">Free cancellation 5h before trip</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Select Seats & Luggage Protection */}
          <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Armchair className="w-4 h-4 text-emerald-600" />
              Select Seats
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="block text-[10px] text-slate-400">Outbound</span>
                <select
                  value={selectedSeatOutbound}
                  onChange={(e) => setSelectedSeatOutbound(e.target.value)}
                  className="w-full border border-white/10 rounded-lg px-2 py-1.5 mt-1"
                >
                  {["1A", "2C", "12A", "14F", "18B"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400">Return</span>
                <select
                  value={selectedSeatReturn}
                  onChange={(e) => setSelectedSeatReturn(e.target.value)}
                  className="w-full border border-white/10 rounded-lg px-2 py-1.5 mt-1"
                >
                  {["1A", "3D", "14C", "16A", "20F"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-center justify-between pt-3 border-t border-white/10 text-xs cursor-pointer">
              <span className="font-semibold text-slate-200">Luggage Protection (+$29)</span>
              <input
                type="checkbox"
                checked={luggageProtection}
                onChange={(e) => setLuggageProtection(e.target.checked)}
                className="accent-emerald-600"
              />
            </label>
          </div>

          {/* Fare Summary */}
          <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl p-5 space-y-3 shadow-sm">
            <h4 className="text-base font-bold text-white">Fare Summary</h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between"><span>Hotel ({nightsCount} Nights)</span><span className="font-semibold">${hotelTotal.toLocaleString()}</span></div>
              {flightTotal > 0 && <div className="flex justify-between"><span>Flights ({adults} Adults, {children} Child)</span><span className="font-semibold">${flightTotal.toLocaleString()}</span></div>}
              {activityTotal > 0 && <div className="flex justify-between"><span>Activity</span><span className="font-semibold">${activityTotal.toLocaleString()}</span></div>}
              <div className="flex justify-between"><span>VIP Transfer</span><span className="font-semibold">${transferTotal.toLocaleString()}</span></div>
              {selectedVipServiceObjects.length > 0 && (
                <div className="flex justify-between text-[#E5C378]">
                  <span>VIP Extra Services ({selectedVipServiceObjects.length})</span>
                  <span className="font-semibold">+${vipServicesRawTotal.toLocaleString()}</span>
                </div>
              )}
              {vipBundleDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>VIP Bundle Discount (15%)</span>
                  <span className="font-semibold">-${vipBundleDiscount.toLocaleString()}</span>
                </div>
              )}
              {(baggageTotal + carbonTotal + luggageProtTotal) > 0 && (
                <div className="flex justify-between"><span>Extras (Bags / Eco / Protection)</span><span className="font-semibold">${(baggageTotal + carbonTotal + luggageProtTotal).toLocaleString()}</span></div>
              )}
              <div className="flex justify-between"><span>Taxes & Fees</span><span className="font-semibold">${taxesAndFees.toLocaleString()}</span></div>
              <div className="flex justify-between pt-3 border-t border-white/10 text-sm font-extrabold text-emerald-400">
                <span>Total Payable</span>
                <span>${grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("strict-payment-gateway");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                toast.info("Complete the 4 strict verification & 3DS2 payment stages to authorize this booking.");
              }}
              disabled={createBookingMutation.isPending}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B58D3D] text-[#080E1A] text-sm font-extrabold hover:brightness-110 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#C8A04F]/20"
            >
              <ShieldCheck className="w-4 h-4" />
              {createBookingMutation.isPending ? "Authorizing Order..." : "Proceed to Strict Payment"}
            </button>
            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Protected by 256-bit TLS, Luhn Checksum &amp; 3D Secure 2.0 Verification.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );

  const renderConfirmed = () => (
    <div className="max-w-2xl mx-auto bg-[#0B111E]/90 border border-emerald-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
      <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-extrabold text-white">Booking Confirmed!</h2>
      <p className="text-sm text-slate-300">
        Your itinerary for <span className="font-bold text-white">{selectedHotel.name}</span> has been saved to Vanir Reservations.
      </p>
      <div className="inline-block bg-[#080E1A] text-emerald-400 font-mono text-lg font-bold px-5 py-2.5 rounded-xl">
        {createdOrderCode}
      </div>
      <div className="pt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            setClientStep("search");
            setCreatedOrderCode(null);
          }}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
        >
          Book Another Trip
        </button>
        {mode === "admin" && (
          <button
            type="button"
            onClick={() => {
              setClientStep("search");
              setAdminSection("orders");
            }}
            className="px-5 py-2.5 rounded-xl bg-white/10 text-slate-100 text-xs font-bold hover:bg-slate-200"
          >
            View in Orders List
          </button>
        )}
      </div>
    </div>
  );

  // ─── Admin Management Views ──────────────────────────────────────────────
  const renderAdminOrders = () => {
    if (activeOrderModal) {
      return (
        <OrderDetailView
          order={activeOrderModal}
          onBack={() => setActiveOrderModal(null)}
          onUpdateStatus={(id, status) => updateBookingStatusMutation.mutate({ id: id as any, status: status as any })}
          onSaveOrderDetails={(id, patch) => {
            setActiveOrderModal((prev: any) => (prev ? { ...prev, ...patch } : prev));
          }}
        />
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Search Order #, guest name, hotel..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-white/10 rounded-lg"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {["all", "pending", "confirmed", "completed", "cancelled"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setOrderStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${
                  orderStatusFilter === st ? "bg-[#080E1A] text-[#E5C378]" : "bg-white/10 text-slate-300 hover:bg-white/20"
                }`}
              >
                {st}
              </button>
            ))}
            <button
              type="button"
              onClick={() =>
                setActiveOrderModal({
                  id: "sample_6079",
                  confirmationCode: "6079",
                  packageName: "Beachfront Spacious 5BR Villa | Just Renovated",
                  destination: "Tambon Bo Nok, Chang Wat Prachuap Khiri Khan",
                  customerName: "Jayvion Simon",
                  customerEmail: "jayvion@vanirgroup.com",
                  customerPhone: "+20 100 555 6079",
                  nationality: "Egyptian",
                  travelDate: "2026-07-20",
                  returnDate: "2026-07-25",
                  totalPrice: "2046",
                  status: "completed",
                  paymentStatus: "paid",
                })
              }
              className="px-3 py-1.5 rounded-lg bg-[#C8A04F] text-[#080E1A] text-xs font-extrabold hover:bg-[#B58D3D]"
            >
              View Order #6079
            </button>
          </div>
        </div>

        <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/30 text-slate-400 uppercase border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">Order #</th>
                  <th className="px-4 py-3">Package / Property</th>
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Travel Date</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {adminOrders.map((b: any) => (
                  <tr key={b.id} className="hover:bg-black/25">
                    <td className="px-4 py-3 font-mono font-bold text-white">#{String(b.confirmationCode || b.id || "").slice(0, 8)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-100">{b.packageName}</td>
                    <td className="px-4 py-3 text-slate-300">
                      <div>{b.customerName}</div>
                      <div className="text-[11px] text-slate-400">{b.customerEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{b.travelDate}</td>
                    <td className="px-4 py-3 font-bold text-white">${Number(b.totalPrice || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                          b.status === "confirmed" || b.status === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : b.status === "cancelled"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {b.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveOrderModal(b)}
                        className="px-3 py-1.5 rounded-lg bg-[#080E1A] text-[#E5C378] text-[11px] font-bold hover:bg-[#111C33]"
                      >
                        Manage Order
                      </button>
                    </td>
                  </tr>
                ))}
                {adminOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No matching orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderAdminActivities = () => {
    const allActs = [...customActivities, ...activitiesCatalog];
    return (
      <div className="space-y-4">
        <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                placeholder="Search activities..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-white/10 rounded-lg"
              />
            </div>
            <button
              type="button"
              onClick={() => setNewActivityOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#080E1A] text-[#E5C378] text-xs font-bold hover:bg-[#111C33]"
            >
              <Plus className="w-3.5 h-3.5" />
              New Activities
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            {["Categories", "Duration", "Price", "Recommended activity", "Supplier", "Services"].map((pill) => (
              <span key={pill} className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 bg-black/30 font-medium">
                {pill} ▾
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {allActs
            .filter((a) => !activitySearch.trim() || `${a.title} ${a.city}`.toLowerCase().includes(activitySearch.toLowerCase()))
            .map((act) => (
              <div key={act.id} className="bg-[#0B111E]/90 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                <img src={act.image} alt={act.title} className="w-32 h-24 rounded-xl object-cover shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <h4 className="text-sm font-bold text-white">{act.title}</h4>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Duration: {act.duration} · {act.city}
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">{act.description}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 text-[10px] font-semibold">{act.category}</span>
                    <span className={`text-[10px] font-bold ${act.refundable ? "text-emerald-600" : "text-rose-500"}`}>
                      {act.refundable ? "Refundable" : "Non-Refundable"}
                    </span>
                  </div>
                </div>
                <div className="text-right space-y-2 shrink-0">
                  <span className="inline-block bg-[#C8A04F] text-[#080E1A] text-[10px] font-extrabold px-2 py-0.5 rounded">
                    {act.discountPct || 27}% OFF
                  </span>
                  {act.originalPrice && (
                    <div className="text-[11px] text-slate-400 line-through">${act.originalPrice}</div>
                  )}
                  <div className="text-lg font-extrabold text-white">${act.price.toLocaleString()}</div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedActivity(act);
                      setAdminSection("create");
                      setClientStep("checkout");
                      toast.success(`Added "${act.title}" to order`);
                    }}
                    className="px-4 py-1.5 rounded-lg border border-[#C8A04F] text-white text-xs font-bold hover:bg-[#C8A04F]/15"
                  >
                    SELECT
                  </button>
                </div>
              </div>
            ))}
        </div>

        {newActivityOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
            <div className="bg-[#0B111E]/90 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-white">Add New Activity</h4>
                <button type="button" onClick={() => setNewActivityOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
              </div>
              <input
                type="text"
                placeholder="Activity Title"
                value={newActivityForm.title}
                onChange={(e) => setNewActivityForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full border border-white/10 rounded-lg px-3 py-2"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  value={newActivityForm.city}
                  onChange={(e) => setNewActivityForm((p) => ({ ...p, city: e.target.value }))}
                  className="w-full border border-white/10 rounded-lg px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Price (USD)"
                  value={newActivityForm.price}
                  onChange={(e) => setNewActivityForm((p) => ({ ...p, price: Number(e.target.value) }))}
                  className="w-full border border-white/10 rounded-lg px-3 py-2"
                />
              </div>
              <textarea
                rows={3}
                placeholder="Description"
                value={newActivityForm.description}
                onChange={(e) => setNewActivityForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full border border-white/10 rounded-lg px-3 py-2"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setNewActivityOpen(false)} className="px-4 py-2 rounded-lg bg-white/10 font-bold">Cancel</button>
                <button
                  type="button"
                  onClick={() => {
                    if (!newActivityForm.title.trim()) return toast.error("Enter activity title");
                    setCustomActivities((prev) => [
                      {
                        id: `act_custom_${Date.now()}`,
                        title: newActivityForm.title,
                        city: newActivityForm.city,
                        duration: newActivityForm.duration,
                        category: newActivityForm.category,
                        price: newActivityForm.price,
                        originalPrice: Math.round(newActivityForm.price * 1.27),
                        discountPct: 27,
                        description: newActivityForm.description || "Curated Vanir VIP experience.",
                        image: "/images/hotels-real/burj_al_arab.jpg",
                        refundable: true,
                      },
                      ...prev,
                    ]);
                    setNewActivityOpen(false);
                    toast.success("New activity added");
                  }}
                  className="px-4 py-2 rounded-lg bg-[#C8A04F] text-[#080E1A] font-extrabold"
                >
                  Create Activity
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAdminSuppliers = () => {
    const suppliers = [
      ...customSuppliers,
      { name: "Duffel Live Flights API", email: "api@duffel.com", created: "March 23, 2025", revenue: "$50,450" },
      { name: "LiteAPI & SearchAPI Hotels", email: "partners@liteapi.travel", created: "February 8, 2025", revenue: "$85,884" },
      { name: "Amadeus GDS Enterprise", email: "gds@amadeus.com", created: "January 10, 2025", revenue: "$50,450" },
      { name: "Vanir Direct Fleet (Chauffeur)", email: "fleet@vanirgroup.com", created: "April 4, 2025", revenue: "$34,765" },
    ];
    const exportCsv = () => {
      const csv = ["Name,Email,Date Created,Revenue", ...suppliers.map((s) => `"${s.name}","${s.email}","${s.created}","${s.revenue}"`)].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vanir-suppliers.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Suppliers CSV exported");
    };
    return (
      <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-white mr-3">Suppliers list</h3>
            {["Name ▾", "Status ▾", "Last Updated ▾"].map((f) => (
              <span key={f} className="px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-semibold text-slate-300">{f}</span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-slate-200 hover:bg-black/30"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <button
              type="button"
              onClick={() => setNewSupplierOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080E1A] text-[#E5C378] text-xs font-bold hover:bg-[#111C33]"
            >
              Add User +
            </button>
          </div>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-black/30 text-slate-400 uppercase border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Date Created</th>
              <th className="px-4 py-3">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {suppliers.map((s) => (
              <tr key={s.name} className="hover:bg-black/25">
                <td className="px-4 py-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#080E1A] text-[#E5C378] font-bold flex items-center justify-center text-[11px]">
                    {s.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <div className="font-bold text-white">{s.name}</div>
                    <div className="text-[11px] text-slate-400">{s.email}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-300">{s.created}</td>
                <td className="px-4 py-3 font-bold text-white">{s.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {newSupplierOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
            <div className="bg-[#0B111E]/90 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-white">Add Supplier / Partner</h4>
                <button type="button" onClick={() => setNewSupplierOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
              </div>
              <input
                type="text"
                placeholder="Supplier Name (e.g. Booking.com)"
                value={newSupplierForm.name}
                onChange={(e) => setNewSupplierForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full border border-white/10 rounded-lg px-3 py-2"
              />
              <input
                type="email"
                placeholder="Partner Email"
                value={newSupplierForm.email}
                onChange={(e) => setNewSupplierForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full border border-white/10 rounded-lg px-3 py-2"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setNewSupplierOpen(false)} className="px-4 py-2 rounded-lg bg-white/10 font-bold">Cancel</button>
                <button
                  type="button"
                  onClick={() => {
                    if (!newSupplierForm.name.trim()) return toast.error("Enter supplier name");
                    setCustomSuppliers((prev) => [{ ...newSupplierForm, created: "Today" }, ...prev]);
                    setNewSupplierOpen(false);
                    toast.success("Supplier added");
                  }}
                  className="px-4 py-2 rounded-lg bg-[#C8A04F] text-[#080E1A] font-extrabold"
                >
                  Save Supplier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAdminTickets = () => (
    <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-bold text-white">Tickets</h3>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: `All Tickets (${Array.isArray(ticketsData) ? ticketsData.length : 0})` },
            { id: "new", label: "Open" },
            { id: "read", label: "Pending" },
            { id: "replied", label: "Solved" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTicketTab(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                ticketTab === t.id ? "bg-[#080E1A] text-[#E5C378]" : "bg-white/10 text-slate-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/30 text-slate-400 uppercase border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Requester</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Assignee</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {adminTickets.map((t: any) => {
              const name = t.name || t.sender || "Guest";
              return (
                <tr key={t.id} className="hover:bg-black/25">
                  <td className="px-4 py-3 font-bold text-white flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px]">
                      {name.slice(0, 2).toUpperCase()}
                    </span>
                    {name}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{t.email || "-"}</td>
                  <td className="px-4 py-3 text-slate-200 max-w-xs truncate">{t.subject || t.message}</td>
                  <td className="px-4 py-3 text-slate-400">Vanir Concierge</td>
                  <td className="px-4 py-3">
                    <select
                      value={t.status || "new"}
                      onChange={(e) => updateTicketStatusMutation.mutate({ id: t.id, status: e.target.value as any })}
                      className="border border-white/10 rounded-lg px-2 py-1 text-xs bg-[#0B111E]/90"
                    >
                      <option value="new">Open</option>
                      <option value="read">Pending</option>
                      <option value="replied">Solved</option>
                    </select>
                  </td>
                </tr>
              );
            })}
            {adminTickets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No tickets in this queue.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ─── Notifications List (Live Bookings + Tickets + System) ────────────────
  const notificationsList = useMemo(() => {
    const items: { id: string; title: string; subtitle: string; time: string; unread: boolean }[] = [];
    if (Array.isArray(bookingsData)) {
      bookingsData.slice(0, 3).forEach((b: any) => {
        items.push({
          id: `bk_${b.id}`,
          title: `Order ${b.confirmationCode || "#VIP"} · ${b.status || "pending"}`,
          subtitle: `${b.customerName || "VIP Guest"} — ${b.packageName || "Luxury Stay"}`,
          time: b.travelDate || "Today",
          unread: b.status === "pending",
        });
      });
    }
    if (Array.isArray(ticketsData)) {
      ticketsData.slice(0, 2).forEach((t: any) => {
        items.push({
          id: `tk_${t.id}`,
          title: `Ticket from ${t.name || t.sender || "Guest"}`,
          subtitle: t.subject || t.message || "Concierge inquiry",
          time: "New",
          unread: t.status === "new",
        });
      });
    }
    if (items.length === 0) {
      items.push(
        {
          id: "notif_1",
          title: "Live Rates Connected",
          subtitle: `${hotelsCatalog.length} curated properties & ${transfersCatalog.length} VIP vehicles ready`,
          time: "Just now",
          unread: true,
        },
        {
          id: "notif_2",
          title: "Pay Later 0% Split Active",
          subtitle: "3-installment flexible booking enabled on eligible suites",
          time: "Today",
          unread: false,
        }
      );
    }
    return items;
  }, [bookingsData, ticketsData, hotelsCatalog.length, transfersCatalog.length]);

  const unreadNotifCount = notificationsList.filter((n) => n.unread).length;

  // ─── Main Shell (Left Sidebar + Top Notifications Header + Vanir Navy & Gold) ─
  return (
    <div className="min-h-screen bg-transparent text-white flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar (Vanir Navy & Gold Brand Identity — completely borderless) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[250px] shrink-0 bg-transparent text-slate-300 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0 bg-[#080E1A]/95" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img src={ASSETS.LOGO_WATERMARK} alt="Logo" className="h-8 w-auto object-contain" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E5C378]">Travel Desk</span>
          </a>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-xs">
          {/* OVERVIEW */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-[#E5C378]/70">
              Overview
            </div>
            <div className="space-y-0.5">
              {[
                { label: "App", icon: AppWindow, accent: "", onClick: () => { setAdminSection("create"); setClientStep("search"); setSidebarOpen(false); } },
                { label: "Analytics", icon: BarChart3, accent: "", onClick: () => { setAdminSection("orders"); setOrderStatusFilter("all"); setSidebarOpen(false); } },
                { label: "Banking", icon: Landmark, accent: "", onClick: () => { setAdminSection("create"); setClientStep("checkout"); setSidebarOpen(false); } },
                { label: "Hotel Booking", icon: Building2, accent: "bg-[#C8A04F]/20 text-[#E5C378] border border-[#C8A04F]/40", onClick: () => { setAdminSection("create"); setClientStep("search"); setServiceTab("hotels"); setSidebarOpen(false); } },
                { label: "Flight Booking", icon: Plane, accent: "bg-sky-500/20 text-sky-300 border border-sky-400/35", onClick: () => { setAdminSection("create"); setClientStep("search"); setServiceTab("flights"); setSidebarOpen(false); } },
                { label: "File", icon: FolderOpen, accent: "", onClick: () => { setAdminSection("create"); setClientStep("details"); setSidebarOpen(false); } },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-[#E5C378] transition"
                  >
                    {item.accent ? (
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${item.accent}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <Icon className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MANAGEMENT */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-[#E5C378]/70">
              Management
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setSidebarOpen(false);
                  if (user) window.location.href = "/profile";
                  else { setAdminSection("create"); setClientStep("checkout"); }
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-[#E5C378] transition"
              >
                <span className="flex items-center gap-3">
                  <UserCircle className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">User</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Expandable Inventory */}
              <div>
                <button
                  type="button"
                  onClick={() => setInventoryMenuOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-[#0B111E]/90/5 hover:text-[#E5C378] transition"
                >
                  <span className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">Inventory</span>
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${inventoryMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {inventoryMenuOpen && (
                  <div className="pl-9 pr-2 py-1 space-y-1">
                    <button
                      type="button"
                      onClick={() => { setAdminSection("create"); setClientStep("search"); setServiceTab("hotels"); setSidebarOpen(false); }}
                      className="w-full text-left py-1.5 text-[11px] text-slate-400 hover:text-[#E5C378]"
                    >
                      • Hotels ({hotelsCatalog.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAdminSection("activities"); setSidebarOpen(false); }}
                      className="w-full text-left py-1.5 text-[11px] text-slate-400 hover:text-[#E5C378]"
                    >
                      • Activities ({activitiesCatalog.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAdminSection("suppliers"); setSidebarOpen(false); }}
                      className="w-full text-left py-1.5 text-[11px] text-slate-400 hover:text-[#E5C378]"
                    >
                      • Suppliers
                    </button>
                  </div>
                )}
              </div>

              {/* Expandable Order (Highlighted Active) */}
              <div>
                <button
                  type="button"
                  onClick={() => setOrderMenuOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#E5C378]/15 text-[#E5C378] border border-[#E5C378]/25 font-semibold"
                >
                  <span className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-[#E5C378]" />
                    <span>Order</span>
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${orderMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {orderMenuOpen && (
                  <div className="pl-9 pr-2 py-1.5 space-y-1">
                    <button
                      type="button"
                      onClick={() => { setAdminSection("orders"); setSidebarOpen(false); }}
                      className={`w-full text-left py-1 text-[11px] flex items-center gap-2 ${
                        adminSection === "orders" ? "text-[#E5C378] font-bold" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      List
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAdminSection("create"); setClientStep("search"); setSidebarOpen(false); }}
                      className={`w-full text-left py-1 text-[11px] flex items-center gap-2 ${
                        adminSection === "create" ? "text-[#E5C378] font-bold" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      Create
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => { setAdminSection("create"); setClientStep("checkout"); setSidebarOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-[#E5C378] transition"
              >
                <span className="flex items-center gap-3">
                  <Receipt className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">Invoice</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <a
                href="/blog"
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-[#0B111E]/90/5 hover:text-[#E5C378] transition"
              >
                <span className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">Blog</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <button
                type="button"
                onClick={() => { setServiceTab("holiday"); setClientStep("search"); setAdminSection("create"); setSidebarOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-[#0B111E]/90/5 hover:text-[#E5C378] transition"
              >
                <span className="flex items-center gap-3">
                  <Palmtree className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">Holiday</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {mode === "admin" && (
                <div>
                  <button
                    type="button"
                    onClick={() => setChatMenuOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-[#E5C378] transition"
                  >
                    <span className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">Chat & ticket</span>
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${chatMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                    {chatMenuOpen && (
                      <div className="pl-9 pr-2 py-1 space-y-1">
                        {["Dashboard", "Chats", "Customers", "Tickets", "Teams", "Team Chat", "Settings"].map((sub) => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => {
                              setAdminSection("tickets");
                              setSidebarOpen(false);
                            }}
                            className="w-full text-left py-1 text-[11px] text-slate-400 hover:text-[#E5C378]"
                          >
                            • {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setAdminSection("create");
                  setClientStep("search");
                  setSidebarOpen(false);
                  toast.info("Choose your Check-In & Check-Out dates in the search bar.");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-[#E5C378] transition"
              >
                <CalendarDays className="w-4 h-4 text-slate-400" />
                <span className="font-medium">Calendar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdminSection("orders");
                  setOrderStatusFilter("pending");
                  setSidebarOpen(false);
                  toast.info("Showing pending orders requiring action.");
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-[#E5C378] transition"
              >
                <CheckSquare className="w-4 h-4 text-slate-400" />
                <span className="font-medium">To Do</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Utility & Notifications Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#080E1A] border-b border-white/10 px-4 md:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-white/10 text-slate-200 hover:bg-white/10"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={quickSearch}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuickSearch(val);
                  setCityQuery(val);
                  setOrderSearch(val);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && adminSection !== "orders") {
                    setAdminSection("create");
                    setClientStep("search");
                  }
                }}
                placeholder="Search hotels, cities, or orders..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:border-[#C8A04F]"
              />
            </div>
          </div>

          {/* Right Utility Icons + Notifications */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 text-slate-200 hover:text-[#E5C378] text-xs font-semibold transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </a>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#080E1A] border border-white/10 text-[#E5C378] text-[11px] font-bold">
              <img
                src="/images/us-flag.png"
                alt="US English"
                className="w-5 h-3.5 rounded-[3px] object-cover shrink-0 shadow-xs"
              />
              <span className="hidden sm:inline">EN · USD</span>
            </span>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((v) => !v)}
                className="relative p-2 rounded-lg border border-white/10 text-slate-200 hover:bg-white/10 transition"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C8A04F] text-[#080E1A] text-[10px] font-extrabold flex items-center justify-center">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#0B111E]/90 border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-[#080E1A] text-white flex items-center justify-between">
                    <span className="text-xs font-bold text-[#E5C378]">Notifications</span>
                    <span className="text-[10px] text-slate-300">{unreadNotifCount} unread</span>
                  </div>
                  <div className="divide-y divide-white/10 max-h-72 overflow-y-auto">
                    {notificationsList.map((n) => (
                      <div key={n.id} className={`px-4 py-3 text-xs ${n.unread ? "bg-amber-50/40" : ""}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-slate-300 mt-0.5">{n.subtitle}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (mode === "admin") setAdminSection("orders");
                else setClientStep("checkout");
              }}
              className="p-2 rounded-lg border border-white/10 text-slate-200 hover:bg-white/10 transition"
              title="Orders & Guests"
            >
              <Users className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => toast.info("Vanir Travel Engine v2 · Connected to Live Inventory")}
              className="hidden sm:inline-flex p-2 rounded-lg border border-white/10 text-slate-200 hover:bg-white/10 transition"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {user ? (
              <a href="/profile" className="flex items-center gap-2.5 pl-1 hover:opacity-90 transition">
                <img
                  src={resolveUserAvatar(user.avatarUrl, user.email || user.name)}
                  alt={user.name || "User"}
                  className="w-8 h-8 rounded-full object-cover border border-[#E5C378]/60 shadow-sm shrink-0"
                />
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-xs font-bold text-white">{user.name || user.email?.split("@")[0]}</div>
                  <div className="text-[10px] text-[#E5C378]">{user.role === "admin" ? "Administrator" : "Member"}</div>
                </div>
              </a>
            ) : (
              <a
                href="/login"
                className="px-3.5 py-1.5 rounded-lg bg-[#C8A04F] text-[#080E1A] text-xs font-extrabold hover:bg-[#B58D3D] transition"
              >
                Sign In
              </a>
            )}
          </div>
        </header>

        {/* Workspace Container */}
        <div className="p-4 md:p-6 max-w-[1400px] w-full mx-auto space-y-6">
          {/* Top Breadcrumb & Workspace Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white">
                {mode === "admin"
                  ? adminSection === "create"
                    ? "New Booking"
                    : adminSection === "orders"
                      ? "Order List"
                      : adminSection === "activities"
                        ? "List of Activities"
                        : adminSection === "suppliers"
                          ? "Suppliers List"
                          : "Support Tickets"
                  : "New Booking"}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === "admin" ? "Dashboard • Order • " : "Explore & Book • "}
                {clientStep === "search" ? "Create Order" : clientStep === "details" ? selectedHotel.name : clientStep === "checkout" ? "Checkout & Itinerary" : "Confirmed"}
              </p>
            </div>

            {/* Step / Section Switcher */}
            {mode === "admin" ? (
              <div className="flex flex-wrap items-center gap-2 bg-[#0B111E]/90 border border-white/10 p-1.5 rounded-xl">
                {[
                  { id: "create", label: "Create Order", icon: Plus },
                  { id: "orders", label: "Order List", icon: Package },
                  { id: "activities", label: "Activities", icon: Compass },
                  { id: "suppliers", label: "Suppliers", icon: Briefcase },
                  { id: "tickets", label: "Tickets", icon: LifeBuoy },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setAdminSection(s.id as AdminSection)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        adminSection === s.id
                          ? "bg-[#080E1A] text-[#E5C378]"
                          : "text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {s.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                {(
                  [
                    { label: "1. Search", step: "search" },
                    { label: "2. Room Details", step: "details" },
                    { label: "3. Checkout", step: "checkout" },
                  ] as const
                ).map((item, i) => {
                  const active =
                    adminSection === "create" &&
                    ((i === 0 && clientStep === "search") ||
                      (i === 1 && clientStep === "details") ||
                      (i === 2 && (clientStep === "checkout" || clientStep === "confirmed")));
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setAdminSection("create");
                        setClientStep(item.step);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`px-3 py-1.5 rounded-full border transition cursor-pointer ${
                        active
                          ? "bg-[#C8A04F] text-[#080E1A] border-[#C8A04F] font-extrabold"
                          : "bg-[#0B111E]/90 text-slate-300 border-white/10 hover:border-[#E5C378]/40 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active View */}
          {adminSection === "orders"
            ? renderAdminOrders()
            : adminSection === "activities"
              ? renderAdminActivities()
              : adminSection === "suppliers"
                ? renderAdminSuppliers()
                : adminSection === "tickets"
                  ? renderAdminTickets()
                  : clientStep === "search"
                    ? renderSearchAndFilters()
                    : clientStep === "details"
                      ? renderHotelDetails()
                      : clientStep === "checkout"
                        ? renderCheckout()
                        : renderConfirmed()}
        </div>
      </div>
    </div>
  );
}
