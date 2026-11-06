import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { getSEOMetadata, normalizeRoute } from "@shared/seo/seoMatrix";

interface PageMetaProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalPath?: string;
  noIndex?: boolean;
  /** JSON-LD structured data */
  jsonLd?: Record<string, unknown>;
}

const SITE_NAME = "VANIR GROUP";
const SITE_URL = "https://vanirgroup.com";
const DEFAULT_OG_IMAGE = "/images/hero-egyptian.jpg";

export default function PageMeta({
  title,
  description,
  keywords,
  ogImage,
  ogType = "website",
  canonicalPath,
  noIndex = false,
  jsonLd,
}: PageMetaProps) {
  const [location] = useLocation();
  const routeMetadata = getSEOMetadata(canonicalPath || location);
  const effectiveTitle = routeMetadata?.metaTitle ?? title;
  const effectiveDescription = routeMetadata?.metaDescription ?? description;
  let fullTitle = effectiveTitle;
  if (!routeMetadata && effectiveTitle !== SITE_NAME) {
    fullTitle = `${effectiveTitle} | ${SITE_NAME}`;
  }
  const canonicalRoute = canonicalPath || routeMetadata?.route || normalizeRoute(location);
  const canonical = canonicalRoute ? `${SITE_URL}${canonicalRoute === "/" ? "/" : canonicalRoute}` : `${SITE_URL}/`;
  const rawImage = ogImage || DEFAULT_OG_IMAGE;
  const image = rawImage.startsWith("http") ? rawImage : `${SITE_URL}${rawImage.startsWith("/") ? rawImage : `/${rawImage}`}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={effectiveDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="x-default" href={canonical} />
      <link rel="alternate" hrefLang="en" href={canonical} />
      <link rel="alternate" hrefLang="de" href={canonical} />
      <link rel="alternate" hrefLang="de-DE" href={canonical} />
      <link rel="alternate" hrefLang="de-AT" href={canonical} />
      <link rel="alternate" hrefLang="de-CH" href={canonical} />
      <link rel="alternate" hrefLang="ar" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={effectiveDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="de_DE" />
      <meta property="og:locale:alternate" content="ar_EG" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={effectiveDescription} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify({ "@context": "https://schema.org", ...jsonLd })}
        </script>
      )}
    </Helmet>
  );
}
