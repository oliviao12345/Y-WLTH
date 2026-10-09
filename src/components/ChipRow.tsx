import React from 'react';
import { Pressable, Text } from 'react-native';
import { HScroll } from '@/components/HScroll';
import { Icon } from '@/components/ui';
import { c, font } from '@/theme/tokens';

/** One line of suggested questions: scrolls sideways, fades at the edge, shuffle at the end. */
export function ChipRow({ chips, onPick, onShuffle, bg = c.bg }: { chips: string[]; onPick: (q: string) => void; onShuffle?: () => void; bg?: string }) {
  return (
    <HScroll bg={bg} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
      {chips.map((s) => (
        <Pressable key={s} onPress={() => onPick(s)} style={({ pressed }) => ({ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: pressed ? 'rgba(1,208,210,0.14)' : 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: c.border })}>
          <Text numberOfLines={1} style={{ fontFamily: font.m, fontSize: 13, color: c.textDim }}>{s}</Text>
        </Pressable>
      ))}
      {onShuffle && (
        <Pressable onPress={onShuffle} accessibilityLabel="More ideas" style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(1,208,210,0.4)' }}>
          <Icon name="refresh" size={16} color={c.teal} />
        </Pressable>
      )}
    </HScroll>
  );
}
