import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Card, Pill, Segmented, SectionHeader, Txt } from '@/components/ui';
import { LineChart, MultiLine } from '@/components/charts';
import { InsightCard } from '@/components/InsightCard';
import { useStore } from '@/lib/store';
import { attribution, costDrag, drivers, insights, perfSeries, prize, stress } from '@/lib/intelligence';
import { BENCHMARK, costs, performance } from '@/lib/insights';
import { ACCOUNTS, totals } from '@/data/wealth';
import { YWLTH_FEE } from '@/data/fees';
import { c, font, gbp, gbpCompact, pct } from '@/theme/tokens';

type Tab = 'actions' | 'performance' | 'costs' | 'risk';

export function InsightsScreen() {
  const [tab, setTab] = useState<Tab>('actions');
  const { status, snoozed, isSnoozed, unsnooze } = useStore();
  const list = useMemo(insights, []);
  const open = list.filter((i) => (status[i.id] ?? 'new') === 'new' && !isSnoozed(i.id));
  const asleep = list.filter((i) => isSnoozed(i.id));
  const done = list.filter((i) => status[i.id] === 'approved');
  const pz = prize();
  const perf = performance();

  return (
    <Screen>
      <Txt v="title">Intelligence</Txt>
      <Txt v="small" style={{ marginTop: 2 }}>Independent analysis of every pound, whoever manages it.</Txt>

      <View style={{ marginTop: 18, padding: 22, borderRadius: 26, backgroundColor: c.card, borderWidth: 1, borderColor: 'rgba(1,208,210,0.35)', overflow: 'hidden' }}>
        <Txt v="label" style={{ color: c.teal }}>Found for you</Txt>
        <Text style={{ fontFamily: font.b, fontSize: 40, letterSpacing: -1.4, color: c.text, marginTop: 8 }}>{gbp(pz.annual)}<Text style={{ fontFamily: font.r, fontSize: 15, color: c.textDim }}>  a year</Text></Text>
        <Text style={{ fontFamily: font.r, fontSize: 14, lineHeight: 21, color: c.textDim, marginTop: 6 }}>in avoidable costs and idle cash. Compounded, that is <Text style={{ fontFamily: font.sb, color: c.teal }}>{gbp(pz.tenYear)}</Text> over ten years.</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <Pill tone="neg">{open.length} to review</Pill>
          {done.length ? <Pill tone="pos">{done.length} approved</Pill> : null}
          {asleep.length ? <Pill tone="neutral">{asleep.length} snoozed</Pill> : null}
        </View>
      </View>

      <View style={{ marginTop: 18 }}>
        <Segmented<Tab> options={[{ k: 'actions', label: 'Actions' }, { k: 'performance', label: 'Performance' }, { k: 'costs', label: 'Costs' }, { k: 'risk', label: 'Risk' }]} value={tab} onChange={setTab} small />
      </View>

      {tab === 'actions' && (
        <View style={{ gap: 14, marginTop: 18 }}>
          {list.map((i) => <InsightCard key={i.id} i={i} />)}
          {!open.length && !done.length && <Txt v="body">Nothing to review right now. We'll tell you when the data says something{asleep.length ? ', or when a snoozed item comes back' : ''}.</Txt>}
          {!!asleep.length && (
            <View style={{ marginTop: 6, gap: 8 }}>
              <Txt v="label">Snoozed</Txt>
              <Card pad={false} style={{ paddingHorizontal: 16 }}>
                {asleep.map((i, k) => (
                  <View key={i.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderTopWidth: k ? 0.5 : 0, borderTopColor: c.border }}>
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={2} style={{ fontFamily: font.m, fontSize: 14, lineHeight: 19, color: c.text }}>{i.title}</Text>
                      <Text style={{ fontFamily: font.r, fontSize: 12.5, color: c.muted, marginTop: 3 }}>Back on {new Date(snoozed[i.id]).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
                    </View>
                    <Pressable onPress={() => unsnooze(i.id)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(1,208,210,0.45)' }}><Text style={{ fontFamily: font.m, fontSize: 13, color: c.teal }}>Bring back</Text></Pressable>
                  </View>
                ))}
              </Card>
            </View>
          )}
          <Txt v="small" style={{ textAlign: 'center' }}>Y-WLTH recommends, you approve. Nothing changes until you do.</Txt>
        </View>
      )}
      {tab === 'performance' && <Performance perf={perf} />}
      {tab === 'costs' && <Costs />}
      {tab === 'risk' && <Risk />}
    </Screen>
  );
}

function Performance({ perf }: { perf: ReturnType<typeof performance> }) {
  const { port, bench } = useMemo(perfSeries, []);
  const [i, setI] = useState<number | null>(null);
  const att = useMemo(attribution, []);
  const idx = i ?? port.length - 1;
  const maxAbs = Math.max(...att.map((a) => Math.abs(a.pts)));
  return (
    <View style={{ marginTop: 18, gap: 14 }}>
      <Card>
        <Txt v="label">Your investments vs the benchmark</Txt>
        <View style={{ flexDirection: 'row', gap: 22, marginTop: 10 }}>
          <View>
            <Text style={{ fontFamily: font.b, fontSize: 30, color: c.teal, letterSpacing: -1 }}>{pct(port[idx] - 100)}</Text>
            <Text style={{ fontFamily: font.r, fontSize: 12.5, color: c.muted }}>Your investments</Text>
          </View>
          <View>
            <Text style={{ fontFamily: font.b, fontSize: 30, color: c.textDim, letterSpacing: -1 }}>{pct(bench[idx] - 100)}</Text>
            <Text style={{ fontFamily: font.r, fontSize: 12.5, color: c.muted }}>Benchmark</Text>
          </View>
        </View>
        <View style={{ marginTop: 14, marginHorizontal: -6 }}>
          <MultiLine height={190} onScrub={setI} lines={[{ key: 'b', color: 'rgba(255,255,255,0.65)', values: bench, dashed: true, width: 2 }, { key: 'p', color: c.teal, values: port }]} />
        </View>
        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pill tone={perf.vsBenchmark >= 0 ? 'pos' : 'neg'}>{perf.vsBenchmark >= 0 ? '+' : ''}{perf.vsBenchmark.toFixed(1)} pts vs benchmark</Pill>
          <Txt v="small" style={{ flex: 1 }}>{BENCHMARK.name}, illustrative. Returns after costs.</Txt>
        </View>
      </Card>

      <SectionHeader title="What moved you away from it" />
      <Card>
        <Txt v="small" style={{ marginBottom: 6 }}>Each holding's contribution to the gap, in percentage points.</Txt>
        {att.map((a, k) => (
          <View key={a.id} style={{ paddingVertical: 12, borderTopWidth: k ? 0.5 : 0, borderTopColor: c.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: font.m, fontSize: 14.5, color: c.text }}>{a.label}</Text>
              <Text style={{ fontFamily: font.m, fontSize: 14.5, color: a.pts >= 0 ? c.teal : c.orange, fontVariant: ['tabular-nums'] }}>{a.pts >= 0 ? '+' : ''}{a.pts.toFixed(2)}</Text>
            </View>
            <View style={{ flexDirection: 'row', height: 7, marginTop: 8 }}>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>{a.pts < 0 && <View style={{ width: `${(Math.abs(a.pts) / maxAbs) * 100}%`, height: 7, borderTopLeftRadius: 4, borderBottomLeftRadius: 4, backgroundColor: c.orange }} />}</View>
              <View style={{ width: 2, backgroundColor: 'rgba(255,255,255,0.25)' }} />
              <View style={{ flex: 1 }}>{a.pts >= 0 && <View style={{ width: `${(a.pts / maxAbs) * 100}%`, height: 7, borderTopRightRadius: 4, borderBottomRightRadius: 4, backgroundColor: c.teal }} />}</View>
            </View>
            <Text style={{ fontFamily: font.r, fontSize: 12, color: c.muted, marginTop: 5 }}>{a.sub} · returned {a.ret.toFixed(1)}% · {(a.weight * 100).toFixed(0)}% of your investments</Text>
          </View>
        ))}
      </Card>
    </View>
  );
}

function Costs() {
  const cs = costs();
  const drag = useMemo(costDrag, []);
  const costly = ACCOUNTS.filter((a) => a.feePct > 0).sort((a, b) => b.value * b.feePct - a.value * a.feePct);
  const max = Math.max(...costly.map((a) => a.feePct), YWLTH_FEE.pct);
  const ySharePct = (cs.ywlth / cs.total) * 100;
  return (
    <View style={{ marginTop: 18, gap: 14 }}>
      <Card>
        <Txt v="label">What you pay in total</Txt>
        <Text style={{ fontFamily: font.b, fontSize: 40, letterSpacing: -1.4, color: c.text, marginTop: 8 }}>{gbp(cs.total)}<Text style={{ fontFamily: font.r, fontSize: 15, color: c.textDim }}>  a year</Text></Text>
        <Txt v="small" style={{ marginTop: 4 }}>{cs.totalPct.toFixed(2)}% of the {gbpCompact(cs.base)} in your investable portfolios, including Y-WLTH's fee.</Txt>
        <View style={{ flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', gap: 2, marginTop: 16 }}>
          <View style={{ flex: ySharePct, backgroundColor: c.teal }} />
          <View style={{ flex: 100 - ySharePct, backgroundColor: c.orange }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={{ fontFamily: font.m, fontSize: 12.5, color: c.teal }}>Y-WLTH {gbp(cs.ywlth)}</Text>
          <Text style={{ fontFamily: font.m, fontSize: 12.5, color: c.orange }}>Providers {gbp(cs.annual)}</Text>
        </View>
        <View style={{ marginTop: 16, marginHorizontal: -6 }}><LineChart data={drag} color={c.orange} height={140} /></View>
        <Txt v="small" style={{ marginTop: 6 }}>Costs compound. Left alone, they take about <Text style={{ fontFamily: font.m, color: c.orange }}>{gbp(drag[10])}</Text> from your wealth over ten years.</Txt>
      </Card>

      <Card style={{ borderColor: 'rgba(1,208,210,0.35)' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={{ fontFamily: font.sb, fontSize: 16, color: c.text }}>{YWLTH_FEE.label}</Text>
          <Text style={{ fontFamily: font.sb, fontSize: 16, color: c.text, fontVariant: ['tabular-nums'] }}>{gbp(cs.ywlth)}</Text>
        </View>
        <Text style={{ fontFamily: font.r, fontSize: 13, lineHeight: 19, color: c.textDim, marginTop: 6 }}>
          {YWLTH_FEE.pct.toFixed(2)}% a year on {gbpCompact(cs.base)} ({YWLTH_FEE.basis}){YWLTH_FEE.sample ? '. Sample rate for this demo' : ''}. Y-WLTH is paid by you, not by product providers, and takes no commission.
        </Text>
        <Text style={{ fontFamily: font.r, fontSize: 12, lineHeight: 17, color: c.muted, marginTop: 6 }}>Your fee depends on the value of your investable portfolios and the services you choose. It is shown here so your all-in costs are clear.</Text>
      </Card>

      <Card>
        <Txt v="label" style={{ marginBottom: 4 }}>Your providers</Txt>
        {costly.map((a, k) => (
          <View key={a.id} style={{ paddingVertical: 11, borderTopWidth: k ? 0.5 : 0, borderTopColor: c.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: font.m, fontSize: 14.5, color: c.text }}>{a.institution}</Text>
              <Text style={{ fontFamily: font.m, fontSize: 14.5, color: c.text, fontVariant: ['tabular-nums'] }}>{gbp((a.value * a.feePct) / 100)}</Text>
            </View>
            <View style={{ height: 6, borderRadius: 3, marginTop: 8, backgroundColor: 'rgba(255,255,255,0.07)' }}>
              <View style={{ height: 6, borderRadius: 3, width: `${(a.feePct / max) * 100}%`, backgroundColor: a.feePct > 0.5 ? c.orange : c.teal }} />
            </View>
            <Text style={{ fontFamily: font.r, fontSize: 12, color: c.muted, marginTop: 4 }}>{a.feePct.toFixed(2)}% a year · {a.name}</Text>
          </View>
        ))}
      </Card>
    </View>
  );
}

function Risk() {
  const st = useMemo(stress, []);
  const dr = useMemo(drivers, []);
  const { net } = totals();
  const max = Math.max(...st.map((s) => s.hit));
  return (
    <View style={{ marginTop: 18, gap: 14 }}>
      <Card>
        <Txt v="label">If markets move against you</Txt>
        <Txt v="small" style={{ marginTop: 4, marginBottom: 10 }}>What each shock would take off your net worth.</Txt>
        {st.map((s, k) => (
          <View key={s.label} style={{ paddingVertical: 11, borderTopWidth: k ? 0.5 : 0, borderTopColor: c.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: font.m, fontSize: 14.5, color: c.text }}>{s.label}</Text>
              <Text style={{ fontFamily: font.sb, fontSize: 14.5, color: c.orange, fontVariant: ['tabular-nums'] }}>-{gbpCompact(s.hit)}</Text>
            </View>
            <View style={{ height: 8, borderRadius: 4, marginTop: 8, backgroundColor: 'rgba(255,255,255,0.07)' }}>
              <View style={{ height: 8, borderRadius: 4, width: `${(s.hit / max) * 100}%`, backgroundColor: c.orange }} />
            </View>
            <Text style={{ fontFamily: font.r, fontSize: 12, color: c.muted, marginTop: 4 }}>{((s.hit / net) * 100).toFixed(1)}% of your net worth</Text>
          </View>
        ))}
      </Card>
      <Card>
        <Txt v="label">What your risk is really made of</Txt>
        <Txt v="small" style={{ marginTop: 4, marginBottom: 12 }}>Every account broken into the same underlying drivers, so hidden concentrations show.</Txt>
        <View style={{ flexDirection: 'row', height: 16, borderRadius: 8, overflow: 'hidden', gap: 2 }}>
          {dr.base.map((d) => <View key={d.label} style={{ flex: d.pct, backgroundColor: d.color }} />)}
        </View>
        {dr.base.map((d, k) => (
          <View key={d.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: k ? 0.5 : 0, borderTopColor: c.border, marginTop: k ? 0 : 12 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: d.color }} />
            <Text style={{ flex: 1, fontFamily: font.m, fontSize: 14.5, color: c.text }}>{d.label}</Text>
            <Text style={{ fontFamily: font.m, fontSize: 14.5, color: c.text, fontVariant: ['tabular-nums'] }}>{d.pct.toFixed(0)}%</Text>
          </View>
        ))}
        <Txt v="small" style={{ marginTop: 8 }}>Plus {dr.currencyPct.toFixed(0)}% of your wealth is exposed to currency moves. Illustrative weights.</Txt>
      </Card>
    </View>
  );
}
