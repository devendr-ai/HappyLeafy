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

/** 'check' = the user checked the soil and decided not to water yet (note says what they found). */
export type CareEventType = 'water' | 'check' | 'fertilize' | 'mist' | 'clean' | 'repot' | 'prune' | 'note';

/** Optional care tasks beyond water and food. */
export type ExtraCare = 'mist' | 'clean' | 'repot';

export type CareEvent = {
  id: string;
  type: CareEventType;
  at: string; // ISO date
  note?: string;
  /** What lastWatered / lastFertilized / waterCheckAfter was before this event, so deleting it can restore it. */
  prev?: string;
};

export type FollowUpOutcome = 'better' | 'same' | 'worse';

/** A check-in on saved advice: did it help? Pending until outcome is set. */
export type FollowUp = { dueAt: string; lookFor?: string; outcome?: FollowUpOutcome; note?: string; doneAt?: string };

export type SavedAdvice = { id: string; at: string; source: 'chat' | 'diagnosis'; question: string; answer: string; followUp?: FollowUp };

/** A stock photo of the species, shown until the user adds their own. */
export type RefPhoto = { url: string; credit: string; link?: string };

export type Plant = {
  id: string;
  nickname: string;
  species?: string; // scientific name
  family?: string; // botanical family, used for care-guide fallback
  /** Care profile written by Gemini for species missing from the bundled guide. */
  aiCare?: CareProfile;
  commonName?: string;
  photoUri?: string;
  /** Reference photo from identification or Wikipedia. null = looked, none found. */
  refPhoto?: RefPhoto | null;
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
  /** Soil was still damp at a check: look again on this date instead of the usual interval. */
  waterCheckAfter?: string;
  lastFertilized?: string;
  history: CareEvent[];
  /** AI answers and diagnoses the user chose to keep, newest first. */
  savedAdvice?: SavedAdvice[];
  /** Scheduled local notification ids (native only). */
  notificationIds?: string[];
};

export type Settings = {
  /** Display units; unset follows the phone's region. */
  units?: import('./units').Units;
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
  /** One-time "what gets sent where" notices the user has accepted. */
  consents?: { plantnet?: boolean; ai?: boolean };
  /** Last successful backup export, and until when the backup reminder is snoozed (ISO dates). */
  lastBackupAt?: string;
  backupNudgeUntil?: string;
};
