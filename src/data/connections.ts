import { ACCOUNTS, type Account } from '@/data/wealth';

// Sample connection metadata. In production this comes from the aggregation layer.
/** Same rule Monzo uses for connected accounts: access must be reconfirmed every 90 days. */
export const RENEW_DAYS = 90;
export const WARN_DAYS = 14;

export type Source = 'Open banking' | 'Provider feed' | 'Exchange (read-only)' | 'Valuation estimate' | 'Entered by you';
export type ConnStatus = 'connected' | 'attention' | 'manual';

export type Connection = Account & {
  source: Source;
  status: ConnStatus;
  /** days until access needs reconfirming (connected feeds only) */
  renewsIn?: number;
  sees: string[];
  note?: string;
};

const META: Record<string, Pick<Connection, 'source' | 'status' | 'renewsIn' | 'sees' | 'note'>> = {
  nh: { source: 'Valuation estimate', status: 'manual', sees: ['Estimated market value', 'Mortgage balance'], note: 'Revalued each quarter from sold-price data.' },
  lis: { source: 'Valuation estimate', status: 'manual', sees: ['Estimated market value', 'Mortgage balance', 'Rental income'], note: 'Revalued each quarter from sold-price data.' },
  ibkr: { source: 'Provider feed', status: 'connected', renewsIn: 71, sees: ['Balances', 'Holdings and prices', 'Dividends and fees'] },
  hl: { source: 'Provider feed', status: 'connected', renewsIn: 64, sees: ['Balances', 'Holdings and prices', 'Dividends and fees'] },
  vg: { source: 'Provider feed', status: 'connected', renewsIn: 52, sees: ['Balances', 'Holdings and prices', 'Charges'] },
  av: { source: 'Provider feed', status: 'attention', renewsIn: 6, sees: ['Balances', 'Holdings and prices', 'Charges'], note: 'Access needs reconfirming in 6 days or this feed will pause.' },
  hs: { source: 'Entered by you', status: 'manual', sees: ['Shareholding and valuation you entered'], note: 'Last updated by you. Private company values are estimates.' },
  cts: { source: 'Open banking', status: 'connected', renewsIn: 80, sees: ['Balances', 'Transactions', 'Interest earned'] },
  bcl: { source: 'Open banking', status: 'connected', renewsIn: 41, sees: ['Balances', 'Transactions'] },
  cb: { source: 'Exchange (read-only)', status: 'connected', renewsIn: 88, sees: ['Balances', 'Holdings and prices'] },
  wt: { source: 'Entered by you', status: 'manual', sees: ['Valuation you entered'], note: 'Last valued on 12 Aug.' },
};

export const CONNECTIONS: Connection[] = ACCOUNTS.map((a) => ({ ...a, ...META[a.id] }));
export const attentionCount = () => CONNECTIONS.filter((c) => c.status === 'attention').length;
export const lastConfirmed = (c: Connection) => (c.renewsIn === undefined ? undefined : RENEW_DAYS - c.renewsIn);

export const ADD_OPTIONS = [
  ['A bank or savings account', 'Connected securely through open banking'],
  ['A pension or ISA provider', 'Your wealth manager, platform or pension provider'],
  ['An investment platform or exchange', 'Brokers, funds and crypto, read-only'],
  ['A property', 'We estimate its value and track the mortgage'],
  ['Art, wine or another asset', 'Add it yourself with a valuation'],
  ['A private company stake', 'Add your holding and update the value'],
] as const;
