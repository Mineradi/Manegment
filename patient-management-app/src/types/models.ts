export interface Patient {
  /** Stable, human-readable unique ID, e.g. P00124 */
  id: string;
  name: string;
  nameLower: string;
  village: string;
  city?: string;
  phone?: string;
  address?: string;
  age?: string;
  dob?: string;
  currentIssue: string;
  createdAt: Date;
  updatedAt: Date;
  lastVisitDate?: Date | null;
}

export type PatientInput = Omit<
  Patient,
  'id' | 'nameLower' | 'createdAt' | 'updatedAt' | 'lastVisitDate'
>;

export interface Visit {
  id: string;
  patientId: string;
  date: Date;
  issue: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  notes?: string;
  nextVisitDate?: Date | null;
  createdAt: Date;
}

export type VisitInput = Omit<
  Visit,
  'id' | 'patientId' | 'date' | 'createdAt'
>;
