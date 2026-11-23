/**
 * Client-side interface to the secure /api/travel backend
 * (Cloudflare Pages Function / Express proxy).
 */

export interface LiveFlightOffer {
  id: string;
  provider: "duffel" | "amadeus";
  liveBookable: boolean;
  airline: string;
  airlineCode: string;
  airlineLogo?: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  cabin: string;
  price: number;
  currency: string;
  passengerIds?: string[];
  expiresAt?: string;
}

export interface LiveHotelOffer {
  hotelId: string;
  propertyToken?: string;
  offerId: string;
  rateId: string;
  provider: "liteapi" | "amadeus" | "searchapi_google_hotels";
  liveBookable: boolean;
  name: string;
  stars: number;
  address: string;
  city: string;
  image: string;
  images?: string[];
  amenities?: string[];
  rating?: number;
  reviewsCount?: number;
  link?: string;
  roomName: string;
  boardType: string;
  refundable: boolean;
  price?: number;
  totalAmount?: number;
  currency: string;
}

export interface TravelProviderStatus {
  ok: boolean;
  providers?: {
    duffel: { configured: boolean; mode: "test" | "live"; capabilities: string[] };
    liteapi: { configured: boolean; mode: "sandbox" | "live"; capabilities: string[] };
    amadeus: { configured: boolean; mode: "test" | "live"; capabilities: string[] };
  };
}

const TRAVEL_ENDPOINT = "/api/travel";

export async function getTravelProviderStatus(): Promise<TravelProviderStatus> {
  try {
    const res = await fetch(`${TRAVEL_ENDPOINT}?action=status`);
    if (!res.ok) return { ok: false };
    return await res.json();
  } catch {
    return { ok: false };
  }
}

export async function searchLiveFlights(params: {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  cabin?: string;
  directOnly?: boolean;
  currency?: string;
}): Promise<{
  ok: boolean;
  provider?: string;
  needsConfiguration?: boolean;
  error?: string;
  offers: LiveFlightOffer[];
}> {
  const res = await fetch(TRAVEL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "search_flights", ...params }),
  });
  return await res.json();
}

export async function bookLiveFlight(params: {
  offerId: string;
  amount: number;
  currency: string;
  holdOrder?: boolean;
  passengers: Array<{
    id?: string;
    title?: "mr" | "mrs" | "ms" | "miss";
    gender?: "m" | "f";
    firstName: string;
    lastName: string;
    bornOn: string;
    email: string;
    phone: string;
    passportNumber?: string;
    nationality?: string;
    passportExpiry?: string;
  }>;
}) {
  const res = await fetch(TRAVEL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "book_flight", ...params }),
  });
  return await res.json();
}

export async function searchLiveHotels(params: {
  city: string;
  countryCode?: string;
  checkin: string;
  checkout: string;
  adults?: number;
  currency?: string;
  nationality?: string;
}): Promise<{
  ok: boolean;
  provider?: string;
  needsConfiguration?: boolean;
  error?: string;
  hotels: LiveHotelOffer[];
}> {
  const res = await fetch(TRAVEL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "search_hotels", ...params }),
  });
  return await res.json();
}

export async function prebookLiveHotel(offerId: string) {
  const res = await fetch(TRAVEL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "prebook_hotel", offerId }),
  });
  return await res.json();
}

export async function bookLiveHotel(params: {
  prebookId: string;
  holder: { firstName: string; lastName: string; email: string };
  guests: Array<{ occupancyNumber: number; firstName: string; lastName: string; email: string }>;
}) {
  const res = await fetch(TRAVEL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "book_hotel", ...params }),
  });
  return await res.json();
}

// ─── Extended SearchApi Endpoints ────────────────────────────────────────────

async function postTravelAction<T = any>(action: string, params: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(TRAVEL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...params }),
  });
  return await res.json();
}

export async function searchFlightLocations(q: string) {
  return postTravelAction<{ ok: boolean; locations: any[] }>("flights_locations", { q });
}

export async function getFlightsCalendar(params: {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  flightType?: "round_trip" | "one_way";
  currency?: string;
}) {
  return postTravelAction<{ ok: boolean; calendar: any[]; error?: string }>("flights_calendar", params);
}

export async function getFlightsDeals(params: { origin: string; currency?: string }) {
  return postTravelAction<{ ok: boolean; deals: any[]; error?: string }>("flights_deals", params);
}

export async function getTravelExploreDestination(params: {
  origin: string;
  arrivalId?: string;
  destinationName?: string;
  departureDate?: string;
  returnDate?: string;
  currency?: string;
}) {
  return postTravelAction<{ ok: boolean; data: any; error?: string }>("travel_explore", params);
}

export async function searchHotelsAutocomplete(q: string) {
  return postTravelAction<{ ok: boolean; suggestions: any[] }>("hotels_autocomplete", { q });
}

export async function getHotelPropertyDetails(params: {
  propertyToken: string;
  checkin?: string;
  checkout?: string;
  adults?: number;
  currency?: string;
}) {
  return postTravelAction<{ ok: boolean; property: any; error?: string }>("hotel_property", params);
}

export async function getHotelPriceCalendar(params: {
  propertyToken: string;
  checkin?: string;
  checkout?: string;
  currency?: string;
}) {
  return postTravelAction<{ ok: boolean; calendar: any[]; error?: string }>("hotel_price_calendar", params);
}

export async function searchAirbnbProperties(params: {
  q: string;
  checkin?: string;
  checkout?: string;
  adults?: number;
  currency?: string;
  priceMax?: number;
  propertyType?: string;
}) {
  return postTravelAction<{ ok: boolean; properties: any[]; pagination?: any; error?: string }>("airbnb_search", params);
}

export async function getAirbnbPropertyDetails(params: {
  propertyId: string;
  checkin?: string;
  checkout?: string;
  adults?: number;
  currency?: string;
}) {
  return postTravelAction<{ ok: boolean; property: any; error?: string }>("airbnb_property", params);
}

export async function getInstagramTrends(topicOrHandle: string) {
  return postTravelAction<{ ok: boolean; source?: string; profile?: any; posts: any[]; error?: string }>(
    "instagram_trends",
    { topicOrHandle }
  );
}
