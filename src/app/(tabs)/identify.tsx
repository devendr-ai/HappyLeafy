import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Chip, SectionTitle } from '@/components/ui';
import { findCareProfile } from '@/lib/careDb';
import { pickPhoto } from '@/lib/photos';
import { useConsent } from '@/lib/consent';
import { identifyPlant, type IdentifyMatch, type Organ } from '@/lib/plantnet';
import { canUsePlantNet } from '@/lib/proxy';
import { usePlants } from '@/lib/store';
import { colors, radius, space } from '@/lib/theme';

const ORGANS: { value: Organ; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'leaf', label: 'Leaf' },
  { value: 'flower', label: 'Flower' },
  { value: 'fruit', label: 'Fruit' },
  { value: 'bark', label: 'Bark' },
];

export default function IdentifyScreen() {
  const { settings } = usePlants();
  const consent = useConsent();
  const [photo, setPhoto] = useState<string>();
  const [organ, setOrgan] = useState<Organ>('auto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [matches, setMatches] = useState<IdentifyMatch[]>();
  const [remaining, setRemaining] = useState<number>();

  const choose = async (source: 'camera' | 'library') => {
    const uri = await pickPhoto(source);
    if (!uri) return;
    setPhoto(uri);
    setMatches(undefined);
    setError(undefined);
  };

  const run = async () => {
    if (!photo) return;
    if (!(await consent('plantnet'))) return;
    setLoading(true);
    setError(undefined);
    try {
      const res = await identifyPlant(photo, settings.plantNetApiKey, organ);
      setMatches(res.matches);
      setRemaining(res.remaining);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const addMatch = (m: IdentifyMatch) => {
    router.push({
      pathname: '/add',
      params: { scientificName: m.scientificName, commonName: m.commonNames[0] ?? '', family: m.family, photoUri: photo ?? '' },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!canUsePlantNet(settings) && (
        <Card style={styles.notice}>
          <Text style={styles.noticeText}>
            Identification uses the free Pl@ntNet API (500 IDs/day). Create a free key at my.plantnet.org, then paste it in Settings.
          </Text>
          <Button title="Open Settings" variant="secondary" onPress={() => router.push('/settings')} />
        </Card>
      )}

      {photo ? (
        <Image source={{ uri: photo }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.photoEmpty]}>
          <Text style={styles.photoHint}>Take a clear photo of one leaf or flower, filling the frame.</Text>
        </View>
      )}

      <View style={styles.row}>
        <Button title="Camera" icon="camera" variant="secondary" style={{ flex: 1 }} onPress={() => choose('camera')} />
        <Button title="Library" icon="images" variant="secondary" style={{ flex: 1 }} onPress={() => choose('library')} />
      </View>

      <SectionTitle>What is in the photo?</SectionTitle>
      <View style={styles.chips}>
        {ORGANS.map((o) => (
          <Chip key={o.value} label={o.label} selected={organ === o.value} onPress={() => setOrgan(o.value)} />
        ))}
      </View>

      <Button title="Identify plant" icon="sparkles" onPress={run} loading={loading} disabled={!photo} style={{ marginTop: space(4) }} />

      {error && <Text style={styles.error}>{error}</Text>}

      {matches && (
        <>
          <SectionTitle>Best matches</SectionTitle>
          {matches.length === 0 && <Text style={styles.muted}>No match. Try a closer photo of a single leaf or flower.</Text>}
          {matches.map((m) => {
            const care = findCareProfile(m.scientificName, m.family);
            return (
              <Card key={m.scientificName} style={styles.match}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.matchName}>{m.commonNames[0] ?? care?.commonName ?? m.scientificName}</Text>
                  <Text style={styles.matchSci}>{m.scientificName}</Text>
                  <View style={styles.meta}>
                    <Text style={[styles.badge, { backgroundColor: confidenceColor(m.score) }]}>{Math.round(m.score * 100)}% match</Text>
                    {care && <Text style={[styles.badge, styles.careBadge]}>Care guide ✓</Text>}
                  </View>
                  {m.gbifId && (
                    <Pressable onPress={() => Linking.openURL(`https://www.gbif.org/species/${m.gbifId}`)}>
                      <Text style={styles.link}>More about this species</Text>
                    </Pressable>
                  )}
                </View>
                <Button title="Add" icon="add" onPress={() => addMatch(m)} />
              </Card>
            );
          })}
          {remaining !== undefined && <Text style={styles.muted}>{remaining} free identifications left today.</Text>}
        </>
      )}
    </ScrollView>
  );
}

function confidenceColor(score: number) {
  if (score >= 0.5) return colors.primarySoft;
  if (score >= 0.2) return colors.feedSoft;
  return colors.dangerSoft;
}

const styles = StyleSheet.create({
  container: { padding: space(4), paddingBottom: space(12) },
  notice: { gap: space(3), marginBottom: space(4), backgroundColor: colors.feedSoft, borderColor: colors.feedSoft },
  noticeText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  photo: { width: '100%', aspectRatio: 1, borderRadius: radius.lg, marginBottom: space(3) },
  photoEmpty: { backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', padding: space(8) },
  photoHint: { color: colors.primary, textAlign: 'center', fontSize: 15 },
  row: { flexDirection: 'row', gap: space(3) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  error: { color: colors.danger, marginTop: space(3), fontSize: 14 },
  muted: { color: colors.muted, fontSize: 14, marginTop: space(2) },
  match: { flexDirection: 'row', alignItems: 'center', gap: space(3), marginBottom: space(2) },
  matchName: { fontSize: 17, fontWeight: '700', color: colors.text },
  matchSci: { fontSize: 14, fontStyle: 'italic', color: colors.muted, marginTop: 2 },
  meta: { flexDirection: 'row', gap: space(2), marginTop: space(2), flexWrap: 'wrap' },
  badge: { fontSize: 12, fontWeight: '600', color: colors.text, paddingHorizontal: space(2), paddingVertical: 2, borderRadius: 999, overflow: 'hidden' },
  careBadge: { backgroundColor: colors.waterSoft, color: colors.water },
  link: { color: colors.primary, fontSize: 13, marginTop: space(2) },
});
