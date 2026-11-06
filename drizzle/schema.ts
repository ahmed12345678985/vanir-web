import {
  mysqlTable,
  varchar,
  text,
  int,
  bigint,
  decimal,
  json,
  datetime,
  serial,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

// Helper for auto-increment primary key
const id = () => serial("id");

// Helper for timestamps
const createdAt = () =>
  datetime("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull();
const updatedAt = () =>
  datetime("updatedAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull();

export const users = mysqlTable("users", {
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
  lastSignedIn: datetime("lastSignedIn").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const bookings = mysqlTable("bookings", {
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
  updatedAt: updatedAt(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

export const reviews = mysqlTable("reviews", {
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
  updatedAt: updatedAt(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

export const offers = mysqlTable("offers", {
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
  updatedAt: updatedAt(),
});

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = typeof offers.$inferInsert;

export const contactMessages = mysqlTable("contact_messages", {
  id: id().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  subject: varchar("subject", { length: 500 }),
  message: text("message").notNull(),
  status: varchar("status", { length: 10 }).default("new").notNull(),
  adminNotes: text("adminNotes"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

export const fileUploads = mysqlTable("file_uploads", {
  id: id().primaryKey(),
  userId: int("userId").references(() => users.id),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  url: text("url").notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  purpose: varchar("purpose", { length: 50 }),
  createdAt: createdAt(),
});

export type FileUpload = typeof fileUploads.$inferSelect;
export type InsertFileUpload = typeof fileUploads.$inferInsert;

export const galleryItems = mysqlTable("gallery_items", {
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
  updatedAt: updatedAt(),
});

export type GalleryItem = typeof galleryItems.$inferSelect;
export type InsertGalleryItem = typeof galleryItems.$inferInsert;

export const galleryVideos = mysqlTable("gallery_videos", {
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
  updatedAt: updatedAt(),
});

export type GalleryVideo = typeof galleryVideos.$inferSelect;
export type InsertGalleryVideo = typeof galleryVideos.$inferInsert;

export const aiSubscriptions = mysqlTable("ai_subscriptions", {
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
  updatedAt: updatedAt(),
});

export type AISubscription = typeof aiSubscriptions.$inferSelect;
export type InsertAISubscription = typeof aiSubscriptions.$inferInsert;

export const aiCredits = mysqlTable("ai_credits", {
  id: id().primaryKey(),
  userId: int("userId").references(() => users.id).notNull().unique(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0").notNull(),
  totalUsed: decimal("totalUsed", { precision: 12, scale: 2 }).default("0").notNull(),
  lastResetDate: bigint("lastResetDate", { mode: "number" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type AICredit = typeof aiCredits.$inferSelect;
export type InsertAICredit = typeof aiCredits.$inferInsert;

export const aiUsage = mysqlTable("ai_usage", {
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
  createdAt: createdAt(),
});

export type AIUsage = typeof aiUsage.$inferSelect;
export type InsertAIUsage = typeof aiUsage.$inferInsert;

export const aiTransactions = mysqlTable("ai_transactions", {
  id: id().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  type: varchar("type", { length: 30 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  stripePaymentId: varchar("stripePaymentId", { length: 255 }),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  status: varchar("status", { length: 10 }).default("pending").notNull(),
  description: text("description"),
  createdAt: createdAt(),
});

export type AITransaction = typeof aiTransactions.$inferSelect;
export type InsertAITransaction = typeof aiTransactions.$inferInsert;

export const blogPosts = mysqlTable("blog_posts", {
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
  updatedAt: updatedAt(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

export const marketingContent = mysqlTable("marketing_content", {
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
  createdAt: createdAt(),
});

export type MarketingContent = typeof marketingContent.$inferSelect;
export type InsertMarketingContent = typeof marketingContent.$inferInsert;

export const marketingCalendar = mysqlTable("marketing_calendar", {
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
  updatedAt: updatedAt(),
});

export type MarketingCalendarEntry = typeof marketingCalendar.$inferSelect;
export type InsertMarketingCalendarEntry = typeof marketingCalendar.$inferInsert;

export const marketingTemplates = mysqlTable("marketing_templates", {
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
  createdAt: createdAt(),
});

export type MarketingTemplate = typeof marketingTemplates.$inferSelect;
export type InsertMarketingTemplate = typeof marketingTemplates.$inferInsert;

export const destinations = mysqlTable("destinations", {
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
  updatedAt: updatedAt(),
});

export type Destination = typeof destinations.$inferSelect;
export type InsertDestination = typeof destinations.$inferInsert;

export const siteSettings = mysqlTable("site_settings", {
  id: id().primaryKey(),
  category: varchar("category", { length: 50 }).notNull(),
  settingKey: varchar("setting_key", { length: 100 }).notNull(),
  settingValue: text("setting_value"),
  updatedBy: int("updated_by").references(() => users.id),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;
