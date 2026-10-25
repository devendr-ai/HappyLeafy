import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Chip } from '@/components/ui';
import { usePlants } from '@/lib/store';
import { colors, radius, space } from '@/lib/theme';
import { searchPlaces, type Place } from '@/lib/weather';

/** Bottom sheet to set or change the town (weather, rain and seasons), opened from the Today weather line. */
export function TownSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { settings, updateSettings } = usePlants();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const search = async () => {
    if (query.trim().length < 2) return;
    setLoading(true);
    setError(undefined);
    try {
      setResults(await searchPlaces(query));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setQuery('');
    setResults(undefined);
    setError(undefined);
    onClose();
  };

  const choose = (p: Place) => {
    // Latitude also decides which months are winter for the watering schedule.
    updateSettings({ weather: { latitude: p.latitude, longitude: p.longitude, place: p.name }, hemisphere: p.latitude < 0 ? 'southern' : 'northern' });
    close();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Your town</Text>
          <Text style={styles.body}>Sets the seasons for watering, shows local weather, and lets rain count for outdoor plants. Only the town is used, never your GPS.</Text>
          {settings.weather && (
            <View style={styles.row}>
              <Text style={[styles.body, { flex: 1, fontWeight: '700' }]}>📍 {settings.weather.place}</Text>
              <Button title="Clear" variant="secondary" onPress={() => updateSettings({ weather: undefined })} />
            </View>
          )}
          <View style={styles.row}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={search}
              placeholder={settings.weather ? 'Change town' : 'Type your town or city'}
              placeholderTextColor={colors.muted}
              style={styles.input}
              returnKeyType="search"
              autoFocus
            />
            <Button title="Search" onPress={search} disabled={query.trim().length < 2 || loading} />
          </View>
          {loading && <ActivityIndicator color={colors.primary} />}
          {results && (
            <View style={styles.chips}>
              {results.length === 0 && <Text style={styles.muted}>No places found. Try the nearest bigger town.</Text>}
              {results.map((p) => (
                <Chip key={`${p.latitude},${p.longitude}`} label={p.name} onPress={() => choose(p)} />
              ))}
            </View>
          )}
          {error && <Text style={styles.error}>{error}</Text>}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.32)' },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: radius.lg + 8, borderTopRightRadius: radius.lg + 8, padding: space(5), paddingBottom: space(10), gap: space(3) },
  handle: { alignSelf: 'center', width: 42, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: space(1) },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  body: { fontSize: 14, color: colors.text, lineHeight: 20 },
  muted: { color: colors.muted, fontSize: 13 },
  error: { color: colors.danger, fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  input: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: space(3), fontSize: 15, color: colors.text, backgroundColor: colors.card },
});
