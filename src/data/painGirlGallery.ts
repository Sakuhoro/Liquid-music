export interface GalleryItem {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
  /**
   * The paragraph the story modal shows under the title, and the text the studio
   * opens the editor on. It is required rather than optional so a frame can never
   * reach the modal with a blank right-hand column, and it is the shipped
   * default: the studio stores edits as overrides on top of it, never as a
   * replacement, so a frame with no override still reads here.
   */
  storyText: string;
}

/**
 * The key art behind the collection's screen. Its proportions are not incidental:
 * on a phone the artwork is laid out as a band across the top and the spiral
 * starts underneath it, and both halves have to agree on how tall that band is.
 * The background layer paints it and the section leaves the room, so the numbers
 * live here rather than being written out twice.
 */
export const PAIN_GIRL_ARTWORK = {
  src: '/Pain girl.jpg',
  width: 1366,
  height: 768,
} as const;

/**
 * The Pain Girl collection is a gallery, not a range of flavours, so its frames
 * live here instead of in the product table.
 *
 * Order is the reading order of the spiral, first frame leading. The frames are
 * square to within a few percent, so square cards in the spiral frame them
 * without cropping.
 *
 * `src` doubles as the frame's identity. The studio keys story overrides on it,
 * so renaming a file is the one edit that loses an override.
 */
export const PAIN_GIRL_GALLERY: GalleryItem[] = [
  {
    src: '/images/pain-girl/out-in-the-garden.jpg',
    alt: 'Out in the Garden',
    title: 'Out in the Garden',
    subtitle: 'Сезонная коллекция',
    storyText:
      'Она вышла во двор на рассвете, когда город ещё принадлежал только голубям и собственным теням. ' +
      'Здесь нет зрителей и нет ролей — только холодная трава под коленями и город, который не смотрит в ответ. ' +
      'Композиция пахнет свежей зеленью и мокрым асфальтом: первая нота срывается с плеча, как будто её толкнули.',
  },
  {
    src: '/images/pain-girl/above-the-neck.png',
    alt: 'Above the Neck',
    title: 'Above the Neck',
    subtitle: 'Сезонная коллекция',
    storyText:
      'Всё, что выше шеи, — это и есть её досье. Взгляд, голос, привычка прикусывать губу, когда слова не выходят. ' +
      'Нижняя половина лица может притворяться, что этажом ниже; верхняя — никогда. ' +
      'Аромат сухой и прохладный, как утренний воздух в комнате, из которой только что вышел человек.',
  },
  {
    src: '/images/pain-girl/evergreen-soldier.png',
    alt: 'Evergreen soldier',
    title: 'Evergreen soldier',
    subtitle: 'Сезонная коллекция',
    storyText:
      'Она прошла зиму в одной и той же шине и вышла из неё той же, только тише. ' +
      'Вечнозелёные ноты держатся там, где всё остальное сдалось: хвоя, смола, мёрзлая земля и что-то упрямое, ' +
      'что держится за скелет и не отпускает.',
  },
  {
    src: '/images/pain-girl/sex-concept.png',
    alt: 'Sex concept',
    title: 'Sex concept',
    subtitle: 'Сезонная коллекция',
    storyText:
      'Это не сцена, а её черновик: сдержанный, с нажимом, с паузами там, где обычно спешат. ' +
      'Тёмная база держит тёплый верх, и между ними ровно столько напряжения, сколько нужно, чтобы не сорваться. ' +
      'Вкус плотный, слегка приторный на выдохе — из тех, что помнят дольше, чем ожидаешь.',
  },
  {
    src: '/images/pain-girl/hot-gum.png',
    alt: 'hot gum',
    title: 'hot gum',
    subtitle: 'Сезонная коллекция',
    storyText:
      'Сладкое, тянущееся, чуть обжигающее — как жвачка, которая не поддаётся с первого раза. ' +
      'Она держит вкус ровно столько, сколько ты готов жевать, а потом отпускает одним резким сладким ударом. ' +
      'Самая разговорчивая в сете: с ней проще всего начать.',
  },
  {
    src: '/images/pain-girl/everybody-supports-women.jpg',
    alt: 'Everybody supports women',
    title: 'Everybody supports women',
    subtitle: 'Сезонная коллекция',
    storyText:
      'Плакат, на котором нет ничьей вины и ничьей вины не требуется. ' +
      'Тёплый, чуть пыльный тон, в котором смешаны усталость, нежность и упрямство — то, чем заканчивается любой разговор о свободе. ' +
      'Закрывает сет: последняя, самая громкая нота, после которой музыка замолкает сама.',
  },
];