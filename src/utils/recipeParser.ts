import { RecipeItem } from '../types';

const KNOWN_VENDORS = [
  'CAP',
  'TPA',
  'TFA',
  'FA',
  'FW',
  'INW',
  'FLV',
  'JF',
  'VT',
  'SSA',
  'LA',
  'WF',
  'RF',
  'FE',
  'HS',
  'MB',
  'PUR',
  'SOL',
];

/**
 * Parses raw text input representing e-liquid recipe lines into structured RecipeItem objects.
 * Handles dirty input, attached vendor prefixes (e.g., CAPJuicy Orange),
 * decimal commas/dots (e.g. 2,5 or 0.5), trailing numeric values without spaces (e.g. Sweet Tangerine2), etc.
 */
export function parseRecipeText(text: string): RecipeItem[] {
  if (!text || !text.trim()) return [];

  const lines = text.split('\n');
  const items: RecipeItem[] = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Normalize vendor prefix if glued to flavor name without space (e.g., "CAPJuicy Orange 5")
    for (const vendor of KNOWN_VENDORS) {
      const vendorRegex = new RegExp(`^(${vendor})([A-Za-z0-9].*)$`, 'i');
      if (vendorRegex.test(line)) {
        line = line.replace(vendorRegex, '$1 $2');
        break;
      }
    }

    // Replace comma with dot in numeric percentages
    line = line.replace(/(\d+),(\d+)/g, '$1.$2');

    // Handle trailing percentage attached to last word (e.g., "Sweet Tangerine2" -> "Sweet Tangerine 2" or "Sweet Tangerine2.5" -> "Sweet Tangerine 2.5")
    const attachedNumRegex = /^(.*[a-zA-Z\)])(\d+(?:\.\d+)?)$/;
    if (attachedNumRegex.test(line)) {
      line = line.replace(attachedNumRegex, '$1 $2');
    }

    // Match vendor, flavor name, and percentage
    // Pattern 1: Standard space-separated -> Vendor Name %
    const parts = line.split(/\s+/);
    if (parts.length >= 2) {
      const vendorCandidate = parts[0].toUpperCase();
      const isKnownVendor = KNOWN_VENDORS.includes(vendorCandidate);
      const vendor = isKnownVendor ? vendorCandidate : parts[0];

      const lastPart = parts[parts.length - 1].replace('%', '');
      const numValue = parseFloat(lastPart);

      if (!isNaN(numValue) && parts.length >= 3) {
        const name = parts.slice(1, -1).join(' ');
        items.push({
          vendor,
          name,
          mlPer100ml: numValue,
        });
        continue;
      } else if (!isNaN(numValue) && parts.length === 2) {
        // Line like "CAP 5" or "FlavorName 5"
        items.push({
          vendor: isKnownVendor ? vendor : 'CAP',
          name: isKnownVendor ? 'Flavor' : parts[0],
          mlPer100ml: numValue,
        });
        continue;
      }
    }

    // Fallback regex match for any line containing a trailing number
    const fallbackMatch = line.match(/^([A-Z0-9]{2,4})?\s*(.+?)\s+(\d+(?:\.\d+)?)\s*%?$/i);
    if (fallbackMatch) {
      const vendor = (fallbackMatch[1] || 'CAP').toUpperCase();
      const name = fallbackMatch[2].trim();
      const mlPer100ml = parseFloat(fallbackMatch[3]);
      if (name && !isNaN(mlPer100ml)) {
        items.push({ vendor, name, mlPer100ml });
      }
    }
  }

  return items;
}

/**
 * Formats a list of RecipeItem objects into raw text format for editing/copying.
 */
export function formatRecipeText(items: RecipeItem[]): string {
  return items.map((i) => `${i.vendor} ${i.name} ${String(i.mlPer100ml).replace('.', ',')}`).join('\n');
}
