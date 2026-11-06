const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PIC_DIR = path.join(__dirname, '..', 'pic');
const PIC_SUBDIR = path.join(PIC_DIR, 'pictures');
const CLIENT_GALLERY_DIR = path.join(__dirname, '..', 'client', 'public', 'images', 'gallery');
const PUBLIC_GALLERY_DIR = path.join(__dirname, '..', 'public', 'images', 'gallery');
const STORE_PATH = path.join(__dirname, '..', 'server', 'data', 'store.json');

// Ensure destination directories exist
fs.mkdirSync(CLIENT_GALLERY_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_GALLERY_DIR, { recursive: true });

// Valid image extensions
const VALID_EXTS = new Set(['.jpg', '.jpeg', '.png', '.avif', '.webp']);

const CATEGORIES = [
  { en: "Luxury Travel", ar: "السفر الفاخر", tag: "luxury" },
  { en: "Temples & Monuments", ar: "المعابد والآثار", tag: "heritage" },
  { en: "Desert Safari", ar: "سفاري الصحراء", tag: "safari" },
  { en: "Nile Cruises", ar: "رحلات النيل", tag: "cruises" },
  { en: "Beach & Resorts", ar: "شواطئ ومنتجعات", tag: "beach" },
  { en: "Luxury Hotels", ar: "فنادق فاخرة", tag: "hotels" },
  { en: "City Tours", ar: "جولات المدن", tag: "city" },
  { en: "Adventure", ar: "مغامرات واستكشاف", tag: "adventure" },
];

const TITLES = [
  { en: "Royal Egyptian Journey", ar: "رحلة ملكية في ربوع مصر", descEn: "Exclusive luxury travel through iconic pharaonic wonders.", descAr: "رحلة سفر ملكية فاخرة بين عجائب الحضارة المصرية الخالدة." },
  { en: "Timeless Wonders of Giza", ar: "عجائب أهرامات الجيزة الخالدة", descEn: "Private access to the majestic pyramids and sphinx.", descAr: "زيارة خاصة وحصرية لأهرامات الجيزة العظيمة وأبو الهول." },
  { en: "Golden Desert Safari", ar: "سفاري الصحراء الذهبية", descEn: "Thrilling expeditions across the serene desert dunes.", descAr: "مغامرات شيقة بين الكثبان الرملية والواحات الساحرة." },
  { en: "Royal Nile Elegance", ar: "فخامة النيل الملكية", descEn: "Drifting in bespoke comfort along the ancient river.", descAr: "إبحار فاخر ومريح في هدوء نهر النيل الأسطوري." },
  { en: "Red Sea Coastal Paradise", ar: "سحر شواطئ البحر الأحمر", descEn: "Pristine waters, vibrant coral reefs, and luxury resorts.", descAr: "مياه فيروزية ساحرة وشعاب مرجانية خلابة ومنتجعات عالمية." },
  { en: "Pharaonic Heritage & Grandeur", ar: "عظمة التراث الفرعوني", descEn: "Echoes of ancient kings in monumental temples.", descAr: "عظمة وتاريخ ملوك الفراعنة في المعابد والصروح التاريخية." },
  { en: "Cairo by Night", ar: "سحر ليالي القاهرة", descEn: "Vibrant cultural evenings and historic architectural vistas.", descAr: "أمسيات ثقافية ساحرة بين روعة المعالم التاريخية." },
  { en: "Luxor Valley of the Kings", ar: "وادي الملوك بالأقصر", descEn: "Magnificent tombs and legendary temples of Thebes.", descAr: "مقابر الملوك العظماء والمعابد الأسطورية في طيبة القديمة." },
  { en: "Aswan Nubian Charm", ar: "سحر النوبة في أسوان", descEn: "Tranquil felucca sailing and authentic Nubian hospitality.", descAr: "إبحار هادئ بالفلوكة وكرم الضيافة النوبية الأصيلة." },
  { en: "Alexandria Mediterranean Glow", ar: "بريق عروس البحر الأبيض المتوسط", descEn: "Cosmopolitan elegance along the historic Mediterranean corniche.", descAr: "أناقة الإسكندرية وإطلالات ساحرة على كورنيش البحر الأبيض." },
  { en: "Siwa Oasis Serenity", ar: "هدوء وسحر واحة سيوة", descEn: "Crystal salt lakes, eco-lodges, and starlit desert skies.", descAr: "بحيرات الملح النقية والمنتجعات البيئية تحت سماء الصحراء المرصعة بالنجوم." },
  { en: "Luxury Suite & Fine Hospitality", ar: "أجنحة فاخرة وضيافة استثنائية", descEn: "Five-star comfort tailored for discerning travelers.", descAr: "إقامة فندقية 5 نجوم مصممة خصيصاً لراحة كبار الضيوف." },
];

function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function sanitizeName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_');
}

async function run() {
  console.log('--- Collecting images from pic and pic/pictures ---');
  
  const allFiles = [];

  // Read root pic dir
  if (fs.existsSync(PIC_DIR)) {
    const files = fs.readdirSync(PIC_DIR);
    for (const f of files) {
      const fullPath = path.join(PIC_DIR, f);
      const stat = fs.statSync(fullPath);
      if (stat.isFile()) {
        const ext = path.extname(f).toLowerCase();
        if (VALID_EXTS.has(ext)) {
          allFiles.push({ fullPath, filename: f, size: stat.size });
        }
      }
    }
  }

  // Read pic/pictures subdir
  if (fs.existsSync(PIC_SUBDIR)) {
    const subFiles = fs.readdirSync(PIC_SUBDIR);
    for (const f of subFiles) {
      const fullPath = path.join(PIC_SUBDIR, f);
      const stat = fs.statSync(fullPath);
      if (stat.isFile()) {
        const ext = path.extname(f).toLowerCase();
        if (VALID_EXTS.has(ext)) {
          allFiles.push({ fullPath, filename: f, size: stat.size });
        }
      }
    }
  }

  console.log(`Found ${allFiles.length} total image files.`);

  // Deduplicate by SHA256
  const seenHashes = new Set();
  const uniqueFiles = [];

  for (const item of allFiles) {
    try {
      const hash = getFileHash(item.fullPath);
      if (!seenHashes.has(hash)) {
        seenHashes.add(hash);
        uniqueFiles.push(item);
      }
    } catch (err) {
      console.warn(`Failed to read ${item.fullPath}:`, err.message);
    }
  }

  console.log(`Unique images after deduplication: ${uniqueFiles.length}`);

  // Copy files to client/public/images/gallery and public/images/gallery
  const galleryItems = [];
  const now = new Date().toISOString();

  uniqueFiles.forEach((fileItem, idx) => {
    const cleanName = `vanir_gallery_${String(idx + 1).padStart(3, '0')}_${sanitizeName(fileItem.filename)}`;
    const destClientPath = path.join(CLIENT_GALLERY_DIR, cleanName);
    const destPublicPath = path.join(PUBLIC_GALLERY_DIR, cleanName);

    fs.copyFileSync(fileItem.fullPath, destClientPath);
    fs.copyFileSync(fileItem.fullPath, destPublicPath);

    const cat = CATEGORIES[idx % CATEGORIES.length];
    const titleObj = TITLES[idx % TITLES.length];
    const isFeatured = idx < 12 ? 'yes' : 'no';
    const aspect = idx % 3 === 0 ? 'landscape' : idx % 3 === 1 ? 'portrait' : 'square';

    galleryItems.push({
      id: idx + 1,
      title: `${titleObj.en} #${idx + 1}`,
      titleAr: `${titleObj.ar} #${idx + 1}`,
      category: cat.en,
      categoryAr: cat.ar,
      imageUrl: `/images/gallery/${cleanName}`,
      description: titleObj.descEn,
      descriptionAr: titleObj.descAr,
      location: "Egypt",
      locationAr: "مصر",
      aspect,
      featured: isFeatured,
      sortOrder: idx + 1,
      isVisible: "visible",
      createdAt: now,
      updatedAt: now,
    });
  });

  console.log(`Successfully copied ${galleryItems.length} images to gallery directories.`);

  // Update store.json
  if (fs.existsSync(STORE_PATH)) {
    try {
      const storeData = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
      storeData.gallery_items = galleryItems;
      storeData._counters = storeData._counters || {};
      storeData._counters.gallery_items = galleryItems.length;
      fs.writeFileSync(STORE_PATH, JSON.stringify(storeData, null, 2), 'utf8');
      console.log(`Updated server/data/store.json with ${galleryItems.length} gallery items.`);
    } catch (err) {
      console.error('Failed to update store.json:', err);
    }
  }

  // Output sample for verification
  console.log('Sample item 1:', galleryItems[0]);
  console.log('Sample item 2:', galleryItems[1]);

  // Write a standalone JSON file for easy import/reference
  const metaOut = path.join(__dirname, '..', 'server', 'data', 'gallery_items_imported.json');
  fs.writeFileSync(metaOut, JSON.stringify(galleryItems, null, 2), 'utf8');
  console.log(`Saved gallery metadata to ${metaOut}`);
}

run().catch(console.error);
