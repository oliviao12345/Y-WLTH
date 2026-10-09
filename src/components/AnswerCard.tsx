import React from 'react';
import { Text, View } from 'react-native';
import { Pressable } from 'react-native';
import { Card, Icon, Txt, YBranch } from '@/components/ui';
import { useStore } from '@/lib/store';
import { DISCLAIMER, type Answer } from '@/lib/ask';
import { c, font } from '@/theme/tokens';

export function AnswerCard({ a, onClose }: { a: Answer; onClose?: () => void }) {
  const { openChat } = useStore();
  return (
    <Card style={{ borderColor: a.refusal ? c.amber : 'rgba(1,208,210,0.35)' }}>
      {onClose && (
        <Pressable onPress={onClose} accessibilityLabel="Close answer" hitSlop={10} style={{ position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.09)', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
          <Icon name="close" size={14} color={c.textDim} />
        </Pressable>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: onClose ? 34 : 0 }}>
        {a.refusal ? <Icon name="adviser" size={14} color={c.amber} /> : <YBranch size={16} />}
        <Txt v="label" style={{ color: a.refusal ? c.amber : c.teal }}>{a.refusal ? 'For your adviser' : 'Answer'}</Txt>
      </View>
      <Txt v="title" style={{ fontSize: 24, marginTop: 10 }}>{a.headline}</Txt>
      {a.period ? <Txt v="small" style={{ marginTop: 4 }}>{a.period}</Txt> : null}
      <Txt v="body" style={{ marginTop: 10 }}>{a.text}</Txt>
      {a.rows?.length ? (
        <View style={{ marginTop: 12 }}>
          {a.rows.map((r, i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 8, borderTopWidth: i ? 0.5 : 0, borderTopColor: c.border }}>
              <Text style={{ flex: 1, fontFamily: font.r, fontSize: 14, color: c.textDim }}>{r.label}</Text>
              <Text style={{ fontFamily: font.m, fontSize: 14, fontVariant: ['tabular-nums'], color: r.tone === 'pos' ? c.teal : r.tone === 'neg' ? c.orange : c.text }}>{r.value}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {a.action ? (
        <Pressable onPress={() => openChat(a.action!.chat)} style={{ marginTop: 14, flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: c.teal, paddingVertical: 13, borderRadius: 14 }}>
          <Icon name="chat" size={17} color={c.navy} />
          <Text style={{ fontFamily: font.sb, fontSize: 14, color: c.navy }}>{a.action.label}</Text>
        </Pressable>
      ) : null}
      {a.from ? <Txt v="small" style={{ marginTop: 10 }}>From: {a.from}</Txt> : null}
      <Txt v="small" style={{ marginTop: 10, fontSize: 11.5, lineHeight: 16 }}>{a.note ? `${a.note} ` : ''}{a.note ? '' : DISCLAIMER}</Txt>
    </Card>
  );
}
