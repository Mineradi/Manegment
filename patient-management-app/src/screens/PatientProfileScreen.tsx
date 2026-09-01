import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useClinicStore } from '../store/ClinicStore';
import { Visit } from '../types/models';
import { watchPatientVisits, deleteVisit } from '../services/visitService';
import { colors, radius, spacing } from '../theme/theme';
import { Badge, EmptyState, LargeButton, Screen, SectionTitle } from '../components/ui';
import { formatDateHuman } from '../utils/date';
import { openWhatsApp } from '../utils/whatsapp';

type Props = NativeStackScreenProps<RootStackParamList, 'PatientProfile'>;

export function PatientProfileScreen({ navigation, route }: Props) {
  const { patientId } = route.params;
  const { patients } = useClinicStore();
  const patient = patients.find((p) => p.id === patientId);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = watchPatientVisits(patientId, (list) => {
      setVisits(list);
      setLoading(false);
    });
    return unsub;
  }, [patientId]);

  if (!patient) {
    return (
      <Screen>
        <EmptyState title="Patient not found" subtitle="They may have been removed or not synced yet." />
      </Screen>
    );
  }

  const newVisit = () =>
    navigation.navigate('NewVisit', { patient });

  const sendWhatsApp = async () => {
    if (!patient.phone) {
      Alert.alert('No phone number', 'Add a phone number to this patient to use WhatsApp.');
      return;
    }
    const last = visits[0];
    const message = last
      ? `Hello ${patient.name},\n\nYour recent visit at the clinic:\nDate: ${formatDateHuman(last.date)}\nIssue: ${last.issue}\nPrescription: ${last.prescription || last.treatment || '-'}${last.nextVisitDate ? `\nNext visit: ${formatDateHuman(last.nextVisitDate)}` : ''}\n\nThank you!`
      : `Hello ${patient.name},\n\nYour patient details are on file with the clinic.\nPatient ID: ${patient.id}\n\nThank you!`;
    const ok = await openWhatsApp(patient.phone, message);
    if (!ok) {
      Alert.alert('WhatsApp unavailable', 'Could not open WhatsApp. Check that it is installed.');
    }
  };

  const confirmDeleteVisit = (visit: Visit) => {
    Alert.alert(
      'Delete visit?',
      `Delete the visit from ${formatDateHuman(visit.date)}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteVisit(visit.id) },
      ]
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{patient.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{patient.name}</Text>
              <Text style={styles.meta}>
                {patient.village}
                {patient.city ? `, ${patient.city}` : ''}
              </Text>
              <View style={styles.badges}>
                <Badge>{patient.id}</Badge>
                {patient.phone ? <Badge color={colors.whatsapp}>{patient.phone}</Badge> : null}
              </View>
            </View>
          </View>

          <View style={styles.detailGrid}>
            <Detail label="Age / DOB" value={patient.age || patient.dob || '—'} />
            <Detail label="Phone" value={patient.phone || '—'} />
            <Detail label="Address" value={patient.address || '—'} />
            <Detail label="Current Issue" value={patient.currentIssue || '—'} />
          </View>

          <View style={styles.actions}>
            <LargeButton title="＋ New Visit" onPress={newVisit} style={styles.actionMain} />
            <LargeButton
              title="WhatsApp"
              variant="whatsapp"
              onPress={sendWhatsApp}
              style={styles.actionSecondary}
            />
          </View>
        </View>

        <SectionTitle>Visit History</SectionTitle>
        {loading ? (
          <EmptyState title="Loading history…" />
        ) : visits.length === 0 ? (
          <EmptyState title="No visits yet" subtitle="Tap “New Visit” to log the first one." />
        ) : (
          visits.map((visit) => (
            <View key={visit.id} style={styles.visitCard}>
              <View style={styles.visitHeader}>
                <View style={styles.dateDot}>
                  <Text style={styles.dateDotText}>
                    {new Date(visit.date).getDate()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.visitDate}>{formatDateHuman(visit.date)}</Text>
                  <Text style={styles.visitIssue}>{visit.issue || '—'}</Text>
                </View>
                <Pressable onPress={() => confirmDeleteVisit(visit)} hitSlop={10}>
                  <Text style={styles.delete}>🗑</Text>
                </Pressable>
              </View>
              {visit.diagnosis ? <Text style={styles.block}>Diagnosis: {visit.diagnosis}</Text> : null}
              {visit.treatment ? <Text style={styles.block}>Treatment: {visit.treatment}</Text> : null}
              {visit.prescription ? <Text style={styles.block}>Prescription: {visit.prescription}</Text> : null}
              {visit.notes ? <Text style={styles.block}>Notes: {visit.notes}</Text> : null}
              {visit.nextVisitDate ? (
                <Text style={styles.nextVisit}>Next visit: {formatDateHuman(visit.nextVisitDate)}</Text>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { color: '#fff', fontSize: 26, fontWeight: '800' },
  headerInfo: { flex: 1 },
  name: { fontSize: 21, fontWeight: '800', color: colors.text },
  meta: { fontSize: 14, color: colors.subtext, marginTop: 2 },
  badges: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  detail: { width: '50%', paddingVertical: 6, paddingRight: 10 },
  detailLabel: { fontSize: 12, color: colors.subtext, fontWeight: '600' },
  detailValue: { fontSize: 15, color: colors.text, marginTop: 2, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  actionMain: { flex: 1 },
  actionSecondary: { flex: 1 },
  visitCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  visitHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dateDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  dateDotText: { fontSize: 16, fontWeight: '800', color: colors.primary },
  visitDate: { fontSize: 14, fontWeight: '700', color: colors.subtext },
  visitIssue: { fontSize: 16, fontWeight: '700', color: colors.text },
  block: { fontSize: 14, color: colors.text, marginTop: 4, lineHeight: 20 },
  nextVisit: { fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 6 },
  delete: { fontSize: 18 },
});
