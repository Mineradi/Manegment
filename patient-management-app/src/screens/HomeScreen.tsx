import React, { useLayoutEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useClinicStore } from '../store/ClinicStore';
import { colors, spacing } from '../theme/theme';
import { Screen } from '../components/ui';
import { AutoSuggestSearchBar } from '../components/AutoSuggestSearchBar';
import { DailyCounter } from '../components/DailyCounter';
import { RecentPatients } from '../components/RecentPatients';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { recentTodayPatients, todayCount, patientError, refresh } = useClinicStore();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={10}>
          <Text style={{ color: '#fff', fontSize: 20 }}>⚙️</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  const openPatient = (patientId: string) => navigation.navigate('PatientProfile', { patientId });
  const openAdd = () => navigation.navigate('AddPatient', {});

  return (
    <Screen>
      <View style={styles.container}>
        <AutoSuggestSearchBar onSelect={(p) => openPatient(p.id)} />

        <View style={styles.counterWrap}>
          <DailyCounter count={todayCount} />
        </View>

        {patientError ? (
          <Pressable onPress={refresh} style={styles.error}>
            <Text style={styles.errorText}>
              Offline mode active · tap to retry sync ({patientError})
            </Text>
          </Pressable>
        ) : null}

        <View style={styles.listWrap}>
          <RecentPatients patients={recentTodayPatients} onSelect={(p) => openPatient(p.id)} />
        </View>

        <Pressable style={styles.fab} onPress={openAdd}>
          <Text style={styles.fabPlus}>＋</Text>
          <Text style={styles.fabText}>Add New Patient</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  counterWrap: { marginTop: spacing.lg },
  error: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  errorText: { color: colors.warning, fontSize: 13, fontWeight: '600' },
  listWrap: { marginTop: spacing.xl, flex: 1, maxHeight: 430 },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: spacing.xl,
    paddingVertical: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  fabPlus: { color: '#fff', fontSize: 22, fontWeight: '800', marginRight: 6 },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
