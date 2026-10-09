import React from 'react';
import { Linking, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, Wordmark } from '@/components/ui';
import { dial } from '@/lib/call';
import { NavSearch } from '@/components/NavSearch';
import { c, font } from '@/theme/tokens';

export const MAX = 1160;
export const open = (url: string) => Linking.openURL(url);

export function Container({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[{ width: '100%', maxWidth: MAX, alignSelf: 'center', paddingHorizontal: 24 }, style]}>{children}</View>;
}

export function Eyebrow({ children, color = c.teal }: { children: string; color?: string }) {
  return <Text style={{ fontFamily: font.m, fontSize: 12.5, letterSpacing: 1.6, textTransform: 'uppercase', color }}>{children}</Text>;
}

export function H2({ children, wide, caps }: { children: React.ReactNode; wide?: boolean; caps?: boolean }) {
  const { width } = useWindowDimensions();
  return <Text style={{ fontFamily: font.sb, fontSize: width < 700 ? 32 : 46, lineHeight: width < 700 ? 38 : 52, letterSpacing: -1.2, color: c.text, maxWidth: wide ? 900 : 640, textTransform: caps ? 'capitalize' : 'none' }}>{children}</Text>;
}

export function P({ children, style }: { children: React.ReactNode; style?: object }) {
  return <Text style={[{ fontFamily: font.r, fontSize: 17.5, lineHeight: 28, color: c.textDim, maxWidth: 560 }, style]}>{children}</Text>;
}

export function Button({ label, onPress, ghost, caps = true }: { label: string; onPress: () => void; ghost?: boolean; caps?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { paddingHorizontal: 22, paddingVertical: 12, borderRadius: 999, backgroundColor: ghost ? 'transparent' : c.teal, borderWidth: ghost ? 1 : 0, borderColor: c.borderHi, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={{ fontFamily: font.sb, fontSize: 14, color: ghost ? c.text : c.navy, textTransform: caps ? 'capitalize' : 'none' }}>{label}</Text>
    </Pressable>
  );
}

export function ConceptBanner() {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 7, paddingHorizontal: 12, backgroundColor: 'rgba(250,78,25,0.14)', borderBottomWidth: 1, borderBottomColor: 'rgba(250,78,25,0.35)' }}>
      <Text style={{ fontFamily: font.m, fontSize: 11.5, letterSpacing: 0.4, color: '#FFB59E', textAlign: 'center' }}>Unofficial design concept for Y-WLTH · illustrative sample data · not the live Y-WLTH website or app</Text>
    </View>
  );
}

export function Nav({ onGo, active }: { onGo?: (id: string) => void; active?: 'faq' }) {
  const go = onGo ?? ((id: string) => router.push({ pathname: '/', params: { go: id } }));
  const { width } = useWindowDimensions();
  const wide = width > 900;
  const [menu, setMenu] = React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const items = [
    ['Platform', 'a:what'],
    ['Insights', 'a:insights'],
    ['About', 'a:about'],
    ['FAQ', '/faq'],
  ] as const;
  const press = (to: string) => { setMenu(false); if (to.startsWith('a:')) go(to.slice(2)); else router.push(to as never); };
  const isActive = (to: string) => to === '/faq' && active === 'faq';

  return (
    <>
    <ConceptBanner />
    <View style={{ position: 'sticky' as never, top: 0, zIndex: 20, marginBottom: -68 } as object}>
      <View style={{ paddingTop: 12, paddingHorizontal: 16 }}>
      <View style={{ width: '100%', maxWidth: MAX, alignSelf: 'center', borderRadius: 999, backgroundColor: '#0B1348', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' } as object}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingLeft: 22, paddingRight: 10 }}>
          <Link href="/" asChild><Pressable accessibilityRole="link"><Wordmark size={17} /></Pressable></Link>
          {wide && (
            <View style={{ flexDirection: 'row', gap: 6, position: 'absolute', left: 0, right: 0, justifyContent: 'center', pointerEvents: 'none' } as object}>
              <View style={{ flexDirection: 'row', gap: 4, pointerEvents: 'auto' } as object}>
                {items.map(([label, to]) => (
                  <Pressable key={label} onPress={() => press(to)} accessibilityRole="link" style={({ hovered }: { hovered?: boolean }) => ({ paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, backgroundColor: isActive(to) ? 'rgba(1,208,210,0.14)' : hovered ? 'rgba(255,255,255,0.07)' : 'transparent' })}>
                    <Text style={{ fontFamily: font.m, fontSize: 14, color: isActive(to) ? c.teal : c.textDim }}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <Pressable onPress={() => setSearching(true)} accessibilityLabel="Search questions" style={({ hovered }: { hovered?: boolean }) => ({ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)' })}>
              <Icon name="search" size={16} color={c.text} />
            </Pressable>
            {wide && (
              <Link href="/home" asChild>
                <Pressable style={({ hovered }: { hovered?: boolean }) => ({ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: hovered ? 'rgba(255,255,255,0.07)' : 'transparent' })}>
                  <Text style={{ fontFamily: font.m, fontSize: 13.5, color: c.text }}>Log In</Text>
                </Pressable>
              </Link>
            )}
            {wide && <View style={{ width: 1, height: 20, marginHorizontal: 8, backgroundColor: 'rgba(255,255,255,0.14)' }} />}
            <Pressable onPress={dial} accessibilityLabel="Call us" style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: c.teal, paddingLeft: 13, paddingRight: wide ? 16 : 13, height: 36, borderRadius: 999, opacity: pressed ? 0.85 : 1 })}>
              <Icon name="phone" size={15} color={c.navy} />
              {wide && <Text style={{ fontFamily: font.sb, fontSize: 13, color: c.navy }}>Call Us</Text>}
            </Pressable>
            {!wide && (
              <Pressable onPress={() => setMenu((m) => !m)} accessibilityLabel="Menu" style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <Icon name={menu ? 'close' : 'menu'} size={20} color={c.text} />
              </Pressable>
            )}
          </View>
        </View>
        <NavSearch open={searching} onClose={() => setSearching(false)} />
        {!wide && menu && (
          <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 2 }}>
            {[...items, ['Log In', '/home'] as const].map(([label, to]) => (
              <Pressable key={label} onPress={() => press(to)} style={{ paddingVertical: 14, paddingHorizontal: 12, borderTopWidth: 0.5, borderTopColor: c.border }}>
                <Text style={{ fontFamily: font.m, fontSize: 16, color: isActive(to) ? c.teal : c.text }}>{label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
      </View>
    </View>
    </>
  );
}

export function CTA() {
  return (
    <Container style={{ paddingBottom: 100 }}>
      <View style={{ borderRadius: 36, overflow: 'hidden', padding: 56, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(1,208,210,0.35)' }}>
        <LinearGradient colors={['rgba(1,208,210,0.28)', 'rgba(113,48,160,0.30)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', inset: 0 } as object} />
        <Text style={{ fontFamily: font.sb, fontSize: 44, lineHeight: 50, letterSpacing: -1.4, color: c.text, textAlign: 'center', maxWidth: 680 }}>See your whole picture, finally.</Text>
        <P style={{ textAlign: 'center', marginTop: 14 }}>Book a conversation. No pitch, no products. Just a clear view of where you stand.</P>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button label="Call Us" onPress={dial} />
          <Link href="/home" asChild><Pressable><View><Button label="Open The App" ghost onPress={() => {}} /></View></Pressable></Link>
        </View>
      </View>
    </Container>
  );
}

export function Footer() {
  const { width } = useWindowDimensions();
  const wide = width > 800;
  const cols: [string, [string, string | (() => void)][]][] = [
    ['Y-WLTH', [['About', () => router.push({ pathname: '/', params: { go: 'about' } } as never)], ['FAQ', '/faq'], ['Call Us', dial], ['Book A Meeting', () => { try { window.dispatchEvent(new CustomEvent('ywlth:book')); } catch { /* web only */ } }]]],
  ];
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.bgDeep }}>
      <Container style={{ paddingVertical: 48, gap: 36 }}>
        <View style={{ flexDirection: wide ? 'row' : 'column', gap: 36 }}>
          <View style={{ flex: 1.3, gap: 14 }}>
            <Wordmark size={17} />
            <Text style={{ fontFamily: font.r, fontSize: 13.5, lineHeight: 21, color: c.textDim }}>Central intelligence for money and life.</Text>
            <Text style={{ fontFamily: font.r, fontSize: 13, lineHeight: 20, color: c.muted }}>A design concept · not a real firm{'\n'}hello@example.com · +44 20 7946 0000</Text>
          </View>
          {cols.map(([title, links]) => (
            <View key={title} style={{ flex: 1, gap: 10 }}>
              <Text style={{ fontFamily: font.m, fontSize: 12, letterSpacing: 1.3, color: c.muted, textTransform: 'uppercase' }}>{title}</Text>
              {links.map(([label, to]) => (
                <Pressable key={label} onPress={() => (typeof to === 'string' && to.startsWith('/') ? router.push(to as never) : typeof to === 'string' ? open(to) : to())}>
                  <Text style={{ fontFamily: font.r, fontSize: 14.5, color: label === 'FAQ' ? c.teal : c.textDim }}>{label}</Text>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
        <Text style={{ fontFamily: font.r, fontSize: 12, lineHeight: 18, color: c.muted, maxWidth: 980 }}>
          This is a design concept using illustrative sample data. Figures shown are not real client data. Nothing here is personal financial or tax advice, and the value of investments can go down as well as up. As with all investing, your capital is at risk.
        </Text>
      </Container>
    </View>
  );
}
