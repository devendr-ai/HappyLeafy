import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { deletePhoto } from './photos';
import { cancelPlantReminders, schedulePlantReminders } from './reminders';
import type { CareEvent, CareEventType, Plant, Settings } from './types';

const PLANTS_KEY = 'happyleafy.plants.v1';
const SETTINGS_KEY = 'happyleafy.settings.v1';

const DEFAULT_SETTINGS: Settings = {
  plantNetApiKey: process.env.EXPO_PUBLIC_PLANTNET_KEY ?? '',
  geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_KEY ?? '',
  reminderHour: 9,
  remindersEnabled: true,
  hemisphere: 'northern',
};

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
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
};

const Ctx = createContext<Store | null>(null);

export function PlantStoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  // Refs let async actions see the latest state without stale closures.
  const plantsRef = useRef(plants);
  const settingsRef = useRef(settings);

  useEffect(() => {
    (async () => {
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

  const savePlants = useCallback(async (next: Plant[]) => {
    plantsRef.current = next;
    setPlants(next);
    await AsyncStorage.setItem(PLANTS_KEY, JSON.stringify(next));
  }, []);

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
      const event: CareEvent = { id: newId(), type, at: now, note };
      const patch: Partial<Plant> = { history: [event, ...existing.history] };
      if (type === 'water') patch.lastWatered = now;
      if (type === 'fertilize') patch.lastFertilized = now;
      await updatePlant(id, patch);
    },
    [updatePlant],
  );

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      const next = { ...settingsRef.current, ...patch };
      settingsRef.current = next;
      setSettings(next);
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      if ('reminderHour' in patch || 'remindersEnabled' in patch || 'hemisphere' in patch) {
        const rescheduled = await Promise.all(plantsRef.current.map(withReminders));
        await savePlants(rescheduled);
      }
    },
    [savePlants, withReminders],
  );

  const value = useMemo(
    () => ({ ready, plants, settings, addPlant, updatePlant, removePlant, logCare, updateSettings }),
    [ready, plants, settings, addPlant, updatePlant, removePlant, logCare, updateSettings],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlants(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePlants must be used inside PlantStoreProvider');
  return ctx;
}
