import esbuild from "esbuild";
import fs from "fs";
import path from "path";

async function buildServer() {
  console.log("==========================================");
  console.log("   BUILDING SERVER (CJS & ESM BUNDLES)    ");
  console.log("==========================================");

  // 1. Build index.cjs (CommonJS for cPanel Passenger)
  console.log("[Esbuild] Building index.cjs...");
  await esbuild.build({
    entryPoints: ["server/_core/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    packages: "external",
    outfile: "index.cjs",
    sourcemap: false,
    target: "node18",
  });
  console.log("[Esbuild] Successfully built index.cjs!");

  // Copy to dist/index.cjs as well
  const distDir = path.resolve(process.cwd(), "dist");
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
  fs.copyFileSync("index.cjs", "dist/index.cjs");
  console.log("[Esbuild] Copied to dist/index.cjs");

  // 2. Build index.mjs (ESM)
  console.log("[Esbuild] Building index.mjs...");
  await esbuild.build({
    entryPoints: ["server/_core/index.ts"],
    platform: "node",
    bundle: true,
    format: "esm",
    packages: "external",
    outfile: "index.mjs",
    sourcemap: false,
    target: "node18",
  });
  console.log("[Esbuild] Successfully built index.mjs!");
  fs.copyFileSync("index.mjs", "dist/index.mjs");
  console.log("[Esbuild] Copied to dist/index.mjs");

  console.log("==========================================");
  console.log("   SERVER BUILD COMPLETED WITH SUCCESS!   ");
  console.log("==========================================");
}

buildServer().catch((err) => {
  console.error("[Build Error]:", err);
  process.exit(1);
});
