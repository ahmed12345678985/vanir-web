import { Smartphone, ShieldCheck, Sparkles } from "lucide-react";
import AppStoreBadges from "./AppStoreBadges";

export default function MobileAppSection() {
  return (
    <section className="relative py-14 sm:py-20 overflow-hidden bg-[var(--theme-surface)]">
      <div className="container relative z-10">
        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] via-black/60 to-[var(--theme-primary,#D4A853)]/[0.08] p-6 sm:p-10 md:p-14 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Subtle luxury gold ambient glow */}
          <div
            className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-20 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, var(--theme-primary, #D4A853) 0%, transparent 70%)",
            }}
          />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--theme-primary,#D4A853)]/30 bg-[var(--theme-primary,#D4A853)]/10 text-[var(--theme-primary,#D4A853)] text-xs uppercase tracking-[0.2em] font-semibold mb-4">
                <Smartphone size={14} />
                <span>VANIR Mobile Concierge</span>
              </div>

              <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
                Luxury Travel & Private Aviation in Your Pocket
              </h2>

              <p className="text-white/60 text-sm sm:text-base leading-relaxed font-[var(--font-body)] mb-5">
                Book private jets, 5-star royal suites, superyachts, VIP airport
                fast-track, and instant global eSIMs anytime with the official
                VANIR Group mobile app.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-white/50">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles
                    size={14}
                    className="text-[var(--theme-primary,#D4A853)]"
                  />
                  24/7 AI VIP Concierge
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck
                    size={14}
                    className="text-[var(--theme-primary,#D4A853)]"
                  />
                  Instant Reservations & Priority Access
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <AppStoreBadges size="lg" layout="column" className="sm:flex-row lg:flex-col" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
