/**
 * DailyChallengeCard — Pro mode daily challenge card
 *
 * Shows challenge title, description, reward badge, and progress bar.
 *
 * Usage:
 *   <DailyChallengeCard />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { Headline, Footnote, Caption1, MonoCaption1 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
import { DAILY_CHALLENGE } from "@/lib/mock-data";

export function DailyChallengeCard() {
  const colors = useColors();

  return (
    <Animated.View entering={FadeInDown.duration(250).delay(150)} style={styles.section}>
      <AnimatedPressable
        variant="card"
        style={[
          styles.challengeCard,
          {
            backgroundColor: colors.warningAlpha,
            borderColor: colors.warningAlpha,
          },
        ]}
      >
        <View style={styles.challengeHeader}>
          <View style={styles.challengeLeft}>
            <IconSymbol name="trophy.fill" size={18} color={colors.warning} />
            <Headline style={{ fontSize: 15 }}>{DAILY_CHALLENGE.title}</Headline>
          </View>
          <View style={[styles.rewardBadge, { backgroundColor: colors.warningAlpha }]}>
            <Caption1 color="warning" style={{ fontFamily: FontFamily.bold }}>
              {DAILY_CHALLENGE.reward}
            </Caption1>
          </View>
        </View>
        <Footnote color="muted">{DAILY_CHALLENGE.description}</Footnote>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.warningAlpha }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.warning,
                  width: `${(DAILY_CHALLENGE.progress / DAILY_CHALLENGE.total) * 100}%`,
                },
              ]}
            />
          </View>
          <MonoCaption1 color="muted">
            {DAILY_CHALLENGE.progress}/{DAILY_CHALLENGE.total}
          </MonoCaption1>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
  },
  challengeCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  challengeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rewardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  progressBar: {
    flex: 1,
    height: 5,
    borderRadius: 2.5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2.5,
  },
});
