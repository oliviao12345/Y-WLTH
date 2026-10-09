import React from 'react';
import { Pressable, ScrollView, Text, View, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, Wordmark } from '@/components/ui';
import { useWindowDimensions } from 'react-native';
import { c, font } from '@/theme/tokens';
import { ChatButton } from '@/components/Chat';
import { ConnectionsButton } from '@/components/ConnectionsButton';
import { PhoneButton } from '@/components/PhoneButton';
import { ConceptBanner } from '@/components/site';

export const EmbeddedCtx = React.createContext(false);

/**
 * Standard app screen. A fixed top bar (wordmark or Back on the left, call / connections / chat on the right) sits
 * above the scrolling content, so the icons can never overlap a title or a card.
 */
export function Screen({ children, bottomPad = 120, back }: { children: React.ReactNode; bottomPad?: number; back?: boolean }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const embedded = React.useContext(EmbeddedCtx);
  const top = embedded ? 54 : Math.max(insets.top, Platform.OS === 'web' ? 24 : 12) + 4;
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <LinearGradient
        colors={['rgba(1,208,210,0.16)', 'rgba(113,48,160,0.10)', 'rgba(5,9,43,0)']}
        locations={[0, 0.4, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 380 }}
        pointerEvents="none"
      />
      {Platform.OS === 'web' && !embedded && <ConceptBanner />}
      <View style={{ paddingTop: Platform.OS === 'web' && !embedded ? 14 : top, paddingBottom: 10, alignItems: 'center' }}>
        <View style={{ width: '100%', maxWidth: 640, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 42 }}>
          {back ? (
            <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))} hitSlop={10} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="back" size={20} color={c.teal} />
              <Text style={{ fontFamily: font.m, fontSize: 14.5, color: c.teal }}>Back</Text>
            </Pressable>
          ) : Platform.OS === 'web' && !embedded ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable onPress={() => router.push('/')} accessibilityRole="link" accessibilityLabel="Back to the Y-WLTH website"><Wordmark size={15} /></Pressable>
              {width >= 520 && (
                <Pressable onPress={() => router.push('/')} accessibilityRole="link" style={({ hovered }: { hovered?: boolean }) => ({ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)' })}>
                  <Icon name="back" size={14} color={c.textDim} /><Text style={{ fontFamily: font.m, fontSize: 12.5, color: c.textDim }}>Website</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <Wordmark size={embedded ? 14 : 15} />
          )}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <PhoneButton />
            <ConnectionsButton />
            <ChatButton />
            {Platform.OS === 'web' && !embedded && (
              <Pressable onPress={() => router.replace('/')} accessibilityRole="link" accessibilityLabel="Close the app and return to the website" style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => ({ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: hovered ? 'rgba(255,255,255,0.14)' : c.cardHi, borderWidth: 1, borderColor: c.borderHi, opacity: pressed ? 0.8 : 1 })}>
                <Icon name="close" size={20} color={c.text} />
              </Pressable>
            )}
          </View>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: embedded ? 60 : bottomPad, paddingHorizontal: 20, width: '100%', maxWidth: 640, alignSelf: 'center' }}
      >
        {children}
      </ScrollView>
    </View>
  );
}
