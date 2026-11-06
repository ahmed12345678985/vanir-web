import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Activity, HardDrive, Cpu, FolderOpen, FileText, Trash2, 
  RefreshCw, Server, AlertCircle, Clock, Database, ChevronRight, Folder
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SystemMonitorAdmin() {
  const { data: stats, refetch: refetchStats, isLoading: statsLoading } = trpc.serverMonitor.getStats.useQuery();
  const [currentFolder, setCurrentFolder] = useState<string>("");
  const { data: files, refetch: refetchFiles, isLoading: filesLoading } = trpc.fileManager.listFiles.useQuery({ folder: currentFolder });
  const deleteFileMut = trpc.fileManager.deleteFile.useMutation();

  const handleRefresh = () => {
    refetchStats();
    refetchFiles();
    toast.success("تم التحديث");
  };

  const handleDeleteFile = async (path: string) => {
    if (!confirm(`هل أنت متأكد من حذف ${path}؟`)) return;
    try {
      await deleteFileMut.mutateAsync({ path });
      toast.success("تم حذف الملف بنجاح");
      refetchFiles();
    } catch (err: any) {
      toast.error(`فشل الحذف: ${err.message}`);
    }
  };

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success("تم مسح ذاكرة التخزين المؤقت للمتصفح");
    setTimeout(() => window.location.reload(), 1000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Server className="w-6 h-6 text-[var(--theme-primary)]" />
            مراقبة النظام ومدير الملفات
          </h1>
          <p className="text-white/50 mt-1">حالة الخادم، الذاكرة، وملفات النظام المباشرة</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleClearCache} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
            <Trash2 className="w-4 h-4 ml-2" /> مسح الكاش
          </Button>
          <Button onClick={handleRefresh} className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-accent)]">
            <RefreshCw className="w-4 h-4 ml-2" /> تحديث البيانات
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-black/40 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/60 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              حالة المعالج (CPU)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? <div className="animate-pulse h-8 bg-white/5 rounded" /> : (
              <div>
                <p className="text-2xl font-bold text-white">{stats?.cpus?.length || 0} Cores</p>
                <p className="text-xs text-white/40 mt-1 truncate" title={stats?.cpus?.[0]?.model}>
                  {stats?.cpus?.[0]?.model || "Unknown"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/60 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-purple-400" />
              الذاكرة (RAM)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? <div className="animate-pulse h-8 bg-white/5 rounded" /> : (
              <div>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold text-white">{formatBytes(stats?.totalMem - stats?.freeMem)}</p>
                  <p className="text-sm text-white/40 mb-1">/ {formatBytes(stats?.totalMem)}</p>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-purple-400 h-full rounded-full" 
                    style={{ width: `${((stats?.totalMem - stats?.freeMem) / stats?.totalMem) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/60 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              استهلاك التطبيق (Node)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? <div className="animate-pulse h-8 bg-white/5 rounded" /> : (
              <div>
                <p className="text-2xl font-bold text-white">{formatBytes(stats?.processMem?.rss || 0)}</p>
                <p className="text-xs text-white/40 mt-1">Heap: {formatBytes(stats?.processMem?.heapUsed || 0)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/60 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              مدة التشغيل (Uptime)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? <div className="animate-pulse h-8 bg-white/5 rounded" /> : (
              <div>
                <p className="text-2xl font-bold text-white">{formatUptime(stats?.uptime || 0)}</p>
                <p className="text-xs text-white/40 mt-1">OS: {formatUptime(stats?.osUptime || 0)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* File Manager */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader className="border-b border-white/10 pb-4">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-[var(--theme-primary)]" />
            مدير الملفات (Public Directory)
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-white/50 mt-4 bg-white/5 p-2 rounded-lg">
            <Folder className="w-4 h-4" />
            <button 
              onClick={() => setCurrentFolder("")} 
              className="hover:text-white transition-colors"
            >
              public/
            </button>
            {currentFolder && currentFolder.split('/').map((part, i, arr) => (
              <span key={i} className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3 mx-1" />
                <button 
                  onClick={() => setCurrentFolder(arr.slice(0, i + 1).join('/'))}
                  className="hover:text-white transition-colors"
                >
                  {part}
                </button>
              </span>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filesLoading ? (
            <div className="p-8 text-center text-white/40">جاري تحميل الملفات...</div>
          ) : files && files.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-sm text-white/60">
                  <th className="p-4 text-right font-medium">الاسم</th>
                  <th className="p-4 text-right font-medium">النوع</th>
                  <th className="p-4 text-right font-medium">الحجم</th>
                  <th className="p-4 text-right font-medium">آخر تعديل</th>
                  <th className="p-4 text-left font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {files.map((file) => (
                  <tr key={file.path} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {file.isDirectory ? (
                          <FolderOpen className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <FileText className="w-5 h-5 text-blue-400" />
                        )}
                        {file.isDirectory ? (
                          <button 
                            onClick={() => setCurrentFolder(file.path)}
                            className="text-white hover:text-[var(--theme-primary)] transition-colors text-sm font-medium"
                          >
                            {file.name}
                          </button>
                        ) : (
                          <span className="text-white text-sm">{file.name}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-white/50 text-sm">{file.isDirectory ? "مجلد" : "ملف"}</td>
                    <td className="p-4 text-white/50 text-sm">{file.isDirectory ? "--" : formatBytes(file.size)}</td>
                    <td className="p-4 text-white/50 text-sm" dir="ltr">{new Date(file.lastModified).toLocaleDateString()}</td>
                    <td className="p-4 text-left">
                      {!file.isDirectory && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteFile(file.path)}
                          className="text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/50">لا توجد ملفات في هذا المجلد</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
