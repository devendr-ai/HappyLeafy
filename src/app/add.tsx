import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { PotSetup, WaterIntervalHints, type PotDetails } from '@/components/potSetup';
import { RoomPicker } from '@/components/roomPicker';
import { Button, Card, Chip, PlantPhoto, SectionTitle, Stepper } from '@/components/ui';
import { DEFAULT_PROFILE, findCareProfile, hasExactProfile, searchCareProfiles } from '@/lib/careDb';
import { aiCareProfile } from '@/lib/gemini';
import { persistPhoto, pickPhoto } from '@/lib/photos';
import { addDays, plantWaterInterval } from '@/lib/schedule';
import { usePlants } from '@/lib/store';
import { colors, radius, space } from '@/lib/theme';
import type { CareProfile } from '@/lib/types';

const LAST_WATERED = [
  { label: 'Today', days: 0 },
  { label: 'Yesterday', days: 1 },
  { label: '3 days ago', days: 3 },
  { label: 'A week ago', days: 7 },
  { label: 'Not sure', days: -1 },
];

export default function AddPlantScreen() {
  const params = useLocalSearchParams<{ scientificName?: string; commonName?: string; family?: string; photoUri?: string }>();
  const { addPlant, settings } = usePlants();
  const identified = !!params.scientificName;
  const initialProfile = findCareProfile(params.scientificName, params.family);

  const [profile, setProfile] = useState<CareProfile | undefined>(initialProfile);
  const [species, setSpecies] = useState(params.scientificName ?? '');
  const [commonName, setCommonName] = useState(params.commonName || initialProfile?.commonName || '');
  const [nickname, setNickname] = useState(params.commonName || initialProfile?.commonName || '');
  const [photo, setPhoto] = useState(params.photoUri || undefined);
  const [location, setLocation] = useState('');
  const [waterEvery, setWaterEvery] = useState((initialProfile ?? DEFAULT_PROFILE).waterEveryDays);
  const [fertEvery, setFertEvery] = useState((initialProfile ?? DEFAULT_PROFILE).fertilizeEveryDays);
  const [pot, setPot] = useState<PotDetails>({});
  const [lastWateredAgo, setLastWateredAgo] = useState(0);
  const [customize, setCustomize] = useState(false);
  const [aiCare, setAiCare] = useState<CareProfile>();
  const [aiFailed, setAiFailed] = useState(false);

  // Identified species missing from the bundled guide: ask Gemini once for a species-specific profile.
  const wantsAi = identified && !hasExactProfile(params.scientificName) && !!settings.geminiApiKey;
  const aiLoading = wantsAi && !aiCare && !aiFailed;
  useEffect(() => {
    if (!wantsAi || !params.scientificName) return;
    let cancelled = false;
    aiCareProfile(params.scientificName, params.commonName || undefined, settings.geminiApiKey)
      .then((p) => {
        if (cancelled) return;
        setAiCare(p);
        setProfile(p);
        setCommonName((c) => c || p.commonName);
        setNickname((n) => n || p.commonName);
        setWaterEvery(p.waterEveryDays);
        setFertEvery(p.fertilizeEveryDays);
      })
      .catch(() => !cancelled && setAiFailed(true)); // keep the family/general fallback
    return () => {
      cancelled = true;
    };
  }, [wantsAi, params.scientificName, params.commonName, settings.geminiApiKey]);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const results = useMemo(() => searchCareProfiles(query).slice(0, 8), [query]);
  const recommended = profile ?? DEFAULT_PROFILE;
  const isRecommended = waterEvery === recommended.waterEveryDays && fertEvery === recommended.fertilizeEveryDays;
  const interval = plantWaterInterval(
    { id: '', nickname: '', createdAt: '', history: [], species, family: params.family, aiCare, waterEveryDays: waterEvery, fertilizeEveryDays: fertEvery, ...pot },
    { hemisphere: settings.hemisphere },
  );

  const chooseProfile = (p: CareProfile) => {
    setProfile(p);
    setSpecies(p.key);
    setCommonName(p.commonName);
    if (!nickname) setNickname(p.commonName);
    setWaterEvery(p.waterEveryDays);
    setFertEvery(p.fertilizeEveryDays);
    setQuery('');
  };

  const save = async () => {
    setSaving(true);
    try {
      const now = new Date();
      // "Not sure" = treat as due today.
      const ago = lastWateredAgo < 0 ? interval.days : lastWateredAgo;
      const plant = await addPlant({
        nickname: nickname.trim() || commonName || 'My plant',
        species: species || undefined,
        family: identified ? params.family || undefined : undefined,
        aiCare,
        commonName: commonName || undefined,
        photoUri: photo ? persistPhoto(photo) : undefined,
        location: location.trim() || undefined,
        waterEveryDays: waterEvery,
        fertilizeEveryDays: fertEvery,
        ...pot,
        lastWatered: addDays(now, -ago).toISOString(),
        lastFertilized: now.toISOString(),
      });
      router.dismissTo(`/plant/${plant.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.photoRow}>
        <PlantPhoto uri={photo} size={96} />
        <View style={{ flex: 1, gap: space(2) }}>
          <Button title="Take photo" icon="camera" variant="secondary" onPress={async () => setPhoto((await pickPhoto('camera')) ?? photo)} />
          <Button title="From library" icon="images" variant="secondary" onPress={async () => setPhoto((await pickPhoto('library')) ?? photo)} />
        </View>
      </View>

      <SectionTitle>Name</SectionTitle>
      <TextInput value={nickname} onChangeText={setNickname} placeholder="e.g. Monty the Monstera" style={styles.input} />

      <SectionTitle>Species</SectionTitle>
      {identified || profile ? (
        <Card style={styles.speciesCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.speciesName}>{commonName || species}</Text>
            {!!species && <Text style={styles.speciesSci}>{species}</Text>}
            <Text style={styles.speciesNote}>
              {aiLoading ? 'Writing a care guide for this species with AI…' : aiCare ? 'Care schedule set from an AI-written guide for this species.' : profile ? 'Care schedule set from our care guide.' : 'No care guide yet; using general houseplant defaults.'}
            </Text>
          </View>
          {!identified && (
            <Pressable onPress={() => setProfile(undefined)}>
              <Text style={styles.link}>Change</Text>
            </Pressable>
          )}
        </Card>
      ) : (
        <>
          <TextInput value={query} onChangeText={setQuery} placeholder="Search e.g. pothos, monstera, snake plant" style={styles.input} autoCorrect={false} />
          <View style={styles.results}>
            {results.map((p) => (
              <Chip key={p.key} label={`${p.commonName} (${p.key})`} onPress={() => chooseProfile(p)} />
            ))}
          </View>
        </>
      )}

      <SectionTitle>Room (optional)</SectionTitle>
      <RoomPicker value={location || undefined} onChange={(r) => setLocation(r ?? '')} live />

      <SectionTitle>Care schedule</SectionTitle>
      <Card style={{ gap: space(4) }}>
        {customize ? (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>Water every</Text>
              <Stepper value={waterEvery} onChange={setWaterEvery} suffix="days" />
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Fertilise every</Text>
              <Stepper value={fertEvery} onChange={setFertEvery} max={180} suffix="days" />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.recommended}>
              💧 Water every {interval.days} days{'\n'}🌱 Fertilise every {fertEvery} days
            </Text>
            <Text style={styles.speciesNote}>
              {aiCare ? `Recommended for ${aiCare.commonName} (AI-written guide).` : profile ? `Recommended for ${profile.commonName} from our care guide.` : 'Recommended general houseplant schedule.'} Set automatically; no need to change it.
            </Text>
          </>
        )}
        {customize ? (
          <WaterIntervalHints {...interval} />
        ) : (
          interval.adjustments.map((adj) => (
            <Text key={adj.key} style={styles.hint}>
              • {adj.hint}
            </Text>
          ))
        )}
        <View style={styles.row}>
          <Pressable onPress={() => setCustomize(!customize)}>
            <Text style={styles.link}>{customize ? 'Done' : 'Customize'}</Text>
          </Pressable>
          {!isRecommended && (
            <Pressable
              onPress={() => {
                setWaterEvery(recommended.waterEveryDays);
                setFertEvery(recommended.fertilizeEveryDays);
              }}
            >
              <Text style={styles.link}>Reset to recommended</Text>
            </Pressable>
          )}
        </View>
      </Card>

      <SectionTitle>Pot & spot (optional)</SectionTitle>
      <Card>
        <PotSetup value={pot} onChange={(patch) => setPot((p) => ({ ...p, ...patch }))} />
      </Card>

      <SectionTitle>Last watered</SectionTitle>
      <View style={styles.results}>
        {LAST_WATERED.map((o) => (
          <Chip key={o.label} label={o.label} selected={lastWateredAgo === o.days} onPress={() => setLastWateredAgo(o.days)} />
        ))}
      </View>

      <Button title="Save plant" icon="checkmark" onPress={save} loading={saving} style={{ marginTop: space(6) }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space(4), paddingBottom: space(12) },
  photoRow: { flexDirection: 'row', gap: space(4), alignItems: 'center' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: space(3), fontSize: 16, color: colors.text, backgroundColor: colors.card },
  speciesCard: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
  speciesName: { fontSize: 17, fontWeight: '700', color: colors.text },
  speciesSci: { fontSize: 14, fontStyle: 'italic', color: colors.muted },
  speciesNote: { fontSize: 13, color: colors.primary, marginTop: space(1) },
  link: { color: colors.primary, fontWeight: '600' },
  results: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2), marginTop: space(2) },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 16, color: colors.text },
  hint: { fontSize: 13, color: colors.muted },
  recommended: { fontSize: 17, fontWeight: '600', color: colors.text, lineHeight: 26 },
});
