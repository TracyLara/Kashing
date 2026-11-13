export const num = (v) => {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}
export const div = (a, b) => (b === 0 ? 0 : a / b)
export const peso = (n) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number.isFinite(n) ? n : 0)
export const pct = (n) => `${(Number.isFinite(n) ? n : 0).toFixed(2)}%`

export function graduatedTax(income) {
  if (income <= 250000) return 0
  if (income <= 400000) return (income - 250000) * 0.15
  if (income <= 800000) return 22500 + (income - 400000) * 0.2
  if (income <= 2000000) return 102500 + (income - 800000) * 0.25
  if (income <= 8000000) return 402500 + (income - 2000000) * 0.3
  return 2202500 + (income - 8000000) * 0.35
}


export function birTaxes({ gross, taxableIncome, factor, mixed }) {
  const g = gross * factor
  const ti = Math.max(0, taxableIncome * factor)
  const flat = Math.max(0, g - (mixed ? 0 : 250000)) * 0.08
  const graduated = graduatedTax(ti) + g * 0.03
  return { flat: flat / factor, graduated: graduated / factor, over3M: g > 3000000 }
}