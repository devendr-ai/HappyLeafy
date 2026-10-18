import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { addDays, nextFertilizeDate, nextWaterDate, startOfDay } from './schedule';
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
  if (!settings.remindersEnabled) return [];
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

  await schedule(`💧 Water ${plant.nickname}`, 'Check the soil first: water if the top few cm are dry.', fireTime(nextWaterDate(plant, { hemisphere: settings.hemisphere }), settings.reminderHour));
  await schedule(`🌱 Feed ${plant.nickname}`, 'Time for a dose of diluted fertiliser.', fireTime(nextFertilizeDate(plant), settings.reminderHour));
  return ids;
}
