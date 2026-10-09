import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card, FitText, Icon, Pill, Row, SectionHeader, Segmented, Txt, Wordmark, YBranch } from '@/components/ui';
import { LineChart, Ring, StackedArea } from '@/components/charts';
import { LiveEarn } from '@/components/LiveEarn';
import { WealthAsk } from '@/components/WealthAsk';
import { ALL_STRESS, NO_STRESS, atAge, forecast } from '@/lib/forecast';
import { InsightCard } from '@/components/InsightCard';
import { useStore } from '@/lib/store';
import { useCountUp } from '@/lib/hooks';
import { ACCOUNTS, LIABILITIES, RANGES, netWorthSeries, totals } from '@/data/wealth';
import { health, insights, prize, strata } from '@/lib/intelligence';
import { addMonths, figuresFor, liveFigures, monthKey, monthLabel, sampleHistory } from '@/lib/money';
import { c, font, gbp, gbpCompact, pct } from '@/theme/tokens';

export function HomeScreen() {
  const series = useMemo(netWorthSeries, []);
  const { assets, liabilities, net } = totals();
  const [range, setRange] = useState<(typeof RANGES)[number]['k']>('1Y');
  const [scrub, setScrub] = useState<number | null>(null);
  const [layer, setLayer] = useState<number | null>(null);
  const { status, profile, isSnoozed, snoozed } = useStore();

  const days = RANGES.find((r) => r.k === range)!.days;
  const data = useMemo(() => series.slice(-days - 1), [series, days]);
  const live = useCountUp(net, 1800);
  const shown = scrub !== null ? data[scrub] : live;
  const base = data[data.length - 1] - (data[data.length - 1] - data[0]);
  const delta = (scrub !== null ? data[scrub] : data[data.length - 1]) - data[0];
  const deltaPct = (delta / base) * 100;

  const layers = useMemo(strata, []);
  const h = useMemo(health, []);
  const top = useMemo(() => insights().filter((i) => (status[i.id] ?? 'new') === 'new' && !isSnoozed(i.id)).slice(0, 2), [status, snoozed]); // eslint-disable-line react-hooks/exhaustive-deps
  const pz = prize();
  const month = liveFigures('total');
  const nowD = new Date();
  const hist = useMemo(() => sampleHistory(), []);
  const prevKey = monthKey(addMonths(nowD, -1));
  const prev = figuresFor(prevKey, 'total', hist);
  const keptPct = month.income ? (month.left / month.income) * 100 : 0;
  const vsPrev = month.left - prev.left;
  const prevName = new Date(nowD.getFullYear(), nowD.getMonth() - 1, 1).toLocaleDateString('en-GB', { month: 'long' });
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const scoreColor = h.score >= 80 ? c.teal : h.score >= 65 ? c.amber : c.orange;

  return (
    <Screen>
      <Txt v="small" style={{ marginTop: 6 }}>{greet}</Txt>
      <Txt v="label" style={{ marginTop: 12 }}>{scrub !== null ? 'Net worth · selected day' : 'Your net worth'}</Txt>
      <FitText max={58} style={{ fontFamily: font.sb, letterSpacing: -2.2, color: c.text, marginTop: 2, fontVariant: ['tabular-nums'] }}>{gbp(shown)}</FitText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
        <Pill tone={delta >= 0 ? 'pos' : 'neg'}>{gbp(delta, { sign: true })}  ·  {pct(deltaPct)}</Pill>
        <Txt v="small">past {range === '1M' ? 'month' : range === '3M' ? '3 months' : range === '6M' ? '6 months' : 'year'}</Txt>
      </View>

      <View style={{ marginTop: 18 }}><WealthAsk /></View>

      <View style={{ marginTop: 16 }}><LiveEarn /></View>

      <View style={{ marginTop: 16, marginHorizontal: -20 }}>
        <LineChart data={data} onScrub={setScrub} height={170} />
      </View>
      <View style={{ marginTop: 12 }}>
        <Segmented options={RANGES.map((r) => ({ k: r.k, label: r.k }))} value={range} onChange={setRange} small />
      </View>

      <Pressable onPress={() => router.push('/forecast' as never)} style={({ pressed }) => ({ marginTop: 18, borderRadius: 22, overflow: 'hidden', opacity: pressed ? 0.9 : 1, borderWidth: 1, borderColor: 'rgba(1,208,210,0.4)' })}>
        <LinearGradient colors={['rgba(1,208,210,0.18)', 'rgba(113,48,160,0.22)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(5,9,43,0.55)', alignItems: 'center', justifyContent: 'center' }}><YBranch size={24} /></View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: font.sb, fontSize: 16.5, color: c.text }}>Financial Forecast Simulator</Text>
            <Text style={{ fontFamily: font.r, fontSize: 13, lineHeight: 18, color: c.textDim, marginTop: 2 }}>Test your plan. At 60 you'd have <Text style={{ color: c.teal, fontFamily: font.m }}>{gbpCompact(atAge(forecast(profile, NO_STRESS), 60))}</Text>, or <Text style={{ color: c.orange, fontFamily: font.m }}>{gbpCompact(atAge(forecast(profile, ALL_STRESS), 60))}</Text> stress-tested.</Text>
          </View>
          <Icon name="chevron" size={18} color={c.text} />
        </LinearGradient>
      </Pressable>

      {/* Wealth health */}
      <SectionHeader title="Wealth health" action="Intelligence" onAction={() => router.push('/insights')} />
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
          <Ring pct={h.score / 100} size={104} thickness={10} color={scoreColor}>
            <Text style={{ fontFamily: font.b, fontSize: 32, color: c.text, letterSpacing: -1 }}>{h.score}</Text>
            <Text style={{ fontFamily: font.r, fontSize: 10.5, color: c.muted, marginTop: -2 }}>out of 100</Text>
          </Ring>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: font.sb, fontSize: 20, color: scoreColor }}>{h.band}</Text>
            <Text style={{ fontFamily: font.r, fontSize: 13.5, lineHeight: 20, color: c.textDim, marginTop: 4 }}>
              Scored across diversification, cost, liquidity, currency and performance, all your accounts together.
            </Text>
          </View>
        </View>
        <View style={{ marginTop: 16, gap: 11 }}>
          {h.parts.map((p) => (
            <View key={p.key}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={{ fontFamily: font.m, fontSize: 13, color: c.text }}>{p.label}</Text>
                <Text style={{ fontFamily: font.r, fontSize: 12.5, color: c.muted }}>{p.note}  <Text style={{ fontFamily: font.m, color: c.text }}>{p.score}</Text></Text>
              </View>
              <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.07)' }}>
                <View style={{ width: `${p.score}%`, height: 6, borderRadius: 3, backgroundColor: p.score >= 80 ? c.teal : p.score >= 65 ? c.amber : c.orange }} />
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Intelligence feed */}
      <SectionHeader title="Intelligence for you" action="See all" onAction={() => router.push('/insights')} />
      <Card style={{ marginBottom: 12, backgroundColor: 'rgba(1,208,210,0.07)', borderColor: 'rgba(1,208,210,0.3)' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Icon name="bolt" size={20} color={c.teal} />
          <Text style={{ flex: 1, fontFamily: font.m, fontSize: 14.5, lineHeight: 20, color: c.text }}>
            We found <Text style={{ color: c.teal, fontFamily: font.sb }}>{gbp(pz.annual)} a year</Text> you could keep, and {pz.count} things worth your attention.
          </Text>
        </View>
      </Card>
      <View style={{ gap: 12 }}>
        {top.map((i) => <InsightCard key={i.id} i={i} compact />)}
        {!top.length && <Txt v="body">All caught up. We'll flag anything the data finds.</Txt>}
      </View>

      {/* Strata */}
      <SectionHeader title="How your wealth is built" />
      <Card>
        <Txt v="label">{layer !== null ? `Net worth · ${Math.round((layer / 52) * 12)} months in` : 'Net worth by asset class · past year'}</Txt>
        <Text style={{ fontFamily: font.sb, fontSize: 26, color: c.text, marginTop: 4, letterSpacing: -0.6 }}>
          {gbpCompact(layers.reduce((s, l) => s + l.values[layer ?? 52], 0))}
        </Text>
        <View style={{ marginTop: 12, marginHorizontal: -6 }}>
          <StackedArea layers={layers} height={200} onScrub={setLayer} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 14 }}>
          {layers.map((l) => (
            <View key={l.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: l.color }} />
              <Text style={{ fontFamily: font.r, fontSize: 12.5, color: c.textDim }}>{l.label}{layer !== null ? `  ${gbpCompact(l.values[layer])}` : ''}</Text>
            </View>
          ))}
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
        <Card style={{ flex: 1 }} onPress={() => router.push('/assets')}>
          <Txt v="label">Assets</Txt>
          <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: font.sb, fontSize: 24, color: c.text, marginTop: 6 }}>{gbpCompact(assets)}</Text>
          <Txt v="small" style={{ marginTop: 2 }}>{ACCOUNTS.length} accounts</Txt>
        </Card>
        <Card style={{ flex: 1 }} onPress={() => router.push('/liabilities')}>
          <Txt v="label">Liabilities</Txt>
          <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: font.sb, fontSize: 24, color: c.text, marginTop: 6 }}>{gbpCompact(liabilities)}</Text>
          <Txt v="small" style={{ marginTop: 2 }}>{LIABILITIES.length} mortgages</Txt>
        </Card>
      </View>

      <SectionHeader title="Your month" action="Full breakdown" onAction={() => router.push('/money')} />
      <Card onPress={() => router.push('/money')}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Txt v="label">{monthLabel(monthKey(nowD))}</Txt>
          <Pill tone={vsPrev >= 0 ? 'pos' : 'neg'}>{vsPrev >= 0 ? '▲' : '▼'} {gbp(Math.abs(vsPrev))} vs {prevName}</Pill>
        </View>
        <View style={{ marginTop: 16, gap: 14 }}>
          {([
            ['Came in', 'Pay, rent and investment income', month.income, c.teal],
            ['Went out', 'Living costs, mortgages, bills and fees', month.expenses, c.orange],
          ] as const).map(([label, sub, v, col]) => (
            <View key={label}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Text style={{ fontFamily: font.m, fontSize: 14.5, color: c.text }}>{label}</Text>
                <Text style={{ fontFamily: font.sb, fontSize: 16, color: c.text, fontVariant: ['tabular-nums'] }}>{gbp(v)}</Text>
              </View>
              <View style={{ height: 9, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.07)', marginTop: 7 }}>
                <View style={{ width: `${Math.min(100, (v / Math.max(month.income, month.expenses)) * 100)}%`, height: 9, borderRadius: 5, backgroundColor: col }} />
              </View>
              <Text style={{ fontFamily: font.r, fontSize: 12, color: c.muted, marginTop: 5 }}>{sub}</Text>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 18, paddingTop: 16, borderTopWidth: 0.5, borderTopColor: c.border }}>
          <Txt v="label">What you keep</Txt>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
            <Text style={{ fontFamily: font.b, fontSize: 34, letterSpacing: -1.2, color: c.teal }}>{gbp(month.left)}</Text>
            <Text style={{ fontFamily: font.r, fontSize: 14, color: c.textDim }}>a month</Text>
          </View>
          <Text style={{ fontFamily: font.r, fontSize: 14, lineHeight: 21, color: c.textDim, marginTop: 6 }}>
            That is <Text style={{ fontFamily: font.sb, color: c.text }}>{Math.round(keptPct)}p of every £1</Text> you earn. It's the money that funds your goals, and what your plan is built on.
          </Text>
        </View>
      </Card>

      <Txt v="small" style={{ marginTop: 16, textAlign: 'center' }}>Sample data for design purposes. Values are illustrative.</Txt>
    </Screen>
  );
}
