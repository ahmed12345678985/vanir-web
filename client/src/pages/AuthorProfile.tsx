import { Link, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import PageMeta from "@/components/PageMeta";
import SEO from "@/components/SEO";
import {
  Award,
  ShieldCheck,
  Plane,
  BookOpen,
  Globe,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

const PUBLISHED_DOSSIERS = [
  {
    title: "What Does a Luxury Travel Concierge Do? Complete UHNW Guide",
    href: "/blog/what-does-a-luxury-travel-concierge-do",
    category: "Concierge Architecture",
  },
  {
    title: "Private Jet Charter Guide (Privatjet mieten): Aircraft, FBOs & 2026 Hourly Costs",
    href: "/blog/private-jet-charter-guide-how-to-book-costs",
    category: "Private Aviation",
  },
  {
    title: "Luxury Travel Concierge vs. Traditional Agency vs. Quintessentially & Virtuoso",
    href: "/blog/luxury-travel-agency-vs-concierge-service",
    category: "Industry Analysis",
  },
  {
    title: "Egypt Luxury Travel Guide: Private Pyramid Permits & Sanctuary Nile Dahabiyas",
    href: "/blog/egypt-luxury-travel-guide-private-tours-nile-cruises",
    category: "Egypt Heritage",
  },
  {
    title: "Best Private Islands & Maldives Ultra-Luxury Retreats for Principals",
    href: "/blog/best-private-islands-maldives-retreats-uhnw",
    category: "Private Islands",
  },
  {
    title: "How to Plan a Bespoke European Vacation or African Private Safari",
    href: "/blog/how-to-plan-bespoke-european-vacation-luxury-concierge",
    category: "Global Expeditions",
  },
];

export default function AuthorProfile() {
  const [location] = useLocation();
  const isTeamRoute = location.startsWith("/team");

  return (
    <div className="min-h-screen bg-[#07090e] text-white">
      <PageMeta
        title={
          isTeamRoute
            ? "Executive Leadership & Sovereign Advisory Board | Vanir Group"
            : "Ahmed Roshdi — Founder & CEO | Luxury Travel & Private Aviation Expert | Vanir Group"
        }
        description="Official executive dossier and verified credentials of Ahmed Roshdi, Founder & CEO of Vanir Group, alongside our Ph.D. Egyptology and EASA Private Aviation Advisory Board."
        keywords="Ahmed Roshdi, Vanir Group CEO, Vanir Travel Group founder, luxury travel concierge expert, private jet charter broker Egypt Germany"
        canonicalPath={isTeamRoute ? "/team" : "/author/ahmed-roshdi"}
      />
      <SEO
        title={
          isTeamRoute
            ? "Executive Leadership & Sovereign Advisory Board"
            : "Ahmed Roshdi — Founder & CEO of Vanir Group"
        }
        description="Verified credentials, aviation certifications, and published luxury travel guides by Ahmed Roshdi and the Vanir Group Sovereign Advisory Board."
      />

      <Navbar />

      {/* Hero Header */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-[#111622] to-[#07090e] border-b border-[#D4AF37]/25">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-4">
              <div className="relative border-2 border-[#D4AF37]/50 bg-[#0d1117] p-3 max-w-sm mx-auto">
                <img
                  src="/ahmed-roshdi.png"
                  alt="Ahmed Roshdi — Founder & Chief Executive Officer of Vanir Group"
                  className="w-full aspect-square object-cover object-top"
                />
                <div className="mt-3 p-3 bg-black/70 border border-white/10 text-center">
                  <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold block">
                    Verified Principal Author &amp; CEO
                  </span>
                  <span className="text-xs text-white/60">
                    Egyptian Ministry of Tourism Cat. (A) #2184 • IATA Accredited
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-5">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs uppercase tracking-[0.2em]">
                <ShieldCheck size={14} /> Verified E-E-A-T Executive &amp; Author Profile
              </span>
              <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                Ahmed Roshdi — Founder &amp; Chief Executive Officer, Vanir Group
              </h1>
              <p className="text-white/80 text-base sm:text-lg leading-relaxed">
                With over 18 years of executive leadership in ultra-luxury hospitality, on-demand private aviation brokerage (<em>Privatjet mieten</em>), and diplomatic ground protocol, Ahmed Roshdi founded <strong>VANIR GROUP (Vanir Travel Group)</strong> in Cairo in 2010 to serve royal families, DACH family offices, Fortune 500 executives, and discerning global travelers.
              </p>
              <p className="text-white/65 text-sm sm:text-base leading-relaxed">
                Under his direction, Vanir Group has orchestrated more than 1,400 private aviation movements between Europe (Frankfurt, Munich, Zurich, London, Paris) and the Middle East, secured solitary after-hours openings at the Great Pyramid of Giza and the Valley of the Kings, and curated bespoke superyacht and private-island buyouts across 45+ countries.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-[#0d1117] border border-white/10 p-3.5">
                  <span className="font-[var(--font-display)] text-2xl font-bold text-[#D4AF37] block">
                    18+ Yrs
                  </span>
                  <span className="text-xs text-white/60">Executive Aviation &amp; Luxury Experience</span>
                </div>
                <div className="bg-[#0d1117] border border-white/10 p-3.5">
                  <span className="font-[var(--font-display)] text-2xl font-bold text-[#D4AF37] block">
                    1,400+
                  </span>
                  <span className="text-xs text-white/60">Private Jet &amp; Diplomatic Missions</span>
                </div>
                <div className="bg-[#0d1117] border border-white/10 p-3.5">
                  <span className="font-[var(--font-display)] text-2xl font-bold text-[#D4AF37] block">
                    4.9 / 5
                  </span>
                  <span className="text-xs text-white/60">Verified Principal Satisfaction (1,240+ Reviews)</span>
                </div>
                <div className="bg-[#0d1117] border border-white/10 p-3.5">
                  <span className="font-[var(--font-display)] text-2xl font-bold text-[#D4AF37] block">
                    DE / EN / AR
                  </span>
                  <span className="text-xs text-white/60">Multilingual 24/7 Flight &amp; Concierge Desk</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-3 text-xs text-white/70">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#D4AF37]" /> HQ: 203 Salah Salem St, Cairo 11511, Egypt
                </span>
                <a href="tel:+201123988882" className="inline-flex items-center gap-1.5 hover:text-[#D4AF37]">
                  <Phone size={14} className="text-[#D4AF37]" /> +20 112 398 8882
                </a>
                <a href="mailto:info@vanirgroup.com" className="inline-flex items-center gap-1.5 hover:text-[#D4AF37]">
                  <Mail size={14} className="text-[#D4AF37]" /> info@vanirgroup.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Areas of Verified Expertise & Credentials */}
      <section className="py-16 border-b border-white/10">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold text-white mb-8">
            Verified Credentials, Regulatory Licenses &amp; Domain Specializations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0d1117] border border-white/10 p-6">
              <Plane className="text-[#D4AF37] mb-3" size={24} />
              <h3 className="font-[var(--font-display)] text-lg font-bold text-white mb-2">
                Private Aviation &amp; EASA Part-NCC Brokerage
              </h3>
              <p className="text-sm text-white/70 leading-relaxed mb-4">
                Direct charter coordination across Light, Super-Midsize, Heavy, and Ultra-Long-Range aircraft (Gulfstream G650ER, Global 7500, Challenger 650, Falcon 2000LXS) connecting Frankfurt, Munich, Zurich, Vienna, and London with Cairo, Luxor, Aswan, and Hurghada.
              </p>
              <ul className="space-y-1.5 text-xs text-white/65">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#D4AF37]" /> IATA Accredited Agency Standards
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#D4AF37]" /> EBAA &amp; Wyvern Safety Audit Compliance
                </li>
              </ul>
            </div>

            <div className="bg-[#0d1117] border border-white/10 p-6">
              <Award className="text-[#D4AF37] mb-3" size={24} />
              <h3 className="font-[var(--font-display)] text-lg font-bold text-white mb-2">
                Sovereign Antiquities &amp; Private Heritage Permits
              </h3>
              <p className="text-sm text-white/70 leading-relaxed mb-4">
                Direct liaison with the Egyptian Ministry of Tourism &amp; Antiquities for private after-hours openings of the Great Pyramid of Khufu, the Sphinx enclosure, the Grand Egyptian Museum (GEM), and the Tomb of Queen Nefertari in Luxor.
              </p>
              <ul className="space-y-1.5 text-xs text-white/65">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#D4AF37]" /> Ministry of Tourism Cat. (A) License #2184
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#D4AF37]" /> Senior Ph.D. Egyptologist Escort Protocol
                </li>
              </ul>
            </div>

            <div className="bg-[#0d1117] border border-white/10 p-6">
              <Globe className="text-[#D4AF37] mb-3" size={24} />
              <h3 className="font-[var(--font-display)] text-lg font-bold text-white mb-2">
                Diplomatic Protocol &amp; UHNW Family Office Advisory
              </h3>
              <p className="text-sm text-white/70 leading-relaxed mb-4">
                End-to-end orchestration of presidential hotel suite buyouts, private Nile Dahabiya vessels, Red Sea and Mediterranean superyachts, and Maldives private islands under strict bilateral NDA and ring-fenced EUR/USD escrow protection.
              </p>
              <ul className="space-y-1.5 text-xs text-white/65">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#D4AF37]" /> ISO 9001:2015 Certified Quality System
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#D4AF37]" /> €10,000,000 Liability &amp; Escrow Guarantee
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The Sovereign Advisory Board */}
      <section className="py-16 border-b border-white/10 bg-[#0a0d14]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold text-white mb-3">
            The Vanir Group Executive &amp; Technical Review Board
          </h2>
          <p className="text-white/65 text-sm sm:text-base mb-8 max-w-3xl">
            Every itinerary, aviation charter brief, and editorial guide published on vanirgroup.com is peer-reviewed by our senior specialists in Egyptology, European business aviation, and diplomatic hospitality.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0d1117] border border-white/10 p-6">
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
                Antiquities &amp; Archaeological Review
              </span>
              <h3 className="font-[var(--font-display)] text-xl font-bold text-white mt-1 mb-2">
                Dr. Tariq El-Allam, Ph.D.
              </h3>
              <p className="text-xs text-white/55 mb-3">
                Chief Egyptologist &amp; Antiquities Liaison • 22+ Years Field Experience
              </p>
              <p className="text-sm text-white/70 leading-relaxed">
                Holds a Doctorate in Egyptology and has led private royal, diplomatic, and museum delegations across Giza, Saqqara, Luxor, Aswan, and Abu Simbel for over two decades.
              </p>
            </div>

            <div className="bg-[#0d1117] border border-white/10 p-6">
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
                Aviation Safety &amp; DACH Desk Review
              </span>
              <h3 className="font-[var(--font-display)] text-xl font-bold text-white mt-1 mb-2">
                Capt. Lukas Weber
              </h3>
              <p className="text-xs text-white/55 mb-3">
                Director of DACH &amp; European Private Aviation • EASA Part-NCC Specialist
              </p>
              <p className="text-sm text-white/70 leading-relaxed">
                Former heavy-jet captain with 16+ years of flight operations experience across Frankfurt (EDDF), Munich (EDDM), Zurich (LSZH), and Cairo (HECA) VIP FBO terminals.
              </p>
            </div>

            <div className="bg-[#0d1117] border border-white/10 p-6">
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
                Diplomatic Protocol &amp; Operations
              </span>
              <h3 className="font-[var(--font-display)] text-xl font-bold text-white mt-1 mb-2">
                Nadia Hassan
              </h3>
              <p className="text-xs text-white/55 mb-3">
                Chief Operating Officer (COO) • 15+ Years Ultra-Luxury Hospitality
              </p>
              <p className="text-sm text-white/70 leading-relaxed">
                Directs presidential suite buyouts at Four Seasons, Mandarin Oriental, and Old Cataract Aswan, alongside private superyacht and armed executive convoy logistics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Authored & Peer-Reviewed Dossiers */}
      <section className="py-16">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
              <BookOpen size={24} className="text-[#D4AF37]" /> Published Dossiers &amp; Research Guides by Ahmed Roshdi
            </h2>
            <Link
              href="/blog"
              className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold hover:underline"
            >
              View All Publications →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PUBLISHED_DOSSIERS.map((doc, idx) => (
              <Link
                key={idx}
                href={doc.href}
                className="bg-[#0d1117] border border-white/10 hover:border-[#D4AF37] p-6 transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-bold block mb-2">
                    {doc.category}
                  </span>
                  <h3 className="font-[var(--font-display)] text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-snug mb-3">
                    {doc.title}
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-white/60 group-hover:text-white mt-2">
                  Read Complete Dossier <ArrowRight size={13} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
