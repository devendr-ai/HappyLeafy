import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Ellipse, Path, Rect } from 'react-native-svg';

/** One leaf, pivoting at its base, swaying with its own phase. */
function Leaf({ d, color, origin, delay, angle }: { d: string; color: string; origin: { x: number; y: number }; delay: number; angle: number }) {
  const sway = useSharedValue(0);
  useEffect(() => {
    sway.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }), withTiming(-1, { duration: 1800, easing: Easing.inOut(Easing.sin) })), -1, true));
  }, [delay, sway]);
  const style = useAnimatedStyle(() => ({
    // Rotate around the leaf base: move origin to centre, rotate, move back.
    transform: [{ translateX: origin.x - 60 }, { translateY: origin.y - 60 }, { rotate: `${sway.value * angle}deg` }, { translateX: 60 - origin.x }, { translateY: 60 - origin.y }],
  }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <Svg width={120} height={120} viewBox="0 0 120 120">
        <Path d={d} fill={color} />
      </Svg>
    </Animated.View>
  );
}

/**
 * Animated potted plant for the Today header. `happy` makes it hop once (all tasks done);
 * `thirsty` droops it slightly while plants are overdue.
 */
export function PlantHero({ happy, thirsty, size = 120 }: { happy: boolean; thirsty: boolean; size?: number }) {
  const hop = useSharedValue(0);
  const droop = useSharedValue(0);

  useEffect(() => {
    if (happy) hop.value = withSequence(withSpring(-14, { damping: 6 }), withSpring(0, { damping: 8 }));
  }, [happy, hop]);
  useEffect(() => {
    droop.value = withTiming(thirsty ? 1 : 0, { duration: 900 });
  }, [thirsty, droop]);

  const plantStyle = useAnimatedStyle(() => ({ transform: [{ translateY: hop.value }, { rotate: `${droop.value * -4}deg` }] }));

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[{ width: 120, height: 120, transform: [{ scale: size / 120 }], transformOrigin: 'top left' }, plantStyle]}>
        {/* Stem */}
        <Svg width={120} height={120} viewBox="0 0 120 120" style={StyleSheet.absoluteFill}>
          <Rect x={58} y={48} width={4} height={36} rx={2} fill="#2E7D32" />
        </Svg>
        <Leaf d="M60 70 C 40 66, 22 52, 24 36 C 40 36, 56 50, 60 70 Z" color="#43A047" origin={{ x: 60, y: 70 }} delay={0} angle={6} />
        <Leaf d="M60 64 C 78 60, 96 46, 96 30 C 80 30, 64 44, 60 64 Z" color="#66BB6A" origin={{ x: 60, y: 64 }} delay={400} angle={7} />
        <Leaf d="M60 52 C 52 40, 50 24, 60 12 C 70 24, 68 40, 60 52 Z" color="#81C784" origin={{ x: 60, y: 52 }} delay={800} angle={5} />
        {/* Pot */}
        <Svg width={120} height={120} viewBox="0 0 120 120" style={StyleSheet.absoluteFill}>
          <Ellipse cx={60} cy={112} rx={30} ry={4} fill="rgba(0,0,0,0.12)" />
          <Rect x={34} y={78} width={52} height={8} rx={3} fill="#C9774A" />
          <Path d="M38 86 L 82 86 L 76 110 L 44 110 Z" fill="#D98B5F" />
        </Svg>
      </Animated.View>
    </View>
  );
}
