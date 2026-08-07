/** About Us — guests & staff photo galleries */

export type FeaturedGuestImage = {
  src: string;
  width: number;
  height: number;
};

export type FeaturedGuest = {
  id: string;
  src: string;
  width: number;
  height: number;
  /** Extra photos for a multi-image grid (includes primary when set). */
  images?: FeaturedGuestImage[];
  nameEn: string;
  nameKa: string;
  roleEn: string;
  roleKa: string;
  captionEn: string;
  captionKa: string;
  /**
   * When set, image alts describe the place (Old Tbilisi / gallery)
   * instead of implying the photos show the guest.
   */
  photoAltEn?: string;
  photoAltKa?: string;
};

export type GalleryPhoto = {
  id: string;
  src: string;
  width: number;
  height: number;
  altEn: string;
  altKa: string;
};

/**
 * Highlighted visits with large editorial layouts.
 * Compact portrait cards live in `compactFeaturedGuests`.
 */
export const featuredGuests: FeaturedGuest[] = [
  {
    id: 'sharon-stone',
    src: '/guests/eweerweee.jpg',
    width: 540,
    height: 530,
    images: [
      { src: '/guests/eweerweee.jpg', width: 540, height: 530 },
      { src: '/guests/sharon-stone-street.png', width: 328, height: 664 }
    ],
    nameEn: 'Sharon Stone',
    nameKa: 'შერონ სთოუნი',
    roleEn: 'Hollywood actress',
    roleKa: 'ჰოლივუდის მსახიობი',
    captionEn: 'Our gallery was visited by famous Hollywood actress Sharon Stone.',
    captionKa: 'ჩვენს გალერეას ეწვია ცნობილი ჰოლივუდის მსახიობი შერონ სთოუნი.'
  },
  {
    id: 'john-kerry',
    src: '/guests/john-kerry.jpg',
    width: 960,
    height: 541,
    images: [
      { src: '/guests/john-kerry.jpg', width: 960, height: 541 },
      { src: '/guests/john-kerry-gallery.png', width: 678, height: 448 }
    ],
    nameEn: 'John Kerry',
    nameKa: 'ჯონ კერი',
    roleEn: 'Attorney and former United States Secretary of State',
    roleKa: 'იურისტი და აშშ-ის ყოფილი სახელმწიფო მდივანი',
    captionEn:
      'Our gallery was visited by Attorney and former United States Secretary of State John Kerry.',
    captionKa: 'ჩვენს გალერეას ეწვია იურისტი და აშშ-ის ყოფილი სახელმწიფო მდივანი ჯონ კერი.'
  }
];

/** Smaller portrait cards shown in one grid under the highlighted guests. */
export const compactFeaturedGuests: FeaturedGuest[] = [
  {
    id: 'john-malkovich',
    src: '/guests/john-malkovich.jpg',
    width: 1400,
    height: 1892,
    nameEn: 'John Malkovich',
    nameKa: 'ჯონ მალკოვიჩი',
    roleEn: 'Actor and filmmaker · Tbilisi',
    roleKa: 'მსახიობი და რეჟისორი · თბილისი',
    captionEn: 'Visited our gallery.',
    captionKa: 'ეწვია ჩვენს გალერეას.'
  },
  {
    id: 'fanny-ardant',
    src: '/guests/fanny-ardant.jpg',
    width: 1400,
    height: 2282,
    nameEn: 'Fanny Ardant',
    nameKa: 'ფანი არდანი',
    roleEn: 'French actress',
    roleKa: 'ფრანგი მსახიობი',
    captionEn: 'Visited our gallery.',
    captionKa: 'ეწვია ჩვენს გალერეას.'
  },
  {
    id: 'ralph-fiennes',
    src: '/guests/ralph-fiennes-tbilisi.jpg',
    width: 900,
    height: 533,
    nameEn: 'Ralph Fiennes',
    nameKa: 'რალფ ფაინზი',
    roleEn: 'Actor · Tbilisi',
    roleKa: 'მსახიობი · თბილისი',
    captionEn: 'Visited our gallery.',
    captionKa: 'ეწვია ჩვენს გალერეას.'
  },
  {
    id: 'laura-bush',
    src: '/guests/laura-bush.jpg',
    width: 1400,
    height: 2100,
    nameEn: 'Laura Bush',
    nameKa: 'ლორა ბუში',
    roleEn: 'Former First Lady of the United States · 2004',
    roleKa: 'აშშ-ის ყოფილი პირველი ლედი · 2004',
    captionEn: 'Visited our gallery.',
    captionKa: 'ეწვია ჩვენს გალერეას.'
  },
  {
    id: 'christian-louboutin',
    src: '/guests/christian-louboutin.jpg',
    width: 1400,
    height: 1960,
    nameEn: 'Christian Louboutin',
    nameKa: 'კრისტიან ლაბუტენი',
    roleEn: 'Fashion designer',
    roleKa: 'მოდის დიზაინერი',
    captionEn: 'Visited our gallery.',
    captionKa: 'ეწვია ჩვენს გალერეას.'
  }
];

/** Additional guest moments — clean baseline JPEGs with stable paths. */
export const guestGallery: GalleryPhoto[] = [
  {
    id: 'guest-book-visit',
    src: '/guests/IMG_0009.JPG',
    width: 768,
    height: 1024,
    altEn: 'Guests visiting Origin Carpets gallery',
    altKa: 'სტუმრები Origin Carpets-ის გალერეაში'
  },
  {
    id: 'guest-book-gallery',
    src: '/guests/guest-book-gallery.png',
    width: 342,
    height: 640,
    altEn: 'Guests viewing carpets inside Origin Carpets gallery',
    altKa: 'სტუმრები Origin Carpets-ის გალერეაში ხალიჩებს ათვალიერებენ'
  },
  {
    id: 'guest-book-outdoor',
    src: '/guests/guest-book-outdoor.png',
    width: 720,
    height: 960,
    altEn: 'Guests at an outdoor Origin Carpets presentation',
    altKa: 'სტუმრები Origin Carpets-ის ღია პრეზენტაციაზე'
  }
];

/** Team portraits — editorial staff photography (web-optimized). */
export const staffPhotos: GalleryPhoto[] = [
  {
    id: 'staff-1679',
    src: '/staff/web/_IG_1679.jpg',
    width: 2800,
    height: 1867,
    altEn: 'Origin Carpets team in the gallery',
    altKa: 'Origin Carpets-ის გუნდი გალერეაში'
  },
  {
    id: 'staff-1687',
    src: '/staff/web/_IG_1687.jpg',
    width: 2800,
    height: 4200,
    altEn: 'Origin Carpets staff portrait',
    altKa: 'Origin Carpets-ის თანამშრომლის პორტრეტი'
  },
  {
    id: 'staff-1714',
    src: '/staff/web/_IG_1714.jpg',
    width: 2800,
    height: 4200,
    altEn: 'Origin Carpets staff portrait',
    altKa: 'Origin Carpets-ის თანამშრომლის პორტრეტი'
  },
  {
    id: 'staff-1716',
    src: '/staff/web/_IG_1716.jpg',
    width: 2800,
    height: 4200,
    altEn: 'Origin Carpets staff portrait',
    altKa: 'Origin Carpets-ის თანამშრომლის პორტრეტი'
  },
  {
    id: 'staff-1723',
    src: '/staff/web/_IG_1723.jpg',
    width: 2800,
    height: 4200,
    altEn: 'Origin Carpets staff portrait',
    altKa: 'Origin Carpets-ის თანამშრომლის პორტრეტი'
  },
  {
    id: 'staff-1740',
    src: '/staff/web/_IG_1740.jpg',
    width: 2800,
    height: 4200,
    altEn: 'Origin Carpets staff portrait',
    altKa: 'Origin Carpets-ის თანამშრომლის პორტრეტი'
  },
  {
    id: 'staff-1943',
    src: '/staff/web/_IG_1943.jpg',
    width: 2800,
    height: 4200,
    altEn: 'Origin Carpets staff portrait',
    altKa: 'Origin Carpets-ის თანამშრომლის პორტრეტი'
  }
];
