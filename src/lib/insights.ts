// Independent analysis — the "performance, risk and cost" reporting at the heart of Y-WLTH's proposition.
// Everything is derived from the aggregated accounts; nothing here recommends a product.
import { ACCOUNTS, CLASS_META, byClass, totals, type Structure } from '@/data/wealth';
import { feeBase, ywlthFeeAnnual } from '@/data/fees';
import { gbp, gbpCompact } from '@/theme/tokens';

/** Illustrative stand-in for the Y-WLTH risk-equivalent benchmark applied to the market-priced part of a portfolio. */
export const BENCHMARK = { name: 'Y-WLTH risk-equivalent benchmark', ret: 12.0 };

export const performance = () => {
  const priced = ACCOUNTS.filter((a) => ['equities', 'pension', 'alts'].includes(a.cls) && a.id !== 'wt');
  const value = priced.reduce((s, a) => s + a.value, 0);
  const ret = priced.reduce((s, a) => s + a.change1y * a.value, 0) / value;
  const costPct = priced.reduce((s, a) => s + a.feePct * a.value, 0) / value;
  return { value, ret, vsBenchmark: ret - BENCHMARK.ret, costPct };
};

export const risk = () => {
  const { assets } = totals();
  const classes = byClass().sort((a, b) => b.value - a.value);
  const top = classes[0];
  const nonGbp = ACCOUNTS.filter((a) => a.ccy !== 'GBP').reduce((s, a) => s + a.value, 0);
  const ukProperty = ACCOUNTS.filter((a) => a.cls === 'property' && a.ccy === 'GBP').reduce((s, a) => s + a.value, 0);
  const cash = ACCOUNTS.filter((a) => a.cls === 'cash').reduce((s, a) => s + a.value, 0);
  return {
    topLabel: top.label,
    topPct: (top.value / assets) * 100,
    nonGbpPct: (nonGbp / assets) * 100,
    ukPropertyPct: (ukProperty / assets) * 100,
    cashPct: (cash / assets) * 100,
    level: top.value / assets > 0.5 ? 'Concentrated' : 'Balanced',
  };
};

export const costs = () => {
  const costly = ACCOUNTS.filter((a) => a.feePct > 0);
  const annual = costly.reduce((s, a) => s + (a.value * a.feePct) / 100, 0);
  const invested = costly.reduce((s, a) => s + a.value, 0);
  const ywlth = ywlthFeeAnnual();
  const base = feeBase();
  const total = annual + ywlth;
  return { annual, invested, pct: (annual / invested) * 100, ywlth, total, totalPct: (total / base) * 100, base };
};

export type Question = { id: string; title: string; why: string };

/** Questions worth taking to your adviser, generated from the data. Impartial: no product is ever named. */
export const reviewQuestions = (): Question[] => {
  const q: Question[] = [];
  const r = risk();
  const pensions = ACCOUNTS.filter((a) => a.cls === 'pension' && a.feePct > 0).sort((a, b) => b.feePct - a.feePct);
  if (pensions.length > 1 && pensions[0].feePct >= pensions[pensions.length - 1].feePct * 2) {
    const hi = pensions[0], lo = pensions[pensions.length - 1];
    q.push({
      id: 'pension-cost',
      title: `Why does ${hi.institution} cost ${(hi.feePct / lo.feePct).toFixed(1)}× more than ${lo.institution}?`,
      why: `${hi.name} charges ${hi.feePct.toFixed(2)}% a year (about ${gbp((hi.value * hi.feePct) / 100)}) against ${lo.feePct.toFixed(2)}% on ${lo.institution}. Worth understanding what the difference buys.`,
    });
  }
  if (r.topPct > 45)
    q.push({ id: 'conc', title: `${r.topPct.toFixed(0)}% of your assets sit in ${r.topLabel.toLowerCase()}`, why: `That is a single-asset concentration. Your adviser can show how a fall of 10% there would move your net worth (${gbpCompact(totals().assets * (r.topPct / 100) * 0.1)}).` });
  if (r.cashPct > 5)
    q.push({ id: 'cash', title: `${gbpCompact(ACCOUNTS.filter((a) => a.cls === 'cash').reduce((s, a) => s + a.value, 0))} is held in cash`, why: 'Is that an emergency reserve, money earmarked for a goal, or simply uninvested? Each has a different answer.' });
  if (r.nonGbpPct > 15)
    q.push({ id: 'fx', title: `${r.nonGbpPct.toFixed(0)}% of your wealth is in euros or dollars`, why: 'Currency moves change your sterling net worth even when the assets themselves have not moved.' });
  q.push({ id: 'company', title: 'How is your Halden Studio stake valued, and how would you realise it?', why: 'Private company equity is hard to sell and hard to price. It is the least liquid 7% of what you own.' });
  return q;
};

export const STRUCTURE_EXPLAINERS: Record<Structure, { headline: string; body: string }> = {
  Personal: { headline: 'Held in your own name', body: 'Simple and flexible, but interest, dividends and gains may be taxable each year. Your adviser can show what applies to you.' },
  ISA: { headline: 'Tax-wrapped savings', body: 'Growth and income inside an ISA are free of UK tax. There is a yearly limit on how much can be paid in, and unused allowance cannot be carried forward.' },
  Pension: { headline: 'Locked away for later', body: 'Pensions get tax relief going in and grow free of tax, but generally cannot be touched until the minimum pension age. Much of what you take out is taxable, though part can usually be taken tax-free.' },
  Company: { headline: 'Owned through a business', body: 'Your stake is tied to how the company performs and is hard to sell quickly. Dividends and salary are taxed differently.' },
  Property: { headline: 'Bricks and mortar', body: 'Valued by estimate rather than live price. Rental income, costs, mortgage interest and any sale each have their own tax treatment.' },
};

export const structureTotals = () =>
  (Object.keys(STRUCTURE_EXPLAINERS) as Structure[])
    .map((st) => {
      const accts = ACCOUNTS.filter((a) => a.structure === st);
      return { structure: st, value: accts.reduce((s, a) => s + a.value, 0), accounts: accts };
    })
    .filter((x) => x.accounts.length)
    .sort((a, b) => b.value - a.value);

export { CLASS_META };
