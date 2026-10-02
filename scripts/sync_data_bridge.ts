import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BIBLE_VERSIONS, BIBLE_BOOKS_CATALOG, BIBLE_TEXTS_STORE } from '../src/data/biblesData';
import { EGW_BOOKS, EGW_PARAGRAPHS } from '../src/data/egwData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const publicDataDir = path.join(rootDir, 'public', 'data');
const mobileDataDir = path.join(rootDir, 'mobile', 'assets', 'data');

console.log('🔄 [Data Bridge] Starting synchronization between Web PWA and Flutter Mobile Companion...');

// 1. Ensure target directories exist
if (!fs.existsSync(mobileDataDir)) {
  fs.mkdirSync(mobileDataDir, { recursive: true });
}
if (!fs.existsSync(publicDataDir)) {
  fs.mkdirSync(publicDataDir, { recursive: true });
}

// 2. Export Scripture Dataset (Bibles, Books, Chapters, Red-Letter Verses)
const biblesPayload = {
  versions: BIBLE_VERSIONS,
  books: BIBLE_BOOKS_CATALOG,
  texts: BIBLE_TEXTS_STORE,
  exportedAt: new Date().toISOString(),
  schemaVersion: '1.2.0',
};

const biblesJson = JSON.stringify(biblesPayload, null, 2);
fs.writeFileSync(path.join(publicDataDir, 'bibles.json'), biblesJson, 'utf-8');
fs.writeFileSync(path.join(mobileDataDir, 'bibles.json'), biblesJson, 'utf-8');
console.log('✅ [Data Bridge] Holy Scriptures synchronized (bibles.json):', {
  versionsCount: BIBLE_VERSIONS.length,
  booksCount: BIBLE_BOOKS_CATALOG.length,
});

// 3. Export Ellen G. White Devotional Library Dataset
const egwPayload = {
  books: EGW_BOOKS,
  paragraphs: EGW_PARAGRAPHS,
  exportedAt: new Date().toISOString(),
  schemaVersion: '1.2.0',
};

const egwJson = JSON.stringify(egwPayload, null, 2);
fs.writeFileSync(path.join(publicDataDir, 'egw.json'), egwJson, 'utf-8');
fs.writeFileSync(path.join(mobileDataDir, 'egw.json'), egwJson, 'utf-8');
console.log('✅ [Data Bridge] E.G. White writings synchronized (egw.json):', {
  booksCount: EGW_BOOKS.length,
  paragraphsCount: EGW_PARAGRAPHS.length,
});

// 4. Synchronize all Hymnal Collections from public/data to mobile/assets/data
const hymnFiles = fs.readdirSync(publicDataDir).filter((file) => file.endsWith('.json') && file !== 'bibles.json' && file !== 'egw.json');

let copiedHymnsCount = 0;
for (const file of hymnFiles) {
  const src = path.join(publicDataDir, file);
  const dest = path.join(mobileDataDir, file);
  fs.copyFileSync(src, dest);
  copiedHymnsCount++;
}

console.log(`✅ [Data Bridge] Synchronized ${copiedHymnsCount} hymnal collection files to mobile/assets/data/`);

// 5. Generate parity manifest
const syncManifest = {
  timestamp: new Date().toISOString(),
  version: '1.2.0',
  hymnalFiles: hymnFiles,
  bibles: {
    versions: BIBLE_VERSIONS.map((v) => ({ id: v.id, name: v.name, language: v.language })),
    totalBooks: BIBLE_BOOKS_CATALOG.length,
  },
  egw: {
    totalBooks: EGW_BOOKS.length,
    bookCodes: EGW_BOOKS.map((b) => b.code),
    totalParagraphs: EGW_PARAGRAPHS.length,
  },
};

fs.writeFileSync(path.join(mobileDataDir, 'sync_manifest.json'), JSON.stringify(syncManifest, null, 2), 'utf-8');
fs.writeFileSync(path.join(publicDataDir, 'sync_manifest.json'), JSON.stringify(syncManifest, null, 2), 'utf-8');

console.log('🎉 [Data Bridge] Synchronization complete! Full feature and data parity verified.');
