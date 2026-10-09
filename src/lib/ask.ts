// Ask bar — rule-based, runs on the device, no server. Ported behaviour from NUO's moneyAsk.ts:
// always states the period, refuses tax and financial-advice questions, matches names tolerantly,
// direction matters (costs never return revenue), every answer ends with the disclaimer.
import { ENTRIES, OWNERS, liveFigures, monthKey, monthLabel, figuresFor, projection, entryMonthly, addMonths, type MonthKey, type Snap } from './money';
import { gbp } from '@/theme/tokens';
import { askWealth } from '@/lib/askWealth';
import { DEFAULT_PROFILE, type Profile } from '@/lib/forecast';
import { FAQ, type Faq } from '@/data/faq';
import { canon, searchDocs } from '@/lib/search';

export type Answer = {
  headline: string;
  period?: string;
  text: string;
  rows?: { label: string; value: string; tone?: 'pos' | 'neg' | 'neutral' }[];
  from?: string;
  refusal?: boolean;
  note?: string;
  /** offers a one-tap handoff to the adviser team in secure chat */
  action?: { label: string; chat: string };
  /** true when nothing matched at all */
  fallback?: boolean;
};

export const DISCLAIMER =
  "Worked out from the figures you've entered or that we've pulled in. This is an automated answer, not personal advice. For advice, including on tax, talk to your adviser team.";

const TAX = /\b(tax|vat|hmrc|corporation|self assessment|allowance|national insurance|dividend|capital gains|stamp duty)\b/i;
const ADVICE = /\b(should i|can i afford|shall i|where should|which (fund|stock|share|isa)|best way to (save|invest)|invest (in|my|more)|overpay|worth buying)\b/i;

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const initials = (s: string) => s.split(/\s+/).map((w) => w[0]).join('').toLowerCase();

const matchOwner = (q: string) => {
  const nq = norm(q);
  const hits = OWNERS.filter((o) => nq.includes(norm(o.name)) || (initials(o.name).length > 1 && new RegExp(`\\b${initials(o.name)}\\b`).test(q.toLowerCase())));
  return hits.length === 1 ? hits[0] : null;
};

const parseMonth = (q: string, now: Date): { key: MonthKey; explicit: boolean } | null => {
  const lq = q.toLowerCase();
  if (/last month/.test(lq)) return { key: monthKey(addMonths(now, -1)), explicit: true };
  const ago = lq.match(/(\d+|two|three|four|five|six)\s+months?\s+ago/);
  if (ago) {
    const w: Record<string, number> = { two: 2, three: 3, four: 4, five: 5, six: 6 };
    const n = w[ago[1]] ?? parseInt(ago[1], 10);
    return { key: monthKey(addMonths(now, -n)), explicit: true };
  }
  for (let i = 0; i < 12; i++) {
    if (new RegExp(`\\b${MONTHS[i]}\\b|\\b${MONTHS[i].slice(0, 3)}\\b`).test(lq)) {
      const yr = lq.match(/\b(20\d\d)\b/);
      let y = yr ? parseInt(yr[1], 10) : now.getFullYear();
      if (!yr && i > now.getMonth()) y -= 1;
      return { key: `${y}-${String(i + 1).padStart(2, '0')}`, explicit: true };
    }
  }
  return null;
};

export const SUGGESTIONS = [
  'How much am I left with this month?',
  'What are my biggest expenses?',
  'What will I earn this year?',
  'Has my spending gone up?',
  'Where does my income come from?',
];

export function ask(q: string, hist: Record<MonthKey, Snap>, now = new Date()): Answer {
  const text = q.trim();
  if (!text) return { headline: 'Ask me anything about your money', text: 'Try one of the questions below.' };
  if (TAX.test(text))
    return { headline: 'Tax planning is part of your advice', text: "Y-WLTH helps with your ISA and pension allowances, how investment wrappers affect tax, and making your investments more tax-efficient. For tax returns, corporate tax, HMRC disputes or complicated international tax you would still use a specialist. Your adviser team can tell you what applies to you. This app doesn't calculate tax owed.", refusal: true, action: { label: 'Ask your adviser about tax', chat: text } };
  if (ADVICE.test(text))
    return { headline: 'That one is advice, so it comes from your adviser', text: "Financial advice comes from your adviser team in secure chat, not from an automated answer. They can see your whole picture and have nothing to sell.", refusal: true, action: { label: 'Ask your adviser in secure chat', chat: text } };

  const lq = text.toLowerCase();
  const owner = matchOwner(text);
  const month = parseMonth(text, now);
  const live = monthKey(now);
  const periodNote = month ? monthLabel(month.key) : `As at ${now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  // Year projection
  if (/(this year|rest of the year|year.?end|projected|projection|will i (earn|make|have))/.test(lq)) {
    const p = projection('total', hist, now);
    return {
      headline: `${gbp(p.left)} left over in ${now.getFullYear()}`,
      period: periodNote,
      text: `Projected income ${gbp(p.income)} and expenses ${gbp(p.expenses)}.`,
      rows: [
        { label: 'Projected income', value: gbp(p.income), tone: 'pos' },
        { label: 'Projected expenses', value: gbp(p.expenses), tone: 'neg' },
        { label: 'Left over', value: gbp(p.left), tone: p.left >= 0 ? 'pos' : 'neg' },
        { label: `Months gone (${p.gone.months}) + months to come (${p.rest.months})`, value: `${gbp(p.gone.income - p.gone.expenses)} + ${gbp(p.rest.income - p.rest.expenses)}` },
      ],
      from: 'Earned income, Property, Investments',
    };
  }

  // Spending up/down vs a year ago
  if (/(gone up|gone down|spending|compared|increase|changed)/.test(lq) && !month) {
    const keys = Object.keys(hist).sort();
    const refKey = hist[monthKey(addMonths(now, -12))] ? monthKey(addMonths(now, -12)) : keys[0];
    const a = liveFigures('total').expenses;
    const b = figuresFor(refKey, 'total', hist, now).expenses;
    const d = a - b;
    return {
      headline: `Spending is ${d >= 0 ? 'up' : 'down'} ${gbp(Math.abs(d))} a month`,
      period: `Compared with ${monthLabel(refKey)}`,
      text: `That's ${Math.abs((d / b) * 100).toFixed(0)}% ${d >= 0 ? 'higher' : 'lower'} than then. Only spending rows are compared.`,
      rows: [
        { label: monthLabel(refKey, true), value: gbp(b) },
        { label: 'This month', value: gbp(a) },
        { label: 'Change', value: gbp(d, { sign: true }), tone: d <= 0 ? 'pos' : 'neg' },
      ],
      from: 'Living costs, Property, Investments',
    };
  }

  // Biggest costs
  if (/(biggest|largest|most expensive|top).*(cost|expense|spend|bill)|biggest (cost|expense)/.test(lq) || /what are my biggest/.test(lq)) {
    const costs = ENTRIES.filter((e) => e.kind === 'cost' && !e.tax && (!owner || e.owner === owner.id))
      .map((e) => ({ e, v: entryMonthly(e) }))
      .sort((a, b) => b.v - a.v)
      .slice(0, 5);
    return {
      headline: owner ? `Biggest costs · ${owner.name}` : 'Your biggest monthly costs',
      period: periodNote,
      text: 'Ranked by cost per month. Tax payments are left out.',
      rows: costs.map(({ e, v }) => ({ label: `${e.name} · ${OWNERS.find((o) => o.id === e.owner)?.name ?? ''}`, value: gbp(v), tone: 'neg' as const })),
      from: owner ? (owner.domain === 'property' ? 'Property' : 'Investments') : 'Living costs, Property, Investments',
    };
  }

  // Where income comes from
  if (/(where.*income|income.*come|sources?)/.test(lq)) {
    const src = ENTRIES.filter((e) => e.kind === 'income')
      .map((e) => ({ e, v: entryMonthly(e) }))
      .sort((a, b) => b.v - a.v);
    return {
      headline: 'Where your income comes from',
      period: periodNote,
      text: 'Earned income is after tax. Rental and investment income are before tax.',
      rows: src.map(({ e, v }) => ({ label: e.name, value: gbp(v), tone: 'pos' as const })),
      from: 'Earned income, Property, Investments',
    };
  }

  // Counts
  if (/how many/.test(lq)) {
    const props = OWNERS.filter((o) => o.domain === 'property');
    const accts = OWNERS.filter((o) => o.domain === 'investments');
    const wantProp = /(propert|home|house|prop|apt)/.test(lq);
    const list = wantProp ? props : accts;
    return { headline: `${list.length} ${wantProp ? 'properties' : 'investment accounts'}`, text: list.map((o) => o.name).join(', ') };
  }

  // A figure for a month (default: this month)
  if (/(left|earn|income|spend|spent|cost|profit|make|made|revenue|expenses?)/.test(lq) || month) {
    const key = month?.key ?? live;
    const scope = owner ? owner.domain : 'total';
    const f = figuresFor(key, scope, hist, now, owner?.id);
    const incomeOnly = /(earn|income|revenue|make|made)/.test(lq) && !/(left|profit|spend|cost)/.test(lq);
    const costOnly = /(spend|spent|cost|expenses?)/.test(lq) && !/(left|profit|earn|income)/.test(lq);
    const headline = incomeOnly ? `${gbp(f.income)} came in` : costOnly ? `${gbp(f.expenses)} went out` : `${gbp(f.left)} left over`;
    return {
      headline,
      period: month ? monthLabel(key) : periodNote,
      text: `${owner ? owner.name + ' · ' : ''}Earned income is after tax. Property and investment figures are before tax.`,
      rows: [
        ...(incomeOnly || !costOnly ? [{ label: 'Income', value: gbp(f.income), tone: 'pos' as const }] : []),
        ...(costOnly || !incomeOnly ? [{ label: 'Expenses', value: gbp(f.expenses), tone: 'neg' as const }] : []),
        ...(!incomeOnly && !costOnly ? [{ label: 'Left over', value: gbp(f.left), tone: f.left >= 0 ? ('pos' as const) : ('neg' as const) }] : []),
      ],
      from: owner ? (owner.domain === 'property' ? 'Property' : 'Investments') : 'Earned income, Property, Investments',
    };
  }

  return {
    headline: "I can't answer that from what's here",
    text: 'Try asking about your income, expenses, what is left over, a named month, your biggest costs, or the year ahead.',
    fallback: true,
  };
}


const ABOUT_FIRM = /\b(ywlth|you|your|we|company|firm|adviser|advisers)\b/;

/** FAQ answer as an Answer card. */
const faqAnswer = (f: Faq): Answer => ({
  headline: f.q,
  text: [f.a, ...(f.steps ?? []).map((s, i) => `${i + 1}. ${s}`)].join('\n\n'),
  from: 'Y-WLTH FAQ',
  action: { label: 'Ask your adviser about this', chat: f.q },
  note: f.ours ? 'Summarised from what Y-WLTH publishes about itself. Ask your adviser team to confirm anything specific to you.' : undefined,
});

const bestFaq = (q: string): Faq | null => {
  const hits = searchDocs(FAQ.map((f) => ({ ...f, id: f.q })), q);
  const h = hits[0];
  if (!h) return null;
  const strong = h.score >= 9 && h.matched / h.total >= 0.6;
  return strong ? (h.doc as Faq) : null;
};

/** One entry point for every question: your wealth and forecast, then your money, then what Y-WLTH does (the FAQ). Advice and tax handoffs apply when the question is about you, not about Y-WLTH. */
export function askAnything(q: string, hist: Record<MonthKey, Snap>, profile: Profile = DEFAULT_PROFILE, now = new Date()): Answer {
  const t = q.trim();
  if (!t) return ask(q, hist, now);
  // Questions about Y-WLTH itself ("what does Y-WLTH cost?") go to the FAQ first, so "cost" doesn't read as your spending.
  if (/\bywlth\b/.test(canon(t))) { const f0 = bestFaq(t); if (f0) return faqAnswer(f0); }
  const w = !(TAX.test(t) || ADVICE.test(t)) ? askWealth(t, profile) : null;
  if (w) return w;
  const m = ask(t, hist, now);
  if (!m.fallback && !m.refusal) return m;
  const f = bestFaq(t);
  if (f && (!m.refusal || ABOUT_FIRM.test(canon(t)))) return faqAnswer(f);
  return m;
}
