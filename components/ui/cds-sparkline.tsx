/**
 * CDSSparkline — Enhanced sparkline following CDS chart design patterns
 *
 * Upgraded sparkline with gradient fill, smooth curves, and CDS color palette.
 * Built on react-native-svg with enhanced visual design.
 *
 * Usage:
 *   <CDSSparkline
 *     data={[10, 12, 11, 14, 13, 16]}
 *     width={60}
 *     height={28}
 *     positive={true}
 *   />
 */
import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, Polyline } from "react-native-svg";
import { useColors } from "@/hooks/use-colors";

interface CDSSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
  strokeWidth?: number;
  /** Whether to show gradient fill below the line */
  showGradient?: boolean;
  /** Whether to use curved lines (bezier) vs straight lines */
  smooth?: boolean;
}

export function CDSSparkline({
  data,
  width = 60,
  height = 28,
  positive,
  strokeWidth = 1.5,
  showGradient = true,
  smooth = true,
}: CDSSparklineProps) {
  const colors = useColors();

  const pathData = useMemo(() => {
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

    // Build points
    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - min) / range) * chartHeight;
      return { x, y };
    });

    if (smooth && points.length > 2) {
      // Create smooth bezier curve
      let path = `M ${points[0].x} ${points[0].y}`;

      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }

      return { path, points, color };
    } else {
      // Straight lines
      const linePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
      return { path: linePoints, points, color, isLine: true };
    }
  }, [data, width, height, positive, colors.success, colors.error, smooth]);

  if (!pathData) return null;

  const { path, points, color, isLine } = pathData;

  // Create gradient fill path
  const fillPath = isLine
    ? null
    : `${path} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </LinearGradient>
        </Defs>

        {/* Gradient fill */}
        {showGradient && fillPath && (
          <Path
            d={fillPath}
            fill={`url(#gradient-${color})`}
            stroke="none"
          />
        )}

        {/* Line */}
        {isLine ? (
          <Polyline
            points={path}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <Path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </Svg>
    </View>
  );
}
