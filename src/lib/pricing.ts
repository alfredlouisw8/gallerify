export const PRICING = {
  pro: {
    global: {
      monthly: { amount: '$8', note: '/month' },
      annual: { amount: '$80', note: '/year', perMonth: '$6.67' },
    },
    ID: {
      monthly: { amount: '$6', note: '/month' },
      annual: { amount: '$60', note: '/year', perMonth: '$5.00' },
    },
  },
  pro_max: {
    global: {
      monthly: { amount: '$16', note: '/month' },
      annual: { amount: '$160', note: '/year', perMonth: '$13.33' },
    },
    ID: {
      monthly: { amount: '$12', note: '/month' },
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

export function getSavePercent(isIndonesia: boolean): number {
  const p = getPricing(isIndonesia)
  const monthly = parseFloat(p.pro.monthly.amount.replace('$', ''))
  const perMonth = parseFloat(p.pro.annual.perMonth.replace('$', ''))
  return Math.round(((monthly - perMonth) / monthly) * 100)
}
