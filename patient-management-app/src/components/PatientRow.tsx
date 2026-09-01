import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Patient } from '../types/models';
import { colors, radius, spacing } from '../theme/theme';
import { Badge } from './ui';

export function PatientRow({
  patient,
  onPress,
  rightText,
}: {
  patient: Patient;
  onPress: () => void;
  rightText?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {patient.name.trim().charAt(0).toUpperCase() || '?'}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {patient.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {patient.village || patient.city || '—'} · {patient.id}
        </Text>
      </View>
      {rightText ? (
        <Badge color={colors.primary}>{rightText}</Badge>
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: colors.primary },
  info: { flex: 1, marginRight: spacing.sm },
  name: { fontSize: 17, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.subtext, marginTop: 2 },
  chevron: { fontSize: 24, color: colors.subtext },
});
