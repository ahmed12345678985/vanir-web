const fs = require('fs');
const path = require('path');

// 1. Prefer root CommonJS bundle for seamless synchronous Passenger hook
const rootCjs = path.join(__dirname, 'index.cjs');
const distCjs = path.join(__dirname, 'dist', 'index.cjs');
const rootEsm = path.join(__dirname, 'index.mjs');
const distEsm = path.join(__dirname, 'dist', 'index.mjs');

if (fs.existsSync(rootCjs)) {
  console.log('[VANIR] Loading server from root index.cjs');
  require(rootCjs);
} else if (fs.existsSync(distCjs)) {
  console.log('[VANIR] Loading server from dist/index.cjs');
  require(distCjs);
} else if (fs.existsSync(rootEsm)) {
  console.log('[VANIR] Loading server from root index.mjs');
  const { pathToFileURL } = require('url');
  import(pathToFileURL(rootEsm).href).catch(console.error);
} else if (fs.existsSync(distEsm)) {
  console.log('[VANIR] Loading server from dist/index.mjs');
  const { pathToFileURL } = require('url');
  import(pathToFileURL(distEsm).href).catch(console.error);
} else {
  console.error('[VANIR] No server entrypoint found in', __dirname);
  process.exit(1);
}