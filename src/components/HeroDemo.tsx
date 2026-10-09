import React, { useEffect, useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Phone } from '@/components/Phone';
import { HomeScreen } from '@/screens/HomeScreen';
import { InsightsScreen } from '@/screens/InsightsScreen';
import { ForecastScreen } from '@/screens/ForecastScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { c, font } from '@/theme/tokens';

const VIEWS = [
  { k: 'wealth', tab: 'Everything you own', line: 'Every account, property and holding from every provider, in one view.', C: HomeScreen },
  { k: 'analysis', tab: 'Independent analysis', line: 'Performance, risk and cost, benchmarked, with what to do about it.', C: InsightsScreen },
  { k: 'plan', tab: 'Your plan to 100', line: 'Your financial life strategy, stress-tested against inflation, tax, fees and shocks.', C: ForecastScreen },
  { k: 'adviser', tab: 'Your adviser', line: 'Advice in encrypted chat, and the final say is always yours.', C: ProfileScreen },
] as const;

const HOLD_MS = 5200;

/**
 * Hero: the real app, in a phone, stepping through the four things that define Y-WLTH.
 * Calm by design: crossfades only. Pauses when the visitor picks a view or hovers.
 */
export function HeroDemo() {
  const { width, height } = useWindowDimensions();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  // size to the window so phone, caption and selector are all visible without scrolling
  const fit = Math.floor((height - 330) / 2.05);
  const pw = Math.max(300, Math.min(width > 1100 ? 340 : width > 700 ? 320 : 290, fit));

  useEffect(() => {
    if (paused || hover) return;
    const t = setTimeout(() => setI((x) => (x + 1) % VIEWS.length), HOLD_MS);
    return () => clearTimeout(t);
  }, [i, paused, hover]);

  const pick = (k: number) => { setI(k); setPaused(true); };
  const v = VIEWS[i];
  return (
    <View style={{ alignItems: 'center', gap: 22 }} {...({ onPointerEnter: () => setHover(true), onPointerLeave: () => setHover(false) } as object)}>
      <View pointerEvents="none" style={{ position: 'absolute', top: 40, width: pw * 1.35, height: pw * 1.35, borderRadius: 999, backgroundColor: 'rgba(1,208,210,0.10)', filter: 'blur(70px)' } as object} />
      <Phone width={pw} tilt={width > 1100 ? 2 : 0}>
        <View pointerEvents="none" style={{ flex: 1 }}>
          {VIEWS.map((x, k) => (
            <View key={x.k} style={[{ position: 'absolute', inset: 0 } as object, { opacity: k === i ? 1 : 0, transition: 'opacity .7s ease' } as object]}>
              <x.C />
            </View>
          ))}
        </View>
      </Phone>

      <View style={{ alignItems: 'center', gap: 12, maxWidth: pw + 60 }}>
        <Text key={v.k} style={{ fontFamily: font.m, fontSize: 14.5, lineHeight: 21, color: c.textDim, textAlign: 'center', minHeight: 44 }}>{v.line}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
          {VIEWS.map((x, k) => {
            const on = k === i;
            return (
              <Pressable key={x.k} onPress={() => pick(k)} accessibilityRole="button" accessibilityLabel={x.tab} style={({ hovered }: { hovered?: boolean }) => ({ paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999, backgroundColor: on ? c.teal : hovered ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: on ? c.teal : c.border })}>
                <Text style={{ fontFamily: font.m, fontSize: 12.5, color: on ? c.navy : c.textDim }}>{x.tab}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
