/**
 * Cloudflare Workers AI Image Generation Helper
 * Supports models like "openai/gpt-image-2.5-sunburst" and "@cf/black-forest-labs/flux-1-schnell"
 * Calls Cloudflare Workers AI REST endpoint and stores output using storagePut
 */
import { storagePut } from "./storage";
import { ENV } from "./_core/env";

export type CloudflareImageOptions = {
  prompt: string;
  model?: string; // e.g. "openai/gpt-image-2.5-sunburst" or "@cf/black-forest-labs/flux-1-schnell"
  size?: "1024x1024" | "1536x1024" | "1024x1536";
  quality?: "standard" | "high";
};

export type CloudflareImageResult = {
  url: string;
  s3Key: string;
  revisedPrompt?: string;
  actualModel?: string;
};

/**
 * Generate an image using Cloudflare Workers AI
 * Primary: openai/gpt-image-2.5-sunburst via https://api.cloudflare.com/client/v4/accounts/{account}/ai/run
 * Fallback: @cf/black-forest-labs/flux-1-schnell (Ultra-fast FLUX.1 engine)
 * Returns the public URL and key of the stored image
 */
export async function generateImageWithCloudflare(
  options: CloudflareImageOptions
): Promise<CloudflareImageResult> {
  const accountId = ENV.cloudflareAiAccountId;
  const apiToken = ENV.cloudflareAiToken;

  if (!apiToken) {
    throw new Error(
      "Cloudflare Workers AI token is not configured. Please set CLOUDFLARE_AI_TOKEN."
    );
  }

  const requestedModel = options.model || "openai/gpt-image-2.5-sunburst";
  let actualModel = requestedModel;

  let endpoint: string;
  let requestBody: Record<string, any>;

  if (requestedModel === "openai/gpt-image-2.5-sunburst") {
    // Cloudflare unified run endpoint for partner models
    endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run`;
    requestBody = {
      model: "openai/gpt-image-2.5-sunburst",
      input: {
        prompt: options.prompt,
        quality: options.quality === "high" ? "max" : "high",
        size: options.size || "1024x1024",
      },
    };
  } else {
    // Direct model route (e.g. @cf/black-forest-labs/flux-1-schnell)
    endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${requestedModel}`;
    requestBody = {
      prompt: options.prompt,
    };
  }

  let response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  // If Sunburst hit a 402 Payment Required / BYOK access limit, fall back to native Cloudflare FLUX.1
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
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: options.prompt }),
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
  let imageBuffer: Buffer;
  let mimeType = "image/png";

  if (contentType.includes("application/json")) {
    const data = await response.json();
    const base64Data =
      data.result?.image ||
      data.result ||
      data.image ||
      data.data?.[0]?.b64_json;

    if (!base64Data || typeof base64Data !== "string") {
      throw new Error("No image data found in Cloudflare AI response: " + JSON.stringify(data).slice(0, 200));
    }

    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
    imageBuffer = Buffer.from(cleanBase64, "base64");
    // Check if base64 starts with JPEG magic header (/9j/)
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
    revisedPrompt: actualModel !== requestedModel ? `Generated via Cloudflare FLUX.1 Engine: ${options.prompt}` : undefined,
    actualModel,
  };
}
