// Financial life forecast: wealth out to age 100, stress-tested.
// A simple, transparent yearly model on today's balances. Every assumption is listed in ASSUMPTIONS and shown
// to the user. It is an illustration, not a prediction and not advice.
import { ACCOUNTS, LIABILITIES, GOALS, type AssetClass } from '@/data/wealth';
import { costs } from '@/lib/insights';
import { liveFigures } from '@/lib/money';

export type Profile = { age: number; retireAge: number; retireIncome: number };
export const DEFAULT_PROFILE: Profile = { age: 42, retireAge: 58, retireIncome: 90_000 };

export type Stress = { inflation: boolean; tax: boolean; fees: boolean; shock: boolean };
export const NO_STRESS: Stress = { inflation: false, tax: false, fees: false, shock: false };
export const ALL_STRESS: Stress = { inflation: true, tax: true, fees: true, shock: true };

const RET: Record<AssetClass, number> = { equities: 0.065, pension: 0.06, private: 0.07, cash: 0.035, alts: 0.05, property: 0.035 };
const BASE_INFL = 0.025;
const SPIKE_INFL = 0.05; // first ten years, then 3%
const TAX_DRAG = 0.006;
const EXTRA_FEE = 0.005;
const SHOCK = 0.35;
const SAVE_SHARE = 0.6; // share of monthly surplus put toward goals (same as the Plan tab)
const MORTGAGE_YEARS = 15;

export const ASSUMPTIONS: [string, string][] = [
  ['Growth', 'Equities 6.5%, pensions 6%, private business 7%, cash 3.5%, alternatives 5%, property 3.5% a year, before costs'],
  ['Inflation', '2.5% a year. Stress: 5% for ten years, then 3%'],
  ['Fees', `Your provider costs and the Y-WLTH advice fee (${costs().total.toLocaleString('en-GB', { maximumFractionDigits: 0 })} a year in total). Stress: 0.5% more`],
  ['Tax', 'Stress: 0.6% a year drag on investment returns (illustrative, not tax advice)'],
  ['Market shock', 'A 35% fall in investments in the year you retire'],
  ['Saving', "60% of your monthly surplus is invested until you retire, rising with inflation"],
  ['Spending', 'Your retirement income, rising with inflation, drawn from investments'],
  ['Property', 'Grows 3.5% a year. Mortgages are repaid over 15 years. Not sold or drawn on'],
];

export type Forecast = {
  ages: number[];
  /** net worth in future money */
  nominal: number[];
  /** net worth in today's money */
  real: number[];
  investable: number[];
  /** first age investments hit zero, if they do */
  runsOutAge: number | null;
};

const split = () => {
  const cls = (k: AssetClass) => ACCOUNTS.filter((a) => a.cls === k).reduce((s, a) => s + a.value, 0);
  const inv = (['cash', 'equities', 'pension', 'private', 'alts'] as AssetClass[]).map((k) => ({ k, v: cls(k) }));
  const investable = inv.reduce((s, x) => s + x.v, 0);
  const ret = inv.reduce((s, x) => s + (x.v / investable) * RET[x.k], 0);
  return { investable, ret, property: cls('property'), mortgage: LIABILITIES.reduce((s, l) => s + l.value, 0) };
};

export function forecast(p: Profile, stress: Stress): Forecast {
  const { investable: inv0, ret, property, mortgage } = split();
  const feeDrag = costs().total / inv0;
  const surplus = liveFigures('total').left * 12 * SAVE_SHARE;
  const years = Math.max(0, 100 - p.age);
  let inv = inv0, prop = property, price = 1;
  const out: Forecast = { ages: [], nominal: [], real: [], investable: [], runsOutAge: null };

  for (let y = 0; y <= years; y++) {
    const age = p.age + y;
    const nominal = inv + prop - Math.max(0, mortgage * (1 - y / MORTGAGE_YEARS));
    out.ages.push(age); out.nominal.push(nominal); out.real.push(nominal / price); out.investable.push(inv);
    if (y === years) break;

    const infl = stress.inflation ? (y < 10 ? SPIKE_INFL : 0.03) : BASE_INFL;
    const r = ret - feeDrag - (stress.fees ? EXTRA_FEE : 0) - (stress.tax ? TAX_DRAG : 0);
    price *= 1 + infl;
    inv *= 1 + r;
    if (stress.shock && age + 1 === p.retireAge) inv *= 1 - SHOCK;
    if (age < p.retireAge) inv += surplus * price;
    else inv -= p.retireIncome * price;
    if (inv <= 0) { inv = 0; if (out.runsOutAge === null) out.runsOutAge = age + 1; }
    prop *= 1 + RET.property;
  }
  return out;
}

export const atAge = (f: Forecast, age: number, real = true) => {
  const i = Math.min(f.ages.length - 1, Math.max(0, age - f.ages[0]));
  return (real ? f.real : f.nominal)[i];
};

export const firstAgeReaching = (f: Forecast, target: number, real = true) => {
  const arr = real ? f.real : f.nominal;
  const i = arr.findIndex((v) => v >= target);
  return i < 0 ? null : f.ages[i];
};

export const goalHint = () => GOALS.find((g) => g.id === 'ret');
