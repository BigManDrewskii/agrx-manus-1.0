import React, { useEffect } from "react";
import { TextStyle, StyleProp } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
} from "react-native-reanimated";
import { TextInput } from "react-native";
import { SPRING_RESPONSIVE } from "@/lib/animations";
import { FontFamily } from "@/constants/typography";

// AnimatedTextInput so we can drive the text prop via animated props
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AnimatedNumberProps {
  /** The numeric value to animate to */
  value: number;
  /** Format function: receives the current interpolated number, returns display string */
  formatValue?: (n: number) => string;
  /** Number of decimal places (used by default formatter) */
  decimals?: number;
  /** Prefix string (e.g. "€", "+€") */
  prefix?: string;
  /** Suffix string (e.g. "%", " XP") */
  suffix?: string;
  /** Text style */
  style?: StyleProp<TextStyle>;
  /** Spring config override */
  springConfig?: typeof SPRING_RESPONSIVE;
}

/**
 * AnimatedNumber — smoothly interpolates between numeric values using spring physics.
 *
 * Uses Reanimated's useAnimatedProps to drive a TextInput's text value on the UI thread,
 * avoiding re-renders. The number rolls from old → new with a spring curve.
 *
 * Usage:
 * ```tsx
 * <AnimatedNumber value={portfolioTotal} prefix="€" decimals={2} style={styles.hero} />
 * <AnimatedNumber value={pnlPercent} prefix="+" suffix="%" decimals={2} style={styles.pnl} />
 * ```
 */
export function AnimatedNumber({
  value,
  formatValue,
  decimals = 2,
  prefix = "",
  suffix = "",
  style,
  springConfig = SPRING_RESPONSIVE,
}: AnimatedNumberProps) {
  const animatedValue = useSharedValue(value);

  useEffect(() => {
    animatedValue.value = withSpring(value, springConfig);
  }, [value, springConfig]);

  const animatedProps = useAnimatedProps(() => {
    const current = animatedValue.value;
    let text: string;
    if (formatValue) {
      // Custom formatter runs on JS thread via runOnJS if needed,
      // but for simple string ops it works on UI thread too
      text = formatValue(current);
    } else {
      // Default: format with locale-style thousands separator and fixed decimals
      const abs = Math.abs(current);
      const formatted = abs.toLocaleString("el-GR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      text = `${prefix}${formatted}${suffix}`;
    }
    return {
      text,
      defaultValue: text,
    } as any;
  });

  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      animatedProps={animatedProps}
      style={[
        {
          fontFamily: FontFamily.monoMedium,
          fontVariant: ["tabular-nums"],
          padding: 0,
          margin: 0,
        },
        style,
      ]}
    />
  );
}

/**
 * AnimatedPnLNumber — animated P&L value with color and sign.
 *
 * Wraps AnimatedNumber with P&L-specific formatting:
 * - Green for positive, red for negative
 * - Arrow indicator (▲/▼)
 * - Sign prefix (+/-)
 */
interface AnimatedPnLNumberProps {
  value: number;
  format?: "percent" | "currency";
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  showArrow?: boolean;
  showSign?: boolean;
  currencySymbol?: string;
  successColor: string;
  errorColor: string;
  mutedColor: string;
  springConfig?: typeof SPRING_RESPONSIVE;
}

const PNL_SIZES = {
  sm: { fontSize: 12, lineHeight: 16 },
  md: { fontSize: 14, lineHeight: 20 },
  lg: { fontSize: 18, lineHeight: 24 },
  xl: { fontSize: 24, lineHeight: 32 },
  hero: { fontSize: 36, lineHeight: 44 },
};

export function AnimatedPnLNumber({
  value,
  format = "percent",
  size = "md",
  showArrow = true,
  showSign = true,
  currencySymbol = "€",
  successColor,
  errorColor,
  mutedColor,
  springConfig = SPRING_RESPONSIVE,
}: AnimatedPnLNumberProps) {
  const isPositive = value >= 0;
  const isZero = value === 0;
  const color = isZero ? mutedColor : isPositive ? successColor : errorColor;
  const sizeStyle = PNL_SIZES[size];

  const formatPnL = (n: number): string => {
    "worklet";
    const pos = n >= 0;
    const zero = Math.abs(n) < 0.005;
    const arrow = zero ? "" : pos ? "▲" : "▼";
    const sign = zero ? "" : pos ? "+" : "";
    const abs = Math.abs(n);

    let formatted: string;
    // Simple formatting on UI thread (toLocaleString not available in worklets)
    const fixedStr = abs.toFixed(2);

    if (format === "percent") {
      formatted = `${showArrow ? arrow : ""}${showSign ? sign : ""}${fixedStr}%`;
    } else {
      formatted = `${showArrow ? arrow : ""}${showSign ? sign : ""}${currencySymbol}${fixedStr}`;
    }
    return formatted;
  };

  return (
    <AnimatedNumber
      value={value}
      formatValue={formatPnL}
      style={{
        color,
        fontSize: sizeStyle.fontSize,
        lineHeight: sizeStyle.lineHeight,
      }}
      springConfig={springConfig}
    />
  );
}
