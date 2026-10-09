import React, { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Icon, YBranch } from '@/components/ui';
import { AnswerCard } from '@/components/AnswerCard';
import { ChipRow } from '@/components/ChipRow';
import { askAnything, type Answer } from '@/lib/ask';
import { suggest } from '@/lib/suggestions';
import { sampleHistory } from '@/lib/money';
import { useStore } from '@/lib/store';
import { c, font } from '@/theme/tokens';

/** Search bar for the Wealth screen: ask in plain English, answered from your accounts and the forecast. */
export function WealthAsk() {
  const { profile } = useStore();
  const hist = useMemo(() => sampleHistory(), []);
  const [q, setQ] = useState('');
  const [a, setA] = useState<Answer | null>(null);
  const [chips, setChips] = useState(() => suggest(6));
  const run = (t: string) => { setQ(t); setA(askAnything(t, hist, profile)); };
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(1,208,210,0.35)', paddingLeft: 14, paddingRight: 6 }}>
        <YBranch size={22} />
        <TextInput value={q} onChangeText={setQ} onSubmitEditing={() => run(q)} placeholder="Ask about your wealth or Y-WLTH" placeholderTextColor={c.muted} returnKeyType="search" style={{ flex: 1, color: c.text, fontFamily: font.r, fontSize: 15, paddingVertical: 14, paddingHorizontal: 10, outlineStyle: 'none' } as object} />
        {q ? <Pressable onPress={() => { setQ(''); setA(null); }} hitSlop={8} style={{ padding: 6 }}><Icon name="close" size={16} color={c.muted} /></Pressable> : null}
        <Pressable onPress={() => run(q)} style={{ backgroundColor: c.teal, width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}><Icon name="send" size={18} color={c.navy} /></Pressable>
      </View>
      {!a ? (
        <ChipRow chips={chips} onPick={run} onShuffle={() => setChips(suggest(6))} />
      ) : <AnswerCard a={a} onClose={() => { setA(null); setQ(''); }} />}
    </View>
  );
}
