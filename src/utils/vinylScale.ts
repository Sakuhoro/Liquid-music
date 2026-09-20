export const IMAGE_SCALE_OVERRIDES: Record<string, number> = {
  // On a Green
  'on-a-green': 0.8,
  'on a green': 0.8,

  // Red Like Roses
  'red-like-roses': 0.95,
  'red like roses': 0.95,

  // Serpent / Serpnet
  serpent: 0.95,
  serpnet: 0.95,

  // Spring true colors
  'spring-true-colors': 0.95,
  'spring true colors': 0.95,

  // Strong hand / Stront hand
  'strong-hand': 1.15,
  'strong hand': 1.15,
  'stront-hand': 1.15,
  'stront hand': 1.15,

  // Oscura
  oscura: 0.9,

  // Gira Gira
  'gira-gira': 1.1,
  'gira gira': 1.1,

  // Holssi
  holssi: 0.95,

  // Blueming
  blueming: 1.15,

  // Tragica
  tragica: 0.95,

  // Rising
  rising: 0.95,

  // Recover
  recover: 1.05,

  // Up in arms
  'up-in-arms': 1.05,
  'up in arms': 1.05,

  // Serotonin
  serotonin: 1.05,

  // Sky musings / Sku mussings
  'sky-musings': 1.05,
  'sky musings': 1.05,
  'sku-mussings': 1.05,
  'sku mussings': 1.05,

  // Every cloud
  'every-cloud': 1.05,
  'every cloud': 1.05,

  // Patriot Anthem
  'patriot-anthem': 0.9,
  'patriot anthem': 0.9,

  // Subutex
  subutex: 1.05,

  // Goth
  goth: 1.1,

  // Last moment
  'last-moment': 1.05,
  'last moment': 1.05,

  // Grandma
  grandma: 0.95,

  // Mezame
  mezame: 1.05,

  // Under the Tide
  'under-the-tide': 0.95,
  'under the tide': 0.95,

  // Fallen angel
  'fallen-angel': 0.9,
  'fallen angel': 0.9,

  // Darkened
  darkened: 0.95,

  // Alicia
  alicia: 0.95,

  // Artificial angels / Artifical angels
  'artificial-angels': 0.95,
  'artificial angels': 0.95,
  'artifical-angels': 0.95,
  'artifical angels': 0.95,

  // Going under
  'going-under': 0.95,
  'going under': 0.95,

  // Immortal
  immortal: 0.95,

  // Miss Anthropocene / Miss Antropocene
  'miss-anthropocene': 0.9,
  'miss anthropocene': 0.9,
  'miss-antropocene': 0.9,
  'miss antropocene': 0.9,

  // Songs gehasst
  'songs-gehasst': 0.9,
  'songs gehasst': 0.9,
};

export function getItemScale(item?: any): number {
  if (!item) return 1.0;

  const keysToTest = [item.id, item.name, item.title].filter(Boolean);

  for (const rawKey of keysToTest) {
    const keyStr = String(rawKey).trim().toLowerCase();

    // Direct match
    if (IMAGE_SCALE_OVERRIDES[keyStr] !== undefined) {
      return IMAGE_SCALE_OVERRIDES[keyStr];
    }

    // Normalized key (hyphenated to spaced or vice versa)
    const spacedKey = keyStr.replace(/[-_]+/g, ' ');
    if (IMAGE_SCALE_OVERRIDES[spacedKey] !== undefined) {
      return IMAGE_SCALE_OVERRIDES[spacedKey];
    }

    const hyphenKey = keyStr.replace(/\s+/g, '-');
    if (IMAGE_SCALE_OVERRIDES[hyphenKey] !== undefined) {
      return IMAGE_SCALE_OVERRIDES[hyphenKey];
    }

    // Cleaned non-alphanumeric match
    const cleanKey = keyStr.replace(/[^a-z0-9]/g, '');
    for (const [ovKey, factor] of Object.entries(IMAGE_SCALE_OVERRIDES)) {
      if (ovKey.replace(/[^a-z0-9]/g, '') === cleanKey) {
        return factor;
      }
    }
  }

  return 1.0;
}
