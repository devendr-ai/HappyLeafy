import type { Plant } from './types';

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

export function nextWaterDate(p: Plant): Date {
  const base = p.lastWatered ? new Date(p.lastWatered) : new Date(p.createdAt);
  return addDays(startOfDay(base), p.waterEveryDays);
}

export function nextFertilizeDate(p: Plant): Date {
  const base = p.lastFertilized ? new Date(p.lastFertilized) : new Date(p.createdAt);
  return addDays(startOfDay(base), p.fertilizeEveryDays);
}

export type Task = { plant: Plant; kind: 'water' | 'fertilize'; due: Date; days: number };

/** All tasks due within `horizonDays`, overdue first. */
export function upcomingTasks(plants: Plant[], horizonDays = 7, now = new Date()): Task[] {
  const tasks: Task[] = [];
  for (const plant of plants) {
    const w = nextWaterDate(plant);
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
