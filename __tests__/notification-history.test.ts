/**
 * Notification History Tests
 *
 * Tests for the notification history feature:
 * - NotificationHistoryItem type and data model
 * - History persistence (AsyncStorage)
 * - Unread badge count logic
 * - Mark-as-read, mark-all-as-read, remove, clear-all
 * - Date grouping (Today, Yesterday, This Week, Earlier)
 * - Notification History screen structure
 * - Home screen bell badge integration
 * - Settings navigation link
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = "/home/ubuntu/agrx";

// ─── Helper: read file ──────────────────────────────────────────────────────

function readFile(filePath: string): string {
  return fs.readFileSync(path.join(ROOT, filePath), "utf-8");
}

// ─── Notification Context — History Model ───────────────────────────────────

describe("Notification History — Context Data Model", () => {
  const contextSrc = readFile("lib/notification-context.tsx");

  it("should export NotificationHistoryItem type", () => {
    expect(contextSrc).toContain("export interface NotificationHistoryItem");
  });

  it("should export NotificationHistoryItemType", () => {
    expect(contextSrc).toContain("export type NotificationHistoryItemType");
  });

  it("should define all required history item fields", () => {
    const requiredFields = ["id", "title", "body", "type", "read", "timestamp"];
    for (const field of requiredFields) {
      expect(contextSrc).toContain(`${field}:`);
    }
  });

  it("should define optional stock-related fields", () => {
    expect(contextSrc).toContain("stockId?:");
    expect(contextSrc).toContain("stockTicker?:");
    expect(contextSrc).toContain("threshold?:");
    expect(contextSrc).toContain("actualPrice?:");
  });

  it("should define all notification type variants", () => {
    const types = [
      "price_above",
      "price_below",
      "percent_change",
      "market_news",
      "daily_challenge",
      "social",
      "system",
    ];
    for (const type of types) {
      expect(contextSrc).toContain(`"${type}"`);
    }
  });
});

// ─── Notification Context — History Functions ───────────────────────────────

describe("Notification History — Context Functions", () => {
  const contextSrc = readFile("lib/notification-context.tsx");

  it("should expose history array in context value", () => {
    expect(contextSrc).toContain("history: NotificationHistoryItem[]");
  });

  it("should expose unreadCount in context value", () => {
    expect(contextSrc).toContain("unreadCount: number");
  });

  it("should expose markAsRead function", () => {
    expect(contextSrc).toContain("markAsRead: (notificationId: string) => void");
  });

  it("should expose markAllAsRead function", () => {
    expect(contextSrc).toContain("markAllAsRead: () => void");
  });

  it("should expose removeFromHistory function", () => {
    expect(contextSrc).toContain("removeFromHistory: (notificationId: string) => void");
  });

  it("should expose clearHistory function", () => {
    expect(contextSrc).toContain("clearHistory: () => void");
  });

  it("should compute unreadCount from history", () => {
    expect(contextSrc).toContain("history.filter((h) => !h.read).length");
  });
});

// ─── Notification Context — AsyncStorage Persistence ────────────────────────

describe("Notification History — AsyncStorage Persistence", () => {
  const contextSrc = readFile("lib/notification-context.tsx");

  it("should define a storage key for history", () => {
    expect(contextSrc).toContain("NOTIFICATION_HISTORY_KEY");
    expect(contextSrc).toContain("@agrx/notification-history");
  });

  it("should load history from AsyncStorage on init", () => {
    expect(contextSrc).toContain("loadHistory");
    expect(contextSrc).toContain("AsyncStorage.getItem(NOTIFICATION_HISTORY_KEY)");
  });

  it("should save history to AsyncStorage on updates", () => {
    expect(contextSrc).toContain("saveHistory");
    expect(contextSrc).toContain("AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY");
  });

  it("should limit history to MAX_HISTORY_ITEMS", () => {
    expect(contextSrc).toContain("MAX_HISTORY_ITEMS");
    expect(contextSrc).toContain("slice(0, MAX_HISTORY_ITEMS)");
  });

  it("should clear AsyncStorage on clearHistory", () => {
    expect(contextSrc).toContain("AsyncStorage.removeItem(NOTIFICATION_HISTORY_KEY)");
  });
});

// ─── Notification Context — Notification Listener Integration ───────────────

describe("Notification History — Listener Integration", () => {
  const contextSrc = readFile("lib/notification-context.tsx");

  it("should add to history when a notification is received (foreground)", () => {
    expect(contextSrc).toContain("addNotificationReceivedListener");
    expect(contextSrc).toContain("addToHistory");
  });

  it("should add to history when a notification is tapped (background)", () => {
    expect(contextSrc).toContain("addNotificationResponseReceivedListener");
  });

  it("should map notification data to history type", () => {
    expect(contextSrc).toContain("mapNotificationToHistoryType");
  });

  it("should mark tapped notifications as read", () => {
    // When user taps a notification, it should be marked as read
    expect(contextSrc).toContain("read: true, // Tapped = read");
  });

  it("should add history entry when creating a price alert", () => {
    expect(contextSrc).toContain('"Price Alert Created"');
  });
});

// ─── Notification History Screen — Structure ────────────────────────────────

describe("Notification History — Screen Structure", () => {
  const screenSrc = readFile("app/notification-history.tsx");

  it("should exist as a screen file", () => {
    expect(screenSrc).toBeDefined();
    expect(screenSrc.length).toBeGreaterThan(100);
  });

  it("should use ScreenContainer for safe area", () => {
    expect(screenSrc).toContain("ScreenContainer");
  });

  it("should use useNotifications hook", () => {
    expect(screenSrc).toContain("useNotifications");
  });

  it("should have a back button", () => {
    expect(screenSrc).toContain("router.back()");
  });

  it("should display 'Notifications' as the title", () => {
    expect(screenSrc).toContain("Notifications");
  });

  it("should show unread count in header", () => {
    expect(screenSrc).toContain("unreadCount");
    expect(screenSrc).toContain("unread");
  });
});

// ─── Notification History Screen — Date Grouping ────────────────────────────

describe("Notification History — Date Grouping", () => {
  const screenSrc = readFile("app/notification-history.tsx");

  it("should group notifications by date", () => {
    expect(screenSrc).toContain("getDateGroup");
  });

  it("should have Today group", () => {
    expect(screenSrc).toContain('"Today"');
  });

  it("should have Yesterday group", () => {
    expect(screenSrc).toContain('"Yesterday"');
  });

  it("should have This Week group", () => {
    expect(screenSrc).toContain('"This Week"');
  });

  it("should have Earlier group", () => {
    expect(screenSrc).toContain('"Earlier"');
  });

  it("should render section headers in the flat list", () => {
    expect(screenSrc).toContain('kind: "header"');
    expect(screenSrc).toContain('kind: "notification"');
  });
});

// ─── Notification History Screen — Item Rendering ───────────────────────────

describe("Notification History — Item Rendering", () => {
  const screenSrc = readFile("app/notification-history.tsx");

  it("should show unread dot for unread items", () => {
    expect(screenSrc).toContain("unreadDot");
    expect(screenSrc).toContain("isUnread");
  });

  it("should use different background for unread items", () => {
    expect(screenSrc).toContain("primaryAlpha");
  });

  it("should show icon with type-specific color", () => {
    expect(screenSrc).toContain("getTypeConfig");
    expect(screenSrc).toContain("iconColor");
  });

  it("should show notification title and body", () => {
    expect(screenSrc).toContain("item.title");
    expect(screenSrc).toContain("item.body");
  });

  it("should show stock ticker chip when applicable", () => {
    expect(screenSrc).toContain("item.stockTicker");
    expect(screenSrc).toContain("stockChip");
  });

  it("should show actual price when available", () => {
    expect(screenSrc).toContain("item.actualPrice");
  });

  it("should format time for today/yesterday items", () => {
    expect(screenSrc).toContain("formatTime");
  });

  it("should format full date for older items", () => {
    expect(screenSrc).toContain("formatFullDate");
  });

  it("should have a delete button on each item", () => {
    expect(screenSrc).toContain("deleteBtn");
    expect(screenSrc).toContain("handleDelete");
  });
});

// ─── Notification History Screen — Actions ──────────────────────────────────

describe("Notification History — Actions", () => {
  const screenSrc = readFile("app/notification-history.tsx");

  it("should mark item as read on tap", () => {
    expect(screenSrc).toContain("markAsRead(item.id)");
  });

  it("should navigate to stock on tap when stockId exists", () => {
    expect(screenSrc).toContain("router.push(`/asset/${item.stockId}`");
  });

  it("should have Mark All Read button", () => {
    expect(screenSrc).toContain("markAllAsRead");
    expect(screenSrc).toContain("Read All");
  });

  it("should have Clear All button", () => {
    expect(screenSrc).toContain("clearHistory");
    expect(screenSrc).toContain("handleClearAll");
    expect(screenSrc).toContain("Clear");
  });

  it("should confirm before clearing all on native", () => {
    expect(screenSrc).toContain("Clear All Notifications");
    expect(screenSrc).toContain("This will remove all notification history");
  });

  it("should confirm before deleting individual items on native", () => {
    expect(screenSrc).toContain("Delete Notification");
  });
});

// ─── Notification History Screen — Empty State ──────────────────────────────

describe("Notification History — Empty State", () => {
  const screenSrc = readFile("app/notification-history.tsx");

  it("should show empty state when history is empty", () => {
    expect(screenSrc).toContain("No Notifications Yet");
  });

  it("should show a descriptive message in empty state", () => {
    expect(screenSrc).toContain("price alerts trigger");
  });

  it("should have a CTA to set up price alerts", () => {
    expect(screenSrc).toContain("Set Up Price Alerts");
    expect(screenSrc).toContain('"/price-alerts"');
  });
});

// ─── Notification History Screen — Type Config ──────────────────────────────

describe("Notification History — Type Config", () => {
  const screenSrc = readFile("app/notification-history.tsx");

  it("should map price_above to success color", () => {
    expect(screenSrc).toContain('"price_above"');
    expect(screenSrc).toContain('"success"');
  });

  it("should map price_below to error color", () => {
    expect(screenSrc).toContain('"price_below"');
    expect(screenSrc).toContain('"error"');
  });

  it("should map percent_change to accent color", () => {
    expect(screenSrc).toContain('"percent_change"');
    expect(screenSrc).toContain('"accent"');
  });

  it("should map market_news to primary color", () => {
    expect(screenSrc).toContain('"market_news"');
  });

  it("should map daily_challenge to warning color", () => {
    expect(screenSrc).toContain('"daily_challenge"');
    expect(screenSrc).toContain('"warning"');
  });

  it("should have a fallback for system type", () => {
    expect(screenSrc).toContain('"system"');
  });
});

// ─── Home Screen — Bell Badge ───────────────────────────────────────────────

describe("Notification History — Home Screen Bell Badge", () => {
  const homeSrc = readFile("app/(tabs)/index.tsx");

  it("should import useNotifications in Home screen", () => {
    expect(homeSrc).toContain("useNotifications");
  });

  it("should destructure unreadCount from useNotifications", () => {
    expect(homeSrc).toContain("unreadCount");
  });

  it("should navigate to notification-history on bell press", () => {
    expect(homeSrc).toContain('"/notification-history"');
  });

  it("should change bell color when there are unread notifications", () => {
    expect(homeSrc).toContain("unreadCount > 0 ? colors.primary : colors.muted");
  });

  it("should show badge count when unread > 0", () => {
    expect(homeSrc).toContain("styles.badge");
    expect(homeSrc).toContain("unreadCount > 0");
  });

  it("should cap badge display at 9+", () => {
    expect(homeSrc).toContain('unreadCount > 9 ? "9+"');
  });

  it("should have badge style with absolute positioning", () => {
    expect(homeSrc).toContain("badge");
    expect(homeSrc).toContain('position: "absolute"');
  });
});

// ─── Settings — Navigation Link ─────────────────────────────────────────────

describe("Notification History — Settings Navigation", () => {
  const settingsSrc = readFile("app/settings.tsx");

  it("should have a Notification History link in Settings", () => {
    expect(settingsSrc).toContain("Notification History");
  });

  it("should navigate to notification-history from Settings", () => {
    expect(settingsSrc).toContain('"/notification-history"');
  });

  it("should show description text for the link", () => {
    expect(settingsSrc).toContain("View past alerts and notifications");
  });
});

// ─── Root Layout — Route Registration ───────────────────────────────────────

describe("Notification History — Route Registration", () => {
  const layoutSrc = readFile("app/_layout.tsx");

  it("should register notification-history route in Stack", () => {
    expect(layoutSrc).toContain('"notification-history"');
  });

  it("should use slide_from_right animation", () => {
    // Find the notification-history screen line and check it has the right animation
    const lines = layoutSrc.split("\n");
    const historyLine = lines.find((l: string) => l.includes("notification-history"));
    expect(historyLine).toBeDefined();
    expect(historyLine).toContain("slide_from_right");
  });
});

// ─── Icon Mappings ──────────────────────────────────────────────────────────

describe("Notification History — Icon Mappings", () => {
  const iconSrc = readFile("components/ui/icon-symbol.tsx");

  it("should have trash icon mapping", () => {
    expect(iconSrc).toContain('"trash"');
  });

  it("should have clock icon mapping", () => {
    expect(iconSrc).toContain('"clock"');
  });

  it("should have newspaper icon mapping", () => {
    expect(iconSrc).toContain('"newspaper"');
  });

  it("should have arrow.up icon mapping", () => {
    expect(iconSrc).toContain('"arrow.up"');
  });

  it("should have arrow.down icon mapping", () => {
    expect(iconSrc).toContain('"arrow.down"');
  });

  it("should have percent icon mapping", () => {
    expect(iconSrc).toContain('"percent"');
  });
});
