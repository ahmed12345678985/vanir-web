import { getApps, initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
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

// Data types matching Vanir Mobile App
export interface MobileFeedCard {
  id: string;
  title: string;
  subtitle: string;
  category: 'hotel' | 'flight' | 'jet' | 'yacht' | 'car' | 'experience' | string;
  tag: string;
  tagColor?: string;
  image: string;
  images?: string[];
  price?: string;
  rating?: number;
  routeTarget: string;
}

export interface MobilePricingRule {
  id: string;
  serviceKey: 'hotel' | 'flight' | 'jet' | 'yacht' | 'car' | 'fasttrack' | 'vip';
  title: string;
  basePrice: number;
  currency: 'USD' | 'EUR' | 'EGP' | 'AED' | 'SAR';
  unit: string; // e.g. per night, per hour, per flight
  discountPercent?: number;
  isVipOnly?: boolean;
  isActive: boolean;
  notes?: string;
}

export interface MobilePaymentConfig {
  paypalEnabled: boolean;
  paypalClientId: string;
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
  targetParams?: string;
  sentAt?: any;
  status?: 'sent' | 'scheduled' | 'draft';
}

export interface MobileAppGlobalControls {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  minVersion: string;
  currentVersion: string;
  playStoreUrl: string;
  emergencyNotice: string;
  activeFeedCards: MobileFeedCard[];
}

export const DEFAULT_FEED_CARDS: MobileFeedCard[] = [
  {
    id: 'card_hotel_stregis',
    title: 'The St. Regis Cairo',
    subtitle: 'Nile Corniche, Cairo',
    category: 'hotel',
    tag: '5-Star Luxury',
    tagColor: '#D4AF37',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80',
    price: '$650 / night',
    rating: 4.95,
    routeTarget: 'HotelDetails',
  },
  {
    id: 'card_jet_global7500',
    title: 'Bombardier Global 7500',
    subtitle: 'Ultra Long-Range VIP Flight',
    category: 'jet',
    tag: 'Private Aviation',
    tagColor: '#C5A059',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80',
    price: '$12,500 / hr',
    rating: 5.0,
    routeTarget: 'PrivateJetBooking',
  },
  {
    id: 'card_yacht_nile_lotus',
    title: 'Royal Nile Lotus Mega Yacht',
    subtitle: 'Private Red Sea & Nile Escapes',
    category: 'yacht',
    tag: 'Royal Fleet',
    tagColor: '#4CA1AF',
    image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?w=1200&q=80',
    price: '$8,200 / day',
    rating: 4.98,
    routeTarget: 'YachtBooking',
  },
  {
    id: 'card_car_maybach',
    title: 'Mercedes-Maybach S 680',
    subtitle: 'Chauffeured Executive Armored',
    category: 'car',
    tag: 'Executive Limousine',
    tagColor: '#9B51E0',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&q=80',
    price: '$1,200 / day',
    rating: 4.97,
    routeTarget: 'CarDetails',
  },
];

export const DEFAULT_PRICING: MobilePricingRule[] = [
  {
    id: 'price_hotel_standard',
    serviceKey: 'hotel',
    title: 'Luxury Hotel Suite Base',
    basePrice: 550,
    currency: 'USD',
    unit: 'Night',
    discountPercent: 10,
    isVipOnly: false,
    isActive: true,
  },
  {
    id: 'price_jet_heavy',
    serviceKey: 'jet',
    title: 'Heavy Private Jet Charter',
    basePrice: 11000,
    currency: 'USD',
    unit: 'Flight Hour',
    isVipOnly: true,
    isActive: true,
  },
  {
    id: 'price_yacht_charter',
    serviceKey: 'yacht',
    title: 'Superyacht Day Charter',
    basePrice: 7500,
    currency: 'USD',
    unit: 'Full Day',
    isVipOnly: false,
    isActive: true,
  },
  {
    id: 'price_limousine_vip',
    serviceKey: 'car',
    title: 'Maybach VIP Chauffeur',
    basePrice: 950,
    currency: 'USD',
    unit: 'Per Day',
    isVipOnly: false,
    isActive: true,
  },
];

export const DEFAULT_PAYMENT_CONFIG: MobilePaymentConfig = {
  paypalEnabled: true,
  paypalClientId: 'vanir_paypal_client_id_placeholder',
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

// 1. Fetch & Save Mobile Feed Cards
export async function fetchMobileCards(): Promise<MobileFeedCard[]> {
  try {
    const snap = await getDoc(doc(db, 'app_config', 'feedCards'));
    if (snap.exists() && snap.data()?.cards) {
      return snap.data().cards as MobileFeedCard[];
    }
  } catch (err) {
    console.warn('Using default mobile feed cards:', err);
  }
  return DEFAULT_FEED_CARDS;
}

export async function saveMobileCards(cards: MobileFeedCard[]): Promise<void> {
  await setDoc(doc(db, 'app_config', 'feedCards'), {
    cards,
    updatedAt: serverTimestamp(),
  });
}

// 2. Fetch & Save Pricing Rules
export async function fetchMobilePricing(): Promise<MobilePricingRule[]> {
  try {
    const snap = await getDoc(doc(db, 'app_config', 'pricing_rules'));
    if (snap.exists() && snap.data()?.rules) {
      return snap.data().rules as MobilePricingRule[];
    }
  } catch (err) {
    console.warn('Using default pricing:', err);
  }
  return DEFAULT_PRICING;
}

export async function saveMobilePricing(rules: MobilePricingRule[]): Promise<void> {
  await setDoc(doc(db, 'app_config', 'pricing_rules'), {
    rules,
    updatedAt: serverTimestamp(),
  });
}

// 3. Fetch & Save Payment Configuration
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

// 4. Send & Log Push Notifications
export async function sendMobilePushNotification(
  payload: Omit<PushNotificationPayload, 'id' | 'sentAt' | 'status'>
): Promise<string> {
  const notifRef = doc(collection(db, 'mobile_push_notifications'));
  await setDoc(notifRef, {
    ...payload,
    id: notifRef.id,
    sentAt: serverTimestamp(),
    status: 'sent',
  });
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

// 5. Upload Image Directly to Firebase Storage
export async function uploadMobileImage(file: File, folder = 'mobile_app_assets'): Promise<string> {
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${folder}/${Date.now()}_${sanitizedName}`;
  const fileRef = ref(storage, filename);
  await uploadBytes(fileRef, file, { contentType: file.type });
  return await getDownloadURL(fileRef);
}
