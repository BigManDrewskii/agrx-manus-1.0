/**
 * Notification History Screen
 *
 * Displays a chronological record of all past price alert triggers and
 * system notifications. Items are grouped by date (Today, Yesterday, Earlier).
 * Supports mark-as-read, delete individual items, mark-all-read, and clear-all.
 */
import React, { useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Platform,
  Alert,
} from "react-native";
import ReAnimated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useNotifications, type NotificationHistoryItem, type NotificationHistoryItemType } from "@/lib/notification-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  LargeTitle,
  Title3,
  Body,
  Subhead,
  Footnote,
  Caption1,
  Caption2,
} from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

// ─── Helpers ────────────────────────────────────────────────────────────────

type DateGroup = "Today" | "Yesterday" | "This Week" | "Earlier";

interface GroupedSection {
  title: DateGroup;
  data: NotificationHistoryItem[];
}

function getDateGroup(timestamp: number): DateGroup {
  const now = new Date();
  const date = new Date(timestamp);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 6 * 86400000;

  if (timestamp >= todayStart) return "Today";
  if (timestamp >= yesterdayStart) return "Yesterday";
  if (timestamp >= weekStart) return "This Week";
  return "Earlier";
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  return `${h}:${minutes} ${ampm}`;
}

function formatFullDate(timestamp: number): string {
  const date = new Date(timestamp);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

interface TypeConfig {
  icon: Parameters<typeof IconSymbol>[0]["name"];
  colorKey: "success" | "error" | "accent" | "warning" | "primary" | "muted";
  label: string;
}

function getTypeConfig(type: NotificationHistoryItemType): TypeConfig {
  switch (type) {
    case "price_above":
      return { icon: "arrow.up", colorKey: "success", label: "Price Above" };
    case "price_below":
      return { icon: "arrow.down", colorKey: "error", label: "Price Below" };
    case "percent_change":
      return { icon: "percent", colorKey: "accent", label: "% Change" };
    case "market_news":
      return { icon: "newspaper", colorKey: "primary", label: "Market News" };
    case "daily_challenge":
      return { icon: "trophy.fill", colorKey: "warning", label: "Challenge" };
    case "social":
      return { icon: "person.fill", colorKey: "accent", label: "Social" };
    case "system":
    default:
      return { icon: "bell.fill", colorKey: "muted", label: "System" };
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function NotificationHistoryScreen() {
  const router = useRouter();
  const colors = useColors();
  const {
    history,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeFromHistory,
    clearHistory,
  } = useNotifications();

  // Group notifications by date
  const sections = useMemo<GroupedSection[]>(() => {
    const groups: Record<DateGroup, NotificationHistoryItem[]> = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      Earlier: [],
    };

    for (const item of history) {
      const group = getDateGroup(item.timestamp);
      groups[group].push(item);
    }

    const result: GroupedSection[] = [];
    const order: DateGroup[] = ["Today", "Yesterday", "This Week", "Earlier"];
    for (const key of order) {
      if (groups[key].length > 0) {
        result.push({ title: key, data: groups[key] });
      }
    }
    return result;
  }, [history]);

  // Flatten for FlatList with section headers
  type ListItem =
    | { kind: "header"; title: DateGroup; key: string }
    | { kind: "notification"; item: NotificationHistoryItem; key: string };

  const flatData = useMemo<ListItem[]>(() => {
    const result: ListItem[] = [];
    for (const section of sections) {
      result.push({ kind: "header", title: section.title, key: `header-${section.title}` });
      for (const item of section.data) {
        result.push({ kind: "notification", item, key: item.id });
      }
    }
    return result;
  }, [sections]);

  const handleDelete = useCallback(
    (item: NotificationHistoryItem) => {
      if (Platform.OS === "web") {
        removeFromHistory(item.id);
        return;
      }
      Alert.alert(
        "Delete Notification",
        "Remove this notification from history?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => removeFromHistory(item.id),
          },
        ]
      );
    },
    [removeFromHistory]
  );

  const handleClearAll = useCallback(() => {
    if (history.length === 0) return;
    if (Platform.OS === "web") {
      clearHistory();
      return;
    }
    Alert.alert(
      "Clear All Notifications",
      "This will remove all notification history. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: clearHistory,
        },
      ]
    );
  }, [clearHistory, history.length]);

  const handleItemPress = useCallback(
    (item: NotificationHistoryItem) => {
      // Mark as read on tap
      if (!item.read) {
        markAsRead(item.id);
      }
      // Navigate to stock if applicable
      if (item.stockId) {
        router.push(`/asset/${item.stockId}` as any);
      }
    },
    [markAsRead, router]
  );

  const renderItem = useCallback(
    ({ item: listItem }: { item: ListItem }) => {
      if (listItem.kind === "header") {
        return (
          <View style={styles.sectionHeader}>
            <Footnote
              color="muted"
              style={{ fontFamily: FontFamily.semibold, letterSpacing: 0.5 }}
            >
              {listItem.title.toUpperCase()}
            </Footnote>
          </View>
        );
      }

      const { item } = listItem;
      const config = getTypeConfig(item.type);
      const iconColor = colors[config.colorKey];
      const isUnread = !item.read;

      return (
        <AnimatedPressable
          variant="card"
          onPress={() => handleItemPress(item)}
          style={[
            styles.notifRow,
            {
              backgroundColor: isUnread
                ? colors.primaryAlpha
                : colors.surface,
              borderColor: isUnread ? colors.primary + "20" : colors.border,
            },
          ]}
        >
          {/* Unread dot */}
          {isUnread && (
            <View
              style={[styles.unreadDot, { backgroundColor: colors.primary }]}
            />
          )}

          {/* Icon */}
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: iconColor + "18" },
            ]}
          >
            <IconSymbol name={config.icon} size={18} color={iconColor} />
          </View>

          {/* Content */}
          <View style={styles.notifContent}>
            <View style={styles.notifTitleRow}>
              <Subhead
                style={{
                  fontFamily: isUnread ? FontFamily.semibold : FontFamily.regular,
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {item.title}
              </Subhead>
              <Caption2 color="muted">
                {getDateGroup(item.timestamp) === "Today" || getDateGroup(item.timestamp) === "Yesterday"
                  ? formatTime(item.timestamp)
                  : formatFullDate(item.timestamp)}
              </Caption2>
            </View>
            <Caption1
              color="muted"
              numberOfLines={2}
              style={{ marginTop: 2, lineHeight: 17 }}
            >
              {item.body}
            </Caption1>
            {item.stockTicker && (
              <View style={styles.stockChip}>
                <Caption2
                  color="primary"
                  style={{ fontFamily: FontFamily.semibold }}
                >
                  {item.stockTicker}
                </Caption2>
                {item.actualPrice != null && (
                  <Caption2 color="muted">
                    {" "}
                    · €{item.actualPrice.toFixed(2)}
                  </Caption2>
                )}
              </View>
            )}
          </View>

          {/* Delete button */}
          <AnimatedPressable
            variant="icon"
            onPress={() => handleDelete(item)}
            style={styles.deleteBtn}
          >
            <IconSymbol name="xmark" size={14} color={colors.muted} />
          </AnimatedPressable>
        </AnimatedPressable>
      );
    },
    [colors, handleItemPress, handleDelete]
  );

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* ── Header ── */}
      <ReAnimated.View entering={FadeIn.duration(200)} style={styles.header}>
        <View style={styles.headerLeft}>
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
          <View>
            <LargeTitle style={{ letterSpacing: -0.5 }}>Notifications</LargeTitle>
            {unreadCount > 0 && (
              <Caption1 color="muted" style={{ marginTop: 2 }}>
                {unreadCount} unread
              </Caption1>
            )}
          </View>
        </View>

        {/* Header actions */}
        {history.length > 0 && (
          <ReAnimated.View entering={FadeInDown.duration(250).delay(60)} style={styles.headerActions}>
            {unreadCount > 0 && (
              <AnimatedPressable
                variant="chip"
                onPress={markAllAsRead}
                style={[
                  styles.headerActionBtn,
                  { backgroundColor: colors.primaryAlpha },
                ]}
              >
                <Caption1
                  color="primary"
                  style={{ fontFamily: FontFamily.semibold }}
                >
                  Read All
                </Caption1>
              </AnimatedPressable>
            )}
            <AnimatedPressable
              variant="destructive"
              onPress={handleClearAll}
              style={[
                styles.headerActionBtn,
                { backgroundColor: colors.errorAlpha },
              ]}
            >
              <Caption1
                color="error"
                style={{ fontFamily: FontFamily.semibold }}
              >
                Clear
              </Caption1>
            </AnimatedPressable>
          </ReAnimated.View>
        )}
      </ReAnimated.View>

      {/* ── Empty State ── */}
      {history.length === 0 ? (
        <ReAnimated.View entering={FadeIn.duration(300).delay(120)} style={styles.emptyState}>
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <IconSymbol name="bell.fill" size={40} color={colors.muted} />
          </View>
          <Title3 style={{ textAlign: "center", marginTop: 16 }}>
            No Notifications Yet
          </Title3>
          <Body
            color="muted"
            style={{
              textAlign: "center",
              marginTop: 8,
              paddingHorizontal: 40,
              lineHeight: 22,
            }}
          >
            When your price alerts trigger or you receive updates, they'll appear here.
          </Body>
          <AnimatedPressable
            variant="button"
            onPress={() => router.push("/price-alerts" as any)}
            style={[
              styles.emptyActionBtn,
              { backgroundColor: colors.primary },
            ]}
          >
            <Caption1
              style={{
                color: colors.onPrimary,
                fontFamily: FontFamily.semibold,
              }}
            >
              Set Up Price Alerts
            </Caption1>
          </AnimatedPressable>
        </ReAnimated.View>
      ) : (
        <FlatList
          data={flatData}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
        />
      )}
    </ScreenContainer>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 6,
  },
  headerActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sectionHeader: {
    paddingHorizontal: 4,
    paddingTop: 16,
    paddingBottom: 8,
  },
  notifRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
    position: "relative",
  },
  unreadDot: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  notifContent: {
    flex: 1,
  },
  notifTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  stockChip: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyActionBtn: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
});
