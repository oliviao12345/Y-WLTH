import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Icon, Sheet } from '@/components/ui';
import { growthBreakdown } from '@/lib/intelligence';
import { netWorthSeries } from '@/data/wealth';
import { c, font, gbp, pct } from '@/theme/tokens';

/**
 * "Your wealth at work": the growth in the value of your holdings over the past year, spread across each day and
 * ticking up in real time. Tap it to see exactly where the number comes from.
 */
export function LiveEarn() {
  const g = useMemo(growthBreakdown, []);
  const perDay = g.perDay;
  const series = useMemo(netWorthSeries, []);
  const netRise = series[series.length - 1] - series[0];
  const other = netRise - g.total;
  const perSec = perDay / 86400;
  const [open, setOpen] = useState(false);
  const [v, setV] = useState(() => {
    const d = new Date();
    return perSec * (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds());
  });
  useEffect(() => {
    const t = setInterval(() => setV((x) => x + perSec * 0.1), 100);
    return () => clearInterval(t);
  }, [perSec]);
  const pulse = useSharedValue(0);
  useEffect(() => { pulse.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }), -1); }, [pulse]);
  const ring = useAnimatedStyle(() => ({ opacity: 0.7 - pulse.value * 0.7, transform: [{ scale: 1 + pulse.value * 1.8 }] }));

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 20, backgroundColor: 'rgba(1,208,210,0.08)', borderWidth: 1, borderColor: 'rgba(1,208,210,0.28)', opacity: pressed ? 0.9 : 1 })}>
        <View style={{ width: 14, height: 14, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={[{ position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: c.teal }, ring]} />
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.teal }} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: font.m, fontSize: 11.5, letterSpacing: 1.1, color: c.teal, textTransform: 'uppercase' }}>Your wealth at work</Text>
          <Text style={{ fontFamily: font.sb, fontSize: 24, color: c.text, marginTop: 3, fontVariant: ['tabular-nums'] }}>{gbp(v, { decimals: 2 })}<Text style={{ fontFamily: font.r, fontSize: 13.5, color: c.textDim }}>  of growth today</Text></Text>
          <Text style={{ fontFamily: font.r, fontSize: 12, color: c.muted, marginTop: 3 }}>Your holdings grew {gbp(g.total)} this past year. Tap to see where it comes from.</Text>
        </View>
        <Icon name="chevron" size={16} color={c.muted} />
      </Pressable>

      <Sheet visible={open} onClose={() => setOpen(false)} title="Where this number comes from">
        <View style={{ gap: 14 }}>
          <Text style={{ fontFamily: font.r, fontSize: 14.5, lineHeight: 22, color: c.textDim }}>
            Over the past 12 months, the things you own grew in value by <Text style={{ fontFamily: font.sb, color: c.text }}>{gbp(g.total)}</Text>. Spread evenly, that is <Text style={{ fontFamily: font.sb, color: c.text }}>{gbp(perDay)} a day</Text>, or about £{perSec.toFixed(3)} every second. The counter shows how much of today's share has built up so far.
          </Text>
          <View style={{ padding: 14, borderRadius: 14, backgroundColor: 'rgba(255,200,97,0.08)', borderWidth: 1, borderColor: 'rgba(255,200,97,0.25)' }}>
            <Text style={{ fontFamily: font.r, fontSize: 13, lineHeight: 19, color: c.textDim }}>It is growth in value, not money paid into your bank. It is after your providers' own charges. Y-WLTH's advice fee is separate and shown under Costs in Intelligence. Values go up and down, and this looks back at last year. It is not a forecast or a promise.</Text>
          </View>
          <View style={{ padding: 14, borderRadius: 14, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, gap: 6 }}>
            <Text style={{ fontFamily: font.m, fontSize: 11.5, letterSpacing: 1.1, color: c.muted, textTransform: 'uppercase' }}>How this fits your net worth</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontFamily: font.r, fontSize: 13.5, color: c.textDim }}>Net worth rose by</Text><Text style={{ fontFamily: font.sb, fontSize: 13.5, color: c.text, fontVariant: ['tabular-nums'] }}>{gbp(netRise)}</Text></View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontFamily: font.r, fontSize: 13.5, color: c.textDim }}>Growth in your holdings</Text><Text style={{ fontFamily: font.sb, fontSize: 13.5, color: c.teal, fontVariant: ['tabular-nums'] }}>{gbp(g.total)}</Text></View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ flex: 1, fontFamily: font.r, fontSize: 13.5, color: c.textDim }}>Money you added and mortgage you repaid</Text><Text style={{ fontFamily: font.sb, fontSize: 13.5, color: c.text, fontVariant: ['tabular-nums'] }}>{gbp(other)}</Text></View>
          </View>
          <Text style={{ fontFamily: font.m, fontSize: 11.5, letterSpacing: 1.1, color: c.muted, textTransform: 'uppercase' }}>What the growth is made of</Text>
          {g.classes.map((cl) => (
            <View key={cl.cls} style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: cl.color }} />
                <Text style={{ flex: 1, fontFamily: font.sb, fontSize: 14.5, color: c.text }}>{cl.label}</Text>
                <Text style={{ fontFamily: font.sb, fontSize: 14.5, color: cl.gain >= 0 ? c.teal : c.orange, fontVariant: ['tabular-nums'] }}>{gbp(cl.gain, { sign: true })}</Text>
              </View>
              <View style={{ height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.07)' }}>
                <View style={{ width: `${Math.min(100, Math.max(2, (Math.abs(cl.gain) / Math.max(...g.classes.map((x) => Math.abs(x.gain)))) * 100))}%`, height: 5, borderRadius: 3, backgroundColor: cl.gain >= 0 ? cl.color : c.orange }} />
              </View>
              {cl.accounts.map((a) => (
                <Text key={a.id} style={{ fontFamily: font.r, fontSize: 12, color: c.muted, paddingLeft: 17 }}>{a.institution} · {a.name}: {gbp(a.gain, { sign: true })} ({pct(a.pct)})</Text>
              ))}
            </View>
          ))}
          <Text style={{ fontFamily: font.r, fontSize: 12, lineHeight: 17, color: c.muted }}>Based on the 12-month change in value reported by each of your connected accounts. Sample data for design purposes.</Text>
        </View>
      </Sheet>
    </>
  );
}
