/**
 * i18n translations for EN and RU locales.
 * Keys are organized by feature/component area.
 */

export type Locale = "en" | "ru";

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
    treadmills: string;
    bikes: string;
    ellipticals: string;
    rowers: string;
    benches: string;
    accessories: string;
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

  // Country/Locale modal
  locale: {
    chooseCountry: string;
    browsingDemoStore: string;
    pickRegion: string;
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
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
    cardNumber: string;
    expiryDate: string;
    cvc: string;
  };

  // Cart
  cart: {
    yourCart: string;
    emptyCart: string;
    continueShopping: string;
    subtotal: string;
    shipping: string;
    taxes: string;
    total: string;
    checkout: string;
    remove: string;
    quantity: string;
  };
}

export const translations: Record<Locale, Translation> = {
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
      premiumHomeFitness: "Premium home fitness equipment, mock catalog for an educational demo.",
      featuredProducts: "Featured products",
      shopByCategory: "Shop by category",
      findYourTrainingSpace: "Find your training space",
      browseEveryCategory: "Browse every category as an interactive tile board, with quick view and instant add-to-cart.",
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
      treadmills: "Treadmills",
      bikes: "Bikes",
      ellipticals: "Ellipticals",
      rowers: "Rowers",
      benches: "Benches",
      accessories: "Accessories",
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
      placeOrder: "Place order",
      firstName: "First name",
      lastName: "Last name",
      address: "Address",
      city: "City",
      postalCode: "Postal code",
      country: "Country",
      phone: "Phone",
      cardNumber: "Card number",
      expiryDate: "Expiry date",
      cvc: "CVC",
    },
    cart: {
      yourCart: "Your cart",
      emptyCart: "Your cart is empty",
      continueShopping: "Continue shopping",
      subtotal: "Subtotal",
      shipping: "Shipping",
      taxes: "Taxes",
      total: "Total",
      checkout: "Checkout",
      remove: "Remove",
      quantity: "Quantity",
    },
  },
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
      cardio: "Кардио",
      strength: "Силовые",
      treadmills: "Беговые дорожки",
      bikes: "Велотренажёры",
      ellipticals: "Эллипсы",
      rowers: "Гребные тренажёры",
      benches: "Скамьи",
      accessories: "Аксессуары",
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
      subtotal: "Промежуточный итог",
      continueShopping: "Продолжить покупки",
      checkout: "Оформить заказ",
      emptyCart: "Ваша корзина пуста",
      cartSummary: "Сводка корзины",
    },
    locale: {
      chooseCountry: "Выберите вашу страну",
      browsingDemoStore: "Вы просматриваете демо-магазин ({country}).",
      pickRegion: "Выберите регион для установки валюты.",
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
      orderSummary: "Сводка заказа",
      placeOrder: "Разместить заказ",
      firstName: "Имя",
      lastName: "Фамилия",
      address: "Адрес",
      city: "Город",
      postalCode: "Почтовый индекс",
      country: "Страна",
      phone: "Телефон",
      cardNumber: "Номер карты",
      expiryDate: "Срок действия",
      cvc: "CVC",
    },
    cart: {
      yourCart: "Ваша корзина",
      emptyCart: "Ваша корзина пуста",
      continueShopping: "Продолжить покупки",
      subtotal: "Промежуточный итог",
      shipping: "Доставка",
      taxes: "Налоги",
      total: "Итого",
      checkout: "Оформить заказ",
      remove: "Удалить",
      quantity: "Количество",
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

/** Interpolate variables in translation strings (e.g., {country}) */
export function interpolate(
  str: string,
  vars: Record<string, string | number>,
): string {
  return str.replace(/\{(\w+)\}/g, (_, key) => {
    return key in vars ? String(vars[key]) : `{${key}}`;
  });
}
