import manifest from '../data/carouselImages.json';

interface Artwork { width: number; height: number; variants: { width: number; src: string }[] }
const images: Record<string, Artwork> = manifest;

export function carouselImageProps(src: string, displayWidth: number) {
  const image = images[src];
  if (!image) return { src, decoding: 'async' as const };
  return {
    src: image.variants[0].src,
    srcSet: image.variants.map(variant => `${variant.src} ${variant.width}w`).join(', '),
    sizes: `${Math.ceil(displayWidth)}px`,
    width: image.width,
    height: image.height,
    decoding: 'async' as const,
  };
}

export function carouselImageAspect(src: string) {
  const image = images[src];
  return image ? image.width / image.height : undefined;
}
