/**
 * SearchBarWithClear — Search input with clear button
 *
 * Text input for searching stocks with a clear button that appears when there's text.
 *
 * Usage:
 *   <SearchBarWithClear
 *     value={searchQuery}
 *     onChange={setSearchQuery}
 *     placeholder="Search stocks..."
 *   />
 */
import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { FontFamily } from "@/constants/typography";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Animation delay in ms (default: 60) */
  animationDelay?: number;
}

export function SearchBarWithClear({
  value,
  onChange,
  placeholder = "Search 135 ATHEX stocks...",
  animationDelay = 60,
}: SearchBarProps) {
  const colors = useColors();

  return (
    <Animated.View
      entering={FadeInDown.duration(250).delay(animationDelay)}
      style={styles.container}
    >
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
        <TextInput
          style={[
            styles.searchInput,
            { color: colors.foreground, fontFamily: FontFamily.medium },
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          value={value}
          onChangeText={onChange}
          returnKeyType="done"
          accessibilityLabel="Search stocks"
        />
        {value.length > 0 && (
          <AnimatedPressable
            variant="icon"
            onPress={() => onChange("")}
          >
            <IconSymbol name="xmark.circle.fill" size={18} color={colors.muted} />
          </AnimatedPressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
});
