import { useMemo } from "react";
import { Quote, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";

const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Adventure Traveler",
    content: "The attention to detail and level of luxury provided by Vanir Group exceeded all our expectations. Our trip to Egypt was truly a once-in-a-lifetime experience.",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Luxury Enthusiast",
    content: "From the private Nile cruise to the exclusive access at historical sites, every moment was perfectly curated. Outstanding service and unforgettable memories.",
  },
  {
    id: 3,
    name: "Emma Williams",
    role: "Cultural Explorer",
    content: "The guides were incredibly knowledgeable and the accommodations were world-class. They made our dream vacation to the pyramids a reality.",
  }
];

export default function TestimonialsSection() {
  const { data: dbReviews } = trpc.reviews.listApproved.useQuery();

  const testimonials = useMemo(() => {
    if (Array.isArray(dbReviews) && dbReviews.length > 0) {
      return dbReviews.slice(0, 3).map((r: any, idx: number) => ({
        id: r?.id || idx,
        name: r?.guestName || "VIP Guest",
        role: r?.tripName || "Luxury Traveler",
        content: r?.content || r?.title || "Exceptional journey curated by Vanir Group.",
      }));
    }
    return DEFAULT_TESTIMONIALS;
  }, [dbReviews]);
  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--theme-primary)]/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <span className="text-[var(--theme-primary)] uppercase tracking-[0.3em] text-sm font-semibold mb-4 block">
            — Testimonials —
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Words From Our Guests
          </h2>
          <div className="w-24 h-1 bg-[var(--theme-primary)] mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((testimonial, i) => (
            <div 
              key={testimonial.id} 
              className="flex flex-col items-center text-center group"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <Quote className="text-[var(--theme-primary)] w-12 h-12 mb-8 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              
              <p className="text-white/80 text-lg md:text-xl italic font-light leading-relaxed mb-8 flex-grow">
                "{testimonial.content}"
              </p>
              
              <div className="mt-auto">
                <h4 className="text-white font-bold text-lg mb-1 tracking-wide uppercase">
                  {testimonial.name}
                </h4>
                <p className="text-[var(--theme-primary)] text-sm font-medium tracking-wider">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
