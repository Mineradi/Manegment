import { db, visitFromDoc, visitToDoc } from '../firebase/firestore';
import { Patient, Visit, VisitInput } from '../types/models';
import { endOfMonth, startOfMonth, startOfToday } from '../utils/date';
import { visitId } from '../utils/id';

const REF = () => db.collection('visits');

export function watchTodayVisits(cb: (visits: Visit[]) => void, onError?: (e: Error) => void): () => void {
  return REF()
    .where('date', '>=', startOfToday())
    .orderBy('date', 'desc')
    .onSnapshot(
      (snapshot) => cb(snapshot.docs.map(visitFromDoc)),
      (error) => onError?.(error)
    );
}

export function watchPatientVisits(
  patientId: string,
  cb: (visits: Visit[]) => void,
  onError?: (e: Error) => void
): () => void {
  return REF()
    .where('patientId', '==', patientId)
    .orderBy('date', 'desc')
    .onSnapshot(
      (snapshot) => cb(snapshot.docs.map(visitFromDoc)),
      (error) => onError?.(error)
    );
}

export async function addVisit(
  patient: Patient,
  input: VisitInput
): Promise<Visit> {
  const now = new Date();
  const visit: Visit = {
    ...input,
    id: visitId(patient.id, now),
    patientId: patient.id,
    date: now,
    createdAt: now,
  };

  await REF().doc(visit.id).set(visitToDoc(visit));

  // Keep denormalized fields for fast home-screen / profile reads.
  await db
    .collection('patients')
    .doc(patient.id)
    .set(
      {
        lastVisitDate: now,
        currentIssue: input.issue ?? patient.currentIssue,
        updatedAt: now,
      },
      { merge: true }
    );

  return visit;
}

export async function updateVisit(visitId: string, input: VisitInput) {
  await REF().doc(visitId).set(visitToDoc({ ...input }), { merge: true });
}

export async function deleteVisit(visitId: string) {
  await REF().doc(visitId).delete();
}

export async function getMonthVisits(monthOffset = 0): Promise<Visit[]> {
  const snap = await REF()
    .where('date', '>=', startOfMonth(monthOffset))
    .where('date', '<=', endOfMonth(monthOffset))
    .orderBy('date', 'desc')
    .get();
  return snap.docs.map(visitFromDoc);
}
