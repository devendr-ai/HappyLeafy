import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { pickPhoto } from '@/lib/photos';
import { handOffPhoto } from '@/lib/photoHandoff';
import { colors, radius, space } from '@/lib/theme';

/** "Add a plant": photo (identified for you), a picture you have, or the name. One question instead of two equal buttons. */
export function AddPlantSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const identify = async (source: 'camera' | 'library') => {
    // Pick here, straight from the tap: browsers block the camera if it opens after navigating.
    const uri = await pickPhoto(source);
    if (!uri) return;
    onClose();
    handOffPhoto(uri);
    router.navigate('/identify');
  };

  const byName = () => {
    onClose();
    router.push('/add');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Add a plant</Text>
        <Text style={styles.body}>Don’t know its name? A photo is the easiest way.</Text>
        <Option icon="camera-outline" title="Take a photo" subtitle="We’ll identify it for you" onPress={() => identify('camera')} />
        <Option icon="image-outline" title="Choose from photos" subtitle="Pick a picture you already have" onPress={() => identify('library')} />
        <Option icon="create-outline" title="Type the name" subtitle="e.g. Monstera, snake plant" onPress={byName} />
      </View>
    </Modal>
  );
}

function Option({ icon, title, subtitle, onPress }: { icon: ComponentProps<typeof Ionicons>['name']; title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.option, pressed && { opacity: 0.7 }]}>
      <View style={styles.optionIcon}>
        <Ionicons name={icon} size={26} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.32)' },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: radius.lg + 8, borderTopRightRadius: radius.lg + 8, padding: space(5), paddingBottom: space(10), gap: space(3) },
  handle: { alignSelf: 'center', width: 42, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: space(1) },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  body: { fontSize: 15, color: colors.muted, marginBottom: space(1) },
  option: { flexDirection: 'row', alignItems: 'center', gap: space(4), backgroundColor: colors.card, borderRadius: radius.lg, padding: space(4) },
  optionIcon: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  optionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  optionSub: { fontSize: 14, color: colors.muted, marginTop: 2 },
});
