import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Database, Trash2, Search, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function DatabaseManagerAdmin() {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: collections, isLoading: isLoadingCols, refetch: refetchCols } = trpc.databaseManager.listCollections.useQuery();

  useEffect(() => {
    if (!selectedCollection && collections && collections.length > 0) {
      setSelectedCollection(collections[0].id);
    }
  }, [collections, selectedCollection]);
  
  const { 
    data: documentsData, 
    isLoading: isLoadingDocs, 
    refetch: refetchDocs 
  } = trpc.databaseManager.getDocuments.useQuery(
    { collectionName: selectedCollection || "", limit: 100 },
    { enabled: !!selectedCollection }
  );
  
  const deleteMutation = trpc.databaseManager.deleteDocument.useMutation({
    onSuccess: () => {
      toast.success("تم حذف السجل بنجاح");
      refetchDocs();
      refetchCols();
    },
    onError: (err) => {
      toast.error(`خطأ في الحذف: ${err.message}`);
    }
  });

  const handleDelete = (docId: string) => {
    if (!selectedCollection) return;
    if (confirm("هل أنت متأكد من حذف هذا السجل بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء.")) {
      deleteMutation.mutate({ collectionName: selectedCollection, documentId: docId });
    }
  };

  const docs = documentsData?.documents || [];
  
  // Basic filtering for demonstration
  const filteredDocs = docs.filter(doc => 
    JSON.stringify(doc).toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Extract all unique keys from documents for table headers
  const allKeys = Array.from(new Set(docs.flatMap(doc => Object.keys(doc)))).filter(k => k !== "_id");

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="text-[var(--theme-primary)]" size={24} />
            إدارة قاعدة البيانات (Live Database)
          </h1>
          <p className="text-white/50 text-sm mt-1">
            عوضاً عن Drizzle Studio، تتيح لك هذه الأداة الاتصال بقاعدة بيانات Firebase الحية.
          </p>
        </div>
        <button 
          onClick={() => { refetchCols(); refetchDocs(); }}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
          title="تحديث البيانات"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Collections Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
          <h2 className="text-sm font-semibold text-white/70 mb-3 px-2 uppercase tracking-wider">
            الجداول (Collections)
          </h2>
          {isLoadingCols ? (
            <div className="p-4 text-center text-white/40">جاري التحميل...</div>
          ) : (
            <div className="bg-[var(--theme-surface)] border border-white/5 rounded-xl overflow-hidden">
              {collections?.map(col => (
                <button
                  key={col.id}
                  onClick={() => setSelectedCollection(col.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors border-b border-white/5 last:border-0 ${
                    selectedCollection === col.id 
                      ? "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border-l-2 border-l-[var(--theme-primary)]" 
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="font-mono">{col.id}</span>
                  {col.hasDocuments ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500/50" title="يحتوي بيانات" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-white/10" title="فارغ" />
                  )}
                </button>
              ))}
            </div>
          )}
          
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs text-yellow-200 flex gap-2 items-start">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <p>أي تعديل أو حذف هنا ينعكس فوراً على الموقع الحي. يرجى الحذر الشديد!</p>
          </div>
        </div>

        {/* Data Table Area */}
        <div className="flex-1 bg-[var(--theme-surface)] border border-white/5 rounded-xl overflow-hidden flex flex-col min-h-[500px]">
          {!selectedCollection ? (
            <div className="flex-1 flex flex-col items-center justify-center text-white/40">
              <Database size={48} className="mb-4 opacity-20" />
              <p>اختر جدولاً من القائمة الجانبية لعرض البيانات</p>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between bg-black/20">
                <h3 className="font-mono text-[var(--theme-primary)] font-bold tracking-wider">
                  {selectedCollection}
                </h3>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                  <input 
                    type="text" 
                    placeholder="بحث في السجلات..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pr-9 pl-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--theme-primary)]/50 transition-colors"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto">
                {isLoadingDocs ? (
                  <div className="p-8 text-center text-white/40">جاري تحميل البيانات...</div>
                ) : filteredDocs.length === 0 ? (
                  <div className="p-8 text-center text-white/40">لا توجد بيانات مطابقة في هذا الجدول.</div>
                ) : (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-black/40 text-white/60 font-mono text-xs uppercase sticky top-0 backdrop-blur-md z-10">
                      <tr>
                        <th className="px-4 py-3 font-medium">_id</th>
                        {allKeys.map(key => (
                          <th key={key} className="px-4 py-3 font-medium">{key}</th>
                        ))}
                        <th className="px-4 py-3 text-right font-medium">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredDocs.map((doc, i) => (
                        <tr key={doc._id || i} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-4 py-3 font-mono text-xs text-[var(--theme-primary)]/70">
                            {doc._id}
                          </td>
                          {allKeys.map(key => {
                            const val = doc[key];
                            let displayVal = val;
                            if (val === null || val === undefined) displayVal = <span className="text-white/20">null</span>;
                            else if (typeof val === 'object') displayVal = <span className="text-white/40 text-xs">{"{...}"}</span>;
                            else if (typeof val === 'boolean') displayVal = <span className={val ? "text-emerald-400" : "text-red-400"}>{val.toString()}</span>;
                            
                            return (
                              <td key={key} className="px-4 py-3 text-white/80 max-w-[200px] truncate" title={String(val)}>
                                {displayVal}
                              </td>
                            );
                          })}
                          <td className="px-4 py-3 text-right">
                            <button 
                              onClick={() => handleDelete(doc._id as string)}
                              className="p-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                              title="حذف السجل"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="p-3 border-t border-white/5 bg-black/20 text-xs text-white/40 text-center">
                يعرض أول 100 سجل فقط. {filteredDocs.length} من {docs.length} معروضة.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
