import { careForPlant, DEFAULT_PROFILE } from './careDb';
import type { Hemisphere, Light, Plant, PotMaterial, PotSize } from './types';

const DAY = 24 * 60 * 60 * 1000;

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

/** Whole days from today until `date` (negative = overdue). */
export function daysUntil(date: Date, now = new Date()): number {
  return Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / DAY);
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

/** Meteorological seasons: Dec–Feb is winter in the north, summer in the south. */
export function seasonFor(date: Date, hemisphere: Hemisphere = 'northern'): Season {
  const month = (date.getMonth() + (hemisphere === 'southern' ? 6 : 0)) % 12;
  if (month === 11 || month <= 1) return 'winter';
  if (month <= 4) return 'spring';
  if (month <= 7) return 'summer';
  return 'autumn';
}

export type WaterAdjustment = {
  key: string;
  /** Multiplier on the interval: above 1 = water less often, below 1 = more often. */
  factor: number;
  hint: string;
};

export type WaterIntervalInput = {
  baseDays: number;
  season: Season;
  potMaterial?: PotMaterial;
  potSize?: PotSize;
  drainage?: boolean;
  lightAtLocation?: Light;
  /** The light the species prefers; location light is compared against it. */
  idealLight?: Light;
};

export type WaterInterval = { baseDays: number; days: number; adjustments: WaterAdjustment[] };

const SEASON: Record<Season, WaterAdjustment | null> = {
  spring: null,
  summer: { key: 'season', factor: 0.85, hint: 'Adjusted for summer: water more often' },
  autumn: { key: 'season', factor: 1.15, hint: 'Adjusted for autumn: water a little less' },
  winter: { key: 'season', factor: 1.4, hint: 'Adjusted for winter: water less often' },
};

const POT_MATERIAL: Record<PotMaterial, WaterAdjustment | null> = {
  plastic: null,
  glazed: null,
  terracotta: { key: 'pot-material', factor: 0.85, hint: 'Terracotta pot dries out faster' },
};

const POT_SIZE: Record<PotSize, WaterAdjustment | null> = {
  small: { key: 'pot-size', factor: 0.85, hint: 'Small pot dries out faster' },
  medium: null,
  large: { key: 'pot-size', factor: 1.15, hint: 'Large pot stays moist longer' },
};

const LIGHT_ORDER: Light[] = ['low', 'medium', 'bright-indirect', 'direct'];

/**
 * Effective watering interval: the base interval (growing-season default from the care guide,
 * or the user's override) adjusted for season, pot and light. Pure, so it is easy to test.
 */
export function effectiveWaterInterval(input: WaterIntervalInput): WaterInterval {
  const adjustments: WaterAdjustment[] = [];
  const add = (a: WaterAdjustment | null | undefined) => a && adjustments.push(a);

  add(SEASON[input.season]);
  if (input.potMaterial) add(POT_MATERIAL[input.potMaterial]);
  if (input.potSize) add(POT_SIZE[input.potSize]);
  if (input.drainage === false) add({ key: 'drainage', factor: 1.2, hint: 'No drainage hole: water sparingly' });
  if (input.lightAtLocation) {
    // Each step darker than the species likes slows drying; each step brighter speeds it up.
    const steps = LIGHT_ORDER.indexOf(input.lightAtLocation) - LIGHT_ORDER.indexOf(input.idealLight ?? 'bright-indirect');
    if (steps < 0) add({ key: 'light', factor: 1 + 0.15 * -steps, hint: 'Less light than it likes: soil dries slower' });
    if (steps > 0) add({ key: 'light', factor: 1 - 0.1 * steps, hint: 'More light than it likes: soil dries faster' });
  }

  // Clamp so stacked adjustments never more than halve or double the interval.
  const factor = Math.min(2, Math.max(0.5, adjustments.reduce((f, a) => f * a.factor, 1)));
  return { baseDays: input.baseDays, days: Math.max(1, Math.round(input.baseDays * factor)), adjustments };
}

export type ScheduleContext = { hemisphere?: Hemisphere; now?: Date };

/** A plant's current watering interval, using its pot/spot details and the season at `now`. */
export function plantWaterInterval(p: Plant, { hemisphere = 'northern', now = new Date() }: ScheduleContext = {}): WaterInterval {
  return effectiveWaterInterval({
    baseDays: p.waterEveryDays,
    season: seasonFor(now, hemisphere),
    potMaterial: p.potMaterial,
    potSize: p.potSize,
    drainage: p.drainage,
    lightAtLocation: p.lightAtLocation,
    idealLight: (careForPlant(p) ?? DEFAULT_PROFILE).light,
  });
}

export function nextWaterDate(p: Plant, ctx: ScheduleContext = {}): Date {
  const base = p.lastWatered ? new Date(p.lastWatered) : new Date(p.createdAt);
  return addDays(startOfDay(base), plantWaterInterval(p, ctx).days);
}

export function nextFertilizeDate(p: Plant): Date {
  const base = p.lastFertilized ? new Date(p.lastFertilized) : new Date(p.createdAt);
  return addDays(startOfDay(base), p.fertilizeEveryDays);
}

export type Task = { plant: Plant; kind: 'water' | 'fertilize'; due: Date; days: number };

/** All tasks due within `horizonDays`, overdue first. */
export function upcomingTasks(plants: Plant[], horizonDays = 7, ctx: ScheduleContext = {}): Task[] {
  const now = ctx.now ?? new Date();
  const tasks: Task[] = [];
  for (const plant of plants) {
    const w = nextWaterDate(plant, { ...ctx, now });
    const f = nextFertilizeDate(plant);
    const wd = daysUntil(w, now);
    const fd = daysUntil(f, now);
    if (wd <= horizonDays) tasks.push({ plant, kind: 'water', due: w, days: wd });
    if (fd <= horizonDays) tasks.push({ plant, kind: 'fertilize', due: f, days: fd });
  }
  return tasks.sort((a, b) => a.days - b.days);
}

export function dueLabel(days: number): string {
  if (days < -1) return `${-days} days overdue`;
  if (days === -1) return '1 day overdue';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

/** Return date while vacation mode is on; undefined once it has passed or when off. */
export function vacationUntil(settings: { vacation?: { until: string } }, now = new Date()): Date | undefined {
  if (!settings.vacation) return undefined;
  const until = startOfDay(new Date(settings.vacation.until));
  return until.getTime() > startOfDay(now).getTime() ? until : undefined;
}
