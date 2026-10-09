import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { Insight } from '@/lib/intelligence';
import { longDate, type Booking } from '@/lib/booking';
import { DEFAULT_PROFILE, type Profile } from '@/lib/forecast';

export type Msg = { id: string; from: 'me' | 'adviser' | 'system'; text: string; at: number };
export type Status = 'new' | 'approved';

type Store = {
  msgs: Msg[];
  typing: boolean;
  chatOpen: boolean;
  draft: string;
  setDraft: (s: string) => void;
  openChat: (prefill?: string) => void;
  closeChat: () => void;
  send: (text: string) => void;
  status: Record<string, Status>;
  approve: (i: Insight) => void;
  /** insight id -> time it comes back (ms). A snoozed insight is hidden until then. */
  snoozed: Record<string, number>;
  snooze: (i: Insight, days: number) => void;
  unsnooze: (id: string) => void;
  isSnoozed: (id: string) => boolean;
  unread: number;
  bookingOpen: boolean;
  openBooking: () => void;
  closeBooking: () => void;
  booked: Booking | null;
  setBooked: (b: Booking) => void;
  profile: Profile;
  setProfile: (p: Profile) => void;
};

const Ctx = createContext<Store | null>(null);
export const useStore = () => {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside AppProvider');
  return s;
};

const buzz = (kind: 'light' | 'success' = 'light') => {
  if (Platform.OS === 'web') return;
  if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

const reply = (text: string): string => {
  const t = text.toLowerCase();
  if (/(pension|aviva|vanguard)/.test(t)) return "Good question. The Aviva pension is the clearest cost gap in your plan. I'll prepare a like-for-like comparison, including any exit charges, before you decide anything.";
  if (/(call|phone|speak|talk)/.test(t)) return "Of course. I can call you today. Tap the call button at the top of this chat, or tell me a time that suits.";
  if (/(approve|approved|go ahead|go-ahead)/.test(t)) return "Thank you, noted. I'll confirm the next steps and anything I need from you within the hour. Nothing changes unless you approve it.";
  if (/(cash|current account|barclays)/.test(t)) return 'A reserve of three to six months of spending is common. I can show how much of your cash sits above that, and what it could be doing instead.';
  if (/(benchmark|trail|performance)/.test(t)) return 'Most of the gap comes from a handful of holdings, and Performance in the app shows which. I can walk you through it.';
  if (/(property|concentrat|diversif)/.test(t)) return 'With over half your wealth in property, the useful question is what you want it to do for you. Happy to model a few options.';
  return "Thanks, I've got that. A member of your team will reply shortly. For anything urgent, you can call us directly.";
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 'm0', from: 'adviser', at: Date.now() - 1000 * 60 * 60 * 15, text: "Good evening. I've been through your accounts overnight. A few recommendations are waiting for your approval in Intelligence." },
  ]);
  const [typing, setTyping] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [unread, setUnread] = useState(1);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [booked, setBookedState] = useState<Booking | null>(null);
  const idRef = useRef(1);

  const push = useCallback((from: Msg['from'], text: string) => {
    setMsgs((m) => [...m, { id: `m${idRef.current++}`, from, text, at: Date.now() }]);
  }, []);

  const adviserReply = useCallback((to: string) => {
    setTyping(true);
    setTimeout(() => { setTyping(false); push('adviser', reply(to)); }, 1500);
  }, [push]);

  const send = useCallback((text: string) => {
    const t = text.trim();
    if (!t) return;
    buzz();
    push('me', t);
    setDraft('');
    adviserReply(t);
  }, [push, adviserReply]);

  const openChat = useCallback((prefill?: string) => {
    buzz();
    setChatOpen(true);
    setUnread(0);
    if (prefill) setDraft(prefill);
  }, []);

  const approve = useCallback((i: Insight) => {
    buzz('success');
    setStatus((s) => ({ ...s, [i.id]: 'approved' }));
    push('system', `You approved: ${i.title}`);
    setUnread((u) => u + 1);
    setTimeout(() => { push('adviser', reply('approved')); }, 1800);
  }, [push]);

  const setBooked = useCallback((b: Booking) => {
    setBookedState(b);
    push('system', `Call booked: ${longDate(b.date)} at ${b.time}`);
  }, [push]);

  const [snoozed, setSnoozed] = useState<Record<string, number>>({});
  const snooze = useCallback((i: Insight, days: number) => { buzz(); setSnoozed((s) => ({ ...s, [i.id]: Date.now() + Math.max(1, days) * 86_400_000 })); }, []);
  const unsnooze = useCallback((id: string) => { buzz(); setSnoozed((s) => { const n = { ...s }; delete n[id]; return n; }); }, []);
  const isSnoozed = useCallback((id: string) => (snoozed[id] ?? 0) > Date.now(), [snoozed]);

  const value = useMemo<Store>(() => ({
    msgs, typing, chatOpen, draft, setDraft, openChat, closeChat: () => setChatOpen(false), send, status, approve, snoozed, snooze, unsnooze, isSnoozed, unread,
    bookingOpen, openBooking: () => setBookingOpen(true), closeBooking: () => setBookingOpen(false), booked, setBooked, profile, setProfile,
  }), [profile, msgs, typing, chatOpen, draft, openChat, send, status, approve, snoozed, snooze, unsnooze, isSnoozed, unread, bookingOpen, booked, setBooked]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
