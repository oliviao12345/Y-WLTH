import React, { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, Platform, Pressable, ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@/components/ui';
import { c } from '@/theme/tokens';

const web = Platform.OS === 'web';

/**
 * A sideways scroller that works with a mouse as well as a finger. On the web it shows arrow buttons at the edges
 * (only when there is more to see), can be dragged with the mouse, and fades at the edges.
 */
export function HScroll({ children, contentContainerStyle, style, bg = c.bg }: { children: React.ReactNode; contentContainerStyle?: StyleProp<ViewStyle>; style?: StyleProp<ViewStyle>; bg?: string }) {
  const ref = useRef<ScrollView>(null);
  const [x, setX] = useState(0);
  const [cw, setCw] = useState(0);
  const [w, setW] = useState(0);
  const drag = useRef<{ startX: number; startScroll: number; moved: boolean } | null>(null);
  const xRef = useRef(0);
  const canLeft = x > 4;
  const canRight = cw - w - x > 4;
  const by = (d: number) => ref.current?.scrollTo({ x: Math.max(0, Math.min(cw - w, xRef.current + d)), animated: true });
  const clear = bg.replace(/rgb\((.*)\)/, 'rgba($1,0)');
  const fadeFrom = bg.startsWith('#') ? bg + '00' : 'rgba(5,9,43,0)';

  const box = useRef<View>(null);
  useEffect(() => {
    if (!web) return;
    const node = box.current as unknown as HTMLElement | null;
    if (!node) return;
    let down: { x: number; s: number; moved: boolean } | null = null;
    const onDown = (e: PointerEvent) => { if (e.pointerType === 'mouse' && e.button === 0) down = { x: e.clientX, s: xRef.current, moved: false }; };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = down.x - e.clientX;
      if (Math.abs(dx) > 4) down.moved = true;
      if (down.moved) ref.current?.scrollTo({ x: Math.max(0, down.s + dx), animated: false });
    };
    const onUp = () => { if (down?.moved) { const swallow = (ev: Event) => { ev.stopPropagation(); ev.preventDefault(); }; node.addEventListener('click', swallow, { capture: true, once: true }); setTimeout(() => node.removeEventListener('click', swallow, true), 0); } down = null; };
    node.addEventListener('pointerdown', onDown, true);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    node.style.cursor = 'grab';
    return () => { node.removeEventListener('pointerdown', onDown, true); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  }, []);

  return (
    <View ref={box} style={style} onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}>
      <ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => { xRef.current = e.nativeEvent.contentOffset.x; setX(xRef.current); }}
        onContentSizeChange={(width) => setCw(width)}
        contentContainerStyle={contentContainerStyle}
      >
        {children}
      </ScrollView>
      {canRight && <LinearGradient pointerEvents="none" colors={[fadeFrom, bg]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 56 }} />}
      {canLeft && <LinearGradient pointerEvents="none" colors={[bg, fadeFrom]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 40 }} />}
      {web && canRight && (
        <Pressable onPress={() => by(260)} accessibilityLabel="Scroll right" style={({ hovered }: { hovered?: boolean }) => ({ position: 'absolute', right: 2, top: '50%', marginTop: -15, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: hovered ? c.teal : 'rgba(10,18,70,0.95)', borderWidth: 1, borderColor: 'rgba(1,208,210,0.5)' })}>
          {({ hovered }: { hovered?: boolean }) => <Icon name="chevron" size={15} color={hovered ? c.navy : c.teal} />}
        </Pressable>
      )}
      {web && canLeft && (
        <Pressable onPress={() => by(-260)} accessibilityLabel="Scroll left" style={({ hovered }: { hovered?: boolean }) => ({ position: 'absolute', left: 2, top: '50%', marginTop: -15, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: hovered ? c.teal : 'rgba(10,18,70,0.95)', borderWidth: 1, borderColor: 'rgba(1,208,210,0.5)' })}>
          {({ hovered }: { hovered?: boolean }) => <Icon name="back" size={15} color={hovered ? c.navy : c.teal} />}
        </Pressable>
      )}
    </View>
  );
}
