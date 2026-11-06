import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Clock, MapPin, Star, Sparkles } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface ActivityItem {
  id: number;
  name: string;
  nameAr?: string;
  description: string;
  price: number;
  duration: string;
  location: string;
  category: string;
  rating: number;
  image: string;
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    id: 1,
    name: "Giza Pyramids Camel Safari",
    nameAr: "سفاري الجمال عند أهرامات الجيزة",
    description: "Experience the timeless wonder of the Giza Plateau on a guided camel trek through golden desert sands with iconic pharaonic photo stops.",
    price: 85,
    duration: "3 hours",
    location: "Giza, Cairo",
    category: "Adventure",
    rating: 5,
    image: "/images/vanir_adventure_4.png",
  },
  {
    id: 2,
    name: "Royal Nile Dahabiya Cruise",
    nameAr: "إبحار دهبية النيل الملكية الفاخرة",
    description: "Sail the tranquil waters of the Nile on a private luxury Dahabiya sailboat between Luxor and Aswan with private chef service.",
    price: 450,
    duration: "Full Day",
    location: "Luxor & Aswan",
    category: "Luxury Cruise",
    rating: 5,
    image: "/images/The_Nile_River_at_Cairo.jpg",
  },
  {
    id: 3,
    name: "Red Sea Coral Reef Diving & Snorkeling",
    nameAr: "غوص واستكشاف شعاب البحر الأحمر",
    description: "Immerse yourself in world-class coral gardens and vibrant marine life in the crystal-clear waters of Sharm El-Sheikh and Hurghada.",
    price: 120,
    duration: "5 hours",
    location: "Sharm El-Sheikh / Hurghada",
    category: "Water Sports",
    rating: 5,
    image: "/images/vanir_world_4.png",
  },
  {
    id: 4,
    name: "Sunrise Hot Air Balloon over Luxor",
    nameAr: "منطاد الهواء الساخن عند الشروق في الأقصر",
    description: "Drift serenely over the Valley of the Kings and Hatshepsut Temple as the golden Egyptian sunrise illuminates ancient pharaonic monuments.",
    price: 160,
    duration: "2.5 hours",
    location: "West Bank, Luxor",
    category: "Aviation & Sightseeing",
    rating: 5,
    image: "/images/kiosk-roman-island-trajan-agilkia-nile-river.jpg",
  },
  {
    id: 5,
    name: "Bedouin Desert Stargazing & Dinner",
    nameAr: "سهرة عشاء بدوي ورصد النجوم بالصحراء",
    description: "An enchanting evening under the Sinai night sky featuring astronomical telescope viewing and authentic Bedouin barbecue dining.",
    price: 95,
    duration: "4 hours",
    location: "Sinai Desert",
    category: "Cultural & Stargazing",
    rating: 5,
    image: "/images/final_st_catherine_post.png",
  },
  {
    id: 6,
    name: "White Desert & Bahariya Oasis Expedition",
    nameAr: "استكشاف الصحراء البيضاء وواحة البحرية",
    description: "A surreal 4x4 expedition through chalk rock sculptures, crystal mountain formations, and luxury glamping under unpolluted starry skies.",
    price: 320,
    duration: "2 Days",
    location: "Western Desert",
    category: "Expedition",
    rating: 5,
    image: "/images/vanir_adventure_5.png",
  },
];

export default function ActivitiesSection() {
  const { ref, inView } = useInView({ threshold: 0.2 });
  const [currentPage, setCurrentPage] = useState(0);

  const { data: savedActivities } = trpc.siteSettings.get.useQuery(
    { category: "activities", key: "activities_data" },
    { staleTime: 5000, refetchOnMount: "always" }
  );

  const activities: ActivityItem[] = useMemo(() => {
    if (savedActivities) {
      try {
        const parsed = JSON.parse(savedActivities);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {}
    }
    return DEFAULT_ACTIVITIES;
  }, [savedActivities]);

  const itemsPerPage = 3;
  const totalPages = Math.ceil(activities.length / itemsPerPage);
  const displayedActivities = activities.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage
  );

  const handleBook = (activity: ActivityItem) => {
    const el = document.getElementById("booking");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      toast.success(`Selected activity: ${activity.name || activity.nameAr}. Complete your booking below!`);
    } else {
      window.location.href = `https://wa.me/201000000000?text=${encodeURIComponent(`Hello, I would like to book the activity: ${activity.name || activity.nameAr}`)}`;
    }
  };

  return (
    <section id="activities" className="py-12 sm:py-16 md:py-24 bg-[var(--theme-surface)] relative" ref={ref}>
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 md:mb-16 gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Sparkles size={16} className="text-[var(--theme-primary)]" />
              <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-lg sm:text-xl block">
                Exclusive Experiences
              </span>
            </div>
            <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
              Curated Tourist
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primary-light)]">
                Activities & Safaris
              </span>
            </h2>
            <p className="text-white/50 max-w-lg text-sm sm:text-base leading-relaxed">
              Immerse yourself in authentic adventures across Egypt's ancient deserts, majestic Nile waterways, and vibrant marine reefs.
            </p>
          </div>

          {/* Navigation arrows */}
          {totalPages > 1 && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40 font-mono">
                {currentPage + 1} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="w-10 h-10 border border-[var(--theme-primary)]/40 flex items-center justify-center text-[var(--theme-primary)] hover:bg-[var(--theme-primary)] hover:text-black transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[var(--theme-primary)]"
                  aria-label="Previous activities"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="w-10 h-10 border border-[var(--theme-primary)]/40 flex items-center justify-center text-[var(--theme-primary)] hover:bg-[var(--theme-primary)] hover:text-black transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[var(--theme-primary)]"
                  aria-label="Next activities"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Activity cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayedActivities.map((activity, index) => (
            <motion.div
              key={activity.id || index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.12 }}
              className="group bg-[#111114] border border-white/10 hover:border-[var(--theme-primary)]/60 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between shadow-xl relative"
            >
              {/* Image & Badges */}
              <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-black/40">
                <img
                  src={activity.image || "/images/vanir_adventure_4.png"}
                  alt={activity.name || activity.nameAr || "Activity"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-black/30" />

                {/* Category Badge */}
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-[var(--theme-primary)]/40 px-3 py-1 rounded-full">
                  <span className="text-[11px] font-semibold text-[var(--theme-primary)] tracking-wide uppercase">
                    {activity.category || "Experience"}
                  </span>
                </div>

                {/* Price Badge */}
                {activity.price > 0 && (
                  <div className="absolute bottom-3 right-3 bg-[var(--theme-primary)] text-black px-3 py-1 rounded-lg font-bold text-sm shadow-md">
                    ${activity.price}
                    <span className="text-[10px] font-normal opacity-80 ml-1">/ person</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={i < (activity.rating || 5) ? "fill-amber-400" : "opacity-30"}
                        />
                      ))}
                    </div>
                    {activity.duration && (
                      <span className="text-white/50 text-xs flex items-center gap-1">
                        <Clock size={12} className="text-[var(--theme-primary)]" />
                        {activity.duration}
                      </span>
                    )}
                  </div>

                  <h3 className="font-[var(--font-display)] text-lg sm:text-xl font-bold text-white mb-1 group-hover:text-[var(--theme-primary)] transition-colors line-clamp-1">
                    {activity.name || activity.nameAr}
                  </h3>
                  {activity.nameAr && activity.name && (
                    <p className="text-xs text-[var(--theme-primary)]/80 mb-3 truncate font-arabic">
                      {activity.nameAr}
                    </p>
                  )}

                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3">
                    {activity.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  {activity.location ? (
                    <span className="text-white/50 text-xs flex items-center gap-1 truncate max-w-[55%]">
                      <MapPin size={13} className="text-[var(--theme-primary)] shrink-0" />
                      <span className="truncate">{activity.location}</span>
                    </span>
                  ) : <span />}

                  <button
                    onClick={() => handleBook(activity)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--theme-primary)] hover:text-white transition-colors group/btn"
                  >
                    <span>Book Now</span>
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
