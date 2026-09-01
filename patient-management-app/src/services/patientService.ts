import { db, patientFromDoc, patientToDoc } from '../firebase/firestore';
import { Patient, PatientInput } from '../types/models';
import { randomPatientId } from '../utils/id';

const REF = () => db.collection('patients');

/**
 * Real-time watch over all patients. With 40-50 patients/day this is tiny
 * (thousands of docs over years) and gives us an instant, fully searchable
 * index on the device, including while offline.
 */
export function watchPatients(cb: (patients: Patient[]) => void, onError?: (e: Error) => void): () => void {
  return REF()
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      (snapshot) => cb(snapshot.docs.map(patientFromDoc)),
      (error) => onError?.(error)
    );
}

export async function getNextPatientId(): Promise<string> {
  // Sequential IDs are assigned online with a transactional counter. This keeps
  // ids short and collision free when the device is connected.
  try {
    const counterRef = db.collection('meta').doc('id_counters');
    return await db
      .runTransaction(async (transaction) => {
        const snap = await transaction.get(counterRef);
        const next = (snap.exists ? snap.data()?.patients ?? 999 : 999) + 1;
        transaction.set(counterRef, { patients: next }, { merge: true });
        return `P${String(next).padStart(5, '0')}`;
      });
  } catch {
    // Offline fallback: generate a random 5-digit id and ensure it is unique
    // against the local cached index (callers pass existing ids).
    return randomPatientId();
  }
}

export async function addPatient(
  input: PatientInput,
  existingIds: Set<string>
): Promise<Patient> {
  let id = await getNextPatientId();
  // Guard against a rare collision with the local offline cache.
  if (existingIds.has(id)) {
    id = randomPatientId();
    while (existingIds.has(id)) {
      id = randomPatientId();
    }
  }

  const patient: Patient = {
    ...input,
    id,
    nameLower: input.name.trim().toLowerCase(),
    createdAt: new Date(),
    updatedAt: new Date(),
    lastVisitDate: null,
  };

  await REF().doc(id).set({
    ...patientToDoc(patient),
    id,
    createdAt: new Date(),
    lastVisitDate: null,
  });

  return patient;
}

export async function updatePatient(patientId: string, input: Partial<PatientInput>) {
  const patch = patientToDoc(input as Patient);
  if (input.name !== undefined) {
    patch.nameLower = input.name.trim().toLowerCase();
  }
  await REF().doc(patientId).set(patch, { merge: true });
}

export async function deletePatient(patientId: string) {
  const batch = db.batch();
  batch.delete(REF().doc(patientId));
  const visits = await db
    .collection('visits')
    .where('patientId', '==', patientId)
    .get();
  visits.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

/**
 * Instant client-side autocomplete over the cached patient list.
 * This is the fastest path for a clinic (~thousands of patients) and works
 * offline. For very large clinics we also expose searchPatientsRemote below.
 */
export function searchPatientsLocal(patients: Patient[], query: string): Patient[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  // Rank: name prefix > name contains > village/phone.
  const token = q.replace(/\s+/g, ' ');
  const prefixMatches: Patient[] = [];
  const containsMatches: Patient[] = [];
  const otherMatches: Patient[] = [];

  for (const p of patients) {
    const name = p.nameLower;
    if (name.startsWith(token)) {
      prefixMatches.push(p);
    } else if (name.includes(token)) {
      containsMatches.push(p);
    } else if (
      (p.village || '').toLowerCase().includes(token) ||
      (p.phone || '').includes(q.replace(/[^\d+]/g, ''))
    ) {
      otherMatches.push(p);
    }
  }
  return [...prefixMatches, ...containsMatches, ...otherMatches].slice(0, 12);
}

/**
 * Firestore prefix query for very large databases (10k+ patients).
 * Requires index firestore.indexes.json in the repo.
 */
export function searchPatientsRemote(query: string, limit = 12): Promise<Patient[]> {
  const q = query.trim().toLowerCase();
  if (!q) return Promise.resolve([]);
  const end = q.replace(/.$/, (c) => String.fromCharCode(c.charCodeAt(0) + 1));
  return REF()
    .orderBy('nameLower')
    .startAt(q)
    .endAt(end)
    .limit(limit)
    .get()
    .then((snap) => snap.docs.map(patientFromDoc));
}

export function getPatientById(patientId: string) {
  return REF().doc(patientId).get().then((doc) => (doc.exists ? patientFromDoc(doc) : null));
}
