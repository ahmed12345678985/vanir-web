/**
 * OpenAI Image Generation Helper
 * Uses OpenAI API (gpt-image-1.5, chatgpt-image-latest, or dall-e-3)
 * Stores generated images safely and returns permanent URLs
 */
import { storagePut } from "./storage";
import { ENV } from "./_core/env";

export type ImageGenerationOptions = {
  prompt: string;
  size?: "1024x1024" | "1792x1024" | "1024x1792" | "1536x1024" | "1024x1536";
  style?: "vivid" | "natural";
  quality?: "standard" | "hd" | "high" | "max";
  model?: string;
};

export type ImageGenerationResult = {
  url: string;
  s3Key: string;
  revisedPrompt?: string;
};

/**
 * Generate an image using OpenAI API
 * Auto-selects the best available model (gpt-image-1.5 -> chatgpt-image-latest -> dall-e-3)
 */
export async function generateImageWithDALLE(
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  const apiKey = ENV.openaiApiKey;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured. Please add your OpenAI API key.");
  }

  // Determine size
  let targetSize = options.size || "1024x1024";
  if (targetSize === "1792x1024") targetSize = "1536x1024";
  if (targetSize === "1024x1792") targetSize = "1024x1536";

  const modelsToTry = [
    options.model || "gpt-image-1.5",
    "chatgpt-image-latest",
    "dall-e-3",
  ];

  let b64Json: string | null = null;
  let revisedPrompt: string | undefined;
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const payload: any = {
        model,
        prompt: options.prompt,
        n: 1,
        size: targetSize,
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
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const item = data.data?.[0];
      if (item?.b64_json) {
        b64Json = item.b64_json;
        revisedPrompt = item.revised_prompt || undefined;
        break;
      } else if (item?.url) {
        // Fetch image bytes from temporary OpenAI URL
        const imgRes = await fetch(item.url);
        const arrayBuf = await imgRes.arrayBuffer();
        b64Json = Buffer.from(arrayBuf).toString("base64");
        revisedPrompt = item.revised_prompt || undefined;
        break;
      }
    } catch (err: any) {
      lastError = err;
      continue;
    }
  }

  if (!b64Json) {
    throw new Error(`OpenAI image generation failed: ${lastError?.message || "Unknown error"}`);
  }

  // Convert base64 to buffer
  const buffer = Buffer.from(b64Json, "base64");

  // Generate unique filename
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const s3Key = `ai-generated/openai-${timestamp}-${randomSuffix}.png`;

  // Upload to storage
  const { url } = await storagePut(s3Key, buffer, "image/png");

  return {
    url,
    s3Key,
    revisedPrompt,
  };
}
