import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card, Icon, Pill, Segmented } from '@/components/ui';
import { categorise, insightFor, type CatTotal, type Dir } from '@/lib/categories';
import type { Figures, Scope } from '@/lib/money';
import { c, font, gbp } from '@/theme/tokens';

/**
 * Money in / money out as one stacked bar and one sentence. Tap a segment to open just that category.
 * Replaces a donut plus a long list: people want the answer, then the detail only if they ask.
 */
export function SpendingMap({ f, prev, dir, onDir, scope, live }: { f: Figures; prev: Figures | null; dir: Dir; onDir: (d: Dir) => void; scope: Scope; live: boolean }) {
  const cats = useMemo(() => categorise(f.groups, dir, scope), [f, dir, scope]);
  const prevCats = useMemo(() => (prev ? categorise(prev.groups, dir, scope) : null), [prev, dir, scope]);
  const total = cats.reduce((s, x) => s + x.total, 0);
  const [sel, setSel] = useState<string | null>(null);
  const [all, setAll] = useState(false);
  useEffect(() => { setSel(null); setAll(false); }, [dir, scope, f]);
  const active: CatTotal | undefined = cats.find((x) => x.key === sel) ?? cats[0];
  const { headline, sub } = insightFor(cats, prevCats, dir);
  const delta = active && prevCats ? active.total - (prevCats.find((p) => p.key === active.key)?.total ?? 0) : null;
  // Live months have the individual lines; saved months only keep totals by group.
  const lines = active && live ? f.lines.filter((l) => l.kind === (dir === 'in' ? 'income' : 'cost') && active.groups.includes(l.group ?? l.name)).sort((a, b) => b.value - a.value) : [];
  const rows = active ? (lines.length ? lines.map((l) => ({ name: l.name, value: l.value })) : active.items) : [];
  const shown = all ? rows : rows.slice(0, 4);

  return (
    <Card>
      <Segmented<Dir> options={[{ k: 'out', label: 'Money out' }, { k: 'in', label: 'Money in' }]} value={dir} onChange={onDir} small />

      {!cats.length ? (
        <Text style={{ fontFamily: font.r, fontSize: 14.5, color: c.textDim, marginTop: 16 }}>Nothing recorded for this month.</Text>
      ) : (
        <>
          <Text style={{ fontFamily: font.sb, fontSize: 19, lineHeight: 26, letterSpacing: -0.3, color: c.text, marginTop: 18 }}>{headline}</Text>
          {sub ? <Text style={{ fontFamily: font.r, fontSize: 14, lineHeight: 20, color: c.textDim, marginTop: 4 }}>{sub}</Text> : null}
          <Text style={{ fontFamily: font.m, fontSize: 12.5, color: c.muted, marginTop: 8 }}>{gbp(total)} {dir === 'out' ? 'goes out' : 'comes in'} a month</Text>

          {/* the whole month in one bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', height: 38, gap: 3, marginTop: 14 }}>
            {cats.map((x) => {
              const on = active?.key === x.key;
              return (
                <Pressable key={x.key} accessibilityLabel={`${x.label} ${gbp(x.total)}`} onPress={() => { setSel(x.key); setAll(false); }} style={{ flex: x.total, height: on ? 38 : 26, borderRadius: 9, backgroundColor: x.color, opacity: on ? 1 : 0.5 }} />
              );
            })}
          </View>

          {/* legend doubles as the controls */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
            {cats.map((x) => {
              const on = active?.key === x.key;
              return (
                <Pressable key={x.key} onPress={() => { setSel(x.key); setAll(false); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: on ? x.color : c.border, backgroundColor: on ? 'rgba(255,255,255,0.06)' : 'transparent' }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: x.color }} />
                  <Text style={{ fontFamily: font.m, fontSize: 13, color: on ? c.text : c.textDim }}>{x.label}</Text>
                  <Text style={{ fontFamily: font.r, fontSize: 12.5, color: c.muted }}>{Math.round((x.total / total) * 100)}%</Text>
                </Pressable>
              );
            })}
          </View>

          {/* just the category you asked about */}
          {active && (
            <View style={{ marginTop: 16, padding: 18, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: c.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                <Text style={{ fontFamily: font.sb, fontSize: 18, color: c.text, flexShrink: 1 }} numberOfLines={1}>{active.label}</Text>
                <Text style={{ fontFamily: font.b, fontSize: 24, letterSpacing: -0.6, color: c.text, fontVariant: ['tabular-nums'], flexShrink: 0 }}>{gbp(active.total)}</Text>
              </View>
              <Text style={{ fontFamily: font.r, fontSize: 13, lineHeight: 19, color: c.muted, marginTop: 4 }}>{active.hint}</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.07)' }}>
                  <Text style={{ fontFamily: font.m, fontSize: 12, color: c.textDim }}>{Math.round((active.total / total) * 100)}% of {dir === 'out' ? 'what goes out' : 'what comes in'}</Text>
                </View>
                {delta !== null && Math.abs(delta) >= 1 ? (
                  <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: (dir === 'out' ? delta <= 0 : delta >= 0) ? c.tealSoft : c.orangeSoft }}>
                    <Text style={{ fontFamily: font.m, fontSize: 12, color: (dir === 'out' ? delta <= 0 : delta >= 0) ? c.teal : c.orange }}>{delta > 0 ? '▲' : '▼'} {gbp(Math.abs(delta))} vs last month</Text>
                  </View>
                ) : null}
              </View>

              <View style={{ marginTop: 14 }}>
                {shown.map((r, k) => (
                  <View key={r.name} style={{ paddingVertical: 11, borderTopWidth: k ? 0.5 : 0, borderTopColor: c.border, gap: 7 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12 }}>
                      <Text style={{ flex: 1, fontFamily: font.m, fontSize: 14.5, color: c.text }} numberOfLines={1}>{r.name}</Text>
                      <Text style={{ minWidth: 76, textAlign: 'right', fontFamily: font.sb, fontSize: 14.5, color: c.text, fontVariant: ['tabular-nums'] }}>{gbp(r.value)}</Text>
                    </View>
                    <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.07)' }}>
                      <View style={{ width: `${Math.max(3, (r.value / active.total) * 100)}%`, height: 4, borderRadius: 2, backgroundColor: active.color }} />
                    </View>
                  </View>
                ))}
              </View>
              {rows.length > 4 && (
                <Pressable onPress={() => setAll(!all)} style={{ alignSelf: 'flex-start', paddingTop: 6 }}>
                  <Text style={{ fontFamily: font.m, fontSize: 13, color: c.teal }}>{all ? 'Show less' : `Show ${rows.length - 4} more`}</Text>
                </Pressable>
              )}
              {!live && <Text style={{ fontFamily: font.r, fontSize: 12, color: c.muted, marginTop: 8 }}>A saved month keeps totals by type, not every line.</Text>}
            </View>
          )}
        </>
      )}
    </Card>
  );
}
