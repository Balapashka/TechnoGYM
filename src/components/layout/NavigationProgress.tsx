"use client";

import { usePathname } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/**
 * Тонкая полоска прогресса вверху экрана на время перехода между страницами
 * (как на YouTube/GitHub). Ничего не перекрывает и не перехватывает клики —
 * это подсказка «переход начался», а не блокирующий оверлей.
 */

/**
 * Задержка перед появлением. Префетченные роуты открываются за десятки
 * миллисекунд — на них полоска не должна успеть мигнуть.
 */
const SHOW_DELAY_MS = 150;
/** Шаг подрастания полоски. */
const TICK_MS = 150;
/** Ширина в момент появления, %. */
const START_PERCENT = 15;
/** Асимптота: пока страница не пришла, полоска не доходит до конца, %. */
const CEILING_PERCENT = 92;
/** Доля оставшегося пути за один шаг — отсюда нелинейность роста. */
const GROWTH = 0.2;
/** Сколько живёт полоска после 100%, пока доигрывает исчезновение. */
const FADE_OUT_MS = 520;
/** Аварийный выход: переход сорвался и pathname уже не сменится. */
const SAFETY_MS = 10_000;

/**
 * Элементы, которые «съедают» клик. Если ближайший такой предок цели — не сама
 * ссылка, значит нажали на вложенный контрол, а не на ссылку.
 */
const INTERACTIVE_SELECTOR =
  "a, button, input, select, textarea, label, summary, [role='button']";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const getServerReducedMotion = () => false;

type Phase = "idle" | "loading" | "done";

/**
 * В App Router нет событий роутера, поэтому:
 *  — начало перехода ловим кликом по ссылке в фазе capture;
 *  — конец перехода — сменой usePathname().
 *
 * Намеренно НЕ используем useSearchParams(): он выбивает страницу из
 * статической генерации (и требует своей Suspense-границы), а в витрине нет
 * ссылок, которые меняли бы только query — pathname полностью описывает
 * переход. Suspense ниже оставлен как дешёвая страховка: с включённым
 * cacheComponents usePathname на динамических сегментах требует границы.
 */
export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  );
}

function ProgressBar() {
  const pathname = usePathname();
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  );

  const [phase, setPhase] = useState<Phase>("idle");
  const [value, setValue] = useState(0);

  const showTimer = useRef<number | null>(null);
  const tickTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);
  const safetyTimer = useRef<number | null>(null);
  /** Клик по ссылке был, но pathname ещё не сменился. */
  const pendingRef = useRef(false);
  /** Полоска уже на экране — её надо добить до 100%, а не гасить молча. */
  const visibleRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (showTimer.current !== null) window.clearTimeout(showTimer.current);
    if (tickTimer.current !== null) window.clearInterval(tickTimer.current);
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    if (safetyTimer.current !== null) window.clearTimeout(safetyTimer.current);
    showTimer.current = null;
    tickTimer.current = null;
    hideTimer.current = null;
    safetyTimer.current = null;
  }, []);

  /** Переход закончился, не успев показать полоску — гасим бесследно. */
  const cancel = useCallback(() => {
    clearTimers();
    pendingRef.current = false;
    visibleRef.current = false;
    setPhase("idle");
    setValue(0);
  }, [clearTimers]);

  /** Переход закончился при видимой полоске — добиваем до 100% и растворяем. */
  const finish = useCallback(() => {
    clearTimers();
    pendingRef.current = false;
    visibleRef.current = false;
    setPhase("done");
    setValue(100);
    hideTimer.current = window.setTimeout(() => {
      hideTimer.current = null;
      setPhase("idle");
      setValue(0);
    }, FADE_OUT_MS);
  }, [clearTimers]);

  const start = useCallback(() => {
    // Переход уже идёт (быстрый второй клик) — не перезапускаем полоску с нуля.
    if (pendingRef.current || visibleRef.current) return;

    // Предыдущая полоска ещё доигрывает исчезновение: обрываем её здесь,
    // иначе её отложенный таймер погасил бы новую.
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
      setPhase("idle");
      setValue(0);
    }

    pendingRef.current = true;
    showTimer.current = window.setTimeout(() => {
      showTimer.current = null;
      visibleRef.current = true;
      setPhase("loading");
      setValue(START_PERCENT);

      // При отключённой анимации полоска статична, подрастать нечему.
      if (!reducedMotion) {
        tickTimer.current = window.setInterval(() => {
          setValue((current) => current + (CEILING_PERCENT - current) * GROWTH);
        }, TICK_MS);
      }

      safetyTimer.current = window.setTimeout(finish, SAFETY_MS);
    }, SHOW_DELAY_MS);
  }, [finish, reducedMotion]);

  // Конец перехода: сменился pathname.
  const previousPath = useRef(pathname);
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    // Переход не от клика по ссылке (например, router.push после формы) —
    // полоску мы не запускали, гасить нечего.
    if (!pendingRef.current && !visibleRef.current) return;
    if (visibleRef.current) finish();
    else cancel();
  }, [pathname, finish, cancel]);

  // Начало перехода: клик по внутренней ссылке.
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return; // только левая кнопка
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      // closest("a") ловит и <a> внутри SVG — у него href не строка.
      if (!(anchor instanceof HTMLAnchorElement)) return;

      // Отличить настоящий переход от «кнопки внутри карточки» по
      // event.defaultPrevented нельзя: next/link сам вызывает preventDefault
      // на каждой внутренней ссылке. Поэтому смотрим, на чём именно был клик:
      // если ближайший интерактивный предок — не сама ссылка, а вложенная
      // кнопка (быстрый просмотр, сравнение, «цена по запросу», фильтры),
      // то она переход отменит и полоску показывать не за чем.
      if (target.closest(INTERACTIVE_SELECTOR) !== anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      // mailto:, tel: и любой внешний хост — это не переход внутри приложения.
      if (url.protocol !== "http:" && url.protocol !== "https:") return;
      if (url.origin !== window.location.origin) return;
      // Конец перехода ловится сменой usePathname(), поэтому любой переход,
      // который pathname не меняет, полоска завершить не сможет и провисела бы
      // до аварийного таймера. Это не только якоря и повтор текущего адреса:
      // ссылка из меню на текущую категорию при активном фильтре меняет лишь
      // query (/category/treadmills?country=it -> /category/treadmills).
      // Такие переходы обрабатываются на клиенте почти мгновенно, так что
      // индикатор им и не нужен.
      if (url.pathname === window.location.pathname) return;

      start();
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [start]);

  useEffect(() => clearTimers, [clearTimers]);

  const active = phase !== "idle";
  // Без анимации полоска не растёт: она либо есть целиком, либо её нет.
  const percent = reducedMotion ? (active ? 100 : 0) : phase === "done" ? 100 : value;

  return (
    <div
      // Чисто визуальный индикатор: о загрузке скринридеру сообщают скелетоны
      // роутов (loading.tsx), дублировать это бегущей полоской не нужно.
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]"
    >
      <div
        // `ink`, не `accent`: жёлтый #ffed00 на белом даёт контраст 1.21:1 —
        // единственный неблокирующий сигнал «идёт переход» был бы практически
        // не виден, а ради видимости этой полоски всё и затевалось.
        className="h-full w-full origin-left bg-ink"
        style={{
          // scaleX вместо width: анимация идёт на композиторе и не вызывает
          // layout — важно, потому что полоска живёт как раз в момент,
          // когда браузер занят рендером новой страницы.
          transform: `scaleX(${percent / 100})`,
          opacity: active ? 1 : 0,
          transition:
            reducedMotion || phase === "idle"
              ? "none"
              : phase === "done"
                ? "transform 180ms ease-out, opacity 280ms ease-out 200ms"
                : "transform 180ms ease-out, opacity 120ms ease-out",
        }}
      />
    </div>
  );
}
