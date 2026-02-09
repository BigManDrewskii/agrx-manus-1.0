/**
 * TabSelector — Tab navigation selector
 *
 * Horizontal tab selector with active state indication.
 * Used in Social screen for Feed/Leaderboard/Achievements.
 *
 * Usage:
 *   <TabSelector
 *     tabs={["Feed", "Leaderboard", "Achievements"]}
 *     activeTab="Feed"
 *     onChange={(tab) => setActiveTab(tab)}
 *   />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useColors } from "@/hooks/use-colors";
import { Subhead } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

interface TabSelectorProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
  /** Optional delay for entrance animation (default: 60) */
  animationDelay?: number;
}

export function TabSelector({ tabs, activeTab, onChange, animationDelay = 60 }: TabSelectorProps) {
  const colors = useColors();

  return (
    <Animated.View
      entering={FadeInDown.duration(250).delay(animationDelay)}
      style={[styles.container, { borderBottomColor: colors.border }]}
    >
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <AnimatedPressable
            key={tab}
            variant="toggle"
            onPress={() => onChange(tab)}
            style={[
              styles.tab,
              isActive && {
                borderBottomColor: colors.primary,
                borderBottomWidth: 2,
              },
            ]}
          >
            <Subhead
              color={isActive ? "primary" : "muted"}
              style={{ fontFamily: isActive ? FontFamily.bold : FontFamily.medium }}
            >
              {tab}
            </Subhead>
          </AnimatedPressable>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    marginTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
});
