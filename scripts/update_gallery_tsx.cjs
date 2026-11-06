const fs = require('fs');
const path = require('path');

const snippet = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'server', 'data', 'static_gallery_snippet.json'), 'utf8'));
const galleryPath = path.join(__dirname, '..', 'client', 'src', 'pages', 'Gallery.tsx');
let content = fs.readFileSync(galleryPath, 'utf8');

const startMarker = '/* ─── Static Fallback Data ─── */';
const endMarker = '/* ─── Static Video Fallback ─── */';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const newSnippet = '/* ─── Static Fallback Data ─── */\nconst staticGalleryItems: GalleryItemDisplay[] = ' + JSON.stringify(snippet, null, 2) + ';\n\n';
  content = content.slice(0, startIndex) + newSnippet + content.slice(endIndex);
  
  // Also reduce staleTime
  content = content.replace('staleTime: 1000 * 60 * 5, // 5 minutes', 'staleTime: 1000 * 30, // 30 seconds\n    refetchOnMount: "always",');
  
  fs.writeFileSync(galleryPath, content, 'utf8');
  console.log('Successfully updated Gallery.tsx with new staticGalleryItems and fresh staleTime!');
} else {
  console.error('Markers not found! startIndex:', startIndex, 'endIndex:', endIndex);
  process.exit(1);
}
