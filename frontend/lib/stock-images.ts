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
  /** Gallery history film for the Expertise section */
  historyVideo: '/stock/video/gallery-history.mp4',
  historyVideoPoster: '/stock/video/gallery-history-poster.jpg',
  /** Still from AdjaraTV Startaperebi episode with Manana Arkania */
  ajaratvStartaperebi: '/stock/video/ajaratv-startaperebi-manana.jpg',
  interiors: {
    wallHanging: '/stock/interiors/wall-hanging.jpg',
    livingRed: '/stock/interiors/living-red.jpg',
    roomsCollage: '/stock/interiors/rooms-collage.jpg'
  },
  carpets: {
    jewel: '/stock/editorial/detail-jewel.png',
    layered: '/stock/editorial/layered-pair.png',
    lattice: '/stock/editorial/field-lattice.png',
    weave: '/stock/editorial/weave-fold.png',
    border: '/stock/editorial/border-rust.png',
    navy: '/stock/editorial/rug-navy-stars.png',
    lions: '/stock/editorial/rug-lions.png',
    triple: '/stock/editorial/rug-triple.png',
    column: '/stock/editorial/column-runner.png',
    rust: '/stock/editorial/rug-rust.png',
    heroCarpet: '/stock/editorial/hero-carpet.png'
  }
} as const;
