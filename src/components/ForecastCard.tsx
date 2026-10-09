import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card, Pill, Txt } from '@/components/ui';
import { MultiLine } from '@/components/charts';
import { ASSUMPTIONS, NO_STRESS, forecast, type Profile, type Stress } from '@/lib/forecast';
import { c, font, gbp, gbpCompact } from '@/theme/tokens';

const CHIPS: [keyof Stress, string][] = [['inflation', 'Inflation spike'], ['tax', 'Tax drag'], ['fees', 'Higher fees'], ['shock', 'Market crash']];

function Stepper({ label, value, onChange, min, max }: { label: string; value: number; onChange: (n: number) => void; min: number; max: number }) {
  return (
    <View style={{ flex: 1 }}>
      <Txt v="label">{label}</Txt>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
        <Pressable onPress={() => onChange(Math.max(min, value - 1))} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.cardHi, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.borderHi }}><Text style={{ fontFamily: font.m, fontSize: 18, color: c.text, marginTop: -2 }}>–</Text></Pressable>
        <Text style={{ fontFamily: font.b, fontSize: 24, color: c.text, minWidth: 34, textAlign: 'center' }}>{value}</Text>
        <Pressable onPress={() => onChange(Math.min(max, value + 1))} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.cardHi, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.borderHi }}><Text style={{ fontFamily: font.m, fontSize: 18, color: c.text, marginTop: -2 }}>+</Text></Pressable>
      </View>
    </View>
  );
}

/** "A clear, visual forecast of your wealth out to age 100, stress-tested against inflation, tax, fees and market shocks." */
export function ForecastCard({ profile, setProfile }: { profile: Profile; setProfile: (p: Profile) => void }) {
  const [stress, setStress] = useState<Stress>({ inflation: true, tax: true, fees: true, shock: true });
  const [real, setReal] = useState(true);
  const [i, setI] = useState<number | null>(null);
  const [show, setShow] = useState(false);
  const plan = useMemo(() => forecast(profile, NO_STRESS), [profile]);
  const hard = useMemo(() => forecast(profile, stress), [profile, stress]);
  const anyStress = Object.values(stress).some(Boolean);
  const pv = real ? plan.real : plan.nominal;
  const hv = real ? hard.real : hard.nominal;
  const idx = i ?? plan.ages.length - 1;
  const marks = [60, 80, 100].filter((a) => a > profile.age);
  const at = (arr: number[], age: number) => arr[Math.min(arr.length - 1, age - profile.age)];
  const n = plan.ages.length;
  const retireX = Math.min(1, Math.max(0, (profile.retireAge - profile.age) / (n - 1)));

  return (
    <Card>
      <Txt v="label" style={{ color: c.teal }}>Financial Forecast Simulator</Txt>
      <Text style={{ fontFamily: font.sb, fontSize: 20, lineHeight: 26, color: c.text, marginTop: 6 }}>Your wealth out to age 100, stress-tested.</Text>

      <View style={{ flexDirection: 'row', gap: 20, marginTop: 14 }}>
        <Stepper label="Your age" value={profile.age} min={25} max={80} onChange={(age) => setProfile({ ...profile, age, retireAge: Math.max(profile.retireAge, age + 1) })} />
        <Stepper label="Retire at" value={profile.retireAge} min={profile.age + 1} max={85} onChange={(retireAge) => setProfile({ ...profile, retireAge })} />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
        {CHIPS.map(([k, label]) => (
          <Pressable key={k} onPress={() => setStress({ ...stress, [k]: !stress[k] })} style={{ paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: stress[k] ? c.orange : c.borderHi, backgroundColor: stress[k] ? c.orangeSoft : 'transparent' }}>
            <Text style={{ fontFamily: font.m, fontSize: 12.5, color: stress[k] ? c.orange : c.textDim }}>{stress[k] ? '✓ ' : ''}{label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 16, marginTop: 18 }}>
        <View>
          <Text style={{ fontFamily: font.b, fontSize: 28, letterSpacing: -1, color: c.teal }}>{gbpCompact(pv[idx])}</Text>
          <Text style={{ fontFamily: font.r, fontSize: 12, color: c.muted }}>Plan · age {plan.ages[idx]}</Text>
        </View>
        {anyStress && (
          <View>
            <Text style={{ fontFamily: font.b, fontSize: 28, letterSpacing: -1, color: c.orange }}>{gbpCompact(hv[idx])}</Text>
            <Text style={{ fontFamily: font.r, fontSize: 12, color: c.muted }}>Stress-tested</Text>
          </View>
        )}
      </View>

      <View style={{ marginTop: 10, marginHorizontal: -6 }}>
        <MultiLine height={200} onScrub={setI} lines={[
          ...(anyStress ? [{ key: 'h', color: c.orange, values: hv, width: 2.4, dashed: true }] : []),
          { key: 'p', color: c.teal, values: pv, width: 2.6 },
        ]} />
        <View pointerEvents="none" style={{ position: 'absolute', left: `${retireX * 100}%`, top: 6, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.28)' }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <Text style={{ fontFamily: font.r, fontSize: 11.5, color: c.muted }}>Age {profile.age}</Text>
        <Text style={{ fontFamily: font.r, fontSize: 11.5, color: c.muted }}>Retire {profile.retireAge}</Text>
        <Text style={{ fontFamily: font.r, fontSize: 11.5, color: c.muted }}>100</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        <Pill tone={plan.runsOutAge ? 'neg' : 'pos'}>{plan.runsOutAge ? `Plan: investments run out at ${plan.runsOutAge}` : 'Plan: investments last to 100'}</Pill>
        {anyStress && <Pill tone={hard.runsOutAge ? 'neg' : 'pos'}>{hard.runsOutAge ? `Stressed: run out at ${hard.runsOutAge}` : 'Stressed: last to 100'}</Pill>}
      </View>

      <View style={{ marginTop: 14, borderTopWidth: 0.5, borderTopColor: c.border }}>
        {marks.map((a) => (
          <View key={a} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11, borderBottomWidth: 0.5, borderBottomColor: c.border }}>
            <Text style={{ fontFamily: font.m, fontSize: 14, color: c.text }}>At {a}</Text>
            <Text style={{ fontFamily: font.m, fontSize: 14, color: c.textDim, fontVariant: ['tabular-nums'] }}>
              <Text style={{ color: c.teal }}>{gbpCompact(at(pv, a))}</Text>{anyStress ? <Text>   <Text style={{ color: c.orange }}>{gbpCompact(at(hv, a))}</Text></Text> : null}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
        <Pressable onPress={() => setReal(!real)}><Text style={{ fontFamily: font.m, fontSize: 13, color: c.teal }}>{real ? "Showing today's money" : 'Showing future money'}</Text></Pressable>
        <Pressable onPress={() => setShow(!show)}><Text style={{ fontFamily: font.m, fontSize: 13, color: c.textDim }}>{show ? 'Hide assumptions' : 'How this works'}</Text></Pressable>
      </View>
      {show && (
        <View style={{ marginTop: 10, gap: 8 }}>
          {ASSUMPTIONS.map(([k, v]) => (
            <Text key={k} style={{ fontFamily: font.r, fontSize: 12.5, lineHeight: 18, color: c.textDim }}><Text style={{ fontFamily: font.m, color: c.text }}>{k}. </Text>{v}</Text>
          ))}
        </View>
      )}
      <Txt v="small" style={{ marginTop: 12, fontSize: 11.5, lineHeight: 16 }}>An illustration on today's balances, not a prediction or advice. Retirement income is {gbp(profile.retireIncome)} a year in today's money.</Txt>
    </Card>
  );
}
