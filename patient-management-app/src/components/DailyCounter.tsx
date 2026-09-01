import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

export function DailyCounter({ count }: { count: number }) {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Text style={styles.label}>Patients Today</Text>
        <Text style={styles.sub}>Unique patients seen today</Text>
      </View>
      <Text style={styles.count}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  left: { flex: 1 },
  label: { color: '#fff', fontSize: 18, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  count: { color: '#fff', fontSize: 44, fontWeight: '800' },
});
