import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { addPatient } from '../services/patientService';
import { useClinicStore } from '../store/ClinicStore';
import { PatientInput } from '../types/models';
import { colors, spacing } from '../theme/theme';
import { Card, Field, LargeButton, Screen } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'AddPatient'>;

const EMPTY: PatientInput = {
  name: '',
  village: '',
  city: '',
  phone: '',
  address: '',
  age: '',
  dob: '',
  currentIssue: '',
};

export function AddPatientScreen({ navigation }: Props) {
  const { patients } = useClinicStore();
  const [form, setForm] = useState<PatientInput>(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof PatientInput) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.name.trim() || !form.village.trim() || !form.currentIssue.trim()) {
      Alert.alert(
        'Missing details',
        'Name, Village/City and Current Issue are required. The rest can be added later.'
      );
      return;
    }
    setSaving(true);
    try {
      const existing = new Set(patients.map((p) => p.id));
      const patient = await addPatient(form, existing);
      navigation.replace('PatientProfile', { patientId: patient.id });
    } catch (e: any) {
      Alert.alert('Could not save', e?.message ?? 'Please try again.');
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
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              A unique Patient ID is generated automatically when you save.
            </Text>
          </View>

          <Card>
            <Field
              label="Patient Name"
              required
              value={form.name}
              onChangeText={set('name')}
              placeholder="Full name"
              autoCapitalize="words"
            />
            <Field
              label="Village / City"
              required
              value={form.village}
              onChangeText={set('village')}
              placeholder="Village or town"
              autoCapitalize="words"
            />
            <Field
              label="Current Issue / Disease"
              required
              value={form.currentIssue}
              onChangeText={set('currentIssue')}
              placeholder="e.g. Fever, cough, BP check"
              autoCapitalize="sentences"
            />
          </Card>

          <Text style={styles.optionalTitle}>Optional details</Text>
          <Card>
            <Field
              label="Phone Number"
              value={form.phone}
              onChangeText={set('phone')}
              placeholder="+91 9876543210"
              keyboardType="phone-pad"
            />
            <Field
              label="Detailed Address"
              value={form.address}
              onChangeText={set('address')}
              placeholder="House, street, landmark"
              autoCapitalize="sentences"
            />
            <Field
              label="Age or DOB"
              value={form.age}
              onChangeText={set('age')}
              placeholder="e.g. 45 or 1990-05-12"
            />
          </Card>

          <LargeButton title="Save Patient" onPress={save} loading={saving} style={styles.save} />
        </ScrollView>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  notice: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  noticeText: { color: colors.primaryDark, fontSize: 14, fontWeight: '600' },
  optionalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.subtext,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  save: { marginTop: spacing.xl },
});
