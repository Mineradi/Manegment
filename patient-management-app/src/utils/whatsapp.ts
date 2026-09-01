import { Linking, Platform } from 'react-native';

/**
 * Opens WhatsApp with a pre-filled message when a phone number is available.
 * `wa.me` links work on both platforms through the native browser/app handler.
 */
export async function openWhatsApp(
  phone: string | undefined,
  message: string
): Promise<boolean> {
  if (!phone) {
    return false;
  }
  // Strip non-digit characters, keep leading +
  const digits = phone.replace(/[^\d+]/g, '');
  const text = encodeURIComponent(message);
  const url = `https://wa.me/${digits}?text=${text}`;

  try {
    await Linking.openURL(url);
    return true;
  } catch {
    // On iOS the wa.me deep link may need whatsapp:// as a fallback.
    const fallback = `whatsapp://send?phone=${digits}&text=${text}`;
    try {
      await Linking.openURL(fallback);
      return true;
    } catch {
      return false;
    }
  }
}

export function canOpenWhatsApp(): boolean {
  return Platform.OS === 'android' || Platform.OS === 'ios';
}
