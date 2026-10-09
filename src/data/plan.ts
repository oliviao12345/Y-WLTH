// Sample (illustrative) plan content. In production this is the strategy your adviser team agrees with the client.
export const PLAN = {
  name: 'Your Financial Life Strategy',
  horizon: 'Built around your life to age 100',
  summary: 'Use what you keep each month to clear the Notting Hill mortgage, pay school fees and reach financial independence at 58, while keeping a cash safety net and staying tax-efficient.',
  /** Plain-English actions per goal id, in the order they should happen. */
  steps: {
    edu: ['Pay fees from the monthly surplus and earmarked cash.', 'Review in 2030 so fees from age 11 are fully covered.'],
    mort: ['Hold cash and ISA earmarked for the balance.', 'Move to a fixed rate at the next renewal, then overpay within the lender limit.'],
    ret: ['Keep paying into your SIPP and workplace pension up to the annual allowance.', 'Build the pot to the level that supports £90k a year at a 4% drawdown.'],
  } as Record<string, string[]>,
  principles: [
    ['Safety net first', 'Keep about six months of living costs in cash before investing more.'],
    ['Use tax wrappers', 'Fill pensions and ISAs each year before investing outside them.'],
    ['Stay diversified', 'Spread across property, investments, pensions and cash, with no single holding doing all the work.'],
  ] as const,
  assumptions: ['60% of your monthly surplus goes toward goals, split evenly.', 'Retirement pot sized for a 4% annual drawdown.', 'Dates are before investment growth, inflation and tax.'],
};
