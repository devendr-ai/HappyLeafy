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
  // Ferns
  { key: 'Asplenium', commonName: "Bird's Nest Fern", waterEveryDays: 5, fertilizeEveryDays: 30, light: 'medium', humidity: 'high', tempC: [16, 27], soil: 'Peaty, airy mix', toxicToPets: false, difficulty: 'moderate', tips: ['Water around the edge of the pot, not into the central rosette.'] },
  { key: 'Platycerium', commonName: 'Staghorn Fern', waterEveryDays: 7, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'high', tempC: [16, 29], soil: 'Mounted on a board with sphagnum moss', toxicToPets: false, difficulty: 'moderate', tips: ['Soak the mount in water for 10 minutes when it feels light.', 'Brown shield fronds at the base are normal.'] },
  { key: 'Pteris', commonName: 'Brake Fern', waterEveryDays: 4, fertilizeEveryDays: 30, light: 'medium', humidity: 'high', tempC: [16, 27], soil: 'Moist, peaty mix', toxicToPets: false, difficulty: 'moderate', tips: ['Keep evenly moist.'] },
  { key: 'Davallia', commonName: "Rabbit's Foot Fern", waterEveryDays: 5, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [16, 27], soil: 'Airy orchid/fern mix', toxicToPets: false, difficulty: 'moderate', tips: ['Do not bury the furry rhizomes.'] },
  // Prayer plant family and other foliage
  { key: 'Ctenanthe', commonName: 'Ctenanthe', waterEveryDays: 5, fertilizeEveryDays: 30, light: 'medium', humidity: 'high', tempC: [18, 27], soil: 'Moist, airy mix', toxicToPets: false, difficulty: 'moderate', tips: ['Use filtered or rain water.'] },
  { key: 'Stromanthe', commonName: 'Stromanthe', waterEveryDays: 5, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'high', tempC: [18, 27], soil: 'Moist, airy mix', toxicToPets: false, difficulty: 'hard', tips: ['Crispy edges mean the air is too dry.'] },
  { key: 'Fittonia', commonName: 'Nerve Plant', waterEveryDays: 3, fertilizeEveryDays: 30, light: 'medium', humidity: 'high', tempC: [18, 27], soil: 'Moist potting mix', toxicToPets: false, difficulty: 'moderate', tips: ['Faints dramatically when dry, recovers quickly after a drink.'] },
  { key: 'Hypoestes', commonName: 'Polka Dot Plant', waterEveryDays: 4, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [16, 27], soil: 'General potting mix', toxicToPets: false, difficulty: 'easy', tips: ['Pinch tips to keep it bushy.'] },
  { key: 'Aspidistra', commonName: 'Cast Iron Plant', waterEveryDays: 12, fertilizeEveryDays: 60, light: 'low', humidity: 'low', tempC: [7, 29], soil: 'General potting mix', toxicToPets: false, difficulty: 'easy', tips: ['Almost indestructible; tolerates shade and neglect.'] },
  { key: 'Codiaeum', commonName: 'Croton', waterEveryDays: 6, fertilizeEveryDays: 30, light: 'direct', humidity: 'high', tempC: [18, 29], soil: 'Well-draining potting mix', toxicToPets: true, difficulty: 'hard', tips: ['Needs strong light for its colours.', 'Drops leaves when moved; give it time.'] },
  { key: 'Cordyline', commonName: 'Ti Plant', waterEveryDays: 7, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [16, 29], soil: 'Well-draining potting mix', toxicToPets: true, difficulty: 'moderate', tips: ['Brown tips: use filtered water.'] },
  { key: 'Polyscias', commonName: 'Ming Aralia', waterEveryDays: 7, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'high', tempC: [18, 29], soil: 'Well-draining potting mix', toxicToPets: true, difficulty: 'hard', tips: ['Hates drafts and sudden changes.'] },
  { key: 'Fatsia', commonName: 'Japanese Aralia', waterEveryDays: 7, fertilizeEveryDays: 30, light: 'medium', humidity: 'medium', tempC: [7, 24], soil: 'General potting mix', toxicToPets: false, difficulty: 'easy', tips: ['Likes it cool; keep away from radiators.'] },
  { key: 'Pachira', commonName: 'Money Tree', waterEveryDays: 10, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [16, 29], soil: 'Well-draining mix with sand or perlite', toxicToPets: false, difficulty: 'easy', tips: ['Water when the top half of the soil is dry.'] },
  { key: 'Ficus benjamina', commonName: 'Weeping Fig', waterEveryDays: 7, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [16, 27], soil: 'Well-draining potting mix', toxicToPets: true, difficulty: 'moderate', tips: ['Drops leaves after any move; it recovers in a few weeks.'] },
  { key: 'Ficus pumila', commonName: 'Creeping Fig', waterEveryDays: 4, fertilizeEveryDays: 30, light: 'medium', humidity: 'high', tempC: [13, 27], soil: 'Moist potting mix', toxicToPets: true, difficulty: 'moderate', tips: ['Never let it dry out fully.'] },
  { key: 'Soleirolia', commonName: "Baby's Tears", waterEveryDays: 3, fertilizeEveryDays: 30, light: 'medium', humidity: 'high', tempC: [10, 24], soil: 'Moist potting mix', toxicToPets: false, difficulty: 'moderate', tips: ['Bottom-water to keep the mat of leaves dry.'] },
  { key: 'Oxalis', commonName: 'Purple Shamrock', waterEveryDays: 6, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [13, 27], soil: 'General potting mix', toxicToPets: true, difficulty: 'easy', tips: ['May die back to bulbs; stop watering for a month and it regrows.'] },
  // Aroids
  { key: 'Rhaphidophora', commonName: 'Mini Monstera', waterEveryDays: 7, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [16, 29], soil: 'Chunky aroid mix', toxicToPets: true, difficulty: 'easy', tips: ['Give it something to climb.'] },
  { key: 'Scindapsus', commonName: 'Satin Pothos', waterEveryDays: 9, fertilizeEveryDays: 30, light: 'medium', humidity: 'medium', tempC: [16, 29], soil: 'Airy aroid mix', toxicToPets: true, difficulty: 'easy', tips: ['Leaves curl inward when it wants water.'] },
  { key: 'Caladium', commonName: 'Caladium', waterEveryDays: 4, fertilizeEveryDays: 21, light: 'bright-indirect', humidity: 'high', tempC: [20, 30], soil: 'Moist, rich mix', toxicToPets: true, difficulty: 'hard', tips: ['Goes dormant in autumn; store the tuber dry until spring.'] },
  { key: 'Colocasia', commonName: 'Elephant Ear', waterEveryDays: 3, fertilizeEveryDays: 14, light: 'bright-indirect', humidity: 'high', tempC: [18, 30], soil: 'Rich, moisture-retaining mix', toxicToPets: true, difficulty: 'moderate', tips: ['Thirsty and hungry in summer.'] },
  { key: 'Zantedeschia', commonName: 'Calla Lily', waterEveryDays: 4, fertilizeEveryDays: 21, light: 'bright-indirect', humidity: 'medium', tempC: [13, 27], soil: 'Rich potting mix', toxicToPets: true, difficulty: 'moderate', tips: ['Let it rest dry for two months after flowering.'] },
  { key: 'Homalomena', commonName: 'Homalomena', waterEveryDays: 6, fertilizeEveryDays: 30, light: 'medium', humidity: 'high', tempC: [18, 29], soil: 'Airy aroid mix', toxicToPets: true, difficulty: 'easy', tips: ['Tolerates lower light than most aroids.'] },
  // Succulents and cacti
  { key: 'Kalanchoe', commonName: 'Kalanchoe', waterEveryDays: 12, fertilizeEveryDays: 60, light: 'direct', humidity: 'low', tempC: [13, 29], soil: 'Cactus / succulent mix', toxicToPets: true, difficulty: 'easy', tips: ['Needs 6 weeks of long nights (14 h darkness) to rebloom.'] },
  { key: 'Sedum', commonName: 'Stonecrop', waterEveryDays: 14, fertilizeEveryDays: 90, light: 'direct', humidity: 'low', tempC: [5, 30], soil: 'Gritty succulent mix', toxicToPets: false, difficulty: 'easy', tips: ['Leaves root easily; propagate fallen ones.'] },
  { key: 'Senecio', commonName: 'String of Pearls', waterEveryDays: 12, fertilizeEveryDays: 60, light: 'bright-indirect', humidity: 'low', tempC: [13, 27], soil: 'Gritty succulent mix', toxicToPets: true, difficulty: 'moderate', tips: ['Water when pearls look slightly wrinkled.', 'Use a shallow pot.'] },
  { key: 'Curio', commonName: 'String of Pearls', waterEveryDays: 12, fertilizeEveryDays: 60, light: 'bright-indirect', humidity: 'low', tempC: [13, 27], soil: 'Gritty succulent mix', toxicToPets: true, difficulty: 'moderate', tips: ['Water when pearls look slightly wrinkled.', 'Use a shallow pot.'] },
  { key: 'Ceropegia', commonName: 'String of Hearts', waterEveryDays: 12, fertilizeEveryDays: 60, light: 'bright-indirect', humidity: 'low', tempC: [13, 27], soil: 'Gritty succulent mix', toxicToPets: false, difficulty: 'easy', tips: ['Let it dry out between waterings; it stores water in tubers.'] },
  { key: 'Euphorbia', commonName: 'Euphorbia', waterEveryDays: 18, fertilizeEveryDays: 90, light: 'direct', humidity: 'low', tempC: [13, 30], soil: 'Cactus mix', toxicToPets: true, difficulty: 'easy', tips: ['Milky sap irritates skin and eyes; wear gloves.'] },
  { key: 'Euphorbia pulcherrima', commonName: 'Poinsettia', waterEveryDays: 6, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [16, 24], soil: 'Well-draining potting mix', toxicToPets: true, difficulty: 'moderate', tips: ['Keep away from cold drafts.', 'Water when the surface is dry; never let it sit in water.'] },
  { key: 'Schlumbergera', commonName: 'Christmas Cactus', waterEveryDays: 8, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [13, 27], soil: 'Orchid bark + cactus mix', toxicToPets: false, difficulty: 'easy', tips: ['A forest cactus: water more than desert cacti.', 'Cool nights in autumn trigger buds.'] },
  { key: 'Rhipsalis', commonName: 'Mistletoe Cactus', waterEveryDays: 7, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [13, 27], soil: 'Orchid bark + cactus mix', toxicToPets: false, difficulty: 'easy', tips: ['Likes more water and less sun than desert cacti.'] },
  { key: 'Epiphyllum', commonName: 'Orchid Cactus', waterEveryDays: 7, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [13, 27], soil: 'Orchid bark + cactus mix', toxicToPets: false, difficulty: 'easy', tips: ['Blooms better slightly root-bound.'] },
  { key: 'Opuntia', commonName: 'Prickly Pear', waterEveryDays: 21, fertilizeEveryDays: 90, light: 'direct', humidity: 'low', tempC: [5, 35], soil: 'Cactus mix', toxicToPets: false, difficulty: 'easy', tips: ['Tiny glochid spines get everywhere; handle with tongs.'] },
  { key: 'Mammillaria', commonName: 'Pincushion Cactus', waterEveryDays: 21, fertilizeEveryDays: 90, light: 'direct', humidity: 'low', tempC: [5, 32], soil: 'Cactus mix', toxicToPets: false, difficulty: 'easy', tips: ['A cool, dry winter rest brings spring flowers.'] },
  { key: 'Gasteria', commonName: 'Gasteria', waterEveryDays: 14, fertilizeEveryDays: 90, light: 'medium', humidity: 'low', tempC: [10, 29], soil: 'Gritty succulent mix', toxicToPets: false, difficulty: 'easy', tips: ['One of the few succulents happy in medium light.'] },
  { key: 'Agave', commonName: 'Agave', waterEveryDays: 21, fertilizeEveryDays: 90, light: 'direct', humidity: 'low', tempC: [5, 35], soil: 'Cactus mix', toxicToPets: true, difficulty: 'easy', tips: ['Leaf tips are sharp; keep it away from walkways.'] },
  { key: 'Yucca', commonName: 'Yucca', waterEveryDays: 14, fertilizeEveryDays: 60, light: 'direct', humidity: 'low', tempC: [10, 30], soil: 'Sandy, well-draining mix', toxicToPets: true, difficulty: 'easy', tips: ['Overwatering rots the cane; err on the dry side.'] },
  { key: 'Beaucarnea', commonName: 'Ponytail Palm', waterEveryDays: 18, fertilizeEveryDays: 60, light: 'direct', humidity: 'low', tempC: [10, 30], soil: 'Cactus mix', toxicToPets: false, difficulty: 'easy', tips: ['The swollen trunk stores water; water sparingly.'] },
  // Palms and cycads
  { key: 'Howea', commonName: 'Kentia Palm', waterEveryDays: 8, fertilizeEveryDays: 45, light: 'medium', humidity: 'medium', tempC: [13, 27], soil: 'Well-draining palm mix', toxicToPets: false, difficulty: 'easy', tips: ['Slow-growing and very tolerant of indoor conditions.'] },
  { key: 'Rhapis', commonName: 'Lady Palm', waterEveryDays: 7, fertilizeEveryDays: 45, light: 'medium', humidity: 'medium', tempC: [13, 27], soil: 'Well-draining palm mix', toxicToPets: false, difficulty: 'easy', tips: ['Handles lower light well.'] },
  { key: 'Phoenix', commonName: 'Date Palm', waterEveryDays: 7, fertilizeEveryDays: 30, light: 'direct', humidity: 'medium', tempC: [13, 30], soil: 'Well-draining palm mix', toxicToPets: false, difficulty: 'moderate', tips: ['Needs a very bright spot indoors.'] },
  { key: 'Cycas', commonName: 'Sago Palm', waterEveryDays: 12, fertilizeEveryDays: 60, light: 'bright-indirect', humidity: 'medium', tempC: [10, 30], soil: 'Sandy, well-draining mix', toxicToPets: true, difficulty: 'easy', tips: ['Highly toxic to pets; every part, especially seeds.'] },
  // Bromeliads
  { key: 'Guzmania', commonName: 'Guzmania', waterEveryDays: 7, fertilizeEveryDays: 60, light: 'bright-indirect', humidity: 'high', tempC: [18, 29], soil: 'Orchid bark mix', toxicToPets: false, difficulty: 'easy', tips: ['Keep a little water in the central cup; refresh it weekly.', 'The mother dies after flowering; grow on the pups.'] },
  { key: 'Tillandsia', commonName: 'Air Plant', waterEveryDays: 7, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [10, 30], soil: 'None: mount or place on a dish', toxicToPets: false, difficulty: 'easy', tips: ['Soak for 20–30 minutes weekly, then dry upside down within 4 hours.'] },
  { key: 'Vriesea', commonName: 'Flaming Sword', waterEveryDays: 7, fertilizeEveryDays: 60, light: 'bright-indirect', humidity: 'high', tempC: [18, 29], soil: 'Orchid bark mix', toxicToPets: false, difficulty: 'easy', tips: ['Water into the central cup and keep soil just moist.'] },
  { key: 'Aechmea', commonName: 'Urn Plant', waterEveryDays: 7, fertilizeEveryDays: 60, light: 'bright-indirect', humidity: 'medium', tempC: [16, 29], soil: 'Orchid bark mix', toxicToPets: false, difficulty: 'easy', tips: ['Keep the urn topped up with fresh water.'] },
  { key: 'Neoregelia', commonName: 'Neoregelia', waterEveryDays: 7, fertilizeEveryDays: 60, light: 'bright-indirect', humidity: 'medium', tempC: [16, 29], soil: 'Orchid bark mix', toxicToPets: false, difficulty: 'easy', tips: ['Brighter light gives redder centres.'] },
  // Flowering houseplants
  { key: 'Saintpaulia', commonName: 'African Violet', waterEveryDays: 5, fertilizeEveryDays: 14, light: 'bright-indirect', humidity: 'medium', tempC: [18, 27], soil: 'African violet mix', toxicToPets: false, difficulty: 'moderate', tips: ['Water from the bottom with room-temperature water; cold water spots leaves.'] },
  { key: 'Streptocarpus', commonName: 'Cape Primrose', waterEveryDays: 6, fertilizeEveryDays: 14, light: 'bright-indirect', humidity: 'medium', tempC: [16, 24], soil: 'Light, peat-free mix', toxicToPets: false, difficulty: 'moderate', tips: ['Let it dry slightly between waterings.'] },
  { key: 'Cyclamen', commonName: 'Cyclamen', waterEveryDays: 5, fertilizeEveryDays: 21, light: 'bright-indirect', humidity: 'medium', tempC: [10, 18], soil: 'Well-draining potting mix', toxicToPets: true, difficulty: 'moderate', tips: ['Likes it cool. Water from below, never onto the tuber.'] },
  { key: 'Clivia', commonName: 'Clivia', waterEveryDays: 10, fertilizeEveryDays: 30, light: 'medium', humidity: 'medium', tempC: [10, 27], soil: 'Well-draining potting mix', toxicToPets: true, difficulty: 'easy', tips: ['A cool, dry winter rest brings flowers.'] },
  { key: 'Hippeastrum', commonName: 'Amaryllis', waterEveryDays: 7, fertilizeEveryDays: 21, light: 'bright-indirect', humidity: 'medium', tempC: [16, 24], soil: 'Rich, well-draining mix', toxicToPets: true, difficulty: 'easy', tips: ['Keep the top third of the bulb above the soil.'] },
  { key: 'Gardenia', commonName: 'Gardenia', waterEveryDays: 4, fertilizeEveryDays: 21, light: 'bright-indirect', humidity: 'high', tempC: [16, 24], soil: 'Acidic, rich mix', toxicToPets: true, difficulty: 'hard', tips: ['Buds drop with drafts, dry air or moving it.'] },
  { key: 'Jasminum', commonName: 'Jasmine', waterEveryDays: 4, fertilizeEveryDays: 21, light: 'direct', humidity: 'medium', tempC: [10, 27], soil: 'Well-draining potting mix', toxicToPets: false, difficulty: 'moderate', tips: ['Cool winter nights help it set flower buds.'] },
  { key: 'Hibiscus', commonName: 'Hibiscus', waterEveryDays: 3, fertilizeEveryDays: 14, light: 'direct', humidity: 'medium', tempC: [13, 30], soil: 'Rich, well-draining mix', toxicToPets: false, difficulty: 'moderate', tips: ['Heavy feeder in summer; low-phosphorus fertiliser works best.'] },
  { key: 'Bougainvillea', commonName: 'Bougainvillea', waterEveryDays: 6, fertilizeEveryDays: 21, light: 'direct', humidity: 'low', tempC: [10, 32], soil: 'Well-draining mix', toxicToPets: false, difficulty: 'moderate', tips: ['Flowers best when kept a little dry and root-bound.'] },
  { key: 'Pelargonium', commonName: 'Geranium', waterEveryDays: 5, fertilizeEveryDays: 14, light: 'direct', humidity: 'low', tempC: [10, 27], soil: 'Well-draining potting mix', toxicToPets: true, difficulty: 'easy', tips: ['Deadhead spent flowers to keep blooms coming.'] },
  { key: 'Chrysanthemum', commonName: 'Chrysanthemum', waterEveryDays: 3, fertilizeEveryDays: 14, light: 'direct', humidity: 'medium', tempC: [10, 24], soil: 'Rich potting mix', toxicToPets: true, difficulty: 'moderate', tips: ['Keep evenly moist while flowering.'] },
  { key: 'Gerbera', commonName: 'Gerbera Daisy', waterEveryDays: 4, fertilizeEveryDays: 14, light: 'direct', humidity: 'medium', tempC: [16, 27], soil: 'Well-draining potting mix', toxicToPets: false, difficulty: 'moderate', tips: ['Keep the crown above the soil to prevent rot.'] },
  // Herbs and edibles
  { key: 'Rosmarinus', commonName: 'Rosemary', waterEveryDays: 7, fertilizeEveryDays: 45, light: 'direct', humidity: 'low', tempC: [7, 29], soil: 'Gritty, well-draining mix', toxicToPets: false, difficulty: 'moderate', tips: ['Let it dry between waterings; hates wet roots.'] },
  { key: 'Salvia rosmarinus', commonName: 'Rosemary', waterEveryDays: 7, fertilizeEveryDays: 45, light: 'direct', humidity: 'low', tempC: [7, 29], soil: 'Gritty, well-draining mix', toxicToPets: false, difficulty: 'moderate', tips: ['Let it dry between waterings; hates wet roots.'] },
  { key: 'Thymus', commonName: 'Thyme', waterEveryDays: 7, fertilizeEveryDays: 45, light: 'direct', humidity: 'low', tempC: [7, 29], soil: 'Gritty, well-draining mix', toxicToPets: false, difficulty: 'easy', tips: ['Trim after flowering to stop it going woody.'] },
  { key: 'Petroselinum', commonName: 'Parsley', waterEveryDays: 3, fertilizeEveryDays: 21, light: 'direct', humidity: 'medium', tempC: [10, 27], soil: 'Rich, moist mix', toxicToPets: true, difficulty: 'easy', tips: ['Harvest outer stems first.'] },
  { key: 'Coriandrum', commonName: 'Coriander', waterEveryDays: 2, fertilizeEveryDays: 21, light: 'direct', humidity: 'medium', tempC: [10, 25], soil: 'Rich, moist mix', toxicToPets: false, difficulty: 'moderate', tips: ['Bolts in heat; sow small batches every few weeks.'] },
  { key: 'Capsicum', commonName: 'Chilli / Pepper', waterEveryDays: 3, fertilizeEveryDays: 14, light: 'direct', humidity: 'medium', tempC: [18, 32], soil: 'Rich, well-draining mix', toxicToPets: true, difficulty: 'moderate', tips: ['Let the top soil dry slightly; fruit is hotter when kept a bit dry.'] },
  { key: 'Fragaria', commonName: 'Strawberry', waterEveryDays: 2, fertilizeEveryDays: 14, light: 'direct', humidity: 'medium', tempC: [10, 27], soil: 'Rich, well-draining mix', toxicToPets: false, difficulty: 'moderate', tips: ['Keep fruit off wet soil to avoid rot.'] },
  { key: 'Musa', commonName: 'Banana', waterEveryDays: 3, fertilizeEveryDays: 14, light: 'direct', humidity: 'high', tempC: [18, 32], soil: 'Rich, moisture-retaining mix', toxicToPets: false, difficulty: 'moderate', tips: ['Very thirsty and hungry in summer.'] },
];

/**
 * Family-level fallbacks so almost any identified plant gets sensible care,
 * even when its genus is not in the list above.
 */
const FAMILY_PROFILES: CareProfile[] = [
  { key: 'Araceae', commonName: 'Aroid', waterEveryDays: 7, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [16, 29], soil: 'Chunky aroid mix', toxicToPets: true, difficulty: 'moderate', tips: ['Aroids like airy soil that dries partly between waterings.', 'Most contain calcium oxalate: keep away from pets.'] },
  { key: 'Cactaceae', commonName: 'Cactus', waterEveryDays: 21, fertilizeEveryDays: 90, light: 'direct', humidity: 'low', tempC: [10, 32], soil: 'Cactus mix', toxicToPets: false, difficulty: 'easy', tips: ['Barely water in winter.'] },
  { key: 'Crassulaceae', commonName: 'Succulent', waterEveryDays: 14, fertilizeEveryDays: 90, light: 'direct', humidity: 'low', tempC: [10, 29], soil: 'Gritty succulent mix', toxicToPets: false, difficulty: 'easy', tips: ['Soak and dry: water deeply, then wait until fully dry.'] },
  { key: 'Aizoaceae', commonName: 'Ice plant / Living stone', waterEveryDays: 21, fertilizeEveryDays: 90, light: 'direct', humidity: 'low', tempC: [10, 30], soil: 'Very gritty mix', toxicToPets: false, difficulty: 'moderate', tips: ['Very little water; none while old leaves are being absorbed.'] },
  { key: 'Asphodelaceae', commonName: 'Aloe family', waterEveryDays: 16, fertilizeEveryDays: 90, light: 'bright-indirect', humidity: 'low', tempC: [10, 29], soil: 'Cactus / succulent mix', toxicToPets: true, difficulty: 'easy', tips: ['Let soil dry completely between waterings.'] },
  { key: 'Asparagaceae', commonName: 'Asparagus family', waterEveryDays: 12, fertilizeEveryDays: 45, light: 'medium', humidity: 'medium', tempC: [13, 29], soil: 'Well-draining potting mix', toxicToPets: true, difficulty: 'easy', tips: ['Most are drought-tolerant; err on the dry side.'] },
  { key: 'Orchidaceae', commonName: 'Orchid', waterEveryDays: 7, fertilizeEveryDays: 14, light: 'bright-indirect', humidity: 'high', tempC: [16, 29], soil: 'Orchid bark', toxicToPets: false, difficulty: 'moderate', tips: ['Water when the bark is almost dry; never let roots sit in water.'] },
  { key: 'Marantaceae', commonName: 'Prayer plant family', waterEveryDays: 5, fertilizeEveryDays: 30, light: 'medium', humidity: 'high', tempC: [18, 27], soil: 'Moist, airy mix', toxicToPets: false, difficulty: 'hard', tips: ['Keep lightly moist and use filtered water.'] },
  { key: 'Arecaceae', commonName: 'Palm', waterEveryDays: 7, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [16, 29], soil: 'Well-draining palm mix', toxicToPets: false, difficulty: 'moderate', tips: ['Brown tips are common; trim with clean scissors.'] },
  { key: 'Bromeliaceae', commonName: 'Bromeliad', waterEveryDays: 7, fertilizeEveryDays: 60, light: 'bright-indirect', humidity: 'medium', tempC: [16, 29], soil: 'Orchid bark mix', toxicToPets: false, difficulty: 'easy', tips: ['Water into the central cup if it has one.'] },
  { key: 'Moraceae', commonName: 'Fig family', waterEveryDays: 8, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [16, 27], soil: 'Well-draining potting mix', toxicToPets: true, difficulty: 'moderate', tips: ['Dislikes being moved and cold drafts.'] },
  { key: 'Begoniaceae', commonName: 'Begonia', waterEveryDays: 5, fertilizeEveryDays: 21, light: 'bright-indirect', humidity: 'high', tempC: [16, 27], soil: 'Light, airy mix', toxicToPets: true, difficulty: 'moderate', tips: ['Water the soil, not the leaves.'] },
  { key: 'Gesneriaceae', commonName: 'African violet family', waterEveryDays: 5, fertilizeEveryDays: 14, light: 'bright-indirect', humidity: 'medium', tempC: [18, 27], soil: 'Light, airy mix', toxicToPets: false, difficulty: 'moderate', tips: ['Use room-temperature water and avoid wetting leaves.'] },
  { key: 'Piperaceae', commonName: 'Peperomia family', waterEveryDays: 10, fertilizeEveryDays: 45, light: 'medium', humidity: 'medium', tempC: [16, 27], soil: 'Airy, well-draining mix', toxicToPets: false, difficulty: 'easy', tips: ['Semi-succulent: let it dry between waterings.'] },
  { key: 'Euphorbiaceae', commonName: 'Spurge family', waterEveryDays: 14, fertilizeEveryDays: 60, light: 'direct', humidity: 'low', tempC: [13, 30], soil: 'Well-draining mix', toxicToPets: true, difficulty: 'moderate', tips: ['Many have irritating milky sap; wear gloves.'] },
  { key: 'Apocynaceae', commonName: 'Dogbane family', waterEveryDays: 10, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [16, 29], soil: 'Well-draining mix', toxicToPets: true, difficulty: 'moderate', tips: ['Many are toxic; keep away from pets.'] },
  { key: 'Commelinaceae', commonName: 'Spiderwort family', waterEveryDays: 6, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [13, 27], soil: 'General potting mix', toxicToPets: true, difficulty: 'easy', tips: ['Pinch back leggy stems.'] },
  { key: 'Urticaceae', commonName: 'Nettle family', waterEveryDays: 7, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [13, 27], soil: 'Well-draining potting mix', toxicToPets: false, difficulty: 'easy', tips: ['Rotate regularly for even growth.'] },
  { key: 'Araliaceae', commonName: 'Aralia family', waterEveryDays: 8, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [13, 27], soil: 'General potting mix', toxicToPets: true, difficulty: 'easy', tips: ['Dropping leaves usually means too little light.'] },
  { key: 'Acanthaceae', commonName: 'Acanthus family', waterEveryDays: 4, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'high', tempC: [16, 27], soil: 'Moist potting mix', toxicToPets: false, difficulty: 'moderate', tips: ['Keep evenly moist.'] },
  { key: 'Polypodiaceae', commonName: 'Fern', waterEveryDays: 4, fertilizeEveryDays: 30, light: 'medium', humidity: 'high', tempC: [16, 27], soil: 'Moist, peaty mix', toxicToPets: false, difficulty: 'moderate', tips: ['Never let ferns dry out fully.'] },
  { key: 'Pteridaceae', commonName: 'Fern', waterEveryDays: 4, fertilizeEveryDays: 30, light: 'medium', humidity: 'high', tempC: [16, 27], soil: 'Moist, peaty mix', toxicToPets: false, difficulty: 'moderate', tips: ['Never let ferns dry out fully.'] },
  { key: 'Nephrolepidaceae', commonName: 'Fern', waterEveryDays: 3, fertilizeEveryDays: 30, light: 'medium', humidity: 'high', tempC: [16, 27], soil: 'Moist, peaty mix', toxicToPets: false, difficulty: 'moderate', tips: ['Never let ferns dry out fully.'] },
  { key: 'Aspleniaceae', commonName: 'Fern', waterEveryDays: 5, fertilizeEveryDays: 30, light: 'medium', humidity: 'high', tempC: [16, 27], soil: 'Peaty, airy mix', toxicToPets: false, difficulty: 'moderate', tips: ['Never let ferns dry out fully.'] },
  { key: 'Lamiaceae', commonName: 'Herb (mint family)', waterEveryDays: 3, fertilizeEveryDays: 30, light: 'direct', humidity: 'medium', tempC: [10, 27], soil: 'Well-draining potting mix', toxicToPets: false, difficulty: 'easy', tips: ['Pinch tips regularly to keep it bushy.'] },
  { key: 'Apiaceae', commonName: 'Herb (carrot family)', waterEveryDays: 3, fertilizeEveryDays: 21, light: 'direct', humidity: 'medium', tempC: [10, 25], soil: 'Rich, moist mix', toxicToPets: false, difficulty: 'moderate', tips: ['Harvest outer leaves first.'] },
  { key: 'Solanaceae', commonName: 'Nightshade family', waterEveryDays: 3, fertilizeEveryDays: 14, light: 'direct', humidity: 'medium', tempC: [16, 30], soil: 'Rich, well-draining mix', toxicToPets: true, difficulty: 'moderate', tips: ['Leaves are toxic to pets.'] },
  { key: 'Rosaceae', commonName: 'Rose family', waterEveryDays: 4, fertilizeEveryDays: 21, light: 'direct', humidity: 'medium', tempC: [5, 30], soil: 'Rich loam', toxicToPets: false, difficulty: 'moderate', tips: ['Water at the base in the morning.'] },
  { key: 'Rutaceae', commonName: 'Citrus family', waterEveryDays: 5, fertilizeEveryDays: 21, light: 'direct', humidity: 'medium', tempC: [10, 30], soil: 'Well-draining citrus mix', toxicToPets: true, difficulty: 'hard', tips: ['Needs lots of light indoors.'] },
  { key: 'Asteraceae', commonName: 'Daisy family', waterEveryDays: 4, fertilizeEveryDays: 21, light: 'direct', humidity: 'medium', tempC: [10, 27], soil: 'Well-draining potting mix', toxicToPets: false, difficulty: 'moderate', tips: ['Deadhead to prolong flowering.'] },
  { key: 'Geraniaceae', commonName: 'Geranium family', waterEveryDays: 5, fertilizeEveryDays: 14, light: 'direct', humidity: 'low', tempC: [10, 27], soil: 'Well-draining potting mix', toxicToPets: true, difficulty: 'easy', tips: ['Let the top soil dry between waterings.'] },
  { key: 'Malvaceae', commonName: 'Mallow family', waterEveryDays: 5, fertilizeEveryDays: 21, light: 'bright-indirect', humidity: 'medium', tempC: [13, 30], soil: 'Rich, well-draining mix', toxicToPets: false, difficulty: 'moderate', tips: ['Most flower best in bright light.'] },
  { key: 'Amaryllidaceae', commonName: 'Amaryllis family', waterEveryDays: 8, fertilizeEveryDays: 30, light: 'bright-indirect', humidity: 'medium', tempC: [13, 27], soil: 'Well-draining potting mix', toxicToPets: true, difficulty: 'easy', tips: ['Bulbs rot if kept wet; water sparingly after flowering.'] },
  { key: 'Strelitziaceae', commonName: 'Bird of Paradise family', waterEveryDays: 8, fertilizeEveryDays: 30, light: 'direct', humidity: 'medium', tempC: [18, 30], soil: 'Rich, well-draining mix', toxicToPets: true, difficulty: 'moderate', tips: ['Split leaves are natural.'] },
  { key: 'Musaceae', commonName: 'Banana family', waterEveryDays: 3, fertilizeEveryDays: 14, light: 'direct', humidity: 'high', tempC: [18, 32], soil: 'Rich, moisture-retaining mix', toxicToPets: false, difficulty: 'moderate', tips: ['Thirsty and hungry in summer.'] },
  { key: 'Zingiberaceae', commonName: 'Ginger family', waterEveryDays: 4, fertilizeEveryDays: 21, light: 'bright-indirect', humidity: 'high', tempC: [18, 30], soil: 'Rich, moist mix', toxicToPets: false, difficulty: 'moderate', tips: ['Keep evenly moist in summer, drier in winter.'] },
  { key: 'Cycadaceae', commonName: 'Cycad', waterEveryDays: 12, fertilizeEveryDays: 60, light: 'bright-indirect', humidity: 'medium', tempC: [10, 30], soil: 'Sandy, well-draining mix', toxicToPets: true, difficulty: 'easy', tips: ['Highly toxic to pets.'] },
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
  const name = (scientificName ?? '').trim().toLowerCase();
  const [genus, species] = name.split(/\s+/);
  if (genus) {
    const bySpecies = PROFILES.find((p) => p.key.toLowerCase() === `${genus} ${species}`);
    if (bySpecies) return bySpecies;
    const byGenus = PROFILES.find((p) => p.key.toLowerCase() === genus);
    if (byGenus) return byGenus;
  }
  if (family) return FAMILY_PROFILES.find((p) => p.key.toLowerCase() === family.trim().toLowerCase());
  return undefined;
}

/** Best guide for a saved plant: bundled species/genus, then its AI profile, then its family. */
export function careForPlant(p: { species?: string; family?: string; aiCare?: CareProfile }): CareProfile | undefined {
  return findCareProfile(p.species) ?? p.aiCare ?? findCareProfile(undefined, p.family);
}

/** True when the bundled guide has this species or genus (no family fallback needed). */
export function hasExactProfile(scientificName?: string): boolean {
  return !!scientificName && !!findCareProfile(scientificName);
}

/** True when the profile is a family-level fallback rather than a genus/species guide. */
export function isFamilyProfile(p: CareProfile): boolean {
  return FAMILY_PROFILES.includes(p);
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
