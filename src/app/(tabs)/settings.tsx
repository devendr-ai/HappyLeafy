import { useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Button, Card, SectionTitle, Stepper } from '@/components/ui';
import { ensurePermission } from '@/lib/reminders';
import { usePlants } from '@/lib/store';
import { colors, radius, space } from '@/lib/theme';

export default function SettingsScreen() {
  const { ready } = usePlants();
  // Wait for stored settings so the key field starts with the saved value.
  return ready ? <SettingsForm /> : null;
}

function SettingsForm() {
  const { settings, updateSettings, plants } = usePlants();
  const [key, setKey] = useState(settings.plantNetApiKey);
  const keyDirty = key.trim() !== settings.plantNetApiKey;

  const hourLabel = (h: number) => `${((h + 11) % 12) + 1}:00 ${h < 12 ? 'AM' : 'PM'}`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SectionTitle>Plant identification</SectionTitle>
      <Card style={{ gap: space(3) }}>
        <Text style={styles.body}>
          HappyLeafy uses the free Pl@ntNet API (500 identifications/day, non-commercial). Sign up, create an API key, and paste it here. The key stays on this device.
        </Text>
        <Button title="Get a free key" icon="open-outline" variant="secondary" onPress={() => Linking.openURL('https://my.plantnet.org/')} />
        <TextInput
          value={key}
          onChangeText={setKey}
          placeholder="Pl@ntNet API key"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          style={styles.input}
        />
        <Button title={keyDirty ? 'Save key' : 'Saved'} disabled={!keyDirty} onPress={() => updateSettings({ plantNetApiKey: key.trim() })} />
      </Card>

      <SectionTitle>Reminders</SectionTitle>
      <Card style={{ gap: space(4) }}>
        {Platform.OS === 'web' ? (
          <Text style={styles.body}>Reminders work in the iOS / Android app, not in the browser.</Text>
        ) : (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>Care reminders</Text>
              <Switch
                value={settings.remindersEnabled}
                onValueChange={async (v) => {
                  if (v) await ensurePermission();
                  updateSettings({ remindersEnabled: v });
                }}
                trackColor={{ true: colors.primary }}
              />
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Remind me at</Text>
              <Stepper
                value={settings.reminderHour}
                min={5}
                max={22}
                onChange={(h) => updateSettings({ reminderHour: h })}
              />
            </View>
            <Text style={styles.muted}>{hourLabel(settings.reminderHour)} on the day care is due.</Text>
          </>
        )}
      </Card>

      <SectionTitle>About</SectionTitle>
      <Card>
        <Text style={styles.body}>HappyLeafy v1.0 · {plants.length} plants · all data stored on this device.</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space(4), paddingBottom: space(12) },
  body: { color: colors.text, fontSize: 14, lineHeight: 20 },
  muted: { color: colors.muted, fontSize: 13 },
  label: { color: colors.text, fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: space(3), fontSize: 15, color: colors.text, backgroundColor: colors.bg },
});
