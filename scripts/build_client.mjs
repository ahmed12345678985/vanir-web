import { build } from 'vite';

console.log('[Vite Build] Starting programmatic build...');
const startTime = Date.now();

try {
  const result = await build();
  console.log(`[Vite Build] Succeeded in ${((Date.now() - startTime) / 1000).toFixed(1)}s!`);
  process.exit(0);
} catch (err) {
  console.error('[Vite Build] Error:', err);
  process.exit(1);
}
