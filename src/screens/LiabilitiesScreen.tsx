import React from 'react';
import { Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Card, Pill, Txt } from '@/components/ui';
import { ACCOUNTS, LIABILITIES, totals } from '@/data/wealth';
import { c, font, gbp } from '@/theme/tokens';

/** Which property each mortgage is secured against. */
const SECURED_ON: Record<string, string> = { m1: 'nh', m2: 'lis' };

export function LiabilitiesScreen() {
  const { liabilities, assets } = totals();
  const propertyValue = ACCOUNTS.filter((a) => a.cls === 'property').reduce((s, a) => s + a.value, 0);
  const yearlyInterest = LIABILITIES.reduce((s, l) => s + (l.value * l.rate) / 100, 0);

  return (
    <Screen back>
      <Txt v="label">Liabilities</Txt>
      <Txt v="display" style={{ marginTop: 6 }}>{gbp(liabilities)}</Txt>
      <Txt v="small" style={{ marginTop: 6 }}>{LIABILITIES.length} mortgages · {((liabilities / assets) * 100).toFixed(1)}% of your assets · {((liabilities / propertyValue) * 100).toFixed(0)}% of your property value</Txt>

      <View style={{ gap: 14, marginTop: 20 }}>
        {LIABILITIES.map((l) => {
          const home = ACCOUNTS.find((a) => a.id === SECURED_ON[l.id]);
          const ltv = home ? (l.value / home.value) * 100 : null;
          const interest = (l.value * l.rate) / 100;
          return (
            <Card key={l.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: font.sb, fontSize: 17, color: c.text }}>{l.name}</Text>
                  <Text style={{ fontFamily: font.r, fontSize: 13, color: c.muted, marginTop: 2 }}>{l.lender}</Text>
                </View>
                <Text style={{ fontFamily: font.sb, fontSize: 19, color: c.text, fontVariant: ['tabular-nums'] }}>-{gbp(l.value)}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <Pill tone="neutral">{l.rate}% interest</Pill>
                {ltv !== null && <Pill tone={ltv > 60 ? 'neg' : 'pos'}>{ltv.toFixed(0)}% of property value</Pill>}
              </View>
              <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: c.border, gap: 8 }}>
                {home && <Line k="Secured against" v={`${home.name} · ${gbp(home.value)}`} />}
                {home && <Line k="Your equity" v={gbp(home.value - l.value)} />}
                <Line k="Interest a year (est.)" v={gbp(interest)} />
                <Line k="Interest a month (est.)" v={gbp(interest / 12)} />
              </View>
            </Card>
          );
        })}
      </View>

      <Card style={{ marginTop: 16 }}>
        <Txt v="label">Total interest</Txt>
        <Text style={{ fontFamily: font.sb, fontSize: 22, color: c.text, marginTop: 6 }}>{gbp(yearlyInterest)} a year</Text>
        <Txt v="small" style={{ marginTop: 4 }}>Estimated from current balances and rates. Your lenders' statements are the source of truth.</Txt>
      </Card>
      <Txt v="small" style={{ marginTop: 16, textAlign: 'center' }}>Sample data for design purposes. Values are illustrative.</Txt>
    </Screen>
  );
}

const Line = ({ k, v }: { k: string; v: string }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
    <Text style={{ fontFamily: font.r, fontSize: 13.5, color: c.textDim }}>{k}</Text>
    <Text style={{ flexShrink: 1, textAlign: 'right', fontFamily: font.m, fontSize: 13.5, color: c.text }}>{v}</Text>
  </View>
);
