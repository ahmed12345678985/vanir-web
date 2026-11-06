const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("====================================================");
console.log("   CREATING FAST CPANEL CODE-ONLY ZIP (5MB-10MB)    ");
console.log("====================================================\n");

const stageDir = path.resolve(process.cwd(), "cpanel_code_stage");
if (fs.existsSync(stageDir)) {
  fs.rmSync(stageDir, { recursive: true, force: true });
}
fs.mkdirSync(stageDir, { recursive: true });

// 1. Root files
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
    console.log(`[Stage] Copied: ${file}`);
  }
}

// 2. server/data/store.json
const stageServerData = path.resolve(stageDir, "server", "data");
fs.mkdirSync(stageServerData, { recursive: true });
if (fs.existsSync("server/data/store.json")) {
  fs.copyFileSync("server/data/store.json", path.resolve(stageServerData, "store.json"));
  console.log(`[Stage] Copied: server/data/store.json`);
}

// 3. dist/ server files
const stageDist = path.resolve(stageDir, "dist");
fs.mkdirSync(stageDist, { recursive: true });
for (const f of ["app.cjs", "index.cjs", "index.mjs"]) {
  const src = path.resolve(process.cwd(), "dist", f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.resolve(stageDist, f));
  }
}
console.log(`[Stage] Copied: dist/ entrypoints`);

// 4. dist/public frontend code: index.html, assets, .htaccess, robots.txt, sitemaps
const stageDistPublic = path.resolve(stageDir, "dist", "public");
fs.mkdirSync(stageDistPublic, { recursive: true });

for (const f of ["index.html", ".htaccess", "robots.txt", "sitemap.xml", "sitemap_index.xml", "logo-vanir-app.jpg"]) {
  const src = path.resolve(process.cwd(), "dist", "public", f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.resolve(stageDistPublic, f));
  }
}

// Helper to copy directory recursively
function copyDirRecursive(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".DS_Store") continue;
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log(`[Stage] Copying dist/public/assets...`);
copyDirRecursive(path.resolve(process.cwd(), "dist", "public", "assets"), path.resolve(stageDistPublic, "assets"));

// Also copy to root public/ folder in zip so both structures exist if server serves public/
const stagePublic = path.resolve(stageDir, "public");
fs.mkdirSync(stagePublic, { recursive: true });
for (const f of ["index.html", ".htaccess", "robots.txt", "sitemap.xml", "sitemap_index.xml", "logo-vanir-app.jpg"]) {
  const src = path.resolve(process.cwd(), "dist", "public", f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.resolve(stagePublic, f));
  }
}
copyDirRecursive(path.resolve(process.cwd(), "dist", "public", "assets"), path.resolve(stagePublic, "assets"));

// 5. Create zip
const zipFile = path.resolve(process.cwd(), "cpanel_code_only.zip");
if (fs.existsSync(zipFile)) {
  fs.unlinkSync(zipFile);
}

console.log("\n[Zip] Zipping cpanel_code_only.zip...");
execSync(`zip -rq "${zipFile}" .`, {
  cwd: stageDir,
  stdio: "inherit",
});

const stat = fs.statSync(zipFile);
console.log(`\n====================================================`);
console.log(`[SUCCESS] cpanel_code_only.zip created!`);
console.log(`[PATH]: ${zipFile}`);
console.log(`[SIZE]: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
console.log(`====================================================\n`);

// Clean up stage
fs.rmSync(stageDir, { recursive: true, force: true });
