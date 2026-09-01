import { Patient } from '../types/models';

/**
 * No authentication: the app opens directly into the patient dashboard.
 * The only navigation destinations are the clinic-management screens.
 */
export type RootStackParamList = {
  Home: undefined;
  AddPatient: { prefillVillage?: string } | undefined;
  PatientProfile: { patientId: string };
  NewVisit: { patient: Patient };
  Settings: undefined;
};
