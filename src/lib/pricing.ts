export const PRICING = {
  pro: {
    global: { amount: '$10', note: '/month' },
    ID: { amount: '$4', note: '/month' },
  },
  pro_max: {
    global: { amount: '$20', note: '/month' },
    ID: { amount: '$8', note: '/month' },
  },
} as const

export function getPricing(isIndonesia: boolean) {
  return {
    pro: isIndonesia ? PRICING.pro.ID : PRICING.pro.global,
    pro_max: isIndonesia ? PRICING.pro_max.ID : PRICING.pro_max.global,
  }
}
