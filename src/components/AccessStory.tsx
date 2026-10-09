import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Icon } from '@/components/ui';
import { MultiLine } from '@/components/charts';
import { c, font } from '@/theme/tokens';

const STEPS = [
  { t: 'Introduction', d: 'It starts with a conversation, not a form. We learn what you want from your money, and you learn how we work.', tag: 'A call or meeting' },
  { t: 'Discovery', d: 'We sit down together to understand your circumstances, your finances and your life plans, so we know where you are and where you want to get to.', tag: 'Getting to know you' },
  { t: 'Your Strategy', d: 'We build your financial life strategy: a clear, visual forecast of your wealth out to age 100, stress-tested against inflation, tax, fees and market shocks. Then we walk you through it.', tag: 'Seeing your future' },
  { t: 'You Decide', d: 'Having seen it, you choose whether to become a Y-WLTH client. There is no pressure, and nothing is decided for you. That stays true once you are a client: Y-WLTH recommends, you approve.', tag: 'Your call' },
  { t: 'Onboarding & App', d: 'You meet your dedicated adviser and advice team, learn about the services and fees, and are given access to the Y-WLTH app.', tag: 'Welcome' },
];

const plan = Array.from({ length: 40 }, (_, i) => 100 + i * 2.6 + Math.sin(i / 3) * 3);
const stressed = Array.from({ length: 40 }, (_, i) => 100 + (i < 14 ? i * 1.8 : 25 - (i - 14) * 0.4) + Math.sin(i / 2.5) * 2);

/** A small illustration for each step. */
function Visual({ i }: { i: number }) {
  const box = { width: '100%' as const, maxWidth: 380, aspectRatio: 1.15, borderRadius: 28, backgroundColor: c.card, borderWidth: 1, borderColor: c.borderHi, padding: 22, justifyContent: 'center' as const, gap: 14, overflow: 'hidden' as const };
  if (i === 0) return (
    <View style={box}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: c.teal, alignItems: 'center', justifyContent: 'center' }}><Icon name="phone" size={22} color={c.navy} /></View><View><Text style={{ fontFamily: font.sb, fontSize: 17, color: c.text }}>Call Us</Text><Text style={{ fontFamily: font.r, fontSize: 13, color: c.muted }}>+44 20 7946 0000</Text></View></View>
      {['What do you want from your money?', 'How do we work?', 'Is Y-WLTH right for you?'].map((q, k) => (
        <View key={q} style={{ alignSelf: k % 2 ? 'flex-end' : 'flex-start', maxWidth: '86%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, backgroundColor: k % 2 ? c.tealSoft : 'rgba(255,255,255,0.07)' }}><Text style={{ fontFamily: font.m, fontSize: 13.5, color: k % 2 ? c.teal : c.text }}>{q}</Text></View>
      ))}
    </View>
  );
  if (i === 1) return (
    <View style={box}>
      <Text style={{ fontFamily: font.m, fontSize: 11.5, letterSpacing: 1.2, color: c.muted, textTransform: 'uppercase' }}>We look at</Text>
      {['Your circumstances', 'Your finances', 'Your life plans'].map((x) => (
        <View key={x} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.tealSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={15} color={c.teal} /></View>
          <Text style={{ fontFamily: font.sb, fontSize: 16, color: c.text }}>{x}</Text>
        </View>
      ))}
    </View>
  );
  if (i === 2) return (
    <View style={box}>
      <Text style={{ fontFamily: font.m, fontSize: 11.5, letterSpacing: 1.2, color: c.muted, textTransform: 'uppercase' }}>Your wealth to age 100</Text>
      <MultiLine height={150} lines={[{ key: 's', color: c.orange, values: stressed, dashed: true, width: 2.2 }, { key: 'p', color: c.teal, values: plan, width: 2.6 }]} />
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <Text style={{ fontFamily: font.m, fontSize: 12.5, color: c.teal }}>● Your plan</Text>
        <Text style={{ fontFamily: font.m, fontSize: 12.5, color: c.orange }}>● Stress-tested</Text>
      </View>
    </View>
  );
  if (i === 3) return (
    <View style={[box, { alignItems: 'center' }]}>
      <Text style={{ fontFamily: font.sb, fontSize: 20, color: c.text, textAlign: 'center' }}>Become a Y-WLTH client?</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
        <View style={{ paddingHorizontal: 22, paddingVertical: 13, borderRadius: 999, backgroundColor: c.teal }}><Text style={{ fontFamily: font.sb, fontSize: 14.5, color: c.navy }}>Yes, let's go</Text></View>
        <View style={{ paddingHorizontal: 22, paddingVertical: 13, borderRadius: 999, borderWidth: 1, borderColor: c.borderHi }}><Text style={{ fontFamily: font.sb, fontSize: 14.5, color: c.text }}>Not now</Text></View>
      </View>
      <Text style={{ fontFamily: font.r, fontSize: 13, color: c.muted, textAlign: 'center', marginTop: 6 }}>Either answer is fine.</Text>
    </View>
  );
  return (
    <View style={[box, { alignItems: 'center' }]}>
      <View style={{ width: 74, height: 74, borderRadius: 22, backgroundColor: c.teal, alignItems: 'center', justifyContent: 'center' }}><Icon name="lock" size={34} color={c.navy} /></View>
      <Text style={{ fontFamily: font.sb, fontSize: 20, color: c.text }}>Your app is ready</Text>
      <Text style={{ fontFamily: font.r, fontSize: 13.5, color: c.textDim, textAlign: 'center' }}>Face ID and multi-factor sign-in.{'\n'}Your adviser team is one tap away.</Text>
    </View>
  );
}

/**
 * The client journey as a pinned scroll story: the stage stays put while the steps change as you scroll.
 * Falls back to a simple stacked list on native.
 */
export function AccessStory() {
  const { width, height } = useWindowDimensions();
  const wide = width > 860;
  const outer = useRef<View>(null);
  const [p, setP] = useState(0);
  const stageH = Math.max(400, Math.min(500, height - 190));
  const STICK = 104; // below the floating menu
  const per = Math.max(240, height * 0.4);
  const trackH = stageH + STEPS.length * per;

  const scrollerOf = (node: HTMLElement): HTMLElement | Window => {
    for (let el = node.parentElement; el; el = el.parentElement) {
      const o = getComputedStyle(el).overflowY;
      if ((o === 'auto' || o === 'scroll') && el.scrollHeight > el.clientHeight) return el;
    }
    return window;
  };

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const node = outer.current as unknown as HTMLElement | null;
    if (!node) return;
    const on = () => {
      const r = node.getBoundingClientRect();
      const total = Math.max(1, r.height - stageH);
      setP(Math.max(0, Math.min(1, (STICK - r.top) / total)));
    };
    on();
    // capture phase: hears a scroll on ANY element, so it works whichever container ends up scrolling
    document.addEventListener('scroll', on, true);
    window.addEventListener('resize', on);
    const t = setInterval(on, 400); // cheap safety net while layout settles
    return () => { document.removeEventListener('scroll', on, true); window.removeEventListener('resize', on); clearInterval(t); };
  }, [stageH, trackH]);

  const idx = Math.min(STEPS.length - 1, Math.floor(p * STEPS.length * 0.999));
  const jump = (k: number) => {
    const node = outer.current as unknown as HTMLElement | null;
    if (!node) return;
    const r = node.getBoundingClientRect();
    const delta = r.top - STICK + (k / STEPS.length + 0.5 / STEPS.length) * (r.height - stageH);
    const sc = scrollerOf(node);
    (sc as any).scrollBy({ top: delta, behavior: 'smooth' });
  };

  if (Platform.OS !== 'web') {
    return <View style={{ gap: 12 }}>{STEPS.map((s, k) => (<View key={s.t} style={{ padding: 18, borderRadius: 20, backgroundColor: c.card, borderWidth: 1, borderColor: c.border }}><Text style={{ fontFamily: font.sb, fontSize: 17, color: c.text }}>{k + 1}. {s.t}</Text><Text style={{ fontFamily: font.r, fontSize: 14, lineHeight: 21, color: c.textDim, marginTop: 6 }}>{s.d}</Text></View>))}</View>;
  }

  return (
    <View ref={outer} style={{ height: trackH, marginTop: -64 }}>
      <View style={{ position: 'sticky' as never, top: STICK, height: stageH, flexDirection: wide ? 'row' : 'column', alignItems: 'center', gap: wide ? 56 : 22 } as object}>
        {/* progress rail */}
        <View style={{ flexDirection: wide ? 'column' : 'row', alignItems: 'center', gap: wide ? 0 : 8, alignSelf: wide ? 'stretch' : 'center', justifyContent: 'center' }}>
          {STEPS.map((s, k) => {
            const done = k < idx, on = k === idx;
            return (
              <React.Fragment key={s.t}>
                <Pressable onPress={() => jump(k)} accessibilityLabel={`Step ${k + 1}: ${s.t}`} style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.teal : done ? c.tealSoft : 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: on || done ? c.teal : c.border, transition: 'all 0.35s ease' } as object}>
                  {done ? <Icon name="check" size={15} color={c.teal} /> : <Text style={{ fontFamily: font.b, fontSize: 13, color: on ? c.navy : c.muted }}>{k + 1}</Text>}
                </Pressable>
                {k < STEPS.length - 1 && <View style={{ width: wide ? 2 : 18, height: wide ? 38 : 2, backgroundColor: done ? c.teal : 'rgba(255,255,255,0.1)', transition: 'background-color 0.35s ease' } as object} />}
              </React.Fragment>
            );
          })}
        </View>

        {/* the story */}
        <View style={{ flex: 1, width: '100%', height: '100%', justifyContent: 'center' }}>
          {STEPS.map((s, k) => {
            const on = k === idx;
            return (
              <View key={s.t} pointerEvents={on ? 'auto' : 'none'} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, flexDirection: wide ? 'row' : 'column', alignItems: 'center', justifyContent: 'center', gap: wide ? 48 : 18, opacity: on ? 1 : 0, transform: [{ translateY: on ? 0 : k < idx ? -28 : 28 }], transition: 'opacity 0.5s ease, transform 0.5s ease' } as object}>
                <View style={{ flex: wide ? 1 : undefined, gap: 12, maxWidth: 520 }}>
                  <Text style={{ fontFamily: font.m, fontSize: 12.5, letterSpacing: 1.6, color: c.teal, textTransform: 'uppercase' }}>Step {k + 1} of {STEPS.length} · {s.tag}</Text>
                  <Text style={{ fontFamily: font.b, fontSize: wide ? 120 : 64, lineHeight: wide ? 120 : 64, letterSpacing: -5, color: 'rgba(1,208,210,0.22)', marginBottom: wide ? -22 : -12 }}>{String(k + 1).padStart(2, '0')}</Text>
                  <Text style={{ fontFamily: font.sb, fontSize: wide ? 44 : 30, lineHeight: wide ? 50 : 36, letterSpacing: -1.2, color: c.text }}>{s.t}</Text>
                  <Text style={{ fontFamily: font.r, fontSize: wide ? 18 : 16, lineHeight: wide ? 28 : 24, color: c.textDim }}>{s.d}</Text>
                </View>
                <View style={{ flex: wide ? 1 : undefined, alignItems: 'center', width: wide ? undefined : '100%', maxWidth: 400 }}><Visual i={k} /></View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
