export const OFFERS = [
  {
    quantity: 1,
    total: 299,
    old: 540,
    off: 45,
    variant: "1 упаковка (12 таблеток) — 299 грн",
    label: "1 уп.",
    hit: false,
  },
  {
    quantity: 2,
    total: 538,
    old: 598,
    off: 10,
    variant: "2 упаковки (24 таблетки) — 538 грн",
    label: "2 уп.",
    hit: false,
  },
  {
    quantity: 3,
    total: 762,
    old: 897,
    off: 15,
    variant: "3 упаковки (36 таблеток) — 762 грн",
    label: "3 уп.",
    hit: true,
  },
  {
    quantity: 4,
    total: 956,
    old: 1196,
    off: 20,
    variant: "4 упаковки (48 таблеток) — 956 грн",
    label: "4 уп.",
    hit: false,
  },
] as const;

export type Offer = (typeof OFFERS)[number];

export function getOfferByQuantity(quantity: number): Offer | undefined {
  return OFFERS.find((offer) => offer.quantity === quantity);
}

export function unitPrice(total: number, quantity: number): number {
  if (!quantity) return 0;
  return Math.round(total / quantity);
}
