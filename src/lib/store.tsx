import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { combinePlants, photoUris, type BackupSettings } from './backupFormat';
import { findRefPhoto } from './refPhoto';
import { formatRain, unitsOf } from './units';
import { demoPlants, isDemo } from './demo';
import { deletePhoto } from './photos';
import { cancelPlantReminders, scheduleDailySummaries, schedulePlantReminders } from './reminders';
import type { CareEvent, CareEventType, Plant, Settings } from './types';
import { getRain, lastSoakingRain, ymd, type RainDay } from './weather';

const PLANTS_KEY = 'happyleafy.plants.v1';
const SETTINGS_KEY = 'happyleafy.settings.v1';

const DEFAULT_SETTINGS: Settings = {
  plantNetApiKey: process.env.EXPO_PUBLIC_PLANTNET_KEY ?? '',
  geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_KEY ?? '',
  reminderHour: 9,
  remindersEnabled: true,
  hemisphere: 'northern',
};

/** Saving failed (almost always a full browser storage on web). Changes stay until the app is closed. */
function storageFull() {
  const title = 'Storage is full';
  const body =
    Platform.OS === 'web'
      ? 'Your browser has run out of space for HappyLeafy, so the latest change could not be saved. Remove some timeline photos, or make a backup (Settings → Backup).'
      : 'HappyLeafy could not save your latest change. Free up space on your phone and try again.';
  if (Platform.OS === 'web') window.alert(`${title}\n\n${body}`);
  else Alert.alert(title, body);
}

const DEMO = isDemo();
/** Writes are skipped in the web demo so visitors' sample edits never touch real storage. */
const persist = (key: string, value: string) => (DEMO ? Promise.resolve() : AsyncStorage.setItem(key, value));

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export type NewPlant = Omit<Plant, 'id' | 'createdAt' | 'history' | 'notificationIds'>;

type Store = {
  ready: boolean;
  plants: Plant[];
  settings: Settings;
  addPlant: (p: NewPlant) => Promise<Plant>;
  updatePlant: (id: string, patch: Partial<Plant>) => Promise<void>;
  removePlant: (id: string) => Promise<void>;
  logCare: (id: string, type: CareEventType, note?: string) => Promise<void>;
  /** Delete a care-history entry (e.g. logged by mistake), restoring the dates it changed. */
  removeCareEvent: (plantId: string, eventId: string) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  /** Apply restored plants (photo URIs already real). Replace also restores settings, keeping API keys. */
  restoreBackup: (plants: Plant[], settings: BackupSettings, mode: 'merge' | 'replace') => Promise<void>;
  /** Daily rain around the user's place (last 14 days + 3-day forecast), when set. */
  rain: RainDay[];
};

const Ctx = createContext<Store | null>(null);

export function PlantStoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [rain, setRain] = useState<RainDay[]>([]);
  // Refs let async actions see the latest state without stale closures.
  const plantsRef = useRef(plants);
  const settingsRef = useRef(settings);

  useEffect(() => {
    (async () => {
      if (DEMO) {
        // Sample garden for the web demo; never read or written to storage.
        plantsRef.current = demoPlants();
        setPlants(plantsRef.current);
        settingsRef.current = { ...DEFAULT_SETTINGS, onboarded: true };
        setSettings(settingsRef.current);
        setReady(true);
        return;
      }
      const [p, s] = await Promise.all([AsyncStorage.getItem(PLANTS_KEY), AsyncStorage.getItem(SETTINGS_KEY)]);
      if (p) {
        plantsRef.current = JSON.parse(p);
        setPlants(plantsRef.current);
      }
      if (s) {
        settingsRef.current = { ...DEFAULT_SETTINGS, ...JSON.parse(s) };
        setSettings(settingsRef.current);
      }
      setReady(true);
    })();
  }, []);

  // Morning summaries cover all plants, so rebuild them (debounced) after any change.
  const summaryTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const queueSummaries = useCallback(() => {
    clearTimeout(summaryTimer.current);
    summaryTimer.current = setTimeout(() => scheduleDailySummaries(plantsRef.current, settingsRef.current).catch(() => {}), 800);
  }, []);

  const savePlants = useCallback(
    async (next: Plant[]) => {
      plantsRef.current = next;
      setPlants(next);
      try {
        await persist(PLANTS_KEY, JSON.stringify(next));
      } catch {
        storageFull();
      }
      queueSummaries();
    },
    [queueSummaries],
  );

  // Roll the two-week summary window forward each time the app opens.
  useEffect(() => {
    if (ready) queueSummaries();
  }, [ready, queueSummaries]);

  const withReminders = useCallback(async (plant: Plant): Promise<Plant> => {
    try {
      return { ...plant, notificationIds: await schedulePlantReminders(plant, settingsRef.current) };
    } catch {
      return plant;
    }
  }, []);

  const addPlant = useCallback(
    async (input: NewPlant) => {
      const plant = await withReminders({ ...input, id: newId(), createdAt: new Date().toISOString(), history: [] });
      await savePlants([plant, ...plantsRef.current]);
      return plant;
    },
    [savePlants, withReminders],
  );

  const updatePlant = useCallback(
    async (id: string, patch: Partial<Plant>) => {
      const existing = plantsRef.current.find((p) => p.id === id);
      if (!existing) return;
      const updated = await withReminders({ ...existing, ...patch });
      await savePlants(plantsRef.current.map((p) => (p.id === id ? updated : p)));
    },
    [savePlants, withReminders],
  );

  const removePlant = useCallback(
    async (id: string) => {
      const existing = plantsRef.current.find((p) => p.id === id);
      if (existing) {
        await cancelPlantReminders(existing);
        deletePhoto(existing.photoUri);
        existing.timeline?.forEach((e) => e.uri !== existing.photoUri && deletePhoto(e.uri));
      }
      await savePlants(plantsRef.current.filter((p) => p.id !== id));
    },
    [savePlants],
  );

  const logCare = useCallback(
    async (id: string, type: CareEventType, note?: string) => {
      const existing = plantsRef.current.find((p) => p.id === id);
      if (!existing) return;
      const now = new Date().toISOString();
      const prev = type === 'water' ? existing.lastWatered : type === 'fertilize' ? existing.lastFertilized : undefined;
      const event: CareEvent = { id: newId(), type, at: now, note, prev };
      const patch: Partial<Plant> = { history: [event, ...existing.history] };
      if (type === 'water') {
        patch.lastWatered = now;
        patch.waterCheckAfter = undefined; // a watering restarts the normal interval
      }
      if (type === 'fertilize') patch.lastFertilized = now;
      await updatePlant(id, patch);
    },
    [updatePlant],
  );

  const removeCareEvent = useCallback(
    async (plantId: string, eventId: string) => {
      const existing = plantsRef.current.find((p) => p.id === plantId);
      const event = existing?.history.find((e) => e.id === eventId);
      if (!existing || !event) return;
      const history = existing.history.filter((e) => e.id !== eventId);
      const patch: Partial<Plant> = { history };
      // Only the latest event of a kind set the current date; fall back to the previous event of that kind.
      const latestOther = (type: CareEventType) => history.find((e) => e.type === type)?.at;
      if (event.type === 'water' && existing.lastWatered === event.at) patch.lastWatered = event.prev ?? latestOther('water') ?? existing.lastWatered;
      if (event.type === 'fertilize' && existing.lastFertilized === event.at) patch.lastFertilized = event.prev ?? latestOther('fertilize') ?? existing.lastFertilized;
      if (event.type === 'check' && existing.history.find((e) => e.type === 'check' || e.type === 'water')?.id === eventId) patch.waterCheckAfter = event.prev;
      await updatePlant(plantId, patch);
    },
    [updatePlant],
  );

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      const next = { ...settingsRef.current, ...patch };
      settingsRef.current = next;
      setSettings(next);
      await persist(SETTINGS_KEY, JSON.stringify(next));
      if (['reminderHour', 'remindersEnabled', 'reminderStyle', 'hemisphere', 'vacation'].some((k) => k in patch)) {
        const rescheduled = await Promise.all(plantsRef.current.map(withReminders));
        await savePlants(rescheduled);
      }
    },
    [savePlants, withReminders],
  );

  const restoreBackup = useCallback(
    async (restored: Plant[], backupSettings: BackupSettings, mode: 'merge' | 'replace') => {
      const old = plantsRef.current;
      if (mode === 'replace') {
        await Promise.all(old.map(cancelPlantReminders));
        // Keep this device's API keys; everything else comes from the backup.
        const next = { ...settingsRef.current, ...backupSettings, plantNetApiKey: settingsRef.current.plantNetApiKey, geminiApiKey: settingsRef.current.geminiApiKey };
        settingsRef.current = next;
        setSettings(next);
        await persist(SETTINGS_KEY, JSON.stringify(next));
      }
      const combined = combinePlants(old, restored, mode);
      await savePlants(await Promise.all(combined.map(withReminders)));
      if (mode === 'replace') {
        const keep = new Set(photoUris(combined));
        photoUris(old).forEach((uri) => !keep.has(uri) && deletePhoto(uri));
      }
    },
    [savePlants, withReminders],
  );

  // Plants without the user's own photo get a Wikipedia reference photo of their species, once.
  const lookingUp = useRef(new Set<string>());
  useEffect(() => {
    if (!ready) return;
    for (const p of plants) {
      if (p.photoUri || p.refPhoto !== undefined || !(p.species || p.commonName) || lookingUp.current.has(p.id)) continue;
      lookingUp.current.add(p.id);
      findRefPhoto([p.species, p.commonName, p.aiCare?.commonName])
        .then((refPhoto) => (refPhoto === undefined ? undefined : updatePlant(p.id, { refPhoto })))
        .finally(() => lookingUp.current.delete(p.id));
    }
  }, [ready, plants, updatePlant]);

  // Outdoor plants: fetch rain for the user's place and log soaking rain as a watering.
  const weather = settings.weather;
  const hasOutdoor = plants.some((p) => p.outdoor);
  useEffect(() => {
    if (!ready || !weather || !hasOutdoor) return;
    let cancelled = false;
    (async () => {
      const days = await getRain(weather.latitude, weather.longitude).catch(() => [] as RainDay[]);
      if (cancelled) return;
      setRain(days);
      for (const p of plantsRef.current.filter((x) => x.outdoor)) {
        const since = p.lastWatered ? ymd(new Date(p.lastWatered)) : undefined;
        const soak = lastSoakingRain(days, since);
        if (!soak) continue;
        const at = new Date(`${soak.date}T12:00:00`).toISOString();
        const event: CareEvent = { id: newId(), type: 'water', at, note: `Rain (${formatRain(soak.mm, unitsOf(settingsRef.current))})` };
        await updatePlant(p.id, { lastWatered: at, history: [event, ...p.history] });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, weather, hasOutdoor, updatePlant]);

  const value = useMemo(
    () => ({ ready, plants, settings, addPlant, updatePlant, removePlant, logCare, removeCareEvent, updateSettings, restoreBackup, rain }),
    [ready, plants, settings, addPlant, updatePlant, removePlant, logCare, removeCareEvent, updateSettings, restoreBackup, rain],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlants(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePlants must be used inside PlantStoreProvider');
  return ctx;
}
