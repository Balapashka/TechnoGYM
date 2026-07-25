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
    shop: string;
    collections: string;
    wellness: string;
    design: string;
    stories: string;
    community: string;
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
    sustainability: string;
    careers: string;
    press: string;
    contact: string;
    customerSupport: string;
    shipping: string;
    returns: string;
    privacy: string;
    cookiePolicy: string;
    terms: string;
    salesConditions: string;
  };

  /**
   * Storefront category names, keyed by the seeded category slug
   * (see prisma/seed.ts). Overrides the English name stored in the DB.
   */
  categories: Record<string, string>;

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
  };

  // Footer
  footer: {
    joinUs: string;
    getTipsAndOffers: string;
    subscribePlaceholder: string;
    subscribeButton: string;
    socialLinks: string;
    legalDisclaimer: string;
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
    demoNote: string;
    placeholderHeading: string;
    placeholderBody: string;
    anotherHeading: string;
    anotherBody: string;
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
  };

  // Country/Locale modal + switcher
  locale: {
    chooseCountry: string;
    browsingDemoStore: string;
    pickRegion: string;
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
    billingAddress: string;
    paymentMethod: string;
    orderSummary: string;
    placeOrder: string;
    processing: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
    paymentDemoCard: string;
    demoCardHint: string;
    nameOnCard: string;
    cardNumber: string;
    expiryDate: string;
    cvc: string;
    orderConfirmed: string;
    orderLabel: string;
    backToHome: string;
    serverError: string;
    total: string;
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
      premiumHomeFitness:
        "Премиальное оборудование для домашнего фитнеса, демонстрационный каталог в образовательных целях.",
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
    },
    nav: {
      shop: "Магазин",
      collections: "Коллекции",
      wellness: "Здоровье",
      design: "Дизайн",
      stories: "Истории",
      community: "Сообщество",
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
      support: "Поддержка",
      company: "Компания",
      about: "О нас",
      sustainability: "Устойчивое развитие",
      careers: "Карьера",
      press: "Пресс-центр",
      contact: "Контакты",
      customerSupport: "Поддержка клиентов",
      shipping: "Доставка",
      returns: "Возврат",
      privacy: "Политика конфиденциальности",
      cookiePolicy: "Политика cookie",
      terms: "Условия использования",
      salesConditions: "Условия продажи",
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
      compare: "Сравнить",
      noMatches: "Нет товаров по выбранным фильтрам.",
    },
    footer: {
      joinUs: "Присоединяйтесь к нам",
      getTipsAndOffers:
        "Получайте советы и предложения для достижения целей быстрее.",
      subscribePlaceholder: "Введите ваш email",
      subscribeButton: "Подписаться",
      socialLinks: "Мы в соцсетях",
      legalDisclaimer:
        "SPORT LINER — демонстрационный магазин. Образовательная демо-версия — общий контент, медиа-заглушки, тестовые товары.",
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
      demoNote:
        "Это демонстрационная страница: содержимое приведено для примера.",
      placeholderHeading: "Раздел-заготовка",
      placeholderBody:
        "Демонстрационный текст. Замените его реальным содержимым, когда потребуется.",
      anotherHeading: "Ещё один раздел",
      anotherBody:
        "Ещё немного демонстрационного текста для наполнения макета.",
    },
    business: {
      eyebrow: "Для бизнеса",
      title: "Оснастите своё пространство",
      lead: "Отели, студии, офисы и клубы — расскажите о задаче, и наша команда свяжется с вами. (Демонстрационная форма: заявка никуда не отправляется.)",
      writeUs: "Напишите нам",
      company: "Компания",
      yourName: "Ваше имя",
      message: "Сообщение",
      send: "Отправить заявку",
      sent: "Заявка отправлена ✓",
      sentBody:
        "Спасибо, {name}. Это демоверсия, поэтому письмо никуда не уходит — но сценарий отрабатывает полностью.",
      errCompany: "Укажите название компании",
      errName: "Укажите ваше имя",
      errEmail: "Введите корректный email",
      errMessage: "Расскажите подробнее — не менее 10 символов",
      benefitPricing: "Оптовые цены",
      benefitPricingBody: "Прогрессивные скидки для проектов любого масштаба.",
      benefitService: "Монтаж и сервис",
      benefitServiceBody:
        "Демонстрационные тарифы на установку, поддержку и обслуживание.",
      benefitContact: "Единая точка контакта",
      benefitContactBody:
        "Персональный менеджер — от первого письма до поставки.",
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
        PENDING: "В обработке",
        PAID: "Оплачен",
        SHIPPED: "Отправлен",
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
    },
    locale: {
      chooseCountry: "Выберите вашу страну",
      browsingDemoStore: "Вы просматриваете демо-магазин ({country}).",
      pickRegion: "Выберите регион для установки валюты.",
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
      registerLead:
        "Зарегистрируйтесь в демомагазине, чтобы отслеживать заказы и оформлять покупки быстрее.",
      forgotLead: "Укажите email, чтобы получить код для сброса пароля.",
      resetLead: "Вставьте код сброса и задайте новый пароль.",
      confirmPassword: "Подтвердите пароль",
      resetToken: "Код сброса",
      passwordUpdated: "Пароль обновлён",
      passwordUpdatedBody: "Пароль изменён. Теперь вы можете войти.",
      demoToken: "Демонстрационный код",
      continueToReset: "Перейти к созданию нового пароля →",
      demoShopper: "Покупатель",
      demoAdmin: "Администратор",
    },
    checkout: {
      checkout: "Оформление заказа",
      shippingAddress: "Адрес доставки",
      billingAddress: "Платёжный адрес",
      paymentMethod: "Способ оплаты",
      orderSummary: "Сумма заказа",
      placeOrder: "Оплатить и оформить заказ",
      processing: "Обрабатываем платёж…",
      firstName: "Имя",
      lastName: "Фамилия",
      fullName: "Имя и фамилия",
      email: "Email",
      address: "Адрес",
      city: "Город",
      postalCode: "Почтовый индекс",
      country: "Страна",
      phone: "Телефон",
      paymentDemoCard: "Оплата · демо-карта",
      demoCardHint:
        "Реальный платёж не проводится. Используйте 4242 4242 4242 4242, любой будущий срок действия и любой CVC.",
      nameOnCard: "Имя на карте",
      cardNumber: "Номер карты",
      expiryDate: "Срок действия (ММ/ГГ)",
      cvc: "CVC",
      orderConfirmed: "Заказ подтверждён",
      orderLabel: "Заказ",
      backToHome: "На главную",
      serverError: "Что-то пошло не так. Проверьте введённые данные.",
      total: "Итого",
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
      shippingAtCheckout: "Рассчитывается при оформлении",
      taxes: "Налоги",
      total: "Итого",
      checkout: "Перейти к оформлению",
      viewFullCart: "Открыть корзину",
      remove: "Удалить",
      quantity: "Количество",
      increase: "Увеличить количество",
      decrease: "Уменьшить количество",
      closeCart: "Закрыть корзину",
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
      premiumHomeFitness:
        "Premium home fitness equipment, mock catalog for an educational demo.",
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
    },
    nav: {
      shop: "Shop",
      collections: "Collections",
      wellness: "Wellness",
      design: "Design",
      stories: "Stories",
      community: "Community",
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
      support: "Support",
      company: "Company",
      about: "About",
      sustainability: "Sustainability",
      careers: "Careers",
      press: "Press",
      contact: "Contact",
      customerSupport: "Customer support",
      shipping: "Shipping",
      returns: "Returns",
      privacy: "Privacy policy",
      cookiePolicy: "Cookie policy",
      terms: "Terms & conditions",
      salesConditions: "Sales conditions",
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
      compare: "Compare",
      noMatches: "No products match these filters.",
    },
    footer: {
      joinUs: "Join us",
      getTipsAndOffers: "Get tips and offers to reach your goals faster.",
      subscribePlaceholder: "Enter your email",
      subscribeButton: "Subscribe",
      socialLinks: "Follow us",
      legalDisclaimer:
        "SPORT LINER is a demo store. Educational demo only — generic content, placeholder media, mock products.",
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
      demoNote: "This is an educational demo page with generic placeholder content.",
      placeholderHeading: "Placeholder section",
      placeholderBody: "Generic demo copy. Replace with real content when needed.",
      anotherHeading: "Another section",
      anotherBody: "More generic demo copy to fill the layout.",
    },
    business: {
      eyebrow: "For business",
      title: "Outfit your space",
      lead: "Hotels, studios, offices and clubs — tell us what you need and our team will write back. (Demo form: nothing is actually sent.)",
      writeUs: "Write us a letter",
      company: "Company",
      yourName: "Your name",
      message: "Message",
      send: "Send letter",
      sent: "Letter sent ✓",
      sentBody:
        "Thanks, {name}. This is a demo, so no email actually leaves your machine — but the flow works.",
      errCompany: "Enter your company",
      errName: "Enter your name",
      errEmail: "Enter a valid email",
      errMessage: "Tell us a little more (min 10 chars)",
      benefitPricing: "Volume pricing",
      benefitPricingBody: "Tiered rates for fit-outs of any size.",
      benefitService: "Install & service",
      benefitServiceBody: "Generic demo support, setup and maintenance plans.",
      benefitContact: "One point of contact",
      benefitContactBody: "A named account manager from first letter to delivery.",
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
        PENDING: "Pending",
        PAID: "Paid",
        SHIPPED: "Shipped",
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
    },
    locale: {
      chooseCountry: "Choose your country",
      browsingDemoStore: "You are browsing the {country} demo store.",
      pickRegion: "Pick a region to set the currency.",
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
      registerLead:
        "Join the demo store to track orders and check out faster.",
      forgotLead: "Enter your email to generate a reset token.",
      resetLead: "Paste your reset token and choose a new password.",
      confirmPassword: "Confirm password",
      resetToken: "Reset token",
      passwordUpdated: "Password updated",
      passwordUpdatedBody: "Your password has been changed. You can now sign in.",
      demoToken: "Demo token",
      continueToReset: "Continue to set a new password →",
      demoShopper: "Shopper",
      demoAdmin: "Admin",
    },
    checkout: {
      checkout: "Checkout",
      shippingAddress: "Shipping address",
      billingAddress: "Billing address",
      paymentMethod: "Payment method",
      orderSummary: "Order summary",
      placeOrder: "Pay & place order",
      processing: "Processing payment…",
      firstName: "First name",
      lastName: "Last name",
      fullName: "Full name",
      email: "Email",
      address: "Address",
      city: "City",
      postalCode: "Postal code",
      country: "Country",
      phone: "Phone",
      paymentDemoCard: "Payment · demo card",
      demoCardHint:
        "No real payment is taken. Try 4242 4242 4242 4242, any future expiry and any CVC.",
      nameOnCard: "Name on card",
      cardNumber: "Card number",
      expiryDate: "Expiry (MM/YY)",
      cvc: "CVC",
      orderConfirmed: "Order confirmed",
      orderLabel: "Order",
      backToHome: "Back to home",
      serverError: "Something went wrong. Please check your details.",
      total: "Total",
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
      shippingAtCheckout: "Calculated at checkout",
      taxes: "Taxes",
      total: "Total",
      checkout: "Checkout",
      viewFullCart: "View full cart",
      remove: "Remove",
      quantity: "Quantity",
      increase: "Increase quantity",
      decrease: "Decrease quantity",
      closeCart: "Close cart",
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
  if (status >= 500) return "errors.server";
  return "errors.server";
}

/**
 * "5 товаров" with the correct Russian declension (1 товар / 2 товара /
 * 5 товаров). A plain "{count} товаров" string is wrong for most counts.
 */
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
