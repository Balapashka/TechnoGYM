import mediaConfig from "../../config/media.json";

export type MediaSlot = {
  type: "image" | "video";
  width: number;
  height: number;
  aspect: string;
  placeholder: string;
  src: string | null;
  note: string;
};

type MediaConfig = Record<string, MediaSlot>;

// Drop the documentation key before exposing slots.
const slots = Object.fromEntries(
  Object.entries(mediaConfig).filter(([key]) => key !== "$comment"),
);

export const media = slots as unknown as MediaConfig;

export type MediaSlotName = keyof typeof media;

/** Returns the slot config for a name (throws on unknown slot at dev time). */
export function getMedia(name: string): MediaSlot {
  const slot = media[name];
  if (!slot) throw new Error(`Unknown media slot: ${name}`);
  return slot;
}

/** Effective URL for a slot: the real asset if provided, else the placeholder. */
export function resolveMediaSrc(name: string): string {
  const slot = getMedia(name);
  return slot.src ?? slot.placeholder;
}

/** Whether a real asset has been supplied for the slot. */
export function hasRealAsset(name: string): boolean {
  return Boolean(getMedia(name).src);
}
