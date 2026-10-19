import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

/** One leaf (drawn in a 120×120 box, rendered at `size`), pivoting at its base with its own phase. */
function Leaf({ d, color, origin, delay, angle, size }: { d: string; color: string; origin: { x: number; y: number }; delay: number; angle: number; size: number }) {
  const sway = useSharedValue(0);
  useEffect(() => {
    sway.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }), withTiming(-1, { duration: 1800, easing: Easing.inOut(Easing.sin) })), -1, true));
  }, [delay, sway]);
  const k = size / 120;
  const dx = (origin.x - 60) * k;
  const dy = (origin.y - 60) * k;
  const style = useAnimatedStyle(() => ({
    // Rotate around the leaf base: move it to the centre, rotate, move back.
    transform: [{ translateX: dx }, { translateY: dy }, { rotate: `${sway.value * angle}deg` }, { translateX: -dx }, { translateY: -dy }],
  }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Path d={d} fill={color} />
      </Svg>
    </Animated.View>
  );
}

/**
 * Animated potted plant (the app icon's mascot). `happy` makes it hop once (all tasks done);
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
    <Animated.View style={[{ width: size, height: size }, plantStyle]}>
      <Svg width={size} height={size} viewBox="0 0 120 120" style={StyleSheet.absoluteFill}>
        <Rect x={58} y={44} width={4} height={40} rx={2} fill="#2E7D32" />
      </Svg>
      <Leaf size={size} d="M60 70 C 40 66, 20 52, 22 34 C 40 34, 56 50, 60 70 Z" color="#43A047" origin={{ x: 60, y: 70 }} delay={0} angle={6} />
      <Leaf size={size} d="M60 64 C 78 60, 98 46, 98 28 C 80 28, 64 44, 60 64 Z" color="#66BB6A" origin={{ x: 60, y: 64 }} delay={400} angle={7} />
      <Leaf size={size} d="M60 52 C 51 40, 49 22, 60 8 C 71 22, 69 40, 60 52 Z" color="#81C784" origin={{ x: 60, y: 52 }} delay={800} angle={5} />
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={size} height={size} viewBox="0 0 120 120">
          <Ellipse cx={60} cy={114} rx={30} ry={3.5} fill="rgba(0,0,0,0.12)" />
          <Rect x={32} y={78} width={56} height={9} rx={3.5} fill="#C9774A" />
          <Path d="M36 87 L 84 87 L 77.5 112 L 42.5 112 Z" fill="#D98B5F" />
          <Circle cx={52} cy={96} r={2.2} fill="#7A3E1D" />
          <Circle cx={68} cy={96} r={2.2} fill="#7A3E1D" />
          <Path d="M53 101.5 Q 60 107 67 101.5" stroke="#7A3E1D" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        </Svg>
      </View>
    </Animated.View>
  );
}
