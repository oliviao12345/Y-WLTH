import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card, Icon, Txt } from '@/components/ui';
import { ACCOUNTS, byClass, totals } from '@/data/wealth';
import { c, font, gbp, pct } from '@/theme/tokens';

/** Everything you own, grouped by asset class. Each class opens its own breakdown. */
export function AssetsOverviewScreen() {
  const { assets } = totals();
  const classes = byClass().filter((k) => k.value > 0).sort((a, b) => b.value - a.value);
  const annualFees = ACCOUNTS.reduce((s, a) => s + (a.value * a.feePct) / 100, 0);
  const change = ACCOUNTS.reduce((s, a) => s + a.change1y * a.value, 0) / assets;

  return (
    <Screen back>
      <Txt v="label">Assets</Txt>
      <Txt v="display" style={{ marginTop: 6 }}>{gbp(assets)}</Txt>
      <Txt v="small" style={{ marginTop: 6 }}>{ACCOUNTS.length} accounts across {classes.length} asset classes · {pct(change)} past year</Txt>

      <View style={{ flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginTop: 18, gap: 2 }}>
        {classes.map((k) => <View key={k.cls} style={{ flex: k.value, backgroundColor: k.color }} />)}
      </View>

      <Card pad={false} style={{ marginTop: 20, paddingHorizontal: 18 }}>
        {classes.map((k, i) => (
          <Pressable key={k.cls} onPress={() => router.push(`/asset/${k.cls}`)} accessibilityRole="button" style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderTopWidth: i ? 0.5 : 0, borderTopColor: c.border, opacity: pressed ? 0.7 : 1 })}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: k.color, marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.m, fontSize: 15.5, color: c.text }}>{k.label}</Text>
                <Text style={{ fontFamily: font.r, fontSize: 12.5, color: c.muted, marginTop: 2 }}>{k.accounts.length} {k.accounts.length === 1 ? 'account' : 'accounts'} · {((k.value / assets) * 100).toFixed(1)}% of assets</Text>
              </View>
              <Text style={{ fontFamily: font.m, fontSize: 15.5, color: c.text, fontVariant: ['tabular-nums'], marginRight: 8 }}>{gbp(k.value)}</Text>
              <Icon name="chevron" size={18} color={c.muted} />
          </Pressable>
        ))}
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Txt v="label">Ongoing cost</Txt>
        <Text style={{ fontFamily: font.sb, fontSize: 22, color: c.text, marginTop: 6 }}>{gbp(annualFees)} a year</Text>
        <Txt v="small" style={{ marginTop: 4 }}>Fund, platform and advice charges across everything you hold. {((annualFees / assets) * 100).toFixed(2)}% of your assets.</Txt>
      </Card>
      <Txt v="small" style={{ marginTop: 16, textAlign: 'center' }}>Sample data for design purposes. Values are illustrative.</Txt>
    </Screen>
  );
}
