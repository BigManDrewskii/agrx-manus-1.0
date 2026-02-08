/**
 * QuickAmountChips — Quick amount selector chips
 *
 * Wrap-enabled row of preset amount buttons.
 * Disabled chips shown when amount exceeds max available.
 *
 * Usage:
 *   <QuickAmountChips
 *     amounts={[5, 10, 25, 50, 100, 250]}
 *     selectedAmount={10}
 *     maxAmount={100}
 *     isBuy={true}
 *     onSelect={(amount) => setAmountText(amount.toString())}
 *   />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useColors } from "@/hooks/use-colors";
import { MonoBody } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

interface QuickAmountChipsProps {
  amounts: number[];
  selectedAmount: number;
  maxAmount: number;
  isBuy: boolean;
  onSelect: (amount: number) => void;
}

export function QuickAmountChips({
  amounts,
  selectedAmount,
  maxAmount,
  isBuy,
  onSelect,
}: QuickAmountChipsProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      {amounts.map((amount) => {
        const isSelected = selectedAmount === amount;
        const isDisabled = amount > maxAmount;
        return (
          <AnimatedPressable
            key={amount}
            variant="chip"
            disabled={isDisabled}
            onPress={() => onSelect(amount)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected
                  ? (isBuy ? colors.success : colors.error)
                  : colors.surface,
                borderColor: isSelected
                  ? (isBuy ? colors.success : colors.error)
                  : colors.border,
                opacity: isDisabled ? 0.5 : 1,
              },
            ]}
          >
            <MonoBody
              color={isSelected ? "onPrimary" : "foreground"}
              style={{
                fontSize: 13,
                fontFamily: isSelected ? FontFamily.monoBold : FontFamily.monoMedium,
              }}
            >
              €{amount}
            </MonoBody>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 56,
    alignItems: "center",
  },
});
