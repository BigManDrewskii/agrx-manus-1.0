import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";
import { Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { PnLText } from "@/components/ui/pnl-text";
import { Sparkline } from "@/components/ui/sparkline";
import {
  PORTFOLIO_HOLDINGS,
  PORTFOLIO_TOTAL_VALUE,
  PORTFOLIO_TOTAL_PNL,
  PORTFOLIO_PNL_PERCENT,
  PORTFOLIO_SPARKLINE,
  type Holding,
} from "@/lib/mock-data";

const TABS = ["All", "Stocks", "Options", "Copied"];

function HoldingRow({ holding }: { holding: Holding }) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.holdingRow,
        { borderBottomColor: colors.border },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={styles.holdingLeft}>
        <View
          style={[
            styles.holdingIcon,
            { backgroundColor: colors.surfaceSecondary },
          ]}
        >
          <Text style={[styles.holdingIconText, { color: colors.primary }]}>
            {holding.asset.ticker.slice(0, 2)}
          </Text>
        </View>
        <View>
          <Text style={[styles.holdingName, { color: colors.foreground }]}>
            {holding.asset.ticker}
          </Text>
          <Text style={[styles.holdingShares, { color: colors.muted }]}>
            {holding.shares} shares
          </Text>
        </View>
      </View>
      <View style={styles.holdingCenter}>
        <Sparkline
          data={holding.asset.sparkline}
          width={48}
          height={20}
          positive={holding.pnl >= 0}
        />
      </View>
      <View style={styles.holdingRight}>
        <Text style={[styles.holdingValue, { color: colors.foreground }]}>
          €{holding.currentValue.toFixed(2)}
        </Text>
        <PnLText value={holding.pnlPercent} size="sm" showArrow={false} />
      </View>
    </Pressable>
  );
}

export default function PortfolioScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState("All");
  const isPositive = PORTFOLIO_TOTAL_PNL >= 0;
  const glowColor = isPositive ? colors.success : colors.error;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Portfolio
          </Text>
        </View>

        {/* Portfolio Value Hero */}
        <View style={styles.heroContainer}>
          <Text style={[styles.heroLabel, { color: colors.muted }]}>
            Total Value
          </Text>
          <Text
            style={[
              styles.heroValue,
              {
                color: colors.foreground,
                textShadowColor: glowColor + "40",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 24,
              },
            ]}
          >
            €{PORTFOLIO_TOTAL_VALUE.toLocaleString("el-GR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <View style={styles.heroPnl}>
            <PnLText
              value={PORTFOLIO_TOTAL_PNL}
              format="currency"
              size="lg"
              showArrow={true}
            />
            <Text style={[styles.heroPnlSep, { color: colors.muted }]}>
              {" · "}
            </Text>
            <PnLText
              value={PORTFOLIO_PNL_PERCENT}
              format="percent"
              size="lg"
              showArrow={false}
            />
          </View>
          <View style={styles.sparklineContainer}>
            <Sparkline
              data={PORTFOLIO_SPARKLINE}
              width={320}
              height={56}
              positive={isPositive}
              strokeWidth={2}
            />
          </View>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          {TABS.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={({ pressed }) => [
                  styles.tab,
                  isActive && {
                    borderBottomColor: colors.primary,
                    borderBottomWidth: 2,
                  },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: isActive ? colors.primary : colors.muted,
                      fontWeight: isActive ? "700" : "500",
                    },
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Holdings List */}
        <View style={styles.holdingsContainer}>
          <View style={styles.holdingsHeader}>
            <Text style={[styles.holdingsTitle, { color: colors.muted }]}>
              {PORTFOLIO_HOLDINGS.length} Holdings
            </Text>
          </View>
          {PORTFOLIO_HOLDINGS.map((holding) => (
            <HoldingRow key={holding.asset.id} holding={holding} />
          ))}
        </View>

        {/* Dividend Section */}
        <View style={styles.dividendSection}>
          <Text style={[styles.dividendTitle, { color: colors.foreground }]}>
            Upcoming Dividends
          </Text>
          <View
            style={[
              styles.dividendCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.dividendRow}>
              <Text style={[styles.dividendAsset, { color: colors.foreground }]}>
                OPAP
              </Text>
              <Text style={[styles.dividendDate, { color: colors.muted }]}>
                Mar 15, 2026
              </Text>
              <Text style={[styles.dividendAmount, { color: colors.success }]}>
                €0.60/share
              </Text>
            </View>
            <View style={styles.dividendRow}>
              <Text style={[styles.dividendAsset, { color: colors.foreground }]}>
                MOH
              </Text>
              <Text style={[styles.dividendDate, { color: colors.muted }]}>
                Apr 02, 2026
              </Text>
              <Text style={[styles.dividendAmount, { color: colors.success }]}>
                €0.85/share
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  heroContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  heroValue: {
    fontSize: 40,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    letterSpacing: -1,
  },
  heroPnl: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  heroPnlSep: {
    fontSize: 14,
  },
  sparklineContainer: {
    marginTop: 16,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "transparent",
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: 14,
  },
  holdingsContainer: {
    paddingTop: 8,
  },
  holdingsHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  holdingsTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  holdingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  holdingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  holdingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  holdingIconText: {
    fontSize: 14,
    fontWeight: "700",
  },
  holdingName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  holdingShares: {
    fontSize: 12,
    fontWeight: "500",
  },
  holdingCenter: {
    marginHorizontal: 12,
  },
  holdingRight: {
    alignItems: "flex-end",
  },
  holdingValue: {
    fontSize: 15,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
    marginBottom: 2,
  },
  dividendSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  dividendTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  dividendCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  dividendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  dividendAsset: {
    fontSize: 15,
    fontWeight: "600",
    width: 60,
  },
  dividendDate: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
    textAlign: "center",
  },
  dividendAmount: {
    fontSize: 14,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
});
