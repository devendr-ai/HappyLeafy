import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, SlideInRight, SlideOutLeft, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InstallHint } from '@/components/installHint';
import { PlantHero } from '@/components/today/plantHero';
import { Button, Chip, Stepper } from '@/components/ui';
import { ensurePermission } from '@/lib/reminders';
import { usePlants } from '@/lib/store';
import { colors, radius, space } from '@/lib/theme';
import { searchPlaces, type Place } from '@/lib/weather';

// The browser beta can't send notifications, so it skips the reminders step.
const WEB = Platform.OS === 'web';
const STEPS = WEB ? 2 : 3;

function Dot({ active }: { active: boolean }) {
  const style = useAnimatedStyle(() => ({ width: withSpring(active ? 22 : 8), opacity: withSpring(active ? 1 : 0.35) }));
  return <Animated.View style={[styles.dot, style]} />;
}

const FEATURES = [
  { emoji: '📸', title: 'Identify any plant', body: 'Snap a photo and get its name and a care guide.' },
  { emoji: '💧', title: WEB ? 'Smart care schedule' : 'Never forget to water', body: WEB ? 'Know what to water and when, adapted to season, pot, light and rain.' : 'Schedules that adapt to season, pot, light and rain.' },
  { emoji: '🩺', title: 'Plant doctor', body: 'Photo diagnosis and an AI you can ask anything.' },
];

export default function Onboarding() {
  const { settings, updateSettings } = usePlants();
  const [step, setStep] = useState(0);

  const finish = async () => {
    await updateSettings({ onboarded: true });
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <View style={styles.dots}>
          {Array.from({ length: STEPS }, (_, i) => (
            <Dot key={i} active={i === step} />
          ))}
        </View>
        {step < STEPS - 1 && (
          <Text style={styles.skip} onPress={finish}>
            Skip
          </Text>
        )}
      </View>

      <Animated.View key={step} entering={SlideInRight.duration(350)} exiting={SlideOutLeft.duration(200)} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
          {step === 0 && <Welcome onNext={() => setStep(1)} />}
          {step === 1 && <Where onNext={WEB ? finish : () => setStep(2)} last={WEB} />}
          {step === 2 && <Reminders hour={settings.reminderHour} onHour={(h) => updateSettings({ reminderHour: h })} onDone={finish} />}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

function Welcome({ onNext }: { onNext: () => void }) {
  return (
    <>
      <InstallHint />
      <View style={styles.hero}>
        <PlantHero happy thirsty={false} size={170} />
      </View>
      <Text style={styles.title}>Meet HappyLeafy</Text>
      <Text style={styles.subtitle}>Your plants, happy and thriving.</Text>
      <View style={{ gap: space(3), marginTop: space(4) }}>
        {FEATURES.map((f, i) => (
          <Animated.View key={f.title} entering={FadeInDown.delay(250 + i * 120).springify()} style={styles.feature}>
            <Text style={styles.featureEmoji}>{f.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureBody}>{f.body}</Text>
            </View>
          </Animated.View>
        ))}
      </View>
      <Button title="Get started" icon="arrow-forward" onPress={onNext} style={styles.cta} />
      <Text style={styles.muted}>HappyLeafy is for adults (18+). By continuing you confirm you’re 18 or older.</Text>
    </>
  );
}

function Where({ onNext, last }: { onNext: () => void; last?: boolean }) {
  const { settings, updateSettings } = usePlants();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const search = async () => {
    setLoading(true);
    setError(undefined);
    try {
      setResults(await searchPlaces(query));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const choose = (p: Place) => {
    // Latitude decides which months are winter for the watering schedule.
    updateSettings({ weather: { latitude: p.latitude, longitude: p.longitude, place: p.name }, hemisphere: p.latitude < 0 ? 'southern' : 'northern' });
    setResults(undefined);
    setQuery('');
  };

  return (
    <>
      <Animated.Text entering={FadeInDown.springify()} style={styles.bigEmoji}>
        🌍
      </Animated.Text>
      <Text style={styles.title}>Where do your plants live?</Text>
      <Text style={styles.subtitle}>Your town sets the seasons for watering, and lets rain count for outdoor plants. Only the town is used, never your GPS location.</Text>

      {settings.weather ? (
        <Animated.View entering={FadeInDown.springify()} style={styles.picked}>
          <Text style={styles.pickedText}>📍 {settings.weather.place}</Text>
          <Text style={styles.pickedSub}>{settings.hemisphere === 'southern' ? 'Southern' : 'Northern'} hemisphere</Text>
        </Animated.View>
      ) : null}

      <View style={styles.row}>
        <TextInput value={query} onChangeText={setQuery} onSubmitEditing={search} placeholder={settings.weather ? 'Change town' : 'Your town or city'} style={styles.input} returnKeyType="search" />
        <Button title="Search" onPress={search} loading={loading} disabled={query.trim().length < 2} />
      </View>
      {results && (
        <View style={styles.chips}>
          {results.length === 0 && <Text style={styles.muted}>No places found.</Text>}
          {results.map((p) => (
            <Chip key={`${p.latitude},${p.longitude}`} label={p.name} onPress={() => choose(p)} />
          ))}
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}

      {!settings.weather && (
        <>
          <Text style={[styles.muted, { marginTop: space(4) }]}>Or just pick your hemisphere:</Text>
          <View style={styles.chips}>
            <Chip label="Northern" selected={settings.hemisphere === 'northern'} onPress={() => updateSettings({ hemisphere: 'northern' })} />
            <Chip label="Southern" selected={settings.hemisphere === 'southern'} onPress={() => updateSettings({ hemisphere: 'southern' })} />
          </View>
        </>
      )}
      {last && <Text style={[styles.muted, { marginTop: space(4) }]}>This browser beta covers identification, plant advice and care tracking. Automatic reminders are coming in the phone app.</Text>}
      <Button title={last ? 'Start growing 🌱' : 'Continue'} icon={last ? undefined : 'arrow-forward'} onPress={onNext} style={styles.cta} />
    </>
  );
}

function Reminders({ hour, onHour, onDone }: { hour: number; onHour: (h: number) => void; onDone: () => void }) {
  const [granted, setGranted] = useState<boolean>();
  const web = Platform.OS === 'web';
  const label = `${((hour + 11) % 12) + 1}:00 ${hour < 12 ? 'AM' : 'PM'}`;

  return (
    <>
      <Animated.Text entering={FadeInDown.springify()} style={styles.bigEmoji}>
        🔔
      </Animated.Text>
      <Text style={styles.title}>Gentle reminders</Text>
      <Text style={styles.subtitle}>One morning summary on days your plants need water or food. Pause anytime with vacation mode.</Text>

      <View style={styles.hourCard}>
        <Text style={styles.featureTitle}>Remind me at</Text>
        <Stepper value={hour} min={5} max={22} onChange={onHour} />
        <Text style={styles.muted}>{label}</Text>
      </View>

      {web ? (
        <Text style={styles.muted}>Reminders work in the phone app, not in the browser.</Text>
      ) : granted ? (
        <Animated.Text entering={FadeInDown.springify()} style={styles.ok}>
          ✓ Notifications on
        </Animated.Text>
      ) : (
        <Button title={granted === false ? 'Open Settings to allow' : 'Allow notifications'} icon="notifications" variant="secondary" onPress={async () => setGranted(await ensurePermission())} />
      )}
      {granted === false && <Text style={styles.muted}>Notifications are off. You can turn them on later in your phone’s Settings → HappyLeafy.</Text>}

      <Button title="Start growing 🌱" onPress={onDone} style={styles.cta} />
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space(6), paddingTop: space(3), minHeight: 40 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  skip: { color: colors.muted, fontSize: 15, fontWeight: '600', padding: space(2) },
  page: { padding: space(6), paddingBottom: space(12), gap: space(3), flexGrow: 1 },
  hero: { alignItems: 'center', marginTop: space(2) },
  bigEmoji: { fontSize: 72, textAlign: 'center', marginTop: space(6) },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 16, color: colors.muted, textAlign: 'center', lineHeight: 22 },
  feature: { flexDirection: 'row', gap: space(3), alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.lg, padding: space(4), borderWidth: 1, borderColor: colors.border },
  featureEmoji: { fontSize: 28 },
  featureTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  featureBody: { fontSize: 14, color: colors.muted, marginTop: 2, lineHeight: 19 },
  cta: { marginTop: 'auto', paddingVertical: space(4) },
  row: { flexDirection: 'row', gap: space(2), alignItems: 'center', marginTop: space(4) },
  input: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: space(3), fontSize: 16, color: colors.text, backgroundColor: colors.card },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  picked: { backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: space(4), alignItems: 'center', marginTop: space(2) },
  pickedText: { fontSize: 16, fontWeight: '700', color: colors.primary },
  pickedSub: { fontSize: 13, color: colors.primary, marginTop: 2 },
  hourCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: space(5), alignItems: 'center', gap: space(3), borderWidth: 1, borderColor: colors.border, marginVertical: space(4) },
  muted: { fontSize: 14, color: colors.muted, textAlign: 'center' },
  error: { fontSize: 14, color: colors.danger },
  ok: { fontSize: 16, fontWeight: '700', color: colors.primary, textAlign: 'center' },
});
