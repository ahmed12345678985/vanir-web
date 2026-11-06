import { Link, useLocation } from "wouter";
import { getSEOMetadata, normalizeRoute } from "@shared/seo/seoMatrix";
import { Shield, Award, Plane, Compass, ArrowRight, CheckCircle2, HelpCircle } from "lucide-react";

interface EditorialAuthoritySectionProps {
  routeOverride?: string;
}

export default function EditorialAuthoritySection({ routeOverride }: EditorialAuthoritySectionProps) {
  const [location] = useLocation();
  const route = normalizeRoute(routeOverride || location);
  const seo = getSEOMetadata(route);

  if (!seo) return null;

  const sections = seo.sections || [];
  const images = seo.images || [];
  const itinerary = seo.itineraryHighlights || [];
  const faqs = seo.faqs || [];

  return (
    <section
      aria-label="In-Depth Concierge Guide & Editorial Overview"
      className="py-16 md:py-24 bg-[#080a0f] border-t border-[#D4AF37]/20 text-white"
    >
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        {/* Editorial Header */}
        <div className="max-w-4xl mx-auto text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs uppercase tracking-[0.2em] mb-4">
            <Award size={14} /> Vanir Group Sovereign Concierge Dossier
          </span>
          <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
            {seo.h1 || seo.metaTitle}
          </h2>
          {seo.lead && (
            <p className="text-white/75 text-base sm:text-lg leading-relaxed mb-4">
              {seo.lead}
            </p>
          )}
          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
            {seo.seoContent}
          </p>
        </div>

        {/* Curated Visual Portfolio with Descriptive Alt Text */}
        {images.length > 0 && (
          <div className="mb-16">
            <h2 className="font-[var(--font-display)] text-xl sm:text-2xl font-bold text-white mb-6 text-center">
              Curated Visual Portfolio &amp; Signature Experiences
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {images.slice(0, 4).map((img, idx) => (
                <figure
                  key={idx}
                  className="bg-[#0f131c] border border-white/10 overflow-hidden group hover:border-[#D4AF37]/50 transition-all duration-300"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={img.src.replace("https://vanirgroup.com", "")}
                      alt={img.alt}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {img.caption && (
                    <figcaption className="p-3.5 text-xs text-white/65 leading-relaxed">
                      {img.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        )}

        {/* Structured H2 & H3 Editorial Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {sections.map((sec, idx) => (
            <article
              key={idx}
              className="bg-[#0d1117] border border-white/10 p-6 sm:p-8 hover:border-[#D4AF37]/30 transition-all duration-300"
            >
              <h2 className="font-[var(--font-display)] text-xl sm:text-2xl font-bold text-[#D4AF37] mb-4 leading-snug">
                {sec.h2}
              </h2>
              <div className="space-y-3 text-white/70 text-sm sm:text-base leading-relaxed mb-5">
                {sec.body.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>

              {sec.h3s && sec.h3s.length > 0 && (
                <div className="space-y-4 mt-5 pt-5 border-t border-white/10">
                  {sec.h3s.map((sub, sIdx) => (
                    <div key={sIdx}>
                      <h3 className="font-[var(--font-display)] text-base sm:text-lg font-semibold text-white mb-1.5 flex items-center gap-2">
                        <Compass size={15} className="text-[#D4AF37] shrink-0" />
                        {sub.title}
                      </h3>
                      <p className="text-white/60 text-sm leading-relaxed pl-6">
                        {sub.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {sec.bullets && sec.bullets.length > 0 && (
                <ul className="space-y-2.5 mt-5 pt-5 border-t border-white/10">
                  {sec.bullets.map((b, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2.5 text-sm text-white/70">
                      <CheckCircle2 size={15} className="text-[#D4AF37] shrink-0 mt-1" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>

        {/* Pricing, Sample Itinerary & Direct CTA */}
        <div className="bg-gradient-to-br from-[#121722] to-[#0a0d14] border border-[#D4AF37]/30 p-6 sm:p-10 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <h2 className="font-[var(--font-display)] text-xl sm:text-2xl font-bold text-white mb-3 flex items-center gap-2">
                <Plane size={20} className="text-[#D4AF37]" />
                Transparent Investment &amp; Sample Itinerary Architecture
              </h2>
              {seo.pricingSummary && (
                <div className="mb-5 p-4 bg-black/40 border-l-2 border-[#D4AF37]">
                  <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold mb-1">
                    Indicative Pricing &amp; Charter Tiers (EUR / USD)
                  </h3>
                  <p className="text-white/85 text-sm sm:text-base font-medium">
                    {seo.pricingSummary}
                  </p>
                </div>
              )}
              {itinerary.length > 0 && (
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-white/80 font-semibold mb-3">
                    Signature Execution Highlights
                  </h3>
                  <ul className="space-y-2">
                    {itinerary.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-white/70">
                        <span className="text-[#D4AF37] font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-black/60 border border-white/10 p-6 text-center">
              <Shield size={32} className="text-[#D4AF37] mx-auto mb-3" />
              <h3 className="font-[var(--font-display)] text-lg font-bold text-white mb-2">
                24/7 Bespoke Concierge &amp; Aviation Desk
              </h3>
              <p className="text-white/60 text-xs leading-relaxed mb-5">
                Headquartered in Cairo &amp; serving Germany (DE), Europe, and global UHNW clients under Founder &amp; CEO Ahmed Roshdi. IATA Accredited &amp; ISO 9001 Certified.
              </p>
              <Link
                href={seo.ctaHref || "/contact"}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors mb-3"
              >
                {seo.ctaText || "Request Bespoke Proposal"}
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/booking"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-[#D4AF37]/40 text-[#D4AF37] font-semibold text-xs uppercase tracking-widest hover:bg-[#D4AF37]/10 transition-colors"
              >
                Direct Online Reservation
              </Link>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        {faqs.length > 0 && (
          <div className="max-w-4xl mx-auto mb-14">
            <h2 className="font-[var(--font-display)] text-xl sm:text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
              <HelpCircle size={20} className="text-[#D4AF37]" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, fIdx) => (
                <div
                  key={fIdx}
                  className="bg-[#0d1117] border border-white/10 p-5 sm:p-6"
                >
                  <h3 className="font-[var(--font-display)] text-base sm:text-lg font-semibold text-[#D4AF37] mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* E-E-A-T Verified Author, Reviewer & Regulatory Attribution Box */}
        <div className="max-w-5xl mx-auto bg-[#0c1018] border border-[#D4AF37]/30 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-5 mb-5 border-b border-white/10">
            <div className="flex items-center gap-4">
              <img
                src="/ahmed-roshdi.png"
                alt="Ahmed Roshdi — Founder & CEO of Vanir Group"
                loading="lazy"
                className="w-14 h-14 rounded-full object-cover border border-[#D4AF37] shrink-0"
              />
              <div>
                <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-bold block">
                  Verified E-E-A-T Editorial &amp; Operational Dossier
                </span>
                <h3 className="font-[var(--font-display)] text-base sm:text-lg font-bold text-white">
                  Authored by{" "}
                  <Link href="/author/ahmed-roshdi" className="text-[#D4AF37] hover:underline">
                    Ahmed Roshdi
                  </Link>{" "}
                  (Founder &amp; CEO, 18+ Yrs Luxury &amp; Aviation Experience)
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Peer-Reviewed by{" "}
                  <Link href="/team" className="text-white/85 underline hover:text-[#D4AF37]">
                    Capt. Lukas Weber
                  </Link>{" "}
                  (DACH EASA Aviation Desk) &amp;{" "}
                  <Link href="/team" className="text-white/85 underline hover:text-[#D4AF37]">
                    Dr. Tariq El-Allam, Ph.D.
                  </Link>{" "}
                  (Chief Egyptologist) • Updated <time dateTime="2026-11-02">November 2026</time>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 shrink-0">
              <Link
                href="/author/ahmed-roshdi"
                className="px-3.5 py-2 bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs uppercase tracking-wider font-semibold hover:bg-[#D4AF37] hover:text-black transition-colors"
              >
                Author Credentials
              </Link>
              <Link
                href="/case-studies"
                className="px-3.5 py-2 border border-white/15 text-white/80 text-xs uppercase tracking-wider font-semibold hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
              >
                Verified Mission Logs
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-white/55">
            <span>
              <strong>Accreditations:</strong> Egyptian Ministry of Tourism Cat. (A) #2184 • IATA Accredited • ISO 9001:2015 • €10M Escrow Protection
            </span>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.iata.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#D4AF37] underline"
              >
                IATA Standards
              </a>
              <a
                href="https://www.easa.europa.eu/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#D4AF37] underline"
              >
                EASA Part-NCC
              </a>
              <a
                href="https://www.ebaa.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#D4AF37] underline"
              >
                EBAA Aviation
              </a>
              <a
                href="https://mota.gov.eg/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#D4AF37] underline"
              >
                Ministry of Tourism (EG)
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
