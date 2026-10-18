import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Empty, PlantPhoto } from '@/components/ui';
import { daysUntil, nextWaterDate } from '@/lib/schedule';
import { usePlants } from '@/lib/store';
import { colors, space } from '@/lib/theme';

export default function PlantsScreen() {
  const { plants, ready } = usePlants();
  if (!ready) return null;

  return (
      <FlatList
        data={plants}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: space(3) }}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          plants.length > 0 ? (
            <View style={styles.header}>
              <Button title="Identify" icon="scan" style={{ flex: 1 }} onPress={() => router.push('/identify')} />
              <Button title="Add" icon="add" variant="secondary" style={{ flex: 1 }} onPress={() => router.push('/add')} />
            </View>
          ) : undefined
        }
        ListEmptyComponent={
          <Empty
            icon="leaf-outline"
            title="No plants yet"
            body="Snap a photo to identify a plant, or add one by name."
            action={<Button title="Add a plant" icon="add" onPress={() => router.push('/add')} />}
          />
        }
        renderItem={({ item }) => {
          const days = daysUntil(nextWaterDate(item));
          return (
            <Pressable style={{ flex: 1, maxWidth: '50%' }} onPress={() => router.push(`/plant/${item.id}`)}>
              <Card style={styles.tile}>
                <PlantPhoto uri={item.photoUri} size={140} style={{ width: '100%' }} />
                <Text style={styles.name} numberOfLines={1}>
                  {item.nickname}
                </Text>
                <Text style={styles.species} numberOfLines={1}>
                  {item.commonName ?? item.species ?? 'Unknown species'}
                </Text>
                <View style={styles.waterRow}>
                  <Ionicons name="water" size={14} color={days <= 0 ? colors.danger : colors.water} />
                  <Text style={[styles.waterText, days <= 0 && { color: colors.danger }]}>
                    {days < 0 ? 'Overdue' : days === 0 ? 'Today' : `${days}d`}
                  </Text>
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
  header: { flexDirection: 'row', gap: space(3), marginBottom: space(1) },
  tile: { padding: space(2) },
  name: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: space(2) },
  species: { fontSize: 13, color: colors.muted, marginTop: 2 },
  waterRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: space(2) },
  waterText: { fontSize: 13, color: colors.water, fontWeight: '600' },
});
