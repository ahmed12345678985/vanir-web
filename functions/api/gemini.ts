interface Env {
  GEMINI_API_KEY?: string;
  GROQ_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
  OPENAI_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
  DEEVID_API_KEY?: string;
  SEARCHAPI_KEY?: string;
  AI?: {
    run: (model: string, input: Record<string, unknown>) => Promise<any>;
  };
}

interface GeminiPart {
  text?: string;
}

interface GeminiContent {
  role?: "user" | "model";
  parts: GeminiPart[];
}

interface GeminiProxyRequest {
  action?: "chat" | "generate_image" | "generate_video" | "video_status";
  provider?: "auto" | "gemini" | "groq" | "openrouter" | "cloudflare" | "deepseek" | "openai";
  imageEngine?: "auto" | "cf_flux" | "real_photo" | "openai" | "gemini";
  model?: string;
  prompt?: string;
  taskId?: string | number;
  size?: string;
  resolution?: string;
  duration?: number;
  contents?: GeminiContent[];
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

const IMAGE_GEN_MODELS = [
  { type: "gemini" as const, model: "gemini-nano-banana-2.1" },
  { type: "gemini" as const, model: "gemini-3-pro-image" },
  { type: "imagen" as const, model: "imagen-4.0-generate-001" },
  { type: "gemini" as const, model: "gemini-2.5-flash-image" },
];

const BLOCKED_STOCK_HOSTS = [
  "shutterstock",
  "gettyimages",
  "istockphoto",
  "alamy",
  "dreamstime",
  "123rf",
  "depositphotos",
  "vecteezy",
  "stock.adobe",
  "freepik",
];

async function searchRealLuxuryPhoto(searchApiKey: string | undefined, prompt: string): Promise<string | null> {
  const queryText = prompt
    .replace(/ultra-?luxury|editorial|photorealistic|8k|4k|golden hour lighting|no text|no watermarks|cinematic|style:/gi, "")
    .replace(/[,|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90) || "Dubai luxury hotel";

  // 1. Try SearchAPI Google Images
  if (searchApiKey) {
    try {
      const url = `https://www.searchapi.io/api/v1/search?engine=google_images&q=${encodeURIComponent(`${queryText} luxury`)}&api_key=${encodeURIComponent(searchApiKey)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data: any = await res.json();
        const images: any[] = Array.isArray(data?.images)
          ? data.images
          : Array.isArray(data?.images_results)
            ? data.images_results
            : [];
        const clean = images
          .map((img) => {
            const orig =
              typeof img?.original === "string"
                ? img.original
                : img?.original?.link || img?.link || img?.thumbnail || "";
            return String(orig);
          })
          .filter((link) => {
            const lower = link.toLowerCase();
            if (!lower.startsWith("https://")) return false;
            return !BLOCKED_STOCK_HOSTS.some((h) => lower.includes(h));
          });
        if (clean.length > 0) {
          return clean[Math.floor(Math.random() * Math.min(clean.length, 6))];
        }
      }
    } catch {}
  }

  // 2. Free High-Res Wikimedia Commons Fallback (always available, zero watermarks)
  try {
    const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(`${queryText} filetype:bitmap`)}&gsrlimit=8&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=1280&format=json&origin=*`;
    const wRes = await fetch(wikiUrl, { headers: { "User-Agent": "VanirTravelStudio/2.0" } });
    if (wRes.ok) {
      const wJson: any = await wRes.json();
      const pages = Object.values(wJson?.query?.pages || {}) as any[];
      const urls = pages
        .map((p) => p?.imageinfo?.[0]?.thumburl || p?.imageinfo?.[0]?.url || "")
        .filter((u: string) => u.startsWith("https://") && /\.(jpe?g|png|webp)/i.test(u));
      if (urls.length > 0) {
        return urls[Math.floor(Math.random() * Math.min(urls.length, 5))];
      }
    }
  } catch {}

  return null;
}

async function handleImageGeneration(
  env: Env,
  prompt: string,
  imageEngine: "auto" | "cf_flux" | "real_photo" | "openai" | "gemini" = "auto"
): Promise<Response> {
  const cleanPrompt = `${prompt}, luxury editorial travel photography, golden hour lighting, ultra-realistic, 8k, no text, no watermarks`;

  // 1. Real 4K Luxury Photography via Google Images + Wikimedia Commons — Zero AI Distortion
  if (imageEngine === "real_photo") {
    const realUrl = await searchRealLuxuryPhoto(env.SEARCHAPI_KEY, prompt);
    if (realUrl) {
      return new Response(
        JSON.stringify({ imageUrl: realUrl, model: "google-images-hd-real-photo" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 2. Cloudflare Workers AI — Black Forest Labs FLUX.1-schnell (Free, Fast, Crisp, Zero Watermarks)
  if ((imageEngine === "cf_flux" || imageEngine === "auto") && env.AI) {
    try {
      const cfResult: any = await env.AI.run("@cf/black-forest-labs/flux-1-schnell", {
        prompt: cleanPrompt.slice(0, 500),
        steps: 4,
      });
      if (cfResult?.image && typeof cfResult.image === "string") {
        return new Response(
          JSON.stringify({
            imageBase64: cfResult.image,
            mimeType: "image/jpeg",
            model: "@cf/black-forest-labs/flux-1-schnell",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch {
      // Fall through to next provider
    }
  }

  // 3. OpenAI DALL-E 3 HD (if OPENAI_API_KEY is configured)
  if ((imageEngine === "openai" || imageEngine === "auto") && env.OPENAI_API_KEY) {
    try {
      const oaRes = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: cleanPrompt.slice(0, 900),
          n: 1,
          size: "1024x1024",
          quality: "hd",
        }),
      });
      if (oaRes.ok) {
        const oaJson: any = await oaRes.json();
        const url = oaJson?.data?.[0]?.url;
        if (url) {
          return new Response(
            JSON.stringify({ imageUrl: url, model: "openai/dall-e-3-hd" }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }
      }
    } catch {
      // Fall through
    }
  }

  // 4. Google Gemini / Imagen 4 (if GEMINI_API_KEY has image billing quota)
  const apiKey = env.GEMINI_API_KEY;
  if ((imageEngine === "gemini" || imageEngine === "auto") && apiKey) {
    for (const candidate of IMAGE_GEN_MODELS) {
      try {
        if (candidate.type === "gemini") {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${candidate.model}:generateContent?key=${encodeURIComponent(apiKey)}`;
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: cleanPrompt }] }],
              generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
            }),
          });
          if (res.ok) {
            const parsed: any = await res.json();
            const parts = parsed?.candidates?.[0]?.content?.parts || [];
            const imgPart = parts.find((p: any) => p?.inlineData?.data);
            if (imgPart?.inlineData?.data) {
              return new Response(
                JSON.stringify({
                  imageBase64: imgPart.inlineData.data,
                  mimeType: imgPart.inlineData.mimeType || "image/png",
                  model: candidate.model,
                }),
                { status: 200, headers: { "Content-Type": "application/json" } }
              );
            }
          }
        } else {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${candidate.model}:predict?key=${encodeURIComponent(apiKey)}`;
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              instances: [{ prompt: cleanPrompt }],
              parameters: { sampleCount: 1, aspectRatio: "16:9" },
            }),
          });
          if (res.ok) {
            const parsed: any = await res.json();
            const pred = parsed?.predictions?.[0];
            if (pred?.bytesBase64Encoded) {
              return new Response(
                JSON.stringify({
                  imageBase64: pred.bytesBase64Encoded,
                  mimeType: pred.mimeType || "image/png",
                  model: candidate.model,
                }),
                { status: 200, headers: { "Content-Type": "application/json" } }
              );
            }
          }
        }
      } catch {
        // Continue
      }
    }
  }

  // 5. Fallback to Real Luxury Photo via Google Images (if SEARCHAPI_KEY available)
  if (env.SEARCHAPI_KEY) {
    const realUrl = await searchRealLuxuryPhoto(env.SEARCHAPI_KEY, prompt);
    if (realUrl) {
      return new Response(
        JSON.stringify({ imageUrl: realUrl, model: "google-images-hd-fallback" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: "No image engine succeeded. Try switching Image Engine to Real 4K Photo or Cloudflare Flux-1." }),
    { status: 502, headers: { "Content-Type": "application/json" } }
  );
}

const MODEL_CANDIDATES = [
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
];

const GROQ_FREE_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
];

const OPENROUTER_FREE_MODELS = [
  "openrouter/free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-3-27b-it:free",
  "deepseek/deepseek-r1:free",
];

const CLOUDFLARE_AI_MODELS = [
  "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  "@cf/meta/llama-3.1-8b-instruct",
];

function buildChatMessages(
  body: GeminiProxyRequest
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
  if (body.systemInstruction && typeof body.systemInstruction === "string") {
    messages.push({ role: "system", content: body.systemInstruction });
  }
  for (const c of body.contents || []) {
    const content = (c.parts || []).map((p) => p?.text || "").join("").trim();
    if (!content) continue;
    messages.push({
      role: c.role === "model" ? "assistant" : "user",
      content,
    });
  }
  return messages;
}

async function callOpenAICompatible(
  endpoint: string,
  apiKey: string,
  model: string,
  body: GeminiProxyRequest
): Promise<{ ok: boolean; status: number; text?: string; error?: string }> {
  const messages = buildChatMessages(body);
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: typeof body.temperature === "number" ? body.temperature : 0.7,
      max_tokens: typeof body.maxOutputTokens === "number" ? body.maxOutputTokens : 4096,
    }),
  });
  const raw = await resp.text();
  if (!resp.ok) {
    return { ok: false, status: resp.status, error: raw };
  }
  try {
    const parsed = JSON.parse(raw);
    const text = String(parsed?.choices?.[0]?.message?.content || "").trim();
    if (text) return { ok: true, status: 200, text };
  } catch {
    // ignore parse error
  }
  return { ok: false, status: 502, error: raw };
}

async function tryCloudflareAI(
  ai: Env["AI"],
  body: GeminiProxyRequest,
  requestedModel?: string
): Promise<Response | null> {
  if (!ai) return null;
  const messages = buildChatMessages(body);
  const models = requestedModel && requestedModel.startsWith("@cf/")
    ? [requestedModel]
    : CLOUDFLARE_AI_MODELS;

  for (const model of models) {
    try {
      const result = await ai.run(model, {
        messages,
        temperature: typeof body.temperature === "number" ? body.temperature : 0.7,
        max_tokens: typeof body.maxOutputTokens === "number" ? body.maxOutputTokens : 4096,
      });
      const rawOut = result?.response ?? result?.choices?.[0]?.message?.content ?? "";
      const text =
        typeof rawOut === "string"
          ? rawOut.trim()
          : rawOut && typeof rawOut === "object"
            ? JSON.stringify(rawOut)
            : String(rawOut || "").trim();
      if (text) {
        return new Response(
          JSON.stringify({ text, model, provider: "cloudflare" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch {
      // Try next Cloudflare AI model
    }
  }
  return null;
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const apiKey = context.env.GEMINI_API_KEY;

  let body: GeminiProxyRequest;
  try {
    body = (await context.request.json()) as GeminiProxyRequest;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (body?.action === "generate_video" && body?.prompt) {
    const deevidKey = context.env.DEEVID_API_KEY;
    if (!deevidKey) {
      return new Response(
        JSON.stringify({ error: "DEEVID_API_KEY is not configured on Cloudflare Pages." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const dvResp = await fetch("https://api.deevid.ai/v1/open-api/text-video/task/submit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${deevidKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: body.model || "Master V4.0",
        prompt: String(body.prompt).trim(),
        size: body.size || "SIXTEEN_BY_NINE",
        resolution: body.resolution || "480p",
        duration: typeof body.duration === "number" ? body.duration : 5,
      }),
    });
    const dvRaw = await dvResp.text();
    return new Response(dvRaw, {
      status: dvResp.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (body?.action === "video_status" && body?.taskId) {
    const deevidKey = context.env.DEEVID_API_KEY;
    if (!deevidKey) {
      return new Response(
        JSON.stringify({ error: "DEEVID_API_KEY is not configured on Cloudflare Pages." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const statusResp = await fetch(
      `https://api.deevid.ai/v1/open-api/task/status?taskId=${encodeURIComponent(String(body.taskId))}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${deevidKey}` },
      }
    );
    const statusRaw = await statusResp.text();
    return new Response(statusRaw, {
      status: statusResp.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (body?.action === "generate_image" && body?.prompt) {
    // 1. Try Deevid AI Text-to-Image (gpt-image-2, 2K) if DEEVID_API_KEY is configured
    const deevidKey = context.env.DEEVID_API_KEY;
    if (deevidKey) {
      try {
        const cleanPrompt = `${String(body.prompt).trim()}, editorial luxury travel photography, golden hour lighting, ultra-realistic 8k, no text, no watermarks`;
        const submitResp = await fetch("https://api.deevid.ai/v1/open-api/image/text-to-image/task/submit", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${deevidKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: cleanPrompt,
            model: "gpt-image-2",
            size: "AUTO",
            resolution: "2K",
            count: 1,
          }),
        });
        if (submitResp.ok) {
          const submitJson = (await submitResp.json()) as any;
          const taskId = submitJson?.data?.taskId;
          if (taskId) {
            for (let i = 0; i < 8; i++) {
              await new Promise((r) => setTimeout(r, 3000));
              const stResp = await fetch(
                `https://api.deevid.ai/v1/open-api/task/status?taskId=${encodeURIComponent(String(taskId))}`,
                { headers: { Authorization: `Bearer ${deevidKey}` } }
              );
              if (!stResp.ok) continue;
              const stJson = (await stResp.json()) as any;
              const d = stJson?.data;
              if (d?.status === "SUCCESS") {
                const imgUrl =
                  d?.resultImageUrl ||
                  d?.resultImageUrls?.[0] ||
                  d?.images?.[0]?.url ||
                  d?.images?.[0] ||
                  d?.coverImageUrl ||
                  d?.url;
                if (imgUrl && typeof imgUrl === "string") {
                  return new Response(
                    JSON.stringify({ imageUrl: imgUrl, model: "deevid/gpt-image-2" }),
                    { status: 200, headers: { "Content-Type": "application/json" } }
                  );
                }
              }
              if (d?.status === "FAILED" || d?.status === "ERROR") break;
            }
          }
        }
      } catch {
        // Fall through to Gemini / Imagen
      }
    }

    return handleImageGeneration(context.env, String(body.prompt).trim(), body.imageEngine || "auto");
  }

  // Support both Gemini `contents` and OpenAI-style `messages` (used by Social Media Studio)
  if ((!Array.isArray(body?.contents) || body.contents.length === 0) && Array.isArray((body as any)?.messages)) {
    const msgs = (body as any).messages as Array<{ role?: string; content?: string }>;
    const sysMsgs = msgs.filter((m) => m.role === "system" && m.content).map((m) => String(m.content));
    if (sysMsgs.length > 0 && !body.systemInstruction) {
      body.systemInstruction = sysMsgs.join("\n");
    }
    body.contents = msgs
      .filter((m) => m.role !== "system" && m.content)
      .map((m) => ({
        role: m.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: String(m.content) }],
      }));
  }

  if (!Array.isArray(body?.contents) || body.contents.length === 0) {
    return new Response(JSON.stringify({ error: "Missing contents array." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const requestedProvider = body.provider || "auto";
  const requestedModel = body.model ? String(body.model).trim() : "";

  // Route to Groq / OpenRouter (:free) / Cloudflare AI / DeepSeek / OpenAI
  const tryFallbackProviders = async (): Promise<Response | null> => {
    if (requestedProvider === "cloudflare") {
      return tryCloudflareAI(context.env.AI, body, requestedModel);
    }

    const candidates: Array<{ name: string; key?: string; url: string; model: string }> = [];
    if (requestedProvider === "groq") {
      const models = requestedModel ? [requestedModel] : GROQ_FREE_MODELS;
      for (const m of models) {
        candidates.push({
          name: "groq",
          key: context.env.GROQ_API_KEY,
          url: "https://api.groq.com/openai/v1/chat/completions",
          model: m,
        });
      }
    } else if (requestedProvider === "deepseek" || (requestedProvider === "auto" && requestedModel.startsWith("deepseek") && !requestedModel.endsWith(":free"))) {
      candidates.push({
        name: "deepseek",
        key: context.env.DEEPSEEK_API_KEY,
        url: "https://api.deepseek.com/chat/completions",
        model: requestedModel || "deepseek-chat",
      });
    } else if (requestedProvider === "openai" || (requestedProvider === "auto" && requestedModel.startsWith("gpt-"))) {
      candidates.push({
        name: "openai",
        key: context.env.OPENAI_API_KEY,
        url: "https://api.openai.com/v1/chat/completions",
        model: requestedModel || "gpt-4o-mini",
      });
    } else if (requestedProvider === "openrouter") {
      const models = requestedModel ? [requestedModel] : OPENROUTER_FREE_MODELS;
      for (const m of models) {
        candidates.push({
          name: "openrouter",
          key: context.env.OPENROUTER_API_KEY,
          url: "https://openrouter.ai/api/v1/chat/completions",
          model: m,
        });
      }
    } else if (requestedProvider === "auto") {
      if (context.env.GROQ_API_KEY) {
        for (const m of GROQ_FREE_MODELS) {
          candidates.push({
            name: "groq",
            key: context.env.GROQ_API_KEY,
            url: "https://api.groq.com/openai/v1/chat/completions",
            model: m,
          });
        }
      }
      if (context.env.OPENROUTER_API_KEY) {
        for (const m of OPENROUTER_FREE_MODELS) {
          candidates.push({
            name: "openrouter",
            key: context.env.OPENROUTER_API_KEY,
            url: "https://openrouter.ai/api/v1/chat/completions",
            model: m,
          });
        }
      }
      if (context.env.DEEPSEEK_API_KEY) {
        candidates.push({
          name: "deepseek",
          key: context.env.DEEPSEEK_API_KEY,
          url: "https://api.deepseek.com/chat/completions",
          model: "deepseek-chat",
        });
      }
      if (context.env.OPENAI_API_KEY) {
        candidates.push({
          name: "openai",
          key: context.env.OPENAI_API_KEY,
          url: "https://api.openai.com/v1/chat/completions",
          model: "gpt-4o-mini",
        });
      }
    }

    for (const c of candidates) {
      if (!c.key) continue;
      const res = await callOpenAICompatible(c.url, c.key, c.model, body);
      if (res.ok && res.text) {
        return new Response(JSON.stringify({ text: res.text, model: c.model, provider: c.name }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    if (requestedProvider === "auto") {
      const cfRes = await tryCloudflareAI(context.env.AI, body, requestedModel);
      if (cfRes) return cfRes;
    }

    return null;
  };

  // If user explicitly picked groq/openrouter/cloudflare/deepseek/openai, try them first
  if (requestedProvider !== "gemini" && requestedProvider !== "auto") {
    const directRes = await tryFallbackProviders();
    if (directRes) return directRes;
  }

  if (!apiKey) {
    const fallbackRes = await tryFallbackProviders();
    if (fallbackRes) return fallbackRes;
    return new Response(
      JSON.stringify({ error: "No AI provider API key is configured on Cloudflare Pages." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const payload: Record<string, unknown> = {
    contents: body.contents,
    generationConfig: {
      temperature: typeof body.temperature === "number" ? body.temperature : 0.7,
      topP: 0.95,
      maxOutputTokens: typeof body.maxOutputTokens === "number" ? body.maxOutputTokens : 4096,
    },
  };

  if (body.systemInstruction && typeof body.systemInstruction === "string") {
    payload.systemInstruction = {
      parts: [{ text: body.systemInstruction }],
    };
  }

  let lastErrorText = "Gemini request failed";
  let lastStatus = 502;

  for (const model of MODEL_CANDIDATES) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const upstream = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await upstream.text();
      if (upstream.ok) {
        try {
          const parsed = JSON.parse(raw);
          const text =
            parsed?.candidates?.[0]?.content?.parts
              ?.map((p: { text?: string }) => p?.text || "")
              .join("")
              .trim() || "";
          if (text) {
            return new Response(JSON.stringify({ text, reply: text, model }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }
        } catch {
          // Fall through
        }
      }

      lastStatus = upstream.status;
      lastErrorText = raw;

      // Retry briefly on transient 503 overload, otherwise try next candidate on 404
      if (upstream.status === 503 && attempt === 0) {
        await new Promise((r) => setTimeout(r, 900));
        continue;
      }
      break;
    }
  }

  if (requestedProvider === "auto") {
    const fallbackRes = await tryFallbackProviders();
    if (fallbackRes) return fallbackRes;
  }

  return new Response(
    JSON.stringify({ error: lastErrorText }),
    { status: lastStatus, headers: { "Content-Type": "application/json" } }
  );
}
