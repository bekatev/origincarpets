export const footerTranslations = {
  en: {
    aboutUs: 'About Us',
    aboutLinks: {
      company: 'The Company',
      contacts: 'The Contacts',
      blog: 'Blog',
      projects: 'Projects',
      stories: 'Stories'
    },
    carpets: 'Carpets',
    carpetTypes: {
      carpet: 'Carpet',
      kilim: 'Kilim',
      soumak: 'Soumak',
      zili: 'Zili',
      djidjim: 'Djidjim',
      decoration: 'Decoration'
    },
    carpetOrigin: 'Carpet Origin',
    origins: {
      georgia: 'Georgia',
      azerbaijan: 'Azerbaijan',
      armenia: 'Armenia',
      dagestan: 'Dagestan',
      turkey: 'Turkey',
      persia: 'Persia',
      afghanistan: 'Afghanistan',
      centralAsia: 'Central Asia'
    },
    guidesPolicies: 'Guides & Policies',
    contactUs: 'Contact Us',
    socialMedia: 'Social Media',
    bookAppointment: 'Book Virtual Appointment',
    copyright:
      '© {year} origincarpets.com | All Rights Reserved. | Caucasian and Oriental Carpets Gallery'
  },
  ka: {
    aboutUs: 'ჩვენ შესახებ',
    aboutLinks: {
      company: 'კომპანია',
      contacts: 'კონტაქტები',
      blog: 'ბლოგი',
      projects: 'პროექტები',
      stories: 'ისტორიები'
    },
    carpets: 'ხალიჩები',
    carpetTypes: {
      carpet: 'ხალიჩა',
      kilim: 'ფარდაგი',
      soumak: 'სუმახი',
      zili: 'ზილი',
      djidjim: 'ჯეჯიმი',
      decoration: 'დეკორაცია'
    },
    carpetOrigin: 'ხალიჩის წარმომავლობა',
    origins: {
      georgia: 'საქართველო',
      azerbaijan: 'აზერბაიჯანი',
      armenia: 'სომხეთი',
      dagestan: 'დაღესტანი',
      turkey: 'თურქეთი',
      persia: 'სპარსეთი',
      afghanistan: 'ავღანეთი',
      centralAsia: 'ცენტრალური აზია'
    },
    guidesPolicies: 'გაიდები და წესები',
    contactUs: 'კონტაქტი',
    socialMedia: 'სოციალური მედია',
    bookAppointment: 'ვირტუალური შეხვედრის დაჯავშნა',
    copyright:
      '© {year} origincarpets.com | ყველა უფლება დაცულია | კავკასიური და აღმოსავლური ხალიჩების გალერეა'
  }
} as const;

export const FOOTER_SOCIAL = {
  facebook: 'https://www.facebook.com/carpetsgallerytbilisi#',
  instagram:
    'https://www.instagram.com/explore/locations/717260098461829/caucasian-and-oriental-carpets-gallery-tbilisi/'
} as const;

/** Chronology: carpet → kilim → soumak → zili → djidjim → decoration */
export const FOOTER_CARPET_SLUGS = {
  carpet: 'carpet',
  kilim: 'kilim',
  soumak: 'soumak',
  zili: 'zili',
  djidjim: 'djidjim',
  decoration: 'decoration'
} as const;

export const FOOTER_ORIGIN_FILTERS = {
  georgia: 'Georgia',
  azerbaijan: 'Azerbaijan',
  armenia: 'Armenia',
  dagestan: 'Dagestan',
  turkey: 'Turkey',
  persia: 'Persia',
  afghanistan: 'Afghanistan',
  centralAsia: 'Central Asia'
} as const;
