import { Redirect } from 'expo-router';

// Native: straight into the app. (On web, index.web.tsx renders the marketing site.)
export default function Index() {
  return <Redirect href="/home" />;
}
