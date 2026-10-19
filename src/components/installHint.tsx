import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui';
import { colors, space } from '@/lib/theme';

const KEY = 'happyleafy.installHintDismissed.v1';

/** Which phone browser this is, or undefined when installed / on desktop / native. */
function installPlatform(): 'ios' | 'android' | undefined {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone;
  if (standalone) return undefined;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return undefined;
}

/** Web only: explains how to put HappyLeafy on the home screen, until dismissed. */
export function InstallHint() {
  const [platform] = useState(installPlatform);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!platform) return;
    AsyncStorage.getItem(KEY)
      .then((v) => setShow(!v))
      .catch(() => setShow(true));
  }, [platform]);

  if (!platform || !show) return null;

  const dismiss = () => {
    setShow(false);
    AsyncStorage.setItem(KEY, '1').catch(() => {});
  };

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>📲 Add HappyLeafy to your home screen</Text>
      <Text style={styles.body}>
        {platform === 'ios'
          ? 'In Safari, tap the Share button (square with an arrow), then "Add to Home Screen". It will open like a normal app.'
          : 'Tap the ⋮ menu in Chrome, then "Install app" or "Add to Home screen". It will open like a normal app.'}
      </Text>
      <Text style={styles.warn}>
        {platform === 'ios'
          ? 'Do this before adding plants: the home-screen app keeps its own data, separate from Safari, and Safari may clear data for sites you haven’t opened in a while.'
          : 'Do this before adding plants, and use HappyLeafy from the home-screen icon so your plants stay in one place.'}
      </Text>
      <View style={styles.row}>
        <Pressable onPress={dismiss} hitSlop={8}>
          <Text style={styles.dismiss}>Got it</Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft, marginBottom: space(3), gap: space(2) },
  title: { fontSize: 15, fontWeight: '700', color: colors.primary },
  body: { fontSize: 14, color: colors.text, lineHeight: 20 },
  warn: { fontSize: 13, color: colors.feed, lineHeight: 18, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'flex-end' },
  dismiss: { fontSize: 14, fontWeight: '700', color: colors.primary },
});
