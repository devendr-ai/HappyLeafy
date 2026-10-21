import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Chip, Empty } from '@/components/ui';
import { useConsent } from '@/lib/consent';
import { newFollowUp } from '@/lib/followUps';
import { askAboutPlant, type ChatTurn } from '@/lib/gemini';
import { describePlant } from '@/lib/plantContext';
import { canUseAi } from '@/lib/proxy';
import { newId, usePlants } from '@/lib/store';
import { colors, radius, space } from '@/lib/theme';
import { unitsOf } from '@/lib/units';

const STARTERS = ['Why are the leaves turning yellow?', 'Should I repot it?', 'How do I make it bushier?', 'Is it getting enough light?'];

export default function AskScreen() {
  // `q` pre-fills the question, e.g. from a check-in that says the advice didn't help.
  const { id, q } = useLocalSearchParams<{ id: string; q?: string }>();
  const { plants, settings, updatePlant } = usePlants();
  const plant = plants.find((p) => p.id === id);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState(q ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const scroll = useRef<ScrollView>(null);
  const consent = useConsent();
  const [saved, setSaved] = useState<number[]>([]);

  if (!plant) return <Empty icon="leaf-outline" title="Plant not found" body="It may have been deleted." />;
  if (!canUseAi(settings)) {
    return (
      <Empty
        icon="chatbubbles-outline"
        title="Add a Gemini key"
        body="Ask AI uses Google Gemini's free tier. Add your key in Settings."
        action={<Button title="Open Settings" onPress={() => router.push('/settings')} />}
      />
    );
  }

  /** Keep an answer on the plant (shown on its page and given to the AI as context later). */
  const save = async (i: number) => {
    const question = turns[i - 1]?.role === 'user' ? turns[i - 1].text : 'Question';
    await updatePlant(plant.id, {
      savedAdvice: [{ id: newId(), at: new Date().toISOString(), source: 'chat', question, answer: turns[i].text, followUp: newFollowUp(7) }, ...(plant.savedAdvice ?? [])],
    });
    setSaved((s) => [...s, i]);
  };

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || loading) return;
    if (!(await consent('ai'))) return;
    const next: ChatTurn[] = [...turns, { role: 'user', text: question }];
    setTurns(next);
    setInput('');
    setError(undefined);
    setLoading(true);
    try {
      const answer = await askAboutPlant(describePlant(plant, settings.hemisphere, unitsOf(settings)), next, settings.geminiApiKey);
      setTurns([...next, { role: 'model', text: answer.trim() }]);
    } catch (e) {
      // Drop the unanswered question and put it back in the box to retry.
      setTurns(turns);
      setInput(question);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <Stack.Screen options={{ title: `Ask about ${plant.nickname}` }} />
      <ScrollView ref={scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {turns.length === 0 && (
          <View style={{ gap: space(3) }}>
            <Text style={styles.intro}>Ask anything about {plant.nickname}. The AI already knows its species, schedule, pot, light and recent care.</Text>
            <View style={styles.chips}>
              {STARTERS.map((q) => (
                <Chip key={q} label={q} onPress={() => send(q)} />
              ))}
            </View>
          </View>
        )}
        {turns.map((t, i) => (
          <View key={i} style={{ gap: 4 }}>
            <View style={[styles.bubble, t.role === 'user' ? styles.user : styles.model]}>
              <Text style={[styles.text, t.role === 'user' && { color: '#fff' }]}>{t.text}</Text>
            </View>
            {t.role === 'model' && (
              <Pressable onPress={() => save(i)} disabled={saved.includes(i)} hitSlop={6}>
                <Text style={styles.save}>{saved.includes(i) ? `✓ Saved to ${plant.nickname}` : `Save to ${plant.nickname}`}</Text>
              </Pressable>
            )}
          </View>
        ))}
        {loading && <Text style={styles.muted}>Thinking…</Text>}
        {error && <Text style={styles.error}>{error}</Text>}
        {turns.length > 0 && <Text style={styles.muted}>AI answers can be wrong. Double-check before drastic changes.</Text>}
      </ScrollView>
      <View style={styles.composer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a question"
          style={styles.input}
          multiline
          onSubmitEditing={() => send(input)}
          blurOnSubmit={Platform.OS === 'web'}
        />
        <Button title="Send" icon="send" onPress={() => send(input)} disabled={!input.trim() || loading} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space(4), gap: space(3), paddingBottom: space(6) },
  intro: { fontSize: 15, color: colors.text, lineHeight: 21 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  bubble: { padding: space(3), borderRadius: radius.lg, maxWidth: '88%' },
  user: { backgroundColor: colors.primary, alignSelf: 'flex-end' },
  model: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignSelf: 'flex-start' },
  text: { fontSize: 15, color: colors.text, lineHeight: 21 },
  muted: { fontSize: 13, color: colors.muted },
  save: { fontSize: 13, color: colors.primary, fontWeight: '600', marginLeft: space(2) },
  error: { fontSize: 14, color: colors.danger },
  composer: { flexDirection: 'row', gap: space(2), padding: space(3), borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg, alignItems: 'flex-end' },
  input: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: space(3), fontSize: 15, color: colors.text, backgroundColor: colors.card, maxHeight: 120 },
});
