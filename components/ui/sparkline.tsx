import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Polyline, Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { useColors } from "@/hooks/use-colors";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
  strokeWidth?: number;
}

export function Sparkline({
  data,
  width = 60,
  height = 28,
  positive,
  strokeWidth = 1.5,
}: SparklineProps) {
  const colors = useColors();

  if (!data || data.length < 2) return null;

  const isPositive =
    positive !== undefined ? positive : data[data.length - 1] >= data[0];
  const color = isPositive ? colors.success : colors.error;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data
    .map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - min) / range) * chartHeight;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
