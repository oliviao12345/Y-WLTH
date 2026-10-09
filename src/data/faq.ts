// Illustrative FAQ content for the Y-WLTH design concept. Entries marked `ours` are written for the concept.
export type Faq = { ours?: boolean; cat: 'The basics' | 'The app' | 'Your money' | 'Tax and planning' | 'Safety and security' | 'Working with us'; q: string; a: string; steps?: string[]; keywords?: string[] };

export const FAQ_CATS: Faq['cat'][] = ['Safety and security', 'The basics', 'The app', 'Your money', 'Tax and planning', 'Working with us'];

const BASE: Faq[] = [
  {
    ours: true,
    cat: 'The basics',
    q: 'What exactly do I get with Y-WLTH?',
    a: `Y-WLTH is a wealth adviser with an app, in four parts.

One view. We bring together your banks, wealth managers, pensions, ISAs, investments, property and other assets, such as art and wine, in one place on your phone and desktop. You do not need to move your money to start.

Independent analysis. We benchmark the performance, risk and cost of everything you hold against the Y-WLTH risk-equivalent benchmark, so you can see what you actually pay and what you actually get.

Advice. Your adviser team advises you on your investable assets, covering risk, currency, liquidity, costs and tax planning, and builds your financial life strategy: a forecast of your wealth to age 100, stress-tested.

You approve. Y-WLTH does the analysis and works out the recommended action. Recommendations come to you in the app and in encrypted chat with the reasoning and the estimated impact. You review each one, then approve it or discuss it with your adviser first.

Y-WLTH is designed for UK citizens and residents with £1m or more of investable assets.`,
  },
  {
    ours: true,
    cat: 'Your money',
    q: 'Does Y-WLTH give tax advice?',
    a: `Tax planning is part of the advice Y-WLTH gives, alongside risk, currency, liquidity and costs. It is not a standalone tax accountancy service.

What we help with: using your ISA and pension allowances well; how different investment wrappers affect your tax; making your investments more tax-efficient; and building tax into your long-term plan, which is stress-tested against it. We continuously monitor your tax allowances against your financial life strategy.

What Y-WLTH does not replace is a specialist tax adviser or accountant, for things like preparing your tax return, complex corporate tax, disputes with HMRC, or complicated international tax. Y-WLTH says it may not be right for you if you have complex non-UK taxes, such as US liabilities.`,
  },
  {
    cat: 'The basics',
    q: 'What does Y-WLTH do and why is it different?',
    a: `Y-WLTH is an independent WealthTech advisory business driven by data, not opinion. We provide a single, joined-up view of a client's entire financial set-up and advise on their investable assets — encompassing banks, managers, pensions, private investments and commitments — wherever they are held. Our platform also aggregates the rest of a client's wealth, including real estate, art and wine, into a single, comprehensive view of their entire balance sheet on both mobile and desktop. Every element of our advice is applied with the same analytical rigour as the world's most sophisticated investors.

What makes Y-WLTH different: Y-WLTH aggregates all providers — wealth managers, private banks, custodians — so that you can see them in a single view on your mobile and desktop, using our proprietary technology. The Financial life strategy translates aspirations around career, family and lifestyle into a defined financial plan. These are enduring reference points that guide the advice we provide. Institutional-Grade stress testing: We apply the sophisticated techniques of large institutional investors to an individual's wealth — stress-testing income, expenditure, returns, inflation, market shocks, and life expectancy to ensure their plan is genuinely resilient. Objective benchmarking: We assess the performance, risk and cost of every product a client holds against the Y-WLTH risk-equivalent benchmark — providing an objective, independent measure of whether each provider's returns justify the level of investment risk to which a client is exposed. Portfolio rebalancing: We continuously monitor and rebalance risk, cash, currency, illiquidity and tax allowances against each client's individual circumstances — the kind of ongoing oversight most wealth managers apply only to institutional money. Y-WLTH makes it easy for clients to stay on track with their investments with a mobile app.`,
  },
  {
    cat: 'The basics',
    q: 'How is Y-WLTH different from an IFA, financial planner, traditional wealth manager or private bank?',
    a: `IFAs, financial planners, traditional wealth managers and private banks each typically advise on, or manage, part of a client's financial setup. Y-WLTH provides an intelligent unified view across all of your assets and liabilities, wherever they are held. Y-WLTH uses data, proprietary technology and expert advice to provide a single, independent view across your whole financial life. This is what we call "central intelligence for money and life." We have adapted the approach of the big pension funds and insurance companies, and applied it to individuals and their financial plans. Our approach uses sophisticated models to analyse expenditure, income and returns, monitoring and balancing, currency, illiquidity and tax allowances against each client's individual circumstances. Additionally, we assess the quality and performance of financial products using the Y-WLTH investible risk-equivalent benchmark, leveraging our scale to reduce costs for clients. We bring our client's wealth into one place, giving them a single, joined-up view on desktop and mobile of their entire financial world.`,
  },
  {
    cat: 'The basics',
    q: 'Who gets the most value out of Y-WLTH?',
    a: `Typically, our clients have multiple assets, accounts or advisers, are time-poor, care about outcomes, risk and long-term alignment. They are often looking for transparency, control and the confidence that their wealth is being managed to meet their life aspirations. Our clients are leaders typically in the fields of professional services such as accounting, law, private equity and banking, and include C-suite and board members.`,
  },
  {
    cat: 'The basics',
    q: 'When might Y-WLTH not be right for you?',
    a: `These are some reasons why Y-WLTH may not be right for you: You are not a UK citizen or UK resident; You have investible assets of less than £1m; You primarily want to manage your own money; You do not agree with the philosophy and way in which Y-WLTH approaches wealth management (especially if you want to take 'bets' on particular securities, sectors, geographies, etc); You have complex non-UK taxes (e.g., US) and/or other liabilities.`,
  },
  {
    cat: 'Your money',
    q: 'Do you manage my money, or do I keep my existing banks and advisers?',
    a: `Y-WLTH provides analysis, advice and actionable intelligence across a client's entire balance sheet, irrespective of where assets are held. We advise on a client's investable assets, considering performance, manage risk, reduce costs and make better use of tax allowances, currency and liquidity. Clients are not required to move their investments to use the Y-WLTH platform; they can maintain relationships with their existing wealth managers, asset managers or banks. But, Y-WLTH data shows that the majority of traditional wealth managers historically underperform against Y-WLTH's risk-equivalent benchmark. Using the same institutional techniques applied by large pension funds and insurance companies — calibrating risk, investing cash efficiently, accessing illiquidity, using available tax allowances, improving efficiency and driving better performance — we can often find efficiencies of around 3% per annum (as an average) for our client's financial set-ups over a lifetime.`,
  },
  {
    cat: 'Your money',
    q: 'How do I keep track of all my investments, pensions, property and cash in one place?',
    a: `Y-WLTH gives their clients a single, joined-up view of their entire financial world. Through the desktop and mobile app, we provide clients with an aggregated view of their wealth, for example ISAs, pensions, cash, investments, properties and other assets held across different providers. Across multiple institutions and structures, clients can see exactly how everything connects and where they stand in relation to their financial plans and how these support their life. Wealth can be analysed holistically, rather than considered in isolation across different providers.`,
  },
  {
    cat: 'Your money',
    q: 'How should I think about managing risk across my whole portfolio?',
    a: `Most people hold investments in several places — a pension, an ISA, a managed account, in cash, and private investments. While each account may appear well-balanced on its own, when every position is brought together and examined holistically, concentrations often emerge: too much exposure to a single sector, currency or economic factor that no individual account revealed. Y-WLTH applies the same approach used by large pension funds and insurance companies to manage risk. We break each investment down into its underlying drivers — equities, interest rates, credit, inflation, currency — and measure those drivers consistently across every account and asset held. This methodology reveals the true risks across a client's entire balance sheet. We then calibrate that overall risk to your individual circumstances — your income, your plans, and your aspirations around career, family and lifestyle. The aim is not to eliminate risk, but to ensure it is the right amount of risk, allocated to the right places, for the life you are building.`,
  },
  {
    cat: 'Your money',
    q: 'Who manages my investments?',
    a: `Clients often have legacy asset managers and particular views or experiences of them. However when Y-WLTH runs its rigorous analysis on them, the data reveals that the manager is underperforming and/or over-charging, usually both. As such, Y-WLTH recommends that all clients use its automatic Rebalanced Portfolio Service. This service uses institutional quality funds and Y-WLTH's proprietary algorithm to gain investment exposure which perfectly tracks the Y-WLTH benchmark whilst keeping costs low.`,
  },
  {
    cat: 'Your money',
    q: 'What are your fees and how does pricing work?',
    a: `Y-WLTH fees are based on the total value of your investible investment portfolios and on the services you choose. We are not paid by product providers. We explain our fees clearly. There are no hidden commissions or incentives, and through our scale we are sometimes able to reduce the overall cost of managing your wealth.`,
  },
  {
    cat: 'Safety and security',
    q: 'How do I know my data is safe with you?',
    a: `Data security and privacy are fundamental to how Y-WLTH operates. We protect client data using enterprise-grade security standards that match the world's leading financial institutions. Our "security by design" architecture ensures that all client information is fully encrypted and managed within a highly secure infrastructure governed by strict access controls. Access to the Y-WLTH mobile and desktop app is protected by mandatory multi-factor authentication and biometric security (FaceID/TouchID), ensuring that only you can access your account. We protect clients' personal data in accordance with the UK General Data Protection Regulation (UK GDPR).`,
  },
  {
    cat: 'Safety and security',
    q: 'How do I know Y-WLTH is independent?',
    a: `Y-WLTH is not tied to any bank, platform or investment provider. We provide a single unified view over all of a client's providers, across both liquid and illiquid portfolios. We provide advice on a client's investible assets only. Our advice is driven by what is in our clients' best interests, and not by sales targets or product incentives. We receive income solely from our clients.`,
  },
  {
    cat: 'Safety and security',
    q: 'Who holds custody of my assets?',
    a: `Y-WLTH works with a range of highly regarded custodians, such as Multrees Investor Services, UBS AG and AJ Bell which we have assessed based on the quality of their service and costs. As part of the UK and international regulatory framework, strict rules apply to custodians about segregation of assets, performing reconciliations, third-party vetting, stress testing and governance.`,
  },
  {
    cat: 'Working with us',
    q: 'How do I get started? What happens next?',
    a: `Getting started with a new financial partner can often feel daunting. We've designed our process to be a blend of personal connection and expert analysis, at your pace. We have a duty of care to understand the "how" and "where" of your wealth.`,
    steps: [
      'Introduction — An initial conversation to get to know you and what you are looking for from Y-WLTH, and for you to learn more about our philosophy and how we work.',
      'Discovery — We sit down together to understand your personal circumstances, your finances and your life plans. This gives us a clear picture of where you are now and where you want to get to.',
      'Your financial life strategy — We believe your money should serve your life, not the other way around. At this stage we build your financial life strategy - a clear, visual forecast of your wealth out to age 100, stress-tested against inflation, tax, fees and market shocks, so you see exactly how your finances can match your ambitions and support the life you want to live. We then walk you through the strategy, agree on the first actions to take and map out what your first year with Y-WLTH would look like. This is where you decide whether you want to take things forward as a Y-WLTH client.',
      'Working together — After you have made the decision to become a Y-WLTH client, you will meet your dedicated adviser and advice team and become familiarised with the services and fees.',
    ],
  },
  {
    cat: 'Working with us',
    q: 'How often do you meet with clients?',
    a: `We meet several times at the outset of our relationship as we build a client's financial life strategy and establish how we are going to work together. Everyone's preferences for contact are different. Some clients prefer regular meetings, while others like to keep in touch via Y-WLTH's mobile app or by email. We adapt to what works best for each client. Whatever those preferences, as a matter of course, we always hold an annual strategy meeting with each client or family to holistically review their financial life strategy.`,
  },
];

import { BANK, KEYWORDS } from '@/data/faqBank';

const OFFER_KEYWORDS = ['what do you offer', 'what do i get', 'services', 'proposition', 'summary', 'what is ywlth', 'what does ywlth do', 'explain', 'about', 'overview', 'in plain english', 'benefits'];
const TAX_KEYWORDS = ['tax', 'tax advice', 'tax planning', 'allowances', 'tax efficient', 'do you give tax advice'];
const FIRST: Record<string, string[]> = {
  'What exactly do I get with Y-WLTH?': OFFER_KEYWORDS,
  'Does Y-WLTH give tax advice?': TAX_KEYWORDS,
};

const all = [...BASE, ...BANK].map((f) => ({ ...f, keywords: [...(f.keywords ?? []), ...(KEYWORDS[f.q] ?? []), ...(FIRST[f.q] ?? [])] }));
const top = ['Can anyone download and use the Y-WLTH app?', 'What exactly do I get with Y-WLTH?', 'Does Y-WLTH give tax advice?', 'How do I become a Y-WLTH client?'];
/** The full Q&A bank: the three questions people most need first, then everything else. */
export const FAQ: Faq[] = [...top.map((q) => all.find((f) => f.q === q)!), ...all.filter((f) => !top.includes(f.q))];
