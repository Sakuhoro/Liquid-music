export interface GalleryItem {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
}

/**
 * The Pain Girl collection is a gallery, not a range of flavours, so its frames
 * live here instead of in the product table.
 *
 * Order is the reading order of the spiral, first frame leading. The frames are
 * square to within a few percent, so square cards in the spiral frame them
 * without cropping.
 */
export const PAIN_GIRL_GALLERY: GalleryItem[] = [
  {
    src: '/images/pain-girl/out-in-the-garden.jpg',
    alt: 'Out in the Garden',
    title: 'Out in the Garden',
    subtitle: 'Сезонная коллекция',
  },
  {
    src: '/images/pain-girl/above-the-neck.png',
    alt: 'Above the Neck',
    title: 'Above the Neck',
    subtitle: 'Сезонная коллекция',
  },
  {
    src: '/images/pain-girl/evergreen-soldier.png',
    alt: 'Evergreen soldier',
    title: 'Evergreen soldier',
    subtitle: 'Сезонная коллекция',
  },
  {
    src: '/images/pain-girl/sex-concept.png',
    alt: 'Sex concept',
    title: 'Sex concept',
    subtitle: 'Сезонная коллекция',
  },
  {
    src: '/images/pain-girl/hot-gum.png',
    alt: 'hot gum',
    title: 'hot gum',
    subtitle: 'Сезонная коллекция',
  },
  {
    src: '/images/pain-girl/everybody-supports-women.jpg',
    alt: 'Everybody supports women',
    title: 'Everybody supports women',
    subtitle: 'Сезонная коллекция',
  },
];