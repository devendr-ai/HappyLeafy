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

function confirm(kind: ConsentKind): Promise<boolean> {
  const { title, body } = TEXT[kind];
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
 * Returns true when the user has accepted (now or before). Users with their own keys still see it.
 */
export function useConsent() {
  const { settings, updateSettings } = usePlants();
  return async (kind: ConsentKind): Promise<boolean> => {
    if (settings.consents?.[kind]) return true;
    const ok = await confirm(kind);
    if (ok) await updateSettings({ consents: { ...settings.consents, [kind]: true } });
    return ok;
  };
}
