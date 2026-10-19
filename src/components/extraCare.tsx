import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Button, Card, Stepper } from '@/components/ui';
import { careForPlant, DEFAULT_PROFILE } from '@/lib/careDb';
import { daysUntil, defaultExtraInterval, dueLabel, EXTRA_CARE, extraInterval, nextExtraDate } from '@/lib/schedule';
import { usePlants } from '@/lib/store';
import { TASK_META } from '@/lib/taskMeta';
import { colors, radius, space } from '@/lib/theme';
import type { ExtraCare, Plant } from '@/lib/types';

/** Interval used when switching a task on that is off by default. */
const TURN_ON_DAYS: Record<ExtraCare, number> = { mist: 3, clean: 30, repot: 365 };
const MAX_DAYS: Record<ExtraCare, number> = { mist: 30, clean: 120, repot: 1095 };
const STEP: Record<ExtraCare, number> = { mist: 1, clean: 7, repot: 30 };

const describe = (days: number) => (days >= 365 && days % 365 === 0 ? `${days / 365} year${days > 365 ? 's' : ''}` : days >= 60 && days % 30 === 0 ? `${days / 30} months` : `${days} days`);

/** Plant page card: misting, leaf cleaning and repotting, each switchable with its own interval. */
export function ExtraCareCard({ plant }: { plant: Plant }) {
  const { updatePlant, logCare } = usePlants();
  const profile = careForPlant(plant) ?? DEFAULT_PROFILE;

  const set = (kind: ExtraCare, days: number) => updatePlant(plant.id, { extraCare: { ...plant.extraCare, [kind]: days } });

  return (
    <Card style={{ gap: space(4) }}>
      {EXTRA_CARE.map((kind) => {
        const meta = TASK_META[kind];
        const every = extraInterval(plant, kind);
        const due = nextExtraDate(plant, kind);
        const isDefault = plant.extraCare?.[kind] === undefined;
        const suggested = defaultExtraInterval(kind, profile);
        return (
          <View key={kind} style={{ gap: space(2) }}>
            <View style={styles.row}>
              <View style={[styles.icon, { backgroundColor: meta.soft }]}>
                <Ionicons name={meta.icon} size={18} color={meta.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{meta.name}</Text>
                <Text style={[styles.sub, due && daysUntil(due) < 0 && { color: colors.danger }]}>
                  {every ? `Every ${describe(every)} · ${dueLabel(daysUntil(due!))}` : suggested ? 'Off' : `Off · not usually needed for ${profile.commonName.toLowerCase()}`}
                </Text>
              </View>
              <Switch value={every > 0} onValueChange={(on) => set(kind, on ? suggested || TURN_ON_DAYS[kind] : 0)} trackColor={{ true: meta.color }} />
            </View>
            {every > 0 && (
              <View style={styles.row}>
                <Stepper value={every} min={STEP[kind]} max={MAX_DAYS[kind]} step={STEP[kind]} onChange={(n) => set(kind, n)} suffix="d" />
                <Button title="Done" variant="secondary" onPress={() => logCare(plant.id, kind)} style={styles.done} />
              </View>
            )}
            {every > 0 && isDefault && <Text style={styles.hint}>{meta.blurb}</Text>}
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
  icon: { width: 34, height: 34, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  sub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  hint: { fontSize: 12, color: colors.muted, marginLeft: 46 },
  done: { marginLeft: 'auto', paddingVertical: space(2) },
});
