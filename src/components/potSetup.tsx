import { StyleSheet, Text, View } from 'react-native';
import { Chip } from '@/components/ui';
import type { WaterAdjustment } from '@/lib/schedule';
import { colors, space } from '@/lib/theme';
import type { Light, PotMaterial, PotSize } from '@/lib/types';

export type PotDetails = {
  potMaterial?: PotMaterial;
  potSize?: PotSize;
  drainage?: boolean;
  lightAtLocation?: Light;
  outdoor?: boolean;
};

const MATERIALS: { value: PotMaterial; label: string }[] = [
  { value: 'plastic', label: 'Plastic' },
  { value: 'terracotta', label: 'Terracotta' },
  { value: 'glazed', label: 'Glazed ceramic' },
];
const SIZES: { value: PotSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];
const DRAINAGE: { value: boolean; label: string }[] = [
  { value: true, label: 'Yes' },
  { value: false, label: 'No' },
];
const PLACES: { value: boolean; label: string }[] = [
  { value: false, label: 'Indoors' },
  { value: true, label: 'Outdoors' },
];
const LIGHTS: { value: Light; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'bright-indirect', label: 'Bright indirect' },
  { value: 'direct', label: 'Direct sun' },
];

function ChipGroup<T>({ label, options, value, onChange }: { label: string; options: { value: T; label: string }[]; value?: T; onChange: (v: T | undefined) => void }) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips}>
        {options.map((o) => (
          // Tapping the selected chip clears it, back to "not set".
          <Chip key={o.label} label={o.label} selected={value === o.value} onPress={() => onChange(value === o.value ? undefined : o.value)} />
        ))}
      </View>
    </View>
  );
}

/** Optional pot and spot details that tune the watering interval. */
export function PotSetup({ value, onChange }: { value: PotDetails; onChange: (patch: PotDetails) => void }) {
  return (
    <View style={{ gap: space(4) }}>
      <ChipGroup label="Indoors or outdoors" options={PLACES} value={value.outdoor ?? false} onChange={(outdoor) => onChange({ outdoor: outdoor || undefined })} />
      {value.outdoor && <Text style={styles.note}>Rain counts as watering once you set your town in Settings.</Text>}
      <ChipGroup label="Pot material" options={MATERIALS} value={value.potMaterial} onChange={(potMaterial) => onChange({ potMaterial })} />
      <ChipGroup label="Pot size" options={SIZES} value={value.potSize} onChange={(potSize) => onChange({ potSize })} />
      <ChipGroup label="Drainage hole" options={DRAINAGE} value={value.drainage} onChange={(drainage) => onChange({ drainage })} />
      <ChipGroup label="Light where it sits" options={LIGHTS} value={value.lightAtLocation} onChange={(lightAtLocation) => onChange({ lightAtLocation })} />
    </View>
  );
}

/** "Right now: every N days" plus why it differs from the base interval. */
export function WaterIntervalHints({ days, baseDays, adjustments }: { days: number; baseDays: number; adjustments: WaterAdjustment[] }) {
  return (
    <View style={styles.hints}>
      <Text style={styles.current}>
        {days === baseDays ? `Right now: every ${days} days` : `Right now: every ${days} days (base ${baseDays})`}
      </Text>
      {adjustments.map((a) => (
        <Text key={a.key} style={styles.hint}>
          • {a.hint}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  note: { fontSize: 13, color: colors.water, marginTop: -space(2) },
  group: { gap: space(2) },
  label: { fontSize: 15, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  hints: { gap: space(1) },
  current: { fontSize: 14, fontWeight: '600', color: colors.water },
  hint: { fontSize: 13, color: colors.muted },
});
