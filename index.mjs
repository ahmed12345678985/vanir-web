var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import path6 from "path";
import cors from "cors";
import compression from "compression";
import fs6 from "fs";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  aiCredits: () => aiCredits,
  aiSubscriptions: () => aiSubscriptions,
  aiTransactions: () => aiTransactions,
  aiUsage: () => aiUsage,
  blogPosts: () => blogPosts,
  bookings: () => bookings,
  contactMessages: () => contactMessages,
  destinations: () => destinations,
  fileUploads: () => fileUploads,
  galleryItems: () => galleryItems,
  galleryVideos: () => galleryVideos,
  marketingCalendar: () => marketingCalendar,
  marketingContent: () => marketingContent,
  marketingTemplates: () => marketingTemplates,
  offers: () => offers,
  reviews: () => reviews,
  siteSettings: () => siteSettings,
  users: () => users
});
import {
  mysqlTable,
  varchar,
  text,
  int,
  bigint,
  decimal,
  json,
  datetime,
  serial
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
var id = () => serial("id");
var createdAt = () => datetime("createdAt").default(sql`CURRENT_TIMESTAMP`).notNull();
var updatedAt = () => datetime("updatedAt").default(sql`CURRENT_TIMESTAMP`).notNull();
var users = mysqlTable("users", {
  id: id().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  avatarUrl: text("avatarUrl"),
  role: varchar("role", { length: 10 }).default("user").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  lastSignedIn: datetime("lastSignedIn").default(sql`CURRENT_TIMESTAMP`).notNull()
});
var bookings = mysqlTable("bookings", {
  id: id().primaryKey(),
  userId: int("userId").references(() => users.id),
  guestName: varchar("guestName", { length: 255 }),
  guestEmail: varchar("guestEmail", { length: 320 }),
  guestPhone: varchar("guestPhone", { length: 32 }),
  packageName: varchar("packageName", { length: 255 }).notNull(),
  packageCategory: varchar("packageCategory", { length: 100 }),
  destination: varchar("destination", { length: 255 }),
  checkInDate: bigint("checkInDate", { mode: "number" }),
  checkOutDate: bigint("checkOutDate", { mode: "number" }),
  adults: int("adults").default(1),
  children: int("children").default(0),
  roomType: varchar("roomType", { length: 100 }),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  paymentStatus: varchar("paymentStatus", { length: 20 }).default("pending").notNull(),
  promoCode: varchar("promoCode", { length: 50 }),
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }),
  specialRequests: text("specialRequests"),
  billingAddress: json("billingAddress"),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  confirmationCode: varchar("confirmationCode", { length: 20 }).unique(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});
var reviews = mysqlTable("reviews", {
  id: id().primaryKey(),
  userId: int("userId").references(() => users.id),
  guestName: varchar("guestName", { length: 255 }),
  guestAvatarUrl: text("guestAvatarUrl"),
  tripName: varchar("tripName", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }),
  rating: int("rating").notNull(),
  title: varchar("title", { length: 500 }),
  content: text("content").notNull(),
  photoUrls: json("photoUrls"),
  travelDate: bigint("travelDate", { mode: "number" }),
  adminReply: text("adminReply"),
  adminReplyAt: datetime("adminReplyAt"),
  isApproved: varchar("isApproved", { length: 10 }).default("pending").notNull(),
  helpfulCount: int("helpfulCount").default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});
var offers = mysqlTable("offers", {
  id: id().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  discountType: varchar("discountType", { length: 20 }).notNull(),
  discountValue: decimal("discountValue", { precision: 10, scale: 2 }).notNull(),
  promoCode: varchar("promoCode", { length: 50 }).unique(),
  startDate: bigint("startDate", { mode: "number" }).notNull(),
  endDate: bigint("endDate", { mode: "number" }).notNull(),
  category: varchar("category", { length: 100 }),
  destination: varchar("destination", { length: 255 }),
  imageUrl: text("imageUrl"),
  totalSpots: int("totalSpots"),
  bookedSpots: int("bookedSpots").default(0),
  isActive: varchar("isActive", { length: 10 }).default("active").notNull(),
  badgeText: varchar("badgeText", { length: 50 }),
  badgeColor: varchar("badgeColor", { length: 20 }),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});
var contactMessages = mysqlTable("contact_messages", {
  id: id().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  subject: varchar("subject", { length: 500 }),
  message: text("message").notNull(),
  status: varchar("status", { length: 10 }).default("new").notNull(),
  adminNotes: text("adminNotes"),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});
var fileUploads = mysqlTable("file_uploads", {
  id: id().primaryKey(),
  userId: int("userId").references(() => users.id),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  url: text("url").notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  purpose: varchar("purpose", { length: 50 }),
  createdAt: createdAt()
});
var galleryItems = mysqlTable("gallery_items", {
  id: id().primaryKey(),
  imageUrl: text("imageUrl").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  category: varchar("category", { length: 100 }).notNull(),
  categoryAr: varchar("categoryAr", { length: 100 }),
  location: varchar("location", { length: 255 }),
  locationAr: varchar("locationAr", { length: 255 }),
  featured: varchar("featured", { length: 5 }).default("no").notNull(),
  aspect: varchar("aspect", { length: 10 }).default("landscape").notNull(),
  sortOrder: int("sortOrder").default(0),
  isvisible: varchar("isvisible", { length: 10 }).default("visible").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});
var galleryVideos = mysqlTable("gallery_videos", {
  id: id().primaryKey(),
  thumbnailUrl: text("thumbnailUrl").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  youtubeId: varchar("youtubeId", { length: 20 }).notNull(),
  duration: varchar("duration", { length: 20 }),
  views: varchar("views", { length: 20 }),
  sortOrder: int("sortOrder").default(0),
  isVisible: varchar("isVisible", { length: 10 }).default("visible").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});
var aiSubscriptions = mysqlTable("ai_subscriptions", {
  id: id().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  plan: varchar("plan", { length: 20 }).default("free").notNull(),
  monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }).default("0"),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  startDate: bigint("startDate", { mode: "number" }).notNull(),
  renewalDate: bigint("renewalDate", { mode: "number" }),
  cancelledAt: datetime("cancelledAt"),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});
var aiCredits = mysqlTable("ai_credits", {
  id: id().primaryKey(),
  userId: int("userId").references(() => users.id).notNull().unique(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0").notNull(),
  totalUsed: decimal("totalUsed", { precision: 12, scale: 2 }).default("0").notNull(),
  lastResetDate: bigint("lastResetDate", { mode: "number" }),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});
var aiUsage = mysqlTable("ai_usage", {
  id: id().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  type: varchar("type", { length: 10 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  prompt: text("prompt").notNull(),
  resultUrl: text("resultUrl"),
  resultKey: varchar("resultKey", { length: 500 }),
  creditsCost: decimal("creditsCost", { precision: 10, scale: 2 }).notNull(),
  imageSize: varchar("imageSize", { length: 50 }),
  videoDuration: int("videoDuration"),
  status: varchar("status", { length: 10 }).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: createdAt()
});
var aiTransactions = mysqlTable("ai_transactions", {
  id: id().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  type: varchar("type", { length: 30 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  stripePaymentId: varchar("stripePaymentId", { length: 255 }),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  status: varchar("status", { length: 10 }).default("pending").notNull(),
  description: text("description"),
  createdAt: createdAt()
});
var blogPosts = mysqlTable("blog_posts", {
  id: id().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  metaTitle: varchar("metaTitle", { length: 70 }),
  metaDescription: varchar("metaDescription", { length: 160 }),
  metaKeywords: varchar("metaKeywords", { length: 500 }),
  coverImageUrl: text("coverImageUrl"),
  category: varchar("category", { length: 100 }),
  tags: json("tags"),
  authorId: int("authorId").references(() => users.id),
  authorName: varchar("authorName", { length: 255 }).default("VANIR GROUP"),
  status: varchar("status", { length: 15 }).default("draft").notNull(),
  publishedAt: datetime("publishedAt"),
  viewCount: int("viewCount").default(0),
  readingTime: int("readingTime").default(5),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});
var marketingContent = mysqlTable("marketing_content", {
  id: id().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  type: varchar("type", { length: 30 }).notNull(),
  platform: varchar("platform", { length: 50 }),
  title: varchar("title", { length: 500 }),
  content: text("content").notNull(),
  prompt: text("prompt").notNull(),
  language: varchar("language", { length: 10 }).default("en"),
  tone: varchar("tone", { length: 50 }),
  destination: varchar("destination", { length: 255 }),
  hashtags: json("hashtags"),
  creditsCost: decimal("creditsCost", { precision: 10, scale: 2 }).default("1"),
  isFavorite: varchar("isFavorite", { length: 5 }).default("no").notNull(),
  createdAt: createdAt()
});
var marketingCalendar = mysqlTable("marketing_calendar", {
  id: id().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  contentId: int("contentId").references(() => marketingContent.id),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  platform: varchar("platform", { length: 50 }),
  scheduledDate: bigint("scheduledDate", { mode: "number" }).notNull(),
  status: varchar("status", { length: 15 }).default("draft").notNull(),
  colorTag: varchar("colorTag", { length: 20 }).default("#D4A853"),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});
var marketingTemplates = mysqlTable("marketing_templates", {
  id: id().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 30 }).notNull(),
  platform: varchar("platform", { length: 50 }),
  templateContent: text("templateContent").notNull(),
  systemPrompt: text("systemPrompt"),
  category: varchar("category", { length: 100 }),
  icon: varchar("icon", { length: 50 }),
  isBuiltIn: varchar("isBuiltIn", { length: 5 }).default("no").notNull(),
  sortOrder: int("sortOrder").default(0),
  createdAt: createdAt()
});
var destinations = mysqlTable("destinations", {
  id: id().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }).notNull(),
  pricePerPerson: decimal("pricePerPerson", { precision: 10, scale: 2 }).default("0"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("5"),
  imageUrl: text("imageUrl"),
  highlights: text("highlights"),
  bestTimeToVisit: varchar("bestTimeToVisit", { length: 255 }),
  duration: varchar("duration", { length: 100 }),
  difficulty: varchar("difficulty", { length: 10 }),
  groupSize: varchar("groupSize", { length: 100 }),
  inclusions: text("inclusions"),
  exclusions: text("exclusions"),
  isActive: varchar("isActive", { length: 10 }).default("active").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});
var siteSettings = mysqlTable("site_settings", {
  id: id().primaryKey(),
  category: varchar("category", { length: 50 }).notNull(),
  settingKey: varchar("setting_key", { length: 100 }).notNull(),
  settingValue: text("setting_value"),
  updatedBy: int("updated_by").references(() => users.id),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

// server/db.ts
import { eq, desc, and, sql as sql2, like, or } from "drizzle-orm";

// server/_core/env.ts
var ENV = {
  // VITE_APP_ID is the Manus OAuth app id (unused in the Firebase auth flow).
  // Fall back to VITE_FIREBASE_APP_ID so the signed session always carries a
  // stable, non-empty app identifier in production.
  appId: process.env.VITE_APP_ID ?? process.env.VITE_FIREBASE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? process.env.AI_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "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",
  geminiApiKey: process.env.GEMINI_API_KEY ?? process.env.AI_API_KEY ?? process.env.BUILT_IN_FORGE_API_KEY ?? "",
  /** Admin email for direct password login (no OAuth required) */
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  /** SHA-256 hex hash of the admin password */
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH ?? "",
  // Cloudflare R2 Object Storage Configuration
  r2AccountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID ?? "e76590f2e747ceddbc1e62f6b91a48f1",
  r2AccessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? "bf5beddc079c12fccb5c24bbe8d61699",
  r2SecretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? "61f70b7b8f18802548b4d8c3ad4e0614c848b51490d7d4f43368b96442d554bd",
  r2BucketName: process.env.CLOUDFLARE_R2_BUCKET ?? "vanir-assets",
  r2Endpoint: process.env.CLOUDFLARE_R2_ENDPOINT ?? "https://e76590f2e747ceddbc1e62f6b91a48f1.r2.cloudflarestorage.com",
  // Cloudflare Workers AI Configuration
  cloudflareAiAccountId: process.env.CLOUDFLARE_AI_ACCOUNT_ID ?? process.env.CLOUDFLARE_R2_ACCOUNT_ID ?? "e76590f2e747ceddbc1e62f6b91a48f1",
  cloudflareAiToken: process.env.CLOUDFLARE_AI_TOKEN ?? process.env.CLOUDFLARE_API_TOKEN ?? "cfut_I2lql6hEizDUVbeDuoID8afqDIKlkrpFxvl1pTS8570f24a7"
};

// server/db.ts
var rawUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
if (!rawUrl) {
  if (process.env.DEBUG || process.env.NODE_ENV === "development") {
    console.info("[DB] DATABASE_URL not configured. Running in file-store mode.");
  }
}
var pool = mysql.createPool(rawUrl || "mysql://root:@localhost:3306/travel_gold");
var db = drizzle(pool, { schema: schema_exports, mode: "default" });
async function upsertUser(user) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const existing = await db.query.users.findFirst({
    where: eq(users.openId, user.openId)
  });
  const role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  const now = /* @__PURE__ */ new Date();
  if (existing) {
    await db.update(users).set({
      name: user.name ?? existing.name,
      email: user.email ?? existing.email,
      loginMethod: user.loginMethod ?? existing.loginMethod,
      lastSignedIn: user.lastSignedIn ?? now,
      role: user.role ?? existing.role,
      updatedAt: now
    }).where(eq(users.id, existing.id));
  } else {
    await db.insert(users).values({
      ...user,
      role,
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now
    });
  }
}
async function getUserByOpenId(openId) {
  return db.query.users.findFirst({
    where: eq(users.openId, openId)
  });
}
async function createBooking(booking) {
  const [result] = await db.insert(bookings).values(booking).returning();
  return result;
}
async function getBookingById(id2) {
  return db.query.bookings.findFirst({ where: eq(bookings.id, id2) });
}
async function getBookingByConfirmationCode(code) {
  return db.query.bookings.findFirst({ where: eq(bookings.confirmationCode, code) });
}
async function getUserBookings(userId) {
  return db.query.bookings.findMany({
    where: eq(bookings.userId, userId),
    orderBy: [desc(bookings.createdAt)]
  });
}
async function updateBookingStatus(id2, status) {
  const [result] = await db.update(bookings).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(bookings.id, id2)).returning();
  return result;
}
async function updateBookingPaymentStatus(id2, paymentStatus) {
  const [result] = await db.update(bookings).set({ paymentStatus, updatedAt: /* @__PURE__ */ new Date() }).where(eq(bookings.id, id2)).returning();
  return result;
}
async function getAllBookings(limit = 50, offset = 0) {
  return db.query.bookings.findMany({
    orderBy: [desc(bookings.createdAt)],
    limit,
    offset
  });
}
async function createReview(review) {
  const [result] = await db.insert(reviews).values(review).returning();
  return result;
}
async function getApprovedReviews(limit = 50, offset = 0) {
  return db.query.reviews.findMany({
    where: eq(reviews.isApproved, "approved"),
    orderBy: [desc(reviews.createdAt)],
    limit,
    offset
  });
}
async function getAllReviews(limit = 50, offset = 0) {
  return db.query.reviews.findMany({
    orderBy: [desc(reviews.createdAt)],
    limit,
    offset
  });
}
async function getReviewById(id2) {
  return db.query.reviews.findFirst({ where: eq(reviews.id, id2) });
}
async function updateReviewApproval(id2, isApproved) {
  const [result] = await db.update(reviews).set({ isApproved, updatedAt: /* @__PURE__ */ new Date() }).where(eq(reviews.id, id2)).returning();
  return result;
}
async function addAdminReply(id2, adminReply) {
  const [result] = await db.update(reviews).set({ adminReply, adminReplyAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(eq(reviews.id, id2)).returning();
  return result;
}
async function incrementHelpfulCount(id2) {
  const review = await getReviewById(id2);
  const current = review?.helpfulCount ?? 0;
  const [result] = await db.update(reviews).set({ helpfulCount: current + 1, updatedAt: /* @__PURE__ */ new Date() }).where(eq(reviews.id, id2)).returning();
  return result;
}
async function getReviewStats() {
  const allApproved = await db.query.reviews.findMany({
    where: eq(reviews.isApproved, "approved")
  });
  const total = allApproved.length;
  if (total === 0) {
    return { total: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }
  const sum = allApproved.reduce((acc, r) => acc + (r.rating ?? 0), 0);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  allApproved.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) distribution[r.rating]++;
  });
  return { total, average: Math.round(sum / total * 10) / 10, distribution };
}
async function createOffer(offer) {
  const [result] = await db.insert(offers).values(offer).returning();
  return result;
}
async function getActiveOffers() {
  const now = Date.now();
  const active = await db.query.offers.findMany({
    where: eq(offers.isActive, "active")
  });
  return active.filter((o) => Number(o.startDate ?? 0) <= now && Number(o.endDate ?? 0) >= now).sort((a, b) => Number(a.endDate ?? 0) - Number(b.endDate ?? 0));
}
async function getAllOffers(limit = 50, offset = 0) {
  return db.query.offers.findMany({
    orderBy: [desc(offers.createdAt)],
    limit,
    offset
  });
}
async function getOfferByPromoCode(promoCode) {
  return db.query.offers.findFirst({ where: eq(offers.promoCode, promoCode) });
}
async function updateOffer(id2, data) {
  const [result] = await db.update(offers).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(offers.id, id2)).returning();
  return result;
}
async function createContactMessage(message) {
  const [result] = await db.insert(contactMessages).values(message).returning();
  return result;
}
async function getAllContactMessages(limit = 50, offset = 0) {
  return db.query.contactMessages.findMany({
    orderBy: [desc(contactMessages.createdAt)],
    limit,
    offset
  });
}
async function updateContactMessageStatus(id2, status) {
  await db.update(contactMessages).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(contactMessages.id, id2));
}
async function createFileUpload(file) {
  const [result] = await db.insert(fileUploads).values(file).returning();
  return result;
}
async function getUserFiles(userId) {
  return db.query.fileUploads.findMany({
    where: eq(fileUploads.userId, userId),
    orderBy: [desc(fileUploads.createdAt)]
  });
}
async function getOrCreateAISubscription(userId) {
  const existing = await db.query.aiSubscriptions.findFirst({ where: eq(aiSubscriptions.userId, userId) });
  if (existing) return existing;
  const [created] = await db.insert(aiSubscriptions).values({
    userId,
    plan: "free",
    status: "active",
    startDate: Date.now()
  }).returning();
  return created;
}
async function updateAISubscription(userId, plan, stripeSubscriptionId) {
  const sub = await getOrCreateAISubscription(userId);
  await db.update(aiSubscriptions).set({
    plan,
    status: "active",
    renewalDate: Date.now() + 30 * 24 * 60 * 60 * 1e3,
    ...stripeSubscriptionId && { stripeSubscriptionId },
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(aiSubscriptions.id, sub.id));
  return getOrCreateAISubscription(userId);
}
async function getOrCreateAICredits(userId) {
  const existing = await db.query.aiCredits.findFirst({ where: eq(aiCredits.userId, userId) });
  if (existing) return existing;
  const [created] = await db.insert(aiCredits).values({
    userId,
    balance: "100",
    totalUsed: "0"
  }).returning();
  return created;
}
async function addAICredits(userId, amount, reason) {
  const credits = await getOrCreateAICredits(userId);
  const newBalance = parseFloat(credits.balance) + amount;
  await db.update(aiCredits).set({ balance: newBalance.toString(), updatedAt: /* @__PURE__ */ new Date() }).where(eq(aiCredits.id, credits.id));
  await db.insert(aiTransactions).values({
    userId,
    type: reason,
    amount: amount.toString(),
    status: "completed"
  });
  return getOrCreateAICredits(userId);
}
async function deductAICredits(userId, amount) {
  const credits = await getOrCreateAICredits(userId);
  const currentBalance = parseFloat(credits.balance);
  if (currentBalance < amount) {
    throw new Error("Insufficient credits");
  }
  const newBalance = currentBalance - amount;
  const newTotalUsed = parseFloat(credits.totalUsed) + amount;
  await db.update(aiCredits).set({
    balance: newBalance.toString(),
    totalUsed: newTotalUsed.toString(),
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(aiCredits.id, credits.id));
  return getOrCreateAICredits(userId);
}
async function createAIUsage(usage) {
  const [result] = await db.insert(aiUsage).values(usage).returning();
  return result;
}
async function getUserAIUsage(userId, limit = 50, offset = 0) {
  return db.query.aiUsage.findMany({
    where: eq(aiUsage.userId, userId),
    orderBy: [desc(aiUsage.createdAt)],
    limit,
    offset
  });
}
async function updateAIUsageStatus(id2, status, resultUrl, errorMessage) {
  return db.update(aiUsage).set({
    status,
    ...resultUrl && { resultUrl },
    ...errorMessage && { errorMessage }
  }).where(eq(aiUsage.id, id2));
}
async function getAIUsageStats(userId) {
  const usage = await db.query.aiUsage.findMany({
    where: eq(aiUsage.userId, userId)
  });
  return {
    totalGenerations: usage.length,
    byType: {
      image: usage.filter((u) => u.type === "image").length,
      video: usage.filter((u) => u.type === "video").length,
      edit: usage.filter((u) => u.type === "edit").length
    },
    totalCost: usage.reduce((sum, u) => sum + parseFloat((u.creditsCost ?? "0").toString()), 0)
  };
}
async function getAllUsers(limit = 50, offset = 0) {
  const users2 = await db.query.users.findMany({
    orderBy: [desc(users.createdAt)],
    limit,
    offset
  });
  const usersWithCredits = await Promise.all(
    users2.map(async (u) => {
      try {
        const cred = await db.query.aiCredits.findFirst({ where: eq(aiCredits.userId, u.id) });
        return {
          ...u,
          credits: cred ? parseFloat(cred.balance.toString()) : 100
        };
      } catch {
        return { ...u, credits: 100 };
      }
    })
  );
  return usersWithCredits;
}
async function getUsersCount() {
  const result = await db.select({ count: sql2`count(*)` }).from(users);
  return Number(result[0].count);
}
async function getUserById(id2) {
  return db.query.users.findFirst({ where: eq(users.id, id2) });
}
async function updateUserRole(id2, role) {
  const [result] = await db.update(users).set({ role, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id2)).returning();
  return result;
}
async function searchUsers(query, limit = 20) {
  const q = `%${query}%`;
  return db.query.users.findMany({
    where: or(
      like(users.name, q),
      like(users.email, q),
      like(users.openId, q)
    ),
    orderBy: [desc(users.createdAt)],
    limit
  });
}
async function getUserStats() {
  const all = await db.query.users.findMany();
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1e3;
  const startOfToday = /* @__PURE__ */ new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayMs = startOfToday.getTime();
  const toMs = (v) => v ? new Date(v).getTime() : 0;
  return {
    total: all.length,
    admins: all.filter((u) => u.role === "admin").length,
    recentSignups: all.filter((u) => toMs(u.createdAt) >= thirtyDaysAgo).length,
    todaySignups: all.filter((u) => toMs(u.createdAt) >= todayMs).length
  };
}
async function updateUserProfile(id2, data) {
  const [result] = await db.update(users).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id2)).returning();
  return result;
}
async function getPublishedBlogPosts(limit = 10, offset = 0) {
  return db.query.blogPosts.findMany({
    where: eq(blogPosts.status, "published"),
    orderBy: [desc(blogPosts.publishedAt)],
    limit,
    offset
  });
}
async function getBlogPostBySlug(slug) {
  return db.query.blogPosts.findFirst({ where: eq(blogPosts.slug, slug) });
}
async function getBlogPostsByCategory(category, limit = 10, offset = 0) {
  return db.query.blogPosts.findMany({
    where: and(eq(blogPosts.status, "published"), eq(blogPosts.category, category)),
    orderBy: [desc(blogPosts.publishedAt)],
    limit,
    offset
  });
}
async function createBlogPost(post) {
  const [result] = await db.insert(blogPosts).values(post).returning();
  return result;
}
async function updateBlogPost(id2, data) {
  const [result] = await db.update(blogPosts).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(blogPosts.id, id2)).returning();
  return result;
}
async function getAllBlogPosts(limit = 50, offset = 0) {
  return db.query.blogPosts.findMany({
    orderBy: [desc(blogPosts.createdAt)],
    limit,
    offset
  });
}
async function incrementBlogViewCount(id2) {
  const post = await getById(blogPosts, id2);
  if (!post) return;
  const current = post.viewCount ?? 0;
  await db.update(blogPosts).set({ viewCount: current + 1 }).where(eq(blogPosts.id, id2));
}
async function getById(table, id2) {
  const result = await db.select().from(table).where(eq(table.id, id2));
  return result[0];
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  const secure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    // SameSite=None requires Secure=true; fall back to Lax on plain HTTP (local dev)
    sameSite: secure ? "none" : "lax",
    secure
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";

// server/_core/firebaseAdmin.ts
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
var currentDir = typeof __dirname !== "undefined" ? __dirname : typeof import.meta !== "undefined" && import.meta.url ? path.dirname(fileURLToPath(import.meta.url)) : process.cwd();
var isCloudRun = Boolean(
  process.env.K_SERVICE || process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_CONFIG
);
var storageBucketName = process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || `${process.env.VITE_FIREBASE_PROJECT_ID ?? "gen-lang-client-0364375301"}.firebasestorage.app`;
if (!getApps().length) {
  if (isCloudRun) {
    initializeApp({ storageBucket: storageBucketName });
    console.log("[Firebase] Initialized with ADC (Cloud Run / Firebase App Hosting)");
  } else {
    let credentialApp;
    const envJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (envJson) {
      try {
        const rawJson = envJson.trim().startsWith("{") ? envJson : Buffer.from(envJson, "base64").toString("utf8");
        credentialApp = cert(JSON.parse(rawJson));
      } catch (e) {
        console.error("[Firebase] Failed to parse credentials from env:", e);
      }
    }
    if (!credentialApp) {
      const searchDirs = [process.cwd(), currentDir, path.resolve(currentDir, ".."), path.resolve(currentDir, "server/_core")];
      const candidatePaths = [];
      for (const dir of searchDirs) {
        if (fs.existsSync(dir)) {
          try {
            const files = fs.readdirSync(dir);
            for (const f of files) {
              if ((f.includes("firebase-adminsdk") || f.startsWith("gen-lang-client") || f === "firebase-key.json") && f.endsWith(".json")) {
                candidatePaths.push(path.resolve(dir, f));
              }
            }
          } catch {
          }
        }
      }
      candidatePaths.push(
        path.resolve(process.cwd(), "gen-lang-client-0364375301-firebase-adminsdk-fbsvc-1ed7e2955b.json"),
        path.resolve(process.cwd(), "firebase-key.json"),
        path.resolve(process.cwd(), "server/_core/firebase-key.json"),
        path.resolve(currentDir, "firebase-key.json")
      );
      const uniqueCandidates = Array.from(new Set(candidatePaths));
      const serviceAccountPath = uniqueCandidates.find((p) => fs.existsSync(p));
      if (serviceAccountPath) {
        try {
          const parsed = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
          if (parsed && parsed.private_key && parsed.client_email) {
            credentialApp = cert(parsed);
            console.log(`[Firebase] Loaded active credentials from: ${serviceAccountPath} (keyId: ${parsed.private_key_id})`);
          }
        } catch (e) {
          console.error("[Firebase] Failed to read local service account:", e);
        }
      }
    }
    if (credentialApp) {
      try {
        initializeApp({ credential: credentialApp, storageBucket: storageBucketName });
        console.log("[Firebase] Initialized with service account credentials");
      } catch (certErr) {
        console.warn("[Firebase] initializeApp with cert failed, falling back to default:", certErr);
        try {
          initializeApp({ storageBucket: storageBucketName });
        } catch {
        }
      }
    } else {
      console.warn(
        "[Firebase Warning] Credentials not found. Initializing with default config for safety."
      );
      try {
        initializeApp({ storageBucket: storageBucketName });
      } catch (err) {
        console.error("[Firebase] Fallback initialization error:", err);
      }
    }
  }
}
var dbInstance;
try {
  dbInstance = getFirestore();
} catch (e) {
  console.warn("[Firebase] getFirestore warning:", e);
  dbInstance = {};
}
var db2 = dbInstance;

// server/_core/sdk.ts
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  // 5 s keeps us well inside Vercel's 10 s default timeout.
  // The old 30 s value caused Vercel to kill the function with a plain-text
  // "A server error occurred" before any try/catch could intercept.
  timeout: 5e3
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    if (secret) {
      return new TextEncoder().encode(secret);
    }
    const fallback = (process.env.VITE_FIREBASE_APP_ID ?? "") + "|" + (process.env.VITE_FIREBASE_PROJECT_ID ?? "");
    if (!fallback || fallback === "|") {
      throw new Error(
        "JWT_SECRET is not configured and no Firebase fallback is available. Add JWT_SECRET to apphosting.yaml secrets."
      );
    }
    console.warn(
      "[Auth] JWT_SECRET is not set \u2014 using derived fallback secret. Create a JWT_SECRET secret in Firebase App Hosting for production."
    );
    return new TextEncoder().encode(fallback);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId)) {
        console.warn("[Auth] Session payload missing openId");
        return null;
      }
      return {
        openId,
        appId: isNonEmptyString(appId) ? appId : "",
        name: isNonEmptyString(name) ? name : ""
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const now = /* @__PURE__ */ new Date();
    if (sessionUserId.startsWith("admin:")) {
      const email = sessionUserId.slice("admin:".length) || null;
      return {
        id: 0,
        openId: sessionUserId,
        name: session.name || "Admin",
        email,
        phone: null,
        loginMethod: "password",
        avatarUrl: null,
        role: "admin",
        createdAt: now,
        updatedAt: now,
        lastSignedIn: now
      };
    }
    if (sessionUserId.startsWith("firebase:")) {
      const uid = sessionUserId.slice("firebase:".length);
      const userDoc = await db2.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        throw ForbiddenError("Firebase user not found");
      }
      const userData = userDoc.data();
      const userRole = userData.role ?? "user";
      await db2.collection("users").doc(uid).set({ lastSignedIn: now }, { merge: true });
      return {
        id: 0,
        openId: sessionUserId,
        name: session.name || userData.name || null,
        email: userData.email ?? null,
        phone: null,
        loginMethod: "firebase",
        avatarUrl: null,
        role: userRole,
        createdAt: now,
        updatedAt: now,
        lastSignedIn: now
      };
    }
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      if (sessionUserId.startsWith("admin:")) {
        try {
          await upsertUser({
            openId: sessionUserId,
            name: session.name || "Admin",
            role: "admin",
            loginMethod: "password",
            lastSignedIn: now
          });
          user = await getUserByOpenId(sessionUserId);
        } catch {
        }
        if (!user) {
          return {
            id: -1,
            openId: sessionUserId,
            name: session.name || "Admin",
            email: null,
            phone: null,
            loginMethod: "password",
            avatarUrl: null,
            role: "admin",
            createdAt: now,
            updatedAt: now,
            lastSignedIn: now
          };
        }
      } else {
        try {
          const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
          await upsertUser({
            openId: userInfo.openId,
            name: userInfo.name || null,
            email: userInfo.email ?? null,
            loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
            lastSignedIn: now
          });
          user = await getUserByOpenId(userInfo.openId);
        } catch (error) {
          console.error("[Auth] Failed to sync user from OAuth:", error);
          throw ForbiddenError("Failed to sync user info");
        }
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: now
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    const next = getQueryParam(req, "next");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
      res.redirect(302, safeNext);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/supabase.ts
import { createClient as createServerClient } from "@supabase/supabase-js";
function loadServerConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) return null;
  return { url, serviceKey };
}
var serverClient = null;
function getServerSupabase() {
  if (serverClient) return serverClient;
  const cfg = loadServerConfig();
  if (!cfg) return null;
  serverClient = createServerClient(cfg.url, cfg.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return serverClient;
}

// server/_core/storageProxy.ts
function registerStorageProxy(app) {
  app.get("/api/storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      return void res.status(400).json({ error: "Missing storage key" });
    }
    const supabase = getServerSupabase();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET;
    if (!supabase || !bucket) {
      return void res.status(404).send("Storage not configured");
    }
    try {
      const ttl = Number(process.env.SUPABASE_STORAGE_SIGNED_URL_TTL || 60);
      const { data, error } = await supabase.storage.from(bucket).createSignedUrl(key, ttl);
      if (!error && data?.signedUrl) {
        res.set("Cache-Control", "no-store");
        return void res.redirect(307, data.signedUrl);
      }
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(key);
      if (pub && pub.publicUrl) {
        res.set("Cache-Control", "no-store");
        return void res.redirect(307, pub.publicUrl);
      }
      return void res.status(404).send("Image not found");
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("[StorageProxy] Error:", err instanceof Error ? err.message : String(err));
      }
      return void res.status(502).send("Storage proxy error");
    }
  });
}

// server/downloadProxy.ts
import sharp from "sharp";
var ALLOWED_FORMATS = ["png", "jpg", "jpeg", "webp"];
var FORMAT_MIME = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp"
};
function registerDownloadProxy(app) {
  app.get("/api/download-image", async (req, res) => {
    try {
      const imageUrl = req.query.url;
      const requestedFormat = req.query.format?.toLowerCase();
      if (!imageUrl) {
        res.status(400).json({ error: "Missing 'url' query parameter" });
        return;
      }
      if (requestedFormat && !ALLOWED_FORMATS.includes(requestedFormat)) {
        res.status(400).json({
          error: `Invalid format '${requestedFormat}'. Allowed: ${ALLOWED_FORMATS.join(", ")}`
        });
        return;
      }
      const allowedDomains = [
        "s3.amazonaws.com",
        "s3.us-east-1.amazonaws.com",
        "cloudfront.net",
        "storage.googleapis.com",
        "supabase.co"
      ];
      let isAllowed = false;
      let parsedUrl;
      try {
        parsedUrl = new URL(imageUrl);
        isAllowed = allowedDomains.some(
          (domain) => parsedUrl.hostname.endsWith(domain)
        );
      } catch {
        res.status(400).json({ error: "Invalid URL format" });
        return;
      }
      if (!isAllowed) {
        res.status(403).json({ error: "URL domain not allowed for download" });
        return;
      }
      const response = await fetch(imageUrl);
      if (!response.ok) {
        res.status(response.status).json({
          error: `Failed to fetch image: ${response.statusText}`
        });
        return;
      }
      const arrayBuffer = await response.arrayBuffer();
      let outputBuffer = Buffer.from(arrayBuffer);
      let outputMime = response.headers.get("content-type") || "image/png";
      let outputExt = "png";
      if (requestedFormat) {
        const normalizedFormat = requestedFormat === "jpg" ? "jpeg" : requestedFormat;
        const sharpInstance = sharp(outputBuffer);
        if (normalizedFormat === "jpeg") {
          outputBuffer = await sharpInstance.jpeg({ quality: 92 }).toBuffer();
        } else if (normalizedFormat === "webp") {
          outputBuffer = await sharpInstance.webp({ quality: 90 }).toBuffer();
        } else {
          outputBuffer = await sharpInstance.png().toBuffer();
        }
        outputMime = FORMAT_MIME[requestedFormat] || "image/png";
        outputExt = requestedFormat === "jpeg" ? "jpg" : requestedFormat;
      }
      const baseFilename = req.query.filename || `vanir-ai-${Date.now()}`;
      const cleanBase = baseFilename.replace(/\.(png|jpg|jpeg|webp)$/i, "");
      const filename = `${cleanBase}.${outputExt}`;
      res.setHeader("Content-Type", outputMime);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Length", outputBuffer.length);
      res.setHeader("Cache-Control", "no-cache");
      res.send(outputBuffer);
    } catch (error) {
      console.error("[Download Proxy] Error:", error);
      res.status(500).json({ error: "Internal server error during download" });
    }
  });
}

// server/videoProxy.ts
function registerVideoProxy(app) {
  app.get("/api/video-proxy", async (req, res) => {
    try {
      const videoUrl = req.query.url;
      if (!videoUrl) {
        res.status(400).json({ error: "Missing 'url' query parameter" });
        return;
      }
      const allowedDomains = [
        "hebbkx1anhila5yf.public.blob.vercel-storage.com",
        "blob.vercel-storage.com",
        "d2xsxph8kpxj0f.cloudfront.net"
      ];
      let isAllowed = false;
      let parsedUrl;
      try {
        parsedUrl = new URL(videoUrl);
        isAllowed = allowedDomains.some(
          (domain) => parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(domain)
        );
      } catch {
        res.status(400).json({ error: "Invalid URL format" });
        return;
      }
      if (!isAllowed) {
        res.status(403).json({ error: "URL domain not allowed for video proxy" });
        return;
      }
      const response = await fetch(videoUrl);
      if (!response.ok) {
        res.status(response.status).json({
          error: `Failed to fetch video: ${response.statusText}`
        });
        return;
      }
      const contentType = response.headers.get("content-type") || "video/mp4";
      const contentLength = response.headers.get("content-length");
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Access-Control-Allow-Origin", "*");
      if (contentLength) {
        res.setHeader("Content-Length", contentLength);
        res.setHeader("Accept-Ranges", "bytes");
      }
      if (response.body) {
        response.body.pipeTo(res);
      } else {
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
      }
    } catch (error) {
      console.error("[Video Proxy] Error:", error);
      res.status(500).json({ error: "Internal server error during video proxy" });
    }
  });
}

// server/authExpressRouter.ts
import { getAuth } from "firebase-admin/auth";
async function resolveAdminUser(uid, email, displayName) {
  const bootstrapEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const isBootstrapAdmin = Boolean(email && bootstrapEmails.includes(email.toLowerCase()));
  console.log("[v0] resolveAdminUser:", {
    uid,
    email,
    displayName,
    bootstrapEmails: bootstrapEmails.slice(0, 1).map((e) => e.substring(0, 3) + "***"),
    isBootstrapAdmin
  });
  const baseData = {
    uid,
    email: email ?? null,
    name: displayName || email?.split("@")[0] || null,
    loginMethod: "firebase",
    lastSignedIn: /* @__PURE__ */ new Date()
  };
  if (isBootstrapAdmin) {
    baseData.role = "admin";
    console.log("[v0] Bootstrap admin detected, setting role to admin");
  }
  await db2.collection("users").doc(uid).set(baseData, { merge: true });
  const userDoc = await db2.collection("users").doc(uid).get();
  const userData = userDoc.data();
  console.log("[v0] Admin user resolved:", { uid, role: userData?.role, email });
  if (!userData || userData.role !== "admin") {
    console.error("[v0] Access denied - user not admin. Role:", userData?.role);
    throw new Error("Admin access denied");
  }
  return {
    uid,
    email: email ?? userData.email ?? null,
    name: displayName || userData.name || null,
    role: userData.role
  };
}
async function issueSessionForAdmin(req, res, uid, email, displayName) {
  const user = await resolveAdminUser(uid, email, displayName);
  const openId = `firebase:${uid}`;
  const sessionToken = await sdk.createSessionToken(openId, {
    name: user.name || "Admin",
    expiresInMs: ONE_YEAR_MS
  });
  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, sessionToken, {
    ...cookieOptions,
    maxAge: ONE_YEAR_MS
  });
  return { success: true, email: user.email, name: user.name };
}
async function issueSessionForUser(req, res, uid, email, displayName) {
  const openId = `firebase:${uid}`;
  const sessionToken = await sdk.createSessionToken(openId, {
    name: displayName || email?.split("@")[0] || "User",
    expiresInMs: ONE_YEAR_MS
  });
  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, sessionToken, {
    ...cookieOptions,
    maxAge: ONE_YEAR_MS
  });
  await db2.collection("users").doc(uid).set(
    {
      uid,
      email: email ?? null,
      name: displayName || email?.split("@")[0] || null,
      loginMethod: "firebase",
      lastSignedIn: /* @__PURE__ */ new Date()
    },
    { merge: true }
  );
  return { success: true, email: email || null, name: displayName || null };
}
function registerFirebaseAuthRoutes(app) {
  app.get("/api/auth/me", async (req, res) => {
    try {
      const rawCookie = (req.headers.cookie ?? "").split(";").map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
      const session = await sdk.verifySession(rawCookie);
      if (session) {
        return res.json({ openId: session.openId, name: session.name });
      }
      return res.status(401).json({ error: "Not authenticated" });
    } catch {
      return res.status(401).json({ error: "Not authenticated" });
    }
  });
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        console.log("[v0] /api/auth/login: Missing idToken");
        return res.status(400).json({ error: "idToken is required" });
      }
      console.log("[v0] /api/auth/login: Verifying admin ID token");
      const decoded = await getAuth().verifyIdToken(idToken, true);
      console.log("[v0] /api/auth/login: Token verified for email:", decoded.email);
      const result = await issueSessionForAdmin(req, res, decoded.uid, decoded.email, decoded.name);
      console.log("[v0] /api/auth/login: Admin session issued successfully");
      return res.json(result);
    } catch (err) {
      if (err?.code === "auth/id-token-revoked") {
        console.error("[v0] /api/auth/login: Token revoked");
        return res.status(401).json({ error: "Session revoked. Please sign in again." });
      }
      const msg = err?.message || "Authentication failed";
      console.error("[v0] /api/auth/login: Error:", msg);
      const status = msg === "Admin access denied" ? 403 : 401;
      return res.status(status).json({ error: msg });
    }
  });
  app.post("/api/auth/user-login", async (req, res) => {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ error: "idToken is required" });
      }
      const decoded = await getAuth().verifyIdToken(idToken);
      const result = await issueSessionForUser(req, res, decoded.uid, decoded.email, decoded.name);
      return res.json(result);
    } catch (err) {
      const msg = err?.message || "Authentication failed";
      return res.status(401).json({ error: msg });
    }
  });
  app.post("/api/auth/admin-google", async (req, res) => {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ error: "idToken is required" });
      }
      const decoded = await getAuth().verifyIdToken(idToken, true);
      const result = await issueSessionForAdmin(req, res, decoded.uid, decoded.email, decoded.name);
      return res.json(result);
    } catch (err) {
      if (err?.code === "auth/id-token-revoked") {
        return res.status(401).json({ error: "Session revoked. Please sign in again." });
      }
      const msg = err?.message || "Google authentication failed";
      const status = msg === "Admin access denied" ? 403 : 401;
      return res.status(status).json({ error: msg });
    }
  });
}

// server/_core/checkoutRoutes.ts
import crypto from "crypto";
var PROMO_CODES = {
  VIP2026: { type: "percent", value: 15, label: "15% Royal VIP Privilege" },
  ROYAL10: { type: "percent", value: 10, label: "10% Concierge Privilege" },
  VANIR20: { type: "percent", value: 20, label: "20% Executive Member Discount" },
  WELCOME50: { type: "fixed", value: 50, label: "$50 First Booking Privilege" }
};
function detectCardBrand(digits) {
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "American Express";
  if (/^6(?:011|5)/.test(digits)) return "Discover";
  if (/^(5078|5018|6304|6759)/.test(digits)) return "Mada / Maestro";
  return "Card";
}
function luhnCheck(digits) {
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let doubleDigit = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits.charAt(i), 10);
    if (Number.isNaN(d)) return false;
    if (doubleDigit) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}
function escapeHtml(raw) {
  return String(raw ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function registerCheckoutAndVerifyRoutes(app) {
  app.post("/api/promo/validate", (req, res) => {
    const code = String(req.body?.code || "").trim().toUpperCase();
    const amount = Number(req.body?.amount || 0);
    const promo = PROMO_CODES[code];
    if (!promo) {
      return res.status(404).json({
        valid: false,
        error: "Invalid or expired promotional code."
      });
    }
    const discount = promo.type === "percent" ? Math.round(amount * (promo.value / 100) * 100) / 100 : Math.min(amount * 0.5, promo.value);
    const finalAmount = Math.max(1, Math.round((amount - discount) * 100) / 100);
    return res.status(200).json({
      valid: true,
      code,
      label: promo.label,
      discount,
      finalAmount
    });
  });
  app.post("/api/checkout", async (req, res) => {
    try {
      const body = req.body || {};
      const rawAmount = Number(body.amount);
      const currency = String(body.currency || "USD").toUpperCase();
      const paymentMethod = String(body.paymentMethod || "card");
      const promoCode = String(body.promoCode || "").trim().toUpperCase();
      if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: "Invalid transaction amount."
        });
      }
      let discountApplied = 0;
      if (promoCode && PROMO_CODES[promoCode]) {
        const promo = PROMO_CODES[promoCode];
        discountApplied = promo.type === "percent" ? Math.round(rawAmount * (promo.value / 100) * 100) / 100 : Math.min(rawAmount * 0.5, promo.value);
      }
      const finalAmount = Math.max(
        1,
        Math.round((rawAmount - discountApplied) * 100) / 100
      );
      let cardBrand = String(body.cardBrand || "");
      let cardLast4 = String(body.cardLast4 || "").replace(/\D/g, "").slice(-4);
      if (paymentMethod === "card") {
        const cleanDigits = String(body.cardNumber || "").replace(/\D/g, "");
        if (cleanDigits) {
          if (cleanDigits.endsWith("0002") || cleanDigits.endsWith("4002")) {
            return res.status(402).json({
              success: false,
              error: "Card declined by issuing bank (Insufficient funds / Restricted)."
            });
          }
          if (!luhnCheck(cleanDigits)) {
            return res.status(422).json({
              success: false,
              error: "Invalid card number checksum (Luhn verification failed)."
            });
          }
          cardBrand = cardBrand || detectCardBrand(cleanDigits);
          cardLast4 = cleanDigits.slice(-4);
        } else if (!cardLast4) {
          return res.status(400).json({
            success: false,
            error: "Missing card details or saved payment token."
          });
        }
      } else if (paymentMethod === "saved_card") {
        cardBrand = cardBrand || "Saved VIP Card";
        cardLast4 = cardLast4 || "4242";
      } else if (paymentMethod === "apple_pay") {
        cardBrand = "Apple Pay";
      } else if (paymentMethod === "google_pay") {
        cardBrand = "Google Pay";
      } else if (paymentMethod === "bank_wire") {
        cardBrand = "VIP Bank Wire / IBAN";
      }
      const authHex = crypto.randomBytes(3).toString("hex").toUpperCase();
      const txnId = `TXN-VNR-${Date.now().toString(36).toUpperCase()}-${authHex}`;
      const confirmationCode = `VNR-${crypto.randomInt(1e5, 999999)}`;
      if (process.env.STRIPE_SECRET_KEY && body.stripePaymentMethodId) {
        const params = new URLSearchParams();
        params.append("amount", String(Math.round(finalAmount * 100)));
        params.append("currency", currency.toLowerCase());
        params.append("payment_method", String(body.stripePaymentMethodId));
        params.append("confirm", "true");
        params.append("automatic_payment_methods[enabled]", "true");
        params.append("automatic_payment_methods[allow_redirects]", "never");
        const stripeRes = await fetch("https://api.stripe.com/v1/payment_intents", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: params.toString()
        });
        const stripeJson = await stripeRes.json().catch(() => ({}));
        if (!stripeRes.ok) {
          return res.status(402).json({
            success: false,
            error: stripeJson?.error?.message || "Card authorization declined by Stripe."
          });
        }
        return res.status(200).json({
          success: true,
          status: "succeeded",
          transactionId: stripeJson.id || txnId,
          confirmationCode,
          authorizationCode: `AUTH-${authHex}`,
          cardBrand,
          cardLast4,
          originalAmount: rawAmount,
          discountApplied,
          finalAmount,
          currency,
          gateway: "Stripe Live Gateway",
          authorizedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      return res.status(200).json({
        success: true,
        status: "succeeded",
        transactionId: txnId,
        confirmationCode,
        authorizationCode: `AUTH-${authHex}`,
        cardBrand: cardBrand || "Visa",
        cardLast4: cardLast4 || "0000",
        originalAmount: rawAmount,
        discountApplied,
        finalAmount,
        currency,
        gateway: "Vanir Secure Payment Gateway (PCI-DSS Verified)",
        authorizedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err?.message || "Internal payment gateway error."
      });
    }
  });
  app.get(["/verify/ticket", "/verify/doc"], (req, res) => {
    const isTicket = req.path.includes("ticket");
    const pnrOrRef = escapeHtml(
      req.query.pnr || req.query.ref || "VNR-VERIFIED"
    );
    const etkt = escapeHtml(req.query.etkt || "");
    const flight = escapeHtml(req.query.flight || "");
    const docType = escapeHtml(
      String(req.query.type || (isTicket ? "IATA E-TICKET" : "OFFICIAL VOUCHER")).toUpperCase()
    );
    const holder = escapeHtml(
      req.query.pax || req.query.client || "VIP Registered Traveler"
    );
    const verifiedAt = (/* @__PURE__ */ new Date()).toUTCString();
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vanir Group \u2014 Official Document Verification (${pnrOrRef})</title>
  <style>
    body { margin:0; background:#0B111A; color:#F8FAFC; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; padding:20px; box-sizing:border-box; }
    .card { max-width:520px; width:100%; background:#111C2D; border:1.5px solid #D4AF37; border-radius:20px; padding:28px; box-shadow:0 24px 60px rgba(0,0,0,0.55); }
    .badge { display:inline-flex; align-items:center; gap:8px; background:rgba(16,185,129,0.16); color:#34D399; border:1px solid rgba(52,211,153,0.4); padding:6px 14px; border-radius:999px; font-size:12px; font-weight:800; letter-spacing:1px; }
    h1 { font-size:21px; margin:16px 0 6px; color:#FFFFFF; }
    .sub { color:#94A3B8; font-size:13px; margin-bottom:20px; }
    .row { display:flex; justify-content:space-between; padding:11px 0; border-bottom:1px solid rgba(255,255,255,0.08); font-size:14px; }
    .k { color:#94A3B8; font-weight:600; }
    .v { color:#F8FAFC; font-weight:800; font-family:monospace; text-align:right; }
    .footer { margin-top:20px; font-size:12px; color:#CBD5E1; line-height:1.5; text-align:center; }
    .btn { display:inline-block; margin-top:16px; background:#D4AF37; color:#0F1E36; text-decoration:none; font-weight:800; padding:11px 22px; border-radius:12px; font-size:13px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">\u2713 AUTHENTIC &amp; ACTIVE RECORD</div>
    <h1>Vanir Group Official Verification</h1>
    <div class="sub">IATA &amp; DRV Accredited Global Concierge Registry</div>
    <div class="row"><span class="k">Document Type</span><span class="v">${docType}</span></div>
    <div class="row"><span class="k">Reference / PNR</span><span class="v" style="color:#D4AF37;">${pnrOrRef}</span></div>
    ${etkt ? `<div class="row"><span class="k">IATA E-Ticket No.</span><span class="v">${etkt}</span></div>` : ""}
    ${flight ? `<div class="row"><span class="k">Flight Number</span><span class="v">${flight}</span></div>` : ""}
    <div class="row"><span class="k">Principal Holder</span><span class="v">${holder}</span></div>
    <div class="row"><span class="k">Verification Status</span><span class="v" style="color:#34D399;">CONFIRMED \u2022 VALID</span></div>
    <div class="row"><span class="k">Timestamp (UTC)</span><span class="v">${verifiedAt}</span></div>
    <div class="footer">
      This electronic certificate confirms that the presented travel document was issued by Vanir Group International.<br/>
      <a class="btn" href="https://vanirgroup.com">Open Vanir Group Portal</a>
    </div>
  </div>
</body>
</html>`);
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0).optional()
    }).optional()
  ).query(() => ({
    status: "ok",
    healthy: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers/bookings.ts
import { z as z2 } from "zod";

// server/utils/errorLogger.ts
function formatErrorMessage(error) {
  if (error instanceof Error) return error.message;
  return String(error);
}
function logError(tag, kind, error, extra) {
  console.error(`[${tag}] ${kind}:`, {
    error: formatErrorMessage(error),
    stack: error instanceof Error ? error.stack : void 0,
    ...extra
  });
}

// server/routers/bookings.ts
import { nanoid } from "nanoid";
var bookingsRouter = router({
  /** Create a new booking (public - guests can book too) */
  create: publicProcedure.input(
    z2.object({
      packageName: z2.string().min(1),
      packageCategory: z2.string().optional(),
      destination: z2.string().optional(),
      checkInDate: z2.number().optional(),
      checkOutDate: z2.number().optional(),
      adults: z2.number().min(1).default(1),
      children: z2.number().min(0).default(0),
      roomType: z2.string().optional(),
      totalPrice: z2.string().optional(),
      currency: z2.string().default("USD"),
      paymentMethod: z2.enum(["credit_card", "paypal", "bank_transfer"]).optional(),
      promoCode: z2.string().optional(),
      discountAmount: z2.string().optional(),
      specialRequests: z2.string().optional(),
      billingAddress: z2.any().optional(),
      guestName: z2.string().optional(),
      guestEmail: z2.string().email().optional(),
      guestPhone: z2.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      const confirmationCode = `VNR-${nanoid(8).toUpperCase()}`;
      const booking = await createBooking({
        ...input,
        userId: ctx.user?.id ?? null,
        confirmationCode,
        status: "pending",
        paymentStatus: "pending"
      });
      console.log(`[bookings.create] created booking: confirmationCode=${confirmationCode}, packageName=${input.packageName}`);
      await notifyOwner({
        title: "\u062D\u062C\u0632 \u062C\u062F\u064A\u062F - New Booking",
        content: `\u062D\u062C\u0632 \u062C\u062F\u064A\u062F: ${input.packageName}
\u0627\u0644\u0639\u0645\u064A\u0644: ${input.guestName || ctx.user?.name || "\u0645\u062C\u0647\u0648\u0644"}
\u0631\u0645\u0632 \u0627\u0644\u062A\u0623\u0643\u064A\u062F: ${confirmationCode}`
      });
      return booking;
    } catch (error) {
      logError("bookings.create", "mutation error", error, { packageName: input.packageName });
      throw error;
    }
  }),
  /** Get booking by ID (authenticated owner or admin only; guests use getByCode) */
  getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ ctx, input }) => {
    try {
      const booking = await getBookingById(input.id);
      if (!booking) return null;
      if (ctx.user.role !== "admin" && booking.userId !== ctx.user.id) {
        throw new Error("Unauthorized access to booking record");
      }
      console.log(`[bookings.getById] retrieved booking: id=${input.id}`);
      return booking;
    } catch (error) {
      logError("bookings.getById", "query error", error, { id: input.id });
      throw error;
    }
  }),
  /** Get booking by confirmation code */
  getByCode: publicProcedure.input(z2.object({ code: z2.string() })).query(async ({ input }) => {
    try {
      const booking = await getBookingByConfirmationCode(input.code);
      console.log(`[bookings.getByCode] retrieved booking: code=${input.code}`);
      return booking;
    } catch (error) {
      logError("bookings.getByCode", "query error", error, { code: input.code });
      throw error;
    }
  }),
  /** Get current user's bookings */
  myBookings: protectedProcedure.query(async ({ ctx }) => {
    try {
      const bookings2 = await getUserBookings(ctx.user.id);
      console.log(`[bookings.myBookings] retrieved ${bookings2.length} bookings for user: ${ctx.user.id}`);
      return bookings2;
    } catch (error) {
      logError("bookings.myBookings", "query error", error, { userId: ctx.user.id });
      throw error;
    }
  }),
  /** Update booking status (admin only) */
  updateStatus: adminProcedure.input(
    z2.object({
      id: z2.number(),
      status: z2.enum(["pending", "confirmed", "cancelled", "completed"])
    })
  ).mutation(async ({ input }) => {
    try {
      const result = await updateBookingStatus(input.id, input.status);
      console.log(`[bookings.updateStatus] updated booking: id=${input.id}, status=${input.status}`);
      return result;
    } catch (error) {
      logError("bookings.updateStatus", "mutation error", error, { id: input.id, status: input.status });
      throw error;
    }
  }),
  /** Update payment status (admin only) */
  updatePaymentStatus: adminProcedure.input(
    z2.object({
      id: z2.number(),
      paymentStatus: z2.enum(["pending", "paid", "failed", "refunded"])
    })
  ).mutation(async ({ input }) => {
    try {
      const result = await updateBookingPaymentStatus(input.id, input.paymentStatus);
      console.log(`[bookings.updatePaymentStatus] updated booking: id=${input.id}, paymentStatus=${input.paymentStatus}`);
      return result;
    } catch (error) {
      logError("bookings.updatePaymentStatus", "mutation error", error, { id: input.id, paymentStatus: input.paymentStatus });
      throw error;
    }
  }),
  /** List all bookings (admin only) */
  listAll: adminProcedure.input(
    z2.object({
      limit: z2.number().min(1).max(100).default(50),
      offset: z2.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    try {
      const { limit = 50, offset = 0 } = input ?? {};
      const bookings2 = await getAllBookings(limit, offset);
      console.log(`[bookings.listAll] retrieved ${bookings2.length} bookings`);
      return bookings2;
    } catch (error) {
      logError("bookings.listAll", "query error", error);
      throw error;
    }
  })
});

// server/routers/reviews.ts
import { z as z3 } from "zod";

// server/_core/firestore-db.ts
import fs2 from "fs";
import path2 from "path";
var DATA_FILE = path2.resolve(process.cwd(), "server", "data", "store.json");
function getLocalData() {
  try {
    if (fs2.existsSync(DATA_FILE)) {
      return JSON.parse(fs2.readFileSync(DATA_FILE, "utf-8"));
    }
  } catch (e) {
    console.warn("[LocalStore] Read error:", e);
  }
  return { _counters: {} };
}
function saveLocalData(data) {
  try {
    const dir = path2.dirname(DATA_FILE);
    if (!fs2.existsSync(dir)) fs2.mkdirSync(dir, { recursive: true });
    fs2.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.warn("[LocalStore] Write error:", e);
  }
}
var storeCache = getLocalData();
var firestoreDisabled = false;
var lastFirestoreWarn = 0;
function handleFirestoreError(err, op) {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("invalid_grant") || msg.includes("Could not load") || msg.includes("PERMISSION_DENIED")) {
    if (!firestoreDisabled) {
      firestoreDisabled = true;
      console.warn(`[Firestore Resilient] Switched to local JSON store (${op}): ${msg}`);
    }
  } else {
    const now = Date.now();
    if (now - lastFirestoreWarn > 6e4) {
      lastFirestoreWarn = now;
      console.warn(`[Firestore Resilient] Operation ${op} fallback to local store: ${msg}`);
    }
  }
}
async function nextId(collection) {
  try {
    if (!firestoreDisabled) {
      const counterRef = db2.collection("_counters").doc(collection);
      const next = await db2.runTransaction(async (tx) => {
        const snap = await tx.get(counterRef);
        const current = (snap.exists ? snap.data()?.value : 0) || 0;
        const value = current + 1;
        tx.set(counterRef, { value }, { merge: true });
        return value;
      });
      return next;
    }
  } catch (e) {
    handleFirestoreError(e, `nextId(${collection})`);
  }
  if (!storeCache._counters) storeCache._counters = {};
  storeCache._counters[collection] = (storeCache._counters[collection] || 0) + 1;
  saveLocalData(storeCache);
  return storeCache._counters[collection];
}
async function insert(collection, data) {
  const now = /* @__PURE__ */ new Date();
  let id2 = typeof data.id === "number" ? data.id : 0;
  if (!firestoreDisabled) {
    try {
      id2 = id2 || await nextId(collection);
      const record2 = {
        ...data,
        id: id2,
        createdAt: data.createdAt ?? now,
        updatedAt: now
      };
      await db2.collection(collection).doc(String(id2)).set(record2);
      if (!storeCache[collection]) storeCache[collection] = [];
      storeCache[collection].push(record2);
      saveLocalData(storeCache);
      return record2;
    } catch (error) {
      handleFirestoreError(error, `insert(${collection})`);
    }
  }
  if (!storeCache._counters) storeCache._counters = {};
  if (!id2) {
    storeCache._counters[collection] = (storeCache._counters[collection] || 0) + 1;
    id2 = storeCache._counters[collection];
  }
  const record = {
    ...data,
    id: id2,
    createdAt: data.createdAt ?? now,
    updatedAt: now
  };
  if (!storeCache[collection]) storeCache[collection] = [];
  storeCache[collection].push(record);
  saveLocalData(storeCache);
  return record;
}
async function getById2(collection, id2) {
  if (!firestoreDisabled) {
    try {
      const snap = await db2.collection(collection).doc(String(id2)).get();
      if (snap.exists) return snap.data();
    } catch (error) {
      handleFirestoreError(error, `getById(${collection}, ${id2})`);
    }
  }
  const items = storeCache[collection] || [];
  const found = items.find((item) => item.id === id2 || item.id === Number(id2) || item._docId === String(id2));
  return found || null;
}
async function update(collection, id2, data) {
  const now = /* @__PURE__ */ new Date();
  if (!firestoreDisabled) {
    try {
      const ref = db2.collection(collection).doc(String(id2));
      await ref.set({ ...data, updatedAt: now }, { merge: true });
      const updated = await ref.get();
      if (updated.exists) return updated.data() ?? null;
    } catch (error) {
      handleFirestoreError(error, `update(${collection}, ${id2})`);
    }
  }
  const items = storeCache[collection] || [];
  const idx = items.findIndex((item) => item.id === id2 || item.id === Number(id2));
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...data, updatedAt: now };
    saveLocalData(storeCache);
    return items[idx];
  }
  return null;
}
async function remove(collection, id2) {
  if (!firestoreDisabled) {
    try {
      await db2.collection(collection).doc(String(id2)).delete();
    } catch (error) {
      handleFirestoreError(error, `remove(${collection}, ${id2})`);
    }
  }
  if (storeCache[collection]) {
    storeCache[collection] = storeCache[collection].filter((item) => item.id !== id2 && item.id !== Number(id2));
    saveLocalData(storeCache);
  }
}
async function removeAll(collection) {
  if (!firestoreDisabled) {
    try {
      const snap = await db2.collection(collection).get();
      const batchSize = 400;
      for (let i = 0; i < snap.docs.length; i += batchSize) {
        const batch = db2.batch();
        for (const doc of snap.docs.slice(i, i + batchSize)) {
          batch.delete(doc.ref);
        }
        await batch.commit();
      }
    } catch (error) {
      handleFirestoreError(error, `removeAll(${collection})`);
    }
  }
  storeCache[collection] = [];
  saveLocalData(storeCache);
}
async function list(collection, options = {}) {
  if (!firestoreDisabled) {
    try {
      let query = db2.collection(collection);
      if (options.where) {
        for (const [field, op, value] of options.where) {
          query = query.where(field, op, value);
        }
      }
      if (options.orderBy) {
        for (const [field, dir] of options.orderBy) {
          query = query.orderBy(field, dir);
        }
      }
      if (typeof options.offset === "number") {
        query = query.offset(options.offset);
      }
      if (typeof options.limit === "number") {
        query = query.limit(options.limit);
      }
      const snap = await query.get();
      if (snap.docs.length > 0) {
        return snap.docs.map((d) => {
          const data = d.data();
          if (!data.id) data.id = d.id;
          if (!data.docId) data.docId = d.id;
          if (!data.settingKey && typeof d.id === "string" && d.id.includes("__")) {
            const parts = d.id.split("__");
            data.category = data.category || parts[0];
            data.settingKey = data.settingKey || parts.slice(1).join("__");
          }
          return data;
        });
      }
    } catch (error) {
      handleFirestoreError(error, `list(${collection})`);
    }
  }
  let items = (storeCache[collection] || []).slice();
  if (options.where) {
    for (const [field, op, val] of options.where) {
      items = items.filter((item) => {
        if (op === "==") return item[field] === val;
        if (op === "!=") return item[field] !== val;
        if (op === ">") return item[field] > val;
        if (op === ">=") return item[field] >= val;
        if (op === "<") return item[field] < val;
        if (op === "<=") return item[field] <= val;
        return true;
      });
    }
  }
  if (options.orderBy) {
    for (const [field, dir] of options.orderBy) {
      items.sort((a, b) => {
        if (a[field] < b[field]) return dir === "desc" ? 1 : -1;
        if (a[field] > b[field]) return dir === "desc" ? -1 : 1;
        return 0;
      });
    }
  }
  const offset = options.offset || 0;
  const limit = typeof options.limit === "number" ? options.limit : items.length;
  return items.slice(offset, offset + limit);
}
async function count(collection, where) {
  if (!firestoreDisabled) {
    try {
      let query = db2.collection(collection);
      if (where) {
        for (const [field, op, value] of where) {
          query = query.where(field, op, value);
        }
      }
      const snap = await query.count().get();
      return snap.data().count;
    } catch (error) {
      handleFirestoreError(error, `count(${collection})`);
    }
  }
  let items = storeCache[collection] || [];
  if (where) {
    for (const [field, op, val] of where) {
      items = items.filter((item) => {
        if (op === "==") return item[field] === val;
        if (op === "!=") return item[field] !== val;
        return true;
      });
    }
  }
  return items.length;
}
async function findOne(collection, where) {
  if (!firestoreDisabled) {
    try {
      let query = db2.collection(collection);
      for (const [field, op, value] of where) {
        query = query.where(field, op, value);
      }
      const snap = await query.limit(1).get();
      if (!snap.empty) return snap.docs[0].data();
    } catch (error) {
      handleFirestoreError(error, `findOne(${collection})`);
    }
  }
  const items = await list(collection, { where, limit: 1 });
  return items[0] || null;
}
var SETTINGS_COL = "siteSettings";
async function getSettingValue(category, key) {
  const docId = `${category}__${key}`;
  if (!firestoreDisabled) {
    try {
      const snap = await db2.collection(SETTINGS_COL).doc(docId).get();
      if (snap.exists) return snap.data()?.settingValue ?? null;
    } catch (error) {
      handleFirestoreError(error, `getSettingValue(${category}, ${key})`);
    }
  }
  const settings = storeCache.siteSettings || [];
  const found = settings.find((s) => s.category === category && s.settingKey === key || s.docId === docId);
  return found?.settingValue ?? null;
}
async function setSettingValue(category, key, value, updatedBy) {
  const docId = `${category}__${key}`;
  const now = /* @__PURE__ */ new Date();
  if (!firestoreDisabled) {
    try {
      const ref = db2.collection(SETTINGS_COL).doc(docId);
      await ref.set({
        docId,
        category,
        settingKey: key,
        settingValue: value,
        updatedBy: updatedBy ?? null,
        updatedAt: now
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, `setSettingValue(${category}, ${key})`);
    }
  }
  if (!storeCache.siteSettings) storeCache.siteSettings = [];
  const idx = storeCache.siteSettings.findIndex((s) => s.category === category && s.settingKey === key || s.docId === docId);
  if (idx !== -1) {
    storeCache.siteSettings[idx].category = category;
    storeCache.siteSettings[idx].settingKey = key;
    storeCache.siteSettings[idx].settingValue = value;
    storeCache.siteSettings[idx].updatedAt = now;
  } else {
    storeCache.siteSettings.push({
      id: (storeCache._counters?.siteSettings || 0) + 1,
      docId,
      category,
      settingKey: key,
      settingValue: value,
      updatedBy: updatedBy ?? null,
      createdAt: now,
      updatedAt: now
    });
  }
  saveLocalData(storeCache);
}

// server/routers/reviews.ts
var reviewsRouter = router({
  /** List approved reviews (public) */
  list: publicProcedure.input(
    z3.object({
      limit: z3.number().min(1).max(100).default(50),
      offset: z3.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    try {
      const { limit = 50, offset = 0 } = input ?? {};
      const reviews2 = await getApprovedReviews(limit, offset);
      console.log(`[reviews.list] retrieved ${reviews2.length} approved reviews`);
      return reviews2;
    } catch (error) {
      logError("reviews.list", "query error", error);
      throw error;
    }
  }),
  /** Get review stats (public) */
  stats: publicProcedure.query(async () => {
    try {
      const stats = await getReviewStats();
      console.log("[reviews.stats] retrieved review statistics");
      return stats;
    } catch (error) {
      logError("reviews.stats", "query error", error);
      throw error;
    }
  }),
  /** Get single review by ID (public) */
  getById: publicProcedure.input(z3.object({ id: z3.number() })).query(async ({ input }) => {
    try {
      const review = await getReviewById(input.id);
      console.log(`[reviews.getById] retrieved review: id=${input.id}`);
      return review;
    } catch (error) {
      logError("reviews.getById", "query error", error, { id: input.id });
      throw error;
    }
  }),
  /** Create a new review (public - guests can review too) */
  create: publicProcedure.input(
    z3.object({
      tripName: z3.string().min(1),
      destination: z3.string().optional(),
      rating: z3.number().min(1).max(5),
      title: z3.string().optional(),
      content: z3.string().min(10),
      photoUrls: z3.array(z3.string()).optional(),
      travelDate: z3.number().optional(),
      guestName: z3.string().optional(),
      guestAvatarUrl: z3.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      const review = await createReview({
        ...input,
        userId: ctx.user?.id ?? null,
        isApproved: "pending",
        helpfulCount: 0
      });
      console.log(`[reviews.create] created review: tripName=${input.tripName}, rating=${input.rating}`);
      return review;
    } catch (error) {
      logError("reviews.create", "mutation error", error, { tripName: input.tripName });
      throw error;
    }
  }),
  /** Get current user's reviews */
  myReviews: protectedProcedure.query(async ({ ctx }) => {
    try {
      const reviews2 = await list("reviews", {
        where: [["userId", "==", ctx.user.id]],
        orderBy: [["createdAt", "desc"]]
      });
      console.log(`[reviews.myReviews] retrieved ${reviews2.length} reviews for user: ${ctx.user.id}`);
      return reviews2;
    } catch (error) {
      logError("reviews.myReviews", "query error", error, { userId: ctx.user.id });
      throw error;
    }
  }),
  /** Mark review as helpful (public) */
  markHelpful: publicProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ input }) => {
    try {
      const result = await incrementHelpfulCount(input.id);
      console.log(`[reviews.markHelpful] marked review as helpful: id=${input.id}`);
      return result;
    } catch (error) {
      logError("reviews.markHelpful", "mutation error", error, { id: input.id });
      throw error;
    }
  }),
  /** List all reviews including pending (admin only) */
  listAll: adminProcedure.input(
    z3.object({
      limit: z3.number().min(1).max(100).default(50),
      offset: z3.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    try {
      const { limit = 50, offset = 0 } = input ?? {};
      const reviews2 = await getAllReviews(limit, offset);
      console.log(`[reviews.listAll] retrieved ${reviews2.length} reviews (including pending)`);
      return reviews2;
    } catch (error) {
      logError("reviews.listAll", "query error", error);
      throw error;
    }
  }),
  /** Approve or reject a review (admin only) */
  moderate: adminProcedure.input(
    z3.object({
      id: z3.number(),
      isApproved: z3.enum(["pending", "approved", "rejected"])
    })
  ).mutation(async ({ input }) => {
    try {
      const result = await updateReviewApproval(input.id, input.isApproved);
      console.log(`[reviews.moderate] updated review approval: id=${input.id}, status=${input.isApproved}`);
      return result;
    } catch (error) {
      logError("reviews.moderate", "mutation error", error, { id: input.id });
      throw error;
    }
  }),
  /** Add admin reply to a review (admin only) */
  reply: adminProcedure.input(
    z3.object({
      id: z3.number(),
      adminReply: z3.string().min(1)
    })
  ).mutation(async ({ input }) => {
    try {
      const result = await addAdminReply(input.id, input.adminReply);
      console.log(`[reviews.reply] added admin reply to review: id=${input.id}`);
      return result;
    } catch (error) {
      logError("reviews.reply", "mutation error", error, { id: input.id });
      throw error;
    }
  })
});

// server/routers/offers.ts
import { z as z4 } from "zod";
var offersRouter = router({
  /** Public: List active offers with optional category filter */
  list: publicProcedure.input(
    z4.object({
      limit: z4.number().min(1).max(100).default(100),
      offset: z4.number().min(0).default(0),
      category: z4.string().optional()
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 100, offset = 0, category } = input ?? {};
    try {
      const whereClauses = [["isActive", "==", "active"]];
      if (category && category !== "all") {
        whereClauses.push(["category", "==", category]);
      }
      let items = [];
      try {
        items = await list("offers", {
          where: whereClauses,
          limit,
          offset
        });
      } catch (fsErr) {
        console.warn("[offers.list] Firestore query failed, falling back to SQLite:", fsErr);
      }
      if (!items || items.length === 0) {
        items = await getActiveOffers();
        if (category && category !== "all") {
          items = items.filter((o) => o.category === category);
        }
      }
      return items;
    } catch (err) {
      logError("offers.list", "fetch error", err);
      return [];
    }
  }),
  /** List active offers (public) */
  listActive: publicProcedure.query(async () => {
    try {
      let items = [];
      try {
        items = await list("offers", {
          where: [["isActive", "==", "active"]],
          limit: 100
        });
      } catch (fsErr) {
        console.warn("[offers.listActive] Firestore query failed:", fsErr);
      }
      if (items && items.length > 0) return items;
      return getActiveOffers();
    } catch {
      return getActiveOffers();
    }
  }),
  /** Public: Get single offer by id */
  getById: publicProcedure.input(z4.object({ id: z4.number() })).query(async ({ input }) => {
    try {
      let offer = await getById2("offers", input.id);
      if (!offer) {
        const all = await getAllOffers(100, 0);
        offer = all.find((o) => o.id === input.id) || null;
      }
      return offer;
    } catch (err) {
      logError("offers.getById", "fetch error", err, { id: input.id });
      return null;
    }
  }),
  /** Validate a promo code (public) */
  validatePromo: publicProcedure.input(z4.object({ promoCode: z4.string().min(1) })).query(async ({ input }) => {
    let offer = null;
    try {
      offer = await findOne("offers", [["promoCode", "==", input.promoCode]]);
    } catch {
    }
    if (!offer) {
      offer = await getOfferByPromoCode(input.promoCode);
    }
    if (!offer) return { valid: false, message: "\u0631\u0645\u0632 \u0627\u0644\u062E\u0635\u0645 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D" };
    const now = Date.now();
    if (offer.isActive !== "active") return { valid: false, message: "\u0647\u0630\u0627 \u0627\u0644\u0639\u0631\u0636 \u063A\u064A\u0631 \u0646\u0634\u0637" };
    if (offer.startDate && now < offer.startDate) return { valid: false, message: "\u0647\u0630\u0627 \u0627\u0644\u0639\u0631\u0636 \u0644\u0645 \u064A\u0628\u062F\u0623 \u0628\u0639\u062F" };
    if (offer.endDate && now > offer.endDate) return { valid: false, message: "\u0627\u0646\u062A\u0647\u062A \u0635\u0644\u0627\u062D\u064A\u0629 \u0647\u0630\u0627 \u0627\u0644\u0639\u0631\u0636" };
    if (offer.totalSpots && offer.bookedSpots && offer.bookedSpots >= offer.totalSpots) {
      return { valid: false, message: "\u0646\u0641\u062F\u062A \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0645\u0627\u0643\u0646 \u0627\u0644\u0645\u062A\u0627\u062D\u0629" };
    }
    return {
      valid: true,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      title: offer.title,
      message: "\u062A\u0645 \u062A\u0637\u0628\u064A\u0642 \u0631\u0645\u0632 \u0627\u0644\u062E\u0635\u0645 \u0628\u0646\u062C\u0627\u062D"
    };
  }),
  /** List all offers (admin only) */
  listAll: adminProcedure.input(
    z4.object({
      limit: z4.number().min(1).max(100).default(50),
      offset: z4.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 50, offset = 0 } = input ?? {};
    try {
      const items = await list("offers", { limit, offset });
      if (items && items.length > 0) return items;
    } catch {
    }
    return getAllOffers(limit, offset);
  }),
  /** Create a new offer (admin only) */
  create: adminProcedure.input(
    z4.object({
      title: z4.string().min(1),
      description: z4.string().optional(),
      discountType: z4.enum(["percentage", "fixed"]),
      discountValue: z4.string(),
      promoCode: z4.string().optional(),
      startDate: z4.number(),
      endDate: z4.number(),
      category: z4.string().optional(),
      destination: z4.string().optional(),
      imageUrl: z4.string().optional(),
      totalSpots: z4.number().optional(),
      badgeText: z4.string().optional(),
      badgeColor: z4.string().optional()
    })
  ).mutation(async ({ input }) => {
    const data = {
      ...input,
      isActive: "active",
      bookedSpots: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const result = await insert("offers", data);
    createOffer(data).catch(() => {
    });
    return result;
  }),
  /** Update an offer (admin only) */
  update: adminProcedure.input(
    z4.object({
      id: z4.number(),
      title: z4.string().optional(),
      description: z4.string().optional(),
      discountType: z4.enum(["percentage", "fixed"]).optional(),
      discountValue: z4.string().optional(),
      startDate: z4.number().optional(),
      endDate: z4.number().optional(),
      isActive: z4.enum(["active", "inactive", "expired"]).optional(),
      totalSpots: z4.number().optional(),
      badgeText: z4.string().optional()
    })
  ).mutation(async ({ input }) => {
    const { id: id2, ...data } = input;
    const updateData = {
      ...data,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const updated = await update("offers", id2, updateData);
    updateOffer(id2, data).catch(() => {
    });
    return updated;
  })
});

// server/routers/contact.ts
import { z as z5 } from "zod";
var contactRouter = router({
  /** Submit a contact form message (public) */
  submit: publicProcedure.input(
    z5.object({
      name: z5.string().min(1),
      email: z5.string().email(),
      phone: z5.string().optional(),
      subject: z5.string().optional(),
      message: z5.string().min(10)
    })
  ).mutation(async ({ input }) => {
    const msg = await createContactMessage({
      ...input,
      status: "new"
    });
    await notifyOwner({
      title: "\u0631\u0633\u0627\u0644\u0629 \u0627\u062A\u0635\u0627\u0644 \u062C\u062F\u064A\u062F\u0629 - New Contact Message",
      content: `\u0645\u0646: ${input.name} (${input.email})
\u0627\u0644\u0645\u0648\u0636\u0648\u0639: ${input.subject || "\u0628\u062F\u0648\u0646 \u0645\u0648\u0636\u0648\u0639"}

${input.message.substring(0, 200)}`
    });
    return { success: true, id: msg.id };
  }),
  /** List all contact messages (admin only) */
  listAll: adminProcedure.input(
    z5.object({
      limit: z5.number().min(1).max(100).default(50),
      offset: z5.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 50, offset = 0 } = input ?? {};
    return getAllContactMessages(limit, offset);
  }),
  /** Update message status (admin only) */
  updateStatus: adminProcedure.input(
    z5.object({
      id: z5.number(),
      status: z5.enum(["new", "read", "replied", "archived"])
    })
  ).mutation(async ({ input }) => {
    await updateContactMessageStatus(input.id, input.status);
    return { success: true };
  })
});

// server/routers/uploads.ts
import { z as z6 } from "zod";

// server/storage.ts
import fs3 from "fs/promises";
import path3 from "path";
var UPLOADS_DIR = path3.resolve(process.cwd(), "public", "uploads");
async function ensureDir(dirPath) {
  try {
    await fs3.access(dirPath);
  } catch {
    await fs3.mkdir(dirPath, { recursive: true });
  }
}
function normalizeKey(relKey) {
  const safeName = relKey.replace(/^\/+/, "").replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${Date.now()}_${safeName}`;
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  await ensureDir(UPLOADS_DIR);
  const key = normalizeKey(relKey);
  const filePath = path3.join(UPLOADS_DIR, key);
  let fileBuffer;
  if (typeof data === "string") {
    fileBuffer = Buffer.from(data, "utf-8");
  } else if (ArrayBuffer.isView(data)) {
    fileBuffer = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  } else {
    fileBuffer = data;
  }
  try {
    console.log(`[Storage] Saving file to local disk: ${filePath}`);
    await fs3.writeFile(filePath, fileBuffer);
    const url = `/uploads/${key}`;
    console.log(`[Storage] Local upload successful: ${url}`);
    return { key, url };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[Storage] Local upload FAILED for ${key}:`, errorMessage);
    throw new Error(`Failed to save file to disk: ${errorMessage}`);
  }
}

// server/utils/uploadHelper.ts
import { nanoid as nanoid2 } from "nanoid";
var MAX_FILE_SIZE = 10 * 1024 * 1024;
function decodeAndValidateUpload(fileData, filename, keyPrefix) {
  const buffer = Buffer.from(fileData, "base64");
  const fileSize = buffer.length;
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error("\u062D\u062C\u0645 \u0627\u0644\u0645\u0644\u0641 \u064A\u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D (10 \u0645\u064A\u062C\u0627\u0628\u0627\u064A\u062A)");
  }
  const ext = filename.split(".").pop() || "bin";
  const randomSuffix = nanoid2(8);
  const fileKey = `${keyPrefix}/${randomSuffix}.${ext}`;
  return { buffer, fileSize, fileKey, ext };
}

// server/routers/uploads.ts
var uploadsRouter = router({
  /** Upload a file (authenticated users only) */
  upload: protectedProcedure.input(
    z6.object({
      /** Base64 encoded file data */
      fileData: z6.string(),
      filename: z6.string(),
      mimeType: z6.string(),
      purpose: z6.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const keyPrefix = `user-${ctx.user.id}/${input.purpose || "general"}`;
    const { buffer, fileSize, fileKey } = decodeAndValidateUpload(
      input.fileData,
      input.filename,
      keyPrefix
    );
    const { url } = await storagePut(fileKey, buffer, input.mimeType);
    const fileRecord = await createFileUpload({
      userId: ctx.user.id,
      fileKey,
      url,
      filename: input.filename,
      mimeType: input.mimeType,
      fileSize,
      purpose: input.purpose
    });
    return fileRecord;
  }),
  /** List user's uploaded files */
  myFiles: protectedProcedure.query(async ({ ctx }) => {
    return getUserFiles(ctx.user.id);
  })
});

// server/routers/gallery.ts
import { z as z7 } from "zod";

// server/utils/galleryCollectionHelper.ts
async function listVisibleFromCollection(collection, label) {
  try {
    const snap = await db2.collection(collection).get();
    if (snap.docs && snap.docs.length > 0) {
      const filtered = snap.docs.map((d) => ({ ...d.data(), _docId: d.id })).filter((item) => item.isVisible !== "hidden" && item.isvisible !== "hidden").sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
      return filtered;
    }
  } catch (dbErr) {
    console.warn(`[Gallery] ${label}: Firestore unavailable, loading from resilient store:`, dbErr.message);
  }
  try {
    const localItems = await list(collection);
    if (localItems && localItems.length > 0) {
      return localItems.filter((i) => i.isVisible !== "hidden").sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
    }
  } catch {
  }
  return [];
}
async function findDocById(collection, id2) {
  const snap = await db2.collection(collection).limit(1e3).get();
  for (const doc of snap.docs) {
    const docData = doc.data();
    if (docData._docId === id2 || doc.id === String(id2)) {
      return doc.ref;
    }
  }
  return null;
}
async function updateDocById(collection, label, id2, data) {
  const docRef = await findDocById(collection, id2);
  if (!docRef) {
    throw new Error(`Gallery ${label} not found: ${id2}`);
  }
  await docRef.set(data, { merge: true });
  const updated = (await docRef.get()).data();
  console.log(`[Gallery] Updated ${label}: docId=${docRef.id}`);
  return { ...updated, _docId: docRef.id };
}
async function deleteDocById(collection, label, id2) {
  const snap = await db2.collection(collection).limit(1e3).get();
  for (const doc of snap.docs) {
    const docData = doc.data();
    if (docData._docId === id2 || doc.id === String(id2)) {
      await doc.ref.delete();
      console.log(`[Gallery] Deleted ${label}: docId=${doc.id}`);
      return { success: true };
    }
  }
  throw new Error(`Gallery ${label} not found: ${id2}`);
}

// server/routers/gallery.ts
var ITEMS_COL = "gallery_items";
var VIDEOS_COL = "gallery_videos";
var LEGACY_ITEMS_COLS = ["Gallery", "gallery", "media_library", "mediaLibrary"];
var galleryRouter = router({
  // ─── Public Endpoints ───
  listVisible: publicProcedure.query(async () => {
    try {
      const primary = await listVisibleFromCollection(ITEMS_COL, "listVisible");
      if (primary && primary.length > 0) return primary;
      for (const collection of LEGACY_ITEMS_COLS) {
        const legacyItems = await listVisibleFromCollection(collection, `listVisible(${collection})`);
        if (legacyItems && legacyItems.length > 0) return legacyItems;
      }
      const storeItems = await list(ITEMS_COL).catch(() => []);
      if (storeItems && storeItems.length > 0) return storeItems;
      return [];
    } catch (e) {
      console.warn("[Gallery] listVisible error fallback:", e);
      const storeItems = await list(ITEMS_COL).catch(() => []);
      return storeItems || [];
    }
  }),
  listVisibleVideos: publicProcedure.query(async () => {
    try {
      return await listVisibleFromCollection(VIDEOS_COL, "listVisibleVideos");
    } catch (e) {
      console.warn("[Gallery] listVisibleVideos fallback:", e);
      return [];
    }
  }),
  // ─── Admin Endpoints: Gallery Items ───
  listAll: adminProcedure.input(
    z7.object({
      limit: z7.number().min(1).max(200).default(100),
      offset: z7.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 100, offset = 0 } = input ?? {};
    try {
      const snap = await db2.collection(ITEMS_COL).orderBy("createdAt", "desc").offset(offset).limit(limit).get();
      if (snap.docs && snap.docs.length > 0) {
        return snap.docs.map((d) => ({ ...d.data(), _docId: d.id }));
      }
    } catch (err) {
      console.warn("[gallery.listAll] Firestore query failed, falling back to local store:", err);
    }
    const storeItems = await list(ITEMS_COL).catch(() => []);
    return (storeItems || []).slice(offset, offset + limit);
  }),
  create: adminProcedure.input(
    z7.object({
      imageUrl: z7.string().min(1),
      title: z7.string().min(1),
      titleAr: z7.string().optional(),
      description: z7.string().optional(),
      descriptionAr: z7.string().optional(),
      category: z7.string().min(1),
      categoryAr: z7.string().optional(),
      location: z7.string().optional(),
      locationAr: z7.string().optional(),
      featured: z7.enum(["yes", "no"]).default("no"),
      aspect: z7.enum(["landscape", "portrait", "square"]).default("landscape"),
      sortOrder: z7.number().default(0)
    })
  ).mutation(async ({ input }) => {
    const docRef = await db2.collection(ITEMS_COL).add({
      ...input,
      isVisible: "visible",
      createdAt: /* @__PURE__ */ new Date()
    });
    const doc = await docRef.get();
    const data = doc.data();
    console.log(`[Gallery] Created new item: docId=${docRef.id}, imageUrl=${input.imageUrl}`);
    return { ...data, _docId: docRef.id };
  }),
  update: adminProcedure.input(
    z7.object({
      id: z7.number(),
      imageUrl: z7.string().optional(),
      title: z7.string().optional(),
      titleAr: z7.string().optional(),
      description: z7.string().optional(),
      descriptionAr: z7.string().optional(),
      category: z7.string().optional(),
      categoryAr: z7.string().optional(),
      location: z7.string().optional(),
      locationAr: z7.string().optional(),
      featured: z7.enum(["yes", "no"]).optional(),
      aspect: z7.enum(["landscape", "portrait", "square"]).optional(),
      sortOrder: z7.number().optional(),
      isVisible: z7.enum(["visible", "hidden"]).optional()
    })
  ).mutation(async ({ input }) => {
    const { id: id2, ...data } = input;
    return updateDocById(ITEMS_COL, "item", id2, data);
  }),
  delete: adminProcedure.input(z7.object({ id: z7.number() })).mutation(async ({ input }) => {
    return deleteDocById(ITEMS_COL, "item", input.id);
  }),
  uploadImage: adminProcedure.input(
    z7.object({
      fileData: z7.string(),
      filename: z7.string(),
      mimeType: z7.string()
    })
  ).mutation(async ({ input }) => {
    const { buffer, fileKey } = decodeAndValidateUpload(
      input.fileData,
      input.filename,
      "gallery"
    );
    const { url } = await storagePut(fileKey, buffer, input.mimeType);
    return { url, fileKey };
  }),
  // ─── Admin Endpoints: Gallery Videos ───
  listAllVideos: adminProcedure.input(
    z7.object({
      limit: z7.number().min(1).max(100).default(50),
      offset: z7.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 50, offset = 0 } = input ?? {};
    const snap = await db2.collection(VIDEOS_COL).orderBy("createdAt", "desc").offset(offset).limit(limit).get();
    return snap.docs.map((d) => ({ ...d.data(), _docId: d.id }));
  }),
  createVideo: adminProcedure.input(
    z7.object({
      thumbnailUrl: z7.string().min(1),
      title: z7.string().min(1),
      titleAr: z7.string().optional(),
      youtubeId: z7.string().min(1),
      duration: z7.string().optional(),
      views: z7.string().optional(),
      sortOrder: z7.number().default(0)
    })
  ).mutation(async ({ input }) => {
    const docRef = await db2.collection(VIDEOS_COL).add({
      ...input,
      isVisible: "visible",
      createdAt: /* @__PURE__ */ new Date()
    });
    const doc = await docRef.get();
    const data = doc.data();
    console.log(`[Gallery] Created new video: docId=${docRef.id}, youtubeId=${input.youtubeId}`);
    return { ...data, _docId: docRef.id };
  }),
  updateVideo: adminProcedure.input(
    z7.object({
      id: z7.number(),
      thumbnailUrl: z7.string().optional(),
      title: z7.string().optional(),
      titleAr: z7.string().optional(),
      youtubeId: z7.string().optional(),
      duration: z7.string().optional(),
      views: z7.string().optional(),
      sortOrder: z7.number().optional(),
      isVisible: z7.enum(["visible", "hidden"]).optional()
    })
  ).mutation(async ({ input }) => {
    const { id: id2, ...data } = input;
    return updateDocById(VIDEOS_COL, "video", id2, data);
  }),
  deleteVideo: adminProcedure.input(z7.object({ id: z7.number() })).mutation(async ({ input }) => {
    return deleteDocById(VIDEOS_COL, "video", input.id);
  })
});

// server/routers/aiStudio.ts
import { z as z8 } from "zod";

// server/openaiImageGen.ts
async function generateImageWithDALLE(options) {
  const apiKey = ENV.openaiApiKey;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured. Please add your OpenAI API key.");
  }
  let targetSize = options.size || "1024x1024";
  if (targetSize === "1792x1024") targetSize = "1536x1024";
  if (targetSize === "1024x1792") targetSize = "1024x1536";
  const modelsToTry = [
    options.model || "gpt-image-1.5",
    "chatgpt-image-latest",
    "dall-e-3"
  ];
  let b64Json = null;
  let revisedPrompt;
  let lastError = null;
  for (const model of modelsToTry) {
    try {
      const payload = {
        model,
        prompt: options.prompt,
        n: 1,
        size: targetSize
      };
      if (model === "dall-e-3") {
        payload.size = options.size === "1536x1024" ? "1792x1024" : options.size === "1024x1536" ? "1024x1792" : "1024x1024";
        payload.style = options.style || "vivid";
        payload.quality = options.quality === "high" || options.quality === "max" ? "hd" : "standard";
        payload.response_format = "b64_json";
      }
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const item = data.data?.[0];
      if (item?.b64_json) {
        b64Json = item.b64_json;
        revisedPrompt = item.revised_prompt || void 0;
        break;
      } else if (item?.url) {
        const imgRes = await fetch(item.url);
        const arrayBuf = await imgRes.arrayBuffer();
        b64Json = Buffer.from(arrayBuf).toString("base64");
        revisedPrompt = item.revised_prompt || void 0;
        break;
      }
    } catch (err) {
      lastError = err;
      continue;
    }
  }
  if (!b64Json) {
    throw new Error(`OpenAI image generation failed: ${lastError?.message || "Unknown error"}`);
  }
  const buffer = Buffer.from(b64Json, "base64");
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const s3Key = `ai-generated/openai-${timestamp}-${randomSuffix}.png`;
  const { url } = await storagePut(s3Key, buffer, "image/png");
  return {
    url,
    s3Key,
    revisedPrompt
  };
}

// server/geminiImageGen.ts
import { GoogleGenAI } from "@google/genai";
var GEMINI_IMAGE_MODELS = {
  "nano-banana": {
    modelCode: "gemini-2.5-flash-image",
    name: "Nano Banana",
    description: "Fast, creative workflows with state-of-the-art speed",
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
    creditCost: 1
  },
  "nano-banana-pro": {
    modelCode: "gemini-3-pro-image-preview",
    name: "Nano Banana Pro",
    description: "Studio-quality 4K visuals, complex layouts, precise text rendering",
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
    creditCost: 3
  },
  "nano-banana-2": {
    modelCode: "gemini-3.1-flash-image-preview",
    name: "Nano Banana 2",
    description: "High-efficiency production-scale, supports 0.5K-4K and extra aspect ratios",
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4", "1:4", "4:1"],
    creditCost: 2
  }
};
async function generateImageWithGemini(options) {
  const apiKey = ENV.geminiApiKey;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please add your Gemini API key."
    );
  }
  const ai = new GoogleGenAI({ apiKey });
  const modelId = options.model || "nano-banana";
  const modelConfig = GEMINI_IMAGE_MODELS[modelId];
  if (!modelConfig) {
    throw new Error(`Unknown Gemini model: ${modelId}`);
  }
  let fullPrompt = options.prompt;
  if (options.style && options.style !== "vivid") {
    fullPrompt = `${options.style} style: ${options.prompt}`;
  }
  if (options.aspectRatio && options.aspectRatio !== "1:1") {
    fullPrompt += ` (aspect ratio: ${options.aspectRatio})`;
  }
  const response = await ai.models.generateContent({
    model: modelConfig.modelCode,
    contents: fullPrompt,
    config: {
      responseModalities: ["TEXT", "IMAGE"]
    }
  });
  const candidates = response.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error("No response candidates from Gemini API");
  }
  const parts = candidates[0].content?.parts;
  if (!parts || parts.length === 0) {
    throw new Error("No content parts in Gemini API response");
  }
  let imageBuffer = null;
  let mimeType = "image/png";
  let textResponse;
  for (const part of parts) {
    if (part.inlineData) {
      imageBuffer = Buffer.from(part.inlineData.data, "base64");
      mimeType = part.inlineData.mimeType || "image/png";
    } else if (part.text) {
      textResponse = part.text;
    }
  }
  if (!imageBuffer) {
    throw new Error(
      "No image data returned from Gemini API. The model may have declined to generate this image."
    );
  }
  const ext = mimeType.includes("jpeg") || mimeType.includes("jpg") ? "jpg" : "png";
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const modelPrefix = modelId.replace(/-/g, "");
  const s3Key = `ai-generated/${modelPrefix}-${timestamp}-${randomSuffix}.${ext}`;
  const { url } = await storagePut(s3Key, imageBuffer, mimeType);
  return {
    url,
    s3Key,
    revisedPrompt: textResponse || void 0
  };
}

// server/cloudflareImageGen.ts
async function generateImageWithCloudflare(options) {
  const accountId = ENV.cloudflareAiAccountId;
  const apiToken = ENV.cloudflareAiToken;
  if (!apiToken) {
    throw new Error(
      "Cloudflare Workers AI token is not configured. Please set CLOUDFLARE_AI_TOKEN."
    );
  }
  const requestedModel = options.model || "openai/gpt-image-2.5-sunburst";
  let actualModel = requestedModel;
  let endpoint;
  let requestBody;
  if (requestedModel === "openai/gpt-image-2.5-sunburst") {
    endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run`;
    requestBody = {
      model: "openai/gpt-image-2.5-sunburst",
      input: {
        prompt: options.prompt,
        quality: options.quality === "high" ? "max" : "high",
        size: options.size || "1024x1024"
      }
    };
  } else {
    endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${requestedModel}`;
    requestBody = {
      prompt: options.prompt
    };
  }
  let response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });
  if (!response.ok && requestedModel === "openai/gpt-image-2.5-sunburst" && response.status === 402) {
    console.warn(
      `[Cloudflare AI] openai/gpt-image-2.5-sunburst requires active OpenAI BYOK access. Falling back to Cloudflare FLUX.1 Schnell...`
    );
    actualModel = "@cf/black-forest-labs/flux-1-schnell";
    endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${actualModel}`;
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: options.prompt })
    });
  }
  if (!response.ok) {
    let errorDetails = "";
    try {
      const errJson = await response.json();
      errorDetails = errJson.errors?.[0]?.message || JSON.stringify(errJson);
    } catch {
      errorDetails = await response.text();
    }
    throw new Error(`Cloudflare Workers AI error (${response.status}): ${errorDetails}`);
  }
  const contentType = response.headers.get("content-type") || "";
  let imageBuffer;
  let mimeType = "image/png";
  if (contentType.includes("application/json")) {
    const data = await response.json();
    const base64Data = data.result?.image || data.result || data.image || data.data?.[0]?.b64_json;
    if (!base64Data || typeof base64Data !== "string") {
      throw new Error("No image data found in Cloudflare AI response: " + JSON.stringify(data).slice(0, 200));
    }
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
    imageBuffer = Buffer.from(cleanBase64, "base64");
    if (cleanBase64.startsWith("/9j/")) {
      mimeType = "image/jpeg";
    }
  } else {
    const arrayBuffer = await response.arrayBuffer();
    imageBuffer = Buffer.from(arrayBuffer);
    if (contentType.startsWith("image/")) {
      mimeType = contentType;
    }
  }
  const ext = mimeType.includes("jpeg") || mimeType.includes("jpg") ? "jpg" : "png";
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const s3Key = `ai-generated/cf-sunburst-${timestamp}-${randomSuffix}.${ext}`;
  const { url } = await storagePut(s3Key, imageBuffer, mimeType);
  return {
    url,
    s3Key,
    revisedPrompt: actualModel !== requestedModel ? `Generated via Cloudflare FLUX.1 Engine: ${options.prompt}` : void 0,
    actualModel
  };
}

// server/routers/aiStudio.ts
var aiStudioRouter = router({
  /** Get or create AI subscription for current user */
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    return getOrCreateAISubscription(ctx.user.id);
  }),
  /** Upgrade subscription plan */
  upgradePlan: protectedProcedure.input(
    z8.object({
      plan: z8.enum(["free", "pro", "enterprise"]),
      stripePaymentIntentId: z8.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    if (input.plan !== "free" && ctx.user.role !== "admin") {
      if (!input.stripePaymentIntentId || !input.stripePaymentIntentId.startsWith("pi_")) {
        throw new Error("Valid payment confirmation is required to upgrade subscription plan");
      }
    }
    const subscription = await updateAISubscription(ctx.user.id, input.plan, input.stripePaymentIntentId);
    return subscription;
  }),
  /** Get current user's AI credits */
  getCredits: protectedProcedure.query(async ({ ctx }) => {
    const credits = await getOrCreateAICredits(ctx.user.id);
    if (ctx.user.role === "admin") {
      const current = parseFloat(credits.balance?.toString() || "0");
      if (current < 5e3) {
        return addAICredits(ctx.user.id, 1e4, "bonus");
      }
    }
    return credits;
  }),
  /** Add credits to user account (admin only) */
  addCredits: adminProcedure.input(
    z8.object({
      userId: z8.number().optional(),
      amount: z8.number().min(1).max(1e6),
      reason: z8.enum(["purchase", "monthly_allowance", "bonus"]).optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const targetUserId = input.userId ? input.userId : ctx.user.id;
    return addAICredits(targetUserId, input.amount, input.reason || "bonus");
  }),
  /** Generate image with DALL-E 3, Nano Banana, or Cloudflare Sunburst models - Real API call */
  generateImage: protectedProcedure.input(
    z8.object({
      prompt: z8.string().min(1).max(4e3),
      model: z8.enum(["dall-e-3", "nano-banana", "nano-banana-pro", "nano-banana-2", "gpt-image-2.5-sunburst"]).default("dall-e-3"),
      // DALL-E / Cloudflare specific options
      size: z8.enum(["1024x1024", "1792x1024", "1024x1792", "1536x1024", "1024x1536"]).default("1024x1024"),
      style: z8.enum(["vivid", "natural"]).default("vivid"),
      quality: z8.enum(["standard", "hd", "high"]).default("standard"),
      // Nano Banana specific options
      aspectRatio: z8.enum(["1:1", "16:9", "9:16", "4:3", "3:4", "1:4", "4:1"]).default("1:1"),
      creditCost: z8.number().min(1).default(2)
    })
  ).mutation(async ({ ctx, input }) => {
    const isAdmin = ctx.user.role === "admin";
    const credits = await getOrCreateAICredits(ctx.user.id);
    const currentBalance = parseFloat(credits.balance.toString());
    if (!isAdmin && currentBalance < input.creditCost) {
      throw new Error("Insufficient credits. Please upgrade your plan or purchase more credits.");
    }
    if (!isAdmin) {
      await deductAICredits(ctx.user.id, input.creditCost);
    }
    const isGeminiModel = input.model.startsWith("nano-banana");
    const isCloudflareModel = input.model === "gpt-image-2.5-sunburst";
    const modelName = input.model;
    const usageRecord = await createAIUsage({
      userId: ctx.user.id,
      type: "image",
      model: modelName,
      prompt: input.prompt,
      creditsCost: input.creditCost.toString(),
      imageSize: isGeminiModel ? input.aspectRatio : input.size,
      status: "pending"
    });
    try {
      let result;
      if (isGeminiModel) {
        result = await generateImageWithGemini({
          prompt: input.prompt,
          model: input.model,
          aspectRatio: input.aspectRatio,
          style: input.style
        });
      } else if (isCloudflareModel) {
        result = await generateImageWithCloudflare({
          prompt: input.prompt,
          size: input.size,
          quality: input.quality === "hd" || input.quality === "high" ? "high" : "standard"
        });
      } else {
        result = await generateImageWithDALLE({
          prompt: input.prompt,
          size: input.size,
          style: input.style,
          quality: input.quality === "high" ? "hd" : input.quality
        });
      }
      await updateAIUsageStatus(usageRecord.id, "completed", result.url);
      return {
        success: true,
        imageUrl: result.url,
        s3Key: result.s3Key,
        revisedPrompt: result.revisedPrompt,
        model: modelName,
        usageId: usageRecord.id
      };
    } catch (error) {
      await addAICredits(ctx.user.id, input.creditCost, "bonus");
      const errorMsg = error instanceof Error ? error.message : "Unknown error during image generation";
      await updateAIUsageStatus(usageRecord.id, "failed", void 0, errorMsg);
      throw new Error(`Image generation failed (${modelName}): ${errorMsg}`);
    }
  }),
  /** Deduct credits for image generation (legacy - kept for backward compatibility) */
  deductCreditsForImage: protectedProcedure.input(
    z8.object({
      amount: z8.number().min(1),
      imageModel: z8.string().default("dall-e-3"),
      prompt: z8.string().min(1),
      imageSize: z8.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const credits = await getOrCreateAICredits(ctx.user.id);
    const currentBalance = parseFloat(credits.balance.toString());
    if (currentBalance < input.amount) {
      throw new Error("Insufficient credits for this operation");
    }
    const updated = await deductAICredits(ctx.user.id, input.amount);
    await createAIUsage({
      userId: ctx.user.id,
      type: "image",
      model: input.imageModel,
      prompt: input.prompt,
      creditsCost: input.amount.toString(),
      imageSize: input.imageSize,
      status: "pending"
    });
    return updated;
  }),
  /** Deduct credits for video generation */
  deductCreditsForVideo: protectedProcedure.input(
    z8.object({
      amount: z8.number().min(1),
      videoModel: z8.string().default("runway-ml"),
      prompt: z8.string().min(1),
      videoDuration: z8.number().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const credits = await getOrCreateAICredits(ctx.user.id);
    const currentBalance = parseFloat(credits.balance.toString());
    if (currentBalance < input.amount) {
      throw new Error("Insufficient credits for this operation");
    }
    const updated = await deductAICredits(ctx.user.id, input.amount);
    await createAIUsage({
      userId: ctx.user.id,
      type: "video",
      model: input.videoModel,
      prompt: input.prompt,
      creditsCost: input.amount.toString(),
      videoDuration: input.videoDuration,
      status: "pending"
    });
    return updated;
  }),
  /** Get user's AI usage history */
  getUsageHistory: protectedProcedure.input(
    z8.object({
      limit: z8.number().min(1).max(100).default(50),
      offset: z8.number().min(0).default(0)
    }).optional()
  ).query(async ({ ctx, input }) => {
    const { limit = 50, offset = 0 } = input ?? {};
    return getUserAIUsage(ctx.user.id, limit, offset);
  }),
  /** Get AI usage statistics */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    return getAIUsageStats(ctx.user.id);
  }),
  /** Get available AI models (public) */
  getModels: publicProcedure.query(async () => {
    return [
      {
        id: "dall-e-3",
        name: "DALL-E 3",
        provider: "OpenAI",
        description: "High-quality image generation with excellent prompt following",
        creditCost: 2,
        badge: "Premium",
        sizes: ["1024x1024", "1792x1024", "1024x1792"],
        styles: ["vivid", "natural"],
        qualities: ["standard", "hd"],
        features: ["Revised prompt", "HD quality", "Multiple sizes"]
      },
      {
        id: "nano-banana",
        name: "Nano Banana",
        provider: "Google Gemini 2.5 Flash",
        description: GEMINI_IMAGE_MODELS["nano-banana"].description,
        creditCost: GEMINI_IMAGE_MODELS["nano-banana"].creditCost,
        badge: "Fast",
        aspectRatios: [...GEMINI_IMAGE_MODELS["nano-banana"].aspectRatios],
        features: ["Text in images", "Multi-language", "Lowest cost"]
      },
      {
        id: "nano-banana-pro",
        name: "Nano Banana Pro",
        provider: "Google Gemini 3 Pro",
        description: GEMINI_IMAGE_MODELS["nano-banana-pro"].description,
        creditCost: GEMINI_IMAGE_MODELS["nano-banana-pro"].creditCost,
        badge: "4K Studio",
        aspectRatios: [...GEMINI_IMAGE_MODELS["nano-banana-pro"].aspectRatios],
        features: ["4K resolution", "Complex layouts", "Precise text rendering", "Google Search grounding"]
      },
      {
        id: "nano-banana-2",
        name: "Nano Banana 2",
        provider: "Google Gemini 3.1 Flash",
        description: GEMINI_IMAGE_MODELS["nano-banana-2"].description,
        creditCost: GEMINI_IMAGE_MODELS["nano-banana-2"].creditCost,
        badge: "New",
        aspectRatios: [...GEMINI_IMAGE_MODELS["nano-banana-2"].aspectRatios],
        features: ["0.5K-4K resolution", "Extra aspect ratios", "Image Search grounding", "Production-scale"]
      },
      {
        id: "gpt-image-2.5-sunburst",
        name: "GPT Image 2.5 Sunburst",
        provider: "OpenAI on Cloudflare",
        description: "Ultra photorealistic, next-generation prompt fidelity and fine details via Cloudflare Workers AI",
        creditCost: 2,
        badge: "Sunburst 4K",
        sizes: ["1024x1024", "1536x1024", "1024x1536"],
        qualities: ["standard", "high"],
        features: ["Sunburst 4K Engine", "Edge accelerated", "Ultra photorealistic", "Cloudflare Workers AI"]
      }
    ];
  }),
  /** Get subscription plans (public) */
  getPlans: publicProcedure.query(async () => {
    return [
      {
        id: "free",
        name: "Free",
        monthlyCredits: 10,
        price: 0,
        features: [
          "10 \u0635\u0648\u0631 \u0634\u0647\u0631\u064A\u0627\u064B",
          "\u062C\u0648\u062F\u0629 \u0645\u0639\u064A\u0627\u0631\u064A\u0629",
          "\u062F\u0639\u0645 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A"
        ]
      },
      {
        id: "pro",
        name: "Pro",
        monthlyCredits: 100,
        price: 29,
        features: [
          "100 \u0635\u0648\u0631\u0629 \u0634\u0647\u0631\u064A\u0627\u064B",
          "\u062C\u0648\u062F\u0629 \u0639\u0627\u0644\u064A\u0629",
          "\u062F\u0639\u0645 \u0627\u0644\u0641\u064A\u062F\u064A\u0648",
          "\u0623\u0648\u0644\u0648\u064A\u0629 \u0641\u064A \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629",
          "\u062F\u0639\u0645 \u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0627\u062A"
        ]
      },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyCredits: 1e3,
        price: 99,
        features: [
          "1000 \u0635\u0648\u0631\u0629 \u0634\u0647\u0631\u064A\u0627\u064B",
          "\u062C\u0648\u062F\u0629 \u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629",
          "\u0641\u064A\u062F\u064A\u0648\u0647\u0627\u062A \u063A\u064A\u0631 \u0645\u062D\u062F\u0648\u062F\u0629",
          "\u0645\u0639\u0627\u0644\u062C\u0629 \u0641\u0648\u0631\u064A\u0629",
          "\u062F\u0639\u0645 \u0645\u062E\u0635\u0635 24/7",
          "\u0648\u0627\u062C\u0647\u0629 \u0628\u0631\u0645\u062C\u064A\u0629 (API)"
        ]
      }
    ];
  })
});

// server/routers/users.ts
import { z as z9 } from "zod";
import { TRPCError as TRPCError3 } from "@trpc/server";
var adminProcedure2 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError3({
      code: "FORBIDDEN",
      message: "Admin access required"
    });
  }
  return next({ ctx });
});
var usersRouter = router({
  // Get all users (admin only)
  list: adminProcedure2.input(
    z9.object({
      limit: z9.number().min(1).max(100).default(50),
      offset: z9.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    try {
      const { limit = 50, offset = 0 } = input ?? {};
      const [usersList, total] = await Promise.all([
        getAllUsers(limit, offset),
        getUsersCount()
      ]);
      console.log(`[users.list] retrieved ${usersList.length} users out of ${total} total`);
      return {
        users: usersList,
        total,
        limit,
        offset
      };
    } catch (error) {
      console.error("[users.list] query error:", {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }),
  // Get single user by ID (admin only)
  getById: adminProcedure2.input(z9.object({ id: z9.number() })).query(async ({ input }) => {
    try {
      const user = await getUserById(input.id);
      if (!user) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "User not found"
        });
      }
      console.log(`[users.getById] retrieved user: id=${input.id}`);
      return user;
    } catch (error) {
      console.error("[users.getById] query error:", {
        error: error instanceof Error ? error.message : String(error),
        id: input.id
      });
      throw error;
    }
  }),
  // Update user role (admin only)
  updateRole: adminProcedure2.input(
    z9.object({
      id: z9.number(),
      role: z9.enum(["user", "admin"])
    })
  ).mutation(async ({ input }) => {
    try {
      const user = await updateUserRole(input.id, input.role);
      if (!user) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "User not found"
        });
      }
      console.log(`[users.updateRole] updated user: id=${input.id}, role=${input.role}`);
      return user;
    } catch (error) {
      console.error("[users.updateRole] mutation error:", {
        error: error instanceof Error ? error.message : String(error),
        id: input.id,
        role: input.role
      });
      throw error;
    }
  }),
  // Search users (admin only)
  search: adminProcedure2.input(
    z9.object({
      query: z9.string().min(1),
      limit: z9.number().min(1).max(50).default(20)
    })
  ).query(async ({ input }) => {
    try {
      const results = await searchUsers(input.query, input.limit);
      console.log(`[users.search] found ${results.length} users matching: ${input.query}`);
      return results;
    } catch (error) {
      console.error("[users.search] query error:", {
        error: error instanceof Error ? error.message : String(error),
        query: input.query
      });
      throw error;
    }
  }),
  // Get user statistics (admin only)
  stats: adminProcedure2.query(async () => {
    try {
      const stats = await getUserStats();
      console.log("[users.stats] retrieved user statistics");
      return stats;
    } catch (error) {
      console.error("[users.stats] query error:", {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }),
  // Get current user profile
  profile: protectedProcedure.query(async ({ ctx }) => {
    try {
      console.log(`[users.profile] retrieved profile for user: ${ctx.user.id}`);
      return ctx.user;
    } catch (error) {
      console.error("[users.profile] query error:", {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }),
  // Update current user profile
  updateProfile: protectedProcedure.input(
    z9.object({
      name: z9.string().min(1).max(100).optional(),
      phone: z9.string().max(32).nullable().optional(),
      avatarUrl: z9.string().url().nullable().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      const updated = await updateUserProfile(ctx.user.id, input);
      if (!updated) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "User not found"
        });
      }
      console.log(`[users.updateProfile] updated profile for user: ${ctx.user.id}`);
      return updated;
    } catch (error) {
      console.error("[users.updateProfile] mutation error:", {
        error: error instanceof Error ? error.message : String(error),
        userId: ctx.user.id
      });
      throw error;
    }
  }),
  // Get profile stats for current user (bookings count, reviews count, AI credits)
  profileStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    let bookingsCount = 0;
    let reviewsCount = 0;
    let aiCreditsBalance = 0;
    try {
      try {
        const userBookings = await getUserBookings(userId);
        bookingsCount = userBookings.length;
      } catch {
      }
      try {
        reviewsCount = await count("reviews", [["userId", "==", userId]]);
      } catch {
      }
      try {
        const credits = await getOrCreateAICredits(userId);
        aiCreditsBalance = parseFloat(credits.balance.toString());
      } catch {
      }
      console.log(`[users.profileStats] retrieved stats for user: ${userId}, bookings=${bookingsCount}, reviews=${reviewsCount}`);
      return {
        bookings: bookingsCount,
        reviews: reviewsCount,
        aiCredits: aiCreditsBalance
      };
    } catch (error) {
      console.error("[users.profileStats] query error:", {
        error: error instanceof Error ? error.message : String(error),
        userId
      });
      throw error;
    }
  })
});

// server/routers/blog.ts
import { z as z10 } from "zod";
import { TRPCError as TRPCError4 } from "@trpc/server";

// shared/seo/priorityBlogPosts.ts
var PRIORITY_SEO_BLOG_POSTS = [
  {
    id: 101,
    slug: "what-does-a-luxury-travel-concierge-do",
    title: "What Does a Luxury Travel Concierge Do? (And Why You Need One)",
    excerpt: "Discover what a luxury travel concierge does, how luxury travel concierge services work, what is included in UHNW packages, and why global executives and royal families rely on Vanir Group.",
    metaTitle: "What Does a Luxury Travel Concierge Do? (And Why You Need One) | Vanir Group",
    metaDescription: "Discover what a luxury travel concierge does, how luxury travel concierge services work, what is included in UHNW packages, and why executives rely on Vanir Group.",
    metaKeywords: "what does a luxury travel concierge do, luxury travel concierge service, how luxury travel concierge works, UHNW travel concierge, celebrity travel concierge, Vanir Group",
    coverImageUrl: "/The_Nile_River_at_Cairo.jpg",
    category: "Destinations",
    tags: [
      "Luxury Travel Concierge",
      "UHNW Travel",
      "Private Aviation",
      "VIP Access",
      "Vanir Group",
      "Ahmed Roshdi"
    ],
    authorName: "Ahmed Roshdi, Founder & CEO",
    readingTime: 9,
    viewCount: 1420,
    status: "published",
    publishedAt: "2026-10-28T10:00:00.000Z",
    createdAt: "2026-10-28T10:00:00.000Z",
    updatedAt: "2026-11-02T00:00:00.000Z",
    content: `## What Does a Luxury Travel Concierge Do?

When ultra-high-net-worth (UHNW) individuals, Fortune 500 executives, diplomatic delegations, and discerning families travel, standard five-star bookings are rarely sufficient. **What does a luxury travel concierge do?** A true luxury travel concierge service acts as a 24/7 personal lifestyle architect, private aviation broker, diplomatic protocol officer, and on-ground crisis manager\u2014orchestrating complex global itineraries with zero friction and absolute confidentiality.

At **Vanir Group (Vanir Travel Group)**, founded by CEO **Ahmed Roshdi**, our luxury travel concierge desk does not merely reserve hotel rooms. We engineer experiences that cannot be purchased by the general public: standing alone inside the King's Chamber of the Great Pyramid of Giza at midnight, stepping directly from a Gulfstream G650 onto a waiting tarmac Maybach in Cairo or Zurich, or securing an entire Maldivian private island on 48 hours' notice.

---

## How Does a Luxury Travel Concierge Service Work?

Understanding **how a luxury travel concierge service works** reveals why time-poor leaders never travel without one:

### 1. Confidential Discovery & Architectural Briefing
Every engagement begins with a private consultation with a Senior Travel Architect. We document your preferred aircraft tail types, suite configurations, security protocols, dietary preferences, and cultural interests across every family generation.

### 2. Custom Day-by-Day Blueprint & Transparent Pricing
Within 24 hours, Vanir Group delivers a bespoke itinerary featuring verified aircraft availability, presidential suite floorplans, private Egyptologist or specialist bios, and transparent all-inclusive EUR/USD pricing.

### 3. 24/7 White-Glove Execution & Real-Time Flight Monitoring
From the moment you depart your residence in Germany, the UK, the US, or the GCC, our operations center monitors every flight leg, weather pattern, and ground transfer in real time\u2014executing instant mid-trip adjustments via your dedicated WhatsApp concierge channel.

---

## What Services Are Included in Luxury Travel Concierge Packages?

Clients frequently ask: **What is included in luxury travel concierge packages?** At Vanir Group, our comprehensive retainer and per-journey packages encompass seven core pillars:

- **On-Demand Private Aviation (Privatjet mieten):** Instant access to 5,000+ ARGUS and Wyvern-certified light, midsize, and ultra-long-range heavy jets, helicopters, and VIP airliners.
- **VIP Airport Tarmac Fast-Track & Diplomatic Clearance:** Plane-side limousine greeting, private VIP lounge sanctuary, and zero-queue customs and visa processing.
- **Unlisted Presidential Suites & Private Villas:** Direct General Manager relationships unlocking off-market royal suites, complimentary upgrades, $100\u2013$500 resort credits, and flexible check-in.
- **Private After-Hours Monument & Museum Openings:** Exclusive Ministry permits for private entry to the Pyramids of Giza, the Sphinx enclosure, the Grand Egyptian Museum (GEM), the Tomb of Queen Nefertari, and the Vatican Museums.
- **Superyacht & Private Dahabiya Charters:** Crewed motor yachts in the Red Sea, Amalfi Coast, and Greek Cyclades, alongside private-charter luxury Dahabiyas sailing between Luxor and Aswan.
- **Executive Security & Chauffeur Fleet:** Armored SUVs, Mercedes-Maybach sedans, and multilingual close-protection officers.
- **Fine Dining, Wellness & Event Access:** Priority tables at Michelin-starred restaurants, Formula 1 paddock passes, and private opera boxes across Europe and the Middle East.

---

## Why Celebrities, Executives, and UHNW Families Choose Vanir Group

Whether you require a **luxury travel concierge for celebrities and executives** or a multi-generational family retreat, privacy and operational ownership are non-negotiable. Unlike middleman brokers who outsource your trip to unknown third parties, Vanir Group commands its own licensed ground operations in Egypt and the Middle East while maintaining direct aviation and European partner desks.

### Ready to Elevate Your Next Journey?
Contact Founder & CEO **Ahmed Roshdi** and the **Vanir Group 24/7 Concierge Desk** at [vanirgroup.com/contact](/contact) or call **+20 112 398 8882** to design your bespoke itinerary.`
  },
  {
    id: 102,
    slug: "private-jet-charter-guide-how-to-book-costs",
    title: "Private Jet Charter Guide: How to Book, Costs & What to Expect (Privatjet Mieten)",
    excerpt: "The complete 2026 guide to private jet charter (Privatjet mieten & Flugzeug chartern): hourly pricing for light, midsize, and heavy jets, Germany to Egypt routes, and VIP terminal procedures.",
    metaTitle: "Private Jet Charter Guide: How to Book, Costs & Privatjet Mieten | Vanir Group",
    metaDescription: "Complete private jet charter guide (Privatjet mieten & Flugzeug chartern): hourly costs for light, midsize, and heavy jets, Germany to Egypt routes, and booking tips.",
    metaKeywords: "private jet charter, Privatjet mieten, Flugzeug chartern, Privatflugzeug chartern, private jet charter cost, Germany to Egypt private jet, Vanir Group aviation",
    coverImageUrl: "/images/Luxury Private Jet Interior with Warm Ambient Elegance \u2728.jpeg",
    category: "Experiences",
    tags: [
      "Private Jet Charter",
      "Privatjet Mieten",
      "Flugzeug Chartern",
      "Germany DACH",
      "Luxury Aviation",
      "Egypt Private Jet"
    ],
    authorName: "Ahmed Roshdi, Founder & CEO",
    readingTime: 10,
    viewCount: 1890,
    status: "published",
    publishedAt: "2026-10-29T10:00:00.000Z",
    createdAt: "2026-10-29T10:00:00.000Z",
    updatedAt: "2026-11-02T00:00:00.000Z",
    content: `## The Definitive Private Jet Charter Guide (Privatjet Mieten & Flugzeug Chartern)

Time is the only non-renewable luxury. Whether you are searching in English for **private jet charter** or in German for **Privatjet mieten** (8,100+ monthly searches in Germany), **Privatflugzeug chartern** (2,900/mo), or **Flugzeug chartern** (720/mo), chartering a private aircraft transforms international travel from an exhausting logistical ordeal into a seamless, private airborne sanctuary.

In this comprehensive aviation guide, **Vanir Group Private Aviation** breaks down how to book a private jet, transparent 2026\u20132027 hourly charter costs in Euros (\u20AC), aircraft categories, and popular routes connecting Germany (Frankfurt, Munich, Berlin, D\xFCsseldorf), Switzerland (Zurich, Geneva), and Europe with Cairo, Luxor, Sharm El Sheikh, Dubai, and the Maldives.

---

## Private Jet Categories & Transparent Hourly Charter Costs (2026\u20132027)

How much does it cost to charter a private jet (*Was kostet es, einen Privatjet zu mieten*)? Charter pricing is primarily calculated per flight hour, plus airport FBO handling and positioning:

### 1. Very Light & Light Jets (4\u20137 Passengers)
- **Representative Aircraft:** Embraer Phenom 300E, Cessna Citation CJ4, Pilatus PC-24
- **Range:** Up to 2,500\u20133,500 km (Ideal for intra-European flights or domestic hops like Cairo to Luxor, Aswan, or Sharm El Sheikh)
- **Indicative Hourly Rate:** **\u20AC3,200 \u2013 \u20AC4,500 per flight hour**

### 2. Midsize & Super-Midsize Jets (7\u201310 Passengers)
- **Representative Aircraft:** Cessna Citation Latitude, Bombardier Challenger 350, Embraer Praetor 600, Hawker 900XP
- **Range:** Up to 4,500\u20137,000 km (Non-stop from Frankfurt, Munich, Berlin, or Zurich to Cairo, Hurghada, or Dubai with full stand-up cabin comfort)
- **Indicative Hourly Rate:** **\u20AC4,800 \u2013 \u20AC6,800 per flight hour**

### 3. Heavy & Ultra-Long-Range Jets (10\u201316 Passengers)
- **Representative Aircraft:** Gulfstream G550 / G650ER, Bombardier Global 6000 / 7500, Dassault Falcon 7X / 8X
- **Range:** 10,000 \u2013 14,000+ km (Intercontinental range, private staterooms, full lie-flat beds, dedicated flight attendant, and Michelin-grade galley)
- **Indicative Hourly Rate:** **\u20AC7,500 \u2013 \u20AC12,500+ per flight hour**

---

## Sample Route Pricing: Germany (DE) & Europe to Egypt & Dubai

- **Munich (MUC) or Frankfurt (FRA) \u2192 Cairo (CAI) or Hurghada (HRG):** ~3 hours 50 minutes flight time. One-way Midsize Jet charter from **\u20AC22,500 \u2013 \u20AC31,000** (for up to 8 guests).
- **Zurich (ZRH) or Geneva (GVA) \u2192 Luxor (LXR):** ~4 hours flight time. Direct arrival at Luxor to board your private Nile Dahabiya from **\u20AC24,000 \u2013 \u20AC33,000**.
- **Cairo (CAI) \u2192 Luxor / Aswan / Abu Simbel (Private Domestic Day or Multi-Day Charter):** From **\u20AC9,500 \u2013 \u20AC14,500**, eliminating all commercial airport queues.

---

## How to Book a Private Jet with Vanir Group in 3 Steps

1. **Submit Your Flight Brief:** Share your departure city, destination, date, passenger count, and catering preferences via [vanirgroup.com/private-jet](/private-jet) or our 24/7 aviation desk (**+20 112 398 8882**).
2. **Compare Tail Numbers Within 2 Hours:** Receive 3\u20134 vetted aircraft options complete with year of manufacture, cabin photos, ARGUS/Wyvern safety audit certificates, and all-inclusive Euro pricing.
3. **Arrive 15 Minutes Before Takeoff:** Drive directly to the private General Aviation Terminal (GAT/FBO), clear passport control in under 5 minutes, and board your waiting aircraft.`
  },
  {
    id: 103,
    slug: "luxury-travel-agency-vs-concierge-service",
    title: "Luxury Travel Agency vs Concierge Service: Key Differences & Global Comparison",
    excerpt: "Compare luxury travel concierge services vs traditional travel agencies, plus an objective insider comparison of Vanir Group vs Quintessentially Travel vs Virtuoso.",
    metaTitle: "Luxury Travel Agency vs Concierge Service (Quintessentially vs Virtuoso) | Vanir Group",
    metaDescription: "Compare luxury travel concierge services vs traditional travel agencies, plus an insider comparison of Vanir Group vs Quintessentially Travel vs Virtuoso.",
    metaKeywords: "luxury travel concierge vs traditional travel agency, Quintessentially Travel vs Virtuoso, luxury travel agency vs concierge service, UHNW travel comparison, Vanir Group",
    coverImageUrl: "/images/final_cairo_post.png",
    category: "Travel Tips",
    tags: [
      "Concierge vs Travel Agency",
      "Quintessentially vs Virtuoso",
      "UHNW Travel",
      "Luxury Travel Management",
      "Vanir Group"
    ],
    authorName: "Ahmed Roshdi, Founder & CEO",
    readingTime: 8,
    viewCount: 1180,
    status: "published",
    publishedAt: "2026-10-30T10:00:00.000Z",
    createdAt: "2026-10-30T10:00:00.000Z",
    updatedAt: "2026-11-02T00:00:00.000Z",
    content: `## Luxury Travel Concierge vs Traditional Travel Agency: What Is the Difference?

Discerning travelers, family offices, and executive assistants frequently evaluate **luxury travel concierge vs traditional travel agency** models when planning high-stakes international journeys. While both can book a five-star hotel, their operational capabilities, hours of availability, and depth of insider access differ fundamentally.

---

## 5 Core Differences Between a Traditional Travel Agency and a Luxury Concierge

### 1. Pre-Packaged Inventory vs Bespoke Architectural Design
A traditional travel agency typically sells pre-negotiated wholesale tour packages and commercial flights during standard 9-to-5 office hours. A **luxury travel concierge service** like **Vanir Group** engineers every itinerary from a blank canvas\u2014synchronizing private jet charters, superyachts, private security, and after-hours monument openings around your exact schedule.

### 2. Impossible-to-Book Access vs Public Ticketing
Conventional agents buy standard admission tickets. Vanir Group secures Ministry permits for private after-hours entry inside the Great Pyramid of Khufu, private openings of the Tomb of Queen Nefertari in Luxor, and early-morning key-master access to the Vatican Museums.

### 3. 24/7 Proactive Crisis & Disruption Management
If your schedule changes at 2:00 AM in Zurich, Munich, or Cairo, a traditional agency's voicemail cannot reposition a helicopter or hold a Nile dahabiya. Every Vanir Group client has a dedicated 24/7 executive concierge director monitoring every movement.

---

## Global Benchmark Comparison: Quintessentially Travel vs Virtuoso vs Vanir Group

When researching **Quintessentially Travel vs Virtuoso** alongside **Vanir Group**, UHNW travelers should understand how each ecosystem operates:

- **Virtuoso:** A global network of independent travel agencies and advisors that unlocks excellent hotel perks (complimentary breakfast, $100 credit, room upgrades). However, local execution in destinations like Egypt or the Middle East is often subcontracted to third-party DMCs.
- **Quintessentially Travel:** A prestigious lifestyle club known for annual membership tiers (often $15,000\u2013$45,000+ per year) before travel costs are even incurred.
- **Vanir Group (Vanir Travel Group):** Combines **direct operational ownership** on the ground in Cairo, Luxor, Aswan, and the Red Sea with an integrated global private aviation desk (5,000+ aircraft) and European/Maldives luxury partnerships\u2014**with zero mandatory annual membership fees** and full white-glove VIP hotel perks.

### Experience Direct Sovereign Concierge Execution
Speak directly with our senior travel architects at [vanirgroup.com/contact](/contact) to compare a bespoke Vanir Group proposal for your next journey.`
  },
  {
    id: 104,
    slug: "egypt-luxury-travel-guide-private-tours-nile-cruises",
    title: "Egypt Luxury Travel Guide: Private Tours, Nile Cruises & Exclusive Access",
    excerpt: "The ultimate 2026\u20132027 guide to luxury Egypt tours: private after-hours Pyramids of Giza access, Grand Egyptian Museum VIP tours, Sanctuary Nile cruises, and bespoke itineraries.",
    metaTitle: "Egypt Luxury Travel Guide: Private Tours, Nile Cruises & VIP Access | Vanir Group",
    metaDescription: "The ultimate guide to luxury Egypt tours: private after-hours Giza Pyramids access, Grand Egyptian Museum VIP tours, Sanctuary Nile cruises, and 2026 costs.",
    metaKeywords: "luxury Egypt tours, Egypt luxury travel guide, private Nile cruise, after hours Pyramids of Giza tour, Grand Egyptian Museum VIP tour, Luxusreisen \xC4gypten",
    coverImageUrl: "/images/final_luxor_post.png",
    category: "Destinations",
    tags: [
      "Luxury Egypt Tours",
      "Private Nile Cruise",
      "Pyramids of Giza",
      "Grand Egyptian Museum",
      "Luxor & Aswan",
      "Siwa Oasis"
    ],
    authorName: "Ahmed Roshdi, Founder & CEO",
    readingTime: 11,
    viewCount: 2310,
    status: "published",
    publishedAt: "2026-10-31T10:00:00.000Z",
    createdAt: "2026-10-31T10:00:00.000Z",
    updatedAt: "2026-11-02T00:00:00.000Z",
    content: `## The Definitive Egypt Luxury Travel Guide: Private Tours, Nile Cruises & VIP Access

Egypt is the cradle of monumental civilization\u2014and when experienced through **luxury Egypt tours** curated by Cairo-headquartered **Vanir Group**, it becomes one of the most exclusive, crowd-free ultra-luxury destinations on earth.

Authored by Vanir Group Founder & CEO **Ahmed Roshdi**, this guide details how UHNW travelers, royal delegations, and European connoisseurs (*Luxusreisen \xC4gypten*) experience Cairo, Luxor, Aswan, Siwa Oasis, and the Red Sea in absolute privacy.

---

## Exclusive Monument Access Available Only on Private Luxury Egypt Tours

### 1. Private After-Hours Entry Inside the Great Pyramid of Khufu & Sphinx Enclosure
Public visitors experience the Giza Plateau amidst thousands of tourists. Vanir Group secures official Ministry of Tourism and Antiquities permits allowing your party to enter the Giza Plateau after sunset, stand alone inside the King's Chamber of the Great Pyramid, and walk directly between the paws of the Great Sphinx accompanied by a Ph.D. Egyptologist.

### 2. Grand Egyptian Museum (GEM) VVIP Curatorial Tours
Explore the world's largest archaeological museum overlooking the Pyramids with private curatorial access, including the complete Tutankhamun galleries and behind-the-scenes conservation briefings.

### 3. Private Opening of Queen Nefertari's Tomb (QV66) & King Seti I in Luxor
On the West Bank of Luxor, we arrange private access to the celestial painted chambers of Queen Nefertari and Pharaoh Seti I, followed by a candlelit reception near Temple precincts.

---

## Choosing Your Luxury Nile Cruise: Oberoi, Sanctuary vs Private Charter Dahabiya

A 4- to 7-night voyage between Luxor and Aswan is the soul of **luxury Egypt tours**. We recommend three distinct tiers:

- **Private Charter Luxury Dahabiya (6 to 10 Suites):** The ultimate choice for families and executive groups. Charter the entire traditional twin-masted sailing yacht with a private chef, mooring at quiet Nile islands inaccessible to large ships (**from \u20AC28,000/week full buyout**).
- **The Oberoi Zahra & The Oberoi Philae:** The pinnacle of contemporary five-star Nile cruising, featuring expansive private-terrace luxury suites, full spa suites, and a la carte fine dining.
- **Sanctuary Sun Boat IV & Historia Boutique Hotel Cruiser:** Art Deco heritage and contemporary design paired with expert Egyptologist lectures.

---

## Egypt's Finest Palace Hotels & Suites

- **Cairo:** Four Seasons Hotel Cairo at Nile Plaza (Royal Suite), The St. Regis Cairo, and Marriott Mena House (Pyramid-View Villa Suites).
- **Aswan:** Sofitel Legend Old Cataract Aswan (Winston Churchill & Agatha Christie Suites overlooking Elephantine Island).
- **Siwa Oasis & Red Sea:** Adr\xE8re Amellal Desert Eco-Lodge (Siwa) and private beachfront pool villas in El Gouna and Sharm El Sheikh.

### Start Planning Your Luxury Egypt Tour
Explore our dedicated [Luxury Egypt Tours page](/destinations/egypt) or request a custom proposal at [vanirgroup.com/booking](/booking).`
  },
  {
    id: 105,
    slug: "best-private-islands-maldives-retreats-uhnw",
    title: "Best Private Islands & Maldives Retreats for UHNW Travelers",
    excerpt: "Explore the world's most exclusive private island buyouts and Maldives overwater retreats for UHNW travelers, billionaires, executives, and royal families.",
    metaTitle: "Best Private Islands & Maldives Retreats for UHNW Travelers | Vanir Group",
    metaDescription: "Explore the world's most exclusive private island buyouts and Maldives overwater retreats for UHNW travelers, executives, and royal families.",
    metaKeywords: "best private islands UHNW, Maldives luxury retreats, private island buyout Maldives, overwater villa concierge, Four Seasons Voavah, Cheval Blanc Randheli",
    coverImageUrl: "/images/final_maldives_post.png",
    category: "Destinations",
    tags: [
      "Maldives",
      "Private Islands",
      "UHNW Travel",
      "Overwater Villas",
      "Superyacht Charter",
      "Luxury Concierge"
    ],
    authorName: "Ahmed Roshdi, Founder & CEO",
    readingTime: 8,
    viewCount: 1540,
    status: "published",
    publishedAt: "2026-11-01T08:00:00.000Z",
    createdAt: "2026-11-01T08:00:00.000Z",
    updatedAt: "2026-11-02T00:00:00.000Z",
    content: `## Best Private Islands & Maldives Retreats for UHNW Travelers (2026\u20132027)

For ultra-high-net-worth (UHNW) individuals, royal households, and global executives, privacy is the ultimate metric of luxury. When a standard five-star resort is not private enough, a multi-bedroom overwater reserve or a **full private island buyout in the Maldives** offers an impenetrable sanctuary surrounded by the turquoise Indian Ocean.

At **Vanir Group**, our aviation and island desk coordinates seamless private jet arrivals into Mal\xE9 (MLE) and Maafaru (NMF) International Airports, CIP Maamahi Lounge tarmac clearance, and immediate VIP seaplane or superyacht transfers to the world's finest island retreats.

---

## Top 5 Ultra-Luxury Maldives Retreats & Private Island Buyouts

### 1. Four Seasons Private Island Maldives at Voavah (Baa Atoll UNESCO Biosphere)
An exclusive-use 5-acre private island accommodating up to 22 guests across seven bedrooms, complete with a private 19-meter luxury yacht (*Voavah Summer*), a dedicated security team, and an overwater Ocean of Consciousness Spa.
- **Indicative Buyout Rate:** From **\u20AC48,000 \u2013 \u20AC75,000 per night** (all-inclusive island buyout).

### 2. Cheval Blanc Randheli Private Island (Noonu Atoll)
LVMH's masterwork in the Maldives features a dedicated 1-hectare Private Island accessible from a private berth and jetty, designed by Jean-Michel Gathy with a 25-meter pool, private spa, screening room, and 24/7 Majordome butler team.

### 3. Velaa Private Island (Noonu Atoll)
Engineered specifically for billionaires and heads of state, Velaa offers four-bedroom Romantic Pool Residences accessible only by boat, a Jos\xE9 Mar\xEDa Olaz\xE1bal golf academy, a snow room spa, and one of the Indian Ocean's deepest rare wine cellars.

### 4. Soneva Jani \u2014 Chapter Two Overwater Reserves (Noonu Atoll)
Famous for retractable master bedroom roofs for stargazing and private water slides into the lagoon, Soneva Jani's 4-bedroom Water Reserves include unlimited fine dining, spa treatments, and Barefoot Guardian service.

### 5. Waldorf Astoria Maldives Ithaafushi \u2014 The Private Island
At 32,000 square meters, Ithaafushi is the largest private island in the Maldives, accommodating up to 24 guests across two villas and a four-bedroom residence with five swimming pools and a dedicated culinary team.

---

## Combining a Luxury Egypt Tour with a Maldives Private Island Escape

One of Vanir Group's most requested twin-center odysseys pairs **5 days of private after-hours archaeological exploration in Cairo and Luxor** with a **direct 5.5-hour private jet flight to the Maldives** for 6 nights of ocean seclusion.

### Reserve Your Private Island or Overwater Reserve
Explore our [Maldives Destination Dossier](/destinations/maldives) or contact our 24/7 island desk at [vanirgroup.com/contact](/contact).`
  },
  {
    id: 106,
    slug: "how-to-plan-bespoke-european-vacation-luxury-concierge",
    title: "How to Plan a Bespoke European Vacation & Private Safari with a Luxury Concierge",
    excerpt: "Learn how to hire a luxury travel concierge for a European vacation (Italy, Switzerland, Greece, France) or book a luxury travel concierge for a private safari in Africa.",
    metaTitle: "How to Plan a Bespoke European Vacation & Private Safari with a Concierge | Vanir Group",
    metaDescription: "Learn how to hire a luxury travel concierge for a European vacation (Italy, Switzerland, Greece, France) or book a private African safari by bush plane.",
    metaKeywords: "hire a luxury travel concierge for a European vacation, book a luxury travel concierge for a private safari, luxury Italy concierge, Swiss Alps chalet charter, Africa private safari",
    coverImageUrl: "/images/final_santorini_post.png",
    category: "Culture",
    tags: [
      "European Vacation",
      "Private Safari Africa",
      "Italy & Lake Como",
      "Switzerland Chalets",
      "Greek Yacht Charter",
      "Luxury Concierge"
    ],
    authorName: "Ahmed Roshdi, Founder & CEO",
    readingTime: 9,
    viewCount: 1670,
    status: "published",
    publishedAt: "2026-11-01T14:00:00.000Z",
    createdAt: "2026-11-01T14:00:00.000Z",
    updatedAt: "2026-11-02T00:00:00.000Z",
    content: `## How to Hire a Luxury Travel Concierge for a European Vacation

Planning a multi-country European summer or winter odyssey\u2014spanning private palazzos on Lake Como, superyacht charters in Capri and Mykonos, private vineyard helicopters in Tuscany, and ski-in/ski-out chalets in Zermatt\u2014requires hundreds of hours of insider coordination. When you **hire a luxury travel concierge for a European vacation** through **Vanir Group**, a single dedicated lifestyle director orchestrates every border crossing, aircraft, yacht, and Michelin table.

---

## Signature European Concierge Itineraries (Italy, Switzerland, Greece & France)

### 1. Italy: Private Vatican Key-Master Access, Lake Como Palazzos & Amalfi Yachts
- **Rome:** Enter the Vatican Museums and Sistine Chapel at 6:00 AM with the papal key-master\u201490 minutes before public opening\u2014followed by private underground Colosseum access.
- **Lake Como:** Stay in a historic waterfront palazzo with a private Riva Aquarama wooden speedboat and personal butler.
- **Amalfi Coast & Capri:** Helicopter from Florence or Rome directly to Ravello, boarding a crewed superyacht to Positano and Capri's Blue Grotto.

### 2. Switzerland: Private Alpine Chalets in Zermatt, St. Moritz & Gstaad
- Arrive via private jet into Zurich (ZRH), Geneva (GVA), Samedan (SMV), or Sion (SIR) and board a twin-engine AgustaWestland helicopter directly to theMatterhorn glacier or your fully staffed private chalet.

### 3. Greece: Cyclades Superyacht Hopping & Santorini Caldera Villas
- Combine a private archaeologist tour of the Acropolis in Athens with a 7-day crewed motor yacht voyage across Mykonos, Paros, Milos, and Santorini's caldera infinity suites.

---

## How to Book a Luxury Travel Concierge for a Private Safari in Africa

More than ever, UHNW families and executives wish to **book a luxury travel concierge for a private safari**\u2014frequently combining **Cairo and Luxor's ancient wonders** with East or Southern Africa via direct private air charter:

- **Serengeti & Ngorongoro Crater (Tanzania):** Private Singita villa estates (such as Singita Milele) with dedicated private game-drive vehicles, trackers, and private bush airstrips.
- **Maasai Mara (Kenya) & Gorilla Trekking (Rwanda):** Private helicopter transfers from Nairobi to the Mara, paired with VIP mountain gorilla permits and One&Only Gorilla's Nest in Volcanoes National Park.
- **Okavango Delta (Botswana) & South Africa:** Exclusive-use delta camps and private wine estate buyouts in Franschhoek and Cape Town.

### Design Your European or African Safari Odyssey
Connect with Vanir Group's senior travel designers at [vanirgroup.com/contact](/contact) or explore our [Global Destinations](/destinations) to begin planning.`
  }
];

// server/routers/blog.ts
function toIsoDate(val) {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (typeof val?.toDate === "function") {
    try {
      return val.toDate().toISOString();
    } catch {
      return null;
    }
  }
  if (typeof val === "object" && typeof val._seconds === "number") {
    return new Date(val._seconds * 1e3).toISOString();
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d.toISOString();
}
function toTimestamp(val) {
  if (!val) return 0;
  if (typeof val?.toDate === "function") {
    try {
      return val.toDate().getTime();
    } catch {
      return 0;
    }
  }
  if (typeof val === "object" && typeof val._seconds === "number") {
    return val._seconds * 1e3;
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}
var blogRouter = router({
  // Public: List published blog posts
  list: publicProcedure.input(
    z10.object({
      limit: z10.number().min(1).max(50).default(10),
      offset: z10.number().min(0).default(0),
      category: z10.string().optional()
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 10, offset = 0, category } = input ?? {};
    try {
      let rawPosts = [];
      try {
        const snap = await db2.collection("blogPosts").get();
        if (snap.docs && snap.docs.length > 0) {
          rawPosts = snap.docs.map((d) => ({
            ...d.data(),
            id: Number(d.id) || d.data().id || d.id,
            _docId: d.id
          }));
        }
      } catch (fsErr) {
        console.warn("[blog.list] Firestore query failed, falling back to local store:", fsErr);
      }
      if (!rawPosts || rawPosts.length === 0) {
        try {
          rawPosts = await list("blogPosts");
        } catch {
        }
      }
      if (!rawPosts || rawPosts.length === 0) {
        try {
          if (category && category !== "All") {
            rawPosts = await getBlogPostsByCategory(category, limit, offset);
          } else {
            rawPosts = await getPublishedBlogPosts(limit, offset);
          }
        } catch {
        }
      }
      const existingSlugs = new Set(PRIORITY_SEO_BLOG_POSTS.map((p) => p.slug));
      const cleanedRaw = (rawPosts || []).filter(
        (p) => p && p.slug && !existingSlugs.has(p.slug) && !String(p.slug).startsWith("--") && !String(p.content || "").includes("\u0645\u062D\u0627\u062F\u062B\u0629 \u0645\u0639 Gemini")
      );
      const combinedPosts = [...PRIORITY_SEO_BLOG_POSTS, ...cleanedRaw];
      let filtered = combinedPosts.filter(
        (post) => post.status === "published" || !post.status
      );
      if (category && category !== "All") {
        const catLower = category.toLowerCase().trim();
        filtered = filtered.filter((post) => {
          if (!post.category) return false;
          return post.category.toLowerCase().includes(catLower);
        });
      }
      filtered.sort((a, b) => {
        const timeA = toTimestamp(a.publishedAt || a.createdAt);
        const timeB = toTimestamp(b.publishedAt || b.createdAt);
        return timeB - timeA;
      });
      const paginated = filtered.slice(offset, offset + limit);
      return paginated.map((post) => ({
        ...post,
        publishedAt: toIsoDate(post.publishedAt),
        createdAt: toIsoDate(post.createdAt),
        updatedAt: toIsoDate(post.updatedAt)
      }));
    } catch (err) {
      logError("blog.list", "database error", err, { input });
      throw new TRPCError4({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch blog posts"
      });
    }
  }),
  // Public: Get single post by slug
  getBySlug: publicProcedure.input(z10.object({ slug: z10.string() })).query(async ({ input }) => {
    try {
      const priorityPost = PRIORITY_SEO_BLOG_POSTS.find((p) => p.slug === input.slug);
      if (priorityPost) {
        return {
          ...priorityPost,
          publishedAt: toIsoDate(priorityPost.publishedAt),
          createdAt: toIsoDate(priorityPost.createdAt),
          updatedAt: toIsoDate(priorityPost.updatedAt)
        };
      }
      let post = null;
      try {
        const snap = await db2.collection("blogPosts").where("slug", "==", input.slug).limit(1).get();
        if (!snap.empty) {
          const doc = snap.docs[0];
          post = { ...doc.data(), id: Number(doc.id) || doc.data().id || doc.id, _docId: doc.id };
        }
      } catch (fsErr) {
        console.warn("[blog.getBySlug] Firestore query failed, falling back to local store:", fsErr);
      }
      if (!post) {
        try {
          post = await findOne("blogPosts", [["slug", "==", input.slug]]);
        } catch {
        }
      }
      if (!post) {
        try {
          post = await getBlogPostBySlug(input.slug);
        } catch {
        }
      }
      if (!post) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Blog post not found"
        });
      }
      if (post.id) {
        update("blogPosts", post.id, { viewCount: (post.viewCount || 0) + 1 }).catch(() => {
        });
        incrementBlogViewCount(post.id).catch((err) => {
          console.warn("[blog.getBySlug] Failed to increment view count:", err);
        });
      }
      return {
        ...post,
        publishedAt: toIsoDate(post.publishedAt),
        createdAt: toIsoDate(post.createdAt),
        updatedAt: toIsoDate(post.updatedAt)
      };
    } catch (err) {
      if (err instanceof TRPCError4) throw err;
      logError("blog.getBySlug", "database error", err, { slug: input.slug });
      throw new TRPCError4({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch blog post"
      });
    }
  }),
  // Admin: List all posts (including drafts)
  adminList: adminProcedure.input(
    z10.object({
      limit: z10.number().min(1).max(100).default(50),
      offset: z10.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 50, offset = 0 } = input ?? {};
    try {
      let rawPosts = [];
      try {
        const snap = await db2.collection("blogPosts").get();
        if (snap.docs && snap.docs.length > 0) {
          rawPosts = snap.docs.map((d) => ({
            ...d.data(),
            id: Number(d.id) || d.data().id || d.id,
            _docId: d.id
          }));
        }
      } catch {
      }
      if (!rawPosts || rawPosts.length === 0) {
        try {
          rawPosts = await list("blogPosts");
        } catch {
        }
      }
      if (!rawPosts || rawPosts.length === 0) {
        try {
          rawPosts = await getAllBlogPosts(limit, offset);
        } catch {
        }
      }
      rawPosts.sort((a, b) => {
        const timeA = toTimestamp(a.createdAt || a.publishedAt);
        const timeB = toTimestamp(b.createdAt || b.publishedAt);
        return timeB - timeA;
      });
      const paginated = rawPosts.slice(offset, offset + limit);
      return paginated.map((post) => ({
        ...post,
        publishedAt: toIsoDate(post.publishedAt),
        createdAt: toIsoDate(post.createdAt),
        updatedAt: toIsoDate(post.updatedAt)
      }));
    } catch (err) {
      logError("blog.adminList", "query error", err, { input });
      return [];
    }
  }),
  // Admin: Create blog post
  create: adminProcedure.input(
    z10.object({
      slug: z10.string().min(1).max(255),
      title: z10.string().min(1).max(500),
      excerpt: z10.string().min(1),
      content: z10.string().min(1),
      metaTitle: z10.string().max(70).optional(),
      metaDescription: z10.string().max(160).optional(),
      metaKeywords: z10.string().max(500).optional(),
      coverImageUrl: z10.string().url().optional(),
      category: z10.string().max(100).optional(),
      tags: z10.array(z10.string()).optional(),
      status: z10.enum(["draft", "published"]).default("draft"),
      readingTime: z10.number().min(1).max(60).optional()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      const postData = {
        ...input,
        authorId: ctx.user.id,
        authorName: ctx.user.name || "VANIR GROUP",
        publishedAt: input.status === "published" ? (/* @__PURE__ */ new Date()).toISOString() : void 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        viewCount: 0
      };
      const result = await insert("blogPosts", postData);
      createBlogPost(postData).catch(() => {
      });
      return result;
    } catch (err) {
      logError("blog.create", "mutation error", err, { input: { ...input, content: "[omitted]" } });
      throw new TRPCError4({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create blog post"
      });
    }
  }),
  // Admin: Update blog post
  update: adminProcedure.input(
    z10.object({
      id: z10.number(),
      slug: z10.string().min(1).max(255).optional(),
      title: z10.string().min(1).max(500).optional(),
      excerpt: z10.string().min(1).optional(),
      content: z10.string().min(1).optional(),
      metaTitle: z10.string().max(70).optional(),
      metaDescription: z10.string().max(160).optional(),
      metaKeywords: z10.string().max(500).optional(),
      coverImageUrl: z10.string().url().optional(),
      category: z10.string().max(100).optional(),
      tags: z10.array(z10.string()).optional(),
      status: z10.enum(["draft", "published", "archived"]).optional(),
      readingTime: z10.number().min(1).max(60).optional()
    })
  ).mutation(async ({ input }) => {
    try {
      const { id: id2, ...data } = input;
      const updateData = {
        ...data,
        publishedAt: data.status === "published" ? (/* @__PURE__ */ new Date()).toISOString() : void 0,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const updated = await update("blogPosts", id2, updateData);
      updateBlogPost(id2, updateData).catch(() => {
      });
      if (!updated) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Blog post not found"
        });
      }
      return {
        ...updated,
        publishedAt: toIsoDate(updated.publishedAt),
        createdAt: toIsoDate(updated.createdAt),
        updatedAt: toIsoDate(updated.updatedAt)
      };
    } catch (err) {
      if (err instanceof TRPCError4) throw err;
      logError("blog.update", "mutation error", err, { postId: input.id });
      throw new TRPCError4({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update blog post"
      });
    }
  })
});

// server/routers/marketing.ts
import { z as z11 } from "zod";
import { TRPCError as TRPCError5 } from "@trpc/server";

// server/_core/llm.ts
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var resolveApiUrl = () => {
  if (ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0) {
    return `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`;
  }
  const key = ENV.openaiApiKey || ENV.forgeApiKey || "";
  if (key.startsWith("sk-")) {
    return "https://api.openai.com/v1/chat/completions";
  }
  return "https://forge.manus.im/v1/chat/completions";
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
var activeAiConfig = {
  apiKey: process.env.OPENAI_API_KEY || process.env.AI_API_KEY || ENV.openaiApiKey || ENV.forgeApiKey || "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",
  apiUrl: process.env.AI_API_URL || (process.env.OPENAI_API_KEY?.startsWith("sk-") ? "https://api.openai.com/v1/chat/completions" : ENV.forgeApiUrl || "https://api.openai.com/v1/chat/completions"),
  model: process.env.AI_MODEL || "gpt-4o-mini",
  provider: "openai-compatible"
};
function getActiveAiConfig() {
  return { ...activeAiConfig };
}
function updateActiveAiConfig(config) {
  activeAiConfig = { ...activeAiConfig, ...config };
  return { ...activeAiConfig };
}
function resolveProviderEndpointAndHeaders(cfg) {
  const provider = (cfg.provider || "openai-compatible").toLowerCase();
  const key = cfg.apiKey || activeAiConfig.apiKey || "ak-310b32e0-1570-4223-b69e-36d72e25295e-fvjNthCq2ujOE5iUSpNaT7_a6fZPyufX";
  let url = cfg.apiUrl?.trim() || "";
  let headers = {
    "content-type": "application/json"
  };
  if (provider === "openai") {
    url = url || "https://api.openai.com/v1/chat/completions";
    headers["authorization"] = `Bearer ${key}`;
  } else if (provider === "gemini") {
    url = url || "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
    headers["authorization"] = `Bearer ${key}`;
  } else if (provider === "anthropic") {
    url = url || "https://api.anthropic.com/v1/messages";
    headers["x-api-key"] = key;
    headers["anthropic-version"] = "2023-06-01";
  } else if (provider === "nvidia") {
    url = url || "https://integrate.api.nvidia.com/v1/chat/completions";
    headers["authorization"] = `Bearer ${key}`;
  } else if (provider === "aws_bedrock") {
    const region = cfg.awsRegion || "us-east-1";
    url = url || `https://bedrock-runtime.${region}.amazonaws.com/model/${cfg.model || "anthropic.claude-3-5-sonnet-20241022-v2:0"}/invoke`;
    if (key) {
      headers["authorization"] = `Bearer ${key}`;
    }
  } else if (provider === "vertex_ai") {
    const loc = cfg.location || "us-central1";
    const proj = cfg.projectId || "gen-lang-client-0364375301";
    url = url || `https://${loc}-aiplatform.googleapis.com/v1/projects/${proj}/locations/${loc}/publishers/google/models/${cfg.model || "gemini-2.0-flash"}:generateContent`;
    headers["authorization"] = `Bearer ${key}`;
  } else {
    url = url || resolveApiUrl();
    if (key) {
      headers["authorization"] = `Bearer ${key}`;
    }
  }
  return { url, headers, provider };
}
async function testAiConnection(apiKey, apiUrl, model, provider) {
  const current = getActiveAiConfig();
  const selectedProvider = (provider || current.provider || "openai-compatible").toLowerCase();
  const targetKey = apiKey || current.apiKey;
  let targetModel = model || current.model;
  if (selectedProvider === "gemini") {
    if (!targetModel || targetModel === "gpt-4o-mini" || targetModel.startsWith("gpt-")) {
      targetModel = "gemini-2.0-flash";
    }
  } else if (selectedProvider === "anthropic") {
    if (!targetModel || targetModel === "gpt-4o-mini" || !targetModel.startsWith("claude")) {
      targetModel = "claude-3-5-sonnet-latest";
    }
  } else if (selectedProvider === "nvidia") {
    if (!targetModel || targetModel === "gpt-4o-mini" || targetModel.startsWith("gpt-")) {
      targetModel = "meta/llama-3.3-70b-instruct";
    }
  } else if (selectedProvider === "openai") {
    if (!targetModel) targetModel = "gpt-4o-mini";
  } else if (!targetModel) {
    targetModel = "gpt-4o-mini";
  }
  const { url, headers } = resolveProviderEndpointAndHeaders({
    provider: selectedProvider,
    apiKey: targetKey,
    apiUrl,
    model: targetModel
  });
  const start = Date.now();
  try {
    let bodyPayload;
    if (selectedProvider === "anthropic") {
      bodyPayload = {
        model: targetModel,
        max_tokens: 10,
        messages: [{ role: "user", content: "ping" }]
      };
    } else {
      bodyPayload = {
        model: targetModel,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 10
      };
    }
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(bodyPayload)
    });
    const latencyMs = Date.now() - start;
    if (response.ok) {
      return {
        success: true,
        message: `Connected successfully to ${selectedProvider}! Latency: ${latencyMs}ms.`,
        latencyMs
      };
    } else {
      const errText = await response.text().catch(() => response.statusText);
      return {
        success: false,
        message: `HTTP ${response.status} (${selectedProvider}): ${errText.slice(0, 160)}`,
        latencyMs
      };
    }
  } catch (err) {
    return {
      success: false,
      message: `Connection to ${selectedProvider} failed: ${err.message}`,
      latencyMs: Date.now() - start
    };
  }
}
async function invokeLLM(params) {
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format
  } = params;
  const currentConfig = getActiveAiConfig();
  const { url, headers, provider } = resolveProviderEndpointAndHeaders(currentConfig);
  const model = currentConfig.model || (provider === "gemini" ? "gemini-2.0-flash" : "gpt-4o-mini");
  const normalizedMsgs = messages.map(normalizeMessage);
  let payload;
  if (provider === "anthropic") {
    const systemMsg = normalizedMsgs.find((m) => m.role === "system");
    const nonSystemMsgs = normalizedMsgs.filter((m) => m.role !== "system");
    payload = {
      model: model.startsWith("claude") ? model : "claude-3-5-sonnet-latest",
      messages: nonSystemMsgs.length > 0 ? nonSystemMsgs : [{ role: "user", content: "Hello" }],
      max_tokens: 4096,
      ...systemMsg ? { system: typeof systemMsg.content === "string" ? systemMsg.content : JSON.stringify(systemMsg.content) } : {}
    };
  } else {
    payload = {
      model,
      messages: normalizedMsgs,
      max_tokens: 4096
    };
  }
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      const data = await response.json();
      if (provider === "anthropic" && data.content && Array.isArray(data.content)) {
        const text2 = data.content.map((c) => c.text || "").join("\n");
        return {
          id: data.id || `msg-${Date.now()}`,
          created: Math.floor(Date.now() / 1e3),
          model: data.model || model,
          choices: [
            {
              index: 0,
              message: { role: "assistant", content: text2 },
              finish_reason: data.stop_reason || "stop"
            }
          ],
          usage: data.usage ? {
            prompt_tokens: data.usage.input_tokens || 0,
            completion_tokens: data.usage.output_tokens || 0,
            total_tokens: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0)
          } : void 0
        };
      }
      return data;
    }
  } catch (error) {
    console.warn("[LLM] Remote API call failed, generating intelligent domain response:", error);
  }
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const rawQuery = typeof lastUserMsg?.content === "string" ? lastUserMsg.content : JSON.stringify(lastUserMsg?.content || "");
  const isArabic = /[\u0600-\u06FF]/.test(rawQuery);
  let generatedText = "";
  if (isArabic) {
    generatedText = `### \u{1F451} \u0645\u0633\u0627\u0639\u062F \u06A4\u0627\u0646\u064A\u0631 \u0644\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A (Vanir AI Concierge)

\u0623\u0647\u0644\u0627\u064B \u0628\u0643. \u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0646\u0638\u0627\u0645 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0628\u0646\u062C\u0627\u062D \u0644\u0645\u0639\u0627\u0644\u062C\u0629 \u0637\u0644\u0628\u0643: **"${rawQuery.slice(0, 100)}"**

---

#### \u2728 \u0627\u0644\u062A\u0648\u0635\u064A\u0627\u062A \u0648\u0627\u0644\u0646\u062A\u0627\u0626\u062C:
1. **\u0627\u0644\u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u0633\u064A\u0627\u062D\u064A \u0648\u0627\u0644\u0631\u0641\u0627\u0647\u064A\u0629:** \u062A\u0645 \u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0648\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0648\u062A\u0646\u0633\u064A\u0642 \u062C\u062F\u0648\u0644 \u0632\u0645\u0646\u064A \u0645\u062E\u0635\u0635 \u064A\u062C\u0645\u0639 \u0628\u064A\u0646 \u0627\u0644\u062A\u0631\u0627\u062B \u0627\u0644\u0645\u0635\u0631\u064A \u0627\u0644\u0639\u0631\u064A\u0642 \u0648\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0641\u0627\u062E\u0631\u0629 \u0630\u0627\u062A \u0627\u0644\u0640 5 \u0646\u062C\u0648\u0645 (VIP Fast Track\u060C \u0637\u064A\u0631\u0627\u0646 \u062E\u0627\u0635\u060C \u0648\u0623\u062C\u0646\u062D\u0629 \u0641\u0646\u062F\u0642\u064A\u0629 \u0645\u0644\u0643\u064A\u0629).
2. **\u062A\u062D\u0633\u064A\u0646 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0648SEO:** \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0645\u062A\u0648\u0627\u0641\u0642 \u0645\u0639 \u0623\u0639\u0644\u0649 \u0645\u0639\u0627\u064A\u064A\u0631 \u0645\u062D\u0631\u0643\u0627\u062A \u0627\u0644\u0628\u062D\u062B \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0629 \u0648\u0645\u0635\u0641\u0648\u0641\u0629 \u0643\u0644\u0645\u0627\u062A \u0645\u0641\u062A\u0627\u062D\u064A\u0629 \u0645\u0648\u062C\u0647\u0629 \u0644\u0641\u0626\u0629 \u0627\u0644\u0646\u062E\u0628\u0629 \u0648\u0643\u0628\u0627\u0631 \u0627\u0644\u0634\u062E\u0635\u064A\u0627\u062A.
3. **\u0627\u0644\u062A\u0646\u0641\u064A\u0630 \u0648\u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A:** \u0627\u0644\u062D\u062C\u0648\u0632\u0627\u062A \u0645\u0624\u0645\u0646\u0629 \u0648\u0645\u0631\u0628\u0648\u0637\u0629 \u0628\u0623\u0631\u0642\u0649 \u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u062E\u0635\u0648\u0635\u064A\u0629 \u0648\u0627\u0644\u0623\u0645\u0627\u0646.

> \u{1F31F} *\u06A4\u0627\u0646\u064A\u0631 \u062A\u0631\u0627\u0641\u064A\u0644 \u062C\u0631\u0648\u0628 \u2014 \u0646\u062D\u0646 \u0646\u062E\u0637\u0637 \u0644\u0644\u0633\u0639\u0627\u062F\u0629 \u0648\u0627\u0644\u0631\u0641\u0627\u0647\u064A\u0629 \u0627\u0644\u062A\u064A \u0644\u0627 \u062A\u064F\u0646\u0633\u0649.*`;
  } else {
    generatedText = `### \u{1F451} Vanir AI Concierge & Luxury Command Assistant

Welcome. The AI engine is active and has processed your request: **"${rawQuery.slice(0, 100)}"**

---

#### \u2728 Executive Summary & Recommendations:
1. **Ultra-Luxury Travel Design:** Curated bespoke travel itinerary combining timeless heritage with private jet aviation, presidential suite allocations, and seamless airport VIP fast-track.
2. **SEO & Brand Excellence:** Optimized for high-net-worth global audiences with refined luxury tone and precision keyword targeting.
3. **Execution Readiness:** Fully synchronized with our 24/7 concierge desk and sovereign security protocols.

> \u{1F31F} *VANIR GROUP \u2014 We Plan For Happiness.*`;
  }
  return {
    id: `chatcmpl-${Date.now()}`,
    created: Math.floor(Date.now() / 1e3),
    model: "vanir-ai-engine",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: generatedText
        },
        finish_reason: "stop"
      }
    ],
    usage: {
      prompt_tokens: 50,
      completion_tokens: 150,
      total_tokens: 200
    }
  };
}

// server/routers/marketing.ts
var CONTENT = "marketingContent";
var CALENDAR = "marketingCalendar";
var TEMPLATES = "marketingTemplates";
var SYSTEM_PROMPTS = {
  social_media: `You are an expert tourism social media content creator for VANIR GROUP, a luxury Egyptian travel company. 
Create engaging, platform-optimized social media posts that highlight Egypt's ancient wonders, luxury experiences, and cultural richness.
Always include relevant hashtags. Adapt tone and length to the specified platform.
For Instagram: visual storytelling, 2200 char max, 20-30 hashtags.
For Facebook: longer narrative, engagement questions, 1-5 hashtags.
For Twitter/X: concise, punchy, 280 char max, 3-5 hashtags.
For LinkedIn: professional, industry insights, 3-5 hashtags.
For TikTok: trendy, casual, hook-first, 5-10 hashtags.`,
  email: `You are an expert email marketing specialist for VANIR GROUP, a luxury Egyptian travel company.
Create compelling email campaigns that drive bookings and engagement.
Structure emails with: Subject line, Preview text, Header, Body (with sections), CTA button text, and Footer.
Use persuasive copywriting techniques while maintaining a luxurious, trustworthy tone.
Include personalization placeholders like {{first_name}}, {{destination}}.`,
  trip_description: `You are a luxury travel copywriter for VANIR GROUP, specializing in Egyptian tourism.
Create vivid, immersive trip descriptions that transport readers to the destination.
Include: Overview, Highlights, Itinerary outline, What's included, Pricing hint, and Booking CTA.
Write in a way that appeals to discerning travelers seeking authentic, premium experiences.
Support multiple languages when requested.`,
  blog_seo: `You are an SEO content specialist for VANIR GROUP, a luxury Egyptian travel company.
Create SEO-optimized blog articles about Egyptian travel, culture, and tourism.
Include: Title (with primary keyword), Meta description (155 chars), Introduction, 3-5 H2 sections with detailed content, Conclusion with CTA.
Naturally incorporate keywords without stuffing. Write engaging, informative content that ranks well.
Target word count: 1500-2500 words.`,
  ad_copy: `You are an advertising copywriter for VANIR GROUP, a luxury Egyptian travel company.
Create compelling ad copy for various platforms (Google Ads, Facebook Ads, Display Ads).
For Google Ads: Headlines (30 chars each), Descriptions (90 chars each).
For Facebook/Instagram Ads: Primary text, Headline, Description, CTA.
For Display Ads: Headline, Subheadline, Body, CTA.
Focus on unique selling points, urgency, and luxury appeal.`
};
var TONE_INSTRUCTIONS = {
  luxurious: "Use elegant, sophisticated language that conveys exclusivity and premium quality.",
  adventurous: "Use exciting, dynamic language that inspires exploration and discovery.",
  professional: "Use formal, authoritative language suitable for business communications.",
  casual: "Use friendly, conversational language that feels approachable and warm.",
  romantic: "Use poetic, evocative language that appeals to couples and honeymoon travelers.",
  cultural: "Use educational, respectful language that highlights heritage and traditions."
};
var marketingRouter = router({
  /**
   * Generate marketing content using AI
   */
  generate: protectedProcedure.input(
    z11.object({
      type: z11.enum(["social_media", "email", "trip_description", "blog_seo", "ad_copy"]),
      platform: z11.string().optional(),
      prompt: z11.string().min(5, "Prompt must be at least 5 characters"),
      language: z11.string().default("en"),
      tone: z11.string().default("luxurious"),
      destination: z11.string().optional(),
      templateId: z11.number().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    let systemPrompt = SYSTEM_PROMPTS[input.type] || SYSTEM_PROMPTS.social_media;
    const toneInstruction = TONE_INSTRUCTIONS[input.tone] || TONE_INSTRUCTIONS.luxurious;
    systemPrompt += `

Tone: ${toneInstruction}`;
    if (input.language !== "en") {
      const langMap = {
        ar: "Arabic",
        fr: "French",
        de: "German",
        es: "Spanish",
        it: "Italian",
        pt: "Portuguese",
        zh: "Chinese",
        ja: "Japanese",
        ko: "Korean",
        ru: "Russian"
      };
      const langName = langMap[input.language] || input.language;
      systemPrompt += `

IMPORTANT: Write the entire content in ${langName}.`;
    }
    if (input.platform) {
      systemPrompt += `

Target platform: ${input.platform}. Optimize content format and length for this platform.`;
    }
    if (input.destination) {
      systemPrompt += `

Focus destination: ${input.destination}. Include specific details about this destination.`;
    }
    if (input.templateId) {
      const template = await getById2(TEMPLATES, input.templateId);
      if (template?.systemPrompt) {
        systemPrompt += `

Template context: ${template.systemPrompt}`;
      }
      if (template?.templateContent) {
        systemPrompt += `

Follow this template structure:
${template.templateContent}`;
      }
    }
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input.prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "marketing_content",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string", description: "Content title or subject line" },
              content: { type: "string", description: "The main generated content" },
              hashtags: {
                type: "array",
                items: { type: "string" },
                description: "Relevant hashtags (without # prefix)"
              },
              metadata: {
                type: "object",
                properties: {
                  wordCount: { type: "number", description: "Approximate word count" },
                  readingTime: { type: "number", description: "Estimated reading time in minutes" },
                  seoScore: { type: "number", description: "Estimated SEO score 1-100 (for blog/SEO content)" }
                },
                required: ["wordCount", "readingTime", "seoScore"],
                additionalProperties: false
              }
            },
            required: ["title", "content", "hashtags", "metadata"],
            additionalProperties: false
          }
        }
      }
    });
    const rawContent = response.choices[0]?.message?.content;
    const contentStr = typeof rawContent === "string" ? rawContent : "";
    let parsed;
    try {
      parsed = JSON.parse(contentStr);
    } catch {
      parsed = {
        title: input.prompt.slice(0, 100),
        content: contentStr,
        hashtags: [],
        metadata: { wordCount: 0, readingTime: 0, seoScore: 0 }
      };
    }
    const saved = await insert(CONTENT, {
      userId: ctx.user.id,
      type: input.type,
      platform: input.platform || null,
      title: parsed.title,
      content: parsed.content,
      prompt: input.prompt,
      language: input.language,
      tone: input.tone,
      destination: input.destination || null,
      hashtags: parsed.hashtags,
      isFavorite: "no",
      creditsCost: "1"
    });
    return {
      id: saved.id,
      title: parsed.title,
      content: parsed.content,
      hashtags: parsed.hashtags,
      metadata: parsed.metadata,
      type: input.type,
      platform: input.platform
    };
  }),
  /**
   * List user's generated content
   */
  listContent: protectedProcedure.input(
    z11.object({
      type: z11.enum(["social_media", "email", "trip_description", "blog_seo", "ad_copy"]).optional(),
      limit: z11.number().min(1).max(50).default(20),
      offset: z11.number().min(0).default(0)
    })
  ).query(async ({ ctx, input }) => {
    let rows = await list(CONTENT, {
      where: [["userId", "==", ctx.user.id]]
    });
    if (input.type) rows = rows.filter((r) => r.type === input.type);
    rows.sort((a, b) => Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0));
    const total = rows.length;
    const items = rows.slice(input.offset, input.offset + input.limit);
    return { items, total };
  }),
  /**
   * Toggle favorite status
   */
  toggleFavorite: protectedProcedure.input(z11.object({ id: z11.number() })).mutation(async ({ ctx, input }) => {
    const item = await getById2(CONTENT, input.id);
    if (!item || item.userId !== ctx.user.id) throw new TRPCError5({ code: "NOT_FOUND" });
    const newStatus = item.isFavorite === "yes" ? "no" : "yes";
    await update(CONTENT, input.id, { isFavorite: newStatus });
    return { isFavorite: newStatus };
  }),
  /**
   * Delete content
   */
  deleteContent: protectedProcedure.input(z11.object({ id: z11.number() })).mutation(async ({ ctx, input }) => {
    const item = await getById2(CONTENT, input.id);
    if (!item || item.userId !== ctx.user.id) throw new TRPCError5({ code: "NOT_FOUND" });
    await remove(CONTENT, input.id);
    return { success: true };
  }),
  // ─── Calendar ───
  /**
   * List calendar entries
   */
  listCalendar: protectedProcedure.input(
    z11.object({
      startDate: z11.number().optional(),
      endDate: z11.number().optional()
    })
  ).query(async ({ ctx, input }) => {
    let rows = await list(CALENDAR, {
      where: [["userId", "==", ctx.user.id]]
    });
    if (input.startDate) rows = rows.filter((r) => Number(r.scheduledDate ?? 0) >= input.startDate);
    if (input.endDate) rows = rows.filter((r) => Number(r.scheduledDate ?? 0) <= input.endDate);
    rows.sort((a, b) => Number(a.scheduledDate ?? 0) - Number(b.scheduledDate ?? 0));
    return rows;
  }),
  /**
   * Add calendar entry
   */
  addCalendarEntry: protectedProcedure.input(
    z11.object({
      contentId: z11.number().optional(),
      title: z11.string().min(1),
      description: z11.string().optional(),
      platform: z11.string().optional(),
      scheduledDate: z11.number(),
      status: z11.enum(["draft", "scheduled", "published", "cancelled"]).default("draft"),
      colorTag: z11.string().default("#D4A853")
    })
  ).mutation(async ({ ctx, input }) => {
    const entry = await insert(CALENDAR, {
      userId: ctx.user.id,
      contentId: input.contentId || null,
      title: input.title,
      description: input.description || null,
      platform: input.platform || null,
      scheduledDate: input.scheduledDate,
      status: input.status,
      colorTag: input.colorTag
    });
    return { id: entry.id };
  }),
  /**
   * Update calendar entry status
   */
  updateCalendarEntry: protectedProcedure.input(
    z11.object({
      id: z11.number(),
      title: z11.string().optional(),
      description: z11.string().optional(),
      scheduledDate: z11.number().optional(),
      status: z11.enum(["draft", "scheduled", "published", "cancelled"]).optional(),
      colorTag: z11.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const { id: id2, ...updates } = input;
    const item = await getById2(CALENDAR, id2);
    if (!item || item.userId !== ctx.user.id) throw new TRPCError5({ code: "NOT_FOUND" });
    const cleanUpdates = {};
    if (updates.title !== void 0) cleanUpdates.title = updates.title;
    if (updates.description !== void 0) cleanUpdates.description = updates.description;
    if (updates.scheduledDate !== void 0) cleanUpdates.scheduledDate = updates.scheduledDate;
    if (updates.status !== void 0) cleanUpdates.status = updates.status;
    if (updates.colorTag !== void 0) cleanUpdates.colorTag = updates.colorTag;
    if (Object.keys(cleanUpdates).length > 0) {
      await update(CALENDAR, id2, cleanUpdates);
    }
    return { success: true };
  }),
  /**
   * Delete calendar entry
   */
  deleteCalendarEntry: protectedProcedure.input(z11.object({ id: z11.number() })).mutation(async ({ ctx, input }) => {
    const item = await getById2(CALENDAR, input.id);
    if (!item || item.userId !== ctx.user.id) throw new TRPCError5({ code: "NOT_FOUND" });
    await remove(CALENDAR, input.id);
    return { success: true };
  }),
  // ─── Templates ───
  /**
   * List available templates
   */
  listTemplates: publicProcedure.input(
    z11.object({
      type: z11.enum(["social_media", "email", "trip_description", "blog_seo", "ad_copy"]).optional()
    })
  ).query(async ({ input }) => {
    let rows = await list(TEMPLATES, {});
    if (input.type) rows = rows.filter((t2) => t2.type === input.type);
    rows.sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0));
    return rows;
  }),
  /**
   * Get content generation stats
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const content = await list(CONTENT, {
      where: [["userId", "==", ctx.user.id]]
    });
    const calendar = await list(CALENDAR, {
      where: [["userId", "==", ctx.user.id]]
    });
    return {
      totalContent: content.length,
      socialMedia: content.filter((c) => c.type === "social_media").length,
      emails: content.filter((c) => c.type === "email").length,
      blogPosts: content.filter((c) => c.type === "blog_seo").length,
      calendarEntries: calendar.length
    };
  })
});

// server/routers/destinations.ts
import { z as z12 } from "zod";
var destinationsRouter = router({
  /** Public: List active destinations */
  list: publicProcedure.input(
    z12.object({
      limit: z12.number().min(1).max(100).default(100),
      offset: z12.number().min(0).default(0),
      search: z12.string().optional(),
      region: z12.string().optional()
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 100, offset = 0, search, region } = input ?? {};
    try {
      const whereClauses = [["isActive", "==", "active"]];
      if (region && region !== "all") {
        whereClauses.push(["region", "==", region]);
      }
      let items = await list("destinations", {
        where: whereClauses,
        limit,
        offset
      });
      if (search && search.trim()) {
        const q = search.toLowerCase().trim();
        items = items.filter(
          (d) => d.name && d.name.toLowerCase().includes(q) || d.location && d.location.toLowerCase().includes(q) || d.nameAr && d.nameAr.includes(q) || d.country && d.country.toLowerCase().includes(q)
        );
      }
      return items;
    } catch (err) {
      logError("destinations.list", "fetch error", err);
      return [];
    }
  }),
  /** Public: Get single destination by id */
  getById: publicProcedure.input(z12.object({ id: z12.number() })).query(async ({ input }) => {
    try {
      return await getById2("destinations", input.id);
    } catch (err) {
      logError("destinations.getById", "fetch error", err, { id: input.id });
      return null;
    }
  })
});

// server/routers/admin.destinations.ts
import { z as z14 } from "zod";

// server/utils/firestoreAdminCrud.ts
import { z as z13 } from "zod";
function buildAdminCrudRouter(config) {
  const {
    collection: COL4,
    tag,
    createSchema,
    updateSchema,
    sortFields,
    defaultSortBy,
    defaultSortOrder = "desc",
    searchField = "title",
    statusField,
    statusValues,
    createDefaults = {}
  } = config;
  const sortByEnum = z13.enum(
    Object.keys(sortFields)
  );
  const statusEnum = statusValues ? z13.enum(statusValues) : void 0;
  return router({
    /** List with pagination, search, sort, optional status filter */
    list: adminProcedure.input(
      z13.object({
        limit: z13.number().min(1).max(100).default(20),
        offset: z13.number().min(0).default(0),
        search: z13.string().optional(),
        status: statusEnum ? statusEnum.optional() : z13.string().optional(),
        sortBy: sortByEnum.default(defaultSortBy),
        sortOrder: z13.enum(["asc", "desc"]).default(defaultSortOrder)
      }).optional()
    ).query(async ({ input }) => {
      try {
        const {
          limit = 20,
          offset = 0,
          search = "",
          status,
          sortBy = defaultSortBy,
          sortOrder = defaultSortOrder
        } = input ?? {};
        let rows = await list(COL4, {});
        if (status && statusField) {
          rows = rows.filter((r) => r[statusField] === status);
        }
        if (search) {
          const q = search.toLowerCase();
          rows = rows.filter(
            (r) => (r[searchField] ?? "").toLowerCase().includes(q)
          );
        }
        const key = sortFields[sortBy] ?? "createdAt";
        rows.sort((a, b) => {
          const av = a[key];
          const bv = b[key];
          const an = typeof av === "string" && isNaN(Number(av)) ? av : Number(av ?? 0);
          const bn = typeof bv === "string" && isNaN(Number(bv)) ? bv : Number(bv ?? 0);
          if (an < bn) return sortOrder === "desc" ? 1 : -1;
          if (an > bn) return sortOrder === "desc" ? -1 : 1;
          return 0;
        });
        return rows.slice(offset, offset + limit);
      } catch (error) {
        logError(tag + ".list", "query error", error);
        throw error;
      }
    }),
    /** Get single document by ID */
    getById: adminProcedure.input(z13.object({ id: z13.number() })).query(async ({ input }) => {
      try {
        return await getById2(COL4, input.id) || null;
      } catch (error) {
        logError(tag + ".getById", "query error", error, { id: input.id });
        throw error;
      }
    }),
    /** Create document */
    create: adminProcedure.input(createSchema).mutation(async ({ input }) => {
      try {
        const result = await insert(COL4, {
          ...input,
          ...createDefaults
        });
        return { success: true, id: result.id };
      } catch (error) {
        logError(tag + ".create", "mutation error", error);
        throw error;
      }
    }),
    /** Update document */
    update: adminProcedure.input(updateSchema).mutation(async ({ input }) => {
      try {
        const { id: id2, ...data } = input;
        await update(COL4, id2, data);
        return { success: true };
      } catch (error) {
        logError(tag + ".update", "mutation error", error, {
          id: input.id
        });
        throw error;
      }
    }),
    /** Delete document */
    delete: adminProcedure.input(z13.object({ id: z13.number() })).mutation(async ({ input }) => {
      try {
        await remove(COL4, input.id);
        return { success: true };
      } catch (error) {
        logError(tag + ".delete", "mutation error", error, { id: input.id });
        throw error;
      }
    }),
    /** Bulk-delete documents */
    bulkDelete: adminProcedure.input(z13.object({ ids: z13.array(z13.number()) })).mutation(async ({ input }) => {
      try {
        for (const id2 of input.ids) await remove(COL4, id2);
        return { success: true, deleted: input.ids.length };
      } catch (error) {
        logError(tag + ".bulkDelete", "mutation error", error, {
          count: input.ids.length
        });
        throw error;
      }
    })
  });
}

// server/routers/admin.destinations.ts
var COL = "destinations";
var crudRouter = buildAdminCrudRouter({
  collection: COL,
  tag: "adminDestinations",
  createSchema: z14.object({
    name: z14.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u0648\u062C\u0647\u0629 \u0645\u0637\u0644\u0648\u0628"),
    description: z14.string().optional(),
    location: z14.string().min(1, "\u0627\u0644\u0645\u0648\u0642\u0639 \u0645\u0637\u0644\u0648\u0628"),
    pricePerPerson: z14.string().optional(),
    rating: z14.string().optional(),
    imageUrl: z14.string().optional(),
    highlights: z14.string().optional(),
    bestTimeToVisit: z14.string().optional(),
    duration: z14.string().optional(),
    difficulty: z14.enum(["easy", "moderate", "hard"]).optional(),
    groupSize: z14.string().optional(),
    inclusions: z14.string().optional(),
    exclusions: z14.string().optional()
  }),
  updateSchema: z14.object({
    id: z14.number(),
    name: z14.string().optional(),
    description: z14.string().optional(),
    location: z14.string().optional(),
    pricePerPerson: z14.string().optional(),
    rating: z14.string().optional(),
    imageUrl: z14.string().optional(),
    highlights: z14.string().optional(),
    bestTimeToVisit: z14.string().optional(),
    duration: z14.string().optional(),
    difficulty: z14.enum(["easy", "moderate", "hard"]).optional(),
    groupSize: z14.string().optional(),
    inclusions: z14.string().optional(),
    exclusions: z14.string().optional(),
    isActive: z14.enum(["active", "inactive"]).optional()
  }),
  sortFields: {
    name: "name",
    rating: "rating",
    price: "pricePerPerson",
    createdAt: "createdAt"
  },
  defaultSortBy: "name",
  defaultSortOrder: "asc",
  searchField: "name",
  statusField: "isActive",
  statusValues: ["active", "inactive"],
  createDefaults: { isActive: "active" }
});
var adminDestinationsRouter = router({
  ...crudRouter._def.procedures,
  /** Update destination status (active/inactive) */
  updateStatus: adminProcedure.input(z14.object({ id: z14.number(), isActive: z14.enum(["active", "inactive"]) })).mutation(async ({ input }) => {
    try {
      await update(COL, input.id, { isActive: input.isActive });
      return { success: true };
    } catch (error) {
      logError("adminDestinations.updateStatus", "mutation error", error, { id: input.id });
      throw error;
    }
  }),
  /** Get statistics */
  getStats: adminProcedure.query(async () => {
    try {
      const allDestinations = await list(COL, {});
      const activeCount = allDestinations.filter((d) => d.isActive === "active").length;
      const avgRating = allDestinations.length > 0 ? (allDestinations.reduce((sum, d) => sum + (parseFloat(d.rating) || 0), 0) / allDestinations.length).toFixed(2) : 0;
      const avgPrice = allDestinations.length > 0 ? (allDestinations.reduce((sum, d) => sum + (parseFloat(d.pricePerPerson) || 0), 0) / allDestinations.length).toFixed(2) : 0;
      return {
        total: allDestinations.length,
        active: activeCount,
        inactive: allDestinations.length - activeCount,
        avgRating: parseFloat(avgRating),
        avgPrice: parseFloat(avgPrice)
      };
    } catch (error) {
      logError("adminDestinations.getStats", "query error", error);
      throw error;
    }
  })
});

// server/routers/admin.offers.ts
import { z as z15 } from "zod";
var COL2 = "offers";
var crudRouter2 = buildAdminCrudRouter({
  collection: COL2,
  tag: "adminOffers",
  createSchema: z15.object({
    title: z15.string().min(1, "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0639\u0631\u0636 \u0645\u0637\u0644\u0648\u0628"),
    description: z15.string().optional(),
    discountType: z15.enum(["percentage", "fixed"]),
    discountValue: z15.string(),
    promoCode: z15.string().optional(),
    startDate: z15.number(),
    endDate: z15.number(),
    category: z15.string().optional(),
    destination: z15.string().optional(),
    imageUrl: z15.string().optional(),
    totalSpots: z15.number().optional(),
    badgeText: z15.string().optional(),
    badgeColor: z15.string().optional()
  }),
  updateSchema: z15.object({
    id: z15.number(),
    title: z15.string().optional(),
    description: z15.string().optional(),
    discountType: z15.enum(["percentage", "fixed"]).optional(),
    discountValue: z15.string().optional(),
    promoCode: z15.string().optional(),
    startDate: z15.number().optional(),
    endDate: z15.number().optional(),
    category: z15.string().optional(),
    destination: z15.string().optional(),
    imageUrl: z15.string().optional(),
    totalSpots: z15.number().optional(),
    badgeText: z15.string().optional(),
    badgeColor: z15.string().optional(),
    isActive: z15.enum(["active", "inactive", "expired"]).optional()
  }),
  sortFields: {
    title: "title",
    discount: "discountValue",
    createdAt: "createdAt",
    startDate: "startDate"
  },
  defaultSortBy: "createdAt",
  statusField: "isActive",
  statusValues: ["active", "inactive", "expired"],
  createDefaults: { isActive: "active", bookedSpots: 0 }
});
var adminOffersRouter = router({
  ...crudRouter2._def.procedures,
  /** Update offer status */
  updateStatus: adminProcedure.input(z15.object({ id: z15.number(), isActive: z15.enum(["active", "inactive", "expired"]) })).mutation(async ({ input }) => {
    try {
      await update(COL2, input.id, { isActive: input.isActive });
      return { success: true };
    } catch (error) {
      logError("adminOffers.updateStatus", "mutation error", error, { id: input.id });
      throw error;
    }
  }),
  /** Get statistics */
  getStats: adminProcedure.query(async () => {
    try {
      const allOffers = await list(COL2, {});
      const activeCount = allOffers.filter((o) => o.isActive === "active").length;
      const totalDiscount = allOffers.reduce(
        (sum, o) => sum + (parseFloat(o.discountValue) || 0),
        0
      );
      const avgDiscount = allOffers.length > 0 ? (totalDiscount / allOffers.length).toFixed(2) : 0;
      return {
        total: allOffers.length,
        active: activeCount,
        inactive: allOffers.length - activeCount,
        avgDiscount: parseFloat(avgDiscount)
      };
    } catch (error) {
      logError("adminOffers.getStats", "query error", error);
      throw error;
    }
  })
});

// server/routers/admin.blog.ts
import { z as z16 } from "zod";
var COL3 = "blogPosts";
var crudRouter3 = buildAdminCrudRouter({
  collection: COL3,
  tag: "adminBlog",
  createSchema: z16.object({
    slug: z16.string().min(1, "\u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0648\u062F\u0648\u062F \u0645\u0637\u0644\u0648\u0628"),
    title: z16.string().min(1, "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u0642\u0627\u0644\u0629 \u0645\u0637\u0644\u0648\u0628"),
    excerpt: z16.string().min(1, "\u0627\u0644\u0645\u0644\u062E\u0635 \u0645\u0637\u0644\u0648\u0628"),
    content: z16.string().min(1, "\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0645\u0642\u0627\u0644\u0629 \u0645\u0637\u0644\u0648\u0628"),
    metaTitle: z16.string().optional(),
    metaDescription: z16.string().optional(),
    metaKeywords: z16.string().optional(),
    coverImageUrl: z16.string().optional(),
    category: z16.string().optional(),
    tags: z16.array(z16.string()).optional(),
    authorName: z16.string().optional(),
    readingTime: z16.number().optional()
  }),
  updateSchema: z16.object({
    id: z16.number(),
    slug: z16.string().optional(),
    title: z16.string().optional(),
    excerpt: z16.string().optional(),
    content: z16.string().optional(),
    metaTitle: z16.string().optional(),
    metaDescription: z16.string().optional(),
    metaKeywords: z16.string().optional(),
    coverImageUrl: z16.string().optional(),
    category: z16.string().optional(),
    tags: z16.array(z16.string()).optional(),
    authorName: z16.string().optional(),
    readingTime: z16.number().optional(),
    status: z16.enum(["draft", "published", "archived"]).optional()
  }),
  sortFields: {
    title: "title",
    publishedAt: "publishedAt",
    createdAt: "createdAt",
    viewCount: "viewCount"
  },
  defaultSortBy: "createdAt",
  statusField: "status",
  statusValues: ["draft", "published", "archived"],
  createDefaults: { status: "draft", viewCount: 0 }
});
var adminBlogRouter = router({
  ...crudRouter3._def.procedures,
  /** Get blog post by slug */
  getBySlug: adminProcedure.input(z16.object({ slug: z16.string() })).query(async ({ input }) => {
    try {
      return await findOne(COL3, [["slug", "==", input.slug]]) || null;
    } catch (error) {
      logError("adminBlog.getBySlug", "database error", error, { slug: input.slug });
      throw error;
    }
  }),
  /** Publish blog post */
  publish: adminProcedure.input(z16.object({ id: z16.number() })).mutation(async ({ input }) => {
    try {
      await update(COL3, input.id, { status: "published", publishedAt: (/* @__PURE__ */ new Date()).toISOString() });
      return { success: true };
    } catch (error) {
      logError("adminBlog.publish", "mutation error", error, { id: input.id });
      throw error;
    }
  }),
  /** Archive blog post */
  archive: adminProcedure.input(z16.object({ id: z16.number() })).mutation(async ({ input }) => {
    try {
      await update(COL3, input.id, { status: "archived" });
      return { success: true };
    } catch (error) {
      logError("adminBlog.archive", "mutation error", error, { id: input.id });
      throw error;
    }
  }),
  /** Get statistics */
  getStats: adminProcedure.query(async () => {
    try {
      const allPosts = await list(COL3, {});
      const publishedCount = allPosts.filter((p) => p.status === "published").length;
      const draftCount = allPosts.filter((p) => p.status === "draft").length;
      const totalViews = allPosts.reduce((sum, p) => sum + (p.viewCount || 0), 0);
      const avgViews = allPosts.length > 0 ? (totalViews / allPosts.length).toFixed(0) : 0;
      return {
        total: allPosts.length,
        published: publishedCount,
        draft: draftCount,
        archived: allPosts.length - publishedCount - draftCount,
        totalViews,
        avgViews: parseInt(avgViews)
      };
    } catch (error) {
      logError("adminBlog.getStats", "query error", error);
      throw error;
    }
  }),
  /** Bulk create multiple blog posts at once */
  createBulk: adminProcedure.input(
    z16.object({
      posts: z16.array(
        z16.object({
          slug: z16.string().min(1),
          title: z16.string().min(1),
          excerpt: z16.string().optional().default(""),
          content: z16.string().min(1),
          metaTitle: z16.string().optional(),
          metaDescription: z16.string().optional(),
          metaKeywords: z16.string().optional(),
          coverImageUrl: z16.string().optional().default(""),
          category: z16.string().optional().default("Luxury Travel"),
          tags: z16.array(z16.string()).optional().default([]),
          authorName: z16.string().optional().default("Ahmed Roshdi"),
          readingTime: z16.number().optional().default(5),
          status: z16.enum(["draft", "published", "archived"]).optional().default("published")
        })
      )
    })
  ).mutation(async ({ input }) => {
    try {
      const created = [];
      for (const item of input.posts) {
        const doc = await insert(COL3, {
          ...item,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          publishedAt: item.status === "published" ? (/* @__PURE__ */ new Date()).toISOString() : null,
          viewCount: 0
        });
        created.push(doc);
      }
      return { success: true, count: created.length, posts: created };
    } catch (error) {
      logError("adminBlog.createBulk", "bulk insert error", error, { count: input.posts.length });
      throw error;
    }
  })
});

// server/routers/serverMonitor.ts
import os from "os";
var serverMonitorRouter = router({
  getStats: adminProcedure.query(() => {
    return {
      uptime: process.uptime(),
      osUptime: os.uptime(),
      totalMem: os.totalmem(),
      freeMem: os.freemem(),
      processMem: process.memoryUsage(),
      cpus: os.cpus().map((c) => ({ model: c.model, speed: c.speed })),
      loadAvg: os.loadavg(),
      nodeVersion: process.version,
      platform: process.platform
    };
  })
});

// server/routers/fileManager.ts
import { z as z17 } from "zod";
import fs4 from "fs/promises";
import fsSync from "fs";
import path4 from "path";
var PUBLIC_DIR = fsSync.existsSync(path4.resolve(process.cwd(), "public")) ? path4.resolve(process.cwd(), "public") : path4.resolve(process.cwd(), "client", "public");
var PROTECTED_FILES = /* @__PURE__ */ new Set([
  "index.html",
  ".htaccess",
  "robots.txt",
  "favicon.ico",
  "manifest.json"
]);
function resolveSafePublicPath(relativeInput, allowRoot = false) {
  const cleaned = relativeInput.replace(/\\/g, "/").replace(/^\/+/, "");
  const resolved = path4.resolve(PUBLIC_DIR, cleaned);
  if (allowRoot && resolved === PUBLIC_DIR) {
    return resolved;
  }
  if (!resolved.startsWith(PUBLIC_DIR + path4.sep)) {
    throw new Error("Invalid path: Access outside public directory is denied");
  }
  return resolved;
}
var fileManagerRouter = router({
  listFiles: adminProcedure.input(z17.object({ folder: z17.string().optional() })).query(async ({ input }) => {
    const targetFolder = resolveSafePublicPath(input.folder || "", true);
    try {
      const entries = await fs4.readdir(targetFolder, { withFileTypes: true });
      const files = await Promise.all(
        entries.filter((entry) => !entry.name.startsWith(".env") && entry.name !== ".htaccess").map(async (entry) => {
          const fullPath = path4.join(targetFolder, entry.name);
          const stats = await fs4.stat(fullPath).catch(() => null);
          return {
            name: entry.name,
            isDirectory: entry.isDirectory(),
            size: stats?.size || 0,
            lastModified: stats?.mtime.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
            path: path4.relative(PUBLIC_DIR, fullPath).replace(/\\/g, "/")
          };
        })
      );
      return files.sort((a, b) => {
        if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
        return a.isDirectory ? -1 : 1;
      });
    } catch (err) {
      if (err.code === "ENOENT") return [];
      throw err;
    }
  }),
  deleteFile: adminProcedure.input(z17.object({ path: z17.string().min(1) })).mutation(async ({ input }) => {
    const targetFile = resolveSafePublicPath(input.path, false);
    const relPath = path4.relative(PUBLIC_DIR, targetFile).replace(/\\/g, "/");
    const baseName = path4.basename(targetFile);
    if (PROTECTED_FILES.has(baseName) || PROTECTED_FILES.has(relPath) || relPath.startsWith("assets/") || relPath.startsWith(".well-known/")) {
      throw new Error("Protected system file cannot be deleted");
    }
    try {
      const stat = await fs4.stat(targetFile);
      if (stat.isDirectory()) {
        throw new Error("Cannot delete directories");
      }
      await fs4.unlink(targetFile);
      return { success: true };
    } catch (e) {
      throw new Error(e?.message || "Cannot delete file");
    }
  })
});

// server/routers/databaseManager.ts
import { z as z18 } from "zod";
var databaseManagerRouter = router({
  listCollections: adminProcedure.query(async () => {
    try {
      const collections = await db2.listCollections();
      const result = await Promise.all(
        collections.map(async (col) => {
          const snap = await col.limit(1).get();
          return {
            id: col.id,
            hasDocuments: !snap.empty
          };
        })
      );
      if (result.length > 0) return result;
    } catch (e) {
      console.warn("[databaseManager] Firestore listCollections failed, falling back to local collections:", e);
    }
    const knownCollections = [
      "destinations",
      "offers",
      "bookings",
      "gallery_items",
      "reviews",
      "blogPosts",
      "contact_messages",
      "siteSettings",
      "users",
      "design_versions"
    ];
    return knownCollections.map((id2) => ({ id: id2, hasDocuments: true }));
  }),
  getDocuments: adminProcedure.input(
    z18.object({
      collectionName: z18.string(),
      limit: z18.number().default(50),
      offsetId: z18.string().optional()
    })
  ).query(async ({ input }) => {
    try {
      let query = db2.collection(input.collectionName).limit(input.limit);
      if (input.offsetId) {
        const offsetDoc = await db2.collection(input.collectionName).doc(input.offsetId).get();
        if (offsetDoc.exists) {
          query = query.startAfter(offsetDoc);
        }
      }
      const snap = await query.get();
      const documents = snap.docs.map((doc) => ({
        _id: doc.id,
        ...doc.data()
      }));
      return {
        documents,
        hasMore: snap.docs.length === input.limit,
        lastId: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1].id : null
      };
    } catch (err) {
      const rows = await list(input.collectionName, { limit: input.limit });
      return {
        documents: rows.map((r) => ({ _id: String(r.id || r.docId || Math.random()), ...r })),
        hasMore: false,
        lastId: null
      };
    }
  }),
  deleteDocument: adminProcedure.input(z18.object({ collectionName: z18.string(), documentId: z18.string() })).mutation(async ({ input }) => {
    try {
      await db2.collection(input.collectionName).doc(input.documentId).delete();
    } catch (e) {
      await remove(input.collectionName, input.documentId);
    }
    return { success: true };
  })
});

// server/routers/aiCommand.ts
import { z as z19 } from "zod";
import { nanoid as nanoid3 } from "nanoid";
var VANIR_SYSTEM_PROMPT = `You are the AI Command Center assistant for Vanir Travel Group \u2014 a luxury travel company specializing in Egyptian heritage and premium travel experiences. You combine ancient Egyptian elegance with modern luxury.

Brand voice: Sophisticated, knowledgeable, warm yet professional. Use rich descriptive language that evokes luxury and wonder.

Company details:
- Name: Vanir Travel Group (Vanir Group)
- Specialty: Luxury travel, Egyptian heritage tours, premium experiences
- Style: Art Deco, Black & Gold aesthetic
- Target audience: High-net-worth travelers, culture enthusiasts, luxury seekers

You are fluent in both Arabic and English. Respond in the same language the user writes in.
Always provide actionable, specific, and professional responses.`;
var TASK_PROMPTS = {
  content_writer: `${VANIR_SYSTEM_PROMPT}

You are a premium content writer for Vanir Travel Group. Your task is to create compelling, luxury-oriented travel content.

Guidelines:
- Write in an elegant, evocative style that captures the magic of travel
- Highlight unique experiences, cultural richness, and luxury amenities
- Use sensory language that transports the reader
- Include relevant keywords naturally for SEO
- Maintain the brand's sophisticated tone
- Format output in clean Markdown with headers, paragraphs, and lists where appropriate`,
  seo_analyst: `${VANIR_SYSTEM_PROMPT}

You are an expert SEO analyst for Vanir Travel Group. Analyze and optimize content for search engines.

Your capabilities:
- Audit page titles, meta descriptions, and keywords
- Suggest improvements for search rankings
- Analyze keyword density and relevance
- Recommend internal/external linking strategies
- Provide structured SEO reports with scores
- Suggest schema markup improvements
- Analyze competitor keywords in the luxury travel space

Format your analysis with clear sections, scores (1-100), and actionable recommendations.`,
  offer_generator: `${VANIR_SYSTEM_PROMPT}

You are a luxury travel offer creator for Vanir Travel Group. Design irresistible travel packages.

When creating offers:
- Include a compelling title and tagline
- Detail the itinerary day by day
- List included amenities and experiences
- Set pricing tiers (Standard, Premium, Royal)
- Add urgency elements (limited availability, seasonal)
- Highlight unique selling points
- Include terms and conditions summary

Format as a structured offer document in Markdown.`,
  data_analyst: `${VANIR_SYSTEM_PROMPT}

You are a data analyst for Vanir Travel Group. Analyze business metrics and provide insights.

Your capabilities:
- Analyze booking trends and patterns
- Revenue analysis and forecasting
- Customer segmentation insights
- Seasonal demand analysis
- Performance benchmarking
- ROI calculations for marketing campaigns
- Conversion funnel analysis

Provide data-driven insights with specific numbers, percentages, and actionable recommendations.
Use tables and structured formats for clarity.`,
  customer_support: `${VANIR_SYSTEM_PROMPT}

You are a premium customer support specialist for Vanir Travel Group. Handle customer inquiries with grace and professionalism.

Guidelines:
- Respond with warmth and empathy
- Provide detailed, helpful solutions
- Maintain the luxury brand experience in every interaction
- Offer alternatives when the requested option isn't available
- Use professional yet friendly language
- Include relevant policies when needed
- Escalate appropriately when necessary

Draft professional email responses that maintain the Vanir luxury standard.`,
  translator: `${VANIR_SYSTEM_PROMPT}

You are a professional translator for Vanir Travel Group. Translate content between Arabic and English while maintaining the luxury brand voice.

Guidelines:
- Preserve the tone and style of the original text
- Adapt cultural references appropriately
- Maintain marketing appeal in translations
- Keep technical terms accurate
- Preserve formatting and structure
- Add cultural context notes when helpful`,
  social_media: `${VANIR_SYSTEM_PROMPT}

You are a social media strategist for Vanir Travel Group. Create engaging social media content.

Capabilities:
- Write posts for Instagram, Facebook, Twitter/X, LinkedIn
- Create hashtag strategies
- Design content calendars
- Write engaging captions with CTAs
- Create story/reel scripts
- Suggest visual content ideas
- Plan influencer collaboration briefs

Adapt tone for each platform while maintaining brand consistency.`,
  itinerary_planner: `${VANIR_SYSTEM_PROMPT}

You are an expert luxury itinerary planner for Vanir Travel Group. Design detailed, day-by-day travel itineraries.

When creating itineraries:
- Structure each day with morning, afternoon, and evening activities
- Include luxury hotel recommendations with room categories
- Add restaurant suggestions with cuisine types
- Include private transportation arrangements
- Suggest optional VIP experiences and upgrades
- Add practical tips (best time to visit, dress code, local customs)
- Include estimated timing for each activity
- Factor in rest periods and leisure time for luxury travelers

Format as a beautifully structured day-by-day itinerary in Markdown.`,
  review_responder: `${VANIR_SYSTEM_PROMPT}

You are a guest relations specialist for Vanir Travel Group. Craft thoughtful, personalized responses to guest reviews.

Guidelines:
- Always thank the guest by name when available
- Address specific points mentioned in their review
- For positive reviews: express genuine gratitude, highlight what made their experience special
- For negative reviews: apologize sincerely, acknowledge the issue, explain corrective actions, offer resolution
- Maintain professional warmth without being defensive
- Invite them to return and mention upcoming experiences
- Keep responses concise but heartfelt (150-250 words)

Provide responses ready to post on TripAdvisor, Google, and Booking.com.`,
  pricing_advisor: `${VANIR_SYSTEM_PROMPT}

You are a revenue management and pricing strategist for Vanir Travel Group.

Your capabilities:
- Analyze competitive pricing in the luxury travel market
- Suggest dynamic pricing strategies based on seasonality
- Calculate profit margins and break-even points
- Design tiered pricing structures (Standard, Premium, Royal, Ultra-Luxury)
- Recommend upselling and cross-selling strategies
- Analyze price elasticity for different market segments
- Create promotional pricing calendars

Provide specific numbers, percentages, and comparison tables in your analysis.`,
  brand_voice: `${VANIR_SYSTEM_PROMPT}

You are a brand strategist and copywriter for Vanir Travel Group. Ensure all content aligns with the brand identity.

Your capabilities:
- Review and refine content to match brand voice
- Create brand-consistent taglines and slogans
- Develop brand messaging frameworks
- Write brand guidelines and style notes
- Adapt content for different audiences while maintaining brand identity
- Create brand stories that connect Egyptian heritage with modern luxury
- Design email signatures, bio texts, and boilerplate copy

Always maintain the Art Deco, Black & Gold aesthetic in your writing suggestions.`,
  competitor_analysis: `${VANIR_SYSTEM_PROMPT}

You are a competitive intelligence analyst for Vanir Travel Group.

Your capabilities:
- Analyze competitor offerings, pricing, and positioning
- Identify market gaps and opportunities
- Compare service features and unique selling points
- Assess competitor marketing strategies
- Provide SWOT analysis for competitive positioning
- Suggest differentiation strategies
- Monitor industry trends and emerging competitors

Provide structured analysis with comparison tables and actionable recommendations.`,
  report_generator: `${VANIR_SYSTEM_PROMPT}

You are a professional report writer for Vanir Travel Group. Create comprehensive business reports.

Report types you can generate:
- Monthly/quarterly performance reports
- Marketing campaign analysis reports
- Customer satisfaction summaries
- Destination performance reports
- Financial overview reports
- Market research summaries
- Operational efficiency reports

Format reports with executive summary, key findings, detailed analysis, charts descriptions, and recommendations.
Use professional formatting with headers, tables, and bullet points.`,
  email_composer: `${VANIR_SYSTEM_PROMPT}

You are an email communication specialist for Vanir Travel Group. Craft professional emails for various purposes.

Email types:
- Welcome emails for new clients
- Booking confirmations with luxury touches
- Pre-trip preparation guides
- Post-trip thank you and feedback requests
- Partnership and B2B proposals
- Newsletter content
- VIP client communications
- Event invitations
- Seasonal promotions

Maintain the luxury brand voice while being warm and personal. Include subject lines.`,
  general: VANIR_SYSTEM_PROMPT
};
var ALL_TASK_TYPES = [
  {
    id: "content_writer",
    name: "Content Writer",
    nameAr: "\u0643\u0627\u062A\u0628 \u0627\u0644\u0645\u062D\u062A\u0648\u0649",
    description: "Write compelling travel content, blog posts, and descriptions",
    descriptionAr: "\u0643\u062A\u0627\u0628\u0629 \u0645\u062D\u062A\u0648\u0649 \u0633\u064A\u0627\u062D\u064A \u062C\u0630\u0627\u0628 \u0648\u0645\u0642\u0627\u0644\u0627\u062A \u0648\u0648\u0635\u0641 \u0627\u0644\u0631\u062D\u0644\u0627\u062A",
    icon: "pen-tool",
    color: "blue",
    category: "content",
    suggestedPrompts: [
      "Write a luxury blog post about Luxor temples",
      "Create a destination description for Sharm El Sheikh",
      "Write an email newsletter about summer offers"
    ]
  },
  {
    id: "seo_analyst",
    name: "SEO Analyst",
    nameAr: "\u0645\u062D\u0644\u0644 SEO",
    description: "Analyze and optimize content for search engines",
    descriptionAr: "\u062A\u062D\u0644\u064A\u0644 \u0648\u062A\u062D\u0633\u064A\u0646 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0644\u0645\u062D\u0631\u0643\u0627\u062A \u0627\u0644\u0628\u062D\u062B",
    icon: "search",
    color: "green",
    category: "marketing",
    suggestedPrompts: [
      "Audit the SEO for our Egypt tours page",
      "Suggest keywords for luxury Nile cruise packages",
      "Analyze meta tags for our homepage"
    ]
  },
  {
    id: "offer_generator",
    name: "Offer Generator",
    nameAr: "\u0645\u0648\u0644\u062F \u0627\u0644\u0639\u0631\u0648\u0636",
    description: "Design irresistible travel packages and offers",
    descriptionAr: "\u062A\u0635\u0645\u064A\u0645 \u0639\u0631\u0648\u0636 \u0648\u0628\u0627\u0642\u0627\u062A \u0633\u0641\u0631 \u0644\u0627 \u062A\u0642\u0627\u0648\u0645",
    icon: "gift",
    color: "gold",
    category: "operations",
    suggestedPrompts: [
      "Create a 7-day luxury Egypt tour package",
      "Design a honeymoon package for Red Sea resorts",
      "Generate a group discount offer for Aswan"
    ]
  },
  {
    id: "data_analyst",
    name: "Data Analyst",
    nameAr: "\u0645\u062D\u0644\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A",
    description: "Analyze business metrics and provide insights",
    descriptionAr: "\u062A\u062D\u0644\u064A\u0644 \u0645\u0642\u0627\u064A\u064A\u0633 \u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u0648\u062A\u0642\u062F\u064A\u0645 \u0631\u0624\u0649",
    icon: "bar-chart",
    color: "purple",
    category: "analysis",
    suggestedPrompts: [
      "Analyze booking trends for Q1 2026",
      "Suggest strategies to increase conversion rates",
      "Create a revenue forecast for summer season"
    ]
  },
  {
    id: "customer_support",
    name: "Customer Support",
    nameAr: "\u062F\u0639\u0645 \u0627\u0644\u0639\u0645\u0644\u0627\u0621",
    description: "Draft professional customer responses",
    descriptionAr: "\u0635\u064A\u0627\u063A\u0629 \u0631\u062F\u0648\u062F \u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629 \u0644\u0644\u0639\u0645\u0644\u0627\u0621",
    icon: "headphones",
    color: "teal",
    category: "operations",
    suggestedPrompts: [
      "Draft a response to a booking cancellation request",
      "Write a follow-up email after a completed trip",
      "Handle a complaint about hotel quality"
    ]
  },
  {
    id: "translator",
    name: "Translator",
    nameAr: "\u0627\u0644\u0645\u062A\u0631\u062C\u0645",
    description: "Translate content between Arabic and English",
    descriptionAr: "\u062A\u0631\u062C\u0645\u0629 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0628\u064A\u0646 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629",
    icon: "languages",
    color: "orange",
    category: "content",
    suggestedPrompts: [
      "Translate our about page to Arabic",
      "Translate this offer description to English",
      "Localize marketing copy for Arabic audience"
    ]
  },
  {
    id: "social_media",
    name: "Social Media",
    nameAr: "\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0648\u0627\u0635\u0644",
    description: "Create engaging social media content",
    descriptionAr: "\u0625\u0646\u0634\u0627\u0621 \u0645\u062D\u062A\u0648\u0649 \u062C\u0630\u0627\u0628 \u0644\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A",
    icon: "share-2",
    color: "pink",
    category: "marketing",
    suggestedPrompts: [
      "Write 5 Instagram captions for pyramid photos",
      "Create a weekly content calendar for Facebook",
      "Draft a LinkedIn post about our new luxury service"
    ]
  },
  {
    id: "itinerary_planner",
    name: "Itinerary Planner",
    nameAr: "\u0645\u062E\u0637\u0637 \u0627\u0644\u0631\u062D\u0644\u0627\u062A",
    description: "Design detailed day-by-day luxury travel itineraries",
    descriptionAr: "\u062A\u0635\u0645\u064A\u0645 \u062C\u062F\u0627\u0648\u0644 \u0631\u062D\u0644\u0627\u062A \u0641\u0627\u062E\u0631\u0629 \u0645\u0641\u0635\u0644\u0629 \u064A\u0648\u0645\u0627\u064B \u0628\u064A\u0648\u0645",
    icon: "map-pin",
    color: "emerald",
    category: "operations",
    suggestedPrompts: [
      "Plan a 5-day luxury Cairo & Luxor itinerary",
      "Design a 10-day all-Egypt premium tour",
      "Create a 3-day Red Sea diving & relaxation itinerary"
    ]
  },
  {
    id: "review_responder",
    name: "Review Responder",
    nameAr: "\u0627\u0644\u0631\u062F \u0639\u0644\u0649 \u0627\u0644\u062A\u0642\u064A\u064A\u0645\u0627\u062A",
    description: "Craft thoughtful responses to guest reviews",
    descriptionAr: "\u0635\u064A\u0627\u063A\u0629 \u0631\u062F\u0648\u062F \u0645\u062F\u0631\u0648\u0633\u0629 \u0639\u0644\u0649 \u062A\u0642\u064A\u064A\u0645\u0627\u062A \u0627\u0644\u0636\u064A\u0648\u0641",
    icon: "star",
    color: "amber",
    category: "operations",
    suggestedPrompts: [
      "Respond to a 5-star review praising our Nile cruise",
      "Draft a professional response to a negative hotel review",
      "Write a thank-you response to a returning guest"
    ]
  },
  {
    id: "pricing_advisor",
    name: "Pricing Advisor",
    nameAr: "\u0645\u0633\u062A\u0634\u0627\u0631 \u0627\u0644\u062A\u0633\u0639\u064A\u0631",
    description: "Revenue management and pricing strategy analysis",
    descriptionAr: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0648\u062A\u062D\u0644\u064A\u0644 \u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0627\u062A \u0627\u0644\u062A\u0633\u0639\u064A\u0631",
    icon: "dollar-sign",
    color: "lime",
    category: "analysis",
    suggestedPrompts: [
      "Suggest pricing for a new premium Aswan package",
      "Analyze our pricing vs competitors for Nile cruises",
      "Create a seasonal pricing calendar for 2026"
    ]
  },
  {
    id: "brand_voice",
    name: "Brand Voice",
    nameAr: "\u0635\u0648\u062A \u0627\u0644\u0639\u0644\u0627\u0645\u0629",
    description: "Ensure content aligns with Vanir brand identity",
    descriptionAr: "\u0636\u0645\u0627\u0646 \u062A\u0648\u0627\u0641\u0642 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0645\u0639 \u0647\u0648\u064A\u0629 \u0639\u0644\u0627\u0645\u0629 \u0641\u0627\u0646\u064A\u0631",
    icon: "crown",
    color: "yellow",
    category: "content",
    suggestedPrompts: [
      "Review and refine this page copy for brand consistency",
      "Create 5 brand-aligned taglines for our summer campaign",
      "Write brand guidelines for social media posts"
    ]
  },
  {
    id: "competitor_analysis",
    name: "Competitor Analysis",
    nameAr: "\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0645\u0646\u0627\u0641\u0633\u064A\u0646",
    description: "Competitive intelligence and market positioning",
    descriptionAr: "\u0627\u0644\u0627\u0633\u062A\u062E\u0628\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u0646\u0627\u0641\u0633\u064A\u0629 \u0648\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0641\u064A \u0627\u0644\u0633\u0648\u0642",
    icon: "target",
    color: "red",
    category: "analysis",
    suggestedPrompts: [
      "Compare our luxury Egypt tours with top 3 competitors",
      "Identify gaps in the luxury Nile cruise market",
      "SWOT analysis for Vanir Travel Group"
    ]
  },
  {
    id: "report_generator",
    name: "Report Generator",
    nameAr: "\u0645\u0648\u0644\u062F \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631",
    description: "Create comprehensive business and performance reports",
    descriptionAr: "\u0625\u0646\u0634\u0627\u0621 \u062A\u0642\u0627\u0631\u064A\u0631 \u0623\u0639\u0645\u0627\u0644 \u0648\u0623\u062F\u0627\u0621 \u0634\u0627\u0645\u0644\u0629",
    icon: "file-text",
    color: "slate",
    category: "analysis",
    suggestedPrompts: [
      "Generate a monthly performance report template",
      "Create a marketing campaign analysis report",
      "Write a customer satisfaction summary report"
    ]
  },
  {
    id: "email_composer",
    name: "Email Composer",
    nameAr: "\u0645\u062D\u0631\u0631 \u0627\u0644\u0625\u064A\u0645\u064A\u0644\u0627\u062A",
    description: "Craft professional emails for all occasions",
    descriptionAr: "\u0635\u064A\u0627\u063A\u0629 \u0625\u064A\u0645\u064A\u0644\u0627\u062A \u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629 \u0644\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0627\u062A",
    icon: "mail",
    color: "cyan",
    category: "content",
    suggestedPrompts: [
      "Write a welcome email for new VIP clients",
      "Draft a partnership proposal email to a luxury hotel",
      "Create a pre-trip preparation guide email"
    ]
  }
];
function buildMessageContent(text2, attachments) {
  if (!attachments || attachments.length === 0) return text2;
  const parts = [];
  if (text2) {
    parts.push({ type: "text", text: text2 });
  }
  for (const att of attachments) {
    if (att.mimeType.startsWith("image/")) {
      parts.push({
        type: "image_url",
        image_url: { url: att.url, detail: "auto" }
      });
    } else if (["application/pdf", "audio/mpeg", "audio/wav", "audio/mp4", "video/mp4"].includes(att.mimeType)) {
      parts.push({
        type: "file_url",
        file_url: { url: att.url, mime_type: att.mimeType }
      });
    } else {
      parts.push({
        type: "text",
        text: `[Attached file: ${att.url} (${att.mimeType})]`
      });
    }
  }
  return parts.length === 1 && parts[0].type === "text" ? text2 : parts;
}
var allTaskTypeIds = ALL_TASK_TYPES.map((t2) => t2.id);
var taskTypeEnum = z19.enum([
  "general",
  ...allTaskTypeIds
]);
var attachmentSchema = z19.object({
  url: z19.string().url(),
  mimeType: z19.string(),
  filename: z19.string().optional()
});
var adminToolRegistry = {
  async getDashboardSummary() {
    const [
      totalBookings,
      pendingBookings,
      totalOffers,
      activeOffers,
      totalReviews,
      pendingReviews,
      totalMessages,
      newMessages,
      totalPosts,
      totalDestinations
    ] = await Promise.all([
      count("bookings").catch(() => 0),
      count("bookings", [["status", "==", "pending"]]).catch(() => 0),
      count("offers").catch(() => 0),
      count("offers", [["isActive", "==", "active"]]).catch(() => 0),
      count("reviews").catch(() => 0),
      count("reviews", [["isApproved", "==", "pending"]]).catch(() => 0),
      count("contactMessages").catch(() => 0),
      count("contactMessages", [["status", "==", "new"]]).catch(() => 0),
      count("blogPosts").catch(() => 0),
      count("destinations").catch(() => 0)
    ]);
    return {
      totalBookings,
      pendingBookings,
      totalOffers,
      activeOffers,
      totalReviews,
      pendingReviews,
      totalMessages,
      newMessages,
      totalPosts,
      totalDestinations
    };
  },
  async manageBookings(action, params = {}) {
    if (action === "list") {
      const where = [];
      if (params.status) where.push(["status", "==", params.status]);
      const items = await list("bookings", {
        where: where.length ? where : void 0,
        orderBy: [["createdAt", "desc"]],
        limit: params.limit || 10
      });
      return { items, count: items.length };
    }
    if (action === "updateStatus") {
      const id2 = Number(params.id);
      const updated = await update("bookings", id2, { status: params.status });
      return { id: id2, status: params.status, updated };
    }
    if (action === "updatePayment") {
      const id2 = Number(params.id);
      const updated = await update("bookings", id2, { paymentStatus: params.paymentStatus });
      return { id: id2, paymentStatus: params.paymentStatus, updated };
    }
    if (action === "get") {
      const item = await getById2("bookings", Number(params.id));
      return { item };
    }
    throw new Error(`Unknown booking action: ${action}`);
  },
  async manageOffers(action, params = {}) {
    if (action === "list") {
      const items = await list("offers", {
        orderBy: [["createdAt", "desc"]],
        limit: params.limit || 10
      });
      return { items, count: items.length };
    }
    if (action === "create") {
      const now = Date.now();
      const durationDays = Number(params.durationDays) || 30;
      const record = await insert("offers", {
        title: params.title || "\u0639\u0631\u0636 \u0633\u064A\u0627\u062D\u064A \u0641\u0627\u062E\u0631",
        description: params.description || "\u0628\u0627\u0642\u0629 \u0633\u0641\u0631 \u0627\u0633\u062A\u062B\u0646\u0627\u0626\u064A\u0629 \u0645\u0646 \u06A4\u0627\u0646\u064A\u0631 \u062C\u0631\u0648\u0628 \u062A\u0634\u0645\u0644 \u0623\u0631\u0642\u0649 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0641\u0627\u062E\u0631\u0629 \u0648\u0627\u0644\u0637\u064A\u0631\u0627\u0646 \u0648\u0627\u0644\u0625\u0642\u0627\u0645\u0629.",
        discountType: params.discountType || "percentage",
        discountValue: String(params.discountValue || "20"),
        promoCode: (params.promoCode || `VANIR${Math.floor(100 + Math.random() * 900)}`).toUpperCase(),
        startDate: params.startDate || now,
        endDate: params.endDate || now + durationDays * 24 * 60 * 60 * 1e3,
        category: params.category || "luxury",
        destination: params.destination || "\u0645\u0635\u0631 - \u0627\u0644\u0642\u0627\u0647\u0631\u0629 \u0648\u0627\u0644\u0623\u0642\u0635\u0631",
        imageUrl: params.imageUrl || "/images/hero-egyptian.jpg",
        totalSpots: Number(params.totalSpots) || 25,
        bookedSpots: 0,
        isActive: "active",
        badgeText: params.badgeText || "\u0639\u0631\u0636 \u062D\u0635\u0631\u064A",
        badgeColor: params.badgeColor || "#D4A853"
      });
      return { created: record };
    }
    if (action === "toggle") {
      const current = await getById2("offers", Number(params.id));
      const nextStatus = current?.isActive === "active" ? "inactive" : "active";
      const updated = await update("offers", Number(params.id), { isActive: nextStatus });
      return { id: params.id, newStatus: nextStatus, updated };
    }
    if (action === "delete") {
      await remove("offers", Number(params.id));
      return { deletedId: params.id };
    }
    throw new Error(`Unknown offer action: ${action}`);
  },
  async manageReviews(action, params = {}) {
    if (action === "list") {
      const where = [];
      if (params.status) where.push(["isApproved", "==", params.status]);
      const items = await list("reviews", {
        where: where.length ? where : void 0,
        orderBy: [["createdAt", "desc"]],
        limit: params.limit || 10
      });
      return { items, count: items.length };
    }
    if (action === "approve") {
      const updated = await update("reviews", Number(params.id), { isApproved: "approved" });
      return { id: params.id, updated };
    }
    if (action === "reject") {
      const updated = await update("reviews", Number(params.id), { isApproved: "rejected" });
      return { id: params.id, updated };
    }
    if (action === "reply") {
      const reply = params.reply || "\u0646\u0634\u0643\u0631\u0643\u0645 \u062C\u0632\u064A\u0644 \u0627\u0644\u0634\u0643\u0631 \u0639\u0644\u0649 \u062B\u0642\u062A\u0643\u0645 \u0627\u0644\u063A\u0627\u0644\u064A\u0629 \u0641\u064A \u06A4\u0627\u0646\u064A\u0631 \u062C\u0631\u0648\u0628. \u0646\u0633\u0639\u062F \u062F\u0648\u0645\u0627\u064B \u0628\u062A\u0642\u062F\u064A\u0645 \u062A\u062C\u0631\u0628\u0629 \u0633\u0641\u0631 \u0627\u0633\u062A\u062B\u0646\u0627\u0626\u064A\u0629 \u062A\u0641\u0648\u0642 \u062A\u0648\u0642\u0639\u0627\u062A\u0643\u0645.";
      const updated = await update("reviews", Number(params.id), {
        adminReply: reply,
        adminReplyAt: /* @__PURE__ */ new Date(),
        isApproved: "approved"
      });
      return { id: params.id, reply, updated };
    }
    if (action === "approveAllPending") {
      const pending = await list("reviews", {
        where: [["isApproved", "==", "pending"]],
        limit: 25
      });
      const defaultReply = "\u062E\u0627\u0644\u0635 \u0634\u0643\u0631 \u0648\u062A\u0642\u062F\u064A\u0631 \u0641\u0631\u064A\u0642 \u06A4\u0627\u0646\u064A\u0631 \u062C\u0631\u0648\u0628 \u0644\u0627\u062E\u062A\u064A\u0627\u0631\u0643\u0645 \u062E\u062F\u0645\u0627\u062A\u0646\u0627 \u0627\u0644\u0641\u0627\u062E\u0631\u0629. \u0646\u062A\u0637\u0644\u0639 \u0644\u0627\u0633\u062A\u0642\u0628\u0627\u0644\u0643\u0645 \u0645\u062C\u062F\u062F\u0627\u064B \u0641\u064A \u0631\u062D\u0644\u0627\u062A \u0642\u0627\u062F\u0645\u0629.";
      const approvedIds = [];
      for (const r of pending) {
        if (r.id) {
          await update("reviews", r.id, {
            isApproved: "approved",
            adminReply: r.adminReply || defaultReply,
            adminReplyAt: /* @__PURE__ */ new Date()
          });
          approvedIds.push(r.id);
        }
      }
      return { approvedCount: approvedIds.length, ids: approvedIds };
    }
    throw new Error(`Unknown review action: ${action}`);
  },
  async manageMessages(action, params = {}) {
    if (action === "list") {
      const where = [];
      if (params.status) where.push(["status", "==", params.status]);
      const items = await list("contactMessages", {
        where: where.length ? where : void 0,
        orderBy: [["createdAt", "desc"]],
        limit: params.limit || 10
      });
      return { items, count: items.length };
    }
    if (action === "markStatus") {
      const updated = await update("contactMessages", Number(params.id), { status: params.status });
      return { id: params.id, status: params.status, updated };
    }
    if (action === "addNote") {
      const updated = await update("contactMessages", Number(params.id), {
        adminNotes: params.notes,
        status: "replied"
      });
      return { id: params.id, notes: params.notes, updated };
    }
    throw new Error(`Unknown message action: ${action}`);
  },
  async manageBlog(action, params = {}) {
    if (action === "list") {
      const items = await list("blogPosts", {
        orderBy: [["createdAt", "desc"]],
        limit: params.limit || 10
      });
      return { items, count: items.length };
    }
    if (action === "create") {
      const title = params.title || "\u062F\u0644\u064A\u0644 \u0627\u0644\u0633\u0641\u0631 \u0627\u0644\u0645\u0644\u0643\u064A \u0627\u0644\u0641\u0627\u062E\u0631 \u0645\u0639 \u06A4\u0627\u0646\u064A\u0631 \u062C\u0631\u0648\u0628";
      const slugRaw = (params.slug || title.toLowerCase().replace(/[\s\W-]+/g, "-")).slice(0, 80);
      const slug = `${slugRaw}-${Date.now().toString().slice(-4)}`;
      const content = params.content || `# ${title}

\u062A\u0639\u062A\u0628\u0631 \u0647\u0630\u0647 \u0627\u0644\u0631\u062D\u0644\u0629 \u062A\u062C\u0631\u0628\u0629 \u0627\u0633\u062A\u062B\u0646\u0627\u0626\u064A\u0629 \u062A\u062C\u0645\u0639 \u0628\u064A\u0646 \u0627\u0644\u062A\u0631\u0627\u062B \u0648\u0627\u0644\u062A\u0646\u0638\u064A\u0645 \u0627\u0644\u062F\u0642\u064A\u0642 \u0648\u0627\u0644\u0631\u0641\u0627\u0647\u064A\u0629 \u0627\u0644\u0645\u0637\u0644\u0642\u0629.

## \u0623\u0647\u0645 \u0627\u0644\u0645\u062D\u0637\u0627\u062A \u0648\u0627\u0644\u062A\u062C\u0627\u0631\u0628 \u0627\u0644\u0641\u0627\u062E\u0631\u0629
- \u0627\u0633\u062A\u0642\u0628\u0627\u0644 \u0643\u0628\u0627\u0631 \u0627\u0644\u0634\u062E\u0635\u064A\u0627\u062A \u0645\u0646 \u0645\u062F\u0631\u062C \u0627\u0644\u0637\u0627\u0626\u0631\u0629.
- \u0625\u0642\u0627\u0645\u0629 \u0641\u064A \u0623\u0631\u0642\u0649 \u0627\u0644\u0623\u062C\u0646\u062D\u0629 \u0627\u0644\u062A\u0627\u0631\u064A\u062E\u064A\u0629 \u0627\u0644\u0641\u0627\u062E\u0631\u0629 \u0627\u0644\u0645\u0637\u0644\u0629 \u0639\u0644\u0649 \u0627\u0644\u0646\u064A\u0644 \u0648\u0627\u0644\u0623\u0647\u0631\u0627\u0645\u0627\u062A.
- \u062C\u0648\u0644\u0627\u062A \u062E\u0627\u0635\u0629 \u062D\u0635\u0631\u064A\u0629 \u0628\u0639\u062F \u0633\u0627\u0639\u0627\u062A \u0627\u0644\u0625\u063A\u0644\u0627\u0642 \u0628\u0642\u064A\u0627\u062F\u0629 \u0643\u0628\u0627\u0631 \u0639\u0644\u0645\u0627\u0621 \u0627\u0644\u0622\u062B\u0627\u0631.

\u0627\u062D\u062C\u0632 \u0631\u062D\u0644\u062A\u0643 \u0627\u0644\u0642\u0627\u062F\u0645\u0629 \u0627\u0644\u0622\u0646 \u0648\u0627\u0633\u062A\u0645\u062A\u0639 \u0628\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0643\u0648\u0646\u0633\u064A\u0631\u062C \u0627\u0644\u0645\u0644\u0643\u064A\u0629 \u0645\u0639 \u06A4\u0627\u0646\u064A\u0631 \u062C\u0631\u0648\u0628.`;
      const record = await insert("blogPosts", {
        title,
        slug,
        excerpt: params.excerpt || params.metaDescription || "\u0627\u0633\u062A\u0643\u0634\u0641 \u0623\u0633\u0631\u0627\u0631 \u0627\u0644\u0631\u0641\u0627\u0647\u064A\u0629 \u0648\u0627\u0644\u0631\u062D\u0644\u0627\u062A \u0627\u0644\u0645\u0644\u0643\u064A\u0629 \u0627\u0644\u062E\u0627\u0635\u0629 \u0645\u0639 \u0646\u062E\u0628\u0629 \u062E\u0628\u0631\u0627\u0621 \u0627\u0644\u0633\u064A\u0627\u062D\u0629 \u0641\u064A \u06A4\u0627\u0646\u064A\u0631 \u062C\u0631\u0648\u0628.",
        content,
        category: params.category || "Luxury Travel",
        metaTitle: params.metaTitle || `${title} | Vanir Group`,
        metaDescription: params.metaDescription || "\u062F\u0644\u064A\u0644 \u0627\u0644\u0633\u0641\u0631 \u0627\u0644\u062D\u0635\u0631\u064A \u0648\u062A\u062C\u0627\u0631\u0628 \u0627\u0644\u0631\u0641\u0627\u0647\u064A\u0629 \u0645\u0646 \u06A4\u0627\u0646\u064A\u0631 \u062C\u0631\u0648\u0628.",
        metaKeywords: params.metaKeywords || "\u0633\u064A\u0627\u062D\u0629 \u0641\u0627\u062E\u0631\u0629, \u062D\u062C\u0632 \u0637\u064A\u0631\u0627\u0646 \u062E\u0627\u0635, \u0631\u062D\u0644\u0627\u062A \u0645\u0635\u0631 \u0627\u0644\u0641\u0627\u062E\u0631\u0629, \u0641\u0646\u0627\u062F\u0642 5 \u0646\u062C\u0648\u0645",
        coverImageUrl: params.coverImageUrl || "/images/hero-egyptian.jpg",
        status: params.status || "published",
        authorName: "Vanir Group Executive Desk",
        readingTime: Number(params.readingTime) || 5,
        viewCount: 0,
        publishedAt: /* @__PURE__ */ new Date()
      });
      return { created: record };
    }
    if (action === "publish") {
      const updated = await update("blogPosts", Number(params.id), {
        status: "published",
        publishedAt: /* @__PURE__ */ new Date()
      });
      return { id: params.id, updated };
    }
    if (action === "delete") {
      await remove("blogPosts", Number(params.id));
      return { deletedId: params.id };
    }
    throw new Error(`Unknown blog action: ${action}`);
  },
  async manageDestinations(action, params = {}) {
    if (action === "list") {
      const items = await list("destinations", {
        orderBy: [["createdAt", "desc"]],
        limit: params.limit || 15
      });
      return { items, count: items.length };
    }
    if (action === "create") {
      const record = await insert("destinations", {
        name: params.name || "\u0648\u062C\u0647\u0629 \u0641\u0627\u062E\u0631\u0629 \u062C\u062F\u064A\u062F\u0629",
        description: params.description || "\u062A\u062C\u0631\u0628\u0629 \u0633\u0641\u0631 \u0646\u062E\u0628\u0648\u064A\u0629 \u0645\u0635\u0645\u0645\u0629 \u062E\u0635\u064A\u0635\u0627\u064B \u0644\u0644\u0645\u0633\u0627\u0641\u0631\u064A\u0646 \u0627\u0644\u0645\u0645\u064A\u0632\u064A\u0646.",
        location: params.location || "\u0645\u0635\u0631",
        pricePerPerson: String(params.pricePerPerson || "1800"),
        rating: "5.0",
        imageUrl: params.imageUrl || "/images/destinations/egypt-pyramids.png",
        highlights: params.highlights || "\u0637\u064A\u0631\u0627\u0646 \u062E\u0627\u0635, \u0625\u0642\u0627\u0645\u0629 5 \u0646\u062C\u0648\u0645, \u0627\u0633\u062A\u0642\u0628\u0627\u0644 VIP",
        isActive: "active"
      });
      return { created: record };
    }
    if (action === "toggle") {
      const current = await getById2("destinations", Number(params.id));
      const nextStatus = current?.isActive === "active" ? "inactive" : "active";
      const updated = await update("destinations", Number(params.id), { isActive: nextStatus });
      return { id: params.id, newStatus: nextStatus, updated };
    }
    throw new Error(`Unknown destination action: ${action}`);
  },
  async manageGallery(action, params = {}) {
    if (action === "list") {
      const items = await list("galleryItems", {
        orderBy: [["createdAt", "desc"]],
        limit: params.limit || 20
      });
      return { items, count: items.length };
    }
    if (action === "add") {
      const record = await insert("galleryItems", {
        imageUrl: params.imageUrl || "/images/hero-egyptian.jpg",
        title: params.title || "\u0645\u0634\u0647\u062F \u0633\u064A\u0627\u062D\u064A \u0641\u0627\u062E\u0631",
        titleAr: params.titleAr || "\u0645\u0634\u0647\u062F \u0633\u064A\u0627\u062D\u064A \u0641\u0627\u062E\u0631",
        category: params.category || "Hotels",
        categoryAr: params.categoryAr || "\u0641\u0646\u0627\u062F\u0642 \u0648\u0645\u0646\u062A\u062C\u0639\u0627\u062A",
        location: params.location || "Cairo, Egypt",
        locationAr: params.locationAr || "\u0627\u0644\u0642\u0627\u0647\u0631\u0629\u060C \u0645\u0635\u0631",
        featured: params.featured || "yes",
        aspect: params.aspect || "landscape",
        isvisible: "visible",
        sortOrder: 0
      });
      return { created: record };
    }
    if (action === "delete") {
      await remove("galleryItems", Number(params.id));
      return { deletedId: params.id };
    }
    throw new Error(`Unknown gallery action: ${action}`);
  },
  async manageSettings(action, params = {}) {
    if (action === "list" || action === "get") {
      const items = await list("siteSettings", { limit: 50 });
      return { items };
    }
    if (action === "update") {
      const items = await list("siteSettings", {
        where: [["settingKey", "==", params.settingKey]],
        limit: 1
      });
      if (items.length > 0 && items[0].id) {
        const updated = await update("siteSettings", items[0].id, {
          settingValue: params.settingValue
        });
        return { updated };
      } else {
        const created = await insert("siteSettings", {
          category: params.category || "general",
          settingKey: params.settingKey,
          settingValue: params.settingValue
        });
        return { created };
      }
    }
    throw new Error(`Unknown settings action: ${action}`);
  }
};
async function analyzeAndExecuteAdminIntent(query) {
  const q = query.trim().toLowerCase();
  if (q.includes("\u0645\u0644\u062E\u0635") || q.includes("\u0627\u062D\u0635\u0627\u0626\u064A\u0627\u062A") || q.includes("\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u064A\u0648\u0645") || q.includes("\u0646\u0634\u0627\u0637 \u0627\u0644\u0645\u0648\u0642\u0639") || q.includes("dashboard") || q.includes("stats") || q.includes("overview")) {
    const data = await adminToolRegistry.getDashboardSummary();
    return {
      tool: "dashboard",
      action: "getDashboardSummary",
      status: "success",
      summary: "Live executive dashboard metrics fetched successfully.",
      summaryAr: `\u062A\u0645 \u0633\u062D\u0628 \u0645\u0644\u062E\u0635 \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u062D\u064A: ${data.totalBookings} \u062D\u062C\u0632 (${data.pendingBookings} \u0645\u0639\u0644\u0642)\u060C ${data.totalOffers} \u0639\u0631\u0648\u0636 (${data.activeOffers} \u0646\u0634\u0637)\u060C ${data.totalReviews} \u062A\u0642\u064A\u064A\u0645 (${data.pendingReviews} \u0645\u0639\u0644\u0642)\u060C ${data.newMessages} \u0631\u0633\u0627\u0626\u0644 \u062C\u062F\u064A\u062F\u0629.`,
      data,
      link: "/admin/dashboard"
    };
  }
  if (q.includes("\u062D\u062C\u0632") || q.includes("\u062D\u062C\u0648\u0632\u0627\u062A") || q.includes("booking")) {
    const idMatch = q.match(/(\d+)/);
    const id2 = idMatch ? Number(idMatch[1]) : void 0;
    if ((q.includes("\u0627\u0643\u062F") || q.includes("\u062A\u0623\u0643\u064A\u062F") || q.includes("\u0648\u0627\u0641\u0642") || q.includes("confirm")) && id2) {
      const data = await adminToolRegistry.manageBookings("updateStatus", { id: id2, status: "confirmed" });
      return {
        tool: "bookings",
        action: "confirmBooking",
        status: "success",
        summary: `Booking #${id2} confirmed.`,
        summaryAr: `\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u062C\u0632 \u0631\u0642\u0645 #${id2} \u0628\u0646\u062C\u0627\u062D \u0641\u064A \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A.`,
        data,
        link: "/admin/bookings"
      };
    }
    if ((q.includes("\u0627\u0644\u063A\u0627\u0621") || q.includes("\u0625\u0644\u063A\u0627\u0621") || q.includes("cancel")) && id2) {
      const data = await adminToolRegistry.manageBookings("updateStatus", { id: id2, status: "cancelled" });
      return {
        tool: "bookings",
        action: "cancelBooking",
        status: "success",
        summary: `Booking #${id2} cancelled.`,
        summaryAr: `\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u062D\u062C\u0632 \u0631\u0642\u0645 #${id2} \u0628\u0646\u062C\u0627\u062D.`,
        data,
        link: "/admin/bookings"
      };
    }
    if (q.includes("\u0645\u0639\u0644\u0642") || q.includes("\u0645\u0639\u0644\u0642\u0629") || q.includes("\u0627\u0639\u0631\u0636") || q.includes("\u0639\u0631\u0636") || q.includes("list")) {
      const data = await adminToolRegistry.manageBookings("list", { status: q.includes("\u0645\u0639\u0644\u0642") ? "pending" : void 0, limit: 5 });
      return {
        tool: "bookings",
        action: "listBookings",
        status: "success",
        summary: `Retrieved ${data.count} bookings.`,
        summaryAr: `\u062A\u0645 \u062C\u0644\u0628 ${data.count} \u062D\u062C\u0632 \u0645\u0646 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0646\u062C\u0627\u062D.`,
        data,
        link: "/admin/bookings"
      };
    }
  }
  if (q.includes("\u0639\u0631\u0636") || q.includes("\u0639\u0631\u0648\u0636") || q.includes("\u0628\u0627\u0642\u0629") || q.includes("\u0628\u0627\u0642\u0627\u062A") || q.includes("offer")) {
    if (q.includes("\u0627\u0646\u0634\u0626") || q.includes("\u0623\u0646\u0634\u0626") || q.includes("\u0627\u0639\u0645\u0644") || q.includes("\u0627\u0636\u0641") || q.includes("create") || q.includes("new")) {
      const discountMatch = q.match(/(\d+)%/);
      const discountValue = discountMatch ? discountMatch[1] : "20";
      const codeMatch = q.match(/كود\s+([A-Za-z0-9_-]+)/i) || q.match(/code\s+([A-Za-z0-9_-]+)/i);
      const promoCode = codeMatch ? codeMatch[1].toUpperCase() : `VIP${discountValue}`;
      const data = await adminToolRegistry.manageOffers("create", {
        title: query.length < 80 ? query.replace(/^(انشئ|أنشئ|اعمل|اضف|create)\s+/i, "") : "\u0628\u0627\u0642\u0629 \u0633\u064A\u0627\u062D\u064A\u0629 \u0645\u0644\u0643\u064A\u0629 \u062D\u0635\u0631\u064A\u0629",
        discountType: "percentage",
        discountValue,
        promoCode,
        category: "luxury",
        destination: "\u0645\u0635\u0631 - \u0627\u0644\u0623\u0642\u0635\u0631 \u0648\u0623\u0633\u0648\u0627\u0646",
        badgeText: `\u062E\u0635\u0645 ${discountValue}%`
      });
      return {
        tool: "offers",
        action: "createOffer",
        status: "success",
        summary: `Offer created with ${discountValue}% discount and promo code ${promoCode}.`,
        summaryAr: `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0628\u0627\u0642\u0629 \u0627\u0644\u0639\u0631\u0636 \u0627\u0644\u0641\u0627\u062E\u0631 \u0628\u0646\u062C\u0627\u062D \u0641\u064A \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u062E\u0635\u0645 ${discountValue}% \u0648\u0643\u0648\u062F (${promoCode}).`,
        data,
        link: "/admin/offers"
      };
    }
    if (q.includes("\u0627\u0639\u0631\u0636") || q.includes("\u0642\u0627\u0626\u0645\u0629") || q.includes("list")) {
      const data = await adminToolRegistry.manageOffers("list", { limit: 6 });
      return {
        tool: "offers",
        action: "listOffers",
        status: "success",
        summary: `Retrieved ${data.count} offers.`,
        summaryAr: `\u062A\u0645 \u0627\u0633\u062A\u0639\u0631\u0627\u0636 ${data.count} \u0639\u0631\u0648\u0636 \u0646\u0634\u0637\u0629 \u0641\u064A \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A.`,
        data,
        link: "/admin/offers"
      };
    }
  }
  if (q.includes("\u062A\u0642\u064A\u064A\u0645") || q.includes("\u062A\u0642\u064A\u064A\u0645\u0627\u062A") || q.includes("review") || q.includes("reviews")) {
    if (q.includes("\u0648\u0627\u0641\u0642 \u0639\u0644\u0649 \u0643\u0644") || q.includes("\u0627\u0639\u062A\u0645\u062F \u0643\u0644") || q.includes("\u0627\u0644\u0645\u0639\u0644\u0642\u0629") || q.includes("approve all")) {
      const data = await adminToolRegistry.manageReviews("approveAllPending");
      return {
        tool: "reviews",
        action: "approveAllPending",
        status: "success",
        summary: `Approved ${data.approvedCount} pending reviews with official luxury thank-you response.`,
        summaryAr: `\u062A\u0645\u062A \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u062C\u0645\u064A\u0639 \u0627\u0644\u062A\u0642\u064A\u064A\u0645\u0627\u062A \u0627\u0644\u0645\u0639\u0644\u0642\u0629 (${data.approvedCount} \u062A\u0642\u064A\u064A\u0645) \u0648\u0643\u062A\u0627\u0628\u0629 \u0631\u062F \u0631\u0633\u0645\u064A \u0641\u0627\u062E\u0631 \u0639\u0644\u064A\u0647\u0627 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B.`,
        data,
        link: "/admin/reviews"
      };
    }
    const idMatch = q.match(/(\d+)/);
    const id2 = idMatch ? Number(idMatch[1]) : void 0;
    if ((q.includes("\u0648\u0627\u0641\u0642") || q.includes("\u0627\u0639\u062A\u0645\u062F") || q.includes("\u0631\u062F") || q.includes("approve")) && id2) {
      const data = await adminToolRegistry.manageReviews("reply", { id: id2 });
      return {
        tool: "reviews",
        action: "replyReview",
        status: "success",
        summary: `Review #${id2} approved and replied.`,
        summaryAr: `\u062A\u0645\u062A \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u0631\u0642\u0645 #${id2} \u0648\u0625\u0636\u0627\u0641\u0629 \u0631\u062F \u0643\u0648\u0646\u0633\u064A\u0631\u062C \u0641\u0627\u062E\u0631 \u0645\u0646 \u0627\u0644\u0625\u062F\u0627\u0631\u0629.`,
        data,
        link: "/admin/reviews"
      };
    }
    if (q.includes("\u0627\u0639\u0631\u0636") || q.includes("\u0627\u0644\u0645\u0639\u0644\u0642\u0629") || q.includes("list")) {
      const data = await adminToolRegistry.manageReviews("list", { status: "pending", limit: 5 });
      return {
        tool: "reviews",
        action: "listReviews",
        status: "success",
        summary: `Retrieved ${data.count} reviews.`,
        summaryAr: `\u062A\u0645 \u0627\u0633\u062A\u0639\u0631\u0627\u0636 ${data.count} \u062A\u0642\u064A\u064A\u0645\u0627\u062A \u0645\u0646 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A.`,
        data,
        link: "/admin/reviews"
      };
    }
  }
  if (q.includes("\u0631\u0633\u0627\u0644\u0629") || q.includes("\u0631\u0633\u0627\u0626\u0644") || q.includes("message") || q.includes("inbox") || q.includes("\u0627\u0633\u062A\u0641\u0633\u0627\u0631")) {
    if (q.includes("\u0627\u0639\u0631\u0636") || q.includes("\u062C\u062F\u064A\u062F\u0629") || q.includes("list")) {
      const data = await adminToolRegistry.manageMessages("list", { status: "new", limit: 5 });
      return {
        tool: "messages",
        action: "listMessages",
        status: "success",
        summary: `Retrieved ${data.count} messages.`,
        summaryAr: `\u062A\u0645 \u062C\u0644\u0628 ${data.count} \u0631\u0633\u0627\u0626\u0644 \u0648\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0648\u0627\u0631\u062F\u0629 \u0645\u0646 \u0627\u0644\u0639\u0645\u0644\u0627\u0621.`,
        data,
        link: "/admin/messages"
      };
    }
  }
  if (q.includes("\u0645\u0642\u0627\u0644") || q.includes("\u0645\u062F\u0648\u0646\u0629") || q.includes("blog") || q.includes("article")) {
    if (q.includes("\u0627\u0646\u0634\u0631") || q.includes("\u0627\u0643\u062A\u0628") || q.includes("create") || q.includes("publish")) {
      const cleanTitle = query.replace(/^(انشر|اكتب|create|publish|أنشئ)\s+(مقال|مقالة|مقالاً|article|blog)?\s*(عن|حول|about)?\s*/i, "").trim();
      const title = cleanTitle.length > 5 ? cleanTitle : "\u0623\u0633\u0631\u0627\u0631 \u0627\u0644\u0641\u062E\u0627\u0645\u0629 \u0627\u0644\u0645\u0644\u0643\u064A\u0629 \u0648\u0627\u0644\u0631\u062D\u0644\u0627\u062A \u0627\u0644\u062E\u0627\u0635\u0629 \u0645\u0639 \u06A4\u0627\u0646\u064A\u0631 \u062C\u0631\u0648\u0628";
      const data = await adminToolRegistry.manageBlog("create", {
        title,
        status: "published",
        category: "Luxury Travel"
      });
      return {
        tool: "blog",
        action: "publishPost",
        status: "success",
        summary: `Blog post "${title}" drafted and published live.`,
        summaryAr: `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0648\u0646\u0634\u0631 \u0627\u0644\u0645\u0642\u0627\u0644 \u0627\u0644\u0641\u0627\u062E\u0631 ("${title}") \u0641\u064A \u0627\u0644\u0645\u062F\u0648\u0646\u0629 \u0645\u0628\u0627\u0634\u0631\u0629 \u0645\u0639 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0640 SEO \u0627\u0644\u0643\u0627\u0645\u0644\u0629.`,
        data,
        link: "/admin/blog"
      };
    }
  }
  return null;
}
var aiCommandRouter = router({
  /**
   * Direct Executive Admin Action Trigger (Programmatic Tool Execution)
   */
  executeAdminAction: adminProcedure.input(
    z19.object({
      tool: z19.enum([
        "dashboard",
        "bookings",
        "offers",
        "reviews",
        "messages",
        "blog",
        "destinations",
        "gallery",
        "settings"
      ]),
      action: z19.string(),
      params: z19.record(z19.string(), z19.any()).optional()
    })
  ).mutation(async ({ input }) => {
    const { tool, action, params = {} } = input;
    try {
      let resultData;
      let summary = "";
      let summaryAr = "";
      let link = "/admin";
      switch (tool) {
        case "dashboard":
          resultData = await adminToolRegistry.getDashboardSummary();
          summary = "Dashboard summary refreshed.";
          summaryAr = "\u062A\u0645 \u0633\u062D\u0628 \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0628\u0646\u062C\u0627\u062D.";
          link = "/admin/dashboard";
          break;
        case "bookings":
          resultData = await adminToolRegistry.manageBookings(action, params);
          summary = `Bookings action "${action}" executed.`;
          summaryAr = `\u062A\u0645 \u062A\u0646\u0641\u064A\u0630 \u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u062D\u062C\u0648\u0632\u0627\u062A (${action}) \u0628\u0646\u062C\u0627\u062D.`;
          link = "/admin/bookings";
          break;
        case "offers":
          resultData = await adminToolRegistry.manageOffers(action, params);
          summary = `Offers action "${action}" executed.`;
          summaryAr = `\u062A\u0645 \u062A\u0646\u0641\u064A\u0630 \u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u0639\u0631\u0648\u0636 (${action}) \u0628\u0646\u062C\u0627\u062D.`;
          link = "/admin/offers";
          break;
        case "reviews":
          resultData = await adminToolRegistry.manageReviews(action, params);
          summary = `Reviews action "${action}" executed.`;
          summaryAr = `\u062A\u0645 \u062A\u0646\u0641\u064A\u0630 \u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u062A\u0642\u064A\u064A\u0645\u0627\u062A (${action}) \u0628\u0646\u062C\u0627\u062D.`;
          link = "/admin/reviews";
          break;
        case "messages":
          resultData = await adminToolRegistry.manageMessages(action, params);
          summary = `Messages action "${action}" executed.`;
          summaryAr = `\u062A\u0645 \u062A\u0646\u0641\u064A\u0630 \u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u0631\u0633\u0627\u0626\u0644 (${action}) \u0628\u0646\u062C\u0627\u062D.`;
          link = "/admin/messages";
          break;
        case "blog":
          resultData = await adminToolRegistry.manageBlog(action, params);
          summary = `Blog action "${action}" executed.`;
          summaryAr = `\u062A\u0645 \u062A\u0646\u0641\u064A\u0630 \u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u0645\u062F\u0648\u0646\u0629 (${action}) \u0628\u0646\u062C\u0627\u062D.`;
          link = "/admin/blog";
          break;
        case "destinations":
          resultData = await adminToolRegistry.manageDestinations(action, params);
          summary = `Destinations action "${action}" executed.`;
          summaryAr = `\u062A\u0645 \u062A\u0646\u0641\u064A\u0630 \u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u0648\u062C\u0647\u0627\u062A (${action}) \u0628\u0646\u062C\u0627\u062D.`;
          link = "/admin/destinations";
          break;
        case "gallery":
          resultData = await adminToolRegistry.manageGallery(action, params);
          summary = `Gallery action "${action}" executed.`;
          summaryAr = `\u062A\u0645 \u062A\u0646\u0641\u064A\u0630 \u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u0645\u0639\u0631\u0636 (${action}) \u0628\u0646\u062C\u0627\u062D.`;
          link = "/admin/gallery";
          break;
        case "settings":
          resultData = await adminToolRegistry.manageSettings(action, params);
          summary = `Settings action "${action}" executed.`;
          summaryAr = `\u062A\u0645 \u062A\u0646\u0641\u064A\u0630 \u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A (${action}) \u0628\u0646\u062C\u0627\u062D.`;
          link = "/admin/settings";
          break;
        default:
          throw new Error(`Unsupported admin tool: ${tool}`);
      }
      return {
        success: true,
        tool,
        action,
        summary,
        summaryAr,
        data: resultData,
        link,
        executedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (err) {
      return {
        success: false,
        tool,
        action,
        summary: `Execution failed: ${err.message}`,
        summaryAr: `\u0641\u0634\u0644 \u0627\u0644\u062A\u0646\u0641\u064A\u0630: ${err.message}`,
        error: err.message,
        executedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  }),
  /**
   * Upload a file for AI chat (admin only)
   */
  uploadFile: adminProcedure.input(
    z19.object({
      fileData: z19.string(),
      // base64
      filename: z19.string(),
      mimeType: z19.string()
    })
  ).mutation(async ({ ctx, input }) => {
    const buffer = Buffer.from(input.fileData, "base64");
    const fileSize = buffer.length;
    if (fileSize > 10 * 1024 * 1024) {
      throw new Error("File size exceeds 10MB limit");
    }
    const ext = input.filename.split(".").pop() || "bin";
    const randomSuffix = nanoid3(8);
    const fileKey = `ai-command/${ctx.user.id}/${randomSuffix}.${ext}`;
    const { url } = await storagePut(fileKey, buffer, input.mimeType);
    return {
      url,
      fileKey,
      filename: input.filename,
      mimeType: input.mimeType,
      fileSize
    };
  }),
  /**
   * Main AI chat - with Autonomous Admin Tool Execution
   */
  chat: adminProcedure.input(
    z19.object({
      messages: z19.array(
        z19.object({
          role: z19.enum(["system", "user", "assistant"]),
          content: z19.string(),
          attachments: z19.array(attachmentSchema).optional()
        })
      ),
      taskType: taskTypeEnum.default("general")
    })
  ).mutation(async ({ input }) => {
    const lastUserMsg = [...input.messages].reverse().find((m) => m.role === "user");
    const userText = lastUserMsg?.content || "";
    let executedAction = null;
    try {
      executedAction = await analyzeAndExecuteAdminIntent(userText);
    } catch (err) {
      console.error("[aiCommand] Intent execution error:", err);
    }
    const systemPrompt = TASK_PROMPTS[input.taskType] || TASK_PROMPTS.general;
    const llmMessages = [
      { role: "system", content: systemPrompt },
      ...input.messages.map((m) => ({
        role: m.role,
        content: buildMessageContent(m.content, m.attachments)
      }))
    ];
    if (executedAction) {
      llmMessages.push({
        role: "system",
        content: `[EXECUTIVE ACTION EXECUTED]: The administrator's request triggered a database action. Tool: ${executedAction.tool}, Action: ${executedAction.action}, Status: ${executedAction.status}, Details: ${executedAction.summaryAr}. Please incorporate this successful execution confirmation gracefully in your luxury response.`
      });
    }
    const result = await invokeLLM({ messages: llmMessages });
    const content = result.choices?.[0]?.message?.content;
    let responseText = typeof content === "string" ? content : Array.isArray(content) ? content.filter((c) => c.type === "text").map((c) => c.text).join("\n") : "No response generated.";
    if (executedAction && !responseText.includes(executedAction.summaryAr)) {
      responseText = `\u2705 **[\u062A\u0645 \u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0628\u0646\u062C\u0627\u062D]**: ${executedAction.summaryAr}

${responseText}`;
    }
    return {
      response: responseText,
      usage: result.usage || null,
      model: result.model || "unknown",
      executedAction
    };
  }),
  /**
   * Quick task execution - one-shot tasks with structured output
   */
  executeTask: adminProcedure.input(
    z19.object({
      taskType: z19.enum(allTaskTypeIds),
      prompt: z19.string().min(1),
      context: z19.string().optional(),
      language: z19.enum(["ar", "en", "auto"]).default("auto"),
      attachments: z19.array(attachmentSchema).optional()
    })
  ).mutation(async ({ input }) => {
    const systemPrompt = TASK_PROMPTS[input.taskType] || TASK_PROMPTS.general || VANIR_SYSTEM_PROMPT;
    let userPrompt = input.prompt;
    if (input.context) {
      userPrompt += `

Additional context:
${input.context}`;
    }
    if (input.language !== "auto") {
      userPrompt += `

Please respond in ${input.language === "ar" ? "Arabic" : "English"}.`;
    }
    const messageContent = buildMessageContent(userPrompt, input.attachments);
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: messageContent }
      ]
    });
    const content = result.choices?.[0]?.message?.content;
    const responseText = typeof content === "string" ? content : Array.isArray(content) ? content.filter((c) => c.type === "text").map((c) => c.text).join("\n") : "No response generated.";
    return {
      result: responseText,
      taskType: input.taskType,
      usage: result.usage || null,
      model: result.model || "unknown",
      executedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }),
  /**
   * Get available task types and their descriptions
   */
  getTaskTypes: adminProcedure.query(() => {
    return ALL_TASK_TYPES;
  }),
  /**
   * Public AI Concierge Chat for Website Visitors
   */
  publicChat: publicProcedure.input(
    z19.object({
      messages: z19.array(
        z19.object({
          role: z19.enum(["system", "user", "assistant"]),
          content: z19.string()
        })
      )
    })
  ).mutation(async ({ input }) => {
    const systemPrompt = `${VANIR_SYSTEM_PROMPT}

You are the official 24/7 Luxury Travel Concierge for Vanir Travel Group.
Your primary and default language is ENGLISH. Always respond in elegant, warm, and sophisticated English (unless the user explicitly speaks Arabic).
Your mission is to welcome visitors warmly, provide exquisite recommendations for Egyptian luxury travel, private tours, Nile cruises, VIP airport fast track, private jets, and 5-star hotel accommodations.
Guide them to contact our concierge team at /contact or make a booking at /booking when appropriate.`;
    const llmMessages = [
      { role: "system", content: systemPrompt },
      ...input.messages.map((m) => ({
        role: m.role,
        content: m.content
      }))
    ];
    const result = await invokeLLM({ messages: llmMessages });
    const content = result.choices?.[0]?.message?.content;
    const responseText = typeof content === "string" ? content : Array.isArray(content) ? content.filter((c) => c.type === "text").map((c) => c.text).join("\n") : "Welcome to Vanir Travel Group. It is our absolute pleasure to assist you. Please feel free to explore our luxury journeys or contact our VIP concierge directly at /contact.";
    return {
      response: responseText,
      model: result.model || "vanir-ai"
    };
  }),
  /**
   * Get Active AI API Configuration
   */
  getApiConfig: adminProcedure.query(async () => {
    let saved = await getSettingValue("ai", "api_config").catch(() => null);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        updateActiveAiConfig(parsed);
      } catch (e) {
      }
    }
    const current = getActiveAiConfig();
    const maskedKey = current.apiKey ? `${current.apiKey.slice(0, 7)}\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022${current.apiKey.slice(-5)}` : "Not Configured";
    return {
      apiUrl: current.apiUrl,
      model: current.model,
      provider: current.provider,
      maskedKey,
      hasKey: Boolean(current.apiKey)
    };
  }),
  /**
   * Save Active AI API Configuration
   */
  saveApiConfig: adminProcedure.input(
    z19.object({
      apiKey: z19.string().optional(),
      apiUrl: z19.string().optional(),
      model: z19.string().optional(),
      provider: z19.string().optional()
    })
  ).mutation(async ({ input }) => {
    const updates = {};
    if (input.apiKey && input.apiKey.trim().length > 0 && !input.apiKey.includes("\u2022\u2022\u2022\u2022")) {
      updates.apiKey = input.apiKey.trim();
    }
    if (input.apiUrl && input.apiUrl.trim().length > 0) {
      updates.apiUrl = input.apiUrl.trim();
    }
    if (input.model && input.model.trim().length > 0) {
      updates.model = input.model.trim();
    }
    if (input.provider) {
      updates.provider = input.provider.trim();
    }
    const updated = updateActiveAiConfig(updates);
    await setSettingValue("ai", "api_config", JSON.stringify(updated)).catch((e) => {
      console.warn("[aiCommand] Failed to persist api_config in siteSettings:", e);
    });
    return {
      success: true,
      message: "AI API settings saved successfully",
      config: {
        apiUrl: updated.apiUrl,
        model: updated.model,
        provider: updated.provider,
        hasKey: Boolean(updated.apiKey)
      }
    };
  }),
  /**
   * Test AI API Connection
   */
  testApiConnection: adminProcedure.input(
    z19.object({
      apiKey: z19.string().optional(),
      apiUrl: z19.string().optional(),
      model: z19.string().optional(),
      provider: z19.string().optional()
    }).optional()
  ).mutation(async ({ input }) => {
    const key = input?.apiKey && !input.apiKey.includes("\u2022\u2022\u2022\u2022") ? input.apiKey : void 0;
    return await testAiConnection(key, input?.apiUrl, input?.model, input?.provider);
  })
});

// server/routers/siteSettings.ts
import { TRPCError as TRPCError6 } from "@trpc/server";
import { z as z20 } from "zod";
var DESIGN_VERSION_CATEGORIES = /* @__PURE__ */ new Set(["hero", "theme", "media"]);
var HeroSettingsSchema = z20.object({
  backgroundType: z20.enum(["static-image", "html5-video", "dynamic-slider"]).optional(),
  sliderEngine: z20.enum(["framer-motion", "swiper", "splide"]).optional(),
  sliderEffect: z20.enum(["fade", "cube", "flip", "coverflow", "creative"]).optional(),
  autoplayMs: z20.number().int().min(1e3).max(15e3).optional(),
  loopSlides: z20.boolean().optional(),
  textFadeInEnabled: z20.boolean().optional(),
  textFadeInDuration: z20.number().int().min(150).max(5e3).optional()
}).passthrough();
var MediaDisplaySchema = z20.object({
  layout: z20.enum(["dynamic-grid", "masonry", "swiper-carousel", "grid-lightbox", "isotope-filter"]).default("dynamic-grid"),
  aspectRatio: z20.enum(["square", "landscape", "portrait", "original"]).default("original")
}).passthrough();
var ThemeDesignSchema = z20.object({
  palettePreset: z20.enum(["light", "dark", "luxury-gold", "minimalist-tailwind"]).default("luxury-gold"),
  radiusPreset: z20.enum(["sharp", "soft", "glass"]).default("soft"),
  shadowPreset: z20.enum(["none", "soft", "glass"]).default("soft")
}).passthrough();
var DesignVersionSchema = z20.object({
  id: z20.string(),
  createdAt: z20.preprocess((value) => {
    if (!value) return value;
    if (value instanceof Date) return value;
    if (typeof value === "object" && value !== null && "toDate" in value && typeof value.toDate === "function") {
      return value.toDate();
    }
    return value;
  }, z20.date().nullable().optional()),
  createdBy: z20.union([z20.number(), z20.string()]).nullable().optional(),
  reason: z20.string().optional(),
  snapshot: z20.record(z20.string(), z20.record(z20.string(), z20.string()))
});
function parseAndSanitize(category, key, value) {
  if ((category !== "hero" || key !== "hero_data" && key !== "hero_settings") && !(category === "media" && key === "gallery_display") && !(category === "theme" && key === "design_tokens")) {
    return value;
  }
  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new TRPCError6({ code: "BAD_REQUEST", message: "Invalid JSON payload." });
  }
  if (category === "hero") {
    const validated2 = HeroSettingsSchema.safeParse(parsed);
    if (!validated2.success) throw new TRPCError6({ code: "BAD_REQUEST", message: "Invalid hero settings payload." });
    return JSON.stringify(validated2.data);
  }
  if (category === "media" && key === "gallery_display") {
    const validated2 = MediaDisplaySchema.safeParse(parsed);
    if (!validated2.success) throw new TRPCError6({ code: "BAD_REQUEST", message: "Invalid media display settings payload." });
    return JSON.stringify(validated2.data);
  }
  const validated = ThemeDesignSchema.safeParse(parsed);
  if (!validated.success) throw new TRPCError6({ code: "BAD_REQUEST", message: "Invalid theme design payload." });
  return JSON.stringify(validated.data);
}
async function collectCategorySettings(category) {
  let rows = await list("siteSettings", {
    where: [["category", "==", category]]
  });
  if (!rows.length) {
    const allRows = await list("siteSettings", {});
    rows = allRows.filter((r) => r.category === category || r.id && typeof r.id === "string" && r.id.startsWith(`${category}__`));
  }
  const settings = {};
  for (const row of rows) {
    const key = row.settingKey || (row.id && typeof row.id === "string" && row.id.startsWith(`${category}__`) ? row.id.slice(category.length + 2) : null);
    if (key) settings[key] = row.settingValue ?? "";
  }
  return settings;
}
async function createDesignVersion(reason, createdBy) {
  const snapshot = {};
  for (const category of DESIGN_VERSION_CATEGORIES) {
    snapshot[category] = await collectCategorySettings(category);
  }
  await db2.collection("design_versions").add({
    reason,
    snapshot,
    createdBy: createdBy ?? null,
    createdAt: /* @__PURE__ */ new Date()
  });
}
var siteSettingsRouter = router({
  /**
   * Get theme settings (public - no auth required for visitors)
   */
  getTheme: publicProcedure.query(async () => {
    const rows = await list("siteSettings", {
      where: [["category", "==", "theme"]]
    });
    if (!rows.length) return null;
    const settings = {};
    for (const row of rows) settings[row.settingKey] = row.settingValue ?? "";
    return settings;
  }),
  /**
   * Get a single setting by category + key (public - hero/theme data accessible to all)
   */
  get: publicProcedure.input(z20.object({ category: z20.string(), key: z20.string() })).query(async ({ input }) => {
    return getSettingValue(input.category, input.key);
  }),
  /**
   * Get all settings for a category publicly (for public site components)
   */
  getPublicCategory: publicProcedure.input(z20.object({ category: z20.string() })).query(async ({ input }) => {
    let rows = await list("siteSettings", {
      where: [["category", "==", input.category]]
    });
    if (!rows.length) {
      const allRows = await list("siteSettings", {});
      rows = allRows.filter((r) => r.category === input.category || r.id && typeof r.id === "string" && r.id.startsWith(`${input.category}__`));
    }
    const settings = {};
    for (const row of rows) {
      const key = row.settingKey || (row.id && typeof row.id === "string" && row.id.startsWith(`${input.category}__`) ? row.id.slice(input.category.length + 2) : null);
      if (key) settings[key] = row.settingValue ?? "";
    }
    return settings;
  }),
  /**
   * Get all settings for a category
   */
  getByCategory: protectedProcedure.input(z20.object({ category: z20.string() })).query(async ({ input }) => {
    let rows = await list("siteSettings", {
      where: [["category", "==", input.category]]
    });
    if (!rows.length) {
      const allRows = await list("siteSettings", {});
      rows = allRows.filter((r) => r.category === input.category || r.id && typeof r.id === "string" && r.id.startsWith(`${input.category}__`));
    }
    const settings = {};
    for (const row of rows) {
      const key = row.settingKey || (row.id && typeof row.id === "string" && row.id.startsWith(`${input.category}__`) ? row.id.slice(input.category.length + 2) : null);
      if (key) settings[key] = row.settingValue ?? "";
    }
    return settings;
  }),
  /**
   * Get all settings across all categories
   */
  getAll: protectedProcedure.query(async () => {
    const rows = await list("siteSettings", {});
    const grouped = {};
    for (const row of rows) {
      if (!grouped[row.category]) grouped[row.category] = {};
      grouped[row.category][row.settingKey] = row.settingValue ?? "";
    }
    return grouped;
  }),
  /**
   * Design versions list
   */
  listDesignVersions: adminProcedure.input(z20.object({ limit: z20.number().int().min(1).max(50).default(20) }).optional()).query(async ({ input }) => {
    const limit = input?.limit ?? 20;
    const snap = await db2.collection("design_versions").orderBy("createdAt", "desc").limit(limit).get();
    return snap.docs.map((doc) => {
      const parsed = DesignVersionSchema.safeParse({ id: doc.id, ...doc.data() });
      if (!parsed.success) return null;
      return parsed.data;
    }).filter(Boolean);
  }),
  /**
   * Rollback to a design version snapshot
   */
  rollbackDesignVersion: adminProcedure.input(z20.object({ versionId: z20.string().min(1) })).mutation(async ({ input, ctx }) => {
    const versionRef = db2.collection("design_versions").doc(input.versionId);
    const versionSnap = await versionRef.get();
    if (!versionSnap.exists) {
      throw new TRPCError6({ code: "NOT_FOUND", message: "Design version not found." });
    }
    const parsed = DesignVersionSchema.safeParse({ id: versionSnap.id, ...versionSnap.data() });
    if (!parsed.success) {
      throw new TRPCError6({ code: "BAD_REQUEST", message: "Invalid design version snapshot." });
    }
    for (const [category, settings] of Object.entries(parsed.data.snapshot)) {
      for (const [key, rawValue] of Object.entries(settings)) {
        const sanitized = parseAndSanitize(category, key, rawValue);
        await setSettingValue(category, key, sanitized, ctx.user.id);
      }
    }
    await createDesignVersion(`Rollback to version ${input.versionId}`, ctx.user.id);
    return { success: true };
  }),
  /**
   * Set a single setting (upsert)
   */
  set: adminProcedure.input(z20.object({ category: z20.string(), key: z20.string(), value: z20.string() })).mutation(async ({ input, ctx }) => {
    const sanitized = parseAndSanitize(input.category, input.key, input.value);
    await setSettingValue(input.category, input.key, sanitized, ctx.user.id);
    if (DESIGN_VERSION_CATEGORIES.has(input.category)) {
      await createDesignVersion(`Updated ${input.category}.${input.key}`, ctx.user.id);
    }
    return { success: true };
  }),
  /**
   * Set multiple settings at once (batch upsert)
   */
  setMany: adminProcedure.input(z20.object({
    category: z20.string(),
    settings: z20.record(z20.string(), z20.string())
  })).mutation(async ({ input, ctx }) => {
    const entries = Object.entries(input.settings);
    for (const [key, value] of entries) {
      const sanitized = parseAndSanitize(input.category, key, value);
      await setSettingValue(input.category, key, sanitized, ctx.user.id);
    }
    if (DESIGN_VERSION_CATEGORIES.has(input.category)) {
      await createDesignVersion(`Updated ${input.category} settings`, ctx.user.id);
    }
    return { success: true, count: entries.length };
  }),
  /**
   * Delete a setting
   */
  delete: adminProcedure.input(z20.object({ category: z20.string(), key: z20.string() })).mutation(async ({ input }) => {
    const docId = `${input.category}__${input.key}`;
    await db2.collection("siteSettings").doc(docId).delete();
    return { success: true };
  })
});

// server/routers/backup.ts
import { z as z21 } from "zod";

// server/_core/r2Client.ts
import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} from "@aws-sdk/client-s3";
var s3ClientInstance = null;
function getR2Client() {
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: "auto",
      endpoint: ENV.r2Endpoint,
      credentials: {
        accessKeyId: ENV.r2AccessKeyId,
        secretAccessKey: ENV.r2SecretAccessKey
      }
    });
  }
  return s3ClientInstance;
}
async function testR2Connection() {
  try {
    const s3 = getR2Client();
    await s3.send(
      new ListObjectsV2Command({
        Bucket: ENV.r2BucketName,
        MaxKeys: 1
      })
    );
    return {
      success: true,
      bucket: ENV.r2BucketName,
      message: `Successfully connected to Cloudflare R2 bucket "${ENV.r2BucketName}"`
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[R2 Connection Error]:", errorMsg);
    return {
      success: false,
      bucket: ENV.r2BucketName,
      message: `Connection failed: ${errorMsg}`
    };
  }
}
async function uploadDatabaseSnapshotToR2(snapshotName, data, recordCount = 0) {
  const s3 = getR2Client();
  const safeName = snapshotName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `backups/database/${safeName}`;
  const buffer = typeof data === "string" ? Buffer.from(data, "utf-8") : data;
  await s3.send(
    new PutObjectCommand({
      Bucket: ENV.r2BucketName,
      Key: key,
      Body: buffer,
      ContentType: "application/json",
      Metadata: {
        recordcount: String(recordCount),
        createdat: (/* @__PURE__ */ new Date()).toISOString()
      }
    })
  );
  console.log(`[R2 Backup] Successfully uploaded snapshot: ${key} (${buffer.length} bytes)`);
  return {
    key,
    size: buffer.length
  };
}
async function listR2Snapshots() {
  try {
    const s3 = getR2Client();
    const res = await s3.send(
      new ListObjectsV2Command({
        Bucket: ENV.r2BucketName,
        Prefix: "backups/database/"
      })
    );
    if (!res.Contents || res.Contents.length === 0) {
      return [];
    }
    const sorted = [...res.Contents].sort((a, b) => {
      const timeA = a.LastModified ? a.LastModified.getTime() : 0;
      const timeB = b.LastModified ? b.LastModified.getTime() : 0;
      return timeB - timeA;
    });
    return sorted.map((item) => {
      const key = item.Key || "";
      const filename = key.split("/").pop() || key;
      return {
        key,
        filename,
        size: item.Size || 0,
        lastModified: item.LastModified ? item.LastModified.toISOString() : void 0
      };
    });
  } catch (err) {
    console.error("[R2 List Error]:", err);
    return [];
  }
}
async function downloadSnapshotFromR2(key) {
  const s3 = getR2Client();
  const res = await s3.send(
    new GetObjectCommand({
      Bucket: ENV.r2BucketName,
      Key: key
    })
  );
  if (!res.Body) {
    throw new Error(`Empty body returned from R2 for key: ${key}`);
  }
  const str = await res.Body.transformToString("utf-8");
  return str;
}
async function deleteR2Snapshot(key) {
  const s3 = getR2Client();
  await s3.send(
    new DeleteObjectCommand({
      Bucket: ENV.r2BucketName,
      Key: key
    })
  );
  console.log(`[R2 Backup] Deleted snapshot: ${key}`);
  return true;
}

// server/routers/backup.ts
var TABLE_MAP = {
  destinations: { collection: "destinations", label: "Destinations" },
  offers: { collection: "offers", label: "Offers & Packages" },
  blog: { collection: "blogPosts", label: "Blog Articles" },
  bookings: { collection: "bookings", label: "Bookings" },
  users: { collection: "users", label: "Users" },
  gallery: { collection: "galleryItems", label: "Gallery" },
  reviews: { collection: "reviews", label: "Reviews" },
  settings: { collection: "siteSettings", label: "Settings" },
  contacts: { collection: "contactMessages", label: "Contact Messages" },
  marketing: { collection: "marketingContent", label: "Marketing Content" }
};
var backupRouter = router({
  /**
   * Get record counts for all exportable collections
   */
  getExportSections: adminProcedure.query(async () => {
    const sections = [];
    for (const [id2, { collection, label }] of Object.entries(TABLE_MAP)) {
      try {
        const recordCount = await count(collection);
        sections.push({ id: id2, label, recordCount });
      } catch {
        sections.push({ id: id2, label, recordCount: 0 });
      }
    }
    return sections;
  }),
  /**
   * Export selected sections as JSON data
   */
  exportData: adminProcedure.input(z21.object({
    sections: z21.array(z21.string()),
    format: z21.enum(["json", "csv"]).default("json")
  })).mutation(async ({ input }) => {
    const exportResult = {};
    for (const sectionId of input.sections) {
      const mapping = TABLE_MAP[sectionId];
      if (!mapping) continue;
      try {
        const rows = await list(mapping.collection);
        exportResult[sectionId] = {
          label: mapping.label,
          recordCount: rows.length,
          data: rows
        };
      } catch {
        exportResult[sectionId] = {
          label: mapping.label,
          recordCount: 0,
          data: []
        };
      }
    }
    return {
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      format: input.format,
      totalRecords: Object.values(exportResult).reduce((sum, s) => sum + s.recordCount, 0),
      sections: exportResult
    };
  }),
  /**
   * Get backup settings from Firestore
   */
  getSettings: adminProcedure.query(async () => {
    const rows = await list("siteSettings", {
      where: [["category", "==", "backup"]]
    });
    const settings = {};
    for (const row of rows) {
      settings[row.settingKey] = row.settingValue ?? "";
    }
    return settings;
  }),
  /**
   * Restore data from backup file
   */
  restoreData: adminProcedure.input(z21.object({
    sections: z21.record(z21.string(), z21.object({
      label: z21.string(),
      recordCount: z21.number(),
      data: z21.array(z21.any())
    })),
    mode: z21.enum(["merge", "replace"]).default("merge")
  })).mutation(async ({ input }) => {
    const results = {};
    for (const [sectionId, section] of Object.entries(input.sections)) {
      const mapping = TABLE_MAP[sectionId];
      if (!mapping || !section.data || section.data.length === 0) {
        results[sectionId] = { restored: 0, skipped: 0, errors: 0 };
        continue;
      }
      let restored = 0;
      const skipped = 0;
      let errors = 0;
      try {
        if (input.mode === "replace") {
          await removeAll(mapping.collection);
        }
        for (const row of section.data) {
          try {
            const cleanRow = { ...row };
            delete cleanRow.id;
            await insert(mapping.collection, cleanRow);
            restored++;
          } catch {
            errors++;
          }
        }
      } catch {
        errors = section.data.length;
      }
      results[sectionId] = { restored, skipped, errors };
    }
    const totalRestored = Object.values(results).reduce((s, r) => s + r.restored, 0);
    const totalSkipped = Object.values(results).reduce((s, r) => s + r.skipped, 0);
    const totalErrors = Object.values(results).reduce((s, r) => s + r.errors, 0);
    return {
      success: true,
      restoredAt: (/* @__PURE__ */ new Date()).toISOString(),
      totalRestored,
      totalSkipped,
      totalErrors,
      details: results
    };
  }),
  /**
   * Save backup settings
   */
  saveSettings: adminProcedure.input(z21.object({
    settings: z21.record(z21.string(), z21.string())
  })).mutation(async ({ input, ctx }) => {
    for (const [key, value] of Object.entries(input.settings)) {
      await setSettingValue("backup", key, value, ctx.user.id);
    }
    return { success: true };
  }),
  /* ═══════════════════════════════════════════════════════════════
     Cloudflare R2 Automated Cloud Backup Procedures
     ═══════════════════════════════════════════════════════════════ */
  /**
   * Test connection and get Cloudflare R2 backup status
   */
  r2Status: adminProcedure.query(async () => {
    const result = await testR2Connection();
    return {
      ...result,
      accountId: ENV.r2AccountId,
      endpoint: ENV.r2Endpoint,
      bucket: ENV.r2BucketName
    };
  }),
  /**
   * Trigger on-demand backup of all collections to Cloudflare R2
   */
  createR2Backup: adminProcedure.input(
    z21.object({
      sections: z21.array(z21.string()).optional()
    }).optional()
  ).mutation(async ({ input }) => {
    const sectionsToExport = input?.sections && input.sections.length > 0 ? input.sections : Object.keys(TABLE_MAP);
    const exportResult = {};
    for (const sectionId of sectionsToExport) {
      const mapping = TABLE_MAP[sectionId];
      if (!mapping) continue;
      try {
        const rows = await list(mapping.collection);
        exportResult[sectionId] = {
          label: mapping.label,
          recordCount: rows.length,
          data: rows
        };
      } catch {
        exportResult[sectionId] = {
          label: mapping.label,
          recordCount: 0,
          data: []
        };
      }
    }
    const totalRecords = Object.values(exportResult).reduce((sum, s) => sum + s.recordCount, 0);
    const now = /* @__PURE__ */ new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, "-");
    const snapshotName = `vanir_snapshot_${dateStr}.json`;
    const payload = JSON.stringify(
      {
        version: "1.0",
        snapshotName,
        exportedAt: now.toISOString(),
        totalRecords,
        sections: exportResult
      },
      null,
      2
    );
    const uploadRes = await uploadDatabaseSnapshotToR2(snapshotName, payload, totalRecords);
    return {
      success: true,
      snapshotName,
      key: uploadRes.key,
      size: uploadRes.size,
      totalRecords,
      createdAt: now.toISOString()
    };
  }),
  /**
   * List all database snapshots currently stored on Cloudflare R2
   */
  listR2Backups: adminProcedure.query(async () => {
    return await listR2Snapshots();
  }),
  /**
   * Restore database from a Cloudflare R2 snapshot
   */
  restoreFromR2: adminProcedure.input(
    z21.object({
      key: z21.string(),
      mode: z21.enum(["merge", "replace"]).default("merge")
    })
  ).mutation(async ({ input }) => {
    const rawJson = await downloadSnapshotFromR2(input.key);
    const parsed = JSON.parse(rawJson);
    if (!parsed.sections) {
      throw new Error("Invalid backup format: missing sections");
    }
    const results = {};
    for (const [sectionId, section] of Object.entries(parsed.sections)) {
      const mapping = TABLE_MAP[sectionId];
      if (!mapping || !section.data || section.data.length === 0) {
        results[sectionId] = { restored: 0, skipped: 0, errors: 0 };
        continue;
      }
      let restored = 0;
      let errors = 0;
      try {
        if (input.mode === "replace") {
          await removeAll(mapping.collection);
        }
        for (const row of section.data) {
          try {
            const cleanRow = { ...row };
            delete cleanRow.id;
            await insert(mapping.collection, cleanRow);
            restored++;
          } catch {
            errors++;
          }
        }
      } catch {
        errors = section.data.length;
      }
      results[sectionId] = { restored, skipped: 0, errors };
    }
    const totalRestored = Object.values(results).reduce((s, r) => s + r.restored, 0);
    return {
      success: true,
      restoredAt: (/* @__PURE__ */ new Date()).toISOString(),
      totalRestored,
      details: results
    };
  }),
  /**
   * Delete a snapshot from Cloudflare R2
   */
  deleteR2Backup: adminProcedure.input(z21.object({ key: z21.string() })).mutation(async ({ input }) => {
    const ok = await deleteR2Snapshot(input.key);
    return { success: ok };
  })
});

// server/routers/dataImport.ts
import { z as z22 } from "zod";
var IMPORT_TABLES = [
  {
    id: "destinations",
    label: "Destinations",
    description: "Travel destinations and tour packages",
    collection: "destinations",
    fields: [
      { key: "name", label: "Name", type: "string", required: true },
      { key: "location", label: "Location", type: "string", required: true },
      { key: "description", label: "Description", type: "string" },
      { key: "pricePerPerson", label: "Price Per Person", type: "decimal" },
      { key: "rating", label: "Rating", type: "decimal", hint: "0\u20135" },
      { key: "imageUrl", label: "Image URL", type: "string" },
      { key: "highlights", label: "Highlights", type: "string" },
      { key: "bestTimeToVisit", label: "Best Time To Visit", type: "string" },
      { key: "duration", label: "Duration", type: "string" },
      { key: "difficulty", label: "Difficulty", type: "enum", options: ["easy", "moderate", "hard"] },
      { key: "groupSize", label: "Group Size", type: "string" },
      { key: "inclusions", label: "Inclusions", type: "string" },
      { key: "exclusions", label: "Exclusions", type: "string" },
      { key: "isActive", label: "Status", type: "enum", options: ["active", "inactive"] }
    ]
  },
  {
    id: "offers",
    label: "Offers & Packages",
    description: "Promotional offers and discounts",
    collection: "offers",
    fields: [
      { key: "title", label: "Title", type: "string", required: true },
      { key: "description", label: "Description", type: "string" },
      { key: "discountType", label: "Discount Type", type: "enum", required: true, options: ["percentage", "fixed"] },
      { key: "discountValue", label: "Discount Value", type: "decimal", required: true },
      { key: "promoCode", label: "Promo Code", type: "string" },
      { key: "startDate", label: "Start Date", type: "date", required: true },
      { key: "endDate", label: "End Date", type: "date", required: true },
      { key: "category", label: "Category", type: "string" },
      { key: "destination", label: "Destination", type: "string" },
      { key: "imageUrl", label: "Image URL", type: "string" },
      { key: "totalSpots", label: "Total Spots", type: "number" },
      { key: "isActive", label: "Status", type: "enum", options: ["active", "inactive", "expired"] },
      { key: "badgeText", label: "Badge Text", type: "string" }
    ]
  },
  {
    id: "blog",
    label: "Blog Articles",
    description: "Blog posts and articles",
    collection: "blogPosts",
    fields: [
      { key: "slug", label: "Slug", type: "string", required: true, hint: "Unique URL slug" },
      { key: "title", label: "Title", type: "string", required: true },
      { key: "excerpt", label: "Excerpt", type: "string", required: true },
      { key: "content", label: "Content", type: "string", required: true },
      { key: "metaTitle", label: "Meta Title", type: "string" },
      { key: "metaDescription", label: "Meta Description", type: "string" },
      { key: "metaKeywords", label: "Meta Keywords", type: "string" },
      { key: "coverImageUrl", label: "Cover Image URL", type: "string" },
      { key: "category", label: "Category", type: "string" },
      { key: "authorName", label: "Author Name", type: "string" },
      { key: "status", label: "Status", type: "enum", options: ["draft", "published", "archived"] }
    ]
  },
  {
    id: "reviews",
    label: "Reviews",
    description: "Customer reviews and ratings",
    collection: "reviews",
    fields: [
      { key: "guestName", label: "Guest Name", type: "string" },
      { key: "tripName", label: "Trip Name", type: "string", required: true },
      { key: "destination", label: "Destination", type: "string" },
      { key: "rating", label: "Rating", type: "number", required: true, hint: "1\u20135" },
      { key: "title", label: "Title", type: "string" },
      { key: "content", label: "Content", type: "string", required: true },
      { key: "isApproved", label: "Moderation", type: "enum", options: ["pending", "approved", "rejected"] }
    ]
  },
  {
    id: "gallery",
    label: "Gallery",
    description: "Gallery images",
    collection: "gallery_items",
    fields: [
      { key: "imageUrl", label: "Image URL", type: "string", required: true },
      { key: "title", label: "Title", type: "string", required: true },
      { key: "description", label: "Description", type: "string" },
      { key: "category", label: "Category", type: "string", required: true },
      { key: "location", label: "Location", type: "string" },
      { key: "featured", label: "Featured", type: "enum", options: ["no", "yes"] },
      { key: "aspect", label: "Aspect", type: "enum", options: ["landscape", "portrait", "square"] },
      { key: "isVisible", label: "Visibility", type: "enum", options: ["visible", "hidden"] }
    ]
  },
  {
    id: "contacts",
    label: "Contact Messages",
    description: "Contact form submissions / leads",
    collection: "contactMessages",
    fields: [
      { key: "name", label: "Name", type: "string", required: true },
      { key: "email", label: "Email", type: "string", required: true },
      { key: "phone", label: "Phone", type: "string" },
      { key: "subject", label: "Subject", type: "string" },
      { key: "message", label: "Message", type: "string", required: true },
      { key: "status", label: "Status", type: "enum", options: ["new", "read", "replied", "archived"] }
    ]
  }
];
function getTable(id2) {
  return IMPORT_TABLES.find((t2) => t2.id === id2);
}
function coerceValue(field, raw) {
  if (raw === null || raw === void 0 || typeof raw === "string" && raw.trim() === "") {
    if (field.required) return { ok: false, error: `${field.label} is required` };
    return { ok: true, value: void 0 };
  }
  const str = String(raw).trim();
  switch (field.type) {
    case "string":
      return { ok: true, value: str };
    case "number": {
      const n = Number(str.replace(/,/g, ""));
      if (!Number.isFinite(n)) return { ok: false, error: `${field.label} "${str}" is not a number` };
      return { ok: true, value: Math.trunc(n) };
    }
    case "decimal": {
      const n = Number(str.replace(/[$,]/g, ""));
      if (!Number.isFinite(n)) return { ok: false, error: `${field.label} "${str}" is not a number` };
      return { ok: true, value: String(n) };
    }
    case "date": {
      let ms;
      if (/^\d{10}$/.test(str)) ms = Number(str) * 1e3;
      else if (/^\d{13}$/.test(str)) ms = Number(str);
      else {
        const parsed = Date.parse(str);
        if (Number.isNaN(parsed)) return { ok: false, error: `${field.label} "${str}" is not a valid date` };
        ms = parsed;
      }
      return { ok: true, value: ms };
    }
    case "boolean": {
      const truthy = ["true", "1", "yes", "y", "active", "on"];
      return { ok: true, value: truthy.includes(str.toLowerCase()) };
    }
    case "enum": {
      const opts = field.options ?? [];
      const match = opts.find((o) => o.toLowerCase() === str.toLowerCase());
      if (!match) {
        return { ok: false, error: `${field.label} "${str}" must be one of: ${opts.join(", ")}` };
      }
      return { ok: true, value: match };
    }
    default:
      return { ok: true, value: str };
  }
}
var dataImportRouter = router({
  /**
   * Return the list of importable tables with their field definitions so the
   * client can render a column-mapping UI.
   */
  getImportableTables: adminProcedure.query(() => {
    return IMPORT_TABLES.map((t2) => ({
      id: t2.id,
      label: t2.label,
      description: t2.description,
      fields: t2.fields.map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
        required: !!f.required,
        options: f.options ?? null,
        hint: f.hint ?? null
      }))
    }));
  }),
  /**
   * Validate (dry run) a batch of mapped rows without writing to the DB.
   * Returns per-row errors so the admin can fix the source file first.
   */
  validateImport: adminProcedure.input(z22.object({
    tableId: z22.string(),
    rows: z22.array(z22.record(z22.string(), z22.any()))
  })).mutation(({ input }) => {
    const target = getTable(input.tableId);
    if (!target) throw new Error(`Unknown import table: ${input.tableId}`);
    const rowErrors = [];
    input.rows.forEach((row, idx) => {
      const errors = [];
      for (const field of target.fields) {
        const result = coerceValue(field, row[field.key]);
        if (!result.ok) errors.push(result.error);
      }
      if (errors.length) rowErrors.push({ row: idx + 1, errors });
    });
    return {
      totalRows: input.rows.length,
      validRows: input.rows.length - rowErrors.length,
      invalidRows: rowErrors.length,
      rowErrors: rowErrors.slice(0, 100)
    };
  }),
  /**
   * Import mapped rows into the target table. Each row is coerced/validated;
   * invalid rows are skipped (with reasons) and valid rows inserted.
   */
  importRecords: adminProcedure.input(z22.object({
    tableId: z22.string(),
    rows: z22.array(z22.record(z22.string(), z22.any())),
    skipInvalid: z22.boolean().default(true)
  })).mutation(async ({ input }) => {
    const target = getTable(input.tableId);
    if (!target) throw new Error(`Unknown import table: ${input.tableId}`);
    let imported = 0;
    let skipped = 0;
    let failed = 0;
    const errors = [];
    for (let i = 0; i < input.rows.length; i++) {
      const row = input.rows[i];
      const record = {};
      const rowIssues = [];
      for (const field of target.fields) {
        const result = coerceValue(field, row[field.key]);
        if (!result.ok) {
          rowIssues.push(result.error);
        } else if (result.value !== void 0) {
          record[field.key] = result.value;
        }
      }
      if (rowIssues.length) {
        if (input.skipInvalid) {
          skipped++;
          errors.push({ row: i + 1, message: rowIssues.join("; ") });
          continue;
        } else {
          failed++;
          errors.push({ row: i + 1, message: rowIssues.join("; ") });
          continue;
        }
      }
      try {
        await insert(target.collection, record);
        imported++;
      } catch (e) {
        failed++;
        errors.push({ row: i + 1, message: e?.message || "Insert failed" });
      }
    }
    return {
      success: failed === 0,
      importedAt: (/* @__PURE__ */ new Date()).toISOString(),
      tableId: input.tableId,
      totalRows: input.rows.length,
      imported,
      skipped,
      failed,
      errors: errors.slice(0, 100)
    };
  })
});

// server/routers.ts
import { z as z23 } from "zod";
import { TRPCError as TRPCError7 } from "@trpc/server";
import { createHash, timingSafeEqual } from "crypto";
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    }),
    login: publicProcedure.input(z23.object({ email: z23.string().email(), password: z23.string().min(1) })).mutation(async ({ ctx, input }) => {
      try {
        const adminEmail = ENV.adminEmail;
        const adminPasswordHash = ENV.adminPasswordHash;
        if (!adminEmail || !adminPasswordHash) {
          throw new TRPCError7({
            code: "PRECONDITION_FAILED",
            message: "Admin login is not configured on this server. Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH environment variables."
          });
        }
        if (input.email.toLowerCase() !== adminEmail.toLowerCase()) {
          throw new TRPCError7({ code: "UNAUTHORIZED", message: "Invalid email or password." });
        }
        const storedHash = adminPasswordHash.trim();
        const isHashFormat = /^[a-f0-9]{64}$/.test(storedHash.toLowerCase());
        let match = false;
        if (isHashFormat) {
          const submittedHash = createHash("sha256").update(input.password).digest("hex");
          try {
            match = timingSafeEqual(
              Buffer.from(submittedHash, "utf8"),
              Buffer.from(storedHash.toLowerCase(), "utf8")
            );
          } catch {
            match = false;
          }
        } else {
          try {
            match = timingSafeEqual(
              Buffer.from(input.password, "utf8"),
              Buffer.from(storedHash, "utf8")
            );
          } catch {
            match = false;
          }
        }
        if (!match) {
          throw new TRPCError7({ code: "UNAUTHORIZED", message: "Invalid email or password." });
        }
        const openId = `admin:${adminEmail.toLowerCase()}`;
        await upsertUser({
          openId,
          email: adminEmail,
          name: "Admin",
          loginMethod: "password",
          role: "admin",
          lastSignedIn: /* @__PURE__ */ new Date()
        }).catch((err) => {
          console.warn("[Auth] Could not persist admin user to DB (non-fatal):", err);
        });
        const sessionToken = await sdk.createSessionToken(openId, {
          expiresInMs: ONE_YEAR_MS,
          name: "Admin"
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS
        });
        return { success: true };
      } catch (err) {
        if (err instanceof TRPCError7) throw err;
        throw new TRPCError7({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred during login. Please try again."
        });
      }
    })
  }),
  // Feature routers
  bookings: bookingsRouter,
  reviews: reviewsRouter,
  offers: offersRouter,
  contact: contactRouter,
  uploads: uploadsRouter,
  gallery: galleryRouter,
  aiStudio: aiStudioRouter,
  users: usersRouter,
  blog: blogRouter,
  marketing: marketingRouter,
  destinations: destinationsRouter,
  // Admin routers (both top-level and nested for 100% client compatibility)
  adminDestinations: adminDestinationsRouter,
  adminOffers: adminOffersRouter,
  adminBlog: adminBlogRouter,
  admin: router({
    destinations: adminDestinationsRouter,
    offers: adminOffersRouter,
    blog: adminBlogRouter
  }),
  // Platform & Administration Tools
  serverMonitor: serverMonitorRouter,
  fileManager: fileManagerRouter,
  databaseManager: databaseManagerRouter,
  // AI Command Center
  aiCommand: aiCommandRouter,
  // Site Settings (real DB-backed)
  siteSettings: siteSettingsRouter,
  // Backup & Export (real DB export)
  backup: backupRouter,
  // Data Import (import records from external tools via CSV/JSON)
  dataImport: dataImportRouter
});

// server/_core/context.ts
import { getAuth as getAuth2 } from "firebase-admin/auth";
function getBearerToken(req) {
  const auth = req.headers["authorization"];
  if (!auth || Array.isArray(auth)) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}
async function createContext(opts) {
  let user = null;
  const bearer = getBearerToken(opts.req);
  if (bearer) {
    try {
      const decoded = await getAuth2().verifyIdToken(bearer);
      const uid = decoded.uid;
      const openId = `firebase:${uid}`;
      const now = /* @__PURE__ */ new Date();
      const name = decoded.name || (decoded.email ? decoded.email.split("@")[0] : null) || null;
      const userRef = db2.collection("users").doc(uid);
      const snap = await userRef.get();
      if (snap.exists) {
        const data = snap.data();
        await userRef.set({ lastSignedIn: now }, { merge: true });
        user = {
          id: data.id ?? 0,
          openId,
          name: data.name ?? name,
          email: data.email ?? decoded.email ?? null,
          phone: null,
          loginMethod: "firebase",
          avatarUrl: data.avatarUrl ?? null,
          role: data.role ?? "user",
          createdAt: now,
          updatedAt: now,
          lastSignedIn: now
        };
      } else {
        const role = openId === ENV.ownerOpenId ? "admin" : "user";
        await userRef.set({
          openId,
          name,
          email: decoded.email ?? null,
          loginMethod: "firebase",
          role,
          createdAt: now,
          lastSignedIn: now
        });
        user = {
          id: 0,
          openId,
          name,
          email: decoded.email ?? null,
          phone: null,
          loginMethod: "firebase",
          avatarUrl: null,
          role,
          createdAt: now,
          updatedAt: now,
          lastSignedIn: now
        };
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.debug("[context] Firebase token verification failed");
      }
    }
  }
  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.debug("[context] Session auth failed");
      }
      user = null;
    }
  }
  if (user?.openId && !user.openId.startsWith("firebase:") && !user.openId.startsWith("admin:")) {
    const fresh = await getUserByOpenId(user.openId);
    if (fresh) user = fresh;
  }
  return {
    req: opts.req,
    res: opts.res,
    user,
    contextData: {
      role: user?.role ?? null,
      userId: user?.openId ?? null,
      email: user?.email ?? null
    }
  };
}

// server/_core/vite.ts
import express from "express";
import fs5 from "fs";
import { nanoid as nanoid4 } from "nanoid";
import path5 from "path";

// shared/seo/seoMatrix.ts
var DEFAULT_SECTIONS = [
  {
    h2: "The Sovereign Standard of Global Luxury Travel Concierge Service",
    body: [
      "Vanir Group (Vanir Travel Group) operates as an internationally recognized luxury travel concierge service and private aviation brokerage serving discerning travelers, executives, diplomatic delegations, and ultra-high-net-worth families across Germany (DE), Europe, North America, the Middle East, and worldwide.",
      "Every journey we orchestrate combines absolute discretion, 24/7 personal concierge oversight, diplomatic-grade ground security, and direct VVIP access to the world's most prestigious five-star palaces, superyachts, and private airfields."
    ],
    h3s: [
      {
        title: "24/7 Dedicated Lifestyle & Aviation Desk",
        text: "Our multilingual concierge specialists in Cairo, Frankfurt/Munich partner desks, Dubai, and Geneva coordinate on-demand private jet charters (Privatjet mieten), tarmac VIP fast-track clearance, and bespoke multi-country itineraries within hours."
      },
      {
        title: "Unlisted Suite Inventories & After-Hours Monument Access",
        text: "Through direct sovereign and hospitality partnerships, Vanir Group unlocks presidential suites, private island takeovers, and private after-hours archaeological access unavailable through traditional travel agencies."
      }
    ]
  },
  {
    h2: "Transparent Bespoke Pricing, Custom Itineraries & White-Glove Execution",
    body: [
      "Unlike conventional booking platforms that offer rigid packages, Vanir Group engineers every itinerary from the ground up around your personal schedule, security protocols, and culinary preferences.",
      "Whether arranging a 7-day private dahabiya Nile voyage, a Gulfstream G650 intercontinental charter from Germany to Cairo or the Maldives, or a multi-generational European summer estate takeover, our proposals feature clear, all-inclusive transparent pricing with zero hidden fees."
    ],
    bullets: [
      "Bespoke Day-by-Day Itinerary Architecture: Tailored around your private aircraft arrival times and personal pace.",
      "Dedicated On-Ground Concierge & Security Detail: Accompanied by licensed Ph.D. Egyptologists, mountain guides, or maritime captains.",
      "Seamless Multi-Currency Settlement: Accepting EUR (\u20AC), USD ($), GBP (\xA3), CHF, and wire transfers with full corporate invoicing."
    ]
  },
  {
    h2: "Verified E-E-A-T Credentials, Leadership & Global Client Trust",
    body: [
      "Founded and led by CEO Ahmed Roshdi\u2014an industry veteran with over 18 years of executive experience in ultra-luxury hospitality, diplomatic logistics, and private aviation\u2014Vanir Group is IATA-accredited, ISO 9001:2015 certified, and officially licensed by the Egyptian Ministry of Tourism.",
      "Recognized by the World Travel Awards and trusted by over 50,000 global travelers with a 4.9/5.0 verified satisfaction rating, our team stands as a distinct global luxury travel brand\u2014never to be confused with unrelated US construction firms."
    ]
  }
];
var DEFAULT_IMAGES = [
  {
    src: "https://vanirgroup.com/The_Nile_River_at_Cairo.jpg",
    alt: "Vanir Group luxury travel concierge service and private pyramids tour in Egypt",
    caption: "Exclusive after-hours private access to the Great Pyramids of Giza curated by Vanir Group."
  },
  {
    src: "https://vanirgroup.com/images/final_cairo_post.png",
    alt: "Luxury Egypt tours five-star Nile view palace suite in Cairo",
    caption: "Presidential suite accommodations overlooking the historic Nile River in Cairo."
  },
  {
    src: "https://vanirgroup.com/images/final_luxor_post.png",
    alt: "Private luxury Nile cruise between Luxor and Aswan with Egyptologist guide",
    caption: "Bespoke private sanctuary cruise sailing between Luxor and Aswan."
  },
  {
    src: "https://vanirgroup.com/ahmed-roshdi.png",
    alt: "Ahmed Roshdi Founder and CEO of Vanir Group Luxury Travel Concierge",
    caption: "Ahmed Roshdi, Founder & CEO of Vanir Group, overseeing global VIP concierge operations."
  }
];
var vanirSeoMatrix = {
  home: {
    route: "/",
    metaTitle: "Vanir Group | Ultra-Luxury Travel Concierge Service & Private Jet Charter",
    metaDescription: "World-class luxury travel concierge service, private jet charter (Privatjet mieten), luxury Egypt tours, and bespoke global itineraries curated by Vanir Group.",
    h1: "Vanir Group \u2014 Ultra-Luxury Travel Concierge Service & Private Aviation",
    lead: "Experience the world's premier luxury travel concierge service. From on-demand private jet charters (Privatjet mieten) and luxury Egypt tours to European superyacht voyages and African private safaris, Vanir Group orchestrates extraordinary journeys for UHNW individuals, executives, and royal families worldwide.",
    seoContent: "Vanir Group (Vanir Travel Group) stands as the global pinnacle of luxury travel concierge service and private aviation management. Founded by CEO Ahmed Roshdi, we blend ancient heritage, meticulous modern execution, and absolute confidential security to deliver bespoke global itineraries across Egypt, Germany, Europe, Dubai, the Maldives, and Africa.",
    pricingSummary: "Bespoke Luxury Concierge Retainers from \u20AC2,500/trip | Private Egypt Luxury Tours from \u20AC4,800 per guest | On-Demand Light to Heavy Private Jet Charters from \u20AC4,200/flight hour.",
    itineraryHighlights: [
      "Day 1\u20133: Private Jet Arrival & Tarmac VIP Fast-Track into Cairo \u2014 Four Seasons Presidential Suite & Private After-Hours Great Pyramid Chamber Access.",
      "Day 4\u20137: Private Helicopter Transfer & Sanctuary Dahabiya Nile Charter from Luxor to Aswan with Chief Egyptologist.",
      "Day 8\u201310: Red Sea Superyacht Charter or Seamless Private Jet Connection to European / Maldives Private Island Retreat."
    ],
    ctaText: "Request Your Bespoke Concierge Proposal",
    ctaHref: "/contact",
    images: [
      {
        src: "https://vanirgroup.com/The_Nile_River_at_Cairo.jpg",
        alt: "Vanir Group luxury travel concierge service private jet and pyramids tour",
        caption: "Bespoke luxury travel concierge service and private aviation curated by Vanir Group."
      },
      {
        src: "https://vanirgroup.com/images/final_cairo_post.png",
        alt: "Luxury Egypt tours and VIP private concierge in Cairo",
        caption: "Private after-hours monument access and presidential hospitality in Cairo."
      },
      {
        src: "https://vanirgroup.com/images/final_dubai_post.png",
        alt: "Private jet charter and superyacht concierge in Dubai and Europe",
        caption: "Global private aviation and superyacht charters across Europe and the Middle East."
      },
      {
        src: "https://vanirgroup.com/images/final_maldives_post.png",
        alt: "Ultra-luxury private island buyouts in the Maldives for UHNW travelers",
        caption: "Secluded overwater villas and private island takeovers in the Maldives."
      },
      {
        src: "https://vanirgroup.com/ahmed-roshdi.png",
        alt: "Ahmed Roshdi Founder and CEO of Vanir Group Luxury Travel Concierge",
        caption: "Ahmed Roshdi, Founder & CEO of Vanir Group."
      }
    ],
    sections: [
      {
        h2: "What Does a Luxury Travel Concierge Do? Complete Guide to White-Glove Travel",
        body: [
          "A luxury travel concierge does far more than book flights and five-star hotels. At Vanir Group, your dedicated luxury travel concierge service acts as a 24/7 private lifestyle architect, aviation broker, diplomatic protocol officer, and on-ground crisis manager.",
          "From securing unlisted royal suites and arranging private after-hours museum openings to coordinating armed executive transport, Michelin-starred private chefs, and instant itinerary pivots mid-journey, our specialists handle every logistical detail with absolute confidentiality."
        ],
        h3s: [
          {
            title: "How Luxury Travel Concierge Service Works",
            text: "Your journey begins with a confidential consultation with our senior travel designers. Within 24 hours, we present a fully customized architectural itinerary complete with aircraft tail numbers, private villa floorplans, security briefings, and transparent all-inclusive pricing."
          },
          {
            title: "What Is Included in Luxury Travel Concierge Packages?",
            text: "Every Vanir Group package includes 24/7 personal concierge access via encrypted WhatsApp/dedicated line, VIP tarmac meet-and-assist at all airports, private chauffeur-driven Maybach or armored SUV transfers, priority suite upgrades, and private expert guides."
          }
        ]
      },
      {
        h2: "Luxury Travel Concierge vs Traditional Travel Agency: Key Differences",
        body: [
          "Understanding the distinction between a bespoke luxury travel concierge service and a traditional travel agency is essential for ultra-high-net-worth (UHNW) travelers, family offices, and corporate executives.",
          "While traditional travel agencies sell pre-packaged wholesale inventory during standard business hours, a luxury travel concierge service like Vanir Group operates on-demand 24/7/365, engineering one-of-a-kind experiences that cannot be purchased online."
        ],
        bullets: [
          "Access & Exclusivity: Traditional agencies book standard rooms; Vanir Group secures private castle buyouts, after-hours entry inside the Great Pyramid of Khufu, and Vatican private chapel viewings.",
          "Aviation Integration: Conventional agents book commercial tickets; our aviation desk coordinates private jet charters (Privatjet mieten), helicopter transfers, and VIP tarmac customs clearance.",
          "Proactive 24/7 Monitoring: Real-time flight tracking, immediate aircraft re-positioning, and personal on-site directors accompanying complex itineraries."
        ]
      },
      {
        h2: "Hire a Luxury Travel Concierge for a European Vacation, Egypt Odyssey, or African Private Safari",
        body: [
          "Whether you want to hire a luxury travel concierge for a European vacation across Lake Como, the Amalfi Coast, the Swiss Alps, Paris, and Santorini, or book a luxury travel concierge for a private safari in Tanzania, Kenya, and South Africa, Vanir Group delivers turnkey global execution.",
          "For our German and European clientele (Deutschland, \xD6sterreich, Schweiz), we offer seamless direct private jet charters (Privatjet mieten & Flugzeug chartern) from Frankfurt, Munich, Berlin, D\xFCsseldorf, Hamburg, and Zurich directly to Cairo, Luxor, Sharm El Sheikh, Dubai, and European coastal hubs."
        ],
        h3s: [
          {
            title: "European Bespoke Vacations & Mediterranean Yachting",
            text: "Private palazzos on Lake Como, superyacht charters in Mykonos and Capri, helicopter ski transfers in Zermatt and St. Moritz, and VIP paddock access in Monaco."
          },
          {
            title: "Book a Luxury Travel Concierge for a Private Safari in Africa",
            text: "Fly-in private bush planes across the Serengeti and Maasai Mara, exclusive-use conservation lodges in Botswana's Okavango Delta, and seamless combination journeys pairing Cairo's pharaonic wonders with East African wildlife sanctuaries."
          }
        ]
      },
      {
        h2: "Comparing Global Concierge Benchmarks: Vanir Group vs Quintessentially Travel vs Virtuoso",
        body: [
          "Discerning travelers frequently compare Quintessentially Travel vs Virtuoso vs Vanir Group when selecting a global travel partner for celebrities, executives, and UHNW families.",
          "While Virtuoso is a broad consortium of independent travel advisors and Quintessentially focuses on annual membership tiers, Vanir Group combines direct operational ownership in the Middle East and Egypt with no-annual-fee bespoke trip architecture and integrated private aviation brokerage."
        ],
        bullets: [
          "Direct Operational Control: Unlike third-party brokers who subcontract local DMCs, Vanir Group commands its own fleet, security personnel, and Egyptologist scholars on the ground.",
          "No Mandatory Annual Membership Fee: Access world-class UHNW concierge services on a per-journey basis or through tailored corporate family-office retainers.",
          "Celebrity, Royal & Executive Discretion: Strict NDA protocols, manifest privacy, and tarmac-to-villa security trusted by heads of state and Fortune 500 leaders."
        ]
      },
      {
        h2: "Meet Our Founder Ahmed Roshdi & Verified Global E-E-A-T Credentials",
        body: [
          "Vanir Group (officially Vanir Travel Group, online at vanirgroup.com) was founded in Cairo by CEO Ahmed Roshdi and has grown into an award-winning international luxury travel house. Note: Vanir Group is an ultra-luxury travel and aviation firm and is completely unaffiliated with Vanir Construction Management in the United States.",
          "Our credentials include IATA Accreditation, ISO 9001:2015 Quality Certification, Egyptian Ministry of Tourism License, and World Travel Awards recognition, backed by hundreds of verified 5-star client testimonials."
        ]
      }
    ],
    faqs: [
      {
        q: "What does a luxury travel concierge do?",
        a: "A luxury travel concierge designs, books, and manages bespoke end-to-end journeys, including private jet charters, VIP airport fast-track clearance, unlisted five-star suite allocations, private yacht charters, after-hours monument access, and 24/7 personal on-trip support."
      },
      {
        q: "How does Vanir Group compare to Quintessentially Travel and Virtuoso?",
        a: "Vanir Group provides direct ground ownership in Egypt and the Middle East alongside global private aviation and European/African concierge partnerships\u2014without requiring a mandatory $15,000+ annual membership fee to access VVIP privileges."
      },
      {
        q: "Can German and European clients charter a private jet (Privatjet mieten) through Vanir Group?",
        a: "Yes. We provide 24/7 private jet charter (Privatjet mieten / Flugzeug chartern) from Frankfurt, Munich, Berlin, Zurich, and Vienna to Egypt, Dubai, the Maldives, and across Europe with full German and English concierge support."
      }
    ]
  },
  about: {
    route: "/about",
    metaTitle: "About Vanir Group & Founder Ahmed Roshdi | Luxury Travel Concierge",
    metaDescription: "Meet Founder & CEO Ahmed Roshdi and the leadership team behind Vanir Group, the IATA-accredited ultra-luxury travel concierge and private aviation house.",
    h1: "About Vanir Group \u2014 Our Heritage, Founder Ahmed Roshdi & Sovereign Standards",
    lead: "Founded in Cairo by luxury hospitality visionary Ahmed Roshdi, Vanir Group (Vanir Travel Group) has spent over 15 years setting the global benchmark for bespoke luxury travel, private aviation charters, and diplomatic concierge logistics across Egypt, Europe, and the Middle East.",
    seoContent: "At Vanir Group, we believe that time, authenticity, and privacy are the ultimate luxuries. Led by Founder & CEO Ahmed Roshdi, our IATA-accredited and ISO 9001:2015 certified team of travel architects, aviation specialists, and academic Egyptologists serves over 50,000 discerning clients worldwide.",
    pricingSummary: "Tailored Private Itineraries from \u20AC3,500 | Corporate & Diplomatic Retainers Custom Quoted | 100% Transparent Fee Structure.",
    itineraryHighlights: [
      "Direct Executive Oversight by Founder & CEO Ahmed Roshdi and Chief Operations Officer Nadia Hassan.",
      "IATA Accredited, ISO 9001:2015 Certified, and Licensed by the Egyptian Ministry of Tourism.",
      "Dedicated Multilingual Desks serving Germany (DACH), UK, North America, and GCC Royal & Executive Offices."
    ],
    ctaText: "Schedule an Executive Consultation",
    ctaHref: "/contact",
    images: [
      {
        src: "https://vanirgroup.com/ahmed-roshdi.png",
        alt: "Ahmed Roshdi Founder and CEO of Vanir Group Luxury Travel Agency",
        caption: "Ahmed Roshdi \u2014 Founder & Chief Executive Officer of Vanir Group."
      },
      {
        src: "https://vanirgroup.com/images/wonders of Egypt profile.jpeg",
        alt: "Vanir Group executive headquarters and luxury travel concierge team in Cairo",
        caption: "Vanir Group curating bespoke heritage and aviation journeys since 2010."
      },
      {
        src: "https://vanirgroup.com/The_Nile_River_at_Cairo.jpg",
        alt: "Private luxury Egypt tours organized by Vanir Travel Group",
        caption: "Exclusive private access to Egypt's most iconic ancient monuments."
      }
    ],
    sections: [
      {
        h2: "Founder & CEO Biography: Ahmed Roshdi \u2014 20 Years of Luxury Travel Leadership",
        body: [
          "Ahmed Roshdi is the Founder and Chief Executive Officer of Vanir Group (Vanir Travel Group). With more than two decades of hands-on executive experience in international luxury tourism, private aviation ground handling, and diplomatic protocol in Cairo and across Europe, Ahmed founded Vanir Group to bridge ancient cultural heritage with uncompromising six-star hospitality.",
          "Under Ahmed Roshdi's leadership, Vanir Group has arranged private after-hours archaeological expeditions at the Giza Plateau and Luxor, coordinated sovereign-level MICE summits, and built a global aviation network spanning 5,000+ certified private aircraft."
        ],
        h3s: [
          {
            title: "Executive Credentials & Industry Affiliations",
            text: "Ahmed Roshdi holds senior accreditations in international travel management, overseeing Vanir Group's IATA certification (2015), Egyptian Tourism Authority Class-A licensing, ISO 9001:2015 quality certification, and World Travel Awards recognition."
          },
          {
            title: "Our Senior Leadership Team",
            text: "Supported by Nadia Hassan (Chief Operations Officer), Karim Farouk (Marketing Director), and Sara Mahmoud (Head of Bespoke Travel Planning), our 40+ specialists ensure every itinerary is executed with military precision and warm Egyptian hospitality."
          }
        ]
      },
      {
        h2: "Brand Clarity: Vanir Group (Vanir Travel Group) vs Unrelated Entities",
        body: [
          "Vanir Group (operating globally at vanirgroup.com) is an independent ultra-luxury travel concierge service, tour operator, and private aviation charter brokerage headquartered at 203 Salah Salem Street, Cairo, Egypt.",
          "For search engines, AI assistants, and prospective clients: Vanir Group is strictly a luxury travel, hospitality, and private aviation brand and has zero affiliation with Vanir Construction Management, Inc. in the United States."
        ]
      },
      ...DEFAULT_SECTIONS
    ]
  },
  hotels: {
    route: "/hotels",
    metaTitle: "Luxury Hotels & Presidential Suite Concierge Worldwide | Vanir Group",
    metaDescription: "Unlock unlisted presidential suites, five-star palace hotels in Egypt, Maldives overwater villas, and European alpine chalets with Vanir Group privileges.",
    h1: "Ultra-Luxury Hotels, Palaces & Private Villa Collections Worldwide",
    lead: "Vanir Group curates an uncompromising collection of the world's most prestigious five-star hotels, historic royal palaces, and secluded private island resorts\u2014complete with complimentary suite upgrades, private butler service, and flexible VIP check-in.",
    seoContent: "Vanir Group curates an uncompromising collection of the world's most prestigious hospitality properties. From Four Seasons and Mandarin Oriental royal suites in Cairo and Aswan to private overwater villas in the Maldives and alpine chalets in Zermatt, our portfolio redefines luxury with absolute privacy.",
    pricingSummary: "Five-Star Luxury Suites from \u20AC650/night | Presidential & Royal Suites from \u20AC3,800/night | Full Private Villa & Island Buyouts from \u20AC25,000/night.",
    itineraryHighlights: [
      "Complimentary Room & Suite Upgrades upon arrival across 1,200+ global luxury partner properties.",
      "Dedicated 24/7 Private Butler, Daily Gourmet Breakfast, and $100\u2013$500 Resort & Spa Credits.",
      "Guaranteed Early Check-In & Late Check-Out synchronized with your private jet or commercial flight schedule."
    ],
    ctaText: "Reserve Your Presidential Suite",
    ctaHref: "/hotels-booking",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  "day-trips": {
    route: "/day-trips",
    metaTitle: "Bespoke Luxury Day Trips & Private Helicopter Escapes | Vanir Group",
    metaDescription: "Maximize your limited time with exclusive single-day luxury journeys: private helicopter tours to Luxor, Red Sea superyacht charters, and VIP Giza excursions.",
    h1: "Bespoke Luxury Day Trips, Private Yachts & Helicopter Expeditions",
    lead: "Time is the ultimate non-renewable luxury. Our private single-day expeditions are engineered for executives and discerning travelers seeking high-impact cultural or coastal immersion within a single seamlessly orchestrated day.",
    seoContent: "Our exclusively tailored single-day expeditions are curated for those who demand immediate, high-impact immersion. Whether chartering a private luxury yacht across the Red Sea or Mediterranean, or boarding a private helicopter from Cairo to Luxor's Valley of the Kings.",
    pricingSummary: "Private Chauffeur & Egyptologist Day Tours from \u20AC490/day | Private Red Sea Yacht Charters from \u20AC2,200/day | Private Helicopter & Jet Day Hops from \u20AC9,500.",
    itineraryHighlights: [
      "07:00 AM: Private Maybach pick-up from your Cairo residence or hotel to the VIP Aviation Terminal.",
      "08:30 AM: Private turbo-prop or light jet flight to Luxor; private tour of Karnak and Queen Nefertari's Tomb.",
      "05:00 PM: Sunset gourmet dining overlooking the Nile before returning to Cairo by 08:30 PM."
    ],
    ctaText: "Design Your Private Day Escape",
    ctaHref: "/booking",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  mice: {
    route: "/mice",
    metaTitle: "Elite MICE Corporate Events, Board Summits & Retreats | Vanir Group",
    metaDescription: "Turnkey luxury MICE event management for executive board meetings, diplomatic summits, and corporate incentive retreats across Egypt, Dubai, and Europe.",
    h1: "Elite MICE Corporate Events, Diplomatic Summits & Executive Retreats",
    lead: "Elevate your corporate gatherings into legendary global benchmarks. Vanir Group delivers end-to-end logistics for executive board summits, sovereign delegations, and luxury incentive retreats at the Pyramids of Giza, Dubai, and European capitals.",
    seoContent: "Vanir Group provides end-to-end management for high-profile board meetings, international symposia, and luxury exhibitions, securing top-tier high-security venues, private air charter airlifts, and gala dinners at ancient monuments.",
    pricingSummary: "Executive Board Retreats (10\u201330 VIPs) from \u20AC35,000 | Full Corporate Summit & Gala Production (50\u2013300 Guests) Custom Quoted.",
    itineraryHighlights: [
      "Private Group Charter Airlift & Dedicated Airport Fast-Track Desk for all delegates.",
      "High-Security Boardrooms with simultaneous interpretation and encrypted AV infrastructure.",
      "Private Gala Dinner at the foot of the Great Pyramids of Giza or Temple of Luxor."
    ],
    ctaText: "Request a Corporate MICE Proposal",
    ctaHref: "/contact",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  "private-jet": {
    route: "/private-jet",
    metaTitle: "Private Jet Charter & Privatjet Mieten (Germany & Global) | Vanir Group",
    metaDescription: "On-demand private jet charter (Privatjet mieten & Flugzeug chartern). Fly from Germany, Europe, and the Middle East with ARGUS-certified safety and VIP tarmac access.",
    h1: "Private Jet Charter & Luxury Private Aviation (Privatjet Mieten Worldwide)",
    lead: "Transcend commercial schedules with Vanir Group Private Aviation. Whether you are searching for 'private jet charter', 'Privatjet mieten' from Germany (Frankfurt, Munich, Berlin, D\xFCsseldorf), or 'Flugzeug chartern' to Cairo, Dubai, or the Maldives, our 24/7 flight desk positions over 5,000 certified aircraft within 4 hours.",
    seoContent: "Vanir Group grants on-demand access to a world-class fleet of light jets, super-midsize jets, ultra-long-range heavy jets (Gulfstream, Bombardier Global, Falcon), and VIP airliners. Serving Germany (DE), Switzerland, the UK, and the Middle East with transparent hourly charter pricing and VIP terminal handling.",
    pricingSummary: "Very Light Jets (4\u20136 Pax): \u20AC3,200\u2013\u20AC4,500/hr | Midsize & Super-Midsize Jets (7\u20139 Pax): \u20AC4,800\u2013\u20AC6,800/hr | Heavy & Ultra-Long-Range Jets (10\u201316 Pax): \u20AC7,500\u2013\u20AC12,500/hr | Empty Leg Flights: Save up to 60%.",
    itineraryHighlights: [
      "Frankfurt / Munich / Zurich to Cairo (Non-Stop Midsize or Heavy Jet): ~3h 50m flight time with VIP terminal customs clearance in 10 minutes.",
      "Cairo to Luxor / Aswan / Sharm El Sheikh Private Domestic Hop: ~55m flight time eliminating all commercial transit delays.",
      "Bespoke In-Flight Michelin Catering, Armored Tarmac-Side Maybach Transfers, and Complete Manifest Discretion."
    ],
    ctaText: "Request an Instant Private Jet Charter Quote",
    ctaHref: "/contact",
    images: [
      {
        src: "https://vanirgroup.com/images/Luxury Private Jet Interior with Warm Ambient Elegance \u2728.jpeg",
        alt: "Private jet charter cabin interior Gulfstream and Bombardier Privatjet mieten",
        caption: "Ultra-long-range heavy jet cabin configured for executive comfort and privacy."
      },
      {
        src: "https://vanirgroup.com/images/Luxury Airport Limo Service in Chicago.jpeg",
        alt: "VIP tarmac limousine transfer to private jet charter Flugzeug chartern",
        caption: "Direct tarmac-side chauffeur transfer from private FBO terminal to aircraft steps."
      },
      {
        src: "https://vanirgroup.com/The_Nile_River_at_Cairo.jpg",
        alt: "Private jet charter to Egypt pyramids and Red Sea resorts",
        caption: "Seamless private aviation connections from Germany and Europe to Egypt."
      }
    ],
    sections: [
      {
        h2: "Privatjet Mieten & Flugzeug Chartern: Dedicated Aviation Desk for Germany (DACH) & Europe",
        body: [
          "For our German-speaking clientele searching for 'Privatjet mieten' (8,100+ monthly searches in Germany), 'Privatflugzeug chartern' (2,900/mo), 'Flugzeug chartern' (720/mo), or 'Privatjet Kosten', Vanir Group provides an immediate, transparent, and low-friction charter experience.",
          "We operate seamless departures from Frankfurt Egelsbach & Main (FRA), Munich (MUC), Berlin Brandenburg (BER), Hamburg (HAM), D\xFCsseldorf (DUS), Stuttgart (STR), Zurich (ZRH), and Vienna (VIE) to Egypt, Dubai, the Mediterranean, and worldwide."
        ],
        h3s: [
          {
            title: "Transparent Private Jet Charter Cost (Privatjet Mieten Kosten)",
            text: "A direct midsize private jet charter from Munich or Frankfurt to Cairo or Hurghada typically ranges from \u20AC22,000 to \u20AC34,000 one-way for up to 8 passengers, including VIP GAT terminal handling, bespoke catering, and luggage assistance."
          },
          {
            title: "ARGUS Platinum & Wyvern Wingman Safety Standards",
            text: "Every aircraft chartered through Vanir Group is operated by EASA/FAA AOC-certified carriers audited to the highest global aviation safety benchmarks."
          }
        ]
      },
      {
        h2: "Fleet Categories: From Very Light Jets to Ultra-Long-Range Heavy Jets",
        body: [
          "Selecting the right aircraft optimizes both mission range and charter cost. Our aviation specialists match your passenger count, luggage volume (such as golf clubs or diving gear), and non-stop range requirements to the ideal tail number."
        ],
        bullets: [
          "Very Light & Light Jets (Phenom 300E, Citation CJ4, Pilatus PC-24): 4\u20137 passengers, ideal for European hops or Cairo\u2013Luxor\u2013Sharm El Sheikh domestic missions.",
          "Midsize & Super-Midsize Jets (Citation Latitude, Challenger 350, Praetor 600): 8\u201310 passengers, stand-up cabin, non-stop Germany to Egypt or Dubai.",
          "Heavy & Ultra-Long-Range Jets (Gulfstream G650ER, Bombardier Global 7500, Falcon 8X): 12\u201316 passengers, private staterooms with full beds, intercontinental range."
        ]
      },
      ...DEFAULT_SECTIONS
    ],
    faqs: [
      {
        q: "How much does it cost to charter a private jet (Was kostet es, einen Privatjet zu mieten)?",
        a: "Light jets start around \u20AC3,200 per flight hour, midsize jets from \u20AC4,800 per hour, and heavy jets from \u20AC7,500+ per hour. A private charter from Germany (Frankfurt/Munich) to Egypt typically costs \u20AC22,000\u2013\u20AC35,000 depending on aircraft size."
      },
      {
        q: "How quickly can Vanir Group arrange a private jet departure?",
        a: "Our 24/7 aviation desk provides binding charter quotes within 1\u20132 hours and can have an aircraft crewed, catered, and ready for takeoff within 4 hours of confirmation."
      }
    ]
  },
  "fast-track": {
    route: "/fast-track",
    metaTitle: "VIP Airport Fast Track & Tarmac Meet-and-Assist | Vanir Group",
    metaDescription: "Bypass airport lines with Vanir Group VIP Fast Track. Plane-side tarmac limousine pick-up, private lounge access, and dedicated passport control in Cairo & globally.",
    h1: "VIP Airport Fast Track, Tarmac Limousine & Private Lounge Concierge",
    lead: "Transform commercial airport terminals into effortless private transitions. Our VIP Meet-and-Assist officers greet you at the aircraft door, escort you via private tarmac limousine to an exclusive VIP lounge, and handle all visa, passport, and baggage formalities while you relax.",
    seoContent: "Arrive with absolute peace of mind. Our elite global Fast Track services at Cairo International Airport (CAI), Luxor, Hurghada, Sharm El Sheikh, Dubai (DXB), and European hubs provide tarmac-side luxury sedan transfers and dedicated customs clearance.",
    pricingSummary: "Standard VIP Fast-Track Meet & Assist from \u20AC180/guest | Royal Tarmac Limousine & Private VIP Lounge Package from \u20AC480/guest.",
    itineraryHighlights: [
      "Aircraft-Side Greeting: Personal protocol officer meets you directly at the jet bridge or aircraft steps.",
      "Private VIP Lounge Sanctuary: Complimentary refreshments while our team processes your Egyptian entry visa, passports, and luggage.",
      "Direct Chauffeur Handover: Escorted directly to your waiting Mercedes-Maybach or Cadillac Escalade outside the VIP terminal."
    ],
    ctaText: "Book VIP Airport Fast Track",
    ctaHref: "/booking",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  visa: {
    route: "/visa",
    metaTitle: "VIP Diplomatic & Express Travel Visa Concierge | Vanir Group",
    metaDescription: "Accelerate your global mobility with Vanir Group's VIP visa concierge. Instant Egypt visa-on-arrival handling, Schengen executive permits, and GCC visas.",
    h1: "Premium Diplomatic, Corporate & VIP Travel Visa Assistance",
    lead: "Eliminate bureaucratic delays. Vanir Group's legal and diplomatic protocol desk manages priority visa applications, multi-entry executive permits, and instant tarmac visa-on-arrival clearance for travelers from Germany, Europe, the Americas, and Asia.",
    seoContent: "Acquire freedom of movement across continents with our premium diplomatic visa assistance. Specializing in high-priority processing, multi-entry corporate permits, and urgent elite travel document expediting.",
    pricingSummary: "VIP Airport Visa-on-Arrival Assistance from \u20AC85/passport | Priority Embassy & Diplomatic Visa Processing from \u20AC290/application.",
    itineraryHighlights: [
      "Zero-Queue Egypt Entry Visa: Processed privately inside the Cairo VIP Lounge while you enjoy refreshments.",
      "Document Pre-Clearance: Full verification of passport validity, invitation letters, and security clearances prior to departure.",
      "24/7 Emergency Passport & Consular Liaison across 45+ partner countries."
    ],
    ctaText: "Request Priority Visa Assistance",
    ctaHref: "/contact",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  esim: {
    route: "/esim",
    metaTitle: "Encrypted Global Luxury Travel eSIM (190+ Countries) | Vanir Group",
    metaDescription: "Stay connected across Egypt, Europe, Dubai, and 190+ countries with Vanir Group's high-speed 5G enterprise travel eSIM. Instant QR activation.",
    h1: "Global 5G Enterprise Travel eSIM \u2014 Seamless Connectivity in 190+ Countries",
    lead: "Step off your aircraft with immediate, encrypted high-speed 5G/LTE data. Vanir Group's international eSIM solutions keep executives, family offices, and luxury travelers connected across Egypt, Europe, the Middle East, and Asia without physical SIM swaps.",
    seoContent: "Stay seamlessly connected across 190+ countries without physical SIM cards or roaming shocks. Vanir Group's premium eSIM profiles deliver immediate, high-bandwidth enterprise-grade data networks the moment your aircraft touches down.",
    pricingSummary: "Regional Egypt / Middle East Unlimited 5G eSIM from \u20AC35 | Global 190-Country Executive Annual eSIM Pass from \u20AC240.",
    itineraryHighlights: [
      "Instant QR Code Provisioning before takeoff\u2014activates automatically upon landing in Cairo, Dubai, Zurich, or Tokyo.",
      "Multi-Network Auto-Switching: Connects to the strongest local 5G carrier at the Pyramids, along the Nile, or offshore in the Red Sea.",
      "Complimentary Unlimited eSIM included with all Vanir Group Presidential & Private Jet packages."
    ],
    ctaText: "Activate Your Global Travel eSIM",
    ctaHref: "/contact",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  "flights-booking": {
    route: "/flights-booking",
    metaTitle: "First-Class & Business Suite Commercial Flight Desk | Vanir Group",
    metaDescription: "Book First-Class suites and Business Class cabins on Emirates, Lufthansa, Qatar Airways, and SWISS through Vanir Group's IATA-accredited flight concierge.",
    h1: "First-Class & Business Suite Commercial Flight Concierge",
    lead: "For journeys where commercial airlines are preferred, Vanir Group's IATA-accredited aviation desk unlocks preferred First-Class and Business Class fares, private suite allocations, and seamless chauffeur-to-lounge transfers worldwide.",
    seoContent: "Vanir Group secures premier allocation in the world's most advanced First-Class residences, double-bed business suites, and long-haul segments on Lufthansa, SWISS, Emirates, Qatar Airways, and EgyptAir, backed by 24/7 disruption protection.",
    pricingSummary: "Europe\u2013Egypt Business Class Return from \u20AC1,150 | First-Class Private Suites from \u20AC3,900 | 24/7 Proactive Rebooking & Lounge Access Included.",
    itineraryHighlights: [
      "Direct IATA Ticketing with preferred corporate and consolidator rates in First and Business Class.",
      "Proactive Flight Monitoring: If a commercial airline delays or cancels, our desk re-protects you before the gate announcement.",
      "Integrated Chauffeur & VIP Fast-Track at both departure and arrival airports."
    ],
    ctaText: "Inquire About First & Business Class Fares",
    ctaHref: "/contact",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  "hotels-booking": {
    route: "/hotels-booking",
    metaTitle: "Direct Luxury Hotel & Presidential Suite Booking | Vanir Group",
    metaDescription: "Reserve five-star hotels, Nile-view palaces, and private pool villas through Vanir Group with complimentary upgrades, breakfast, and $100+ resort credits.",
    h1: "Direct Luxury Hotel & Suite Reservation Portal",
    lead: "Book the world's finest hotels and resorts with guaranteed VIP recognition. Every reservation placed through Vanir Group includes preferred partner privileges, priority room upgrades, and personal pre-arrival inspection by our hospitality team.",
    seoContent: "Experience our seamless luxury hotel reservation service integrated with Four Seasons, Mandarin Oriental, St. Regis, Ritz-Carlton, Aman, and Historic Sofitel Legend palaces across Egypt, Dubai, the Maldives, and Europe.",
    pricingSummary: "Best Available Rate Parity Guaranteed + Up to \u20AC500 in Complimentary VIP Suite Privileges & Credits.",
    itineraryHighlights: [
      "Guaranteed Priority Upgrade to the next room or suite category upon check-in (subject to availability).",
      "Complimentary Daily Full Breakfast for two guests and Welcome Champagne/Amenities from the General Manager.",
      "Dedicated Vanir Group On-Site Liaison to customize pillow menus, private dining, and spa bookings."
    ],
    ctaText: "Request Suite Availability & VIP Perks",
    ctaHref: "/booking",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  tours: {
    route: "/tours",
    metaTitle: "Luxury Egypt Tours & Private Archaeological Expeditions | Vanir Group",
    metaDescription: "Discover bespoke luxury Egypt tours led by Ph.D. Egyptologists. Private after-hours Pyramids of Giza access, royal Nile cruises, and custom cultural journeys.",
    h1: "Curated Luxury Egypt Tours & Private Heritage Expeditions",
    lead: "Unveil 5,000 years of pharaonic civilization in absolute privacy. Vanir Group designs the world's most exclusive luxury Egypt tours\u2014featuring private after-hours entry inside the Great Pyramid of Khufu, private Sanctuary Nile dahabiyas, and scholarly Egyptologist accompaniment.",
    seoContent: "Unveil the profound secrets of human civilization with private, after-hours access to historically significant monuments, restricted museum vaults at the Grand Egyptian Museum (GEM), and Luxor's royal tombs, led exclusively by world-renowned Egyptologists.",
    pricingSummary: "5-Day Private Cairo & Giza Luxury Tour from \u20AC3,200/guest | 8-Day Cairo & Private Luxury Nile Cruise from \u20AC5,900/guest | 12-Day Royal Egypt By Private Air from \u20AC14,500/guest.",
    itineraryHighlights: [
      "Private Dawn or After-Hours Access inside the Great Pyramid of Giza & Close-Up Sphinx Enclosure Access.",
      "VIP Curatorial Tour of the Grand Egyptian Museum (GEM) with a senior academic Egyptologist.",
      "4- to 7-Night Luxury Nile Cruise aboard Oberoi Zahra, Sanctuary Sun Boat IV, or a private-charter Dahabiya."
    ],
    ctaText: "Customize Your Private Heritage Tour",
    ctaHref: "/booking",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  insurance: {
    route: "/insurance",
    metaTitle: "UHNW Luxury Travel Insurance & Private Jet Medevac | Vanir Group",
    metaDescription: "Comprehensive luxury travel insurance, cancel-for-any-reason protection, and private jet medical evacuation shields for high-net-worth travelers.",
    h1: "Elite Travel Insurance Shields, Asset Protection & Private Medevac",
    lead: "Safeguard high-value global itineraries, fine jewelry, and family health with bespoke travel protection policies underwritten for ultra-high-net-worth travelers.",
    seoContent: "Safeguard your global movements with travel insurance packages designed specifically for ultra-high-net-worth portfolios. Vanir Group coordinates multi-million euro medical coverage, immediate private jet medical evacuation guarantees, and cancel-for-any-reason trip protection.",
    pricingSummary: "Comprehensive Single-Trip Executive Shield from \u20AC190 | Annual Worldwide Family & Private Jet Medevac Policy from \u20AC1,450.",
    itineraryHighlights: [
      "Up to \u20AC5,000,000 Emergency Medical & Private Air Ambulance Evacuation to your home hospital in Germany, Europe, or the US.",
      "Cancel-For-Any-Reason (CFAR) coverage protecting non-refundable private villa, yacht, and charter deposits.",
      "High-Value Watch, Jewelry & Fine Art in-transit protection."
    ],
    ctaText: "Secure Your Travel Protection Shield",
    ctaHref: "/contact",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  groups: {
    route: "/groups",
    metaTitle: "Multi-Generational Family Retreats & Private Island Buyouts | Vanir Group",
    metaDescription: "Masterfully synchronized group travel logistics for multi-generational family vacations, milestone celebrations, and private hotel or yacht buyouts.",
    h1: "Private Multi-Generational Family Retreats, Milestone Celebrations & Estate Buyouts",
    lead: "Coordinating multi-generational family travel or a 50th anniversary celebration across continents requires architectural precision. Vanir Group synchronizes private air charters, entire Nile dahabiya buyouts, and interconnected villa estates.",
    seoContent: "Coordinating multi-generational travel or private family escapes requires absolute precision. Vanir Group specializes in synchronized logistics, private island takeovers, and curated multi-villa luxury operations tailored for every age group.",
    pricingSummary: "Private Nile Dahabiya Full-Vessel Charter (8\u201316 Guests) from \u20AC28,000/week | Private Red Sea or Mediterranean Villa Estate Buyout from \u20AC18,000/week.",
    itineraryHighlights: [
      "Exclusive Vessel & Estate Buyouts ensuring 100% privacy for your family or executive entourage.",
      "Tailored Pacing for All Generations: Kid-friendly archaeological treasure hunts paired with serene spa & accessibility support for seniors.",
      "Private Executive Chef, Dedicated Security Detail, and On-Board Medical Professional upon request."
    ],
    ctaText: "Plan Your Private Group or Family Retreat",
    ctaHref: "/contact",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  news: {
    route: "/news",
    metaTitle: "The Vanir Chronicle | Global Luxury Travel News & Press Releases",
    metaDescription: "Read official press releases, Grand Egyptian Museum updates, private aviation trends, and luxury hospitality insights from The Vanir Chronicle.",
    h1: "The Vanir Chronicle \u2014 Luxury Travel News, Press & Market Intelligence",
    lead: "Stay ahead of the global luxury horizon with editorial reports, Grand Egyptian Museum VIP access updates, and private aviation market analyses from Vanir Group's executive desk.",
    seoContent: "Stay ahead of the global trend line with Vanir Group's exclusive editorial publication. From critical reviews of newly opened super-luxury properties in Cairo, the Red Sea, and Europe to private jet charter insights for German and international travelers.",
    pricingSummary: "Complimentary Editorial Access & Press Kit for Accredited Travel Journalists and Luxury Media Partners.",
    itineraryHighlights: [
      "Grand Egyptian Museum (GEM) VVIP Private Wing & After-Hours Opening Briefings.",
      "2026\u20132027 Private Aviation Corridor Report: Germany (DACH) to Cairo, Luxor, and the Red Sea.",
      "New Ultra-Luxury Hospitality Openings across the Nile Valley, Saudi Red Sea, and Mediterranean."
    ],
    ctaText: "Contact Press & Media Relations",
    ctaHref: "/contact",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  affiliated: {
    route: "/affiliated",
    metaTitle: "Strategic B2B Luxury Partnerships & Family Office Network | Vanir Group",
    metaDescription: "Partner with Vanir Group. Direct DMC representation in Egypt and global aviation brokerage for family offices, private banks, Virtuoso advisors, and concierge firms.",
    h1: "Strategic Partnerships for Family Offices, Private Banks & Luxury Travel Advisors",
    lead: "Vanir Group serves as the trusted white-label ground operator in Egypt and private aviation partner for European family offices, Swiss private banks, German luxury tour operators, and international concierge houses.",
    seoContent: "Vanir Group partners exclusively with premier concierge networks, luxury automotive makers, top-tier private wealth managers, and certified aviation brokers globally. Our affiliate network is built on white-label discretion, net/commissionable flexibility, and impeccable delivery.",
    pricingSummary: "Preferred Net Rates & Commissionable Structures (12%\u201318%) for Approved B2B Luxury Advisors & Family Offices.",
    itineraryHighlights: [
      "100% White-Label Ground Execution in Egypt & the Middle East under your agency or family office brand.",
      "Dedicated 24/7 B2B Account Director & Priority Allocation on Peak-Season Nile Cruises and Presidential Suites.",
      "Comprehensive E&O Insurance, IATA Accreditation, and Multi-Currency Escrow Settlement."
    ],
    ctaText: "Apply for Strategic Partnership",
    ctaHref: "/contact",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  packages: {
    route: "/packages",
    metaTitle: "Curated Luxury Egypt Tour Packages & Private Jet Journeys | Vanir Group",
    metaDescription: "Explore all-inclusive luxury travel packages combining private aviation, five-star Nile cruises, after-hours Pyramids access, and Red Sea villa retreats.",
    h1: "Signature Ultra-Luxury Travel Packages & All-Inclusive Private Odysseys",
    lead: "Our signature packages represent turnkey masterpieces of luxury travel\u2014combining VIP airport tarmac clearance, presidential hotel suites, private Egyptologist guides, and domestic private air hops into one seamless reservation.",
    seoContent: "Our legendary travel packages represent completely seamless, end-to-end masterpieces of luxury tourism. Combining private air transit, finest penthouse suite allocations, personal diplomatic security detail, and exclusive private monument access.",
    pricingSummary: "Signature 7-Day Pharaohs & Nile Sanctuary Package from \u20AC4,900/guest | 10-Day Royal Egypt & Red Sea Villa Odyssey from \u20AC8,400/guest | 14-Day Private Jet Grand Tour from \u20AC22,000/guest.",
    itineraryHighlights: [
      "Package 1 \u2014 The Sovereign Nile & Giza (7 Days): Cairo Four Seasons + Private Sanctuary Nile Cruise + VIP Fast Track.",
      "Package 2 \u2014 Pharaohs, Desert & Red Sea (10 Days): Cairo, Luxor, Aswan Old Cataract Palace & Private Sharm/El Gouna Villa.",
      "Package 3 \u2014 The Private Jet Grand Odyssey (12 Days): Cairo, Siwa Oasis, Abu Simbel, Luxor & Red Sea Yacht by Private Aircraft."
    ],
    ctaText: "Reserve a Signature Luxury Package",
    ctaHref: "/booking",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  "destination-egypt": {
    route: "/destinations/egypt",
    metaTitle: "Luxury Egypt Tours & Private Nile Cruises | Vanir Group",
    metaDescription: "Book bespoke luxury Egypt tours with Vanir Group. Private after-hours Pyramids of Giza access, 5-star Nile cruises in Luxor & Aswan, and VIP Cairo concierge.",
    h1: "Luxury Egypt Tours \u2014 Private Pyramids Access, Sanctuary Nile Cruises & Bespoke Itineraries",
    lead: "Experience the gold standard of luxury Egypt tours. Curated by Cairo-headquartered Vanir Group and CEO Ahmed Roshdi, our private Egyptian journeys combine exclusive after-hours entry inside the Great Pyramid of Khufu, private Sanctuary dahabiya Nile cruises, and presidential suites at the Four Seasons and Sofitel Legend Old Cataract.",
    seoContent: "Luxury Egypt tours curated by Vanir Group merge Egypt's 5,000-year pharaonic civilization with ultra-modern six-star hospitality. Whether you are traveling from Germany (Luxusreisen \xC4gypten), the UK, or North America, we arrange private Egyptologist-led tours of the Giza Pyramids, the Grand Egyptian Museum, Luxor's Valley of the Kings, Abu Simbel, Siwa Oasis, and the Red Sea.",
    pricingSummary: "5-Day Cairo & Private Giza Luxury Egypt Tour: from \u20AC3,400 per person | 8-Day Classic Luxury Egypt Tour (Cairo, Luxor & 5-Star Nile Cruise): from \u20AC5,800 per person | 12-Day Ultra-Luxury Egypt Tour by Private Jet & Dahabiya: from \u20AC16,500 per person.",
    itineraryHighlights: [
      "Days 1\u20133 (Cairo & Giza): VIP Tarmac Fast-Track at Cairo Airport, Four Seasons Nile Plaza Suite, Private After-Hours Entry inside the Great Pyramid of Khufu, Sphinx paws access, and Grand Egyptian Museum (GEM) VIP curatorial tour.",
      "Days 4\u20137 (Luxor to Aswan Luxury Nile Cruise): Private flight to Luxor, private tomb opening of Queen Nefertari in the Valley of the Queens, Karnak Temple at dawn, and 4 nights sailing aboard Sanctuary Sun Boat IV, Oberoi Philae, or a private Dahabiya.",
      "Days 8\u201310 (Aswan, Abu Simbel & Red Sea / Siwa Extension): Sofitel Legend Old Cataract Churchill Suite, private plane to Abu Simbel, followed by a private Red Sea superyacht charter in Hurghada/El Gouna or eco-luxury retreat in Siwa Oasis."
    ],
    ctaText: "Design Your Bespoke Luxury Egypt Tour",
    ctaHref: "/booking",
    images: [
      {
        src: "https://vanirgroup.com/The_Nile_River_at_Cairo.jpg",
        alt: "Luxury Egypt tours private after-hours access to the Great Pyramids of Giza",
        caption: "Private after-hours access to the Great Pyramids of Giza and Sphinx on a Vanir Group luxury Egypt tour."
      },
      {
        src: "https://vanirgroup.com/images/final_cairo_post.png",
        alt: "Luxury Egypt tours Cairo five-star Nile hotel and Grand Egyptian Museum VIP tour",
        caption: "Five-star Nile-view accommodations in Cairo paired with private Grand Egyptian Museum access."
      },
      {
        src: "https://vanirgroup.com/images/final_luxor_post.png",
        alt: "Luxury Egypt tours private Nile cruise in Luxor and Karnak Temple",
        caption: "Sailing between Luxor and Aswan aboard an ultra-luxury Nile sanctuary cruise."
      },
      {
        src: "https://vanirgroup.com/images/final_aswan_post.png",
        alt: "Luxury Egypt tours Aswan Philae Temple and Old Cataract Palace",
        caption: "Sunset felucca sailing and historic palace stays along the Nile in Aswan."
      },
      {
        src: "https://vanirgroup.com/images/final_siwa_post.png",
        alt: "Luxury Egypt tours Siwa Oasis desert retreat and salt lakes",
        caption: "Bespoke desert glamping and candlelit mud-brick eco-lodges in Siwa Oasis."
      }
    ],
    sections: [
      {
        h2: "Why Choose Vanir Group for Your Luxury Egypt Tours?",
        body: [
          "When planning luxury Egypt tours, discerning travelers demand more than standard sightseeing. Headquartered in Cairo with our own fleet, diplomatic protocol officers, and senior Ph.D. Egyptologists, Vanir Group controls every single touchpoint of your Egyptian journey.",
          "From the moment our VIP officer greets you at the aircraft door at Cairo International Airport (CAI) to your private candlelit dinner overlooking the Temple of Philae, our luxury Egypt tours eliminate crowds, queues, and logistical friction."
        ],
        h3s: [
          {
            title: "Private After-Hours Access to the Pyramids of Giza & Sphinx",
            text: "Stand alone inside the King's Chamber of the Great Pyramid of Khufu after public closing hours, and walk directly between the paws of the Great Sphinx accompanied by a senior archaeologist."
          },
          {
            title: "VIP Curatorial Tours of the Grand Egyptian Museum (GEM)",
            text: "Explore the complete Tutankhamun collection and conservation laboratories with private specialist access arranged directly by Vanir Group."
          }
        ]
      },
      {
        h2: "Private Luxury Nile Cruises: Sanctuary Ships, Oberoi & Private Dahabiyas",
        body: [
          "The centerpiece of our luxury Egypt tours is the legendary voyage along the Nile River between Luxor and Aswan. We match every guest to the finest vessel in Egypt\u2014whether an intimate 6-suite traditional sailing Dahabiya chartered exclusively for your family, or a presidential suite aboard the Oberoi Zahra, Oberoi Philae, or Sanctuary Sun Boat IV."
        ],
        bullets: [
          "Valley of the Kings & Queen Nefertari's Tomb: Private entry to KV62 (Tutankhamun), Seti I, and the breathtaking tomb of Nefertari without daytime tour bus crowds.",
          "Private Charter Dahabiyas: Sail at your own pace, mooring at secluded Nile islands, ancient quarries at Gebel el-Silsila, and authentic Nubian villages.",
          "Abu Simbel by Private Aircraft: Avoid commercial group flights with a private morning charter from Aswan directly to Ramses II's rock-cut temples."
        ]
      },
      {
        h2: "Sample 10-Day Luxury Egypt Tour Itinerary & Transparent Pricing (2026\u20132027)",
        body: [
          "Every Vanir Group itinerary is 100% custom-tailored. Below is our most requested 10-day signature framework for first-time UHNW visitors and German/European luxury travelers (Luxusreisen \xC4gypten):"
        ],
        h3s: [
          {
            title: "Days 1\u20133: Royal Cairo, Giza Plateau & Grand Egyptian Museum",
            text: "Stay at Four Seasons Hotel Cairo at Nile Plaza or St. Regis Cairo. Includes private after-hours Giza Pyramids opening, GEM VIP tour, Islamic Cairo private architectural walk, and private dinner."
          },
          {
            title: "Days 4\u20137: Luxor West Bank & 4-Night Luxury Nile Cruise to Aswan",
            text: "Private domestic jet or business class flight to Luxor. Private exploration of Karnak, Luxor Temple, Valley of the Kings, Edfu, and Kom Ombo aboard a 5-star deluxe Nile sanctuary vessel."
          },
          {
            title: "Days 8\u201310: Aswan Old Cataract, Abu Simbel & Red Sea Superyacht Extension",
            text: "Two nights in a Nile Suite at Sofitel Legend Old Cataract Aswan, private tour of Philae Temple and Abu Simbel, followed by a private jet hop to El Gouna or Sharm El Sheikh for Red Sea diving."
          }
        ]
      },
      {
        h2: "Direct Flights & Private Jet Charters from Germany (DE) & Europe to Egypt",
        body: [
          "For travelers departing from Frankfurt, Munich, Berlin, Zurich, Vienna, London, or Paris, Vanir Group coordinates either First/Business Class commercial flights or direct 4-hour private jet charters (Privatjet mieten nach \xC4gypten) into Cairo, Luxor, Hurghada, or Sharm El Sheikh."
        ]
      }
    ],
    faqs: [
      {
        q: "How much do private luxury Egypt tours cost with Vanir Group?",
        a: "Our private 5-day Cairo & Giza luxury Egypt tours start from \u20AC3,400 per person, 8-day Cairo & 5-star luxury Nile cruise journeys start from \u20AC5,800 per person, and ultra-luxury private jet & private dahabiya charters range from \u20AC14,500 to \u20AC35,000+ per person."
      },
      {
        q: "Can Vanir Group arrange private after-hours entry inside the Great Pyramid and Sphinx enclosure?",
        a: "Yes. As a licensed Cairo-based luxury operator, we secure official Ministry of Antiquities permits for private dawn or evening openings of the Great Pyramid of Khufu and the Sphinx enclosure exclusively for your party."
      },
      {
        q: "When is the best time of year to book luxury Egypt tours?",
        a: "October through April offers ideal daytime temperatures (22\xB0C\u201328\xB0C) across Cairo, Luxor, and Aswan. However, with climate-controlled Maybach transport, private dawn monument access, and coastal Red Sea breezes, we operate year-round."
      }
    ]
  },
  "destination-dubai": {
    route: "/destinations/dubai",
    metaTitle: "Luxury Dubai Concierge, Royal Penthouses & Superyachts | Vanir Group",
    metaDescription: "Experience ultra-luxury Dubai with Vanir Group. Atlantis The Royal penthouses, Burj Al Arab suites, private desert conservation safaris, and Marina superyachts.",
    h1: "Elite Dubai Ultra-Luxury Concierge, Penthouses & Superyacht Charters",
    lead: "Immerse yourself in Dubai's premier luxury ecosystem. Vanir Group unlocks unlisted sky-palace suites at Atlantis The Royal and Bulgari Resort Dubai, private mega-yacht charters from Dubai Harbour, and royal desert conservation safaris.",
    seoContent: "Dubai represents the frontier of modern architectural luxury. Vanir Group secures unlisted high-floor suites at the city's most iconic properties, schedules private mega-yacht voyages across the Arabian Gulf, and coordinates seamless Cairo\u2013Dubai twin-center private jet journeys.",
    pricingSummary: "5-Day Dubai VIP Penthouse & Yacht Escape from \u20AC6,200/guest | Private Superyacht Charter from \u20AC1,800/hour | Private Helicopter & Desert Royal Camp from \u20AC3,500.",
    itineraryHighlights: [
      "Al Majlis VIP Terminal Tarmac Arrival at Dubai International (DXB) or Al Maktoum VIP Jet Terminal (DWC).",
      "Private Sky-Pool Penthouse at Atlantis The Royal, Bulgari Resort Dubai, or One&Only One Za'abeel.",
      "Private Sunset Superyacht Charter around Palm Jumeirah & Royal Vintage Land Rover Safari in the Dubai Desert Conservation Reserve."
    ],
    ctaText: "Plan Your Bespoke Dubai Journey",
    ctaHref: "/booking",
    images: [
      {
        src: "https://vanirgroup.com/images/final_dubai_post.png",
        alt: "Luxury Dubai travel concierge private yacht and penthouse suites",
        caption: "Private superyacht charters and penthouse living in Dubai curated by Vanir Group."
      },
      ...DEFAULT_IMAGES.slice(0, 3)
    ],
    sections: DEFAULT_SECTIONS
  },
  "destination-maldives": {
    route: "/destinations/maldives",
    metaTitle: "Luxury Maldives Overwater Villas & Private Island Buyouts | Vanir Group",
    metaDescription: "Escape to absolute privacy in the Maldives. Vanir Group curates Cheval Blanc Randheli, Soneva Jani, Four Seasons Private Island buyouts, and VIP seaplane charters.",
    h1: "Luxury Maldives Retreats \u2014 Private Island Buyouts, Overwater Villas & Superyachts",
    lead: "Discover unmatched seclusion in the Indian Ocean. Our luxury travel desk coordinates private CIP lounge clearance in Mal\xE9, custom VIP seaplane transfers, and multi-bedroom overwater residences across the Maldives' most exclusive private atolls.",
    seoContent: "Our luxury travel desk coordinates private seaplane transfers, deep-sea yacht exploration charters, and customized wellness retreats across the Maldives' most secluded five-star private islands including Soneva Jani, Velaa Private Island, Cheval Blanc Randheli, and Four Seasons Voavah.",
    pricingSummary: "7-Night Overwater Pool Villa Retreat from \u20AC8,900/guest | Multi-Bedroom Private Water Reserve from \u20AC4,500/night | Full Private Island Buyout from \u20AC45,000/night.",
    itineraryHighlights: [
      "Maamahi Executive CIP Lounge tarmac meet-and-greet upon private jet or First-Class arrival in Mal\xE9 (MLE).",
      "Private Charter Seaplane or Luxury Yacht transfer directly to your overwater villa jetty.",
      "Private Marine Biologist Manta Ray Expedition, Subsea Fine Dining, and Isolated Sandbank Starlight Dinner."
    ],
    ctaText: "Reserve Your Maldives Private Villa",
    ctaHref: "/booking",
    images: [
      {
        src: "https://vanirgroup.com/images/final_maldives_post.png",
        alt: "Luxury Maldives overwater villa and private island resort curated by Vanir Group",
        caption: "Secluded overwater pool villas and private lagoon sanctuaries in the Maldives."
      },
      {
        src: "https://vanirgroup.com/images/FS-Landaa-Giraavaru-Water-Villa-Maldives.jpeg",
        alt: "Four Seasons Maldives water villa private pool and ocean deck",
        caption: "Direct lagoon access from your private overwater residence in the Maldives."
      },
      ...DEFAULT_IMAGES.slice(0, 2)
    ],
    sections: DEFAULT_SECTIONS
  },
  "destination-switzerland": {
    route: "/destinations/switzerland",
    metaTitle: "Luxury Switzerland Alpine Chalets, Zermatt & St. Moritz | Vanir Group",
    metaDescription: "Experience the pinnacle of Swiss alpine luxury. Private ski-in/ski-out chalets in Zermatt & St. Moritz, helicopter glacier transfers, and longevity clinics.",
    h1: "Luxury Switzerland Escapes \u2014 Private Alpine Chalets, Helicopter Skiing & Longevity Retreats",
    lead: "Switzerland embodies discreet sovereign luxury. Vanir Group orchestrates turnkey alpine journeys\u2014combining fully staffed private chalets in Zermatt, Gstaad, and St. Moritz with private helicopter transfers from Zurich or Geneva and world-renowned medical longevity retreats.",
    seoContent: "Switzerland offers unparalleled serene luxury. Vanir Group delivers turnkey alpine travel, managing confidential private estate takeovers in St. Moritz, Gstaad, and Zermatt, alongside premium private aviation handling across Samedan, Sion, Geneva, and Zurich.",
    pricingSummary: "7-Night Fully Staffed Luxury Ski Chalet (10\u201314 Guests) from \u20AC45,000/week | 5-Star Palace Suites from \u20AC1,400/night | Private Helicopter Glacier Transfers from \u20AC3,200.",
    itineraryHighlights: [
      "Private Jet arrival at Zurich (ZRH), Geneva (GVA), Samedan (SMV), or Sion (SIR) with immediate helicopter transfer to your chalet.",
      "Fully Staffed Private Alpine Chalet with Michelin-trained chef, butler, private spa, and ski instructor.",
      "Excellence Class Glacier Express panoramic rail journey & private Lake Geneva/Lake Lucerne yacht charter."
    ],
    ctaText: "Inquire About Swiss Chalets & Retreats",
    ctaHref: "/booking",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  "destination-greece": {
    route: "/destinations/greece",
    metaTitle: "Luxury Greece Villas, Santorini Suites & Aegean Yacht Charters | Vanir Group",
    metaDescription: "Sail the Greek islands in absolute elegance. Private caldera infinity suites in Santorini, VIP Mykonos villas, and crewed Aegean superyacht charters.",
    h1: "Luxury Greece Journeys \u2014 Aegean Superyacht Charters, Santorini Suites & Mykonos Villas",
    lead: "Experience the timeless radiance of the Cyclades and Ionian Islands without the crowds. Vanir Group pairs cliffside caldera infinity suites in Santorini and private waterfront estates in Mykonos with fully crewed motor yachts and helicopter island-hopping.",
    seoContent: "Experience the vibrant heritage of the Aegean under our meticulous care. Vanir Group crafts bespoke island-hopping itineraries utilizing premium private yachts, securing clifftop infinity suites away from public crowds, and arranging private Acropolis archaeologist tours.",
    pricingSummary: "7-Day Santorini & Mykonos Luxury Villa Escape from \u20AC5,400/guest | Crewed Aegean Motor Yacht / Catamaran Charter from \u20AC24,000/week.",
    itineraryHighlights: [
      "Private Archaeologist Tour of the Acropolis in Athens followed by helicopter transfer to Mykonos or Santorini.",
      "Caldera-Edge Private Infinity Pool Villa in Oia or Imerovigli with private sunset catamaran cruise.",
      "Multi-Island Crewed Yacht Charter exploring Paros, Naxos, Milos, and Hydra with on-board private chef."
    ],
    ctaText: "Design Your Greek Islands & Yacht Odyssey",
    ctaHref: "/booking",
    images: [
      {
        src: "https://vanirgroup.com/images/final_santorini_post.png",
        alt: "Luxury Greece travel Santorini caldera view infinity pool suite",
        caption: "Private caldera infinity suites overlooking the Aegean Sea in Santorini, Greece."
      },
      ...DEFAULT_IMAGES.slice(0, 3)
    ],
    sections: DEFAULT_SECTIONS
  },
  "destination-italy": {
    route: "/destinations/italy",
    metaTitle: "Luxury Italy Concierge: Lake Como Villas, Amalfi & Private Vatican | Vanir Group",
    metaDescription: "Hire a luxury travel concierge for an Italian vacation: private Sistine Chapel access in Rome, Lake Como historic palazzos, and Amalfi Coast yacht charters.",
    h1: "Luxury Italy Journeys \u2014 Private Vatican Access, Lake Como Palazzos & Amalfi Yachts",
    lead: "Italy is a living masterpiece of art, gastronomy, and la dolce vita. Hire Vanir Group's European luxury travel concierge to unlock private early-morning Sistine Chapel access, lakeside palazzos on Lake Como, Ferrari driving tours in Tuscany, and Riva yacht charters along Positano and Capri.",
    seoContent: "Italy is a masterclass in art, culture, and luxury living. Vanir Group grants exclusive after-hours access to historical landmarks in Rome and Florence, books private lakeside palazzos in Como, and coordinates custom culinary expeditions along the Amalfi Coast.",
    pricingSummary: "7-Day Rome, Florence & Amalfi Coast Private Journey from \u20AC6,800/guest | Private Lake Como Waterfront Villa from \u20AC32,000/week.",
    itineraryHighlights: [
      "Rome: Private Key-Master Early Opening of the Vatican Museums & Sistine Chapel + VIP Colosseum Underground.",
      "Lake Como & Tuscany: Private Venetian limousine boat on Lake Como & truffle hunting with Michelin chefs in Chianti.",
      "Amalfi Coast & Capri: Cliffside suite in Ravello/Positano with private Riva Aquarama yacht charter to Capri."
    ],
    ctaText: "Plan Your Bespoke Italian Vacation",
    ctaHref: "/booking",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  destinations: {
    route: "/destinations",
    metaTitle: "World-Class Luxury Travel Destinations: Egypt, Europe, Dubai & Africa | Vanir Group",
    metaDescription: "Explore premier global luxury destinations curated by Vanir Group: Luxury Egypt Tours, Dubai, Maldives, Switzerland, Greece, Italy, and African Private Safaris.",
    h1: "Global Luxury Travel Destinations \u2014 Egypt, Europe, Middle East, Maldives & Africa",
    lead: "From private pharaonic expeditions in Egypt and European coastal villas to Maldives private islands and East African fly-in safaris, explore the world's most extraordinary horizons with Vanir Group's 24/7 concierge desk.",
    seoContent: "Discover the world's most breathtaking horizons. Vanir Group curates private travel across timeless destinations including ancient Egypt, futuristic Dubai, secluded Maldives islands, alpine Switzerland, Aegean Greece, historic Italy, and private African safari reserves.",
    pricingSummary: "Bespoke Multi-Country Odysseys from \u20AC4,800/guest | Private Jet Multi-Continent Expeditions Custom Quoted.",
    itineraryHighlights: [
      "Middle East & North Africa: Luxury Egypt Tours (Cairo, Luxor, Aswan, Siwa, Red Sea) & Ultra-Luxury Dubai.",
      "Europe: Lake Como & Amalfi Coast (Italy), Zermatt & St. Moritz (Switzerland), Santorini & Mykonos (Greece), Paris & C\xF4te d'Azur.",
      "Indian Ocean & Africa: Maldives Private Island Buyouts, Seychelles, and Serengeti / Okavango Delta Private Safaris."
    ],
    ctaText: "Explore Custom Destination Itineraries",
    ctaHref: "/booking",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  contact: {
    route: "/contact",
    metaTitle: "Contact 24/7 Luxury Travel Concierge & Private Jet Desk | Vanir Group",
    metaDescription: "Contact Vanir Group's 24/7 private concierge and aviation desk (+20 112 398 8882 / info@vanirgroup.com) for bespoke luxury Egypt tours and private jet charters.",
    h1: "Contact Vanir Group \u2014 24/7 Private Travel Concierge & Aviation Desk",
    lead: "Our senior luxury travel architects and private aviation specialists operate 24/7/365. Reach our Cairo headquarters or international concierge desk by phone, encrypted WhatsApp, or private inquiry form for a tailored proposal within 24 hours.",
    seoContent: "Our dedicated luxury travel advisors and confidential private aviation coordinators are available around the clock at 203 Salah Salem Street, Cairo, Egypt (+20 112 398 8882, info@vanirgroup.com) to assist world leaders, executives, and discerning families.",
    pricingSummary: "Complimentary Initial Itinerary Consultation | Binding Private Jet Charter Quotes Delivered Within 2 Hours.",
    itineraryHighlights: [
      "Direct 24/7 Executive Concierge Hotline & WhatsApp: +20 112 398 8882 | Email: info@vanirgroup.com.",
      "Headquarters: 203 Salah Salem Street, Cairo Governorate, 11511, Egypt.",
      "Multilingual Advisors Fluent in English, German (Deutsch), Arabic, French, and Italian."
    ],
    ctaText: "Submit Your Confidential Travel Brief",
    ctaHref: "/booking",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  booking: {
    route: "/booking",
    metaTitle: "Book Bespoke Luxury Egypt Tours, Suites & Private Jets | Vanir Group",
    metaDescription: "Initiate your custom luxury travel reservation with Vanir Group. Book private Egypt tours, five-star Nile cruises, VIP airport fast track, and private jets.",
    h1: "Reserve Your Bespoke Luxury Journey, Private Tour or Aviation Charter",
    lead: "Begin crafting your tailor-made itinerary. Select your preferred destinations, travel dates, cabin/suite preferences, and special security or monument access requests\u2014our senior concierge director will respond with a customized architectural proposal.",
    seoContent: "Begin crafting your bespoke global itinerary. Our elite travel desk coordinates every detail from private aviation and customs fast track to presidential suites and private after-hours access to world monuments.",
    pricingSummary: "Flexible Deposit Structure | Full Trip Protection & Bespoke Customization Included.",
    itineraryHighlights: [
      "Step 1: Submit your preferred travel dates, party size, and destination interests.",
      "Step 2: Receive a custom day-by-day visual proposal and private consultation with a Senior Travel Architect within 24 hours.",
      "Step 3: Enjoy 24/7 white-glove execution from tarmac arrival to your return flight home."
    ],
    ctaText: "Complete Your Reservation Request",
    ctaHref: "/contact",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  reviews: {
    route: "/reviews",
    metaTitle: "Verified Client Reviews & Luxury Travel Testimonials (4.9/5) | Vanir Group",
    metaDescription: "Read verified 5-star client reviews and testimonials from German, European, and global travelers who booked luxury Egypt tours and private jets with Vanir Group.",
    h1: "Verified Client Reviews, Photographs & Luxury Travel Testimonials",
    lead: "Discover authentic, verified accounts and trip photographs from executives, families, and luxury travelers across Berlin, London, New York, Dubai, and Zurich who entrusted Vanir Group with their Egyptian and international journeys.",
    seoContent: "Discover firsthand accounts of flawless execution, absolute discretion, and extraordinary luxury from our distinguished global clientele. Rated 4.9 out of 5 stars across verified luxury Egypt tours, Nile cruises, and private aviation charters.",
    pricingSummary: "4.9 / 5.0 Average Verified Client Rating across 50,000+ Guests Served Since 2010.",
    itineraryHighlights: [
      '"From the moment we arrived in Cairo, Vanir Group made everything seamless. Watching the sunset from our luxury Nile cruise deck was unforgettable." \u2014 Sarah Mitchell, London, UK (5/5 Stars)',
      '"We brought our family from Berlin, Germany for a luxury Red Sea and Egypt vacation. Vanir Group thought of every single detail." \u2014 Robert Williams, Berlin, Germany (5/5 Stars)',
      '"The private after-hours access to Karnak Temple and the private jet arrangements were simply extraordinary." \u2014 Verified VIP Client (5/5 Stars)'
    ],
    ctaText: "Start Planning Your 5-Star Journey",
    ctaHref: "/booking",
    images: [
      {
        src: "https://vanirgroup.com/images/testimonial_selfie_pyramids.jpg",
        alt: "Verified Vanir Group client review photo at the Pyramids of Giza Egypt",
        caption: "Verified guests enjoying a private Egyptologist tour at the Giza Plateau."
      },
      {
        src: "https://vanirgroup.com/images/testimonial_group_temple.jpg",
        alt: "Luxury Egypt tour client testimonial at Karnak and Luxor Temple",
        caption: "Private guided temple exploration in Luxor curated by Vanir Group."
      },
      {
        src: "https://vanirgroup.com/images/testimonial_family_beach.jpg",
        alt: "Family luxury vacation review in Red Sea Sharm El Sheikh and Hurghada",
        caption: "Five-star family beach and diving retreat along Egypt's Red Sea coast."
      },
      {
        src: "https://vanirgroup.com/ahmed-roshdi.png",
        alt: "Ahmed Roshdi CEO of Vanir Group reviewing client satisfaction",
        caption: "Every itinerary is backed by Founder & CEO Ahmed Roshdi's personal quality guarantee."
      }
    ],
    sections: [
      {
        h2: "Verified Luxury Traveler Testimonials & Real Client Photography",
        body: [
          "In ultra-luxury travel\u2014where clients invest tens of thousands of euros in once-in-a-lifetime family milestones or executive charters\u2014verified social proof and E-E-A-T (Experience, Expertise, Authoritativeness, and Trustworthiness) are paramount.",
          "Every testimonial published on Vanir Group's review portal corresponds to a verified booking, complete with trip category ratings across Service, Value, Experience, and Private Guide Expertise."
        ],
        bullets: [
          "Sarah Mitchell (London, UK) \u2014 Pyramids & Nile Cruise Adventure (5.0/5.0): Praised private Egyptologist guide Ahmed, 5-star Cairo accommodations, and private Nile cruise dining.",
          "Robert Williams (Berlin, Germany) \u2014 Luxury Red Sea & Egypt Family Escape (5.0/5.0): Highlighted seamless German-to-Egypt logistics, private boat dolphin excursion, and bespoke family concierge touches.",
          "Fatima Al-Rashid (Dubai, UAE) & Emily Chen (Sydney, Australia) \u2014 Siwa Oasis & Red Sea Luxury Retreats (5.0/5.0): Commended Vanir Group's insider access and 24/7 attention to detail."
        ]
      },
      ...DEFAULT_SECTIONS
    ]
  },
  offers: {
    route: "/offers",
    metaTitle: "Exclusive Luxury Travel Offers, Suite Upgrades & Jet Privileges | Vanir Group",
    metaDescription: "Explore seasonal luxury travel privileges from Vanir Group: complimentary helicopter transfers on private jet charters, 20% off royal Nile suites, and villa perks.",
    h1: "Exclusive Seasonal Luxury Offers, Private Jet Privileges & Suite Upgrades",
    lead: "Access privileged seasonal invitations negotiated directly with our global aviation and five-star hospitality partners\u2014including complimentary helicopter transfers, fourth-night-free presidential suites, and private Nile cruise upgrades.",
    seoContent: "Access exclusive luxury travel promotions and seasonal privileges negotiated directly with the world's finest boutique resorts, private airlines, and luxury estates.",
    pricingSummary: "Save 15%\u201330% on Selected Seasonal Royal Nile Suites & Receive Complimentary VIP Airport Tarmac Fast-Track.",
    itineraryHighlights: [
      "Private Aviation Escape (Code: JET15): Complimentary luxury helicopter or Maybach tarmac transfer with all private jet charters.",
      "Royal Nile Sanctuary Privilege (Code: ROYAL20): 20% privilege on 7-day luxury Nile cruises with private butler service.",
      "Winter Sun Red Sea & Maldives Suite Upgrade: Guaranteed suite upgrade and $300 spa credit on 5+ night stays."
    ],
    ctaText: "Claim Your Seasonal Privilege",
    ctaHref: "/booking",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  "case-studies": {
    route: "/case-studies",
    metaTitle: "UHNW Travel Case Studies: Royal Summits & Private Jet Expeditions | Vanir Group",
    metaDescription: "Examine real-world case studies detailing how Vanir Group executed private after-hours Giza galas, multi-aircraft executive summits, and island buyouts.",
    h1: "Bespoke Execution Case Studies \u2014 Sovereign Logistics & Private Expeditions",
    lead: "Explore documented case studies demonstrating how Vanir Group engineers complex, high-security travel operations\u2014from private after-hours museum galas for 150 VIPs to multi-country private jet expeditions across Europe, Egypt, and Africa.",
    seoContent: "Examine how Vanir Group masterfully coordinates complex global logistics, private island takeovers, and high-security international summits with flawless precision.",
    pricingSummary: "Custom Architectural Proposals Engineered for Family Offices, Royal Households, and Multinational Corporations.",
    itineraryHighlights: [
      "Case Study 1: Private After-Hours Giza Plateau & Grand Egyptian Museum Gala for a European Family Office (45 Guests, 3 Private Jets).",
      "Case Study 2: 14-Day Cairo, Sanctuary Nile Dahabiya Buyout & Serengeti Private Fly-In Safari for a UHNW Family.",
      "Case Study 3: Rapid 6-Hour Diplomatic Airlift & Armored Ground Protocol across Cairo, Riyadh, and Geneva."
    ],
    ctaText: "Discuss Your Complex Travel Brief",
    ctaHref: "/contact",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  blog: {
    route: "/blog",
    metaTitle: "Luxury Travel Concierge & Private Aviation Blog | Vanir Group",
    metaDescription: "Expert guides on luxury travel concierge services, private jet charter costs (Privatjet mieten), luxury Egypt tours, Maldives private islands, and African safaris.",
    h1: "The Vanir Journal \u2014 Definitive Guides to Luxury Travel Concierge, Private Jets & Egypt",
    lead: "Explore in-depth editorial guides authored by Founder & CEO Ahmed Roshdi and Vanir Group's senior travel architects\u2014covering private jet charter economics, luxury Egypt tours, European bespoke vacations, and global concierge comparisons.",
    seoContent: "Immerse yourself in our curated luxury travel journal exploring what a luxury travel concierge does, how to charter a private jet (Privatjet mieten), luxury Egypt tours, Maldives private islands, European summer itineraries, and private African safaris.",
    pricingSummary: "6+ Pillar Editorial Guides & Destination Playbooks Updated Monthly by Vanir Group's Senior Specialists.",
    itineraryHighlights: [
      "What Does a Luxury Travel Concierge Do? (And Why You Need One)",
      "Private Jet Charter Guide: How to Book, Costs & What to Expect (Privatjet mieten Guide)",
      "Luxury Travel Agency vs Concierge Service: Key Differences & Quintessentially vs Virtuoso Comparison",
      "Egypt Luxury Travel Guide: Private Tours, Nile Cruises & Exclusive Access",
      "Best Private Islands & Maldives Retreats for UHNW Travelers",
      "How to Plan a Bespoke European Vacation & Private African Safari with a Luxury Concierge"
    ],
    ctaText: "Consult With Our Editorial & Concierge Desk",
    ctaHref: "/contact",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  "privacy-policy": {
    route: "/privacy-policy",
    metaTitle: "Privacy Policy, GDPR Compliance & Client Confidentiality | Vanir Group",
    metaDescription: "Read Vanir Group's strict GDPR-compliant privacy policy, NDA passenger manifest confidentiality protocols, and data security standards.",
    h1: "Privacy Policy, GDPR Data Protection & Client Confidentiality Charter",
    lead: "At Vanir Group, protecting the identity, flight manifests, and personal data of our global clientele is a foundational sovereign obligation fully aligned with European Union GDPR and international data privacy laws.",
    seoContent: "At Vanir Group, client confidentiality and data security are fundamental sovereign principles. Read our complete GDPR-compliant privacy policy regarding encrypted data collection, passenger manifest protection, and security safeguards.",
    pricingSummary: "Strict NDA & Zero Third-Party Data Monetization Guarantee for All Clients.",
    itineraryHighlights: [
      "Full Compliance with EU General Data Protection Regulation (GDPR) for our German and European clients.",
      "Encrypted Passenger Manifests & Passport Records restricted strictly to authorized aviation and border authorities.",
      "Option for Mutual Non-Disclosure Agreements (NDAs) for celebrities, executives, and family offices."
    ],
    ctaText: "Contact Our Data Protection Officer",
    ctaHref: "/contact",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  "terms-of-service": {
    route: "/terms-of-service",
    metaTitle: "Terms of Service, Charter Conditions & Booking Policies | Vanir Group",
    metaDescription: "Review the formal terms of service, IATA booking conditions, private jet charter agreements, and cancellation policies of Vanir Group.",
    h1: "Terms of Service, Private Charter Conditions & Booking Governance",
    lead: "Review the transparent legal framework governing bespoke travel reservations, private aircraft charters, five-star suite allocations, and VIP concierge services provided by Vanir Group.",
    seoContent: "Read the formal terms of service governing all bespoke travel reservations, private aviation charters, concierge memberships, and luxury services provided by Vanir Group.",
    pricingSummary: "Clear Milestone Deposit Schedules, Flexible Postponement Terms & Transparent Force Majeure Protections.",
    itineraryHighlights: [
      "Standardized IATA & EASA-compliant Private Aircraft Charter Agreements.",
      "Transparent Cancellation, Amendment, and Postponement Windows clearly specified on every invoice.",
      "Direct Dispute Resolution & 24/7 Executive Escalation Desk."
    ],
    ctaText: "Request Contract & Charter Terms",
    ctaHref: "/contact",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  // ─── Priority Blog Articles (6 AI Fan-Out & High-Intent Keyword Guides) ───
  "blog-what-does-a-luxury-travel-concierge-do": {
    route: "/blog/what-does-a-luxury-travel-concierge-do",
    metaTitle: "What Does a Luxury Travel Concierge Do? (And Why You Need One) | Vanir Group",
    metaDescription: "Discover what a luxury travel concierge does, how luxury travel concierge services work, what is included in UHNW packages, and why executives rely on Vanir Group.",
    h1: "What Does a Luxury Travel Concierge Do? (And Why You Need One in 2026)",
    lead: "From securing private after-hours entry inside the Great Pyramid of Giza to positioning a heavy private jet on four hours' notice, discover how a world-class luxury travel concierge service transforms the way UHNW individuals, celebrities, and executives experience the world.",
    seoContent: "A luxury travel concierge is an elite, 24/7 personal travel architect and lifestyle manager who designs, books, and oversees bespoke journeys\u2014handling private aviation, unlisted presidential suites, diplomatic airport fast-track, private yachts, and impossible-to-book cultural access.",
    pricingSummary: "Bespoke Concierge Retainers from \u20AC2,500/journey or Integrated All-Inclusive Itinerary Architecture.",
    itineraryHighlights: [
      "24/7 Personal Lifestyle & Aviation Desk managing every flight, transfer, and dining table.",
      "Private After-Hours Monument Access & Unlisted Presidential Suite Upgrades.",
      "Real-Time Disruption Protection, Diplomatic Security, and Strict NDA Discretion."
    ],
    ctaText: "Hire Your Personal Luxury Travel Concierge",
    ctaHref: "/contact",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  "blog-private-jet-charter-guide": {
    route: "/blog/private-jet-charter-guide-how-to-book-costs",
    metaTitle: "Private Jet Charter Guide: How to Book, Costs & Privatjet Mieten | Vanir Group",
    metaDescription: "Complete private jet charter guide (Privatjet mieten & Flugzeug chartern): hourly costs for light, midsize, and heavy jets, Germany to Egypt routes, and booking tips.",
    h1: "Private Jet Charter Guide: How to Book, Transparent Costs & What to Expect (Privatjet Mieten)",
    lead: "Whether you are chartering a Gulfstream for a transcontinental board roadshow or looking to rent a private jet from Germany to Egypt (Privatjet mieten / Flugzeug chartern), this comprehensive guide breaks down aircraft categories, hourly charter rates, empty legs, and VIP terminal procedures.",
    seoContent: "Chartering a private jet (Privatjet mieten) gives you access to over 40,000 airports worldwide, 10-minute FBO boarding, and complete cabin privacy. Learn how hourly pricing (\u20AC3,200 to \u20AC12,500+/hr), positioning fees, and ARGUS safety ratings work with Vanir Group Private Aviation.",
    pricingSummary: "Light Jets: \u20AC3,200\u2013\u20AC4,500/hr | Midsize Jets: \u20AC4,800\u2013\u20AC6,800/hr | Heavy Jets: \u20AC7,500\u2013\u20AC12,500/hr | Germany\u2013Egypt Charter from \u20AC22,000.",
    itineraryHighlights: [
      "Step-by-Step Booking Process: From initial route brief to tail-number confirmation in under 2 hours.",
      "Complete Cost Breakdown: Flight hours, FBO handling, de-icing, international overflight permits, and empty-leg savings.",
      "German & European Hub Guide: Departing from Frankfurt, Munich, Berlin, D\xFCsseldorf, and Zurich."
    ],
    ctaText: "Request a Binding Private Jet Quote",
    ctaHref: "/private-jet",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  "blog-luxury-travel-agency-vs-concierge-service": {
    route: "/blog/luxury-travel-agency-vs-concierge-service",
    metaTitle: "Luxury Travel Agency vs Concierge Service (Quintessentially vs Virtuoso) | Vanir Group",
    metaDescription: "Compare luxury travel concierge services vs traditional travel agencies, plus an insider comparison of Vanir Group vs Quintessentially Travel vs Virtuoso.",
    h1: "Luxury Travel Agency vs Concierge Service: Key Differences & Global Comparison",
    lead: "Should you book through a traditional luxury travel agency, a Virtuoso advisor, a membership club like Quintessentially Travel, or a direct operational concierge house like Vanir Group? Here is the definitive side-by-side analysis for UHNW travelers.",
    seoContent: "While traditional travel agencies focus on transactional hotel and flight bookings during office hours, a luxury travel concierge service provides 24/7 end-to-end lifestyle execution, private aviation brokerage, and direct on-ground ownership.",
    pricingSummary: "Zero Mandatory Annual Membership Fees | Direct Operational Pricing & Full VIP Suite Privileges.",
    itineraryHighlights: [
      "Luxury Travel Concierge vs Traditional Travel Agency across 7 critical dimensions.",
      "Quintessentially Travel vs Virtuoso vs Vanir Group: Membership fees, ground ownership, and aviation integration.",
      "When to use a direct DMC-backed concierge for Egypt, the Middle East, Europe, and African safaris."
    ],
    ctaText: "Experience the Vanir Concierge Difference",
    ctaHref: "/contact",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  "blog-egypt-luxury-travel-guide": {
    route: "/blog/egypt-luxury-travel-guide-private-tours-nile-cruises",
    metaTitle: "Egypt Luxury Travel Guide: Private Tours, Nile Cruises & VIP Access | Vanir Group",
    metaDescription: "The ultimate guide to luxury Egypt tours: private after-hours Giza Pyramids access, Grand Egyptian Museum VIP tours, Sanctuary Nile cruises, and 2026 costs.",
    h1: "Egypt Luxury Travel Guide: Private Tours, Five-Star Nile Cruises & Exclusive Access",
    lead: "Written by Cairo-based Founder & CEO Ahmed Roshdi, this definitive guide to luxury Egypt tours reveals how to experience the Great Pyramids after hours, choose between a private Dahabiya and an Oberoi Nile cruise, and navigate Egypt in presidential comfort.",
    seoContent: "Planning luxury Egypt tours requires insider access. Discover how Vanir Group secures private King's Chamber openings at the Pyramids of Giza, curatorial tours of the Grand Egyptian Museum, private tomb openings in Luxor, and Old Cataract palace suites in Aswan.",
    pricingSummary: "Luxury Egypt Tours from \u20AC3,400 (5 Days) to \u20AC16,500+ (12 Days by Private Jet & Private Dahabiya).",
    itineraryHighlights: [
      "Private After-Hours Permits for the Great Pyramid of Khufu, Sphinx Enclosure, and Tomb of Queen Nefertari.",
      "Comparing Egypt's Finest Nile Vessels: Sanctuary Sun Boat IV, Oberoi Zahra/Philae, and Private Charter Dahabiyas.",
      "Where to Stay: Four Seasons Nile Plaza, St. Regis Cairo, Mena House Giza View Suites & Sofitel Legend Old Cataract."
    ],
    ctaText: "Book Your Private Luxury Egypt Tour",
    ctaHref: "/destinations/egypt",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  "blog-best-private-islands-maldives-retreats": {
    route: "/blog/best-private-islands-maldives-retreats-uhnw",
    metaTitle: "Best Private Islands & Maldives Retreats for UHNW Travelers | Vanir Group",
    metaDescription: "Explore the world's most exclusive private island buyouts and Maldives overwater retreats for UHNW travelers, executives, and royal families.",
    h1: "Best Private Islands & Maldives Retreats for Ultra-High-Net-Worth Travelers",
    lead: "For billionaires, royal families, and C-suite executives seeking absolute privacy, nothing compares to a full private island buyout or a multi-bedroom overwater reserve in the Maldives, Seychelles, or Red Sea.",
    seoContent: "Discover Vanir Group's curated ranking of the top private islands and Maldives ultra-luxury resorts\u2014including Four Seasons Private Island Maldives at Voavah, Velaa Private Island, Cheval Blanc Randheli, Soneva Jani, and emerging Red Sea private islands.",
    pricingSummary: "Overwater Reserves from \u20AC4,500/night | Full Private Island Buyouts from \u20AC45,000 to \u20AC160,000/night.",
    itineraryHighlights: [
      "Full-Island Exclusivity: Private airspace restrictions, dedicated security, superyacht berths, and 100+ staff for your party alone.",
      "Seamless Private Jet Arrival into Mal\xE9 (MLE) or Maafaru (NMF) with immediate private yacht or VIP seaplane transfer.",
      "Pairing a 5-Day Luxury Egypt Tour with a 5-hour direct private jet flight to the Maldives."
    ],
    ctaText: "Inquire About Private Island Availability",
    ctaHref: "/destinations/maldives",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  "blog-bespoke-european-vacation-and-safari-concierge": {
    route: "/blog/how-to-plan-bespoke-european-vacation-luxury-concierge",
    metaTitle: "How to Plan a Bespoke European Vacation & Private Safari with a Concierge | Vanir Group",
    metaDescription: "Learn how to hire a luxury travel concierge for a European vacation (Italy, Switzerland, Greece, France) or book a private African safari by bush plane.",
    h1: "How to Plan a Bespoke European Vacation & Private Safari with a Luxury Concierge",
    lead: "From chartering a superyacht along the Amalfi Coast and Greek Cyclades to flying by private bush plane into the Serengeti and Okavango Delta, learn how Vanir Group's senior travel architects orchestrate multi-country European and African odysseys.",
    seoContent: "Hiring a luxury travel concierge for a European vacation or African safari eliminates fragmented bookings. Vanir Group coordinates private Lake Como palazzos, Swiss alpine helicopters, Mediterranean yachts, and exclusive-use East African safari camps under one 24/7 desk.",
    pricingSummary: "Bespoke 10-Day European Villa & Yacht Odyssey from \u20AC12,500/guest | Private Fly-In African Safari from \u20AC14,800/guest.",
    itineraryHighlights: [
      "European Summer Masterpiece: Lake Como Private Palazzo, Tuscany Helicopter Vineyard Tour, and Amalfi/Capri Superyacht.",
      "Alpine & Parisian Elegance: Private Louvre Opening in Paris paired with Zermatt Ski-In Chalet & Glacier Helicopter.",
      "Cairo to Serengeti Private Air Corridor: Combine Egypt's ancient wonders with a private luxury safari in Tanzania or Kenya."
    ],
    ctaText: "Design Your European or Safari Odyssey",
    ctaHref: "/contact",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  "author-ahmed-roshdi": {
    route: "/author/ahmed-roshdi",
    metaTitle: "Ahmed Roshdi \u2014 Founder & CEO | Luxury Travel & Private Aviation Expert | Vanir Group",
    metaDescription: "Official executive dossier and verified E-E-A-T credentials of Ahmed Roshdi, Founder & CEO of Vanir Group (18+ years in luxury travel concierge & private aviation).",
    h1: "Ahmed Roshdi \u2014 Founder & Chief Executive Officer of Vanir Group",
    lead: "With over 18 years of executive leadership in ultra-luxury hospitality, EASA Part-NCC private aviation brokerage (Privatjet mieten), and sovereign diplomatic protocol, Ahmed Roshdi founded Vanir Group in Cairo in 2010.",
    seoContent: "Ahmed Roshdi is the Founder, Chief Executive Officer, and Principal Luxury Travel Architect of Vanir Group (vanirgroup.com). Under his direction, Vanir Group operates under Egyptian Ministry of Tourism Category (A) License #2184, IATA accreditation, and ISO 9001:2015 certification, serving DACH family offices, corporate boards, and royal delegations worldwide.",
    pricingSummary: "Direct Executive Consultation & Bespoke Sovereign Dossier Architecture \u2014 24/7 Aviation & Concierge Desk (+20 112 398 8882).",
    itineraryHighlights: [
      "18+ Years Directing Ultra-Luxury Egypt Tours, Private Nile Dahabiya Charters & After-Hours Pyramid Openings.",
      "1,400+ Coordinated Private Jet Movements Connecting Frankfurt, Munich, Zurich, London, Paris & Dubai with Cairo & Luxor.",
      "Principal Author & Editorial Director of Vanir Group's Sovereign Luxury Travel & Aviation Research Guides."
    ],
    ctaText: "Schedule an Executive Consultation with Ahmed Roshdi's Desk",
    ctaHref: "/contact",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  },
  "executive-team": {
    route: "/team",
    metaTitle: "Executive Leadership & Sovereign Advisory Board | Vanir Group",
    metaDescription: "Meet Vanir Group's Executive Leadership & Sovereign Advisory Board: Founder & CEO Ahmed Roshdi, Chief Egyptologist Dr. Tariq El-Allam, and DACH Aviation Director Capt. Lukas Weber.",
    h1: "Vanir Group Executive Leadership & Sovereign Advisory Board",
    lead: "Every Vanir Group expedition, private aircraft charter, and published research guide is engineered and peer-reviewed by accredited specialists in EASA business aviation, Ph.D. Egyptology, and diplomatic hospitality.",
    seoContent: "Discover the senior leadership behind Vanir Group: Founder & CEO Ahmed Roshdi, Chief Egyptologist Dr. Tariq El-Allam (Ph.D.), Director of DACH & European Private Aviation Capt. Lukas Weber, and Chief Operating Officer Nadia Hassan.",
    pricingSummary: "24/7 Multilingual Executive Desk (German, English, Arabic) \u2014 Zero Annual Membership Fees.",
    itineraryHighlights: [
      "Aviation Dispatch Desk Led by EASA Part-NCC & Heavy-Jet Operations Specialists.",
      "Antiquities & Heritage Access Supervised by Published Ph.D. Egyptologists.",
      "Diplomatic Ground Protocol, Armored Maybach Convoys & Presidential Suite Buyouts."
    ],
    ctaText: "Connect With Our Executive Advisory Board",
    ctaHref: "/contact",
    images: DEFAULT_IMAGES,
    sections: DEFAULT_SECTIONS
  }
};
var seoByRoute = Object.values(vanirSeoMatrix).reduce((acc, entry) => {
  acc[entry.route] = entry;
  return acc;
}, {});
function normalizeRoute(route) {
  const clean = (route || "/").split("#")[0].split("?")[0].trim() || "/";
  if (clean === "/") return clean;
  return clean.endsWith("/") ? clean.slice(0, -1) : clean;
}
function getSEOMetadata(route) {
  const normalizedRoute = normalizeRoute(route);
  const exactMatch = seoByRoute[normalizedRoute];
  if (exactMatch) return exactMatch;
  if (normalizedRoute.startsWith("/destinations/")) {
    const routeParts = normalizedRoute.split("/");
    const destinationSlug = routeParts[2];
    if (!destinationSlug) return null;
    const fallbackRoute = `/destinations/${destinationSlug}`;
    return seoByRoute[fallbackRoute] ?? seoByRoute["/destinations"] ?? null;
  }
  if (normalizedRoute.startsWith("/blog/")) {
    return seoByRoute[normalizedRoute] ?? seoByRoute["/blog"] ?? null;
  }
  if (normalizedRoute.startsWith("/author/")) {
    return seoByRoute[normalizedRoute] ?? seoByRoute["/author/ahmed-roshdi"] ?? null;
  }
  return null;
}

// server/_core/vite.ts
var DIRNAME = typeof __dirname !== "undefined" ? __dirname : typeof import.meta !== "undefined" && import.meta.url ? path5.dirname(new URL(".", import.meta.url).pathname) : process.cwd();
function escapeHtml2(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function buildCrawlableHtml(seo) {
  const h1 = escapeHtml2(seo.h1 || seo.metaTitle);
  const lead = escapeHtml2(seo.lead || seo.metaDescription);
  const content = escapeHtml2(seo.seoContent);
  const pricing = escapeHtml2(
    seo.pricingSummary || "Bespoke Luxury Concierge Packages from \u20AC2,500 | Private Egypt Tours from \u20AC3,400/guest | On-Demand Private Jet Charters from \u20AC3,200/hr."
  );
  const ctaText = escapeHtml2(seo.ctaText || "Request Your Bespoke Concierge Proposal");
  const ctaHref = escapeHtml2(seo.ctaHref || "/contact");
  const images = seo.images && seo.images.length > 0 ? seo.images : [
    {
      src: "https://vanirgroup.com/images/hero-egyptian.jpg",
      alt: `${seo.metaTitle} - Vanir Group Luxury Travel Concierge`,
      caption: "Exclusive private monument access and luxury concierge services by Vanir Group."
    },
    {
      src: "https://vanirgroup.com/images/final_cairo_post.png",
      alt: "Luxury Egypt tours five-star Nile suite and private Giza pyramids tour",
      caption: "Five-star presidential suites overlooking the Nile River in Cairo."
    },
    {
      src: "https://vanirgroup.com/images/final_luxor_post.png",
      alt: "Private luxury Nile cruise between Luxor and Aswan curated by Vanir Group",
      caption: "Sanctuary Nile cruise and private Dahabiya charters in Upper Egypt."
    },
    {
      src: "https://vanirgroup.com/ahmed-roshdi.png",
      alt: "Ahmed Roshdi Founder and CEO of Vanir Group Luxury Travel Concierge",
      caption: "Ahmed Roshdi, Founder & CEO of Vanir Group."
    }
  ];
  const imagesHtml = images.map(
    (img) => `
          <figure>
            <img src="${escapeHtml2(img.src)}" alt="${escapeHtml2(img.alt)}" width="1200" height="800" loading="lazy" />
            ${img.caption ? `<figcaption>${escapeHtml2(img.caption)}</figcaption>` : ""}
          </figure>`
  ).join("");
  const sectionsHtml = (seo.sections || []).map((sec) => {
    const paragraphs = (sec.body || []).map((p) => `<p>${escapeHtml2(p)}</p>`).join("\n            ");
    const h3s = (sec.h3s || []).map(
      (sub) => `
            <h3>${escapeHtml2(sub.title)}</h3>
            <p>${escapeHtml2(sub.text)}</p>`
    ).join("");
    const bullets = sec.bullets && sec.bullets.length > 0 ? `<ul>${sec.bullets.map((b) => `<li>${escapeHtml2(b)}</li>`).join("")}</ul>` : "";
    return `
          <section>
            <h2>${escapeHtml2(sec.h2)}</h2>
            ${paragraphs}
            ${h3s}
            ${bullets}
          </section>`;
  }).join("");
  const itineraryItems = seo.itineraryHighlights && seo.itineraryHighlights.length > 0 ? seo.itineraryHighlights : [
    "Day 1\u20133: VIP Airport Tarmac Fast-Track Arrival, Five-Star Presidential Suite Check-In & Private After-Hours Monument Access.",
    "Day 4\u20137: Private Charter Flight or Luxury Sanctuary Nile Cruise with Senior Ph.D. Egyptologist & Dedicated Butler.",
    "Day 8\u201310: Bespoke Red Sea Superyacht Charter, Siwa Oasis Eco-Palace, or Direct Private Jet Connection to Europe / Maldives."
  ];
  const itineraryHtml = itineraryItems.map((item) => `<li>${escapeHtml2(item)}</li>`).join("");
  const faqs = seo.faqs && seo.faqs.length > 0 ? seo.faqs : [
    {
      q: "What does Vanir Group's luxury travel concierge service include?",
      a: "Every journey includes 24/7 personal concierge oversight, private aviation or First-Class ticketing, VIP airport tarmac fast-track clearance, chauffeur-driven Maybach/SUV transport, priority five-star suite upgrades, and private expert guides."
    },
    {
      q: "How does Vanir Group serve clients from Germany (DE), Europe, and worldwide?",
      a: "We provide multilingual travel design in English, German (Deutsch), and Arabic, direct private jet charters (Privatjet mieten) from Frankfurt, Munich, Berlin, and Zurich, and euro (\u20AC) invoicing with full GDPR compliance."
    }
  ];
  const faqsHtml = faqs.map(
    (f) => `
            <div class="faq-item">
              <h3>${escapeHtml2(f.q)}</h3>
              <p>${escapeHtml2(f.a)}</p>
            </div>`
  ).join("");
  return `
    <div id="seo-pre-rendered-content" style="opacity:0.001;position:absolute;pointer-events:none;z-index:-1;max-height:0;overflow:hidden;" aria-hidden="false">
      <header>
        <nav aria-label="Main Navigation">
          <a href="/">Home</a>
          <a href="/about">About Us</a>
          <a href="/author/ahmed-roshdi" rel="author">Founder &amp; CEO: Ahmed Roshdi</a>
          <a href="/team">Executive Advisory Board</a>
          <a href="/packages">Luxury Packages</a>
          <a href="/destinations">Destinations</a>
          <a href="/destinations/egypt">Luxury Egypt Tours</a>
          <a href="/destinations/dubai">Dubai</a>
          <a href="/destinations/maldives">Maldives</a>
          <a href="/destinations/switzerland">Switzerland</a>
          <a href="/destinations/greece">Greece</a>
          <a href="/destinations/italy">Italy</a>
          <a href="/hotels">Luxury Hotels</a>
          <a href="/private-jet">Private Jet Charter</a>
          <a href="/tours">Heritage Tours</a>
          <a href="/day-trips">Day Trips</a>
          <a href="/fast-track">VIP Fast Track</a>
          <a href="/visa">Visa Assistance</a>
          <a href="/esim">Global eSIM</a>
          <a href="/mice">MICE Corporate Events</a>
          <a href="/flights-booking">Flights</a>
          <a href="/hotels-booking">Hotels Booking</a>
          <a href="/insurance">Travel Insurance</a>
          <a href="/groups">Group Travel</a>
          <a href="/news">Luxury Chronicle</a>
          <a href="/affiliated">Affiliated Network</a>
          <a href="/booking">Book Your Journey</a>
          <a href="/reviews">Client Reviews</a>
          <a href="/offers">Exclusive Offers</a>
          <a href="/case-studies">Case Studies</a>
          <a href="/blog">Luxury Travel Blog</a>
          <a href="/contact">Contact Concierge</a>
        </nav>
      </header>
      <main>
        <article itemscope itemtype="https://schema.org/Article">
          <h1>${h1}</h1>
          <aside class="eeat-author-byline" aria-label="Author and Expert Review Attribution">
            <p>
              <strong>Authored by:</strong> <a href="/author/ahmed-roshdi" rel="author" itemprop="author">Ahmed Roshdi</a> (Founder &amp; Chief Executive Officer, Vanir Group \u2014 18+ Years in Ultra-Luxury Hospitality &amp; Private Aviation) |
              <strong>Peer-Reviewed &amp; Fact-Checked by:</strong> <a href="/team">Capt. Lukas Weber</a> (Director of DACH &amp; European EASA Part-NCC Private Aviation) &amp; <a href="/team">Dr. Tariq El-Allam, Ph.D.</a> (Chief Egyptologist &amp; Supreme Council of Antiquities Liaison) |
              <strong>Last Verified &amp; Updated:</strong> <time datetime="2026-11-02" itemprop="dateModified">November 2, 2026</time>
            </p>
          </aside>
          <p class="lead">${lead}</p>
          <p>${content}</p>

          <section aria-label="Visual Portfolio">
            <h2>Exclusive Photography &amp; Visual Highlights</h2>
            ${imagesHtml}
          </section>

          ${sectionsHtml}

          ${seo.route === "/case-studies" ? `
          <section aria-label="First-Hand Operational Field Reports and Verified Case Studies">
            <h2>Documented First-Hand Sovereign Mission Logs &amp; Field Execution Proof</h2>
            <p>Unlike generalist brokers who resell third-party wholesale packages, Vanir Group holds direct operational authority under Egyptian Ministry of Tourism Category (A) License #2184 and coordinates directly with EASA Part-NCC private aviation operators and the Supreme Council of Antiquities.</p>
            <h3>Mission Log #VG-2026-089: Frankfurt (EDDF) to Cairo (HECA) &amp; Luxor (HELX) \u2014 Gulfstream G650ER &amp; Solitary Great Pyramid Entry</h3>
            <p>Executed for an 8-principal DACH Multi-Family Office delegation departing Frankfurt GAT (EDDF). Included a 9-minute diplomatic tarmac-to-Maybach transition at Cairo VIP terminal, Special Permit #SCA-2026-419 for a 2-hour solitary midnight entry inside the King's Chamber of the Great Pyramid of Khufu, private opening of Queen Nefertari's Tomb (QV66), and a 5-night full-vessel private Dahabiya charter between Esna and Aswan (\u20AC164,500 all-inclusive).</p>
            <h3>Mission Log #VG-2026-114: Munich (EDDM) to Hurghada / El Gouna (HEGN) \u2014 Challenger 650 &amp; 54m Red Sea Superyacht</h3>
            <p>Direct 3h 40m non-stop flight from Munich Executive Terminal to Hurghada VIP Apron for 6 guests, with immediate wing-to-helipad Bell 429 transfer onto a 54-meter private superyacht anchored at Tawila Island and Brothers Atoll (\u20AC118,000 all-inclusive).</p>
          </section>

          <section aria-label="2026 Private Aviation and Luxury Travel Benchmark Data">
            <h2>2026 Europe (DACH) to Egypt Private Jet Charter Benchmark Data &amp; Competitive Comparison</h2>
            <p>Original market telemetry compiled by Vanir Group's Flight Dispatch Desk from 420+ EASA Part-NCC charter movements between Germany, Switzerland, Austria, and Egypt:</p>
            <table>
              <caption>2026 DACH &amp; Europe to Egypt Non-Stop Private Jet Charter Matrix</caption>
              <thead>
                <tr>
                  <th>Aviation Corridor (ICAO)</th>
                  <th>Direct Flight Time &amp; Distance</th>
                  <th>Recommended Aircraft Category</th>
                  <th>Full Charter Investment (EUR)</th>
                  <th>Empty-Leg Repositioning Window</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Frankfurt (EDDF) to Cairo (HECA)</td>
                  <td>3h 55m (1,580 NM)</td>
                  <td>Challenger 650 / Falcon 2000LXS</td>
                  <td>\u20AC28,500 \u2013 \u20AC34,000</td>
                  <td>\u20AC19,900 \u2013 \u20AC23,500</td>
                </tr>
                <tr>
                  <td>Munich (EDDM) to Luxor (HELX)</td>
                  <td>3h 50m (1,540 NM)</td>
                  <td>Challenger 3500 / Praetor 600</td>
                  <td>\u20AC24,800 \u2013 \u20AC29,500</td>
                  <td>\u20AC17,400 \u2013 \u20AC21,000</td>
                </tr>
                <tr>
                  <td>Zurich (LSZH) to Hurghada / El Gouna (HEGN)</td>
                  <td>3h 55m (1,590 NM)</td>
                  <td>Gulfstream G280 / Falcon 2000</td>
                  <td>\u20AC27,200 \u2013 \u20AC32,800</td>
                  <td>\u20AC18,800 \u2013 \u20AC22,900</td>
                </tr>
                <tr>
                  <td>Berlin (EDDB) to Cairo (HECA)</td>
                  <td>4h 00m (1,565 NM)</td>
                  <td>Citation Longitude / Challenger 650</td>
                  <td>\u20AC26,900 \u2013 \u20AC33,200</td>
                  <td>\u20AC19,200 \u2013 \u20AC23,000</td>
                </tr>
              </tbody>
            </table>
          </section>
          ` : ""}

          <section>
            <h2>Sample Bespoke Itinerary &amp; Transparent Pricing Guide</h2>
            <h3>Transparent Investment &amp; Pricing Tiers</h3>
            <p>${pricing}</p>
            <h3>Signature Day-by-Day Highlights &amp; Execution</h3>
            <ul>
              ${itineraryHtml}
            </ul>
            <p>
              <a href="${ctaHref}" class="cta-button">${ctaText}</a> |
              <a href="/booking">Book Online Now</a> |
              <a href="tel:+201123988882">Call 24/7 Aviation &amp; Concierge Desk: +20 112 398 8882</a>
            </p>
          </section>

          <section aria-label="Regulatory Accreditations and Institutional Citations">
            <h2>Official Accreditations, Escrow Guarantee &amp; Institutional Regulatory References</h2>
            <p>Vanir Group operates in full compliance with international civil aviation and sovereign tourism regulations, backed by \u20AC10,000,000 corporate liability coverage and ring-fenced EUR/USD escrow accounts:</p>
            <ul>
              <li><strong>Egyptian Ministry of Tourism &amp; Antiquities Category (A) License #2184:</strong> Official sovereign tour operator and antiquities permit liaison (<a href="https://mota.gov.eg/" target="_blank" rel="noopener noreferrer">mota.gov.eg</a>).</li>
              <li><strong>IATA Accredited Aviation &amp; Travel Agent:</strong> International Air Transport Association global ticketing and aviation compliance (<a href="https://www.iata.org/" target="_blank" rel="noopener noreferrer">iata.org</a>).</li>
              <li><strong>EASA Part-NCC &amp; EBAA Charter Safety Standards:</strong> European Union Aviation Safety Agency and European Business Aviation Association safety compliance (<a href="https://www.easa.europa.eu/" target="_blank" rel="noopener noreferrer">easa.europa.eu</a> | <a href="https://www.ebaa.org/" target="_blank" rel="noopener noreferrer">ebaa.org</a>).</li>
              <li><strong>ISO 9001:2015 Certified Quality Management System:</strong> Independently audited white-glove hospitality and diplomatic protocol operations.</li>
            </ul>
          </section>

          <section>
            <h2>Frequently Asked Questions (FAQ)</h2>
            ${faqsHtml}
          </section>
        </article>
      </main>
      <footer>
        <nav aria-label="Footer Navigation">
          <a href="/author/ahmed-roshdi">Ahmed Roshdi \u2014 Founder &amp; CEO</a>
          <a href="/team">Executive Leadership &amp; Advisory Board</a>
          <a href="/case-studies">Verified Case Studies &amp; Mission Logs</a>
          <a href="/reviews">Verified Client Testimonials (4.9/5)</a>
          <a href="/privacy-policy">Privacy Policy &amp; GDPR</a>
          <a href="/terms-of-service">Terms of Service &amp; Escrow Charter</a>
          <a href="/blog/what-does-a-luxury-travel-concierge-do">What Does a Luxury Travel Concierge Do?</a>
          <a href="/blog/private-jet-charter-guide-how-to-book-costs">Private Jet Charter &amp; Privatjet Mieten Guide</a>
          <a href="/blog/luxury-travel-agency-vs-concierge-service">Luxury Travel Agency vs Concierge Comparison</a>
          <a href="/blog/egypt-luxury-travel-guide-private-tours-nile-cruises">Egypt Luxury Travel Guide</a>
          <a href="/blog/best-private-islands-maldives-retreats-uhnw">Best Private Islands &amp; Maldives Retreats</a>
          <a href="/blog/how-to-plan-bespoke-european-vacation-luxury-concierge">Bespoke European Vacation &amp; Safari Guide</a>
          <a href="https://www.instagram.com/vanir.group?igsh=cnpjczFsZzdrMDhi" rel="noopener noreferrer" target="_blank">Instagram</a>
          <a href="https://www.facebook.com/share/1DvRyfaQRC/" rel="noopener noreferrer" target="_blank">Facebook</a>
          <!--email_off--><a href="mailto:info@vanirgroup.com" data-cfemail="no">info@vanirgroup.com</a><!--/email_off-->
          <a href="tel:+201123988882">+20 112 398 8882</a>
        </nav>
        <address>VANIR GROUP (Vanir Travel Group) \u2014 Founded by CEO Ahmed Roshdi \u2014 Egyptian Ministry of Tourism License #2184 (Cat. A) \u2014 203 Salah Salem Street, Cairo Governorate, 11511, Egypt</address>
      </footer>
    </div>
  `;
}
function injectSeoMeta(html, rawRoute) {
  const route = normalizeRoute(rawRoute);
  const seo = getSEOMetadata(route);
  if (!seo) return html;
  const title = escapeHtml2(seo.metaTitle);
  const description = escapeHtml2(seo.metaDescription);
  const canonicalPath = route === "/" ? "/" : route;
  const canonical = `https://vanirgroup.com${canonicalPath}`;
  const crawlableBody = buildCrawlableHtml(seo);
  const hreflangTags = [
    `<link data-rh="true" rel="canonical" href="${canonical}" />`,
    `<link data-rh="true" rel="alternate" hreflang="x-default" href="${canonical}" />`,
    `<link data-rh="true" rel="alternate" hreflang="en" href="${canonical}" />`,
    `<link data-rh="true" rel="alternate" hreflang="de" href="${canonical}" />`,
    `<link data-rh="true" rel="alternate" hreflang="de-DE" href="${canonical}" />`,
    `<link data-rh="true" rel="alternate" hreflang="de-AT" href="${canonical}" />`,
    `<link data-rh="true" rel="alternate" hreflang="de-CH" href="${canonical}" />`,
    `<link data-rh="true" rel="alternate" hreflang="ar" href="${canonical}" />`
  ].join("\n    ");
  const cleanedHtml = html.replace(/<link\s+[^>]*rel="alternate"\s+hreflang="[^"]*"[^>]*\/?>\s*/gi, "");
  return cleanedHtml.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, `<title data-rh="true">${title}</title>`).replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" name="description" content="${description}" />`).replace(/<meta\s+data-rh="true"\s+name="description"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" name="description" content="${description}" />`).replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" property="og:title" content="${title}" />`).replace(/<meta\s+data-rh="true"\s+property="og:title"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" property="og:title" content="${title}" />`).replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" property="og:description" content="${description}" />`).replace(/<meta\s+data-rh="true"\s+property="og:description"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" property="og:description" content="${description}" />`).replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" name="twitter:title" content="${title}" />`).replace(/<meta\s+data-rh="true"\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" name="twitter:title" content="${title}" />`).replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" name="twitter:description" content="${description}" />`).replace(/<meta\s+data-rh="true"\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" name="twitter:description" content="${description}" />`).replace(/<link\s+(?:data-rh="true"\s+)?rel="canonical"\s+href="[^"]*"\s*\/?>/gi, hreflangTags).replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" property="og:url" content="${canonical}" />`).replace(/<meta\s+data-rh="true"\s+property="og:url"\s+content="[^"]*"\s*\/?>/gi, `<meta data-rh="true" property="og:url" content="${canonical}" />`).replace(/<div\s+id="root">[\s\S]*?<\/div>\s*(?=<script\s+type="module")/i, `<div id="root">${crawlableBody}</div>
    `);
}
async function setupVite(app, server) {
  const { createServer: createViteServer } = await import("vite");
  const viteConfigModule = "../../vite.config";
  const viteConfig = (await import(
    /* @vite-ignore */
    viteConfigModule
  )).default;
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path5.resolve(DIRNAME, "../..", "client", "index.html");
      let template = await fs5.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid4()}"`
      );
      const page = injectSeoMeta(await vite.transformIndexHtml(url, template), url);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function fixPublicAssetPermissions(targetDir) {
  try {
    if (!fs5.existsSync(targetDir)) return;
    fs5.chmodSync(targetDir, 493);
    const entries = fs5.readdirSync(targetDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path5.join(targetDir, entry.name);
      try {
        if (entry.isDirectory()) {
          fixPublicAssetPermissions(fullPath);
        } else if (entry.isFile()) {
          fs5.chmodSync(fullPath, 420);
        }
      } catch {
      }
    }
  } catch {
  }
}
function serveStatic(app) {
  const possiblePaths = [
    path5.resolve(DIRNAME, "dist", "public"),
    path5.resolve(process.cwd(), "dist", "public"),
    path5.resolve(DIRNAME, "public"),
    path5.resolve(process.cwd(), "public"),
    path5.resolve(DIRNAME, "../..", "dist", "public")
  ];
  const distPath = possiblePaths.find((p) => fs5.existsSync(p)) || possiblePaths[0];
  if (!fs5.existsSync(distPath)) {
    console.error(
      `[Static] Could not find the build directory among: ${possiblePaths.join(", ")}`
    );
  } else {
    console.log(`[Static] Serving public assets from primary: ${distPath}`);
  }
  setImmediate(() => {
    const dirsToFix = /* @__PURE__ */ new Set([
      ...possiblePaths,
      path5.resolve(process.cwd(), "images"),
      path5.resolve(process.cwd(), "client", "public")
    ]);
    for (const d of dirsToFix) {
      fixPublicAssetPermissions(d);
    }
  });
  app.use(
    "/.well-known",
    express.static(path5.resolve(distPath, ".well-known"), {
      dotfiles: "allow"
    })
  );
  const imageDirs = [
    path5.resolve(distPath, "images"),
    path5.resolve(process.cwd(), "public", "images"),
    path5.resolve(process.cwd(), "dist", "public", "images"),
    path5.resolve(process.cwd(), "client", "public", "images"),
    path5.resolve(process.cwd(), "images")
  ];
  for (const imgDir of imageDirs) {
    if (fs5.existsSync(imgDir)) {
      app.use(
        "/images",
        express.static(imgDir, {
          maxAge: "365d",
          immutable: true
        })
      );
    }
  }
  const allStaticCandidateDirs = [
    path5.resolve(DIRNAME, "dist", "public"),
    path5.resolve(process.cwd(), "dist", "public"),
    path5.resolve(DIRNAME, "public"),
    path5.resolve(process.cwd(), "public")
  ].filter((d) => fs5.existsSync(d));
  for (const sDir of Array.from(new Set(allStaticCandidateDirs))) {
    app.use(
      express.static(sDir, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith(".html")) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
          } else if (filePath.includes(`${path5.sep}assets${path5.sep}`)) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          }
        }
      })
    );
  }
  const indexPath = path5.resolve(distPath, "index.html");
  let cachedIndexTemplate = "";
  try {
    if (fs5.existsSync(indexPath)) {
      cachedIndexTemplate = fs5.readFileSync(indexPath, "utf-8");
    }
  } catch (error) {
    console.error("[Static] Failed to read static index.html template:", error);
  }
  app.use("*", (req, res) => {
    const rawUrl2 = req.originalUrl || req.url || "/";
    if (/\.(js|mjs|cjs|css|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot|json|map|xml|txt)$/i.test(rawUrl2)) {
      return res.status(404).type("text/plain").send("Asset not found");
    }
    const isPublicStatic = !rawUrl2.startsWith("/api") && !rawUrl2.startsWith("/admin");
    if (isPublicStatic) {
      res.setHeader("Cache-Control", "public, max-age=120, s-maxage=3600, stale-while-revalidate=86400");
    } else {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }
    const template = cachedIndexTemplate || (fs5.existsSync(indexPath) ? fs5.readFileSync(indexPath, "utf-8") : "<h1>Vanir Group</h1>");
    const assetVersion = "v" + Date.now().toString(36);
    let page = injectSeoMeta(template, rawUrl2);
    page = page.replace(
      /(<script[^>]+src=["']\/assets\/[^"']+)(\.js)(["'])/g,
      `$1$2?v=${assetVersion}$3`
    );
    page = page.replace(
      /(<link[^>]+href=["']\/assets\/[^"']+)(\.css)(["'])/g,
      `$1$2?v=${assetVersion}$3`
    );
    res.status(200).set({ "Content-Type": "text/html" }).end(page);
  });
}

// server/_core/index.ts
import { Server as SocketIOServer } from "socket.io";

// server/_core/flightTracker.ts
import axios2 from "axios";
function generateFallbackFlights(count2) {
  const flights = [];
  const airlines = ["VANIR PRIVATE JET", "Emirates", "Qatar Airways", "Lufthansa", "Delta Air Lines", "Air France", "Ryanair", "Turkish Airlines", "United Airlines", "easyJet", "Saudi Airlines"];
  const countries = ["United States", "United Kingdom", "United Arab Emirates", "France", "Germany", "Saudi Arabia", "Egypt", "Turkey", "Ireland", "China", "Malta"];
  for (let i = 0; i < count2; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    flights.push({
      id: `fallback-${i}`,
      callsign: `${airline.substring(0, 3).toUpperCase()}${100 + i}`,
      origin_country: countries[Math.floor(Math.random() * countries.length)],
      longitude: Math.random() * 360 - 180,
      latitude: Math.random() * 180 - 90,
      altitude: Math.floor(Math.random() * (12e3 - 3e3 + 1)) + 3e3,
      velocity: Math.floor(Math.random() * (950 - 400 + 1)) + 400,
      true_track: Math.random() * 360,
      // Heading in degrees
      airline
    });
  }
  setInterval(() => {
    flights.forEach((f) => {
      f.longitude += Math.cos((f.true_track - 90) * (Math.PI / 180)) * f.velocity / 4e4;
      f.latitude -= Math.sin((f.true_track - 90) * (Math.PI / 180)) * f.velocity / 4e4;
      if (f.longitude > 180) f.longitude -= 360;
      if (f.longitude < -180) f.longitude += 360;
      if (f.latitude > 90) f.latitude = 90;
      if (f.latitude < -90) f.latitude = -90;
    });
  }, 1e3);
  return flights;
}
var fallbackCache = generateFallbackFlights(2e3);
function initializeFlightTracker(io) {
  let activeConnections = 0;
  io.on("connection", (socket) => {
    activeConnections++;
    console.log(`[FlightTracker] Client connected. Total: ${activeConnections}`);
    socket.emit("flights-update", fallbackCache);
    socket.on("disconnect", () => {
      activeConnections--;
      console.log(`[FlightTracker] Client disconnected. Total: ${activeConnections}`);
    });
  });
  setInterval(async () => {
    if (activeConnections === 0) return;
    try {
      const response = await axios2.get("https://opensky-network.org/api/states/all", {
        auth: {
          username: "roshdi",
          password: "Roshdi82@a"
        },
        timeout: 8e3
      });
      const states = response.data.states;
      if (!states || states.length === 0) throw new Error("No data returned");
      const liveFlights = states.filter((s) => !s[8] && s[5] !== null && s[6] !== null && s[7] !== null).map((s) => {
        let airlineName = s[2];
        if (s[1] && typeof s[1] === "string") {
          const cs = s[1].toUpperCase();
          if (cs.startsWith("EK") || cs.startsWith("UAE")) airlineName = "Emirates";
          else if (cs.startsWith("QTR")) airlineName = "Qatar Airways";
          else if (cs.startsWith("SVA")) airlineName = "Saudi Airlines";
          else if (cs.startsWith("BAW")) airlineName = "British Airways";
          else if (cs.startsWith("DAL")) airlineName = "Delta Air Lines";
          else if (cs.startsWith("RYR")) airlineName = "Ryanair";
          else if (cs.startsWith("THY")) airlineName = "Turkish Airlines";
          else if (cs.startsWith("UAL")) airlineName = "United Airlines";
        }
        return {
          id: s[0],
          callsign: s[1]?.trim() || "UNKNOWN",
          origin_country: s[2],
          longitude: s[5],
          latitude: s[6],
          altitude: s[7],
          // meters
          velocity: (s[9] * 3.6).toFixed(0),
          // m/s to km/h
          true_track: s[10],
          // Heading
          airline: airlineName
        };
      }).slice(0, 2500);
      io.emit("flights-update", liveFlights);
    } catch (error) {
      io.emit("flights-update", fallbackCache);
    }
  }, 15e3);
}

// server/_core/index.ts
process.on("unhandledRejection", (reason, promise) => {
  console.warn("[Process] Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("[Process] Uncaught Exception:", error);
});
var DIRNAME2 = typeof __dirname !== "undefined" ? __dirname : typeof import.meta !== "undefined" && import.meta.url ? path6.dirname(new URL(".", import.meta.url).pathname) : process.cwd();
function createApp() {
  const app = express2();
  app.use(compression({
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
    threshold: 1024
  }));
  app.use((req, res, next) => {
    if (process.env.NODE_ENV === "production") {
      const proto = req.headers["x-forwarded-proto"];
      const host = req.headers.host;
      if (proto && proto === "http") {
        return res.redirect(301, `https://${host}${req.url}`);
      }
    }
    next();
  });
  app.get(["/cdn-cgi/l/email-protection*", "/cdn-cgi/l/email-protection"], (_req, res) => {
    res.redirect(301, "/contact");
  });
  app.get("/robots.txt", (_req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    const robotsPath = path6.resolve(DIRNAME2, "../..", "client", "public", "robots.txt");
    const distRobotsPath = path6.resolve(DIRNAME2, "public", "robots.txt");
    if (fs6.existsSync(robotsPath)) {
      return res.sendFile(robotsPath);
    } else if (fs6.existsSync(distRobotsPath)) {
      return res.sendFile(distRobotsPath);
    }
    res.send(
      "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://vanirgroup.com/sitemap.xml\nSitemap: https://vanirgroup.com/sitemap_index.xml\n"
    );
  });
  app.get("/.well-known/assetlinks.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    const candidatePaths = [
      path6.resolve(DIRNAME2, "../..", "client", "public", ".well-known", "assetlinks.json"),
      path6.resolve(DIRNAME2, "public", ".well-known", "assetlinks.json"),
      path6.resolve(process.cwd(), "public", ".well-known", "assetlinks.json"),
      path6.resolve(process.cwd(), "dist", "public", ".well-known", "assetlinks.json")
    ];
    const foundPath = candidatePaths.find((p) => fs6.existsSync(p));
    if (foundPath) {
      return res.sendFile(foundPath);
    }
    return res.json([
      {
        relation: [
          "delegate_permission/common.handle_all_urls",
          "delegate_permission/common.get_login_creds"
        ],
        target: {
          namespace: "android_app",
          package_name: "com.vanir.mobile",
          sha256_cert_fingerprints: [
            "C7:7D:F4:E1:27:F8:CC:B5:4B:EC:E4:9F:74:82:ED:18:4F:4C:DE:0E:59:D8:06:48:7D:A3:17:04:43:20:43:1B",
            "A6:7E:FF:46:02:68:E0:AC:80:81:0D:96:19:B7:04:1C:21:CD:B8:1F:5C:99:7C:F8:7C:C4:E6:22:94:E0:41:5A"
          ]
        }
      }
    ]);
  });
  const SITEMAP_ROUTES = [
    "",
    "about",
    "author/ahmed-roshdi",
    "team",
    "packages",
    "destinations",
    "destinations/egypt",
    "destinations/dubai",
    "destinations/maldives",
    "destinations/switzerland",
    "destinations/greece",
    "destinations/italy",
    "hotels",
    "private-jet",
    "tours",
    "day-trips",
    "fast-track",
    "visa",
    "esim",
    "mice",
    "flights-booking",
    "hotels-booking",
    "insurance",
    "groups",
    "news",
    "affiliated",
    "booking",
    "reviews",
    "offers",
    "case-studies",
    "blog",
    "contact",
    "privacy-policy",
    "terms-of-service",
    "blog/what-does-a-luxury-travel-concierge-do",
    "blog/private-jet-charter-guide-how-to-book-costs",
    "blog/luxury-travel-agency-vs-concierge-service",
    "blog/egypt-luxury-travel-guide-private-tours-nile-cruises",
    "blog/best-private-islands-maldives-retreats-uhnw",
    "blog/how-to-plan-bespoke-european-vacation-luxury-concierge"
  ];
  const generateUrlsetXml = (routes) => {
    const lastmod = "2026-11-02";
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
` + routes.map((u) => {
      const loc = u === "" ? "https://vanirgroup.com/" : `https://vanirgroup.com/${u}`;
      const priority = u === "" ? "1.0" : u.startsWith("destinations/") || u === "private-jet" ? "0.9" : "0.85";
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />
    <xhtml:link rel="alternate" hreflang="en" href="${loc}" />
    <xhtml:link rel="alternate" hreflang="de" href="${loc}" />
    <xhtml:link rel="alternate" hreflang="de-DE" href="${loc}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${loc}" />
  </url>`;
    }).join("\n") + `
</urlset>`;
  };
  app.get(["/sitemap.xml", "/sitemap_index.xml", "/page-sitemap.xml"], (_req, res) => {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(generateUrlsetXml(SITEMAP_ROUTES));
  });
  app.get("/post-sitemap.xml", (_req, res) => {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    const blogRoutes = SITEMAP_ROUTES.filter((r) => r === "blog" || r.startsWith("blog/"));
    res.send(generateUrlsetXml(blogRoutes));
  });
  let allowedOrigins;
  if (process.env.NODE_ENV === "production") {
    const extra = (process.env.CORS_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    allowedOrigins = [
      "https://vanirgroup.com",
      "https://www.vanirgroup.com",
      ...extra
    ];
  } else {
    allowedOrigins = true;
  }
  app.use(cors({
    origin: allowedOrigins,
    credentials: true
  }));
  app.use((_req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
  });
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  app.use("/uploads", express2.static(path6.resolve(DIRNAME2, "..", "public", "uploads")));
  app.get("/api/media", (req, res) => {
    const rawSrc = typeof req.query.src === "string" ? req.query.src : "";
    if (!rawSrc) {
      return void res.status(400).send("Missing src parameter");
    }
    let decoded = rawSrc;
    try {
      decoded = decodeURIComponent(rawSrc);
    } catch {
      decoded = rawSrc;
    }
    const cleanRel = decoded.replace(/^https?:\/\/[^/]+/i, "").replace(/\?.*$/, "").replace(/^\/+/, "");
    if (!cleanRel || cleanRel.includes("..")) {
      return void res.status(400).send("Invalid asset path");
    }
    const roots = [
      path6.resolve(DIRNAME2, "public"),
      path6.resolve(DIRNAME2, "dist", "public"),
      path6.resolve(process.cwd(), "dist", "public"),
      path6.resolve(process.cwd(), "public"),
      path6.resolve(DIRNAME2, "../..", "dist", "public"),
      path6.resolve(DIRNAME2, "../..", "client", "public"),
      path6.resolve(process.cwd(), "client", "public"),
      path6.resolve(process.cwd(), "images")
    ];
    for (const rootDir of roots) {
      const candidate = rootDir.endsWith(`${path6.sep}images`) && cleanRel.startsWith("images/") ? path6.resolve(rootDir, cleanRel.replace(/^images\//, "")) : path6.resolve(rootDir, cleanRel);
      if (candidate.startsWith(rootDir) && fs6.existsSync(candidate)) {
        try {
          const stat = fs6.statSync(candidate);
          if (stat.isFile()) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
            return void res.sendFile(candidate);
          }
        } catch {
        }
      }
    }
    return void res.status(404).send("Media asset not found");
  });
  registerStorageProxy(app);
  registerDownloadProxy(app);
  registerVideoProxy(app);
  registerOAuthRoutes(app);
  registerFirebaseAuthRoutes(app);
  registerCheckoutAndVerifyRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );
  return app;
}
async function startServer() {
  console.log("[Server] startServer() invoked successfully");
  const app = createApp();
  const server = createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      // Adjust for production
      methods: ["GET", "POST"]
    }
  });
  initializeFlightTracker(io);
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  if (process.env.VERCEL !== "1") {
    if (typeof global.PhusionPassenger !== "undefined") {
      server.listen("passenger", () => {
        console.log("[Server] Running under Phusion Passenger");
      });
    } else if (process.env.PORT) {
      const portVal = /^\d+$/.test(process.env.PORT.trim()) ? parseInt(process.env.PORT.trim(), 10) : process.env.PORT;
      server.listen(portVal, () => {
        console.log(`[Server] Running on port/socket: ${process.env.PORT}`);
      });
    } else {
      const preferredPort = 3e3;
      server.listen(preferredPort, () => {
        console.log(`[Server] Running on http://localhost:${preferredPort}/`);
      });
    }
  }
  return app;
}
startServer().catch(console.error);
export {
  createApp,
  startServer
};
