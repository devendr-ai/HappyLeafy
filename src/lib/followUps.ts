import { addDays, startOfDay } from './schedule';
import type { FollowUp, FollowUpOutcome, Plant, SavedAdvice } from './types';

/** Check-in delays offered when saving advice, in days. */
export const FOLLOW_UP_CHOICES = [
  { days: 3, label: '3 days' },
  { days: 7, label: '1 week' },
  { days: 14, label: '2 weeks' },
] as const;

export const OUTCOME_LABEL: Record<FollowUpOutcome, string> = { better: 'Better 👍', same: 'No change', worse: 'Worse' };

/** A pending check-in `days` from today. */
export function newFollowUp(days: number, lookFor?: string): FollowUp {
  return { dueAt: addDays(startOfDay(new Date()), Math.max(1, Math.round(days))).toISOString(), lookFor: lookFor?.trim() || undefined };
}

export const isPending = (a: SavedAdvice) => !!a.followUp && !a.followUp.outcome;

/** Saved advice whose check-in is due on or before `day`, oldest first. */
export function dueFollowUps(plants: Plant[], day = new Date()): { plant: Plant; advice: SavedAdvice }[] {
  const end = startOfDay(day).getTime();
  return plants
    .flatMap((plant) => (plant.savedAdvice ?? []).filter((a) => isPending(a) && startOfDay(new Date(a.followUp!.dueAt)).getTime() <= end).map((advice) => ({ plant, advice })))
    .sort((x, y) => x.advice.followUp!.dueAt.localeCompare(y.advice.followUp!.dueAt));
}

/** What the check-in asks, e.g. "Is there new green growth?" or a generic question about the advice. */
export function checkInQuestion(a: SavedAdvice, nickname: string): string {
  return a.followUp?.lookFor ?? `Has ${nickname} improved since you tried this?`;
}
