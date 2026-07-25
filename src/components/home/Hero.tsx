import Image from "next/image";
import { getMedia, hasRealAsset } from "@/lib/media";
import { HeroIntro } from "./HeroIntro";

/**
 * Full-bleed hero. Shows the real background video when an asset is configured
 * in config/media.json, otherwise falls back to the poster placeholder.
 */
export function Hero() {
  const hero = getMedia("hero");
  const showVideo = hasRealAsset("hero") && hero.type === "video";

  return (
    <section className="relative flex min-h-[70vh] items-end overflow-hidden bg-ink text-paper">
      {showVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          src={hero.src!}
          poster={hero.placeholder}
        />
      ) : (
        <Image
          src={hero.placeholder}
          // Decorative background: the accessible hero copy lives in HeroIntro.
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

      <HeroIntro />
    </section>
  );
}
