import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { addVisit } from '../services/visitService';
import { VisitInput } from '../types/models';
import { colors, spacing } from '../theme/theme';
import { Card, Field, LargeButton, Screen } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'NewVisit'>;

const EMPTY: VisitInput = {
  issue: '',
  diagnosis: '',
  treatment: '',
  prescription: '',
  notes: '',
  nextVisitDate: null,
};

export function NewVisitScreen({ navigation, route }: Props) {
  const { patient } = route.params;
  const [form, setForm] = useState<VisitInput>(EMPTY);
  const [nextVisitText, setNextVisitText] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key: keyof VisitInput) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const parseNextVisit = (text: string) => {
    const normalized = text.trim().replace(/[^\d-]/g, '');
    const parts = normalized.split('-');
    if (parts.length === 3) {
      const d = new Date(`${parts[0]}-${parts[1]}-${parts[2]}T12:00:00`);
      if (!isNaN(d.getTime())) {
        setForm((f) => ({ ...f, nextVisitDate: d }));
        return;
      }
    }
    setForm((f) => ({ ...f, nextVisitDate: null }));
  };

  const handleNextVisitChange = (text: string) => {
    setNextVisitText(text);
    parseNextVisit(text);
  };

  const save = async () => {
    if (!form.issue.trim()) {
      Alert.alert('Missing issue', 'Enter the issue / diagnosis for this visit.');
      return;
    }
    if (nextVisitText.trim() && !form.nextVisitDate) {
      Alert.alert('Invalid date', 'Enter the next visit date as YYYY-MM-DD, e.g. 2026-09-10.');
      return;
    }
    setSaving(true);
    try {
      await addVisit(patient, { ...form, nextVisitDate: form.nextVisitDate ?? null });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Could not save visit', e?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.patientBar}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={styles.patientMeta}>
              {patient.id} · {patient.village}
            </Text>
          </View>

          <Card>
            <Field
              label="Medical Issue / Diagnosis"
              required
              value={form.issue}
              onChangeText={set('issue')}
              placeholder="e.g. fever, follow-up, blood pressure"
              autoCapitalize="sentences"
            />
            <Field
              label="Treatment / Prescription"
              value={form.prescription}
              onChangeText={set('prescription')}
              placeholder="Medicines, dosage, advice"
              multiline
              numberOfLines={4}
              style={styles.multiline}
              textAlignVertical="top"
            />
            <Field
              label="Notes"
              value={form.notes}
              onChangeText={set('notes')}
              placeholder="Anything else to remember"
              multiline
              numberOfLines={3}
              style={styles.multiline}
              textAlignVertical="top"
            />
            <Field
              label="Next Visit Date (if any)"
              value={nextVisitText}
              onChangeText={handleNextVisitChange}
              placeholder="YYYY-MM-DD (leave blank if none)"
              keyboardType="numbers-and-punctuation"
            />
          </Card>

          <LargeButton title="Save Today's Visit" onPress={save} loading={saving} style={styles.save} />
        </ScrollView>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  patientBar: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  patientName: { color: '#fff', fontSize: 20, fontWeight: '800' },
  patientMeta: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 2 },
  multiline: { minHeight: 110, textAlignVertical: 'top' },
  save: { marginTop: spacing.xl },
});
