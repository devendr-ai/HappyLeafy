import { StyleSheet, Text, View } from 'react-native';
import { Button, Card } from '@/components/ui';
import { exitDemo, isDemo } from '@/lib/demo';
import { colors, space } from '@/lib/theme';

/** Web demo only: explains the sample garden and offers to start a real one. */
export function DemoBanner() {
  // `&clean` hides the banner for marketing screenshots.
  if (!isDemo() || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('clean'))) return null;
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>👀 You’re exploring a demo garden</Text>
      <Text style={styles.body}>These are sample plants and nothing you change is saved. Tap around: open a plant, check its care guide, or ask the AI a question.</Text>
      <View style={styles.row}>
        <Button title="Start my own garden" icon="leaf" onPress={exitDemo} style={{ flex: 1 }} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: space(3), gap: space(2), backgroundColor: colors.feedSoft, borderColor: colors.feedSoft },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  body: { fontSize: 14, color: colors.text, lineHeight: 20 },
  row: { flexDirection: 'row' },
});
