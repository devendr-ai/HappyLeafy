import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FollowUpSheet } from '@/components/followUp';
import { Card, Chip } from '@/components/ui';
import { checkInQuestion, FOLLOW_UP_CHOICES, newFollowUp, OUTCOME_LABEL } from '@/lib/followUps';
import { usePlants } from '@/lib/store';
import { colors, radius, space } from '@/lib/theme';
import type { Plant, SavedAdvice } from '@/lib/types';

const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

/** Plant page: AI answers and diagnoses the user saved, newest first. */
export function SavedAdviceCard({ plant }: { plant: Plant }) {
  const { updatePlant } = usePlants();
  const [open, setOpen] = useState<string>();
  const [checking, setChecking] = useState<SavedAdvice>();
  const items = plant.savedAdvice ?? [];
  if (items.length === 0) return null;
  const setFollowUp = (id: string, followUp: SavedAdvice['followUp']) => updatePlant(plant.id, { savedAdvice: items.map((x) => (x.id === id ? { ...x, followUp } : x)) });

  return (
    <Card style={{ gap: space(3) }}>
      {checking && <FollowUpSheet plant={plant} advice={checking} onClose={() => setChecking(undefined)} />}
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
            <FollowUpRow advice={a} nickname={plant.nickname} onCheck={() => setChecking(a)} onSet={(f) => setFollowUp(a.id, f)} />
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

/** Under each saved answer: when you'll check whether it helped, or how it went. */
function FollowUpRow({ advice, nickname, onCheck, onSet }: { advice: SavedAdvice; nickname: string; onCheck: () => void; onSet: (f: SavedAdvice['followUp']) => void }) {
  const f = advice.followUp;
  if (f?.outcome) {
    return (
      <View style={styles.follow}>
        <Text style={styles.followText}>
          Check-in {fmt(f.doneAt ?? f.dueAt)}: <Text style={{ fontWeight: '700' }}>{OUTCOME_LABEL[f.outcome]}</Text>
          {f.note ? ` · ${f.note}` : ''}
        </Text>
      </View>
    );
  }
  if (f) {
    return (
      <View style={styles.follow}>
        <Text style={styles.followText}>🔁 Check-in on {fmt(f.dueAt)}: {checkInQuestion(advice, nickname)}</Text>
        <View style={styles.followActions}>
          <Pressable onPress={onCheck} hitSlop={6}>
            <Text style={styles.link}>Check in now</Text>
          </Pressable>
          <Pressable onPress={() => onSet(undefined)} hitSlop={6}>
            <Text style={styles.muted}>No reminder</Text>
          </Pressable>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.follow}>
      <Text style={styles.followText}>Remind me to check whether it helped:</Text>
      <View style={styles.chips}>
        {FOLLOW_UP_CHOICES.map((c) => (
          <Chip key={c.days} label={c.label} onPress={() => onSet(newFollowUp(c.days))} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  follow: { backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: space(3), gap: space(2), marginTop: space(1) },
  followText: { fontSize: 13, color: colors.text, lineHeight: 18 },
  followActions: { flexDirection: 'row', justifyContent: 'space-between' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  muted: { color: colors.muted, fontSize: 13 },
  item: { gap: 4 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: space(3) },
  q: { fontSize: 15, fontWeight: '700', color: colors.text },
  date: { fontSize: 12, color: colors.muted },
  a: { fontSize: 14, color: colors.text, lineHeight: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  link: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  remove: { color: colors.danger, fontSize: 13 },
});
