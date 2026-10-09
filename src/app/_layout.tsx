import React from 'react';
import { Platform, View } from 'react-native';
import { Loader } from '@/components/Loader';
import { ChatSheet } from '@/components/Chat';
import { CallHost } from '@/components/CallHost';
import { BookingSheet } from '@/components/Booking';
import { AppProvider } from '@/lib/store';
import { Stack, ThemeProvider, DarkTheme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Rubik_400Regular, Rubik_500Medium, Rubik_600SemiBold, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { c } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

const SEEN_KEY = 'ywlth.splash.seen.v1';

/** Web: the animated splash plays on a visitor's first visit only. Skipped for reduced-motion users and with ?nosplash. */
const shouldShowWebSplash = () => {
  try {
    if (typeof window === 'undefined') return false;
    if (new URLSearchParams(window.location.search).has('nosplash')) return false;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
    if (window.localStorage.getItem(SEEN_KEY)) return false;
    return true;
  } catch {
    return false; // storage blocked: never trap a visitor behind a splash
  }
};

const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: c.bg, card: c.navy, text: c.text, border: c.border, primary: c.teal } };

export default function RootLayout() {
  const [loaded, fontError] = useFonts({ Rubik_400Regular, Rubik_500Medium, Rubik_600SemiBold, Rubik_700Bold });
  // On native, hold the brand loader for a beat after fonts load so the launch feels intentional.
  const [held, setHeld] = React.useState(() => (Platform.OS === 'web' ? shouldShowWebSplash() : true));
  React.useEffect(() => { if (Platform.OS === 'web' && held) { try { window.localStorage.setItem(SEEN_KEY, String(Date.now())); } catch { /* ignore */ } } }, [held]);
  const [waited, setWaited] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setWaited(true), 4000); return () => clearTimeout(t); }, []);
  const ready = loaded || !!fontError || waited; // a font problem must never leave a blank screen
  React.useEffect(() => { if (ready) SplashScreen.hideAsync(); }, [ready]);
  const endSplash = React.useCallback(() => setHeld(false), []);
  if (!ready) return <View style={{ flex: 1, backgroundColor: Platform.OS === 'web' ? c.bg : '#061552' }} />;
  if (held) return <Loader onDone={endSplash} />;
  return (
    <AppProvider>
      <ThemeProvider value={theme}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }} />
        <ChatSheet />
        <BookingSheet />
        {Platform.OS === 'web' && <CallHost />}
      </ThemeProvider>
    </AppProvider>
  );
}
