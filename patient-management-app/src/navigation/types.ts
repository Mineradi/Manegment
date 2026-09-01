import { Patient } from '../types/models';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  AddPatient: { prefillVillage?: string } | undefined;
  PatientProfile: { patientId: string };
  NewVisit: { patient: Patient };
  Settings: undefined;
};
