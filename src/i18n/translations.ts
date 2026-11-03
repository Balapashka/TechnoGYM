/**
 * i18n translations for RU (default) and EN locales.
 * Keys are organized by feature/component area.
 */

export type Locale = "ru" | "en";

/** Site default language. Russian is the primary locale; English is secondary. */
export const DEFAULT_LOCALE: Locale = "ru";

/** Selectable languages, in the order they appear in the switcher. */
export const LOCALES: { code: Locale; label: string; name: string }[] = [
  { code: "ru", label: "RU", name: "Русский" },
  { code: "en", label: "EN", name: "English" },
];

export interface Translation {
  // Common UI
  common: {
    login: string;
    join: string;
    logout: string;
    account: string;
    cart: string;
    search: string;
    menu: string;
    close: string;
    confirm: string;
    cancel: string;
    loading: string;
    error: string;
    success: string;
    addToCart: string;
    addedToCart: string;
    quickView: string;
    shopNow: string;
    explore: string;
    newSeason: string;
    yourWorkoutYourStyle: string;
    premiumHomeFitness: string;
    featuredProducts: string;
    shopByCategory: string;
    findYourTrainingSpace: string;
    browseEveryCategory: string;
    exploreCollections: string;
    collections: string;
    newArrivals: string;
    allProducts: string;
    forBusiness: string;
  };

  // Navigation
  nav: {
    openMenu: string;
    closeMenu: string;
    menu: string;
    shop: string;
    collections: string;
    wellness: string;
    design: string;
    cardio: string;
    strength: string;
    strengthStations: string;
    treadmills: string;
    bikes: string;
    ellipticals: string;
    rowers: string;
    benches: string;
    accessories: string;
    explore: string;
    products: string;
    support: string;
    company: string;
    about: string;
    contact: string;
    customerSupport: string;
    shipping: string;
    returns: string;
    privacy: string;
    cookiePolicy: string;
    terms: string;
    salesConditions: string;
    forBusiness: string;
    allProducts: string;
    shippingShort: string;
  };

  /**
   * Storefront category names, keyed by the seeded category slug
   * (see prisma/seed.ts). Overrides the English name stored in the DB.
   */
  categories: Record<string, string>;

  /** Sourcing-country labels, keyed by URL code (see src/lib/countries.ts). */
  countries: Record<string, string>;

  // Catalog / PLP
  catalog: {
    eyebrow: string;
    productCount: string;
    sortBy: string;
    sortFeatured: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortName: string;
    maxPrice: string;
    any: string;
    inStockOnly: string;
    compare: string;
    noMatches: string;
    filters: string;
    resetAll: string;
    activeFilters: string;
    /** Chip remove button label — takes {name}. */
    removeFilter: string;
    emptyTitle: string;
    /** Mobile filter sheet CTA — takes {count} (already declined). */
    show: string;
    /** Origin filter option that clears the sourcing-country choice. */
    allOrigins: string;
    /** Grid paging button — takes {count}, the products still undrawn. */
    showMore: string;
    /** Grid paging status — takes {shown} and {total}. */
    shownOf: string;
    /** Grid paging status once every matching product is drawn. */
    allShown: string;
  };

  // Footer
  footer: {
    joinUs: string;
    getTipsAndOffers: string;
    subscribePlaceholder: string;
    subscribeButton: string;
    socialLinks: string;
    legalDisclaimer: string;
    contactsTitle: string;
    seller: string;
    inn: string;
    ogrn: string;
    rights: string;
  };

  // Product
  product: {
    viewDetails: string;
    from: string;
    perMonth: string;
    /** "12 500 ₽ / мес · 36 мес." — takes {amount} and {months}. */
    installment: string;
    madeToOrder: string;
    inStock: string;
    add: string;
    remove: string;
    quantity: string;
    total: string;
    subtotal: string;
    continueShopping: string;
    checkout: string;
    emptyCart: string;
    cartSummary: string;
    brand: string;
    origin: string;
    configuration: string;
    standardConfig: string;
    goToCart: string;
    addedToYourCart: string;
    details: string;
    specs: string;
    home: string;
    notFound: string;
    viewImage: string;
    compare: string;
    clearAll: string;
    removeFromCompare: string;
    /**
     * Made-to-order imports never show a price: the card, the PDP and the
     * compare table render this label plus the quote CTA instead.
     */
    priceOnRequest: string;
    requestPrice: string;
    /** Quote modal subtitle. */
    requestPriceLead: string;
    requestName: string;
    requestPhone: string;
    requestEmail: string;
    requestComment: string;
    requestSubmit: string;
    requestSent: string;
    requestSentBody: string;
    requestErrName: string;
    requestErrPhone: string;
    requestErrEmail: string;
  };

  // Compare (floating bar + /compare page)
  compare: {
    title: string;
    compareCta: string;
    onlyDifferences: string;
    empty: string;
    emptyHint: string;
    /** Toast when the list is full — takes {limit}. */
    limitReached: string;
    price: string;
    availability: string;
    category: string;
    /** Card button label — takes {name}. */
    addToCompare: string;
  };

  // Landing / marketing chrome
  landing: {
    whatThisMeans: string;
    supportEveryBody: string;
    everyLevelWelcome: string;
    trainYourWay: string;
    story: string;
    spec: string;
    previous: string;
    next: string;
    youBelongHere: string;
    noJudgement: string;
    collectionsCount: string;
    exploreTheRange: string;
    collectionsLead: string;
    shop: string;
  };

  // Newsletter form
  newsletter: {
    go: string;
    thanks: string;
  };

  // Generic info pages
  info: {
    updated: string;
    needHelp: string;
    needHelpBody: string;
    contactUs: string;
    phone: string;
    email: string;
    address: string;
    hours: string;
    requisites: string;
    writeUs: string;
    messengers: string;
  };

  // For-business page
  business: {
    eyebrow: string;
    title: string;
    lead: string;
    writeUs: string;
    company: string;
    yourName: string;
    message: string;
    send: string;
    sent: string;
    sentBody: string;
    errCompany: string;
    errName: string;
    errEmail: string;
    errMessage: string;
    benefitPricing: string;
    benefitPricingBody: string;
    benefitService: string;
    benefitServiceBody: string;
    benefitContact: string;
    benefitContactBody: string;
  };

  // Account area
  account: {
    title: string;
    greeting: string;
    guest: string;
    adminDashboard: string;
    orderHistory: string;
    noOrders: string;
    startShopping: string;
    orderStatus: Record<string, string>;
  };

  // Admin console
  admin: {
    products: string;
    categories: string;
    overview: string;
    newProduct: string;
    name: string;
    slug: string;
    description: string;
    price: string;
    category: string;
    badgeOptional: string;
    featuresPerLine: string;
    inStock: string;
    outOfStock: string;
    saving: string;
    saveChanges: string;
    createProduct: string;
    cancel: string;
    edit: string;
    delete: string;
    rename: string;
    add: string;
    newCategoryName: string;
    newName: string;
    confirmDelete: string;
    productCountShort: string;
    actions: string;
    stock: string;
    errSaveProduct: string;
    errDeleteProduct: string;
    errCreateCategory: string;
    errGeneric: string;
    editProduct: string;
    /** Product form toggle: hide the price and sell via a quote instead. */
    priceOnRequest: string;
    quoteRequests: string;
    quoteNoRequests: string;
    quoteProduct: string;
    quoteContact: string;
    quoteDate: string;
    orders: string;
    noOrders: string;
    allStatuses: string;
    orderNo: string;
    date: string;
    customer: string;
    total: string;
    status: string;
    payment: string;
    deliveryMethod: string;
    orderTitle: string;
    items: string;
    contacts: string;
    deliveryAddress: string;
    customerComment: string;
    adminNote: string;
    notifyCustomer: string;
    save: string;
    saved: string;
    backToOrders: string;
    payManual: string;
    payOnline: string;
    pickup: string;
    courier: string;
    revenue: string;
    newOrders: string;
    newLeads: string;
    customers: string;
    leads: string;
    leadSource: string;
    sourceProduct: string;
    sourceBusiness: string;
    sourceContact: string;
    leadNEW: string;
    leadCONTACTED: string;
    leadCLOSED: string;
    subscribers: string;
    noSubscribers: string;
    exportCsv: string;
    settings: string;
    settingsLead: string;
    settingsContacts: string;
    settingsLegal: string;
    settingsDelivery: string;
    settingsSocial: string;
    launchWarning: string;
    goToSettings: string;
    images: string;
    uploadImages: string;
    uploading: string;
    uploadHint: string;
    errUpload: string;
    viewOnSite: string;
    setting_phone: string;
    setting_email: string;
    setting_address: string;
    setting_workingHours: string;
    setting_pickupAddress: string;
    setting_deliveryNote: string;
    setting_legalName: string;
    setting_inn: string;
    setting_ogrn: string;
    setting_legalAddress: string;
    setting_telegram: string;
    setting_whatsapp: string;
    setting_vk: string;
    setting_youtube: string;
    integrations: string;
    intTelegram: string;
    intEmail: string;
    intPayments: string;
    intIndexing: string;
    intOn: string;
    intOff: string;
    intHint: string;
    testModeWarning: string;
    import: string;
    importLead: string;
    downloadCatalog: string;
    columnsTitle: string;
    col_slug: string;
    col_name: string;
    col_category: string;
    col_brand: string;
    col_origin_country: string;
    col_price_rub: string;
    col_price_on_request: string;
    col_in_stock: string;
    col_badge: string;
    col_description: string;
    col_features: string;
    col_images: string;
    categorySlugs: string;
    chooseFile: string;
    deleteMissing: string;
    checkFile: string;
    applyImport: string;
    importPreview: string;
    importDone: string;
    importErrors: string;
  };

  // Country/Locale modal + switcher
  locale: {
    chooseCountry: string;
    language: string;
    country: string;
  };

  /**
   * Messages for API failures, keyed by HTTP status. The API answers in
   * English (it is a machine interface); the UI localizes by status.
   */
  errors: {
    invalidData: string;
    invalidCredentials: string;
    forbidden: string;
    conflict: string;
    notFound: string;
    server: string;
    network: string;
    tooMany: string;
    notFoundTitle: string;
    notFoundBody: string;
    crashTitle: string;
    crashBody: string;
    retry: string;
    toCatalog: string;
    toHome: string;
  };

  // Cookie banner
  cookie: {
    message: string;
    accept: string;
    decline: string;
    learnMore: string;
  };

  // Auth
  auth: {
    signIn: string;
    signUp: string;
    email: string;
    password: string;
    name: string;
    forgotPassword: string;
    resetPassword: string;
    noAccount: string;
    haveAccount: string;
    signInWithGoogle: string;
    orContinueWithEmail: string;
    welcomeBack: string;
    registerLead: string;
    forgotLead: string;
    resetLead: string;
    confirmPassword: string;
    resetToken: string;
    passwordUpdated: string;
    passwordUpdatedBody: string;
    demoToken: string;
    continueToReset: string;
    demoShopper: string;
    demoAdmin: string;
  };

  // Checkout
  checkout: {
    checkout: string;
    shippingAddress: string;
    paymentMethod: string;
    orderSummary: string;
    placeOrder: string;
    processing: string;
    fullName: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
    orderConfirmed: string;
    backToHome: string;
    serverError: string;
    total: string;
    contacts: string;
    delivery: string;
    deliveryCourier: string;
    deliveryPickup: string;
    pickupFrom: string;
    addressHint: string;
    postalOptional: string;
    comment: string;
    commentHint: string;
    payManual: string;
    payManualHint: string;
    payOnline: string;
    payOnlineHint: string;
    placeOrderPay: string;
    orderNumber: string;
    whatNext: string;
    paymentPending: string;
    paymentPendingBody: string;
    payAgain: string;
    paid: string;
    paidBody: string;
    orderNotFound: string;
    currencyNote: string;
    deliveryCostNote: string;
    toAccount: string;
    continueShopping: string;
    emailSent: string;
  };

  // Cart
  cart: {
    title: string;
    yourCart: string;
    emptyCart: string;
    browseProducts: string;
    browseCollections: string;
    continueShopping: string;
    summary: string;
    subtotal: string;
    shipping: string;
    shippingAtCheckout: string;
    taxes: string;
    total: string;
    checkout: string;
    viewFullCart: string;
    remove: string;
    quantity: string;
    increase: string;
    decrease: string;
    closeCart: string;
  };
  legal: {
    consentPrefix: string;
    privacyLink: string;
    consentNewsletter: string;
    consentRequired: string;
  };
  search: {
    title: string;
    placeholder: string;
    submit: string;
    found: string;
    nothing: string;
    nothingHint: string;
    hint: string;
    openSearch: string;
  };
}

export const translations: Record<Locale, Translation> = {
  ru: {
    common: {
      login: "Войти",
      join: "Регистрация",
      logout: "Выйти",
      account: "Аккаунт",
      cart: "Корзина",
      search: "Поиск",
      menu: "Меню",
      close: "Закрыть",
      confirm: "Подтвердить",
      cancel: "Отмена",
      loading: "Загрузка...",
      error: "Ошибка",
      success: "Успешно",
      addToCart: "Добавить в корзину",
      addedToCart: "Добавлено в корзину",
      quickView: "Быстрый просмотр",
      shopNow: "Купить сейчас",
      explore: "Обзор",
      newSeason: "Новый сезон",
      yourWorkoutYourStyle: "Ваша тренировка, ваш стиль",
      featuredProducts: "Рекомендуемые товары",
      shopByCategory: "Купить по категории",
      findYourTrainingSpace: "Найдите своё тренировочное пространство",
      browseEveryCategory:
        "Просматривайте все категории в виде интерактивной плитки с быстрым просмотром и мгновенным добавлением в корзину.",
      exploreCollections: "Обзор коллекций",
      collections: "Коллекции",
      newArrivals: "Новинки",
      allProducts: "Все товары",
      forBusiness: "Для бизнеса",
      premiumHomeFitness: "Беговые дорожки, велотренажёры, силовые станции и свободные веса для дома, фитнес-клубов и корпоративных залов. Доставка по России и СНГ.",
    },
    nav: {
      openMenu: "Открыть меню",
      closeMenu: "Закрыть меню",
      menu: "Меню",
      shop: "Магазин",
      collections: "Коллекции",
      wellness: "Здоровье",
      design: "Дизайн",
      cardio: "Кардиотренажеры",
      strength: "Силовые тренажёры",
      strengthStations: "Силовые станции",
      treadmills: "Беговые дорожки",
      bikes: "Велотренажёры",
      ellipticals: "Эллиптические тренажёры",
      rowers: "Гребные тренажёры",
      benches: "Скамьи",
      accessories: "Аксессуары",
      explore: "Каталог",
      products: "Товары",
      company: "Компания",
      contact: "Контакты",
      privacy: "Политика конфиденциальности",
      cookiePolicy: "Политика cookie",
      support: "Покупателям",
      about: "О компании",
      customerSupport: "Помощь покупателю",
      shipping: "Доставка и оплата",
      returns: "Обмен и возврат",
      terms: "Пользовательское соглашение",
      salesConditions: "Условия продажи (оферта)",
      forBusiness: "Для бизнеса",
      allProducts: "Все товары",
      shippingShort: "Доставка и оплата",
    },
    categories: {
      treadmills: "Беговые дорожки",
      bikes: "Велотренажёры",
      ellipticals: "Эллиптические тренажёры",
      rowers: "Гребные тренажёры",
      strength: "Силовые тренажёры",
      "free-weights": "Свободные веса",
      benches: "Скамьи",
      racks: "Стойки и силовые рамы",
      "cardio-accessories": "Аксессуары для кардио",
      recovery: "Восстановление",
    },
    countries: {
      cn: "Китай",
      it: "Италия",
    },
    catalog: {
      eyebrow: "Каталог",
      productCount: "{count} товаров",
      sortBy: "Сортировка",
      sortFeatured: "Рекомендуемые",
      sortPriceAsc: "Цена: по возрастанию",
      sortPriceDesc: "Цена: по убыванию",
      sortName: "По названию",
      maxPrice: "Максимальная цена",
      any: "Любая",
      inStockOnly: "Только в наличии",
      filters: "Фильтры",
      resetAll: "Сбросить всё",
      activeFilters: "Активные фильтры",
      removeFilter: "Убрать фильтр: {name}",
      emptyTitle: "Ничего не найдено",
      show: "Показать {count}",
      allOrigins: "Все страны",
      showMore: "Показать ещё ({count})",
      shownOf: "Показано {shown} из {total}",
      allShown: "Показаны все товары",
      compare: "Сравнить",
      noMatches: "Нет товаров по выбранным фильтрам.",
    },
    footer: {
      joinUs: "Присоединяйтесь к нам",
      subscribePlaceholder: "Введите ваш email",
      subscribeButton: "Подписаться",
      socialLinks: "Мы в соцсетях",

      getTipsAndOffers: "Новинки, акции и советы по выбору оборудования — не чаще пары писем в месяц.",
      contactsTitle: "Связаться с нами",
      seller: "Продавец",
      inn: "ИНН",
      ogrn: "ОГРН",
      rights: "Все права защищены.",
      legalDisclaimer: "Характеристики, комплектация и внешний вид товаров могут быть изменены производителем. Актуальную информацию уточняйте у менеджера.",
    },
    product: {
      viewDetails: "Подробнее",
      from: "от",
      perMonth: "/ месяц",
      installment: "{amount} / мес · {months} мес.",
      madeToOrder: "Под заказ",
      inStock: "В наличии в Москве",
      add: "Добавить",
      remove: "Удалить",
      quantity: "Количество",
      total: "Итого",
      subtotal: "Товары",
      continueShopping: "Продолжить покупки",
      checkout: "Перейти к оформлению",
      emptyCart: "Ваша корзина пуста",
      cartSummary: "Сумма заказа",
      brand: "Бренд",
      origin: "Страна производства",
      configuration: "Комплектация",
      standardConfig: "Стандартная комплектация",
      goToCart: "Перейти в корзину",
      addedToYourCart: "Товар добавлен в корзину.",
      details: "Подробнее",
      specs: "Характеристики",
      home: "Главная",
      notFound: "Товар не найден",
      viewImage: "Показать изображение {number}",
      compare: "Сравнение",
      clearAll: "Очистить всё",
      removeFromCompare: "Убрать {name} из сравнения",
      priceOnRequest: "Цена по запросу",
      requestPrice: "Запросить цену",
      requestPriceLead:
        "Оставьте контакты — менеджер пришлёт цену и сроки поставки.",
      requestName: "Ваше имя",
      requestPhone: "Телефон",
      requestEmail: "Email (необязательно)",
      requestComment: "Комментарий",
      requestSubmit: "Отправить заявку",
      requestSent: "Заявка отправлена",
      requestSentBody:
        "Мы получили ваш запрос. Менеджер свяжется с вами в рабочее время и пришлёт цену и сроки поставки.",
      requestErrName: "Укажите ваше имя",
      requestErrPhone: "Укажите телефон для связи",
      requestErrEmail: "Введите корректный email",
    },
    compare: {
      title: "Сравнение товаров",
      compareCta: "Сравнить товары",
      onlyDifferences: "Показывать только различия",
      empty: "Вы ещё не добавили товары к сравнению",
      emptyHint:
        "Отмечайте товары в каталоге кнопкой «Сравнить» — до 4 моделей рядом.",
      limitReached: "Сравнить можно не более {limit} товаров",
      price: "Цена",
      availability: "Наличие",
      category: "Категория",
      addToCompare: "Добавить {name} к сравнению",
    },
    landing: {
      whatThisMeans: "Что это значит",
      supportEveryBody: "Мы поддерживаем каждого",
      everyLevelWelcome: "Любой уровень подготовки",
      trainYourWay: "Тренируйтесь по-своему — дома",
      story: "История {number}",
      spec: "Характеристики",
      previous: "Предыдущий слайд",
      next: "Следующий слайд",
      youBelongHere: "Вам здесь рады",
      noJudgement: "Без осуждения",
      collectionsCount: "{count} коллекций",
      exploreTheRange: "Весь ассортимент",
      collectionsLead:
        "{categories} тематических коллекций, {products}. Нажмите на любую плитку, чтобы перейти к подборке.",
      shop: "Смотреть",
    },
    newsletter: {
      go: "Отправить",
      thanks: "Спасибо за подписку!",
    },
    info: {
      updated: "Редакция от {date}",
      needHelp: "Остались вопросы?",
      needHelpBody: "Позвоните или напишите нам — поможем подобрать оборудование и ответим по заказу.",
      contactUs: "Связаться с нами",
      phone: "Телефон",
      email: "Email",
      address: "Адрес",
      hours: "Часы работы",
      requisites: "Реквизиты",
      writeUs: "Напишите нам",
      messengers: "Мессенджеры и соцсети",
    },
    business: {
      eyebrow: "Для бизнеса",
      title: "Оснастите своё пространство",
      writeUs: "Напишите нам",
      company: "Компания",
      yourName: "Ваше имя",
      message: "Сообщение",
      send: "Отправить заявку",
      sent: "Заявка отправлена ✓",
      errCompany: "Укажите название компании",
      errName: "Укажите ваше имя",
      errEmail: "Введите корректный email",
      errMessage: "Расскажите подробнее — не менее 10 символов",
      benefitPricing: "Оптовые цены",
      benefitService: "Монтаж и сервис",
      benefitContact: "Единая точка контакта",
      benefitContactBody:
        "Персональный менеджер — от первого письма до поставки.",
      lead: "Фитнес-клубы, отели, студии, корпоративные залы — расскажите о задаче, и менеджер подготовит предложение: подбор оборудования, проект зала, поставка и монтаж.",
      sentBody: "Спасибо, {name}! Менеджер свяжется с вами в рабочее время.",
      benefitServiceBody: "Доставка, сборка и пусконаладка оборудования, гарантийное и сервисное обслуживание.",
      benefitPricingBody: "Специальные условия для проектов и оптовых поставок.",
    },
    account: {
      title: "Личный кабинет",
      greeting: "Здравствуйте, {name}",
      guest: "гость",
      adminDashboard: "Панель администратора",
      orderHistory: "История заказов",
      noOrders: "Заказов пока нет.",
      startShopping: "Перейти к покупкам",
      orderStatus: {
        PENDING: "Новый",
        PAID: "Оплачен",
        SHIPPED: "Отправлен",
        DELIVERED: "Выполнен",
        CANCELLED: "Отменён",
      },
    },
    admin: {
      products: "Товары",
      categories: "Категории",
      overview: "Обзор",
      newProduct: "+ Новый товар",
      name: "Название",
      slug: "Адрес страницы (slug)",
      description: "Описание",
      price: "Цена (₽)",
      category: "Категория",
      badgeOptional: "Метка (необязательно)",
      featuresPerLine: "Характеристики (по одной в строке)",
      inStock: "В наличии",
      outOfStock: "Нет в наличии",
      saving: "Сохранение…",
      saveChanges: "Сохранить изменения",
      createProduct: "Создать товар",
      cancel: "Отмена",
      edit: "Редактировать",
      delete: "Удалить",
      rename: "Переименовать",
      add: "Добавить",
      newCategoryName: "Название новой категории",
      newName: "Новое название",
      confirmDelete: "Удалить «{name}»?",
      productCountShort: "{count} товаров",
      actions: "Действия",
      stock: "Наличие",
      errSaveProduct: "Не удалось сохранить товар",
      errDeleteProduct: "Не удалось удалить товар",
      errCreateCategory: "Не удалось создать категорию",
      errGeneric: "Не удалось выполнить операцию",
      editProduct: "Редактирование «{name}»",
      priceOnRequest: "Цена по запросу",
      quoteRequests: "Заявки",
      quoteNoRequests: "Заявок пока нет",
      quoteProduct: "Товар",
      quoteContact: "Контакт",
      quoteDate: "Дата",
      orders: "Заказы",
      noOrders: "Заказов пока нет",
      allStatuses: "Все",
      orderNo: "№",
      date: "Дата",
      customer: "Покупатель",
      total: "Сумма",
      status: "Статус",
      payment: "Оплата",
      deliveryMethod: "Получение",
      orderTitle: "Заказ №{number}",
      items: "Состав заказа",
      contacts: "Контакты",
      deliveryAddress: "Доставка",
      customerComment: "Комментарий покупателя",
      adminNote: "Заметка менеджера (видна только в админке)",
      notifyCustomer: "Сообщить покупателю о смене статуса по email",
      save: "Сохранить",
      saved: "Сохранено",
      backToOrders: "← Все заказы",
      payManual: "После подтверждения",
      payOnline: "Онлайн",
      pickup: "Самовывоз",
      courier: "Доставка",
      revenue: "Выручка (оплаченные)",
      newOrders: "Новые заказы",
      newLeads: "Новые заявки",
      customers: "Покупатели",
      leads: "Заявки",
      leadSource: "Тип",
      sourceProduct: "Запрос цены",
      sourceBusiness: "Для бизнеса",
      sourceContact: "Обратная связь",
      leadNEW: "Новая",
      leadCONTACTED: "В работе",
      leadCLOSED: "Закрыта",
      subscribers: "Подписчики",
      noSubscribers: "Подписчиков пока нет",
      exportCsv: "Скачать CSV",
      settings: "Настройки",
      settingsLead: "Контакты и реквизиты показываются в шапке, подвале, на страницах «Контакты», «Доставка», «Возврат» и в юридических документах. Пустые поля на сайте не выводятся.",
      settingsContacts: "Контакты",
      settingsLegal: "Реквизиты продавца",
      settingsDelivery: "Доставка и самовывоз",
      settingsSocial: "Соцсети и мессенджеры",
      launchWarning: "Перед запуском продаж заполните обязательные данные продавца — без них интернет-магазин нарушает закон о защите прав потребителей:",
      goToSettings: "Открыть настройки",
      images: "Фотографии (по одной ссылке в строке, первая — главная)",
      uploadImages: "Загрузить фото",
      uploading: "Загрузка…",
      uploadHint: "JPG, PNG или WebP до 8 МБ. Лучше квадратные, от 1000×1000 px.",
      errUpload: "Не удалось загрузить файл",
      viewOnSite: "Открыть на сайте",
      setting_phone: "Телефон",
      setting_email: "Email для покупателей",
      setting_address: "Адрес офиса / шоурума",
      setting_workingHours: "Часы работы",
      setting_pickupAddress: "Адрес самовывоза (пусто — самовывоза нет)",
      setting_deliveryNote: "Условия доставки (коротко)",
      setting_legalName: "Продавец: ИП / ООО полностью",
      setting_inn: "ИНН",
      setting_ogrn: "ОГРН / ОГРНИП",
      setting_legalAddress: "Юридический адрес",
      setting_telegram: "Telegram (@имя или ссылка)",
      setting_whatsapp: "WhatsApp (номер или ссылка)",
      setting_vk: "ВКонтакте (ссылка)",
      setting_youtube: "YouTube (ссылка)",
      integrations: "Подключения",
      intTelegram: "Уведомления в Telegram",
      intEmail: "Отправка писем (SMTP)",
      intPayments: "Онлайн-оплата (ЮKassa)",
      intIndexing: "Индексация поисковиками",
      intOn: "подключено",
      intOff: "не настроено",
      intHint: "Подключения настраиваются в файле .env на сервере — инструкция в ЗАПУСК-ПРОДАЖ.md.",
      testModeWarning: "Включён тестовый режим: на странице входа видны демо-пароли, коды сброса пароля показываются на экране. Отключите DEMO_ACCOUNTS и DEMO_EXPOSE_RESET_TOKEN перед запуском.",
      import: "Импорт / экспорт",
      importLead: "Чтобы заменить или обновить каталог: скачайте текущий каталог, отредактируйте его в Excel или Google Таблицах и загрузите обратно. Товары сопоставляются по колонке slug: совпавшие обновляются, новые создаются.",
      downloadCatalog: "Скачать каталог (CSV)",
      columnsTitle: "Колонки файла",
      col_slug: "адрес страницы товара: латиница, цифры, дефис (обязательно)",
      col_name: "название (обязательно)",
      col_category: "категория — один из адресов ниже (обязательно)",
      col_brand: "бренд",
      col_origin_country: "страна производства, например «Италия» или «Китай»",
      col_price_rub: "цена в рублях; можно пусто, если цена по запросу",
      col_price_on_request: "да / нет — скрыть цену и показывать «Запросить цену»",
      col_in_stock: "да / нет — в наличии или под заказ",
      col_badge: "метка на карточке, например «Новинка»",
      col_description: "описание",
      col_features: "характеристики через «|»",
      col_images: "ссылки на фото через «|»; пусто — фото не меняются",
      categorySlugs: "Адреса категорий",
      chooseFile: "Файл CSV",
      deleteMissing: "Удалить товары, которых нет в файле (например, чтобы убрать демонстрационный каталог)",
      checkFile: "Проверить файл",
      applyImport: "Загрузить в каталог",
      importPreview: "Будет создано: {created}, обновлено: {updated}, удалено: {deleted}.",
      importDone: "Готово. Создано: {created}, обновлено: {updated}, удалено: {deleted}.",
      importErrors: "Файл не загружен — исправьте ошибки:",
    },
    locale: {
      chooseCountry: "Выберите вашу страну",
      language: "Язык",
      country: "Страна",

    },
    errors: {
      invalidData: "Проверьте правильность заполнения полей.",
      invalidCredentials: "Неверный email или пароль.",
      forbidden: "Недостаточно прав для этого действия.",
      conflict: "Такая запись уже существует.",
      notFound: "Запись не найдена.",
      server: "Ошибка сервера. Попробуйте позже.",
      network: "Не удалось связаться с сервером. Проверьте соединение.",
      tooMany: "Слишком много попыток. Подождите несколько минут и попробуйте снова.",
      notFoundTitle: "Страница не найдена",
      notFoundBody: "Возможно, страница была удалена или в адресе опечатка.",
      crashTitle: "Что-то пошло не так",
      crashBody: "Мы уже знаем о проблеме. Попробуйте обновить страницу или вернитесь позже.",
      retry: "Попробовать снова",
      toCatalog: "Перейти в каталог",
      toHome: "На главную",
    },
    cookie: {
      message:
        "Мы используем файлы cookie для улучшения вашего опыта. Продолжая, вы соглашаетесь с нашим использованием cookie.",
      accept: "Принять",
      decline: "Отклонить",
      learnMore: "Узнать больше",
    },
    auth: {
      signIn: "Войти",
      signUp: "Зарегистрироваться",
      email: "Email",
      password: "Пароль",
      name: "Имя",
      forgotPassword: "Забыли пароль?",
      resetPassword: "Сбросить пароль",
      noAccount: "Нет аккаунта?",
      haveAccount: "Уже есть аккаунт?",
      signInWithGoogle: "Войти через Google",
      orContinueWithEmail: "Или продолжить с email",
      welcomeBack: "С возвращением. Войдите, чтобы продолжить.",
      resetLead: "Вставьте код сброса и задайте новый пароль.",
      confirmPassword: "Подтвердите пароль",
      resetToken: "Код сброса",
      passwordUpdated: "Пароль обновлён",
      passwordUpdatedBody: "Пароль изменён. Теперь вы можете войти.",
      continueToReset: "Перейти к созданию нового пароля →",
      demoShopper: "Покупатель",
      demoAdmin: "Администратор",
      registerLead: "Зарегистрируйтесь, чтобы видеть историю заказов и оформлять покупки быстрее.",
      forgotLead: "Укажите email — мы отправим ссылку для сброса пароля.",
      demoToken: "Тестовый режим: код сброса",
    },
    checkout: {
      checkout: "Оформление заказа",
      shippingAddress: "Адрес доставки",
      paymentMethod: "Способ оплаты",
      orderSummary: "Сумма заказа",
      placeOrder: "Оформить заказ",
      processing: "Оформляем заказ…",
      fullName: "Имя и фамилия",
      email: "Email",
      address: "Адрес",
      city: "Город",
      postalCode: "Почтовый индекс",
      country: "Страна",
      phone: "Телефон",
      orderConfirmed: "Спасибо! Заказ принят",
      backToHome: "На главную",
      serverError: "Что-то пошло не так. Проверьте введённые данные.",
      total: "Итого",
      contacts: "Контактные данные",
      delivery: "Получение",
      deliveryCourier: "Доставка по адресу",
      deliveryPickup: "Самовывоз",
      pickupFrom: "Забрать заказ можно по адресу: {address}",
      addressHint: "Улица, дом, квартира или офис",
      postalOptional: "Индекс (необязательно)",
      comment: "Комментарий к заказу",
      commentHint: "Удобное время для звонка, этаж, наличие грузового лифта…",
      payManual: "Оплата после подтверждения заказа",
      payManualHint: "Менеджер позвонит, подтвердит наличие, сроки и стоимость доставки и пришлёт ссылку на оплату или счёт для юрлиц.",
      payOnline: "Онлайн-оплата картой или СБП",
      payOnlineHint: "Оплата на защищённой странице ЮKassa. Данные карты не передаются магазину.",
      placeOrderPay: "Перейти к оплате",
      orderNumber: "Номер заказа",
      paymentPending: "Оплата не завершена",
      paymentPendingBody: "Заказ сохранён. Если вы закрыли страницу оплаты или платёж не прошёл — попробуйте ещё раз или дождитесь звонка менеджера.",
      payAgain: "Оплатить заказ",
      paid: "Заказ оплачен",
      orderNotFound: "Заказ не найден",
      currencyNote: "Оплата производится в российских рублях. Суммы в других валютах — ориентировочные.",
      deliveryCostNote: "Стоимость доставки рассчитывается отдельно — менеджер сообщит её до оплаты.",
      toAccount: "Мои заказы",
      continueShopping: "Продолжить покупки",
      whatNext: "Менеджер свяжется с вами в рабочее время, чтобы подтвердить заказ и согласовать доставку. Сохраните номер заказа — он понадобится для связи с нами.",
      paidBody: "Оплата получена. Менеджер свяжется с вами, чтобы согласовать доставку.",
      emailSent: "Подтверждение отправлено на {email}.",
    },
    cart: {
      title: "Корзина",
      yourCart: "Корзина",
      emptyCart: "Ваша корзина пуста",
      browseProducts: "Перейти в каталог",
      browseCollections: "Смотреть коллекции",
      continueShopping: "Продолжить покупки",
      summary: "Сумма заказа",
      subtotal: "Товары",
      shipping: "Доставка",
      taxes: "Налоги",
      total: "Итого",
      checkout: "Перейти к оформлению",
      viewFullCart: "Открыть корзину",
      remove: "Удалить",
      quantity: "Количество",
      increase: "Увеличить количество",
      decrease: "Уменьшить количество",
      closeCart: "Закрыть корзину",
      shippingAtCheckout: "Рассчитает менеджер",
    },
    legal: {
      consentPrefix: "Я даю согласие на обработку персональных данных в соответствии с",
      privacyLink: "Политикой конфиденциальности",
      consentRequired: "Необходимо ваше согласие",
      consentNewsletter: "Соглашаюсь получать новости и предложения магазина (отписаться можно в любой момент) в соответствии с",
    },
    search: {
      title: "Поиск",
      placeholder: "Название, бренд или тип тренажёра",
      submit: "Найти",
      found: "Найдено: {count}",
      nothing: "По запросу «{q}» ничего не найдено",
      nothingHint: "Проверьте написание или посмотрите весь каталог.",
      hint: "Например: беговая дорожка, скамья, Technogym",
      openSearch: "Поиск по каталогу",
    },
  },
  en: {
    common: {
      login: "Login",
      join: "Join",
      logout: "Log out",
      account: "Account",
      cart: "Cart",
      search: "Search",
      menu: "Menu",
      close: "Close",
      confirm: "Confirm",
      cancel: "Cancel",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      addToCart: "Add to cart",
      addedToCart: "Added to cart",
      quickView: "Quick view",
      shopNow: "Shop now",
      explore: "Explore",
      newSeason: "New season",
      yourWorkoutYourStyle: "Your workout, your style",
      featuredProducts: "Featured products",
      shopByCategory: "Shop by category",
      findYourTrainingSpace: "Find your training space",
      browseEveryCategory:
        "Browse every category as an interactive tile board, with quick view and instant add-to-cart.",
      exploreCollections: "Explore collections",
      collections: "Collections",
      newArrivals: "New arrivals",
      allProducts: "All products",
      forBusiness: "For business",
      premiumHomeFitness: "Treadmills, bikes, strength stations and free weights for home, gyms and corporate fitness rooms. Delivery across Russia and the CIS.",
    },
    nav: {
      openMenu: "Open menu",
      closeMenu: "Close menu",
      menu: "Menu",
      shop: "Shop",
      collections: "Collections",
      wellness: "Wellness",
      design: "Design",
      cardio: "Cardio",
      strength: "Strength",
      strengthStations: "Strength stations",
      treadmills: "Treadmills",
      bikes: "Bikes",
      ellipticals: "Ellipticals",
      rowers: "Rowers",
      benches: "Benches",
      accessories: "Accessories",
      explore: "Explore",
      products: "Products",
      company: "Company",
      contact: "Contact",
      privacy: "Privacy policy",
      cookiePolicy: "Cookie policy",
      support: "Customers",
      about: "About us",
      customerSupport: "Help & FAQ",
      shipping: "Shipping & payment",
      returns: "Returns & warranty",
      terms: "Terms of use",
      salesConditions: "Sales conditions",
      forBusiness: "For business",
      allProducts: "All products",
      shippingShort: "Delivery",
    },
    categories: {
      treadmills: "Treadmills",
      bikes: "Indoor Bikes",
      ellipticals: "Ellipticals",
      rowers: "Rowers",
      strength: "Strength Stations",
      "free-weights": "Free Weights",
      benches: "Benches",
      racks: "Racks & Cages",
      "cardio-accessories": "Cardio Accessories",
      recovery: "Recovery",
    },
    countries: {
      cn: "China",
      it: "Italy",
    },
    catalog: {
      eyebrow: "Catalog",
      productCount: "{count} products",
      sortBy: "Sort by",
      sortFeatured: "Featured",
      sortPriceAsc: "Price: low to high",
      sortPriceDesc: "Price: high to low",
      sortName: "Name",
      maxPrice: "Max price",
      any: "Any",
      inStockOnly: "In stock only",
      filters: "Filters",
      resetAll: "Reset all",
      activeFilters: "Active filters",
      removeFilter: "Remove filter: {name}",
      emptyTitle: "Nothing found",
      show: "Show {count}",
      allOrigins: "All countries",
      showMore: "Show more ({count})",
      shownOf: "Showing {shown} of {total}",
      allShown: "All products shown",
      compare: "Compare",
      noMatches: "No products match these filters.",
    },
    footer: {
      joinUs: "Join us",
      subscribePlaceholder: "Enter your email",
      subscribeButton: "Subscribe",
      socialLinks: "Follow us",

      getTipsAndOffers: "New arrivals, offers and equipment tips — a couple of emails a month at most.",
      contactsTitle: "Contact us",
      seller: "Seller",
      inn: "INN",
      ogrn: "OGRN",
      rights: "All rights reserved.",
      legalDisclaimer: "Specifications, configuration and appearance may be changed by the manufacturer. Please confirm the details with a manager.",
    },
    product: {
      viewDetails: "View details",
      from: "from",
      perMonth: "/ month",
      installment: "{amount} / mo · {months} months",
      madeToOrder: "Made to order",
      inStock: "In stock in Moscow",
      add: "Add",
      remove: "Remove",
      quantity: "Quantity",
      total: "Total",
      subtotal: "Subtotal",
      continueShopping: "Continue shopping",
      checkout: "Checkout",
      emptyCart: "Your cart is empty",
      cartSummary: "Cart summary",
      brand: "Brand",
      origin: "Country of origin",
      configuration: "Configuration",
      standardConfig: "Standard configuration",
      goToCart: "Go to cart",
      addedToYourCart: "Added to your cart.",
      details: "Details",
      specs: "Specifications",
      home: "Home",
      notFound: "Product not found",
      viewImage: "View image {number}",
      compare: "Compare",
      clearAll: "Clear all",
      removeFromCompare: "Remove {name} from comparison",
      priceOnRequest: "Price on request",
      requestPrice: "Request a price",
      requestPriceLead:
        "Leave your contact details — a manager will send you the price and delivery times.",
      requestName: "Your name",
      requestPhone: "Phone",
      requestEmail: "Email (optional)",
      requestComment: "Comment",
      requestSubmit: "Send request",
      requestSent: "Request sent",
      requestSentBody:
        "We have received your request. A manager will get in touch during business hours with the price and delivery times.",
      requestErrName: "Enter your name",
      requestErrPhone: "Enter a phone number we can call",
      requestErrEmail: "Enter a valid email",
    },
    compare: {
      title: "Compare products",
      compareCta: "Compare products",
      onlyDifferences: "Show differences only",
      empty: "You haven't added any products to compare yet",
      emptyHint:
        "Tick “Compare” on catalog products — up to 4 models side by side.",
      limitReached: "You can compare up to {limit} products",
      price: "Price",
      availability: "Availability",
      category: "Category",
      addToCompare: "Add {name} to comparison",
    },
    landing: {
      whatThisMeans: "What this means",
      supportEveryBody: "We support every body",
      everyLevelWelcome: "Every level is welcome",
      trainYourWay: "Train your way, at home",
      story: "Story {number}",
      spec: "Spec",
      previous: "Previous slide",
      next: "Next slide",
      youBelongHere: "You belong here",
      noJudgement: "No judgement",
      collectionsCount: "{count} collections",
      exploreTheRange: "Explore the range",
      collectionsLead:
        "{categories} themed collections, {products}. Tap any tile to browse.",
      shop: "Shop",
    },
    newsletter: {
      go: "Go",
      thanks: "Thanks for subscribing!",
    },
    info: {
      updated: "Version of {date}",
      needHelp: "Still have questions?",
      needHelpBody: "Call or write to us — we will help you choose equipment and answer any order questions.",
      contactUs: "Contact us",
      phone: "Phone",
      email: "Email",
      address: "Address",
      hours: "Working hours",
      requisites: "Legal details",
      writeUs: "Write to us",
      messengers: "Messengers and social media",
    },
    business: {
      eyebrow: "For business",
      title: "Outfit your space",
      writeUs: "Write us a letter",
      company: "Company",
      yourName: "Your name",
      message: "Message",
      send: "Send letter",
      sent: "Letter sent ✓",
      errCompany: "Enter your company",
      errName: "Enter your name",
      errEmail: "Enter a valid email",
      errMessage: "Tell us a little more (min 10 chars)",
      benefitPricing: "Volume pricing",
      benefitService: "Install & service",
      benefitContact: "One point of contact",
      benefitContactBody: "A named account manager from first letter to delivery.",
      lead: "Gyms, hotels, studios and corporate fitness rooms — tell us what you need and a manager will prepare an offer: equipment selection, gym layout, delivery and installation.",
      sentBody: "Thank you, {name}! A manager will contact you during business hours.",
      benefitServiceBody: "Delivery, assembly and commissioning, warranty and after-sales service.",
      benefitPricingBody: "Special terms for projects and bulk orders.",
    },
    account: {
      title: "My account",
      greeting: "Hi, {name}",
      guest: "there",
      adminDashboard: "Admin dashboard",
      orderHistory: "Order history",
      noOrders: "No orders yet.",
      startShopping: "Start shopping",
      orderStatus: {
        PENDING: "New",
        PAID: "Paid",
        SHIPPED: "Shipped",
        DELIVERED: "Completed",
        CANCELLED: "Cancelled",
      },
    },
    admin: {
      products: "Products",
      categories: "Categories",
      overview: "Overview",
      newProduct: "+ New product",
      name: "Name",
      slug: "Slug (URL)",
      description: "Description",
      price: "Price (₽)",
      category: "Category",
      badgeOptional: "Badge (optional)",
      featuresPerLine: "Features (one per line)",
      inStock: "In stock",
      outOfStock: "Out of stock",
      saving: "Saving…",
      saveChanges: "Save changes",
      createProduct: "Create product",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      rename: "Rename",
      add: "Add",
      newCategoryName: "New category name",
      newName: "New name",
      confirmDelete: "Delete “{name}”?",
      productCountShort: "{count} products",
      actions: "Actions",
      stock: "Stock",
      errSaveProduct: "Could not save the product",
      errDeleteProduct: "Could not delete the product",
      errCreateCategory: "Could not create category",
      errGeneric: "Failed",
      editProduct: "Edit “{name}”",
      priceOnRequest: "Price on request",
      quoteRequests: "Requests",
      quoteNoRequests: "No requests yet",
      quoteProduct: "Product",
      quoteContact: "Contact",
      quoteDate: "Date",
      orders: "Orders",
      noOrders: "No orders yet",
      allStatuses: "All",
      orderNo: "No.",
      date: "Date",
      customer: "Customer",
      total: "Total",
      status: "Status",
      payment: "Payment",
      deliveryMethod: "Delivery",
      orderTitle: "Order #{number}",
      items: "Items",
      contacts: "Contacts",
      deliveryAddress: "Delivery",
      customerComment: "Customer comment",
      adminNote: "Manager note (admin only)",
      notifyCustomer: "Email the customer about the status change",
      save: "Save",
      saved: "Saved",
      backToOrders: "← All orders",
      payManual: "After confirmation",
      payOnline: "Online",
      pickup: "Pickup",
      courier: "Delivery",
      revenue: "Revenue (paid)",
      newOrders: "New orders",
      newLeads: "New requests",
      customers: "Customers",
      leads: "Requests",
      leadSource: "Type",
      sourceProduct: "Price request",
      sourceBusiness: "Business",
      sourceContact: "Contact form",
      leadNEW: "New",
      leadCONTACTED: "In progress",
      leadCLOSED: "Closed",
      subscribers: "Subscribers",
      noSubscribers: "No subscribers yet",
      exportCsv: "Download CSV",
      settings: "Settings",
      settingsLead: "Contacts and legal details appear in the header, footer, the contacts, shipping and returns pages and the legal documents. Empty fields are hidden.",
      settingsContacts: "Contacts",
      settingsLegal: "Seller's legal details",
      settingsDelivery: "Delivery and pickup",
      settingsSocial: "Social media and messengers",
      launchWarning: "Before you start selling, fill in the seller's required details — the law requires them for an online store:",
      goToSettings: "Open settings",
      images: "Photos (one URL per line, the first is the main one)",
      uploadImages: "Upload photos",
      uploading: "Uploading…",
      uploadHint: "JPG, PNG or WebP up to 8 MB. Square, 1000×1000 px or larger works best.",
      errUpload: "Could not upload the file",
      viewOnSite: "View on site",
      setting_phone: "Phone",
      setting_email: "Customer email",
      setting_address: "Office / showroom address",
      setting_workingHours: "Working hours",
      setting_pickupAddress: "Pickup address (empty = no pickup)",
      setting_deliveryNote: "Delivery terms (short)",
      setting_legalName: "Seller: full legal name",
      setting_inn: "Tax ID (INN)",
      setting_ogrn: "OGRN",
      setting_legalAddress: "Registered address",
      setting_telegram: "Telegram (@handle or link)",
      setting_whatsapp: "WhatsApp (number or link)",
      setting_vk: "VK (link)",
      setting_youtube: "YouTube (link)",
      integrations: "Integrations",
      intTelegram: "Telegram notifications",
      intEmail: "Outgoing email (SMTP)",
      intPayments: "Online payments (YooKassa)",
      intIndexing: "Search engine indexing",
      intOn: "on",
      intOff: "off",
      intHint: "Integrations are configured in the server's .env file — see ЗАПУСК-ПРОДАЖ.md.",
      testModeWarning: "Test mode is on: demo passwords are listed on the login page and reset codes are shown on screen. Turn off DEMO_ACCOUNTS and DEMO_EXPOSE_RESET_TOKEN before launch.",
      import: "Import / export",
      importLead: "To replace or update the catalog: download it, edit it in Excel or Google Sheets and upload it back. Products are matched by the slug column: matches are updated, new ones are created.",
      downloadCatalog: "Download catalog (CSV)",
      columnsTitle: "File columns",
      col_slug: "product URL: latin letters, digits, hyphen (required)",
      col_name: "name (required)",
      col_category: "category — one of the slugs below (required)",
      col_brand: "brand",
      col_origin_country: "country of origin, e.g. Italy or China",
      col_price_rub: "price in roubles; may be empty for price on request",
      col_price_on_request: "yes / no — hide the price and show “Request a price”",
      col_in_stock: "yes / no — in stock or made to order",
      col_badge: "card badge, e.g. New",
      col_description: "description",
      col_features: "features separated by “|”",
      col_images: "photo URLs separated by “|”; empty keeps current photos",
      categorySlugs: "Category slugs",
      chooseFile: "CSV file",
      deleteMissing: "Delete products that are not in the file (e.g. to remove the sample catalog)",
      checkFile: "Check file",
      applyImport: "Import",
      importPreview: "To create: {created}, update: {updated}, delete: {deleted}.",
      importDone: "Done. Created: {created}, updated: {updated}, deleted: {deleted}.",
      importErrors: "Nothing imported — fix these errors:",
    },
    locale: {
      chooseCountry: "Choose your country",
      language: "Language",
      country: "Country",

    },
    errors: {
      invalidData: "Please check the values you entered.",
      invalidCredentials: "Invalid email or password.",
      forbidden: "You do not have permission for this action.",
      conflict: "That record already exists.",
      notFound: "Record not found.",
      server: "Server error. Please try again later.",
      network: "Could not reach the server. Check your connection.",
      tooMany: "Too many attempts. Please wait a few minutes and try again.",
      notFoundTitle: "Page not found",
      notFoundBody: "The page may have been removed, or the address has a typo.",
      crashTitle: "Something went wrong",
      crashBody: "Please try reloading the page or come back later.",
      retry: "Try again",
      toCatalog: "Go to catalog",
      toHome: "Home",
    },
    cookie: {
      message:
        "We use cookies to improve your experience. By continuing, you agree to our use of cookies.",
      accept: "Accept",
      decline: "Decline",
      learnMore: "Learn more",
    },
    auth: {
      signIn: "Sign in",
      signUp: "Sign up",
      email: "Email",
      password: "Password",
      name: "Name",
      forgotPassword: "Forgot password?",
      resetPassword: "Reset password",
      noAccount: "Don't have an account?",
      haveAccount: "Already have an account?",
      signInWithGoogle: "Sign in with Google",
      orContinueWithEmail: "Or continue with email",
      welcomeBack: "Welcome back. Sign in to continue.",
      resetLead: "Paste your reset token and choose a new password.",
      confirmPassword: "Confirm password",
      resetToken: "Reset token",
      passwordUpdated: "Password updated",
      passwordUpdatedBody: "Your password has been changed. You can now sign in.",
      continueToReset: "Continue to set a new password →",
      demoShopper: "Shopper",
      demoAdmin: "Admin",
      registerLead: "Create an account to see your order history and check out faster.",
      forgotLead: "Enter your email and we will send you a password reset link.",
      demoToken: "Test mode: reset code",
    },
    checkout: {
      checkout: "Checkout",
      shippingAddress: "Shipping address",
      paymentMethod: "Payment method",
      orderSummary: "Order summary",
      placeOrder: "Place order",
      processing: "Placing your order…",
      fullName: "Full name",
      email: "Email",
      address: "Address",
      city: "City",
      postalCode: "Postal code",
      country: "Country",
      phone: "Phone",
      orderConfirmed: "Thank you! Your order is placed",
      backToHome: "Back to home",
      serverError: "Something went wrong. Please check your details.",
      total: "Total",
      contacts: "Contact details",
      delivery: "Delivery",
      deliveryCourier: "Delivery to address",
      deliveryPickup: "Pickup",
      pickupFrom: "Pick up your order at: {address}",
      addressHint: "Street, building, apartment or office",
      postalOptional: "Postal code (optional)",
      comment: "Order comment",
      commentHint: "Best time to call, floor, freight elevator…",
      payManual: "Pay after order confirmation",
      payManualHint: "A manager will call to confirm availability, delivery time and cost, then send a payment link or an invoice for companies.",
      payOnline: "Pay online by card or SBP",
      payOnlineHint: "Payment on the secure YooKassa page. Card details are never shared with the store.",
      placeOrderPay: "Proceed to payment",
      orderNumber: "Order number",
      paymentPending: "Payment not completed",
      paymentPendingBody: "Your order is saved. If you closed the payment page or the payment failed, try again or wait for our manager to call.",
      payAgain: "Pay for the order",
      paid: "Order paid",
      orderNotFound: "Order not found",
      currencyNote: "Payment is made in Russian roubles. Amounts in other currencies are approximate.",
      deliveryCostNote: "Delivery is calculated separately — a manager will confirm the cost before payment.",
      toAccount: "My orders",
      continueShopping: "Continue shopping",
      whatNext: "A manager will contact you during business hours to confirm the order and arrange delivery. Keep the order number for reference.",
      paidBody: "Payment received. A manager will contact you to arrange delivery.",
      emailSent: "A confirmation was sent to {email}.",
    },
    cart: {
      title: "Cart",
      yourCart: "Your cart",
      emptyCart: "Your cart is empty",
      browseProducts: "Browse products",
      browseCollections: "Browse collections",
      continueShopping: "Continue shopping",
      summary: "Summary",
      subtotal: "Subtotal",
      shipping: "Shipping",
      taxes: "Taxes",
      total: "Total",
      checkout: "Checkout",
      viewFullCart: "View full cart",
      remove: "Remove",
      quantity: "Quantity",
      increase: "Increase quantity",
      decrease: "Decrease quantity",
      closeCart: "Close cart",
      shippingAtCheckout: "Confirmed by a manager",
    },
    legal: {
      consentPrefix: "I consent to the processing of my personal data in accordance with the",
      privacyLink: "Privacy policy",
      consentRequired: "Your consent is required",
      consentNewsletter: "I agree to receive store news and offers (unsubscribe at any time) in accordance with the",
    },
    search: {
      title: "Search",
      placeholder: "Name, brand or equipment type",
      submit: "Search",
      found: "Found: {count}",
      nothing: "Nothing found for “{q}”",
      nothingHint: "Check the spelling or browse the whole catalog.",
      hint: "For example: treadmill, bench, Technogym",
      openSearch: "Search the catalog",
    },
  },
};

/** Get translation by key path (e.g., 'common.login') */
export function getTranslation(locale: Locale, keyPath: string): string {
  const keys = keyPath.split(".");
  let value: unknown = translations[locale];

  for (const key of keys) {
    if (typeof value === "object" && value !== null && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      console.warn(`Missing translation for key: ${keyPath} in locale: ${locale}`);
      return keyPath;
    }
  }

  return typeof value === "string" ? value : keyPath;
}

/**
 * Localized name for a storefront category slug. Falls back to the English
 * name coming from the database when a slug has no dictionary entry.
 */
export function categoryName(
  locale: Locale,
  slug: string,
  fallback?: string,
): string {
  return translations[locale].categories[slug] ?? fallback ?? slug;
}

/**
 * Dictionary key for an API failure, chosen by HTTP status. The API replies in
 * English for logs and tooling; the storefront never renders that text.
 */
export function errorKeyForStatus(status: number): string {
  if (status === 400 || status === 422) return "errors.invalidData";
  if (status === 401) return "errors.invalidCredentials";
  if (status === 403) return "errors.forbidden";
  if (status === 404) return "errors.notFound";
  if (status === 409) return "errors.conflict";
  if (status === 429) return "errors.tooMany";
  if (status >= 500) return "errors.server";
  return "errors.server";
}

/**
 * "5 товаров" with the correct Russian declension (1 товар / 2 товара /
 * 5 товаров). A plain "{count} товаров" string is wrong for most counts.
 */
/** Localized sourcing-country label for a URL code (see src/lib/countries). */
export function countryLabel(
  locale: Locale,
  code: string,
  fallback?: string,
): string {
  return translations[locale].countries[code] ?? fallback ?? code;
}

export function formatProductCount(locale: Locale, count: number): string {
  if (locale !== "ru") return `${count} ${count === 1 ? "product" : "products"}`;

  const mod100 = Math.abs(count) % 100;
  const mod10 = mod100 % 10;
  const form =
    mod100 >= 11 && mod100 <= 14
      ? "товаров"
      : mod10 === 1
        ? "товар"
        : mod10 >= 2 && mod10 <= 4
          ? "товара"
          : "товаров";
  return `${count} ${form}`;
}

/** Localized order status, falling back to the raw enum value. */
export function orderStatusLabel(locale: Locale, status: string): string {
  return translations[locale].account.orderStatus[status] ?? status;
}

/** Interpolate variables in translation strings (e.g., {country}) */
export function interpolate(
  str: string,
  vars: Record<string, string | number>,
): string {
  return str.replace(/\{(\w+)\}/g, (_, key) => {
    return key in vars ? String(vars[key]) : `{${key}}`;
  });
}
