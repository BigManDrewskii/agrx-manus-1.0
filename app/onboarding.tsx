import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  StyleSheet,
  type ViewToken,
} from "react-native";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Each slide maps its accent to a semantic token key so colors adapt to light/dark mode.
 * The token key is resolved at render time via useColors().
 */
type AccentToken = "primary" | "success" | "warning";

interface OnboardingSlide {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  accentToken: AccentToken;
  accentAlphaToken: "primaryAlpha" | "successAlpha" | "warningAlpha";
}

const SLIDES: OnboardingSlide[] = [
  {
    id: "1",
    icon: "chart.line.uptrend.xyaxis",
    title: "Invest in Greece",
    subtitle:
      "Access the Athens Stock Exchange from your pocket. Buy fractional shares of top Greek companies starting from just €1.",
    accentToken: "primary",
    accentAlphaToken: "primaryAlpha",
  },
  {
    id: "2",
    icon: "person.2.fill",
    title: "Trade Socially",
    subtitle:
      "Follow top traders, share your wins, and learn from the community. Investing is better together.",
    accentToken: "success",
    accentAlphaToken: "successAlpha",
  },
  {
    id: "3",
    icon: "trophy.fill",
    title: "Earn While You Learn",
    subtitle:
      "Complete daily challenges, unlock achievements, and climb the leaderboard. Start with €100K in demo credits.",
    accentToken: "warning",
    accentAlphaToken: "warningAlpha",
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  const resolveAccent = (slide: OnboardingSlide) => colors[slide.accentToken];
  const resolveAccentAlpha = (slide: OnboardingSlide) => colors[slide.accentAlphaToken];

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    const accent = resolveAccent(item);
    const accentAlpha = resolveAccentAlpha(item);

    return (
      <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
        <View style={styles.slideContent}>
          {/* Icon Container */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: accentAlpha },
            ]}
          >
            <View
              style={[
                styles.iconInner,
                { backgroundColor: accentAlpha },
              ]}
            >
              <IconSymbol
                name={item.icon as any}
                size={48}
                color={accent}
              />
            </View>
          </View>

          {/* Text */}
          <Text style={[styles.slideTitle, { color: colors.foreground }]}>
            {item.title}
          </Text>
          <Text style={[styles.slideSubtitle, { color: colors.muted }]}>
            {item.subtitle}
          </Text>
        </View>
      </View>
    );
  };

  const activeAccent = resolveAccent(SLIDES[activeIndex]);

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <View style={styles.container}>
        {/* Skip Button */}
        <View style={styles.skipContainer}>
          <Pressable
            onPress={handleSkip}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.skipText, { color: colors.muted }]}>
              Skip
            </Text>
          </Pressable>
        </View>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderSlide}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Dots */}
          <View style={styles.dotsContainer}>
            {SLIDES.map((slide, index) => (
              <View
                key={slide.id}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index === activeIndex
                        ? resolveAccent(SLIDES[activeIndex])
                        : colors.surfaceSecondary,
                    width: index === activeIndex ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>

          {/* CTA Button */}
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.ctaButton,
              { backgroundColor: activeAccent },
              pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
            ]}
          >
            <Text style={[styles.ctaText, { color: colors.onPrimary }]}>
              {activeIndex === SLIDES.length - 1
                ? "Get Started"
                : "Continue"}
            </Text>
          </Pressable>

          {/* Terms */}
          <Text style={[styles.terms, { color: colors.muted }]}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipContainer: {
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "600",
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  slideContent: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  iconInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  slideSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    fontWeight: "500",
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  ctaButton: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: "700",
  },
  terms: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
});
