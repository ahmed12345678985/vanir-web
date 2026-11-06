export const ENV = {
  // VITE_APP_ID is the Manus OAuth app id (unused in the Firebase auth flow).
  // Fall back to VITE_FIREBASE_APP_ID so the signed session always carries a
  // stable, non-empty app identifier in production.
  appId: process.env.VITE_APP_ID ?? process.env.VITE_FIREBASE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? process.env.AI_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "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",
  geminiApiKey: process.env.GEMINI_API_KEY ?? process.env.AI_API_KEY ?? process.env.BUILT_IN_FORGE_API_KEY ?? "",
  /** Admin email for direct password login (no OAuth required) */
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  /** SHA-256 hex hash of the admin password */
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH ?? "",

  // Cloudflare R2 Object Storage Configuration
  r2AccountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID ?? "e76590f2e747ceddbc1e62f6b91a48f1",
  r2AccessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? "bf5beddc079c12fccb5c24bbe8d61699",
  r2SecretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? "61f70b7b8f18802548b4d8c3ad4e0614c848b51490d7d4f43368b96442d554bd",
  r2BucketName: process.env.CLOUDFLARE_R2_BUCKET ?? "vanir-assets",
  r2Endpoint: process.env.CLOUDFLARE_R2_ENDPOINT ?? "https://e76590f2e747ceddbc1e62f6b91a48f1.r2.cloudflarestorage.com",

  // Cloudflare Workers AI Configuration
  cloudflareAiAccountId: process.env.CLOUDFLARE_AI_ACCOUNT_ID ?? process.env.CLOUDFLARE_R2_ACCOUNT_ID ?? "e76590f2e747ceddbc1e62f6b91a48f1",
  cloudflareAiToken: process.env.CLOUDFLARE_AI_TOKEN ?? process.env.CLOUDFLARE_API_TOKEN ?? "cfut_I2lql6hEizDUVbeDuoID8afqDIKlkrpFxvl1pTS8570f24a7",
};

