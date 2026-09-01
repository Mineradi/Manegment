import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { Patient, Visit } from '../types/models';
import { watchPatients } from '../services/patientService';
import { watchTodayVisits } from '../services/visitService';
import { searchPatientsLocal } from '../services/patientService';

interface ClinicStoreValue {
  patients: Patient[];
  loadingPatients: boolean;
  patientError: string | null;

  todayVisits: Visit[];
  loadingToday: boolean;

  search: (query: string) => Patient[];
  /** Unique patients seen today, most recent first. */
  recentTodayPatients: Patient[];
  /** Number of unique patients seen today (not capped). */
  todayCount: number;
  refresh: () => void;
}

const ClinicStoreContext = createContext<ClinicStoreValue | undefined>(undefined);

export function ClinicStoreProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [patientError, setPatientError] = useState<string | null>(null);

  const [todayVisits, setTodayVisits] = useState<Visit[]>([]);
  const [loadingToday, setLoadingToday] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsub = watchPatients(
      (list) => {
        setPatients(list);
        setLoadingPatients(false);
      },
      (e) => {
        setPatientError(e.message);
        setLoadingPatients(false);
      }
    );
    return unsub;
  }, [tick]);

  useEffect(() => {
    const unsub = watchTodayVisits(
      (list) => {
        setTodayVisits(list);
        setLoadingToday(false);
      },
      () => setLoadingToday(false)
    );
    return unsub;
  }, [tick]);

  const refresh = () => setTick((t) => t + 1);

  const search = useMemo(
    () => (query: string) => searchPatientsLocal(patients, query),
    [patients]
  );

  const recentTodayPatients = useMemo(() => {
    // Dedupe by patientId because multiple visits imply multiple rows.
    const seen = new Set<string>();
    const result: Patient[] = [];
    for (const visit of todayVisits) {
      if (seen.has(visit.patientId)) continue;
      seen.add(visit.patientId);
      const patient = patients.find((p) => p.id === visit.patientId);
      if (patient) result.push(patient);
      if (result.length >= 10) break;
    }
    return result;
  }, [todayVisits, patients]);

  // Count unique patients seen today, matching the "Patients Today" wording.
  const todayCount = useMemo(() => {
    const ids = new Set(todayVisits.map((v) => v.patientId));
    return ids.size;
  }, [todayVisits]);

  const value: ClinicStoreValue = {
    patients,
    loadingPatients,
    patientError,
    todayVisits,
    loadingToday,
    search,
    recentTodayPatients,
    todayCount,
    refresh,
  };

  return (
    <ClinicStoreContext.Provider value={value}>
      {children}
    </ClinicStoreContext.Provider>
  );
}

export function useClinicStore(): ClinicStoreValue {
  const ctx = useContext(ClinicStoreContext);
  if (!ctx) throw new Error('useClinicStore must be used within ClinicStoreProvider');
  return ctx;
}
