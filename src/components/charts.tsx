import React, { useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, Platform, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Stop } from 'react-native-svg';
import { c } from '@/theme/tokens';

/** Smooth area chart you can scrub with a finger/mouse. */
export function LineChart({ data, height = 190, color = c.teal, onScrub }: { data: number[]; height?: number; color?: string; onScrub?: (i: number | null) => void }) {
  const [w, setW] = useState(0);
  const [idx, setIdx] = useState<number | null>(null);
  const wRef = useRef(0);
  const dataRef = useRef(data);
  dataRef.current = data;

  const pad = 8;
  const { min, max } = useMemo(() => ({ min: Math.min(...data), max: Math.max(...data) }), [data]);
  const span = max - min || 1;
  const x = (i: number) => (i / (data.length - 1)) * (w || 1);
  const y = (v: number) => pad + (1 - (v - min) / span) * (height - pad * 2 - 14);

  const line = useMemo(() => {
    if (!w) return '';
    return data.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, w, height]);
  const area = line ? `${line} L${w},${height} L0,${height} Z` : '';

  const setFromX = (px: number) => {
    const n = dataRef.current.length;
    const i = Math.max(0, Math.min(n - 1, Math.round((px / (wRef.current || 1)) * (n - 1))));
    setIdx(i);
    onScrub?.(i);
  };
  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => setFromX(e.nativeEvent.locationX),
        onPanResponderMove: (e) => setFromX(e.nativeEvent.locationX),
        onPanResponderRelease: () => { setIdx(null); onScrub?.(null); },
        onPanResponderTerminate: () => { setIdx(null); onScrub?.(null); },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onLayout = (e: LayoutChangeEvent) => { wRef.current = e.nativeEvent.layout.width; setW(e.nativeEvent.layout.width); };

  return (
    <View
      style={{ height, touchAction: 'none' } as object}
      onLayout={onLayout}
      {...(Platform.OS === 'web'
        ? ({
            onPointerDown: (e: any) => setFromX(e.nativeEvent.offsetX ?? e.nativeEvent.locationX),
            onPointerMove: (e: any) => setFromX(e.nativeEvent.offsetX ?? e.nativeEvent.locationX),
            onPointerLeave: () => { setIdx(null); onScrub?.(null); },
            onPointerUp: () => { setIdx(null); onScrub?.(null); },
          } as object)
        : pan.panHandlers)}
    >
      {w > 0 && (
        <Svg width={w} height={height} style={{ pointerEvents: 'none' } as object}>
          <Defs>
            <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity={0.32} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={area} fill="url(#fill)" />
          <Path d={line} stroke={color} strokeWidth={2.4} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          {idx !== null && (
            <G>
              <Line x1={x(idx)} x2={x(idx)} y1={0} y2={height} stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
              <Circle cx={x(idx)} cy={y(data[idx])} r={9} fill={color} opacity={0.25} />
              <Circle cx={x(idx)} cy={y(data[idx])} r={4.5} fill={c.white} stroke={color} strokeWidth={2.5} />
            </G>
          )}
        </Svg>
      )}
    </View>
  );
}

export type DonutSlice = { key: string; value: number; color: string };

/** Donut with gapped arcs. Tap a slice to select it. */
export function Donut({ slices, size = 180, thickness = 18, selected, onSelect, children }: { slices: DonutSlice[]; size?: number; thickness?: number; selected?: string | null; onSelect?: (k: string | null) => void; children?: React.ReactNode }) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const gap = slices.length > 1 ? 5 : 0;
  let acc = 0;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <G transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.05)" strokeWidth={thickness} fill="none" />
          {slices.map((s) => {
            const len = Math.max(0, (s.value / total) * circ - gap);
            const off = -acc;
            acc += (s.value / total) * circ;
            const dim = selected && selected !== s.key;
            return (
              <Circle
                key={s.key}
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={s.color}
                strokeWidth={selected === s.key ? thickness + 5 : thickness}
                strokeDasharray={`${len} ${circ - len}`}
                strokeDashoffset={off}
                strokeLinecap="round"
                fill="none"
                opacity={dim ? 0.3 : 1}
                {...((Platform.OS === 'web' ? { onClick: () => onSelect?.(selected === s.key ? null : s.key) } : { onPress: () => onSelect?.(selected === s.key ? null : s.key) }) as object)}
              />
            );
          })}
        </G>
      </Svg>
      <View pointerEvents="none" style={{ alignItems: 'center', paddingHorizontal: thickness + 8 }}>{children}</View>
    </View>
  );
}

/** Tiny sparkline for list rows. */
export function Spark({ data, width = 64, height = 24, color = c.teal }: { data: number[]; width?: number; height?: number; color?: string }) {
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const d = data.map((v, i) => `${i ? 'L' : 'M'}${((i / (data.length - 1)) * width).toFixed(1)},${(height - 2 - ((v - min) / span) * (height - 4)).toFixed(1)}`).join(' ');
  return (
    <Svg width={width} height={height}>
      <Path d={d} stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Progress ring for goals. */
export function Ring({ pct, size = 64, thickness = 7, color = c.teal, children }: { pct: number; size?: number; thickness?: number; color?: string; children?: React.ReactNode }) {
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, pct));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <G transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={thickness} fill="none" />
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={thickness} fill="none" strokeLinecap="round" strokeDasharray={`${p * circ} ${circ}`} />
        </G>
      </Svg>
      {children}
    </View>
  );
}

/** Shared scrub handlers: pointer events on web, PanResponder on native. */
function useScrub(n: number, onIdx: (i: number | null) => void) {
  const wRef = useRef(0);
  const set = (px: number) => onIdx(Math.max(0, Math.min(n - 1, Math.round((px / (wRef.current || 1)) * (n - 1)))));
  const pan = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => set(e.nativeEvent.locationX),
      onPanResponderMove: (e) => set(e.nativeEvent.locationX),
      onPanResponderRelease: () => onIdx(null),
      onPanResponderTerminate: () => onIdx(null),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [n],
  );
  const handlers: object = Platform.OS === 'web'
    ? {
        onPointerDown: (e: any) => set(e.nativeEvent.offsetX ?? e.nativeEvent.locationX),
        onPointerMove: (e: any) => set(e.nativeEvent.offsetX ?? e.nativeEvent.locationX),
        onPointerLeave: () => onIdx(null),
        onPointerUp: () => onIdx(null),
      }
    : pan.panHandlers;
  return { handlers, setW: (w: number) => { wRef.current = w; } };
}

export type Layer = { key: string; label: string; color: string; values: number[] };

/** Stacked area: net worth by asset class through time. The visual "weight" of what you own. */
export function StackedArea({ layers, height = 220, onScrub }: { layers: Layer[]; height?: number; onScrub?: (i: number | null) => void }) {
  const [w, setW] = useState(0);
  const [idx, setIdx] = useState<number | null>(null);
  const n = layers[0].values.length;
  const totals = Array.from({ length: n }, (_, i) => layers.reduce((s, l) => s + l.values[i], 0));
  const max = Math.max(...totals) * 1.04;
  const min = Math.min(...totals) * 0.55;
  const x = (i: number) => (i / (n - 1)) * (w || 1);
  const y = (v: number) => height - 6 - ((v - min) / (max - min)) * (height - 14);
  const { handlers, setW: setRefW } = useScrub(n, (i) => { setIdx(i); onScrub?.(i); });

  const paths = useMemo(() => {
    if (!w) return [];
    const base = new Array(n).fill(0) as number[];
    return layers.map((l) => {
      const lower = base.slice();
      const upper = base.map((b, i) => b + l.values[i]);
      for (let i = 0; i < n; i++) base[i] = upper[i];
      const top = upper.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
      const bottom = lower.map((v, i) => `L${x(n - 1 - i).toFixed(1)},${y(lower[n - 1 - i]).toFixed(1)}`).join(' ');
      return { key: l.key, color: l.color, d: `${top} ${bottom} Z`, edge: top };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers, w, height]);

  return (
    <View style={{ height, touchAction: 'none' } as object} onLayout={(e: LayoutChangeEvent) => { setRefW(e.nativeEvent.layout.width); setW(e.nativeEvent.layout.width); }} {...handlers}>
      {w > 0 && (
        <Svg width={w} height={height} style={{ pointerEvents: 'none' } as object}>
          <Defs>
            {layers.map((l) => (
              <LinearGradient key={l.key} id={`sa-${l.key}`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={l.color} stopOpacity={0.92} />
                <Stop offset="1" stopColor={l.color} stopOpacity={0.5} />
              </LinearGradient>
            ))}
          </Defs>
          {paths.map((p) => (
            <G key={p.key}>
              <Path d={p.d} fill={`url(#sa-${p.key})`} />
              <Path d={p.edge} stroke="rgba(255,255,255,0.55)" strokeWidth={1} fill="none" />
            </G>
          ))}
          {idx !== null && <Line x1={x(idx)} x2={x(idx)} y1={0} y2={height} stroke="rgba(255,255,255,0.7)" strokeWidth={1.2} />}
        </Svg>
      )}
    </View>
  );
}

/** Two or more lines compared head to head (portfolio vs benchmark). */
export function MultiLine({ lines, height = 200, onScrub }: { lines: { key: string; color: string; values: number[]; width?: number; dashed?: boolean }[]; height?: number; onScrub?: (i: number | null) => void }) {
  const [w, setW] = useState(0);
  const [idx, setIdx] = useState<number | null>(null);
  const n = lines[0].values.length;
  const all = lines.flatMap((l) => l.values);
  const lo = Math.min(...all), hi = Math.max(...all);
  const x = (i: number) => (i / (n - 1)) * (w || 1);
  const y = (v: number) => 10 + (1 - (v - lo) / (hi - lo || 1)) * (height - 20);
  const { handlers, setW: setRefW } = useScrub(n, (i) => { setIdx(i); onScrub?.(i); });
  return (
    <View style={{ height, touchAction: 'none' } as object} onLayout={(e: LayoutChangeEvent) => { setRefW(e.nativeEvent.layout.width); setW(e.nativeEvent.layout.width); }} {...handlers}>
      {w > 0 && (
        <Svg width={w} height={height} style={{ pointerEvents: 'none' } as object}>
          {[0.25, 0.5, 0.75].map((g) => <Line key={g} x1={0} x2={w} y1={height * g} y2={height * g} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />)}
          {lines.map((l) => (
            <Path key={l.key} d={l.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')} stroke={l.color} strokeWidth={l.width ?? 2.4} strokeDasharray={l.dashed ? '5 5' : undefined} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {idx !== null && (
            <G>
              <Line x1={x(idx)} x2={x(idx)} y1={0} y2={height} stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
              {lines.map((l) => <Circle key={l.key} cx={x(idx)} cy={y(l.values[idx])} r={4.5} fill={c.white} stroke={l.color} strokeWidth={2.5} />)}
            </G>
          )}
        </Svg>
      )}
    </View>
  );
}
