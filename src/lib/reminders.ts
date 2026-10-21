import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { addDays, EXTRA_CARE, nextExtraDate, nextFertilizeDate, nextWaterDate, startOfDay, vacationUntil } from './schedule';
import { summaryFor } from './summary';
import { TASK_META } from './taskMeta';
import { checkInQuestion } from './followUps';
import { formatWater, unitsOf } from './units';
import { waterAmount } from './waterAmount';
import type { Plant, Settings } from './types';

const CHANNEL = 'care-reminders';
const supported = Platform.OS !== 'web';

export function configureNotifications() {
  if (!supported) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensurePermission(): Promise<boolean> {
  if (!supported) return false;
  if (Platform.OS === 'android') {
    // Android 13+ only shows the prompt once a channel exists.
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Plant care reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const req = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: true },
  });
  return req.granted;
}

/** Fire at `hour` on the due day; if that moment has passed (overdue), nudge tomorrow instead. */
function fireTime(due: Date, hour: number): Date {
  const at = startOfDay(due);
  at.setHours(hour, 0, 0, 0);
  const now = new Date();
  if (at.getTime() > now.getTime() + 60_000) return at;
  const tomorrow = addDays(startOfDay(now), 1);
  tomorrow.setHours(hour, 0, 0, 0);
  return tomorrow;
}

export async function cancelPlantReminders(plant: Plant) {
  if (!supported) return;
  await Promise.all((plant.notificationIds ?? []).map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})));
}

/** Replace a plant's scheduled reminders. Returns the new notification ids. */
export async function schedulePlantReminders(plant: Plant, settings: Settings): Promise<string[]> {
  if (!supported) return [];
  await cancelPlantReminders(plant);
  // Summary mode schedules one daily notification for all plants instead (scheduleDailySummaries).
  if (!settings.remindersEnabled || settings.reminderStyle !== 'each') return [];
  const perm = await Notifications.getPermissionsAsync();
  if (!perm.granted) return [];

  const ids: string[] = [];
  const schedule = async (title: string, body: string, date: Date) => {
    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body, data: { plantId: plant.id } },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: Platform.OS === 'android' ? CHANNEL : undefined,
      },
    });
    ids.push(id);
  };

  // On vacation: hold every reminder until the return day.
  const back = vacationUntil(settings);
  const notBefore = (d: Date) => (back && d.getTime() < back.getTime() ? back : d);
  const amount = waterAmount(plant);
  await schedule(
    `💧 Check ${plant.nickname}’s soil`,
    `Water only if it’s dry${amount ? ` (about ${formatWater(amount.ml, unitsOf(settings))})` : ''}. Still damp? Record it in the app and skip watering.`,
    fireTime(notBefore(nextWaterDate(plant, { hemisphere: settings.hemisphere })), settings.reminderHour),
  );
  await schedule(`🌱 Feed ${plant.nickname}`, 'Time for a dose of diluted fertiliser.', fireTime(notBefore(nextFertilizeDate(plant)), settings.reminderHour));
  for (const a of plant.savedAdvice ?? []) {
    if (!a.followUp || a.followUp.outcome) continue;
    await schedule(`🔁 How is ${plant.nickname} doing?`, checkInQuestion(a, plant.nickname), fireTime(new Date(a.followUp.dueAt), settings.reminderHour));
  }
  for (const kind of EXTRA_CARE) {
    const due = nextExtraDate(plant, kind);
    const meta = TASK_META[kind];
    if (due) await schedule(`${meta.emoji} ${meta.verb} ${plant.nickname}`, meta.blurb, fireTime(notBefore(due), settings.reminderHour));
  }
  return ids;
}

const SUMMARY_KEY = 'happyleafy.summaryNotificationIds.v1';
/** How many days ahead to schedule summaries; the window rolls forward each time the app opens. */
const SUMMARY_DAYS = 14;

/**
 * Replace all morning-summary notifications: one per day (for the next two weeks) at the
 * reminder hour, listing every plant due or overdue that day. No-op in per-plant mode.
 */
export async function scheduleDailySummaries(plants: Plant[], settings: Settings): Promise<void> {
  if (!supported) return;
  const old = JSON.parse((await AsyncStorage.getItem(SUMMARY_KEY)) ?? '[]') as string[];
  await Promise.all(old.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})));
  await AsyncStorage.setItem(SUMMARY_KEY, '[]');
  if (!settings.remindersEnabled || settings.reminderStyle === 'each' || plants.length === 0) return;
  if (!(await Notifications.getPermissionsAsync()).granted) return;

  const back = vacationUntil(settings);
  const now = Date.now();
  const ids: string[] = [];
  for (let d = 0; d < SUMMARY_DAYS; d++) {
    const at = addDays(startOfDay(new Date()), d);
    at.setHours(settings.reminderHour, 0, 0, 0);
    if (at.getTime() <= now + 60_000) continue;
    if (back && startOfDay(at).getTime() < back.getTime()) continue;
    const text = summaryFor(plants, at, settings.hemisphere);
    if (!text) continue;
    ids.push(
      await Notifications.scheduleNotificationAsync({
        content: { ...text, data: { screen: 'today' } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: Platform.OS === 'android' ? CHANNEL : undefined },
      }),
    );
  }
  await AsyncStorage.setItem(SUMMARY_KEY, JSON.stringify(ids));
}
