import { careForPlant, DEFAULT_PROFILE } from './careDb';
import { plantWaterInterval, type ScheduleContext } from './schedule';
import type { CareProfile, Plant, PotSize } from './types';

/** Typical inner diameters when only small / medium / large is known (same as waterAmount). */
const DIAMETER_CM: Record<PotSize, number> = { small: 10, medium: 15, large: 25 };

export type SoilGuidance = {
  /** One line shown first: how to check this plant. */
  short: string;
  /** What "dry" and "still damp" look like for this plant, under the two main answers. */
  dryHint: string;
  dampHint: string;
  /** Full how-to for "Not sure": method, then this plant's own signs, then notes about its pot and spot. */
  steps: string[];
};

type Method = 'air' | 'mounted' | 'orchid' | 'bromeliad' | 'dry-out' | 'moist' | 'standard';

const BROMELIADS = /^(Guzmania|Vriesea|Aechmea|Neoregelia|Bromeliaceae)$/;

function methodFor(care: CareProfile, p: Plant): Method {
  const soil = care.soil.toLowerCase();
  if (soil.startsWith('none')) return 'air';
  if (soil.startsWith('mounted')) return 'mounted';
  if (BROMELIADS.test(care.key)) return 'bromeliad';
  if (soil.includes('orchid bark') && /phalaenopsis|orchid/i.test(`${care.key} ${care.commonName}`)) return 'orchid';
  if (care.humidity === 'low' || p.waterEveryDays >= 14) return 'dry-out';
  if (care.humidity === 'high' || p.waterEveryDays <= 4) return 'moist';
  return 'standard';
}

/** The care guide's own rule for when to water, e.g. "Water when the top half of the soil is dry." */
const RULE = /^(water when|let (the )?(top|soil|it)|keep (soil|evenly|it)|soak|never let|water about)/i;
/** The plant's own thirst signs, e.g. "Dramatic droop means it needs water now." */
const SIGN = /droop|faint|wrinkl|curl|perks|mushy|thirsty|silvery|feels light/i;

/** How to check this plant's soil, from its care guide, pot and spot. Pure: no I/O. */
export function soilGuidance(p: Plant, ctx: ScheduleContext): SoilGuidance {
  const care = careForPlant(p) ?? DEFAULT_PROFILE;
  const name = care === DEFAULT_PROFILE ? 'this plant' : `a ${care.commonName.toLowerCase()}`;
  const method = methodFor(care, p);
  const diameter = p.potDiameterCm ?? (p.potSize ? DIAMETER_CM[p.potSize] : undefined);
  const rule = care.tips.find((t) => RULE.test(t));
  const signs = care.tips.filter((t) => t !== rule && SIGN.test(t));

  let g: Omit<SoilGuidance, 'steps'> & { how: string[] };
  switch (method) {
    case 'air':
      g = {
        short: `${p.nickname} has no soil to check. Look at the leaves instead.`,
        dryHint: 'Leaves look dull, curl in or feel stiff',
        dampHint: 'Leaves look fresh and green',
        how: ['Soak it in a bowl of water for 20–30 minutes, then shake it off and let it dry upside down within 4 hours.'],
      };
      break;
    case 'mounted':
      g = {
        short: 'Feel the moss on the board and lift it: water when the moss is dry and the board feels light.',
        dryHint: 'Moss is dry and the board feels light',
        dampHint: 'Moss still feels damp',
        how: ['Soak the whole mount in water for about 10 minutes, then let it drain.'],
      };
      break;
    case 'orchid':
      g = {
        short: 'Look at the roots through the clear pot: silvery roots are dry, green roots are still wet.',
        dryHint: 'Roots look silvery and the pot feels light',
        dampHint: 'Roots are green or the bark is still dark',
        how: ['Bark doesn’t feel dry like soil, so trust the roots and the weight of the pot more than your finger.'],
      };
      break;
    case 'bromeliad':
      g = {
        short: 'Check the cup in the middle of the leaves still holds water, then touch the mix around the roots.',
        dryHint: 'Cup is empty and the mix is dry',
        dampHint: 'Cup has water and the mix is damp',
        how: ['Top up the central cup with a little water and keep the mix only just moist. Refresh the cup weekly so it doesn’t go stale.'],
      };
      break;
    case 'dry-out':
      g = {
        short: 'Let it dry out completely. Check the bottom of the pot, not just the top.',
        dryHint: 'Dry all the way down',
        dampHint: 'Any moisture lower down',
        how: ['Push a wooden skewer or chopstick to the bottom of the pot and leave it a minute. Water only if it comes out clean and dry.'],
      };
      break;
    case 'moist':
      g = {
        short: 'Keep it lightly moist. Touch the surface of the soil.',
        dryHint: 'Top 1–2 cm feels dry',
        dampHint: 'Surface still feels cool and damp',
        how: ['Water when the top 1–2 cm feels dry to the touch, before the whole pot dries out.'],
      };
      break;
    default: {
      // How deep to check: the care guide's own depth if it gives one ("top 5 cm", "top half"),
      // else about a third of the way down: deeper in a big pot, shallower in a small one.
      const fraction = rule?.match(/top (third|half)/i)?.[1].toLowerCase() === 'half' ? 2 : 3;
      const stated = rule?.match(/top (\d+)(?:\s*[–-]\s*\d+)?\s*cm/i)?.[1];
      const depth = stated ? Number(stated) : diameter ? Math.min(8, Math.max(2, Math.round(diameter / fraction))) : undefined;
      const where = depth ? `${depth} cm` : '3–5 cm';
      g = {
        short: depth && depth > 6 ? `Check about ${where} down with a skewer: deeper than a finger reaches in this big pot.` : `Push a finger about ${where} into the soil (to the second knuckle).`,
        dryHint: `Dry ${where} down`,
        dampHint: `Cool or damp ${where} down`,
        how: [`Water if it feels dry at about ${where}. If it feels cool and damp, wait.`],
      };
    }
  }

  // The care guide's own rule is the most specific advice there is, so it leads and the method becomes the first step.
  const leadWithRule = !!rule && (method === 'standard' || method === 'moist' || method === 'dry-out');
  const short = leadWithRule ? `For ${name}: ${rule.charAt(0).toLowerCase()}${rule.slice(1)}` : g.short;
  // With the guide's rule leading, the finger test is just the how-to; its "water if dry at…" line would repeat the rule.
  const how = leadWithRule ? (method === 'standard' ? [g.short] : [g.short, ...g.how]) : g.how;

  const setup: string[] = [];
  if (p.drainage === false) setup.push('No drainage hole: water collects at the bottom, so push a skewer all the way down even if the top is dry. If it comes out wet, don’t water.');
  if (p.potMaterial === 'terracotta') setup.push('Terracotta dries through its sides too: a dry pot looks paler and feels lighter.');
  if (diameter && diameter >= 25 && method !== 'dry-out') setup.push('Big pot: the surface dries long before the roots do, so check deeper.');
  if (diameter && diameter <= 10) setup.push('Small pot: it dries fast, so check it more often in warm weather.');
  const adjustments = plantWaterInterval(p, ctx).adjustments;
  if (adjustments.some((a) => a.key === 'light' && a.factor > 1)) setup.push('Less light than it likes here, so the soil stays damp longer.');
  if (adjustments.some((a) => a.key === 'season' && a.hint.includes('winter'))) setup.push('Winter: growth slows, so let it dry a little more than in summer.');
  if (p.outdoor) setup.push('Outdoors, sun and wind dry pots fast; after rain, check anyway: leaves can shield the soil.');

  const common = [
    'Lift the pot: a dry pot feels noticeably lighter than a freshly watered one.',
    'Drooping leaves with dry soil mean thirsty. Drooping with wet soil means too much water, so don’t water.',
  ];
  return {
    short,
    dryHint: g.dryHint,
    dampHint: g.dampHint,
    steps: [...how, ...signs, ...setup, ...(method === 'air' || method === 'mounted' ? [] : common)],
  };
}
