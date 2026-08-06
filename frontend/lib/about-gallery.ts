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
};

export type GalleryPhoto = {
  id: string;
  src: string;
  width: number;
  height: number;
  altEn: string;
  altKa: string;
};

/** Highlighted visits — paired with captions on the About page. */
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
    captionKa: 'ჩვენს გალერეას ეწვია ცნობილი ჰოლივუდის მსახიობი შერონ სთოუნი.',
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
    captionEn: 'Our gallery was visited by Attorney and former United States Secretary of State John Kerry.',
    captionKa: 'ჩვენს გალერეას ეწვია იურისტი და აშშ-ის ყოფილი სახელმწიფო მდივანი ჯონ კერი.',
  },
];

/** Additional guest moments — clean baseline JPEGs with stable paths.
 *  Featured-guest photos (Sharon Stone, John Kerry) live only in `featuredGuests`.
 */
export const guestGallery: GalleryPhoto[] = [
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
  },
  {
    id: 'guest-visit',
    src: '/guests/guest-visit.jpg',
    width: 768,
    height: 1024,
    altEn: 'Guests visiting Origin Carpets gallery',
    altKa: 'სტუმრები Origin Carpets-ის გალერეაში'
  },
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
  },
];
