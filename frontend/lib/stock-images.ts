/**
 * Gallery photography and brand decorations for editorial sections only.
 * Product images always come from the API.
 */

export const stockImages = {
  /** Homepage hero — stacked gallery carpets */
  hero: '/stock/editorial/_IG_1626.JPG',
  collection: '/brand/collection-gallery.jpg',
  about: '/brand/history-bazaar.png',
  gallery: '/brand/gallery-interior.jpg',
  og: '/brand/hero-exterior.jpg',
  decorationMotif: '/brand/decoration-ornament.png',
  decorationLine: '/brand/decoration-line.png',
  interiors: {
    wallHanging: '/stock/interiors/wall-hanging.jpg',
    livingRed: '/stock/interiors/living-red.jpg',
    roomsCollage: '/stock/interiors/rooms-collage.jpg'
  },
  carpets: {
    jewel: '/stock/editorial/_IG_1639.JPG',
    layered: '/stock/editorial/_IG_1630.JPG',
    lattice: '/stock/editorial/_IG_1628.JPG',
    lions: '/stock/editorial/_IG_1626.JPG',
    heroCarpet: '/stock/editorial/_IG_1633.JPG',
    /** About Us — Selected features section */
    aboutFeatures: '/stock/editorial/_IG_1637.JPG'
  }
} as const;
