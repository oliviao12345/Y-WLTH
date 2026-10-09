// Money Insights engine — logic ported from NUO Life (MONEY_INSIGHTS.md), reshaped for wealth management.
// Principles kept: estimates not advice, everything traceable, past months are saved snapshots,
// projection = months gone (as saved) + this month and the rest at today's figures, tax left out
// of every figure. Scopes follow where wealth earns and costs money: Total / Property / Investments.

import { ywlthFeeAnnual } from '@/data/fees';

export type Every = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'once';
/** earned = pay and living costs · property = rent, mortgages, running costs · investments = yield and fees */
export type Domain = 'earned' | 'property' | 'investments';

export type Entry = {
  id: string;
  name: string;
  kind: 'income' | 'cost';
  domain: Domain;
  amount: number;
  every: Every;
  /** cost group, e.g. Mortgage / Bills / Living */
  group?: string;
  /** property or account id */
  owner?: string;
  /** tax payments are listed but excluded from every figure */
  tax?: boolean;
  /** income that varies: last logged months, newest last */
  log?: number[];
};

export type Owner = { id: string; name: string; domain: 'property' | 'investments' };

export const OWNERS: Owner[] = [
  { id: 'nh', name: 'Notting Hill', domain: 'property' },
  { id: 'lis', name: 'Lisbon', domain: 'property' },
  { id: 'ibkr', name: 'Interactive Brokers', domain: 'investments' },
  { id: 'hl', name: 'Hargreaves Lansdown', domain: 'investments' },
  { id: 'cts', name: 'Coutts', domain: 'investments' },
];

export const ENTRIES: Entry[] = [
  // Earned income — take-home, after tax
  { id: 'e1', name: 'Salary', kind: 'income', domain: 'earned', amount: 13_400, every: 'monthly' },
  { id: 'e2', name: "Director's pay · Halden Studio", kind: 'income', domain: 'earned', amount: 3_500, every: 'monthly' },
  // Living costs
  { id: 'l1', name: 'Household & lifestyle', kind: 'cost', domain: 'earned', amount: 4_800, every: 'monthly', group: 'Living' },
  { id: 'l2', name: 'School fees', kind: 'cost', domain: 'earned', amount: 2_900, every: 'monthly', group: 'Education' },
  { id: 'l3', name: 'Travel & leisure', kind: 'cost', domain: 'earned', amount: 1_200, every: 'monthly', group: 'Lifestyle' },
  // Property
  { id: 'p1', name: 'Rental income', kind: 'income', domain: 'property', amount: 2_150, every: 'monthly', owner: 'lis' },
  { id: 'p2', name: 'Mortgage', kind: 'cost', domain: 'property', amount: 3_420, every: 'monthly', group: 'Mortgage', owner: 'nh' },
  { id: 'p3', name: 'Council tax', kind: 'cost', domain: 'property', amount: 262, every: 'monthly', group: 'Bills', owner: 'nh' },
  { id: 'p4', name: 'Energy', kind: 'cost', domain: 'property', amount: 214, every: 'monthly', group: 'Bills', owner: 'nh' },
  { id: 'p5', name: 'Buildings & contents', kind: 'cost', domain: 'property', amount: 1_260, every: 'yearly', group: 'Insurance', owner: 'nh' },
  { id: 'p6', name: 'Mortgage', kind: 'cost', domain: 'property', amount: 1_180, every: 'monthly', group: 'Mortgage', owner: 'lis' },
  { id: 'p7', name: 'Condominium & IMI', kind: 'cost', domain: 'property', amount: 140, every: 'monthly', group: 'Bills', owner: 'lis' },
  { id: 'p8', name: 'Lettings management', kind: 'cost', domain: 'property', amount: 215, every: 'monthly', group: 'Management', owner: 'lis' },
  // Investments
  { id: 'i1', name: 'Dividends', kind: 'income', domain: 'investments', amount: 1_150, every: 'monthly', owner: 'ibkr', log: [980, 1_240, 1_310] },
  { id: 'i2', name: 'Savings interest', kind: 'income', domain: 'investments', amount: 689, every: 'monthly', owner: 'cts' },
  { id: 'i3', name: 'ISA dividends', kind: 'income', domain: 'investments', amount: 280, every: 'monthly', owner: 'hl' },
  { id: 'i4', name: 'Platform & fund fees', kind: 'cost', domain: 'investments', amount: 4_237, every: 'yearly', group: 'Fees', owner: 'ibkr' },
  { id: 'i5', name: 'Y-WLTH advice fee', kind: 'cost', domain: 'investments', amount: ywlthFeeAnnual(), every: 'yearly', group: 'Fees' },
  // Tax: listed, never counted
  { id: 't1', name: 'Self Assessment payment on account', kind: 'cost', domain: 'earned', amount: 12_000, every: 'yearly', group: 'Tax', tax: true },
];

export const perMonth = (amount: number, every: Every): number => {
  switch (every) {
    case 'weekly': return (amount * 52) / 12;
    case 'monthly': return amount;
    case 'quarterly': return amount / 3;
    case 'yearly': return amount / 12;
    case 'once': return 0;
  }
};

/** Varying pay/revenue uses the average of the last three logged months. */
export const entryMonthly = (e: Entry): number => {
  if (e.log && e.log.length) {
    const last = e.log.slice(-3);
    return last.reduce((s, n) => s + n, 0) / last.length;
  }
  return perMonth(e.amount, e.every);
};

export const countsInTotal = (e: Entry) => !e.tax;

export type Scope = 'total' | 'property' | 'investments';
export type Rows = { earned: number; propIn: number; invIn: number; living: number; propOut: number; invOut: number };
export type Figures = {
  income: number;
  expenses: number;
  left: number;
  rows: Rows;
  groups: Record<string, number>;
  /** each contributing line, for the "How it's calculated" sheet */
  lines: { id: string; name: string; from: string; kind: 'income' | 'cost'; value: number; group?: string }[];
};

const ownerName = (id?: string) => OWNERS.find((o) => o.id === id)?.name;

export const liveFigures = (scope: Scope, ownerId?: string): Figures => {
  const rows: Rows = { earned: 0, propIn: 0, invIn: 0, living: 0, propOut: 0, invOut: 0 };
  const groups: Record<string, number> = {};
  const lines: Figures['lines'] = [];
  const withEarned = scope === 'total';
  const withProp = scope === 'total' || scope === 'property';
  const withInv = scope === 'total' || scope === 'investments';

  for (const e of ENTRIES) {
    if (!countsInTotal(e)) continue;
    if (e.domain === 'earned' && !withEarned) continue;
    if (e.domain === 'property' && !withProp) continue;
    if (e.domain === 'investments' && !withInv) continue;
    if (ownerId && e.domain !== 'earned' && e.owner !== ownerId) continue;
    const v = entryMonthly(e);
    if (v === 0) continue;
    if (e.domain === 'earned') (e.kind === 'income' ? (rows.earned += v) : (rows.living += v));
    else if (e.domain === 'property') (e.kind === 'income' ? (rows.propIn += v) : (rows.propOut += v));
    else (e.kind === 'income' ? (rows.invIn += v) : (rows.invOut += v));
    if (e.kind === 'cost') groups[e.group ?? 'Other'] = (groups[e.group ?? 'Other'] ?? 0) + v;
    else groups[e.name] = (groups[e.name] ?? 0) + v;
    const where = e.domain === 'earned' ? (e.kind === 'income' ? 'Earned income' : 'Living costs') : `${e.domain === 'property' ? 'Property' : 'Investments'} › ${ownerName(e.owner) ?? (e.group === 'Fees' ? 'Advice fee' : '')}`;
    lines.push({ id: e.id, name: e.name, from: where, kind: e.kind, value: v, group: e.group });
  }
  const income = rows.earned + rows.propIn + rows.invIn;
  const expenses = rows.living + rows.propOut + rows.invOut;
  return { income, expenses, left: income - expenses, rows, groups, lines };
};

export const taxEntries = () =>
  ENTRIES.filter((e) => e.tax).map((e) => ({ ...e, where: 'Living costs › Tax and filings' }));

// ---------- snapshots (saved past months) ----------
export type MonthKey = string; // YYYY-MM
export type Snap = { rows: Rows; groups: Record<string, number> };

export const monthKey = (d: Date): MonthKey => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
export const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
export const monthLabel = (k: MonthKey, short = false) => {
  const [y, m] = k.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: short ? 'short' : 'long', year: 'numeric' });
};

/** 14 months of sample snapshots: income climbing, costs easing — same shape as NUO's sampleHistory. */
export const sampleHistory = (now = new Date()): Record<MonthKey, Snap> => {
  const live = liveFigures('total');
  const out: Record<MonthKey, Snap> = {};
  for (let back = 1; back <= 14; back++) {
    const k = monthKey(addMonths(now, -back));
    const drift = Math.sin(back * 1.7) * 0.012;
    const ease = 1 + back * 0.0065 + Math.cos(back * 1.3) * 0.006;
    const r = live.rows;
    out[k] = {
      rows: {
        earned: r.earned * (1 - back * 0.006),
        propIn: r.propIn * (back > 9 ? 0.86 : 1),
        invIn: r.invIn * (1 - back * 0.014 + drift),
        living: r.living * (1 - back * 0.005),
        propOut: r.propOut * ease,
        invOut: r.invOut * (1 + back * 0.01),
      },
      groups: Object.fromEntries(
        Object.entries(live.groups).map(([g, v]) => [g, v * (g === 'Bills' || g === 'Insurance' ? ease * 1.02 : g === 'Living' || g === 'Lifestyle' ? 1 - back * 0.005 : g === 'Fees' ? 1 + back * 0.01 : 1)]),
      ),
    };
  }
  return out;
};

const filterRows = (rows: Rows, scope: Scope): Figures => {
  const r: Rows = {
    earned: scope === 'total' ? rows.earned : 0,
    living: scope === 'total' ? rows.living : 0,
    propIn: scope !== 'investments' ? rows.propIn : 0,
    propOut: scope !== 'investments' ? rows.propOut : 0,
    invIn: scope !== 'property' ? rows.invIn : 0,
    invOut: scope !== 'property' ? rows.invOut : 0,
  };
  const income = r.earned + r.propIn + r.invIn;
  const expenses = r.living + r.propOut + r.invOut;
  return { income, expenses, left: income - expenses, rows: r, groups: {}, lines: [] };
};

export const figuresFor = (k: MonthKey, scope: Scope, hist: Record<MonthKey, Snap>, now = new Date(), ownerId?: string): Figures => {
  if (k === monthKey(now) || !hist[k]) return liveFigures(scope, ownerId);
  const f = filterRows(hist[k].rows, scope);
  return { ...f, groups: hist[k].groups };
};

export type Projection = {
  income: number;
  expenses: number;
  left: number;
  ytdLeft: number;
  gone: { income: number; expenses: number; months: number };
  rest: { income: number; expenses: number; months: number };
};

/** Months gone use what was saved; this month and the rest of the year use today's figures. */
export const projection = (scope: Scope, hist: Record<MonthKey, Snap>, now = new Date(), year = now.getFullYear()): Projection => {
  const live = liveFigures(scope);
  let gi = 0, ge = 0, gm = 0, ri = 0, re = 0, rm = 0;
  for (let m = 0; m < 12; m++) {
    const k = monthKey(new Date(year, m, 1));
    const isPast = year < now.getFullYear() || (year === now.getFullYear() && m < now.getMonth());
    if (isPast && hist[k]) {
      const f = filterRows(hist[k].rows, scope);
      gi += f.income; ge += f.expenses; gm++;
    } else if (isPast) {
      gi += live.income; ge += live.expenses; gm++;
    } else {
      ri += live.income; re += live.expenses; rm++;
    }
  }
  const ytd = gi - ge + (live.income - live.expenses);
  return { income: gi + ri, expenses: ge + re, left: gi + ri - ge - re, ytdLeft: ytd, gone: { income: gi, expenses: ge, months: gm }, rest: { income: ri, expenses: re, months: rm } };
};

// ---------- compare with earlier ----------
export type CompareMode = 'year' | 'last' | '6m';
export type CompareRow = { label: string; now: number; then: number; delta: number; better: boolean; pct: number | null };

export const referenceMonth = (mode: CompareMode, hist: Record<MonthKey, Snap>, now = new Date()): { key: MonthKey; label: string } | null => {
  const want = mode === 'last' ? 1 : mode === '6m' ? 6 : 12;
  const exact = monthKey(addMonths(now, -want));
  if (hist[exact]) return { key: exact, label: mode === 'year' ? 'a year ago' : mode === 'last' ? 'last month' : '6 months ago' };
  if (mode === 'year') {
    const keys = Object.keys(hist).sort().filter((k) => k <= monthKey(addMonths(now, -2)));
    if (keys.length) return { key: keys[0], label: monthLabel(keys[0]) };
  }
  return null;
};

export const compare = (scope: Scope, mode: CompareMode, hist: Record<MonthKey, Snap>, now = new Date()) => {
  const ref = referenceMonth(mode, hist, now);
  if (!ref) return null;
  const a = liveFigures(scope).rows;
  const b = filterRows(hist[ref.key].rows, scope).rows;
  const defs: [string, keyof Rows, boolean][] = [
    ['Earned income', 'earned', true],
    ['Rental income', 'propIn', true],
    ['Investment income', 'invIn', true],
    ['Living costs', 'living', false],
    ['Property costs', 'propOut', false],
    ['Investment fees', 'invOut', false],
  ];
  const rows: CompareRow[] = defs
    .filter(([, k]) => (a[k] !== 0 || b[k] !== 0))
    .map(([label, k, upIsGood]) => {
      const delta = a[k] - b[k];
      return { label, now: a[k], then: b[k], delta, better: upIsGood ? delta >= 0 : delta <= 0, pct: b[k] ? (delta / b[k]) * 100 : null };
    });
  const live = liveFigures(scope).groups;
  const then = hist[ref.key].groups;
  const names = new Set([...Object.keys(live), ...Object.keys(then)]);
  const moved = [...names]
    .map((g) => ({ group: g, delta: (live[g] ?? 0) - (then[g] ?? 0) }))
    .filter((m) => Math.abs(m.delta) >= 1)
    .sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta))
    .slice(0, 5);
  const totalMove = moved.reduce((s, m) => s + Math.abs(m.delta), 0) || 1;
  return { ref, rows, moved: moved.map((m) => ({ ...m, share: (Math.abs(m.delta) / totalMove) * 100 })) };
};

// ---------- pie slices ----------
export const SLICE_COLORS = {
  earned: '#39D98A',
  property: '#6C8BFF',
  invest: '#A66BDB',
  living: '#FFA24C',
  propCost: '#FF6FA8',
  invCost: '#FFD36B',
};

export type Slice = { label: string; value: number; color: string; from: string };

export const slices = (f: Figures, dir: 'in' | 'out'): Slice[] => {
  const out: Slice[] = [];
  for (const l of f.lines) {
    const prop = l.from.startsWith('Property');
    const inv = l.from.startsWith('Investments');
    if (dir === 'in' && l.kind === 'income')
      out.push({ label: l.name, value: l.value, from: l.from, color: prop ? SLICE_COLORS.property : inv ? SLICE_COLORS.invest : SLICE_COLORS.earned });
    if (dir === 'out' && l.kind === 'cost')
      out.push({ label: l.name, value: l.value, from: l.from, color: prop ? SLICE_COLORS.propCost : inv ? SLICE_COLORS.invCost : SLICE_COLORS.living });
  }
  return out.sort((a, b) => b.value - a.value);
};

export const PAST_SLICE_GROUP = (f: Figures, dir: 'in' | 'out'): Slice[] => {
  const r = f.rows;
  const raw: [string, number, string][] =
    dir === 'in'
      ? [['Earned income', r.earned, SLICE_COLORS.earned], ['Rental income', r.propIn, SLICE_COLORS.property], ['Investment income', r.invIn, SLICE_COLORS.invest]]
      : [['Living costs', r.living, SLICE_COLORS.living], ['Property costs', r.propOut, SLICE_COLORS.propCost], ['Investment fees', r.invOut, SLICE_COLORS.invCost]];
  return raw.filter(([, v]) => v > 0).map(([label, value, color]) => ({ label, value, color, from: 'Saved month total' }));
};
