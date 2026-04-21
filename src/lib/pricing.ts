export const PRICING = {
  pro: {
    global: {
      monthly: { amount: '$7.99', note: '/month' },
      annual: { amount: '$80', note: '/year', perMonth: '$6.67' },
    },
    ID: {
      monthly: { amount: '$5.99', note: '/month' },
      annual: { amount: '$60', note: '/year', perMonth: '$5.00' },
    },
  },
  pro_max: {
    global: {
      monthly: { amount: '$15.99', note: '/month' },
      annual: { amount: '$160', note: '/year', perMonth: '$13.33' },
    },
    ID: {
      monthly: { amount: '$11.99', note: '/month' },
      annual: { amount: '$120', note: '/year', perMonth: '$10.00' },
    },
  },
} as const

export function getPricing(isIndonesia: boolean) {
  const region = isIndonesia ? 'ID' : 'global'
  return {
    pro: PRICING.pro[region],
    pro_max: PRICING.pro_max[region],
  }
}
