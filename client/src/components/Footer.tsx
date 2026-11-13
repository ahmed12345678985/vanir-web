/*
 * Design: Misty Dark Theme
 * Footer: Multi-column footer with glass morphism and subtle fog effects
 */
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { ASSETS } from "@/config/assets";
import AppStoreBadges from "@/components/AppStoreBadges";
import { trpc } from "@/lib/trpc";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Vanir Group", href: "/about" },
  { label: "Founder & Executive Team", href: "/team" },
  { label: "Case Studies & Mission Logs", href: "/case-studies" },
  { label: "Verified Client Reviews (4.9★)", href: "/reviews" },
  { label: "Exclusive Offers", href: "/offers" },
  { label: "Visual Gallery", href: "/gallery" },
  { label: "Luxury Chronicle & Blog", href: "/blog" },
  { label: "Direct Booking", href: "/booking" },
];

const serviceLinks = [
  { label: "Private Jet Charter (Privatjet)", href: "/private-jet" },
  { label: "Sovereign Journey Architect", href: "/booking" },
  { label: "Luxury Egypt Tours & Nile Cruises", href: "/destinations/egypt" },
  { label: "5-Star Hotels & Island Buyouts", href: "/hotels" },
  { label: "Curated Luxury Packages", href: "/packages" },
  { label: "VIP Airport Fast Track", href: "/fast-track" },
  { label: "MICE & Corporate Retreats", href: "/mice" },
  { label: "3D AI Travel Intelligence", href: "/ai" },
  { label: "3D AI Image Studio", href: "/ai-image-generator" },
  { label: "AI Pricing & Plans", href: "/pricing" },
];

export default function Footer() {
  const { data: generalSettings } = trpc.siteSettings.getPublicCategory.useQuery(
    { category: "general" },
    { staleTime: 60_000 }
  );

  const { data: socialSettings } = trpc.siteSettings.getPublicCategory.useQuery(
    { category: "social" },
    { staleTime: 60_000 }
  );

  const phone = generalSettings?.contact_phone || generalSettings?.sitePhone || "+20 112 398 8882";
  const email = generalSettings?.contact_email || generalSettings?.siteEmail || "info@vanirgroup.com";
  const address = generalSettings?.contact_address || generalSettings?.siteAddress || "203 SALAHSALEEM, SET, CAIRO, EGYPT";
  const siteName = generalSettings?.site_name || generalSettings?.siteName || "VANIR GROUP";
  const facebookUrl = socialSettings?.facebook || generalSettings?.social_facebook || "https://www.facebook.com/share/1DvRyfaQRC/";
  const instagramUrl = socialSettings?.instagram || generalSettings?.social_instagram || "https://www.instagram.com/vanir.group?igsh=cnpjczFsZzdrMDhi";
  const twitterUrl = socialSettings?.twitter || generalSettings?.social_twitter || "";
  const linkedinUrl = socialSettings?.linkedin || generalSettings?.social_linkedin || "";
  const copyright = generalSettings?.footer_copyright || "© 2026 VANIR GROUP. All rights reserved.";

  return (
    <footer id="contact" className="bg-[var(--theme-surface)] border-t border-white/5 relative overflow-hidden">
      {/* Subtle fog background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, rgba(100,140,180,1) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-[0.02]"
          style={{ background: "radial-gradient(circle, rgba(212,168,83,1) 0%, transparent 70%)" }}
        />
      </div>

      {/* Main footer */}
      <div className="container relative py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
          {/* Brand - spans full width on mobile */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="inline-block mb-4">
              <img
                src={ASSETS.LOGO_WATERMARK}
                alt={`${siteName} Luxury Travel Concierge & Private Aviation`}
                className="h-10 sm:h-12 md:h-14 w-auto object-contain"
              />
            </a>
            <p className="text-white/40 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 font-[var(--font-body)]">
              {siteName} (Vanir Travel Group) — Founded by CEO Ahmed Roshdi. World-class luxury travel concierge service, private jet charter (Privatjet mieten), and bespoke luxury Egypt tours.
            </p>
            <div className="flex gap-3 mb-6">
              {facebookUrl ? (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border border-white/10 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300"
                  aria-label="Facebook"
                >
                  <Facebook size={14} />
                </a>
              ) : null}
              {instagramUrl ? (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border border-white/10 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram size={14} />
                </a>
              ) : null}
              {twitterUrl ? (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border border-white/10 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300"
                  aria-label="Twitter"
                >
                  <Twitter size={14} />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => toast("Feature coming soon")}
                  className="w-9 h-9 border border-white/10 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300"
                  aria-label="Twitter"
                >
                  <Twitter size={14} />
                </button>
              )}
              {linkedinUrl ? (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border border-white/10 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={14} />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => toast("Feature coming soon")}
                  className="w-9 h-9 border border-white/10 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={14} />
                </button>
              )}
            </div>
            <div>
              <p className="text-white/50 text-[11px] uppercase tracking-widest font-semibold mb-2.5">
                Download Our App
              </p>
              <AppStoreBadges size="sm" layout="column" className="sm:flex-row lg:flex-col" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-[var(--font-display)] text-white font-semibold mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-2 text-white/40 text-sm hover:text-[var(--theme-primary)] transition-colors font-[var(--font-body)]"
                  >
                    <ArrowRight size={12} className="text-transparent group-hover:text-[var(--theme-primary)] transition-all" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-[var(--font-display)] text-white font-semibold mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm uppercase tracking-wider">
              Our Services
            </h4>
            <ul className="space-y-3">
              {serviceLinks.map((service) => (
                <li key={service.label}>
                  <a
                    href={service.href}
                    className="group flex items-center gap-2 text-white/40 text-sm hover:text-[var(--theme-primary)] transition-colors font-[var(--font-body)]"
                  >
                    <ArrowRight size={12} className="text-transparent group-hover:text-[var(--theme-primary)] transition-all" />
                    {service.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-[var(--font-display)] text-white font-semibold mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm uppercase tracking-wider">
              Contact Info
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[var(--theme-primary)] mt-0.5 shrink-0" />
                <span className="text-white/40 text-sm font-[var(--font-body)]">{address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-[var(--theme-primary)] shrink-0" />
                <a href={`mailto:${email}`} className="text-white/40 text-sm hover:text-[var(--theme-primary)] transition-colors font-[var(--font-body)]">
                  {email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-[var(--theme-primary)] shrink-0" />
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-white/40 text-sm hover:text-[var(--theme-primary)] transition-colors font-[var(--font-body)]">
                  {phone}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 relative">
        <div className="container py-4 sm:py-6 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-white/20 text-[10px] sm:text-xs font-[var(--font-body)]">
            {copyright}
          </p>
          <div className="flex gap-3 sm:gap-6 flex-wrap justify-center">
            <a
              href="/privacy-policy"
              className="text-white/40 hover:text-[var(--theme-primary)] text-xs transition-colors font-[var(--font-body)]"
            >
              Privacy Policy
            </a>
            <a
              href="/terms-of-service"
              className="text-white/40 hover:text-[var(--theme-primary)] text-xs transition-colors font-[var(--font-body)]"
            >
              Terms of Service
            </a>
            <a
              href="/privacy-policy"
              className="text-white/40 hover:text-[var(--theme-primary)] text-xs transition-colors font-[var(--font-body)]"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
