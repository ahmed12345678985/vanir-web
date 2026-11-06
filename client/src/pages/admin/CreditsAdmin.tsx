import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  Coins, Search, TrendingUp, DollarSign, Users,
  ArrowUpRight, BarChart3, Plus, Sparkles, CheckCircle2,
  Gift, ShieldCheck, X
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function CreditsAdmin() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [customAmount, setCustomAmount] = useState<string>("100");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const utils = trpc.useUtils();
  const { data: usersData, isLoading } = trpc.users.list.useQuery({ limit: 100, offset: 0 });
  const users = usersData?.users || [];

  const addCreditsMutation = trpc.aiStudio.addCredits.useMutation({
    onSuccess: (data, variables) => {
      toast.success(`تم بنجاح إضافة ${variables.amount} نقطة! الرصيد الجديد: ${data.balance}`);
      utils.users.list.invalidate();
      utils.aiStudio.getCredits.invalidate();
      setShowModal(false);
      setIsSubmitting(false);
    },
    onError: (err) => {
      toast.error(`حدث خطأ أثناء إضافة الرصيد: ${err.message}`);
      setIsSubmitting(false);
    },
  });

  const handleQuickAdd = (targetUserId: number, amount: number) => {
    setIsSubmitting(true);
    addCreditsMutation.mutate({
      userId: targetUserId,
      amount,
      reason: "bonus",
    });
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(customAmount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("يرجى إدخال عدد نقاط صحيح أكبر من صفر");
      return;
    }
    if (!selectedUser) return;
    setIsSubmitting(true);
    addCreditsMutation.mutate({
      userId: selectedUser.id,
      amount: amountNum,
      reason: "bonus",
    });
  };

  const totalCredits = users.reduce((sum: number, u: any) => sum + (u.credits || 0), 0);
  const activeUsers = users.filter((u: any) => (u.credits || 0) > 0).length;

  const filtered = users.filter((u: any) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Coins className="text-[var(--theme-primary)]" size={26} />
            إدارة نقاط الذكاء الاصطناعي (AI Credits)
          </h1>
          <p className="text-white/50 text-sm mt-1">
            شحن وإدارة أرصدة المستخدمين ومسؤولي الموقع لتوليد الصور والشات الذكي
          </p>
        </div>

        {/* Quick Admin Self-Recharge */}
        {currentUser && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleQuickAdd(currentUser.id, 1000)}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[var(--theme-primary)] to-[#c59a42] text-black font-semibold hover:opacity-95 text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-lg shadow-[var(--theme-primary)]/10"
            >
              <Sparkles size={14} />
              شحن رصيدي (+1,000 نقطة)
            </Button>
            <Button
              onClick={() => handleQuickAdd(currentUser.id, 5000)}
              disabled={isSubmitting}
              variant="outline"
              className="border-[var(--theme-primary)]/40 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10 text-xs h-9 px-4 rounded-xl"
            >
              +5,000 نقطة
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={18} className="text-[var(--theme-primary)]" />
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUpRight size={10} /> نشط
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{totalCredits.toLocaleString()}</p>
          <p className="text-xs text-white/50 mt-1">إجمالي النقاط الموزعة</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Users size={18} className="text-blue-400" />
            <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
              حسابات نشطة
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{activeUsers}</p>
          <p className="text-xs text-white/50 mt-1">مستخدمين لديهم رصيد</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {users.length > 0 ? Math.round(totalCredits / users.length) : 0}
          </p>
          <p className="text-xs text-white/50 mt-1">متوسط الرصيد لكل حساب</p>
        </div>
        <div className="bg-[var(--theme-surface)] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 size={18} className="text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400">{users.length}</p>
          <p className="text-xs text-white/50 mt-1">إجمالي المستخدمين المسجلين</p>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[var(--theme-surface)] border-white/10 text-white pr-10 rounded-xl"
            placeholder="البحث باسم المستخدم أو البريد الإلكتروني..."
          />
        </div>
      </div>

      {/* Users Credits Table */}
      <div className="bg-[var(--theme-surface)] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[var(--theme-primary)]" />
            <p className="text-sm font-semibold text-white">قائمة المستخدمين والأرصدة الحالية</p>
          </div>
          <span className="text-xs text-white/40">{filtered.length} مستخدم</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-white/40">جاري تحميل بيانات الأرصدة...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-white/40">لا يوجد مستخدمين مطابقين للبحث</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-white/5 text-xs text-white/40 bg-white/[0.01]">
                  <th className="p-3.5">المستخدم</th>
                  <th className="p-3.5">البريد الإلكتروني</th>
                  <th className="p-3.5">نوع الحساب</th>
                  <th className="p-3.5">الرصيد الحالي</th>
                  <th className="p-3.5 text-center">شحن رصيد سريع</th>
                  <th className="p-3.5 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((user: any) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--theme-primary)]/20 to-[var(--theme-primary)]/5 border border-[var(--theme-primary)]/30 flex items-center justify-center font-bold text-xs text-[var(--theme-primary)]">
                          {(user.name || "U")[0]}
                        </div>
                        <div>
                          <span className="text-sm text-white font-medium block">{user.name || "مستخدم"}</span>
                          <span className="text-[10px] text-white/30">ID: #{user.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-sm text-white/60" dir="ltr">{user.email || "-"}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium inline-flex items-center gap-1 ${
                        user.role === "admin"
                          ? "bg-[var(--theme-primary)]/15 text-[var(--theme-primary)] border border-[var(--theme-primary)]/30"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}>
                        {user.role === "admin" ? "مسؤول (Admin)" : "عميل مسجل"}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <Coins size={14} className="text-[var(--theme-primary)]" />
                        <span className="text-sm font-bold text-white">{user.credits ?? 0}</span>
                        <span className="text-[10px] text-white/40">نقطة</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleQuickAdd(user.id, 50)}
                          disabled={isSubmitting}
                          className="px-2.5 py-1 rounded-lg text-xs bg-white/5 hover:bg-[var(--theme-primary)]/20 text-white/70 hover:text-[var(--theme-primary)] border border-white/10 transition-all font-medium"
                        >
                          +50
                        </button>
                        <button
                          onClick={() => handleQuickAdd(user.id, 100)}
                          disabled={isSubmitting}
                          className="px-2.5 py-1 rounded-lg text-xs bg-white/5 hover:bg-[var(--theme-primary)]/20 text-white/70 hover:text-[var(--theme-primary)] border border-white/10 transition-all font-medium"
                        >
                          +100
                        </button>
                        <button
                          onClick={() => handleQuickAdd(user.id, 500)}
                          disabled={isSubmitting}
                          className="px-2.5 py-1 rounded-lg text-xs bg-white/5 hover:bg-[var(--theme-primary)]/20 text-white/70 hover:text-[var(--theme-primary)] border border-white/10 transition-all font-medium"
                        >
                          +500
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5 text-left">
                      <Button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                        size="sm"
                        variant="ghost"
                        className="text-xs text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10 h-8 px-3 rounded-lg"
                      >
                        <Gift size={13} className="ml-1" />
                        شحن مخصص
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Credit Grant Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#12121a] border border-[var(--theme-primary)]/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-right">
            <button
              onClick={() => setShowModal(false)}
              className="absolute left-4 top-4 text-white/40 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary)]/15 border border-[var(--theme-primary)]/30 flex items-center justify-center">
                <Coins size={20} className="text-[var(--theme-primary)]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">شحن رصيد ذكاء اصطناعي</h3>
                <p className="text-xs text-white/40">إضافة نقاط توليد للمستخدم</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-3.5 mb-5 border border-white/5 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/50">المستخدم:</span>
                <span className="text-white font-medium">{selectedUser.name || "مستخدم"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">البريد:</span>
                <span className="text-white/80 font-mono">{selectedUser.email || "-"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">الرصيد الحالي:</span>
                <span className="text-[var(--theme-primary)] font-bold">{selectedUser.credits ?? 0} نقطة</span>
              </div>
            </div>

            <form onSubmit={handleCustomAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-2">
                  عدد النقاط المراد إضافتها:
                </label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="bg-black/40 border-white/15 text-white text-lg font-bold text-center h-12 rounded-xl focus:border-[var(--theme-primary)]"
                  placeholder="مثلاً: 100"
                  required
                />
              </div>

              {/* Quick Select Chips */}
              <div className="flex items-center justify-center gap-2">
                {[50, 100, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCustomAmount(amt.toString())}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      customAmount === amt.toString()
                        ? "bg-[var(--theme-primary)] text-black border-[var(--theme-primary)]"
                        : "bg-white/5 text-white/60 border-white/10 hover:border-white/20"
                    }`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-[var(--theme-primary)] to-[#c59a42] text-black font-bold h-11 rounded-xl shadow-lg shadow-[var(--theme-primary)]/20"
                >
                  <CheckCircle2 size={16} className="ml-1.5" />
                  {isSubmitting ? "جاري الإضافة..." : `تأكيد إضافة ${customAmount} نقطة`}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowModal(false)}
                  variant="outline"
                  className="border-white/10 text-white/70 h-11 rounded-xl"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
