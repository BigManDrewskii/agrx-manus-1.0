/**
 * HoldingCardPro — Pro mode holding card
 *
 * Two-row card with icon, ticker, name, value, P&L, shares, avg cost, sparkline, and share button.
 *
 * Usage:
 *   <HoldingCardPro
 *     ticker="OPAP"
 *     name="OPAP S.A."
 *     shares={10}
 *     avgCost={25}
 *     liveValue={250}
 *     livePnlPercent={5}
 *     liveSparkline={[1, 2, 3, 4, 5]}
 *     livePnl={10}
 *     onPress={() => router.push(`/asset/${id}`)}
 *     onShare={() => handleShare()}
 *     isLast={false}
 *     index={0}
 *   />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { AnimatedNumber, AnimatedPnLNumber } from "@/components/ui/animated-number";
import { Sparkline } from "@/components/ui/sparkline";
import { Subhead, Caption1 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

interface HoldingCardProProps {
  ticker: string;
  name: string;
  shares: number;
  avgCost: number;
  liveValue: number;
  livePnlPercent: number;
  liveSparkline: number[];
  livePnl: number;
  onPress: () => void;
  onShare: () => void;
  isLast: boolean;
  index: number;
}

export function HoldingCardPro({
  ticker,
  name,
  shares,
  avgCost,
  liveValue,
  livePnlPercent,
  liveSparkline,
  livePnl,
  onPress,
  onShare,
  isLast,
  index,
}: HoldingCardProProps) {
  const colors = useColors();
  const router = useRouter();

  return (
    <Animated.View
      entering={FadeInDown.duration(250).delay(210 + Math.min(index, 10) * 40)}
    >
      <AnimatedPressable
        variant="card"
        onPress={onPress}
        style={[
          styles.holdingPressable,
          !isLast && {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
          },
        ]}
      >
        {/* Top row: icon + ticker + value */}
        <View style={styles.holdingTopRow}>
          <View style={[styles.holdingIcon, { backgroundColor: colors.primaryAlpha }]}>
            <Caption1 color="primary" style={{ fontFamily: FontFamily.bold }}>
              {ticker.slice(0, 2)}
            </Caption1>
          </View>
          <View style={styles.holdingNameCol}>
            <Subhead style={{ fontFamily: FontFamily.semibold }} numberOfLines={1}>
              {ticker}
            </Subhead>
            <Caption1 color="muted" numberOfLines={1} style={{ fontFamily: FontFamily.medium }}>
              {name}
            </Caption1>
          </View>
          <View style={styles.holdingValueCol}>
            <AnimatedNumber
              value={liveValue}
              prefix="€"
              decimals={2}
              style={{
                fontSize: 15,
                lineHeight: 20,
                fontFamily: FontFamily.monoMedium,
                color: colors.foreground,
              }}
            />
            <AnimatedPnLNumber value={livePnlPercent} format="percent" size="sm" showArrow={true} successColor={colors.success} errorColor={colors.error} mutedColor={colors.muted} />
          </View>
        </View>
        {/* Bottom row: shares info + sparkline + share btn */}
        <View style={styles.holdingBottomRow}>
          <Caption1 color="muted" style={{ fontFamily: FontFamily.medium }}>
            {shares.toFixed(shares % 1 === 0 ? 0 : 2)} shares · avg €{avgCost.toFixed(2)}
          </Caption1>
          <View style={styles.holdingBottomRight}>
            <Sparkline
              data={liveSparkline}
              width={48}
              height={18}
              positive={livePnl >= 0}
            />
            <AnimatedPressable
              variant="icon"
              onPress={onShare}
              style={[styles.holdingShareButton, { backgroundColor: colors.surfaceSecondary }]}
              accessibilityLabel={`Share ${ticker} holding`}
              accessibilityHint="Share this holding"
              hitSlop={7}
            >
              <IconSymbol name="square.and.arrow.up" size={13} color={colors.muted} />
            </AnimatedPressable>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  holdingPressable: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  holdingTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  holdingNameCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  holdingValueCol: {
    alignItems: "flex-end",
  },
  holdingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  holdingBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingLeft: 52,
  },
  holdingBottomRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  holdingShareButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});
