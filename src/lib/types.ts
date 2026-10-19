export type Light = 'low' | 'medium' | 'bright-indirect' | 'direct';

export type CareProfile = {
  /** Key used to match identification results (genus or "Genus species"). */
  key: string;
  commonName: string;
  waterEveryDays: number;
  fertilizeEveryDays: number;
  light: Light;
  humidity: 'low' | 'medium' | 'high';
  tempC: [number, number];
  soil: string;
  toxicToPets: boolean;
  difficulty: 'easy' | 'moderate' | 'hard';
  tips: string[];
};

export type PotMaterial = 'plastic' | 'terracotta' | 'glazed';
export type PotSize = 'small' | 'medium' | 'large';
export type Hemisphere = 'northern' | 'southern';

export type CareEventType = 'water' | 'fertilize' | 'mist' | 'clean' | 'repot' | 'prune' | 'note';

/** Optional care tasks beyond water and food. */
export type ExtraCare = 'mist' | 'clean' | 'repot';

export type CareEvent = {
  id: string;
  type: CareEventType;
  at: string; // ISO date
  note?: string;
};

export type Plant = {
  id: string;
  nickname: string;
  species?: string; // scientific name
  family?: string; // botanical family, used for care-guide fallback
  /** Care profile written by Gemini for species missing from the bundled guide. */
  aiCare?: CareProfile;
  commonName?: string;
  photoUri?: string;
  location?: string;
  createdAt: string;
  waterEveryDays: number;
  fertilizeEveryDays: number;
  /** Pot and spot details. All optional: unset means no adjustment to the watering interval. */
  potMaterial?: PotMaterial;
  potSize?: PotSize;
  drainage?: boolean;
  lightAtLocation?: Light;
  /** Outdoor plants skip watering after enough rain. */
  outdoor?: boolean;
  /** Pot inner diameter in cm, for the water amount. Falls back to potSize. */
  potDiameterCm?: number;
  /** Per-plant interval overrides for extra care, in days (0 = off). Unset uses the care-guide default. */
  extraCare?: Partial<Record<ExtraCare, number>>;
  /** Growth timeline, newest first. The cover photo is photoUri. */
  timeline?: { id: string; uri: string; at: string }[];
  lastWatered?: string;
  lastFertilized?: string;
  history: CareEvent[];
  /** Scheduled local notification ids (native only). */
  notificationIds?: string[];
};

export type Settings = {
  plantNetApiKey: string;
  geminiApiKey: string;
  reminderHour: number;
  remindersEnabled: boolean;
  /** 'summary' (default): one morning notification listing everything due. 'each': one per plant and task. */
  reminderStyle?: 'summary' | 'each';
  hemisphere: Hemisphere;
  /** While set, reminders pause; on return the schedule restarts from the return date. */
  vacation?: { until: string };
  /** Where outdoor plants live, for rain data (Open-Meteo). */
  weather?: { latitude: number; longitude: number; place: string };
  /** Set once the first-launch welcome has been completed or skipped. */
  onboarded?: boolean;
};
