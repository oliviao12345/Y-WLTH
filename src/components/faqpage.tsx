import React from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { dial } from '@/lib/call';
import { Button, CTA, Container, Eyebrow, Footer, Nav, P, open } from '@/components/site';
import { FaqList } from '@/components/Faq';
import { c, font } from '@/theme/tokens';

export function FaqPage() {
  const { width } = useWindowDimensions();
  const small = width < 700;
  const params = useLocalSearchParams<{ q?: string; open?: string }>();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView>
        <Nav active="faq" />
        <View style={{ overflow: 'hidden' }}>
          <LinearGradient colors={['rgba(1,208,210,0.16)', 'rgba(113,48,160,0.12)', 'rgba(5,9,43,0)']} locations={[0, 0.5, 1]} style={{ position: 'absolute', inset: 0 } as object} />
          <Container style={{ paddingTop: (small ? 44 : 80) + 68, paddingBottom: 40, gap: 18 }}>
            <Eyebrow>FAQ</Eyebrow>
            <Text style={{ fontFamily: font.sb, fontSize: small ? 40 : 68, lineHeight: small ? 44 : 72, letterSpacing: small ? -1.5 : -2.6, color: c.text }}>Frequently Asked Questions</Text>
            <P style={{ fontSize: 18, lineHeight: 28 }}>How Y-WLTH works, what it costs, who looks after your assets and how your data is protected. Illustrative concept content.</P>
          </Container>
        </View>
        <Container style={{ paddingBottom: 40 }}><FaqList wide={width > 900} topOnly={5} initialQuery={params.q} initialOpen={params.open} /></Container>
        <Container style={{ paddingBottom: 60, gap: 14 }}>
          <Text style={{ fontFamily: font.sb, fontSize: 24, color: c.text }}>Still have a question?</Text>
          <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
            <Button caps label="Call Us" onPress={dial} />
            <Button caps label="Email Us" ghost onPress={() => open('mailto:hello@example.com')} />
          </View>
        </Container>
        <CTA />
        <Footer />
      </ScrollView>
    </View>
  );
}
