import { installDomResilience } from "@/lib/domPatcher";
// Immediately install DOM resilience before React mounts
installDomResilience();

import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import superjson from "superjson";
import App from "./App";
// 1. استيراد دالة Auth الآمنة التي تضمن تهيئة Firebase أولاً
import { getFirebaseAuth } from "@/lib/firebase-api";
import { installGlobalImageErrorHandler } from "@/lib/imageFallback";
import { ThemeColorsProvider } from "./contexts/ThemeColorsProvider";
import {
  getFirestoreSetting,
  setFirestoreSetting,
  getFirestoreSettingsByCategory,
  uploadBase64Media,
} from "./lib/siteSettingsApi";
import "./index.css";

// Ensure dark theme is always applied
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('dark');
  installGlobalImageErrorHandler();
}

const queryClient = new QueryClient();

// دالة لإعادة توجيه المستخدم لصفحة الدخول إذا انتهت صلاحية جلسته
const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;
  if (!isUnauthorized) return;

  if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
    window.location.href = "/admin/login";
  }
};

// مراقبة الأخطاء العامة في جلب البيانات
queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    redirectToLoginIfUnauthorized(event.query.state.error);
    console.error("[API Query Error]", event.query.state.error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    redirectToLoginIfUnauthorized(event.mutation.state.error);
    console.error("[API Mutation Error]", event.mutation.state.error);
  }
});

// تحديد رابط الـ API بشكل صحيح حسب النطاق الذي يعمل عليه الموقع.
// نستخدم VITE_API_URL إن وُجد، وإلا نعتمد على نفس نطاق الواجهة الأمامية
// (يدعم التطوير المحلي والإنتاج على Render أو أي استضافة أخرى).
function getApiUrl(): string {
  const env = import.meta.env as Record<string, string | undefined>;
  const configured = env.VITE_API_URL?.replace(/\/$/, "");
  if (configured) return `${configured}/api/trpc`;

  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/trpc`;
  }

  return "/api/trpc";
}

// إنشاء عميل tRPC وتمرير الـ Token الخاص بـ Firebase تلقائياً مع كل طلب
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: getApiUrl(),
      transformer: superjson,
      async fetch(input, init) {
        let token: string | null = null;
        try {
          // 2. جلب نسخة Auth بشكل آمن (تهيّئ Firebase تلقائياً إن لم يكن مهيأ بعد)
          const auth = getFirebaseAuth();
          const currentUser = auth?.currentUser;
          if (currentUser) {
            token = await currentUser.getIdToken();
          }
        } catch (err) {
          console.error("فشل جلب الـ Token من Firebase:", err);
          token = null;
        }

        const headers = new Headers(init?.headers || {});
        // إذا كان للأدمن جلسة نشطة، نرسل الرمز للسيرفر ليفحصه ويسمح بالدخول
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }

        const res = await globalThis.fetch(input, {
          ...(init ?? {}),
          headers,
          credentials: "include",
        });

        // إذا كان الموقع منشوراً كصفحة ساكنة (Cloudflare Pages) والـ API غير متاح (404/405)
        // نعترض طلبات gallery.uploadImage و siteSettings وننفذها مباشرة عبر Firebase
        if (!res.ok || res.status === 404 || res.status === 405) {
          const inputUrl = typeof input === "string" ? input : (input as Request)?.url || "";
          
          // 1. اعتراض رفع الصور gallery.uploadImage
          if (inputUrl.includes("gallery.uploadImage") && init?.body) {
            try {
              const bodyStr = typeof init.body === "string" ? init.body : "";
              const parsed = JSON.parse(bodyStr);
              const dataPayload = parsed["0"]?.json || parsed.json || parsed;
              const { fileData, filename, mimeType } = dataPayload;
              if (fileData) {
                const downloadUrl = await uploadBase64Media(
                  fileData,
                  filename || `upload_${Date.now()}`,
                  mimeType || "image/jpeg",
                  "gallery"
                );
                return new Response(
                  JSON.stringify([{ result: { data: { json: { url: downloadUrl, fileKey: filename } } } }]),
                  { status: 200, headers: { "Content-Type": "application/json" } }
                );
              }
            } catch (err) {
              console.error("[tRPC Interceptor] gallery.uploadImage error:", err);
            }
          }

          // 2. اعتراض حفظ الإعدادات siteSettings.set
          if (inputUrl.includes("siteSettings.set") && init?.body) {
            try {
              const bodyStr = typeof init.body === "string" ? init.body : "";
              const parsed = JSON.parse(bodyStr);
              const dataPayload = parsed["0"]?.json || parsed.json || parsed;
              const { category, key, value } = dataPayload;
              if (category && key) {
                await setFirestoreSetting(category, key, value ?? "");
                return new Response(
                  JSON.stringify([{ result: { data: { json: { success: true } } } }]),
                  { status: 200, headers: { "Content-Type": "application/json" } }
                );
              }
            } catch (err) {
              console.error("[tRPC Interceptor] siteSettings.set error:", err);
            }
          }

          // 3. اعتراض جلب إعداد واحد siteSettings.get
          if (inputUrl.includes("siteSettings.get")) {
            try {
              const urlObj = new URL(inputUrl, window.location.origin);
              const batchParam = urlObj.searchParams.get("batch");
              const inputParam = urlObj.searchParams.get("input");
              if (inputParam) {
                const parsed = JSON.parse(inputParam);
                const queryPayload = parsed["0"]?.json || parsed.json || parsed;
                const { category, key } = queryPayload;
                if (category && key) {
                  const val = await getFirestoreSetting(category, key);
                  return new Response(
                    JSON.stringify([{ result: { data: { json: val } } }]),
                    { status: 200, headers: { "Content-Type": "application/json" } }
                  );
                }
              }
            } catch (err) {
              console.error("[tRPC Interceptor] siteSettings.get error:", err);
            }
          }

          // 4. اعتراض جلب إعدادات فئة siteSettings.getByCategory
          if (inputUrl.includes("siteSettings.getByCategory") || inputUrl.includes("siteSettings.getPublicCategory")) {
            try {
              const urlObj = new URL(inputUrl, window.location.origin);
              const inputParam = urlObj.searchParams.get("input");
              if (inputParam) {
                const parsed = JSON.parse(inputParam);
                const queryPayload = parsed["0"]?.json || parsed.json || parsed;
                const { category } = queryPayload;
                if (category) {
                  const val = await getFirestoreSettingsByCategory(category);
                  return new Response(
                    JSON.stringify([{ result: { data: { json: val } } }]),
                    { status: 200, headers: { "Content-Type": "application/json" } }
                  );
                }
              }
            } catch (err) {
              console.error("[tRPC Interceptor] siteSettings.getByCategory error:", err);
            }
          }

          const contentType = res.headers.get("content-type") || "";
          if (!contentType.includes("application/json")) {
            return new Response(
              JSON.stringify([{ result: { data: { json: null } } }]),
              {
                status: 200,
                headers: { "Content-Type": "application/json" },
              }
            );
          }
        }

        return res;
      },
    }),
  ],
});

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <HelmetProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <ThemeColorsProvider>
            <App />
          </ThemeColorsProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </HelmetProvider>
  );
} else {
  console.error("[VANIR] Root element #root not found!");
}
