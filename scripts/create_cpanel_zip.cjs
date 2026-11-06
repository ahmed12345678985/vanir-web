const { execSync } = require('child_process');
const fs = require('fs');

console.log('==============================================');
console.log('   CREATING CLEAN CPANEL DEPLOYMENT ZIP       ');
console.log('==============================================');

// Remove old zips
['cpanel_deploy.zip', 'test_archive.zip'].forEach(f => {
  if (fs.existsSync(f)) {
    try {
      fs.unlinkSync(f);
      console.log(`[Clean] Deleted old ${f}`);
    } catch (e) {
      console.warn(`[Clean] Could not delete ${f}:`, e.message);
    }
  }
});

// Run tar.exe to create zip
const cmd = 'tar.exe -a -c -f cpanel_deploy.zip app.cjs index.cjs index.mjs package.json firebase-key.json gen-lang-client-0364375301-firebase-adminsdk-fbsvc-1ed7e2955b.json public dist server/data/store.json';

console.log('[Packaging] Executing:', cmd);
execSync(cmd, { stdio: 'inherit' });

if (fs.existsSync('cpanel_deploy.zip')) {
  const stat = fs.statSync('cpanel_deploy.zip');
  console.log('==============================================');
  console.log(`[SUCCESS] cpanel_deploy.zip created!`);
  console.log(`[Size]: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
  console.log('==============================================');
} else {
  console.error('[ERROR] Failed to create cpanel_deploy.zip');
  process.exit(1);
}
