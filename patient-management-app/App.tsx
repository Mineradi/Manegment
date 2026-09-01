import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthChange } from './src/firebase/auth';
import { AuthUser } from './src/types/models';
import { ClinicStoreProvider } from './src/store/ClinicStore';
import { MainNavigator } from './src/navigation/RootNavigator';
import { LoginScreen } from './src/screens/LoginScreen';
import { colors } from './src/theme/theme';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    primary: colors.primary,
    card: colors.primary,
    text: colors.text,
    border: colors.border,
  },
};

export default function App() {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    return onAuthChange(setUser);
  }, []);

  if (user === undefined) {
    // Splash is shown by native; return lightweight empty view to avoid flicker.
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {user ? (
        <ClinicStoreProvider>
          <NavigationContainer theme={navTheme}>
            <MainNavigator />
          </NavigationContainer>
        </ClinicStoreProvider>
      ) : (
        <LoginScreen onLoggedIn={setUser} />
      )}
    </SafeAreaProvider>
  );
}
