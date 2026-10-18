import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, SectionTitle } from '@/components/ui';
import { adviceForDisease, SYMPTOMS } from '@/lib/doctor';
import { pickPhoto } from '@/lib/photos';
import { identifyDisease, type DiseaseMatch } from '@/lib/plantnet';
import { usePlants } from '@/lib/store';
import { colors, radius, space } from '@/lib/theme';

export default function DoctorScreen() {
  const [open, setOpen] = useState<string>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <PhotoDiagnosis />

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

function PhotoDiagnosis() {
  const { settings } = usePlants();
  const [photo, setPhoto] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [matches, setMatches] = useState<DiseaseMatch[]>();

  const choose = async (source: 'camera' | 'library') => {
    const uri = await pickPhoto(source);
    if (!uri) return;
    setPhoto(uri);
    setMatches(undefined);
    setError(undefined);
  };

  const run = async () => {
    if (!photo) return;
    setLoading(true);
    setError(undefined);
    try {
      setMatches((await identifyDisease(photo, settings.plantNetApiKey, 'leaf')).matches);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ gap: space(3) }}>
      <Text style={styles.photoTitle}>Diagnose from a photo</Text>
      <Text style={styles.body}>Photograph the damaged leaf up close, in good light.</Text>
      {photo && <Image source={{ uri: photo }} style={styles.photo} />}
      <View style={styles.row}>
        <Button title="Camera" icon="camera" variant="secondary" style={{ flex: 1 }} onPress={() => choose('camera')} />
        <Button title="Library" icon="images" variant="secondary" style={{ flex: 1 }} onPress={() => choose('library')} />
      </View>
      {!settings.plantNetApiKey ? (
        <Button title="Add Pl@ntNet key in Settings" variant="feed" onPress={() => router.push('/settings')} />
      ) : (
        <Button title="Diagnose" icon="medkit" onPress={run} loading={loading} disabled={!photo} />
      )}
      {error && <Text style={styles.error}>{error} You can still use the symptom list below.</Text>}

      {matches?.length === 0 && <Text style={styles.body}>No disease or pest recognised. If the plant looks unwell, try the symptom list below.</Text>}
      {matches?.map((m) => {
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
      {matches && matches.length > 0 && <Text style={styles.muted}>Photo diagnosis is a guide, not a certainty. Check the signs match before treating.</Text>}
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
  photoTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.md },
  row: { flexDirection: 'row', gap: space(3) },
  error: { color: colors.danger, fontSize: 14 },
  match: { paddingTop: space(3), borderTopWidth: 1, borderTopColor: colors.border, gap: space(1) },
  matchHeader: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
  score: { fontSize: 13, fontWeight: '700', color: colors.muted },
  link: { color: colors.primary, fontSize: 13, marginTop: space(1) },
});
