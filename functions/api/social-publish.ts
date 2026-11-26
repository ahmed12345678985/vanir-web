/**
 * Cloudflare Pages Function: /api/social-publish
 * Direct publishing to Facebook Page & Instagram Business Account via Meta Graph API v21.0.
 *
 * Environment Secrets (Cloudflare Pages):
 *  - META_PAGE_ACCESS_TOKEN
 *  - META_PAGE_ID
 *  - META_IG_USER_ID
 */

export interface Env {
  META_PAGE_ACCESS_TOKEN?: string;
  META_PAGE_ID?: string;
  META_IG_USER_ID?: string;
  META_APP_SECRET?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_UPLOAD_PRESET?: string;
}

async function computeAppSecretProof(accessToken: string, appSecret?: string): Promise<string | undefined> {
  if (!appSecret || !accessToken) return undefined;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(appSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(accessToken));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function dataUriToBlob(dataUri: string): { blob: Blob; ext: string } | null {
  const match = dataUri.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) return null;
  const mime = match[1];
  const b64 = match[2];
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  const ext = mime.split("/")[1] || "png";
  return { blob: new Blob([bytes], { type: mime }), ext };
}

async function uploadBase64ToCloudinary(env: Env, dataUri: string): Promise<string | null> {
  const cloudName = env.CLOUDINARY_CLOUD_NAME || "gq1svib6";
  const preset = env.CLOUDINARY_UPLOAD_PRESET;
  if (!preset) return null;

  const form = new FormData();
  form.append("file", dataUri);
  form.append("upload_preset", preset);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) return null;
  const data: any = await res.json();
  return data?.secure_url || null;
}

async function publishToFacebook(params: {
  pageId: string;
  accessToken: string;
  appSecretProof?: string;
  message: string;
  imageUrl?: string;
}) {
  const { pageId, accessToken, appSecretProof, message, imageUrl } = params;

  if (imageUrl && imageUrl.startsWith("data:image/")) {
    const converted = dataUriToBlob(imageUrl);
    if (!converted) {
      return { ok: false, error: "Invalid base64 image data." };
    }
    const form = new FormData();
    form.append("source", converted.blob, `vanir-post.${converted.ext}`);
    form.append("caption", message);
    form.append("access_token", accessToken);
    if (appSecretProof) form.append("appsecret_proof", appSecretProof);

    const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/photos`, {
      method: "POST",
      body: form,
    });
    const data: any = await res.json();
    if (!res.ok || data?.error) {
      return { ok: false, error: data?.error?.message || `Facebook photo publish failed (${res.status})` };
    }
    return { ok: true, postId: data?.post_id || data?.id };
  }

  if (imageUrl && /^https?:\/\//i.test(imageUrl)) {
    const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: imageUrl,
        caption: message,
        access_token: accessToken,
        ...(appSecretProof ? { appsecret_proof: appSecretProof } : {}),
      }),
    });
    const data: any = await res.json();
    if (!res.ok || data?.error) {
      return { ok: false, error: data?.error?.message || `Facebook photo publish failed (${res.status})` };
    }
    return { ok: true, postId: data?.post_id || data?.id };
  }

  // Text-only post
  const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      access_token: accessToken,
      ...(appSecretProof ? { appsecret_proof: appSecretProof } : {}),
    }),
  });
  const data: any = await res.json();
  if (!res.ok || data?.error) {
    return { ok: false, error: data?.error?.message || `Facebook feed publish failed (${res.status})` };
  }
  return { ok: true, postId: data?.id };
}

async function hostBase64OnMetaCdn(params: {
  pageId?: string;
  accessToken: string;
  appSecretProof?: string;
  dataUri: string;
}): Promise<string | null> {
  const { pageId, accessToken, appSecretProof, dataUri } = params;
  if (!pageId) return null;
  const converted = dataUriToBlob(dataUri);
  if (!converted) return null;

  const form = new FormData();
  form.append("source", converted.blob, `vanir-ig.${converted.ext}`);
  form.append("published", "false");
  form.append("temporary", "true");
  form.append("access_token", accessToken);
  if (appSecretProof) form.append("appsecret_proof", appSecretProof);

  const upRes = await fetch(`https://graph.facebook.com/v21.0/${encodeURIComponent(pageId)}/photos`, {
    method: "POST",
    body: form,
  });
  const upData: any = await upRes.json().catch(() => ({}));
  const photoId = upData?.id;
  if (!upRes.ok || !photoId) return null;

  const proofParam = appSecretProof ? `&appsecret_proof=${encodeURIComponent(appSecretProof)}` : "";
  const infoRes = await fetch(
    `https://graph.facebook.com/v21.0/${encodeURIComponent(photoId)}?fields=images&access_token=${encodeURIComponent(accessToken)}${proofParam}`
  );
  const infoData: any = await infoRes.json().catch(() => ({}));
  const bestSrc = infoData?.images?.[0]?.source;
  return typeof bestSrc === "string" && bestSrc.startsWith("https://") ? bestSrc : null;
}

async function publishToInstagram(params: {
  env: Env;
  pageId?: string;
  igUserId: string;
  accessToken: string;
  appSecretProof?: string;
  caption: string;
  imageUrl?: string;
}) {
  const { env, pageId, igUserId, accessToken, appSecretProof, caption, imageUrl } = params;
  if (!imageUrl) {
    return { ok: false, error: "Instagram requires an image URL to publish a post." };
  }

  let publicUrl = imageUrl;
  if (imageUrl.startsWith("data:image/")) {
    const uploaded =
      (await uploadBase64ToCloudinary(env, imageUrl)) ||
      (await hostBase64OnMetaCdn({ pageId, accessToken, appSecretProof, dataUri: imageUrl }));
    if (!uploaded) {
      return {
        ok: false,
        error:
          "Instagram Graph API requires a public HTTPS image URL. Could not host image on Meta CDN or Cloudinary.",
      };
    }
    publicUrl = uploaded;
  }

  // Step 1: Create media container
  const createRes = await fetch(`https://graph.facebook.com/v21.0/${igUserId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_url: publicUrl,
      caption,
      access_token: accessToken,
      ...(appSecretProof ? { appsecret_proof: appSecretProof } : {}),
    }),
  });
  const createData: any = await createRes.json();
  if (!createRes.ok || createData?.error || !createData?.id) {
    return {
      ok: false,
      error: createData?.error?.message || `Instagram container creation failed (${createRes.status})`,
    };
  }

  // Step 2: Publish container
  const pubRes = await fetch(`https://graph.facebook.com/v21.0/${igUserId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creation_id: createData.id,
      access_token: accessToken,
      ...(appSecretProof ? { appsecret_proof: appSecretProof } : {}),
    }),
  });
  const pubData: any = await pubRes.json();
  if (!pubRes.ok || pubData?.error) {
    return {
      ok: false,
      error: pubData?.error?.message || `Instagram publish failed (${pubRes.status})`,
    };
  }
  return { ok: true, postId: pubData?.id };
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  return jsonResponse({
    ok: true,
    facebookConfigured: Boolean(env.META_PAGE_ACCESS_TOKEN && env.META_PAGE_ID),
    instagramConfigured: Boolean(env.META_PAGE_ACCESS_TOKEN && env.META_IG_USER_ID),
  });
};

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON body" }, 400);
  }

  const action = String(body.action || "publish").toLowerCase();
  const platform = String(body.platform || "both").toLowerCase();
  const accessToken = String(body.accessToken || env.META_PAGE_ACCESS_TOKEN || "").trim();
  const pageId = String(body.pageId || env.META_PAGE_ID || "").trim();
  const igUserId = String(body.igUserId || env.META_IG_USER_ID || "").trim();
  const appSecret = String(body.appSecret || env.META_APP_SECRET || "").trim();
  const appSecretProof = await computeAppSecretProof(accessToken, appSecret);
  const proofParam = appSecretProof ? `&appsecret_proof=${encodeURIComponent(appSecretProof)}` : "";

  if (!accessToken) {
    return jsonResponse(
      {
        ok: false,
        needsConfiguration: true,
        error: "Meta Page Access Token is not configured yet. Add META_PAGE_ACCESS_TOKEN in Cloudflare Secrets or in the Meta Settings panel.",
      },
      400
    );
  }

  if (action === "verify") {
    const out: Record<string, any> = { ok: true };
    const targetNode = pageId || "me";
    const fbRes = await fetch(
      `https://graph.facebook.com/v21.0/${encodeURIComponent(targetNode)}?fields=id,name,instagram_business_account{id,username}&access_token=${encodeURIComponent(accessToken)}${proofParam}`
    );
    const fbData: any = await fbRes.json();
    let detectedIgId = igUserId || "";
    if (!fbRes.ok || fbData?.error) {
      out.facebook = { ok: false, error: fbData?.error?.message || `HTTP ${fbRes.status}` };
      out.ok = false;
    } else {
      out.facebook = {
        ok: true,
        id: fbData.id,
        name: fbData.name,
        linkedIgId: fbData.instagram_business_account?.id || null,
        linkedIgUsername: fbData.instagram_business_account?.username || null,
      };
      if (!detectedIgId && fbData.instagram_business_account?.id) {
        detectedIgId = fbData.instagram_business_account.id;
        out.instagram = {
          ok: true,
          id: fbData.instagram_business_account.id,
          username: fbData.instagram_business_account.username || "instagram",
        };
      }
    }
    if (igUserId && !out.instagram) {
      const igRes = await fetch(
        `https://graph.facebook.com/v21.0/${encodeURIComponent(igUserId)}?fields=id,username&access_token=${encodeURIComponent(accessToken)}${proofParam}`
      );
      const igData: any = await igRes.json();
      if (!igRes.ok || igData?.error) {
        out.instagram = { ok: false, error: igData?.error?.message || `HTTP ${igRes.status}` };
        out.ok = false;
      } else {
        out.instagram = { ok: true, id: igData.id, username: igData.username };
      }
    }
    return jsonResponse(out, out.ok ? 200 : 400);
  }

  // Auto-resolve pageId & igUserId from accessToken if omitted during publish
  let resolvedPageId = pageId;
  let resolvedIgId = igUserId;
  if ((!resolvedPageId || !resolvedIgId) && accessToken) {
    try {
      const meRes = await fetch(
        `https://graph.facebook.com/v21.0/${encodeURIComponent(resolvedPageId || "me")}?fields=id,instagram_business_account{id}&access_token=${encodeURIComponent(accessToken)}${proofParam}`
      );
      const meData: any = await meRes.json().catch(() => ({}));
      if (meRes.ok && !meData?.error) {
        if (!resolvedPageId && meData.id) resolvedPageId = String(meData.id);
        if (!resolvedIgId && meData.instagram_business_account?.id) {
          resolvedIgId = String(meData.instagram_business_account.id);
        }
      }
    } catch {}
  }

  const results: Record<string, any> = { ok: true };

  if (platform === "facebook" || platform === "both") {
    if (!resolvedPageId) {
      results.facebook = { ok: false, error: "Facebook Page ID (META_PAGE_ID) is missing." };
    } else {
      results.facebook = await publishToFacebook({
        pageId: resolvedPageId,
        accessToken,
        appSecretProof,
        message: String(body.fbCaption || body.igCaption || ""),
        imageUrl: body.imageUrl,
      });
    }
  }

  if (platform === "instagram" || platform === "both") {
    if (!resolvedIgId) {
      results.instagram = { ok: false, error: "Instagram Business Account ID (META_IG_USER_ID) is missing." };
    } else {
      results.instagram = await publishToInstagram({
        env,
        pageId: resolvedPageId,
        igUserId: resolvedIgId,
        accessToken,
        appSecretProof,
        caption: String(body.igCaption || body.fbCaption || ""),
        imageUrl: body.imageUrl,
      });
    }
  }

  const fbOk = results.facebook ? results.facebook.ok : true;
  const igOk = results.instagram ? results.instagram.ok : true;
  results.ok = fbOk && igOk;

  return jsonResponse(results, results.ok ? 200 : 400);
};
