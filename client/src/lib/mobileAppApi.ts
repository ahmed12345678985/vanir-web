import { getApps, initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  type FirebaseStorage,
} from 'firebase/storage';

const env = import.meta.env as Record<string, string | undefined>;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyAszyNw2a7_bv02cf0FBXiPXwt3E2-CXdY',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'gen-lang-client-0364375301.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'gen-lang-client-0364375301',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'gen-lang-client-0364375301.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1001729880037',
  appId: env.VITE_FIREBASE_APP_ID || '1:1001729880037:web:0cf4200a2a48e96547090c',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

export type ServiceType = 'hotel' | 'jet' | 'yacht' | 'car';

export interface MobileCatalogEntity {
  id: string;
  type: ServiceType;
  name: string;
  subtitle: string;
  location?: string;
  image: string;
  images: string[];
  price: string;
  priceNumeric: number;
  pricePer: string;
  currency: 'USD' | 'EUR' | 'EGP' | 'AED' | 'SAR';
  rating: number;
  tag1: string;
  tag2: string;
  badge?: string;
  description?: string;
  capacity?: string;
  status: 'active' | 'draft';
}

export interface MobilePaymentConfig {
  paypalEnabled: boolean;
  paypalClientId: string;
  paypalSecret?: string;
  paypalBusinessEmail?: string;
  paypalMode: 'sandbox' | 'live';
  stripeEnabled: boolean;
  stripePublishableKey: string;
  customApiEnabled: boolean;
  customApiUrl: string;
  customApiKey: string;
  bankWireEnabled: boolean;
  bankWireIban: string;
  bankWireSwift: string;
  bankWireName: string;
  currency: string;
}

export interface PushNotificationPayload {
  id?: string;
  title: string;
  body: string;
  imageUrl?: string;
  targetScreen?: string;
  sentAt?: any;
  status?: 'sent' | 'scheduled' | 'draft';
}

// ================= Complete Initial Catalog for the Entire App =================
export const INITIAL_COMPREHENSIVE_CATALOG: MobileCatalogEntity[] = [
  // --- HOTELS ---
  {
    id: 'hotel-dubai-burj-al-arab',
    type: 'hotel',
    name: 'Burj Al Arab Jumeirah',
    subtitle: 'Umm Suqeim 3, Jumeirah Beach, Dubai',
    location: 'Dubai, UAE 🇦🇪',
    image: 'https://cf.bstatic.com/xdata/images/hotel/max1280x900/646595186.jpg?k=3eff038fbb2e97745c110ae0c97af41300fc6da3d7583c001146c827eef899a3',
    images: [
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/578658137.jpg?k=298500e1e853e92027d2578e52d03e51bc9dea60a528677064e5047a17453224',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/589257781.jpg?k=3a0c556ece3993f79dd07ef63db953954e7cf033309d7ea7de0d6defd35e2a23',
    ],
    price: '$2,200',
    priceNumeric: 2200,
    pricePer: 'per night',
    currency: 'USD',
    rating: 9.8,
    tag1: 'Ultra-Luxury',
    tag2: 'Private Island & Butler',
    badge: 'Exceptional 9.8',
    status: 'active',
  },
  {
    id: 'hotel-cairo-nile-ritz',
    type: 'hotel',
    name: 'The Nile Ritz-Carlton, Cairo',
    subtitle: '1113 Corniche El Nil, Tahrir Square, Cairo',
    location: 'Cairo, Egypt 🇪🇬',
    image: 'https://cf.bstatic.com/xdata/images/hotel/max1280x900/818899760.jpg?k=230b17f3642c1c4d4dec913fe1e03e4acdc4fa969408942e715385893f8e16a6',
    images: [
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/456051785.jpg?k=ab367efe7938e4f53bbdc45d1b354fa16cfbf8202e8693f6d9946aa5ab537de5',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/566928161.jpg?k=67230f658d6c69053c7702be694d6219c1d0a2bc9e72caae6814bc0381ddaa2f',
    ],
    price: '$450',
    priceNumeric: 450,
    pricePer: 'per night',
    currency: 'USD',
    rating: 9.3,
    tag1: 'Nile Panorama',
    tag2: 'Royal Suite',
    badge: 'Wonderful 9.3',
    status: 'active',
  },
  {
    id: 'hotel-cairo-mena-house',
    type: 'hotel',
    name: 'Marriott Mena House, Giza Pyramids',
    subtitle: '6 Pyramids Road, Giza, Cairo',
    location: 'Giza, Egypt 🇪🇬',
    image: 'https://cf.bstatic.com/xdata/images/hotel/max1280x900/628111247.jpg?k=55391a33d7b154c53543ddabfa7cf3d2bfc5da0ae69eef56816adb0586d4362e',
    images: [
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/590093029.jpg?k=1e81c330f413df762c002665fafb69761a63c9414961f9778928023dd7db1fb4',
    ],
    price: '$520',
    priceNumeric: 520,
    pricePer: 'per night',
    currency: 'USD',
    rating: 9.5,
    tag1: 'Direct Pyramid Views',
    tag2: 'Historic Palace',
    badge: 'Iconic 9.5',
    status: 'active',
  },
  {
    id: 'hotel-sharm-four-seasons',
    type: 'hotel',
    name: 'Four Seasons Resort Sharm El Sheikh',
    subtitle: '1 Four Seasons Boulevard, Sharm El Sheikh',
    location: 'Red Sea, Egypt 🇪🇬',
    image: 'https://cf.bstatic.com/xdata/images/hotel/max1280x900/241890691.jpg?k=f30a16d1e61d7253ef29e45343f4ed294694b6a191219eb4293f23e0a83772cb',
    images: [
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/222474818.jpg?k=407301ea96d522c38c299932cad47a2d37e7afb91cc2018feb823341387ef709',
    ],
    price: '$780',
    priceNumeric: 780,
    pricePer: 'per night',
    currency: 'USD',
    rating: 9.7,
    tag1: 'Private Coral Reef',
    tag2: 'Cliffside Villas',
    badge: 'Exceptional 9.7',
    status: 'active',
  },
  {
    id: 'hotel-dubai-atlantis-palm',
    type: 'hotel',
    name: 'Atlantis, The Palm',
    subtitle: 'Crescent Road, Palm Jumeirah, Dubai',
    location: 'Dubai, UAE 🇦🇪',
    image: 'https://cf.bstatic.com/xdata/images/hotel/max1280x900/680582913.jpg?k=5fd96a5d0ce5da3022369154bf305ccbaff0d2a7b2c5434f88f7fc9e5ed8bbb1',
    images: [
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/727476403.jpg?k=62b729fbc16a796086d0acb33a4bdc96e7a33cb594902ca44e7b34701265e51a',
    ],
    price: '$950',
    priceNumeric: 950,
    pricePer: 'per night',
    currency: 'USD',
    rating: 9.2,
    tag1: 'Palm Jumeirah',
    tag2: 'Underwater Suites',
    badge: 'Wonderful 9.2',
    status: 'active',
  },

  // --- PRIVATE JETS ---
  {
    id: 'jet-bombardier-global-7500',
    type: 'jet',
    name: 'Bombardier Global 7500',
    subtitle: 'Ultra Long-Range VIP Flight • 4 Living Spaces',
    location: 'Cairo / Dubai / London',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85',
      'https://images.unsplash.com/photo-1520437358207-323b43b50729?w=1200&q=85',
    ],
    price: '$18,500',
    priceNumeric: 18500,
    pricePer: 'per flight hour',
    currency: 'USD',
    rating: 4.99,
    tag1: '7,700 nm Range',
    tag2: '19 VIP Seats',
    badge: 'Flagship Jet',
    capacity: '19 VIP Seats',
    status: 'active',
  },
  {
    id: 'jet-gulfstream-g650er',
    type: 'jet',
    name: 'Gulfstream G650ER',
    subtitle: 'Non-stop Transatlantic & Transpacific Flight',
    location: 'Global VIP Bases',
    image: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1200&q=85',
      'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&q=85',
    ],
    price: '$16,800',
    priceNumeric: 16800,
    pricePer: 'per flight hour',
    currency: 'USD',
    rating: 4.98,
    tag1: 'Mach 0.925',
    tag2: '16 VIP Seats',
    badge: 'Ultra Long Range',
    capacity: '16 VIP Seats',
    status: 'active',
  },
  {
    id: 'jet-dassault-falcon-8x',
    type: 'jet',
    name: 'Dassault Falcon 8X',
    subtitle: 'Tri-Jet Performance & Short Runway Access',
    location: 'Europe & Middle East',
    image: 'https://images.unsplash.com/photo-1520437358207-323b43b50729?w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1520437358207-323b43b50729?w=1200&q=85',
    ],
    price: '$14,500',
    priceNumeric: 14500,
    pricePer: 'per flight hour',
    currency: 'USD',
    rating: 4.97,
    tag1: 'Tri-Jet Safety',
    tag2: '14 VIP Seats',
    badge: 'Tri-Jet Speed',
    capacity: '14 VIP Seats',
    status: 'active',
  },

  // --- LUXURY YACHTS ---
  {
    id: 'yacht-majesty-120',
    type: 'yacht',
    name: 'Majesty 120 Superyacht',
    subtitle: 'Dubai Marina & Arabian Gulf • 5 Master Staterooms',
    location: 'Dubai Marina, UAE',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&q=80',
    ],
    price: '$1,500',
    priceNumeric: 1500,
    pricePer: 'per hour',
    currency: 'USD',
    rating: 4.98,
    tag1: 'Dubai Marina',
    tag2: 'Full Chef & Crew',
    badge: 'Featured Superyacht',
    capacity: '15 Guests',
    status: 'active',
  },
  {
    id: 'yacht-benetti-oasis-40m',
    type: 'yacht',
    name: 'Benetti Oasis 40M',
    subtitle: 'Red Sea & French Riviera Explorer',
    location: 'Hurghada / Sharm / Monaco',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',
      'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?w=1200&q=80',
    ],
    price: '$32,000',
    priceNumeric: 3200,
    pricePer: 'per day',
    currency: 'USD',
    rating: 5.0,
    tag1: 'Beach Club Deck',
    tag2: 'Infinity Pool',
    badge: 'Royal Flagship',
    capacity: '12 Guests',
    status: 'active',
  },

  // --- EXECUTIVE CARS & LIMOUSINES ---
  {
    id: 'car-rolls-royce-phantom',
    type: 'car',
    name: 'Rolls-Royce Phantom VIII',
    subtitle: 'Bespoke Starlight Headliner • Chauffeur Driven',
    location: 'Cairo & Dubai',
    image: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=1200&q=85',
    ],
    price: '$1,200',
    priceNumeric: 1200,
    pricePer: 'per day',
    currency: 'USD',
    rating: 5.0,
    tag1: 'Prestige Chauffeur',
    tag2: 'Starlight Ceiling',
    badge: 'Prestige VIP',
    capacity: '3 Passengers',
    status: 'active',
  },
  {
    id: 'car-mercedes-maybach-s680',
    type: 'car',
    name: 'Mercedes-Maybach S 680',
    subtitle: 'First-Class Executive Rear Lounge • V12 Engine',
    location: 'Cairo / Giza / Alexandria',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=80',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&q=80',
    ],
    price: '$650',
    priceNumeric: 650,
    pricePer: 'per day',
    currency: 'USD',
    rating: 4.99,
    tag1: 'First Class Sedan',
    tag2: 'Armored Executive',
    badge: 'Royal Class',
    capacity: '3 Passengers',
    status: 'active',
  },
  {
    id: 'car-mercedes-amg-gt63s',
    type: 'car',
    name: 'Mercedes-AMG GT 63 S 4-Door',
    subtitle: 'Handcrafted 4.0L Bi-Turbo V8 • 630 HP • 4 Seats',
    location: 'Dubai & Cairo',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1200&q=85',
    ],
    price: '$800',
    priceNumeric: 800,
    pricePer: 'per day',
    currency: 'USD',
    rating: 4.98,
    tag1: 'Supercar Sedan',
    tag2: 'VIP Chauffeur',
    badge: 'AMG Performance',
    capacity: '4 Passengers',
    status: 'active',
  },
];

export const DEFAULT_PAYMENT_CONFIG: MobilePaymentConfig = {
  paypalEnabled: true,
  paypalClientId: 'ATRGNi3bP3BAuwyiEcjHlITjnaN3ZqnTCNt_dTB-OF1d1cSFVF62UZj4n_TEsN-TF5XJeApKr2jTMjCX',
  paypalSecret: 'EFDVUZ9lZEiNThnXKWXDd8k8bTpDM7dIpsqWUd_4FUtc1JwyTLy8kNh0YOCkFjYdvHrkrOHa5CufjJov',
  paypalBusinessEmail: 'sb-xpccb42269737@business.example.com',
  paypalMode: 'sandbox',
  stripeEnabled: false,
  stripePublishableKey: '',
  customApiEnabled: false,
  customApiUrl: '',
  customApiKey: '',
  bankWireEnabled: true,
  bankWireIban: 'EG820002000100000012345678901',
  bankWireSwift: 'MISREGCAXXX',
  bankWireName: 'Vanir Group International',
  currency: 'USD',
};

// ======================== API Operations ========================

// 1. Fetch & Save Mobile Catalog Entities (Hotels, Jets, Yachts, Cars)
export async function fetchFullMobileCatalog(): Promise<MobileCatalogEntity[]> {
  try {
    const snap = await getDoc(doc(db, 'app_config', 'full_mobile_catalog'));
    if (snap.exists() && snap.data()?.items && Array.isArray(snap.data()?.items) && snap.data().items.length > 0) {
      return snap.data().items as MobileCatalogEntity[];
    }
  } catch (err) {
    console.warn('Using default comprehensive catalog:', err);
  }
  return INITIAL_COMPREHENSIVE_CATALOG;
}

export async function saveFullMobileCatalog(items: MobileCatalogEntity[]): Promise<void> {
  await setDoc(doc(db, 'app_config', 'full_mobile_catalog'), {
    items,
    updatedAt: serverTimestamp(),
  });
}

// 2. Fetch & Save Payment Configuration
export async function fetchMobilePaymentConfig(): Promise<MobilePaymentConfig> {
  try {
    const snap = await getDoc(doc(db, 'app_config', 'payment_gateways'));
    if (snap.exists()) {
      return { ...DEFAULT_PAYMENT_CONFIG, ...snap.data() } as MobilePaymentConfig;
    }
  } catch (err) {
    console.warn('Using default payment config:', err);
  }
  return DEFAULT_PAYMENT_CONFIG;
}

export async function saveMobilePaymentConfig(config: MobilePaymentConfig): Promise<void> {
  await setDoc(doc(db, 'app_config', 'payment_gateways'), {
    ...config,
    updatedAt: serverTimestamp(),
  });
}

// 3. Send & Log Push Notifications
export async function sendMobilePushNotification(
  payload: Omit<PushNotificationPayload, 'id' | 'sentAt' | 'status'>
): Promise<string> {
  const notifRef = doc(collection(db, 'mobile_push_notifications'));
  const cleanData: Record<string, any> = {
    id: notifRef.id,
    title: payload.title,
    body: payload.body,
    targetScreen: payload.targetScreen || 'HomeScreen',
    sentAt: serverTimestamp(),
    status: 'sent',
  };

  if (payload.imageUrl && typeof payload.imageUrl === 'string' && payload.imageUrl.trim() !== '') {
    cleanData.imageUrl = payload.imageUrl.trim();
  }

  await setDoc(notifRef, cleanData);
  return notifRef.id;
}

export async function fetchRecentNotifications(): Promise<PushNotificationPayload[]> {
  try {
    const snap = await getDocs(collection(db, 'mobile_push_notifications'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as PushNotificationPayload));
  } catch (err) {
    console.warn('Error fetching notifications:', err);
    return [];
  }
}

import { compressImageToDataUri } from "./siteSettingsApi";

// 4. Upload Image Directly to Firebase Storage with Quota Exceeded Resilience
export async function uploadMobileImage(file: File, folder = 'mobile_catalog_assets'): Promise<string> {
  try {
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${folder}/${Date.now()}_${sanitizedName}`;
    const fileRef = ref(storage, filename);
    await uploadBytes(fileRef, file, { contentType: file.type });
    return await getDownloadURL(fileRef);
  } catch (err: any) {
    console.warn(`[mobileAppApi] Firebase Storage upload failed (${err?.code || err?.message}), applying intelligent Data-URI fallback:`, err);
    if (file.type.startsWith('image/')) {
      const dataUri = await compressImageToDataUri(file);
      return dataUri;
    }
    throw err;
  }
}
