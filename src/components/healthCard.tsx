import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Card } from '@/components/ui';
import { streakMilestone, type Health } from '@/lib/health';
import { colors, radius, space } from '@/lib/theme';

export const healthColor = (score: number) => (score >= 85 ? colors.primary : score >= 65 ? '#7CB342' : score >= 40 ? colors.feed : colors.danger);

/** Plant page card: animated score bar, streak and on-time record. */
export function HealthCard({ health, name }: { health: Health; name: string }) {
  const width = useSharedValue(0);
  useEffect(() => {
    width.value = withTiming(health.score, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [health.score, width]);
  const bar = useAnimatedStyle(() => ({ width: `${width.value}%` }));
  const milestone = streakMilestone(health.streak);

  return (
    <Card style={{ gap: space(3) }}>
      <View style={styles.row}>
        <Text style={styles.emoji}>{health.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{health.label}</Text>
          <Text style={styles.muted}>Health score {health.score}/100</Text>
        </View>
        <View style={styles.streak}>
          <Text style={styles.streakNum}>🔥 {health.streak}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: healthColor(health.score) }, bar]} />
      </View>
      <Text style={styles.body}>
        {health.overdueBy > 0
          ? `${name} is ${health.overdueBy} day${health.overdueBy > 1 ? 's' : ''} overdue for water. Water it to restart the streak.`
          : health.checked
            ? `${health.onTime} of the last ${health.checked} waterings on time.`
            : 'Water on schedule to build a streak.'}
        {milestone && health.overdueBy === 0 ? `  ${milestone}` : ''}
      </Text>
    </Card>
  );
}

/** Compact "🔥 12" chip for lists. */
export function StreakBadge({ health }: { health: Health }) {
  return (
    <View style={styles.badge}>
      <View style={[styles.dot, { backgroundColor: healthColor(health.score) }]} />
      <Text style={styles.badgeText}>{health.streak > 0 ? `🔥 ${health.streak}` : health.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
  emoji: { fontSize: 30 },
  label: { fontSize: 17, fontWeight: '700', color: colors.text },
  muted: { fontSize: 13, color: colors.muted, marginTop: 2 },
  body: { fontSize: 14, color: colors.text, lineHeight: 20 },
  streak: { alignItems: 'center', backgroundColor: colors.feedSoft, borderRadius: radius.md, paddingHorizontal: space(3), paddingVertical: space(2) },
  streakNum: { fontSize: 18, fontWeight: '800', color: colors.feed },
  streakLabel: { fontSize: 11, color: colors.feed },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: { fontSize: 12, color: colors.muted, fontWeight: '600' },
});
