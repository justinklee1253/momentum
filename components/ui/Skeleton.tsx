import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewProps } from 'react-native';
import { colors, radius } from '../../lib/theme';

interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number;
}

export function Skeleton({ width = '100%', height = 16, style, ...props }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height },
        { opacity },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.input,
    borderRadius: radius.sm,
  },
});
