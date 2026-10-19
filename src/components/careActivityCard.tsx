import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui';
import { streakMilestone, type CareActivity } from '@/lib/careActivity';
import { colors, radius, space } from '@/lib/theme';

const ago = (iso: string) => {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return days <= 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`;
};

/** Plant page: how the care routine is going. Deliberately not a health verdict. */
export function CareActivityCard({ activity, name }: { activity: CareActivity; name: string }) {
  if (activity.isNew) {
    return (
      <Card style={{ gap: space(2) }}>
        <Text style={styles.title}>🌱 Getting to know {name}</Text>
        <Text style={styles.body}>
          When a check is due, look at the soil and record what you find, even if it doesn’t need water yet. HappyLeafy keeps track of your routine here.
        </Text>
      </Card>
    );
  }
  const milestone = activity.overdueBy === 0 ? streakMilestone(activity.streak) : undefined;
  return (
    <Card style={{ gap: space(3) }}>
      <View style={styles.row}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.title}>Care activity</Text>
          {activity.last && (
            <Text style={styles.muted}>
              Last check {ago(activity.last.at)}: {activity.last.watered ? 'watered' : (activity.last.note ?? 'checked').replace(/^Soil /, 'soil ')}
            </Text>
          )}
        </View>
        <View style={styles.streak}>
          <Text style={styles.streakNum}>🔥 {activity.streak}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
      </View>
      <Text style={styles.body}>
        {activity.overdueBy > 0
          ? `A soil check is ${activity.overdueBy} day${activity.overdueBy > 1 ? 's' : ''} overdue. Check it to keep your streak going.`
          : `Checked on time ${activity.onTime} of the last ${activity.checked} times. Recording “still damp” counts too.`}
        {milestone ? `  ${milestone}` : ''}
      </Text>
      <Text style={styles.note}>This tracks your care routine, not the plant’s health. If something looks wrong, use Diagnose.</Text>
    </Card>
  );
}

/** Compact tile badge: the check-in streak, or "New". */
export function StreakBadge({ activity }: { activity: CareActivity }) {
  return <Text style={styles.badge}>{activity.isNew ? '🌱 New' : activity.overdueBy > 0 ? '⏰ Check due' : `🔥 ${activity.streak}`}</Text>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  muted: { fontSize: 13, color: colors.muted },
  body: { fontSize: 14, color: colors.text, lineHeight: 20 },
  note: { fontSize: 12, color: colors.muted },
  streak: { alignItems: 'center', backgroundColor: colors.feedSoft, borderRadius: radius.md, paddingHorizontal: space(3), paddingVertical: space(2) },
  streakNum: { fontSize: 18, fontWeight: '800', color: colors.feed },
  streakLabel: { fontSize: 11, color: colors.feed },
  badge: { fontSize: 12, color: colors.muted, fontWeight: '600' },
});
