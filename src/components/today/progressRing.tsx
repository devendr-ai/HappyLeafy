import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Ring that animates to `done / total` of today's care tasks. */
export function ProgressRing({ done, total, size = 76 }: { done: number; total: number; size?: number }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = useSharedValue(0);
  const target = total === 0 ? 1 : done / total;

  useEffect(() => {
    progress.value = withTiming(target, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [target, progress]);

  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: c * (1 - progress.value) }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.25)" strokeWidth={stroke} fill="none" />
        <AnimatedCircle cx={size / 2} cy={size / 2} r={r} stroke="#fff" strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} animatedProps={animatedProps} />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={styles.big}>{total === 0 ? '✓' : `${done}/${total}`}</Text>
        <Text style={styles.small}>today</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  big: { color: '#fff', fontSize: 17, fontWeight: '800' },
  small: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
});
