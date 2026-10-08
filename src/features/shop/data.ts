/**
 * SHOP LISTINGS — local placeholder data (`isSample: true`) until sellers can list gear for real.
 *
 * Pickleball Hub does not take payments: each listing points buyers to the seller, who arranges
 * payment and pickup themselves. Sellers below are this project's placeholder clubs, not real
 * organizations, and every item, price and size is invented for preview purposes.
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

const items: Omit<ShopItem, "id" | "contactUrl" | "imageUrl" | "isSample">[] = [
  {
    name: "Club jersey — home green",
    category: "jerseys",
    condition: "new",
    price: 650,
    details: "Dri-fit · Sizes S–XXL",
    seller: majesticFalls,
  },
  {
    name: "Carbon fiber paddle, 16mm",
    category: "paddles",
    condition: "new",
    price: 4200,
    details: "Raw carbon face · 7.9 oz",
    seller: thirdShot,
  },
  {
    name: "Court shoes, worn twice",
    category: "shoes",
    condition: "pre-loved",
    price: 2300,
    details: "Men's US 9 · Non-marking sole",
    seller: lanaoKitchen,
  },
  {
    name: "Beginner paddle pair with balls",
    category: "paddles",
    condition: "new",
    price: 1800,
    details: "2 fiberglass paddles · 4 outdoor balls",
    seller: majesticFalls,
  },
  {
    name: "Tournament tee — Doubles Classic",
    category: "jerseys",
    condition: "new",
    price: 450,
    details: "Cotton blend · Sizes XS–XL",
    seller: thirdShot,
  },
  {
    name: "Outdoor balls, 6-pack",
    category: "gear",
    condition: "new",
    price: 900,
    details: "40-hole · USAP-approved model",
    seller: lanaoKitchen,
  },
  {
    name: "Graphite paddle, light use",
    category: "paddles",
    condition: "pre-loved",
    price: 1500,
    details: "13mm core · Fresh grip tape",
    seller: lanaoKitchen,
  },
  {
    name: "Women's court shoes",
    category: "shoes",
    condition: "new",
    price: 3400,
    details: "US 6–8 · Wide toe box",
    seller: majesticFalls,
  },
  {
    name: "Paddle cover & overgrip set",
    category: "gear",
    condition: "new",
    price: 380,
    details: "Neoprene cover · 3 overgrips",
    seller: thirdShot,
  },
];

export const sampleShopItems: ShopItem[] = items.map((item, index) => ({
  ...item,
  id: `sample-shop-item-${index + 1}`,
  contactUrl: null,
  imageUrl: null,
  isSample: true,
}));

export function isShopCategory(value: string | undefined): value is ShopCategory {
  return shopCategories.some((category) => category.slug === value);
}

export function getShopItems(category?: ShopCategory): ShopItem[] {
  return category ? sampleShopItems.filter((item) => item.category === category) : sampleShopItems;
}
