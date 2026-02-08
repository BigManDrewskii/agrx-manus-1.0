import React from "react";
import { Text, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface PnLTextProps {
  value: number;
  format?: "percent" | "currency" | "both";
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  showArrow?: boolean;
  showSign?: boolean;
  currencySymbol?: string;
}

const SIZES = {
  sm: { fontSize: 12, lineHeight: 16 },
  md: { fontSize: 14, lineHeight: 20 },
  lg: { fontSize: 18, lineHeight: 24 },
  xl: { fontSize: 24, lineHeight: 32 },
  hero: { fontSize: 36, lineHeight: 44 },
};

export function PnLText({
  value,
  format = "percent",
  size = "md",
  showArrow = true,
  showSign = true,
  currencySymbol = "€",
}: PnLTextProps) {
  const colors = useColors();
  const isPositive = value >= 0;
  const isZero = value === 0;
  const color = isZero ? colors.muted : isPositive ? colors.success : colors.error;
  const arrow = isZero ? "" : isPositive ? "▲" : "▼";
  const sign = isZero ? "" : isPositive ? "+" : "";
  const sizeStyle = SIZES[size];

  let displayValue = "";
  if (format === "percent") {
    displayValue = `${showSign ? sign : ""}${value.toFixed(2)}%`;
  } else if (format === "currency") {
    displayValue = `${showSign ? sign : ""}${currencySymbol}${Math.abs(value).toFixed(2)}`;
  } else {
    displayValue = `${showSign ? sign : ""}${currencySymbol}${Math.abs(value).toFixed(2)} (${showSign ? sign : ""}${value.toFixed(2)}%)`;
  }

  return (
    <View style={styles.container}>
      {showArrow && !isZero && (
        <Text
          style={[
            styles.mono,
            { color, fontSize: sizeStyle.fontSize * 0.7, marginRight: 2 },
          ]}
        >
          {arrow}
        </Text>
      )}
      <Text
        style={[
          styles.mono,
          {
            color,
            fontSize: sizeStyle.fontSize,
            lineHeight: sizeStyle.lineHeight,
          },
        ]}
      >
        {displayValue}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  mono: {
    fontFamily: "JetBrains Mono",
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
});
