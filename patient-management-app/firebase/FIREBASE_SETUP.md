# Firebase Setup Guide

This app uses **Cloud Firestore** as its database. It has **no login screen and
no Firebase Auth** — it opens directly into the patient dashboard and reads /
writes straight to Firestore.

## 1. Create / open a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com).
   Your project `manegment-ecb77` is already set up.
2. Enable **Cloud Firestore**: Build → Firestore Database → Create database →
   choose **Production mode** → select a nearby region (e.g. `asia-southeast1`
   matches your existing project region).

## 2. Android config (already done)

- Android package name: **`management.com`** (matches `app.json` and
  `firebase/google-services.json`).
- `firebase/google-services.json` is already in the repo with your project
  details.

## 3. iOS (optional)

- Add an iOS app with bundle ID `com.clinic.patientmanager`.
- Download `GoogleService-Info.plist` into
  `patient-management-app/firebase/GoogleService-Info.plist` and re-add
  `"googleServicesFile": "./firebase/GoogleService-Info.plist"` under
  `app.json` → `ios`.

## 4. Publish the security rules (no terminal needed)

The app has **no login**, so the simplest way to unlock a brand-new Firestore is
to paste our rules from the Firebase website:

1. Open https://console.firebase.google.com/project/manegment-ecb77/firestore
2. Click the **Rules** tab (next to "Data").
3. Select everything in the editor and replace it with the contents of
   `firebase/firestore.rules` (in this repo).
4. Click **Publish**.

The app uses only built-in single-field indexes, so **no custom indexes are
needed** — you do not need to deploy `firestore.indexes.json` for the app to
work.

> Want to use the CLI instead? From the repo root:
>
> ```bash
> npm install -g firebase-tools
> firebase login
> firebase deploy --only firestore:rules
> ```

## 5. Run the app

```bash
cd patient-management-app
npm install
npx expo run:android
```

The app opens straight to the dashboard — no email/password, no sign in.

## Security (important for a real clinic)

With no authentication, the shipped rules allow any app install to read/write.
For production, enable **Firebase App Check** in the console and switch the
rules from `if true` to the `appVerified()` block already included in
`firestore.rules`. This keeps the app login-free while preventing strangers'
devices from accessing your patients' data.

## What is stored where

| Data | Storage |
| --- | --- |
| Patients | `patients/{id}` in Cloud Firestore |
| Visit logs | `visits/{id}` in Cloud Firestore |
| Sequential ID counter | `meta/id_counters` in Cloud Firestore |

See `docs/FIRESTORE_SCHEMA.md` for the full JSON shape.
