// Sample (illustrative) wealth data. In production these come from the aggregation layer
// (open banking / custodian feeds) — the shapes below are what the UI consumes.
import { c } from '@/theme/tokens';

export type AssetClass = 'cash' | 'equities' | 'pension' | 'property' | 'private' | 'alts';

export const CLASS_META: Record<AssetClass, { label: string; color: string; blurb: string }> = {
  property: { label: 'Property', color: c.periwinkle, blurb: 'Homes and rental property, valued at market estimate.' },
  equities: { label: 'Investments', color: c.teal, blurb: 'ISAs, brokerage and funds across providers.' },
  pension: { label: 'Pensions', color: c.violet, blurb: 'Workplace and personal pensions.' },
  private: { label: 'Private business', color: c.amber, blurb: 'Equity in companies you own or hold a stake in.' },
  cash: { label: 'Cash', color: c.slate, blurb: 'Current, savings and private-bank cash.' },
  alts: { label: 'Alternatives', color: c.orange, blurb: 'Crypto, watches, art and other holdings.' },
};

export const CLASS_ORDER: AssetClass[] = ['property', 'equities', 'pension', 'private', 'cash', 'alts'];

export type Account = {
  id: string;
  institution: string;
  name: string;
  cls: AssetClass;
  value: number;
  /** ongoing annual cost as a % of value (funds, platform, advice) */
  feePct: number;
  /** 12-month change in value as a % (illustrative) */
  change1y: number;
  synced: string;
  /** how it is held — drives the plain-English "structures" explainers */
  structure: Structure;
  ccy: 'GBP' | 'EUR' | 'USD';
};

export type Structure = 'Personal' | 'ISA' | 'Pension' | 'Company' | 'Property';

const HELD: Record<string, { structure: Structure; ccy: 'GBP' | 'EUR' | 'USD' }> = {
  nh: { structure: 'Property', ccy: 'GBP' },
  lis: { structure: 'Property', ccy: 'EUR' },
  ibkr: { structure: 'Personal', ccy: 'USD' },
  hl: { structure: 'ISA', ccy: 'GBP' },
  vg: { structure: 'Pension', ccy: 'GBP' },
  av: { structure: 'Pension', ccy: 'GBP' },
  hs: { structure: 'Company', ccy: 'GBP' },
  cts: { structure: 'Personal', ccy: 'GBP' },
  bcl: { structure: 'Personal', ccy: 'GBP' },
  cb: { structure: 'Personal', ccy: 'USD' },
  wt: { structure: 'Personal', ccy: 'GBP' },
};

const RAW: Omit<Account, 'structure' | 'ccy'>[] = [
  { id: 'nh', institution: 'Property', name: 'Notting Hill home', cls: 'property', value: 1_650_000, feePct: 0, change1y: 3.1, synced: 'Valued 1 Oct' },
  { id: 'lis', institution: 'Property', name: 'Lisbon apartment', cls: 'property', value: 340_000, feePct: 0, change1y: 5.4, synced: 'Valued 1 Oct' },
  { id: 'ibkr', institution: 'Interactive Brokers', name: 'Global equities', cls: 'equities', value: 412_900, feePct: 0.18, change1y: 14.2, synced: 'Synced 2m ago' },
  { id: 'hl', institution: 'Hargreaves Lansdown', name: 'Stocks & Shares ISA', cls: 'equities', value: 186_400, feePct: 0.62, change1y: 9.8, synced: 'Synced 2m ago' },
  { id: 'vg', institution: 'Vanguard', name: 'Personal pension (SIPP)', cls: 'pension', value: 389_500, feePct: 0.29, change1y: 11.6, synced: 'Synced 14m ago' },
  { id: 'av', institution: 'Aviva', name: 'Workplace pension', cls: 'pension', value: 142_300, feePct: 0.74, change1y: 7.9, synced: 'Synced 1h ago' },
  { id: 'hs', institution: 'Halden Studio Ltd', name: '50% shareholding', cls: 'private', value: 280_000, feePct: 0, change1y: 22.0, synced: 'Updated by you' },
  { id: 'cts', institution: 'Coutts', name: 'Private bank savings', cls: 'cash', value: 212_000, feePct: 0, change1y: 3.9, synced: 'Synced 5m ago' },
  { id: 'bcl', institution: 'Barclays', name: 'Current account', cls: 'cash', value: 48_200, feePct: 0, change1y: 0, synced: 'Synced just now' },
  { id: 'cb', institution: 'Coinbase', name: 'Crypto', cls: 'alts', value: 38_900, feePct: 0.4, change1y: -6.3, synced: 'Synced 3m ago' },
  { id: 'wt', institution: 'Held privately', name: 'Watch collection', cls: 'alts', value: 64_000, feePct: 0, change1y: 8.0, synced: 'Valued 12 Aug' },
];

export const ACCOUNTS: Account[] = RAW.map((a) => ({ ...a, ...HELD[a.id] }));

export type Liability = { id: string; lender: string; name: string; value: number; rate: number };
export const LIABILITIES: Liability[] = [
  { id: 'm1', lender: 'Nationwide', name: 'Notting Hill mortgage', value: 612_000, rate: 4.19 },
  { id: 'm2', lender: 'Millennium BCP', name: 'Lisbon mortgage', value: 190_000, rate: 3.6 },
];

export const totals = () => {
  const assets = ACCOUNTS.reduce((s, a) => s + a.value, 0);
  const liabilities = LIABILITIES.reduce((s, l) => s + l.value, 0);
  return { assets, liabilities, net: assets - liabilities };
};

export const byClass = () =>
  CLASS_ORDER.map((cls) => {
    const accts = ACCOUNTS.filter((a) => a.cls === cls);
    return { cls, ...CLASS_META[cls], value: accts.reduce((s, a) => s + a.value, 0), accounts: accts };
  });

// Deterministic 365-day net worth history that ends exactly at today's net worth.
export const netWorthSeries = (): number[] => {
  const { net } = totals();
  const n = 366;
  const start = net * 0.905;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const trend = start + (net - start) * (t * 0.82 + 0.18 * t * t);
    const wobble =
      Math.sin(i / 9) * net * 0.0042 + Math.sin(i / 3.1) * net * 0.0018 + Math.sin(i / 31) * net * 0.0075;
    out.push(trend + wobble * (1 - t * 0.85));
  }
  out[n - 1] = net;
  return out;
};

export const RANGES = [
  { k: '1M', days: 30 },
  { k: '3M', days: 90 },
  { k: '6M', days: 180 },
  { k: '1Y', days: 365 },
] as const;

export type Goal = {
  id: string;
  name: string;
  target: number;
  current: number;
  by: number; // year
  color: string;
  note: string;
};

export const GOALS: Goal[] = [
  { id: 'mort', name: 'Mortgage-free Notting Hill', target: 612_000, current: 188_000, by: 2034, color: c.periwinkle, note: 'Cash and ISA earmarked to clear the balance.' },
  { id: 'edu', name: "Children's education", target: 180_000, current: 61_500, by: 2032, color: c.teal, note: 'Fees from age 11 across two children.' },
  { id: 'ret', name: 'Retire at 58 on £90k a year', target: 2_250_000, current: 531_800, by: 2041, color: c.violet, note: 'Pension pot needed at a 4% drawdown.' },
];

export const ADVISER = {
  title: 'Your Y-WLTH adviser',
  blurb: 'Independent, conflict-free guidance. No products to sell, no commission.',
};
