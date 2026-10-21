import { Alert, Platform } from 'react-native';
import { usePlants } from './store';

export type ConsentKind = 'plantnet' | 'ai';

const TEXT: Record<ConsentKind, { title: string; body: string }> = {
  plantnet: {
    title: 'Before identifying',
    body:
      'The photos you choose (and which part of the plant they show) are sent to Pl@ntNet, through HappyLeafy\'s server, to identify the plant or spot problems. ' +
      'Your collection stays stored on your device.',
  },
  ai: {
    title: 'About the AI advice',
    body:
      'Your photos, your question and this plant\'s details (species, watering, pot, light, room, notes and advice you saved) are sent to Google Gemini through HappyLeafy\'s server. ' +
      'On Google\'s free tier, Google may use them to improve its products and people may review them, so please don\'t include personal information. ' +
      'AI advice can be wrong. For adults 18+.',
  },
};

/** Diagnose uses both services: one notice instead of two in a row. */
const BOTH = {
  title: 'Before diagnosing',
  body:
    'Your photos and this plant\'s details go through HappyLeafy\'s server to Pl@ntNet and Google Gemini to find the problem. ' +
    'Google\'s free tier may use them to improve its products, so please don\'t include personal information. ' +
    'AI advice can be wrong. For adults 18+.',
};

function confirm({ title, body }: { title: string; body: string }): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(`${title}\n\n${body}`));
  return new Promise((resolve) =>
    Alert.alert(title, body, [
      { text: 'Not now', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Continue', onPress: () => resolve(true) },
    ]),
  );
}

/**
 * Shows a short "what gets sent where" notice the first time a feature sends data off the device.
 * Pass every service the feature uses; the ones not yet accepted share a single notice.
 * Returns true when the user has accepted (now or before). Users with their own keys still see it.
 */
export function useConsent() {
  const { settings, updateSettings } = usePlants();
  return async (...kinds: ConsentKind[]): Promise<boolean> => {
    const missing = kinds.filter((k) => !settings.consents?.[k]);
    if (missing.length === 0) return true;
    const ok = await confirm(missing.length > 1 ? BOTH : TEXT[missing[0]]);
    if (ok) await updateSettings({ consents: { ...settings.consents, ...Object.fromEntries(missing.map((k) => [k, true])) } });
    return ok;
  };
}
