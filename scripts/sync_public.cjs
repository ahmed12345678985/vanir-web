const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Copying dist/public to root public...');
copyDir('dist/public', 'public');
console.log('Copy completed!');

const html = fs.readFileSync('public/index.html', 'utf8');
const scriptMatches = html.match(/src="([^"]+index-[^"]+\.js)"/);
const cssMatches = html.match(/href="([^"]+index-[^"]+\.css)"/);

console.log('public/index.html JS bundle:', scriptMatches ? scriptMatches[1] : 'Not found');
console.log('public/index.html CSS bundle:', cssMatches ? cssMatches[1] : 'Not found');
