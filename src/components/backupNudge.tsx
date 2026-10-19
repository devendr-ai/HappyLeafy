import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card } from '@/components/ui';
import { exportBackup } from '@/lib/backup';
import { addDays } from '@/lib/schedule';
import { usePlants } from '@/lib/store';
import { colors, space } from '@/lib/theme';

const MIN_PLANTS = 3;
const STALE_DAYS = 30;
const SNOOZE_DAYS = 14;

/** Today card: once the collection is worth protecting, remind about backups (they're the only copy). */
export function BackupNudge() {
  const { plants, settings, updateSettings } = usePlants();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  // Read the clock once per mount (the Today screen remounts each time the app opens).
  const [now] = useState(() => Date.now());
  const stale = !settings.lastBackupAt || now - new Date(settings.lastBackupAt).getTime() > STALE_DAYS * 86_400_000;
  const snoozed = !!settings.backupNudgeUntil && now < new Date(settings.backupNudgeUntil).getTime();
  if (plants.length < MIN_PLANTS || !stale || snoozed) return null;

  const backup = async () => {
    setBusy(true);
    setError(undefined);
    try {
      await exportBackup(plants, settings);
      await updateSettings({ lastBackupAt: new Date().toISOString() });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>💾 Protect your {plants.length} plants</Text>
      <Text style={styles.body}>
        {settings.lastBackupAt ? "It's been a while since your last backup. " : ''}
        Your collection lives only on this {Platform.OS === 'web' ? 'browser' : 'phone'}. Save a backup file to iCloud Drive or Files so you can restore it on a new phone.
      </Text>
      <View style={styles.row}>
        <Button title="Back up now" icon="cloud-upload" onPress={backup} loading={busy} style={{ flex: 1 }} />
        <Pressable onPress={() => updateSettings({ backupNudgeUntil: addDays(new Date(), SNOOZE_DAYS).toISOString() })} hitSlop={8} style={styles.later}>
          <Text style={styles.laterText}>Later</Text>
        </Pressable>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: space(3), gap: space(2), borderColor: colors.primary, borderWidth: 1 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  body: { fontSize: 14, color: colors.text, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
  later: { paddingHorizontal: space(3) },
  laterText: { color: colors.muted, fontWeight: '600', fontSize: 15 },
  error: { color: colors.danger, fontSize: 13 },
});
