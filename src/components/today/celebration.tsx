import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

const PIECES = ['🍃', '🌿', '💧', '🌱', '🍃', '✨', '🌿', '💧'];

/** A single emoji that floats up, drifts sideways and fades. */
function Piece({ emoji, index, run }: { emoji: string; index: number; run: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (!run) return;
    t.value = 0;
    t.value = withDelay(index * 70, withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) }));
  }, [run, index, t]);
  const drift = (index % 2 ? 1 : -1) * (20 + (index * 13) % 40);
  const style = useAnimatedStyle(() => ({
    opacity: t.value === 0 ? 0 : 1 - t.value,
    transform: [{ translateY: -110 * t.value }, { translateX: drift * t.value }, { rotate: `${drift * 2 * t.value}deg` }, { scale: 0.6 + t.value * 0.6 }],
  }));
  return <Animated.Text style={[styles.piece, { left: `${8 + index * 11}%` }, style]}>{emoji}</Animated.Text>;
}

/** Burst of leaves and droplets. Bump `run` to replay. */
export function Celebration({ run }: { run: number }) {
  return (
    <View pointerEvents="none" style={styles.layer}>
      {PIECES.map((e, i) => (
        <Piece key={i} emoji={e} index={i} run={run} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'visible' },
  piece: { position: 'absolute', bottom: 10, fontSize: 22 },
});
