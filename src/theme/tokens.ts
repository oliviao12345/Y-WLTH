// Y-WLTH brand tokens. Navy / teal / orange / purple are taken from example.com's theme CSS
// (#09103f, #01d0d2, #fa4e19, #7130a0); everything else is derived for a dark premium UI.
export const c = {
  bg: '#05092B',
  bgDeep: '#030620',
  navy: '#09103F',
  card: '#0D1547',
  cardHi: '#141D5E',
  border: 'rgba(255,255,255,0.08)',
  borderHi: 'rgba(255,255,255,0.16)',
  text: '#F5F7FF',
  textDim: '#B6BEE0',
  muted: '#7F8AB8',
  teal: '#01D0D2',
  tealSoft: 'rgba(1,208,210,0.14)',
  orange: '#FA4E19',
  orangeSoft: 'rgba(250,78,25,0.14)',
  purple: '#7130A0',
  violet: '#A66BDB',
  periwinkle: '#6C8BFF',
  amber: '#FFC861',
  slate: '#8092AC',
  white: '#FFFFFF',
} as const;

export const font = {
  r: 'Rubik_400Regular',
  m: 'Rubik_500Medium',
  sb: 'Rubik_600SemiBold',
  b: 'Rubik_700Bold',
} as const;

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const gbp = (n: number, opts: { sign?: boolean; decimals?: number } = {}) => {
  const { sign = false, decimals = 0 } = opts;
  const abs = Math.abs(n).toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const s = n < 0 ? '-' : sign && n > 0 ? '+' : '';
  return `${s}£${abs}`;
};

export const gbpCompact = (n: number) => {
  const a = Math.abs(n);
  const s = n < 0 ? '-' : '';
  if (a >= 1_000_000) return `${s}£${(a / 1_000_000).toFixed(2)}m`;
  if (a >= 10_000) return `${s}£${Math.round(a / 1000)}k`;
  if (a >= 1_000) return `${s}£${(a / 1000).toFixed(1)}k`;
  return `${s}£${Math.round(a)}`;
};

export const pct = (n: number, d = 1) => `${n > 0 ? '+' : ''}${n.toFixed(d)}%`;
