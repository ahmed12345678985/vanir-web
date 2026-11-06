import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const rawUrl =
  process.env.DATABASE_URL ||
  process.env.MYSQL_URL;

if (!rawUrl) {
  throw new Error(
    "DATABASE_URL is not set.\n" +
    "Add it in your server environment or .env file.\n" +
    "Format: mysql://username:password@localhost:3306/database_name"
  );
}

const masked = rawUrl.replace(/:([^:@]+)@/, ":***@");
console.log("[drizzle] connecting to:", masked);

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: rawUrl,
  },
  tablesFilter: [
    "users",
    "bookings",
    "reviews",
    "offers",
    "contact_messages",
    "file_uploads",
    "gallery_items",
    "gallery_videos",
    "ai_subscriptions",
    "ai_credits",
    "ai_usage",
    "ai_transactions",
    "blog_posts",
    "marketing_content",
    "marketing_calendar",
    "marketing_templates",
    "destinations",
    "site_settings",
  ],
});
