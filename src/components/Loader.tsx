import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing, interpolate, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, RadialGradient, Stop } from 'react-native-svg';
import { Image } from 'expo-image';
import { c, font } from '@/theme/tokens';

export const SPLASH_MS = 3600;
const BG = '#061552';

/** A ring of ticks fading into a comet tail — the Y-WLTH launch-screen motif. */
const TickRing = React.memo(function TickRing({ size, n, inner, outer, width, color }: { size: number; n: number; inner: number; outer: number; width: number; color: string }) {
  const mid = size / 2;
  return (
    <Svg width={size} height={size}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        const t = i / n;
        return (
          <Line
            key={i}
            x1={mid + Math.cos(a) * inner * mid} y1={mid + Math.sin(a) * inner * mid}
            x2={mid + Math.cos(a) * outer * mid} y2={mid + Math.sin(a) * outer * mid}
            stroke={color} strokeWidth={width} strokeLinecap="round" opacity={Math.pow(t, 2.4) * 0.95 + 0.05}
          />
        );
      })}
    </Svg>
  );
});

function Particle({ x, y, size, delay, rise }: { x: number; y: number; size: number; delay: number; rise: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: 3200 + rise * 6, easing: Easing.inOut(Easing.quad) }), -1, true));
  }, [t, delay, rise]);
  const st = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.5, 1], [0, 0.85, 0]),
    transform: [{ translateY: -t.value * rise }, { scale: 0.6 + t.value * 0.8 }],
  }));
  return <Animated.View style={[{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size, backgroundColor: c.teal }, st]} />;
}

/** The real Y mark (lifted from the brand splash) with a stacked, tinted back-face so it reads as solid when it turns. */
function ExtrudedY({ size }: { size: number }) {
  const ratio = 1.04; // height / width of the cropped mark
  const w = size, h = size * ratio;
  const layers = [11, 9.5, 8, 6.5, 5, 3.5, 2];
  return (
    <View style={{ width: w, height: h }}>
      {layers.map((d, i) => (
        <Image
          key={i}
          source={require('../../assets/images/y-mark.png')}
          contentFit="contain"
          tintColor={`rgb(${8 + i * 3}, ${60 + i * 8}, ${118 + i * 9})`}
          style={{ position: 'absolute', left: d * 0.5, top: d * 0.95, width: w, height: h }}
        />
      ))}
      <Image source={require('../../assets/images/y-mark.png')} contentFit="contain" style={{ position: 'absolute', left: 0, top: 0, width: w, height: h }} />
    </View>
  );
}

export function Loader({ onDone }: { onDone?: () => void }) {
  const { width, height } = useWindowDimensions();
  const R = Math.min(width * 0.98, 440);

  const open = useSharedValue(0);   // halo opens from edge-on to face-on
  const spin = useSharedValue(0);   // continuous rotation
  const sway = useSharedValue(0);   // idle 3D wobble
  const logo = useSharedValue(0);   // Y flips in
  const text = useSharedValue(0);   // wordmark tracks out
  const exit = useSharedValue(0);   // burst forward

  useEffect(() => {
    open.value = withTiming(1, { duration: 1500, easing: Easing.bezier(0.16, 1, 0.3, 1) });
    spin.value = withRepeat(withTiming(360, { duration: 6000, easing: Easing.linear }), -1);
    sway.value = withDelay(1400, withRepeat(withSequence(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }), withTiming(-1, { duration: 1500, easing: Easing.inOut(Easing.sin) })), -1, true));
    logo.value = withDelay(450, withSpring(1, { damping: 11, stiffness: 70, mass: 0.9 }));
    text.value = withDelay(1100, withTiming(1, { duration: 1300, easing: Easing.out(Easing.cubic) }));
    exit.value = withDelay(SPLASH_MS - 650, withTiming(1, { duration: 650, easing: Easing.in(Easing.cubic) }));
    const t = setTimeout(() => onDone?.(), SPLASH_MS);
    return () => clearTimeout(t);
  }, [open, spin, sway, logo, text, exit, onDone]);

  // Main halo: tilts through perspective from nearly edge-on to face-on, then sways.
  const halo = useAnimatedStyle(() => ({
    opacity: interpolate(open.value, [0, 0.15, 1], [0, 1, 1]) * (1 - exit.value),
    transform: [
      { perspective: 850 },
      { rotateX: `${interpolate(open.value, [0, 1], [82, 0]) + sway.value * 7}deg` },
      { rotateY: `${sway.value * 9}deg` },
      { scale: interpolate(open.value, [0, 1], [0.55, 1]) * (1 + exit.value * 1.9) },
    ],
  }));
  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotateZ: `${spin.value}deg` }] }));
  const spinBack = useAnimatedStyle(() => ({ transform: [{ rotateZ: `${-spin.value * 0.7}deg` }] }));

  // Larger back ring: counter-rotates and tilts the opposite way for parallax depth.
  const halo2 = useAnimatedStyle(() => ({
    opacity: interpolate(open.value, [0, 0.4, 1], [0, 0, 0.55]) * (1 - exit.value),
    transform: [
      { perspective: 850 },
      { rotateX: `${interpolate(open.value, [0, 1], [-70, 18]) - sway.value * 8}deg` },
      { rotateY: `${-sway.value * 12}deg` },
      { scale: interpolate(open.value, [0, 1], [0.4, 1.12]) * (1 + exit.value * 2.4) },
    ],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: interpolate(logo.value, [0, 0.25, 1], [0, 1, 1]) * (1 - exit.value * 0.9),
    transform: [
      { perspective: 700 },
      { rotateY: `${interpolate(logo.value, [0, 1], [-100, 0]) + sway.value * 16}deg` },
      { rotateX: `${sway.value * -5}deg` },
      { scale: interpolate(logo.value, [0, 1], [0.35, 1]) * (1 + exit.value * 3) },
    ],
  }));

  const wordStyle = useAnimatedStyle(() => ({
    opacity: text.value * (1 - exit.value),
    letterSpacing: interpolate(text.value, [0, 1], [0, 9]),
    transform: [{ translateY: interpolate(text.value, [0, 1], [14, 0]) }, { scale: 1 + exit.value * 0.6 }],
  }));

  const glow = useAnimatedStyle(() => ({
    opacity: interpolate(open.value, [0, 1], [0.2, 1]) * (1 - exit.value * 0.4),
    transform: [{ scale: 1 + sway.value * 0.06 + exit.value * 1.4 }],
  }));

  const root = useAnimatedStyle(() => ({ opacity: 1 - interpolate(exit.value, [0.55, 1], [0, 1], 'clamp') }));

  const particles = useMemo(
    () => Array.from({ length: 22 }, (_, i) => {
      const r = (n: number) => { const x = Math.sin(i * 91.7 + n * 13.3) * 43758.5453; return x - Math.floor(x); };
      return { key: i, x: r(1) * width, y: height * 0.25 + r(2) * height * 0.6, size: 2 + r(3) * 4, delay: r(4) * 1800, rise: 60 + r(5) * 140 };
    }),
    [width, height],
  );

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: BG, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, root]}>
      <Animated.View style={[{ position: 'absolute', width: R * 1.7, height: R * 1.7 }, glow]} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="g" cx="50" cy="50" r="50" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor="#13A8FF" stopOpacity={0.55} />
              <Stop offset="0.45" stopColor="#0B4DC8" stopOpacity={0.22} />
              <Stop offset="1" stopColor={BG} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx="50" cy="50" r="50" fill="url(#g)" />
        </Svg>
      </Animated.View>

      {particles.map((p) => <Particle key={p.key} x={p.x} y={p.y} size={p.size} delay={p.delay} rise={p.rise} />)}

      <Animated.View style={[{ position: 'absolute', width: R, height: R }, halo2]} pointerEvents="none">
        <Animated.View style={spinBack}>
          <TickRing size={R} n={90} inner={0.84} outer={0.97} width={1.6} color="#3C7BFF" />
        </Animated.View>
      </Animated.View>

      <Animated.View style={[{ position: 'absolute', width: R * 0.9, height: R * 0.9 }, halo]} pointerEvents="none">
        <Animated.View style={spinStyle}>
          <TickRing size={R * 0.9} n={72} inner={0.66} outer={0.99} width={4.6} color="#1FE6F0" />
        </Animated.View>
      </Animated.View>

      <Animated.View style={[{ position: 'absolute', top: height / 2 - R * 0.19 }, logoStyle]}>
        <ExtrudedY size={R * 0.22} />
      </Animated.View>
      <Animated.Text style={[{ position: 'absolute', top: height / 2 + R * 0.12, fontFamily: font.m, fontSize: 21, color: c.white }, wordStyle]}>
        Y-WLTH
      </Animated.Text>
    </Animated.View>
  );
}
