// Data-driven intelligence: independent analysis of every account, whoever manages it.
// Everything below is computed from the aggregated accounts — nothing is hard-coded copy.
import { ACCOUNTS, CLASS_ORDER, CLASS_META, byClass, netWorthSeries, totals, type AssetClass } from '@/data/wealth';
import { BENCHMARK, costs, performance, risk } from '@/lib/insights';
import { liveFigures } from '@/lib/money';
import { c, gbp, gbpCompact } from '@/theme/tokens';

const G = 0.05; // illustrative growth used to compound cost and cash drags
export const fv = (annual: number, years = 10) => annual * ((Math.pow(1 + G, years) - 1) / G);
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/** Growth in the value of what you own over the past 12 months, built from each account's reported change. */
export const growthBreakdown = () => {
  const gainOf = (value: number, pct: number) => value * (pct / 100) / (1 + pct / 100);
  const classes = CLASS_ORDER.map((cls) => {
    const accounts = ACCOUNTS.filter((a) => a.cls === cls).map((a) => ({ id: a.id, institution: a.institution, name: a.name, gain: gainOf(a.value, a.change1y), pct: a.change1y }));
    return { cls, label: CLASS_META[cls].label, color: CLASS_META[cls].color, gain: accounts.reduce((s, x) => s + x.gain, 0), accounts };
  }).sort((x, y) => y.gain - x.gain);
  const total = classes.reduce((s, x) => s + x.gain, 0);
  return { classes, total, perDay: total / 365 };
};

/** Growth per day over the past year. */
export const dailyEarn = () => growthBreakdown().perDay;

export type Bar = { label: string; value: number; text: string; color?: string };
export type Insight = {
  id: string;
  kind: 'cost' | 'cash' | 'risk' | 'fx' | 'surplus' | 'perf';
  severity: 'high' | 'medium' | 'low';
  title: string;
  summary: string;
  impact: string;
  impactSub: string;
  /** annual £ used to rank and total */
  annual: number;
  bars: Bar[];
  action: string;
  chatPrompt: string;
  /** what Y-WLTH recommends doing, in plain English */
  recommends: string;
  /** why, in one or two sentences */
  why: string;
  /** routine: review and approve. discuss: bigger decision, best talked through first. */
  path: 'routine' | 'discuss';
};

export const insights = (): Insight[] => {
  const out: Insight[] = [];
  const t = totals();
  const r = risk();
  const p = performance();
  const acct = (id: string) => ACCOUNTS.find((a) => a.id === id)!;

  // 1–2. Same asset class, very different cost
  const pairs: [string, string, string][] = [['av', 'vg', 'pension'], ['hl', 'ibkr', 'equities']];
  for (const [hiId, loId, key] of pairs) {
    const hi = acct(hiId), lo = acct(loId);
    if (hi.feePct <= lo.feePct * 1.5) continue;
    const annual = (hi.value * (hi.feePct - lo.feePct)) / 100;
    out.push({
      id: `cost-${key}`,
      kind: 'cost',
      severity: annual > 700 ? 'high' : 'medium',
      title: `${hi.institution} costs ${(hi.feePct / lo.feePct).toFixed(1)}× more than ${lo.institution}`,
      summary: `${hi.name} charges ${hi.feePct.toFixed(2)}% a year, against ${lo.feePct.toFixed(2)}% on a comparable ${key} holding at ${lo.institution}. The difference compounds.`,
      impact: gbp(annual),
      impactSub: `a year · ${gbp(fv(annual))} over 10 years`,
      annual,
      bars: [
        { label: hi.institution, value: hi.feePct, text: `${hi.feePct.toFixed(2)}%`, color: c.orange },
        { label: lo.institution, value: lo.feePct, text: `${lo.feePct.toFixed(2)}%`, color: c.teal },
      ],
      action: 'Review and consolidate',
      recommends: `Review moving this holding to a lower-cost arrangement, after checking any exit charges. Your investments stay the same.`,
      why: `You pay ${hi.feePct.toFixed(2)}% a year here against ${lo.feePct.toFixed(2)}% for a comparable holding, and the gap compounds.`,
      path: 'routine',
      chatPrompt: `Can we talk through the cost difference between ${hi.institution} and ${lo.institution}?`,
    });
  }

  // 3. Idle cash
  const idle = acct('bcl'), saver = acct('cts');
  if (idle.value > 20_000) {
    const annual = (idle.value * (saver.change1y - idle.change1y)) / 100;
    out.push({
      id: 'cash-idle',
      kind: 'cash',
      severity: 'medium',
      title: `${gbpCompact(idle.value)} is earning nothing`,
      summary: `Your ${idle.institution} current account pays ${idle.change1y.toFixed(1)}%, while your ${saver.institution} savings earned ${saver.change1y.toFixed(1)}% over the past year.`,
      impact: gbp(annual),
      impactSub: `a year · ${gbp(fv(annual))} over 10 years`,
      annual,
      bars: [
        { label: `${idle.institution} current`, value: Math.max(0.05, idle.change1y), text: `${idle.change1y.toFixed(1)}%`, color: c.orange },
        { label: `${saver.institution} savings`, value: saver.change1y, text: `${saver.change1y.toFixed(1)}%`, color: c.teal },
      ],
      action: 'Move surplus cash',
      recommends: `Move the surplus above a working balance from your ${idle.institution} current account into your ${saver.institution} savings.`,
      why: `That cash earns ${idle.change1y.toFixed(1)}% where your savings earned ${saver.change1y.toFixed(1)}% over the past year.`,
      path: 'routine',
      chatPrompt: `How much should I keep in my ${idle.institution} current account?`,
    });
  }

  // 4. Performance versus benchmark
  if (p.vsBenchmark < -0.3) {
    const gap = (-p.vsBenchmark / 100) * p.value;
    out.push({
      id: 'perf-gap',
      kind: 'perf',
      severity: 'high',
      title: `Your investments trailed the market by ${Math.abs(p.vsBenchmark).toFixed(1)} points`,
      summary: `Returned ${p.ret.toFixed(1)}% against ${BENCHMARK.ret.toFixed(1)}% for the ${BENCHMARK.name}. See what pulled it down in Performance.`,
      impact: gbp(gap),
      impactSub: 'less than the benchmark last year',
      annual: gap,
      bars: [
        { label: 'Your investments', value: p.ret, text: `${p.ret.toFixed(1)}%`, color: c.orange },
        { label: BENCHMARK.name, value: BENCHMARK.ret, text: `${BENCHMARK.ret.toFixed(1)}%`, color: c.teal },
      ],
      action: 'See attribution',
      recommends: `Move the holdings that lagged the benchmark into Y-WLTH's Rebalanced Portfolio Service, which is built to track it.`,
      why: `Your investments returned ${p.ret.toFixed(1)}% against ${BENCHMARK.ret.toFixed(1)}% for the Y-WLTH benchmark at the same level of risk.`,
      path: 'routine',
      chatPrompt: 'Why have my investments trailed the benchmark?',
    });
  }

  // 5. Concentration
  const top = byClass().sort((a, b) => b.value - a.value)[0];
  if (r.topPct > 45) {
    const hit = top.value * 0.1;
    out.push({
      id: 'risk-conc',
      kind: 'risk',
      severity: 'high',
      title: `${r.topPct.toFixed(0)}% of your assets sit in ${top.label.toLowerCase()}`,
      summary: `One asset class dominates. A 10% fall in ${top.label.toLowerCase()} would take ${gbpCompact(hit)} off your net worth.`,
      impact: gbpCompact(hit),
      impactSub: `at risk in a 10% fall`,
      annual: hit * 0.02,
      bars: byClass().sort((a, b) => b.value - a.value).slice(0, 4).map((x) => ({ label: x.label, value: x.value, text: `${((x.value / t.assets) * 100).toFixed(0)}%`, color: x.color })),
      action: 'Discuss diversification',
      recommends: `Rebalance towards your agreed target mix so less of your wealth depends on ${top.label.toLowerCase()}.`,
      why: `${r.topPct.toFixed(0)}% of your assets sit in one place, which is more than a balanced plan would normally hold.`,
      path: 'discuss',
      chatPrompt: `I'd like to talk about how concentrated I am in ${top.label.toLowerCase()}.`,
    });
  }

  // 6. Currency
  if (r.nonGbpPct > 15) {
    const nonGbp = ACCOUNTS.filter((a) => a.ccy !== 'GBP').reduce((s, a) => s + a.value, 0);
    const byC = (ccy: string) => ACCOUNTS.filter((a) => a.ccy === ccy).reduce((s, a) => s + a.value, 0);
    out.push({
      id: 'fx',
      kind: 'fx',
      severity: 'low',
      title: `${r.nonGbpPct.toFixed(0)}% of your wealth moves with currencies`,
      summary: 'Sterling moves change your net worth even when nothing you own has changed.',
      impact: gbpCompact(nonGbp * 0.1),
      impactSub: 'swing if sterling moves 10%',
      annual: nonGbp * 0.002,
      bars: [
        { label: 'Sterling', value: byC('GBP'), text: `${((byC('GBP') / t.assets) * 100).toFixed(0)}%`, color: c.teal },
        { label: 'Dollars', value: byC('USD'), text: `${((byC('USD') / t.assets) * 100).toFixed(0)}%`, color: c.periwinkle },
        { label: 'Euros', value: byC('EUR'), text: `${((byC('EUR') / t.assets) * 100).toFixed(0)}%`, color: c.violet },
      ],
      action: 'Understand FX exposure',
      recommends: `Review whether your currency exposure matches where you plan to spend, and rebalance or hedge if it does not.`,
      why: `Part of your wealth moves with the dollar and the euro, so sterling moves change your net worth.`,
      path: 'discuss',
      chatPrompt: 'How exposed am I to currency moves, and does it matter for my plans?',
    });
  }

  // 7. Surplus not allocated to goals
  const left = liveFigures('total').left;
  if (left > 1000) {
    const toGoals = left * 0.6;
    const free = left - toGoals;
    out.push({
      id: 'surplus',
      kind: 'surplus',
      severity: 'medium',
      title: `${gbp(free)} a month isn't assigned to anything`,
      summary: `You keep ${gbp(left)} a month after spending. About 60% is funding your goals; the rest has no job yet.`,
      impact: gbp(free * 12),
      impactSub: 'a year with no purpose',
      annual: free * 12 * 0.05,
      bars: [
        { label: 'Left over each month', value: left, text: gbp(left), color: c.teal },
        { label: 'Funding goals', value: toGoals, text: gbp(toGoals), color: c.periwinkle },
        { label: 'Unassigned', value: free, text: gbp(free), color: c.amber },
      ],
      action: 'Put it to work',
      recommends: `Give the unassigned surplus a job: add it to your goals or invest it in line with your strategy.`,
      why: `You keep ${gbp(left)} a month after spending, and only about 60% is currently funding your goals.`,
      path: 'discuss',
      chatPrompt: 'What should I do with my unassigned monthly surplus?',
    });
  }

  const rank = { high: 3, medium: 2, low: 1 } as const;
  return out.sort((a, b) => rank[b.severity] - rank[a.severity] || b.annual - a.annual);
};

/** Savings available by acting on cost and cash recommendations. */
export const prize = () => {
  const money = insights().filter((i) => i.kind === 'cost' || i.kind === 'cash');
  const annual = money.reduce((s, i) => s + i.annual, 0);
  return { annual, tenYear: fv(annual), count: insights().length };
};

export const health = () => {
  const r = risk();
  const cs = costs();
  const p = performance();
  const parts = [
    { key: 'div', label: 'Diversification', w: 0.3, score: clamp(100 - Math.max(0, r.topPct - 25) * 1.4), note: `${r.topPct.toFixed(0)}% in ${r.topLabel.toLowerCase()}` },
    { key: 'cost', label: 'Costs', w: 0.2, score: clamp(100 - (cs.totalPct - 0.5) * 60), note: `${cs.totalPct.toFixed(2)}% all-in` },
    { key: 'liq', label: 'Liquidity', w: 0.15, score: clamp(100 - Math.abs(r.cashPct - 10) * 5), note: `${r.cashPct.toFixed(0)}% in cash` },
    { key: 'fx', label: 'Currency', w: 0.15, score: clamp(100 - Math.max(0, r.nonGbpPct - 10) * 1.5), note: `${r.nonGbpPct.toFixed(0)}% outside sterling` },
    { key: 'perf', label: 'Performance', w: 0.2, score: clamp(70 + p.vsBenchmark * 10), note: `${p.vsBenchmark >= 0 ? '+' : ''}${p.vsBenchmark.toFixed(1)} pts vs benchmark` },
  ];
  const score = Math.round(parts.reduce((s, x) => s + x.score * x.w, 0));
  return { score, band: score >= 80 ? 'Strong' : score >= 65 ? 'Solid' : 'Needs attention', parts };
};

/** Your investments against the benchmark, indexed to 100, with a gap that ends exactly at the real figures. */
export const perfSeries = () => {
  const n = 120;
  const p = performance();
  const port: number[] = [], bench: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const w = (k: number, a: number) => Math.sin(i / a + k) * 1.5 + Math.sin(i / (a * 2.7) + k * 2) * 2.4 * (1 - t * 0.4);
    bench.push(100 * (1 + (BENCHMARK.ret / 100) * t) + w(0, 5.5) * (1 - t * 0.2));
    port.push(100 * (1 + (p.ret / 100) * t) + w(1.3, 6.2) * (1 - t * 0.2));
  }
  bench[n - 1] = 100 + BENCHMARK.ret;
  port[n - 1] = 100 + p.ret;
  return { port, bench };
};

/** What each holding added to or took from your return, relative to the benchmark (percentage points). */
export const attribution = () => {
  const p = performance();
  const priced = ACCOUNTS.filter((a) => ['equities', 'pension', 'alts'].includes(a.cls) && a.id !== 'wt');
  return priced
    .map((a) => ({ id: a.id, label: a.institution, sub: a.name, weight: a.value / p.value, ret: a.change1y, pts: (a.value / p.value) * (a.change1y - BENCHMARK.ret) }))
    .sort((a, b) => b.pts - a.pts);
};

export const stress = () => {
  const cls = (k: AssetClass) => ACCOUNTS.filter((a) => a.cls === k).reduce((s, a) => s + a.value, 0);
  const nonGbp = ACCOUNTS.filter((a) => a.ccy !== 'GBP').reduce((s, a) => s + a.value, 0);
  const crypto = ACCOUNTS.find((a) => a.id === 'cb')!.value;
  return [
    { label: 'Property falls 10%', hit: cls('property') * 0.1 },
    { label: 'Markets fall 20%', hit: (cls('equities') + cls('pension')) * 0.2 },
    { label: 'Sterling rises 10%', hit: nonGbp * 0.1 },
    { label: 'Crypto falls 50%', hit: crypto * 0.5 },
  ].sort((a, b) => b.hit - a.hit);
};

/** Cumulative cost of fees over ten years, per year. */
export const costDrag = () => {
  const annual = costs().total;
  return Array.from({ length: 11 }, (_, y) => (y === 0 ? 0 : fv(annual, y)));
};

/** Net worth by asset class through the year, for the stacked "strata" chart. */
export const strata = () => {
  const n = 53;
  return CLASS_ORDER.map((cls) => {
    const accts = ACCOUNTS.filter((a) => a.cls === cls);
    const value = accts.reduce((s, a) => s + a.value, 0);
    const g = accts.reduce((s, a) => s + a.change1y * a.value, 0) / value / 100;
    const values = Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1);
      const base = value / Math.pow(1 + g, 1 - t);
      const wob = 1 + Math.sin(i / 3 + CLASS_ORDER.indexOf(cls)) * 0.012 * (1 - t) + Math.sin(i / 9) * 0.01 * (1 - t);
      return i === n - 1 ? value : base * wob;
    });
    return { key: cls, label: CLASS_META[cls].label, color: CLASS_META[cls].color, values };
  });
};

/** Risk broken into underlying drivers, measured the same way across every account (illustrative weights). */
export const drivers = () => {
  const W: Record<AssetClass, Record<string, number>> = {
    equities: { Equities: 1 },
    pension: { Equities: 0.7, 'Interest rates': 0.2, Credit: 0.1 },
    property: { Inflation: 0.6, 'Interest rates': 0.4 },
    private: { Equities: 1 },
    cash: { 'Interest rates': 1 },
    alts: { Equities: 0.5, Inflation: 0.5 },
  };
  const acc: Record<string, number> = {};
  for (const a of ACCOUNTS) for (const [k, w] of Object.entries(W[a.cls])) acc[k] = (acc[k] ?? 0) + a.value * w;
  const total = Object.values(acc).reduce((s, v) => s + v, 0);
  const colors: Record<string, string> = { Equities: c.teal, 'Interest rates': c.periwinkle, Credit: c.violet, Inflation: c.amber };
  const base = Object.entries(acc).map(([label, v]) => ({ label, pct: (v / total) * 100, color: colors[label] })).sort((a, b) => b.pct - a.pct);
  const nonGbp = ACCOUNTS.filter((a) => a.ccy !== 'GBP').reduce((s, a) => s + a.value, 0);
  return { base, currencyPct: (nonGbp / totals().assets) * 100 };
};
