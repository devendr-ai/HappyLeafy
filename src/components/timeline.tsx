import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card } from '@/components/ui';
import { deletePhoto, persistPhoto, pickPhoto } from '@/lib/photos';
import { newId, usePlants } from '@/lib/store';
import { colors, radius, space } from '@/lib/theme';
import type { Plant } from '@/lib/types';

const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

/** Progress photos for one plant, newest first, with add / set-as-cover / remove. */
export function Timeline({ plant }: { plant: Plant }) {
  const { updatePlant } = usePlants();
  const [selected, setSelected] = useState<string>();
  const entries = plant.timeline ?? [];
  const shown = entries.find((e) => e.id === selected);

  const add = async (source: 'camera' | 'library') => {
    const uri = await pickPhoto(source);
    if (!uri) return;
    const entry = { id: newId(), uri: persistPhoto(uri), at: new Date().toISOString() };
    // The newest progress photo also becomes the cover.
    await updatePlant(plant.id, { timeline: [entry, ...entries], photoUri: entry.uri });
  };

  const remove = async (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    const rest = entries.filter((e) => e.id !== id);
    const coverGone = plant.photoUri === entry.uri;
    await updatePlant(plant.id, { timeline: rest, ...(coverGone ? { photoUri: rest[0]?.uri } : {}) });
    deletePhoto(entry.uri);
    setSelected(undefined);
  };

  return (
    <Card style={{ gap: space(3) }}>
      {entries.length === 0 ? (
        <Text style={styles.body}>Add a photo every few weeks to watch {plant.nickname} grow.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space(2) }}>
          {entries.map((e) => (
            <Pressable key={e.id} onPress={() => setSelected(selected === e.id ? undefined : e.id)} style={{ alignItems: 'center', gap: 4 }}>
              <Image source={{ uri: e.uri }} style={[styles.thumb, selected === e.id && styles.thumbActive]} />
              <Text style={styles.date}>{fmt(e.at)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {shown && (
        <View style={{ gap: space(2) }}>
          <Image source={{ uri: shown.uri }} style={styles.large} />
          <Text style={styles.body}>
            {fmt(shown.at)}
            {plant.photoUri === shown.uri ? ' · cover photo' : ''}
          </Text>
          <View style={styles.row}>
            {plant.photoUri !== shown.uri && (
              <Button title="Set as cover" variant="secondary" style={{ flex: 1 }} onPress={() => updatePlant(plant.id, { photoUri: shown.uri })} />
            )}
            <Button title="Remove" icon="trash" variant="danger" style={{ flex: 1 }} onPress={() => remove(shown.id)} />
          </View>
        </View>
      )}

      <View style={styles.row}>
        <Button title="Progress photo" icon="camera" variant="secondary" style={{ flex: 1 }} onPress={() => add('camera')} />
        <Button title="Library" icon="images" variant="secondary" style={{ flex: 1 }} onPress={() => add('library')} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 14, color: colors.text, lineHeight: 20 },
  thumb: { width: 84, height: 84, borderRadius: radius.md, borderWidth: 2, borderColor: 'transparent' },
  thumbActive: { borderColor: colors.primary },
  date: { fontSize: 11, color: colors.muted },
  large: { width: '100%', maxWidth: 420, alignSelf: 'center', aspectRatio: 1, borderRadius: radius.md },
  row: { flexDirection: 'row', gap: space(3) },
});
