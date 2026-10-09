import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card, Icon, Pill, SectionHeader, Sheet, Txt } from '@/components/ui';
import { ADD_OPTIONS, CONNECTIONS, RENEW_DAYS, WARN_DAYS, lastConfirmed, type Connection } from '@/data/connections';
import { useStore } from '@/lib/store';
import { c, font, gbp, gbpCompact } from '@/theme/tokens';

const dot = (s: Connection['status']) => (s === 'connected' ? '#39D98A' : s === 'attention' ? c.amber : c.slate);

export function ConnectionsScreen() {
  const [sel, setSel] = useState<Connection | null>(null);
  const [adding, setAdding] = useState(false);
  const { openChat } = useStore();
  const group = (st: Connection['status']) => CONNECTIONS.filter((x) => x.status === st);
  const attn = group('attention'), ok = group('connected'), man = group('manual');
  const live = ok.length + attn.length;

  const Item = ({ a, last }: { a: Connection; last: boolean }) => (
    <Pressable onPress={() => setSel(a)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: last ? 0 : 0.5, borderBottomColor: c.border, gap: 12 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: dot(a.status) }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: font.m, fontSize: 15, color: c.text }} numberOfLines={1}>{a.institution}</Text>
        <Text style={{ fontFamily: font.r, fontSize: 12.5, color: a.renewsIn !== undefined && a.renewsIn <= WARN_DAYS ? c.amber : c.muted, marginTop: 2 }} numberOfLines={1}>{a.name} · {a.renewsIn !== undefined ? `renews in ${a.renewsIn}d` : a.synced}</Text>
      </View>
      <Text style={{ fontFamily: font.m, fontSize: 15, color: c.text, fontVariant: ['tabular-nums'] }}>{gbpCompact(a.value)}</Text>
      <Icon name="chevron" size={16} color={c.muted} />
    </Pressable>
  );

  return (
    <Screen back>
      <Txt v="title">Connected accounts</Txt>
      <Txt v="small" style={{ marginTop: 2 }}>Everything we can see, and how we see it.</Txt>

      <Card style={{ marginTop: 18 }}>
        <View style={{ flexDirection: 'row', gap: 22 }}>
          <View><Text style={{ fontFamily: font.b, fontSize: 36, letterSpacing: -1.2, color: c.text }}>{CONNECTIONS.length}</Text><Txt v="small">accounts and assets</Txt></View>
          <View><Text style={{ fontFamily: font.b, fontSize: 36, letterSpacing: -1.2, color: '#39D98A' }}>{live}</Text><Txt v="small">live feeds</Txt></View>
          <View><Text style={{ fontFamily: font.b, fontSize: 36, letterSpacing: -1.2, color: attn.length ? c.amber : c.textDim }}>{attn.length}</Text><Txt v="small">need attention</Txt></View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 }}>
          <Icon name="lock" size={14} color={c.muted} />
          <Txt v="small" style={{ flex: 1 }}>Read-only. Y-WLTH only reads your account information, never moves your money.</Txt>
        </View>
      </Card>

      <View style={{ marginTop: 12, padding: 16, borderRadius: 18, backgroundColor: 'rgba(255,200,97,0.07)', borderWidth: 1, borderColor: 'rgba(255,200,97,0.25)', gap: 4 }}>
        <Txt v="label" style={{ color: c.amber }}>Every {RENEW_DAYS} days</Txt>
        <Txt v="small" style={{ color: c.textDim, lineHeight: 19 }}>To keep your data safe, we ask you to reconfirm each live connection every {RENEW_DAYS} days, just as Monzo does for connected accounts. It takes a few taps. If you don't, we stop showing that account's data until you add it again. We'll remind you {WARN_DAYS} days before.</Txt>
      </View>

      {!!attn.length && (<><SectionHeader title="Needs attention" />
        <Card pad={false} style={{ paddingHorizontal: 18, borderColor: 'rgba(255,200,97,0.45)' }}>{attn.map((a, i) => <Item key={a.id} a={a} last={i === attn.length - 1} />)}</Card></>)}
      <SectionHeader title="Live connections" />
      <Card pad={false} style={{ paddingHorizontal: 18 }}>{ok.map((a, i) => <Item key={a.id} a={a} last={i === ok.length - 1} />)}</Card>
      <SectionHeader title="Added or valued by estimate" />
      <Card pad={false} style={{ paddingHorizontal: 18 }}>{man.map((a, i) => <Item key={a.id} a={a} last={i === man.length - 1} />)}</Card>

      <Pressable onPress={() => setAdding(true)} style={{ marginTop: 22, flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(1,208,210,0.5)', backgroundColor: c.tealSoft }}>
        <Text style={{ fontFamily: font.sb, fontSize: 20, color: c.teal, marginTop: -2 }}>+</Text>
        <Text style={{ fontFamily: font.sb, fontSize: 15, color: c.teal }}>Add a connection</Text>
      </Pressable>
      <Txt v="small" style={{ marginTop: 14, textAlign: 'center' }}>Sample data for design purposes.</Txt>

      <Sheet visible={!!sel} onClose={() => setSel(null)} title={sel?.institution ?? ''}>
        {sel && (
          <View style={{ gap: 14 }}>
            <View>
              <Text style={{ fontFamily: font.r, fontSize: 14, color: c.muted }}>{sel.name}</Text>
              <Text style={{ fontFamily: font.b, fontSize: 34, letterSpacing: -1.2, color: c.text, marginTop: 2 }}>{gbp(sel.value)}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <Pill tone={sel.status === 'attention' ? 'neg' : sel.status === 'connected' ? 'pos' : 'neutral'}>{sel.status === 'attention' ? 'Needs reconfirming' : sel.status === 'connected' ? 'Connected' : 'Estimate'}</Pill>
              <Pill tone="neutral">{sel.source}</Pill>
            </View>
            <View style={{ borderTopWidth: 0.5, borderTopColor: c.border, paddingTop: 12, gap: 8 }}>
              <Txt v="label">What we can see</Txt>
              {sel.sees.map((s) => (<View key={s} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><Icon name="check" size={16} color={c.teal} /><Text style={{ fontFamily: font.r, fontSize: 14.5, color: c.textDim }}>{s}</Text></View>))}
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><Icon name="lock" size={16} color={c.muted} /><Text style={{ fontFamily: font.r, fontSize: 14.5, color: c.muted }}>We can't move money or place trades</Text></View>
            </View>
            <View style={{ borderTopWidth: 0.5, borderTopColor: c.border, paddingTop: 12, gap: 6 }}>
              <Txt v="label">Status</Txt>
              <Text style={{ fontFamily: font.r, fontSize: 14.5, color: c.textDim }}>{sel.synced}</Text>
              {sel.renewsIn !== undefined && (
                <View style={{ gap: 6, marginTop: 4 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontFamily: font.r, fontSize: 13.5, color: c.textDim }}>Reconfirmed {lastConfirmed(sel)} days ago</Text>
                    <Text style={{ fontFamily: font.m, fontSize: 13.5, color: sel.renewsIn <= WARN_DAYS ? c.amber : c.text }}>Renews in {sel.renewsIn} days</Text>
                  </View>
                  <View style={{ height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)' }}>
                    <View style={{ width: `${(sel.renewsIn / RENEW_DAYS) * 100}%`, height: 7, borderRadius: 4, backgroundColor: sel.renewsIn <= WARN_DAYS ? c.amber : c.teal }} />
                  </View>
                  <Text style={{ fontFamily: font.r, fontSize: 12, color: c.muted }}>Access is reconfirmed every {RENEW_DAYS} days.</Text>
                </View>
              )}
              {sel.note && <Text style={{ fontFamily: font.r, fontSize: 13.5, lineHeight: 20, color: c.muted }}>{sel.note}</Text>}
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              {sel.status === 'attention' ? (
                <Pressable onPress={() => setSel(null)} style={{ flex: 1, backgroundColor: c.amber, paddingVertical: 14, borderRadius: 14, alignItems: 'center' }}><Text style={{ fontFamily: font.sb, fontSize: 14.5, color: c.navy }}>Reconfirm access</Text></Pressable>
              ) : sel.status === 'connected' ? (
                <Pressable onPress={() => setSel(null)} style={{ flex: 1, backgroundColor: c.teal, paddingVertical: 14, borderRadius: 14, alignItems: 'center' }}><Text style={{ fontFamily: font.sb, fontSize: 14.5, color: c.navy }}>Refresh now</Text></Pressable>
              ) : (
                <Pressable onPress={() => setSel(null)} style={{ flex: 1, backgroundColor: c.teal, paddingVertical: 14, borderRadius: 14, alignItems: 'center' }}><Text style={{ fontFamily: font.sb, fontSize: 14.5, color: c.navy }}>Update value</Text></Pressable>
              )}
              <Pressable onPress={() => { const q = `Question about my ${sel.institution} connection.`; setSel(null); openChat(q); }} style={{ paddingHorizontal: 16, justifyContent: 'center', borderRadius: 14, borderWidth: 1, borderColor: c.borderHi }}><Text style={{ fontFamily: font.m, fontSize: 14, color: c.text }}>Ask</Text></Pressable>
            </View>
          </View>
        )}
      </Sheet>

      <Sheet visible={adding} onClose={() => setAdding(false)} title="Add a connection">
        <View>
          {ADD_OPTIONS.map(([t, d], i) => (
            <Pressable key={t} onPress={() => { setAdding(false); openChat(`I'd like to add ${t.toLowerCase()}.`); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderTopWidth: i ? 0.5 : 0, borderTopColor: c.border }}>
              <View style={{ flex: 1 }}><Text style={{ fontFamily: font.m, fontSize: 15, color: c.text }}>{t}</Text><Text style={{ fontFamily: font.r, fontSize: 12.5, color: c.muted, marginTop: 2 }}>{d}</Text></View>
              <Icon name="chevron" size={16} color={c.muted} />
            </Pressable>
          ))}
          <Txt v="small" style={{ marginTop: 10 }}>Your adviser team will set it up with you.</Txt>
        </View>
      </Sheet>
    </Screen>
  );
}
