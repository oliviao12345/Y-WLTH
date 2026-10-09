import { Alert, Linking, Platform } from 'react-native';

export const PHONE = '+442079460000';
export const PHONE_DISPLAY = '+44 20 7946 0000';
export const BOOK_ONLINE = 'https://example.com/book';

const showNumber = () =>
  Alert.alert('Call Y-WLTH', `${PHONE_DISPLAY}\n\nThis device can't place calls from here, so please dial the number above from your phone.`, [{ text: 'OK' }]);

/**
 * "Call us": starts a call right away.
 * - Phones (native app and mobile browsers): opens the dialler on Y-WLTH's number; the OS asks the user to confirm.
 * - Devices that cannot place calls (iOS Simulator, tablets without cellular) show the number instead of an error.
 * - Desktop browsers have no dialler, so we show a call card with the number.
 */
export function dial() {
  if (Platform.OS !== 'web') {
    // Just try it: canOpenURL can wrongly say no for tel: on a real iPhone. Only a failed attempt shows the number.
    Linking.openURL(`tel:${PHONE}`).catch(showNumber);
    return;
  }
  const touch = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
  if (touch) { window.location.href = `tel:${PHONE}`; return; }
  window.dispatchEvent(new CustomEvent('ywlth:call'));
}
