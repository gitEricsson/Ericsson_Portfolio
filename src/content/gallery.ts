/**
 * Gallery media for the LENS chapter: Ericsson's own campaign shots and
 * motion frames, processed into /public/gallery by scripts/prepare-gallery.mjs
 * (photos) and scripts/transcode-reel.mjs (HEVC video).
 *
 * Note: IMG_0667 / IMG_7026_1 / IMG_7036 (HEIC) are still excluded until
 * re-exported as JPEG; rerun prepare-gallery.mjs after.
 */

export type GalleryItem = {
  kind: 'image' | 'video';
  src: string;
  alt: string;
  caption: string;
  /** Aspect ratio as width/height, used for layout before load. */
  ratio: number;
};

export const gallery: GalleryItem[] = [
  {
    kind: 'video',
    src: '/gallery/reel-01.mp4',
    alt: 'Motion frame: Ericsson on set',
    caption: 'MOTION / 00:08',
    ratio: 0.547,
  },
  {
    kind: 'image',
    src: '/gallery/frame-02.jpg',
    alt: 'Ericsson on a steel stool in a white linen shirt and batik-dyed maroon trousers, colonial veranda and hedge behind, smiling into the lens',
    caption: 'VERANDA / WHITE LINEN',
    ratio: 0.767,
  },
  {
    kind: 'image',
    src: '/gallery/frame-03.jpg',
    alt: 'Editorial duo: Ericsson seated in a navy kaftan, a model standing behind him in a striped bodice and red gown, dense green garden backdrop',
    caption: 'GARDEN / TWO FIGURES',
    ratio: 0.728,
  },
  {
    kind: 'video',
    src: '/gallery/reel-02.mp4',
    alt: 'Motion frame: Ericsson on set',
    caption: 'MOTION / 00:02',
    ratio: 0.562,
  },
  {
    kind: 'image',
    src: '/gallery/frame-08.jpg',
    alt: 'Regal studio portrait: Ericsson in striped aso-oke tunic and fila cap, layered coral and shell beads, hand resting on a carved black cane',
    caption: 'STUDIO / ASO-OKE',
    ratio: 0.759,
  },
  {
    kind: 'image',
    src: '/gallery/frame-05.jpg',
    alt: 'Ericsson in an all-black polo, trousers and durag, standing small against a vast rust-red container wall with a hanging chain and weathered AC units',
    caption: 'CONTAINER WALL / ALL BLACK',
    ratio: 0.75,
  },
  {
    kind: 'image',
    src: '/gallery/frame-01.jpg',
    alt: 'Ericsson seated on the coupling of a vintage green railway car beside a rusted cargo bicycle, black tee reading See Wear Live, printed trousers, jungle foliage behind',
    caption: 'RAILWAY YARD / SEE WEAR LIVE',
    ratio: 0.697,
  },
  {
    kind: 'video',
    src: '/gallery/reel-03.mp4',
    alt: 'Motion frame: Ericsson on set',
    caption: 'MOTION / 00:13',
    ratio: 0.5625,
  },
  {
    kind: 'image',
    src: '/gallery/frame-09.jpg',
    alt: 'High-angle street candid of Ericsson in a black tee, arms crossed, looking down against pale concrete',
    caption: 'STREET / CANDID',
    ratio: 0.75,
  },
  {
    kind: 'image',
    src: '/gallery/frame-06.jpg',
    alt: 'Editorial trio under a mango tree: Ericsson front and center in a navy kaftan, two models in layered red gowns flanking him in the greenery',
    caption: 'GARDEN / THREE FIGURES',
    ratio: 0.75,
  },
  {
    kind: 'image',
    src: '/gallery/frame-04.jpg',
    alt: 'Ericsson sitting in the door of a yellow keke napep tricycle in a Lagos to St. Louis tee and bone-print trousers, palms overhead',
    caption: 'KEKE / LAGOS TO ST. LOUIS',
    ratio: 0.734,
  },
];
