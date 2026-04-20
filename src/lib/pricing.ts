export const PRICING = {
  pro: {
    global: { amount: '$7.99', note: '/month' },
    ID: { amount: '$5.99', note: '/month' },
  },
  pro_max: {
    global: { amount: '$15.99', note: '/month' },
    ID: { amount: '$11.99', note: '/month' },
  },
} as const

export function getPricing(isIndonesia: boolean) {
  return {
    pro: isIndonesia ? PRICING.pro.ID : PRICING.pro.global,
    pro_max: isIndonesia ? PRICING.pro_max.ID : PRICING.pro_max.global,
  }
}
