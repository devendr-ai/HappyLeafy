import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui';
import { usePlants } from '@/lib/store';
import { colors, space } from '@/lib/theme';
import type { Plant } from '@/lib/types';

const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

/** Plant page: AI answers and diagnoses the user saved, newest first. */
export function SavedAdviceCard({ plant }: { plant: Plant }) {
  const { updatePlant } = usePlants();
  const [open, setOpen] = useState<string>();
  const items = plant.savedAdvice ?? [];
  if (items.length === 0) return null;

  return (
    <Card style={{ gap: space(3) }}>
      {items.map((a, i) => {
        const expanded = open === a.id;
        return (
          <View key={a.id} style={[styles.item, i > 0 && styles.divider]}>
            <Text style={styles.q}>
              {a.source === 'diagnosis' ? '🩺 ' : '💬 '}
              {a.question}
            </Text>
            <Text style={styles.date}>{fmt(a.at)}</Text>
            <Text style={styles.a} numberOfLines={expanded ? undefined : 4}>
              {a.answer}
            </Text>
            <View style={styles.row}>
              <Pressable onPress={() => setOpen(expanded ? undefined : a.id)} hitSlop={6}>
                <Text style={styles.link}>{expanded ? 'Show less' : 'Show more'}</Text>
              </Pressable>
              <Pressable onPress={() => updatePlant(plant.id, { savedAdvice: items.filter((x) => x.id !== a.id) })} hitSlop={6}>
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  item: { gap: 4 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: space(3) },
  q: { fontSize: 15, fontWeight: '700', color: colors.text },
  date: { fontSize: 12, color: colors.muted },
  a: { fontSize: 14, color: colors.text, lineHeight: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  link: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  remove: { color: colors.danger, fontSize: 13 },
});
