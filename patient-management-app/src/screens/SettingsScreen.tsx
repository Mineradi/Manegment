import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useClinicStore } from '../store/ClinicStore';
import { signOut } from '../firebase/auth';
import { exportPatientsCsv, exportCurrentMonthVisits } from '../services/exportService';
import { colors, spacing } from '../theme/theme';
import { Card, LargeButton, Screen, SectionTitle } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen(_props: Props) {
  const { patients, refresh } = useClinicStore();
  const [exporting, setExporting] = useState<'all' | 'month' | null>(null);

  const doExport = async (kind: 'all' | 'month') => {
    setExporting(kind);
    try {
      if (kind === 'all') {
        await exportPatientsCsv(patients);
      } else {
        await exportCurrentMonthVisits();
      }
    } catch (e: any) {
      Alert.alert('Export failed', e?.message ?? 'Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const confirmSignOut = () => {
    Alert.alert('Sign out?', 'Your data stays safely in Firebase.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SectionTitle>Data & Sync</SectionTitle>
        <Card>
          <Text style={styles.info}>
            Offline persistence is enabled automatically. Any patient or visit
            you add while offline is stored on this phone and syncs to Firebase
            when the connection returns.
          </Text>
          <LargeButton
            title="Sync Now"
            variant="secondary"
            onPress={refresh}
            style={styles.button}
          />
        </Card>

        <SectionTitle>Export Data</SectionTitle>
        <Card>
          <LargeButton
            title="Export all patients (CSV)"
            onPress={() => doExport('all')}
            loading={exporting === 'all'}
            style={styles.button}
          />
          <LargeButton
            title="Export this month's visits (CSV)"
            variant="secondary"
            onPress={() => doExport('month')}
            loading={exporting === 'month'}
            style={styles.button}
          />
          <Text style={styles.hint}>
            CSV opens in Excel / Google Sheets / Numbers. For a PDF, export the CSV and print it.
          </Text>
        </Card>

        <SectionTitle>Account</SectionTitle>
        <Card>
          <LargeButton title="Sign Out" variant="danger" onPress={confirmSignOut} />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  info: { fontSize: 14, color: colors.subtext, lineHeight: 21, marginBottom: spacing.md },
  button: { marginBottom: spacing.md },
  hint: { fontSize: 12, color: colors.subtext, marginTop: spacing.sm, lineHeight: 18 },
});
