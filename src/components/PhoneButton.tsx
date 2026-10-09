import React from 'react';
import { Pressable } from 'react-native';
import { Icon } from '@/components/ui';
import { dial } from '@/lib/call';
import { c } from '@/theme/tokens';

/** Top-right phone icon: starts a call to your adviser team. */
export function PhoneButton() {
  return (
    <Pressable
      onPress={dial}
      accessibilityLabel="Call your adviser team"
      style={({ pressed }) => ({ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: c.teal, opacity: pressed ? 0.8 : 1 })}
    >
      <Icon name="phone" size={20} color={c.navy} />
    </Pressable>
  );
}
