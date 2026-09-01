/**
 * Populate a Firebase project with demo patients / visits for testing.
 *
 * 1. Get a Firebase service account key:
 *    Firebase console > Project settings > Service accounts > Generate new
 *    private key. Save it somewhere safe (NOT in the repo).
 * 2. Run with the key path:
 *      GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json npx ts-node scripts/seedDemo.ts
 *
 * Or point it at the Emulator with:
 *      FIRESTORE_EMULATOR_HOST=localhost:8080 npx ts-node scripts/seedDemo.ts
 */
import * as admin from 'firebase-admin';

const COLLECTION_PATIENTS = 'patients';
const COLLECTION_VISITS = 'visits';

interface DemoVisit {
  issue: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  notes?: string;
}

interface DemoPatient {
  id: string;
  name: string;
  village: string;
  age: string;
  currentIssue: string;
  phone: string;
  visits: DemoVisit[];
}

const demo: DemoPatient[] = [
  {
    id: 'P00123',
    name: 'Anita Sharma',
    village: 'Nagpur',
    age: '34',
    currentIssue: 'Routine BP check',
    phone: '',
    visits: [{ issue: 'Routine BP check', prescription: 'Continue medication. Review next month.' }],
  },
  {
    id: 'P00124',
    name: 'Rakesh Kumar',
    village: 'Rampur',
    age: '45',
    phone: '+919876543210',
    currentIssue: 'Fever & cough',
    visits: [
      {
        issue: 'Fever & cough',
        diagnosis: 'Viral fever',
        prescription: 'Paracetamol 500mg x3, ORS',
        notes: 'Review in 3 days if fever persists.',
      },
    ],
  },
  {
    id: 'P00125',
    name: 'Sunita Devi',
    village: 'Bihar',
    age: '29',
    phone: '',
    currentIssue: 'Stomach pain',
    visits: [{ issue: 'Stomach pain', prescription: 'Antacid + ORS, bland diet.' }],
  },
];

async function main() {
  admin.initializeApp({
    credential:
      process.env.FIRESTORE_EMULATOR_HOST
        ? undefined
        : admin.credential.applicationDefault(),
    projectId: process.env.GCLOUD_PROJECT ?? process.env.FIREBASE_PROJECT_ID,
  });

  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();

  for (const p of demo) {
    const ref = db.collection(COLLECTION_PATIENTS).doc(p.id);
    await ref.set({
      id: p.id,
      name: p.name,
      nameLower: p.name.toLowerCase(),
      village: p.village,
      city: '',
      phone: p.phone,
      address: '',
      age: p.age,
      dob: '',
      currentIssue: p.currentIssue,
      createdAt: now,
      updatedAt: now,
      lastVisitDate: now,
    });

    for (const v of p.visits) {
      const visitId = `V-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      await db.collection(COLLECTION_VISITS).doc(visitId).set({
        id: visitId,
        patientId: p.id,
        date: now,
        issue: v.issue,
        diagnosis: v.diagnosis ?? '',
        treatment: v.treatment ?? '',
        prescription: v.prescription ?? '',
        notes: v.notes ?? '',
        nextVisitDate: null,
        createdAt: now,
      });
    }
  }

  await db.collection('meta').doc('id_counters').set({ patients: 125 }, { merge: true });

  console.log(`✅ Seeded ${demo.length} patients.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
