import { ACCOUNTS } from '@/data/wealth';

/**
 * Y-WLTH's own advice fee. Y-WLTH says its fees "are based on the total value of your investible investment portfolios
 * and on the services you choose", with no commission from product providers. The actual rate is agreed per client and
 * is not public, so the rate below is a SAMPLE for this concept. Replace `pct` with the client's agreed fee (or read it
 * from their account) and every screen updates: net costs, the money view, the forecast and the ask bar.
 */
export const YWLTH_FEE = {
  label: 'Y-WLTH advice fee',
  pct: 0.8,
  sample: true,
  basis: 'the value of your investable portfolios',
} as const;

/** Investable portfolios the fee is charged on: cash, investments and pensions (not property or private stakes). */
export const feeBase = () => ACCOUNTS.filter((a) => ['cash', 'equities', 'pension'].includes(a.cls)).reduce((s, a) => s + a.value, 0);
export const ywlthFeeAnnual = () => (feeBase() * YWLTH_FEE.pct) / 100;
export const ywlthFeeMonthly = () => ywlthFeeAnnual() / 12;
