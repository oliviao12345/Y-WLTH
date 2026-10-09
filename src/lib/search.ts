// Shared smart search for the FAQ and every ask bar.
// Case-insensitive, tolerant of "Y-WLTH" / "ywlth" / "ywlth" / "Y-WLTH", spelling variants (adviser/advisor,
// authorised/authorized), small typos, plurals, and synonyms (charge → fees, legit → regulated).

export type Doc = { id: string; q: string; a: string; keywords?: string[] };

const SPELL: [RegExp, string][] = [
  [/\bwhy[\s-]*tree\b/g, 'ywlth'],
  [/\by[\s\-_.]*tree(?:s|limited|ltd)?\b/g, 'ywlth'],
  [/advisor/g, 'adviser'], [/authoriz/g, 'authoris'], [/optimiz/g, 'optimis'], [/organiz/g, 'organis'], [/programme/g, 'program'],
  [/\bi\.?s\.?a\.?s?\b/g, 'isa'], [/\bu\.?k\.?\b/g, 'uk'],
];

export const canon = (s: string) => {
  let t = s.toLowerCase().replace(/[’`]/g, "'").replace(/'s\b/g, '').replace(/'/g, '');
  for (const [re, to] of SPELL) t = t.replace(re, to);
  return t.replace(/[^a-z0-9£%\s]/g, ' ').replace(/\s+/g, ' ').trim();
};

const STOP = new Set(['ywlth', 'do', 'does', 'did', 'is', 'are', 'was', 'were', 'be', 'been', 'am', 'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'at', 'for', 'it', 'its', 'i', 'my', 'me', 'you', 'your', 'we', 'our', 'us', 'with', 'how', 'what', 'when', 'who', 'why', 'which', 'can', 'could', 'will', 'would', 'should', 'have', 'has', 'get', 'give', 'gives', 'about', 'there', 'that', 'this', 'if', 'where', 'much', 'any', 'some', 'please', 'tell', 'want', 'need', 'know', 'let', 'just', 'so', 'as', 'by', 'from', 'than', 'then', 'also', 'really', 'actually', 'like', 'make', 'sure']);

// Everyday words → the term the FAQ uses.
const SYN: Record<string, string> = {
  charge: 'fee', charges: 'fee', charged: 'fee', price: 'fee', pricing: 'fee', prices: 'fee', cost: 'fee', costs: 'fee', pay: 'fee', paying: 'fee', commission: 'fee', commissions: 'fee', expensive: 'fee', cheap: 'fee',
  held: 'custody', holds: 'custody', hold: 'custody', holding: 'custody', safekeeping: 'custody', custodian: 'custody', custodians: 'custody',
  regulator: 'regulated', regulated: 'regulated', regulation: 'regulated', regulate: 'regulated', authorised: 'regulated', licence: 'regulated', license: 'regulated', licensed: 'regulated', legit: 'regulated', legitimate: 'regulated', genuine: 'regulated', scam: 'regulated', trust: 'regulated', trustworthy: 'regulated', register: 'regulated',
  secure: 'safe', security: 'safe', protected: 'safe', protect: 'safe', encrypted: 'safe', encryption: 'safe', privacy: 'data', gdpr: 'data', hack: 'safe', hacked: 'safe',
  aisp: 'aisp', openbanking: 'aisp', 'open banking': 'aisp',
  bank: 'bank', banks: 'bank', accounts: 'account', connect: 'connect', connected: 'connect', connection: 'connect', link: 'connect', linking: 'connect', sync: 'connect', aggregate: 'connect', aggregation: 'connect', consolidate: 'connect',
  chat: 'message', messaging: 'message', message: 'message', text: 'message', contact: 'message', speak: 'call', talk: 'call', phone: 'call', ring: 'call', telephone: 'call', calling: 'call',
  retire: 'retirement', pension: 'pension', pensions: 'pension', sipp: 'pension',
  taxes: 'tax', taxation: 'tax', hmrc: 'tax', allowance: 'allowance', allowances: 'allowance', isa: 'isa', wrapper: 'wrapper', wrappers: 'wrapper',
  minimum: 'minimum', min: 'minimum', threshold: 'minimum', '1m': 'minimum', million: 'minimum', eligible: 'minimum', eligibility: 'minimum', qualify: 'minimum',
  start: 'start', started: 'start', begin: 'start', onboard: 'start', onboarding: 'start', join: 'start', signup: 'start', sign: 'start', open: 'start',
  difference: 'different', compare: 'different', versus: 'different', vs: 'different', alternative: 'different',
  safe: 'safe', independent: 'independent', impartial: 'independent', conflict: 'independent', conflicts: 'independent', unbiased: 'independent',
  forecast: 'forecast', projection: 'forecast', predict: 'forecast', future: 'forecast', strategy: 'forecast', plan: 'forecast', planning: 'forecast',
  benchmark: 'benchmark', benchmarking: 'benchmark', underperform: 'benchmark', underperformance: 'benchmark', performance: 'benchmark',
  property: 'property', house: 'property', home: 'property', art: 'art', wine: 'art', watches: 'art', crypto: 'crypto', bitcoin: 'crypto',
  login: 'login', 'log in': 'login', password: 'login', faceid: 'login', biometric: 'login', biometrics: 'login', mfa: 'login',
  complaint: 'complaint', complain: 'complaint', complaints: 'complaint', ombudsman: 'complaint',
  job: 'career', jobs: 'career', hiring: 'career', careers: 'career', vacancy: 'career',
  partner: 'family', spouse: 'family', wife: 'family', husband: 'family', children: 'family', kids: 'family',
  us: 'us', american: 'us', usa: 'us', overseas: 'nonuk', abroad: 'nonuk', expat: 'nonuk', foreign: 'nonuk',
};

const stem = (w: string) => {
  const x = w;
  if (x.length <= 3) return x;
  if (x.endsWith('ies')) return x.slice(0, -3) + 'y';
  if (x.endsWith('ing') && x.length > 5) return x.slice(0, -3);
  if (x.endsWith('ed') && x.length > 4) return x.slice(0, -2);
  if (x.endsWith('ly') && x.length > 5) return x.slice(0, -2);
  if (x.endsWith('s') && !x.endsWith('ss') && x.length > 3) return x.slice(0, -1);
  return x;
};

const norm = (w: string) => stem(SYN[w] ?? w);

const nearest = (w: string, vocab: Set<string>): string => {
  if (w.length < 4 || vocab.has(w) || SYN[w] !== undefined || /\d/.test(w)) return w;
  const max = w.length >= 8 ? 2 : 1;
  let best = w, bd = max + 1;
  for (const v of vocab) {
    if (Math.abs(v.length - w.length) > max) continue;
    const d = lev(w, v, max);
    if (d < bd) { bd = d; best = v; if (d === 1) break; }
  }
  return best;
};

export const tokens = (s: string, vocab?: Set<string>): string[] => {
  const c = canon(s);
  const out: string[] = [];
  // two-word phrases that carry meaning on their own
  const joined = c.replace(/\blog in\b/g, 'login').replace(/\bopen banking\b/g, 'openbanking').replace(/\bsign up\b/g, 'signup');
  for (const w of joined.split(' ')) {
    if (!w || STOP.has(w) || (w.length < 2 && !/\d/.test(w))) continue;
    out.push(norm(vocab ? nearest(w, vocab) : w));
  }
  return out;
};

const lev = (a: string, b: string, max: number) => {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let min = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      min = Math.min(min, cur[j]);
    }
    if (min > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
};

/** 1 for an exact match, 0.7 for prefix/typo, 0 for none. */
const match = (q: string, d: string) => {
  if (q === d) return 1;
  if (q.length >= 4 && (d.startsWith(q) || (d.length >= 4 && q.startsWith(d)))) return 0.85;
  const max = q.length >= 8 ? 2 : q.length >= 5 ? 1 : 0;
  return max && lev(q, d, max) <= max ? 0.7 : 0;
};

type Idx = { doc: Doc; q: string[]; k: string[]; a: Set<string>; qc: string; kp: string[] };
type Built = { rows: Idx[]; vocab: Set<string> };
const cache = new WeakMap<Doc[], Built>();
const index = (docs: Doc[]): Built => {
  let i = cache.get(docs);
  if (!i) {
    const vocab = new Set<string>(Object.keys(SYN).filter((k) => !k.includes(' ')));
    for (const d of docs) for (const w of canon(`${d.q} ${(d.keywords ?? []).join(' ')}`).split(' ')) if (w.length >= 4 && !STOP.has(w)) vocab.add(w);
    i = { vocab, rows: docs.map((doc) => ({ doc, q: tokens(doc.q), k: tokens((doc.keywords ?? []).join(' ')), a: new Set(tokens(doc.a)), qc: canon(doc.q), kp: (doc.keywords ?? []).map(canon).filter((k) => k.length >= 3) })) };
    cache.set(docs, i);
  }
  return i;
};

export type Hit<T extends Doc> = { doc: T; score: number; matched: number; total: number };

/** Ranked results: exact phrases, then keyword / question / answer word matches (with typo tolerance), tightest question wins ties. */
export function searchDocs<T extends Doc>(docs: T[], query: string): Hit<T>[] {
  const { rows, vocab } = index(docs);
  const qt = [...new Set(tokens(query, vocab))];
  const qc = canon(query);
  if (!qt.length && qc.length < 3) return [];
  const hits: Hit<T>[] = [];
  for (const d of rows) {
    let score = 0, matched = 0, inQ = 0;
    for (const t of qt) {
      let best = 0, q = 0;
      for (const w of d.k) best = Math.max(best, match(t, w) * 5);
      for (const w of d.q) { const m = match(t, w); if (m * 4 > best) best = m * 4; q = Math.max(q, m); }
      if (best < 3) for (const w of d.a) { const m = match(t, w) * 1.5; if (m > best) best = m; if (best >= 1.5) break; }
      if (best > 0) matched++;
      if (q > 0) inQ++;
      score += best;
    }
    // whole phrases beat loose words: "isa allowance", "us tax", "tax return"
    let phrase = 0;
    if (qc.length > 5 && d.qc.includes(qc)) phrase += 8;
    for (const k of d.kp) { if (qc === k) phrase += 10; else if (qc.includes(k) || (qc.length > 3 && k.includes(qc))) phrase += 6; }
    if (matched === 0 && phrase === 0) continue;
    const tight = qt.length ? (inQ / Math.max(d.q.length, 1)) * 4 : 0;
    hits.push({ doc: d.doc as T, score: score + phrase + tight + (qt.length ? (matched / qt.length) * 4 : 0), matched: Math.max(matched, phrase ? 1 : 0), total: Math.max(qt.length, 1) });
  }
  const need = Math.max(1, Math.ceil(qt.length * 0.5));
  return hits.filter((h) => h.matched >= need).sort((a, b) => b.score - a.score);
}
