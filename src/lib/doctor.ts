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
