// Vinyl label artwork scale.
//
// The per-flavour values used to live in a hardcoded IMAGE_SCALE_OVERRIDES table
// matched by fuzzy flavour name. They now live on the product record as
// `artScale` and are edited from the admin cabinet, so renaming a flavour can no
// longer silently break the lookup.
//
// The label is a circle, so anything below 1.0 would expose the label
// background as a white ring around the artwork. The minimum is therefore 1.0:
// the artwork always covers the full circle, and values above 1.0 simply zoom in.

export const ART_SCALE_MIN = 1.0;
export const ART_SCALE_MAX = 1.5;
export const ART_SCALE_DEFAULT = 1.0;

export const clampArtScale = (value?: number | null): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return ART_SCALE_DEFAULT;
  return Math.min(ART_SCALE_MAX, Math.max(ART_SCALE_MIN, Math.round(parsed * 100) / 100));
};

/** Per-product artwork scale from the database, or null when left at default. */
export function getProductArtScale(item?: any): number | null {
  if (!item) return null;
  const raw = item.artScale;
  if (raw === undefined || raw === null || raw === '') return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return null;
  return clampArtScale(parsed);
}

/**
 * Automatic artwork fit for the 80% vinyl label circle.
 *
 * The artwork is rendered with `object-cover` inside the D x D label box, so a
 * square cover already fills the box edge to edge and the circle is inscribed in
 * it. Non-square covers are cropped rather than letterboxed, so no aspect ratio
 * can ever leave a gap next to the label rim. That makes the automatic fit 1.0
 * for every asset; the per-product `artScale` is then free to zoom in further.
 */
export function getAutoItemScale(_aspect?: number | null): number {
  return ART_SCALE_DEFAULT;
}

/** Per-product scale wins, automatic fit is the baseline for everything else. */
export function getItemScale(item?: any, aspect?: number | null): number {
  return getProductArtScale(item) ?? getAutoItemScale(aspect);
}
