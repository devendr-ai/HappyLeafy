import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '@/components/ui';
import { checkInQuestion, newFollowUp } from '@/lib/followUps';
import { newId, usePlants } from '@/lib/store';
import { colors, radius, space } from '@/lib/theme';
import type { FollowUpOutcome, Plant, SavedAdvice } from '@/lib/types';

const OUTCOMES: { value: FollowUpOutcome; title: string; icon: ComponentProps<typeof Ionicons>['name']; color: string }[] = [
  { value: 'better', title: 'Better', icon: 'happy-outline', color: colors.primary },
  { value: 'same', title: 'No change', icon: 'remove-circle-outline', color: colors.muted },
  { value: 'worse', title: 'Worse', icon: 'sad-outline', color: colors.danger },
];

/** Check-in on saved advice: did it help? Records the answer, then suggests what to do next. */
export function FollowUpSheet({ plant, advice, onClose }: { plant: Plant; advice: SavedAdvice; onClose: () => void }) {
  const { plants, updatePlant } = usePlants();
  const [note, setNote] = useState('');
  const [outcome, setOutcome] = useState<FollowUpOutcome>();

  // Always write against the latest plant, in case it changed while the sheet was open.
  const save = async (patch: Partial<SavedAdvice>, event?: string) => {
    const latest = plants.find((p) => p.id === plant.id) ?? plant;
    const savedAdvice = (latest.savedAdvice ?? []).map((a) => (a.id === advice.id ? { ...a, ...patch } : a));
    const history = event ? [{ id: newId(), type: 'note' as const, at: new Date().toISOString(), note: event }, ...latest.history] : latest.history;
    await updatePlant(plant.id, { savedAdvice, history });
  };

  const record = async (value: FollowUpOutcome) => {
    const label = OUTCOMES.find((o) => o.value === value)!.title.toLowerCase();
    await save(
      { followUp: { ...advice.followUp!, outcome: value, note: note.trim() || undefined, doneAt: new Date().toISOString() } },
      `Check-in: ${label} after “${advice.question}”${note.trim() ? ` (${note.trim()})` : ''}`,
    );
    setOutcome(value);
  };

  const checkAgain = async () => {
    await save({ followUp: newFollowUp(7, advice.followUp?.lookFor) });
    onClose();
  };

  const askNext = () => {
    onClose();
    const how = outcome === 'worse' ? 'it got worse' : 'nothing has changed';
    router.push({ pathname: '/ask', params: { id: plant.id, q: `I tried this advice: “${advice.question}”, but ${how}. What should I try next?` } });
  };

  const diagnoseAgain = () => {
    onClose();
    router.push({ pathname: '/doctor', params: { plantId: plant.id } });
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView contentContainerStyle={{ gap: space(3) }} keyboardShouldPersistTaps="handled">
            {!outcome ? (
              <>
                <Text style={styles.title}>How is {plant.nickname} doing?</Text>
                <Text style={styles.context}>You saved: {advice.question}</Text>
                <Text style={styles.body}>{checkInQuestion(advice, plant.nickname)}</Text>
                {OUTCOMES.map((o) => (
                  <Pressable key={o.value} onPress={() => record(o.value)} style={({ pressed }) => [styles.choice, pressed && { opacity: 0.7 }]}>
                    <Ionicons name={o.icon} size={26} color={o.color} />
                    <Text style={styles.choiceTitle}>{o.title}</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                  </Pressable>
                ))}
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Anything you noticed? (optional)"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                />
              </>
            ) : outcome === 'better' ? (
              <>
                <Text style={styles.title}>Great, it’s working 🌱</Text>
                <Text style={styles.body}>Keep doing what you changed. This result is saved with the advice, so Ask AI knows it helped.</Text>
                <Button title="Done" onPress={onClose} />
              </>
            ) : (
              <>
                <Text style={styles.title}>{outcome === 'worse' ? 'Sorry it’s worse' : 'No change yet'}</Text>
                <Text style={styles.body}>
                  {outcome === 'worse'
                    ? 'Something else may be going on. A fresh diagnosis with new photos, or a question to the AI with this result, can find the next step.'
                    : 'Some fixes take a few weeks to show. You can check again later, or ask what else to try.'}
                </Text>
                {outcome === 'same' && <Button title="Check again in a week" variant="secondary" onPress={checkAgain} />}
                <Button title="Ask AI what to try next" icon="chatbubbles" variant="secondary" onPress={askNext} />
                <Button title="Diagnose again" icon="medkit" variant="secondary" onPress={diagnoseAgain} />
                <Pressable onPress={onClose} hitSlop={8}>
                  <Text style={styles.link}>Close</Text>
                </Pressable>
              </>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: space(5), paddingBottom: space(10), maxHeight: '85%' },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: space(4) },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  context: { fontSize: 13, color: colors.muted },
  body: { fontSize: 15, color: colors.text, lineHeight: 22 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: space(3), backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: space(4) },
  choiceTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: colors.text },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: space(3), fontSize: 15, color: colors.text, backgroundColor: colors.card },
  link: { color: colors.primary, fontWeight: '600', textAlign: 'center', padding: space(2) },
});
