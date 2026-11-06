const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("====================================================");
console.log("   PACKAGING CPANEL DEPLOYMENT ZIP (STAGING)        ");
console.log("====================================================\n");

const stageDir = path.resolve(process.cwd(), "cpanel_stage");
if (fs.existsSync(stageDir)) {
  fs.rmSync(stageDir, { recursive: true, force: true });
}
fs.mkdirSync(stageDir, { recursive: true });

// Copy individual critical root files
const rootFiles = [
  "app.cjs",
  "app.js",
  "index.cjs",
  "index.mjs",
  "start.js",
  "package.json",
  ".htaccess",
  ".npmrc",
  ".env",
  ".env.production",
  "firebase-key.json",
  "gen-lang-client-0364375301-firebase-adminsdk-fbsvc-1ed7e2955b.json",
];

for (const file of rootFiles) {
  const src = path.resolve(process.cwd(), file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.resolve(stageDir, file));
    console.log(`[Stage] Copied file: ${file}`);
  }
}

// Copy server/data/store.json
const stageServerData = path.resolve(stageDir, "server", "data");
fs.mkdirSync(stageServerData, { recursive: true });
if (fs.existsSync("server/data/store.json")) {
  fs.copyFileSync("server/data/store.json", path.resolve(stageServerData, "store.json"));
  console.log(`[Stage] Copied server/data/store.json`);
}

// Helper to copy directory recursively (skipping .DS_Store, public.zip, and 0-byte duplicate files)
function copyDirRecursive(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".DS_Store" || entry.name === "public.zip") continue;
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    const st = fs.statSync(srcPath);
    if (st.isFile() && st.size === 0 && /\([0-9]+\)/.test(entry.name)) continue;
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy freshly built dist/public -> stage/public
console.log("[Stage] Copying dist/public/ -> public/ directory...");
copyDirRecursive(fs.existsSync("dist/public") ? "dist/public" : "public", path.resolve(stageDir, "public"));
if (fs.existsSync("public/uploads")) {
  copyDirRecursive("public/uploads", path.resolve(stageDir, "public", "uploads"));
}

// Copy dist/ server entrypoints
console.log("[Stage] Copying dist/ server entrypoints...");
fs.mkdirSync(path.resolve(stageDir, "dist"), { recursive: true });
for (const f of ["app.cjs", "index.cjs", "index.mjs"]) {
  const src = fs.existsSync(path.join("dist", f)) ? path.join("dist", f) : f;
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.resolve(stageDir, "dist", f));
  }
}

console.log("\n[Zip] Creating cpanel_deploy.zip...");
const zipFile = path.resolve(process.cwd(), "cpanel_deploy.zip");
if (fs.existsSync(zipFile)) {
  fs.unlinkSync(zipFile);
}

try {
  if (process.platform === "win32") {
    execSync(`powershell -Command "Compress-Archive -Path '${stageDir}\\*' -DestinationPath '${zipFile}' -Force"`, {
      stdio: "inherit",
    });
  } else {
    execSync(`zip -rq "${zipFile}" .`, {
      cwd: stageDir,
      stdio: "inherit",
    });
  }
  const stat = fs.statSync(zipFile);
  console.log(`\n[SUCCESS] cpanel_deploy.zip created successfully!`);
  console.log(`[SIZE] ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
} catch (err) {
  console.error("[Zip Error]:", err.message);
  process.exit(1);
} finally {
  // Clean up stage dir
  try {
    fs.rmSync(stageDir, { recursive: true, force: true });
  } catch {}
}

console.log("\n====================================================");
console.log("   CPANEL PACKAGE READY FOR UPLOAD AND EXTRACTION    ");
console.log("====================================================");
