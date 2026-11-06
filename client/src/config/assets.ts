/**
 * Centralized asset URLs configuration
 * Maintains consistent branding assets across the application
 * Update these URLs here when assets are moved/updated
 */

export const ASSETS = {
  // Company Logo - Circular badge with gold V and airplane
  LOGO_MAIN: "/logo-vanir-v2.png",
  
  // Watermark Logo - White logo for overlays
  LOGO_WATERMARK: "/logo-vanir-v2.png",
  
  // Hero Section Assets
  HERO_BG: "/images/hero-egyptian.jpg",
  HERO_VIDEO: "/api/video-proxy?url=https://hebbkx1anhila5yf.public.blob.vercel-storage.com/12121%20hero-DivuXUVJHN9r3kCgOV0FpVWlEDdf9U.mp4",
} as const;

// Export individual constants for backward compatibility
export const LOGO_URL = ASSETS.LOGO_MAIN;
