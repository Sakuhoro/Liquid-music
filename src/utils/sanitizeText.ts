/**
 * Known translations for legacy or English Spring collection blurbs.
 */
const KNOWN_ENGLISH_SPRING_MAPPINGS: Record<string, { subtitle?: string; description?: string }> = {
  'delicate piano cantabile of white peach & spring floral dew': {
    subtitle: 'Нежная пианино-кантабиле из белого персика и весенней росы',
    description: 'Утонченная весенняя соната в ре-диез мажоре. Нектар японского белого персика Шимизу с цветущей сакурой и горной весенней водой.',
  },
  'refreshing symphony of italian lemon, bergamot & green tea': {
    subtitle: 'Освежающая симфония сицилийского лимона, бергамота и зеленого чая',
    description: 'Изящная цитрусово-чайная гармония сочных сицилийских лимонов, ароматного бергамота и изысканных нот зеленого чая.',
  },
  'soothing blend of lemon tea & wild sweet teas': {
    subtitle: 'Успокаивающий купаж лимонного и дикого зеленого чая',
    description: 'Успокаивающий и яркий чайный настои с цитрусовым лимонным чаем и насыщенными зелеными нотами.',
  },
  'vibrant mint candy, citrus lime & lemonade refreshment': {
    subtitle: 'Яркая мятная карамель, таитянский лайм и освежающий лимонад',
    description: 'Яркий весенний микс из свежей мяты, холодного таитянского лайма, мятных конфет и искрящегося лимонада.',
  },
  'effervescent tarragon soda, anise, sicilian lemon & marshmallow': {
    subtitle: 'Шипучий тархун, анис, сицилийский лимон и маршмеллоу',
    description: 'Ностальгический тархун, обогащенный сочным сицилийским лимоном, анисом, нежным маршмеллоу и лимонадом.',
  },
  'lush forest fruit medley, alpine strawberry & bavarian cream': {
    subtitle: 'Сочный микс лесных ягод, альпийская земляника и баварский крем',
    description: 'Романтическая фантазия из диких лесных ягод и альпийской земляники в роскошном баварском креме.',
  },
  'ethereal green & fuji apple, pear nectar & floral hibiscus': {
    subtitle: 'Воздушное зеленое яблоко Фуджи, грушевый нектар и гибискус',
    description: 'Утонченное и сказочное сочетание хрустящего зеленого яблока Фуджи, сочной груши, классической ванили и гибискуса.',
  },
  'botanical juniper gin, herbal basil & crisp pear chill': {
    subtitle: 'Ботанический джин, свежий базилик и прохладная груша',
    description: 'Эфирный ботанический микс из свежего базилика, можжевелового джина, спелой груши, лайма и легкой прохлады.',
  },
};

/**
 * Sanitizes localized text string or object to strictly output Russian primary text without English injections.
 */
export function sanitizeRussianText(input: any, isSubtitle = false): string {
  if (!input) return '';

  // If input is an object with language keys e.g. { ru: "...", en: "..." }
  if (typeof input === 'object') {
    if (input.ru) return sanitizeRussianText(input.ru, isSubtitle);
    if (input.russian) return sanitizeRussianText(input.russian, isSubtitle);
    const strVal = Object.values(input).find((v) => typeof v === 'string') as string;
    if (strVal) return sanitizeRussianText(strVal, isSubtitle);
  }

  const textStr = String(input).trim();
  if (!textStr) return '';

  // If text is bilingual with separator e.g. "Освежающий лимон / Refreshing lemon"
  const separators = [' / ', ' | ', ' — ', ' - ', '\n'];
  for (const sep of separators) {
    if (textStr.includes(sep)) {
      const parts = textStr.split(sep).map((p) => p.trim());
      const russianPart = parts.find((p) => /[\u0400-\u04FF]/.test(p));
      if (russianPart) return russianPart;
    }
  }

  // If text already contains Cyrillic (Russian) characters, return as-is
  if (/[\u0400-\u04FF]/.test(textStr)) {
    return textStr;
  }

  // Check known English mappings
  const lowerKey = textStr.toLowerCase().trim();
  for (const [key, map] of Object.entries(KNOWN_ENGLISH_SPRING_MAPPINGS)) {
    if (lowerKey.includes(key) || key.includes(lowerKey)) {
      if (isSubtitle && map.subtitle) return map.subtitle;
      if (!isSubtitle && map.description) return map.description;
    }
  }

  // If string is English and no Cyrillic found, suppress English text
  return '';
}
