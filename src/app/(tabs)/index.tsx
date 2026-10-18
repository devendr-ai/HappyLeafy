import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Empty, PlantPhoto, SectionTitle } from '@/components/ui';
import { VacationBanner } from '@/components/vacation';
import { dueLabel, upcomingTasks, type Task } from '@/lib/schedule';
import { usePlants } from '@/lib/store';
import { colors, space } from '@/lib/theme';

export default function TodayScreen() {
  const { plants, settings, ready, logCare } = usePlants();
  if (!ready) return null;

  if (plants.length === 0) {
    return (
      <Empty
        icon="leaf-outline"
        title="Welcome to HappyLeafy"
        body="Add your first plant to get a care schedule and watering reminders."
        action={
          <View style={{ gap: space(3), alignSelf: 'stretch' }}>
            <Button title="Identify a plant" icon="scan" onPress={() => router.push('/identify')} />
            <Button title="Add manually" icon="add" variant="secondary" onPress={() => router.push('/add')} />
          </View>
        }
      />
    );
  }

  const tasks = upcomingTasks(plants, 7, { hemisphere: settings.hemisphere });
  const due = tasks.filter((t) => t.days <= 0);
  const later = tasks.filter((t) => t.days > 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <VacationBanner />
      <Card style={styles.summary}>
        <Text style={styles.summaryBig}>{due.length === 0 ? 'All caught up 🌿' : `${due.length} task${due.length > 1 ? 's' : ''} today`}</Text>
        <Text style={styles.summarySmall}>
          {plants.length} plant{plants.length > 1 ? 's' : ''} · {later.length} upcoming this week
        </Text>
      </Card>

      {due.length > 0 && <SectionTitle>Due now</SectionTitle>}
      {due.map((t) => (
        <TaskRow key={`${t.plant.id}-${t.kind}`} task={t} onDone={() => logCare(t.plant.id, t.kind)} />
      ))}

      {later.length > 0 && <SectionTitle>Coming up</SectionTitle>}
      {later.map((t) => (
        <TaskRow key={`${t.plant.id}-${t.kind}`} task={t} onDone={() => logCare(t.plant.id, t.kind)} />
      ))}
    </ScrollView>
  );
}

function TaskRow({ task, onDone }: { task: Task; onDone: () => void }) {
  const water = task.kind === 'water';
  const overdue = task.days < 0;
  return (
    <Pressable onPress={() => router.push(`/plant/${task.plant.id}`)}>
      <Card style={styles.task}>
        <PlantPhoto uri={task.plant.photoUri} size={52} />
        <View style={{ flex: 1 }}>
          <Text style={styles.taskTitle}>
            {water ? 'Water' : 'Fertilise'} {task.plant.nickname}
          </Text>
          <Text style={[styles.taskDue, overdue && { color: colors.danger }]}>{dueLabel(task.days)}</Text>
        </View>
        <Pressable
          onPress={onDone}
          hitSlop={8}
          accessibilityLabel={`Mark ${task.kind} done for ${task.plant.nickname}`}
          style={[styles.doneBtn, { backgroundColor: water ? colors.waterSoft : colors.feedSoft }]}
        >
          <Ionicons name={water ? 'water' : 'flask'} size={22} color={water ? colors.water : colors.feed} />
        </Pressable>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: space(4), paddingBottom: space(10) },
  summary: { backgroundColor: colors.primary, borderColor: colors.primary },
  summaryBig: { color: '#fff', fontSize: 22, fontWeight: '700' },
  summarySmall: { color: '#DDEFDD', fontSize: 14, marginTop: space(1) },
  task: { flexDirection: 'row', alignItems: 'center', gap: space(3), marginBottom: space(2), padding: space(3) },
  taskTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  taskDue: { fontSize: 14, color: colors.muted, marginTop: 2 },
  doneBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
