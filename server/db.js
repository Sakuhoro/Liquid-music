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

  CREATE TABLE IF NOT EXISTS recipes (
    productId TEXT PRIMARY KEY,
    items TEXT NOT NULL,
    updatedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS flavor_prices (
    key TEXT PRIMARY KEY,
    vendor TEXT NOT NULL,
    name TEXT NOT NULL,
    pricePer10ml REAL NOT NULL,
    currency TEXT DEFAULT 'RUB',
    updatedAt TEXT
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
    opusNumber: '',
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
    opusNumber: '',
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
    opusNumber: '',
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
    opusNumber: '',
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
    opusNumber: '',
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
    opusNumber: '',
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
    opusNumber: '',
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
    opusNumber: '',
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
    opusNumber: '',
    aromaticChords: {
      top: 'Ripe Kyoho Grape, Crisp Aloe Vera',
      heart: 'White Muscat Wine, Violet Floral Dew',
      base: 'Sweet Cold Sorbet, Agave Syrup',
    },
    accentColor: '#a855f7',
    isFeatured: 0,
  },
  {
    id: 'renee',
    name: 'Renee',
    subtitle: 'Refreshing Symphony of Italian Lemon, Bergamot & Green Tea',
    description: 'An elegant citrus-tea harmony featuring crisp Sicilian lemons, fragrant bergamot, and delicate green tea notes.',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=500&auto=format&fit=crop&q=80',
    basePrice: 300,
    category: 'Spring',
    musicalKey: 'G Major',
    bpm: 95,
    opusNumber: '',
    aromaticChords: {
      top: 'Italian Lemon Sicily, Bergamot',
      heart: 'Green Tea, Tea Green',
      base: 'WS-23 Cool Mist, Sweet Finish',
    },
    accentColor: '#84cc16',
    isFeatured: 0,
  },
  {
    id: 'on-a-green',
    name: 'On a Green',
    subtitle: 'Soothing Blend of Lemon Tea & Wild Sweet Teas',
    description: 'A soothing and vibrant tea infusion blending citrusy lemon tea with rich green and sweet tea undertones.',
    image: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=500&auto=format&fit=crop&q=80',
    basePrice: 300,
    category: 'Spring',
    musicalKey: 'A Major',
    bpm: 90,
    opusNumber: '',
    aromaticChords: {
      top: 'Lemon Tea Zest',
      heart: 'Green Tea Leaf, Sweet Tea Nectar',
      base: 'Clean Botanical Balance',
    },
    accentColor: '#22c55e',
    isFeatured: 0,
  },
  {
    id: 'mother-nature',
    name: 'Mother Nature',
    subtitle: 'Creamy Yogurt Fusion with Ripe Peaches & Wild Blueberries',
    description: 'Lush Greek yogurt base intertwined with succulent peaches, juicy blueberries, bilberries, and delicate cream.',
    image: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=500&auto=format&fit=crop&q=80',
    basePrice: 300,
    category: 'Summer',
    musicalKey: 'D Major',
    bpm: 105,
    opusNumber: '',
    aromaticChords: {
      top: 'Juicy Blueberry, Ripe Peach',
      heart: 'Greek Yogurt Cream, Yoghurt Base',
      base: 'Bilberry Nectar, Sweet Vanilla Cloud',
    },
    accentColor: '#ec4899',
    isFeatured: 0,
  },
  {
    id: 'red-like-roses',
    name: 'Red like Roses',
    subtitle: 'Botanical Floral Elegance of Elderflower, Rose & Fuji Apple',
    description: 'A sophisticated floral-fruit composition combining elderflower, rose essence, Fuji apple, cold pressed lime, and golden syrup.',
    image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=500&auto=format&fit=crop&q=80',
    basePrice: 300,
    category: 'Autumn',
    musicalKey: 'E Minor',
    bpm: 100,
    opusNumber: '',
    aromaticChords: {
      top: 'Lime Tahity Cold Pressed, Elderflower',
      heart: 'Rose Essence, Fuji Apple',
      base: 'Botanical Gin, Golden Syrup',
    },
    accentColor: '#f43f5e',
    isFeatured: 0,
  },
  {
    id: 'serpent',
    name: 'Serpent',
    subtitle: 'Crisp Green Apple Candy, Citrus Zest & Arctic Chill',
    description: 'A sharp, exhilarating green apple and candy symphony layered with sour apple, lemon lime, and an icy WS-23 finish.',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=500&auto=format&fit=crop&q=80',
    basePrice: 300,
    category: 'Permanent 1',
    musicalKey: 'A Major',
    bpm: 124,
    opusNumber: '',
    aromaticChords: {
      top: 'Green Apple Hard Candy, Sour Apple',
      heart: 'Jelly Candy, Fuji Apple, Lemon Lime',
      base: 'Super Sweet, WS-23 Sub-Zero Mist',
    },
    accentColor: '#10b981',
    isFeatured: 0,
  },
  {
    id: 'spring-true-colors',
    name: 'Spring True Colors',
    subtitle: 'Vibrant Mint Candy, Citrus Lime & Lemonade Refreshment',
    description: 'A glowing spring medley of spearmint leaves, cold pressed tahity lime, mint candy, and sparkling lemonade.',
    image: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=500&auto=format&fit=crop&q=80',
    basePrice: 300,
    category: 'Spring',
    musicalKey: 'G Major',
    bpm: 112,
    opusNumber: '',
    aromaticChords: {
      top: 'Spearmint, Lime Tahity Cold Pressed',
      heart: 'Mint Candy, Lemonade, Lime',
      base: 'Lemon Lime, WS-23 Cool Finish',
    },
    accentColor: '#84cc16',
    isFeatured: 0,
  },
  {
    id: 'strong-hand',
    name: 'Strong Hand',
    subtitle: 'Bold Cranberry Lemonade Elixir & Dark Wild Cherries',
    description: 'A robust and tangy elixir combining sharp cranberries, sweet lemonade compote, and juicy black cherries.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    basePrice: 300,
    category: 'Permanent 2',
    musicalKey: 'D Minor',
    bpm: 118,
    opusNumber: '',
    aromaticChords: {
      top: 'Wild Cranberry, Fresh Lemonade',
      heart: 'Tart Cherries, Sweet Lemon Zest',
      base: 'Cane Sugar, Deep Ruby Finish',
    },
    accentColor: '#b91c1c',
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
          p.opusNumber || '',
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

export const INITIAL_RECIPES_SEED = [
  {
    productId: 'blue-raspberry-symphony',
    items: [
      { vendor: 'CAP', name: 'Grapefruit', mlPer100ml: 4 },
      { vendor: 'CAP', name: 'Juicy Orange', mlPer100ml: 5 },
      { vendor: 'CAP', name: 'Sweet Guava', mlPer100ml: 7 },
      { vendor: 'CAP', name: 'Sweet Tangerine', mlPer100ml: 2 },
      { vendor: 'FA', name: 'Blood Orange', mlPer100ml: 2 },
      { vendor: 'FA', name: 'Passion (passionfruit)', mlPer100ml: 2.5 },
      { vendor: 'TPA', name: 'Dragonfruit', mlPer100ml: 0.5 },
      { vendor: 'CAP', name: 'Super Sweet', mlPer100ml: 0.5 },
    ],
  },
  {
    productId: 'vanilla-caramel-resonance',
    items: [
      { vendor: 'TPA', name: 'Vanilla Custard', mlPer100ml: 5 },
      { vendor: 'FW', name: 'Caramel Candy', mlPer100ml: 4 },
      { vendor: 'CAP', name: 'Super Sweet', mlPer100ml: 0.5 },
    ],
  },
  {
    productId: 'root-beer-crescendo',
    items: [
      { vendor: 'TPA', name: 'Root Beer', mlPer100ml: 6 },
      { vendor: 'FA', name: 'Vanilla Classic', mlPer100ml: 2 },
      { vendor: 'CAP', name: 'Super Sweet', mlPer100ml: 0.5 },
    ],
  },
  {
    productId: 'sakura-blossom-sonata',
    items: [
      { vendor: 'FA', name: 'White Peach', mlPer100ml: 4 },
      { vendor: 'INW', name: 'Cherry Blossom', mlPer100ml: 2 },
      { vendor: 'CAP', name: 'Super Sweet', mlPer100ml: 0.5 },
    ],
  },
  {
    productId: 'golden-mango-rhapsody',
    items: [
      { vendor: 'CAP', name: 'Sweet Mango', mlPer100ml: 6 },
      { vendor: 'FA', name: 'Passion Fruit', mlPer100ml: 3 },
      { vendor: 'TPA', name: 'Key Lime', mlPer100ml: 1 },
    ],
  },
  {
    productId: 'nordic-frost-nocturne',
    items: [
      { vendor: 'TPA', name: 'Spearmint', mlPer100ml: 4 },
      { vendor: 'FA', name: 'Peppermint', mlPer100ml: 2 },
      { vendor: 'INW', name: 'Fir Needle', mlPer100ml: 0.5 },
    ],
  },
  {
    productId: 'espresso-cacao-fugue',
    items: [
      { vendor: 'FA', name: 'Espresso', mlPer100ml: 3 },
      { vendor: 'TPA', name: 'Chocolate Fudge Brownie', mlPer100ml: 4 },
      { vendor: 'FW', name: 'Hazelnut', mlPer100ml: 2 },
    ],
  },
  {
    productId: 'harvest-apple-prelude',
    items: [
      { vendor: 'CAP', name: 'Apple Pie', mlPer100ml: 5 },
      { vendor: 'FA', name: 'Fuji Apple', mlPer100ml: 3 },
      { vendor: 'TPA', name: 'Cinnamon Sugar Cookie', mlPer100ml: 2 },
    ],
  },
  {
    productId: 'celestial-grape-etude',
    items: [
      { vendor: 'INW', name: 'Grape', mlPer100ml: 5 },
      { vendor: 'FA', name: 'Aloe Vera', mlPer100ml: 2 },
      { vendor: 'CAP', name: 'Super Sweet', mlPer100ml: 0.5 },
    ],
  },
  {
    productId: 'renee',
    items: [
      { vendor: 'CAP', name: 'Italian Lemon Sicily', mlPer100ml: 4.5 },
      { vendor: 'FA', name: 'Bergamot', mlPer100ml: 1.5 },
      { vendor: 'FA', name: 'Tea Green', mlPer100ml: 6 },
      { vendor: 'FLV', name: 'Green Tea', mlPer100ml: 3 },
      { vendor: 'OTHR', name: 'WS-23', mlPer100ml: 1 },
      { vendor: 'FA', name: 'Sour wizzard', mlPer100ml: 1 },
      { vendor: 'CAP', name: 'Super Sweet', mlPer100ml: 0.5 },
    ],
  },
  {
    productId: 'on-a-green',
    items: [
      { vendor: 'FLV', name: 'Lemon tea', mlPer100ml: 2 },
      { vendor: 'FLV', name: 'Green Tea', mlPer100ml: 8 },
      { vendor: 'TPA', name: 'Sweet Tea', mlPer100ml: 1 },
    ],
  },
  {
    productId: 'mother-nature',
    items: [
      { vendor: 'VT', name: 'Yoghurt Base', mlPer100ml: 3 },
      { vendor: 'FLV', name: 'Greek Yogurt', mlPer100ml: 2 },
      { vendor: 'FLV', name: 'Sweet Cream', mlPer100ml: 1 },
      { vendor: 'FLV', name: 'Peach', mlPer100ml: 2 },
      { vendor: 'FA', name: 'Blueberry Juicy Ripe', mlPer100ml: 1.5 },
      { vendor: 'FA', name: 'Bilberry', mlPer100ml: 1.5 },
      { vendor: 'CAP', name: 'Super Sweet', mlPer100ml: 0.75 },
    ],
  },
  {
    productId: 'red-like-roses',
    items: [
      { vendor: 'FLV', name: 'Elderflower', mlPer100ml: 0.3 },
      { vendor: 'FLV', name: 'Melon Rind', mlPer100ml: 0.75 },
      { vendor: 'FLV', name: 'Rose Essence', mlPer100ml: 2 },
      { vendor: 'FA', name: 'Apple Fuji', mlPer100ml: 0.5 },
      { vendor: 'FA', name: 'Lime Tahity Cold Pressed', mlPer100ml: 1.5 },
      { vendor: 'VT', name: 'Botanical Gin', mlPer100ml: 3 },
      { vendor: 'VT', name: 'Golden Syrup', mlPer100ml: 1.5 },
      { vendor: 'CAP', name: 'Super Sweet', mlPer100ml: 0.5 },
    ],
  },
  {
    productId: 'serpent',
    items: [
      { vendor: 'CAP', name: 'Green Apple Hard Candy', mlPer100ml: 12 },
      { vendor: 'CAP', name: 'Jelly Candy', mlPer100ml: 0.5 },
      { vendor: 'FLV', name: 'Sour Apple', mlPer100ml: 2 },
      { vendor: 'FA', name: 'Apple Fuji', mlPer100ml: 0.75 },
      { vendor: 'FLV', name: 'Lemon', mlPer100ml: 1 },
      { vendor: 'FA', name: 'Lemon Lime', mlPer100ml: 3.5 },
      { vendor: 'CAP', name: 'Super Sweet', mlPer100ml: 1 },
      { vendor: 'OTHR', name: 'WS-23', mlPer100ml: 3 },
    ],
  },
  {
    productId: 'spring-true-colors',
    items: [
      { vendor: 'FA', name: 'Spearmint', mlPer100ml: 1.5 },
      { vendor: 'FA', name: 'Lime Tahity Cold Pressed', mlPer100ml: 1 },
      { vendor: 'FLV', name: 'Mint Candy', mlPer100ml: 1.5 },
      { vendor: 'FLV', name: 'Lemonade', mlPer100ml: 2.5 },
      { vendor: 'FLV', name: 'Lime', mlPer100ml: 2 },
      { vendor: 'FA', name: 'Lemon Lime', mlPer100ml: 3 },
      { vendor: 'CAP', name: 'Super Sweet', mlPer100ml: 0.5 },
      { vendor: 'OTHR', name: 'WS-23', mlPer100ml: 3 },
    ],
  },
  {
    productId: 'strong-hand',
    items: [
      { vendor: 'CAP', name: 'Cranberry', mlPer100ml: 2 },
      { vendor: 'FLV', name: 'Cranberry', mlPer100ml: 1 },
      { vendor: 'FLV', name: 'Lemonade', mlPer100ml: 2 },
      { vendor: 'FW', name: 'Lemonade', mlPer100ml: 3 },
      { vendor: 'INW', name: 'Cherries', mlPer100ml: 0.75 },
      { vendor: 'CAP', name: 'Super Sweet', mlPer100ml: 0.5 },
    ],
  },
];

export const INITIAL_FLAVOR_PRICES_SEED = [
  { vendor: 'CAP', name: 'Grapefruit', pricePer10ml: 120 },
  { vendor: 'CAP', name: 'Juicy Orange', pricePer10ml: 110 },
  { vendor: 'CAP', name: 'Sweet Guava', pricePer10ml: 130 },
  { vendor: 'CAP', name: 'Sweet Tangerine', pricePer10ml: 115 },
  { vendor: 'FA', name: 'Blood Orange', pricePer10ml: 140 },
  { vendor: 'FA', name: 'Passion (passionfruit)', pricePer10ml: 150 },
  { vendor: 'TPA', name: 'Dragonfruit', pricePer10ml: 100 },
  { vendor: 'CAP', name: 'Super Sweet', pricePer10ml: 160 },
  { vendor: 'CAP', name: 'Italian Lemon Sicily', pricePer10ml: 125 },
  { vendor: 'FA', name: 'Bergamot', pricePer10ml: 135 },
  { vendor: 'FA', name: 'Tea Green', pricePer10ml: 130 },
  { vendor: 'FLV', name: 'Green Tea', pricePer10ml: 150 },
  { vendor: 'OTHR', name: 'WS-23', pricePer10ml: 140 },
  { vendor: 'FA', name: 'Sour wizzard', pricePer10ml: 120 },
  { vendor: 'FLV', name: 'Lemon tea', pricePer10ml: 145 },
  { vendor: 'TPA', name: 'Sweet Tea', pricePer10ml: 110 },
  { vendor: 'VT', name: 'Yoghurt Base', pricePer10ml: 160 },
  { vendor: 'FLV', name: 'Greek Yogurt', pricePer10ml: 155 },
  { vendor: 'FLV', name: 'Sweet Cream', pricePer10ml: 140 },
  { vendor: 'FLV', name: 'Peach', pricePer10ml: 145 },
  { vendor: 'FA', name: 'Blueberry Juicy Ripe', pricePer10ml: 135 },
  { vendor: 'FA', name: 'Bilberry', pricePer10ml: 130 },
  { vendor: 'FLV', name: 'Elderflower', pricePer10ml: 170 },
  { vendor: 'FLV', name: 'Melon Rind', pricePer10ml: 150 },
  { vendor: 'FLV', name: 'Rose Essence', pricePer10ml: 165 },
  { vendor: 'FA', name: 'Apple Fuji', pricePer10ml: 125 },
  { vendor: 'FA', name: 'Lime Tahity Cold Pressed', pricePer10ml: 140 },
  { vendor: 'VT', name: 'Botanical Gin', pricePer10ml: 175 },
  { vendor: 'VT', name: 'Golden Syrup', pricePer10ml: 155 },
  { vendor: 'CAP', name: 'Green Apple Hard Candy', pricePer10ml: 120 },
  { vendor: 'CAP', name: 'Jelly Candy', pricePer10ml: 125 },
  { vendor: 'FLV', name: 'Sour Apple', pricePer10ml: 150 },
  { vendor: 'FLV', name: 'Lemon', pricePer10ml: 145 },
  { vendor: 'FA', name: 'Lemon Lime', pricePer10ml: 135 },
  { vendor: 'FA', name: 'Spearmint', pricePer10ml: 130 },
  { vendor: 'FLV', name: 'Mint Candy', pricePer10ml: 155 },
  { vendor: 'FLV', name: 'Lemonade', pricePer10ml: 145 },
  { vendor: 'FLV', name: 'Lime', pricePer10ml: 140 },
  { vendor: 'CAP', name: 'Cranberry', pricePer10ml: 120 },
  { vendor: 'FLV', name: 'Cranberry', pricePer10ml: 150 },
  { vendor: 'FW', name: 'Lemonade', pricePer10ml: 110 },
  { vendor: 'INW', name: 'Cherries', pricePer10ml: 160 },
];

function seedRecipesAndPrices() {
  const recipeCount = db.prepare('SELECT COUNT(*) as count FROM recipes').get().count;
  if (recipeCount === 0) {
    const insertRecipe = db.prepare(`
      INSERT INTO recipes (productId, items, updatedAt) VALUES (?, ?, ?)
    `);
    const insertMany = db.transaction((recipes) => {
      for (const r of recipes) {
        insertRecipe.run(r.productId, JSON.stringify(r.items), new Date().toISOString());
      }
    });
    insertMany(INITIAL_RECIPES_SEED);
  }

  const priceCount = db.prepare('SELECT COUNT(*) as count FROM flavor_prices').get().count;
  if (priceCount === 0) {
    const insertPrice = db.prepare(`
      INSERT INTO flavor_prices (key, vendor, name, pricePer10ml, currency, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const insertManyPrices = db.transaction((prices) => {
      for (const p of prices) {
        const key = `${p.vendor.trim().toUpperCase()}:${p.name.trim().toLowerCase()}`;
        insertPrice.run(key, p.vendor, p.name, p.pricePer10ml, 'RUB', new Date().toISOString());
      }
    });
    insertManyPrices(INITIAL_FLAVOR_PRICES_SEED);
  }
}

seedDatabase();
seedRecipesAndPrices();

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
    prod.opusNumber || '',
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

// Recipe operations
export function getAllRecipes() {
  const rows = db.prepare('SELECT * FROM recipes').all();
  return rows.map((row) => ({
    productId: row.productId,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
    updatedAt: row.updatedAt,
  }));
}

export function setRecipe(productId, items) {
  const stmt = db.prepare(`
    INSERT INTO recipes (productId, items, updatedAt) VALUES (?, ?, ?)
    ON CONFLICT(productId) DO UPDATE SET items = excluded.items, updatedAt = excluded.updatedAt
  `);
  const now = new Date().toISOString();
  stmt.run(productId, JSON.stringify(items), now);
  return { productId, items, updatedAt: now };
}

export function deleteRecipe(productId) {
  const stmt = db.prepare('DELETE FROM recipes WHERE productId = ?');
  stmt.run(productId);
  return { productId };
}

// Flavor Price operations
export function getAllFlavorPrices() {
  const rows = db.prepare('SELECT * FROM flavor_prices').all();
  return rows.map((row) => ({
    key: row.key,
    vendor: row.vendor,
    name: row.name,
    pricePer10ml: row.pricePer10ml,
    currency: row.currency || 'RUB',
    updatedAt: row.updatedAt,
  }));
}

export function setFlavorPrice(vendor, name, pricePer10ml, currency = 'RUB') {
  const key = `${vendor.trim().toUpperCase()}:${name.trim().toLowerCase()}`;
  const stmt = db.prepare(`
    INSERT INTO flavor_prices (key, vendor, name, pricePer10ml, currency, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET pricePer10ml = excluded.pricePer10ml, currency = excluded.currency, updatedAt = excluded.updatedAt
  `);
  const now = new Date().toISOString();
  stmt.run(key, vendor.trim(), name.trim(), Number(pricePer10ml), currency, now);
  return { key, vendor: vendor.trim(), name: name.trim(), pricePer10ml: Number(pricePer10ml), currency, updatedAt: now };
}

export function deleteFlavorPrice(key) {
  const stmt = db.prepare('DELETE FROM flavor_prices WHERE key = ?');
  stmt.run(key);
  return { key };
}

export default db;
