export interface GalleryItem {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
}

// The story frames have not arrived yet, so they all point at the abstract
// cover: one placeholder to delete once the real images land, rather than six
// to hunt down. The collection card shows the artwork instead.
const PLACEHOLDER = '/images/pain-girl/cover.svg';

const placeholder = (n: number): GalleryItem => ({
  src: PLACEHOLDER,
  alt: `Pain Girl, сюжет ${n}`,
  title: `Сюжет 0${n}`,
  subtitle: 'Изображение скоро появится',
});

/**
 * The Pain Girl collection is a gallery, not a range of flavours, so its frames
 * live here instead of in the product table.
 *
 * Every entry is a placeholder today. Replacing `src` (and `alt`/`title` once
 * the captions are known) is all it takes: the carousel re-measures and replays
 * its entrance whenever the list of sources changes. `aspectRatio` in
 * PainGirlGallery has to match the shape of the incoming artwork, otherwise the
 * cards crop it.
 */
export const PAIN_GIRL_GALLERY: GalleryItem[] = [
  placeholder(1),
  placeholder(2),
  placeholder(3),
  placeholder(4),
  placeholder(5),
  placeholder(6),
];