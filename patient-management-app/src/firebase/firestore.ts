import firestore from '@react-native-firebase/firestore';
import { Patient, Visit } from '../types/models';

/**
 * No-auth, Firebase-only data layer
 * ---------------------------------
 * There is no login screen and no Firebase Auth. The app opens straight into
 * the dashboard and reads/writes directly to Cloud Firestore.
 *
 * Offline: @react-native-firebase/firestore keeps a local persistent cache on
 * the device by default. Every read below uses onSnapshot (real-time) so the UI
 * reflects the cache instantly while offline, and writes are queued and synced
 * automatically when connectivity returns. Firebase remains the source of
 * truth — this local cache is Firestore's own feature, not a separate local
 * database. We never disable persistence.
 */

export const db = firestore();

export const COLLECTIONS = {
  patients: 'patients',
  visits: 'visits',
  counters: 'meta',
} as const;

// ---------- Firestore <-> Model serialization ----------

export function patientFromDoc(doc: any): Patient {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name ?? '',
    nameLower: data.nameLower ?? '',
    village: data.village ?? '',
    city: data.city ?? '',
    phone: data.phone ?? '',
    address: data.address ?? '',
    age: data.age ?? '',
    dob: data.dob ?? '',
    currentIssue: data.currentIssue ?? '',
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
    lastVisitDate: data.lastVisitDate?.toDate?.() ?? null,
  };
}

export function patientToDoc(p: Partial<Patient>) {
  const doc: Record<string, unknown> = {
    city: p.city ?? '',
    phone: p.phone ?? '',
    address: p.address ?? '',
    age: p.age ?? '',
    dob: p.dob ?? '',
    updatedAt: firestore.FieldValue.serverTimestamp(),
  };
  if (p.name !== undefined) {
    doc.name = p.name;
    doc.nameLower = p.name.trim().toLowerCase();
  }
  if (p.village !== undefined) doc.village = p.village;
  if (p.currentIssue !== undefined) doc.currentIssue = p.currentIssue;
  return doc;
}

export function visitFromDoc(doc: any): Visit {
  const data = doc.data();
  return {
    id: doc.id,
    patientId: data.patientId,
    date: data.date?.toDate?.() ?? new Date(),
    issue: data.issue ?? '',
    diagnosis: data.diagnosis ?? '',
    treatment: data.treatment ?? '',
    prescription: data.prescription ?? '',
    notes: data.notes ?? '',
    nextVisitDate: data.nextVisitDate?.toDate?.() ?? null,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  };
}

export function visitToDoc(v: Partial<Visit>) {
  return {
    patientId: v.patientId,
    date: v.date ?? firestore.FieldValue.serverTimestamp(),
    issue: v.issue,
    diagnosis: v.diagnosis ?? '',
    treatment: v.treatment ?? '',
    prescription: v.prescription ?? '',
    notes: v.notes ?? '',
    nextVisitDate: v.nextVisitDate ?? null,
    createdAt: firestore.FieldValue.serverTimestamp(),
  };
}
