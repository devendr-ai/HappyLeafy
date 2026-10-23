import { Ionicons } from '@expo/vector-icons';
import type { Tabs } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AddPlantSheet } from '@/components/addPlantSheet';
import { colors, space } from '@/lib/theme';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];
type IconName = ComponentProps<typeof Ionicons>['name'];

/** The tabs shown in the bar, in order. Identify isn't one: the camera button opens Add a plant instead. */
const TABS: { name: string; label: string; icon: IconName; iconOn: IconName }[] = [
  { name: 'index', label: 'Today', icon: 'sunny-outline', iconOn: 'sunny' },
  { name: 'plants', label: 'Plants', icon: 'leaf-outline', iconOn: 'leaf' },
  { name: 'doctor', label: 'Doctor', icon: 'medkit-outline', iconOn: 'medkit' },
  { name: 'settings', label: 'Settings', icon: 'settings-outline', iconOn: 'settings' },
];

/** Rounded floating tab bar with a separate round camera button, on the page background. */
export function FloatingTabBar({ state, navigation, insets }: TabBarProps) {
  const [adding, setAdding] = useState(false);
  const current = state.routes[state.index]?.name;

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, space(3)) }]}>
      <View style={styles.bar}>
        {TABS.map((tab) => {
          const route = state.routes.find((r) => r.name === tab.name);
          if (!route) return null;
          const focused = current === tab.name;
          const press = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <Pressable
              key={tab.name}
              onPress={press}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.label}
              style={[styles.tab, focused && styles.tabOn]}
            >
              <Ionicons name={focused ? tab.iconOn : tab.icon} size={22} color={focused ? colors.primary : colors.muted} />
              <Text style={[styles.label, focused && styles.labelOn]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable onPress={() => setAdding(true)} accessibilityLabel="Add a plant" style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.95 }] }]}>
        <Ionicons name="camera" size={28} color="#fff" />
      </Pressable>
      <AddPlantSheet visible={adding} onClose={() => setAdding(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: space(3), paddingHorizontal: space(3), paddingTop: space(2), backgroundColor: colors.bg },
  bar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: space(1),
    backgroundColor: colors.tabBar,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  tab: { alignItems: 'center', justifyContent: 'center', paddingVertical: 6, paddingHorizontal: space(3), borderRadius: 24, minWidth: 62 },
  tabOn: { backgroundColor: colors.primarySoft },
  label: { fontSize: 11, fontWeight: '600', color: colors.muted, marginTop: 1 },
  labelOn: { color: colors.primary },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.text,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
});
