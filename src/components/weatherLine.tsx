import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { TownSheet } from '@/components/townSheet';
import { usePlants } from '@/lib/store';
import { colors, space } from '@/lib/theme';
import { unitsOf } from '@/lib/units';
import { getWeatherNow, type WeatherNow } from '@/lib/weather';

/** Top of Today: temperature and tomorrow's rain for the user's town, or a prompt to set one. */
export function WeatherLine() {
  const { settings } = usePlants();
  const place = settings.weather;
  const [now, setNow] = useState<WeatherNow>();
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    if (!place) return;
    let cancelled = false;
    getWeatherNow(place.latitude, place.longitude)
      .then((w) => !cancelled && setNow(w))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [place]);

  const town = place?.place.split(',')[0];
  const shown = place && now && Number.isFinite(now.tempC) ? now : undefined;
  const temp = shown && (unitsOf(settings) === 'us' ? `${Math.round((shown.tempC * 9) / 5 + 32)}°` : `${Math.round(shown.tempC)}°`);
  const rain = shown && shown.rainTomorrowMm >= 1;

  return (
    <>
      <Pressable onPress={() => setPicking(true)} style={styles.row} accessibilityLabel={town ? `Weather for ${town}` : 'Set your town for local weather'}>
        <Ionicons name={!shown ? 'cloud-outline' : rain ? 'rainy-outline' : 'partly-sunny-outline'} size={24} color={rain ? colors.water : colors.muted} />
        <Text style={styles.main}>{shown ? `${temp} · ${rain ? 'Rain tomorrow' : 'Dry tomorrow'}` : 'Local weather'}</Text>
        <Text style={styles.side}>{town ?? 'Set town'} ›</Text>
      </Pressable>
      <TownSheet visible={picking} onClose={() => setPicking(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space(2), paddingVertical: space(2) },
  main: { flex: 1, fontSize: 17, fontWeight: '700', color: colors.text },
  side: { fontSize: 15, fontWeight: '600', color: colors.muted },
});
