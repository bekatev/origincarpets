export type Locale = 'en' | 'ka';

export const LANG_COOKIE = 'site_lang';

type Dictionary = {
  common: {
    language: string;
    english: string;
    georgian: string;
    login: string;
    cart: string;
    close: string;
    menu: string;
  };
  topbar: {
    shipping: string;
  };
  nav: {
    about: string;
    carpets: string;
    origin: string;
    guides: string;
    contact: string;
    social: string;
    appointment: string;
  };
  footer: {
    description: string;
    shop: string;
    productCatalog: string;
    checkout: string;
    account: string;
    register: string;
    myOrders: string;
  };
  home: {
    heroSubtitle: string;
    heroTitle1: string;
    heroTitle2: string;
    heroBody: string;
    featuredPieces: string;
    memberLogin: string;
    curatorSelection: string;
    createAccount: string;
    historyTitle: string;
    historyP1: string;
    historyP2: string;
    historyP3: string;
    categoriesTitle: string;
    carpetTitle: string;
    carpetBody: string;
    kilimTitle: string;
    kilimBody: string;
    contactTitle: string;
    policyReturn: string;
    policyPrivacy: string;
    socialMedia: string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    common: {
      language: 'Language',
      english: 'ENG',
      georgian: 'GEO',
      login: 'Login',
      cart: 'Cart',
      close: 'Close',
      menu: 'Menu'
    },
    topbar: {
      shipping: 'Worldwide Delivery Available'
    },
    nav: {
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
      heroSubtitle: 'Finest Caucasian and Oriental Carpets',
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
      socialMedia: 'Social media'
    }
  },
  ka: {
    common: {
      language: 'ენა',
      english: 'ENG',
      georgian: 'GEO',
      login: 'შესვლა',
      cart: 'კალათა',
      close: 'დახურვა',
      menu: 'მენიუ'
    },
    topbar: {
      shipping: 'მიწოდება მსოფლიოს მასშტაბით'
    },
    nav: {
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
      heroSubtitle: 'კავკასიური და აღმოსავლური ხალიჩების საუკეთესო კოლექცია',
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
      socialMedia: 'სოციალური მედია'
    }
  }
};

export function normalizeLocale(value?: string | null): Locale {
  return value === 'ka' ? 'ka' : 'en';
}
