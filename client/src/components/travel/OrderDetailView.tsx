import React, { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plane,
  Building2,
  ChevronDown,
  ChevronUp,
  Printer,
  Edit3,
  Calendar,
  MapPin,
  Wifi,
  Coffee,
  Utensils,
  Sparkles,
  Luggage,
  UserCheck,
  XCircle,
  RefreshCw,
  CreditCard,
  MessageSquarePlus,
  Mail,
  CheckCircle2,
  X,
} from "lucide-react";

interface OrderDetailViewProps {
  order: any;
  onBack: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onSaveOrderDetails?: (id: string, patch: Record<string, any>) => void;
}

export function OrderDetailView({
  order,
  onBack,
  onUpdateStatus,
  onSaveOrderDetails,
}: OrderDetailViewProps) {
  const [flightOpen, setFlightOpen] = useState(true);
  const [hotelOpen, setHotelOpen] = useState(true);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Modals
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [changeBookingOpen, setChangeBookingOpen] = useState(false);
  const [extraBaggageOpen, setExtraBaggageOpen] = useState(false);
  const [quickInfoModal, setQuickInfoModal] = useState<"hotel" | "payment" | "request" | null>(null);

  // Editable Customer Info State (Image 6)
  const [custName, setCustName] = useState(order.customerName || order.guestName || "VIP Guest");
  const [nationality, setNationality] = useState(order.nationality || "Egyptian");
  const [dob, setDob] = useState(order.dob || "1990-05-15");
  const [passportNo, setPassportNo] = useState(order.passportNumber || "A0345678");
  const [passportExpire, setPassportExpire] = useState(order.passportExpire || "2032-09-20");

  // Editable Booking Change State
  const [newTravelDate, setNewTravelDate] = useState(order.travelDate || "2026-12-01");
  const [newReturnDate, setNewReturnDate] = useState(order.returnDate || "2026-12-07");
  const [extraBags, setExtraBags] = useState<number>(Number(order.extraBags || 1));
  const [specialReqText, setSpecialReqText] = useState(order.notes || "VIP Airport Fast Track & Late Check-out");

  const orderCode = String(order.confirmationCode || order.id || "6079");
  const status = order.status || "pending";
  const totalAmount = Number(order.totalPrice || 2046);
  const baseFare = Math.round(totalAmount * 0.86);
  const taxes = totalAmount - baseFare;

  const initials = custName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s: string) => s[0]?.toUpperCase())
    .join("") || "VG";

  const galleryImages = [
    "/images/hotels-real/luxury_villa_pool.jpg",
    "/images/hotels-real/caimn-guestroom-0037-hor-clsc.webp",
    "/images/hotels-real/caimn-view-0063-hor-clsc.webp",
    "/images/hotels-real/caimn-lobby-8343-hor-clsc.webp",
  ];

  return (
    <div className="space-y-5">
      {/* Top Order Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0B111E]/90 border border-white/10 rounded-2xl px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/10"
            title="Back to Order List"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-extrabold text-white">Order #{orderCode}</h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                  status === "completed" || status === "confirmed"
                    ? "bg-emerald-100 text-emerald-700"
                    : status === "cancelled"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                }`}
              >
                {status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {order.travelDate || "Scheduled"} · {custName} ({order.customerEmail || "guest@vanirgroup.com"})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => onUpdateStatus(order.id, e.target.value)}
            className="border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold bg-[#0B111E]/90 text-slate-100"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-slate-200 hover:bg-black/30"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
          <button
            type="button"
            onClick={() => setCustomerModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#080E1A] text-[#E5C378] text-xs font-bold hover:bg-[#111C33]"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Main Content */}
        <div className="lg:col-span-8 space-y-5">
          {/* Details Card */}
          <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Details</h3>
              <button
                type="button"
                onClick={() => setChangeBookingOpen(true)}
                className="text-slate-400 hover:text-slate-200"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            {/* Flight Accordion */}
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setFlightOpen((v) => !v)}
                className="w-full px-4 py-3 bg-black/30 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Plane className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white">
                      Flight, Cairo → Dubai · Date {newTravelDate}, Time 11:00
                    </div>
                    <div className="text-[11px] text-slate-400">AIR PNR: VNR-{orderCode.slice(0, 6)}</div>
                  </div>
                </div>
                {flightOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {flightOpen && (
                <div className="p-4 space-y-4 border-t border-white/10 text-xs">
                  <div className="font-bold text-slate-100">Flight Details</div>
                  <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-black/30">
                    <div>
                      <div className="font-bold text-white">Emirates Airlines</div>
                      <div className="text-[11px] text-slate-400">Boeing 777-300ER</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-extrabold text-white">11:00</div>
                      <div className="text-[11px] text-slate-400">CAI</div>
                    </div>
                    <div className="text-center text-[11px] text-slate-400">
                      <div>3h 45m</div>
                      <div className="border-t border-dashed border-slate-300 my-1 w-24" />
                      <div>Direct</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-extrabold text-white">15:45</div>
                      <div className="text-[11px] text-slate-400">DXB</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                    <div>
                      <span className="text-slate-400 block">Ticket Number</span>
                      <span className="font-mono font-bold text-slate-100">176-3103754101</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Airline PNR</span>
                      <span className="font-mono font-bold text-slate-100">XNWQOT (EK-Business)</span>
                    </div>
                  </div>

                  {/* Fare Details */}
                  <div className="pt-3 border-t border-white/10 space-y-1.5">
                    <div className="font-bold text-slate-100 mb-2">Fare Details</div>
                    <div className="flex justify-between text-slate-300"><span>Fare</span><span className="font-semibold">${baseFare.toLocaleString()}.00 USD</span></div>
                    <div className="flex justify-between text-slate-300"><span>Tax & Fees</span><span className="font-semibold">${taxes.toLocaleString()}.00 USD</span></div>
                    <div className="flex justify-between font-extrabold text-white pt-1 border-t border-white/10">
                      <span>Total</span>
                      <span>${totalAmount.toLocaleString()}.00 USD</span>
                    </div>
                  </div>

                  {/* Special Service */}
                  <div className="pt-3 border-t border-white/10">
                    <div className="font-bold text-slate-100 mb-2">Special Service</div>
                    <div className="flex flex-wrap gap-3 text-[11px] text-slate-300">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10"><Wifi className="w-3.5 h-3.5 text-[#C8A04F]" /> Wifi Service</span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10"><Sparkles className="w-3.5 h-3.5 text-[#C8A04F]" /> Valet Service</span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10"><Coffee className="w-3.5 h-3.5 text-[#C8A04F]" /> Special Drink</span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10"><Utensils className="w-3.5 h-3.5 text-[#C8A04F]" /> Gourmet Food</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Hotel Accordion */}
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setHotelOpen((v) => !v)}
                className="w-full px-4 py-3 bg-black/30 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white">
                      Hotel · {order.packageName || "Luxury Resort Suite"}
                    </div>
                    <div className="text-[11px] text-slate-400">HTL PNR: HTL-{orderCode.slice(0, 6)}</div>
                  </div>
                </div>
                {hotelOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {hotelOpen && (
                <div className="p-4 space-y-4 border-t border-white/10 text-xs">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img src={galleryImages[0]} alt="Hotel" className="w-32 h-24 rounded-xl object-cover shrink-0" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">{order.packageName || "Luxury Beachfront Villa"}</h4>
                      <p className="text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#C8A04F]" />
                        {order.destination || "Cairo / Dubai / Maldives"}
                      </p>
                      <p className="text-slate-300 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Check in: {newTravelDate} · Check out: {newReturnDate}
                      </p>
                    </div>
                  </div>

                  {/* Gallery */}
                  <div>
                    <div className="font-bold text-slate-100 mb-2">Gallery</div>
                    <div className="grid grid-cols-4 gap-2">
                      {galleryImages.map((src, i) => (
                        <img key={i} src={src} alt={`Gallery ${i + 1}`} className="h-16 w-full object-cover rounded-lg" />
                      ))}
                    </div>
                  </div>

                  {/* What this place offers & Meal Plan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/10">
                    <div>
                      <div className="font-bold text-slate-100 mb-2">What this place offers</div>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                        <span>✓ Beach access</span>
                        <span>✓ High-speed WiFi</span>
                        <span>✓ Infinity Pool</span>
                        <span>✓ Air conditioning</span>
                        <span>✓ Free VIP parking</span>
                        <span>✓ Concierge 24/7</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 mb-2">Meal Plan</div>
                      <div className="space-y-1 text-[11px] text-slate-300">
                        <div>Breakfast: 08:00 AM</div>
                        <div>Lunch: 12:00 PM</div>
                        <div>Dinner: 07:00 PM</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* History Timeline Card (Image 7) */}
          <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white">History</h3>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
              <div className="sm:col-span-7 space-y-3 border-l-2 border-white/10 pl-4 ml-2">
                {[
                  { label: "Travel is completed", time: "Updated live", active: status === "completed" },
                  { label: "3rd Installment / Final Clearance", time: "Scheduled", active: status === "confirmed" || status === "completed" },
                  { label: "Pay later deposit verified", time: "Confirmed", active: true },
                  { label: "Order has been created", time: newTravelDate, active: true },
                ]
                  .slice(0, showAllHistory ? 4 : 3)
                  .map((ev, i) => (
                    <div key={i} className="relative">
                      <span
                        className={`w-2.5 h-2.5 rounded-full absolute -left-[21px] top-1 ${
                          ev.active ? "bg-[#C8A04F]" : "bg-slate-300"
                        }`}
                      />
                      <div className="font-bold text-slate-100">{ev.label}</div>
                      <div className="text-[11px] text-slate-400">{ev.time}</div>
                    </div>
                  ))}
                <button
                  type="button"
                  onClick={() => setShowAllHistory((v) => !v)}
                  className="text-[11px] font-bold text-[#B58D3D] hover:underline"
                >
                  {showAllHistory ? "Show Less" : "Show More"}
                </button>
              </div>

              <div className="sm:col-span-5 bg-black/30 rounded-xl p-3 space-y-2 text-[11px]">
                <div><span className="text-slate-400 block">Order Time</span><span className="font-bold text-slate-100">{newTravelDate} 10:00 AM</span></div>
                <div><span className="text-slate-400 block">Departure Date</span><span className="font-bold text-slate-100">{newTravelDate}</span></div>
                <div><span className="text-slate-400 block">Return Date</span><span className="font-bold text-slate-100">{newReturnDate}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Action Sidebar (Image 6, 7, 8, 9) */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-[#0B111E]/90 border border-white/10 rounded-2xl p-5 space-y-5">
            {/* Manage Booking */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white">Manage Booking</h4>
              <button
                type="button"
                onClick={() => setChangeBookingOpen(true)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-black/30 hover:bg-white/10 text-xs font-semibold text-slate-100 transition"
              >
                <RefreshCw className="w-4 h-4 text-slate-400" />
                Change Booking
              </button>
              <button
                type="button"
                onClick={() => onUpdateStatus(order.id, "cancelled")}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-black/30 hover:bg-rose-50 text-xs font-semibold text-slate-100 hover:text-rose-700 transition"
              >
                <XCircle className="w-4 h-4 text-slate-400" />
                Cancel/Refund Booking
              </button>
              <button
                type="button"
                onClick={() => setExtraBaggageOpen(true)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-black/30 hover:bg-white/10 text-xs font-semibold text-slate-100 transition"
              >
                <Luggage className="w-4 h-4 text-slate-400" />
                Extra Baggage ({extraBags} bags)
              </button>
              <button
                type="button"
                onClick={() => setCustomerModalOpen(true)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#C8A04F] hover:bg-[#B58D3D] text-xs font-extrabold text-[#080E1A] transition shadow-xs"
              >
                <UserCheck className="w-4 h-4" />
                Customer Information
              </button>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-3 border-t border-white/10">
              <h4 className="text-sm font-bold text-white">Quick Actions</h4>
              <button
                type="button"
                onClick={() => setQuickInfoModal("hotel")}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-black/30 hover:bg-white/10 text-xs font-semibold text-slate-100 transition"
              >
                <Building2 className="w-4 h-4 text-slate-400" />
                Hotel Information
              </button>
              <button
                type="button"
                onClick={() => setQuickInfoModal("payment")}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-black/30 hover:bg-white/10 text-xs font-semibold text-slate-100 transition"
              >
                <CreditCard className="w-4 h-4 text-slate-400" />
                Payment Information
              </button>
              <button
                type="button"
                onClick={() => setQuickInfoModal("request")}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-black/30 hover:bg-white/10 text-xs font-semibold text-slate-100 transition"
              >
                <MessageSquarePlus className="w-4 h-4 text-slate-400" />
                Special Request
              </button>
            </div>

            {/* Print */}
            <div className="space-y-2 pt-3 border-t border-white/10">
              <h4 className="text-sm font-bold text-white">Print</h4>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-black/30 hover:bg-white/10 text-xs font-semibold text-slate-100 transition"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                Print e-booking
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-black/30 hover:bg-white/10 text-xs font-semibold text-slate-100 transition"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                Print Booking Summary
              </button>
              <button
                type="button"
                onClick={() => toast.success(`Booking summary sent to ${order.customerEmail || "guest email"}`)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-black/30 hover:bg-white/10 text-xs font-semibold text-slate-100 transition"
              >
                <Mail className="w-4 h-4 text-slate-400" />
                Send Email Booking
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Customer Information Modal (Image 6) */}
      {customerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-[#0B111E]/90 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-full bg-[#080E1A] text-[#E5C378] font-extrabold text-sm flex items-center justify-center">
                {initials}
              </div>
              <button type="button" onClick={() => setCustomerModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full border border-white/10 rounded-lg px-3 py-2 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nationality</label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full border border-white/10 rounded-lg px-3 py-2 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full border border-white/10 rounded-lg px-3 py-2 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Passport Number</label>
                <input
                  type="text"
                  value={passportNo}
                  onChange={(e) => setPassportNo(e.target.value)}
                  className="w-full border border-white/10 rounded-lg px-3 py-2 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Passport Expire</label>
                <input
                  type="date"
                  value={passportExpire}
                  onChange={(e) => setPassportExpire(e.target.value)}
                  className="w-full border border-white/10 rounded-lg px-3 py-2 font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCustomerModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onSaveOrderDetails?.(order.id, { customerName: custName, nationality, dob, passportNumber: passportNo, passportExpire });
                  toast.success("Customer information updated");
                  setCustomerModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-[#C8A04F] text-[#080E1A] text-xs font-extrabold hover:bg-[#B58D3D]"
              >
                Update & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Booking Modal */}
      {changeBookingOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-[#0B111E]/90 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white">Change Booking Dates</h4>
              <button type="button" onClick={() => setChangeBookingOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Check-in Date</label>
                <input type="date" value={newTravelDate} onChange={(e) => setNewTravelDate(e.target.value)} className="w-full border border-white/10 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Check-out Date</label>
                <input type="date" value={newReturnDate} onChange={(e) => setNewReturnDate(e.target.value)} className="w-full border border-white/10 rounded-lg px-3 py-2" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setChangeBookingOpen(false)} className="px-4 py-2 rounded-lg bg-white/10 font-bold">Cancel</button>
              <button
                type="button"
                onClick={() => {
                  onSaveOrderDetails?.(order.id, { travelDate: newTravelDate, returnDate: newReturnDate });
                  toast.success("Booking dates updated");
                  setChangeBookingOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-[#C8A04F] text-[#080E1A] font-extrabold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extra Baggage Modal */}
      {extraBaggageOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-[#0B111E]/90 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-xs">
            <h4 className="text-base font-bold text-white">Extra Baggage Allocation</h4>
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/30">
              <span>Additional Checked Bags (23kg @ $38)</span>
              <input
                type="number"
                min={0}
                max={10}
                value={extraBags}
                onChange={(e) => setExtraBags(Number(e.target.value))}
                className="w-16 border border-white/10 rounded-lg px-2 py-1 text-center font-bold"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setExtraBaggageOpen(false)} className="px-4 py-2 rounded-lg bg-white/10 font-bold">Close</button>
              <button
                type="button"
                onClick={() => {
                  toast.success(`Saved ${extraBags} extra bags for Order #${orderCode}`);
                  setExtraBaggageOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-[#C8A04F] text-[#080E1A] font-extrabold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Info Modal */}
      {quickInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-[#0B111E]/90 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white capitalize">{quickInfoModal} Information</h4>
              <button type="button" onClick={() => setQuickInfoModal(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            {quickInfoModal === "hotel" && (
              <div className="space-y-1.5 text-slate-300">
                <p><strong>Property:</strong> {order.packageName}</p>
                <p><strong>Check-in:</strong> {newTravelDate} (14:00)</p>
                <p><strong>Check-out:</strong> {newReturnDate} (12:00)</p>
              </div>
            )}
            {quickInfoModal === "payment" && (
              <div className="space-y-1.5 text-slate-300">
                <p><strong>Total Payable:</strong> ${totalAmount.toLocaleString()} USD</p>
                <p><strong>Payment Status:</strong> {order.paymentStatus || "pending"}</p>
                <p><strong>Plan:</strong> 3-Installment Split / Direct Card</p>
              </div>
            )}
            {quickInfoModal === "request" && (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={specialReqText}
                  onChange={(e) => setSpecialReqText(e.target.value)}
                  className="w-full border border-white/10 rounded-lg p-2.5"
                />
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Special request saved");
                    setQuickInfoModal(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#C8A04F] text-[#080E1A] font-extrabold"
                >
                  Save Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
