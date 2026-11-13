import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseApp } from "./firebase-api";
import { PRIORITY_SEO_BLOG_POSTS, type PriorityBlogPost } from "@shared/seo/priorityBlogPosts";

export { PRIORITY_SEO_BLOG_POSTS };
export type { PriorityBlogPost };

const app = getFirebaseApp();
export const db = getFirestore(app!);
export const storage = getStorage(app!);

export interface BlogPostItem {
  id: string | number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  category: string;
  tags: string[];
  authorName: string;
  status: "published" | "draft" | "archived";
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  readingTime?: number;
  viewCount?: number;
  createdAt?: any;
  updatedAt?: any;
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0621-\u064A-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

function isTestOrBrokenPost(id: string, slug: string, title: string, content: string): boolean {
  const combined = `${id} ${slug} ${title} ${content}`.toLowerCase();
  return (
    id.startsWith("test_post_") ||
    slug.startsWith("test-article-") ||
    slug.startsWith("--") ||
    combined.includes("blog saving verification") ||
    combined.includes("this is test content") ||
    combined.includes("محادثة مع gemini")
  );
}

// 1. جلب كافة المقالات من Firestore مع الدمج التلقائي للمقالات الثابتة
export async function listAllBlogPosts(): Promise<BlogPostItem[]> {
  try {
    const q = query(collection(db, "blog_posts"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const seenSlugs = new Set<string>();
    const firestorePosts: BlogPostItem[] = [];

    for (const docSnap of snapshot.docs) {
      const d = docSnap.data();
      const slug = d.slug || docSnap.id;
      const title = d.title || "بدون عنوان";
      const content = d.content || "";
      if (isTestOrBrokenPost(docSnap.id, slug, title, content)) continue;
      if (seenSlugs.has(slug)) continue;
      seenSlugs.add(slug);

      const rawImg = d.coverImageUrl || d.image || "/images/The_Nile_River_at_Cairo.jpg";
      const coverImageUrl = rawImg === "/The_Nile_River_at_Cairo.jpg" ? "/images/The_Nile_River_at_Cairo.jpg" : rawImg;

      firestorePosts.push({
        id: docSnap.id,
        slug,
        title,
        excerpt: d.excerpt || (content ? content.slice(0, 160) : ""),
        content,
        coverImageUrl,
        category: d.category || "Luxury Travel",
        tags: Array.isArray(d.tags) ? d.tags : (typeof d.tags === "string" ? d.tags.split(",").map((s: string) => s.trim()) : ["Luxury"]),
        authorName: d.authorName || d.author || "Ahmed Roshdi",
        status: (d.status === "draft" || d.status === "archived") ? d.status : "published",
        metaTitle: d.metaTitle,
        metaDescription: d.metaDescription,
        focusKeyword: d.focusKeyword,
        readingTime: d.readingTime,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      });
    }

    // دمج المقالات الثابتة التي لم يتم إضافتها بعد في Firestore
    const staticPosts: BlogPostItem[] = PRIORITY_SEO_BLOG_POSTS
      .filter((p) => !seenSlugs.has(p.slug))
      .map((p) => ({
        id: String(p.id),
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        coverImageUrl: p.coverImageUrl === "/The_Nile_River_at_Cairo.jpg" ? "/images/The_Nile_River_at_Cairo.jpg" : (p.coverImageUrl || "/images/The_Nile_River_at_Cairo.jpg"),
        category: p.category,
        tags: p.tags,
        authorName: p.authorName,
        status: p.status,
        readingTime: p.readingTime,
        viewCount: p.viewCount,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));

    return [...firestorePosts, ...staticPosts];
  } catch (err) {
    console.warn("Error fetching blog posts from Firestore, falling back to static posts:", err);
    return PRIORITY_SEO_BLOG_POSTS.map((p) => ({
      id: String(p.id),
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      coverImageUrl: p.coverImageUrl === "/The_Nile_River_at_Cairo.jpg" ? "/images/The_Nile_River_at_Cairo.jpg" : (p.coverImageUrl || "/images/The_Nile_River_at_Cairo.jpg"),
      category: p.category,
      tags: p.tags,
      authorName: p.authorName,
      status: p.status,
      readingTime: p.readingTime,
      viewCount: p.viewCount,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }
}

// 2. جلب مقال بواسطة Slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPostItem | null> {
  try {
    const q = query(collection(db, "blog_posts"), where("slug", "==", slug));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      const d = docSnap.data();
      return {
        id: docSnap.id,
        slug: d.slug,
        title: d.title,
        excerpt: d.excerpt,
        content: d.content,
        coverImageUrl: d.coverImageUrl || d.image || "/The_Nile_River_at_Cairo.jpg",
        category: d.category || "Luxury Travel",
        tags: Array.isArray(d.tags) ? d.tags : [],
        authorName: d.authorName || "Ahmed Roshdi",
        status: d.status || "published",
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      };
    }
  } catch (err) {
    console.warn("Firestore lookup error for slug:", slug, err);
  }

  // Fallback to static
  const staticPost = PRIORITY_SEO_BLOG_POSTS.find((p) => p.slug === slug);
  if (staticPost) {
    return {
      id: String(staticPost.id),
      slug: staticPost.slug,
      title: staticPost.title,
      excerpt: staticPost.excerpt,
      content: staticPost.content,
      coverImageUrl: staticPost.coverImageUrl || "/The_Nile_River_at_Cairo.jpg",
      category: staticPost.category,
      tags: staticPost.tags,
      authorName: staticPost.authorName,
      status: staticPost.status,
      readingTime: staticPost.readingTime,
      viewCount: staticPost.viewCount,
      createdAt: staticPost.createdAt,
      updatedAt: staticPost.updatedAt,
    };
  }

  return null;
}

// 3. إنشاء أو تعديل مقالة مباشرة في Firestore
export async function saveBlogPost(
  post: {
    id?: string | number | null;
    title: string;
    slug?: string;
    content: string;
    excerpt?: string;
    coverImageUrl?: string;
    category?: string;
    authorName?: string;
    tags?: string[];
    status?: "published" | "draft" | "archived";
  }
): Promise<string> {
  const cleanSlug = post.slug?.trim() || generateSlug(post.title);
  const excerpt = post.excerpt?.trim() || (post.content ? post.content.slice(0, 160) + "..." : "");
  
  const payload: Record<string, any> = {
    title: post.title.trim(),
    slug: cleanSlug,
    content: post.content.trim(),
    excerpt,
    coverImageUrl: post.coverImageUrl?.trim() || "/images/The_Nile_River_at_Cairo.jpg",
    category: post.category?.trim() || "Luxury Travel",
    authorName: post.authorName?.trim() || "Ahmed Roshdi",
    tags: Array.isArray(post.tags) ? post.tags : ["Luxury"],
    status: post.status || "published",
    updatedAt: new Date().toISOString(),
  };

  if (post.id) {
    const docRef = doc(db, "blog_posts", String(post.id));
    await setDoc(docRef, payload, { merge: true });
    return String(post.id);
  } else {
    payload.createdAt = new Date().toISOString();
    const docRef = doc(collection(db, "blog_posts"));
    await setDoc(docRef, payload);
    return docRef.id;
  }
}

// 4. حذف مقالة
export async function deleteBlogPost(id: string | number): Promise<void> {
  await deleteDoc(doc(db, "blog_posts", String(id)));
}

// 5. استيراد وبناء مقالات جماعي (Bulk Import / SEO Batch) مباشرة لـ Firestore مع منع التكرار
export async function bulkImportBlogPosts(
  posts: Array<{
    title: string;
    slug?: string;
    content: string;
    excerpt?: string;
    coverImageUrl?: string;
    category?: string;
    authorName?: string;
    tags?: string[] | string;
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    readingTime?: number;
    status?: "published" | "draft" | "archived";
  }>
): Promise<{ count: number }> {
  let count = 0;
  const nowIso = new Date().toISOString();

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    if (!post.title || !post.title.trim()) continue;
    const cleanTitle = post.title.trim().slice(0, 250);
    const generated = generateSlug(cleanTitle);
    const cleanSlug = (post.slug?.trim() || generated || `vanir-article-${Date.now()}-${i}`)
      .replace(/^[-]+|[-]+$/g, "")
      .slice(0, 200);
    const content = (post.content?.trim() || cleanTitle).slice(0, 95000);
    const excerpt = (post.excerpt?.trim() || (content.length > 155 ? content.replace(/[#*_>`-]/g, "").slice(0, 155).trim() + "..." : content)).slice(0, 1000);
    const words = content.split(/\s+/).filter(Boolean).length;
    const readingTime = post.readingTime || Math.max(2, Math.ceil(words / 180));

    let tagsList: string[] = ["Luxury Travel", "Vanir Group"];
    if (Array.isArray(post.tags)) {
      tagsList = post.tags.map((s) => String(s).trim().slice(0, 80)).filter(Boolean).slice(0, 25);
    } else if (typeof post.tags === "string") {
      tagsList = post.tags.split(",").map((s) => s.trim().slice(0, 80)).filter(Boolean).slice(0, 25);
    }

    const rawCover = post.coverImageUrl?.trim() || "/images/The_Nile_River_at_Cairo.jpg";
    const coverImageUrl = (rawCover === "/The_Nile_River_at_Cairo.jpg" ? "/images/The_Nile_River_at_Cairo.jpg" : rawCover).slice(0, 140000);

    const payload: Record<string, any> = {
      title: cleanTitle,
      slug: cleanSlug,
      content,
      excerpt,
      coverImageUrl,
      category: (post.category?.trim() || "Luxury Travel").slice(0, 150),
      authorName: (post.authorName?.trim() || "Ahmed Roshdi").slice(0, 150),
      tags: tagsList.length > 0 ? tagsList : ["Luxury Travel"],
      metaTitle: (post.metaTitle?.trim() || `${cleanTitle} | VANIR GROUP`).slice(0, 70),
      metaDescription: (post.metaDescription?.trim() || excerpt).slice(0, 160),
      focusKeyword: (post.focusKeyword?.trim() || tagsList[0] || cleanTitle.split(" ").slice(0, 4).join(" ")).slice(0, 120),
      readingTime,
      status: post.status === "draft" || post.status === "archived" ? post.status : "published",
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const docRef = doc(db, "blog_posts", cleanSlug);
    await setDoc(docRef, payload, { merge: true });
    count++;
  }

  return { count };
}

import { compressImageToDataUri } from "./siteSettingsApi";

// 6. رفع صورة مقال مباشرة إلى Firebase Storage مع Fallback فوري للكوتا
export async function uploadBlogImage(file: File): Promise<string> {
  try {
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `blog_assets/${Date.now()}_${sanitizedName}`;
    const fileRef = ref(storage, filename);
    await uploadBytes(fileRef, file, { contentType: file.type });
    return await getDownloadURL(fileRef);
  } catch (err: any) {
    console.warn(`[blogApi] Blog storage upload failed (${err?.code || err?.message}), applying intelligent Data-URI fallback:`, err);
    if (file.type.startsWith("image/")) {
      const dataUri = await compressImageToDataUri(file);
      return dataUri;
    }
    throw err;
  }
}
