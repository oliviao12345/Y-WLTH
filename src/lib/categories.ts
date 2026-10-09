// Plain categories for money in and money out, so the view shows five things, not twenty lines.
import { c, gbp } from '@/theme/tokens';
import type { Scope } from '@/lib/money';

export type Dir = 'in' | 'out';
export type Cat = { key: string; label: string; color: string; hint: string; groups: string[]; scopes: Scope[] };

export const CATS: Record<Dir, Cat[]> = {
  out: [
    { key: 'housing', label: 'Housing', color: c.periwinkle, hint: 'Mortgages, bills, insurance and property management', groups: ['Mortgage', 'Bills', 'Insurance', 'Management'], scopes: ['total', 'property'] },
    { key: 'living', label: 'Living', color: c.orange, hint: 'Household, travel and leisure', groups: ['Living', 'Lifestyle'], scopes: ['total'] },
    { key: 'education', label: 'Education', color: c.amber, hint: 'School fees', groups: ['Education'], scopes: ['total'] },
    { key: 'fees', label: 'Fees', color: c.violet, hint: 'Y-WLTH advice fee and your providers’ charges', groups: ['Fees'], scopes: ['total', 'investments'] },
  ],
  in: [
    { key: 'earned', label: 'Earned income', color: c.teal, hint: 'Salary and director’s pay, after tax', groups: ['Salary', "Director's pay · Halden Studio"], scopes: ['total'] },
    { key: 'rent', label: 'Rent', color: c.periwinkle, hint: 'Rental income', groups: ['Rental income'], scopes: ['total', 'property'] },
    { key: 'invest', label: 'Investment income', color: c.violet, hint: 'Dividends and interest', groups: ['Dividends', 'Savings interest', 'ISA dividends'], scopes: ['total', 'investments'] },
  ],
};

export type CatTotal = Cat & { total: number; items: { name: string; value: number }[] };

/** Group a month's figures into categories, biggest first. */
export function categorise(groups: Record<string, number>, dir: Dir, scope: Scope): CatTotal[] {
  return CATS[dir]
    .filter((cat) => cat.scopes.includes(scope))
    .map((cat) => {
      const items = cat.groups.filter((g) => (groups[g] ?? 0) > 0).map((g) => ({ name: g, value: groups[g] }));
      return { ...cat, items, total: items.reduce((s, x) => s + x.value, 0) };
    })
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total);
}

/** A sentence that says what matters, not a list of figures. */
export function insightFor(now: CatTotal[], prev: CatTotal[] | null, dir: Dir): { headline: string; sub?: string } {
  const total = now.reduce((s, x) => s + x.total, 0);
  if (!now.length || total <= 0) return { headline: 'Nothing here yet' };
  const top = now[0];
  const share = Math.round((top.total / total) * 100);
  const verb = (l: string) => (l.endsWith('s') ? 'are' : 'is');
  const headline = dir === 'out'
    ? `${top.label} ${verb(top.label)} the biggest part of what goes out: ${share}p in every £1.`
    : `${top.label} makes up ${share}p of every £1 that comes in.`;
  let sub: string | undefined;
  if (prev) {
    const moves = now.map((x) => ({ x, d: x.total - (prev.find((p) => p.key === x.key)?.total ?? 0) })).filter((m) => Math.abs(m.d) >= 50).sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
    if (moves[0]) {
      const m = moves[0];
      sub = `${m.x.label} ${verb(m.x.label)} ${m.d > 0 ? 'up' : 'down'} ${gbp(Math.abs(m.d))} on last month.`;
    }
  }
  return { headline, sub };
}
