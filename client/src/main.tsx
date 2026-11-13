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
import { executeTrpcFirestoreFallback } from "./lib/trpcFirestoreFallback";
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

        const inputUrl = typeof input === "string" ? input : (input as Request)?.url || "";
        const contentType = res.headers.get("content-type") || "";
        const isHtmlFallback = contentType.includes("text/html");
        const isNonJson = !contentType.includes("application/json");

        // إذا كان الموقع منشوراً كصفحة ساكنة (Cloudflare Pages) والـ API غير متاح (404/405 أو إرجاع HTML من SPA router)
        // نعترض جميع طلبات tRPC (المجمّعة batch أو المفردة) وننفذها مباشرة عبر Firebase Firestore
        if (!res.ok || res.status === 404 || res.status === 405 || isHtmlFallback || isNonJson) {
          if (inputUrl.includes("/api/trpc/")) {
            try {
              const urlObj = new URL(inputUrl, window.location.origin);
              const procPath = urlObj.pathname.replace(/^.*\/api\/trpc\//, "");
              const procedures = procPath.split(",").filter(Boolean);
              const isBatch = urlObj.searchParams.get("batch") === "1" || procedures.length > 1;

              let parsedInput: any = {};
              if (init?.body && typeof init.body === "string") {
                try {
                  parsedInput = JSON.parse(init.body);
                } catch {
                  parsedInput = {};
                }
              } else {
                const inputParam = urlObj.searchParams.get("input");
                if (inputParam) {
                  try {
                    parsedInput = JSON.parse(inputParam);
                  } catch {
                    parsedInput = {};
                  }
                }
              }

              const results = await Promise.all(
                procedures.map(async (proc, idx) => {
                  const rawEntry =
                    parsedInput && typeof parsedInput === "object" && String(idx) in parsedInput
                      ? parsedInput[String(idx)]
                      : parsedInput;
                  const payload = rawEntry?.json !== undefined ? rawEntry.json : rawEntry;

                  try {
                    const out = await executeTrpcFirestoreFallback(proc, payload);
                    if (out.handled) {
                      return { result: { data: { json: out.data } } };
                    }
                    return { result: { data: { json: null } } };
                  } catch (procErr: any) {
                    console.error(`[tRPC Firestore Fallback] ${proc} error:`, procErr);
                    return {
                      error: {
                        json: {
                          message: procErr?.message || `Error in ${proc}`,
                          code: -32603,
                          data: {
                            code: "INTERNAL_SERVER_ERROR",
                            httpStatus: 500,
                            path: proc,
                          },
                        },
                      },
                    };
                  }
                })
              );

              return new Response(
                JSON.stringify(isBatch ? results : results[0] ?? { result: { data: { json: null } } }),
                {
                  status: 200,
                  headers: { "Content-Type": "application/json" },
                }
              );
            } catch (err) {
              console.error("[tRPC Interceptor] batch dispatch error:", err);
            }
          }

          if (isNonJson) {
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
