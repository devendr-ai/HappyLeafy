import { addDays, nextWaterDate, plantWaterInterval, startOfDay, type ScheduleContext } from './schedule';
import type { Plant } from './types';

/**
 * Care activity: how consistently the owner checks on a plant. This is about the routine, NOT the
 * plant's health. A check counts whether or not the plant was watered: recording "soil still damp"
 * and not watering is good care.
 */

/** A check this many days after it was due still counts as on time. */
export const GRACE_DAYS = 1;
/** Until a plant has this many check-ins (and is a couple of weeks old) we're still getting to know it. */
const MIN_CHECKS = 2;
const WINDOW = 6;
const DAY = 86_400_000;

export type CareActivity = {
  /** Fewer than two check-ins yet: show "getting to know your plant" instead of stats. */
  isNew: boolean;
  /** Days since a check was last missed (or since the plant was added). 0 while a check is overdue. */
  streak: number;
  /** Check-ins that happened on time, among the last few. */
  onTime: number;
  checked: number;
  /** Days the current check is overdue (0 if not). */
  overdueBy: number;
  /** Most recent check-in: watered, or checked and left. */
  last?: { at: string; watered: boolean; note?: string };
};

const dayDiff = (a: Date, b: Date) => Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY);

export function careActivity(p: Plant, ctx: ScheduleContext = {}): CareActivity {
  const now = ctx.now ?? new Date();
  const allowed = plantWaterInterval(p, ctx).days + GRACE_DAYS;

  // Check-ins (watering or a soil check), oldest first, starting from when the plant was added.
  const checks = p.history.filter((e) => e.type === 'water' || e.type === 'check').sort((a, b) => a.at.localeCompare(b.at));
  const points = [new Date(p.createdAt), ...checks.map((e) => new Date(e.at))];

  let lastMissed: Date | undefined;
  const gaps: boolean[] = [];
  for (let i = 1; i < points.length; i++) {
    const ok = dayDiff(points[i - 1], points[i]) <= allowed;
    gaps.push(ok);
    if (!ok) lastMissed = addDays(startOfDay(points[i - 1]), allowed + 1);
  }

  // The open period: overdue is measured against the actual next check date (which a damp check may have pushed back).
  const overdueBy = Math.max(0, -Math.round((startOfDay(nextWaterDate(p, ctx)).getTime() - startOfDay(now).getTime()) / DAY) - GRACE_DAYS);
  if (overdueBy > 0) lastMissed = addDays(startOfDay(nextWaterDate(p, ctx)), GRACE_DAYS + 1);

  const recent = gaps.slice(-WINDOW);
  const start = lastMissed && lastMissed.getTime() <= now.getTime() ? lastMissed : new Date(p.createdAt);
  const lastEvent = checks[checks.length - 1];

  return {
    isNew: checks.length < MIN_CHECKS && dayDiff(new Date(p.createdAt), now) < 14,
    streak: overdueBy > 0 ? 0 : Math.max(0, dayDiff(start, now)),
    onTime: recent.filter(Boolean).length,
    checked: recent.length,
    overdueBy,
    last: lastEvent && { at: lastEvent.at, watered: lastEvent.type === 'water', note: lastEvent.note },
  };
}

/** Garden-wide check-in streak: the plant checked least consistently sets it. */
export function gardenStreak(plants: Plant[], ctx: ScheduleContext = {}): number {
  if (plants.length === 0) return 0;
  return Math.min(...plants.map((p) => careActivity(p, ctx).streak));
}

export function streakMilestone(days: number): string | undefined {
  const marks: [number, string][] = [
    [365, 'A whole year 🏆'],
    [100, '100 days 💯'],
    [30, 'One month 🌳'],
    [14, 'Two weeks 🌱'],
    [7, 'One week ✨'],
  ];
  return marks.find(([d]) => days >= d)?.[1];
}
