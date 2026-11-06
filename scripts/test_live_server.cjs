const http = require("http");
const { spawn } = require("child_process");

async function testServer() {
  console.log("====================================================");
  console.log("   LIVE SERVER HTTP ENDPOINT VERIFICATION TEST      ");
  console.log("====================================================\n");

  const testPort = 5099;
  const env = { ...process.env, PORT: String(testPort), NODE_ENV: "production" };

  console.log(`[Test] Spawning node app.cjs on port ${testPort}...`);
  const serverProc = spawn("node", ["app.cjs"], {
    cwd: process.cwd(),
    env,
    stdio: "inherit", // Inherit stdio so logs are unbuffered directly in console
  });

  serverProc.on("exit", (code) => {
    console.log(`[Test] Server process exited with code ${code}`);
  });

  function request(pathUrl) {
    return new Promise((resolve, reject) => {
      const req = http.get(`http://127.0.0.1:${testPort}${pathUrl}`, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode, body }));
      });
      req.on("error", reject);
      req.setTimeout(3000, () => {
        req.destroy();
        reject(new Error("Request timeout"));
      });
    });
  }

  // Poll server port until responding
  console.log("[Test] Polling http://127.0.0.1:5099/ for HTTP response...");
  let serverReady = false;
  for (let i = 1; i <= 30; i++) {
    await new Promise((r) => setTimeout(r, 800));
    try {
      const ping = await request("/");
      if (ping.status) {
        console.log(`[Test] Server responded on attempt ${i} (Status: ${ping.status})!`);
        serverReady = true;
        break;
      }
    } catch (e) {
      process.stdout.write(`.`);
    }
  }
  console.log("");

  if (!serverReady) {
    console.error("\n[FAIL] Server did not answer on port 5099 after 24 seconds.");
    serverProc.kill();
    process.exit(1);
  }

  let passed = 0;
  let failed = 0;

  try {
    // 1. Check Homepage
    console.log("\n[Test 1] Querying GET / ...");
    const homeRes = await request("/");
    console.log(`Status: ${homeRes.status}`);
    if (homeRes.status === 200 && homeRes.body.includes("<!doctype html>")) {
      console.log("[PASS] Homepage loaded successfully (HTTP 200, HTML valid)");
      passed++;
    } else {
      console.error("[FAIL] Homepage response unexpected:", homeRes.status, homeRes.body.slice(0, 200));
      failed++;
    }

    // 2. Check Gallery tRPC endpoint
    console.log("\n[Test 2] Querying GET /api/trpc/gallery.listVisible ...");
    const galleryRes = await request("/api/trpc/gallery.listVisible?batch=1&input=%7B%7D");
    console.log(`Status: ${galleryRes.status}`);
    if (galleryRes.status === 200) {
      console.log("[PASS] Gallery endpoint returned HTTP 200!");
      try {
        const parsed = JSON.parse(galleryRes.body);
        const data = parsed[0]?.result?.data;
        console.log(`[PASS] Gallery items retrieved: ${Array.isArray(data) ? data.length : 0} items`);
      } catch {}
      passed++;
    } else {
      console.error("[FAIL] Gallery endpoint returned error:", galleryRes.status, galleryRes.body);
      failed++;
    }

    // 3. Check SiteSettings tRPC endpoint
    console.log("\n[Test 3] Querying GET /api/trpc/siteSettings.list ...");
    const settingsRes = await request("/api/trpc/siteSettings.list?batch=1&input=%7B%7D");
    console.log(`Status: ${settingsRes.status}`);
    if (settingsRes.status === 200) {
      console.log("[PASS] Settings endpoint returned HTTP 200!");
      passed++;
    } else {
      console.error("[FAIL] Settings endpoint error:", settingsRes.status, settingsRes.body);
      failed++;
    }

  } catch (err) {
    console.error("[FATAL ERROR during test requests]:", err.message);
    failed++;
  } finally {
    console.log("\n[Test] Shutting down test server process...");
    serverProc.kill();
  }

  console.log("\n====================================================");
  console.log(`   LIVE HTTP TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("====================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

testServer();
