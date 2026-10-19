import { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { Button, Card } from '@/components/ui';
import { exportBackup, pickBackup, restorePhotos } from '@/lib/backup';
import type { BackupFile } from '@/lib/backupFormat';
import { usePlants } from '@/lib/store';
import { colors, space } from '@/lib/theme';

type Mode = 'merge' | 'replace';

/** Ask merge vs replace. Resolves undefined on cancel. */
function askMode(backup: BackupFile, current: number): Promise<Mode | undefined> {
  const summary = `Backup from ${new Date(backup.exportedAt).toLocaleDateString()} with ${backup.plants.length} plant(s).`;
  if (current === 0) return Promise.resolve('replace');
  if (Platform.OS === 'web') {
    if (window.confirm(`${summary}\n\nOK = Replace your ${current} plant(s) with the backup.\nCancel = choose Add instead.`)) return Promise.resolve('replace');
    return Promise.resolve(window.confirm('Add the backup plants to your current plants instead?') ? 'merge' : undefined);
  }
  return new Promise((resolve) =>
    Alert.alert('Restore backup', `${summary}\n\nAdd keeps your ${current} plant(s) and adds new ones. Replace swaps everything for the backup.`, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(undefined) },
      { text: 'Add', onPress: () => resolve('merge') },
      { text: 'Replace', style: 'destructive', onPress: () => resolve('replace') },
    ]),
  );
}

export function BackupCard() {
  const { plants, settings, restoreBackup, updateSettings } = usePlants();
  const [busy, setBusy] = useState<'backup' | 'restore'>();
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();

  const backup = async () => {
    setBusy('backup');
    setError(undefined);
    setMessage(undefined);
    try {
      const n = await exportBackup(plants, settings);
      await updateSettings({ lastBackupAt: new Date().toISOString() });
      setMessage(`Backup made: ${n.plants} plant(s), ${n.photos} photo(s). Save it to iCloud Drive or Files.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(undefined);
    }
  };

  const restore = async () => {
    setBusy('restore');
    setError(undefined);
    setMessage(undefined);
    try {
      const file = await pickBackup();
      if (!file) return;
      const mode = await askMode(file, plants.length);
      if (!mode) return;
      await restoreBackup(restorePhotos(file), file.settings, mode);
      setMessage(`Restored ${file.plants.length} plant(s)${mode === 'merge' ? ' (new ones added)' : ''}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(undefined);
    }
  };

  return (
    <Card style={{ gap: space(3) }}>
      <Text style={styles.body}>
        Save all plants, schedules, history and photos to one file. Choose “Save to Files” → iCloud Drive to keep it safe, or send it to your new phone. API keys are not
        included.
      </Text>
      <View style={styles.row}>
        <Button title="Back up" icon="cloud-upload" style={{ flex: 1 }} loading={busy === 'backup'} disabled={!!busy || plants.length === 0} onPress={backup} />
        <Button title="Restore" icon="cloud-download" variant="secondary" style={{ flex: 1 }} loading={busy === 'restore'} disabled={!!busy} onPress={restore} />
      </View>
      {message && <Text style={styles.ok}>{message}</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  body: { color: colors.text, fontSize: 14, lineHeight: 20 },
  row: { flexDirection: 'row', gap: space(3) },
  ok: { color: colors.primary, fontSize: 13 },
  error: { color: colors.danger, fontSize: 13 },
});
