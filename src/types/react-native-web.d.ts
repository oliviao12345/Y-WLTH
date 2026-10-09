// React Native Web adds hover and focus to a Pressable's state. Declare it here so the project
// typechecks on a clean checkout (the generated Expo types that normally provide it are git-ignored).
import 'react-native';

declare module 'react-native' {
  interface PressableStateCallbackType {
    hovered?: boolean;
    focused?: boolean;
  }
}
