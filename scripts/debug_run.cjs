process.env.PORT = "5099";
process.env.NODE_ENV = "production";

console.log("[Debug] Requiring ./app.cjs ...");
try {
  require("../app.cjs");
  console.log("[Debug] require('../app.cjs') finished synchronously.");
} catch (err) {
  console.error("[Debug] Catch error requiring app.cjs:", err);
}
