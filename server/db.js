import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const uploadsDir = path.join(dataDir, 'uploads');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'liquid_music.db');
const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    image TEXT NOT NULL,
    basePrice INTEGER NOT NULL,
    category TEXT NOT NULL,
    musicalKey TEXT,
    bpm INTEGER,
    opusNumber TEXT,
    aromaticChords TEXT,
    accentColor TEXT,
    isFeatured INTEGER DEFAULT 0,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

export const INITIAL_PRODUCTS_SEED = [
  {
    id: 'blue-raspberry-symphony',
    name: 'Blue Raspberry Symphony',
    subtitle: 'Vibrant Allegro for Chilled Mountain Raspberries & Wild Berries',
    description: 'A vibrant orchestral crescendo in E major. Ripe electric blue raspberries steeped in arctic glacial dew, tart blackberry undertones, and sparkling candy sweetness.',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=500&auto=format&fit=crop&q=80',
    basePrice: 300,
    category: 'Permanent 1',
    musicalKey: 'E Major',
    bpm: 128,
    opusNumber: 'Op. 01 No. 1',
    aromaticChords: {
      top: 'Electric Blue Raspberry, Cold Mist',
      heart: 'Wild Mountain Blackberry, Candied Zest',
      base: 'White Sugar Cane, Glacial Clean Finish',
    },
    accentColor: '#38bdf8',
    isFeatured: 1,
  },
  {
    id: 'vanilla-caramel-resonance',
    name: 'Vanilla Caramel Resonance',
    subtitle: 'Warm Acoustic Adagio of Madagascar Vanilla & Torched Amber Caramel',
    description: 'A rich, contemplative acoustic resonance in G minor. Slow-simmered dulce de leche folded into fragrant Bourbon vanilla custard, toasted oak chips, and salted butter toffee.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
    basePrice: 300,
    category: 'Autumn',
    musicalKey: 'G Minor',
    bpm: 72,
    opusNumber: 'Op. 04 No. 2',
    aromaticChords: {
      top: 'Torched Brown Sugar, Sea Salt Flakes',
      heart: 'Madagascar Bourbon Vanilla, Sweet Bavarian Cream',
      base: 'Charred Oak, Warm Amber Molasses',
    },
    accentColor: '#fb923c',
    isFeatured: 1,
  },
  {
    id: 'root-beer-crescendo',
    name: 'Root Beer Crescendo',
    subtitle: 'Spirited Scherzo of Sassafras, Wintergreen & Sparkling Cream',
    description: 'Effervescent vintage charm in B-flat major. Authentic barrel-aged botanical sassafras bark, subtle wintergreen chill, and a velvety dollop of melting vanilla bean ice cream.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    basePrice: 300,
    category: 'Summer',
    musicalKey: 'B♭ Major',
    bpm: 110,
    opusNumber: 'Op. 07 No. 3',
    aromaticChords: {
      top: 'Effervescent Root Botanical, Wintergreen Herb',
      heart: 'Sassafras Bark, Star Anise, Cinnamon Quill',
      base: 'Vanilla Float Cream, Birch Sap Foam',
    },
    accentColor: '#d97706',
    isFeatured: 1,
  },
  {
    id: 'sakura-blossom-sonata',
    name: 'Sakura Blossom Sonata',
    subtitle: 'Delicate Piano Cantabile of White Peach & Spring Floral Dew',
    description: 'A delicate spring sonata in D-flat major. Japanese Shimizu white peach nectar infused with handpicked cherry blossoms and sweet mountain spring water.',
    image: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=500&auto=format&fit=crop&q=80',
    basePrice: 300,
    category: 'Spring',
    musicalKey: 'D♭ Major',
    bpm: 84,
    opusNumber: 'Op. 12 No. 1',
    aromaticChords: {
      top: 'White Peach Nectar, Lychee Dew',
      heart: 'Sakura Cherry Blossom, Silver Needle Tea',
      base: 'Crystal Amber, Clean Alpine Ozone',
    },
    accentColor: '#f472b6',
    isFeatured: 1,
  },
  {
    id: 'golden-mango-rhapsody',
    name: 'Golden Mango Rhapsody',
    subtitle: 'Tropical Vivace of Alphonso Mango, Passionfruit & Key Lime',
    description: 'Sun-drenched rhythmic brilliance. Honey-sweet Indian Alphonso mango puree kissed by tangy Brazilian passionfruit pulp and crisp zest of Florida key lime.',
    image: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=500&auto=format&fit=crop&q=80',
    basePrice: 300,
    category: 'Summer',
    musicalKey: 'C Major',
    bpm: 130,
    opusNumber: 'Op. 18 No. 4',
    aromaticChords: {
      top: 'Alphonso Mango Nectar, Key Lime Zest',
      heart: 'Tart Passionfruit, Coconut Nectar',
      base: 'Raw Turbinado Sugar, Subtle Sea Salt',
    },
    accentColor: '#eab308',
    isFeatured: 0,
  },
  {
    id: 'nordic-frost-nocturne',
    name: 'Nordic Frost Nocturne',
    subtitle: 'Ethereal Serenade of Spearmint, Peppermint & Arctic Pine',
    description: 'Pure sub-zero minimalism in A minor. Crisp alpine spearmint leaves steeped with icy peppermint and a whisper of Siberian fir resin.',
    image: 'https://images.unsplash.com/photo-1517840901100-8179e982acb7?w=500&auto=format&fit=crop&q=80',
    basePrice: 300,
    category: 'Permanent 2',
    musicalKey: 'A Minor',
    bpm: 64,
    opusNumber: 'Op. 22 No. 1',
    aromaticChords: {
      top: 'Sub-Zero Spearmint, Frosted Ozone',
      heart: 'Crisp Peppermint Leaf, Eucalyptus',
      base: 'Alpine Fir Needle, Sweet Birch Water',
    },
    accentColor: '#2dd4bf',
    isFeatured: 0,
  },
  {
    id: 'espresso-cacao-fugue',
    name: 'Espresso Cacao Fugue',
    subtitle: 'Deep Contrapuntal Harmony of Dark Roast & Roasted Hazelnut',
    description: 'An intricate acoustic fugue in F minor. Slow-extracted dark espresso with rich crema, bitter dark chocolate truffle, and crushed toasted hazelnuts.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    basePrice: 300,
    category: 'Permanent 1',
    musicalKey: 'F Minor',
    bpm: 78,
    opusNumber: 'Op. 29 No. 5',
    aromaticChords: {
      top: 'Arabica Crema, Cocoa Nib Dust',
      heart: 'Toasted Hazelnut Butter, Dark Ganache',
      base: 'Smoked Vanilla, Cane Molasses',
    },
    accentColor: '#78716c',
    isFeatured: 0,
  },
  {
    id: 'harvest-apple-prelude',
    name: 'Harvest Apple Prelude',
    subtitle: 'Warm Orchestral Tone of Spiced Honeycrisp & Bourbon Cask',
    description: 'Autumnal nostalgia in D major. Freshly sliced Honeycrisp apples simmered with Ceylon cinnamon, nutmeg, clover honey, and toasted oak.',
    image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=500&auto=format&fit=crop&q=80',
    basePrice: 300,
    category: 'Autumn',
    musicalKey: 'D Major',
    bpm: 88,
    opusNumber: 'Op. 35 No. 2',
    aromaticChords: {
      top: 'Crisp Honeycrisp Skin, Red Currant',
      heart: 'Ceylon Cinnamon, Golden Honey Glaze',
      base: 'Aged Bourbon Cask, Graham Crust',
    },
    accentColor: '#ea580c',
    isFeatured: 0,
  },
  {
    id: 'celestial-grape-etude',
    name: 'Celestial Grape Étude',
    subtitle: 'Bright Virtuoso Melody of Japanese Kyoho Grape & Aloe Vera',
    description: 'Velvety sweet purple Kyoho grape compote harmonized with soothing aloe vera gel, white grape juice, and chilled soda sparkle.',
    image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=500&auto=format&fit=crop&q=80',
    basePrice: 300,
    category: 'Permanent 2',
    musicalKey: 'F Major',
    bpm: 116,
    opusNumber: 'Op. 42 No. 3',
    aromaticChords: {
      top: 'Ripe Kyoho Grape, Crisp Aloe Vera',
      heart: 'White Muscat Wine, Violet Floral Dew',
      base: 'Sweet Cold Sorbet, Agave Syrup',
    },
    accentColor: '#a855f7',
    isFeatured: 0,
  },
];

// Helper to seed initial products if empty
function seedDatabase() {
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM products');
  const { count } = countStmt.get();
  if (count === 0) {
    const insertStmt = db.prepare(`
      INSERT INTO products (
        id, name, subtitle, description, image, basePrice, category,
        musicalKey, bpm, opusNumber, aromaticChords, accentColor, isFeatured, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((products) => {
      for (const p of products) {
        insertStmt.run(
          p.id,
          p.name,
          p.subtitle || '',
          p.description || '',
          p.image,
          p.basePrice,
          p.category,
          p.musicalKey || 'C Major',
          p.bpm || 120,
          p.opusNumber || 'Op. 01',
          JSON.stringify(p.aromaticChords || {}),
          p.accentColor || '#38bdf8',
          p.isFeatured ? 1 : 0,
          new Date().toISOString()
        );
      }
    });

    insertMany(INITIAL_PRODUCTS_SEED);
  }
}

seedDatabase();

export function getAllProducts() {
  const rows = db.prepare('SELECT * FROM products ORDER BY rowid ASC').all();
  return rows.map((row) => ({
    ...row,
    isFeatured: Boolean(row.isFeatured),
    aromaticChords: typeof row.aromaticChords === 'string' ? JSON.parse(row.aromaticChords) : row.aromaticChords,
  }));
}

export function addProduct(prod) {
  const stmt = db.prepare(`
    INSERT INTO products (
      id, name, subtitle, description, image, basePrice, category,
      musicalKey, bpm, opusNumber, aromaticChords, accentColor, isFeatured, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    prod.id,
    prod.name,
    prod.subtitle || '',
    prod.description || '',
    prod.image,
    prod.basePrice,
    prod.category,
    prod.musicalKey || 'C Major',
    prod.bpm || 120,
    prod.opusNumber || `Op. ${Date.now().toString().slice(-3)}`,
    JSON.stringify(prod.aromaticChords || { top: '', heart: '', base: '' }),
    prod.accentColor || '#38bdf8',
    prod.isFeatured ? 1 : 0,
    new Date().toISOString()
  );

  return prod;
}

export function updateProduct(prod) {
  const stmt = db.prepare(`
    UPDATE products SET
      name = ?,
      subtitle = ?,
      description = ?,
      image = ?,
      basePrice = ?,
      category = ?,
      musicalKey = ?,
      bpm = ?,
      opusNumber = ?,
      aromaticChords = ?,
      accentColor = ?,
      isFeatured = ?
    WHERE id = ?
  `);

  stmt.run(
    prod.name,
    prod.subtitle || '',
    prod.description || '',
    prod.image,
    prod.basePrice,
    prod.category,
    prod.musicalKey || 'C Major',
    prod.bpm || 120,
    prod.opusNumber || '',
    JSON.stringify(prod.aromaticChords || { top: '', heart: '', base: '' }),
    prod.accentColor || '#38bdf8',
    prod.isFeatured ? 1 : 0,
    prod.id
  );

  return prod;
}

export function deleteProduct(id) {
  const stmt = db.prepare('DELETE FROM products WHERE id = ?');
  stmt.run(id);
  return { id };
}

export function resetProducts() {
  db.prepare('DELETE FROM products').run();
  seedDatabase();
  return getAllProducts();
}

export function getSetting(key) {
  const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  const row = stmt.get(key);
  return row ? row.value : null;
}

export function setSetting(key, value) {
  const stmt = db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  stmt.run(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
}

export default db;
