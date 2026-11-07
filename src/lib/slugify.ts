/**
 * Latin URL slug from any product or category name, Cyrillic included:
 * "Беговая дорожка UNIX Fit R-240" → "begovaya-dorozhka-unix-fit-r-240".
 * Used by the admin form so the owner never has to invent a URL by hand.
 */
const MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh",
  щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

export function slugify(input: string, maxLength = 80): string {
  const latin = [...input.toLowerCase()].map((ch) => MAP[ch] ?? ch).join("");
  return latin
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}
