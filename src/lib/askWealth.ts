import { ACCOUNTS, CLASS_META, byClass, totals } from '@/data/wealth';
import { BENCHMARK, performance, risk } from '@/lib/insights';
import { attribution, stress as stressTests } from '@/lib/intelligence';
import { CONNECTIONS, RENEW_DAYS } from '@/data/connections';
import { costs } from '@/lib/insights';
import { YWLTH_FEE } from '@/data/fees';
import { ALL_STRESS, NO_STRESS, atAge, firstAgeReaching, forecast, type Profile } from '@/lib/forecast';
import type { Answer } from '@/lib/ask';
import { gbp, gbpCompact } from '@/theme/tokens';

const num = (s: string, unit?: string) => {
  const n = parseFloat(s.replace(/,/g, ''));
  if (!unit) return n;
  const u = unit.toLowerCase();
  return /^(m|mn|million)/.test(u) ? n * 1e6 : /^(k|thousand)/.test(u) ? n * 1e3 : n;
};


/** Plain-English questions about your wealth, answered from the forecast and your accounts. Null if not a wealth question. */
export function askWealth(q: string, p: Profile): Answer | null {
  const lq = q.toLowerCase();
  const base = forecast(p, NO_STRESS);
  const stress = forecast(p, ALL_STRESS);
  const year = new Date().getFullYear();
  const disclaimer = 'An illustration based on your accounts today and the assumptions shown in your forecast. Not a prediction, and not advice.';

  // Net worth at an age, or in N years
  const ageM = lq.match(/(?:at|age|aged|when i(?:'|’)?m|when i am|by the time i(?:'|’)?m|by)\s*(\d{2,3})\b/);
  const yearsM = lq.match(/in (\d{1,2}) years?/);
  if ((ageM || yearsM) && /(worth|wealth|have|own|be|get|reach|money|net)/.test(lq) && !/retire/.test(lq)) {
    const age = ageM ? parseInt(ageM[1], 10) : p.age + parseInt(yearsM![1], 10);
    if (age >= p.age && age <= 100) {
      const b = atAge(base, age), s = atAge(stress, age), bn = atAge(base, age, false);
      return {
        headline: `About ${gbpCompact(b)} at ${age}`,
        period: `In ${year + (age - p.age)} · in today's money · you're ${p.age} now`,
        text: `Based on your current accounts, steady saving and no shocks. Stress-tested against inflation, tax, higher fees and a market fall, it's about ${gbpCompact(s)}.`,
        rows: [
          { label: "Base case, today's money", value: gbp(b), tone: 'pos' },
          { label: 'Base case, future money', value: gbp(bn) },
          { label: "Stress-tested, today's money", value: gbp(s), tone: s < b * 0.8 ? 'neg' : 'neutral' },
        ],
        from: 'Your accounts, Money Insights and the forecast',
        note: disclaimer,
      };
    }
    return { headline: `Pick an age between ${p.age} and 100`, text: 'The forecast runs from your age today out to 100.' };
  }

  // When will I reach £X
  const tgt = lq.match(/£?\s*([\d.,]+)\s*(m|mn|million|k|thousand)?\b/);
  if (/(reach|hit|get to|have|worth)/.test(lq) && /when|how long|what age/.test(lq) && tgt && num(tgt[1], tgt[2]) >= 100_000) {
    const target = num(tgt[1], tgt[2]);
    const a = firstAgeReaching(base, target), s = firstAgeReaching(stress, target);
    return {
      headline: a === null ? `Not by 100 on these assumptions` : `You'd reach ${gbpCompact(target)} at ${a}`,
      period: a === null ? undefined : `Around ${year + (a - p.age)} · in today's money`,
      text: s === null ? 'Stress-tested, it is not reached by age 100.' : `Stress-tested, it takes until ${s}.`,
      rows: [
        { label: 'Base case', value: a === null ? 'Not reached' : `Age ${a}`, tone: 'pos' },
        { label: 'Stress-tested', value: s === null ? 'Not reached' : `Age ${s}`, tone: s === null ? 'neg' : 'neutral' },
      ],
      from: 'The forecast', note: disclaimer,
    };
  }

  // Retirement
  if (/retire|last|run out|enough/.test(lq) && /(money|last|run out|enough|retire)/.test(lq)) {
    const rAge = (lq.match(/retire[^\d]{0,12}(\d{2})/) ?? [])[1];
    const pr = rAge ? { ...p, retireAge: parseInt(rAge, 10) } : p;
    const b = forecast(pr, NO_STRESS), s = forecast(pr, ALL_STRESS);
    const lasts = (f: typeof b) => (f.runsOutAge ? `Runs out at ${f.runsOutAge}` : 'Lasts to 100');
    return {
      headline: b.runsOutAge ? `Investments last until ${b.runsOutAge}` : 'Your investments last to 100',
      period: `Retiring at ${pr.retireAge} on ${gbpCompact(pr.retireIncome)} a year, in today's money`,
      text: s.runsOutAge ? `Stress-tested, they run out at ${s.runsOutAge}. The gap is the case for a plan that survives a bad start.` : 'They also last to 100 when stress-tested.',
      rows: [
        { label: 'Base case', value: lasts(b), tone: b.runsOutAge ? 'neg' : 'pos' },
        { label: 'Stress-tested', value: lasts(s), tone: s.runsOutAge ? 'neg' : 'pos' },
      ],
      from: 'The forecast. Your home is not counted as spendable', note: disclaimer,
    };
  }

  // Performance against the benchmark
  if (/(perform|return|beat|benchmark|how.*doing|underperform)/.test(lq) && /(invest|portfolio|pension|holding|money|wealth|i |my)/.test(lq) && !/(fee|cost|charge)/.test(lq)) {
    const pf = performance();
    const att = attribution();
    return {
      headline: /(beat|ahead|behind|outperform|underperform|better than)/.test(lq) ? (pf.vsBenchmark >= 0 ? `Yes, you're ${pf.vsBenchmark.toFixed(1)} points ahead` : `Not quite: you're ${Math.abs(pf.vsBenchmark).toFixed(1)} points behind`) : `Your investments returned ${pf.ret.toFixed(1)}%`,
      period: `Returned ${pf.ret.toFixed(1)}% over the past 12 months, after costs`,
      text: `${pf.vsBenchmark >= 0 ? 'Ahead of' : 'Behind'} the ${BENCHMARK.name} (${BENCHMARK.ret.toFixed(1)}%) by ${Math.abs(pf.vsBenchmark).toFixed(1)} points. The holdings that moved you most against it are below.`,
      rows: [att[0], att[att.length - 1], att[att.length - 2]].filter(Boolean).map((a) => ({ label: `${a.label} · ${a.sub}`, value: `${a.pts >= 0 ? '+' : ''}${a.pts.toFixed(2)} pts`, tone: a.pts >= 0 ? ('pos' as const) : ('neg' as const) })),
      from: 'Your connected accounts, independently benchmarked', note: 'The benchmark shown is illustrative. Past performance is not a guide to the future.',
    };
  }

  // Currency exposure
  if (/(currenc|sterling|dollar|euro\b|euros|fx|exchange rate|usd|eur\b)/.test(lq)) {
    const t0 = totals();
    const by = (ccy: string) => ACCOUNTS.filter((a) => a.ccy === ccy).reduce((s, a) => s + a.value, 0);
    const non = by('USD') + by('EUR');
    const pctOf = (v: number) => `${((v / t0.assets) * 100).toFixed(0)}%`;
    return {
      headline: `${((non / t0.assets) * 100).toFixed(0)}% of your wealth is outside sterling`,
      text: `That is ${gbpCompact(non)} in dollars and euros. When sterling moves, your net worth moves with it even if nothing you own has changed. A 10% rise in sterling would take about ${gbpCompact(non * 0.1)} off.`,
      rows: [
        { label: 'Sterling', value: `${gbpCompact(by('GBP'))} · ${pctOf(by('GBP'))}` },
        { label: 'US dollars', value: `${gbpCompact(by('USD'))} · ${pctOf(by('USD'))}` },
        { label: 'Euros', value: `${gbpCompact(by('EUR'))} · ${pctOf(by('EUR'))}` },
      ],
      from: 'Your connected accounts',
    };
  }

  // Risk and concentration
  if (/(risk|exposed|exposure|concentrat|diversif|volatil|vulnerab)/.test(lq) && !/(appetite|tolerance|manag)/.test(lq)) {
    const r = risk();
    const worst = stressTests()[0];
    return {
      headline: `${r.topPct.toFixed(0)}% of your assets are in ${r.topLabel.toLowerCase()}`,
      text: r.level === 'Concentrated' ? 'That is a single-asset concentration. The shocks below show what each could take off your net worth.' : 'Your wealth is reasonably spread. The shocks below show what each could take off your net worth.',
      rows: [
        { label: 'Outside sterling', value: `${r.nonGbpPct.toFixed(0)}%` },
        { label: 'Held in cash', value: `${r.cashPct.toFixed(0)}%` },
        ...stressTests().slice(0, 2).map((x) => ({ label: x.label, value: `-${gbpCompact(x.hit)}`, tone: 'neg' as const })),
      ],
      from: 'Your connected accounts', note: `Largest single shock: ${worst.label.toLowerCase()}, about ${gbpCompact(worst.hit)}.`,
    };
  }

  // How accounts are connected (method)
  if (/(how|what way|by what|connected (to|via|through)|connect to my|do you connect|link)/.test(lq) && /(connect|link)/.test(lq) && !/(which|need|expire|reconfirm|renew)/.test(lq)) {
    const group = (src: string) => CONNECTIONS.filter((x) => x.source === src);
    const rows = ([
      ['Open banking', 'Banks and savings accounts, read-only', 'Open banking'],
      ['Provider feed', 'Wealth managers, platforms, pensions and ISAs', 'Provider feed'],
      ['Exchange (read-only)', 'Crypto exchanges', 'Exchange (read-only)'],
      ['Valuation estimate', 'Property, valued from market data', 'Valuation estimate'],
      ['Entered by you', 'Private company stakes and other assets', 'Entered by you'],
    ] as const).map(([label, , src]) => ({ label: `${label} · ${group(src).map((x) => x.institution).join(', ')}`, value: String(group(src).length) })).filter((r) => r.value !== '0');
    const live = CONNECTIONS.filter((x) => x.status !== 'manual').length;
    return {
      headline: `${live} are connected live, ${CONNECTIONS.length - live} are valued or entered`,
      text: `Your banks are read through open banking, and your wealth managers, platforms and pensions through secure provider feeds. All of it is read-only: we can see your balances, never move your money. Property and private assets are valued or entered by you.`,
      rows,
      from: 'Connected accounts', note: `Live connections are reconfirmed every ${RENEW_DAYS} days. Open Connected accounts (the link icon) to inspect each one.`,
    };
  }

  // Which connections need attention (status)
  if (/(connect|reconfirm|reconnect|renew|expire|sync)/.test(lq) && /(which|need|any|status|are my|expir|up to date)/.test(lq)) {
    const attn = CONNECTIONS.filter((x) => x.status === 'attention');
    const live = CONNECTIONS.filter((x) => x.status !== 'manual').length;
    return {
      headline: attn.length ? `${attn.length} account${attn.length > 1 ? 's need' : ' needs'} reconfirming` : 'All your connections are up to date',
      text: `${live} live connections. Access is reconfirmed every ${RENEW_DAYS} days, and we remind you 14 days before.`,
      rows: attn.length ? attn.map((x) => ({ label: `${x.institution} · ${x.name}`, value: `${x.renewsIn} days left`, tone: 'neg' as const })) : CONNECTIONS.filter((x) => x.renewsIn !== undefined).sort((a, b) => a.renewsIn! - b.renewsIn!).slice(0, 3).map((x) => ({ label: x.institution, value: `renews in ${x.renewsIn}d` })),
      from: 'Connected accounts',
    };
  }

  // Fees
  if (/(fee|fees|cost|charges?)/.test(lq) && /(pay|paying|much|total|year)/.test(lq) && !/month|expense|spend/.test(lq)) {
    const c = costs();
    return {
      headline: `${gbp(c.total)} a year in fees, all in`,
      text: `That is ${c.totalPct.toFixed(2)}% of the ${gbpCompact(c.base)} in your investable portfolios: ${gbp(c.annual)} to your providers and ${gbp(c.ywlth)} to Y-WLTH.`,
      rows: [
        { label: `${YWLTH_FEE.label}${YWLTH_FEE.sample ? ' (sample rate)' : ''}`, value: gbp(c.ywlth) },
        ...ACCOUNTS.filter((a) => a.feePct > 0).sort((a, b) => b.value * b.feePct - a.value * a.feePct).slice(0, 4).map((a) => ({ label: `${a.institution} · ${a.feePct.toFixed(2)}%`, value: gbp((a.value * a.feePct) / 100), tone: a.feePct > 0.5 ? ('neg' as const) : ('neutral' as const) })),
      ],
      from: 'Your connected accounts and your Y-WLTH fee',
      note: "Y-WLTH's fee is based on the value of your investable portfolios and the services you choose. The rate shown is a sample until your agreed fee is loaded.",
    };
  }

  // Net worth / a class today
  const t = totals();
  const cls = byClass().find((c) => new RegExp(c.label.toLowerCase().replace('private business', 'private|business').replace('investments', 'invest'), 'i').test(lq) || (c.cls === 'alts' && /crypto|watch/.test(lq)));
  if (cls && /(how much|worth|value|own|have|holding|total|current)/.test(lq)) {
    return {
      headline: `${gbp(cls.value)} in ${cls.label.toLowerCase()}`,
      text: `${((cls.value / t.assets) * 100).toFixed(1)}% of your assets. ${CLASS_META[cls.cls].blurb}`,
      rows: cls.accounts.map((a) => ({ label: `${a.institution} · ${a.name}`, value: gbp(a.value) })),
      from: 'Your connected accounts',
    };
  }
  if (/(net worth|how much am i worth|what am i worth|total wealth)/.test(lq)) {
    return {
      headline: gbp(t.net),
      period: `As at ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      text: 'Everything you own less everything you owe.',
      rows: [{ label: 'Assets', value: gbp(t.assets), tone: 'pos' }, { label: 'Liabilities', value: `-${gbp(t.liabilities)}`, tone: 'neg' }],
      from: 'Your connected accounts',
    };
  }
  return null;
}
