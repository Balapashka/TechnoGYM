import { getMedia, hasRealAsset } from "@/lib/media";
import { Media } from "@/components/ui/Media";
import { HeroIntro } from "./HeroIntro";

/**
 * Full-bleed hero. Shows the real background video when an asset is configured
 * in config/media.json, otherwise the poster photo; with neither, the section's
 * own dark surface carries the composition.
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
          poster={hero.poster ?? undefined}
        />
      ) : (
        hero.poster && (
          <Media
            src={hero.poster}
            // Decorative background: the accessible hero copy lives in HeroIntro.
            alt=""
            priority
            sizes="100vw"
            imgClassName="opacity-70"
            fallbackClassName="bg-transparent"
          />
        )
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

      <HeroIntro />
    </section>
  );
}
