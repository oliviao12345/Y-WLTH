import React, { useEffect, useState } from 'react';
import { Linking, Modal, Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { useStore } from '@/lib/store';
import { PHONE, PHONE_DISPLAY } from '@/lib/call';
import { c, font } from '@/theme/tokens';

/** Desktop fallback for "Call us": a card with the number, a FaceTime/phone link, and online booking. */
export function CallHost() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { openBooking } = useStore();
  useEffect(() => {
    const h = () => { setCopied(false); setOpen(true); };
    const b = () => openBooking();
    window.addEventListener('ywlth:call', h);
    window.addEventListener('ywlth:book', b);
    return () => { window.removeEventListener('ywlth:call', h); window.removeEventListener('ywlth:book', b); };
  }, []);
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(2,4,20,0.72)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 420, borderRadius: 28, backgroundColor: c.navy, borderWidth: 1, borderColor: 'rgba(1,208,210,0.4)', padding: 28, gap: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: c.tealSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name="phone" size={24} color={c.teal} /></View>
            <Pressable onPress={() => setOpen(false)} hitSlop={12}><Icon name="close" size={22} color={c.textDim} /></Pressable>
          </View>
          <Text style={{ fontFamily: font.sb, fontSize: 26, letterSpacing: -0.6, color: c.text }}>Speak To Your Adviser Team</Text>
          <Text style={{ fontFamily: font.b, fontSize: 30, letterSpacing: -0.8, color: c.teal, fontVariant: ['tabular-nums'] }}>{PHONE_DISPLAY}</Text>
          <Text style={{ fontFamily: font.r, fontSize: 14.5, lineHeight: 22, color: c.textDim }}>On a phone this button dials straight away. On a computer, call from your phone, or use FaceTime or your calling app.</Text>
          <View style={{ gap: 10, marginTop: 6 }}>
            <Pressable onPress={() => { window.location.href = `tel:${PHONE}`; }} style={{ backgroundColor: c.teal, paddingVertical: 15, borderRadius: 16, alignItems: 'center' }}><Text style={{ fontFamily: font.sb, fontSize: 15, color: c.navy }}>Call With This Device</Text></Pressable>
            <Pressable onPress={() => { navigator.clipboard?.writeText(PHONE_DISPLAY); setCopied(true); }} style={{ paddingVertical: 14, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: c.borderHi }}><Text style={{ fontFamily: font.m, fontSize: 14.5, color: c.text }}>{copied ? 'Number Copied' : 'Copy Number'}</Text></Pressable>
            <Pressable onPress={() => { setOpen(false); openBooking(); }} style={{ paddingVertical: 10, alignItems: 'center' }}><Text style={{ fontFamily: font.m, fontSize: 14, color: c.teal }}>Or Book A Meeting Online</Text></Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
