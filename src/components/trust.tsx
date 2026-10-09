import React from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Icon } from '@/components/ui';
import { router } from 'expo-router';
import { Button, Container, Eyebrow, H2, P, open } from '@/components/site';
import { dial } from '@/lib/call';
import { TAX } from '@/data/tax';
import { AccessStory } from '@/components/AccessStory';
import { c, font } from '@/theme/tokens';

/** A quiet, factual line.  */
export function TrustStrip() {
  return (
    <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.border, backgroundColor: 'rgba(255,255,255,0.02)' }}>
      <Container style={{ paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <Icon name="check" size={15} color={c.teal} />
        <Text style={{ fontFamily: font.m, fontSize: 13.5, color: c.textDim, textAlign: 'center' }}>A design concept using illustrative sample data</Text>
      </Container>
    </View>
  );
}

const STEPS: [string, string][] = [
  ['Dashboard', 'Everything you own and owe, from every provider, in one view.'],
  ['Analyse', 'Performance, risk and cost, independently benchmarked.'],
  ['Plan', 'Your financial life strategy to age 100, stress-tested.'],
  ['Advice', 'Advice from your adviser team, in encrypted chat.'],
  ['Approve', 'Y-WLTH recommends the action. You review it and approve it, or discuss it first.'],
];

export function FiveSteps() {
  const { width } = useWindowDimensions();
  const wide = width > 980;
  return (
    <Container style={{ paddingVertical: 80, gap: 28 }}>
      <View style={{ gap: 14 }}>
        <Eyebrow>One App, Start To Finish</Eyebrow>
        <H2 wide caps>From Seeing Your Wealth To Acting On Advice</H2>
        <P>Y-WLTH isn't a tracker with advice added on. The app is the front door to your whole wealth and to the people who advise you on it.</P>
      </View>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 12 }}>
        {STEPS.map(([t, d], i) => (
          <View key={t} style={{ flex: 1, padding: 22, borderRadius: 22, backgroundColor: c.card, borderWidth: 1, borderColor: i === 3 ? 'rgba(1,208,210,0.45)' : c.border, gap: 8 }}>
            <Text style={{ fontFamily: font.b, fontSize: 13, color: c.teal }}>0{i + 1}</Text>
            <Text style={{ fontFamily: font.sb, fontSize: 20, color: c.text }}>{t}</Text>
            <Text style={{ fontFamily: font.r, fontSize: 14, lineHeight: 21, color: c.textDim }}>{d}</Text>
          </View>
        ))}
      </View>
    </Container>
  );
}

/** The offer, in plain English, in one minute: what you get, who it is for, what it costs, how you start. */
export function PlainEnglish() {
  const { width } = useWindowDimensions();
  const wide = width > 980;
  const parts: [string, string, string][] = [
    ['1', 'We Connect Everything You Own', 'Banks, wealth managers, pensions, ISAs, investments, property and even art and wine, in one view. You keep your existing providers.'],
    ['2', 'We Analyse It Independently', 'Performance, risk and cost of every holding, benchmarked against the Y-WLTH risk-equivalent benchmark.'],
    ['3', 'We Advise You', 'Advice on your investments, risk, currency, liquidity, costs and tax planning, built around a financial life strategy to age 100.'],
    ['4', 'We Recommend, You Approve', 'Y-WLTH does the analysis and works out the recommended action. You see why and the estimated impact, then approve it or talk it through with your adviser. Nothing changes until you approve.'],
  ];
  const facts: [string, string][] = [
    ['Who it is for', 'UK citizens and residents with £1m or more of investable assets, who want transparency, control and advice with nothing to sell.'],
    ['What it costs', "A fee based on the value of your investable portfolios and the services you choose. We are not paid by product providers, and there are no hidden commissions."],
    ['How you start', 'An introduction, then discovery, then your financial life strategy. You decide whether to go ahead once you have seen it.'],
    ['Tax', 'Tax planning is part of our advice, not a separate accountancy service. For complex non-UK tax, such as US liabilities, Y-WLTH may not be the right fit. Details below.'],
  ];
  return (
    <Container style={{ paddingVertical: 84, gap: 32 }}>
      <View style={{ gap: 14 }}>
        <Eyebrow>What Y-WLTH Does</Eyebrow>
        <H2 wide caps>An Adviser, With An App That Shows You Everything</H2>
        <P>Y-WLTH looks at all of your money together, tells you honestly how it is doing, and advises you on how to make it work better. All of it happens in one app.</P>
      </View>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 14 }}>
        {parts.map(([n, t, d]) => (
          <View key={n} style={{ flex: 1, padding: 24, borderRadius: 24, backgroundColor: c.card, borderWidth: 1, borderColor: n === '3' ? 'rgba(1,208,210,0.45)' : c.border, gap: 10 }}>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.tealSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: font.b, fontSize: 15, color: c.teal }}>{n}</Text></View>
            <Text style={{ fontFamily: font.sb, fontSize: 19, lineHeight: 25, color: c.text }}>{t}</Text>
            <Text style={{ fontFamily: font.r, fontSize: 14.5, lineHeight: 22, color: c.textDim }}>{d}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 0, borderRadius: 24, borderWidth: 1, borderColor: c.border, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)' }}>
        {facts.map(([k, v], i) => (
          <View key={k} style={{ flex: 1, padding: 22, gap: 6, borderLeftWidth: wide && i ? 1 : 0, borderTopWidth: !wide && i ? 1 : 0, borderColor: c.border }}>
            <Text style={{ fontFamily: font.m, fontSize: 12, letterSpacing: 1.2, color: c.teal, textTransform: 'uppercase' }}>{k}</Text>
            <Text style={{ fontFamily: font.r, fontSize: 14, lineHeight: 21, color: c.textDim }}>{v}</Text>
          </View>
        ))}
      </View>
    </Container>
  );
}

const ACCESS_STEPS: [string, string][] = [
  ['Introduction', 'A conversation about what you want from your money and how we work.'],
  ['Discovery', 'We learn your circumstances, finances and life plans.'],
  ['Your Strategy', 'We build your financial life strategy to age 100 and walk you through it.'],
  ['You Decide', 'Having seen it, you choose whether to become a client.'],
  ['Onboarding & App', 'You meet your adviser team and are given access to the app.'],
];

/** Crystal clear: the app is for clients, here is exactly how you become one, and who qualifies. */
export function AccessSection() {
  const { width } = useWindowDimensions();
  const wide = width > 1000;
  const cmp = width > 760;
  return (
    <View style={{ backgroundColor: c.navy, borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.border }}>
      <Container style={{ paddingVertical: 84, gap: 32 }}>
        <View style={{ gap: 14 }}>
          <Eyebrow>Getting Access</Eyebrow>
          <H2 wide caps>The Y-WLTH App Is For Y-WLTH Clients</H2>
          <P>You can't sign up and start using it like a banking or budgeting app. Y-WLTH is an advice service, so the app opens for you once you've become a client. It starts with a conversation, not a form. Here is exactly how it works.</P>
        </View>

        <AccessStory />

        <View style={{ flexDirection: cmp ? 'row' : 'column', gap: 14 }}>
          <View style={{ flex: 1, padding: 24, borderRadius: 24, backgroundColor: 'rgba(1,208,210,0.07)', borderWidth: 1, borderColor: 'rgba(1,208,210,0.3)', gap: 12 }}>
            <Text style={{ fontFamily: font.m, fontSize: 12, letterSpacing: 1.2, color: c.teal, textTransform: 'uppercase' }}>Who Y-WLTH Works With</Text>
            <Text style={{ fontFamily: font.sb, fontSize: 22, lineHeight: 28, color: c.text }}>UK citizens and residents with £1m or more of investable assets</Text>
            {['Multiple assets, accounts or advisers', 'Time-poor, and focused on outcomes and risk', 'Want transparency, control and long-term alignment', 'Often leaders in accounting, law, private equity and banking'].map((t) => (
              <View key={t} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}><View style={{ marginTop: 3 }}><Icon name="check" size={16} color={c.teal} /></View><Text style={{ flex: 1, fontFamily: font.r, fontSize: 14.5, lineHeight: 21, color: c.textDim }}>{t}</Text></View>
            ))}
          </View>
          <View style={{ flex: 1, padding: 24, borderRadius: 24, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, gap: 12 }}>
            <Text style={{ fontFamily: font.m, fontSize: 12, letterSpacing: 1.2, color: c.muted, textTransform: 'uppercase' }}>When Y-WLTH May Not Be Right</Text>
            <Text style={{ fontFamily: font.sb, fontSize: 22, lineHeight: 28, color: c.text }}>We would rather tell you honestly at the start</Text>
            {['You are not a UK citizen or UK resident', 'You have investable assets of less than £1m', 'You mainly want to manage your own money', "You want to take 'bets' on particular securities, sectors or geographies", 'You have complex non-UK taxes, such as US liabilities'].map((t) => (
              <View key={t} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}><Text style={{ fontFamily: font.m, fontSize: 15, color: c.muted, marginTop: -1 }}>–</Text><Text style={{ flex: 1, fontFamily: font.r, fontSize: 14.5, lineHeight: 21, color: c.textDim }}>{t}</Text></View>
            ))}
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <Button label="Call Us To Start" onPress={dial} />
          <Button label="Read The FAQ" ghost onPress={() => router.push('/faq' as never)} />
          <Text style={{ fontFamily: font.r, fontSize: 13.5, color: c.muted }}>Already a client? Use Log In above.</Text>
        </View>
      </Container>
    </View>
  );
}

/** The tax offering in two short lists: what Y-WLTH does, and what it does not replace. */
export function TaxSection() {
  const { width } = useWindowDimensions();
  const cmp = width > 760;
  return (
    <Container style={{ paddingVertical: 84, gap: 28 }}>
      <View style={{ gap: 14 }}>
        <Eyebrow>Tax</Eyebrow>
        <H2 wide caps>{TAX.title}</H2>
        <P>{TAX.lead}</P>
      </View>
      <View style={{ flexDirection: cmp ? 'row' : 'column', gap: 14 }}>
        <View style={{ flex: 1, padding: 26, borderRadius: 24, backgroundColor: 'rgba(1,208,210,0.07)', borderWidth: 1, borderColor: 'rgba(1,208,210,0.3)', gap: 12 }}>
          <Text style={{ fontFamily: font.m, fontSize: 12, letterSpacing: 1.2, color: c.teal, textTransform: 'uppercase' }}>{TAX.doesTitle}</Text>
          {TAX.does.map((t) => (
            <View key={t} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}><View style={{ marginTop: 3 }}><Icon name="check" size={17} color={c.teal} /></View><Text style={{ flex: 1, fontFamily: font.r, fontSize: 15.5, lineHeight: 23, color: c.text }}>{t}</Text></View>
          ))}
        </View>
        <View style={{ flex: 1, padding: 26, borderRadius: 24, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, gap: 12 }}>
          <Text style={{ fontFamily: font.m, fontSize: 12, letterSpacing: 1.2, color: c.muted, textTransform: 'uppercase' }}>{TAX.staysTitle}</Text>
          {TAX.stays.map((t) => (
            <View key={t} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}><Text style={{ fontFamily: font.m, fontSize: 16, color: c.muted, marginTop: -1 }}>–</Text><Text style={{ flex: 1, fontFamily: font.r, fontSize: 15.5, lineHeight: 23, color: c.textDim }}>{t}</Text></View>
          ))}
        </View>
      </View>
      <Text style={{ fontFamily: font.r, fontSize: 13.5, lineHeight: 20, color: c.muted, maxWidth: 760 }}>{TAX.note}</Text>
    </Container>
  );
}
