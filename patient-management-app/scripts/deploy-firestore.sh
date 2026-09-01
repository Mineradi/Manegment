#!/usr/bin/env bash
# Deploys the Firestore security rules and composite indexes for this project.
# Run from the repository root:
#   bash patient-management-app/scripts/deploy-firestore.sh
set -euo pipefail

cd "$(dirname "$0")/../.."

echo "Using Firebase project: $(node -e "console.log(require('./.firebaserc').projects.default)")"

if ! command -v firebase >/dev/null 2>&1; then
  echo "Installing Firebase CLI locally (project dev dependency)…"
  npx --yes firebase-tools@latest --version
fi

echo ""
echo "Log in to Firebase once (opens a browser / prints a link):"
echo "  npx firebase login:ci"
echo ""
echo "Then run:"
echo "  npx firebase deploy --only firestore:rules,firestore:indexes"
echo ""

# Actually deploy.
npx firebase deploy --only firestore:rules,firestore:indexes

echo ""
echo "✅ Firestore rules and indexes are live on 'manegment-ecb77'."
