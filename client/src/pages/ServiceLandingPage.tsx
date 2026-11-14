import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { Plane, ShieldCheck, Clock, Sparkles, ArrowRight, CheckCircle2, Phone, Globe } from "lucide-react";
import { getFirestoreSetting } from "@/lib/siteSettingsApi";

export interface ServiceLandingPageData {
  id: string;
  lang: "ar" | "en" | "de";
  slug: string;
  serviceType: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  h1: string;
  subtitle: string;
  heroImage: string;
  bodyParagraphs: string[];
  highlights: string[];
  faq: Array<{ q: string; a: string }>;
  ctaText: string;
  ctaHref: string;
}

export const DEFAULT_SERVICE_LANDING_PAGES: ServiceLandingPageData[] = [
  {
    id: "de-private-jet",
    lang: "de",
    slug: "private-jet-charter",
    serviceType: "Private Jet Charter",
    metaTitle: "Privatjet-Charter & VIP-Flüge weltweit | VANIR GROUP",
    metaDescription:
      "Exklusiver Privatjet-Charter ab Deutschland, der Schweiz & Österreich nach Dubai, Kairo und weltweit. 24/7 VIP-Concierge & maßgeschneiderte Flugrouten.",
    keywords: "Privatjet Charter, Privatflugzeug mieten, VIP Flug Dubai Kairo, VANIR GROUP",
    h1: "Exklusiver Privatjet-Charter ohne Kompromisse",
    subtitle:
      "Direktflüge nach Ihren Wünschen mit Zugang zu privaten VIP-Terminals, höchster Diskretion und 24/7 Concierge-Betreuung.",
    heroImage:
      "https://res.cloudinary.com/dn7p8m5w6/image/upload/f_auto,q_auto/v1/vanir/private-jet-luxury",
    bodyParagraphs: [
      "Mit VANIR GROUP genießen anspruchsvolle Geschäftsreisende, Familien und VIP-Gäste weltweit nahtlose Privatflüge. Von der Auswahl des passenden Langstrecken- oder Midsize-Jets bis zum Chauffeur-Transfer direkt auf das Rollfeld wird jedes Detail präzise koordiniert.",
      "Unsere deutschsprachigen Aviation-Experten stehen Ihnen rund um die Uhr zur Verfügung – inklusive kurzfristiger Slot-Genehmigungen, Catering auf Sterne-Niveau und nahtloser Anbindung an Luxusresorts in Ägypten, den VAE und Europa.",
    ],
    highlights: [
      "Abflug innerhalb von 4 Stunden ab München, Frankfurt, Zürich & Wien",
      "Zugang zu über 5.000 zertifizierten Privatjets weltweit",
      "Diskreter VIP-Terminal-Check-in ohne Wartezeiten",
      "Maßgeschneidertes Bord-Catering & Limousinen-Service am Zielort",
    ],
    faq: [
      {
        q: "Wie schnell kann ein Privatjet über VANIR GROUP gebucht werden?",
        a: "Innerhalb Europas und in den Nahen Osten sind Abflüge oft bereits 4 Stunden nach Buchungsbestätigung möglich.",
      },
      {
        q: "Sind Direktflüge von Deutschland nach Kairo, Hurghada oder Dubai verfügbar?",
        a: "Ja, wir bieten Nonstop-Verbindungen mit modernen Heavy- und Super-Midsize-Jets direkt zu allen internationalen und privaten Terminals.",
      },
    ],
    ctaText: "Privatjet unverbindlich anfragen",
    ctaHref: "/contact",
  },
  {
    id: "en-egypt-private-tours",
    lang: "en",
    slug: "egypt-private-tours",
    serviceType: "Egypt Luxury Tours",
    metaTitle: "Private Luxury Tours in Egypt | Bespoke VIP Journeys | VANIR GROUP",
    metaDescription:
      "Discover Egypt in unmatched luxury: private Egyptologists, VIP after-hours access to the Pyramids, five-star Nile dahabiyas, and private aviation transfers.",
    keywords: "private luxury tours Egypt, VIP Egypt travel, bespoke Nile cruise, VANIR GROUP",
    h1: "Bespoke Private Luxury Tours Across Egypt",
    subtitle:
      "From private Giza Plateau access to ultra-luxury Nile dahabiyas and Red Sea sanctuaries, crafted exclusively around your schedule.",
    heroImage:
      "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1600&q=80",
    bodyParagraphs: [
      "VANIR GROUP curates deeply personalized private journeys through Cairo, Luxor, Aswan, and the Red Sea. Every itinerary is led by senior Egyptologists and supported by VIP airport fast-track, luxury Mercedes-Maybach ground transfers, and hand-picked presidential suites.",
      "Whether you wish to explore ancient temples before public opening hours or sail between Luxor and Aswan aboard a private chartered dahabiya, our concierge team handles every detail seamlessly.",
    ],
    highlights: [
      "VIP Fast-Track arrival & private tarmac transfers at Cairo & Luxor",
      "Private after-hours monument access & senior Egyptologist guides",
      "Hand-picked heritage suites & private Nile dahabiya charters",
      "24/7 dedicated English, Arabic & German concierge team",
    ],
    faq: [
      {
        q: "Are all Egypt tours 100% private and customizable?",
        a: "Yes. Every VANIR GROUP itinerary is tailored exclusively for your party with private vehicles, guides, and flexible daily timing.",
      },
      {
        q: "Do you arrange domestic private flights between Cairo, Luxor, and Aswan?",
        a: "Yes, we arrange both private jet charters and first-class domestic connections with full VIP lounge handling.",
      },
    ],
    ctaText: "Design Your Private Egypt Journey",
    ctaHref: "/contact",
  },
  {
    id: "ar-private-jet",
    lang: "ar",
    slug: "private-jet-charter",
    serviceType: "Private Jet Charter",
    metaTitle: "تأجير الطائرات الخاصة VIP | رحلات خاصة فاخرة | VANIR GROUP",
    metaDescription:
      "خدمة تأجير الطائرات الخاصة لكبار الشخصيات والعائلات الملكية ورجال الأعمال. صالات VIP، خصوصية مطلقة، وتغطية عالمية على مدار 24 ساعة.",
    keywords: "تأجير طائرات خاصة, طيران خاص VIP, حجز طائرة خاصة دبي القاهرة, VANIR GROUP",
    h1: "تأجير الطائرات الخاصة بمعايير كبار الشخصيات",
    subtitle:
      "انطلق وفق جدولك الخاص مع وصول مباشر لصالات الطيران الخاص، ضيافة فاخرة على متن الطائرة، وخدمة كونسيرج على مدار الساعة.",
    heroImage:
      "https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=1600&q=80",
    bodyParagraphs: [
      "توفر VANIR GROUP حلول طيران خاص متكاملة لرجال الأعمال والعائلات الملكية وكبار الشخصيات بين القاهرة ودبي والرياض ولندن وجنيف وكافة الوجهات العالمية، مع أسطول حديث من الطائرات بعيدة المدى.",
      "يتولى فريقنا تنسيق كافة تصاريح الهبوط، استقبال الـ VIP من باب الطائرة، والنقل بسيارات الليموزين الفاخرة لضمان تجربة سفر سلسة وآمنة دون أي انتظار.",
    ],
    highlights: [
      "جاهزية للإقلاع خلال 4 ساعات من تأكيد الحجز",
      "صالات كبار الشخصيات وإنهاء إجراءات السفر بخصوصية تامة",
      "قوائم طعام فاخرة مخصصة على متن الطائرة",
      "فريق كونسيرج متاح 24/7 باللغات العربية والإنجليزية والألمانية",
    ],
    faq: [
      {
        q: "هل تتوفر طائرات خاصة للرحلات الدولية الطويلة؟",
        a: "نعم، نوفر طائرات Heavy وUltra-Long Range مناسبة للرحلات المباشرة من الشرق الأوسط إلى أوروبا وأمريكا وآسيا.",
      },
      {
        q: "هل تشمل الخدمة النقل الأرضي وحجوزات الفنادق؟",
        a: "بالتأكيد، ننسق سيارات الليموزين من وإلى صالات الطيران الخاص مع حجوزات الأجنحة الرئاسية.",
      },
    ],
    ctaText: "اطلب عرض سعر للطائرة الخاصة",
    ctaHref: "/contact",
  },
];

function optimizeCloudinaryUrl(url: string): string {
  if (!url) return "https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=1600&q=80";
  if (url.includes("res.cloudinary.com") && url.includes("/upload/") && !url.includes("f_auto")) {
    return url.replace("/upload/", "/upload/f_auto,q_auto/");
  }
  return url;
}

export default function ServiceLandingPage() {
  const [matchDe, paramsDe] = useRoute("/de/:slug");
  const [matchEn, paramsEn] = useRoute("/en/:slug");
  const [matchAr, paramsAr] = useRoute("/ar/:slug");

  const lang = (matchDe ? "de" : matchEn ? "en" : "ar") as "ar" | "en" | "de";
  const slug = (paramsDe?.slug || paramsEn?.slug || paramsAr?.slug || "").toLowerCase();

  const [pages, setPages] = useState<ServiceLandingPageData[]>(DEFAULT_SERVICE_LANDING_PAGES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    getFirestoreSetting("seo", "landing_pages_data")
      .then((raw) => {
        if (!active || !raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPages(parsed);
          }
        } catch {
          // keep defaults
        }
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const page =
    pages.find((p) => p.lang === lang && p.slug.toLowerCase() === slug) ||
    DEFAULT_SERVICE_LANDING_PAGES.find((p) => p.lang === lang && p.slug.toLowerCase() === slug) ||
    pages.find((p) => p.lang === lang) ||
    DEFAULT_SERVICE_LANDING_PAGES[0];

  useEffect(() => {
    if (!page) return;
    document.documentElement.lang = page.lang;
    document.documentElement.dir = page.lang === "ar" ? "rtl" : "ltr";
    document.title = page.metaTitle;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", page.metaDescription);
  }, [page]);

  const labels = {
    ar: { badge: "صفحة خدمة مخصصة", highlights: "لماذا تختار VANIR GROUP؟", faq: "الأسئلة الشائعة", back: "العودة للرئيسية" },
    en: { badge: "Dedicated Service Experience", highlights: "Why Choose VANIR GROUP", faq: "Frequently Asked Questions", back: "Back to Home" },
    de: { badge: "Exklusiver Service", highlights: "Warum VANIR GROUP?", faq: "Häufig gestellte Fragen", back: "Zurück zur Startseite" },
  }[page.lang];

  return (
    <div
      dir={page.lang === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-[#07070b] text-white"
    >
      {/* Top Bar */}
      <header className="border-b border-white/10 bg-black/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-widest text-[#c9a84c]">
            VANIR GROUP
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 uppercase">
              <Globe className="w-3.5 h-3.5 text-[#c9a84c]" />
              {page.lang}
            </span>
            <Link
              href={page.ctaHref || "/contact"}
              className="px-4 py-2 rounded-lg bg-[#c9a84c] text-black font-semibold hover:opacity-90 transition"
            >
              {page.ctaText}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a84c]/15 border border-[#c9a84c]/30 text-[#ecd58e] text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              {labels.badge} · {page.serviceType}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight text-white">
              {page.h1}
            </h1>
            <p className="text-base md:text-lg text-white/75 leading-relaxed">
              {page.subtitle}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={page.ctaHref || "/contact"}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#c9a84c] text-black font-bold hover:opacity-90 transition"
              >
                <Phone className="w-4 h-4" />
                {page.ctaText}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-white/15 text-white/80 hover:bg-white/5 transition text-sm"
              >
                {labels.back}
              </Link>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-[#c9a84c]/30 shadow-2xl aspect-[16/10] bg-black/50">
            <img
              src={optimizeCloudinaryUrl(page.heroImage)}
              alt={page.h1}
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Details & Highlights */}
      <section className="max-w-6xl mx-auto px-4 py-14 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          {page.bodyParagraphs.map((para, idx) => (
            <p key={idx} className="text-white/80 leading-relaxed text-base md:text-lg">
              {para}
            </p>
          ))}
        </div>

        <div className="rounded-2xl border border-[#c9a84c]/25 bg-[#101018] p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#ecd58e] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#c9a84c]" />
            {labels.highlights}
          </h2>
          <ul className="space-y-3">
            {page.highlights.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-white/80">
                <CheckCircle2 className="w-4 h-4 text-[#c9a84c] shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      {page.faq && page.faq.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-20 space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#c9a84c]" />
            {labels.faq}
          </h2>
          <div className="space-y-3">
            {page.faq.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
                <h3 className="font-semibold text-[#ecd58e]">{item.q}</h3>
                <p className="text-sm text-white/75 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
          {!loaded && <span className="sr-only">Loading</span>}
        </section>
      )}
    </div>
  );
}
