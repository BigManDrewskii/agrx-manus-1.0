/**
 * Push Notifications Feature Tests
 *
 * Tests for the price alert service, notification router, notification context,
 * and UI integration points.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ─── Price Alert Service Tests ──────────────────────────────────────────────

describe("PriceAlertService", () => {
  const servicePath = path.resolve(__dirname, "../server/priceAlertService.ts");
  const serviceContent = fs.readFileSync(servicePath, "utf-8");

  it("should export PriceAlert type", () => {
    expect(serviceContent).toContain("export interface PriceAlert");
  });

  it("should export AlertType type", () => {
    expect(serviceContent).toContain("export type AlertType");
  });

  it("should export NotificationPreferences type", () => {
    expect(serviceContent).toContain("export interface NotificationPreferences");
  });

  it("should support above, below, and percent_change alert types", () => {
    expect(serviceContent).toContain('"above"');
    expect(serviceContent).toContain('"below"');
    expect(serviceContent).toContain('"percent_change"');
  });

  it("should have a method to add alerts", () => {
    expect(serviceContent).toContain("addAlert");
  });

  it("should have a method to remove alerts", () => {
    expect(serviceContent).toContain("removeAlert");
  });

  it("should have a method to toggle alerts", () => {
    expect(serviceContent).toContain("toggleAlert");
  });

  it("should have a method to check prices against thresholds", () => {
    expect(serviceContent).toContain("checkPriceAlerts");
  });

  it("should use Expo push notification API for delivery", () => {
    expect(serviceContent).toContain("https://exp.host/--/api/v2/push/send");
  });

  it("should track last triggered time to prevent spam", () => {
    expect(serviceContent).toContain("lastTriggered");
  });

  it("should have a cooldown period between notifications", () => {
    expect(serviceContent).toMatch(/cooldown|COOLDOWN|MIN_INTERVAL/i);
  });
});

// ─── Notification Router Tests ──────────────────────────────────────────────

describe("NotificationRouter", () => {
  const routerPath = path.resolve(__dirname, "../server/notificationRouter.ts");
  const routerContent = fs.readFileSync(routerPath, "utf-8");

  it("should export a notification router", () => {
    expect(routerContent).toContain("notificationRouter");
  });

  it("should have a registerDevice endpoint", () => {
    expect(routerContent).toContain("registerDevice");
  });

  it("should have a getAlerts endpoint", () => {
    expect(routerContent).toContain("getAlerts");
  });

  it("should have an addAlert endpoint", () => {
    expect(routerContent).toContain("addAlert");
  });

  it("should have a removeAlert endpoint", () => {
    expect(routerContent).toContain("removeAlert");
  });

  it("should have a toggleAlert endpoint", () => {
    expect(routerContent).toContain("toggleAlert");
  });

  it("should have an updatePreferences endpoint", () => {
    expect(routerContent).toContain("updatePreferences");
  });

  it("should validate input with zod schemas", () => {
    expect(routerContent).toContain("import { z }");
  });

  it("should require deviceId for device registration", () => {
    expect(routerContent).toContain("deviceId");
  });

  it("should require pushToken for device registration", () => {
    expect(routerContent).toContain("pushToken");
  });
});

// ─── Router Registration Tests ──────────────────────────────────────────────

describe("Router Registration", () => {
  const routersPath = path.resolve(__dirname, "../server/routers.ts");
  const routersContent = fs.readFileSync(routersPath, "utf-8");

  it("should import the notification router", () => {
    expect(routersContent).toContain("notificationRouter");
  });

  it("should register notifications in the app router", () => {
    expect(routersContent).toContain("notifications:");
  });
});

// ─── Notification Context Tests ─────────────────────────────────────────────

describe("NotificationContext", () => {
  const contextPath = path.resolve(__dirname, "../lib/notification-context.tsx");
  const contextContent = fs.readFileSync(contextPath, "utf-8");

  it("should export NotificationProvider", () => {
    expect(contextContent).toContain("export function NotificationProvider");
  });

  it("should export useNotifications hook", () => {
    expect(contextContent).toContain("export function useNotifications");
  });

  it("should configure notification handler", () => {
    expect(contextContent).toContain("setNotificationHandler");
  });

  it("should handle push token registration", () => {
    expect(contextContent).toContain("getExpoPushTokenAsync");
  });

  it("should handle permission requests", () => {
    expect(contextContent).toContain("requestPermissionsAsync");
  });

  it("should listen for notification responses (taps)", () => {
    expect(contextContent).toContain("addNotificationResponseReceivedListener");
  });

  it("should navigate to stock detail on notification tap", () => {
    expect(contextContent).toContain("router.push");
    expect(contextContent).toContain("/asset/");
  });

  it("should set up Android notification channel", () => {
    expect(contextContent).toContain("setNotificationChannelAsync");
    expect(contextContent).toContain("price-alerts");
  });

  it("should generate and persist a device ID", () => {
    expect(contextContent).toContain("DEVICE_ID_KEY");
    expect(contextContent).toContain("AsyncStorage");
  });

  it("should provide addPriceAlert function", () => {
    expect(contextContent).toContain("addPriceAlert");
  });

  it("should provide removePriceAlert function", () => {
    expect(contextContent).toContain("removePriceAlert");
  });

  it("should provide togglePriceAlert function", () => {
    expect(contextContent).toContain("togglePriceAlert");
  });

  it("should provide getAlertsForStock function", () => {
    expect(contextContent).toContain("getAlertsForStock");
  });

  it("should clean up notification listeners on unmount", () => {
    expect(contextContent).toContain(".remove()");
  });

  it("should handle web platform gracefully", () => {
    expect(contextContent).toContain("Platform.OS");
  });
});

// ─── Root Layout Integration Tests ──────────────────────────────────────────

describe("Root Layout Integration", () => {
  const layoutPath = path.resolve(__dirname, "../app/_layout.tsx");
  const layoutContent = fs.readFileSync(layoutPath, "utf-8");

  it("should import NotificationProvider", () => {
    expect(layoutContent).toContain("import { NotificationProvider }");
  });

  it("should wrap app with NotificationProvider", () => {
    expect(layoutContent).toContain("<NotificationProvider>");
  });

  it("should place NotificationProvider inside tRPC provider", () => {
    const trpcIdx = layoutContent.indexOf("<trpc.Provider");
    const notifIdx = layoutContent.indexOf("<NotificationProvider>");
    expect(trpcIdx).toBeLessThan(notifIdx);
  });

  it("should register price-alerts route", () => {
    expect(layoutContent).toContain('name="price-alerts"');
  });
});

// ─── Price Alerts Screen Tests ──────────────────────────────────────────────

describe("PriceAlertsScreen", () => {
  const screenPath = path.resolve(__dirname, "../app/price-alerts.tsx");
  const screenContent = fs.readFileSync(screenPath, "utf-8");

  it("should use ScreenContainer for proper layout", () => {
    expect(screenContent).toContain("ScreenContainer");
  });

  it("should use useNotifications hook", () => {
    expect(screenContent).toContain("useNotifications");
  });

  it("should render alert list with FlatList", () => {
    expect(screenContent).toContain("FlatList");
  });

  it("should support toggling alerts on/off", () => {
    expect(screenContent).toContain("Switch");
    expect(screenContent).toContain("togglePriceAlert");
  });

  it("should support deleting alerts", () => {
    expect(screenContent).toContain("removePriceAlert");
  });

  it("should show empty state when no alerts exist", () => {
    expect(screenContent).toContain("No Price Alerts");
  });

  it("should show permission banner when not granted", () => {
    expect(screenContent).toContain("Enable Notifications");
    expect(screenContent).toContain("requestPermission");
  });

  it("should format alert types correctly", () => {
    expect(screenContent).toContain("Above €");
    expect(screenContent).toContain("Below €");
    expect(screenContent).toContain("% change");
  });

  it("should have a back button for navigation", () => {
    expect(screenContent).toContain("router.back()");
  });
});

// ─── Add Alert Modal Tests ──────────────────────────────────────────────────

describe("AddAlertModal", () => {
  const modalPath = path.resolve(__dirname, "../components/ui/add-alert-modal.tsx");
  const modalContent = fs.readFileSync(modalPath, "utf-8");

  it("should export AddAlertModal component", () => {
    expect(modalContent).toContain("export function AddAlertModal");
  });

  it("should accept stockId, stockName, and currentPrice props", () => {
    expect(modalContent).toContain("stockId: string");
    expect(modalContent).toContain("stockName: string");
    expect(modalContent).toContain("currentPrice: number");
  });

  it("should support all three alert types", () => {
    expect(modalContent).toContain('"above"');
    expect(modalContent).toContain('"below"');
    expect(modalContent).toContain('"percent_change"');
  });

  it("should have a threshold input", () => {
    expect(modalContent).toContain("TextInput");
    expect(modalContent).toContain("decimal-pad");
  });

  it("should validate threshold before saving", () => {
    expect(modalContent).toContain("isNaN(value)");
  });

  it("should request permission if not granted", () => {
    expect(modalContent).toContain("requestPermission");
  });

  it("should use bottom sheet modal pattern", () => {
    expect(modalContent).toContain("Modal");
    expect(modalContent).toContain("animationType=\"slide\"");
  });

  it("should show current price in header", () => {
    expect(modalContent).toContain("currentPrice.toFixed(2)");
  });

  it("should provide smart placeholder values", () => {
    expect(modalContent).toContain("getPlaceholder");
    expect(modalContent).toContain("currentPrice * 1.1");
    expect(modalContent).toContain("currentPrice * 0.9");
  });
});

// ─── Asset Detail Integration Tests ─────────────────────────────────────────

describe("AssetDetail Alert Integration", () => {
  const assetPath = path.resolve(__dirname, "../app/asset/[id].tsx");
  const assetContent = fs.readFileSync(assetPath, "utf-8");

  it("should import useNotifications", () => {
    expect(assetContent).toContain("import { useNotifications }");
  });

  it("should import AddAlertModal", () => {
    expect(assetContent).toContain("import { AddAlertModal }");
  });

  it("should have showAlertModal state", () => {
    expect(assetContent).toContain("showAlertModal");
  });

  it("should check for existing alerts on the stock", () => {
    expect(assetContent).toContain("getAlertsForStock");
    expect(assetContent).toContain("hasActiveAlerts");
  });

  it("should show bell icon in header", () => {
    expect(assetContent).toContain("bell.fill");
    expect(assetContent).toContain("bell.badge.fill");
  });

  it("should highlight bell when alerts are active", () => {
    expect(assetContent).toContain("hasActiveAlerts");
    expect(assetContent).toContain("colors.primary");
  });

  it("should render AddAlertModal", () => {
    expect(assetContent).toContain("<AddAlertModal");
  });
});

// ─── Settings Integration Tests ─────────────────────────────────────────────

describe("Settings Alert Integration", () => {
  const settingsPath = path.resolve(__dirname, "../app/settings.tsx");
  const settingsContent = fs.readFileSync(settingsPath, "utf-8");

  it("should have a 'Manage Price Alerts' navigation row", () => {
    expect(settingsContent).toContain("Manage Price Alerts");
  });

  it("should navigate to price-alerts screen", () => {
    expect(settingsContent).toContain("/price-alerts");
  });
});

// ─── Icon Mapping Tests ─────────────────────────────────────────────────────

describe("Icon Mappings for Notifications", () => {
  const iconPath = path.resolve(__dirname, "../components/ui/icon-symbol.tsx");
  const iconContent = fs.readFileSync(iconPath, "utf-8");

  it("should have bell.fill icon mapped", () => {
    expect(iconContent).toContain('"bell.fill"');
  });

  it("should have bell.badge.fill icon mapped", () => {
    expect(iconContent).toContain('"bell.badge.fill"');
  });
});
