/**
 * BuySellToggle — Buy/Sell toggle switch
 *
 * Two-button toggle for selecting buy or sell mode.
 * Active state shows success color for buy, error color for sell.
 *
 * Usage:
 *   <BuySellToggle
 *     isBuy={true}
 *     onChange={(isBuy) => setIsBuy(isBuy)}
 *   />
 */
import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useColors } from "@/hooks/use-colors";
import { Footnote } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

interface BuySellToggleProps {
  isBuy: boolean;
  onChange: (isBuy: boolean) => void;
}

export function BuySellToggle({ isBuy, onChange }: BuySellToggleProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceSecondary }]}>
      <AnimatedPressable
        variant="toggle"
        onPress={() => onChange(true)}
        style={[
          styles.button,
          isBuy && [styles.active, { backgroundColor: colors.success }],
        ]}
      >
        <Footnote
          color={isBuy ? "onPrimary" : "muted"}
          style={{ fontFamily: FontFamily.semibold }}
        >
          Buy
        </Footnote>
      </AnimatedPressable>
      <AnimatedPressable
        variant="toggle"
        onPress={() => onChange(false)}
        style={[
          styles.button,
          !isBuy && [styles.active, { backgroundColor: colors.error }],
        ]}
      >
        <Footnote
          color={!isBuy ? "onPrimary" : "muted"}
          style={{ fontFamily: FontFamily.semibold }}
        >
          Sell
        </Footnote>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: "center",
  },
  active: {
    // shadow for the active toggle pill
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
      web: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
    }),
  },
});
