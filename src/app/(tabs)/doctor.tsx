import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card, Chip, SectionTitle } from '@/components/ui';
import { LIGHT_LABEL } from '@/lib/careDb';
import { useConsent } from '@/lib/consent';
import { adviceForDisease, SYMPTOMS } from '@/lib/doctor';
import { diagnoseWithGemini, type AiDiagnosis, type DiagnosisContext } from '@/lib/gemini';
import { pickPhoto } from '@/lib/photos';
import { identifyDisease, type DiseaseMatch, type Organ } from '@/lib/plantnet';
import { canUseAi, canUsePlantNet } from '@/lib/proxy';
import { daysUntil, plantWaterInterval } from '@/lib/schedule';
import { newId, usePlants } from '@/lib/store';
import { colors, radius, space } from '@/lib/theme';
import type { Hemisphere, Plant } from '@/lib/types';

export default function DoctorScreen() {
  const [open, setOpen] = useState<string>();
  const { plantId: fromPlant } = useLocalSearchParams<{ plantId?: string }>();

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Remount when opened for a different plant so stale photos and picks reset. */}
      <PhotoDiagnosis key={fromPlant ?? 'none'} fromPlant={fromPlant} />

      <SectionTitle>Or pick a symptom</SectionTitle>
      {SYMPTOMS.map((s) => {
        const expanded = open === s.id;
        return (
          <Card key={s.id} style={styles.card}>
            <Pressable style={styles.header} onPress={() => setOpen(expanded ? undefined : s.id)}>
              <Text style={styles.title}>{s.title}</Text>
              <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.muted} />
            </Pressable>
            {expanded &&
              s.causes.map((c) => (
                <View key={c.cause} style={styles.cause}>
                  <Text style={styles.causeTitle}>{c.cause}</Text>
                  <Text style={styles.label}>
                    Signs: <Text style={styles.body}>{c.signs}</Text>
                  </Text>
                  <Text style={styles.label}>
                    Fix: <Text style={styles.body}>{c.fix}</Text>
                  </Text>
                </View>
              ))}
          </Card>
        );
      })}
    </ScrollView>
  );
}

type Part = 'leaf-top' | 'leaf-under' | 'stem' | 'soil';

const PARTS: { value: Part; label: string; organ: Organ; describe: string }[] = [
  { value: 'leaf-top', label: 'Leaf', organ: 'leaf', describe: 'top of a leaf' },
  { value: 'leaf-under', label: 'Underside', organ: 'leaf', describe: 'underside of a leaf' },
  { value: 'stem', label: 'Stem', organ: 'auto', describe: 'stem' },
  { value: 'soil', label: 'Soil', organ: 'auto', describe: 'soil surface' },
];

const MAX_PHOTOS = 3;
const DEFAULT_PARTS: Part[] = ['leaf-top', 'leaf-under', 'stem'];
type Soil = NonNullable<DiagnosisContext['soil']>;

type Shot = { uri: string; part: Part };

function buildContext(shots: Shot[], plant: Plant | undefined, soil: Soil | undefined, note: string, hemisphere: Hemisphere): DiagnosisContext {
  const ctx: DiagnosisContext = {
    photoParts: shots.map((s) => PARTS.find((p) => p.value === s.part)!.describe),
    soil,
    note: note.trim() || undefined,
  };
  if (plant) {
    ctx.plantName = plant.commonName ?? plant.nickname;
    ctx.species = plant.species;
    if (plant.lastWatered) ctx.daysSinceWatered = -daysUntil(new Date(plant.lastWatered));
    ctx.wateringIntervalDays = plantWaterInterval(plant, { hemisphere }).days;
    if (plant.lightAtLocation) ctx.light = LIGHT_LABEL[plant.lightAtLocation];
    ctx.potMaterial = plant.potMaterial;
    ctx.potSize = plant.potSize;
    ctx.drainage = plant.drainage;
    ctx.location = plant.location;
  }
  return ctx;
}

function PhotoDiagnosis({ fromPlant }: { fromPlant?: string }) {
  const { settings, plants, logCare, updatePlant } = usePlants();
  const consent = useConsent();
  // Opened from a plant's page: that plant is preselected until the user picks another (null = none).
  const [shots, setShots] = useState<Shot[]>([]);
  const [picked, setPicked] = useState<string | null>();
  const plantId = picked === undefined ? fromPlant : (picked ?? undefined);
  const setPlantId = (id: string | undefined) => setPicked(id ?? null);
  const [soil, setSoil] = useState<Soil>();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [matches, setMatches] = useState<DiseaseMatch[]>();
  const [ai, setAi] = useState<AiDiagnosis>();
  const [saved, setSaved] = useState(false);

  const plant = plants.find((p) => p.id === plantId);
  const hasPlantNet = canUsePlantNet(settings);
  const hasGemini = canUseAi(settings);

  const reset = () => {
    setMatches(undefined);
    setAi(undefined);
    setErrors([]);
    setSaved(false);
  };

  const add = async (source: 'camera' | 'library') => {
    const uri = await pickPhoto(source);
    if (!uri) return;
    setShots((s) => [...s, { uri, part: DEFAULT_PARTS[s.length] ?? 'leaf-top' }].slice(0, MAX_PHOTOS));
    reset();
  };

  const setPart = (i: number, part: Part) => {
    setShots((s) => s.map((shot, j) => (j === i ? { ...shot, part } : shot)));
    reset();
  };

  const remove = (i: number) => {
    setShots((s) => s.filter((_, j) => j !== i));
    reset();
  };

  const run = async () => {
    if (shots.length === 0) return;
    // First use of each service shows what gets sent; a declined one is skipped.
    const usePlantNet = hasPlantNet && (await consent('plantnet'));
    const useAi = hasGemini && (await consent('ai'));
    if (!usePlantNet && !useAi) return;
    setLoading(true);
    reset();
    const errs: string[] = [];
    let found: DiseaseMatch[] | undefined;
    if (usePlantNet) {
      try {
        const photos = shots.map((s) => ({ uri: s.uri, organ: PARTS.find((p) => p.value === s.part)!.organ }));
        found = (await identifyDisease(photos, settings.plantNetApiKey)).matches;
        setMatches(found);
      } catch (e) {
        errs.push(`Pl@ntNet: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    if (useAi) {
      try {
        const ctx = buildContext(shots, plant, soil, note, settings.hemisphere);
        ctx.plantNetMatches = found?.slice(0, 3).map((m) => ({ name: m.name, score: m.score }));
        setAi(await diagnoseWithGemini(shots.map((s) => s.uri), ctx, settings.geminiApiKey));
      } catch (e) {
        errs.push(`AI doctor: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    setErrors(errs);
    setLoading(false);
  };

  const saveToHistory = async () => {
    if (!plant || !ai) return;
    const top = ai.causes[0];
    const answer = [ai.summary, ...ai.causes.map((c) => `• ${c.cause} (${c.likelihood}): ${c.fix}`), ...ai.nextSteps.map((s) => `→ ${s}`)].join('\n');
    await updatePlant(plant.id, {
      savedAdvice: [{ id: newId(), at: new Date().toISOString(), source: 'diagnosis', question: top ? `Diagnosis: ${top.cause}` : 'Diagnosis', answer }, ...(plant.savedAdvice ?? [])],
    });
    await logCare(plant.id, 'note', `Diagnosis saved: ${top ? top.cause : 'see saved advice'}`);
    setSaved(true);
  };

  return (
    <Card style={{ gap: space(3) }}>
      <Text style={styles.photoTitle}>Diagnose {plant ? plant.nickname : 'from photos'}</Text>
      <Text style={styles.body}>
        Add up to {MAX_PHOTOS} close-ups of the problem, e.g. the leaf top, its underside, and the stem or soil. Good light, one plant.
      </Text>

      {shots.map((shot, i) => (
        <View key={i} style={styles.shot}>
          <Image source={{ uri: shot.uri }} style={styles.thumb} />
          <View style={{ flex: 1, gap: space(2) }}>
            <View style={styles.chips}>
              {PARTS.map((p) => (
                <Chip key={p.value} label={p.label} selected={shot.part === p.value} onPress={() => setPart(i, p.value)} />
              ))}
            </View>
            <Pressable onPress={() => remove(i)} hitSlop={8}>
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          </View>
        </View>
      ))}

      {shots.length < MAX_PHOTOS && (
        <View style={styles.row}>
          <Button title={shots.length ? 'Add photo' : 'Camera'} icon="camera" variant="secondary" style={{ flex: 1 }} onPress={() => add('camera')} />
          <Button title="Library" icon="images" variant="secondary" style={{ flex: 1 }} onPress={() => add('library')} />
        </View>
      )}

      {hasGemini && (
        <>
          <Text style={styles.subhead}>Which plant? (optional)</Text>
          <View style={styles.chips}>
            {plants.map((p) => (
              <Chip key={p.id} label={p.nickname} selected={plantId === p.id} onPress={() => setPlantId(plantId === p.id ? undefined : p.id)} />
            ))}
            {plants.length === 0 && <Text style={styles.muted}>Add plants to give the AI their watering history.</Text>}
          </View>
          <Text style={styles.subhead}>Soil right now (optional)</Text>
          <View style={styles.chips}>
            {(['dry', 'damp', 'wet'] as Soil[]).map((s) => (
              <Chip key={s} label={s[0].toUpperCase() + s.slice(1)} selected={soil === s} onPress={() => setSoil(soil === s ? undefined : s)} />
            ))}
          </View>
          <TextInput value={note} onChangeText={setNote} placeholder="Anything else? e.g. moved it last week" style={styles.input} multiline />
        </>
      )}

      {!hasPlantNet && !hasGemini ? (
        <Button title="Add a Pl@ntNet or Gemini key in Settings" variant="feed" onPress={() => router.push('/settings')} />
      ) : (
        <Button
          title={shots.length > 1 ? `Diagnose (${shots.length} photos)` : 'Diagnose'}
          icon="medkit"
          onPress={run}
          loading={loading}
          disabled={shots.length === 0}
        />
      )}
      {!hasGemini && hasPlantNet && (
        <Pressable onPress={() => router.push('/settings')}>
          <Text style={styles.link}>Add a free Gemini key for an AI explanation of the cause and fix</Text>
        </Pressable>
      )}
      {errors.map((e) => (
        <Text key={e} style={styles.error}>
          {e}
        </Text>
      ))}

      {ai && (
        <View style={styles.aiBox}>
          <View style={styles.matchHeader}>
            <Ionicons name="sparkles" size={18} color={colors.primary} />
            <Text style={styles.aiTitle}>AI doctor</Text>
            {ai.urgent && <Text style={styles.urgent}>Act soon</Text>}
          </View>
          <Text style={styles.body}>{ai.summary}</Text>
          {ai.causes.map((c) => (
            <View key={c.cause} style={styles.match}>
              <View style={styles.matchHeader}>
                <Text style={styles.causeTitle}>{c.cause}</Text>
                <Text style={styles.score}>{c.likelihood} likelihood</Text>
              </View>
              <Text style={styles.label}>
                Why: <Text style={styles.body}>{c.why}</Text>
              </Text>
              <Text style={styles.label}>
                Fix: <Text style={styles.body}>{c.fix}</Text>
              </Text>
            </View>
          ))}
          {ai.nextSteps.length > 0 && (
            <View style={styles.match}>
              <Text style={styles.label}>Next steps</Text>
              {ai.nextSteps.map((s) => (
                <Text key={s} style={styles.body}>
                  • {s}
                </Text>
              ))}
            </View>
          )}
          {plant && (
            <Button
              title={saved ? `Saved to ${plant.nickname}` : `Save advice to ${plant.nickname}`}
              icon={saved ? 'checkmark' : 'bookmark'}
              variant="secondary"
              disabled={saved}
              onPress={saveToHistory}
            />
          )}
          <Text style={styles.muted}>AI advice can be wrong. Check the signs match before treating.</Text>
        </View>
      )}

      {matches && (
        <>
          <Text style={styles.subhead}>Pl@ntNet matches</Text>
          {matches.length === 0 && <Text style={styles.body}>No disease or pest recognised. If the plant looks unwell, try the symptom list below.</Text>}
          {matches.map((m) => {
            const advice = adviceForDisease(m.name);
            return (
              <View key={m.code} style={styles.match}>
                <View style={styles.matchHeader}>
                  <Text style={styles.causeTitle}>{m.name}</Text>
                  <Text style={styles.score}>{Math.round(m.score * 100)}%</Text>
                </View>
                {advice && (
                  <Text style={styles.label}>
                    {advice.title}: <Text style={styles.body}>{advice.fix}</Text>
                  </Text>
                )}
                <Pressable onPress={() => Linking.openURL(`https://gd.eppo.int/taxon/${encodeURIComponent(m.code)}`)}>
                  <Text style={styles.link}>Learn more</Text>
                </Pressable>
              </View>
            );
          })}
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { padding: space(4), paddingBottom: space(12) },
  card: { marginBottom: space(2), paddingVertical: space(3) },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space(2) },
  title: { fontSize: 16, fontWeight: '600', color: colors.text, flex: 1 },
  cause: { marginTop: space(3), paddingTop: space(3), borderTopWidth: 1, borderTopColor: colors.border, gap: space(1) },
  causeTitle: { fontSize: 15, fontWeight: '700', color: colors.primary, flex: 1 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, lineHeight: 20 },
  body: { fontSize: 14, fontWeight: '400', color: colors.text, lineHeight: 20 },
  muted: { fontSize: 13, color: colors.muted },
  subhead: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: space(1) },
  photoTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  shot: { flexDirection: 'row', gap: space(3), alignItems: 'flex-start' },
  thumb: { width: 88, height: 88, borderRadius: radius.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  remove: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: space(3), fontSize: 15, color: colors.text, backgroundColor: colors.bg, minHeight: 44 },
  row: { flexDirection: 'row', gap: space(3) },
  error: { color: colors.danger, fontSize: 14 },
  aiBox: { backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: space(3), gap: space(2) },
  aiTitle: { fontSize: 16, fontWeight: '700', color: colors.primary, flex: 1 },
  urgent: { fontSize: 12, fontWeight: '700', color: colors.danger, backgroundColor: colors.dangerSoft, paddingHorizontal: space(2), paddingVertical: 2, borderRadius: 999, overflow: 'hidden' },
  match: { paddingTop: space(3), borderTopWidth: 1, borderTopColor: colors.border, gap: space(1) },
  matchHeader: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
  score: { fontSize: 13, fontWeight: '700', color: colors.muted },
  link: { color: colors.primary, fontSize: 13, marginTop: space(1) },
});
