// Suggested questions for the ask bars: a pool across every area, so the chips show breadth, not one topic.
export type Area = 'wealth' | 'forecast' | 'performance' | 'risk' | 'money' | 'accounts' | 'ywlth';

export const SUGGESTION_POOL: Record<Area, string[]> = {
  wealth: ["What's my net worth?", 'How much do I have in property?', 'How much is in my pensions?', 'How much is in cash?'],
  forecast: ["What will my net worth be when I'm 60?", 'Will my money last to 100?', 'When will I reach £5m?'],
  performance: ['How are my investments performing?', 'Am I beating the benchmark?', 'How much do I pay in fees?'],
  risk: ['How risky is my portfolio?', 'What are my biggest risks?', 'How exposed am I to currency?'],
  money: ['How much am I left with this month?', 'What are my biggest expenses?', 'Where does my income come from?'],
  accounts: ['Which accounts need reconfirming?', 'How are my accounts connected?'],
  ywlth: ['Can anyone use the Y-WLTH app?', 'How do I become a client?', 'Does Y-WLTH give tax advice?', 'What does Y-WLTH cost?', 'Can I talk to my adviser?'],
};

const AREAS = Object.keys(SUGGESTION_POOL) as Area[];
const shuffle = <T,>(a: T[]) => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };

/** One question from each of `n` different areas, in random order. `include` guarantees an area is represented. */
export function suggest(n = 4, include?: Area): string[] {
  const areas = shuffle(AREAS.filter((a) => a !== include)).slice(0, include ? n - 1 : n);
  if (include) areas.unshift(include);
  return shuffle(areas).map((a) => shuffle(SUGGESTION_POOL[a])[0]);
}
