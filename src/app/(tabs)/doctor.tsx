import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui';
import { SYMPTOMS } from '@/lib/doctor';
import { colors, space } from '@/lib/theme';

export default function DoctorScreen() {
  const [open, setOpen] = useState<string>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.intro}>What do you see? Tap a symptom for likely causes and fixes.</Text>
      {SYMPTOMS.map((s) => {
        const expanded = open === s.id;
        return (
          <Card key={s.id} style={styles.card}>
            <Pressable style={styles.header} onPress={() => setOpen(expanded ? undefined : s.id)}>
              <Text style={styles.title}>{s.title}</Text>
              <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.muted} />
            </Pressable>
            {expanded &&
              s.causes.map((c) => (
                <View key={c.cause} style={styles.cause}>
                  <Text style={styles.causeTitle}>{c.cause}</Text>
                  <Text style={styles.label}>
                    Signs: <Text style={styles.body}>{c.signs}</Text>
                  </Text>
                  <Text style={styles.label}>
                    Fix: <Text style={styles.body}>{c.fix}</Text>
                  </Text>
                </View>
              ))}
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space(4), paddingBottom: space(12) },
  intro: { color: colors.muted, fontSize: 15, marginBottom: space(3) },
  card: { marginBottom: space(2), paddingVertical: space(3) },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space(2) },
  title: { fontSize: 16, fontWeight: '600', color: colors.text, flex: 1 },
  cause: { marginTop: space(3), paddingTop: space(3), borderTopWidth: 1, borderTopColor: colors.border, gap: space(1) },
  causeTitle: { fontSize: 15, fontWeight: '700', color: colors.primary },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, lineHeight: 20 },
  body: { fontWeight: '400', color: colors.text },
});
