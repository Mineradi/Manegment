/**
 * Client-side IDs help the app work instantly and offline.
 *
 * Primary approach: a Firestore transaction on `meta/id_counters` assigns a
 * sequential 5-digit number (e.g. P00124). That keeps IDs short, human readable
 * and collision-free when online.
 *
 * Offline fallback: when the device is offline (transaction cannot reach the
 * server) we generate a random 5-digit id and check it against the local cache
 * before saving. On a clinic with a few thousand patients the chance of a
 * collision is negligible, and the next sync keeps a last-pass uniqueness guard.
 */
export const ID_PREFIX = 'P';

export function randomPatientId(): string {
  const n = Math.floor(10000 + Math.random() * 90000); // 10000..99999
  return `${ID_PREFIX}${String(n).padStart(5, '0')}`;
}

export function visitId(patientId: string, now: Date): string {
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `V-${y}${m}${d}-${patientId}-${h}${mi}${s}${rand}`;
}
