/** Storefront UI strings (products, cart, checkout, auth, filters). */
export const storefrontTranslations = {
  en: {
    theme: { light: 'Light', dark: 'Dark' },
    cartActions: { add: 'Add to cart', added: 'Added', inCart: 'In cart' },
    products: {
      catalog: 'Catalog',
      title: 'Carpet Collection',
      intro: 'Search and filter carpets by category, material, size, origin, color, age, period, and more.',
      countOne: '{count} piece',
      countMany: '{count} pieces',
      noResults: 'No products found for the current filters.'
    },
    filters: {
      title: 'Filters',
      subtitle: 'Refine the collection',
      search: 'Search',
      searchPlaceholder: 'Search carpets',
      category: 'Category',
      allCategories: 'All categories',
      material: 'Material',
      allMaterials: 'All materials',
      size: 'Size',
      allSizes: 'All sizes',
      origin: 'Origin',
      allOrigins: 'All origins',
      color: 'Color',
      allColors: 'All colors',
      age: 'Age',
      allAges: 'All ages',
      period: 'Period',
      allPeriods: 'All periods',
      georgian: 'Georgian carpets',
      allCarpets: 'All carpets',
      georgianOnly: 'Georgian carpets only',
      price: 'Price',
      minPrice: 'Min',
      maxPrice: 'Max',
      apply: 'Apply filters',
      clear: 'Clear all'
    },
    productDetail: {
      notFound: 'Product Not Found',
      size: 'Size',
      dimensions: 'Dimensions',
      weight: 'Weight',
      color: 'Color',
      material: 'Material',
      sku: 'SKU',
      na: 'N/A',
      dimensionUnit: 'cm',
      weightUnit: 'kg'
    },
    cart: {
      title: 'Shopping Cart',
      clear: 'Clear cart',
      empty: 'Your cart is empty.',
      browse: 'Browse products',
      each: 'each',
      remove: 'Remove',
      subtotal: 'Subtotal',
      shippingNote: 'Free domestic delivery within Georgia. Worldwide shipping coming soon.',
      checkout: 'Proceed to checkout'
    },
    checkout: {
      title: 'Checkout',
      empty: 'Your cart is empty.',
      browse: 'Browse products',
      shippingType: 'Georgian Post service',
      georgianPostNote:
        'We currently deliver within Georgia only, via Georgian Post from our Tbilisi gallery. Delivery is free.',
      worldwideComingSoon: 'Worldwide shipping is coming soon.',
      country: 'Country',
      city: 'City',
      selectCountry: 'Select country',
      selectCity: 'Select city',
      loading: 'Loading…',
      methodsLoading: 'Loading delivery services…',
      shippingFree: 'Free',
      shippingProvider: 'Carrier',
      shippingEta: 'Estimated delivery',
      shippingDays: '{min}–{max} business days',
      businessDays: 'business days',
      shippingEstimateWarning: 'Live rate unavailable — showing an estimated shipping cost.',
      countriesLoadFailed: 'Could not load delivery countries.',
      citiesLoadFailed: 'Could not load cities for the selected country.',
      deliverySelectionRequired: 'Please select country, city, and delivery service.',
      browseProducts: 'Browse products',
      methods: {
        georgianPost: {
          title: 'Georgian Post',
          badge: 'Georgian Post'
        },
        recommended: 'Recommended'
      },
      fullName: 'Full name',
      phone: 'Phone',
      region: 'Region',
      postalCode: 'Postal code',
      address1: 'Address line 1',
      address2: 'Address line 2 (optional)',
      creating: 'Creating order...',
      createOrder: 'Continue to payment',
      paymentMethod: 'Payment method',
      paymentMethods: {
        card: {
          title: 'Visa / Mastercard',
          description: 'Pay securely online with your card via iPay.',
          unavailable: 'Card payments are not configured yet. Add iPay credentials on the server.'
        },
        bank: {
          title: 'Bank transfer',
          description: 'Wire the total to our bank account. We ship after payment is confirmed.',
          unavailable: 'Bank transfer is temporarily unavailable.'
        },
        paypal: {
          title: 'PayPal',
          description: 'Pay with your PayPal account.',
          unavailable: 'PayPal is not configured yet. Add PayPal credentials on the server.'
        }
      },
      bankTransfer: {
        title: 'Bank transfer instructions',
        intro: 'Use the details below and include your order number as the payment reference.',
        amount: 'Amount to pay',
        reference: 'Payment reference',
        accountHolder: 'Account holder',
        bankName: 'Bank',
        iban: 'IBAN',
        swift: 'SWIFT / BIC',
        contactForDetails: 'For full wire details, email {email}.',
        pendingNote:
          'Your order stays pending until we confirm the transfer. We will email you once payment is received.',
        orderPlaced: 'Order {orderNumber} placed. Complete the bank transfer to confirm.'
      },
      cardRedirecting: 'Redirecting to secure card payment…',
      summary: 'Order Summary',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      total: 'Total',
      loginRequired: 'Please login before checkout.',
      cartEmpty: 'Cart is empty.',
      failed: 'Checkout failed',
      orderCreated: 'Order {orderNumber} created. Please complete payment.',
      paymentSuccess: '{message} Order {orderNumber}.'
    },
    payment: {
      title: 'Complete payment',
      paypalTitle: 'Pay with PayPal',
      payNow: 'Confirm payment',
      paying: 'Processing payment...',
      failed: 'Payment failed',
      success: 'Payment successful. Order marked as PAID.',
      confirmFailed: 'Failed to confirm payment on server'
    },
    checkoutResult: {
      title: 'Payment result',
      success: 'Thank you — your payment was received. We will prepare your order for shipping.',
      pending: 'If you completed payment, it may take a moment to confirm. Check your orders page.',
      viewOrders: 'View my orders',
      continueShopping: 'Continue shopping'
    },
    auth: {
      loginTitle: 'Login',
      loginSubtitle: 'Sign in to manage orders and your account.',
      registerTitle: 'Register',
      registerSubtitle: 'Create a customer account for checkout and tracking.',
      email: 'Email',
      password: 'Password',
      firstName: 'First name',
      lastName: 'Last name',
      signingIn: 'Signing in...',
      loginButton: 'Login',
      creating: 'Creating account...',
      registerButton: 'Register',
      haveAccount: 'Already have an account?',
      noAccount: 'No account?',
      registerLink: 'Register',
      loginLink: 'Login',
      alreadyRegistered: 'Already registered?',
      loginFailed: 'Login failed',
      registerFailed: 'Registration failed'
    },
    orders: {
      title: 'My Orders',
      loading: 'Loading orders...',
      loginRequired: 'Please login to view your orders.',
      empty: 'No orders yet.',
      loadFailed: 'Failed loading orders',
      items: 'item(s)',
      tracking: 'Tracking'
    },
    homeExtra: {
      curator1: 'Karabakh kilim with Roses — $800',
      curator2: 'Caucasian and oriental hand-woven carpets',
      curator3: 'Satisfied customers from over the world',
      curator4: 'Professional stories and tips around carpets',
      curator5: '30+ years of experience',
      phone: 'T. 995 577 405 311',
      email: 'E. info@origincarpets.com',
      address: 'A. 8/10 Erekle II street, Tbilisi, Georgia'
    }
  },
  ka: {
    theme: { light: 'ღია', dark: 'მუქი' },
    cartActions: { add: 'კალათაში დამატება', added: 'დაემატა', inCart: 'კალათაშია' },
    products: {
      catalog: 'კატალოგი',
      title: 'ხალიჩების კოლექცია',
      intro: 'მოძებნეთ და გაფილტრეთ ხალიჩები კატეგორიით, მასალით, ზომით, წარმომავლობით, ფერით, ასაკით, პერიოდით და სხვა.',
      countOne: '{count} ნამუშევარი',
      countMany: '{count} ნამუშევარი',
      noResults: 'მოცემული ფილტრებით პროდუქტი ვერ მოიძებნა.'
    },
    filters: {
      title: 'ფილტრები',
      subtitle: 'შეაზუსტეთ კოლექცია',
      search: 'ძებნა',
      searchPlaceholder: 'ხალიჩების ძებნა',
      category: 'კატეგორია',
      allCategories: 'ყველა კატეგორია',
      material: 'მასალა',
      allMaterials: 'ყველა მასალა',
      size: 'ზომა',
      allSizes: 'ყველა ზომა',
      origin: 'წარმომავლობა',
      allOrigins: 'ყველა წარმომავლობა',
      color: 'ფერი',
      allColors: 'ყველა ფერი',
      age: 'ასაკი',
      allAges: 'ყველა ასაკი',
      period: 'პერიოდი',
      allPeriods: 'ყველა პერიოდი',
      georgian: 'ქართული ხალიჩები',
      allCarpets: 'ყველა ხალიჩა',
      georgianOnly: 'მხოლოდ ქართული ხალიჩები',
      price: 'ფასი',
      minPrice: 'მინ.',
      maxPrice: 'მაქს.',
      apply: 'ფილტრის გამოყენება',
      clear: 'გასუფთავება'
    },
    productDetail: {
      notFound: 'პროდუქტი ვერ მოიძებნა',
      size: 'ზომა',
      dimensions: 'ზომები',
      weight: 'წონა',
      color: 'ფერი',
      material: 'მასალა',
      sku: 'არტიკული',
      na: '—',
      dimensionUnit: 'სმ',
      weightUnit: 'კგ'
    },
    cart: {
      title: 'საყიდლების კალათა',
      clear: 'კალათის გასუფთავება',
      empty: 'თქვენი კალათა ცარიელია.',
      browse: 'პროდუქტების ნახვა',
      each: 'თითო',
      remove: 'წაშლა',
      subtotal: 'ქვეჯამი',
      shippingNote: 'უფასო მიწოდება საქართველოს ფარგლებში. საერთაშორისო მიწოდება მალე.',
      checkout: 'შეკვეთის გაფორმება'
    },
    checkout: {
      title: 'შეკვეთის გაფორმება',
      empty: 'თქვენი კალათა ცარიელია.',
      browse: 'პროდუქტების ნახვა',
      shippingType: 'საქართველოს ფოსტის სერვისი',
      georgianPostNote:
        'ამ ეტაპზე მიწოდება ხორციელდება მხოლოდ საქართველოს ფარგლებში, საქართველოს ფოსტით ჩვენი თბილისის გალერეიდან. მიწოდება უფასოა.',
      worldwideComingSoon: 'საერთაშორისო მიწოდება მალე დაემატება.',
      country: 'ქვეყანა',
      city: 'ქალაქი',
      selectCountry: 'აირჩიეთ ქვეყანა',
      selectCity: 'აირჩიეთ ქალაქი',
      loading: 'იტვირთება…',
      methodsLoading: 'მიწოდების სერვისები იტვირთება…',
      shippingFree: 'უფასო',
      shippingProvider: 'გადამზიდი',
      shippingEta: 'სავარაუდო მიწოდება',
      shippingDays: '{min}–{max} სამუშაო დღე',
      businessDays: 'სამუშაო დღე',
      shippingEstimateWarning: 'ცოცხალი ტარიფი მიუწვდომელია — ნაჩვენებია სავარაუდო ღირებულება.',
      countriesLoadFailed: 'ქვეყნების ჩატვირთვა ვერ მოხერხდა.',
      citiesLoadFailed: 'ქალაქების ჩატვირთვა ვერ მოხერხდა.',
      deliverySelectionRequired: 'გთხოვთ აირჩიოთ ქვეყანა, ქალაქი და მიწოდების სერვისი.',
      browseProducts: 'პროდუქტების ნახვა',
      methods: {
        georgianPost: {
          title: 'საქართველოს ფოსტა',
          badge: 'საქართველოს ფოსტა'
        },
        recommended: 'რეკომენდებული'
      },
      fullName: 'სახელი და გვარი',
      phone: 'ტელეფონი',
      region: 'რეგიონი',
      postalCode: 'საფოსტო ინდექსი',
      address1: 'მისამართი 1',
      address2: 'მისამართი 2 (არასავალდებულო)',
      creating: 'შეკვეთა იქმნება...',
      createOrder: 'გადახდაზე გადასვლა',
      paymentMethod: 'გადახდის მეთოდი',
      paymentMethods: {
        card: {
          title: 'Visa / Mastercard',
          description: 'უსაფრთხო ონლაინ გადახდა ბარათით iPay-ის მეშვეობით.',
          unavailable: 'ბარათით გადახდა ჯერ არ არის კონფიგურირებული.'
        },
        bank: {
          title: 'საბანკო გადარიცხვა',
          description: 'გადაირიცხეთ თანხა ჩვენს ანგარიშზე. გაგზავნა გადახდის დადასტურების შემდეგ.',
          unavailable: 'საბანკო გადარიცხვა დროებით მიუწვდომელია.'
        },
        paypal: {
          title: 'PayPal',
          description: 'გადაიხადეთ PayPal ანგარიშით.',
          unavailable: 'PayPal ჯერ არ არის კონფიგურირებული.'
        }
      },
      bankTransfer: {
        title: 'საბანკო გადარიცხვის ინსტრუქცია',
        intro: 'გამოიყენეთ ქვემოთ მოცემული რეკვიზიტები და გადარიცხვის დანიშნულებაში მიუთითეთ შეკვეთის ნომერი.',
        amount: 'გადასახდელი თანხა',
        reference: 'გადარიცხვის დანიშნულება',
        accountHolder: 'მიმღები',
        bankName: 'ბანკი',
        iban: 'IBAN',
        swift: 'SWIFT / BIC',
        contactForDetails: 'სრული რეკვიზიტებისთვის დაგვიკავშირდით: {email}.',
        pendingNote:
          'შეკვეთა მოცდის სტატუსზეა, სანამ გადარიცხვას არ დავადასტურებთ. გადახდის მიღების შემდეგ დაგიკავშირდებით.',
        orderPlaced: 'შეკვეთა {orderNumber} მიღებულია. გადარიცხვის დასრულების შემდეგ დავადასტურებთ.'
      },
      cardRedirecting: 'ბარათით გადახდის გვერდზე გადამისამართება…',
      summary: 'შეკვეთის შინაარსი',
      subtotal: 'ქვეჯამი',
      shipping: 'მიწოდება',
      total: 'სულ',
      loginRequired: 'შეკვეთამდე გთხოვთ შეხვიდეთ ანგარიშში.',
      cartEmpty: 'კალათა ცარიელია.',
      failed: 'შეკვეთის გაფორმება ვერ მოხერხდა',
      orderCreated: 'შეკვეთა {orderNumber} შეიქმნა. გთხოვთ დაასრულოთ გადახდა.',
      paymentSuccess: '{message} შეკვეთა {orderNumber}.'
    },
    payment: {
      title: 'გადახდის დასრულება',
      paypalTitle: 'გადახდა PayPal-ით',
      payNow: 'გადახდის დადასტურება',
      paying: 'გადახდა მუშავდება...',
      failed: 'გადახდა ვერ მოხერხდა',
      success: 'გადახდა წარმატებით დასრულდა. შეკვეთა მონიშნულია როგორც გადახდილი.',
      confirmFailed: 'გადახდის დადასტურება სერვერზე ვერ მოხერხდა'
    },
    checkoutResult: {
      title: 'გადახდის შედეგი',
      success: 'გმადლობთ — გადახდა მიღებულია. შეკვეთას მალე გავუგზავნით.',
      pending: 'თუ გადახდა დაასრულეთ, დადასტურებას შეიძლება რამდენიმე წუთი დასჭირდეს. შეამოწმეთ შეკვეთები.',
      viewOrders: 'ჩემი შეკვეთები',
      continueShopping: 'შოპინგის გაგრძელება'
    },
    auth: {
      loginTitle: 'შესვლა',
      loginSubtitle: 'შედით ანგარიშში შეკვეთებისა და პროფილის სამართავად.',
      registerTitle: 'რეგისტრაცია',
      registerSubtitle: 'შექმენით ანგარიში შეკვეთისა და თვალთვალისთვის.',
      email: 'ელფოსტა',
      password: 'პაროლი',
      firstName: 'სახელი',
      lastName: 'გვარი',
      signingIn: 'შესვლა...',
      loginButton: 'შესვლა',
      creating: 'ანგარიში იქმნება...',
      registerButton: 'რეგისტრაცია',
      haveAccount: 'უკვე გაქვთ ანგარიში?',
      noAccount: 'არ გაქვთ ანგარიში?',
      registerLink: 'რეგისტრაცია',
      loginLink: 'შესვლა',
      alreadyRegistered: 'უკვე დარეგისტრირდით?',
      loginFailed: 'შესვლა ვერ მოხერხდა',
      registerFailed: 'რეგისტრაცია ვერ მოხერხდა'
    },
    orders: {
      title: 'ჩემი შეკვეთები',
      loading: 'შეკვეთები იტვირთება...',
      loginRequired: 'შეკვეთების სანახავად გთხოვთ შეხვიდეთ ანგარიშში.',
      empty: 'შეკვეთები ჯერ არ გაქვთ.',
      loadFailed: 'შეკვეთების ჩატვირთვა ვერ მოხერხდა',
      items: 'პროდუქტი',
      tracking: 'თრექინგი'
    },
    homeExtra: {
      curator1: 'ყარაბახის ვარდების ქილიმი — $800',
      curator2: 'კავკასიური და აღმოსავლური ხელნაქსოვი ხალიჩები',
      curator3: 'კმაყოფილი მომხმარებლები მთელი მსოფლიოდან',
      curator4: 'პროფესიონალური ისტორიები და რჩევები ხალიჩებზე',
      curator5: '30+ წლის გამოცდილება',
      phone: 'ტ. 995 577 405 311',
      email: 'ელ. info@origincarpets.com',
      address: 'მ. ერეკლე II-ის ქ. 8/10, თბილისი, საქართველო'
    }
  }
} as const;

export type StorefrontTranslations = (typeof storefrontTranslations)['en'];
