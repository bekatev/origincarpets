/**
 * Gallery photography and brand decorations for editorial sections only.
 * Product images always come from the API.
 */

export const stockImages = {
  /** Homepage hero — stacked gallery carpets */
  hero: '/stock/editorial/hero-stacks.png',
  collection: '/brand/collection-gallery.png',
  about: '/brand/history-bazaar.png',
  gallery: '/brand/gallery-interior.png',
  og: '/brand/hero-exterior.png',
  decorationMotif: '/brand/decoration-ornament.png',
  decorationLine: '/brand/decoration-line.png',
  interiors: {
    wallHanging: '/stock/interiors/wall-hanging.jpg',
    livingRed: '/stock/interiors/living-red.jpg',
    roomsCollage: '/stock/interiors/rooms-collage.jpg'
  },
  carpets: {
    jewel: '/stock/editorial/detail-jewel.png',
    layered: '/stock/editorial/layered-pair.png',
    lattice: '/stock/editorial/field-lattice.png',
    lions: '/stock/editorial/rug-lions.png',
    column: '/stock/editorial/column-runner.png',
    heroCarpet: '/stock/editorial/hero-carpet.png'
  }
} as const;
