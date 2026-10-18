import { Ionicons } from '@expo/vector-icons';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Chip } from '@/components/ui';
import { addDays, startOfDay, vacationUntil } from '@/lib/schedule';
import { usePlants } from '@/lib/store';
import { colors, space } from '@/lib/theme';

const LENGTHS = [
  { label: '3 days', days: 3 },
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
  { label: '3 weeks', days: 21 },
  { label: '1 month', days: 30 },
];

const fmt = (d: Date) => d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });

function confirm(title: string, message: string, onYes: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onYes();
    return;
  }
  Alert.alert(title, message, [
    { text: 'No', style: 'cancel' },
    { text: 'Yes', onPress: onYes },
  ]);
}

/** Settings card: start or end vacation mode. */
export function VacationSettings() {
  const { settings, updateSettings, plants, logCare } = usePlants();
  const back = vacationUntil(settings);

  const start = (days: number) => {
    const until = addDays(startOfDay(new Date()), days).toISOString();
    updateSettings({ vacation: { until } });
    if (plants.length)
      confirm('Water everything before you go?', 'Mark all plants as watered today, so their schedules start fresh.', async () => {
        for (const p of plants) await logCare(p.id, 'water');
      });
  };

  return (
    <Card style={{ gap: space(3) }}>
      {back ? (
        <>
          <Text style={styles.body}>On vacation until {fmt(back)}. Reminders are held until then.</Text>
          <Button title="I'm back" icon="home" onPress={() => updateSettings({ vacation: undefined })} />
        </>
      ) : (
        <>
          <Text style={styles.body}>Going away? Reminders pause until you return, then pick up from there.</Text>
          <View style={styles.chips}>
            {LENGTHS.map((l) => (
              <Chip key={l.days} label={l.label} onPress={() => start(l.days)} />
            ))}
          </View>
        </>
      )}
    </Card>
  );
}

/** Today-screen banner while vacation mode is on. */
export function VacationBanner() {
  const { settings, updateSettings } = usePlants();
  const back = vacationUntil(settings);
  if (!back) return null;
  return (
    <Card style={styles.banner}>
      <Ionicons name="airplane" size={20} color={colors.feed} />
      <Text style={[styles.body, { flex: 1 }]}>Vacation mode until {fmt(back)}. Reminders are paused.</Text>
      <Button title="I'm back" variant="feed" onPress={() => updateSettings({ vacation: undefined })} />
    </Card>
  );
}

const styles = StyleSheet.create({
  body: { color: colors.text, fontSize: 14, lineHeight: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  banner: { flexDirection: 'row', alignItems: 'center', gap: space(3), backgroundColor: colors.feedSoft, borderColor: colors.feedSoft, marginBottom: space(3) },
});
