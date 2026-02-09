/**
 * QuickAmountChips — Quick amount selector chips
 *
 * Wrap-enabled row of preset amount buttons using CDSChip.
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
import { CDSChip } from "@/components/ui/cds-chip";

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
  return (
    <View style={styles.container}>
      {amounts.map((amount) => {
        const isSelected = selectedAmount === amount;
        const isDisabled = amount > maxAmount;

        return (
          <CDSChip
            key={amount}
            label={`€${amount}`}
            selected={isSelected}
            disabled={isDisabled}
            onPress={() => onSelect(amount)}
          />
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
});
