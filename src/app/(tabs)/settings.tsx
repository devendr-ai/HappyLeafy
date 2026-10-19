import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Button, Card, Chip, SectionTitle, Stepper } from '@/components/ui';
import { BackupCard } from '@/components/backupCard';
import { VacationSettings } from '@/components/vacation';
import { WeatherPlace } from '@/components/weatherPlace';
import { LINKS } from '@/lib/links';
import { proxyEnabled } from '@/lib/proxy';
import { ensurePermission } from '@/lib/reminders';
import { usePlants } from '@/lib/store';
import { colors, radius, space } from '@/lib/theme';

export default function SettingsScreen() {
  const { ready } = usePlants();
  // Wait for stored settings so the key field starts with the saved value.
  return ready ? <SettingsForm /> : null;
}

function KeyField({ saved, placeholder, onSave }: { saved: string; placeholder: string; onSave: (key: string) => void }) {
  const [key, setKey] = useState(saved);
  const dirty = key.trim() !== saved;
  return (
    <>
      <TextInput value={key} onChangeText={setKey} placeholder={placeholder} autoCapitalize="none" autoCorrect={false} secureTextEntry style={styles.input} />
      <Button title={dirty ? 'Save key' : saved ? 'Saved' : 'Save key'} disabled={!dirty} onPress={() => onSave(key.trim())} />
    </>
  );
}

function SettingsForm() {
  const { settings, updateSettings, plants } = usePlants();

  const hourLabel = (h: number) => `${((h + 11) % 12) + 1}:00 ${h < 12 ? 'AM' : 'PM'}`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SectionTitle>Plant identification</SectionTitle>
      <Card style={{ gap: space(3) }}>
        <Text style={styles.body}>
          {proxyEnabled
            ? 'Identification works out of the box (fair-use daily limit). Optional: add your own free Pl@ntNet key for your own 500/day. It stays on this device.'
            : 'HappyLeafy uses the free Pl@ntNet API (500 identifications/day, non-commercial). Sign up, create an API key, and paste it here. The key stays on this device.'}
        </Text>
        <Button title="Get a free key" icon="open-outline" variant="secondary" onPress={() => Linking.openURL('https://my.plantnet.org/')} />
        <KeyField saved={settings.plantNetApiKey} placeholder="Pl@ntNet API key" onSave={(k) => updateSettings({ plantNetApiKey: k })} />
      </Card>

      <SectionTitle>{proxyEnabled ? 'AI plant doctor' : 'AI plant doctor (optional)'}</SectionTitle>
      <Card style={{ gap: space(3) }}>
        <Text style={styles.body}>
          {proxyEnabled
            ? 'Powered by Google Gemini and ready to use (fair-use daily limit). Photos and notes you send to the AI go to Google; only send plant photos. Optional: use your own Gemini key instead.'
            : 'Adds a Google Gemini second opinion to Plant Doctor: it reads your photos plus watering, soil and light details and explains causes and fixes. Free key from Google AI Studio; no card needed. On the free tier Google may use what you send (photos and notes) to improve its models, so send only plant photos.'}
        </Text>
        <Button title="Get a free Gemini key" icon="open-outline" variant="secondary" onPress={() => Linking.openURL('https://aistudio.google.com/apikey')} />
        <KeyField saved={settings.geminiApiKey} placeholder="Gemini API key" onSave={(k) => updateSettings({ geminiApiKey: k })} />
      </Card>

      <SectionTitle>Seasons</SectionTitle>
      <Card style={{ gap: space(3) }}>
        <Text style={styles.body}>Watering adapts to the season: less often in winter, more in summer. Pick where you live so seasons line up.</Text>
        <View style={styles.chips}>
          <Chip label="Northern hemisphere" selected={settings.hemisphere === 'northern'} onPress={() => updateSettings({ hemisphere: 'northern' })} />
          <Chip label="Southern hemisphere" selected={settings.hemisphere === 'southern'} onPress={() => updateSettings({ hemisphere: 'southern' })} />
        </View>
      </Card>

      <SectionTitle>Outdoor plants & rain</SectionTitle>
      <WeatherPlace />

      <SectionTitle>Vacation mode</SectionTitle>
      <VacationSettings />

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
            <View style={{ gap: space(2) }}>
              <Text style={styles.label}>Style</Text>
              <View style={styles.chips}>
                <Chip label="Morning summary" selected={settings.reminderStyle !== 'each'} onPress={() => updateSettings({ reminderStyle: 'summary' })} />
                <Chip label="One per plant" selected={settings.reminderStyle === 'each'} onPress={() => updateSettings({ reminderStyle: 'each' })} />
              </View>
              <Text style={styles.muted}>
                {settings.reminderStyle === 'each'
                  ? 'A separate notification for each plant and task.'
                  : 'One notification a day, e.g. “🌿 3 plants need care today”, only on days something is due.'}
              </Text>
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

      <SectionTitle>Backup</SectionTitle>
      <BackupCard />

      <SectionTitle>About</SectionTitle>
      <Card>
        <Text style={styles.body}>HappyLeafy v1.0 · {plants.length} plants · all data stored on this device.</Text>
        <Button title="Replay welcome tour" variant="secondary" onPress={() => router.push('/onboarding')} style={{ marginTop: space(3) }} />
        <View style={[styles.row, { marginTop: space(3) }]}>
          <Button title="Help & support" icon="help-circle-outline" variant="secondary" style={{ flex: 1 }} onPress={() => Linking.openURL(LINKS.support)} />
          <Button title="Privacy" icon="shield-checkmark-outline" variant="secondary" style={{ flex: 1, marginLeft: space(2) }} onPress={() => Linking.openURL(LINKS.privacy)} />
        </View>
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: space(3), fontSize: 15, color: colors.text, backgroundColor: colors.bg },
});
