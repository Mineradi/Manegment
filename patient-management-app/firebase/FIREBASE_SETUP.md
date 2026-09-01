# Firebase Setup Guide

This app uses **React Native Firebase** (native SDK) which reads configuration
from platform files, not from `.env`:

- Android → `firebase/google-services.json`
- iOS → `firebase/GoogleService-Info.plist`

## 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
   and create a project.
2. Enable **Authentication → Sign-in method → Email/Password**.
3. Enable **Cloud Firestore** and choose production mode (we will deploy rules).

## 2. Register your apps

- **Android**: add the Android app with package `com.clinic.patientmanager`
  (match `app.json`). Download `google-services.json` into
  `patient-management-app/firebase/google-services.json`.
- **iOS**: add the iOS app with bundle ID `com.clinic.patientmanager`.
  Download `GoogleService-Info.plist` into
  `patient-management-app/firebase/GoogleService-Info.plist`.

## 3. Deploy rules and indexes

```bash
cd patient-management-app
npm i -g firebase-tools
firebase init firestore   # if not already initialised in the repo root
firebase deploy --only firestore:rules,firestore:indexes
```

Rules live in `firebase/firestore.rules`; composite indexes in
`firebase/firestore.indexes.json`.

## 4. Run the app

```bash
cd patient-management-app
npm install
npx expo start
```

Press `a` (Android emulator) or scan the QR code with **Expo Go**. For a fully
native build use `npx expo run:android`.

## 5. First login

Create the first account in the app's login screen (**Create Account**). That
account becomes a staff member. Add more staff from the Firebase console under
Authentication → Users, or register them from the app.

## What is stored where

| Data | Storage |
| --- | --- |
| Patients | `patients/{id}` |
| Visit logs | `visits/{id}` |
| Sequential ID counter | `meta/id_counters` |
| Login / staff | Firebase Auth |

See `docs/FIRESTORE_SCHEMA.md` for the full JSON shape.
