# Firestore NoSQL Schema

The database has **three top-level collections**. Patient IDs are unique and
human-readable (`P00124`), so two patients with the same name are never mixed
up. All names are stored twice (human + lowercase) so search can be a fast,
instant prefix match.

```
firestore-root/
│
├── patients/                     // one document per patient
│   └── P00124                    // <- auto-generated unique Patient ID (5 digits)
│       {
│         "id": "P00124",
│         "name": "Rakesh Kumar",
│         "nameLower": "rakesh kumar",        // for instant search
│         "village": "Rampur",
│         "city": "",
│         "phone": "+919876543210",
│         "address": "12, Ward 3, Rampur",
│         "age": "45",
│         "dob": "1980-01-15",
│         "currentIssue": "Fever & cough",
│         "createdAt":  "Sep 1, 2026 09:20",
│         "updatedAt":  "Sep 1, 2026 09:20",
│         "lastVisitDate": "Sep 1, 2026 09:20"      // denormalized for home screen
│       }
│
├── visits/                       // one document per appointment / visit
│   └── V-260901-P00124-092033A1B2
│       {
│         "id": "V-260901-P00124-092033A1B2",
│         "patientId": "P00124",               // link to the patient
│         "date": "Sep 1, 2026 09:20",
│         "issue": "Fever & cough",
│         "diagnosis": "Viral fever",
│         "treatment": "",
│         "prescription": "Paracetamol 500mg x3, ORS",
│         "notes": "Review in 3 days if fever persists",
│         "nextVisitDate": "Sep 4, 2026",
│         "createdAt": "Sep 1, 2026 09:20"
│       }
│
└── meta/                         // counters & app config
    └── id_counters
        {
          "patients": 124          // next patient id = P00125
        }
```

## JSON example (ready to import for a demo)

```json
{
  "patients": {
    "P00123": {
      "id": "P00123",
      "name": "Anita Sharma",
      "nameLower": "anita sharma",
      "village": "Nagpur",
      "city": "",
      "phone": "",
      "address": "",
      "age": "34",
      "dob": "",
      "currentIssue": "Routine BP check",
      "createdAt": "2026-08-30T08:30:00.000Z",
      "updatedAt": "2026-08-30T08:30:00.000Z",
      "lastVisitDate": "2026-08-30T08:30:00.000Z"
    },
    "P00124": {
      "id": "P00124",
      "name": "Rakesh Kumar",
      "nameLower": "rakesh kumar",
      "village": "Rampur",
      "city": "",
      "phone": "+919876543210",
      "address": "12, Ward 3, Rampur",
      "age": "45",
      "dob": "",
      "currentIssue": "Fever & cough",
      "createdAt": "2026-09-01T09:20:00.000Z",
      "updatedAt": "2026-09-01T09:20:00.000Z",
      "lastVisitDate": "2026-09-01T09:20:00.000Z"
    }
  },
  "visits": {
    "V-260901-P00124-092033A1B2": {
      "id": "V-260901-P00124-092033A1B2",
      "patientId": "P00124",
      "date": "2026-09-01T09:20:00.000Z",
      "issue": "Fever & cough",
      "diagnosis": "Viral fever",
      "treatment": "",
      "prescription": "Paracetamol 500mg x3, ORS",
      "notes": "Review in 3 days if fever persists",
      "nextVisitDate": "2026-09-04T00:00:00.000Z",
      "createdAt": "2026-09-01T09:20:00.000Z"
    }
  },
  "meta": {
    "id_counters": {
      "patients": 124
    }
  }
}
```

Timestamps in the app are stored as Firestore Timestamp objects (the JSON above
shows ISO strings for human readability).

## Query patterns used

| Feature | Query |
| --- | --- |
| Auto-suggest | Local in-memory index over `patients` (instant, works offline). Optional remote: `patients.orderBy('nameLower').startAt(q).endAt(q+\uffff)`. |
| Visits today | `visits.where('date','>=', startOfToday()).orderBy('date','desc')` |
| Patient history | `visits.where('patientId','==', id).orderBy('date','desc')` |
| Month export | `visits.where('date','>=', startOfMonth).where('date','<=', endOfMonth).orderBy('date','desc')` |
| Recent 10 today | Denormalized `lastVisitDate` on patient + real-time visits list. |

## Why a denormalized `lastVisitDate` and `currentIssue`?

The home screen needs “patients seen today” and the profile header needs the
latest issue in a single read. Keeping these on the patient document means the
UI paints instantly from the Firestore cache even when offline, without a
second query per row.
