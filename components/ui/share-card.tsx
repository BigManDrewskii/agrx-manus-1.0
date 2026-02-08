/**
 * P&L Share Card — The viral growth engine
 *
 * A beautifully designed 9:16 card optimized for Instagram Stories and TikTok.
 * Captures a user's trade or portfolio gain as a branded, shareable image.
 *
 * Design references: Robinhood confetti share, Coinbase share card, Binance PnL card.
 *
 * Features:
 *   - Gradient background (dark mode always — looks premium on social)
 *   - Stock ticker + company name
 *   - P&L amount and percentage with color coding
 *   - Mini sparkline chart
 *   - Sentiment badge (Bullish/Bearish/Neutral)
 *   - Time frame label (Today / This Week / All Time)
 *   - AGRX branding footer with app logo reference
 */

import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import Svg, {
  Polyline,
  Defs,
  LinearGradient,
  Stop,
  Path,
  Rect,
  Circle,
} from "react-native-svg";
import { FontFamily } from "@/constants/typography";

// ─── Types ──────────────────────────────────────────────────────────────────

export type ShareTimeFrame = "Today" | "This Week" | "This Month" | "All Time";
export type ShareSentiment = "Bullish" | "Bearish" | "Neutral";

export interface ShareCardData {
  /** Stock ticker symbol (e.g., "OPAP") */
  ticker: string;
  /** Full company name */
  companyName: string;
  /** Current stock price */
  price: number;
  /** P&L amount in euros */
  pnlAmount: number;
  /** P&L percentage */
  pnlPercent: number;
  /** Sparkline data points for the mini chart */
  sparkline: number[];
  /** Time frame for the P&L */
  timeFrame: ShareTimeFrame;
  /** AI sentiment label */
  sentiment?: ShareSentiment;
  /** Sentiment confidence score (-1 to 1) */
  sentimentScore?: number;
  /** Number of shares held (optional, for trade cards) */
  shares?: number;
  /** Whether this is a buy or sell trade */
  tradeType?: "buy" | "sell";
  /** Trade amount in euros (for trade confirmation cards) */
  tradeAmount?: number;
}

// ─── Color Palette (always dark mode for social sharing) ────────────────────

const CARD_COLORS = {
  // Background gradient
  bgTop: "#0D0F14",
  bgBottom: "#0A0B0D",
  // Surfaces
  surface: "#1A1C23",
  surfaceLight: "#262830",
  // Text
  white: "#FFFFFF",
  textPrimary: "#EEF0F3",
  textSecondary: "#89909E",
  textTertiary: "#5B616E",
  // Brand
  primary: "#578BFA",
  primaryGlow: "rgba(87,139,250,0.20)",
  // Status
  success: "#27AD74",
  successGlow: "rgba(39,173,116,0.25)",
  successLight: "rgba(39,173,116,0.12)",
  error: "#ED5966",
  errorGlow: "rgba(237,89,102,0.25)",
  errorLight: "rgba(237,89,102,0.12)",
  warning: "#EBBA00",
  warningLight: "rgba(235,186,0,0.12)",
  // Border
  border: "#282A30",
};

// ─── Mini Chart Component ───────────────────────────────────────────────────

function ShareCardChart({
  data,
  width,
  height,
  positive,
}: {
  data: number[];
  width: number;
  height: number;
  positive: boolean;
}) {
  if (!data || data.length < 2) return null;

  const color = positive ? CARD_COLORS.success : CARD_COLORS.error;
  const glowColor = positive ? CARD_COLORS.successGlow : CARD_COLORS.errorGlow;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 4;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartW;
    const y = padding + chartH - ((value - min) / range) * chartH;
    return { x, y };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Area fill path
  const areaPath = `M${points[0].x},${points[0].y} ${points
    .map((p) => `L${p.x},${p.y}`)
    .join(" ")} L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="shareChartGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.20" />
          <Stop offset="0.7" stopColor={color} stopOpacity="0.05" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={areaPath} fill="url(#shareChartGrad)" />
      <Polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Sentiment Badge ────────────────────────────────────────────────────────

function SentimentBadge({ sentiment }: { sentiment: ShareSentiment }) {
  const bgColor =
    sentiment === "Bullish"
      ? CARD_COLORS.successLight
      : sentiment === "Bearish"
      ? CARD_COLORS.errorLight
      : CARD_COLORS.warningLight;
  const textColor =
    sentiment === "Bullish"
      ? CARD_COLORS.success
      : sentiment === "Bearish"
      ? CARD_COLORS.error
      : CARD_COLORS.warning;
  const icon = sentiment === "Bullish" ? "▲" : sentiment === "Bearish" ? "▼" : "●";

  return (
    <View style={[styles.sentimentBadge, { backgroundColor: bgColor }]}>
      <Text style={[styles.sentimentIcon, { color: textColor }]}>{icon}</Text>
      <Text style={[styles.sentimentText, { color: textColor }]}>{sentiment}</Text>
    </View>
  );
}

// ─── Main Share Card ────────────────────────────────────────────────────────

export function ShareCard({ data, ref }: { data: ShareCardData; ref?: React.Ref<View> }) {
    const {
      ticker,
      companyName,
      price,
      pnlAmount,
      pnlPercent,
      sparkline,
      timeFrame,
      sentiment,
      shares,
      tradeType,
      tradeAmount,
    } = data;

    const isPositive = pnlPercent >= 0;
    const pnlColor = isPositive ? CARD_COLORS.success : CARD_COLORS.error;
    const pnlGlow = isPositive ? CARD_COLORS.successGlow : CARD_COLORS.errorGlow;
    const arrow = isPositive ? "▲" : "▼";
    const sign = isPositive ? "+" : "";

    const isTrade = tradeType !== undefined;

    return (
      <View ref={ref} style={styles.card} collapsable={false}>
        {/* Background gradient overlay */}
        <View style={styles.bgGradient}>
          {/* Subtle radial glow behind P&L */}
          <View
            style={[
              styles.pnlGlow,
              { backgroundColor: pnlGlow },
            ]}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Top Row: Time frame + Sentiment */}
          <View style={styles.topRow}>
            <View style={styles.timeFrameBadge}>
              <Text style={styles.timeFrameText}>{timeFrame}</Text>
            </View>
            {sentiment && <SentimentBadge sentiment={sentiment} />}
          </View>

          {/* Trade Type Badge (for trade confirmations) */}
          {isTrade && (
            <View style={styles.tradeTypeBadge}>
              <View
                style={[
                  styles.tradeTypeDot,
                  {
                    backgroundColor:
                      tradeType === "buy" ? CARD_COLORS.success : CARD_COLORS.error,
                  },
                ]}
              />
              <Text style={styles.tradeTypeText}>
                {tradeType === "buy" ? "Bought" : "Sold"}
                {tradeAmount ? ` €${tradeAmount.toFixed(0)}` : ""}
              </Text>
            </View>
          )}

          {/* Stock Ticker + Name */}
          <View style={styles.tickerSection}>
            <View style={styles.tickerIconContainer}>
              <Text style={styles.tickerIconText}>{ticker.slice(0, 2)}</Text>
            </View>
            <View style={styles.tickerInfo}>
              <Text style={styles.tickerText}>{ticker}</Text>
              <Text style={styles.companyText} numberOfLines={1}>
                {companyName}
              </Text>
            </View>
          </View>

          {/* Price */}
          <Text style={styles.priceText}>
            €{price.toFixed(2)}
          </Text>

          {/* P&L Hero */}
          <View style={styles.pnlSection}>
            <Text style={[styles.pnlAmount, { color: pnlColor }]}>
              {sign}€{Math.abs(pnlAmount).toFixed(2)}
            </Text>
            <View style={[styles.pnlPercentBadge, { backgroundColor: isPositive ? CARD_COLORS.successLight : CARD_COLORS.errorLight }]}>
              <Text style={[styles.pnlPercentText, { color: pnlColor }]}>
                {arrow} {sign}{Math.abs(pnlPercent).toFixed(2)}%
              </Text>
            </View>
          </View>

          {/* Shares info */}
          {shares !== undefined && shares > 0 && (
            <Text style={styles.sharesText}>
              {shares.toFixed(4)} shares
            </Text>
          )}

          {/* Chart */}
          <View style={styles.chartContainer}>
            <ShareCardChart
              data={sparkline}
              width={280}
              height={120}
              positive={isPositive}
            />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Footer: AGRX Branding */}
          <View style={styles.footer}>
            <View style={styles.brandRow}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>AGRX</Text>
              </View>
              <View style={styles.brandInfo}>
                <Text style={styles.brandName}>AGRX</Text>
                <Text style={styles.brandTagline}>Greek Stock Trading</Text>
              </View>
            </View>
            <View style={styles.qrPlaceholder}>
              <Text style={styles.downloadText}>Download{"\n"}the app</Text>
            </View>
          </View>
        </View>
      </View>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const CARD_WIDTH = 320;
const CARD_HEIGHT = 568; // ~9:16 ratio

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: CARD_COLORS.bgTop,
    borderRadius: 24,
    overflow: "hidden",
  },
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: CARD_COLORS.bgBottom,
  },
  pnlGlow: {
    position: "absolute",
    top: "25%",
    left: "10%",
    width: "80%",
    height: "30%",
    borderRadius: 100,
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },

  // Top row
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  timeFrameBadge: {
    backgroundColor: CARD_COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  timeFrameText: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: CARD_COLORS.textSecondary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // Sentiment
  sentimentBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  sentimentIcon: {
    fontSize: 9,
    fontFamily: FontFamily.bold,
  },
  sentimentText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // Trade type
  tradeTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  tradeTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tradeTypeText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: CARD_COLORS.textSecondary,
  },

  // Ticker
  tickerSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  tickerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: CARD_COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: CARD_COLORS.border,
  },
  tickerIconText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: CARD_COLORS.primary,
  },
  tickerInfo: {
    flex: 1,
  },
  tickerText: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: CARD_COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  companyText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: CARD_COLORS.textSecondary,
    marginTop: 1,
  },

  // Price
  priceText: {
    fontFamily: FontFamily.monoBold,
    fontSize: 16,
    color: CARD_COLORS.textSecondary,
    marginBottom: 4,
  },

  // P&L
  pnlSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  pnlAmount: {
    fontFamily: FontFamily.monoBold,
    fontSize: 32,
    letterSpacing: -0.5,
  },
  pnlPercentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  pnlPercentText: {
    fontFamily: FontFamily.monoBold,
    fontSize: 14,
  },

  // Shares
  sharesText: {
    fontFamily: FontFamily.mono,
    fontSize: 13,
    color: CARD_COLORS.textTertiary,
    marginBottom: 8,
  },

  // Chart
  chartContainer: {
    alignItems: "center",
    marginVertical: 8,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: CARD_COLORS.border,
    marginVertical: 12,
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: CARD_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: CARD_COLORS.white,
    letterSpacing: 0.5,
  },
  brandInfo: {},
  brandName: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: CARD_COLORS.textPrimary,
    letterSpacing: 1,
  },
  brandTagline: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: CARD_COLORS.textTertiary,
    marginTop: 1,
  },
  qrPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: CARD_COLORS.surface,
    borderWidth: 1,
    borderColor: CARD_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  downloadText: {
    fontFamily: FontFamily.semibold,
    fontSize: 8,
    color: CARD_COLORS.textTertiary,
    textAlign: "center",
    lineHeight: 11,
  },
});
