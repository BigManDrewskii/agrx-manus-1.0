import React, { useState, useRef } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  type ViewToken,
} from "react-native";
import ReAnimated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  Title1,
  Callout,
  Caption1,
} from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
          <View style={[styles.iconContainer, { backgroundColor: accentAlpha }]}>
            <View style={[styles.iconInner, { backgroundColor: accentAlpha }]}>
              <IconSymbol name={item.icon as any} size={48} color={accent} />
            </View>
          </View>

          {/* Text */}
          <Title1
            style={{
              fontSize: 32,
              fontFamily: FontFamily.bold,
              textAlign: "center",
              letterSpacing: -0.5,
              marginBottom: 16,
            }}
          >
            {item.title}
          </Title1>
          <Callout
            color="muted"
            style={{
              fontFamily: FontFamily.medium,
              lineHeight: 24,
              textAlign: "center",
            }}
          >
            {item.subtitle}
          </Callout>
        </View>
      </View>
    );
  };

  const activeAccent = resolveAccent(SLIDES[activeIndex]);

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <View style={styles.container}>
        {/* Skip Button */}
        <ReAnimated.View entering={FadeIn.duration(200).delay(300)} style={styles.skipContainer}>
          <AnimatedPressable
            variant="icon"
            onPress={handleSkip}
          >
            <Callout color="muted" style={{ fontFamily: FontFamily.semibold }}>
              Skip
            </Callout>
          </AnimatedPressable>
        </ReAnimated.View>

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
        <ReAnimated.View entering={FadeInUp.duration(300).delay(400)} style={styles.bottomSection}>
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
          <AnimatedPressable
            variant="button"
            onPress={handleNext}
            style={[
              styles.ctaButton,
              { backgroundColor: activeAccent },
            ]}
          >
            <Callout color="onPrimary" style={{ fontFamily: FontFamily.bold }}>
              {activeIndex === SLIDES.length - 1 ? "Get Started" : "Continue"}
            </Callout>
          </AnimatedPressable>

          {/* Terms */}
          <Caption1
            color="muted"
            style={{ textAlign: "center", lineHeight: 16 }}
          >
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Caption1>
        </ReAnimated.View>
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
});
