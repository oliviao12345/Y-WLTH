import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { EmbeddedCtx } from '@/components/Screen';
import { c } from '@/theme/tokens';

/** iPhone-style frame that runs a real app screen inside it (used on the marketing site). */
export function Phone({ children, width = 340, tilt = 0 }: { children: React.ReactNode; width?: number; tilt?: number }) {
  const height = Math.round(width * 2.05);
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: width * 0.14,
          padding: 9,
          backgroundColor: '#0A0F33',
          borderWidth: 1.5,
          borderColor: 'rgba(255,255,255,0.22)',
          transform: [{ rotate: `${tilt}deg` }],
        },
        { boxShadow: '0 40px 90px rgba(0,0,0,0.55), 0 0 120px rgba(1,208,210,0.14)' } as object,
      ]}
    >
      <View style={{ flex: 1, borderRadius: width * 0.115, overflow: 'hidden', backgroundColor: c.bg }}>
        <EmbeddedCtx.Provider value>{children}</EmbeddedCtx.Provider>
        <LinearGradient pointerEvents="none" colors={['rgba(5,9,43,0.95)', 'rgba(5,9,43,0)']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 50 }} />
        <LinearGradient pointerEvents="none" colors={['rgba(5,9,43,0)', 'rgba(5,9,43,0.97)']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 64 }} />
        <View pointerEvents="none" style={{ position: 'absolute', top: 9, alignSelf: 'center', width: width * 0.3, height: 24, borderRadius: 14, backgroundColor: '#000' }} />
        <View pointerEvents="none" style={{ position: 'absolute', bottom: 7, alignSelf: 'center', width: width * 0.36, height: 4.5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.55)' }} />
      </View>
    </View>
  );
}
