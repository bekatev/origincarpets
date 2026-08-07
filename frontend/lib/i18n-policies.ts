export type PolicyBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'ul'; items: readonly string[] }
  | { type: 'address'; lines: readonly string[] };

export type PolicyContent = {
  title: string;
  lastUpdated?: string;
  blocks: PolicyBlock[];
};

export const policyTranslations = {
  en: {
    returnRefund: {
      title: 'Return and Refund policy',
      lastUpdated: 'Last updated October 03, 2020',
      blocks: [
        {
          type: 'p',
          text: 'Thank you for your purchase. We hope you are happy with your purchase. However, if you are not completely satisfied with your purchase for any reason, you may return it to us for a full refund only. Please see below for more information on our return policy.'
        },
        { type: 'h2', text: 'RETURNS' },
        {
          type: 'p',
          text: 'All returns must be postmarked within thirty (30) days of the purchase date. All returned items must be in new and unused condition, with all original tags and labels attached.'
        },
        { type: 'h2', text: 'RETURN PROCESS' },
        {
          type: 'p',
          text: 'To return an item, please email customer service at gallerycarpets19@gmail.com to obtain a Return Merchandise Authorization (RMA) number. After receiving a RMA number, place the item securely in its original packaging, and mail your return to the following address:'
        },
        {
          type: 'address',
          lines: [
            'Origin Carpets',
            'Attn: Returns',
            'RMA #',
            'gallerycarpets19@gmail.com',
            '8/10 Erekle II street',
            'Tbilisi, 0105',
            'Georgia'
          ]
        },
        {
          type: 'p',
          text: 'Please note, you will be responsible for all return shipping charges. We strongly recommend that you use a trackable method to mail your return.'
        },
        { type: 'h2', text: 'REFUNDS' },
        {
          type: 'p',
          text: 'After receiving your return and inspecting the condition of your item, we will process your return. Please allow at least thirty (30) days from the receipt of your item to process your return. Refunds may take 1-2 billing cycles to appear on your credit card statement, depending on your credit card company. We will notify you by email when your return has been processed.'
        },
        { type: 'h2', text: 'EXCEPTIONS' },
        { type: 'p', text: 'The following items cannot be returned:' },
        {
          type: 'ul',
          items: ['if they are not in the same condition as they were at the time of sale']
        },
        {
          type: 'p',
          text: 'For defective or damaged products, please contact us at the customer service number below to arrange a refund or exchange.'
        },
        { type: 'h2', text: 'Please Note' },
        { type: 'ul', items: ['Sale items are FINAL SALE and cannot be returned.'] },
        { type: 'h2', text: 'QUESTIONS' },
        {
          type: 'p',
          text: 'If you have any questions concerning our return policy, please contact us at:'
        },
        {
          type: 'address',
          lines: ['+995577405311', 'gallerycarpets19@gmail.com']
        },
        {
          type: 'p',
          text: 'This return policy was created using Termly’s Return and Refund Policy Generator.'
        }
      ]
    },
    privacy: {
      title: 'Customer privacy policy',
      blocks: [
        { type: 'h2', text: 'Personal identification information' },
        {
          type: 'p',
          text: 'We may collect personal identification information from Users in a variety of ways, including, but not limited to, when Users visit our site, register on the site, place an order, fill out a form and in connection with other activities, services, features or resources we make available on our Site. Users may be asked for, as appropriate, name, email address, mailing address, phone number, credit card information.'
        },
        {
          type: 'p',
          text: 'We will collect personal identification information from Users only if they voluntarily submit such information to us. Users can always refuse to supply personally identification information, except that it may prevent them from engaging in certain Site related activities.'
        },
        { type: 'h2', text: 'Non-personal identification information' },
        {
          type: 'p',
          text: 'We may collect non-personal identification information about Users whenever they interact with our Site. Non-personal identification information may include the browser name, the type of computer and technical information about Users means of connection to our Site, such as the operating system and the Internet service providers utilized and other similar information.'
        },
        { type: 'h2', text: 'Web browser cookies' },
        {
          type: 'p',
          text: 'Our Site may use "cookies" to enhance User experience. User\'s web browser places cookies on their hard drive for record-keeping purposes and sometimes to track information about them. User may choose to set their web browser to refuse cookies, or to alert you when cookies are being sent. If they do so, note that some parts of the Site may not function properly.'
        },
        { type: 'h2', text: 'How we use collected information' },
        {
          type: 'p',
          text: 'Origin Carpets collects and uses Users personal information for the following purposes:'
        },
        { type: 'h2', text: 'To improve customer service' },
        {
          type: 'p',
          text: 'Your information helps us to more effectively respond to your customer service requests and support needs.'
        },
        { type: 'h2', text: 'To improve our Site' },
        {
          type: 'p',
          text: 'We continually strive to improve our website offerings based on the information and feedback we receive from you.'
        },
        { type: 'h2', text: 'To process transactions' },
        {
          type: 'p',
          text: 'We may use the information Users provide about themselves when placing an order only to provide service to that order. We do not share this information with outside parties except to the extent necessary to provide the service.'
        },
        { type: 'h2', text: 'To send periodic emails' },
        {
          type: 'p',
          text: 'The email address Users provide for order processing, will only be used to send them information and updates pertaining to their order. It may also be used to respond to their inquiries, and/or other requests or questions. If User decides to opt-in to our mailing list, they will receive emails that may include company news, updates, related product or service information, etc. If at any time the User would like to unsubscribe from receiving future emails, we include detailed unsubscribe instructions at the bottom of each email or User may contact us via our Site.'
        },
        { type: 'h2', text: 'How we protect your information' },
        {
          type: 'p',
          text: 'We adopt appropriate data collection, storage and processing practices and security measures to protect against unauthorized access, alteration, disclosure or destruction of your personal information, username, password, transaction information and data stored on our Site.'
        },
        { type: 'h2', text: 'Changes to this privacy policy' },
        {
          type: 'p',
          text: 'Origin Carpets has the discretion to update this privacy policy at any time. When we do, post a notification on the main page of our Site, revise the updated date at the bottom of this page, send you an email. We encourage Users to frequently check this page for any changes to stay informed about how we are helping to protect the personal information we collect. You acknowledge and agree that it is your responsibility to review this privacy policy periodically and become aware of modifications.'
        },
        { type: 'h2', text: 'Your acceptance of these terms' },
        {
          type: 'p',
          text: 'By using this Site, you signify your acceptance of this policy and terms of service. If you do not agree to this policy, please do not use our Site. Your continued use of the Site following the posting of changes to this policy will be deemed your acceptance of those changes.'
        },
        { type: 'h2', text: 'Contacting us' },
        {
          type: 'p',
          text: 'If you have any questions about this Privacy Policy, the practices of this site, or your dealings with this site, please contact us at:'
        },
        {
          type: 'address',
          lines: [
            'Origin Carpets',
            'www.origincarpets.com',
            '8/10 Erekle II street, Tbilisi, Georgia',
            '+995577405311',
            'Gallerycarpets19@gmail.com',
            'Gallerycarpets@yahoo.com'
          ]
        }
      ]
    },
    shipping: {
      title: 'Shipping policy',
      blocks: [
        {
          type: 'p',
          text: 'At Origin Carpets, every handmade carpet leaves our Tbilisi gallery with the same care we give to selecting it. Shipping is not an afterthought — it is part of the promise that your piece will arrive safely, on time, and ready to become part of your home. This page explains how we ship, why we partner with UPS, and what you can expect from the moment your order is confirmed until delivery is complete.'
        },
        { type: 'h2', text: 'Our carrier: UPS' },
        {
          type: 'p',
          text: 'We ship with UPS, one of the world’s most trusted logistics networks — known for reliable tracking, careful handling of valuable goods, and consistent delivery in Georgia and abroad. Your order is packed in our gallery and handed to UPS with full documentation, so you always know where your carpet is.'
        },
        { type: 'h2', text: 'Free shipping within Georgia' },
        {
          type: 'p',
          text: 'Delivery inside Georgia is free of charge. We cover the UPS shipping cost for eligible orders delivered within Georgia. There is no separate freight line on your invoice for domestic Georgian delivery — you pay for the carpet; we take care of getting it to you safely through UPS.'
        },
        { type: 'h2', text: 'International shipping' },
        {
          type: 'p',
          text: 'For destinations outside Georgia, we also use UPS. International rates depend on destination, package dimensions, weight, and the service level required for safe transit of textiles. Before your order is finalised, we calculate shipping carefully so you see a clear cost.'
        },
        { type: 'h2', text: 'Delivery times' },
        {
          type: 'p',
          text: 'Within Georgia, UPS typically delivers within a few business days after dispatch, depending on your city and local service schedules. International delivery times vary by country and customs processing. Once your order ships, you receive tracking details so you can follow the UPS journey in real time. If a delay occurs in the UPS network or at customs, we help you interpret the tracking status and contact the right support channels.'
        },
        { type: 'h2', text: 'What we need from you' },
        {
          type: 'p',
          text: 'Accurate delivery details keep UPS efficient: full name, phone number, and complete street address. Wrong addresses or unreachable phones are the most common causes of failed first delivery attempts.'
        },
        { type: 'h2', text: 'Questions about shipping' },
        {
          type: 'p',
          text: 'If you want to confirm free Georgia delivery for your order, ask about UPS transit time to your city, or plan an international shipment, contact us before or after purchase. We are happy to explain packaging, tracking, and what to expect on arrival.'
        },
        {
          type: 'address',
          lines: [
            'Origin Carpets',
            '8/10 Erekle II street, Tbilisi, 0105, Georgia',
            '+995 577 405 311',
            'info@origincarpets.com'
          ]
        }
      ]
    }
  },
  ka: {
    returnRefund: {
      title: 'დაბრუნებისა და ანაზღაურების პოლიტიკა',
      lastUpdated: 'ბოლო განახლება: 2020 წლის 3 ოქტომბერი',
      blocks: [
        {
          type: 'p',
          text: 'მადლობა თქვენი შეძენისთვის. იმედი გვაქვს, რომ კმაყოფილი ხართ თქვენი შეძენით. თუმცა, თუ რაიმე მიზეზით სრულად არ ხართ კმაყოფილი, შეგიძლიათ დაგვიბრუნოთ პროდუქტი მხოლოდ სრული ანაზღაურებისთვის. დაბრუნების პოლიტიკის შესახებ დამატებითი ინფორმაცია იხილეთ ქვემოთ.'
        },
        { type: 'h2', text: 'დაბრუნება' },
        {
          type: 'p',
          text: 'ყველა დაბრუნება უნდა გაიგზავნოს სამოც (30) დღის განმავლობაში შეძენის თარიღიდან. დაბრუნებული ნივთები უნდა იყოს ახალი და გამოუყენებელი მდგომარეობაში, ყველა ორიგინალი ეტიკეტითა და ჭდით.'
        },
        { type: 'h2', text: 'დაბრუნების პროცესი' },
        {
          type: 'p',
          text: 'ნივთის დასაბრუნებლად, გთხოვთ, დაუკავშირდეთ მომხმარებელთა სერვისს ელფოსტით gallerycarpets19@gmail.com და მიიღოთ დაბრუნების ავტორიზაციის (RMA) ნომერი. RMA ნომრის მიღების შემდეგ, უსაფრთხოდ შეფუთეთ ნივთი ორიგინალ შეფუთვაში და გამოაგზავნეთ შემდეგ მისამართზე:'
        },
        {
          type: 'address',
          lines: [
            'Origin Carpets',
            'Attn: Returns',
            'RMA #',
            'gallerycarpets19@gmail.com',
            'ერეკლე II-ის ქ. 8/10',
            'თბილისი, 0105',
            'საქართველო'
          ]
        },
        {
          type: 'p',
          text: 'გთხოვთ გაითვალისწინოთ, დაბრუნების მიწოდების ყველა ხარჯი თქვენს პასუხისმგებლობაზეა. გირჩევთ, გამოიყენოთ თვალყურის დევნებადი მიწოდების მეთოდი.'
        },
        { type: 'h2', text: 'ანაზღაურება' },
        {
          type: 'p',
          text: 'დაბრუნების მიღებისა და ნივთის მდგომარეობის შემოწმების შემდეგ, დავამუშავებთ თქვენს დაბრუნებას. გთხოვთ, დაელოდოთ მინიმუმ სამოც (30) დღეს ნივთის მიღებიდან. ანაზღაურება საკრედიტო ბარათის ამონაწერზე 1-2 საგადახდო ციკლის შემდეგ შეიძლება ასახულ იქნას. დაბრუნების დამუშავების შესახებ ელფოსტით გაგიცნობებთ.'
        },
        { type: 'h2', text: 'გამონაკლისები' },
        { type: 'p', text: 'შემდეგი ნივთები ვერ დაბრუნდება:' },
        {
          type: 'ul',
          items: ['თუ ისინი არ არის იმავე მდგომარეობაში, როგორც გაყიდვის დროს იყვნენ']
        },
        {
          type: 'p',
          text: 'დეფექტური ან დაზიანებული პროდუქტების შემთხვევაში, დაგვიკავშირდით ქვემოთ მოცემულ ნომერზე ანაზღაურების ან გაცვლისთვის.'
        },
        { type: 'h2', text: 'გთხოვთ გაითვალისწინოთ' },
        { type: 'ul', items: ['ფასდაკლებული ნივთები საბოლოო გაყიდვაა და ვერ დაბრუნდება.'] },
        { type: 'h2', text: 'კითხვები' },
        {
          type: 'p',
          text: 'თუ გაქვთ კითხვები დაბრუნების პოლიტიკასთან დაკავშირებით, დაგვიკავშირდით:'
        },
        {
          type: 'address',
          lines: ['+995577405311', 'gallerycarpets19@gmail.com']
        },
        {
          type: 'p',
          text: 'ეს დაბრუნების პოლიტიკა შექმნილია Termly-ის Return and Refund Policy Generator-ის გამოყენებით.'
        }
      ]
    },
    privacy: {
      title: 'მომხმარებლის კონფიდენციალურობის პოლიტიკა',
      blocks: [
        { type: 'h2', text: 'პირადი საიდენტიფიკაციო ინფორმაცია' },
        {
          type: 'p',
          text: 'ჩვენ შეგვიძლია შევაგროვოთ პირადი საიდენტიფიკაციო ინფორმაცია მომხმარებლებისგან სხვადასხვა გზით, მათ შორის, მაგრამ არა მხოლოდ, როდესაც მომხმარებლები სტუმრობენ ჩვენს საიტს, რეგისტრირდებიან, აკეთებენ შეკვეთას, ავსებენ ფორმას და სხვა აქტივობებთან დაკავშირებით. შესაბამის შემთხვევაში, მომხმარებლებს შეიძლება მოვთხოვოთ სახელი, ელფოსტა, საფოსტო მისამართი, ტელეფონის ნომერი, საკრედიტო ბარათის ინფორმაცია.'
        },
        {
          type: 'p',
          text: 'პირად ინფორმაციას მხოლოდ მაშინ ვაგროვებთ, თუ მომხმარებელი ნებაყოფლობით გვაწვდის ასეთ ინფორმაციას. მომხმარებელს ყოველთვის შეუძლია უარი თქვას პირადი ინფორმაციის მიწოდებაზე, თუმცა ეს შეიძლება შეზღუდოს საიტთან დაკავშირებულ ზოგიერთ აქტივობაში მონაწილეობას.'
        },
        { type: 'h2', text: 'არაპირადი საიდენტიფიკაციო ინფორმაცია' },
        {
          type: 'p',
          text: 'ჩვენ შეგვიძლია შევაგროვოთ არაპირადი ინფორმაცია მომხმარებლების შესახებ, როდესაც ისინი ურთიერთობენ ჩვენს საიტთან. ასეთ ინფორმაციას შეიძლება მოიცავდეს ბრაუზერის სახელი, კომპიუტერის ტიპი და ტექნიკური ინფორმაცია საიტთან კავშირის შესახებ.'
        },
        { type: 'h2', text: 'ვებ ბრაუზერის ქუქი-ფაილები' },
        {
          type: 'p',
          text: 'ჩვენი საიტი შეიძლება იყენებდეს „ქუქი-ფაილებს“ მომხმარებლის გამოცდილების გასაუმჯობესებლად. მომხმარებლის ბრაუზერი ქუქი-ფაილებს ინახავს მყარ დისკზე ჩანაწერისთვის და ზოგჯერ ინფორმაციის თვალყურის დევნებისთვის. მომხმარებელს შეუძლია ბრაუზერი დააყენოს ქუქი-ფაილების უარყოფაზე ან გაფრთხილებაზე მათი გაგზავნისას.'
        },
        { type: 'h2', text: 'როგორ ვიყენებთ შეგროვებულ ინფორმაციას' },
        {
          type: 'p',
          text: 'Origin Carpets აგროვებს და იყენებს მომხმარებლების პირად ინფორმაციას შემდეგი მიზნებისთვის:'
        },
        { type: 'h2', text: 'მომხმარებელთა სერვისის გასაუმჯობესებლად' },
        {
          type: 'p',
          text: 'თქვენი ინფორმაცია გვეხმარება უფრო ეფექტურად ვუპასუხოთ მომხმარებელთა მოთხოვნებსა და მხარდაჭერის საჭიროებებს.'
        },
        { type: 'h2', text: 'საიტის გასაუმჯობესებლად' },
        {
          type: 'p',
          text: 'ჩვენ მუდმივად ვცდილობთ გავაუმჯობესოთ ჩვენი ვებსაიტის შეთავაზებები თქვენგან მიღებული ინფორმაციისა და უკუკავშირის საფუძველზე.'
        },
        { type: 'h2', text: 'ტრანზაქციების დასამუშავებლად' },
        {
          type: 'p',
          text: 'შეკვეთის გაფორმებისას მომხმარებლის მიერ მოწოდებულ ინფორმაციას ვიყენებთ მხოლოდ ამ შეკვეთის მომსახურებისთვის. ამ ინფორმაციას გარე მხარეებთან არ ვაზიარებთ, გარდა იმ შემთხვევისა, როცა ეს სერვისის მიწოდებისთვის აუცილებელია.'
        },
        { type: 'h2', text: 'პერიოდული ელფოსტის გასაგზავნად' },
        {
          type: 'p',
          text: 'შეკვეთის დამუშავებისთვის მოწოდებული ელფოსტის მისამართი გამოიყენება მხოლოდ შეკვეთასთან დაკავშირებული ინფორმაციისა და განახლებების გასაგზავნად. ასევე შეიძლება გამოყენებულ იქნას მოთხოვნებზე პასუხისთვის. თუ მომხმარებელი ჩაიწერება საფოსტო სიაში, მიიღებს კომპანიის სიახლეებსა და პროდუქტებთან დაკავშირებულ ინფორმაციას.'
        },
        { type: 'h2', text: 'როგორ ვიცავთ თქვენს ინფორმაციას' },
        {
          type: 'p',
          text: 'ჩვენ ვიყენებთ შესაბამის მონაცემთა შეგროვების, შენახვისა და დამუშავების პრაქტიკასა და უსაფრთხოების ზომებს თქვენი პირადი ინფორმაციის, მომხმარებლის სახელის, პაროლისა და ტრანზაქციის ინფორმაციის დასაცავად.'
        },
        { type: 'h2', text: 'ცვლილებები ამ კონფიდენციალურობის პოლიტიკაში' },
        {
          type: 'p',
          text: 'Origin Carpets-ს აქვს უფლება ნებისმიერ დროს განაახლოს ეს კონფიდენციალურობის პოლიტიკა. განახლებისას განვათავსებთ შეტყობინებას საიტის მთავარ გვერდზე, განვაახლებთ თარიღს და შეგიძლიათ მიიღოთ ელფოსტა. გირჩევთ პერიოდულად შეამოწმოთ ეს გვერდი.'
        },
        { type: 'h2', text: 'ამ პირობების მიღება' },
        {
          type: 'p',
          text: 'ამ საიტის გამოყენებით თქვენ ადასტურებთ ამ პოლიტიკისა და მომსახურების პირობების მიღებას. თუ არ ეთანხმებით, გთხოვთ არ გამოიყენოთ საიტი. ცვლილებების გამოქვეყნების შემდეგ საიტის გამოყენება ჩაითვლება ამ ცვლილებების მიღებად.'
        },
        { type: 'h2', text: 'დაგვიკავშირდით' },
        {
          type: 'p',
          text: 'თუ გაქვთ კითხვები ამ კონფიდენციალურობის პოლიტიკასთან, საიტის პრაქტიკასთან ან თქვენს ურთიერთობასთან დაკავშირებით, დაგვიკავშირდით:'
        },
        {
          type: 'address',
          lines: [
            'Origin Carpets',
            'www.origincarpets.com',
            'ერეკლე II-ის ქ. 8/10, თბილისი, საქართველო',
            '+995577405311',
            'Gallerycarpets19@gmail.com',
            'Gallerycarpets@yahoo.com'
          ]
        }
      ]
    },
    shipping: {
      title: 'მიწოდების პოლიტიკა',
      blocks: [
        {
          type: 'p',
          text: 'Origin Carpets-ში ყოველი ხელით ნაქსოვი ხალიჩა ჩვენს თბილისის გალერეას ტოვებს იმავე ყურადღებით, რითაც მას ვარჩევთ. მიწოდება შემთხვევითი ნაბიჯი არ არის — ეს დაპირების ნაწილია, რომ თქვენი ნაწარმოები უსაფრთხოდ, დროულად და სახლისთვის მზად მოგივათ. ამ გვერდზე აღწერილია, როგორ ვაგზავნით შეკვეთებს, რატომ ვმუშაობთ UPS-თან და რას უნდა ელოდოთ შეკვეთის დადასტურებიდან მიწოდების დასრულებამდე.'
        },
        { type: 'h2', text: 'ჩვენი გადამზიდავი: UPS' },
        {
          type: 'p',
          text: 'შეკვეთებს ვაგზავნით UPS-ით — მსოფლიოში ერთ-ერთი ყველაზე სანდო ლოჯისტიკური ქსელით. საიმედო თვალყური, ძვირფასი ტვირთის ფრთხილი დამუშავება და სტაბილური მიწოდება საქართველოშიც და საერთაშორისოდ. შეკვეთა იფუთება გალერეაში და გადაეცემა UPS-ს სრული დოკუმენტაციით, რათა ყოველთვის იცოდეთ, სად არის ხალიჩა.'
        },
        { type: 'h2', text: 'უფასო მიწოდება საქართველოში' },
        {
          type: 'p',
          text: 'საქართველოს შიგნით მიწოდება უფასოა. საქართველოში მიწოდებადი შესაბამისი შეკვეთებისთვის UPS-ის მიწოდების ღირებულებას ჩვენ ვფარავთ. შიდა ქართულ მიწოდებაზე ცალკე სატრანსპორტო ხაზი ინვოისზე არ გეწერებათ: იხდით ხალიჩას; უსაფრთხო მიწოდებას UPS-ით ჩვენ ვუზრუნველვყოფთ.'
        },
        { type: 'h2', text: 'საერთაშორისო მიწოდება' },
        {
          type: 'p',
          text: 'საქართველოს გარეთ მიმართულებებზეც ვიყენებთ UPS-ს. საერთაშორისო ტარიფები დამოკიდებულია დანიშნულებაზე, ამანათის ზომაზე, წონასა და ტექსტილის უსაფრთხო ტრანზიტისთვის საჭირო სერვისის დონეზე. შეკვეთის საბოლოო გაფორმებამდე მიწოდების ღირებულებას ზუსტად ვიანგარიშებთ, რომ ხარჯი გასაგები იყოს.'
        },
        { type: 'h2', text: 'მიწოდების ვადები' },
        {
          type: 'p',
          text: 'საქართველოში UPS ჩვეულებრივ რამდენიმე სამუშაო დღეში აწვდის გაგზავნის შემდეგ — თქვენს ქალაქსა და ადგილობრივ გრაფიკზეა დამოკიდებული. საერთაშორისო ვადები ქვეყნებისა და საბაჟოს მიხედვით იცვლება. გაგზავნისთანავე მიიღებთ თვალყურის დევნების დეტალებს, რომ UPS-ის გზას რეალურ დროში ადევნოთ თვალი. თუ დაყოვნება UPS-ის ქსელში ან საბაჟოზე მოხდება, დაგეხმარებით სტატუსის გაგებაში და სწორ მხარდაჭერასთან დაკავშირებაში.'
        },
        { type: 'h2', text: 'რა გვჭირდება თქვენგან' },
        {
          type: 'p',
          text: 'ზუსტი მიწოდების დეტალები UPS-ს ეფექტურს ტოვებს: სრული სახელი, ტელეფონი და სრული ქუჩის მისამართი. არასწორი მისამართი ან მიუწვდომელი ტელეფონი პირველი მიწოდების წარუმატებლობის ყველაზე ხშირი მიზეზია.'
        },
        { type: 'h2', text: 'კითხვები მიწოდებაზე' },
        {
          type: 'p',
          text: 'თუ გსურთ დაადასტუროთ უფასო მიწოდება საქართველოში, იკითხოთ UPS-ის ვადა თქვენს ქალაქამდე ან დაგეგმოთ საერთაშორისო გადაზიდვა — დაგვიკავშირდით შეძენამდე ან შემდეგ. სიამოვნებით აგიხსნით შეფუთვას, თვალყურს და იმას, რასაც ჩამოსვლისას უნდა ელოდოთ.'
        },
        {
          type: 'address',
          lines: [
            'Origin Carpets',
            'ერეკლე II-ის ქ. 8/10, თბილისი, 0105, საქართველო',
            '+995 577 405 311',
            'info@origincarpets.com'
          ]
        }
      ]
    }

  }
} as const;
