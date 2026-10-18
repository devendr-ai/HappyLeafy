import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card, Chip, PlantPhoto, SectionTitle, Stepper } from '@/components/ui';
import { DEFAULT_PROFILE, findCareProfile, searchCareProfiles } from '@/lib/careDb';
import { persistPhoto, pickPhoto } from '@/lib/photos';
import { addDays } from '@/lib/schedule';
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
  const { addPlant } = usePlants();
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
  const [lastWateredAgo, setLastWateredAgo] = useState(0);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const results = useMemo(() => searchCareProfiles(query).slice(0, 8), [query]);

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
      const ago = lastWateredAgo < 0 ? waterEvery : lastWateredAgo;
      const plant = await addPlant({
        nickname: nickname.trim() || commonName || 'My plant',
        species: species || undefined,
        commonName: commonName || undefined,
        photoUri: photo ? persistPhoto(photo) : undefined,
        location: location.trim() || undefined,
        waterEveryDays: waterEvery,
        fertilizeEveryDays: fertEvery,
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
            <Text style={styles.speciesNote}>{profile ? 'Care schedule set from our care guide.' : 'No care guide yet; using general houseplant defaults.'}</Text>
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

      <SectionTitle>Location (optional)</SectionTitle>
      <TextInput value={location} onChangeText={setLocation} placeholder="e.g. Living room, east window" style={styles.input} />

      <SectionTitle>Care schedule</SectionTitle>
      <Card style={{ gap: space(4) }}>
        <View style={styles.row}>
          <Text style={styles.label}>Water every</Text>
          <Stepper value={waterEvery} onChange={setWaterEvery} suffix="days" />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fertilise every</Text>
          <Stepper value={fertEvery} onChange={setFertEvery} max={180} suffix="days" />
        </View>
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
});
