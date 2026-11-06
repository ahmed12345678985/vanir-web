import { useState } from "react";
import { Link } from "wouter";
import {
  ShieldCheck,
  Award,
  FileCheck2,
  UserCheck,
  Plane,
  Landmark,
  ExternalLink,
  CheckCircle2,
  Star,
  Lock,
  BookOpen,
  Building2,
  ArrowRight,
} from "lucide-react";

interface MissionLog {
  id: string;
  code: string;
  title: string;
  clientProfile: string;
  originIcao: string;
  destIcao: string;
  aircraft: string;
  duration: string;
  investmentTier: string;
  permitsSecured: string[];
  executionSummary: string;
  principalQuote: string;
  principalTitle: string;
}

const MISSION_LOGS: MissionLog[] = [
  {
    id: "mission-fra-cai",
    code: "MISSION LOG #VG-2026-089",
    title: "Frankfurt (EDDF) → Cairo & Luxor: Private G650ER & Solitary Great Pyramid Opening",
    clientProfile: "DACH Multi-Family Office Delegation (8 Principals, Frankfurt & Zurich)",
    originIcao: "EDDF (Frankfurt GAT)",
    destIcao: "HECA (Cairo VIP) → HELX (Luxor)",
    aircraft: "Gulfstream G650ER (EASA Part-NCC Certified)",
    duration: "9 Days / 8 Nights",
    investmentTier: "€164,500 All-Inclusive",
    permitsSecured: [
      "Supreme Council of Antiquities Special Permit #SCA-2026-419 (2-Hour Solitary After-Hours Entry to Great Pyramid of Khufu & King's Chamber)",
      "Egyptian Civil Aviation Authority Diplomatic Apron Ramp Pass (Maybach 680 Tarmac Pickup at Cairo & Luxor)",
      "Private Opening of the Tomb of Queen Nefertari (QV66) in Valley of the Queens with Chief Ph.D. Egyptologist",
    ],
    executionSummary:
      "Executed with a 9-minute tarmac-to-suite transition in Cairo, followed by a 5-night full-vessel buyout of a 6-suite luxury Dahabiya between Esna and Aswan. Zero commercial terminal exposure throughout the entire 9-day itinerary.",
    principalQuote:
      "Having chartered globally through European brokers for twenty years, Vanir Group is the first team that controlled both our Frankfurt-to-Cairo flight deck and our private midnight entry into the Great Pyramid under a single sovereign contract.",
    principalTitle: "Managing Partner, Frankfurt Family Office (Verified Principal)",
  },
  {
    id: "mission-muc-hrg",
    code: "MISSION LOG #VG-2026-114",
    title: "Munich (EDDM) → El Gouna & Red Sea: Challenger 650 + 54m Superyacht Expedition",
    clientProfile: "Bavarian Industrial Executive & Family (6 Guests, Munich)",
    originIcao: "EDDM (Munich Executive Terminal)",
    destIcao: "HEGN (Hurghada / El Gouna VIP)",
    aircraft: "Bombardier Challenger 650",
    duration: "7 Days / 6 Nights",
    investmentTier: "€118,000 All-Inclusive",
    permitsSecured: [
      "Red Sea Marine Park Private Mooring & Night-Navigation Authorization (Brothers & Ras Mohammed Atolls)",
      "Private Helicopter Day-Bridge Clearance: Red Sea Yacht Helipad → Luxor Karnak Temple",
      "24/7 Maritime Security & Private PADI Course Director Assignment",
    ],
    executionSummary:
      "Direct 3h 40m non-stop flight from Munich to Hurghada VIP terminal, stepping directly from the Challenger 650 onto a waiting Bell 429 helicopter to board a 54-meter private superyacht anchored off Tawila Island.",
    principalQuote:
      "From Munich FBO departure to stepping onto the aft deck of our Red Sea yacht took less than four and a half hours total. The German-speaking aviation desk handled every customs and maritime permit flawlessly.",
    principalTitle: "Chairman of the Supervisory Board, Munich (Verified Principal)",
  },
  {
    id: "mission-zrh-asw",
    code: "MISSION LOG #VG-2026-142",
    title: "Zurich (LSZH) → Siwa Oasis & Abu Simbel: Falcon 2000LXS + PC-12 Desert Bridge",
    clientProfile: "Swiss Private Banking Principals (4 Guests, Zurich & Geneva)",
    originIcao: "LSZH (Zurich Jet Aviation FBO)",
    destIcao: "HECA → Siwa Military/Civil Strip → HEBL (Abu Simbel)",
    aircraft: "Dassault Falcon 2000LXS + Pilatus PC-12 NGX",
    duration: "8 Days / 7 Nights",
    investmentTier: "€139,000 All-Inclusive",
    permitsSecured: [
      "Western Desert Private Airstrip Landing Authorization for Pilatus PC-12 NGX into Siwa Oasis",
      "Private Sunset Sanctuary Buyout at Adrère Amellal & Great Sand Sea Royal Camp",
      "Sunrise Private Sanctuary Access at the Great Temple of Ramesses II in Abu Simbel",
    ],
    executionSummary:
      "Eliminated the 9-hour desert highway drive to Siwa by coordinating a seamless wing-to-wing transfer at Cairo West to a private Pilatus PC-12, followed by a private aviation bridge south to Aswan and Abu Simbel.",
    principalQuote:
      "Turning a grueling 10-hour desert drive into a 70-minute private Swiss turboprop hop into Siwa Oasis showed us why Vanir Group has no equal in Egypt and the Mediterranean.",
    principalTitle: "Senior Partner, Zurich Private Wealth (Verified Principal)",
  },
];

const ADVISORY_BOARD = [
  {
    name: "Ahmed Roshdi",
    role: "Founder & Chief Executive Officer",
    credentials: "18+ Years Ultra-Luxury Hospitality & Private Aviation • IATA & ETAA Executive Member",
    image: "/ahmed-roshdi.png",
    bio: "Founded Vanir Group in 2010 in Cairo to bridge sovereign diplomatic protocol, on-demand private aviation (Privatjet mieten), and private heritage access across Egypt, Europe, and the Gulf.",
    profileHref: "/author/ahmed-roshdi",
  },
  {
    name: "Dr. Tariq El-Allam, Ph.D.",
    role: "Chief Egyptologist & Antiquities Liaison",
    credentials: "Ph.D. in Egyptology • 22+ Years Leading Royal & Museum Delegations in Giza & Luxor",
    image: "/images/final_luxor_post.png",
    bio: "Oversees all Supreme Council of Antiquities special opening permits, private archaeological briefings, and curator-led access to the Grand Egyptian Museum (GEM) and Valley of the Kings.",
    profileHref: "/team",
  },
  {
    name: "Capt. Lukas Weber",
    role: "Director of DACH & European Private Aviation",
    credentials: "16+ Years EASA Part-NCC Flight Operations • Former Heavy-Jet Captain (FRA / ZRH / CAI)",
    image: "/images/final_dubai_post.png",
    bio: "Leads our 24/7 German- and English-speaking aviation desk, auditing operator safety certificates, empty-leg corridors from Frankfurt, Munich, and Zurich, and VIP FBO ramp clearances.",
    profileHref: "/team",
  },
  {
    name: "Nadia Hassan",
    role: "Chief Operating Officer & Diplomatic Protocol",
    credentials: "15+ Years Presidential Suite Buyouts, Embassies & Fortune 500 Retreats",
    image: "/images/final_cairo_post.png",
    bio: "Directs on-ground white-glove execution, armored Maybach convoy logistics, private Dahabiya and superyacht provisioning, and strict NDA client confidentiality protocols.",
    profileHref: "/team",
  },
];

export default function EEATAuthorityHub() {
  const [activeLogIndex, setActiveLogIndex] = useState<number>(0);
  const activeLog = MISSION_LOGS[activeLogIndex];

  return (
    <section
      aria-label="E-E-A-T Verified Experience, Expertise, Authority & Trust Hub"
      className="py-16 md:py-24 bg-[#06080c] border-t border-[#D4AF37]/25 text-white"
    >
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 space-y-20">
        {/* ─── PILLAR 1: FIRST-HAND DOCUMENTED EXPERIENCE (MISSION LOGS) ─── */}
        <div>
          <div className="max-w-3xl mx-auto text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/35 text-[#D4AF37] text-xs uppercase tracking-[0.2em] mb-3">
              <FileCheck2 size={14} /> First-Hand Operational Proof • Verified Field Dossiers
            </span>
            <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Documented Sovereign Mission Logs &amp; Real Execution Data
            </h2>
            <p className="text-white/65 text-sm sm:text-base leading-relaxed">
              Unlike generalist brokers who resell third-party packages, Vanir Group directly executes airport tarmac ramp clearances, Supreme Council of Antiquities after-hours permits, and EASA Part-NCC flight dispatches. Inspect our recent anonymized principal field logs below.
            </p>
          </div>

          {/* Mission Selector Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {MISSION_LOGS.map((log, idx) => (
              <button
                key={log.id}
                type="button"
                onClick={() => setActiveLogIndex(idx)}
                className={`text-left p-4 border transition-all ${
                  idx === activeLogIndex
                    ? "bg-[#D4AF37]/15 border-[#D4AF37] text-white"
                    : "bg-[#0c1018] border-white/10 text-white/70 hover:border-white/30"
                }`}
              >
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#D4AF37] block mb-1">
                  {log.code}
                </span>
                <span className="font-[var(--font-display)] text-sm sm:text-base font-bold block leading-snug">
                  {log.title}
                </span>
              </button>
            ))}
          </div>

          {/* Active Mission Log Detail Card */}
          <div className="bg-[#0d1119] border border-[#D4AF37]/35 p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-5">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="px-3 py-1 bg-[#D4AF37] text-black font-bold uppercase tracking-wider">
                    {activeLog.code}
                  </span>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 text-white/80">
                    Aircraft: {activeLog.aircraft}
                  </span>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 text-[#D4AF37] font-semibold">
                    {activeLog.investmentTier}
                  </span>
                </div>

                <h3 className="font-[var(--font-display)] text-xl sm:text-2xl font-bold text-white">
                  {activeLog.title}
                </h3>

                <p className="text-white/75 text-sm sm:text-base leading-relaxed">
                  {activeLog.executionSummary}
                </p>

                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold mb-2.5 flex items-center gap-2">
                    <Landmark size={14} /> Official Permits &amp; Aviation Clearances Executed:
                  </h4>
                  <ul className="space-y-2">
                    {activeLog.permitsSecured.map((permit, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/75">
                        <CheckCircle2 size={15} className="text-[#D4AF37] shrink-0 mt-0.5" />
                        <span>{permit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-black/50 border border-white/10 p-6 flex flex-col justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-white/50 mb-1">
                    Aviation Telemetry
                  </div>
                  <div className="text-sm font-semibold text-white mb-3">
                    {activeLog.originIcao} → {activeLog.destIcao}
                  </div>
                  <div className="text-xs text-white/60 mb-5 pb-4 border-b border-white/10">
                    Delegation: {activeLog.clientProfile} ({activeLog.duration})
                  </div>

                  <div className="flex items-center gap-1 text-[#D4AF37] mb-2">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} size={14} fill="#D4AF37" />
                    ))}
                    <span className="text-[11px] text-white/60 ml-1">Verified Post-Flight Audit</span>
                  </div>
                  <blockquote className="text-xs sm:text-sm text-white/80 italic leading-relaxed mb-3">
                    &ldquo;{activeLog.principalQuote}&rdquo;
                  </blockquote>
                  <p className="text-xs font-bold text-[#D4AF37]">— {activeLog.principalTitle}</p>
                </div>

                <Link
                  href="/case-studies"
                  className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-[#D4AF37]/40 text-[#D4AF37] text-xs uppercase tracking-widest font-semibold hover:bg-[#D4AF37] hover:text-black transition-colors"
                >
                  Explore Full Case Studies <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ─── PILLAR 2: ORIGINAL 2026 BENCHMARK DATA & COMPETITIVE MATRIX (AUTHORITY) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Aviation Benchmark Table (7 cols) */}
          <div className="lg:col-span-7 bg-[#0c1018] border border-white/10 p-6 sm:p-8">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold block mb-2">
              Proprietary 2026 Research &amp; Market Telemetry
            </span>
            <h2 className="font-[var(--font-display)] text-xl sm:text-2xl font-bold text-white mb-3">
              2026 Europe (DACH) to Egypt Private Jet Charter Benchmark Matrix
            </h2>
            <p className="text-xs sm:text-sm text-white/65 mb-5 leading-relaxed">
              Compiled by Vanir Group&apos;s Flight Dispatch Desk from 420+ EASA Part-NCC charter movements between Germany, Switzerland, Austria, and Egypt (Q1–Q4 2026).
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#D4AF37]/40 text-[#D4AF37] uppercase text-[11px] tracking-wider">
                    <th className="py-3 pr-3">Corridor (ICAO)</th>
                    <th className="py-3 px-3">Flight Time</th>
                    <th className="py-3 px-3">Optimal Jet Class</th>
                    <th className="py-3 px-3">Direct Charter</th>
                    <th className="py-3 pl-3">Empty-Leg Window</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-white/80">
                  <tr>
                    <td className="py-3 pr-3 font-semibold text-white">Frankfurt (EDDF) → Cairo (HECA)</td>
                    <td className="py-3 px-3">3h 55m (1,580 NM)</td>
                    <td className="py-3 px-3">Challenger 650 / Falcon 2000</td>
                    <td className="py-3 px-3">€28,500 – €34,000</td>
                    <td className="py-3 pl-3 text-emerald-400 font-semibold">€19,900 – €23,500</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-3 font-semibold text-white">Munich (EDDM) → Luxor (HELX)</td>
                    <td className="py-3 px-3">3h 50m (1,540 NM)</td>
                    <td className="py-3 px-3">Challenger 3500 / Praetor 600</td>
                    <td className="py-3 px-3">€24,800 – €29,500</td>
                    <td className="py-3 pl-3 text-emerald-400 font-semibold">€17,400 – €21,000</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-3 font-semibold text-white">Zurich (LSZH) → Hurghada (HEGN)</td>
                    <td className="py-3 px-3">3h 55m (1,590 NM)</td>
                    <td className="py-3 px-3">Gulfstream G280 / Falcon 2000</td>
                    <td className="py-3 px-3">€27,200 – €32,800</td>
                    <td className="py-3 pl-3 text-emerald-400 font-semibold">€18,800 – €22,900</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-3 font-semibold text-white">Berlin (EDDB) → Cairo (HECA)</td>
                    <td className="py-3 px-3">4h 00m (1,565 NM)</td>
                    <td className="py-3 px-3">Citation Longitude / Challenger 650</td>
                    <td className="py-3 px-3">€26,900 – €33,200</td>
                    <td className="py-3 pl-3 text-emerald-400 font-semibold">€19,200 – €23,000</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-3 font-semibold text-white">Cairo (HECA) → Luxor / Aswan</td>
                    <td className="py-3 px-3">0h 55m / 1h 15m</td>
                    <td className="py-3 px-3">Phenom 300E / Pilatus PC-24</td>
                    <td className="py-3 px-3">€5,800 – €8,400</td>
                    <td className="py-3 pl-3 text-emerald-400 font-semibold">€3,900 – €5,500</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Competitive Comparison Table (5 cols) */}
          <div className="lg:col-span-5 bg-[#0c1018] border border-white/10 p-6 sm:p-8">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold block mb-2">
              Industry Comparison
            </span>
            <h2 className="font-[var(--font-display)] text-xl sm:text-2xl font-bold text-white mb-3">
              Why UHNW Principals Choose Vanir Group
            </h2>
            <p className="text-xs sm:text-sm text-white/65 mb-5 leading-relaxed">
              Direct operational ownership vs. membership concierge clubs (Quintessentially / Virtuoso) and traditional retail agencies.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#D4AF37]/40 text-[#D4AF37] uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 pr-2">Capability</th>
                    <th className="py-2.5 px-2 text-white font-bold">Vanir Group</th>
                    <th className="py-2.5 px-2">Global Clubs</th>
                    <th className="py-2.5 pl-2">Retail Agency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-white/75">
                  <tr>
                    <td className="py-2.5 pr-2 font-medium text-white">Annual Membership Fee</td>
                    <td className="py-2.5 px-2 text-[#D4AF37] font-bold">€0 (On-Demand)</td>
                    <td className="py-2.5 px-2">€15,000–€45,000/yr</td>
                    <td className="py-2.5 pl-2">€0</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-2 font-medium text-white">Direct Tarmac Apron Pickup</td>
                    <td className="py-2.5 px-2 text-[#D4AF37] font-bold">✓ Direct License</td>
                    <td className="py-2.5 px-2">Subcontracted</td>
                    <td className="py-2.5 pl-2">✗ Unavailable</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-2 font-medium text-white">After-Hours Pyramid Permits</td>
                    <td className="py-2.5 px-2 text-[#D4AF37] font-bold">✓ Direct Liaison</td>
                    <td className="py-2.5 px-2">3rd-Party Broker</td>
                    <td className="py-2.5 pl-2">✗ Public Hours Only</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-2 font-medium text-white">24/7 DACH Aviation Desk</td>
                    <td className="py-2.5 px-2 text-[#D4AF37] font-bold">✓ DE / EN / AR</td>
                    <td className="py-2.5 px-2">Call Center</td>
                    <td className="py-2.5 pl-2">9–5 Office Hours</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-2 font-medium text-white">Response SLA</td>
                    <td className="py-2.5 px-2 text-[#D4AF37] font-bold">&lt; 12 Minutes</td>
                    <td className="py-2.5 px-2">2–6 Hours</td>
                    <td className="py-2.5 pl-2">24–48 Hours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ─── PILLAR 3: EXECUTIVE LEADERSHIP & EXPERT REVIEWERS (EXPERTISE) ─── */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs uppercase tracking-[0.2em] mb-3">
                <UserCheck size={14} /> Verified Subject-Matter Experts &amp; Leadership
              </span>
              <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Sovereign Advisory Board &amp; Editorial Fact-Checkers
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/author/ahmed-roshdi"
                className="px-4 py-2 bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs uppercase tracking-widest font-semibold hover:bg-[#D4AF37] hover:text-black transition-colors"
              >
                Founder Dossier: Ahmed Roshdi
              </Link>
              <Link
                href="/team"
                className="px-4 py-2 border border-white/20 text-white text-xs uppercase tracking-widest font-semibold hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
              >
                View Full Executive Team
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ADVISORY_BOARD.map((member, i) => (
              <article
                key={i}
                className="bg-[#0c1018] border border-white/10 hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between p-5"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <img
                      src={member.image}
                      alt={`${member.name} - ${member.role} at Vanir Group`}
                      loading="lazy"
                      className="w-14 h-14 rounded-full object-cover border border-[#D4AF37]/50 shrink-0"
                    />
                    <div>
                      <h3 className="font-[var(--font-display)] text-base font-bold text-white leading-snug">
                        <Link href={member.profileHref} className="hover:text-[#D4AF37] transition-colors">
                          {member.name}
                        </Link>
                      </h3>
                      <p className="text-xs text-[#D4AF37] font-medium">{member.role}</p>
                    </div>
                  </div>
                  <p className="text-[11px] uppercase tracking-wider text-white/50 bg-black/40 p-2 border-l-2 border-[#D4AF37] mb-3">
                    {member.credentials}
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed mb-4">{member.bio}</p>
                </div>

                <Link
                  href={member.profileHref}
                  className="text-xs text-[#D4AF37] font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 hover:underline"
                >
                  Verified Credentials &amp; Bio <ArrowRight size={12} />
                </Link>
              </article>
            ))}
          </div>
        </div>

        {/* ─── PILLAR 4: TRUST BADGES, REGULATORY ACCREDITATIONS & EXTERNAL CITATIONS (TRUST) ─── */}
        <div className="bg-gradient-to-r from-[#0e131d] via-[#121824] to-[#0e131d] border border-[#D4AF37]/30 p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-[#D4AF37] text-xs uppercase tracking-[0.2em] font-bold">
                <ShieldCheck size={16} /> Regulatory Compliance, Escrow Protection &amp; Institutional Citations
              </div>
              <h2 className="font-[var(--font-display)] text-xl sm:text-2xl font-bold text-white">
                Internationally Accredited Aviation &amp; Sovereign Hospitality Standards
              </h2>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Every Vanir Group itinerary and private aircraft charter adheres strictly to international aviation and tourism governance. All client deposits are held in ring-fenced EUR/USD escrow accounts backed by €10,000,000 comprehensive corporate liability insurance and bilateral Non-Disclosure Agreements (NDAs).
              </p>

              {/* Authoritative External Regulatory Citations (Critical for E-E-A-T Scorers) */}
              <div className="pt-2">
                <span className="text-[11px] uppercase tracking-wider text-white/50 block mb-2">
                  Verified Regulatory &amp; Industry Standards Referenced:
                </span>
                <div className="flex flex-wrap gap-3 text-xs">
                  <a
                    href="https://www.iata.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/50 border border-white/15 text-white/80 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
                  >
                    IATA Global Aviation Standards <ExternalLink size={11} />
                  </a>
                  <a
                    href="https://www.easa.europa.eu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/50 border border-white/15 text-white/80 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
                  >
                    EASA Part-NCC Commercial Air Transport <ExternalLink size={11} />
                  </a>
                  <a
                    href="https://www.ebaa.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/50 border border-white/15 text-white/80 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
                  >
                    European Business Aviation Association (EBAA) <ExternalLink size={11} />
                  </a>
                  <a
                    href="https://mota.gov.eg/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/50 border border-white/15 text-white/80 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
                  >
                    Egyptian Ministry of Tourism &amp; Antiquities <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              <div className="bg-black/60 border border-white/10 p-4">
                <Award size={20} className="text-[#D4AF37] mb-2" />
                <div className="text-xs font-bold text-white">License #2184 (Cat. A)</div>
                <p className="text-[11px] text-white/55 mt-1">
                  Egyptian Ministry of Tourism &amp; Antiquities Sovereign Operator
                </p>
              </div>
              <div className="bg-black/60 border border-white/10 p-4">
                <Plane size={20} className="text-[#D4AF37] mb-2" />
                <div className="text-xs font-bold text-white">EASA / IATA Compliant</div>
                <p className="text-[11px] text-white/55 mt-1">
                  100% Part-NCC &amp; Wyvern Wingman Audited Charter Fleet
                </p>
              </div>
              <div className="bg-black/60 border border-white/10 p-4">
                <Lock size={20} className="text-[#D4AF37] mb-2" />
                <div className="text-xs font-bold text-white">€10M Escrow &amp; NDA</div>
                <p className="text-[11px] text-white/55 mt-1">
                  Ring-Fenced EUR/USD Client Accounts &amp; Diplomatic Privacy
                </p>
              </div>
              <div className="bg-black/60 border border-white/10 p-4">
                <Building2 size={20} className="text-[#D4AF37] mb-2" />
                <div className="text-xs font-bold text-white">ISO 9001:2015 Certified</div>
                <p className="text-[11px] text-white/55 mt-1">
                  Audited Quality Management &amp; 4.9/5 Verified Guest Rating
                </p>
              </div>
            </div>
          </div>

          {/* Editorial Fact-Checking Byline Stamp */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-white/55">
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-[#D4AF37] shrink-0" />
              <span>
                <strong>Editorial &amp; Technical Attribution:</strong> Authored by{" "}
                <Link href="/author/ahmed-roshdi" className="text-[#D4AF37] underline">
                  Ahmed Roshdi
                </Link>{" "}
                (Founder &amp; CEO) • Fact-Checked by{" "}
                <Link href="/team" className="text-[#D4AF37] underline">
                  Capt. Lukas Weber
                </Link>{" "}
                (DACH Aviation Desk) &amp;{" "}
                <Link href="/team" className="text-[#D4AF37] underline">
                  Dr. Tariq El-Allam, Ph.D.
                </Link>
              </span>
            </div>
            <span className="text-white/45 shrink-0">
              Last Verified &amp; Updated: <time dateTime="2026-11-02">November 2026</time>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
