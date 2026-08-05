/** About Us — guests & staff photo galleries */

export type FeaturedGuest = {
  id: string;
  src: string;
  width: number;
  height: number;
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
    src: '/guests/sharon-stone.jpg',
    width: 342,
    height: 640,
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
    nameEn: 'John Kerry',
    nameKa: 'ჯონ კერი',
    roleEn: 'Attorney and former United States Secretary of State',
    roleKa: 'იურისტი და აშშ-ის ყოფილი სახელმწიფო მდივანი',
    captionEn: 'Our gallery was visited by Attorney and former United States Secretary of State John Kerry.',
    captionKa: 'ჩვენს გალერეას ეწვია იურისტი და აშშ-ის ყოფილი სახელმწიფო მდივანი ჯონ კერი.',
  },
];

/** Additional guest moments — clean baseline JPEGs with stable paths. */
export const guestGallery: GalleryPhoto[] = [
  {
    id: 'guest-outdoor',
    src: '/guests/guest-outdoor.jpg',
    width: 720,
    height: 960,
    altEn: 'Sharon Stone at an outdoor Origin Carpets presentation',
    altKa: 'შერონ სთოუნი Origin Carpets-ის ღია პრეზენტაციაზე'
  },
  {
    id: 'guest-seated',
    src: '/guests/guest-seated.jpg',
    width: 720,
    height: 960,
    altEn: 'Sharon Stone with guests in the Origin Carpets gallery',
    altKa: 'შერონ სთოუნი სტუმრებთან ერთად Origin Carpets-ის გალერეაში'
  },
  {
    id: 'guest-kilim-bag',
    src: '/guests/guest-kilim-bag.jpg',
    width: 331,
    height: 670,
    altEn: 'Sharon Stone outside the gallery with a kilim bag',
    altKa: 'შერონ სთოუნი გალერეასთან კილიმის ჩანთით'
  },
  {
    id: 'guest-viewing',
    src: '/guests/guest-viewing.jpg',
    width: 540,
    height: 530,
    altEn: 'Sharon Stone viewing a carpet in the gallery',
    altKa: 'შერონ სთოუნი გალერეაში ხალიჩას უყურებს'
  },
  {
    id: 'guest-kerry-street',
    src: '/guests/guest-kerry-street.jpg',
    width: 552,
    height: 366,
    altEn: 'John Kerry walking past Origin Carpets gallery',
    altKa: 'ჯონ კერი Origin Carpets-ის გალერეასთან'
  },
  {
    id: 'guest-visit',
    src: '/guests/guest-visit.jpg',
    width: 768,
    height: 1024,
    altEn: 'Guests visiting Origin Carpets gallery',
    altKa: 'სტუმრები Origin Carpets-ის გალერეაში'
  },
  {
    id: 'guest-group',
    src: '/guests/guest-group.jpg',
    width: 1600,
    height: 1200,
    altEn: 'Visitors with Origin Carpets team in the gallery',
    altKa: 'ვიზიტორები Origin Carpets-ის გუნდთან ერთად'
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
