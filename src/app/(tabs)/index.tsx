import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOutRight, LinearTransition, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { BackupNudge } from '@/components/backupNudge';
import { SoilCheckSheet, type SoilOutcome } from '@/components/soilCheck';
import { DemoBanner } from '@/components/demoBanner';
import { FollowUpSheet } from '@/components/followUp';
import { InstallHint } from '@/components/installHint';
import { Celebration } from '@/components/today/celebration';
import { PlantHero } from '@/components/today/plantHero';
import { ProgressRing } from '@/components/today/progressRing';
import { Button, Card, PlantPhoto, SectionTitle } from '@/components/ui';
import { VacationBanner } from '@/components/vacation';
import { isDemo } from '@/lib/demo';
import { gardenStreak, streakMilestone } from '@/lib/careActivity';
import { dueLabel, startOfDay, upcomingTasks, type Task } from '@/lib/schedule';
import { usePlants } from '@/lib/store';
import { colors, radius, space } from '@/lib/theme';
import { checkInQuestion, dueFollowUps } from '@/lib/followUps';
import { plantCover } from '@/lib/refPhoto';
import type { Plant, SavedAdvice } from '@/lib/types';
import { TASK_META } from '@/lib/taskMeta';
import { formatRain, formatWater, unitsOf } from '@/lib/units';
import { waterAmount } from '@/lib/waterAmount';
import { rainTomorrow } from '@/lib/weather';

const haptic = (kind: 'tap' | 'success') => {
  if (Platform.OS === 'web') return;
  if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 5) return { text: 'Good night', emoji: '🌙' };
  if (h < 12) return { text: 'Good morning', emoji: '🌤' };
  if (h < 17) return { text: 'Good afternoon', emoji: '☀️' };
  return { text: 'Good evening', emoji: '🌆' };
}

const TASK_TYPES = new Set<string>(['water', 'check', 'fertilize', 'mist', 'clean', 'repot']);

/** Care-task events logged today across all plants. */
function doneToday(plants: Plant[]) {
  const today = startOfDay(new Date()).getTime();
  return plants.reduce((n, p) => n + p.history.filter((e) => TASK_TYPES.has(e.type) && startOfDay(new Date(e.at)).getTime() === today).length, 0);
}

export default function TodayScreen() {
  const { plants, settings, ready, logCare, rain } = usePlants();
  const [celebrate, setCelebrate] = useState(0);
  const [checking, setChecking] = useState<Task>();
  const [checkIn, setCheckIn] = useState<{ plant: Plant; advice: SavedAdvice }>();
  const rainSoon = rainTomorrow(rain);
  if (!ready) return null;
  // First launch: show the welcome tour (existing users with plants skip it).
  if (!settings.onboarded && plants.length === 0) return <Redirect href="/onboarding" />;

  if (plants.length === 0) {
    return (
      <View style={styles.welcome}>
        <View style={{ alignSelf: 'stretch' }}>
          <InstallHint />
        </View>
        <Animated.View entering={FadeInDown.springify()}>
          <PlantHero happy={false} thirsty={false} size={160} />
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(150)} style={styles.welcomeTitle}>
          Welcome to HappyLeafy
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(250)} style={styles.welcomeBody}>
          {Platform.OS === 'web'
            ? 'Add your first plant to get its care guide and a schedule to track. Automatic reminders are coming in the phone app.'
            : 'Add your first plant to get a care schedule and watering reminders.'}
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(350)} style={{ gap: space(3), alignSelf: 'stretch' }}>
          <Button title="Identify a plant" icon="scan" onPress={() => router.push('/identify')} />
          <Button title="Add manually" icon="add" variant="secondary" onPress={() => router.push('/add')} />
        </Animated.View>
      </View>
    );
  }

  const tasks = upcomingTasks(plants, 7, { hemisphere: settings.hemisphere });
  const due = tasks.filter((t) => t.days <= 0);
  const later = tasks.filter((t) => t.days > 0);
  const done = doneToday(plants);
  const overdue = due.some((t) => t.days < 0);
  const g = greeting();
  const streak = gardenStreak(plants, { hemisphere: settings.hemisphere });
  const milestone = streakMilestone(streak);

  const complete = (t: Task) => {
    // Watering starts with a soil check; "still damp" is a valid outcome, not a miss.
    if (t.kind === 'water') {
      setChecking(t);
      return;
    }
    finish(t);
    logCare(t.plant.id, t.kind);
  };

  const finish = (t: Task) => {
    const last = due.length === 1 && t.days <= 0;
    haptic(last ? 'success' : 'tap');
    if (last) setCelebrate((c) => c + 1);
  };

  const closeCheck = (outcome?: SoilOutcome) => {
    if (checking && outcome) finish(checking);
    setChecking(undefined);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <DemoBanner />
      {!isDemo() && <InstallHint />}
      <VacationBanner />
      {!isDemo() && <BackupNudge />}

      <Animated.View entering={FadeIn.duration(400)} style={styles.hero}>
        <Celebration run={celebrate} />
        <PlantHero happy={due.length === 0} thirsty={overdue} size={96} />
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>
            {g.text} {g.emoji}
          </Text>
          <Text style={styles.heroBig}>{due.length === 0 ? 'All caught up 🌿' : `${due.length} task${due.length > 1 ? 's' : ''} today`}</Text>
          <Text style={styles.heroSmall}>
            {plants.length} plant{plants.length > 1 ? 's' : ''} · {later.length} coming up this week
          </Text>
          {streak > 0 && (
            <Animated.Text entering={FadeInDown.delay(300)} style={styles.streak}>
              🔥 {streak}-day streak{milestone ? ` · ${milestone}` : ''}
            </Animated.Text>
          )}
        </View>
        <ProgressRing done={done} total={done + due.length} />
      </Animated.View>

      {due.length > 0 && <SectionTitle>Due now</SectionTitle>}
      {due.map((t, i) => (
        <TaskRow
          key={`${t.plant.id}-${t.kind}`}
          index={i}
          task={t}
          rainMm={t.kind === 'water' && t.plant.outdoor ? rainSoon?.mm : undefined}
          onDone={() => complete(t)}
        />
      ))}

      {dueFollowUps(plants).length > 0 && <SectionTitle>Check-ins</SectionTitle>}
      {dueFollowUps(plants).map(({ plant, advice }) => (
        <Pressable key={advice.id} onPress={() => setCheckIn({ plant, advice })}>
          <Card style={styles.task}>
            <PlantPhoto uri={plantCover(plant)} size={52} />
            <View style={{ flex: 1 }}>
              <Text style={styles.taskTitle}>Did the advice help {plant.nickname}?</Text>
              <Text style={styles.taskDue} numberOfLines={2}>
                {checkInQuestion(advice, plant.nickname)}
              </Text>
            </View>
            <Text style={{ fontSize: 22 }}>🔁</Text>
          </Card>
        </Pressable>
      ))}
      {checkIn && <FollowUpSheet plant={checkIn.plant} advice={checkIn.advice} onClose={() => setCheckIn(undefined)} />}

      {checking && <SoilCheckSheet plant={checking.plant} ctx={{ hemisphere: settings.hemisphere }} onClose={closeCheck} />}

      {later.length > 0 && <SectionTitle>Coming up</SectionTitle>}
      {later.map((t, i) => (
        <TaskRow key={`${t.plant.id}-${t.kind}`} index={due.length + i} task={t} onDone={() => complete(t)} />
      ))}
    </ScrollView>
  );
}

function TaskRow({ task, onDone, rainMm, index }: { task: Task; onDone: () => void; rainMm?: number; index: number }) {
  const meta = TASK_META[task.kind];
  const amount = task.kind === 'water' ? waterAmount(task.plant) : undefined;
  const overdue = task.days < 0;
  const units = unitsOf(usePlants().settings);
  const pop = useSharedValue(1);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  const press = () => {
    pop.set(withSequence(withSpring(1.35, { damping: 4, stiffness: 300 }), withSpring(1)));
    // Let the button pop before the card slides away.
    setTimeout(onDone, 180);
  };

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 70).springify().damping(16)} exiting={FadeOutRight.duration(300)} layout={LinearTransition.springify().damping(18)}>
      <Pressable onPress={() => router.push(`/plant/${task.plant.id}`)}>
        <Card style={[styles.task, overdue && styles.taskOverdue]}>
          <PlantPhoto uri={plantCover(task.plant)} size={52} />
          <View style={{ flex: 1 }}>
            <Text style={styles.taskTitle}>
              {task.kind === 'water' ? `Check ${task.plant.nickname}’s soil` : `${meta.verb} ${task.plant.nickname}`}
            </Text>
            <Text style={[styles.taskDue, overdue && { color: colors.danger }]}>
              {dueLabel(task.days)}
              {amount ? <Text style={styles.amount}>{`  ·  if dry, about ${formatWater(amount.ml, units)}`}</Text> : null}
            </Text>
            {rainMm !== undefined && <Text style={styles.rain}>🌧 {formatRain(rainMm, units)} rain expected tomorrow: you can skip</Text>}
          </View>
          <Pressable onPress={press} hitSlop={8} accessibilityLabel={`Mark ${task.kind} done for ${task.plant.nickname}`}>
            <Animated.View style={[styles.doneBtn, { backgroundColor: meta.soft }, popStyle]}>
              <Ionicons name={meta.icon} size={22} color={meta.color} />
            </Animated.View>
          </Pressable>
        </Card>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { padding: space(4), paddingBottom: space(10) },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(3),
    backgroundColor: colors.leaf,
    borderRadius: radius.lg,
    padding: space(4),
    paddingLeft: space(2),
    overflow: 'visible',
  },
  greeting: { color: colors.primary, fontSize: 13, fontWeight: '600', opacity: 0.8 },
  heroBig: { color: colors.text, fontSize: 21, fontWeight: '800', marginTop: 2 },
  heroSmall: { color: colors.text, fontSize: 13, marginTop: space(1), opacity: 0.8 },
  streak: { color: colors.feed, fontSize: 13, fontWeight: '700', marginTop: space(1) },
  task: { flexDirection: 'row', alignItems: 'center', gap: space(3), marginBottom: space(2), padding: space(3) },
  taskOverdue: { borderColor: colors.dangerSoft, borderWidth: 2 },
  taskTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  taskDue: { fontSize: 14, color: colors.muted, marginTop: 2 },
  rain: { fontSize: 13, color: colors.water, marginTop: 2 },
  amount: { color: colors.water, fontWeight: '600' },
  doneBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  welcome: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space(8), gap: space(3) },
  welcomeTitle: { fontSize: 22, fontWeight: '800', color: colors.text, textAlign: 'center' },
  welcomeBody: { fontSize: 15, color: colors.muted, textAlign: 'center', lineHeight: 21 },
});
