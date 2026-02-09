/**
 * DividendSection — Pro mode upcoming dividends
 *
 * Shows list of upcoming dividend payments.
 *
 * Usage:
 *   <DividendSection />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import { Subhead, Caption2, MonoSubhead } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

export function DividendSection() {
  const colors = useColors();

  return (
    <Animated.View entering={FadeInDown.duration(250).delay(390)} style={styles.dividendSection}>
      <Caption2
        color="muted"
        style={{
          fontFamily: FontFamily.semibold,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 12,
        }}
      >
        Upcoming Dividends
      </Caption2>
      <View style={[styles.dividendCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.dividendRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
          <View style={styles.dividendLeft}>
            <Subhead style={{ fontFamily: FontFamily.semibold }}>OPAP</Subhead>
            <Caption2 color="muted">Mar 15, 2026</Caption2>
          </View>
          <MonoSubhead color="success" style={{ fontFamily: FontFamily.monoMedium }}>€0.60/share</MonoSubhead>
        </View>
        <View style={styles.dividendRow}>
          <View style={styles.dividendLeft}>
            <Subhead style={{ fontFamily: FontFamily.semibold }}>PPC</Subhead>
            <Caption2 color="muted">Apr 02, 2026</Caption2>
          </View>
          <MonoSubhead color="success" style={{ fontFamily: FontFamily.monoMedium }}>€0.85/share</MonoSubhead>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dividendSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  dividendCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  dividendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dividendLeft: {
    gap: 2,
  },
});
