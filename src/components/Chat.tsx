import React, { useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui';
import { HScroll } from '@/components/HScroll';
import { useStore } from '@/lib/store';
import { dial } from '@/lib/call';
import { c, font } from '@/theme/tokens';

const CHIPS = ['Ask for advice', 'Approve a recommendation', 'Why are my pension costs high?'];
const PHONE = '+442079460000';

/** Floating chat button for the top-right of every screen. Opens a live-adviser conversation. */
export function ChatButton() {
  const { openChat, unread } = useStore();
  return (
    <Pressable
      onPress={() => openChat()}
      accessibilityLabel="Chat with your adviser"
      style={({ pressed }) => ({
        width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center',
        backgroundColor: c.cardHi, borderWidth: 1, borderColor: 'rgba(1,208,210,0.45)', opacity: pressed ? 0.8 : 1,
      })}
    >
      <Icon name="chat" size={20} color={c.teal} />
      <View style={{ position: 'absolute', right: -1, top: -1, minWidth: unread ? 18 : 12, height: unread ? 18 : 12, borderRadius: 9, backgroundColor: unread ? c.orange : '#39D98A', borderWidth: 2, borderColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
        {unread ? <Text style={{ fontFamily: font.b, fontSize: 10, color: c.white }}>{unread}</Text> : null}
      </View>
    </Pressable>
  );
}

function Dots() {
  const [n, setN] = React.useState(0);
  useEffect(() => { const t = setInterval(() => setN((x) => (x + 1) % 3), 350); return () => clearInterval(t); }, []);
  return (
    <View style={{ flexDirection: 'row', gap: 5, paddingVertical: 4 }}>
      {[0, 1, 2].map((i) => <View key={i} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c.textDim, opacity: n === i ? 1 : 0.35 }} />)}
    </View>
  );
}

export function ChatSheet() {
  const { chatOpen, closeChat, msgs, typing, draft, setDraft, send } = useStore();
  const scroll = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  useEffect(() => { setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 80); }, [msgs.length, typing, chatOpen]);

  return (
    <Modal visible={chatOpen} animationType="slide" onRequestClose={closeChat} transparent={Platform.OS === 'web'}>
      <View style={{ flex: 1, backgroundColor: Platform.OS === 'web' ? 'rgba(2,4,20,0.7)' : c.bg, alignItems: 'center' }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, width: '100%', maxWidth: 560, backgroundColor: c.bg }}>
          {/* Header */}
          <View style={{ paddingTop: Platform.OS === 'web' ? 18 : insets.top + 12, paddingHorizontal: 18, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: c.navy }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View>
                <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: c.tealSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(1,208,210,0.4)' }}>
                  <Icon name="adviser" size={24} color={c.teal} />
                </View>
                <View style={{ position: 'absolute', right: 0, bottom: 0, width: 13, height: 13, borderRadius: 7, backgroundColor: '#39D98A', borderWidth: 2, borderColor: c.navy }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.sb, fontSize: 17, color: c.text }}>Your adviser team</Text>
                <Text style={{ fontFamily: font.r, fontSize: 12.5, color: '#39D98A', marginTop: 1 }}>Online · usually replies within minutes</Text>
              </View>
              <Pressable onPress={dial} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.teal, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel="Call your adviser">
                <Icon name="phone" size={19} color={c.navy} />
              </Pressable>
              <Pressable onPress={closeChat} hitSlop={12}><Icon name="close" size={24} color={c.textDim} /></Pressable>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
              <Icon name="lock" size={13} color={c.muted} />
              <Text style={{ fontFamily: font.r, fontSize: 12, color: c.muted }}>Encrypted and confidential. Advice from your Y-WLTH team.</Text>
            </View>
          </View>

          {/* Thread */}
          <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ padding: 18, gap: 10 }} keyboardShouldPersistTaps="handled">
            {msgs.map((m) =>
              m.from === 'system' ? (
                <View key={m.id} style={{ alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: c.tealSoft }}>
                  <Text style={{ fontFamily: font.m, fontSize: 12.5, color: c.teal }}>✓ {m.text}</Text>
                </View>
              ) : (
                <View key={m.id} style={{ alignSelf: m.from === 'me' ? 'flex-end' : 'flex-start', maxWidth: '84%' }}>
                  <View style={{ paddingHorizontal: 15, paddingVertical: 11, borderRadius: 20, borderBottomRightRadius: m.from === 'me' ? 6 : 20, borderBottomLeftRadius: m.from === 'me' ? 20 : 6, backgroundColor: m.from === 'me' ? c.teal : c.card, borderWidth: m.from === 'me' ? 0 : 1, borderColor: c.border }}>
                    <Text style={{ fontFamily: font.r, fontSize: 15, lineHeight: 21, color: m.from === 'me' ? c.navy : c.text }}>{m.text}</Text>
                  </View>
                  <Text style={{ fontFamily: font.r, fontSize: 11, color: c.muted, marginTop: 4, alignSelf: m.from === 'me' ? 'flex-end' : 'flex-start' }}>
                    {new Date(m.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              ),
            )}
            {typing && (
              <View style={{ alignSelf: 'flex-start', paddingHorizontal: 15, paddingVertical: 9, borderRadius: 20, backgroundColor: c.card, borderWidth: 1, borderColor: c.border }}><Dots /></View>
            )}
          </ScrollView>

          {/* Composer */}
          <View style={{ padding: 14, paddingBottom: Platform.OS === 'web' ? 16 : Math.max(insets.bottom, 12) + 4, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.navy, gap: 10 }}>
            <HScroll bg={c.navy} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
              {CHIPS.map((t) => (
                <Pressable key={t} onPress={() => send(t)} style={{ paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: c.borderHi }}>
                  <Text style={{ fontFamily: font.m, fontSize: 12.5, color: c.textDim }}>{t}</Text>
                </Pressable>
              ))}
            </HScroll>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={() => send(draft)}
                placeholder="Message your adviser"
                placeholderTextColor={c.muted}
                multiline
                style={{ flex: 1, maxHeight: 110, minHeight: 44, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, borderRadius: 22, backgroundColor: c.card, borderWidth: 1, borderColor: c.borderHi, color: c.text, fontFamily: font.r, fontSize: 15, outlineStyle: 'none' } as object}
              />
              <Pressable onPress={() => send(draft)} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: draft.trim() ? c.teal : c.cardHi, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="send" size={20} color={draft.trim() ? c.navy : c.muted} />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
