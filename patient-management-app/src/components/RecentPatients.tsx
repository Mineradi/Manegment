import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Patient } from '../types/models';
import { colors, spacing } from '../theme/theme';
import { PatientRow } from './PatientRow';
import { EmptyState } from './ui';

export function RecentPatients({
  patients,
  onSelect,
}: {
  patients: Patient[];
  onSelect: (p: Patient) => void;
}) {
  return (
    <>
      <Text style={styles.title}>Last 10 patients today</Text>
      {patients.length === 0 ? (
        <EmptyState
          title="No visits yet today"
          subtitle="New visits will appear here instantly."
        />
      ) : (
        <ScrollView
          style={styles.list}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {patients.map((p) => (
            <PatientRow key={p.id} patient={p} onPress={() => onSelect(p)} />
          ))}
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  list: { maxHeight: 430, flexGrow: 0 },
});
