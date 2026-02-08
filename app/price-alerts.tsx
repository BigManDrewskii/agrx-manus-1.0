/**
 * Price Alerts Screen
 *
 * Full management screen for viewing, adding, and managing price alerts.
 * Accessible from Settings and from the Asset Detail screen.
 */
import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Switch,
  Platform,
  FlatList,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useNotifications } from "@/lib/notification-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  LargeTitle,
  Title3,
  Body,
  Subhead,
  Footnote,
  Caption1,
} from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
import type { PriceAlert } from "@/server/priceAlertService";

// ─── Component ──────────────────────────────────────────────────────────────

export default function PriceAlertsScreen() {
  const router = useRouter();
  const colors = useColors();
  const {
    alerts,
    hasPermission,
    isSupported,
    requestPermission,
    removePriceAlert,
    togglePriceAlert,
    preferences,
  } = useNotifications();

  const handleToggle = useCallback(
    async (alertId: string) => {
      await togglePriceAlert(alertId);
    },
    [togglePriceAlert]
  );

  const handleDelete = useCallback(
    (alert: PriceAlert) => {
      if (Platform.OS === "web") {
        // Web: just delete directly
        removePriceAlert(alert.id);
        return;
      }
      Alert.alert(
        "Delete Alert",
        `Remove ${alert.type === "above" ? "above" : alert.type === "below" ? "below" : "% change"} alert for ${alert.stockName}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => removePriceAlert(alert.id),
          },
        ]
      );
    },
    [removePriceAlert]
  );

  const formatAlertType = (alert: PriceAlert): string => {
    switch (alert.type) {
      case "above":
        return `Above €${alert.threshold.toFixed(2)}`;
      case "below":
        return `Below €${alert.threshold.toFixed(2)}`;
      case "percent_change":
        return `±${alert.threshold.toFixed(1)}% change`;
      default:
        return "Unknown";
    }
  };

  const formatAlertIcon = (type: string): string => {
    switch (type) {
      case "above":
        return "📈";
      case "below":
        return "📉";
      case "percent_change":
        return "🔔";
      default:
        return "🔔";
    }
  };

  const renderAlert = ({ item }: { item: PriceAlert }) => (
    <View
      style={[
        styles.alertRow,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.alertLeft}>
        <Body style={{ fontSize: 20 }}>{formatAlertIcon(item.type)}</Body>
        <View style={styles.alertInfo}>
          <Subhead style={{ fontFamily: FontFamily.semibold }}>
            {item.stockName}
          </Subhead>
          <Caption1 color="muted">{formatAlertType(item)}</Caption1>
          {item.lastTriggered && (
            <Caption1 color="muted" style={{ marginTop: 2 }}>
              Last triggered:{" "}
              {new Date(item.lastTriggered).toLocaleDateString()}
            </Caption1>
          )}
        </View>
      </View>
      <View style={styles.alertRight}>
        <Switch
          value={item.enabled}
          onValueChange={() => handleToggle(item.id)}
          trackColor={{
            false: colors.surfaceSecondary,
            true: colors.primary,
          }}
          thumbColor={
            Platform.OS === "android" ? colors.onPrimary : undefined
          }
          ios_backgroundColor={colors.surfaceSecondary}
        />
        <AnimatedPressable
          variant="destructive"
          onPress={() => handleDelete(item)}
          style={[
            styles.deleteButton,
            { backgroundColor: colors.error + "15" },
          ]}
        >
          <Caption1 style={{ color: colors.error, fontFamily: FontFamily.semibold }}>
            Delete
          </Caption1>
        </AnimatedPressable>
      </View>
    </View>
  );

  const activeAlerts = alerts.filter((a) => a.enabled);
  const inactiveAlerts = alerts.filter((a) => !a.enabled);

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <AnimatedPressable
          variant="icon"
          onPress={() => router.back()}
          style={[
            styles.backButton,
            { backgroundColor: colors.surfaceSecondary },
          ]}
        >
          <IconSymbol
            name="chevron.right"
            size={20}
            color={colors.foreground}
            style={{ transform: [{ scaleX: -1 }] }}
          />
        </AnimatedPressable>
        <LargeTitle style={{ letterSpacing: -0.5 }}>Price Alerts</LargeTitle>
      </View>

      {/* ── Permission Banner ── */}
      {!hasPermission && isSupported && (
        <View
          style={[
            styles.permissionBanner,
            { backgroundColor: colors.warning + "15", borderColor: colors.warning + "30" },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Subhead style={{ fontFamily: FontFamily.semibold }}>
              Enable Notifications
            </Subhead>
            <Caption1 color="muted" style={{ marginTop: 4 }}>
              Allow push notifications to receive price alerts when your
              watchlisted stocks hit your targets.
            </Caption1>
          </View>
          <AnimatedPressable
            variant="button"
            onPress={requestPermission}
            style={[
              styles.enableButton,
              { backgroundColor: colors.primary },
            ]}
          >
            <Caption1 style={{ color: "#FFFFFF", fontFamily: FontFamily.semibold }}>
              Enable
            </Caption1>
          </AnimatedPressable>
        </View>
      )}

      {/* ── Alert List ── */}
      {alerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Body style={{ fontSize: 48, textAlign: "center" }}>🔔</Body>
          <Title3 style={{ textAlign: "center", marginTop: 12 }}>
            No Price Alerts
          </Title3>
          <Body
            color="muted"
            style={{ textAlign: "center", marginTop: 8, paddingHorizontal: 32 }}
          >
            Set price alerts on stocks from the Markets or Asset Detail screen.
            You'll be notified when prices hit your targets.
          </Body>
        </View>
      ) : (
        <FlatList
          data={[...activeAlerts, ...inactiveAlerts]}
          renderItem={renderAlert}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            alerts.length > 0 ? (
              <View style={styles.statsRow}>
                <Caption1 color="muted">
                  {activeAlerts.length} active · {inactiveAlerts.length} paused
                </Caption1>
              </View>
            ) : null
          }
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
    </ScreenContainer>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  enableButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  statsRow: {
    paddingBottom: 12,
    paddingHorizontal: 4,
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  alertLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  alertInfo: {
    flex: 1,
  },
  alertRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
