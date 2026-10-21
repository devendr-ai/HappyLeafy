import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '@/components/ui';
import { usePlants } from '@/lib/store';
import { colors, radius, space } from '@/lib/theme';
import type { Plant } from '@/lib/types';

/** Bottom sheet to rename a plant or correct what it is. Room, pot and photos are edited on the plant page itself. */
export function EditPlantSheet({ plant, onClose }: { plant: Plant; onClose: () => void }) {
  const { updatePlant } = usePlants();
  const [nickname, setNickname] = useState(plant.nickname);
  const [commonName, setCommonName] = useState(plant.commonName ?? '');
  const [species, setSpecies] = useState(plant.species ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const nextSpecies = species.trim() || undefined;
    const nextCommon = commonName.trim() || undefined;
    const speciesChanged = nextSpecies !== plant.species;
    const patch: Partial<Plant> = { nickname: nickname.trim() || plant.nickname, commonName: nextCommon, species: nextSpecies };
    // A different plant: drop what was looked up for the old one (care guide, family, stock photo) so it's redone.
    if (speciesChanged) Object.assign(patch, { aiCare: undefined, family: undefined, refPhoto: undefined });
    else if (nextCommon !== plant.commonName && !nextSpecies) patch.refPhoto = undefined;
    await updatePlant(plant.id, patch);
    setSaving(false);
    onClose();
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView contentContainerStyle={{ gap: space(3) }} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Edit details</Text>
            <Field label="Nickname" value={nickname} onChange={setNickname} placeholder="Monty" />
            <Field label="Common name" value={commonName} onChange={setCommonName} placeholder="Swiss cheese plant" />
            <Field label="Scientific name" value={species} onChange={setSpecies} placeholder="Monstera deliciosa" />
            <Text style={styles.hint}>Changing the scientific name updates the care guide and reference photo. Your schedule stays as it is.</Text>
            <View style={styles.row}>
              <Button title="Cancel" variant="secondary" style={{ flex: 1 }} onPress={onClose} />
              <Button title="Save" style={{ flex: 1 }} loading={saving} onPress={save} />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <View style={{ gap: space(1) }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={colors.muted} style={styles.input} autoCorrect={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: space(5), paddingBottom: space(10) },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: space(4) },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: space(3), fontSize: 16, color: colors.text, backgroundColor: colors.card },
  hint: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  row: { flexDirection: 'row', gap: space(3), marginTop: space(2) },
});
