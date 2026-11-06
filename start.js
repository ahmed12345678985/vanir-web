const fs = require('fs');
const path = require('path');

// Guarantee that whichever entrypoint cPanel Phusion Passenger uses, it boots the compiled server
const rootCjs = path.join(__dirname, 'index.cjs');
const distCjs = path.join(__dirname, 'dist', 'index.cjs');

if (fs.existsSync(rootCjs)) {
  console.log('[VANIR] start.js delegating to root index.cjs');
  require(rootCjs);
} else if (fs.existsSync(distCjs)) {
  console.log('[VANIR] start.js delegating to dist/index.cjs');
  require(distCjs);
} else {
  console.error('[VANIR] Fatal: index.cjs not found in', __dirname);
  process.exit(1);
}
