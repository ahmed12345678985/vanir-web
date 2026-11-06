const path = require("path");
console.log("Testing require('../index.cjs')...");
try {
  const file = path.resolve(__dirname, "..", "index.cjs");
  console.log("Resolved file:", file);
  require(file);
  console.log("require('../index.cjs') succeeded without throwing!");
} catch (err) {
  console.error("Require error:", err);
}
