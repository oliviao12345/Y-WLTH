// Booking: pick a day and time with the adviser team.
//
// PRODUCTION INTEGRATION: replace `getAvailability` and `bookSlot` with calls to your scheduling backend, i.e. the
// service that reads each adviser's calendar (Microsoft 365 / Google Calendar free-busy, or Calendly / Cal.com / Acuity)
// and creates the event on the chosen adviser's calendar. Everything in the UI depends only on these two functions.
// Times are UK time (Europe/London).

export type CallType = 'phone' | 'video';
export type Booking = { ref: string; date: string; time: string; type: CallType; topic: string; name: string; notes?: string };

export const TOPICS = ['Getting started with Y-WLTH', 'My financial life strategy', 'A recommendation I received', 'Something else'];
export const OTHER_TOPIC = 'Something else';
export const BOOKING_DAYS = 45;
const SLOTS = Array.from({ length: 18 }, (_, i) => {
  const mins = 9 * 60 + i * 30;
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
});

export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const isBookable = (d: Date, now = new Date()) => {
  const day = d.getDay();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return day !== 0 && day !== 6 && d >= startOfToday && d <= new Date(startOfToday.getTime() + BOOKING_DAYS * 86_400_000);
};

const hash = (s: string) => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };

/** Free times on a given day (mocked). Real version: free/busy across the adviser team's calendars. */
export async function getAvailability(date: Date, now = new Date()): Promise<string[]> {
  await new Promise((r) => setTimeout(r, 250));
  if (!isBookable(date, now)) return [];
  const key = iso(date);
  const cutoff = now.getTime() + 2 * 3_600_000; // at least two hours' notice
  return SLOTS.filter((t) => {
    const [h, m] = t.split(':').map(Number);
    const at = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m).getTime();
    return at > cutoff && hash(`${key}-${t}`) % 5 !== 0;
  });
}

export async function bookSlot(b: Omit<Booking, 'ref'>): Promise<Booking> {
  await new Promise((r) => setTimeout(r, 600));
  return { ...b, ref: `YT-${(hash(b.date + b.time) % 90000 + 10000)}` };
}

export const longDate = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

/** Calendar file so the client can add the call to their own calendar. */
export const icsFor = (b: Booking) => {
  const [y, mo, da] = b.date.split('-');
  const [h, mi] = b.time.split(':');
  const end = `${String((parseInt(h, 10) * 60 + parseInt(mi, 10) + 30) / 60 | 0).padStart(2, '0')}${String((parseInt(mi, 10) + 30) % 60).padStart(2, '0')}00`;
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Y-WLTH//Booking//EN', 'BEGIN:VEVENT', `UID:${b.ref}@ywlth.example`,
    `DTSTART;TZID=Europe/London:${y}${mo}${da}T${h}${mi}00`, `DTEND;TZID=Europe/London:${y}${mo}${da}T${end}`,
    `SUMMARY:Y-WLTH ${b.type === 'phone' ? 'phone' : 'video'} call`, `DESCRIPTION:${b.topic}${b.notes ? `: ${b.notes.replace(/\r?\n/g, ' ')}` : ''}. Reference ${b.ref}.`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
};
