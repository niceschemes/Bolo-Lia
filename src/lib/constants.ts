/** URLs verificadas (retornam 200) — Unsplash */
const u = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?w=${w}&auto=format&fit=crop&q=80`;

export const DEMO_PRODUCT_PHOTOS: { match: RegExp; url: string }[] = [
  { match: /coxinha/i, url: u("photo-1529042410759-befb1204b468") },
  { match: /brigadeiro/i, url: u("photo-1499636136210-6f4ee915583e") },
  { match: /empad[ai]/i, url: u("photo-1773831061318-490f04ee6e07") },
  { match: /lim[aã]o/i, url: u("photo-1767032778094-1edb984e5b23") },
  { match: /bolo/i, url: u("photo-1578985545062-69928b1d9587") },
];

export function photoForProductName(name: string): string | null {
  for (const { match, url } of DEMO_PRODUCT_PHOTOS) {
    if (match.test(name)) return url;
  }
  return null;
}

export function isExternalImage(src: string) {
  return src.startsWith("http://") || src.startsWith("https://");
}

export const FOOD_EMOJIS = ["🧁", "🍰", "🥐", "🍫", "🍪", "🥟"];
