import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClinicStoreProvider } from './src/store/ClinicStore';
import { MainNavigator } from './src/navigation/RootNavigator';
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
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <ClinicStoreProvider>
        <NavigationContainer theme={navTheme}>
          <MainNavigator />
        </NavigationContainer>
      </ClinicStoreProvider>
    </SafeAreaProvider>
  );
}
