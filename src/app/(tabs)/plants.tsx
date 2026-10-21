import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card, Chip, Empty, PlantPhoto } from '@/components/ui';
import { StreakBadge } from '@/components/careActivityCard';
import { careActivity } from '@/lib/careActivity';
import { roomsOf } from '@/lib/plantContext';
import { daysUntil, nextWaterDate } from '@/lib/schedule';
import { usePlants } from '@/lib/store';
import { colors, radius, space } from '@/lib/theme';
import { plantCover } from '@/lib/refPhoto';
import type { Plant } from '@/lib/types';

type Sort = 'water' | 'name' | 'newest';
const SORTS: { value: Sort; label: string }[] = [
  { value: 'water', label: 'Needs water' },
  { value: 'name', label: 'Name' },
  { value: 'newest', label: 'Newest' },
];
const NO_ROOM = '__none__';

export default function PlantsScreen() {
  const { plants, settings, ready } = usePlants();
  const [query, setQuery] = useState('');
  const [room, setRoom] = useState<string>();
  const [sort, setSort] = useState<Sort>('water');

  const rooms = useMemo(() => roomsOf(plants), [plants]);
  const waterIn = (p: Plant) => daysUntil(nextWaterDate(p, { hemisphere: settings.hemisphere }));

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = plants.filter((p) => {
      if (room === NO_ROOM ? !!p.location?.trim() : room && p.location?.trim() !== room) return false;
      if (!q) return true;
      return [p.nickname, p.commonName, p.species, p.location].some((v) => v?.toLowerCase().includes(q));
    });
    const by: Record<Sort, (a: Plant, b: Plant) => number> = {
      water: (a, b) => waterIn(a) - waterIn(b),
      name: (a, b) => a.nickname.localeCompare(b.nickname),
      newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    };
    return [...list].sort(by[sort]);
    // waterIn depends only on settings.hemisphere.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plants, query, room, sort, settings.hemisphere]);

  if (!ready) return null;

  const header =
    plants.length > 0 ? (
      <View style={{ gap: space(3), marginBottom: space(1) }}>
        <View style={styles.header}>
          <Button title="Identify" icon="scan" style={{ flex: 1 }} onPress={() => router.push('/identify')} />
          <Button title="Add" icon="add" variant="secondary" style={{ flex: 1 }} onPress={() => router.push('/add')} />
        </View>
        {plants.length > 3 && (
          <TextInput value={query} onChangeText={setQuery} placeholder="Search plants" style={styles.search} autoCorrect={false} clearButtonMode="while-editing" />
        )}
        {rooms.length > 0 && (
          <View style={styles.chips}>
            <Chip label="All rooms" selected={!room} onPress={() => setRoom(undefined)} />
            {rooms.map((r) => (
              <Chip key={r} label={r} selected={room === r} onPress={() => setRoom(room === r ? undefined : r)} />
            ))}
            {plants.some((p) => !p.location?.trim()) && <Chip label="No room" selected={room === NO_ROOM} onPress={() => setRoom(room === NO_ROOM ? undefined : NO_ROOM)} />}
          </View>
        )}
        {plants.length > 1 && (
          <View style={styles.sortRow}>
            <Text style={styles.sortLabel}>Sort</Text>
            {SORTS.map((s) => (
              <Pressable key={s.value} onPress={() => setSort(s.value)} hitSlop={6}>
                <Text style={[styles.sort, sort === s.value && styles.sortActive]}>{s.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    ) : undefined;

  return (
    <FlatList
      data={visible}
      keyExtractor={(p) => p.id}
      numColumns={2}
      columnWrapperStyle={{ gap: space(3) }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={header}
      ListEmptyComponent={
        plants.length > 0 ? (
          <Text style={styles.noMatch}>No plants match.</Text>
        ) : (
          <Empty
            icon="leaf-outline"
            title="No plants yet"
            body="Snap a photo to identify a plant, or add one by name."
            action={<Button title="Add a plant" icon="add" onPress={() => router.push('/add')} />}
          />
        )
      }
      renderItem={({ item }) => {
        const days = waterIn(item);
        return (
          <Pressable style={{ flex: 1, maxWidth: '50%' }} onPress={() => router.push(`/plant/${item.id}`)}>
            <Card style={styles.tile}>
              <PlantPhoto uri={plantCover(item)} size={140} style={{ width: '100%' }} />
              <Text style={styles.name} numberOfLines={1}>
                {item.nickname}
              </Text>
              <Text style={styles.species} numberOfLines={1}>
                {item.commonName ?? item.species ?? 'Unknown species'}
              </Text>
              <View style={styles.waterRow}>
                <Ionicons name="water" size={14} color={days <= 0 ? colors.danger : colors.water} />
                <Text style={[styles.waterText, days <= 0 && { color: colors.danger }]}>{days < 0 ? 'Overdue' : days === 0 ? 'Today' : `${days}d`}</Text>
                {item.location && (
                  <Text style={styles.room} numberOfLines={1}>
                    · {item.location}
                  </Text>
                )}
              </View>
              <View style={{ marginTop: space(1) }}>
                <StreakBadge activity={careActivity(item, { hemisphere: settings.hemisphere })} />
              </View>
            </Card>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: space(4), gap: space(3), paddingBottom: space(10) },
  header: { flexDirection: 'row', gap: space(3) },
  search: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: space(3), fontSize: 15, color: colors.text, backgroundColor: colors.card },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
  sortLabel: { fontSize: 13, color: colors.muted },
  sort: { fontSize: 13, color: colors.muted },
  sortActive: { color: colors.primary, fontWeight: '700' },
  noMatch: { textAlign: 'center', color: colors.muted, padding: space(6) },
  tile: { padding: space(2) },
  name: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: space(2) },
  species: { fontSize: 13, color: colors.muted, marginTop: 2 },
  waterRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: space(2) },
  waterText: { fontSize: 13, color: colors.water, fontWeight: '600' },
  room: { fontSize: 12, color: colors.muted, flex: 1 },
});
