import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card, Icon, Pill, Row, Txt } from '@/components/ui';
import { Spark } from '@/components/charts';
import { ACCOUNTS, CLASS_META, LIABILITIES, totals, type AssetClass } from '@/data/wealth';
import { c, font, gbp, pct } from '@/theme/tokens';

export function AssetScreen() {
  const { cls } = useLocalSearchParams<{ cls: string }>();
  const meta = CLASS_META[cls as AssetClass];
  const accts = ACCOUNTS.filter((a) => a.cls === cls);
  const value = accts.reduce((s, a) => s + a.value, 0);
  const { assets } = totals();
  const weighted = value ? accts.reduce((s, a) => s + a.change1y * a.value, 0) / value : 0;
  if (!meta) return null;

  return (
    <Screen back>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: meta.color }} />
        <Txt v="label">{meta.label}</Txt>
      </View>
      <Txt v="display" style={{ marginTop: 6 }}>{gbp(value)}</Txt>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8, alignItems: 'center' }}>
        <Pill tone={weighted >= 0 ? 'pos' : 'neg'}>{pct(weighted)} past year</Pill>
        <Txt v="small">{((value / assets) * 100).toFixed(1)}% of your assets</Txt>
      </View>
      <Txt v="body" style={{ marginTop: 14 }}>{meta.blurb}</Txt>

      <Card pad={false} style={{ marginTop: 20, paddingHorizontal: 18 }}>
        {accts.map((a, i) => (
          <View key={a.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderTopWidth: i ? 0.5 : 0, borderTopColor: c.border }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: font.m, fontSize: 15, color: c.text }}>{a.institution}</Text>
              <Text style={{ fontFamily: font.r, fontSize: 12.5, color: c.muted, marginTop: 2 }}>{a.name} · {a.synced}</Text>
            </View>
            <Spark data={[0, 1, 0.6, 1.4, 1.1, 1.8, 1.5, 2.2].map((x) => x + (a.change1y > 0 ? 0 : -x * 0.8))} color={a.change1y >= 0 ? c.teal : c.orange} />
            <View style={{ alignItems: 'flex-end', marginLeft: 12, minWidth: 84 }}>
              <Text style={{ fontFamily: font.m, fontSize: 15, color: c.text, fontVariant: ['tabular-nums'] }}>{gbp(a.value)}</Text>
              <Text style={{ fontFamily: font.m, fontSize: 12, color: a.change1y >= 0 ? c.teal : c.orange, marginTop: 2 }}>{pct(a.change1y)}</Text>
            </View>
          </View>
        ))}
      </Card>

      {cls === 'property' && (
        <>
          <Txt v="h2" style={{ marginTop: 28, marginBottom: 12 }}>Mortgages against these</Txt>
          <Card pad={false} style={{ paddingHorizontal: 18 }}>
            {LIABILITIES.map((l, i) => (
              <Row key={l.id} left={l.lender} sub={`${l.name} · ${l.rate}%`} right={`-${gbp(l.value)}`} last={i === LIABILITIES.length - 1} />
            ))}
          </Card>
        </>
      )}
    </Screen>
  );
}
