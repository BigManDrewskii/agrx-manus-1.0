import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width, height, borderRadius = 8, style }: SkeletonProps) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.surfaceSecondary,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function StockRowSkeleton() {
  return (
    <View style={skeletonStyles.row}>
      <View style={skeletonStyles.left}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={skeletonStyles.textGroup}>
          <Skeleton width={60} height={14} />
          <Skeleton width={100} height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
      <View style={skeletonStyles.right}>
        <Skeleton width={50} height={30} />
        <View style={skeletonStyles.priceGroup}>
          <Skeleton width={55} height={14} />
          <Skeleton width={45} height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
    </View>
  );
}

export function StockListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <StockRowSkeleton key={i} />
      ))}
    </View>
  );
}

export function ChartSkeleton() {
  return (
    <View style={skeletonStyles.chart}>
      <Skeleton width="100%" height={200} borderRadius={12} />
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  textGroup: {
    gap: 2,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceGroup: {
    alignItems: "flex-end",
  },
  chart: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
