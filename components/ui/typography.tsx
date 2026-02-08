/**
 * AGRX Typography Components
 *
 * Reusable text components that enforce the type scale and font families.
 * Every text element in the app should use one of these instead of raw <Text>.
 *
 * Usage:
 *   <Title1 color="foreground">Screen Title</Title1>
 *   <Body color="muted">Description text</Body>
 *   <MonoHeadline color="success">+€128.45</MonoHeadline>
 *   <Caption1 color="muted">2h ago</Caption1>
 *
 * All components accept:
 *   - `color`: a theme token name (foreground, muted, primary, success, error, etc.)
 *   - `style`: additional RN style overrides
 *   - `className`: NativeWind classes (for layout, spacing — NOT for font/color)
 *   - `ref`: React 19 ref as regular prop (no forwardRef needed)
 *   - `numberOfLines`, `ellipsizeMode`, `selectable`, etc.
 */
import React from "react";
import { Text, type TextProps } from "react-native";
import { TypeScale, type TypeScaleKey } from "@/constants/typography";
import { useColors } from "@/hooks/use-colors";
import type { ThemeColorPalette } from "@/constants/theme";

// ─── Base Component ─────────────────────────────────────────────────────────

type ThemeColorKey = keyof ThemeColorPalette;

interface TypographyProps extends TextProps {
  /** Theme color token. Defaults to "foreground". */
  color?: ThemeColorKey;
  /** Children must be renderable content. */
  children: React.ReactNode;
  /** React 19: ref as regular prop */
  ref?: React.Ref<Text>;
}

function createTypographyComponent(variant: TypeScaleKey, defaultColor: ThemeColorKey = "foreground") {
  const scale = TypeScale[variant];

  function TypographyComponent({ color, style, children, ref, ...rest }: TypographyProps) {
    const colors = useColors();
    const resolvedColor = colors[color ?? defaultColor];

    return (
      <Text
        ref={ref}
        style={[
          {
            fontSize: scale.fontSize,
            lineHeight: scale.lineHeight,
            letterSpacing: scale.letterSpacing,
            fontFamily: scale.fontFamily,
            color: resolvedColor,
          },
          style,
        ]}
        {...rest}
      >
        {children}
      </Text>
    );
  }

  TypographyComponent.displayName = variant.charAt(0).toUpperCase() + variant.slice(1);
  return TypographyComponent;
}

// ─── Text Components ────────────────────────────────────────────────────────

/** 34pt bold — Portfolio value, hero numbers */
export const LargeTitle = createTypographyComponent("largeTitle");

/** 28pt bold — Screen titles */
export const Title1 = createTypographyComponent("title1");

/** 22pt bold — Section headers */
export const Title2 = createTypographyComponent("title2");

/** 20pt semibold — Card titles */
export const Title3 = createTypographyComponent("title3");

/** 17pt semibold — Emphasized body text */
export const Headline = createTypographyComponent("headline");

/** 17pt regular — Default body text */
export const Body = createTypographyComponent("body");

/** 16pt regular — Secondary body text */
export const Callout = createTypographyComponent("callout");

/** 15pt regular — List subtitles */
export const Subhead = createTypographyComponent("subhead");

/** 13pt regular — Timestamps, metadata */
export const Footnote = createTypographyComponent("footnote", "muted");

/** 12pt regular — Labels, badges */
export const Caption1 = createTypographyComponent("caption1", "muted");

/** 11pt regular — Smallest readable text */
export const Caption2 = createTypographyComponent("caption2", "muted");

// ─── Monospace Components (prices, percentages, numeric data) ───────────────

/** 34pt mono bold — Large price display */
export const MonoLargeTitle = createTypographyComponent("monoLargeTitle");

/** 17pt mono medium — Standard price in lists */
export const MonoHeadline = createTypographyComponent("monoHeadline");

/** 17pt mono regular — Price in cards */
export const MonoBody = createTypographyComponent("monoBody");

/** 15pt mono regular — Smaller numeric data */
export const MonoSubhead = createTypographyComponent("monoSubhead");

/** 12pt mono regular — Change %, volume */
export const MonoCaption1 = createTypographyComponent("monoCaption1", "muted");

/** 11pt mono regular — Smallest numeric text */
export const MonoCaption2 = createTypographyComponent("monoCaption2", "muted");
