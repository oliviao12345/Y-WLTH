import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui';
import { useStore } from '@/lib/store';
import { BOOKING_DAYS, OTHER_TOPIC, TOPICS, bookSlot, getAvailability, icsFor, iso, isBookable, longDate, type Booking, type CallType } from '@/lib/booking';
import { c, font } from '@/theme/tokens';

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const web = Platform.OS === 'web';

function Month({ month, setMonth, sel, onPick }: { month: Date; setMonth: (d: Date) => void; sel: string | null; onPick: (d: Date) => void }) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  const now = new Date();
  const canPrev = month > new Date(now.getFullYear(), now.getMonth(), 1);
  const canNext = new Date(month.getFullYear(), month.getMonth() + 1, 1) <= new Date(now.getTime() + BOOKING_DAYS * 86_400_000);
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Pressable disabled={!canPrev} onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} hitSlop={10} style={{ opacity: canPrev ? 1 : 0.25 }}><Icon name="back" size={22} color={c.text} /></Pressable>
        <Text style={{ fontFamily: font.sb, fontSize: 17, color: c.text }}>{month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</Text>
        <Pressable disabled={!canNext} onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} hitSlop={10} style={{ opacity: canNext ? 1 : 0.25 }}><Icon name="chevron" size={22} color={c.text} /></Pressable>
      </View>
      <View style={{ flexDirection: 'row' }}>{DOW.map((d) => <Text key={d} style={{ flex: 1, textAlign: 'center', fontFamily: font.m, fontSize: 11.5, color: c.muted, paddingBottom: 6 }}>{d}</Text>)}</View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((d, i) => {
          const ok = d && isBookable(d, now);
          const on = d && sel === iso(d);
          return (
            <View key={i} style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 3 }}>
              {d && (
                <Pressable disabled={!ok} onPress={() => onPick(d)} style={{ flex: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.teal : ok ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                  <Text style={{ fontFamily: on ? font.b : font.m, fontSize: 14.5, color: on ? c.navy : ok ? c.text : 'rgba(255,255,255,0.22)' }}>{d.getDate()}</Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const Field = ({ label, value, onChange, ph, kb }: { label: string; value: string; onChange: (s: string) => void; ph: string; kb?: 'email-address' | 'phone-pad' }) => (
  <View style={{ gap: 6 }}>
    <Text style={{ fontFamily: font.m, fontSize: 11.5, letterSpacing: 1, color: c.muted, textTransform: 'uppercase' }}>{label}</Text>
    <TextInput value={value} onChangeText={onChange} placeholder={ph} placeholderTextColor={c.muted} keyboardType={kb} autoCapitalize="none" style={{ backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.borderHi, color: c.text, fontFamily: font.r, fontSize: 15.5, paddingHorizontal: 14, paddingVertical: 13, outlineStyle: 'none' } as object} />
  </View>
);

/** Book a meeting with the adviser team: day, time, call type, topic, confirm. */
export function BookingSheet() {
  const { bookingOpen, closeBooking, setBooked } = useStore();
  const insets = useSafeAreaInsets();
  const [month, setMonth] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });
  const [day, setDay] = useState<Date | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [type, setType] = useState<CallType>('phone');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [notes, setNotes] = useState('');
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [phone, setPhone] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Booking | null>(null);

  useEffect(() => {
    if (!day) return;
    let live = true;
    setSlots(null); setTime(null);
    getAvailability(day).then((s) => { if (live) setSlots(s); });
    return () => { live = false; };
  }, [day]);
  useEffect(() => { if (bookingOpen) { setStep(1); setDone(null); setDay(null); setTime(null); setNotes(''); } }, [bookingOpen]);

  const needDetails = web;
  const valid = !needDetails || (name.trim().length > 1 && (email.includes('@') || phone.replace(/\D/g, '').length >= 8));
  const groups = useMemo(() => ({ Morning: (slots ?? []).filter((t) => t < '12:00'), Afternoon: (slots ?? []).filter((t) => t >= '12:00') }), [slots]);

  const confirm = async () => {
    if (!day || !time) return;
    setBusy(true);
    const b = await bookSlot({ date: iso(day), time, type, topic, name: name.trim() || 'You', notes: topic === OTHER_TOPIC ? notes.trim() || undefined : undefined });
    setBusy(false); setDone(b); setBooked(b); setStep(3);
  };
  const addToCalendar = () => {
    if (!done || !web) return;
    const url = URL.createObjectURL(new Blob([icsFor(done)], { type: 'text/calendar' }));
    const a = document.createElement('a'); a.href = url; a.download = 'ywlth-call.ics'; a.click(); URL.revokeObjectURL(url);
  };

  const Pill = ({ on, label, onPress }: { on: boolean; label: string; onPress: () => void }) => (
    <Pressable onPress={onPress} style={{ paddingHorizontal: 15, paddingVertical: 11, borderRadius: 14, borderWidth: 1, borderColor: on ? c.teal : c.borderHi, backgroundColor: on ? c.tealSoft : 'transparent' }}>
      <Text style={{ fontFamily: font.m, fontSize: 14, color: on ? c.teal : c.text }}>{label}</Text>
    </Pressable>
  );

  return (
    <Modal visible={bookingOpen} animationType="slide" transparent={web} onRequestClose={closeBooking}>
      <View style={{ flex: 1, backgroundColor: web ? 'rgba(2,4,20,0.72)' : c.bg, alignItems: 'center', justifyContent: web ? 'center' : 'flex-start', padding: web ? 20 : 0 }}>
        <View style={{ width: '100%', maxWidth: 520, flex: web ? undefined : 1, maxHeight: web ? '94%' : undefined, backgroundColor: c.navy, borderRadius: web ? 28 : 0, borderWidth: web ? 1 : 0, borderColor: 'rgba(1,208,210,0.35)', overflow: 'hidden' }}>
          <View style={{ paddingTop: web ? 22 : insets.top + 10, paddingHorizontal: 22, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontFamily: font.sb, fontSize: 21, letterSpacing: -0.4, color: c.text }}>{step === 3 ? "You're booked" : 'Book A Meeting'}</Text>
              {step < 3 && <Text style={{ fontFamily: font.r, fontSize: 12.5, color: c.muted, marginTop: 2 }}>30 minutes with your adviser team · UK time</Text>}
            </View>
            <Pressable onPress={closeBooking} hitSlop={12}><Icon name="close" size={24} color={c.textDim} /></Pressable>
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: Math.max(insets.bottom, 18) + 8, gap: 18 }} showsVerticalScrollIndicator={false}>
            {step === 1 && (
              <>
                <Month month={month} setMonth={setMonth} sel={day ? iso(day) : null} onPick={setDay} />
                {day && (
                  <View style={{ gap: 12 }}>
                    <Text style={{ fontFamily: font.sb, fontSize: 15.5, color: c.text }}>{longDate(iso(day))}</Text>
                    {slots === null ? <Text style={{ fontFamily: font.r, fontSize: 14, color: c.muted }}>Checking your advisers' calendars…</Text>
                      : !slots.length ? <Text style={{ fontFamily: font.r, fontSize: 14, color: c.muted }}>No times left on this day. Try another.</Text>
                      : (Object.entries(groups) as [string, string[]][]).filter(([, l]) => l.length).map(([g, l]) => (
                        <View key={g} style={{ gap: 8 }}>
                          <Text style={{ fontFamily: font.m, fontSize: 11.5, letterSpacing: 1.1, color: c.muted, textTransform: 'uppercase' }}>{g}</Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{l.map((t) => <Pill key={t} on={time === t} label={t} onPress={() => setTime(t)} />)}</View>
                        </View>
                      ))}
                  </View>
                )}
                <Pressable disabled={!day || !time} onPress={() => setStep(2)} style={{ backgroundColor: day && time ? c.teal : c.cardHi, paddingVertical: 16, borderRadius: 16, alignItems: 'center' }}>
                  <Text style={{ fontFamily: font.sb, fontSize: 15, color: day && time ? c.navy : c.muted }}>{day && time ? `Continue · ${time}` : 'Choose a day and time'}</Text>
                </Pressable>
              </>
            )}
            {step === 2 && day && time && (
              <>
                <View style={{ padding: 16, borderRadius: 18, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View><Text style={{ fontFamily: font.sb, fontSize: 16, color: c.text }}>{longDate(iso(day))}</Text><Text style={{ fontFamily: font.r, fontSize: 13.5, color: c.textDim, marginTop: 2 }}>{time}, 30 minutes</Text></View>
                  <Pressable onPress={() => setStep(1)}><Text style={{ fontFamily: font.m, fontSize: 13.5, color: c.teal }}>Change</Text></Pressable>
                </View>
                <View style={{ gap: 8 }}><Text style={{ fontFamily: font.m, fontSize: 11.5, letterSpacing: 1.1, color: c.muted, textTransform: 'uppercase' }}>How would you like to talk?</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}><Pill on={type === 'phone'} label="Phone call" onPress={() => setType('phone')} /><Pill on={type === 'video'} label="Video call" onPress={() => setType('video')} /></View></View>
                <View style={{ gap: 8 }}><Text style={{ fontFamily: font.m, fontSize: 11.5, letterSpacing: 1.1, color: c.muted, textTransform: 'uppercase' }}>What is it about?</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{TOPICS.map((t) => <Pill key={t} on={topic === t} label={t} onPress={() => setTopic(t)} />)}</View>
                  {topic === OTHER_TOPIC && (
                    <TextInput value={notes} onChangeText={setNotes} multiline maxLength={500} placeholder="Briefly describe what you'd like to discuss (optional)" placeholderTextColor={c.muted} style={{ backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.borderHi, color: c.text, fontFamily: font.r, fontSize: 15.5, paddingHorizontal: 14, paddingVertical: 13, minHeight: 96, textAlignVertical: 'top', outlineStyle: 'none' } as object} />
                  )}</View>
                {needDetails ? (
                  <View style={{ gap: 12 }}>
                    <Field label="Your name" value={name} onChange={setName} ph="Full name" />
                    <Field label="Email" value={email} onChange={setEmail} ph="you@example.com" kb="email-address" />
                    <Field label="Phone" value={phone} onChange={setPhone} ph="+44" kb="phone-pad" />
                  </View>
                ) : <Text style={{ fontFamily: font.r, fontSize: 13.5, color: c.textDim }}>We'll use the details on your Y-WLTH profile.</Text>}
                <Pressable disabled={!valid || busy} onPress={confirm} style={{ backgroundColor: valid ? c.teal : c.cardHi, paddingVertical: 16, borderRadius: 16, alignItems: 'center' }}>
                  <Text style={{ fontFamily: font.sb, fontSize: 15, color: valid ? c.navy : c.muted }}>{busy ? 'Booking…' : 'Confirm Booking'}</Text>
                </Pressable>
                <Text style={{ fontFamily: font.r, fontSize: 12, lineHeight: 17, color: c.muted }}>Your booking goes straight to your adviser team's calendar. You can change or cancel by messaging them.</Text>
              </>
            )}
            {step === 3 && done && (
              <>
                <View style={{ alignItems: 'center', gap: 10, paddingVertical: 8 }}>
                  <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: c.tealSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={32} color={c.teal} /></View>
                  <Text style={{ fontFamily: font.b, fontSize: 24, letterSpacing: -0.6, color: c.text, textAlign: 'center' }}>{longDate(done.date)}</Text>
                  <Text style={{ fontFamily: font.m, fontSize: 18, color: c.teal }}>{done.time} · {done.type === 'phone' ? 'Phone call' : 'Video call'}</Text>
                  <Text style={{ fontFamily: font.r, fontSize: 14, lineHeight: 21, color: c.textDim, textAlign: 'center' }}>Your adviser team will {done.type === 'phone' ? 'call you' : 'send a video link'} at this time. Reference {done.ref}.</Text>
                </View>
                <View style={{ padding: 16, borderRadius: 18, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, gap: 6 }}>
                  <Text style={{ fontFamily: font.m, fontSize: 11.5, letterSpacing: 1.1, color: c.muted, textTransform: 'uppercase' }}>What is the meeting about?</Text>
                  <Text style={{ fontFamily: font.sb, fontSize: 16, color: c.text }}>{done.topic}</Text>
                  {!!done.notes && <Text style={{ fontFamily: font.r, fontSize: 14, lineHeight: 21, color: c.textDim }}>{done.notes}</Text>}
                </View>
                {web && <Pressable onPress={addToCalendar} style={{ borderWidth: 1, borderColor: c.borderHi, paddingVertical: 15, borderRadius: 16, alignItems: 'center' }}><Text style={{ fontFamily: font.sb, fontSize: 15, color: c.text }}>Add To My Calendar</Text></Pressable>}
                <Pressable onPress={closeBooking} style={{ backgroundColor: c.teal, paddingVertical: 16, borderRadius: 16, alignItems: 'center' }}><Text style={{ fontFamily: font.sb, fontSize: 15, color: c.navy }}>Done</Text></Pressable>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
