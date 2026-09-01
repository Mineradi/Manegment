import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser } from '../types/models';

const PIN_KEY = '@clinic_pin';

/** Simple email/password auth. Firebase Auth handles hashing, sessions and rules. */
export async function signIn(email: string, password: string): Promise<AuthUser> {
  const user = await auth().signInWithEmailAndPassword(
    email.trim(),
    password
  );
  return requireUser(user.user);
}

export async function signUp(email: string, password: string): Promise<AuthUser> {
  const user = await auth().createUserWithEmailAndPassword(
    email.trim(),
    password
  );
  return requireUser(user.user);
}

function requireUser(user: { uid: string; email?: string | null } | null): AuthUser {
  if (!user) throw new Error('Firebase did not return a user.');
  return { uid: user.uid, email: user.email ?? null };
}

export async function signOut() {
  await auth().signOut();
}

export function onAuthChange(cb: (user: AuthUser | null) => void) {
  return auth().onAuthStateChanged((user) => cb(mapUser(user)));
}

function mapUser(user: { uid: string; email?: string | null } | null): AuthUser | null {
  if (!user) return null;
  return { uid: user.uid, email: user.email ?? null };
}

/** Optional local 4-digit PIN for fast lock/unlock after the first login. */
export async function setPin(pin: string) {
  await AsyncStorage.setItem(PIN_KEY, pin);
}

export async function getPin(): Promise<string | null> {
  return AsyncStorage.getItem(PIN_KEY);
}

export async function clearPin() {
  await AsyncStorage.removeItem(PIN_KEY);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await getPin();
  if (!stored) return true;
  return stored === pin;
}
