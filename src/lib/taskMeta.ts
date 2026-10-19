import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { TaskKind } from './schedule';
import { colors } from './theme';

type Meta = { verb: string; name: string; icon: ComponentProps<typeof Ionicons>['name']; color: string; soft: string; emoji: string; blurb: string };

/** Labels, icons and colours for each care task, shared by Today, plant pages and notifications. */
export const TASK_META: Record<TaskKind, Meta> = {
  water: { verb: 'Water', name: 'Water', icon: 'water', color: colors.water, soft: colors.waterSoft, emoji: '💧', blurb: 'Check the soil first.' },
  fertilize: { verb: 'Fertilise', name: 'Fertilise', icon: 'flask', color: colors.feed, soft: colors.feedSoft, emoji: '🌱', blurb: 'Diluted fertiliser.' },
  mist: { verb: 'Mist', name: 'Mist', icon: 'rainy', color: colors.mist, soft: colors.mistSoft, emoji: '💦', blurb: 'A fine spray on the leaves raises humidity.' },
  clean: { verb: 'Wipe leaves of', name: 'Clean leaves', icon: 'sparkles', color: colors.clean, soft: colors.cleanSoft, emoji: '✨', blurb: 'Dust blocks light; wipe with a damp cloth.' },
  repot: { verb: 'Repot', name: 'Repot', icon: 'cube', color: colors.primary, soft: colors.primarySoft, emoji: '🪴', blurb: 'Check roots; move up one pot size if crowded.' },
};
