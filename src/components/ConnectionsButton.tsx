import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Icon } from '@/components/ui';
import { attentionCount } from '@/data/connections';
import { c } from '@/theme/tokens';

/** Top-right shortcut to the connected-accounts screen. Amber dot when something needs reconfirming. */
export function ConnectionsButton() {
  const n = attentionCount();
  return (
    <Pressable
      onPress={() => router.push('/connections' as never)}
      accessibilityLabel="Connected accounts"
      style={({ pressed }) => ({ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: c.cardHi, borderWidth: 1, borderColor: c.borderHi, opacity: pressed ? 0.8 : 1 })}
    >
      <Icon name="link" size={20} color={c.text} />
      {n > 0 && <View style={{ position: 'absolute', right: -1, top: -1, width: 12, height: 12, borderRadius: 6, backgroundColor: c.amber, borderWidth: 2, borderColor: c.bg }} />}
    </Pressable>
  );
}
