/** Rule-based plant symptom checker. Free and offline. */
export type Symptom = {
  id: string;
  title: string;
  causes: { cause: string; signs: string; fix: string }[];
};

export const SYMPTOMS: Symptom[] = [
  {
    id: 'yellow-lower',
    title: 'Yellow leaves (lower / older ones)',
    causes: [
      { cause: 'Overwatering', signs: 'Soil stays wet for days, leaves soft, maybe a musty smell.', fix: 'Let the soil dry further before watering. Check the pot drains. Lengthen the watering interval.' },
      { cause: 'Natural ageing', signs: 'Only one or two old leaves, new growth looks healthy.', fix: 'Nothing to fix. Remove the leaf once fully yellow.' },
      { cause: 'Nitrogen deficiency', signs: 'Gradual even yellowing, slow growth, no feeding for months.', fix: 'Feed with a balanced fertiliser at half strength during the growing season.' },
    ],
  },
  {
    id: 'yellow-new',
    title: 'Yellow new leaves',
    causes: [
      { cause: 'Iron / micronutrient deficiency', signs: 'Yellow between green veins on new leaves.', fix: 'Use a fertiliser with micronutrients; check soil is not too alkaline.' },
      { cause: 'Too little light', signs: 'Pale, small new leaves; plant leans to the window.', fix: 'Move closer to a bright window or add a grow light.' },
    ],
  },
  {
    id: 'brown-tips',
    title: 'Brown, crispy leaf tips or edges',
    causes: [
      { cause: 'Low humidity', signs: 'Tips crisp, worse in winter with heating on.', fix: 'Group plants, use a humidifier or pebble tray. Keep away from heaters.' },
      { cause: 'Underwatering', signs: 'Soil bone-dry, pot feels light.', fix: 'Water thoroughly until it drains, then shorten the watering interval.' },
      { cause: 'Salt / fluoride build-up', signs: 'White crust on soil or pot rim.', fix: 'Flush the soil with lots of water; switch to filtered or rain water.' },
    ],
  },
  {
    id: 'brown-spots',
    title: 'Brown or black spots on leaves',
    causes: [
      { cause: 'Fungal / bacterial leaf spot', signs: 'Spots with yellow halos, spreading.', fix: 'Remove affected leaves, water the soil not the leaves, improve airflow.' },
      { cause: 'Sunburn', signs: 'Bleached or brown patches on the side facing the sun.', fix: 'Move out of harsh direct sun or filter it with a sheer curtain.' },
      { cause: 'Root rot', signs: 'Dark mushy spots plus wet soil and wilting.', fix: 'Unpot, cut off black mushy roots, repot in fresh dry mix, water less.' },
    ],
  },
  {
    id: 'drooping',
    title: 'Drooping or wilting',
    causes: [
      { cause: 'Thirsty', signs: 'Soil dry, leaves limp but not mushy.', fix: 'Water thoroughly. It should perk up within hours.' },
      { cause: 'Root rot from overwatering', signs: 'Soil wet but plant still wilts.', fix: 'Check roots; trim rot, repot in dry fresh mix, water less.' },
      { cause: 'Temperature shock', signs: 'Sudden droop after a cold draft or a move.', fix: 'Move away from doors, AC and heaters. Give it a week.' },
    ],
  },
  {
    id: 'leggy',
    title: 'Leggy, stretched growth',
    causes: [{ cause: 'Not enough light', signs: 'Long gaps between leaves, small leaves, leaning.', fix: 'Move to brighter light and prune leggy stems to encourage bushiness.' }],
  },
  {
    id: 'pests-webs',
    title: 'Fine webbing or tiny dots under leaves',
    causes: [{ cause: 'Spider mites', signs: 'Speckled, dull leaves; fine webs; worse in dry air.', fix: 'Isolate. Shower the plant, then wipe or spray with insecticidal soap weekly for 3–4 weeks.' }],
  },
  {
    id: 'pests-cotton',
    title: 'White cottony fluff in leaf joints',
    causes: [{ cause: 'Mealybugs', signs: 'White fluff, sticky leaves.', fix: 'Isolate. Dab bugs with a cotton bud dipped in rubbing alcohol; follow with insecticidal soap or neem weekly.' }],
  },
  {
    id: 'pests-flies',
    title: 'Small flies around the soil',
    causes: [{ cause: 'Fungus gnats', signs: 'Tiny black flies, soil always moist.', fix: 'Let the top soil dry out, use yellow sticky traps, bottom-water.' }],
  },
  {
    id: 'sticky',
    title: 'Sticky leaves or bumps on stems',
    causes: [
      { cause: 'Scale insects', signs: 'Brown bumps on stems and leaf veins.', fix: 'Scrape off, then treat with neem oil or horticultural oil weekly.' },
      { cause: 'Aphids', signs: 'Clusters of small green/black bugs on new growth.', fix: 'Rinse off with water, then spray insecticidal soap.' },
    ],
  },
  {
    id: 'mold-soil',
    title: 'White mould on the soil',
    causes: [{ cause: 'Saprophytic fungus from damp soil', signs: 'Fuzzy white layer, harmless to the plant.', fix: 'Scrape it off, water less often, improve airflow. Sprinkle cinnamon on top.' }],
  },
  {
    id: 'no-growth',
    title: 'No new growth',
    causes: [
      { cause: 'Winter dormancy', signs: 'Short days, cooler room.', fix: 'Normal. Water and feed less until spring.' },
      { cause: 'Root-bound', signs: 'Roots circling or poking out of drainage holes.', fix: 'Repot one size up in spring.' },
      { cause: 'Low light', signs: 'Far from windows.', fix: 'Move to brighter spot or add a grow light.' },
    ],
  },
];

/** Treatment advice for photo-diagnosis results, matched on keywords in the disease name. */
const DISEASE_ADVICE: { match: RegExp; title: string; fix: string }[] = [
  { match: /powdery mildew|erysiph|podosphaera|oidium|golovinomyces/i, title: 'Powdery mildew', fix: 'Remove the worst leaves. Improve airflow, avoid wetting leaves, and spray with diluted potassium bicarbonate or neem oil weekly.' },
  { match: /downy mildew|peronospora|plasmopara|bremia/i, title: 'Downy mildew', fix: 'Remove infected leaves, keep foliage dry, water in the morning and space plants out for airflow.' },
  { match: /rust|puccinia|uromyces|phragmidium/i, title: 'Rust', fix: 'Pick off spotted leaves and bin them. Keep leaves dry and improve airflow; a copper or sulphur fungicide helps if it spreads.' },
  { match: /botrytis|grey mou?ld|gray mou?ld/i, title: 'Grey mould (Botrytis)', fix: 'Cut away fuzzy grey tissue, remove dead leaves and flowers, lower humidity and increase airflow.' },
  { match: /pythium|phytophthora|root rot|fusarium|rhizoctonia/i, title: 'Root or stem rot', fix: 'Unpot, cut away brown mushy roots with clean scissors, repot in fresh, dry, well-draining mix and water much less.' },
  { match: /anthracnose|colletotrichum|septoria|alternaria|cercospora|leaf spot|blight|xanthomonas|pseudomonas/i, title: 'Leaf spot / blight', fix: 'Remove spotted leaves, water the soil not the leaves, and give the plant more space and airflow. Disinfect tools.' },
  { match: /virus|mosaic|tospovirus|tswv|potyvirus/i, title: 'Viral disease', fix: 'There is no cure. Isolate the plant; if it keeps declining, discard it to protect your other plants. Control thrips and aphids, which spread viruses.' },
  { match: /aphid|aphis|myzus/i, title: 'Aphids', fix: 'Rinse them off with water, then spray insecticidal soap every 5–7 days until gone.' },
  { match: /mite|tetranychus/i, title: 'Spider mites', fix: 'Isolate, shower the plant, then treat with insecticidal soap or neem weekly for 3–4 weeks. Raise humidity.' },
  { match: /mealybug|pseudococc|planococcus/i, title: 'Mealybugs', fix: 'Dab bugs with rubbing alcohol on a cotton bud, then spray insecticidal soap or neem weekly.' },
  { match: /scale|coccus|diaspid/i, title: 'Scale insects', fix: 'Scrape off the bumps, then treat with horticultural or neem oil weekly for a month.' },
  { match: /thrips|frankliniella|thrip/i, title: 'Thrips', fix: 'Isolate, shower the leaves, use blue sticky traps and spray insecticidal soap or spinosad weekly.' },
  { match: /whitefl|trialeurodes|bemisia/i, title: 'Whitefly', fix: 'Use yellow sticky traps and spray insecticidal soap on leaf undersides every few days.' },
  { match: /sciarid|fungus gnat|bradysia/i, title: 'Fungus gnats', fix: 'Let the top soil dry out between waterings, use yellow sticky traps, and water from the bottom.' },
  { match: /sunburn|sunscald|scorch/i, title: 'Sunburn', fix: 'Move it out of harsh direct sun or filter the light with a sheer curtain. Damaged leaves will not recover.' },
  { match: /chlorosis|deficien|nitrogen|iron|magnesium/i, title: 'Nutrient deficiency', fix: 'Feed with a balanced fertiliser containing micronutrients during the growing season.' },
];

export function adviceForDisease(name: string): { title: string; fix: string } | undefined {
  return DISEASE_ADVICE.find((a) => a.match.test(name));
}
