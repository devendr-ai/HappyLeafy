import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Chip, Stepper } from '@/components/ui';
import { measureLight, type LightReading } from '@/lib/lightMeter';
import type { WaterAdjustment } from '@/lib/schedule';
import { usePlants } from '@/lib/store';
import { colors, space } from '@/lib/theme';
import type { Light, PotMaterial, PotSize } from '@/lib/types';

export type PotDetails = {
  potMaterial?: PotMaterial;
  potSize?: PotSize;
  drainage?: boolean;
  lightAtLocation?: Light;
  outdoor?: boolean;
  potDiameterCm?: number;
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
  const { settings } = usePlants();
  const [reading, setReading] = useState<LightReading>();
  const [measuring, setMeasuring] = useState(false);
  const [meterError, setMeterError] = useState<string>();

  const measure = async () => {
    setMeasuring(true);
    setMeterError(undefined);
    try {
      const r = await measureLight();
      setReading(r);
      onChange({ lightAtLocation: r.light });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg !== 'cancelled') setMeterError(msg);
    } finally {
      setMeasuring(false);
    }
  };

  return (
    <View style={{ gap: space(4) }}>
      <ChipGroup label="Indoors or outdoors" options={PLACES} value={value.outdoor ?? false} onChange={(outdoor) => onChange({ outdoor: outdoor || undefined })} />
      {value.outdoor && (
        <Text style={styles.note}>{settings.weather ? `Rain in ${settings.weather.place.split(',')[0]} counts as watering.` : 'Rain counts as watering once you set your town in Settings.'}</Text>
      )}
      <ChipGroup label="Pot material" options={MATERIALS} value={value.potMaterial} onChange={(potMaterial) => onChange({ potMaterial })} />
      <ChipGroup label="Pot size" options={SIZES} value={value.potSize} onChange={(potSize) => onChange({ potSize })} />
      <View style={{ gap: space(2), marginTop: -space(2) }}>
        {value.potDiameterCm ? (
          <View style={styles.diameterRow}>
            <Text style={styles.label}>Width across the top</Text>
            <Stepper value={value.potDiameterCm} min={5} max={80} suffix="cm" onChange={(potDiameterCm) => onChange({ potDiameterCm })} />
          </View>
        ) : null}
        <Pressable onPress={() => onChange({ potDiameterCm: value.potDiameterCm ? undefined : value.potSize === 'small' ? 10 : value.potSize === 'large' ? 25 : 15 })} hitSlop={6}>
          <Text style={styles.measure}>{value.potDiameterCm ? 'Use size only' : '📏 Enter exact pot width (better water amounts)'}</Text>
        </Pressable>
      </View>
      <ChipGroup label="Drainage hole" options={DRAINAGE} value={value.drainage} onChange={(drainage) => onChange({ drainage })} />
      <ChipGroup label="Light where it sits" options={LIGHTS} value={value.lightAtLocation} onChange={(lightAtLocation) => onChange({ lightAtLocation })} />
      <View style={{ gap: 4, marginTop: -space(2) }}>
        <Pressable onPress={measure} disabled={measuring} hitSlop={6}>
          <Text style={styles.measure}>{measuring ? 'Measuring…' : '📷 Measure with camera'}</Text>
        </Pressable>
        <Text style={styles.meterHint}>Hold the phone where the plant sits, camera facing the window, and take a photo.</Text>
        {reading && (
          <Text style={styles.reading}>
            ≈ {reading.lux.toLocaleString()} lux · {reading.label}. {reading.advice}
          </Text>
        )}
        {meterError && <Text style={styles.meterError}>{meterError}</Text>}
      </View>
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
  diameterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  measure: { fontSize: 14, fontWeight: '600', color: colors.primary },
  meterHint: { fontSize: 12, color: colors.muted },
  reading: { fontSize: 13, color: colors.text, lineHeight: 18 },
  meterError: { fontSize: 13, color: colors.danger },
  note: { fontSize: 13, color: colors.water, marginTop: -space(2) },
  group: { gap: space(2) },
  label: { fontSize: 15, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  hints: { gap: space(1) },
  current: { fontSize: 14, fontWeight: '600', color: colors.water },
  hint: { fontSize: 13, color: colors.muted },
});
