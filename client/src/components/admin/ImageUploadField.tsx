import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Upload, Loader2, Image as ImageIcon, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  const uploadMutation = trpc.gallery.uploadImage.useMutation({
    onSuccess: (data) => {
      onChange(data.url);
      setIsUploading(false);
      toast.success("تم رفع الصورة بنجاح وحفظها في الموقع");
    },
    onError: (err) => {
      setIsUploading(false);
      toast.error(`فشل رفع الصورة: ${err.message || "حدث خطأ غير متوقع"}`);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      toast.error("حجم الملف كبير جداً (الحد الأقصى 15 ميجابايت)");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      uploadMutation.mutate({
        fileData: base64,
        filename: file.name,
        mimeType: file.type || "image/jpeg",
      });
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast.error("فشلت قراءة الملف من الجهاز");
    };
    reader.readAsDataURL(file);
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
