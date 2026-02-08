/**
 * TradeSuccessScreen — Trade executed success screen
 *
 * Shows success icon, trade details, share button, and done button.
 *
 * Usage:
 *   <TradeSuccessScreen
 *     isBuy={true}
 *     shares={10.5}
 *     amount={100}
 *     ticker="OPAP"
 *     onShare={() => setShowShareModal(true)}
 *     onDone={() => dismiss()}
 *   />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { Title1, Callout, Subhead, MonoLargeTitle } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

interface TradeSuccessScreenProps {
  isBuy: boolean;
  shares: string;
  amount: number;
  ticker: string;
  onShare: () => void;
  onDone: () => void;
}

export function TradeSuccessScreen({
  isBuy,
  shares,
  amount,
  ticker,
  onShare,
  onDone,
}: TradeSuccessScreenProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.successAlpha }]}>
        <IconSymbol name="checkmark" size={48} color={colors.success} />
      </View>
      <Title1 style={{ marginBottom: 8 }}>Trade Executed!</Title1>
      <Callout color="muted" style={{ textAlign: "center", marginBottom: 8 }}>
        You {isBuy ? "bought" : "sold"} {shares} shares of {ticker}
      </Callout>
      <MonoLargeTitle style={{ marginBottom: 32 }}>
        €{amount.toFixed(2)}
      </MonoLargeTitle>

      {/* Share Button — Primary CTA */}
      <AnimatedPressable
        variant="button"
        onPress={onShare}
        style={[
          styles.shareButton,
          { backgroundColor: colors.primary },
        ]}
      >
        <IconSymbol name="square.and.arrow.up" size={18} color={colors.onPrimary} />
        <Callout color="onPrimary" style={{ fontFamily: FontFamily.semibold }}>
          Share with friends
        </Callout>
      </AnimatedPressable>

      {/* Done Button — Secondary */}
      <AnimatedPressable
        variant="icon"
        onPress={onDone}
        style={styles.doneButton}
      >
        <Subhead color="muted" style={{ fontFamily: FontFamily.medium }}>
          Done
        </Subhead>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    marginBottom: 16,
  },
  doneButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
});
