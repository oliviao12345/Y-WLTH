import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Icon, Sheet } from '@/components/ui';
import { useStore } from '@/lib/store';
import type { Insight } from '@/lib/intelligence';
import { c, font } from '@/theme/tokens';

const SEV = { high: c.orange, medium: c.amber, low: c.teal } as const;
export const SNOOZE_OPTIONS: [string, number][] = [['Tomorrow', 1], ['3 days', 3], ['1 week', 7], ['2 weeks', 14], ['1 month', 30]];
export const backOn = (days: number) => new Date(Date.now() + days * 86_400_000).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const stepBtn = { width: 36, height: 36, borderRadius: 18, backgroundColor: c.cardHi, alignItems: 'center' as const, justifyContent: 'center' as const, borderWidth: 1, borderColor: c.borderHi };
const stepTxt = { fontFamily: font.m, fontSize: 18, color: c.text, marginTop: -2 };

const Label = ({ children, color = c.muted }: { children: string; color?: string }) => (
  <Text style={{ fontFamily: font.m, fontSize: 11, letterSpacing: 1.2, color, textTransform: 'uppercase' }}>{children}</Text>
);

/**
 * A recommendation from Y-WLTH: what we noticed, what we recommend, why, and the estimated impact.
 * The client reviews it and approves it. Approving authorises Y-WLTH to carry out the recommended action;
 * nothing changes until then. Bigger decisions say they are best talked through with the adviser first.
 */
export function InsightCard({ i, compact }: { i: Insight; compact?: boolean }) {
  const { status, approve, snooze, isSnoozed, openChat } = useStore();
  const [review, setReview] = useState(false);
  const [picking, setPicking] = useState(false);
  const [custom, setCustom] = useState(5);
  const st = status[i.id] ?? 'new';
  const max = Math.max(...i.bars.map((b) => b.value)) || 1;
  const talkFirst = i.path === 'discuss';
  if (isSnoozed(i.id)) return null;

  const discuss = () => { setReview(false); openChat(i.chatPrompt); };
  const doApprove = () => { approve(i); setReview(false); };

  return (
    <View style={{ borderRadius: 22, backgroundColor: c.card, borderWidth: 1, borderColor: st === 'approved' ? 'rgba(1,208,210,0.5)' : c.borderHi, overflow: 'hidden' }}>
      <View style={{ height: 3, backgroundColor: SEV[i.severity] }} />
      <View style={{ padding: 18, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <View style={{ paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: `${SEV[i.severity]}22` }}>
            <Text style={{ fontFamily: font.m, fontSize: 10.5, letterSpacing: 1, color: SEV[i.severity], textTransform: 'uppercase' }}>{i.severity === 'high' ? 'Y-WLTH noticed' : i.severity === 'medium' ? 'Y-WLTH noticed' : 'Worth knowing'}</Text>
          </View>
          {st === 'approved' && <Text style={{ fontFamily: font.m, fontSize: 12, color: c.teal }}>✓ Approved · your adviser team will carry this out</Text>}
          {st !== 'approved' && talkFirst && <Text style={{ fontFamily: font.m, fontSize: 11.5, color: c.textDim }}>Best discussed first</Text>}
        </View>

        <Text style={{ fontFamily: font.sb, fontSize: 17, lineHeight: 23, color: c.text }}>{i.title}</Text>

        <View style={{ padding: 14, borderRadius: 16, backgroundColor: 'rgba(1,208,210,0.07)', borderWidth: 1, borderColor: 'rgba(1,208,210,0.25)', gap: 6 }}>
          <Label color={c.teal}>Y-WLTH recommends</Label>
          <Text style={{ fontFamily: font.m, fontSize: 14.5, lineHeight: 21, color: c.text }}>{i.recommends}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <Text style={{ fontFamily: font.b, fontSize: 28, letterSpacing: -1, color: c.text }}>{i.impact}</Text>
          <Text style={{ fontFamily: font.r, fontSize: 13, color: c.textDim, flexShrink: 1 }}>{i.impactSub}</Text>
        </View>
        <Label>Estimated impact</Label>

        {st === 'new' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginTop: 2 }}>
            <Pressable onPress={talkFirst ? discuss : () => setReview(true)} style={{ flexGrow: 1, flexShrink: 0, backgroundColor: c.teal, paddingVertical: 13, paddingHorizontal: 18, borderRadius: 14, alignItems: 'center' }}>
              <Text numberOfLines={1} style={{ fontFamily: font.sb, fontSize: 14, color: c.navy }}>{talkFirst ? 'Discuss first' : 'Review recommendation'}</Text>
            </Pressable>
            {talkFirst && (
              <Pressable onPress={() => setReview(true)} style={{ paddingHorizontal: 14, paddingVertical: 13, borderRadius: 14, borderWidth: 1, borderColor: c.borderHi }}>
                <Text style={{ fontFamily: font.m, fontSize: 14, color: c.text }}>Review</Text>
              </Pressable>
            )}
            <Pressable onPress={() => setPicking(true)} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 6, paddingVertical: 6 }}>
              <Icon name="clock" size={15} color={c.textDim} />
              <Text style={{ fontFamily: font.m, fontSize: 13.5, color: c.textDim }}>Snooze</Text>
            </Pressable>
          </View>
        )}
        {st === 'new' && !compact && <Text style={{ fontFamily: font.r, fontSize: 11.5, lineHeight: 16, color: c.muted }}>You review it, then approve it. Nothing changes until you do.</Text>}
      </View>

      {/* the review screen: why, evidence, what approving means */}
      <Sheet visible={review} onClose={() => setReview(false)} title="Review recommendation">
        <ScrollView style={{ maxHeight: 520 }} showsVerticalScrollIndicator={false}>
          <View style={{ gap: 16, paddingBottom: 6 }}>
            <Text style={{ fontFamily: font.sb, fontSize: 18, lineHeight: 24, color: c.text }}>{i.title}</Text>
            <View style={{ gap: 6 }}><Label color={c.teal}>Y-WLTH recommends</Label><Text style={{ fontFamily: font.m, fontSize: 15, lineHeight: 22, color: c.text }}>{i.recommends}</Text></View>
            <View style={{ gap: 6 }}><Label>Why</Label><Text style={{ fontFamily: font.r, fontSize: 14.5, lineHeight: 22, color: c.textDim }}>{i.why}</Text></View>
            <View style={{ gap: 6 }}>
              <Label>Estimated impact</Label>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <Text style={{ fontFamily: font.b, fontSize: 30, letterSpacing: -1, color: c.text }}>{i.impact}</Text>
                <Text style={{ fontFamily: font.r, fontSize: 13, color: c.textDim, flexShrink: 1 }}>{i.impactSub}</Text>
              </View>
            </View>
            <View style={{ gap: 9 }}>
              <Label>The evidence</Label>
              {i.bars.map((b) => (
                <View key={b.label}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontFamily: font.r, fontSize: 12.5, color: c.textDim }}>{b.label}</Text>
                    <Text style={{ fontFamily: font.m, fontSize: 12.5, color: c.text, fontVariant: ['tabular-nums'] }}>{b.text}</Text>
                  </View>
                  <View style={{ height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.07)' }}>
                    <View style={{ width: `${Math.max(3, (b.value / max) * 100)}%`, height: 7, borderRadius: 4, backgroundColor: b.color ?? c.teal }} />
                  </View>
                </View>
              ))}
            </View>
            <View style={{ padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: c.border, gap: 8 }}>
              <Label>If you approve</Label>
              {['You authorise Y-WLTH to carry out the recommended action for you.', 'Your adviser team confirms the details in secure chat.', 'Nothing changes unless you approve it.'].map((t) => (
                <View key={t} style={{ flexDirection: 'row', gap: 10 }}><Icon name="check" size={15} color={c.teal} /><Text style={{ flex: 1, fontFamily: font.r, fontSize: 13.5, lineHeight: 19, color: c.textDim }}>{t}</Text></View>
              ))}
            </View>
            {talkFirst && <Text style={{ fontFamily: font.r, fontSize: 13.5, lineHeight: 20, color: c.amber }}>This affects your wider plan, so it is usually best talked through with your adviser first. You can still approve it if you are comfortable.</Text>}
            <Text style={{ fontFamily: font.r, fontSize: 11.5, lineHeight: 16, color: c.muted }}>Estimates based on your accounts today, not a guarantee. Values can go down as well as up.</Text>
          </View>
        </ScrollView>
        <View style={{ gap: 10, marginTop: 14 }}>
          <Pressable onPress={talkFirst ? discuss : doApprove} style={{ backgroundColor: c.teal, paddingVertical: 15, borderRadius: 14, alignItems: 'center' }}>
            <Text style={{ fontFamily: font.sb, fontSize: 15, color: c.navy }}>{talkFirst ? 'Discuss with my adviser' : 'Approve recommendation'}</Text>
          </Pressable>
          <Pressable onPress={talkFirst ? doApprove : discuss} style={{ paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: c.borderHi }}>
            <Text style={{ fontFamily: font.sb, fontSize: 15, color: c.text }}>{talkFirst ? 'Approve recommendation' : 'Discuss with my adviser'}</Text>
          </Pressable>
        </View>
      </Sheet>

      <Sheet visible={picking} onClose={() => setPicking(false)} title="Snooze for">
        <Text style={{ fontFamily: font.r, fontSize: 13.5, lineHeight: 20, color: c.textDim, marginBottom: 6 }}>We'll bring this back when the time is up. It stays in Snoozed until then.</Text>
        {SNOOZE_OPTIONS.map(([label, days], k) => (
          <Pressable key={label} onPress={() => { snooze(i, days); setPicking(false); }} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderTopWidth: k ? 0.5 : 0, borderTopColor: c.border }}>
            <Text style={{ fontFamily: font.m, fontSize: 15.5, color: c.text }}>{label}</Text>
            <Text style={{ fontFamily: font.r, fontSize: 13.5, color: c.muted }}>{backOn(days)}</Text>
          </Pressable>
        ))}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, borderTopWidth: 0.5, borderTopColor: c.border }}>
          <Text style={{ fontFamily: font.m, fontSize: 15.5, color: c.text, flex: 1 }}>Choose days</Text>
          <Pressable onPress={() => setCustom(Math.max(1, custom - 1))} style={stepBtn}><Text style={stepTxt}>–</Text></Pressable>
          <Text style={{ fontFamily: font.b, fontSize: 20, color: c.text, minWidth: 30, textAlign: 'center' }}>{custom}</Text>
          <Pressable onPress={() => setCustom(Math.min(180, custom + 1))} style={stepBtn}><Text style={stepTxt}>+</Text></Pressable>
          <Pressable onPress={() => { snooze(i, custom); setPicking(false); }} style={{ backgroundColor: c.teal, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 12 }}><Text style={{ fontFamily: font.sb, fontSize: 14, color: c.navy }}>Snooze</Text></Pressable>
        </View>
      </Sheet>
    </View>
  );
}
