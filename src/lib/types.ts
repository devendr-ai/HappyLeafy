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

export type CareEventType = 'water' | 'fertilize' | 'repot' | 'prune' | 'note';

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
  commonName?: string;
  photoUri?: string;
  location?: string;
  createdAt: string;
  waterEveryDays: number;
  fertilizeEveryDays: number;
  lastWatered?: string;
  lastFertilized?: string;
  history: CareEvent[];
  /** Scheduled local notification ids (native only). */
  notificationIds?: string[];
};

export type Settings = {
  plantNetApiKey: string;
  reminderHour: number;
  remindersEnabled: boolean;
};
