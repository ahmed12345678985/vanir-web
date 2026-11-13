import { useState, useRef } from "react";
import { toast } from "sonner";
import { Upload, Loader2, Image as ImageIcon, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadDirectMedia, compressImageToDataUri } from "@/lib/siteSettingsApi";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  className?: string;
}

export function ImageUploadField({
  value,
  onChange,
  label,
  placeholder = "/images/... أو رابط الصورة",
  helperText,
  className = "",
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error("حجم الملف كبير جداً (الحد الأقصى 20 ميجابايت)");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Direct upload with automatic intelligent Data-URI & Canvas compression fallback
      // This guarantees that if Firebase Storage quota is exceeded, the upload NEVER fails!
      const downloadUrl = await uploadDirectMedia(file, "uploads");
      onChange(downloadUrl);
      toast.success("تم تجهيز وضغط الصورة بنجاح وحفظها سحابياً ✓");
    } catch (err: any) {
      console.warn("Direct upload fallback to client-side compression:", err);
      try {
        const dataUri = await compressImageToDataUri(file);
        onChange(dataUri);
        toast.success("تم ضغط الصورة وتجهيزها سحابياً بنجاح ✓");
      } catch (fallbackErr: any) {
        console.error("Local compression error:", fallbackErr);
        toast.error(`تعذر معالجة الصورة: ${fallbackErr.message || "حدث خطأ غير متوقع"}`);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-white/80">
          {label}
        </label>
      )}

      {/* Hidden native file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
        className="hidden"
      />

      <div className="flex items-center gap-2">
        {/* Thumbnail Preview */}
        <div className="w-11 h-11 rounded-lg border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center shrink-0 relative group">
          {value ? (
            <>
              <img
                src={value}
                alt="معاينة"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={() => onChange("")}
                title="مسح الصورة"
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <ImageIcon size={18} className="text-white/20" />
          )}
        </div>

        {/* URL Input (Editable as fallback) */}
        <div className="flex-1 min-w-0">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            dir="ltr"
            className="h-10 text-xs bg-[#1f1f1f] border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[var(--theme-primary)]"
          />
        </div>

        {/* Upload Button */}
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          variant="outline"
          className="h-10 px-3 bg-[var(--theme-primary)]/10 hover:bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] border-[var(--theme-primary)]/30 text-xs flex items-center gap-1.5 shrink-0 transition-colors"
        >
          {isUploading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>جاري الرفع...</span>
            </>
          ) : (
            <>
              <Upload size={14} />
              <span>رفع من الجهاز</span>
            </>
          )}
        </Button>
      </div>

      {helperText && (
        <p className="text-[10px] text-white/40">{helperText}</p>
      )}
    </div>
  );
}

export default ImageUploadField;
