import React, { useMemo, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, YBranch } from '@/components/ui';
import { CTA, Container, Eyebrow, Footer, H2, Nav, P, Button, open } from '@/components/site';
import { Phone } from '@/components/Phone';
import { HeroDemo } from '@/components/HeroDemo';
import { AccessSection, FiveSteps, PlainEnglish, TaxSection, TrustStrip } from '@/components/trust';
import { dial } from '@/lib/call';
import { AnswerCard } from '@/components/AnswerCard';
import { HomeScreen } from '@/screens/HomeScreen';
import { MoneyScreen } from '@/screens/MoneyScreen';
import { PlanScreen } from '@/screens/PlanScreen';
import { InsightsScreen } from '@/screens/InsightsScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { askAnything, type Answer } from '@/lib/ask';
import { suggest } from '@/lib/suggestions';
import { sampleHistory } from '@/lib/money';
import { c, font } from '@/theme/tokens';








function Hero() {
  const { width } = useWindowDimensions();
  const wide = width > 940;
  return (
    <View style={{ overflow: 'hidden' }}>
      <LinearGradient colors={['rgba(1,208,210,0.20)', 'rgba(113,48,160,0.14)', 'rgba(5,9,43,0)']} locations={[0, 0.45, 1]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ position: 'absolute', inset: 0 } as object} />
      <Container style={{ flexDirection: wide ? 'row' : 'column', alignItems: 'center', paddingTop: (wide ? 72 : 44) + 68, paddingBottom: 80, gap: 48 }}>
        <View style={{ flex: wide ? 1.1 : undefined, gap: 26 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(1,208,210,0.35)', backgroundColor: c.tealSoft }}>
            <YBranch size={16} />
            <Text style={{ fontFamily: font.m, fontSize: 12.5, color: c.teal }}>Wealth, with the lights on</Text>
          </View>
          <Text style={{ fontFamily: font.sb, fontSize: width < 700 ? 44 : 74, lineHeight: width < 700 ? 48 : 78, letterSpacing: width < 700 ? -1.8 : -3, color: c.text }}>
            All your wealth.{'\n'}
            <Text style={{ color: c.teal }}>One clear view.</Text>
          </Text>
          <P style={{ fontSize: 19, lineHeight: 30 }}>
            Y-WLTH is a wealth adviser with an app. We bring everything you own into one view, analyse it independently, and advise you on it, including how to plan for tax.
          </P>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6 }}>
            <Button label="Call Us" onPress={dial} />
            <Link href="/home" asChild><Pressable><View><Button label="Explore The App" ghost onPress={() => {}} /></View></Pressable></Link>
          </View>
          <View style={{ flexDirection: 'row', gap: 22, flexWrap: 'wrap', marginTop: 10 }}>
            {['App for Y-WLTH clients', 'Start with a conversation', 'Adviser-led advice'].map((t) => (
              <View key={t} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Icon name="check" size={16} color={c.teal} />
                <Text style={{ fontFamily: font.m, fontSize: 14, color: c.textDim }}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={{ flex: wide ? 0.9 : undefined, alignItems: 'center' }}>
          <HeroDemo />
        </View>
      </Container>
    </View>
  );
}

const PAINS = [
  ['Scattered', 'Accounts, properties and pensions live in different places, so nobody sees the whole.'],
  ['Opaque', 'Reports that bury performance, risk and what you actually pay.'],
  ['Conflicted', 'Advice that happens to lead back to a product.'],
  ['Generic', 'Plans built on returns, not on the life you want.'],
  ['Complicated', 'Structures, products and tax that nobody explains in plain English.'],
] as const;

function Problem() {
  const { width } = useWindowDimensions();
  const cols = width > 1000 ? 5 : width > 640 ? 3 : 1;
  return (
    <Container style={{ paddingVertical: 90 }}>
      <Eyebrow>The problem</Eyebrow>
      <View style={{ marginTop: 14 }}><H2>Wealth is complicated. Seeing it shouldn't be.</H2></View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 44 }}>
        {PAINS.map(([t, d], i) => (
          <View key={t} style={{ flexBasis: cols === 1 ? '100%' : `${100 / cols - 2}%`, flexGrow: 1, minWidth: 170, padding: 22, borderRadius: 22, backgroundColor: c.card, borderWidth: 1, borderColor: c.border }}>
            <Text style={{ fontFamily: font.m, fontSize: 13, color: c.orange }}>0{i + 1}</Text>
            <Text style={{ fontFamily: font.sb, fontSize: 21, color: c.text, marginTop: 14 }}>{t}</Text>
            <Text style={{ fontFamily: font.r, fontSize: 14.5, lineHeight: 22, color: c.textDim, marginTop: 8 }}>{d}</Text>
          </View>
        ))}
      </View>
    </Container>
  );
}

function Feature({ eyebrow, title, body, bullets, phone, flip }: { eyebrow: string; title: string; body: string; bullets: string[]; phone: React.ReactNode; flip?: boolean }) {
  const { width } = useWindowDimensions();
  const wide = width > 940;
  return (
    <Container style={{ flexDirection: wide ? (flip ? 'row-reverse' : 'row') : 'column', alignItems: 'center', gap: 56, paddingVertical: 56 }}>
      <View style={{ flex: wide ? 1 : undefined, gap: 20 }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <H2>{title}</H2>
        <P>{body}</P>
        <View style={{ gap: 12, marginTop: 6 }}>
          {bullets.map((b) => (
            <View key={b} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <View style={{ marginTop: 3 }}><Icon name="check" size={18} color={c.teal} /></View>
              <Text style={{ flex: 1, fontFamily: font.r, fontSize: 16, lineHeight: 24, color: c.text }}>{b}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={{ flex: wide ? 0.8 : undefined, alignItems: 'center' }}>{phone}</View>
    </Container>
  );
}

function AskDemo() {
  const hist = useMemo(() => sampleHistory(), []);
  const [q, setQ] = useState('');
  const [chips] = useState(() => suggest(5));
  const [a, setA] = useState<Answer>(() => askAnything('How much am I left with this month?', hist));
  const run = (t: string) => { setQ(t); setA(askAnything(t, hist)); };
  const { width } = useWindowDimensions();
  const wide = width > 940;
  return (
    <View style={{ backgroundColor: c.navy, borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.border }}>
      <Container style={{ paddingVertical: 90, flexDirection: wide ? 'row' : 'column', gap: 56 }}>
        <View style={{ flex: 1, gap: 18 }}>
          <Eyebrow>Money Insights</Eyebrow>
          <H2>Ask your money a question. Get a straight answer.</H2>
          <P>Ask about everything you earn, own and spend. Every answer states its period, shows the working and links back to where the figure came from. These are automated answers, not personal advice: questions that need advice, including tax planning, go to your adviser team.</P>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {chips.map((s) => (
              <Pressable key={s} onPress={() => run(s)} style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: c.borderHi }}>
                <Text style={{ fontFamily: font.r, fontSize: 13.5, color: c.textDim }}>{s}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => run('What is the tax on my dividends?')} style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(250,78,25,0.4)' }}>
              <Text style={{ fontFamily: font.r, fontSize: 13.5, color: c.orange }}>Ask about tax</Text>
            </Pressable>
          </View>
        </View>
        <View style={{ flex: 1.05, gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: c.borderHi, paddingLeft: 16, paddingRight: 6 }}>
            <YBranch size={22} />
            <TextInput
              value={q}
              onChangeText={setQ}
              onSubmitEditing={() => run(q)}
              placeholder="Ask about your income, costs or the year ahead"
              placeholderTextColor={c.muted}
              style={{ flex: 1, color: c.text, fontFamily: font.r, fontSize: 15.5, padding: 16, outlineStyle: 'none' } as object}
            />
            <Pressable onPress={() => run(q)} style={{ backgroundColor: c.teal, width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="send" size={18} color={c.navy} />
            </Pressable>
          </View>
          <AnswerCard a={a} onClose={() => { setQ(''); setA(askAnything('How much am I left with this month?', hist)); }} />
          <Text style={{ fontFamily: font.r, fontSize: 12, color: c.muted }}>Live demo running on sample data. This is the same engine as the app.</Text>
        </View>
      </Container>
    </View>
  );
}

function Principles() {
  const { width } = useWindowDimensions();
  const cols = width > 900;
  const items = [
    ['Conflict-free', 'We earn nothing from what you buy. Our recommendations have no one to please but you.'],
    ['Transparent', 'Independent analysis of performance, risk and cost, across every provider you use.'],
    ['Life-centric', 'We plan around lifestyle and ambition first, then work out what the money needs to do.'],
  ];
  return (
    <Container style={{ paddingVertical: 100 }}>
      <Eyebrow>How we work</Eyebrow>
      <View style={{ marginTop: 14 }}><H2 wide>For independent thinkers who want counsel, not a sales pitch.</H2></View>
      <View style={{ flexDirection: cols ? 'row' : 'column', gap: 16, marginTop: 48 }}>
        {items.map(([t, d]) => (
          <View key={t} style={{ flex: 1, padding: 28, borderRadius: 26, backgroundColor: c.card, borderWidth: 1, borderColor: c.border }}>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.tealSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={22} color={c.teal} />
            </View>
            <Text style={{ fontFamily: font.sb, fontSize: 23, color: c.text, marginTop: 20 }}>{t}</Text>
            <Text style={{ fontFamily: font.r, fontSize: 15.5, lineHeight: 24, color: c.textDim, marginTop: 8 }}>{d}</Text>
          </View>
        ))}
      </View>
    </Container>
  );
}



export default function Site() {
  const scroll = useRef<ScrollView>(null);
  const offsets = useRef<Record<string, number>>({});
  const go = (id: string) => scroll.current?.scrollTo({ y: Math.max(0, (offsets.current[id] ?? 0) - 72), animated: true });
  const { go: goParam } = useLocalSearchParams<{ go?: string }>();
  React.useEffect(() => { if (goParam) { const t = setTimeout(() => go(goParam), 700); return () => clearTimeout(t); } }, [goParam]); // eslint-disable-line react-hooks/exhaustive-deps
  const A = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <View nativeID={id} onLayout={(e) => { offsets.current[id] = e.nativeEvent.layout.y; }}>{children}</View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView ref={scroll}>
        <Nav onGo={go} />
        <Hero />
        <TrustStrip />
        <AccessSection />
        <PlainEnglish />
        <TaxSection />
        <FiveSteps />
        <A id="what"><Problem /></A>
        <A id="app">
          <Feature
            eyebrow="Net worth"
            title="Every account, property and holding, in one place."
            body="Connect the banks, brokers and pensions you already use. See your net worth move, where it sits, and what each piece is doing, without stitching spreadsheets together."
            bullets={['Live net worth with a chart you can scrub, over 1 month to 1 year', 'A wealth health score and your net worth built up by asset class: property, investments, pensions, private business, cash and alternatives', 'Open assets or liabilities, then any asset class to see its accounts, and ask a question in plain English']}
            phone={<Phone width={330}><HomeScreen /></Phone>}
          />
        </A>
        <Feature
          flip
          eyebrow="Intelligence"
          title="Independent analysis of every pound, whoever manages it."
          body="Objective benchmarking of performance, cost and risk across all your providers. Y-WLTH does the analysis and recommends the action; you review it and approve it."
          bullets={['Actions show what Y-WLTH noticed, what it recommends, the estimated impact and the evidence behind it', 'Performance against a benchmark, what you pay in total, and how exposed you are to market shocks', 'You approve in the app, snooze it, or discuss it with your adviser first. Bigger decisions are flagged as best talked through first']}
          phone={<Phone width={330}><InsightsScreen /></Phone>}
        />
        <A id="insights"><AskDemo /></A>
        <Feature
          eyebrow="Money"
          title="What comes in, what goes out, what is left."
          body="The month, the year ahead and how you compare with a year ago. Tap any figure to see exactly how it was worked out."
          bullets={['Income, expenses and what is left over, for this month and projected for the year, across total, property or investments', 'Look back up to three years, and compare with a year ago, last month or six months to see what changed most', 'Tax payments kept out of the figures, projections clearly labelled']}
          phone={<Phone width={330}><MoneyScreen /></Phone>}
        />
        <Feature
          flip
          eyebrow="Plan"
          title="Your money, measured against your life."
          body="Your financial life strategy, built around the goals that matter, from clearing a mortgage to retiring on your terms. See what funds each goal and what happens if you put a little more away."
          bullets={['Goals funded by your real monthly surplus, each with progress, an on-track check and the steps we will take', 'What-if: add or remove £500 a month and watch each goal date move', 'Review the plan with your adviser, and stress-test it to age 100 in the Financial Forecast Simulator on the Wealth screen']}
          phone={<Phone width={330}><PlanScreen /></Phone>}
        />
        <Feature
          eyebrow="Profile"
          title="Advice, in your pocket."
          body="Message or call your adviser team from any screen. Advice arrives in encrypted chat, and Y-WLTH only acts on a recommendation once you have approved it."
          bullets={['Message, call or book a meeting with your adviser team', 'Tax planning and how your wealth is held, explained in plain English', 'Face ID, multi-factor security and your questions answered']}
          phone={<Phone width={330}><ProfileScreen /></Phone>}
        />
        <A id="how"><Principles /></A>
        <CTA />
        <Footer />
      </ScrollView>
    </View>
  );
}
