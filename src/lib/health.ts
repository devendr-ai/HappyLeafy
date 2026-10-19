import { addDays, plantWaterInterval, startOfDay, type ScheduleContext } from './schedule';
import type { Plant } from './types';

/** A watering this many days after it was due still counts as on time. */
export const GRACE_DAYS = 1;
/** How many recent waterings the score looks at. */
const WINDOW = 6;
const DAY = 86_400_000;

export type Health = {
  /** 0–100 */
  score: number;
  label: 'Thriving' | 'Healthy' | 'Needs care' | 'Struggling';
  emoji: string;
  /** Days since the plant was last overdue (or since it was added). 0 while overdue. */
  streak: number;
  /** On-time waterings among the last few. */
  onTime: number;
  checked: number;
  /** Days currently overdue (0 if not). */
  overdueBy: number;
};

const dayDiff = (a: Date, b: Date) => Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY);

/**
 * Score and streak from the watering history. Uses the plant's current effective
 * interval for past gaps too (past intervals aren't stored), which is close enough.
 */
export function plantHealth(p: Plant, ctx: ScheduleContext = {}): Health {
  const now = ctx.now ?? new Date();
  const interval = plantWaterInterval(p, ctx).days;
  const allowed = interval + GRACE_DAYS;

  // Chronological watering moments, starting from when the plant was added.
  const waterings = p.history
    .filter((e) => e.type === 'water')
    .map((e) => new Date(e.at))
    .sort((a, b) => a.getTime() - b.getTime());
  const points = [new Date(p.createdAt), ...waterings];
  // An older lastWatered (set when adding, e.g. "a week ago") anchors the first gap.
  if (p.lastWatered && waterings.length === 0) points[0] = new Date(Math.min(new Date(p.lastWatered).getTime(), points[0].getTime()));

  // Each gap between waterings: on time, or the day it went overdue.
  let lastOverdue: Date | undefined;
  const gaps: boolean[] = [];
  for (let i = 1; i < points.length; i++) {
    const gap = dayDiff(points[i - 1], points[i]);
    const ok = gap <= allowed;
    gaps.push(ok);
    if (!ok) lastOverdue = addDays(startOfDay(points[i - 1]), allowed + 1);
  }

  // The current, still-open gap.
  const last = points[points.length - 1];
  const sinceLast = dayDiff(last, now);
  const overdueBy = Math.max(0, sinceLast - interval);
  if (sinceLast > allowed) lastOverdue = addDays(startOfDay(last), allowed + 1);

  const recent = gaps.slice(-WINDOW);
  const onTime = recent.filter(Boolean).length;
  const ratio = recent.length ? onTime / recent.length : 1;
  const penalty = Math.min(60, overdueBy * 15);
  const score = Math.max(0, Math.min(100, Math.round(100 * ratio - penalty)));

  const start = lastOverdue && lastOverdue.getTime() <= now.getTime() ? lastOverdue : new Date(p.createdAt);
  const streak = sinceLast > allowed ? 0 : Math.max(0, dayDiff(start, now));

  const [label, emoji]: [Health['label'], string] =
    score >= 85 ? ['Thriving', '🌿'] : score >= 65 ? ['Healthy', '🙂'] : score >= 40 ? ['Needs care', '😟'] : ['Struggling', '🍂'];
  return { score, label, emoji, streak, onTime, checked: recent.length, overdueBy };
}

/** Garden-wide streak: days since any plant was last overdue (the weakest plant sets it). */
export function gardenStreak(plants: Plant[], ctx: ScheduleContext = {}): number {
  if (plants.length === 0) return 0;
  return Math.min(...plants.map((p) => plantHealth(p, ctx).streak));
}

/** Milestone reached by a streak, for a little celebration label. */
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

