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
    src: '/images/pain-girl/Out%20in%20the%20Garden.png',
    alt: 'Out in the Garden',
    title: 'Out in the Garden',
    subtitle: 'Сезонная коллекция',
    storyText:
      'Out in the Garden — это безмолвный яд из диалога с тенью того, кто был вам дорог ' +
      'и кто оставил на сердце глубокий шрам предательства.\n\n' +
      'Насколько вы готовы его простить, чтобы продолжить быть рядом?\n\n' +
      'Сколько капель собственной души вы согласны принести в жертву, чтобы удержать эту близость в увядающем саду?\n\n' +
      'Была ли эта рана нанесена чужой рукой, или вы сами направили клинок?\n\n' +
      'Это непреодолимый импульс сорвать с себя все маски и сделать шаг навстречу тьме, которая знает все ваши тайны.\n\n' +
      'Опасный соблазн, от которого невозможно отказаться.\n\n' +
      'Вас тянет в этот сад снова и снова, ведь самое интересное — это запах важности собственного падения.',
  },
  {
    src: '/images/pain-girl/above-the-neck.png',
    alt: 'Above the Neck',
    title: 'Above the Neck',
    subtitle: 'Сезонная коллекция',
    storyText:
      'Above the Neck — это стерильный операционный стол, на котором мы вскрываем механизм отчуждения разума от содрогающейся реальности.\n\n' +
      'Где пролегает та черта, за которой сознание воздвигает хрупкую стеклянную стену между «я» и остальным миром?\n\n' +
      'Выбор между ментальной эмиграцией или спасительным коконом, который обрекает нас на что-то вечное.\n\n' +
      'Сколько раз нужно вычеркнуть себя из кадра собственной жизни, чтобы окончательно превратиться в пустую оболочку?\n\n' +
      'Мы оказываемся не в состоянии выдержать гравитацию пережитого опыта и рассыпаемся в невесомости на множество маленьких острых осколков.\n\n' +
      'Но пока мы всё еще наблюдаем за тем, как изящно может выглядеть потеря контроля над собственной реальностью, вокруг призрачного лабиринта из ломаных мелодий, где каждый звук подчеркивает хрупкость связей внутри нас.',
  },
  {
    src: '/images/pain-girl/evergreen-soldier.png',
    alt: 'Evergreen soldier',
    title: 'Evergreen soldier',
    subtitle: 'Сезонная коллекция',
    storyText:
      'Evergreen Soldier — это горький пепел надежды, выжженный километрами экранов, часовых поясов и обещаний, которым так и не суждено было сбыться.\n\n' +
      'Сколько месяцев из вашей жизни нужно отнять на крупицы из коротких сообщений, пока реальность безжалостно ставит между вами стены?\n\n' +
      'Этот приговор был вынесен жестоким миром, или вы сами слишком долго прячетесь за экраном?\n\n' +
      'Вы приходите на долгожданное место встречи, но вокруг лишь оглушительная тишина: стрелки часов безжалостно ушли вперед, и вас уже никто не ждет.\n\n' +
      'Время беспощадно упущено, и осталась лишь горькая тоска, от которой невозможно излечиться.\n\n' +
      'Вас тянет сюда снова и снова, ведь самое невыносимое — это стоять как вечный солдат у памятника тому, с кем вы могли бы обрести настоящее счастье.',
  },
  {
    src: '/images/pain-girl/sex-concept.png',
    alt: 'Sex concept',
    title: 'Sex concept',
    subtitle: 'Сезонная коллекция',
    storyText:
      'Sex Concept — это новый алтарь цивилизации, воздвигнутый на руинах забытых храмов, где плоть окончательно вытеснила дух.\n\n' +
      'Мы продолжаем шептать наши сокровенные молитвы в пустоту, прежде чем это дойдёт до нашего сознания: осязаемый трепет чужого тела дарует куда более мгновенное спасение, чем обещание вечной жизни.\n\n' +
      'Насколько давно концепт общего счастья, любви и бога стал меньше и глуше чем концепт секса?\n\n' +
      'Готовы ли вы признать, что страсть стала последней неоспоримой истиной, перед которой падают на колени короли и нищие?\n\n' +
      'Нас окутывает мощнейший гипноз, перед которым бессильны любые заповеди.',
  },
  {
    src: '/images/pain-girl/hot-gum.png',
    alt: 'Hot Gum',
    title: 'Hot Gum',
    subtitle: 'Сезонная коллекция',
    storyText:
      'Hot Gum — это обжигающий привкус обмана, спрятанный за сладкой и приторной оберткой божественного величия.\n\n' +
      'Что делать смертному, когда создатель смотрит ему в глаза и без тени сомнения лжет о собственной миссии и священном долге.\n\n' +
      'Сколько веков можно слепо верить тем, на кого было указано?\n\n' +
      'Кажется, что мы просто стали расходным материалом в их бесконечной скуке.\n\n' +
      'Наши слезы горькие и желанны, как вкус тайны, которую не должны были узнать люди.',
  },
  {
    src: '/images/pain-girl/everybody-supports-women.jpg',
    alt: 'Everybody supports women',
    title: 'Everybody supports women',
    subtitle: 'Сезонная коллекция',
    storyText:
      'Everybody Supports Women — это громкий хор сочувствующих голосов, заглушающий тихий крик того, кто на самом деле просил лишь об одиночестве.\n\n' +
      'Сколько поддержки вы готовы предложить человеку, пока мнимая помощь не превратится в удушающую петлю?\n\n' +
      'Под вашей маской спасителя часто скрывается лишь эгоистичное желание выглядеть благородным на фоне чужой слабости. Будет ли такая же забота сделана ради вас самих?\n\n' +
      'Ведь самое циничное — это дарить человеку костыли, когда ему всего лишь нужно было дать упасть и подняться самому.',
  },
];
