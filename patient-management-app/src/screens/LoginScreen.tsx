import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { signIn, signUp } from '../firebase/auth';
import { colors, radius, spacing } from '../theme/theme';
import { Field, LargeButton, Screen } from '../components/ui';
import { AuthUser } from '../types/models';

export function LoginScreen({ onLoggedIn }: { onLoggedIn: (u: AuthUser) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || password.length < 6) {
      Alert.alert('Invalid details', 'Enter an email and a password of at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const user =
        mode === 'login' ? await signIn(email, password) : await signUp(email, password);
      onLoggedIn(user);
    } catch (e: any) {
      Alert.alert('Sign in failed', e?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}>
            <Text style={styles.logoText}>🩺</Text>
          </View>
          <Text style={styles.title}>Clinic Patient Manager</Text>
          <Text style={styles.subtitle}>
            Fast patient search, quick registration and complete visit history.
          </Text>

          <View style={styles.card}>
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="doctor@clinic.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Minimum 6 characters"
              secureTextEntry
              autoCapitalize="none"
            />
            <LargeButton
              title={mode === 'login' ? 'Sign In' : 'Create Account'}
              onPress={submit}
              loading={loading}
            />
            <Pressable onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
              <Text style={styles.switchText}>
                {mode === 'login'
                  ? 'Need an account? Create one'
                  : 'Already registered? Sign in'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  logo: {
    alignSelf: 'center',
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoText: { fontSize: 40 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.subtext,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  switchText: {
    color: colors.primary,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    marginTop: spacing.lg,
  },
});
