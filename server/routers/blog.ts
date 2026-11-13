import { z } from "zod";
import { publicProcedure, router, adminProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { PRIORITY_SEO_BLOG_POSTS } from "@shared/seo/priorityBlogPosts";
import {
  getPublishedBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  getAllBlogPosts,
  incrementBlogViewCount,
  getBlogPostsByCategory,
} from "../db";
import {
  list as firestoreList,
  findOne as firestoreFindOne,
  insert as firestoreInsert,
  update as firestoreUpdate,
} from "../_core/firestore-db";
import { db } from "../_core/firebaseAdmin";
import { logError } from "../utils/errorLogger";

function toIsoDate(val: any): string | null {
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
    return new Date(val._seconds * 1000).toISOString();
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function toTimestamp(val: any): number {
  if (!val) return 0;
  if (typeof val?.toDate === "function") {
    try {
      return val.toDate().getTime();
    } catch {
      return 0;
    }
  }
  if (typeof val === "object" && typeof val._seconds === "number") {
    return val._seconds * 1000;
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

export const blogRouter = router({
  // Public: List published blog posts
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
        category: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const { limit = 10, offset = 0, category } = input ?? {};
      try {
        let rawPosts: any[] = [];

        // 1. Try Firestore direct collection query (no composite index requirement)
        try {
          const snap = await db.collection("blogPosts").get();
          if (snap.docs && snap.docs.length > 0) {
            rawPosts = snap.docs.map((d) => ({
              ...d.data(),
              id: Number(d.id) || d.data().id || d.id,
              _docId: d.id,
            }));
          }
        } catch (fsErr) {
          console.warn("[blog.list] Firestore query failed, falling back to local store:", fsErr);
        }

        // 2. Fallback to resilient storeCache/store.json
        if (!rawPosts || rawPosts.length === 0) {
          try {
            rawPosts = (await firestoreList("blogPosts")) as any[];
          } catch {}
        }

        // 3. Fallback to SQLite
        if (!rawPosts || rawPosts.length === 0) {
          try {
            if (category && category !== "All") {
              rawPosts = await getBlogPostsByCategory(category, limit, offset);
            } else {
              rawPosts = await getPublishedBlogPosts(limit, offset);
            }
          } catch {}
        }

        // Merge with PRIORITY_SEO_BLOG_POSTS (avoiding duplicate slugs and filtering out broken test slugs)
        const existingSlugs = new Set(PRIORITY_SEO_BLOG_POSTS.map((p) => p.slug));
        const cleanedRaw = (rawPosts || []).filter(
          (p) =>
            p &&
            p.slug &&
            !existingSlugs.has(p.slug) &&
            !String(p.slug).startsWith("--") &&
            !String(p.slug).startsWith("test-article-") &&
            !String(p.content || "").includes("محادثة مع Gemini") &&
            !String(p.content || "").includes("blog saving verification")
        );
        const combinedPosts = [...PRIORITY_SEO_BLOG_POSTS, ...cleanedRaw];

        // In-memory filter for published status
        let filtered = combinedPosts.filter(
          (post) => post.status === "published" || !post.status
        );

        // Filter by category if specified and not 'All'
        if (category && category !== "All") {
          const catLower = category.toLowerCase().trim();
          filtered = filtered.filter((post) => {
            if (!post.category) return false;
            return post.category.toLowerCase().includes(catLower);
          });
        }

        // Sort descending by publication / creation date
        filtered.sort((a, b) => {
          const timeA = toTimestamp(a.publishedAt || a.createdAt);
          const timeB = toTimestamp(b.publishedAt || b.createdAt);
          return timeB - timeA;
        });

        // Apply pagination
        const paginated = filtered.slice(offset, offset + limit);

        // Validate and normalize dates
        return paginated.map((post) => ({
          ...post,
          publishedAt: toIsoDate(post.publishedAt),
          createdAt: toIsoDate(post.createdAt),
          updatedAt: toIsoDate(post.updatedAt),
        }));
      } catch (err) {
        logError("blog.list", "database error", err, { input });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch blog posts",
        });
      }
    }),

  // Public: Get single post by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      try {
        // 0. Check priority SEO blog posts first
        const priorityPost = PRIORITY_SEO_BLOG_POSTS.find((p) => p.slug === input.slug);
        if (priorityPost) {
          return {
            ...priorityPost,
            publishedAt: toIsoDate(priorityPost.publishedAt),
            createdAt: toIsoDate(priorityPost.createdAt),
            updatedAt: toIsoDate(priorityPost.updatedAt),
          };
        }

        let post: any = null;

        // 1. Try Firestore direct query by slug
        try {
          const snap = await db.collection("blogPosts").where("slug", "==", input.slug).limit(1).get();
          if (!snap.empty) {
            const doc = snap.docs[0];
            post = { ...doc.data(), id: Number(doc.id) || doc.data().id || doc.id, _docId: doc.id };
          }
        } catch (fsErr) {
          console.warn("[blog.getBySlug] Firestore query failed, falling back to local store:", fsErr);
        }

        // 2. Try resilient store
        if (!post) {
          try {
            post = (await firestoreFindOne("blogPosts", [["slug", "==", input.slug]])) as any;
          } catch {}
        }

        // 3. Fallback to SQLite
        if (!post) {
          try {
            post = await getBlogPostBySlug(input.slug);
          } catch {}
        }

        if (!post) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Blog post not found",
          });
        }

        // Increment view count (fire and forget)
        if (post.id) {
          firestoreUpdate("blogPosts", post.id, { viewCount: (post.viewCount || 0) + 1 }).catch(() => {});
          incrementBlogViewCount(post.id).catch((err) => {
            console.warn("[blog.getBySlug] Failed to increment view count:", err);
          });
        }

        return {
          ...post,
          publishedAt: toIsoDate(post.publishedAt),
          createdAt: toIsoDate(post.createdAt),
          updatedAt: toIsoDate(post.updatedAt),
        };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        logError("blog.getBySlug", "database error", err, { slug: input.slug });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch blog post",
        });
      }
    }),

  // Admin: List all posts (including drafts)
  adminList: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const { limit = 50, offset = 0 } = input ?? {};
      try {
        let rawPosts: any[] = [];
        try {
          const snap = await db.collection("blogPosts").get();
          if (snap.docs && snap.docs.length > 0) {
            rawPosts = snap.docs.map((d) => ({
              ...d.data(),
              id: Number(d.id) || d.data().id || d.id,
              _docId: d.id,
            }));
          }
        } catch {}

        if (!rawPosts || rawPosts.length === 0) {
          try {
            rawPosts = (await firestoreList("blogPosts")) as any[];
          } catch {}
        }

        if (!rawPosts || rawPosts.length === 0) {
          try {
            rawPosts = await getAllBlogPosts(limit, offset);
          } catch {}
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
          updatedAt: toIsoDate(post.updatedAt),
        }));
      } catch (err) {
        logError("blog.adminList", "query error", err, { input });
        return [];
      }
    }),

  // Admin: Create blog post
  create: adminProcedure
    .input(
      z.object({
        slug: z.string().min(1).max(255),
        title: z.string().min(1).max(500),
        excerpt: z.string().min(1),
        content: z.string().min(1),
        metaTitle: z.string().max(70).optional(),
        metaDescription: z.string().max(160).optional(),
        metaKeywords: z.string().max(500).optional(),
        coverImageUrl: z.string().url().optional(),
        category: z.string().max(100).optional(),
        tags: z.array(z.string()).optional(),
        status: z.enum(["draft", "published"]).default("draft"),
        readingTime: z.number().min(1).max(60).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const postData = {
          ...input,
          authorId: ctx.user.id,
          authorName: ctx.user.name || "VANIR GROUP",
          publishedAt: input.status === "published" ? new Date().toISOString() : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          viewCount: 0,
        };

        const result = await firestoreInsert("blogPosts", postData);
        createBlogPost(postData as any).catch(() => {});
        return result;
      } catch (err) {
        logError("blog.create", "mutation error", err, { input: { ...input, content: "[omitted]" } });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create blog post",
        });
      }
    }),

  // Admin: Update blog post
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        slug: z.string().min(1).max(255).optional(),
        title: z.string().min(1).max(500).optional(),
        excerpt: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        metaTitle: z.string().max(70).optional(),
        metaDescription: z.string().max(160).optional(),
        metaKeywords: z.string().max(500).optional(),
        coverImageUrl: z.string().url().optional(),
        category: z.string().max(100).optional(),
        tags: z.array(z.string()).optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        readingTime: z.number().min(1).max(60).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, ...data } = input;
        const updateData = {
          ...data,
          publishedAt: data.status === "published" ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        };

        const updated = await firestoreUpdate("blogPosts", id, updateData);
        updateBlogPost(id, updateData as any).catch(() => {});

        if (!updated) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Blog post not found",
          });
        }
        return {
          ...updated,
          publishedAt: toIsoDate(updated.publishedAt),
          createdAt: toIsoDate(updated.createdAt),
          updatedAt: toIsoDate(updated.updatedAt),
        };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        logError("blog.update", "mutation error", err, { postId: input.id });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update blog post",
        });
      }
    }),
});
