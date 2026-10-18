import type { CareProfile } from './types';

/**
 * Bundled care guide for common houseplants, keyed by genus (or "Genus species"
 * when a species differs a lot from its genus). Offline and free: no care API needed.
 * Intervals are indoor, growing-season defaults; the user can override per plant.
 */
const PROFILES: CareProfile[] = [
  { key: 'Monstera', commonName: 'Monstera', waterEveryDays: 7, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [18, 29], soil: 'Chunky aroid mix (bark, perlite, coir)', toxicToPets: true, difficulty: 'easy', tips: ['Water when the top 5 cm of soil is dry.', 'Give it a moss pole to get bigger, split leaves.', 'Wipe leaves monthly so they can photosynthesise.'] },
  { key: 'Epipremnum', commonName: 'Pothos', waterEveryDays: 7, fertilizeEveryDays: 30, light: 'medium', humidity: 'medium', tempC: [15, 29], soil: 'General potting mix with perlite', toxicToPets: true, difficulty: 'easy', tips: ['Droopy leaves mean thirsty; it perks up within hours of watering.', 'Pinch stems to keep it bushy.'] },
  { key: 'Philodendron', commonName: 'Philodendron', waterEveryDays: 7, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [16, 29], soil: 'Airy aroid mix', toxicToPets: true, difficulty: 'easy', tips: ['Let the top third of soil dry between waterings.', 'Yellow lower leaves usually mean overwatering.'] },
  { key: 'Ficus lyrata', commonName: 'Fiddle Leaf Fig', waterEveryDays: 9, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [16, 27], soil: 'Well-draining mix with bark', toxicToPets: true, difficulty: 'hard', tips: ['Hates being moved; pick a bright spot and keep it there.', 'Rotate a quarter turn each month for even growth.', 'Brown spots in the middle of leaves often mean root rot.'] },
  { key: 'Ficus elastica', commonName: 'Rubber Plant', waterEveryDays: 10, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [16, 29], soil: 'Well-draining potting mix', toxicToPets: true, difficulty: 'easy', tips: ['Water when the top half of the soil is dry.', 'Wipe dust off the big leaves.'] },
  { key: 'Ficus', commonName: 'Fig', waterEveryDays: 8, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [16, 27], soil: 'Well-draining potting mix', toxicToPets: true, difficulty: 'moderate', tips: ['Drops leaves when stressed by moves or drafts.'] },
  { key: 'Sansevieria', commonName: 'Snake Plant', waterEveryDays: 18, fertilizeEveryDays: 60, light: 'low', humidity: 'low', tempC: [13, 30], soil: 'Cactus / succulent mix', toxicToPets: true, difficulty: 'easy', tips: ['Let soil dry completely. Overwatering is the #1 killer.', 'Water about monthly in winter.'] },
  { key: 'Dracaena', commonName: 'Dracaena', waterEveryDays: 12, fertilizeEveryDays: 45, light: 'medium', humidity: 'medium', tempC: [16, 27], soil: 'General potting mix', toxicToPets: true, difficulty: 'easy', tips: ['Sensitive to fluoride: use filtered or rain water if tips brown.'] },
  { key: 'Zamioculcas', commonName: 'ZZ Plant', waterEveryDays: 18, fertilizeEveryDays: 60, light: 'low', humidity: 'low', tempC: [15, 29], soil: 'Well-draining mix with perlite', toxicToPets: true, difficulty: 'easy', tips: ['Rhizomes store water; when in doubt, do not water.'] },
  { key: 'Spathiphyllum', commonName: 'Peace Lily', waterEveryDays: 5, fertilizeEveryDays: 45, light: 'medium', humidity: 'high', tempC: [18, 29], soil: 'Rich, moisture-retaining potting mix', toxicToPets: true, difficulty: 'easy', tips: ['Dramatic droop means it needs water now.', 'Brown tips: try filtered water and more humidity.'] },
  { key: 'Chlorophytum', commonName: 'Spider Plant', waterEveryDays: 7, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [13, 27], soil: 'General potting mix', toxicToPets: false, difficulty: 'easy', tips: ['Root the baby plantlets in water to make new plants.', 'Brown tips usually mean tap-water salts.'] },
  { key: 'Calathea', commonName: 'Calathea', waterEveryDays: 5, fertilizeEveryDays: 30, light: 'medium', humidity: 'high', tempC: [18, 27], soil: 'Moist, airy mix with peat or coir', toxicToPets: false, difficulty: 'hard', tips: ['Keep soil lightly moist, never soggy.', 'Use filtered or rain water.', 'Curling leaves mean thirsty or low humidity.'] },
  { key: 'Goeppertia', commonName: 'Calathea', waterEveryDays: 5, fertilizeEveryDays: 30, light: 'medium', humidity: 'high', tempC: [18, 27], soil: 'Moist, airy mix with peat or coir', toxicToPets: false, difficulty: 'hard', tips: ['Keep soil lightly moist, never soggy.', 'Use filtered or rain water.'] },
  { key: 'Maranta', commonName: 'Prayer Plant', waterEveryDays: 5, fertilizeEveryDays: 30, light: 'medium', humidity: 'high', tempC: [18, 27], soil: 'Moist, airy mix', toxicToPets: false, difficulty: 'moderate', tips: ['Leaves fold up at night; that is normal.'] },
  { key: 'Aloe', commonName: 'Aloe', waterEveryDays: 18, fertilizeEveryDays: 90, light: 'direct', humidity: 'low', tempC: [13, 29], soil: 'Cactus / succulent mix', toxicToPets: true, difficulty: 'easy', tips: ['Soak and dry: water deeply, then wait until fully dry.', 'Thin, curling leaves mean it is thirsty.'] },
  { key: 'Echeveria', commonName: 'Echeveria', waterEveryDays: 14, fertilizeEveryDays: 90, light: 'direct', humidity: 'low', tempC: [10, 29], soil: 'Gritty succulent mix', toxicToPets: false, difficulty: 'easy', tips: ['Stretching toward the window means it needs more sun.'] },
  { key: 'Crassula', commonName: 'Jade Plant', waterEveryDays: 14, fertilizeEveryDays: 90, light: 'direct', humidity: 'low', tempC: [10, 27], soil: 'Cactus / succulent mix', toxicToPets: true, difficulty: 'easy', tips: ['Wrinkled leaves mean thirsty; mushy leaves mean overwatered.'] },
  { key: 'Haworthia', commonName: 'Haworthia', waterEveryDays: 14, fertilizeEveryDays: 90, light: 'bright-indirect', humidity: 'low', tempC: [10, 29], soil: 'Gritty succulent mix', toxicToPets: false, difficulty: 'easy', tips: ['Prefers bright shade over harsh afternoon sun.'] },
  { key: 'Cactaceae', commonName: 'Cactus', waterEveryDays: 21, fertilizeEveryDays: 90, light: 'direct', humidity: 'low', tempC: [10, 32], soil: 'Cactus mix', toxicToPets: false, difficulty: 'easy', tips: ['Barely water in winter.'] },
  { key: 'Ocimum', commonName: 'Basil', waterEveryDays: 2, fertilizeEveryDays: 14, light: 'direct', humidity: 'medium', tempC: [18, 30], soil: 'Rich, well-draining mix', toxicToPets: false, difficulty: 'moderate', tips: ['Pinch off flower buds to keep leaves coming.', 'Harvest from the top, above a leaf pair.'] },
  { key: 'Mentha', commonName: 'Mint', waterEveryDays: 2, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [13, 27], soil: 'Moist potting mix', toxicToPets: true, difficulty: 'easy', tips: ['Very vigorous; keep it in its own pot.'] },
  { key: 'Hoya', commonName: 'Hoya', waterEveryDays: 10, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [16, 29], soil: 'Chunky orchid/aroid mix', toxicToPets: false, difficulty: 'easy', tips: ['Do not cut old flower spurs; they rebloom.', 'Likes to be a bit root-bound.'] },
  { key: 'Phalaenopsis', commonName: 'Moth Orchid', waterEveryDays: 7, fertilizeEveryDays: 14, light: 'bright-indirect', humidity: 'high', tempC: [18, 29], soil: 'Orchid bark', toxicToPets: false, difficulty: 'moderate', tips: ['Water when roots turn silvery; green roots are still wet.', 'Never leave water in the crown.'] },
  { key: 'Pilea', commonName: 'Chinese Money Plant', waterEveryDays: 7, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [13, 27], soil: 'Well-draining potting mix', toxicToPets: false, difficulty: 'easy', tips: ['Rotate weekly; it leans hard toward light.'] },
  { key: 'Peperomia', commonName: 'Peperomia', waterEveryDays: 10, fertilizeEveryDays: 45, light: 'medium', humidity: 'medium', tempC: [16, 27], soil: 'Airy, well-draining mix', toxicToPets: false, difficulty: 'easy', tips: ['Semi-succulent: let it dry out between waterings.'] },
  { key: 'Aglaonema', commonName: 'Chinese Evergreen', waterEveryDays: 9, fertilizeEveryDays: 45, light: 'low', humidity: 'medium', tempC: [16, 27], soil: 'General potting mix', toxicToPets: true, difficulty: 'easy', tips: ['Tolerates low light; colourful varieties want more.'] },
  { key: 'Alocasia', commonName: 'Alocasia', waterEveryDays: 6, fertilizeEveryDays: 21, light: 'bright-indirect', humidity: 'high', tempC: [18, 29], soil: 'Chunky, airy aroid mix', toxicToPets: true, difficulty: 'hard', tips: ['May go dormant in winter; reduce water, do not panic.', 'Check undersides for spider mites.'] },
  { key: 'Anthurium', commonName: 'Anthurium', waterEveryDays: 7, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'high', tempC: [18, 29], soil: 'Chunky orchid/aroid mix', toxicToPets: true, difficulty: 'moderate', tips: ['More light means more flowers.'] },
  { key: 'Strelitzia', commonName: 'Bird of Paradise', waterEveryDays: 8, fertilizeEveryDays: 30, light: 'direct', humidity: 'medium', tempC: [18, 30], soil: 'Rich, well-draining mix', toxicToPets: true, difficulty: 'moderate', tips: ['Split leaves are natural and help it handle wind.'] },
  { key: 'Nephrolepis', commonName: 'Boston Fern', waterEveryDays: 3, fertilizeEveryDays: 30, light: 'medium', humidity: 'high', tempC: [16, 27], soil: 'Moist, peaty mix', toxicToPets: false, difficulty: 'moderate', tips: ['Never let it dry out fully.', 'Great in a bright bathroom.'] },
  { key: 'Adiantum', commonName: 'Maidenhair Fern', waterEveryDays: 3, fertilizeEveryDays: 30, light: 'medium', humidity: 'high', tempC: [18, 27], soil: 'Moist, peaty mix', toxicToPets: false, difficulty: 'hard', tips: ['One dry day can crisp it; keep evenly moist.'] },
  { key: 'Tradescantia', commonName: 'Wandering Dude', waterEveryDays: 6, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [13, 27], soil: 'General potting mix', toxicToPets: true, difficulty: 'easy', tips: ['Pinch back leggy stems and replant cuttings in the same pot.'] },
  { key: 'Syngonium', commonName: 'Arrowhead Plant', waterEveryDays: 6, fertilizeEveryDays: 30, light: 'medium', humidity: 'medium', tempC: [16, 29], soil: 'Airy aroid mix', toxicToPets: true, difficulty: 'easy', tips: ['Prune climbing stems to keep the arrow-shaped juvenile leaves.'] },
  { key: 'Schefflera', commonName: 'Umbrella Tree', waterEveryDays: 9, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [16, 27], soil: 'General potting mix', toxicToPets: true, difficulty: 'easy', tips: ['Dropping leaves often means too little light.'] },
  { key: 'Dieffenbachia', commonName: 'Dumb Cane', waterEveryDays: 7, fertilizeEveryDays: 30, light: 'medium', humidity: 'medium', tempC: [18, 29], soil: 'General potting mix', toxicToPets: true, difficulty: 'easy', tips: ['Sap irritates skin and mouth; wear gloves when pruning.'] },
  { key: 'Begonia', commonName: 'Begonia', waterEveryDays: 5, fertilizeEveryDays: 21, light: 'bright-indirect', humidity: 'high', tempC: [16, 27], soil: 'Light, airy mix', toxicToPets: true, difficulty: 'moderate', tips: ['Water the soil, not the leaves, to avoid mildew.'] },
  { key: 'Hedera', commonName: 'English Ivy', waterEveryDays: 6, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [10, 24], soil: 'General potting mix', toxicToPets: true, difficulty: 'moderate', tips: ['Prone to spider mites in dry air; shower it occasionally.'] },
  { key: 'Areca', commonName: 'Palm', waterEveryDays: 6, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [18, 29], soil: 'Well-draining palm mix', toxicToPets: false, difficulty: 'moderate', tips: ['Brown tips are common; trim with clean scissors.'] },
  { key: 'Dypsis', commonName: 'Areca Palm', waterEveryDays: 6, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [18, 29], soil: 'Well-draining palm mix', toxicToPets: false, difficulty: 'moderate', tips: ['Keep evenly moist in summer.'] },
  { key: 'Chamaedorea', commonName: 'Parlour Palm', waterEveryDays: 7, fertilizeEveryDays: 45, light: 'low', humidity: 'medium', tempC: [16, 27], soil: 'Well-draining palm mix', toxicToPets: false, difficulty: 'easy', tips: ['One of the best palms for low light.'] },
  { key: 'Rosa', commonName: 'Rose', waterEveryDays: 3, fertilizeEveryDays: 21, light: 'direct', humidity: 'medium', tempC: [10, 30], soil: 'Rich loam', toxicToPets: false, difficulty: 'moderate', tips: ['6+ hours of sun for flowers.', 'Water at the base in the morning.'] },
  { key: 'Solanum lycopersicum', commonName: 'Tomato', waterEveryDays: 2, fertilizeEveryDays: 14, light: 'direct', humidity: 'medium', tempC: [16, 32], soil: 'Rich, compost-heavy mix', toxicToPets: true, difficulty: 'moderate', tips: ['Water deeply and consistently to avoid split fruit.'] },
  { key: 'Lavandula', commonName: 'Lavender', waterEveryDays: 10, fertilizeEveryDays: 60, light: 'direct', humidity: 'low', tempC: [10, 30], soil: 'Gritty, alkaline mix', toxicToPets: true, difficulty: 'moderate', tips: ['Hates wet feet; use a terracotta pot.'] },
  { key: 'Citrus', commonName: 'Citrus', waterEveryDays: 5, fertilizeEveryDays: 21, light: 'direct', humidity: 'medium', tempC: [13, 30], soil: 'Citrus / well-draining mix', toxicToPets: true, difficulty: 'hard', tips: ['Feed with citrus fertiliser; yellow leaves often mean low nitrogen.'] },
];

export const DEFAULT_PROFILE: CareProfile = {
  key: 'default',
  commonName: 'Houseplant',
  waterEveryDays: 7,
  fertilizeEveryDays: 30,
  light: 'bright-indirect',
  humidity: 'medium',
  tempC: [16, 27],
  soil: 'General, well-draining potting mix',
  toxicToPets: false,
  difficulty: 'moderate',
  tips: ['Check the soil with your finger before watering: water when the top 2–3 cm are dry.', 'Make sure the pot has a drainage hole.'],
};

/** Find the best care profile for a scientific name (and optional family). Species beats genus beats family. */
export function findCareProfile(scientificName?: string, family?: string): CareProfile | undefined {
  if (!scientificName && !family) return undefined;
  const name = (scientificName ?? '').trim().toLowerCase();
  const [genus, species] = name.split(/\s+/);
  const bySpecies = PROFILES.find((p) => p.key.toLowerCase() === `${genus} ${species}`);
  if (bySpecies) return bySpecies;
  const byGenus = PROFILES.find((p) => p.key.toLowerCase() === genus);
  if (byGenus) return byGenus;
  if (family) return PROFILES.find((p) => p.key.toLowerCase() === family.toLowerCase());
  return undefined;
}

/** Search by common or scientific name, for manual adding. */
export function searchCareProfiles(query: string): CareProfile[] {
  const q = query.trim().toLowerCase();
  if (!q) return PROFILES;
  return PROFILES.filter((p) => p.key.toLowerCase().includes(q) || p.commonName.toLowerCase().includes(q));
}

export const LIGHT_LABEL: Record<CareProfile['light'], string> = {
  low: 'Low light',
  medium: 'Medium light',
  'bright-indirect': 'Bright, indirect light',
  direct: 'Direct sun',
};
