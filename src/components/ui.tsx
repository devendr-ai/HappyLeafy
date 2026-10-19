import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, space } from '@/lib/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  title,
  onPress,
  icon,
  variant = 'primary',
  loading,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'danger' | 'water' | 'feed';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const v = VARIANTS[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [styles.button, { backgroundColor: v.bg, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 }, style]}
    >
      {loading ? <ActivityIndicator color={v.fg} /> : icon ? <Ionicons name={icon} size={18} color={v.fg} /> : null}
      <Text style={[styles.buttonText, { color: v.fg }]}>{title}</Text>
    </Pressable>
  );
}

const VARIANTS = {
  primary: { bg: colors.primary, fg: '#fff' },
  secondary: { bg: colors.primarySoft, fg: colors.primary },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  water: { bg: colors.waterSoft, fg: colors.water },
  feed: { bg: colors.feedSoft, fg: colors.feed },
};

export function PlantPhoto({ uri, size, style }: { uri?: string; size: number; style?: StyleProp<ViewStyle> }) {
  if (uri) return <Image source={{ uri }} style={[{ width: size, height: size, borderRadius: radius.md }, style as object]} />;
  return (
    <View style={[{ width: size, height: size, borderRadius: radius.md }, styles.placeholder, style]}>
      <Ionicons name="leaf" size={size * 0.45} color={colors.primary} />
    </View>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function InfoRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={colors.primary} style={{ width: 24 }} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function Stepper({ value, onChange, min = 1, max = 120, suffix, step = 1 }: { value: number; onChange: (n: number) => void; min?: number; max?: number; suffix?: string; step?: number }) {
  return (
    <View style={styles.stepper}>
      <Pressable hitSlop={8} onPress={() => onChange(Math.max(min, value - step))} style={styles.stepBtn}>
        <Ionicons name="remove" size={18} color={colors.primary} />
      </Pressable>
      <Text style={styles.stepValue}>
        {value}
        {suffix ? ` ${suffix}` : ''}
      </Text>
      <Pressable hitSlop={8} onPress={() => onChange(Math.min(max, value + step))} style={styles.stepBtn}>
        <Ionicons name="add" size={18} color={colors.primary} />
      </Pressable>
    </View>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.section}>{children}</Text>;
}

export function Empty({ icon, title, body, action }: { icon: IconName; title: string; body: string; action?: ReactNode }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={48} color={colors.primary} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: space(4), borderWidth: 1, borderColor: colors.border },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space(2), paddingVertical: space(3), paddingHorizontal: space(4), borderRadius: radius.md },
  buttonText: { fontSize: 16, fontWeight: '600' },
  placeholder: { backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  chip: { paddingVertical: space(2), paddingHorizontal: space(3), borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 14 },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space(2) },
  infoLabel: { color: colors.muted, fontSize: 14, width: 96 },
  infoValue: { color: colors.text, fontSize: 15, flex: 1 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
  stepBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  stepValue: { fontSize: 16, fontWeight: '600', color: colors.text, minWidth: 64, textAlign: 'center' },
  section: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: space(6), marginBottom: space(2) },
  empty: { alignItems: 'center', padding: space(8), gap: space(3) },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 15, color: colors.muted, textAlign: 'center', lineHeight: 21 },
});
