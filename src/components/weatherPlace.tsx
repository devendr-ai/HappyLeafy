import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card, Chip } from '@/components/ui';
import { usePlants } from '@/lib/store';
import { colors, radius, space } from '@/lib/theme';
import { formatRain, unitsOf } from '@/lib/units';
import { RAIN_MM, searchPlaces, type Place } from '@/lib/weather';

/** Settings card: choose the town whose rain counts for outdoor plants. */
export function WeatherPlace() {
  const { settings, updateSettings, plants } = usePlants();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const outdoor = plants.filter((p) => p.outdoor).length;

  const search = async () => {
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

  const choose = (p: Place) => {
    updateSettings({ weather: { latitude: p.latitude, longitude: p.longitude, place: p.name } });
    setResults(undefined);
    setQuery('');
  };

  return (
    <Card style={{ gap: space(3) }}>
      <Text style={styles.body}>
        Outdoor plants count {formatRain(RAIN_MM, unitsOf(settings))}+ of rain as a watering, and Today warns when rain is coming. Weather from Open-Meteo; only your town is sent, never your GPS
        location. {outdoor ? `${outdoor} outdoor plant${outdoor > 1 ? 's' : ''}.` : 'Mark a plant as Outdoors on its page to use this.'}
      </Text>
      {settings.weather && (
        <View style={styles.row}>
          <Text style={[styles.body, { flex: 1, fontWeight: '600' }]}>📍 {settings.weather.place}</Text>
          <Button title="Clear" variant="secondary" onPress={() => updateSettings({ weather: undefined })} />
        </View>
      )}
      <View style={styles.row}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={search}
          placeholder={settings.weather ? 'Change town' : 'Your town or city'}
          style={styles.input}
          returnKeyType="search"
        />
        <Button title="Search" onPress={search} loading={loading} disabled={query.trim().length < 2} />
      </View>
      {results && (
        <View style={styles.chips}>
          {results.length === 0 && <Text style={styles.muted}>No places found.</Text>}
          {results.map((p) => (
            <Chip key={`${p.latitude},${p.longitude}`} label={p.name} onPress={() => choose(p)} />
          ))}
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  body: { color: colors.text, fontSize: 14, lineHeight: 20 },
  muted: { color: colors.muted, fontSize: 13 },
  error: { color: colors.danger, fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  input: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: space(3), fontSize: 15, color: colors.text, backgroundColor: colors.bg },
});
