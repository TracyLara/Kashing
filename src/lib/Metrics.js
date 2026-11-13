import { num, div, peso, pct, birTaxes } from './formulas'

const money = (key, label, hint, section) => ({ key, label, hint, section, type: 'money' })
const count = (key, label, hint, section) => ({ key, label, hint, section, type: 'count' })

export const METRICS = [
 
  {
    id: 'avgRevenue', group: 'pulse', title: 'Average Revenue', blurb: 'Sales per day or per item',
    fields: [
      money('grossSales', 'Total gross sales', 'All sales for the period, before expenses'),
      count('divisor', 'Days open OR units sold', 'Pick one and stay consistent, e.g. 26 days open this month'),
    ],
    compute: (v) => ({
      results: [{ label: 'Average revenue', value: peso(div(num(v.grossSales), num(v.divisor))), main: true }],
    }),
  },
  {
    id: 'avgTicket', group: 'pulse', title: 'Average Ticket Size', blurb: 'Spend per customer visit',
    fields: [
      money('totalRevenue', 'Total revenue'),
      count('transactions', 'Total number of transactions', 'Number of receipts / customer orders'),
    ],
    compute: (v) => ({
      results: [{ label: 'Average ticket size', value: peso(div(num(v.totalRevenue), num(v.transactions))), main: true }],
      tip: 'If this goes up over time, customers are spending more per visit.',
    }),
  },
  {
    id: 'breakEven', group: 'pulse', title: 'Break-Even Point', blurb: 'Sales needed to reach ₱0 loss',
    fields: [
      money('fixedCosts', 'Fixed costs for the period', 'Rent, salaries, utilities, etc.'),
      money('netSales', 'Net sales'),
      money('cogs', 'Cost of goods sold (COGS)'),
      count('days', 'Days open in this period (optional)', 'Gives you a daily sales target'),
    ],
    compute: (v) => {
      const ns = num(v.netSales)
      const gpmr = div(ns - num(v.cogs), ns)
      if (gpmr <= 0) return { results: [{ label: 'Gross margin', value: pct(gpmr * 100) }], tip: 'Your gross margin must be above 0% before a break-even point exists. Review your prices or costs.' }
      const bep = num(v.fixedCosts) / gpmr
      const results = [
        { label: 'Gross margin', value: pct(gpmr * 100) },
        { label: 'Break-even sales', value: peso(bep), main: true },
      ]
      if (num(v.days) > 0) results.push({ label: 'Daily sales target', value: peso(bep / num(v.days)) })
      return { results }
    },
  },
  {
    id: 'workingCapital', group: 'pulse', title: 'Working Capital & Current Ratio', blurb: 'Can you pay your bills soon?',
    fields: [
      money('currentAssets', 'Current assets', 'Cash + inventory + money customers still owe you'),
      money('currentLiabilities', 'Current liabilities', 'Bills and loans you must pay within 12 months'),
    ],
    compute: (v) => {
      const ca = num(v.currentAssets), cl = num(v.currentLiabilities)
      const ratio = div(ca, cl)
      let tip = ''
      if (cl > 0) tip = ratio < 1 ? 'You owe more in the near term than you have on hand. Watch your cash closely.' : ratio < 1.5 ? 'You can cover your short-term bills, but the cushion is thin.' : 'You have a comfortable cushion for short-term bills.'
      return {
        results: [
          { label: 'Working capital', value: peso(ca - cl) },
          { label: 'Current ratio', value: cl > 0 ? ratio.toFixed(2) : '—', main: true },
        ],
        tip,
      }
    },
  },


  {
    id: 'operatingCost', group: 'health', title: 'Operating Cost', blurb: 'COGS + OPEX, with shrinkage & employer share',
    fields: [
      money('rawMaterials', 'Raw materials used', 'Cost of the goods you actually sold', 'Cost of goods sold (COGS)'),
      money('directLabor', 'Direct labor', 'Wages of people who make the product'),
      money('beginInv', 'Beginning inventory', 'Value of stock at the start of the period'),
      money('purchases', 'Purchases during the period', 'Stock you bought during the period'),
      money('endInv', 'Ending inventory', 'Value of stock left at the end'),
      money('rent', 'Rent', '', 'Operating expenses (OPEX)'),
      money('utilities', 'Utilities', 'Electricity, water, internet'),
      money('marketing', 'Marketing'),
      money('salaries', 'Fixed salaries'),
      money('sss', 'SSS employer contribution (monthly total)', '', 'Mandatory employer share'),
      money('philhealth', 'PhilHealth employer contribution'),
      money('pagibig', 'Pag-IBIG employer contribution'),
    ],
    compute: (v) => {
      const raw = num(v.rawMaterials)
      const gap = num(v.beginInv) + num(v.purchases) - num(v.endInv) - raw
      const shrink = Math.max(0, gap)
      const cogs = raw + num(v.directLabor) + shrink
      const employer = num(v.sss) + num(v.philhealth) + num(v.pagibig)
      const opex = num(v.rent) + num(v.utilities) + num(v.marketing) + num(v.salaries) + employer
      return {
        results: [
          { label: 'Shrinkage allowance (waste/theft)', value: peso(shrink) },
          { label: 'COGS (expanded)', value: peso(cogs) },
          { label: 'Mandatory employer share', value: peso(employer) },
          { label: 'OPEX (expanded)', value: peso(opex) },
          { label: 'Total operating cost', value: peso(cogs + opex), main: true },
        ],
        tip: gap < 0 ? 'Your inventory numbers show more goods used than you had. Please recheck your counts.' : '',
      }
    },
  },
  {
    id: 'grossProfit', group: 'health', title: 'Gross Profit & Margin', blurb: 'What is left after production costs',
    fields: [
      money('netSales', 'Net sales', 'Sales after discounts and returns'),
      money('cogs', 'COGS (expanded)', 'Raw materials + direct labor + shrinkage'),
    ],
    compute: (v) => {
      const ns = num(v.netSales), gp = ns - num(v.cogs), m = div(gp, ns) * 100
      return {
        results: [
          { label: 'Gross profit', value: peso(gp) },
          { label: 'Gross profit margin rate (GPMR)', value: pct(m), main: true },
        ],
        tip: ns <= 0 ? '' : gp < 0 ? 'You are selling below your production cost. Check your prices.' : `For every ₱100 you sell, about ₱${m.toFixed(0)} is left to pay for overhead.`,
      }
    },
  },
  {
    id: 'opProfit', group: 'health', title: 'Operating Profit & Margin', blurb: 'After overhead and local taxes',
    fields: [
      money('netSales', 'Net sales'),
      money('cogs', 'COGS (expanded)'),
      money('opex', 'OPEX (expanded)', 'Rent, utilities, marketing, salaries, employer share'),
      money('lgu', 'LGU local taxes', 'Business permit fee + municipal gross receipts tax for this period'),
    ],
    compute: (v) => {
      const ns = num(v.netSales), gp = ns - num(v.cogs), op = gp - num(v.opex) - num(v.lgu)
      return {
        results: [
          { label: 'Gross profit', value: peso(gp) },
          { label: 'Operating profit', value: peso(op) },
          { label: 'Operating profit margin rate (OPMR)', value: pct(div(op, ns) * 100), main: true },
        ],
      }
    },
  },
  {
    id: 'netProfit', group: 'health', title: 'Net Profit & Margin', blurb: 'Cash left after BIR tax and loans',
    fields: [
      { key: 'period', label: 'These figures cover a…', type: 'select', default: '12',
        options: [{ value: '12', label: 'Month' }, { value: '4', label: 'Quarter' }, { value: '1', label: 'Full year' }],
        hint: 'BIR taxes are yearly, so we scale your numbers to a year to compute them.' },
      money('netSales', 'Net sales'),
      money('grossSales', 'Gross sales (for tax)', 'Leave blank to use net sales'),
      money('cogs', 'COGS (expanded)'),
      money('opex', 'OPEX (expanded)'),
      money('lgu', 'LGU local taxes'),
      money('interest', 'Bank interest expenses'),
      { key: 'taxOption', label: 'BIR tax option', type: 'select', default: '8',
        options: [{ value: '8', label: '8% flat tax' }, { value: 'grad', label: 'Graduated rates + 3% percentage tax' }] },
      { key: 'mixed', label: 'Do you also have a job (employee income)?', type: 'select', default: '0',
        options: [{ value: '0', label: 'No, business income only' }, { value: '1', label: 'Yes, I also earn a salary' }] },
    ],
    compute: (v) => {
      const ns = num(v.netSales), gross = num(v.grossSales) || ns
      const op = ns - num(v.cogs) - num(v.opex) - num(v.lgu)
      const interest = num(v.interest)
      const t = birTaxes({ gross, taxableIncome: op - interest, factor: Number(v.period), mixed: v.mixed === '1' })
      const chosen = v.taxOption === '8' ? t.flat : t.graduated
      const net = op - interest - chosen
      const cheaper = t.flat <= t.graduated ? '8% flat tax' : 'graduated + 3%'
      let tip = `Estimate: 8% option ≈ ${peso(t.flat)}, graduated + 3% ≈ ${peso(t.graduated)} for this period. Cheaper here: ${cheaper}. (Graduated assumes your expenses are fully deductible with receipts.)`
      if (t.over3M && v.taxOption === '8') tip = 'The 8% option is only for yearly sales up to ₱3,000,000. ' + tip
      return {
        results: [
          { label: 'Operating profit', value: peso(op) },
          { label: 'Bank interest', value: peso(interest) },
          { label: 'BIR tax due (estimate)', value: peso(chosen) },
          { label: 'Net profit', value: peso(net) },
          { label: 'Net profit margin rate (NPMR)', value: pct(div(net, ns) * 100), main: true },
        ],
        tip,
      }
    },
  },
  {
    id: 'roi', group: 'health', title: 'Return on Investment (ROI)', blurb: 'How well your capital is working',
    fields: [
      money('profit', 'Net profit (annualized)', 'Your net profit for a full year'),
      money('capital', 'Total startup capital', 'Lease deposit, renovation, BIR/DTI registration fees'),
      money('capex', 'CapEx investments', 'Major equipment, e.g. espresso machine, oven'),
    ],
    compute: (v) => {
      const invested = num(v.capital) + num(v.capex), p = num(v.profit)
      const results = [{ label: 'ROI', value: pct(div(p, invested) * 100), main: true }]
      if (p > 0 && invested > 0) results.push({ label: 'Years to earn back your investment', value: (invested / p).toFixed(1) })
      return { results }
    },
  },
]

export const getDefaults = (metric) =>
  Object.fromEntries(metric.fields.map((f) => [f.key, f.default ?? '']))