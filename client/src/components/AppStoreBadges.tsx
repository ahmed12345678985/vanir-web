import React from "react";
import { toast } from "sonner";

export const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.vanir.mobile";

// Add your Apple App Store URL here once the iOS version is published
export const APP_STORE_URL = "";

interface AppStoreBadgesProps {
  size?: "sm" | "md" | "lg";
  layout?: "row" | "column";
  className?: string;
}

export default function AppStoreBadges({
  size = "md",
  layout = "row",
  className = "",
}: AppStoreBadgesProps) {
  const dimensions =
    size === "sm"
      ? "h-11 px-3.5 min-w-[148px]"
      : size === "lg"
        ? "h-14 px-5 min-w-[190px]"
        : "h-12 px-4 min-w-[168px]";

  const iconSize = size === "sm" ? 22 : size === "lg" ? 30 : 26;
  const subTextClass =
    size === "sm"
      ? "text-[9px]"
      : size === "lg"
        ? "text-[11px]"
        : "text-[10px]";
  const mainTextClass =
    size === "sm"
      ? "text-[15px]"
      : size === "lg"
        ? "text-[20px]"
        : "text-[17px]";

  const handleAppStoreClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!APP_STORE_URL) {
      e.preventDefault();
      toast("Vanir iOS App is coming soon to the Apple App Store");
    }
  };

  return (
    <div
      className={`flex ${
        layout === "column" ? "flex-col items-start" : "flex-wrap items-center"
      } gap-3 ${className}`}
    >
      {/* Google Play Badge */}
      <a
        href={GOOGLE_PLAY_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Get it on Google Play"
        className={`group inline-flex items-center gap-3 ${dimensions} rounded-xl bg-black border border-white/20 hover:border-[var(--theme-primary,#D4A853)] text-white shadow-lg hover:shadow-[0_6px_24px_rgba(212,168,83,0.22)] transition-all duration-300 hover:-translate-y-0.5`}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="gp-blue"
              x1="21.8"
              y1="6.7"
              x2="4.1"
              y2="34.8"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#00C3FF" />
              <stop offset="100%" stopColor="#0068FF" />
            </linearGradient>
            <linearGradient
              id="gp-green"
              x1="6"
              y1="4.5"
              x2="31.5"
              y2="24"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#00F076" />
              <stop offset="100%" stopColor="#00C96B" />
            </linearGradient>
            <linearGradient
              id="gp-yellow"
              x1="43"
              y1="24"
              x2="26"
              y2="24"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FFE000" />
              <stop offset="100%" stopColor="#FF9C00" />
            </linearGradient>
            <linearGradient
              id="gp-red"
              x1="28.5"
              y1="26.5"
              x2="6.5"
              y2="44"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FF3A44" />
              <stop offset="100%" stopColor="#C31162" />
            </linearGradient>
          </defs>
          <path
            d="M7.3 4.8C6.5 5.6 6 6.9 6 8.6V39.4C6 41.1 6.5 42.4 7.3 43.2L7.5 43.4L26.8 24.2V23.8L7.5 4.6L7.3 4.8Z"
            fill="url(#gp-blue)"
          />
          <path
            d="M33.2 30.6L26.8 24.2V23.8L33.2 17.4L33.5 17.6L41.1 21.9C43.3 23.1 43.3 25.1 41.1 26.3L33.5 30.5L33.2 30.6Z"
            fill="url(#gp-yellow)"
          />
          <path
            d="M33.5 30.5L26.8 24L7.3 43.2C8.1 44 9.5 44.1 11.1 43.2L33.5 30.5Z"
            fill="url(#gp-red)"
          />
          <path
            d="M33.5 17.5L11.1 4.8C9.5 3.9 8.1 4 7.3 4.8L26.8 24L33.5 17.5Z"
            fill="url(#gp-green)"
          />
        </svg>

        <div className="flex flex-col items-start leading-none text-left">
          <span
            className={`${subTextClass} uppercase tracking-[0.08em] text-white/85 font-normal mb-0.5`}
          >
            GET IT ON
          </span>
          <span
            className={`${mainTextClass} font-semibold tracking-tight text-white`}
          >
            Google Play
          </span>
        </div>
      </a>

      {/* Apple App Store Badge */}
      <a
        href={APP_STORE_URL || "#download-ios"}
        target={APP_STORE_URL ? "_blank" : undefined}
        rel={APP_STORE_URL ? "noopener noreferrer" : undefined}
        onClick={handleAppStoreClick}
        aria-label="Download on the App Store"
        className={`group inline-flex items-center gap-3 ${dimensions} rounded-xl bg-black border border-white/20 hover:border-[var(--theme-primary,#D4A853)] text-white shadow-lg hover:shadow-[0_6px_24px_rgba(212,168,83,0.22)] transition-all duration-300 hover:-translate-y-0.5`}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 384 512"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 text-white"
          aria-hidden="true"
        >
          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
        </svg>

        <div className="flex flex-col items-start leading-none text-left">
          <span
            className={`${subTextClass} tracking-[0.02em] text-white/85 font-normal mb-0.5`}
          >
            Download on the
          </span>
          <span
            className={`${mainTextClass} font-semibold tracking-tight text-white`}
          >
            App Store
          </span>
        </div>
      </a>
    </div>
  );
}
