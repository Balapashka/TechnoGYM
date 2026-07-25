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
    outOfStock: string;
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
  };

  // Country/Locale modal + switcher
  locale: {
    chooseCountry: string;
    browsingDemoStore: string;
    pickRegion: string;
    language: string;
    country: string;
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
      explore: "Обзор",
      products: "Товары",
      support: "Поддержка",
      company: "Компания",
      about: "О нас",
      sustainability: "Устойчивое развитие",
      careers: "Карьера",
      press: "Пресса",
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
      racks: "Стойки и рамы",
      "cardio-accessories": "Кардиоаксессуары",
      recovery: "Восстановление",
      apparel: "Одежда",
      nutrition: "Питание",
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
        "Movigym — вымышленный магазин. Образовательная демо-версия — общий контент, медиа-заглушки, тестовые товары.",
    },
    product: {
      viewDetails: "Подробнее",
      from: "от",
      perMonth: "/ месяц",
      outOfStock: "Нет в наличии",
      inStock: "В наличии",
      add: "Добавить",
      remove: "Удалить",
      quantity: "Количество",
      total: "Итого",
      subtotal: "Товары",
      continueShopping: "Продолжить покупки",
      checkout: "Перейти к оформлению",
      emptyCart: "Ваша корзина пуста",
      cartSummary: "Сумма заказа",
    },
    locale: {
      chooseCountry: "Выберите вашу страну",
      browsingDemoStore: "Вы просматриваете демо-магазин ({country}).",
      pickRegion: "Выберите регион для установки валюты.",
      language: "Язык",
      country: "Страна",
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
      apparel: "Apparel",
      nutrition: "Nutrition",
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
        "Movigym is a fictional store. Educational demo only — generic content, placeholder media, mock products.",
    },
    product: {
      viewDetails: "View details",
      from: "from",
      perMonth: "/ month",
      outOfStock: "Out of stock",
      inStock: "In stock",
      add: "Add",
      remove: "Remove",
      quantity: "Quantity",
      total: "Total",
      subtotal: "Subtotal",
      continueShopping: "Continue shopping",
      checkout: "Checkout",
      emptyCart: "Your cart is empty",
      cartSummary: "Cart summary",
    },
    locale: {
      chooseCountry: "Choose your country",
      browsingDemoStore: "You are browsing the {country} demo store.",
      pickRegion: "Pick a region to set the currency.",
      language: "Language",
      country: "Country",
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

/** Interpolate variables in translation strings (e.g., {country}) */
export function interpolate(
  str: string,
  vars: Record<string, string | number>,
): string {
  return str.replace(/\{(\w+)\}/g, (_, key) => {
    return key in vars ? String(vars[key]) : `{${key}}`;
  });
}
