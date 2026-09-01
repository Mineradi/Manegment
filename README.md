# Clinic Patient Manager — Native Mobile App

A fast, offline-first **React Native (Expo) + Firebase** patient management app
built for busy clinics (40–50 patients/day). It is a real mobile application, not
a web app, and is designed around two things: **instant patient lookup** and
**one-tap data entry**.

---

## What’s included

| Priority | Feature | Where |
| --- | --- | --- |
| ★ Top | Large search bar with **real-time auto-suggest** | `src/components/AutoSuggestSearchBar.tsx` |
| ★ Top | Search results show **Name + Village + Unique Patient ID (+ phone)** | `src/components/AutoSuggestSearchBar.tsx` |
| ★ Top | **One tap** from suggestion → patient profile | `src/screens/HomeScreen.tsx` |
| Quick | Patient registration, only 3 mandatory fields | `src/screens/AddPatientScreen.tsx` |
| Quick | **Auto 5-digit Patient ID** (e.g. `P00124`) | `src/utils/id.ts`, `src/services/patientService.ts` |
| History | Chronological visit timeline (date / issue / treatment) | `src/screens/PatientProfileScreen.tsx` |
| History | One-tap **New Visit** with patient details pre-filled | `src/screens/NewVisitScreen.tsx` |
| Dashboard | **Patients Today** counter | `src/components/DailyCounter.tsx` |
| Dashboard | **Last 10 patients seen today** list | `src/components/RecentPatients.tsx` |
| Pro | **Firebase offline persistence** (works offline, auto-syncs) | `src/firebase/firestore.ts` |
| Pro | One-tap **WhatsApp prescription / next-visit message** | `src/utils/whatsapp.ts` |
| Pro | Export all patients or a month as **CSV** (Excel/Sheets, printable to PDF) | `src/services/exportService.ts` |
| Secure | Firebase Auth, staff sign-in + optional local PIN hooks | `src/firebase/auth.ts` |

---

## Tech stack

- **App:** React Native 0.79 + Expo 53, TypeScript, React Navigation
- **Backend / Database:** Cloud Firestore with offline persistence
- **Auth:** Firebase Auth (Email/Password)
- **Local cache:** Firestore persistent cache (writes queue offline automatically)

---

## Project layout

```
patient-management-app/
  App.tsx                        # boot, auth gate, navigation theme
  src/
    firebase/                    # Firestore, Auth
    services/                    # patient, visit, export logic
    store/                       # realtime app store (patients + today's visits)
    navigation/                  # stack navigator
    screens/                     # Home, Add, Profile, New Visit, Login, Settings
    components/                  # search, counter, rows, UI kit
    theme/                       # medical color palette
    types/                       # Patient / Visit models
    utils/                       # ids, dates, whatsapp, csv
  firebase/
    firestore.rules              # security rules
    firestore.indexes.json       # composite indexes
    FIREBASE_SETUP.md            # step-by-step Firebase setup
  docs/
    FIRESTORE_SCHEMA.md          # exact NoSQL JSON structure
  app.json                       # iOS/Android app config
```

---

## Quick start

```bash
cd patient-management-app
npm install
npx expo start
```

Then follow `patient-management-app/firebase/FIREBASE_SETUP.md` to
create a Firebase project, drop in `google-services.json` /
`GoogleService-Info.plist`, and deploy the rules.

> Expo Go supports the JS portion of the app but **@react-native-firebase
> needs a development build**. After configuring Firebase run:
>
> ```bash
> npx expo run:android   # or run:ios
> ```
>
> This creates the native project with the Firebase SDK and offline persistence.

---

## Firebase database structure (summary)

```
firestore-root/
├── patients/{P00124}            # Name, village, phone, current issue, lastVisitDate
├── visits/{V-….}                # patientId, date, issue, prescription, nextVisitDate
└── meta/id_counters             # { "patients": 124 }  → next ID P00125
```

Full JSON, example import data, query patterns, and the reasoning behind the
denormalized fields are in
[`patient-management-app/docs/FIRESTORE_SCHEMA.md`](patient-management-app/docs/FIRESTORE_SCHEMA.md).

---

## UX decisions for speed

- **Instant search over a local cache.** With thousands of records all patients
  live in the Firestore persistent cache; every keystroke filters locally in
  memory, so there is **zero network latency** and it works offline.
- **Duplicate names solved twice:** a unique auto-assigned `Pxxxxx` ID, and the
  search dropdown always shows Village + ID + phone.
- **Big tap targets, no animations, no clutter.** 56px buttons, 44px avatars,
  large 17–21px input text, and no transitions.
- **Fewest taps for the 3 most common actions:** search → tap → history;
  “Add Patient” FAB; “New Visit” inside a profile.

---

## Security

- Firebase Rules authenticate every read/write.
- Only authenticated staff accounts can read or write.
- Patient IDs are unique; a Firestore transaction protects the counter.
- Visit logs are linked to patients by `patientId`.

---

## Demo / sample data

A ready-to-import Firestore JSON sample (patients, visits, counter) is included
in `docs/FIRESTORE_SCHEMA.md`. You can paste it into the Firestore console
(Data → Import) or create the documents manually.
