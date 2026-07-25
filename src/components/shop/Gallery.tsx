"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, type Variants } from "motion/react";
import { useTranslation } from "@/i18n/useTranslation";

const slide: Variants = {
  enter: (d: number) => ({ opacity: 0, x: d * 80, scale: 1.05 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: (d: number) => ({ opacity: 0, x: d * -80, scale: 1.05 }),
};

/** Product image gallery: parallax-on-hover active frame + thumbnail strip. */
export function Gallery({ images, name }: { images: string[]; name: string }) {
  const t = useTranslation();
  const safe = images.length ? images : ["/placeholders/gallery-1600x1200.svg"];
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const frameRef = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const select = (i: number) => {
    setDir(i > active ? 1 : -1);
    setActive(i);
  };

  // Parallax: shift the image opposite to the cursor within the frame.
  const onMove = (e: React.MouseEvent) => {
    const r = frameRef.current?.getBoundingClientRect();
    if (!r) return;
    px.set(-((e.clientX - r.left) / r.width - 0.5) * 28);
    py.set(-((e.clientY - r.top) / r.height - 0.5) * 28);
  };
  const reset = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={frameRef}
        onMouseMove={onMove}
        onMouseLeave={reset}
        className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-mist"
      >
        <AnimatePresence mode="popLayout" custom={dir}>
          <motion.div
            key={active}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <motion.div style={{ x: px, y: py }} className="absolute inset-0">
              <Image
                src={safe[active]}
                alt={name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="scale-110 object-contain p-8"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {safe.length > 1 && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {safe.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-6 bg-ink" : "w-1.5 bg-ink/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {safe.length > 1 && (
        <div className="flex gap-3">
          {safe.map((src, i) => (
            <button
              key={`${src}-${i}`}
              onClick={() => select(i)}
              aria-label={t("product.viewImage", { number: i + 1 })}
              aria-current={i === active}
              className={`hover-lift relative h-20 w-20 overflow-hidden rounded-xl border bg-mist ${
                i === active ? "border-ink ring-2 ring-accent" : "border-stone"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
