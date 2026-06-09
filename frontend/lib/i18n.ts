import { adminTranslations } from './i18n-admin';
import { footerTranslations } from './i18n-footer';
import { storefrontTranslations } from './i18n-storefront';

export type Locale = 'en' | 'ka';

export const LANG_COOKIE = 'site_lang';

export const dictionaries = {
  en: {
    common: {
      language: 'Language',
      english: 'ENG',
      georgian: 'GEO',
      login: 'Login',
      logout: 'Log out',
      profile: 'Profile',
      admin: 'Admin',
      cart: 'Cart',
      close: 'Close',
      menu: 'Menu'
    },
    topbar: {
      shipping: 'Worldwide Delivery Available'
    },
    nav: {
      shop: 'Shop',
      about: 'About Us',
      carpets: 'Carpets',
      origin: 'Carpet Origin',
      guides: 'Guides & Policies',
      contact: 'Contact Us',
      social: 'Social Media',
      appointment: 'Book Virtual Appointment'
    },
    footer: {
      description: 'Finest Caucasian and Oriental Carpets with local Georgian and international shipping.',
      shop: 'Shop',
      productCatalog: 'Product Catalog',
      checkout: 'Checkout',
      account: 'Account',
      register: 'Register',
      myOrders: 'My Orders'
    },
    home: {
      siteTitle: 'Finest Caucasian and Oriental Carpets',
      heroSubtitle: 'Origin Carpets · Tbilisi',
      heroTitle1: 'Transform Your Space',
      heroTitle2: 'with Authentic Oriental Carpets',
      heroBody:
        'Discover our carefully curated collection of vintage and contemporary handwoven carpets from the Caucasus region. Each piece is handpicked by our experts from historic trading routes that once connected East and West.',
      featuredPieces: 'Featured Pieces',
      memberLogin: 'Member Login',
      curatorSelection: "Curator's Selection",
      createAccount: 'Create Account',
      historyTitle: 'History of our Gallery',
      historyP1:
        'Our gallery opened in 1995. It is in the historic district of the city where, in the 18th and 19th centuries, camel caravans laden with carpets used to stop on their journeys from Asia towards the Black Sea. One room of our gallery was once used for camel stabling. The second was a tavern shop, where traders sat on mats and bought and sold carpets. The mood has been preserved: the three hundred year-old building walls of the caravans-saray are still a place for people of different nationalities to meet and deal in carpets.',
      historyP2:
        'Located at the crossroads of Eurasia, Tbilisi is on the Great Silk Road and has always been considered a hub of trade and education. It is to Tbilisi where all sorts of carpets and rugs were imported from Asia, as well as other precious things. As well as trading, Georgia made quality bags, carpets and rugs. In particular, Tusheti, Kakheti, Alwan and Akhaltsikhe were famous for precious high-quality products, skilled weavers, and the quality of local sheep and wool.',
      historyP3:
        'Our gallery collection includes both old and new Georgian, Dagestani, Armenian, Azeri, Persian, Turkish and Central Asian rugs and carpets.',
      categoriesTitle: 'Carpet Categories',
      carpetTitle: 'Carpet',
      carpetBody:
        'Weaving technology of carpet is very popular. Carpet is woven on a special loom. First weave the base (made of wool, cotton or silk) and then start weaving the ornaments with wool or silk thread. Typical carpet weaving is when knitting a knot with a thread and then cutting; the pile originates from here. There are carpets which are wool on wool, wool on cotton or silk on silk. Quality of the carpet depends on density of weaving, natural vegetable colors and quality of threads.',
      kilimTitle: 'Kilim',
      kilimBody:
        'Kilim, compared to carpets, is a thinner flatweave without pile. First they weave the base and then they start making ornaments by knots. Unlike carpets, weavers do not cut knots. In kilims there are natural vegetable dyes and also insects used to dye, for example dirty pink. This is popular Koshineli.',
      contactTitle: 'Contact Us',
      policyReturn: 'Return and Refund policy',
      policyPrivacy: 'Customer privacy policy',
      socialMedia: 'Social media',
      featuredCollection: 'Featured collection',
      exploreCollection: 'Explore our collection',
      editorialTitle:
        'Handwoven carpets from the Caucasus and beyond — antique and contemporary, natural fibres, in many styles and sizes.',
      editorialBody:
        'Our gallery in Tbilisi holds a diverse collection of Georgian, Persian, Turkish, and Central Asian rugs. Each piece is chosen for its craftsmanship, colour, and story.',
      readStory: 'Read the story',
      aboutHeading: 'About us'
    },
    footerLinks: footerTranslations.en,
    ...storefrontTranslations.en,
    ...adminTranslations.en
  },
  ka: {
    common: {
      language: 'ენა',
      english: 'ENG',
      georgian: 'GEO',
      login: 'შესვლა',
      logout: 'გასვლა',
      profile: 'პროფილი',
      admin: 'ადმინი',
      cart: 'კალათა',
      close: 'დახურვა',
      menu: 'მენიუ'
    },
    topbar: {
      shipping: 'მიწოდება მსოფლიოს მასშტაბით'
    },
    nav: {
      shop: 'მაღაზია',
      about: 'ჩვენ შესახებ',
      carpets: 'ხალიჩები',
      origin: 'ხალიჩის წარმომავლობა',
      guides: 'გაიდები და წესები',
      contact: 'კონტაქტი',
      social: 'სოციალური მედია',
      appointment: 'ვირტუალური შეხვედრის დაჯავშნა'
    },
    footer: {
      description: 'კავკასიური და აღმოსავლური ხალიჩების საუკეთესო კოლექცია ადგილობრივი და საერთაშორისო მიწოდებით.',
      shop: 'მაღაზია',
      productCatalog: 'პროდუქტების კატალოგი',
      checkout: 'შეკვეთის გაფორმება',
      account: 'ანგარიში',
      register: 'რეგისტრაცია',
      myOrders: 'ჩემი შეკვეთები'
    },
    home: {
      siteTitle: 'საუკეთესო კავკასიური და აღმოსავლური ხალიჩები',
      heroSubtitle: 'Origin Carpets · თბილისი',
      heroTitle1: 'შეცვალეთ თქვენი სივრცე',
      heroTitle2: 'ავთენტური აღმოსავლური ხალიჩებით',
      heroBody:
        'აღმოაჩინეთ ჩვენი ფრთხილად შერჩეული ვინტაჟური და თანამედროვე ხელნაქსოვი ხალიჩების კოლექცია კავკასიის რეგიონიდან. თითოეული ნამუშევარი ხელითაა შერჩეული ჩვენი ექსპერტების მიერ ისტორიული სავაჭრო გზებიდან.',
      featuredPieces: 'რჩეული ნამუშევრები',
      memberLogin: 'კლიენტის შესვლა',
      curatorSelection: 'კურატორის შერჩევა',
      createAccount: 'ანგარიშის შექმნა',
      historyTitle: 'ჩვენი გალერეის ისტორია',
      historyP1:
        'ჩვენი გალერეა 1995 წელს გაიხსნა. ის მდებარეობს ქალაქის ისტორიულ უბანში, სადაც მე-18 და მე-19 საუკუნეებში აზიიდან მომავალი ქარავნები ჩერდებოდნენ. ჩვენი გალერეის ერთ ოთახს ადრე აქლემების სადგომად იყენებდნენ, მეორე ოთახი კი სავაჭრო დუქანი იყო, სადაც მოვაჭრეები ხალიჩებს ყიდდნენ. ეს განწყობა შენარჩუნებულია და სამასი წლის შენობა დღესაც ხალხის შეხვედრის ადგილია.',
      historyP2:
        'ევრაზიის გზაჯვარედინზე მდებარე თბილისი ისტორიულად დიდი აბრეშუმის გზის მნიშვნელოვანი ცენტრი იყო. აქ შემოდიოდა აზიიდან იმპორტირებული ხალიჩები და სხვა ძვირფასი ნივთები. საქართველოში ასევე იქსოვებოდა მაღალი ხარისხის ხალიჩები, განსაკუთრებით თუშეთში, კახეთში, ალვანსა და ახალციხეში.',
      historyP3:
        'ჩვენს გალერეაში წარმოდგენილია ძველი და ახალი ქართული, დაღესტნური, სომხური, აზერბაიჯანული, სპარსული, თურქული და ცენტრალური აზიური ხალიჩები.',
      categoriesTitle: 'ხალიჩების კატეგორიები',
      carpetTitle: 'ხალიჩა',
      carpetBody:
        'ხალიჩის ქსოვის ტექნოლოგია ძალიან პოპულარულია. ქსოვა სპეციალურ საქსოვზე ხდება: ჯერ იქსოვება საფუძველი (მატყლი, ბამბა ან აბრეშუმი), შემდეგ იქსოვება ორნამენტი მატყლის ან აბრეშუმის ძაფით. კლასიკური ტექნიკა კვანძის შეკვრასა და ჭრაზეა დაფუძნებული, საიდანაც წარმოიშობა ბუსუსი.',
      kilimTitle: 'ქილიმი',
      kilimBody:
        'ქილიმი, ხალიჩასთან შედარებით, უფრო თხელი და ბუსუსის გარეშე ბრტყელი ქსოვილია. საფუძვლის შემდეგ ორნამენტი კვანძებით იქმნება, მაგრამ კვანძები არ იჭრება. ქილიმებში გამოიყენება ბუნებრივი მცენარეული საღებავები და ზოგჯერ მწერებისგან მიღებული საღებავებიც.',
      contactTitle: 'კონტაქტი',
      policyReturn: 'დაბრუნებისა და ანაზღაურების პოლიტიკა',
      policyPrivacy: 'მომხმარებლის კონფიდენციალურობის პოლიტიკა',
      socialMedia: 'სოციალური მედია',
      featuredCollection: 'რჩეული კოლექცია',
      exploreCollection: 'გაეცანით კოლექციას',
      editorialTitle:
        'ხელნაქსოვი ხალიჩები კავკასიიდან და მის გარშემო — ანტიკური და თანამედროვე, ბუნებრივი ბოჭკოთი, სხვადასხვა სტილსა და ზომაში.',
      editorialBody:
        'ჩვენი თბილისის გალერეა მდიდარ კოლექციას აერთიანებს ქართული, სპარსული, თურქული და ცენტრალური აზიური ხალიჩებს. თითოეული ნამუშევარი შერჩეულია ხელოვნების, ფერისა და ისტორიისთვის.',
      readStory: 'წაიკითხეთ ისტორია',
      aboutHeading: 'ჩვენ შესახებ'
    },
    footerLinks: footerTranslations.ka,
    ...storefrontTranslations.ka,
    ...adminTranslations.ka
  }
};

export type Dictionary = (typeof dictionaries)[Locale];

export function normalizeLocale(value?: string | null): Locale {
  return value === 'ka' ? 'ka' : 'en';
}

export function formatCount(template: string, count: number): string {
  return template.replace('{count}', String(count));
}
