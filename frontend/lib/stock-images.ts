/**
 * Gallery photography and brand decorations for editorial sections only.
 * Product images always come from the API.
 *
 * Editorial/staff assets under the web/ folders are pre-resized
 * (~2K edge, high-quality JPEG) so live pages stay sharp but load fast.
 */

export const stockImages = {
  /** Homepage hero — stacked gallery carpets */
  hero: '/stock/editorial/web/_IG_1626.jpg',
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
    jewel: '/stock/editorial/web/_IG_1639.jpg',
    layered: '/stock/editorial/web/_IG_1630.jpg',
    lattice: '/stock/editorial/web/_IG_1628.jpg',
    lions: '/stock/editorial/web/_IG_1626.jpg',
    heroCarpet: '/stock/editorial/web/_IG_1633.jpg',
    /** About Us — Selected features section */
    aboutFeatures: '/stock/editorial/web/_IG_1637.jpg'
  }
} as const;
