import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PotSetup, WaterIntervalHints } from '@/components/potSetup';
import { Button, Card, Empty, InfoRow, PlantPhoto, SectionTitle, Stepper } from '@/components/ui';
import { careForPlant, DEFAULT_PROFILE, hasExactProfile, isFamilyProfile, LIGHT_LABEL } from '@/lib/careDb';
import { aiCareProfile } from '@/lib/gemini';
import { dueLabel, daysUntil, nextFertilizeDate, nextWaterDate, plantWaterInterval } from '@/lib/schedule';
import { usePlants } from '@/lib/store';
import { colors, radius, space } from '@/lib/theme';
import type { CareEventType } from '@/lib/types';

const EVENT_META: Record<CareEventType, { label: string; icon: ComponentProps<typeof Ionicons>['name']; color: string }> = {
  water: { label: 'Watered', icon: 'water', color: colors.water },
  fertilize: { label: 'Fertilised', icon: 'flask', color: colors.feed },
  repot: { label: 'Repotted', icon: 'cube', color: colors.primary },
  prune: { label: 'Pruned', icon: 'cut', color: colors.primary },
  note: { label: 'Note', icon: 'document-text', color: colors.muted },
};

export default function PlantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plants, settings, logCare, updatePlant, removePlant, ready } = usePlants();
  const plant = plants.find((p) => p.id === id);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string>();
  if (!ready) return null;
  if (!plant) return <Empty icon="leaf-outline" title="Plant not found" body="It may have been deleted." />;

  const care = careForPlant(plant);
  const isAi = !!care && care === plant.aiCare;
  const canAskAi = !!settings.geminiApiKey && !!plant.species && !hasExactProfile(plant.species);
  const aiScheduleDiffers = !!plant.aiCare && (plant.aiCare.waterEveryDays !== plant.waterEveryDays || plant.aiCare.fertilizeEveryDays !== plant.fertilizeEveryDays);

  const fetchAiCare = async () => {
    setAiLoading(true);
    setAiError(undefined);
    try {
      await updatePlant(plant.id, { aiCare: await aiCareProfile(plant.species!, plant.commonName, settings.geminiApiKey) });
    } catch (e) {
      setAiError(e instanceof Error ? e.message : String(e));
    } finally {
      setAiLoading(false);
    }
  };
  const guide = care ?? DEFAULT_PROFILE;
  const ctx = { hemisphere: settings.hemisphere };
  const interval = plantWaterInterval(plant, ctx);
  const seasonHint = interval.adjustments.find((a) => a.key === 'season');
  const waterDays = daysUntil(nextWaterDate(plant, ctx));
  const fertDays = daysUntil(nextFertilizeDate(plant));

  const confirmDelete = () => {
    const doDelete = async () => {
      await removePlant(plant.id);
      router.back();
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete ${plant.nickname}?`)) doDelete();
      return;
    }
    Alert.alert(`Delete ${plant.nickname}?`, 'This removes the plant and its care history.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: doDelete },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: plant.nickname }} />
      <ScrollView contentContainerStyle={styles.container}>
        {plant.photoUri ? <Image source={{ uri: plant.photoUri }} style={styles.hero} /> : <PlantPhoto size={120} style={{ alignSelf: 'center' }} />}
        <Text style={styles.name}>{plant.nickname}</Text>
        {(plant.commonName || plant.species) && (
          <Text style={styles.species}>
            {plant.commonName}
            {plant.species && plant.commonName !== plant.species ? ` · ${plant.species}` : ''}
          </Text>
        )}
        {plant.location && <Text style={styles.location}>📍 {plant.location}</Text>}

        <View style={[styles.logRow, { marginTop: space(4) }]}>
          <Button title="Diagnose" icon="medkit" variant="secondary" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/doctor', params: { plantId: plant.id } })} />
          <Button title="Ask AI" icon="chatbubbles" variant="secondary" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/ask', params: { id: plant.id } })} />
        </View>

        <View style={styles.actions}>
          <Card style={styles.action}>
            <Ionicons name="water" size={22} color={colors.water} />
            <Text style={styles.actionTitle}>Water</Text>
            <Text style={[styles.actionDue, waterDays < 0 && { color: colors.danger }]}>{dueLabel(waterDays)}</Text>
            {seasonHint && <Text style={styles.actionHint}>{seasonHint.hint.split(':')[0]}</Text>}
            <Button title="Done" variant="water" onPress={() => logCare(plant.id, 'water')} style={styles.actionBtn} />
          </Card>
          <Card style={styles.action}>
            <Ionicons name="flask" size={22} color={colors.feed} />
            <Text style={styles.actionTitle}>Fertilise</Text>
            <Text style={[styles.actionDue, fertDays < 0 && { color: colors.danger }]}>{dueLabel(fertDays)}</Text>
            <Button title="Done" variant="feed" onPress={() => logCare(plant.id, 'fertilize')} style={styles.actionBtn} />
          </Card>
        </View>

        <SectionTitle>Schedule</SectionTitle>
        <Card style={{ gap: space(4) }}>
          <View style={styles.row}>
            <Text style={styles.label}>Water every</Text>
            <Stepper value={plant.waterEveryDays} suffix="days" onChange={(n) => updatePlant(plant.id, { waterEveryDays: n })} />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fertilise every</Text>
            <Stepper value={plant.fertilizeEveryDays} max={180} suffix="days" onChange={(n) => updatePlant(plant.id, { fertilizeEveryDays: n })} />
          </View>
          <WaterIntervalHints {...interval} />
        </Card>

        <SectionTitle>Pot & spot</SectionTitle>
        <Card>
          <PotSetup value={plant} onChange={(patch) => updatePlant(plant.id, patch)} />
        </Card>

        <SectionTitle>
          Care guide{!care ? ' (general)' : isAi ? ' (AI-written)' : isFamilyProfile(care) ? ` (based on its family, ${care.key})` : ''}
        </SectionTitle>
        <Card>
          <InfoRow icon="sunny" label="Light" value={LIGHT_LABEL[guide.light]} />
          <InfoRow icon="cloud" label="Humidity" value={guide.humidity[0].toUpperCase() + guide.humidity.slice(1)} />
          <InfoRow icon="thermometer" label="Temperature" value={`${guide.tempC[0]}–${guide.tempC[1]} °C`} />
          <InfoRow icon="layers" label="Soil" value={guide.soil} />
          <InfoRow icon="paw" label="Pets" value={guide.toxicToPets ? 'Toxic to cats & dogs' : 'Pet-safe'} />
          <InfoRow icon="speedometer" label="Difficulty" value={guide.difficulty[0].toUpperCase() + guide.difficulty.slice(1)} />
          <View style={styles.tips}>
            {guide.tips.map((t) => (
              <Text key={t} style={styles.tip}>
                • {t}
              </Text>
            ))}
          </View>
          {canAskAi && (
            <Button
              title={plant.aiCare ? 'Refresh AI care guide' : `Get an AI care guide for ${plant.commonName ?? plant.species}`}
              icon="sparkles"
              variant="secondary"
              loading={aiLoading}
              onPress={fetchAiCare}
              style={{ marginTop: space(3) }}
            />
          )}
          {aiScheduleDiffers && (
            <Button
              title={`Use AI schedule: water every ${plant.aiCare!.waterEveryDays} d, feed every ${plant.aiCare!.fertilizeEveryDays} d`}
              variant="water"
              onPress={() => updatePlant(plant.id, { waterEveryDays: plant.aiCare!.waterEveryDays, fertilizeEveryDays: plant.aiCare!.fertilizeEveryDays })}
              style={{ marginTop: space(2) }}
            />
          )}
          {aiError && <Text style={styles.error}>{aiError}</Text>}
          {isAi && <Text style={styles.muted}>Written by AI for this species; it can be wrong.</Text>}
        </Card>

        <SectionTitle>Log</SectionTitle>
        <View style={styles.logRow}>
          <Button title="Repotted" icon="cube" variant="secondary" style={{ flex: 1 }} onPress={() => logCare(plant.id, 'repot')} />
          <Button title="Pruned" icon="cut" variant="secondary" style={{ flex: 1 }} onPress={() => logCare(plant.id, 'prune')} />
        </View>

        <SectionTitle>History</SectionTitle>
        <Card>
          {plant.history.length === 0 && <Text style={styles.muted}>No care logged yet.</Text>}
          {plant.history.slice(0, 30).map((e) => {
            const m = EVENT_META[e.type];
            return (
              <View key={e.id} style={styles.historyRow}>
                <Ionicons name={m.icon} size={16} color={m.color} />
                <Text style={styles.historyLabel}>{e.note ?? m.label}</Text>
                <Text style={styles.muted}>{new Date(e.at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
              </View>
            );
          })}
        </Card>

        <Button title="Delete plant" icon="trash" variant="danger" onPress={confirmDelete} style={{ marginTop: space(8) }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: space(4), paddingBottom: space(12) },
  hero: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.lg },
  name: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: space(4) },
  species: { fontSize: 15, color: colors.muted, marginTop: 2 },
  location: { fontSize: 14, color: colors.muted, marginTop: space(1) },
  actions: { flexDirection: 'row', gap: space(3), marginTop: space(4) },
  action: { flex: 1, alignItems: 'flex-start', gap: 2 },
  actionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: space(1) },
  actionDue: { fontSize: 14, color: colors.muted },
  actionHint: { fontSize: 12, color: colors.water },
  actionBtn: { alignSelf: 'stretch', marginTop: space(3), paddingVertical: space(2) },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 16, color: colors.text },
  tips: { marginTop: space(3), gap: space(2) },
  tip: { fontSize: 14, color: colors.text, lineHeight: 20 },
  logRow: { flexDirection: 'row', gap: space(3) },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: space(2), paddingVertical: space(2) },
  historyLabel: { flex: 1, fontSize: 15, color: colors.text },
  muted: { color: colors.muted, fontSize: 14 },
  error: { color: colors.danger, fontSize: 14, marginTop: space(2) },
});
