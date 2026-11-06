import { useState, useEffect } from "react";
import { 
  Monitor, Smartphone, Tablet, RefreshCw, ExternalLink, 
  Layout, Sparkles, Palette, FileText, PanelLeftClose, PanelRightClose
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Import existing admin panels to embed
import HeroAdmin from "./HeroAdmin";
import ThemeAdmin from "./ThemeAdmin";
import PagesAdmin from "./PagesAdmin";
import DestinationsAdmin from "./DestinationsAdmin";
import OffersAdmin from "./OffersAdmin";

export default function LiveVisualEditor() {
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">("mobile");
  const [activeTab, setActiveTab] = useState<"hero" | "theme" | "pages" | "destinations" | "offers">("hero");
  const [iframeKey, setIframeKey] = useState(0);
  
  const [previewPath, setPreviewPath] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const page = params.get("page");
      if (page) return page;
    }
    return "/";
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // When changing tabs, we might want to change the preview path automatically to make sense
  useEffect(() => {
    if (activeTab === "destinations") setPreviewPath("/destinations");
    else if (activeTab === "offers") setPreviewPath("/offers");
    // Don't auto change for hero/theme as they apply globally or home
  }, [activeTab]);

  const getIframeWidth = () => {
    if (device === "mobile") return "375px";
    if (device === "tablet") return "768px";
    return "100%";
  };

  const getIframeHeight = () => {
    if (device === "mobile") return "812px"; // iPhone 13/14 height
    if (device === "tablet") return "1024px"; // iPad height
    return "100%";
  };

  const tabs = [
    { id: "hero", label: "الواجهة الرئيسية", icon: Sparkles },
    { id: "theme", label: "الألوان والمظهر", icon: Palette },
    { id: "pages", label: "الصفحات", icon: FileText },
    { id: "destinations", label: "الوجهات", icon: Layout },
    { id: "offers", label: "العروض", icon: Layout },
  ] as const;

  const quickPaths = [
    { path: "/", label: "الرئيسية" },
    { path: "/about", label: "من نحن" },
    { path: "/destinations", label: "الوجهات" },
    { path: "/offers", label: "العروض" },
    { path: "/contact", label: "اتصل بنا" },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-4 md:-m-6 bg-[#0a0a0a] overflow-hidden" dir="rtl">
      {/* LEFT SIDEBAR: EDITORS */}
      <div 
        className={`flex-shrink-0 flex flex-col border-l border-white/10 bg-[#121212] transition-all duration-300 z-20 ${
          isSidebarOpen ? "w-[500px]" : "w-0 overflow-hidden"
        }`}
      >
        {/* Editor Tabs */}
        <div className="flex items-center gap-1 p-2 border-b border-white/10 overflow-x-auto custom-scrollbar shrink-0 bg-[#1a1a1a]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] border border-[var(--theme-primary)]/30"
                  : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Embedded Admin Panel */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 relative">
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#121212] to-transparent z-10 pointer-events-none" />
          
          <div className="pb-10 scale-[0.95] origin-top">
            {/* Render the selected admin component */}
            {activeTab === "hero" && <HeroAdmin />}
            {activeTab === "theme" && <ThemeAdmin />}
            {activeTab === "pages" && <PagesAdmin />}
            {activeTab === "destinations" && <DestinationsAdmin />}
            {activeTab === "offers" && <OffersAdmin />}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: LIVE PREVIEW */}
      <div className="flex-1 flex flex-col relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2a2a2a] to-[#0f0f0f]">
        
        {/* Top Control Bar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#1a1a1a]/90 backdrop-blur border border-white/10 p-2 rounded-xl z-10 shadow-2xl">
          
          {/* Toggle Sidebar */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isSidebarOpen ? <PanelRightClose size={18} /> : <PanelLeftClose size={18} />}
                </button>
              </TooltipTrigger>
              <TooltipContent><p>إخفاء / إظهار لوحة التحكم</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="w-[1px] h-6 bg-white/10" />

          {/* Device Toggles */}
          <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1">
            <button 
              onClick={() => setDevice("desktop")}
              className={`p-1.5 rounded-md transition-colors ${device === "desktop" ? "bg-white/20 text-white" : "text-white/40 hover:text-white/80"}`}
            >
              <Monitor size={18} />
            </button>
            <button 
              onClick={() => setDevice("tablet")}
              className={`p-1.5 rounded-md transition-colors ${device === "tablet" ? "bg-white/20 text-white" : "text-white/40 hover:text-white/80"}`}
            >
              <Tablet size={18} />
            </button>
            <button 
              onClick={() => setDevice("mobile")}
              className={`p-1.5 rounded-md transition-colors ${device === "mobile" ? "bg-[var(--theme-primary)]/20 text-[var(--theme-primary)]" : "text-white/40 hover:text-white/80"}`}
            >
              <Smartphone size={18} />
            </button>
          </div>

          <div className="w-[1px] h-6 bg-white/10" />

          {/* Path Selector */}
          <div className="flex items-center gap-2">
            <select 
              value={previewPath}
              onChange={(e) => setPreviewPath(e.target.value)}
              className="bg-black/40 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 outline-none min-w-[120px]"
            >
              {quickPaths.map(p => (
                <option key={p.path} value={p.path}>{p.label}</option>
              ))}
            </select>
            
            <button 
              onClick={() => setIframeKey(k => k + 1)}
              className="flex items-center gap-1.5 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw size={14} /> تحديث المُعاينة
            </button>
          </div>

          <div className="w-[1px] h-6 bg-white/10" />

          <a 
            href={previewPath}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center"
            title="فتح في نافذة جديدة"
          >
            <ExternalLink size={18} />
          </a>
        </div>

        {/* Iframe Container */}
        <div className="flex-1 flex items-center justify-center p-4 pt-20 overflow-auto custom-scrollbar">
          <div 
            className={`transition-all duration-500 ease-in-out relative bg-white ${
              device === "mobile" 
                ? "rounded-[3rem] border-[12px] border-[#1a1a1a] shadow-2xl ring-1 ring-white/10" 
                : device === "tablet"
                ? "rounded-2xl border-[12px] border-[#1a1a1a] shadow-2xl ring-1 ring-white/10"
                : "rounded-lg shadow-xl w-full h-full"
            }`}
            style={{ 
              width: getIframeWidth(), 
              height: getIframeHeight(),
              maxWidth: "100%",
              maxHeight: "100%"
            }}
          >
            {/* Dynamic notch for mobile */}
            {device === "mobile" && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-[#1a1a1a] rounded-b-3xl z-50 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              </div>
            )}
            
            {/* The actual preview iframe */}
            <iframe
              key={iframeKey}
              src={window.location.origin + previewPath}
              className={`w-full h-full border-0 ${device !== "desktop" ? "rounded-[2rem]" : "rounded-lg"}`}
              title="Live Preview"
            />
          </div>
        </div>
        
      </div>
    </div>
  );
}
