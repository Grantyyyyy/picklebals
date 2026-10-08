/**
 * SHOP LISTINGS — local content shown as regular listings (`isSample: false`) by product decision,
 * matching the clubs and events in `sample-content/data.ts`.
 *
 * Pickleball Hub does not take payments: each listing points buyers to the seller, who arranges
 * payment and pickup themselves. Sellers below are this project's placeholder clubs, not real
 * organizations, and every item, price and size is invented; replace them with real listings
 * before launch. Photos are from Unsplash (Unsplash License: free to use, no attribution required).
 */

export const shopCategories = [
  { slug: "paddles", label: "Paddles" },
  { slug: "jerseys", label: "Jerseys" },
  { slug: "shoes", label: "Shoes" },
  { slug: "gear", label: "Balls & gear" },
] as const;

export type ShopCategory = (typeof shopCategories)[number]["slug"];

export type ShopItemCondition = "new" | "pre-loved";

export type ShopItem = {
  id: string;
  name: string;
  category: ShopCategory;
  condition: ShopItemCondition;
  /** Whole pesos. */
  price: number;
  /** One short line: sizes, weight, core thickness, pack size. */
  details: string | null;
  seller: { name: string; clubSlug: string | null };
  /** Messenger, Facebook or shop link. Without one, buyers are sent to the contact page. */
  contactUrl: string | null;
  imageUrl: string | null;
  isSample: boolean;
};

const majesticFalls = { name: "Majestic Falls Picklers", clubSlug: "majestic-falls-picklers" };
const thirdShot = { name: "Iligan Third Shot Society", clubSlug: "iligan-third-shot-society" };
const lanaoKitchen = { name: "Lanao Kitchen Club", clubSlug: "lanao-kitchen-club" };

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?w=1200&q=80`;

const items: Omit<ShopItem, "id" | "contactUrl" | "isSample">[] = [
  {
    name: "Club training tee",
    imageUrl: unsplash("1562157873-818bc0726f68"),
    category: "jerseys",
    condition: "new",
    price: 650,
    details: "Dri-fit · 6 colors · Sizes S–XXL",
    seller: majesticFalls,
  },
  {
    name: "Carbon fiber paddle, 16mm",
    imageUrl: unsplash("1753901821774-22a88913130f"),
    category: "paddles",
    condition: "new",
    price: 4200,
    details: "Raw carbon face · 7.9 oz",
    seller: thirdShot,
  },
  {
    name: "Court shoes, worn twice",
    imageUrl: unsplash("1738165758746-5bfad0dd55ec"),
    category: "shoes",
    condition: "pre-loved",
    price: 2300,
    details: "Men's US 9 · Non-marking sole",
    seller: lanaoKitchen,
  },
  {
    name: "Beginner paddle pair with balls",
    imageUrl: unsplash("1693142518820-78d7a05f1546"),
    category: "paddles",
    condition: "new",
    price: 1800,
    details: "2 fiberglass paddles · 4 outdoor balls",
    seller: majesticFalls,
  },
  {
    name: "Tournament tee — Doubles Classic",
    imageUrl: unsplash("1581655353564-df123a1eb820"),
    category: "jerseys",
    condition: "new",
    price: 450,
    details: "Cotton blend · Sizes XS–XL",
    seller: thirdShot,
  },
  {
    name: "Outdoor balls, 6-pack",
    imageUrl: unsplash("1711996151738-657bd95b7cdb"),
    category: "gear",
    condition: "new",
    price: 900,
    details: "40-hole · USAP-approved model",
    seller: lanaoKitchen,
  },
  {
    name: "Graphite paddle, light use",
    imageUrl: unsplash("1659318006095-4d44845f3a1b"),
    category: "paddles",
    condition: "pre-loved",
    price: 1500,
    details: "13mm core · Fresh grip tape",
    seller: lanaoKitchen,
  },
  {
    name: "Women's court shoes",
    imageUrl: unsplash("1727060167812-a53ac9b802d4"),
    category: "shoes",
    condition: "new",
    price: 3400,
    details: "US 6–8 · Wide toe box",
    seller: majesticFalls,
  },
  {
    name: "Court backpack with paddle sleeve",
    imageUrl: unsplash("1753903118385-0119302c1400"),
    category: "gear",
    condition: "pre-loved",
    price: 1200,
    details: "Fits 2 paddles · Mesh ball pocket",
    seller: thirdShot,
  },
];

export const shopItems: ShopItem[] = items.map((item, index) => ({
  ...item,
  id: `shop-item-${index + 1}`,
  contactUrl: null,
  isSample: false,
}));

export function isShopCategory(value: string | undefined): value is ShopCategory {
  return shopCategories.some((category) => category.slug === value);
}

export function getShopItems(category?: ShopCategory): ShopItem[] {
  return category ? shopItems.filter((item) => item.category === category) : shopItems;
}
