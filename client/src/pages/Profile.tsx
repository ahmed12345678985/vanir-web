import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { PHARAONIC_AVATARS, resolveUserAvatar } from "@/lib/pharaonicAvatars";
import { Button } from "@/components/ui/button";
import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { User, Mail, Phone, Calendar, Shield, MapPin, Star, Compass, CreditCard, Clock, Edit3, LogOut, ChevronRight, Camera, Plane, MessageSquare, Zap, Settings, Bell, Heart, Award, X, Check, Loader2, Upload } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";

const LOGO_URL = "/logo-vanir-v2.png";

/* ─── Edit Profile Dialog ─── */
function EditProfileDialog({
  user,
  onClose,
  onSave,
  isSaving,
}: {
  user: { name?: string | null; phone?: string | null; avatarUrl?: string | null };
  onClose: () => void;
  onSave: (data: { name?: string; phone?: string | null; avatarUrl?: string | null }) => void;
  isSaving: boolean;
}) {
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.uploads.upload.useMutation();

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    let finalAvatarUrl: string | null | undefined = undefined;

    // Upload avatar if a new file was selected
    if (avatarFile) {
      try {
        setUploadingAvatar(true);
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(",")[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(avatarFile);
        });

        const uploaded = await uploadMutation.mutateAsync({
          fileData: base64,
          filename: avatarFile.name,
          mimeType: avatarFile.type,
          purpose: "avatar",
        });
        finalAvatarUrl = uploaded.url;
      } catch {
        toast.error("Failed to upload avatar. Please try again.");
        setUploadingAvatar(false);
        return;
      } finally {
        setUploadingAvatar(false);
      }
    } else if (avatarPreview && avatarPreview !== user.avatarUrl) {
      // User picked a Royal Pharaonic Avatar preset
      finalAvatarUrl = avatarPreview;
    } else if (avatarPreview === null && user.avatarUrl) {
      // User removed their avatar
      finalAvatarUrl = null;
    }

    const updateData: { name?: string; phone?: string | null; avatarUrl?: string | null } = {};
    if (name.trim() && name.trim() !== (user.name || "")) updateData.name = name.trim();
    if (phone.trim() !== (user.phone || "")) updateData.phone = phone.trim() || null;
    if (finalAvatarUrl !== undefined) updateData.avatarUrl = finalAvatarUrl;

    if (Object.keys(updateData).length === 0) {
      toast.info("No changes to save");
      onClose();
      return;
    }

    onSave(updateData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-[var(--card)] border border-[#2a2a3e] rounded-2xl w-full max-w-md shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a3e]">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-[var(--theme-primary)]" />
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#2a2a3e] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#3a3a4e] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[var(--theme-primary)]/30">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--theme-primary)] to-[#c49a48] flex items-center justify-center">
                    <span className="text-3xl font-bold text-black">
                      {(name || user.name || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-[var(--theme-primary)] rounded-lg flex items-center justify-center shadow-lg hover:bg-[#c49a48] transition-colors"
              >
                <Camera className="w-4 h-4 text-black" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
            />
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-[var(--theme-primary)] hover:text-[var(--theme-primary-light)] transition-colors flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                Upload Photo
              </button>
              {avatarPreview && (
                <button
                  onClick={handleRemoveAvatar}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Remove
                </button>
              )}
            </div>

            {/* Royal Pharaonic Avatar Picker */}
            <div className="w-full pt-2 border-t border-white/10">
              <p className="text-[11px] font-semibold text-[#D4A853] mb-2 text-center">
                Or Choose a Royal Pharaonic Avatar · اختر أفتار فرعوني ملكي
              </p>
              <div className="grid grid-cols-6 gap-2">
                {PHARAONIC_AVATARS.map((av) => {
                  const isSelected = avatarPreview === av.url;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      title={`${av.name} — ${av.nameAr}`}
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(av.url);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                        isSelected
                          ? "border-[#E5C17A] ring-2 ring-[#D4A853]/50 scale-105"
                          : "border-white/15 hover:border-[#D4A853]/60 opacity-85 hover:opacity-100"
                      }`}
                    >
                      <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-[#0d0d1a] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[var(--theme-primary)]/50 transition-colors"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +20 123 456 7890"
              className="w-full bg-[#0d0d1a] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[var(--theme-primary)]/50 transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#2a2a3e]">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-[#2a2a3e] bg-transparent text-gray-400 hover:bg-[#2a2a3e] hover:text-white rounded-xl px-5 py-2.5 text-sm"
            disabled={isSaving || uploadingAvatar}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[var(--theme-primary)] hover:bg-[#c49a48] text-black rounded-xl px-5 py-2.5 text-sm font-semibold"
            disabled={isSaving || uploadingAvatar}
          >
            {isSaving || uploadingAvatar ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {uploadingAvatar ? "Uploading..." : "Saving..."}
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface SavedTraveler {
  id: string;
  fullName: string;
  passportNumber: string;
  nationality: string;
  dob: string;
}

interface FlightPrefs {
  seatType: "Window" | "Aisle" | "Extra Legroom" | "First / Suite";
  planeArea: "Front Cabin" | "Middle Cabin" | "Exit Row";
  baggage: "Carry-on only (8kg)" | "1 Checked Bag (23kg)" | "2 VIP Bags (32kg each)";
}

type ProfileSection =
  | "overview"
  | "bookings"
  | "travelers"
  | "flight_preferences"
  | "privacy"
  | "reviews"
  | "ai"
  | "settings";

/* ─── Main Profile Page ─── */
export default function Profile() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState<ProfileSection>(() => {
    if (typeof window !== "undefined") {
      const t = new URLSearchParams(window.location.search).get("tab");
      if (t === "trips" || t === "bookings") return "bookings";
      if (t === "travelers") return "travelers";
      if (t === "flight_preferences") return "flight_preferences";
      if (t === "privacy") return "privacy";
      if (t === "settings") return "settings";
      if (t === "reviews") return "reviews";
      if (t === "ai") return "ai";
    }
    return "overview";
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Saved Travelers State
  const [savedTravelers, setSavedTravelers] = useState<SavedTraveler[]>(() => {
    try {
      const raw = localStorage.getItem("vanir_saved_travelers");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [addingTraveler, setAddingTraveler] = useState(false);
  const [newTraveler, setNewTraveler] = useState({ fullName: "", passportNumber: "", nationality: "", dob: "" });

  // Flight Preferences State
  const [flightPrefs, setFlightPrefs] = useState<FlightPrefs>(() => {
    try {
      const raw = localStorage.getItem("vanir_flight_preferences");
      return raw
        ? JSON.parse(raw)
        : { seatType: "Window", planeArea: "Front Cabin", baggage: "1 Checked Bag (23kg)" };
    } catch {
      return { seatType: "Window", planeArea: "Front Cabin", baggage: "1 Checked Bag (23kg)" };
    }
  });
  const [editingFlightPrefs, setEditingFlightPrefs] = useState(false);

  // Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem("vanir_notif_prefs");
      return raw
        ? JSON.parse(raw)
        : { "Email Notifications": true, "Marketing Emails": true, "Wishlist Alerts": true };
    } catch {
      return { "Email Notifications": true, "Marketing Emails": true, "Wishlist Alerts": true };
    }
  });

  useEffect(() => {
    const syncTab = () => {
      const t = new URLSearchParams(window.location.search).get("tab");
      if (t === "trips" || t === "bookings") setActiveSection("bookings");
      else if (t === "travelers") setActiveSection("travelers");
      else if (t === "flight_preferences") setActiveSection("flight_preferences");
      else if (t === "privacy") setActiveSection("privacy");
      else if (t === "settings") setActiveSection("settings");
    };
    window.addEventListener("popstate", syncTab);
    return () => window.removeEventListener("popstate", syncTab);
  }, []);

  const utils = trpc.useUtils();

  // Fetch profile stats
  const { data: profileStats } = trpc.users.profileStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch user bookings
  const { data: userBookings } = trpc.bookings.myBookings.useQuery(undefined, {
    enabled: isAuthenticated && activeSection === "bookings",
  });

  // Fetch user reviews
  const { data: userReviews } = trpc.reviews.myReviews.useQuery(undefined, {
    enabled: isAuthenticated && activeSection === "reviews",
  });

  // Update profile mutation
  const updateProfileMutation = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      utils.auth.me.invalidate();
      utils.users.profile.invalidate();
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const handleSaveProfile = useCallback(
    (data: { name?: string; phone?: string | null; avatarUrl?: string | null }) => {
      updateProfileMutation.mutate(data);
    },
    [updateProfileMutation]
  );

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-[var(--theme-primary)] border-t-transparent animate-spin" />
            <p className="text-gray-400 text-sm">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#0d0d1a]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-20 h-20 rounded-full bg-[var(--card)] border border-[var(--theme-primary)]/20 flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-[var(--theme-primary)]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Sign In Required</h2>
            <p className="text-gray-400 mb-6">Please sign in to view your profile and manage your account.</p>
            <Button
              onClick={() => setLocation("/login")}
              className="bg-[var(--theme-primary)] hover:bg-[#c49a48] text-black font-semibold px-8 py-3 rounded-xl"
            >
              Sign In
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const sidebarItems = [
    { id: "overview" as const, label: "Overview", iconImg: "/icons/travel-3d/CameraHat.webp" },
    { id: "bookings" as const, label: "My Trips & Bookings", iconImg: "/icons/travel-3d/PlaneInBottle.webp" },
    { id: "settings" as const, label: "Account Settings", iconImg: "/icons/travel-3d/NotificationBell.webp" },
    { id: "travelers" as const, label: "Saved Travelers", iconImg: "/icons/travel-3d/PassporteVisa.webp" },
    { id: "flight_preferences" as const, label: "Flight Preferences", iconImg: "/icons/travel-3d/SeatingEmpty.webp" },
    { id: "privacy" as const, label: "Privacy & Security", iconImg: "/icons/travel-3d/SecurityShield.webp" },
    { id: "reviews" as const, label: "My Reviews", iconImg: "/icons/travel-3d/BadgeCheck.webp" },
    { id: "ai" as const, label: "AI Studio", iconImg: "/icons/travel-3d/MobileeSim.webp" },
  ];

  const stats = profileStats || { bookings: 0, reviews: 0, aiCredits: 0 };

  return (
    <div className="min-h-screen bg-[#0d0d1a]">
      <PageMeta
        title="My Profile | VANIR GROUP"
        description="Manage your VANIR GROUP profile, view your bookings, and access your travel history."
        keywords="profile, my account, travel history, bookings"
        canonicalPath="/profile"
        noIndex={true}
      />
      <Navbar />

      {/* Edit Profile Dialog */}
      {editDialogOpen && (
        <EditProfileDialog
          user={user}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleSaveProfile}
          isSaving={updateProfileMutation.isPending}
        />
      )}

      {/* Hero Banner */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0d0d1a] to-[#1a1a2e]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #D4A853 1px, transparent 1px), radial-gradient(circle at 80% 20%, #D4A853 1px, transparent 1px), radial-gradient(circle at 60% 80%, #D4A853 1px, transparent 1px)`,
            backgroundSize: '100px 100px, 150px 150px, 120px 120px'
          }} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0d0d1a] to-transparent" />
      </div>

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10 pb-20">
        {/* Profile Header Card */}
        <div className="bg-[var(--card)]/80 backdrop-blur-xl border border-[#2a2a3e] rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-[#D4A853]/50 shadow-lg shadow-[#D4A853]/15">
                <img
                  src={resolveUserAvatar(user.avatarUrl, user.email || user.name)}
                  alt={user.name || "User"}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => setEditDialogOpen(true)}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-[var(--theme-primary)] rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <Camera className="w-4 h-4 text-black" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {user.name || "VANIR Traveler"}
                </h1>
                {user.role === "admin" && (
                  <span className="px-2.5 py-0.5 bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30 rounded-lg text-[var(--theme-primary)] text-xs font-semibold flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Admin
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mt-2">
                {user.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[var(--theme-primary)]/60" />
                    {user.email}
                  </span>
                )}
                {user.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[var(--theme-primary)]/60" />
                    {user.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[var(--theme-primary)]/60" />
                  Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => setEditDialogOpen(true)}
                variant="outline"
                className="border-[var(--theme-primary)]/30 bg-transparent text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10 hover:text-[var(--theme-primary-light)] rounded-xl px-4 py-2 text-sm"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-500/20 bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl px-4 py-2 text-sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: "Bookings", value: stats.bookings, icon: Plane, color: "#D4A853" },
              { label: "Reviews", value: stats.reviews, icon: Star, color: "#34D399" },
              { label: "AI Credits", value: stats.aiCredits, icon: Zap, color: "#818CF8" },
              { label: "Member Level", value: stats.bookings >= 10 ? "Gold" : stats.bookings >= 5 ? "Silver" : "Bronze", icon: Award, color: "#F59E0B" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#0d0d1a]/60 border border-[#2a2a3e] rounded-xl p-4 text-center hover:border-[var(--theme-primary)]/20 transition-colors"
              >
                <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: stat.color }} />
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="md:w-56 shrink-0">
            <div className="bg-[var(--card)]/80 backdrop-blur-xl border border-[#2a2a3e] rounded-2xl p-2 sticky top-24">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeSection === item.id
                      ? "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20"
                      : "text-gray-400 hover:text-white hover:bg-[#2a2a3e]/50"
                  }`}
                >
                  <img src={item.iconImg} alt="" className="w-5 h-5 object-contain shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {/* Overview Section */}
            {activeSection === "overview" && (
              <div className="space-y-6">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-[var(--theme-primary)]/10 to-[#1a1a2e] border border-[var(--theme-primary)]/20 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--theme-primary)]/10 flex items-center justify-center shrink-0">
                      <Compass className="w-6 h-6 text-[var(--theme-primary)]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Welcome back, {(user.name || "Traveler").split(" ")[0]}!
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Explore Egypt's wonders with VANIR Group. Your next adventure awaits.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[var(--card)]/80 backdrop-blur-xl border border-[#2a2a3e] rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { label: "Book a Trip", icon: Plane, href: "/booking", color: "#D4A853" },
                      { label: "AI Image Studio", icon: Compass, href: "/ai-studio", color: "#818CF8" },
                      { label: "Write a Review", icon: Star, href: "/reviews", color: "#34D399" },
                      { label: "Browse Gallery", icon: Camera, href: "/gallery", color: "#F472B6" },
                      { label: "View Offers", icon: CreditCard, href: "/offers", color: "#FB923C" },
                      { label: "Explore Destinations", icon: MapPin, href: "/destinations", color: "#38BDF8" },
                    ].map((action) => (
                      <button
                        key={action.label}
                        onClick={() => setLocation(action.href)}
                        className="flex items-center gap-3 p-4 bg-[#0d0d1a]/60 border border-[#2a2a3e] rounded-xl hover:border-[var(--theme-primary)]/20 transition-all group text-left"
                      >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${action.color}15` }}>
                          <action.icon className="w-5 h-5" style={{ color: action.color }} />
                        </div>
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{action.label}</span>
                        <ChevronRight className="w-4 h-4 text-gray-600 ml-auto group-hover:text-[var(--theme-primary)] transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Account Info */}
                <div className="bg-[var(--card)]/80 backdrop-blur-xl border border-[#2a2a3e] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Account Information</h3>
                    <button
                      onClick={() => setEditDialogOpen(true)}
                      className="text-xs text-[var(--theme-primary)] hover:text-[var(--theme-primary-light)] transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: "Full Name", value: user.name || "Not set", icon: User },
                      { label: "Email Address", value: user.email || "Not set", icon: Mail },
                      { label: "Phone Number", value: user.phone || "Not set", icon: Phone },
                      { label: "Account Role", value: user.role === "admin" ? "Administrator" : "Member", icon: Shield },
                      { label: "Login Method", value: user.loginMethod || "OAuth", icon: Zap },
                      { label: "Last Sign In", value: user.lastSignedIn ? new Date(user.lastSignedIn).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A", icon: Clock },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-3 border-b border-[#2a2a3e]/50 last:border-0">
                        <div className="flex items-center gap-3">
                          <item.icon className="w-4 h-4 text-[var(--theme-primary)]/60" />
                          <span className="text-sm text-gray-400">{item.label}</span>
                        </div>
                        <span className="text-sm text-white font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bookings Section */}
            {activeSection === "bookings" && (
              <div className="bg-[var(--card)]/80 backdrop-blur-xl border border-[#2a2a3e] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">My Bookings</h3>
                  <Button
                    onClick={() => setLocation("/booking")}
                    className="bg-[var(--theme-primary)] hover:bg-[#c49a48] text-black text-sm rounded-xl px-4 py-2"
                  >
                    <Plane className="w-4 h-4 mr-2" />
                    New Booking
                  </Button>
                </div>
                {!userBookings || userBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Plane className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">No bookings yet</p>
                    <p className="text-gray-600 text-sm">Start your luxury travel journey with VANIR Group.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userBookings.map((booking: any) => (
                      <div key={booking.id} className="flex items-center gap-4 p-4 bg-[#0d0d1a]/60 border border-[#2a2a3e] rounded-xl hover:border-[var(--theme-primary)]/20 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-[var(--theme-primary)]/10 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-[var(--theme-primary)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{booking.packageName}</p>
                          <p className="text-xs text-gray-500">{booking.destination || "Egypt"} · {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : "TBD"}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                          booking.status === "confirmed" ? "bg-green-500/10 text-green-400" :
                          booking.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                          "bg-gray-500/10 text-gray-400"
                        }`}>
                          {booking.status || "pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews Section */}
            {activeSection === "reviews" && (
              <div className="bg-[var(--card)]/80 backdrop-blur-xl border border-[#2a2a3e] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">My Reviews</h3>
                  <Button
                    onClick={() => setLocation("/reviews")}
                    className="bg-[var(--theme-primary)] hover:bg-[#c49a48] text-black text-sm rounded-xl px-4 py-2"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Write Review
                  </Button>
                </div>
                {!userReviews || userReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">No reviews yet</p>
                    <p className="text-gray-600 text-sm">Share your travel experience with the VANIR community.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userReviews.map((review: any) => (
                      <div key={review.id} className="p-4 bg-[#0d0d1a]/60 border border-[#2a2a3e] rounded-xl hover:border-[var(--theme-primary)]/20 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-white">{review.tripName}</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-[var(--theme-primary)] fill-[var(--theme-primary)]" : "text-gray-600"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">{review.content}</p>
                        <p className="text-xs text-gray-600 mt-2">{review.destination} · {review.travelDate ? new Date(review.travelDate).toLocaleDateString() : ""}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* AI Studio Section */}
            {activeSection === "ai" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-[#818CF8]/10 to-[#1a1a2e] border border-[#818CF8]/20 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#818CF8]/10 flex items-center justify-center shrink-0">
                      <Compass className="w-6 h-6 text-[#818CF8]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">AI Studio</h3>
                      <p className="text-gray-400 text-sm mb-4">Generate stunning images and videos with AI.</p>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => setLocation("/ai-studio")}
                          className="bg-[#818CF8] hover:bg-[#6366F1] text-white text-sm rounded-xl px-4 py-2"
                        >
                          <Compass className="w-4 h-4 mr-2" />
                          Open AI Studio
                        </Button>
                        <Button
                          onClick={() => setLocation("/ai-dashboard")}
                          variant="outline"
                          className="border-[#818CF8]/30 bg-transparent text-[#818CF8] hover:bg-[#818CF8]/10 text-sm rounded-xl px-4 py-2"
                        >
                          View Dashboard
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--card)]/80 backdrop-blur-xl border border-[#2a2a3e] rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">AI Credits</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#0d0d1a]/60 border border-[#2a2a3e] rounded-xl text-center">
                      <Zap className="w-5 h-5 text-[var(--theme-primary)] mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{stats.aiCredits}</p>
                      <p className="text-xs text-gray-500">Available Credits</p>
                    </div>
                    <div className="p-4 bg-[#0d0d1a]/60 border border-[#2a2a3e] rounded-xl text-center">
                      <CreditCard className="w-5 h-5 text-[#34D399] mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">Free</p>
                      <p className="text-xs text-gray-500">Current Plan</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setLocation("/ai-pricing")}
                    className="w-full mt-4 bg-transparent border border-[var(--theme-primary)]/30 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10 rounded-xl py-3 text-sm"
                  >
                    Upgrade Plan
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Settings Section */}
            {activeSection === "settings" && (
              <div className="space-y-6">
                <div className="bg-[var(--card)]/80 backdrop-blur-xl border border-[#2a2a3e] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Profile Settings</h3>
                    <Button
                      onClick={() => setEditDialogOpen(true)}
                      className="bg-[var(--theme-primary)] hover:bg-[#c49a48] text-black rounded-xl px-4 py-2 text-sm"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Display Name</label>
                      <div className="bg-[#0d0d1a] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm text-white">
                        {user.name || <span className="text-gray-600">Not set</span>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                      <div className="bg-[#0d0d1a] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm text-gray-500">
                        {user.email || "Not set"}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Email is managed through your login provider and cannot be changed here.</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                      <div className="bg-[#0d0d1a] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm text-white">
                        {user.phone || <span className="text-gray-600">Not set</span>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Profile Photo</label>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#2a2a3e]">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[var(--theme-primary)] to-[#c49a48] flex items-center justify-center">
                              <span className="text-lg font-bold text-black">{(user.name || "U").charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setEditDialogOpen(true)}
                          className="text-sm text-[var(--theme-primary)] hover:text-[var(--theme-primary-light)] transition-colors flex items-center gap-1.5"
                        >
                          <Camera className="w-4 h-4" />
                          Change Photo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="bg-[var(--card)]/80 backdrop-blur-xl border border-[#2a2a3e] rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Email Notifications", desc: "Receive booking confirmations and offers", icon: Bell },
                      { label: "Marketing Emails", desc: "Get updates about new destinations and deals", icon: Mail },
                      { label: "Wishlist Alerts", desc: "Notify when saved destinations have offers", icon: Heart },
                    ].map((pref) => (
                      <div key={pref.label} className="flex items-center justify-between py-3 border-b border-[#2a2a3e]/50 last:border-0">
                        <div className="flex items-center gap-3">
                          <pref.icon className="w-4 h-4 text-[var(--theme-primary)]/60" />
                          <div>
                            <p className="text-sm text-white">{pref.label}</p>
                            <p className="text-xs text-gray-500">{pref.desc}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...notifPrefs, [pref.label]: !notifPrefs[pref.label] };
                            setNotifPrefs(updated);
                            try { localStorage.setItem("vanir_notif_prefs", JSON.stringify(updated)); } catch {}
                            toast.success(`${pref.label} ${updated[pref.label] ? "enabled" : "disabled"}`);
                          }}
                          className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${
                            notifPrefs[pref.label] ? "bg-[var(--theme-primary)]/30" : "bg-white/10"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full absolute top-1 shadow-sm transition-all ${
                              notifPrefs[pref.label] ? "bg-[var(--theme-primary)] right-1" : "bg-gray-400 left-1"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-[var(--card)]/80 backdrop-blur-xl border border-red-500/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
                  <p className="text-sm text-gray-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                  <Button
                    onClick={() => toast.error("Account deletion is not available yet. Contact support.")}
                    variant="outline"
                    className="border-red-500/20 bg-transparent text-red-400 hover:bg-red-500/10 rounded-xl text-sm"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            )}

            {/* Saved Travelers Section */}
            {activeSection === "travelers" && (
              <div className="space-y-6">
                <div className="bg-[var(--card)]/80 border border-[#2a2a3e] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Saved Travelers</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Save passenger details for faster flight &amp; hotel bookings and automatic check-in.
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setAddingTraveler((p) => !p)}
                      className="bg-[var(--theme-primary)] text-black hover:bg-[#c49a48] text-xs font-semibold rounded-xl"
                    >
                      {addingTraveler ? "Cancel" : "Add a traveler"}
                    </Button>
                  </div>

                  {/* Account Owner Card */}
                  <div className="p-4 rounded-xl bg-[#0d0d1a] border border-[var(--theme-primary)]/25 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{user.name || "Vanir Traveler"}</p>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                        Account owner
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditDialogOpen(true)}
                      className="text-xs font-semibold text-[var(--theme-primary)] hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  {addingTraveler && (
                    <div className="p-4 rounded-xl bg-[#0d0d1a] border border-white/10 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Full Name (as on passport)"
                          value={newTraveler.fullName}
                          onChange={(e) => setNewTraveler((p) => ({ ...p, fullName: e.target.value }))}
                          className="bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="Passport Number"
                          value={newTraveler.passportNumber}
                          onChange={(e) => setNewTraveler((p) => ({ ...p, passportNumber: e.target.value }))}
                          className="bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="Nationality (e.g. Egyptian)"
                          value={newTraveler.nationality}
                          onChange={(e) => setNewTraveler((p) => ({ ...p, nationality: e.target.value }))}
                          className="bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                        />
                        <input
                          type="date"
                          value={newTraveler.dob}
                          onChange={(e) => setNewTraveler((p) => ({ ...p, dob: e.target.value }))}
                          className="bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          if (!newTraveler.fullName.trim()) {
                            toast.error("Please enter traveler's full name");
                            return;
                          }
                          const updated = [...savedTravelers, { ...newTraveler, id: `trav-${Date.now()}` }];
                          setSavedTravelers(updated);
                          try { localStorage.setItem("vanir_saved_travelers", JSON.stringify(updated)); } catch {}
                          setNewTraveler({ fullName: "", passportNumber: "", nationality: "", dob: "" });
                          setAddingTraveler(false);
                          toast.success("Traveler saved!");
                        }}
                        className="bg-[var(--theme-primary)] text-black hover:bg-[#c49a48] text-xs font-semibold"
                      >
                        Save Traveler
                      </Button>
                    </div>
                  )}

                  {savedTravelers.map((t) => (
                    <div key={t.id} className="p-4 rounded-xl bg-[#0d0d1a] border border-[#2a2a3e] flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{t.fullName}</p>
                        <p className="text-xs text-gray-400">
                          {t.nationality || "VIP Guest"} {t.passportNumber ? `• Passport: ${t.passportNumber}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = savedTravelers.filter((x) => x.id !== t.id);
                          setSavedTravelers(updated);
                          try { localStorage.setItem("vanir_saved_travelers", JSON.stringify(updated)); } catch {}
                          toast.success("Traveler removed");
                        }}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flight Preferences Section */}
            {activeSection === "flight_preferences" && (
              <div className="space-y-6">
                <div className="bg-[var(--card)]/80 border border-[#2a2a3e] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Flight Preferences</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Save your preferred seating and baggage options for faster flight checkouts.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingFlightPrefs((p) => !p)}
                      className="border-[var(--theme-primary)]/30 text-[var(--theme-primary)] text-xs rounded-xl"
                    >
                      {editingFlightPrefs ? "Done" : "Edit"}
                    </Button>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0d0d1a] border border-[#2a2a3e] space-y-2">
                    <div className="flex items-center gap-2.5">
                      <img src="/icons/travel-3d/SeatingEmpty.webp" alt="" className="w-6 h-6 object-contain" />
                      <p className="text-sm font-semibold text-white">Seating Preferences</p>
                    </div>
                    <p className="text-xs text-gray-400">
                      Current: <span className="text-[var(--theme-primary)]">{flightPrefs.seatType} • {flightPrefs.planeArea}</span>
                    </p>
                    {editingFlightPrefs && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <select
                          value={flightPrefs.seatType}
                          onChange={(e) => {
                            const next = { ...flightPrefs, seatType: e.target.value as FlightPrefs["seatType"] };
                            setFlightPrefs(next);
                            try { localStorage.setItem("vanir_flight_preferences", JSON.stringify(next)); } catch {}
                          }}
                          className="bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                        >
                          <option value="Window">Window Seat</option>
                          <option value="Aisle">Aisle Seat</option>
                          <option value="Extra Legroom">Extra Legroom</option>
                          <option value="First / Suite">First / Private Suite</option>
                        </select>
                        <select
                          value={flightPrefs.planeArea}
                          onChange={(e) => {
                            const next = { ...flightPrefs, planeArea: e.target.value as FlightPrefs["planeArea"] };
                            setFlightPrefs(next);
                            try { localStorage.setItem("vanir_flight_preferences", JSON.stringify(next)); } catch {}
                          }}
                          className="bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                        >
                          <option value="Front Cabin">Front Cabin</option>
                          <option value="Middle Cabin">Middle Cabin</option>
                          <option value="Exit Row">Exit Row</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-[#0d0d1a] border border-[#2a2a3e] space-y-2">
                    <div className="flex items-center gap-2.5">
                      <img src="/icons/travel-3d/CabinBagBundle.webp" alt="" className="w-6 h-6 object-contain" />
                      <p className="text-sm font-semibold text-white">Baggage Preferences</p>
                    </div>
                    <p className="text-xs text-gray-400">
                      Current: <span className="text-[var(--theme-primary)]">{flightPrefs.baggage}</span>
                    </p>
                    {editingFlightPrefs && (
                      <select
                        value={flightPrefs.baggage}
                        onChange={(e) => {
                          const next = { ...flightPrefs, baggage: e.target.value as FlightPrefs["baggage"] };
                          setFlightPrefs(next);
                          try { localStorage.setItem("vanir_flight_preferences", JSON.stringify(next)); } catch {}
                          toast.success("Flight preferences saved!");
                        }}
                        className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white mt-2"
                      >
                        <option value="Carry-on only (8kg)">Carry-on only (8kg)</option>
                        <option value="1 Checked Bag (23kg)">1 Checked Bag (23kg)</option>
                        <option value="2 VIP Bags (32kg each)">2 VIP Bags (32kg each)</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Security Section */}
            {activeSection === "privacy" && (
              <div className="space-y-6">
                <div className="bg-[var(--card)]/80 border border-[#2a2a3e] rounded-2xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white">Privacy &amp; Security</h3>
                  <div className="p-4 rounded-xl bg-[#0d0d1a] border border-[#2a2a3e]">
                    <p className="text-xs text-gray-400 mb-2">Sign-in Details</p>
                    <div className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                      {user.email}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0d0d1a] border border-[#2a2a3e] flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Active Session</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {typeof navigator !== "undefined" ? navigator.platform || "Web Browser" : "Web Browser"} • Active Now
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleLogout}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs rounded-xl"
                    >
                      Sign out
                    </Button>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0d0d1a] border border-[#2a2a3e]">
                    <p className="text-sm font-semibold text-white mb-1">Committed to Privacy</p>
                    <p className="text-xs text-gray-400">
                      Learn how we protect your personal travel data in our{" "}
                      <a href="/privacy-policy" className="text-[var(--theme-primary)] underline">
                        Privacy Policy
                      </a>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
