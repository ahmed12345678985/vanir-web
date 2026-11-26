/**
 * Royal Pharaonic Avatar Collection for Vanir Group Accounts
 * All 6 avatars are locally hosted in /images/avatars/ for instant zero-latency rendering.
 */

export interface PharaonicAvatar {
  id: string;
  name: string;
  nameAr: string;
  url: string;
}

export const PHARAONIC_AVATARS: PharaonicAvatar[] = [
  {
    id: "pharaoh-king",
    name: "Golden Pharaoh",
    nameAr: "الفرعون الذهبي",
    url: "/images/avatars/pharaoh-king.jpg",
  },
  {
    id: "queen-nefertiti",
    name: "Queen Nefertiti",
    nameAr: "الملكة نفرتيتي",
    url: "/images/avatars/queen-nefertiti.jpg",
  },
  {
    id: "horus-falcon",
    name: "Falcon of Horus",
    nameAr: "صقر حورس",
    url: "/images/avatars/horus-falcon.jpg",
  },
  {
    id: "anubis-guardian",
    name: "Royal Anubis",
    nameAr: "أنوبيس الملكي",
    url: "/images/avatars/anubis-guardian.jpg",
  },
  {
    id: "queen-cleopatra",
    name: "Queen Cleopatra",
    nameAr: "الملكة كليوباترا",
    url: "/images/avatars/queen-cleopatra.jpg",
  },
  {
    id: "winged-scarab",
    name: "Winged Scarab",
    nameAr: "الجعران المجنح",
    url: "/images/avatars/winged-scarab.jpg",
  },
];

/**
 * Deterministically assigns a Royal Pharaonic Avatar for any account
 * that hasn't uploaded a custom photo yet.
 */
export function getDefaultPharaonicAvatar(seed?: string | null): string {
  const s = (seed || "vanir").trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  return PHARAONIC_AVATARS[hash % PHARAONIC_AVATARS.length].url;
}

export function resolveUserAvatar(
  avatarUrl?: string | null,
  seed?: string | null
): string {
  if (avatarUrl && avatarUrl.trim().length > 0) return avatarUrl.trim();
  return getDefaultPharaonicAvatar(seed);
}
