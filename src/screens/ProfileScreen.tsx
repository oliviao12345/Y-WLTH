import React from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Card, Icon, Row, SectionHeader, Txt } from '@/components/ui';
import { FaqList } from '@/components/Faq';
import { useStore } from '@/lib/store';
import { dial } from '@/lib/call';
import { TAX } from '@/data/tax';
import { longDate } from '@/lib/booking';
import { structureTotals, STRUCTURE_EXPLAINERS } from '@/lib/insights';
import { c, font, gbpCompact } from '@/theme/tokens';

const PHONE = '+442079460000';

export function ProfileScreen() {
  const { openChat, openBooking, booked } = useStore();
  return (
    <Screen>
      <Txt v="title">Profile</Txt>
      <Txt v="small" style={{ marginTop: 2 }}>Your adviser team, your security, and your questions answered.</Txt>

      <Card style={{ marginTop: 18, borderColor: 'rgba(1,208,210,0.35)' }}>
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <View>
            <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: c.tealSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="adviser" size={27} color={c.teal} />
            </View>
            <View style={{ position: 'absolute', right: 0, bottom: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: '#39D98A', borderWidth: 2.5, borderColor: c.card }} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: font.sb, fontSize: 17, color: c.text }}>Your adviser team</Text>
            <Text style={{ fontFamily: font.r, fontSize: 13, lineHeight: 18, color: c.muted, marginTop: 3 }}>Independent and conflict-free. Online now, usually replies within minutes.</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <Pressable onPress={() => openChat()} style={{ flex: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: c.teal, paddingVertical: 14, borderRadius: 16 }}>
            <Icon name="chat" size={18} color={c.navy} />
            <Text style={{ fontFamily: font.sb, fontSize: 14.5, color: c.navy }}>Message</Text>
          </Pressable>
          <Pressable onPress={dial} style={{ flex: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: c.borderHi, paddingVertical: 14, borderRadius: 16 }}>
            <Icon name="phone" size={18} color={c.text} />
            <Text style={{ fontFamily: font.sb, fontSize: 14.5, color: c.text }}>Call</Text>
          </Pressable>
        </View>
        <Pressable onPress={openBooking} style={{ marginTop: 10, flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(1,208,210,0.45)', backgroundColor: c.tealSoft, paddingVertical: 14, borderRadius: 16 }}>
          <Icon name="plan" size={18} color={c.teal} />
          <Text style={{ fontFamily: font.sb, fontSize: 14.5, color: c.teal }}>Book a meeting</Text>
        </Pressable>
        {booked && <Txt v="small" style={{ marginTop: 10, color: c.teal }}>Booked: {longDate(booked.date)} at {booked.time} · {booked.type === 'phone' ? 'phone' : 'video'} call</Txt>}
        <Txt v="small" style={{ marginTop: 12 }}>Your annual strategy meeting is where we review your whole financial life strategy together.</Txt>
      </Card>

      <SectionHeader title="What Y-WLTH does for you" />
      <Card style={{ gap: 14 }}>
        {([
          ['See it all', 'Every bank, manager, pension, property and private asset in one view.'],
          ['Know the truth', 'Independent analysis of performance, risk and cost.'],
          ['Get advice', 'Advice from your adviser team, including tax planning, in encrypted chat.'],
          ['You approve', 'Y-WLTH does the analysis and recommends the action. You review it and approve it, or discuss it with your adviser first.'],
        ] as const).map(([t, d], i) => (
          <View key={t} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c.tealSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: font.b, fontSize: 12, color: c.teal }}>{i + 1}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: font.sb, fontSize: 15, color: c.text }}>{t}</Text>
              <Text style={{ fontFamily: font.r, fontSize: 13.5, lineHeight: 20, color: c.textDim, marginTop: 2 }}>{d}</Text>
            </View>
          </View>
        ))}
      </Card>

      <SectionHeader title="Tax planning" />
      <Card style={{ gap: 12 }}>
        <Txt v="small" style={{ color: c.textDim, fontSize: 13.5, lineHeight: 20 }}>{TAX.lead}</Txt>
        <View style={{ gap: 8 }}>
          <Txt v="label" style={{ color: c.teal }}>{TAX.doesTitle}</Txt>
          {TAX.does.map((t) => (<View key={t} style={{ flexDirection: 'row', gap: 10 }}><Icon name="check" size={15} color={c.teal} /><Text style={{ flex: 1, fontFamily: font.r, fontSize: 13.5, lineHeight: 19, color: c.text }}>{t}</Text></View>))}
        </View>
        <View style={{ gap: 8, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: c.border }}>
          <Txt v="label">{TAX.staysTitle}</Txt>
          {TAX.stays.map((t) => (<View key={t} style={{ flexDirection: 'row', gap: 10 }}><Text style={{ fontFamily: font.m, color: c.muted }}>–</Text><Text style={{ flex: 1, fontFamily: font.r, fontSize: 13.5, lineHeight: 19, color: c.textDim }}>{t}</Text></View>))}
        </View>
        <Txt v="small" style={{ fontSize: 12, lineHeight: 17 }}>{TAX.note}</Txt>
      </Card>

      <SectionHeader title="Security" />
      <Card pad={false} style={{ paddingHorizontal: 18 }}>
        <Row left="Face ID" sub="Required to open the app" right="On" />
        <Row left="Multi-factor authentication" sub="Mandatory for every sign-in" right="On" />
        <Row left="Encryption" sub="All client information is fully encrypted" right="On" />
        <Row left="Connection renewals" sub="Reconfirm each live connection" right="Every 90 days" last />
      </Card>

      <SectionHeader title="Questions answered" />
      <FaqList topOnly={5} onAsk={(q) => openChat(q ? `I have a question: ${q}` : 'I have a question about how Y-WLTH works.')} />

      <SectionHeader title="How your wealth is held" />
      <Card pad={false} style={{ paddingHorizontal: 18 }}>
        {structureTotals().map((st, i) => (
          <View key={st.structure} style={{ paddingVertical: 14, borderTopWidth: i ? 0.5 : 0, borderTopColor: c.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: font.sb, fontSize: 15.5, color: c.text }}>{st.structure}</Text>
              <Text style={{ fontFamily: font.m, fontSize: 15, color: c.text, fontVariant: ['tabular-nums'] }}>{gbpCompact(st.value)}</Text>
            </View>
            <Text style={{ fontFamily: font.m, fontSize: 12.5, color: c.teal, marginTop: 2 }}>{STRUCTURE_EXPLAINERS[st.structure].headline}</Text>
            <Text style={{ fontFamily: font.r, fontSize: 13, lineHeight: 19, color: c.textDim, marginTop: 6 }}>{STRUCTURE_EXPLAINERS[st.structure].body}</Text>
          </View>
        ))}
      </Card>
      <Txt v="small" style={{ marginTop: 8 }}>General plain-English guides to how each is usually treated in the UK. Not personal tax or financial advice: your adviser can confirm what applies to you.</Txt>

    </Screen>
  );
}
