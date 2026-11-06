import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema";
import { eq, desc, and, sql, like, or } from "drizzle-orm";
import { ENV } from "./_core/env.js";

// Make sure DATABASE_URL is read properly
const rawUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

if (!rawUrl) {
  if (process.env.DEBUG || process.env.NODE_ENV === "development") {
    console.info("[DB] DATABASE_URL not configured. Running in file-store mode.");
  }
}

export const pool = mysql.createPool(rawUrl || "mysql://root:@localhost:3306/travel_gold");
export const db = drizzle(pool, { schema, mode: "default" });

export async function getDb() {
  return db;
}

// ============ USER HELPERS ============

export async function upsertUser(user: schema.InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const existing = await db.query.users.findFirst({
    where: eq(schema.users.openId, user.openId),
  });

  const role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  const now = new Date();

  if (existing) {
    await db.update(schema.users).set({
      name: user.name ?? existing.name,
      email: user.email ?? existing.email,
      loginMethod: user.loginMethod ?? existing.loginMethod,
      lastSignedIn: user.lastSignedIn ?? now,
      role: user.role ?? existing.role,
      updatedAt: now,
    }).where(eq(schema.users.id, existing.id));
  } else {
    await db.insert(schema.users).values({
      ...user,
      role,
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    });
  }
}

export async function getUserByOpenId(openId: string) {
  return db.query.users.findFirst({
    where: eq(schema.users.openId, openId),
  });
}

// ============ BOOKING HELPERS ============

export async function createBooking(booking: schema.InsertBooking) {
  const [result] = await db.insert(schema.bookings).values(booking).returning();
  return result;
}

export async function getBookingById(id: number) {
  return db.query.bookings.findFirst({ where: eq(schema.bookings.id, id) });
}

export async function getBookingByConfirmationCode(code: string) {
  return db.query.bookings.findFirst({ where: eq(schema.bookings.confirmationCode, code) });
}

export async function getUserBookings(userId: number) {
  return db.query.bookings.findMany({
    where: eq(schema.bookings.userId, userId),
    orderBy: [desc(schema.bookings.createdAt)],
  });
}

export async function updateBookingStatus(
  id: number,
  status: "pending" | "confirmed" | "cancelled" | "completed",
) {
  const [result] = await db.update(schema.bookings).set({ status, updatedAt: new Date() }).where(eq(schema.bookings.id, id)).returning();
  return result;
}

export async function updateBookingPaymentStatus(
  id: number,
  paymentStatus: "pending" | "paid" | "failed" | "refunded",
) {
  const [result] = await db.update(schema.bookings).set({ paymentStatus, updatedAt: new Date() }).where(eq(schema.bookings.id, id)).returning();
  return result;
}

export async function getAllBookings(limit = 50, offset = 0) {
  return db.query.bookings.findMany({
    orderBy: [desc(schema.bookings.createdAt)],
    limit,
    offset,
  });
}

// ============ REVIEW HELPERS ============

export async function createReview(review: schema.InsertReview) {
  const [result] = await db.insert(schema.reviews).values(review).returning();
  return result;
}

export async function getApprovedReviews(limit = 50, offset = 0) {
  return db.query.reviews.findMany({
    where: eq(schema.reviews.isApproved, "approved"),
    orderBy: [desc(schema.reviews.createdAt)],
    limit,
    offset,
  });
}

export async function getAllReviews(limit = 50, offset = 0) {
  return db.query.reviews.findMany({
    orderBy: [desc(schema.reviews.createdAt)],
    limit,
    offset,
  });
}

export async function getReviewById(id: number) {
  return db.query.reviews.findFirst({ where: eq(schema.reviews.id, id) });
}

export async function updateReviewApproval(
  id: number,
  isApproved: "pending" | "approved" | "rejected",
) {
  const [result] = await db.update(schema.reviews).set({ isApproved, updatedAt: new Date() }).where(eq(schema.reviews.id, id)).returning();
  return result;
}

export async function addAdminReply(id: number, adminReply: string) {
  const [result] = await db.update(schema.reviews).set({ adminReply, adminReplyAt: new Date(), updatedAt: new Date() }).where(eq(schema.reviews.id, id)).returning();
  return result;
}

export async function incrementHelpfulCount(id: number) {
  const review = await getReviewById(id);
  const current = review?.helpfulCount ?? 0;
  const [result] = await db.update(schema.reviews).set({ helpfulCount: current + 1, updatedAt: new Date() }).where(eq(schema.reviews.id, id)).returning();
  return result;
}

export async function getReviewStats() {
  const allApproved = await db.query.reviews.findMany({
    where: eq(schema.reviews.isApproved, "approved"),
  });
  const total = allApproved.length;
  if (total === 0) {
    return { total: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }
  const sum = allApproved.reduce((acc, r) => acc + (r.rating ?? 0), 0);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  allApproved.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) distribution[r.rating as 1 | 2 | 3 | 4 | 5]++;
  });
  return { total, average: Math.round((sum / total) * 10) / 10, distribution };
}

// ============ OFFER HELPERS ============

export async function createOffer(offer: schema.InsertOffer) {
  const [result] = await db.insert(schema.offers).values(offer).returning();
  return result;
}

export async function getActiveOffers() {
  const now = Date.now();
  const active = await db.query.offers.findMany({
    where: eq(schema.offers.isActive, "active"),
  });
  return active
    .filter((o) => Number(o.startDate ?? 0) <= now && Number(o.endDate ?? 0) >= now)
    .sort((a, b) => Number(a.endDate ?? 0) - Number(b.endDate ?? 0));
}

export async function getAllOffers(limit = 50, offset = 0) {
  return db.query.offers.findMany({
    orderBy: [desc(schema.offers.createdAt)],
    limit,
    offset,
  });
}

export async function getOfferByPromoCode(promoCode: string) {
  return db.query.offers.findFirst({ where: eq(schema.offers.promoCode, promoCode) });
}

export async function updateOffer(id: number, data: Partial<schema.InsertOffer>) {
  const [result] = await db.update(schema.offers).set({ ...data, updatedAt: new Date() }).where(eq(schema.offers.id, id)).returning();
  return result;
}

// ============ CONTACT MESSAGE HELPERS ============

export async function createContactMessage(message: schema.InsertContactMessage) {
  const [result] = await db.insert(schema.contactMessages).values(message).returning();
  return result;
}

export async function getAllContactMessages(limit = 50, offset = 0) {
  return db.query.contactMessages.findMany({
    orderBy: [desc(schema.contactMessages.createdAt)],
    limit,
    offset,
  });
}

export async function updateContactMessageStatus(
  id: number,
  status: "new" | "read" | "replied" | "archived",
) {
  await db.update(schema.contactMessages).set({ status, updatedAt: new Date() }).where(eq(schema.contactMessages.id, id));
}

// ============ FILE UPLOAD HELPERS ============

export async function createFileUpload(file: schema.InsertFileUpload) {
  const [result] = await db.insert(schema.fileUploads).values(file).returning();
  return result;
}

export async function getUserFiles(userId: number) {
  return db.query.fileUploads.findMany({
    where: eq(schema.fileUploads.userId, userId),
    orderBy: [desc(schema.fileUploads.createdAt)],
  });
}

// ============ GALLERY ITEM HELPERS ============

export async function createGalleryItem(item: schema.InsertGalleryItem) {
  const [result] = await db.insert(schema.galleryItems).values(item).returning();
  return result;
}

export async function getVisibleGalleryItems() {
  return db.query.galleryItems.findMany({
    where: eq(schema.galleryItems.isvisible, "visible"),
    orderBy: [desc(schema.galleryItems.sortOrder), desc(schema.galleryItems.createdAt)],
  });
}

export async function getAllGalleryItems(limit = 100, offset = 0) {
  return db.query.galleryItems.findMany({
    orderBy: [desc(schema.galleryItems.sortOrder)],
    limit,
    offset,
  });
}

export async function getGalleryItemById(id: number) {
  return db.query.galleryItems.findFirst({ where: eq(schema.galleryItems.id, id) });
}

export async function updateGalleryItem(id: number, data: Partial<schema.InsertGalleryItem>) {
  const [result] = await db.update(schema.galleryItems).set({ ...data, updatedAt: new Date() }).where(eq(schema.galleryItems.id, id)).returning();
  return result;
}

export async function deleteGalleryItem(id: number) {
  await db.delete(schema.galleryItems).where(eq(schema.galleryItems.id, id));
}

// ============ GALLERY VIDEO HELPERS ============

export async function createGalleryVideo(video: schema.InsertGalleryVideo) {
  const [result] = await db.insert(schema.galleryVideos).values(video).returning();
  return result;
}

export async function getVisibleGalleryVideos() {
  return db.query.galleryVideos.findMany({
    where: eq(schema.galleryVideos.isVisible, "visible"),
    orderBy: [desc(schema.galleryVideos.sortOrder), desc(schema.galleryVideos.createdAt)],
  });
}

export async function getAllGalleryVideos(limit = 50, offset = 0) {
  return db.query.galleryVideos.findMany({
    orderBy: [desc(schema.galleryVideos.sortOrder)],
    limit,
    offset,
  });
}

export async function getGalleryVideoById(id: number) {
  return db.query.galleryVideos.findFirst({ where: eq(schema.galleryVideos.id, id) });
}

export async function updateGalleryVideo(id: number, data: Partial<schema.InsertGalleryVideo>) {
  const [result] = await db.update(schema.galleryVideos).set({ ...data, updatedAt: new Date() }).where(eq(schema.galleryVideos.id, id)).returning();
  return result;
}

export async function deleteGalleryVideo(id: number) {
  await db.delete(schema.galleryVideos).where(eq(schema.galleryVideos.id, id));
}

// ============ AI STUDIO HELPERS ============

export async function getOrCreateAISubscription(userId: number) {
  const existing = await db.query.aiSubscriptions.findFirst({ where: eq(schema.aiSubscriptions.userId, userId) });
  if (existing) return existing;
  const [created] = await db.insert(schema.aiSubscriptions).values({
    userId,
    plan: "free",
    status: "active",
    startDate: Date.now(),
  }).returning();
  return created;
}

export async function updateAISubscription(
  userId: number,
  plan: "free" | "pro" | "enterprise",
  stripeSubscriptionId?: string,
) {
  const sub = await getOrCreateAISubscription(userId);
  await db.update(schema.aiSubscriptions).set({
    plan,
    status: "active",
    renewalDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    ...(stripeSubscriptionId && { stripeSubscriptionId }),
    updatedAt: new Date(),
  }).where(eq(schema.aiSubscriptions.id, sub.id));
  return getOrCreateAISubscription(userId);
}

export async function getOrCreateAICredits(userId: number) {
  const existing = await db.query.aiCredits.findFirst({ where: eq(schema.aiCredits.userId, userId) });
  if (existing) return existing;
  const [created] = await db.insert(schema.aiCredits).values({
    userId,
    balance: "100",
    totalUsed: "0",
  }).returning();
  return created;
}

export async function addAICredits(
  userId: number,
  amount: number,
  reason: "purchase" | "monthly_allowance" | "bonus",
) {
  const credits = await getOrCreateAICredits(userId);
  const newBalance = parseFloat(credits.balance) + amount;
  await db.update(schema.aiCredits).set({ balance: newBalance.toString(), updatedAt: new Date() }).where(eq(schema.aiCredits.id, credits.id));
  await db.insert(schema.aiTransactions).values({
    userId,
    type: reason,
    amount: amount.toString(),
    status: "completed",
  });
  return getOrCreateAICredits(userId);
}

export async function deductAICredits(userId: number, amount: number) {
  const credits = await getOrCreateAICredits(userId);
  const currentBalance = parseFloat(credits.balance);
  if (currentBalance < amount) {
    throw new Error("Insufficient credits");
  }
  const newBalance = currentBalance - amount;
  const newTotalUsed = parseFloat(credits.totalUsed) + amount;
  await db.update(schema.aiCredits).set({
    balance: newBalance.toString(),
    totalUsed: newTotalUsed.toString(),
    updatedAt: new Date(),
  }).where(eq(schema.aiCredits.id, credits.id));
  return getOrCreateAICredits(userId);
}

export async function createAIUsage(usage: schema.InsertAIUsage) {
  const [result] = await db.insert(schema.aiUsage).values(usage).returning();
  return result;
}

export async function getUserAIUsage(userId: number, limit = 50, offset = 0) {
  return db.query.aiUsage.findMany({
    where: eq(schema.aiUsage.userId, userId),
    orderBy: [desc(schema.aiUsage.createdAt)],
    limit,
    offset,
  });
}

export async function updateAIUsageStatus(
  id: number,
  status: "pending" | "completed" | "failed",
  resultUrl?: string,
  errorMessage?: string,
) {
  return db.update(schema.aiUsage).set({
    status,
    ...(resultUrl && { resultUrl }),
    ...(errorMessage && { errorMessage }),
  }).where(eq(schema.aiUsage.id, id));
}

export async function getAIUsageStats(userId: number) {
  const usage = await db.query.aiUsage.findMany({
    where: eq(schema.aiUsage.userId, userId),
  });
  return {
    totalGenerations: usage.length,
    byType: {
      image: usage.filter((u) => u.type === "image").length,
      video: usage.filter((u) => u.type === "video").length,
      edit: usage.filter((u) => u.type === "edit").length,
    },
    totalCost: usage.reduce((sum, u) => sum + parseFloat((u.creditsCost ?? "0").toString()), 0),
  };
}

// ============ USER MANAGEMENT HELPERS (Admin) ============

export async function getAllUsers(limit = 50, offset = 0) {
  const users = await db.query.users.findMany({
    orderBy: [desc(schema.users.createdAt)],
    limit,
    offset,
  });

  const usersWithCredits = await Promise.all(
    users.map(async (u) => {
      try {
        const cred = await db.query.aiCredits.findFirst({ where: eq(schema.aiCredits.userId, u.id) });
        return {
          ...u,
          credits: cred ? parseFloat(cred.balance.toString()) : 100,
        };
      } catch {
        return { ...u, credits: 100 };
      }
    })
  );

  return usersWithCredits;
}

export async function getUsersCount() {
  const result = await db.select({ count: sql<number>`count(*)` }).from(schema.users);
  return Number(result[0].count);
}

export async function getUserById(id: number) {
  return db.query.users.findFirst({ where: eq(schema.users.id, id) });
}

export async function updateUserRole(id: number, role: "user" | "admin") {
  const [result] = await db.update(schema.users).set({ role, updatedAt: new Date() }).where(eq(schema.users.id, id)).returning();
  return result;
}

export async function searchUsers(query: string, limit = 20) {
  const q = `%${query}%`;
  return db.query.users.findMany({
    where: or(
      like(schema.users.name, q),
      like(schema.users.email, q),
      like(schema.users.openId, q)
    ),
    orderBy: [desc(schema.users.createdAt)],
    limit,
  });
}

export async function getUserStats() {
  const all = await db.query.users.findMany();
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayMs = startOfToday.getTime();
  const toMs = (v: any) => (v ? new Date(v).getTime() : 0);
  return {
    total: all.length,
    admins: all.filter((u) => u.role === "admin").length,
    recentSignups: all.filter((u) => toMs(u.createdAt) >= thirtyDaysAgo).length,
    todaySignups: all.filter((u) => toMs(u.createdAt) >= todayMs).length,
  };
}

export async function updateUserProfile(
  id: number,
  data: { name?: string; phone?: string | null; avatarUrl?: string | null },
) {
  const [result] = await db.update(schema.users).set({ ...data, updatedAt: new Date() }).where(eq(schema.users.id, id)).returning();
  return result;
}

// ============ BLOG POST HELPERS ============

export async function getPublishedBlogPosts(limit = 10, offset = 0) {
  return db.query.blogPosts.findMany({
    where: eq(schema.blogPosts.status, "published"),
    orderBy: [desc(schema.blogPosts.publishedAt)],
    limit,
    offset,
  });
}

export async function getBlogPostBySlug(slug: string) {
  return db.query.blogPosts.findFirst({ where: eq(schema.blogPosts.slug, slug) });
}

export async function getBlogPostsByCategory(category: string, limit = 10, offset = 0) {
  return db.query.blogPosts.findMany({
    where: and(eq(schema.blogPosts.status, "published"), eq(schema.blogPosts.category, category)),
    orderBy: [desc(schema.blogPosts.publishedAt)],
    limit,
    offset,
  });
}

export async function createBlogPost(post: schema.InsertBlogPost) {
  const [result] = await db.insert(schema.blogPosts).values(post).returning();
  return result;
}

export async function updateBlogPost(id: number, data: Partial<schema.InsertBlogPost>) {
  const [result] = await db.update(schema.blogPosts).set({ ...data, updatedAt: new Date() }).where(eq(schema.blogPosts.id, id)).returning();
  return result;
}

export async function getAllBlogPosts(limit = 50, offset = 0) {
  return db.query.blogPosts.findMany({
    orderBy: [desc(schema.blogPosts.createdAt)],
    limit,
    offset,
  });
}

export async function incrementBlogViewCount(id: number) {
  const post = await getById(schema.blogPosts, id);
  if (!post) return;
  const current = post.viewCount ?? 0;
  await db.update(schema.blogPosts).set({ viewCount: current + 1 }).where(eq(schema.blogPosts.id, id));
}

// Helper needed by incrementBlogViewCount
async function getById(table: any, id: number) {
  const result = await db.select().from(table).where(eq(table.id, id));
  return result[0];
}
