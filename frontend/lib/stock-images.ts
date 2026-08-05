/**
 * Gallery photography and brand decorations for editorial sections only.
 * Product images always come from the API.
 *
 * Editorial/staff assets under the web/ folders are pre-resized
 * (~3–4K edge, quality ~90 JPEG) so backdrops stay sharp while loading far
 * faster than the original camera files.
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
  },
  /**
   * High-res editorial plates for tall About sections.
   * Rotating a few keeps each stretch short so carpets stay sharp.
   */
  aboutVideoBackdrops: [
    '/stock/editorial/web/_IG_1637.jpg',
    '/stock/editorial/web/_IG_1630.jpg',
    '/stock/editorial/web/_IG_1628.jpg'
  ] as const,
  /** Guest book section — prefer editorial over the small brand interior shot */
  guestBookBackdrop: '/stock/editorial/web/_IG_1639.jpg'
} as const;
