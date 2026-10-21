import { Ionicons } from '@expo/vector-icons';
import { useState, type ComponentProps } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui';
import { careForPlant, DEFAULT_PROFILE } from '@/lib/careDb';
import { addDays, dampChecksSinceWatering, dampDeferDays, startOfDay, type ScheduleContext } from '@/lib/schedule';
import { newId, usePlants } from '@/lib/store';
import { colors, radius, space } from '@/lib/theme';
import type { Plant } from '@/lib/types';
import { formatWaterLong, localizeText, unitsOf, type Units } from '@/lib/units';
import { waterAmount } from '@/lib/waterAmount';

export type SoilOutcome = 'watered' | 'damp';
type Step = 'ask' | 'dry' | 'unsure' | 'damp';

/** How to judge this kind of plant's soil: desert plants dry out fully, humidity lovers stay lightly moist. */
function guidance(p: Plant, units: Units): { short: string; steps: string[] } {
  const g = guidanceMetric(p);
  return { short: localizeText(g.short, units), steps: g.steps.map((t) => localizeText(t, units)) };
}

function guidanceMetric(p: Plant): { short: string; steps: string[] } {
  const care = careForPlant(p) ?? DEFAULT_PROFILE;
  const common = [
    'Lift the pot: a dry pot feels noticeably lighter than a freshly watered one.',
    'Drooping leaves with dry soil mean thirsty. Drooping with wet soil means too much water, so don’t water.',
  ];
  if (care.humidity === 'low' || p.waterEveryDays >= 14) {
    return {
      short: 'Let it dry out completely. Check the bottom of the pot, not just the top.',
      steps: ['Push a wooden skewer or chopstick to the bottom of the pot and leave it a minute. Water only if it comes out clean and dry.', ...common],
    };
  }
  if (care.humidity === 'high') {
    return {
      short: 'Keep it lightly moist. Touch the surface of the soil.',
      steps: ['Water when the top 1–2 cm feels dry to the touch, before the whole pot dries out.', ...common],
    };
  }
  return {
    short: 'Push a finger 3–5 cm into the soil (to the second knuckle).',
    steps: ['Water if it feels dry at that depth. If it feels cool and damp, wait.', ...common],
  };
}

/** Check soil → Dry / Still damp / Not sure → the right next step. Recording "still damp" is good care, not a miss. */
export function SoilCheckSheet({ plant, ctx, onClose }: { plant: Plant | undefined; ctx: ScheduleContext; onClose: (outcome?: SoilOutcome) => void }) {
  const { logCare, updatePlant, settings } = usePlants();
  const units = unitsOf(settings);
  const [step, setStep] = useState<Step>('ask');
  const [outcome, setOutcome] = useState<SoilOutcome>();
  const [suggestion, setSuggestion] = useState<{ from: number; to: number }>();
  const [applied, setApplied] = useState(false);

  if (!plant) return null;
  const g = guidance(plant, units);
  const amount = waterAmount(plant);
  const defer = dampDeferDays(plant, ctx);

  const close = () => {
    setStep('ask');
    setSuggestion(undefined);
    setApplied(false);
    const o = outcome;
    setOutcome(undefined);
    onClose(o);
  };

  const watered = async () => {
    await logCare(plant.id, 'water');
    setOutcome('watered');
    onClose('watered');
    setStep('ask');
    setOutcome(undefined);
  };

  const damp = async () => {
    const at = new Date().toISOString();
    const priorDamp = dampChecksSinceWatering(plant);
    await updatePlant(plant.id, {
      history: [{ id: newId(), type: 'check', at, note: 'Soil still damp', prev: plant.waterCheckAfter }, ...plant.history],
      waterCheckAfter: addDays(startOfDay(new Date()), defer).toISOString(),
    });
    // Damp at two checks in a row: offer (not force) a longer interval.
    if (priorDamp >= 1) setSuggestion({ from: plant.waterEveryDays, to: plant.waterEveryDays + defer });
    setOutcome('damp');
    setStep('damp');
  };

  const nextCheck = addDays(new Date(), defer).toLocaleDateString(undefined, { weekday: 'long' });

  return (
    <Modal visible animationType="slide" transparent onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <ScrollView contentContainerStyle={{ gap: space(3) }}>
          {step === 'ask' && (
            <>
              <Text style={styles.title}>Check {plant.nickname}’s soil</Text>
              <Text style={styles.body}>{g.short}</Text>
              <Choice icon="sunny" color={colors.feed} title="Dry" subtitle="It needs water" onPress={() => setStep('dry')} />
              <Choice icon="water" color={colors.water} title="Still damp" subtitle="Skip watering for now" onPress={damp} />
              <Choice icon="help-circle" color={colors.muted} title="Not sure" subtitle="Show me how to check" onPress={() => setStep('unsure')} />
            </>
          )}

          {step === 'dry' && (
            <>
              <Text style={styles.title}>Water {plant.nickname}</Text>
              <Text style={styles.body}>
                {amount ? `Give about ${formatWaterLong(amount.ml, units)}. ` : ''}
                Pour slowly and evenly until a little drains from the bottom, then empty the saucer.
                {plant.drainage === false ? ' No drainage hole: stop before water pools.' : ''}
              </Text>
              <Button title="I watered it" icon="water" variant="water" onPress={watered} />
              <Pressable onPress={() => setStep('ask')} hitSlop={8}>
                <Text style={styles.link}>Back</Text>
              </Pressable>
            </>
          )}

          {step === 'unsure' && (
            <>
              <Text style={styles.title}>How to check {plant.nickname}</Text>
              {[g.short, ...g.steps].map((t) => (
                <Text key={t} style={styles.body}>
                  • {t}
                </Text>
              ))}
              <View style={styles.row}>
                <Button title="It’s dry" variant="secondary" style={{ flex: 1 }} onPress={() => setStep('dry')} />
                <Button title="Still damp" variant="water" style={{ flex: 1 }} onPress={damp} />
              </View>
            </>
          )}

          {step === 'damp' && (
            <>
              <Text style={styles.title}>Good call: no water today 👍</Text>
              <Text style={styles.body}>
                Watering soil that’s still damp is the most common way houseplants get root rot. We’ll ask you to check again on {nextCheck}. This check still counts
                toward your streak.
              </Text>
              {suggestion && (
                <View style={styles.suggest}>
                  <Text style={styles.body}>
                    The soil was still damp at the last check too. Change {plant.nickname}’s schedule from every {suggestion.from} to every {suggestion.to} days?
                  </Text>
                  {applied ? (
                    <Text style={styles.ok}>✓ Now every {suggestion.to} days. You can change it any time on the plant’s page.</Text>
                  ) : (
                    <View style={styles.row}>
                      <Button
                        title={`Every ${suggestion.to} days`}
                        style={{ flex: 1 }}
                        onPress={async () => {
                          await updatePlant(plant.id, { waterEveryDays: suggestion.to });
                          setApplied(true);
                        }}
                      />
                      <Button title="Keep it" variant="secondary" style={{ flex: 1 }} onPress={() => setSuggestion(undefined)} />
                    </View>
                  )}
                </View>
              )}
              <Button title="Done" onPress={close} />
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

function Choice({ icon, color, title, subtitle, onPress }: { icon: ComponentProps<typeof Ionicons>['name']; color: string; title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.choice, pressed && { opacity: 0.7 }]}>
      <Ionicons name={icon} size={26} color={color} />
      <View style={{ flex: 1 }}>
        <Text style={styles.choiceTitle}>{title}</Text>
        <Text style={styles.choiceSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: space(5), paddingBottom: space(10), maxHeight: '80%' },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: space(4) },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  body: { fontSize: 15, color: colors.text, lineHeight: 22 },
  link: { color: colors.primary, fontWeight: '600', textAlign: 'center', padding: space(2) },
  row: { flexDirection: 'row', gap: space(3) },
  choice: { flexDirection: 'row', alignItems: 'center', gap: space(3), backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: space(4) },
  choiceTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  choiceSub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  suggest: { backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: space(3), gap: space(3) },
  ok: { color: colors.primary, fontWeight: '600', fontSize: 14 },
});
