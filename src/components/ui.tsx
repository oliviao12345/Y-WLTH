import React from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TextProps, View, ViewStyle, StyleProp } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, Rect, Stop } from 'react-native-svg';
import { c, font, radius } from '@/theme/tokens';

type Variant = 'display' | 'title' | 'h2' | 'body' | 'small' | 'label' | 'num';
const V: Record<Variant, object> = {
  display: { fontFamily: font.sb, fontSize: 44, letterSpacing: -1.4, color: c.text },
  title: { fontFamily: font.sb, fontSize: 28, letterSpacing: -0.6, color: c.text },
  h2: { fontFamily: font.sb, fontSize: 18, letterSpacing: -0.2, color: c.text },
  body: { fontFamily: font.r, fontSize: 15, lineHeight: 22, color: c.textDim },
  small: { fontFamily: font.r, fontSize: 13, lineHeight: 18, color: c.muted },
  label: { fontFamily: font.m, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: c.muted },
  num: { fontFamily: font.m, fontSize: 16, color: c.text, fontVariant: ['tabular-nums'] },
};

export function Txt({ v = 'body', style, ...p }: TextProps & { v?: Variant }) {
  return <Text {...p} style={[V[v], style]} />;
}

export function Card({ children, style, onPress, pad = true }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; pad?: boolean }) {
  const s = [styles.card, pad && { padding: 18 }, style];
  if (onPress)
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [s, pressed && { opacity: 0.85, transform: [{ scale: 0.992 }] }]}>
        {children}
      </Pressable>
    );
  return <View style={s}>{children}</View>;
}

export function Pill({ children, tone = 'pos', style }: { children: React.ReactNode; tone?: 'pos' | 'neg' | 'neutral'; style?: StyleProp<ViewStyle> }) {
  const bg = tone === 'pos' ? c.tealSoft : tone === 'neg' ? c.orangeSoft : 'rgba(255,255,255,0.08)';
  const fg = tone === 'pos' ? c.teal : tone === 'neg' ? c.orange : c.textDim;
  return (
    <View style={[{ backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, alignSelf: 'flex-start' }, style]}>
      <Text style={{ color: fg, fontFamily: font.m, fontSize: 12.5, fontVariant: ['tabular-nums'] }}>{children}</Text>
    </View>
  );
}

export function Segmented<T extends string>({ options, value, onChange, small }: { options: { k: T; label: string }[]; value: T; onChange: (k: T) => void; small?: boolean }) {
  return (
    <View style={styles.seg}>
      {options.map((o) => {
        const on = o.k === value;
        return (
          <Pressable key={o.k} onPress={() => onChange(o.k)} style={[styles.segItem, on && styles.segOn, small && { paddingVertical: 6 }]}>
            <Text style={{ fontFamily: font.m, fontSize: small ? 12.5 : 13.5, color: on ? c.bgDeep : c.textDim }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 28, marginBottom: 12 }}>
      <Txt v="h2">{title}</Txt>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text style={{ fontFamily: font.m, fontSize: 13, color: c.teal }}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Row({ left, right, sub, dot, onPress, last }: { left: string; right?: string; sub?: string; dot?: string; onPress?: () => void; last?: boolean }) {
  const inner = (
    <View style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border }]}>
      {dot ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: dot, marginRight: 12 }} /> : null}
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: font.m, fontSize: 15, color: c.text }} numberOfLines={1}>{left}</Text>
        {sub ? <Text style={{ fontFamily: font.r, fontSize: 12.5, color: c.muted, marginTop: 2 }} numberOfLines={1}>{sub}</Text> : null}
      </View>
      {right ? <Text numberOfLines={1} style={{ flexShrink: 0, marginLeft: 12, fontFamily: font.m, fontSize: 15, color: c.text, fontVariant: ['tabular-nums'] }}>{right}</Text> : null}
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{inner}</Pressable> : inner;
}

export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} />
      <View style={styles.sheetWrap} pointerEvents="box-none">
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Txt v="h2">{title}</Txt>
            <Pressable onPress={onClose} hitSlop={12}><Icon name="close" size={22} color={c.textDim} /></Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

/** The Y-WLTH "Y" mark, redrawn in SVG from the brand splash. Swap for the official vector when available. */
export function YMark({ size = 28, color = '#19E3E8' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d="M5 4 L50 60 M24 4 L50 44 M95 4 L50 60 M76 4 L50 44" stroke={color} strokeWidth={8} strokeLinecap="round" fill="none" />
      <Path d="M30 58 H70 V92 Q70 98 64 98 H36 Q30 98 30 92 Z" fill={color} />
      <Path d="M42 66 V86 M58 66 V86" stroke={c.navy} strokeWidth={4} strokeLinecap="round" />
    </Svg>
  );
}

export function Wordmark({ size = 20, color = c.text }: { size?: number; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: size * 0.5 }}>
      <YMark size={size * 1.5} />
      <Text style={{ fontFamily: font.m, fontSize: size * 0.95, letterSpacing: size * 0.22, color }}>Y-WLTH</Text>
    </View>
  );
}

type IconName = 'home' | 'money' | 'plan' | 'adviser' | 'chevron' | 'close' | 'sync' | 'arrowUp' | 'arrowDown' | 'send' | 'sparkle' | 'lock' | 'check' | 'refresh' | 'back' | 'chat' | 'phone' | 'bolt' | 'link' | 'menu' | 'search' | 'clock' | 'instagram' | 'linkedin';
export function Icon({ name, size = 24, color = c.text }: { name: IconName; size?: number; color?: string }) {
  const p = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'home' && <Path d="M4 11l8-7 8 7v8.5a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z" {...p} />}
      {name === 'money' && (<><Path d="M4 20V10M10 20V4M16 20v-8M22 20H2" {...p} /></>)}
      {name === 'plan' && (<><Circle cx="12" cy="12" r="8.5" {...p} /><Circle cx="12" cy="12" r="4.5" {...p} /><Circle cx="12" cy="12" r="0.8" {...p} /></>)}
      {name === 'adviser' && (<><Circle cx="12" cy="8.5" r="3.6" {...p} /><Path d="M4.5 20c.8-4 3.8-6 7.5-6s6.7 2 7.5 6" {...p} /></>)}
      {name === 'chevron' && <Path d="M9 5l7 7-7 7" {...p} />}
      {name === 'back' && <Path d="M15 5l-7 7 7 7" {...p} />}
      {name === 'close' && <Path d="M6 6l12 12M18 6L6 18" {...p} />}
      {name === 'sync' && <Path d="M20 8a8 8 0 00-14-2M4 4v4h4M4 16a8 8 0 0014 2M20 20v-4h-4" {...p} />}
      {name === 'refresh' && <Path d="M20 8a8 8 0 00-14-2M4 4v4h4M4 16a8 8 0 0014 2M20 20v-4h-4" {...p} />}
      {name === 'arrowUp' && <Path d="M7 17L17 7M9 7h8v8" {...p} />}
      {name === 'arrowDown' && <Path d="M7 7l10 10M17 9v8H9" {...p} />}
      {name === 'send' && <Path d="M5 12h14M13 6l6 6-6 6" {...p} />}
      {name === 'sparkle' && <Path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" {...p} />}
      {name === 'lock' && (<><Rect x="5" y="11" width="14" height="9" rx="2" {...p} /><Path d="M8 11V8a4 4 0 018 0v3" {...p} /></>)}
      {name === 'check' && <Path d="M5 12.5l4.5 4.5L19 7.5" {...p} />}
      {name === 'chat' && <Path d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v8a2.5 2.5 0 01-2.5 2.5H11l-4.5 3.5V17H6.5A2.5 2.5 0 014 14.5z" {...p} />}
      {name === 'phone' && <Path d="M6.5 3.5h3l1.5 4-2 1.3a11 11 0 005.2 5.2l1.3-2 4 1.5v3a2 2 0 01-2.2 2A16.5 16.5 0 014.5 5.7a2 2 0 012-2.2z" {...p} />}
      {name === 'link' && <Path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" {...p} />}
      {name === 'clock' && <><Circle cx="12" cy="12" r="8.5" {...p} /><Path d="M12 7.5V12l3 2" {...p} /></>}
      {name === 'instagram' && <><Rect x="3.5" y="3.5" width="17" height="17" rx="5" {...p} /><Circle cx="12" cy="12" r="4" {...p} /><Circle cx="17.2" cy="6.8" r="0.9" fill={color} /></>}
      {name === 'linkedin' && <><Rect x="3.5" y="3.5" width="17" height="17" rx="3" {...p} /><Path d="M8 10.5V16M8 7.6v.1M11.5 16v-3.2a2.3 2.3 0 014.6 0V16M11.5 10.5V16" {...p} /></>}
      {name === 'search' && <><Circle cx="11" cy="11" r="6.5" {...p} /><Path d="M16 16l4.5 4.5" {...p} /></>}
      {name === 'menu' && <Path d="M4 7h16M4 12h16M4 17h16" {...p} />}
      {name === 'bolt' && <Path d="M13 3L5 13.5h6L10 21l8-10.5h-6z" {...p} />}
    </Svg>
  );
}

export const webShadow = Platform.select({ web: { boxShadow: '0 20px 60px rgba(0,0,0,0.35)' } as object, default: {} });

const styles = StyleSheet.create({
  card: { backgroundColor: c.card, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: c.borderHi, overflow: 'hidden' },
  seg: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: radius.pill, padding: 3, alignSelf: 'flex-start' },
  segItem: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill },
  segOn: { backgroundColor: c.teal },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  scrim: { ...StyleSheet.absoluteFill as object, backgroundColor: 'rgba(2,4,20,0.7)' },
  sheetWrap: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  sheet: { width: '100%', maxWidth: 560, maxHeight: '85%', backgroundColor: c.navy, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: 36, borderWidth: StyleSheet.hairlineWidth, borderColor: c.borderHi },
  grabber: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 14 },
});

/** Single-line text that shrinks to fit its container on every platform (adjustsFontSizeToFit is native-only). */
export function FitText({ children, max, style }: { children: string; max: number; style?: object }) {
  const [w, setW] = React.useState(0);
  const size = w ? Math.min(max, Math.floor(w / (children.length * 0.56))) : max;
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ alignSelf: 'stretch' }}>
      <Text numberOfLines={1} style={[{ fontSize: size }, style]}>{children}</Text>
    </View>
  );
}

/**
 * "Y Branch": the mark for asking Y-WLTH a question. A stem that splits into two leaf-shaped arms, with a small
 * point of insight at the top right. Reads cleanly from 32px down to 12px.
 */
export function YBranch({ size = 20, muted = false }: { size?: number; muted?: boolean }) {
  const top = muted ? '#5B6490' : '#3CF2F4';
  const bottom = muted ? '#444C78' : '#01C9CC';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <SvgGradient id="ybranch" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={top} />
          <Stop offset="1" stopColor={bottom} />
        </SvgGradient>
      </Defs>
      <Path d="M11 15C10.4 11 7.6 7.6 3.4 5.4 2.9 9.8 5.6 13.8 10.4 15.8Z" fill="url(#ybranch)" />
      <Path d="M13 15C13.6 10.8 16.2 7.2 19 5.2 19.8 9.4 17.6 13.4 13.6 15.8Z" fill="url(#ybranch)" />
      <Rect x="10.85" y="13.2" width="2.3" height="9" rx="1.15" fill="url(#ybranch)" />
      <Circle cx="21" cy="2.6" r="1.6" fill={top} />
    </Svg>
  );
}
