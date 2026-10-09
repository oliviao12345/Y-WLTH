import React, { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Icon } from '@/components/ui';
import { FAQ, type Faq } from '@/data/faq';
import { dial } from '@/lib/call';
import { searchDocs } from '@/lib/search';
import { c, font } from '@/theme/tokens';

const POPULAR = ['Can anyone download and use the Y-WLTH app?', 'What exactly do I get with Y-WLTH?', 'What are your fees and how does pricing work?', 'Does Y-WLTH give tax advice?'];

/** Search the whole Q&A bank from the menu. Understands "Y-WLTH", "ywlth", "ywlth", typos and everyday wording. */
export function NavSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const results = useMemo<Faq[]>(() => {
    if (!q.trim()) return POPULAR.map((p) => FAQ.find((f) => f.q === p)!).filter(Boolean);
    return searchDocs(FAQ.map((f) => ({ ...f, id: f.q })), q).slice(0, 6).map((h) => h.doc as Faq);
  }, [q]);
  const go = (f: Faq) => { onClose(); router.push({ pathname: '/faq', params: { open: f.q } } as never); };
  const snippet = (a: string) => { const t = a.replace(/\s+/g, ' '); return t.length > 120 ? t.slice(0, 118).trimEnd() + '…' : t; };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(2,4,20,0.7)', alignItems: 'center', paddingTop: Platform.OS === 'web' ? 90 : 60, paddingHorizontal: 14 }}>
        <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 640, borderRadius: 24, backgroundColor: c.navy, borderWidth: 1, borderColor: 'rgba(1,208,210,0.4)', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' } as object}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: c.border }}>
            <Icon name="search" size={19} color={c.teal} />
            <TextInput
              autoFocus
              value={q}
              onChangeText={setQ}
              onSubmitEditing={() => results[0] && go(results[0])}
              placeholder="Search questions: fees, tax, Y-WLTH, who can join…"
              placeholderTextColor={c.muted}
              style={{ flex: 1, color: c.text, fontFamily: font.r, fontSize: 16, paddingVertical: 17, outlineStyle: 'none' } as object}
            />
            <Pressable onPress={onClose} hitSlop={10}><Text style={{ fontFamily: font.m, fontSize: 12, color: c.muted }}>ESC</Text></Pressable>
          </View>
          <ScrollView style={{ maxHeight: 440 }} keyboardShouldPersistTaps="handled">
            <Text style={{ fontFamily: font.m, fontSize: 11.5, letterSpacing: 1.2, color: c.muted, textTransform: 'uppercase', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 6 }}>{q.trim() ? `${results.length} ${results.length === 1 ? 'result' : 'results'}` : 'Popular questions'}</Text>
            {results.map((f, i) => (
              <Pressable key={f.q} onPress={() => go(f)} style={({ hovered, pressed }: { hovered?: boolean; pressed: boolean }) => ({ paddingHorizontal: 18, paddingVertical: 13, gap: 4, backgroundColor: pressed || hovered || (i === 0 && q.trim()) ? 'rgba(1,208,210,0.08)' : 'transparent' })}>
                <Text style={{ fontFamily: font.sb, fontSize: 15, color: c.text }}>{f.q}</Text>
                <Text style={{ fontFamily: font.r, fontSize: 13, lineHeight: 19, color: c.textDim }}>{snippet(f.a)}</Text>
                <Text style={{ fontFamily: font.m, fontSize: 11, color: c.teal }}>{f.cat}</Text>
              </Pressable>
            ))}
            {!results.length && (
              <View style={{ padding: 20, gap: 10 }}>
                <Text style={{ fontFamily: font.sb, fontSize: 15.5, color: c.text }}>No matching question</Text>
                <Text style={{ fontFamily: font.r, fontSize: 14, color: c.textDim }}>Try different words, or speak to the team directly.</Text>
                <Pressable onPress={() => { onClose(); dial(); }} style={{ alignSelf: 'flex-start', backgroundColor: c.teal, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 }}><Text style={{ fontFamily: font.sb, fontSize: 13.5, color: c.navy }}>Call Us</Text></Pressable>
              </View>
            )}
            <Pressable onPress={() => { onClose(); router.push({ pathname: '/faq', params: q.trim() ? { q } : {} } as never); }} style={{ padding: 18, borderTopWidth: 1, borderTopColor: c.border, marginTop: 6 }}>
              <Text style={{ fontFamily: font.m, fontSize: 13.5, color: c.teal }}>{q.trim() ? 'See all results on the FAQ page' : 'Browse every question'}</Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
