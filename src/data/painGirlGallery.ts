export interface GalleryItem {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
}

// Every frame but the first is still waiting on artwork, so they all point at
// the cover: one placeholder to delete once the real images land, rather than
// five more to hunt down. The cover doubles as the collection card too.
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
 * `sofia-isella.jpg` is portrait (736x920), and the carousel is asked for a 4:5
 * card in PainGirlGallery so nothing gets cropped. Later frames of a different
 * shape can be letterboxed by the card's `object-fit: cover` instead.
 */
export const PAIN_GIRL_GALLERY: GalleryItem[] = [
  {
    src: '/images/pain-girl/sofia-isella.jpg',
    alt: 'Sofia Isella',
    title: 'Sofia Isella',
    subtitle: 'Сезонная коллекция',
  },
  placeholder(2),
  placeholder(3),
  placeholder(4),
  placeholder(5),
  placeholder(6),
];