import React from "react";
import { Helmet } from "react-helmet-async";
import { getSEOMetadata, normalizeRoute } from "@shared/seo/seoMatrix";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
}

const SITE_NAME = "VANIR GROUP";
const BASE_URL = "https://vanirgroup.com";
const DEFAULT_OG_IMAGE = "/images/hero-egyptian.jpg";

export default function SEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = "website",
  noIndex = false,
}: SEOProps) {
  const routeFromCanonical = canonicalUrl ? canonicalUrl.replace(BASE_URL, "") : undefined;
  const currentRoute = normalizeRoute(routeFromCanonical || (typeof window !== "undefined" ? window.location.pathname : "/"));
  const routeMetadata = getSEOMetadata(currentRoute);
  const effectiveTitle = routeMetadata?.metaTitle ?? title;
  const effectiveDescription = routeMetadata?.metaDescription ?? description;
  const fullTitle = routeMetadata ? effectiveTitle : `${effectiveTitle} | ${SITE_NAME}`;
  const rawImage = ogImage || DEFAULT_OG_IMAGE;
  const image = rawImage.startsWith("http") ? rawImage : `${BASE_URL}${rawImage.startsWith("/") ? rawImage : `/${rawImage}`}`;
  const canonicalRoute = routeFromCanonical || routeMetadata?.route || currentRoute;
  const canonical = canonicalUrl || `${BASE_URL}${canonicalRoute === "/" ? "/" : canonicalRoute}`;

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
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="de_DE" />
      <meta property="og:locale:alternate" content="ar_EG" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={effectiveDescription} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
