/**
 * Gallery photography and brand decorations for editorial sections only.
 * Product images always come from the API.
 */

export const stockImages = {
  /** Homepage hero — bright diamond-field carpet */
  hero: '/stock/editorial/field-crimson.png',
  collection: '/brand/collection-gallery.png',
  about: '/brand/history-bazaar.png',
  gallery: '/brand/gallery-interior.png',
  og: '/brand/hero-exterior.png',
  decorationMotif: '/brand/decoration-ornament.png',
  decorationLine: '/brand/decoration-line.png',
  carpets: {
    jewel: '/stock/editorial/detail-jewel.png',
    layered: '/stock/editorial/layered-pair.png',
    lattice: '/stock/editorial/field-lattice.png',
    crimson: '/stock/editorial/field-crimson.png',
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
