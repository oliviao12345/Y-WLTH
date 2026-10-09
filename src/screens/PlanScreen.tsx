import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Card, Pill, Txt } from '@/components/ui';
import { Ring } from '@/components/charts';
import { GOALS } from '@/data/wealth';
import { PLAN } from '@/data/plan';
import { useStore } from '@/lib/store';
import { liveFigures, projection, sampleHistory } from '@/lib/money';
import { c, font, gbp, gbpCompact } from '@/theme/tokens';

/** Years to close the gap at a given monthly saving, before any investment growth. */
const yearsToGo = (gap: number, monthly: number) => (monthly > 0 ? gap / (monthly * 12) : Infinity);

export function PlanScreen() {
  const { openBooking } = useStore();
  const hist = useMemo(() => sampleHistory(), []);
  const left = liveFigures('total').left;
  const proj = projection('total', hist);
  const [extra, setExtra] = useState(0);
  const thisYear = new Date().getFullYear();
  // Share of monthly surplus assumed to be put toward goals, split evenly across them.
  const perGoal = Math.max(0, (left + extra) * 0.6) / GOALS.length;

  return (
    <Screen>
      <Txt v="title">Plan</Txt>
      <Txt v="small" style={{ marginTop: 2 }}>{PLAN.horizon}</Txt>

      <Card style={{ marginTop: 18, borderColor: 'rgba(1,208,210,0.35)', borderWidth: 1 }}>
        <Txt v="label">Your plan</Txt>
        <Text style={{ fontFamily: font.sb, fontSize: 22, letterSpacing: -0.4, color: c.text, marginTop: 6 }}>{PLAN.name}</Text>
        <Txt v="body" style={{ marginTop: 8 }}>{PLAN.summary}</Txt>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {[...GOALS].sort((a, b) => a.by - b.by).map((g) => <Pill key={g.id} tone="neutral">{g.by} · {g.name.split(' ').slice(0, 2).join(' ')}</Pill>)}
        </View>
      </Card>

      <Card style={{ marginTop: 18 }}>
        <Txt v="label">What funds your plan</Txt>
        <Txt v="title" style={{ marginTop: 8, fontSize: 26 }}>{gbp(left)} <Text style={{ fontFamily: font.r, fontSize: 15, color: c.muted }}>left over a month</Text></Txt>
        <Txt v="small" style={{ marginTop: 4 }}>From Money Insights · about {gbpCompact(proj.left)} projected for {thisYear}. We assume 60% of it goes toward goals.</Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTopWidth: 0.5, borderTopColor: c.border }}>
          <View>
            <Text style={{ fontFamily: font.m, fontSize: 14, color: c.text }}>What if I put away more?</Text>
            <Text style={{ fontFamily: font.r, fontSize: 12.5, color: c.muted, marginTop: 2 }}>{extra === 0 ? 'Adjust the monthly amount' : `${gbp(extra, { sign: true })} a month`}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[-500, 500].map((s) => (
              <Pressable key={s} onPress={() => setExtra((e) => Math.max(-left, e + s))} style={{ width: 44, height: 40, borderRadius: 14, backgroundColor: c.cardHi, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.borderHi }}>
                <Text style={{ fontFamily: font.sb, fontSize: 15, color: c.text }}>{s > 0 ? '+500' : '-500'}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Card>

      <Txt v="h2" style={{ marginTop: 26 }}>The plan, goal by goal</Txt>
      <View style={{ marginTop: 12, gap: 12 }}>
        {GOALS.map((g) => {
          const p = g.current / g.target;
          const gap = g.target - g.current;
          const yrs = yearsToGo(gap, perGoal);
          const eta = thisYear + Math.ceil(yrs);
          const onTrack = Number.isFinite(yrs) && eta <= g.by;
          return (
            <Card key={g.id}>
              <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                <Ring pct={p} color={g.color} size={68}>
                  <Text style={{ fontFamily: font.sb, fontSize: 15, color: c.text }}>{Math.round(p * 100)}%</Text>
                </Ring>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: font.sb, fontSize: 16.5, color: c.text }}>{g.name}</Text>
                  <Text style={{ fontFamily: font.r, fontSize: 13, color: c.muted, marginTop: 3 }}>{gbpCompact(g.current)} of {gbpCompact(g.target)} · by {g.by}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 }}>
                <Pill tone={onTrack ? 'pos' : 'neg'}>{onTrack ? 'On track' : 'Behind plan'}</Pill>
                <Text style={{ fontFamily: font.r, fontSize: 12.5, color: c.textDim, flex: 1 }}>
                  {Number.isFinite(yrs) ? `Reached around ${eta} at ${gbp(perGoal)} a month` : 'Needs a monthly amount to reach'}
                </Text>
              </View>
              <Txt v="small" style={{ marginTop: 8 }}>{g.note}</Txt>
              <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: c.border, gap: 8 }}>
                <Txt v="label">What we'll do</Txt>
                {(PLAN.steps[g.id] ?? []).map((t, i) => (
                  <View key={t} style={{ flexDirection: 'row', gap: 10 }}>
                    <Text style={{ fontFamily: font.sb, fontSize: 13.5, color: g.color, width: 16 }}>{i + 1}</Text>
                    <Text style={{ flex: 1, fontFamily: font.r, fontSize: 14, lineHeight: 20, color: c.textDim }}>{t}</Text>
                  </View>
                ))}
              </View>
            </Card>
          );
        })}
      </View>
      <Txt v="h2" style={{ marginTop: 26 }}>Ground rules</Txt>
      <Card style={{ marginTop: 12, gap: 14 }}>
        {PLAN.principles.map(([t, d]) => (
          <View key={t}>
            <Text style={{ fontFamily: font.sb, fontSize: 15, color: c.text }}>{t}</Text>
            <Text style={{ fontFamily: font.r, fontSize: 13.5, lineHeight: 20, color: c.textDim, marginTop: 2 }}>{d}</Text>
          </View>
        ))}
      </Card>
      <Card style={{ marginTop: 12 }}>
        <Txt v="label">What this assumes</Txt>
        {PLAN.assumptions.map((t) => <Txt key={t} v="small" style={{ marginTop: 6 }}>• {t}</Txt>)}
      </Card>
      <Pressable onPress={openBooking} style={{ marginTop: 16, backgroundColor: c.teal, paddingVertical: 15, borderRadius: 16, alignItems: 'center' }}>
        <Text style={{ fontFamily: font.sb, fontSize: 15, color: c.navy }}>Review this plan with your adviser</Text>
      </Pressable>
      <Txt v="small" style={{ marginTop: 18, textAlign: 'center' }}>Estimates before investment growth, not personal advice. Your adviser can turn this into a full plan, including tax.</Txt>
    </Screen>
  );
}
