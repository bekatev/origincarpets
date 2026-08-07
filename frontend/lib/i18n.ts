import { adminTranslations } from './i18n-admin';
import { footerTranslations } from './i18n-footer';
import { storefrontTranslations } from './i18n-storefront';

export type Locale = 'en' | 'ka';

export const DEFAULT_LOCALE: Locale = 'en';
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
      shipping: 'Worldwide delivery',
      sale: 'Sale — up to 50% off'
    },
    chat: {
      open: 'Chat with us',
      title: 'Origin Carpets',
      subtitle: 'We usually reply within a few hours',
      body: 'Have a question about a carpet, shipping, or anything else? Message us and we will get back to you.',
      cta: 'Continue in Messenger',
      note: 'Opens Facebook Messenger'
    },
    nav: {
      shop: 'Shop',
      about: 'About Us',
      history: 'Gallery History',
      carpets: 'Carpets',
      origin: 'Carpet Technologies',
      guides: 'Guides & Policies',
      contact: 'Contact Us',
      social: 'Social Media',
      appointment: 'Book Virtual Appointment'
    },
    footer: {
      description: 'Finest Caucasian and Oriental Carpets. Worldwide delivery via UPS.',
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
      goToProfile: 'Go To Profile',
      historyTitle: 'History of our Gallery',
      historyP1:
        'Our gallery opened in 1995. It is in the historic district of the city where, in the 18th and 19th centuries, camel caravans laden with carpets used to stop on their journeys from Asia towards the Black Sea. One room of our gallery was once used for camel stabling. The second was a tavern shop, where traders sat on mats and bought and sold carpets. The mood has been preserved: the three hundred year-old building walls of the caravans-saray are still a place for people of different nationalities to meet and deal in carpets.',
      historyP2:
        'Located at the crossroads of Eurasia, Tbilisi is on the Great Silk Road and has always been considered a hub of trade and education. It is to Tbilisi where all sorts of carpets and rugs were imported from Asia, as well as other precious things. As well as trading, Georgia made quality bags, carpets and rugs. In particular, Tusheti, Kakheti, Alwan and Akhaltsikhe were famous for precious high-quality products, skilled weavers, and the quality of local sheep and wool.',
      historyP3:
        'Our gallery collection includes both old and new Georgian, Dagestani, Armenian, Azeri, Persian, Turkish and Central Asian rugs and carpets.',
      categoriesTitle: 'Carpet Technologies',
      carpetTitle: 'Carpet',
      carpetBody:
        'Weaving technology of carpet is very popular. Carpet is woven on a special loom. First weave the base (made of wool, cotton or silk) and then start weaving the ornaments with wool or silk thread. Typical carpet weaving is when knitting a knot with a thread and then cutting; the pile originates from here. There are carpets which are wool on wool, wool on cotton or silk on silk. Quality of the carpet depends on density of weaving, natural vegetable colors and quality of threads.',
      kilimTitle: 'Kilim',
      kilimBody:
        'Kilim, compared to carpets, is a thinner flatweave without pile. First they weave the base and then they start making ornaments by knots. Unlike carpets, weavers do not cut knots. In kilims there are natural vegetable dyes and also insects used to dye, for example dirty pink. This is popular Koshineli.',
      soumakTitle: 'Soumak',
      soumakBody:
        'Soumak is woven by wrapping coloured wefts around the warp, creating a flat but textured, corded surface — denser and more dimensional than a kilim, without a cut pile.',
      ziliTitle: 'Zili',
      ziliBody:
        'Zili is a Caucasian flatweave in which supplementary wefts form bold geometric motifs that stand slightly proud of the ground. Firmer and more sculptural than a kilim, it sits between kilim and soumak in character.',
      djidjimTitle: 'Djidjim',
      djidjimBody:
        'Djidjim (jejim) is a flatweave technique where coloured supplementary wefts float across the surface to form an embroidery-like pattern over the ground weave. Lighter than a pile carpet, it is prized for graphic ornament and soft textile character.',
      decorationTitle: 'Decoration',
      decorationBody:
        'Decoration gathers smaller woven pieces for the home — saddlebags, mafrash chests, cushions, and related textiles. Portable, richly patterned, and made with the same techniques as larger rugs.',
      contactTitle: 'Contact Us',
      policyReturn: 'Return and Refund policy',
      policyPrivacy: 'Customer privacy policy',
      policyShipping: 'Shipping policy',
      socialMedia: 'Social media',
      featuredCollection: 'Featured collection',
      exploreCollection: 'Explore our collection',
      editorialTitle:
        'Handwoven carpets from the Caucasus and beyond — antique and contemporary, natural fibres, in many styles and sizes.',
      editorialBody:
        'Our gallery in Tbilisi holds a diverse collection of Georgian, Persian, Turkish, and Central Asian rugs. Each piece is chosen for its craftsmanship, colour, and story.',
      readStory: 'Read the story',
      aboutHeading: 'About us',
      atHomeTitle: 'At Home',
      atHomeBody:
        'Origin carpets styled in living rooms, bedrooms, and outdoor spaces — colour and craft in everyday life.',
      expertiseEyebrow: 'Expertise',
      expertiseTitle: 'Reading the Carpet',
      expertiseLead: 'What specialists look for: age, origin, and colour.',
      expertiseP1:
        'Age and origin are read from the weave, the knots, the drawing of the pattern, and how the wool has worn. Each region leaves its own handwriting on a carpet.',
      expertiseP2:
        'The film also tells the longer story — how carpet traditions travelled — and how colours were made from plants, roots, and insects before chemical dyes existed.',
      expertiseP3: ''
    },
    aboutPage: {
      metaTitle: 'About Us — Manana Arkania on TV',
      metaDescription:
        'Our founder, Manana Arkania, on national and international TVs, speaking about Georgian carpet traditions.',
      eyebrow: 'Press & television',
      title:
        'Our founder, Manana Arkania, on national and international TVs, speaking about Georgian carpet traditions',
      lead: 'A curated reel of interviews and features — watch her share Georgian carpet traditions on air.',
      facebookEmbedLabel: 'Video',
      openOnFacebook: 'Watch on Facebook',
      tvEyebrow: 'TV',
      tvBody: 'Full AdjaraTV episode featuring Manana Arkania on Georgian–Caucasian carpet traditions.',
      watchOnAdjara: 'Watch episode',
      statsAppearances: 'appearances',
      statsReels: 'videos',
      statsTv: 'TV feature',
      galleryEyebrow: 'On camera',
      galleryTitle: 'Our Founder on Press and Television',
      galleryHint: 'Videos play in their original orientation.',
      guestsEyebrow: 'Visitors',
      guestsTitle: 'Distinguished guests',
      guestsLead: 'Moments when notable visitors stepped into our Tbilisi gallery.',
      guestGalleryEyebrow: 'Archive',
      guestGalleryTitle: 'From the guest book',
      staffEyebrow: 'People',
      staffTitle: 'Our team',
      staffLead: 'The people of Origin Carpets.',
      localVideoLabel: 'Broadcast'
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
      shipping: 'მსოფლიო მიწოდება',
      sale: 'აქცია — 50%-მდე ფასდაკლება'
    },
    chat: {
      open: 'მოგვწერეთ',
      title: 'Origin Carpets',
      subtitle: 'ჩვეულებრივ რამდენიმე საათში გპასუხობთ',
      body: 'გაქვთ შეკითხვა ხალიჩაზე, მიწოდებაზე ან სხვა თემაზე? მოგვწერეთ და მალე გიპასუხებთ.',
      cta: 'გაგრძელება Messenger-ში',
      note: 'იხსნება Facebook Messenger-ში'
    },
    nav: {
      shop: 'მაღაზია',
      about: 'ჩვენ შესახებ',
      history: 'გალერეის ისტორია',
      carpets: 'ხალიჩები',
      origin: 'ხალიჩის ტექნოლოგია',
      guides: 'სახელმძღვანელოები და წესები',
      contact: 'კონტაქტი',
      social: 'სოციალური მედია',
      appointment: 'ვირტუალური შეხვედრის დაჯავშნა'
    },
    footer: {
      description: 'კავკასიური და აღმოსავლური ხალიჩების საუკეთესო კოლექცია. მსოფლიო მიწოდება UPS-ით.',
      shop: 'მაღაზია',
      productCatalog: 'პროდუქტების კატალოგი',
      checkout: 'შეკვეთის გაფორმება',
      account: 'ანგარიში',
      register: 'რეგისტრაცია',
      myOrders: 'ჩემი შეკვეთები'
    },
    home: {
      siteTitle: 'კავკასიური და აღმოსავლური ხალიჩების საუკეთესო კოლექცია',
      heroSubtitle: 'Origin Carpets · თბილისი',
      heroTitle1: 'შეცვალეთ თქვენი სივრცე',
      heroTitle2: 'ავთენტური აღმოსავლური ხალიჩებით',
      heroBody:
        'გაეცანით ჩვენს გულმოდგინედ შერჩეულ კოლექციას — ვინტაჟური და თანამედროვე ხელით ნაქსოვი ხალიჩები კავკასიიდან. თითოეული ნაწარმოები ჩვენი ექსპერტების მიერ არის შერჩეული ისტორიული სავაჭრო გზებიდან, რომლებიც ადრე აღმოსავლესა და დასავლეთს უკავშირდებოდა.',
      featuredPieces: 'რჩეული ნამუშევრები',
      memberLogin: 'კლიენტის შესვლა',
      curatorSelection: 'კურატორის შერჩევა',
      createAccount: 'ანგარიშის შექმნა',
      goToProfile: 'პროფილზე გადასვლა',
      historyTitle: 'ჩვენი გალერეის ისტორია',
      historyP1:
        'ჩვენი გალერეა 1995 წელს გაიხსნა ქალაქის ისტორიულ უბანში, სადაც XVIII–XIX საუკუნეებში აზიიდან მომავალი ქარავნები ჩერდებოდნენ. გალერეის ერთი ოთახი ადრე აქლემების სადგომს ემსახურებოდა, მეორე კი სავაჭრო დუქანი იყო, სადაც მოვაჭრეები ხალიჩებს ყიდდნენ და ყიდულობდნენ. ეს განწყობა დღემდე შენარჩუნებულია — სამასწლიანი შენობა ისევ ის ადგილია, სადაც სხვადასხვა ეროვნების ადამიანები ხვდებიან და ხალიჩებზე საუბრობენ.',
      historyP2:
        'ევრაზიის გზაჯვარედინზე მდებარე თბილისი საუკუნეების განმავლობაში მნიშვნელოვანი სავაჭრო ცენტრი იყო. აქ შემოდიოდა აზიიდან ხალიჩები და სხვა ძვირფასი ნივთები. საქართველოშიც იქსოვებოდა მაღალი ხარისხის ხალიჩები — განსაკუთრებით თუშეთში, კახეთში, ალვანსა და ახალციხეში.',
      historyP3:
        'ჩვენს გალერეაში წარმოდგენილია ძველი და ახალი ქართული, დაღესტნური, სომხური, აზერბაიჯანული, სპარსული, თურქული და ცენტრალური აზიის ხალიჩები.',
      categoriesTitle: 'ხალიჩის ტექნოლოგია',
      carpetTitle: 'ხალიჩა',
      carpetBody:
        'ხალიჩის ქსოვა ერთ-ერთი ყველაზე გავრცელებული ტექნიკაა. ქსოვა სპეციალურ საქსოვ დაზგაზე ხდება: ჯერ იქსოვება ქსელი (მატყლი, ბამბა ან აბრეშუმი), შემდეგ კი ორნამენტი. კლასიკურ ხალიჩაში კვანძის შეკვრისა და ჭრის შედეგად ჩნდება ხაო. ხარისხი გამოიხატება ქსოვის სიმჭიდვოში, ბუნებრივ საღებავებსა და ძაფის ხარისხში.',
      kilimTitle: 'ფარდაგი',
      kilimBody:
        'ფარდაგი ხალიჩაზე უფრო თხელი, ბრტყელი ქსოვილია ხაოს გარეშე. ორნამენტი კვანძებით იქმნება, მაგრამ კვანძები არ იჭრება. ხშირად გამოიყენება ბუნებრივი მცენარეული საღებავები.',
      soumakTitle: 'სუმახი',
      soumakBody:
        'სუმახი იქსოვება ფერადი ძაფების საფუძველზე შემოვლით — გამოდის ბრტყელი, მაგრამ ტექსტურირებული ზედაპირი. ფარდაგზე უფრო მკვრივი და რელიეფურია, ხაოს გარეშე.',
      ziliTitle: 'ზილი',
      ziliBody:
        'ზილი კავკასიური ბრტყელი ქსოვის ტექნიკაა, სადაც დამატებითი ძაფებით იქმნება გეომეტრიული ორნამენტი, რომელიც ქსელის ზედაპირზე ოდნავ ამოწეულია. ფარდაგზე უფრო მკვრივი და რელიეფურია და ხასიათით ფარდაგსა და სუმახს შორის დგას.',
      djidjimTitle: 'ჯეჯიმი',
      djidjimBody:
        'ჯეჯიმი ბრტყელი ქსოვის ტექნიკაა, სადაც ფერადი დამატებითი ძაფები ზედაპირზე ცურავს და ქმნის ნაქარგივით ორნამენტს ძირითადი ქსოვილის თავზე. უფრო მსუბუქია ვიდრე ხაოიანი ხალიჩა, უფრო დატვირთულია ვიდრე ფარდაგი და გამოირჩევა გრაფიკული ნახატით.',
      decorationTitle: 'დეკორაცია',
      decorationBody:
        'დეკორაცია აერთიანებს სახლისთვის განკუთვნილ პატარა ნაქსოვებს — ხურჯინს, მაფრაშს, ბალიშებს და მსგავს ტექსტილს. პორტატული, ორნამენტით მდიდარი და იგივე ტექნიკით ნაქსოვი, რითაც დიდი ხალიჩები.',
      contactTitle: 'კონტაქტი',
      policyReturn: 'დაბრუნებისა და ანაზღაურების პოლიტიკა',
      policyPrivacy: 'მომხმარებლის კონფიდენციალურობის პოლიტიკა',
      policyShipping: 'მიწოდების პოლიტიკა',
      socialMedia: 'სოციალური მედია',
      featuredCollection: 'რჩეული კოლექცია',
      exploreCollection: 'გაეცანით კოლექციას',
      editorialTitle:
        'ხელით ნაქსოვი ხალიჩები კავკასიიდან და მის გარშემო - ანტიკური და თანამედროვე, ბუნებრივი, მცენარეული საღებავებით, სხვადასხვა სტილსა და ზომაში.',
      editorialBody:
        'ჩვენი თბილისის გალერეა აერთიანებს ქართული, სპარსული, თურქული და ცენტრალური აზიის ხალიჩების მდიდარ კოლექციას. თითოეული ნაწარმოები შერჩეულია ხელოვნების, ფერისა და ისტორიის გამო.',
      readStory: 'ისტორიის წაკითხვა',
      aboutHeading: 'ჩვენ შესახებ',
      atHomeTitle: 'სახლში',
      atHomeBody:
        'ჩვენი ხალიჩები მისაღებში, საძინებელსა და ღია სივრცეებში — ფერი და ხელობა ყოველდღიურ ცხოვრებაში.',
      expertiseEyebrow: 'ექსპერტიზა',
      expertiseTitle: 'ხალიჩის წაკითხვა',
      expertiseLead: 'რას უყურებენ სპეციალისტები: ასაკს, წარმომავლობას და ფერს.',
      expertiseP1:
        'ასაკი და წარმომავლობა იკითხება ქსოვიდან, კვანძებიდან, ორნამენტის ხატვიდან და იმიდან, როგორ არის გაცვეთილი მატყლი. თითოეულ რეგიონს თავისი „ხელწერა“ აქვს ხალიჩაზე.',
      expertiseP2:
        'ფილმშია ასევე ხალიჩის ისტორია — როგორ მოგზაურობდა ტრადიცია — და როგორ მზადდებოდა ფერები მცენარეებით, ფესვებითა და მწერებით, სანამ ქიმიური საღებავები გამოჩნდებოდა.',
      expertiseP3: ''
    },
    aboutPage: {
      metaTitle: 'ჩვენ შესახებ — მანანა არქანია ტელევიზიაში',
      metaDescription:
        'ჩვენი დამფუძნებელი მანანა არქანია ეროვნულ და საერთაშორისო ტელევიზიებში ქართული ხალიჩის ტრადიციებზე საუბრობს.',
      eyebrow: 'პრესა და ტელევიზია',
      title:
        'ჩვენი დამფუძნებელი მანანა არქანია ეროვნულ და საერთაშორისო ტელევიზიებში ქართული ხალიჩის ტრადიციებზე საუბრობს',
      lead: 'შერჩეული ინტერვიუები და სიუჟეტები — ნახეთ, როგორ საუბრობს ის ქართული ხალიჩის ტრადიციებზე.',
      facebookEmbedLabel: 'ვიდეო',
      openOnFacebook: 'ნახეთ Facebook-ზე',
      tvEyebrow: 'TV',
      tvBody: 'აჭარა TV-ის სრული ეპიზოდი — მანანა არქანია ქართულ-კავკასიურ ხალიჩის ტრადიციებზე.',
      watchOnAdjara: 'ეპიზოდის ნახვა',
      statsAppearances: 'გამოჩენა',
      statsReels: 'ვიდეო',
      statsTv: 'ტელესიუჟეტი',
      galleryEyebrow: 'კადრში',
      galleryTitle: 'ჩვენი დამფუძნებელი პრესასა და ტელევიზიაში',
      galleryHint: 'ვიდეოები ნაჩვენებია ორიგინალური ორიენტაციით.',
      guestsEyebrow: 'სტუმრები',
      guestsTitle: 'გამორჩეული სტუმრები',
      guestsLead: 'მომენტები, როცა ცნობილმა სტუმრებმა ჩვენს თბილისის გალერეას ეწვივნენ.',
      guestGalleryEyebrow: 'არქივი',
      guestGalleryTitle: 'სტუმრების წიგნიდან',
      staffEyebrow: 'ადამიანები',
      staffTitle: 'ჩვენი გუნდი',
      staffLead: 'Origin Carpets-ის გუნდის წევრები.',
      localVideoLabel: 'ტელესიუჟეტი'
    },
    footerLinks: footerTranslations.ka,
    ...storefrontTranslations.ka,
    ...adminTranslations.ka
  }
};

export type Dictionary = (typeof dictionaries)[Locale];

/** Resolve locale from cookie/storage value. Anything except explicit Georgian codes defaults to English. */
export function normalizeLocale(value?: string | null): Locale {
  if (!value) return DEFAULT_LOCALE;
  const code = value.trim().toLowerCase();
  if (code === 'ka' || code === 'ge' || code === 'geo') return 'ka';
  return DEFAULT_LOCALE;
}

export function resolveSiteLocale(cookieValue?: string | null): Locale {
  return normalizeLocale(cookieValue);
}

export function formatCount(template: string, count: number): string {
  return template.replace('{count}', String(count));
}
