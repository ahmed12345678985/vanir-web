import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const rootCjs = path.join(__dirname, 'index.cjs');
const distCjs = path.join(__dirname, 'dist', 'index.cjs');

if (fs.existsSync(rootCjs)) {
  console.log('[VANIR] Loading server from root index.cjs');
  require(rootCjs);
} else if (fs.existsSync(distCjs)) {
  console.log('[VANIR] Loading server from dist/index.cjs');
  require(distCjs);
} else {
  import('./index.mjs').catch(console.error);
}