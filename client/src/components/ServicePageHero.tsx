import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { getFirestoreSetting } from "@/lib/siteSettingsApi";
import type { SubPageHero } from "@/contexts/ThemeColorsProvider";

interface ServicePageHeroProps {
  pageId: string;
  badge?: string;
  title: string;
  subtitle?: string;
  defaultImage: string;
  imageAlt?: string;
  children?: React.ReactNode;
}

export default function ServicePageHero({
  pageId,
  badge,
  title,
  subtitle,
  defaultImage,
  imageAlt,
  children,
}: ServicePageHeroProps) {
  const [subHero, setSubHero] = useState<SubPageHero | null>(null);

  const { data: savedSubHeroes } = trpc.siteSettings.get.useQuery(
    { category: "hero", key: "sub_page_heroes" },
    { staleTime: 60_000, refetchOnWindowFocus: false }
  );

  useEffect(() => {
    const applySubHeroes = (raw: string | null | undefined) => {
      if (!raw) return;
      try {
        const list = JSON.parse(raw) as SubPageHero[];
        if (Array.isArray(list)) {
          const match = list.find((h) => h.page === pageId);
          if (match) setSubHero(match);
        }
      } catch {}
    };

    if (savedSubHeroes) {
      applySubHeroes(savedSubHeroes);
    } else {
      getFirestoreSetting("hero", "sub_page_heroes")
        .then((raw) => applySubHeroes(raw))
        .catch(() => {});
    }
  }, [savedSubHeroes, pageId]);

  const activeImage =
    subHero?.mediaUrl && subHero.mediaUrl.trim() !== ""
      ? subHero.mediaUrl
      : defaultImage;
  const activeTitle = subHero?.title && subHero.title.trim() !== "" ? subHero.title : title;
  const activeSubtitle =
    subHero?.subtitle && subHero.subtitle.trim() !== "" ? subHero.subtitle : subtitle;
  const overlayOpacity =
    typeof subHero?.overlayOpacity === "number"
      ? Math.min(85, Math.max(35, subHero.overlayOpacity)) / 100
      : 0.62;

  return (
    <section className="relative pt-24 pb-12 md:pt-28 md:pb-16 min-h-[36vh] md:min-h-[42vh] flex items-center overflow-hidden bg-[#07090e] border-b border-[var(--theme-primary)]/20">
      {/* Service-specific background photograph */}
      <img
        src={activeImage}
        alt={imageAlt || activeTitle}
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
      />
      {/* Cinematic luxury dark gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, rgba(7,9,14,${overlayOpacity * 0.85}) 0%, rgba(7,9,14,${overlayOpacity * 0.7}) 50%, rgba(7,9,14,0.96) 100%)`,
        }}
      />

      <div className="container relative z-10 text-center max-w-4xl mx-auto px-4">
        {badge && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 bg-[var(--theme-primary)]/15 border border-[var(--theme-primary)]/40 text-[var(--theme-primary)] text-xs uppercase tracking-[0.22em] backdrop-blur-sm">
            {badge}
          </div>
        )}
        <h1 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight mb-3 drop-shadow-lg">
          {activeTitle}
        </h1>
        <div className="flex justify-center items-center my-3">
          <div className="w-12 h-[1px] bg-[var(--theme-primary)]" />
          <div className="w-2 h-2 bg-[var(--theme-primary)] rotate-45 mx-3" />
          <div className="w-12 h-[1px] bg-[var(--theme-primary)]" />
        </div>
        {activeSubtitle && (
          <p className="text-white/85 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed drop-shadow">
            {activeSubtitle}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
