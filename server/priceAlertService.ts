/**
 * AGRX Price Alert Service
 *
 * Server-side service that monitors watchlisted stock prices and sends
 * push notifications when user-defined thresholds are breached.
 *
 * Architecture:
 * - In-memory store for push tokens and alert preferences (no DB required for MVP)
 * - Periodic price checks via the existing stockService
 * - Expo Push Notification delivery for native devices
 * - Cooldown mechanism to prevent notification spam
 */

import { getMultipleQuotes, type StockQuote } from "./stockService";

// ─── Types ──────────────────────────────────────────────────────────────────

export type AlertType = "above" | "below" | "percent_change";

export interface PriceAlert {
  id: string;
  stockId: string;
  stockName: string;
  type: AlertType;
  /** Target price for above/below, or percentage for percent_change */
  threshold: number;
  /** Whether the alert is currently active */
  enabled: boolean;
  /** Timestamp of last trigger (for cooldown) */
  lastTriggered: number | null;
  /** Created timestamp */
  createdAt: number;
}

export interface DeviceRegistration {
  pushToken: string;
  deviceId: string;
  platform: "ios" | "android" | "web";
  /** All alerts for this device */
  alerts: PriceAlert[];
  /** Global notification preferences */
  preferences: NotificationPreferences;
  /** Last seen timestamp */
  lastSeen: number;
}

export interface NotificationPreferences {
  priceAlerts: boolean;
  dailyChallenge: boolean;
  socialActivity: boolean;
  marketNews: boolean;
  /** Minimum percentage change to trigger a notification (default 5%) */
  percentThreshold: number;
  /** Quiet hours — no notifications between these times */
  quietHoursStart: number | null; // hour 0-23
  quietHoursEnd: number | null;   // hour 0-23
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

// ─── Constants ──────────────────────────────────────────────────────────────

/** Minimum time between repeated alerts for the same stock (30 minutes) */
const ALERT_COOLDOWN_MS = 30 * 60 * 1000;

/** How often to check prices (5 minutes) */
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

/** Maximum alerts per device */
const MAX_ALERTS_PER_DEVICE = 50;

/** Expo Push API endpoint */
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

// ─── In-Memory Store ────────────────────────────────────────────────────────

/** Map of deviceId -> DeviceRegistration */
const deviceStore = new Map<string, DeviceRegistration>();

/** Track last known prices for change detection */
const lastKnownPrices = new Map<string, number>();

/** Interval handle for periodic checks */
let checkInterval: ReturnType<typeof setInterval> | null = null;

// ─── Device Registration ────────────────────────────────────────────────────

export function registerDevice(
  deviceId: string,
  pushToken: string,
  platform: "ios" | "android" | "web"
): DeviceRegistration {
  const existing = deviceStore.get(deviceId);

  if (existing) {
    // Update token and last seen
    existing.pushToken = pushToken;
    existing.platform = platform;
    existing.lastSeen = Date.now();
    return existing;
  }

  const registration: DeviceRegistration = {
    pushToken,
    deviceId,
    platform,
    alerts: [],
    preferences: {
      priceAlerts: true,
      dailyChallenge: true,
      socialActivity: false,
      marketNews: true,
      percentThreshold: 5,
      quietHoursStart: null,
      quietHoursEnd: null,
    },
    lastSeen: Date.now(),
  };

  deviceStore.set(deviceId, registration);
  console.log(`[PriceAlertService] Device registered: ${deviceId} (${platform})`);
  return registration;
}

export function unregisterDevice(deviceId: string): boolean {
  const deleted = deviceStore.delete(deviceId);
  if (deleted) {
    console.log(`[PriceAlertService] Device unregistered: ${deviceId}`);
  }
  return deleted;
}

export function getDevice(deviceId: string): DeviceRegistration | undefined {
  return deviceStore.get(deviceId);
}

export function getRegisteredDeviceCount(): number {
  return deviceStore.size;
}

// ─── Alert Management ───────────────────────────────────────────────────────

export function addAlert(
  deviceId: string,
  alert: Omit<PriceAlert, "id" | "lastTriggered" | "createdAt">
): PriceAlert | null {
  const device = deviceStore.get(deviceId);
  if (!device) return null;

  if (device.alerts.length >= MAX_ALERTS_PER_DEVICE) {
    console.warn(`[PriceAlertService] Max alerts reached for device ${deviceId}`);
    return null;
  }

  const newAlert: PriceAlert = {
    ...alert,
    id: `${deviceId}-${alert.stockId}-${Date.now()}`,
    lastTriggered: null,
    createdAt: Date.now(),
  };

  device.alerts.push(newAlert);
  console.log(
    `[PriceAlertService] Alert added: ${newAlert.type} ${newAlert.threshold} for ${newAlert.stockId}`
  );
  return newAlert;
}

export function removeAlert(deviceId: string, alertId: string): boolean {
  const device = deviceStore.get(deviceId);
  if (!device) return false;

  const idx = device.alerts.findIndex((a) => a.id === alertId);
  if (idx === -1) return false;

  device.alerts.splice(idx, 1);
  return true;
}

export function toggleAlert(deviceId: string, alertId: string): boolean {
  const device = deviceStore.get(deviceId);
  if (!device) return false;

  const alert = device.alerts.find((a) => a.id === alertId);
  if (!alert) return false;

  alert.enabled = !alert.enabled;
  return true;
}

export function getAlerts(deviceId: string): PriceAlert[] {
  return deviceStore.get(deviceId)?.alerts ?? [];
}

export function getAlertsForStock(deviceId: string, stockId: string): PriceAlert[] {
  return (deviceStore.get(deviceId)?.alerts ?? []).filter(
    (a) => a.stockId === stockId
  );
}

// ─── Notification Preferences ───────────────────────────────────────────────

export function updatePreferences(
  deviceId: string,
  prefs: Partial<NotificationPreferences>
): NotificationPreferences | null {
  const device = deviceStore.get(deviceId);
  if (!device) return null;

  device.preferences = { ...device.preferences, ...prefs };
  return device.preferences;
}

export function getPreferences(deviceId: string): NotificationPreferences | null {
  return deviceStore.get(deviceId)?.preferences ?? null;
}

// ─── Push Notification Delivery ─────────────────────────────────────────────

async function sendPushNotification(
  pushToken: string,
  notification: NotificationPayload
): Promise<boolean> {
  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: pushToken,
        sound: "default",
        title: notification.title,
        body: notification.body,
        data: notification.data ?? {},
        priority: "high",
        channelId: "price-alerts",
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.warn(
        `[PriceAlertService] Push failed (${response.status}): ${text}`
      );
      return false;
    }

    const result = await response.json();
    // Expo returns { data: [{ status: "ok" }] } on success
    if (result?.data?.[0]?.status === "error") {
      console.warn(
        `[PriceAlertService] Push error: ${result.data[0].message}`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.warn("[PriceAlertService] Push delivery error:", error);
    return false;
  }
}

// ─── Quiet Hours Check ──────────────────────────────────────────────────────

function isInQuietHours(prefs: NotificationPreferences): boolean {
  if (prefs.quietHoursStart === null || prefs.quietHoursEnd === null) {
    return false;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const start = prefs.quietHoursStart;
  const end = prefs.quietHoursEnd;

  // Handle overnight quiet hours (e.g., 22:00 - 07:00)
  if (start > end) {
    return currentHour >= start || currentHour < end;
  }

  return currentHour >= start && currentHour < end;
}

// ─── Price Check Logic ──────────────────────────────────────────────────────

function checkAlertCondition(
  alert: PriceAlert,
  currentPrice: number,
  previousPrice: number | undefined
): boolean {
  if (!alert.enabled) return false;

  // Cooldown check
  if (
    alert.lastTriggered &&
    Date.now() - alert.lastTriggered < ALERT_COOLDOWN_MS
  ) {
    return false;
  }

  switch (alert.type) {
    case "above":
      return currentPrice >= alert.threshold;
    case "below":
      return currentPrice <= alert.threshold;
    case "percent_change": {
      if (!previousPrice || previousPrice === 0) return false;
      const change = Math.abs(
        ((currentPrice - previousPrice) / previousPrice) * 100
      );
      return change >= alert.threshold;
    }
    default:
      return false;
  }
}

function formatAlertMessage(
  alert: PriceAlert,
  currentPrice: number,
  previousPrice: number | undefined
): NotificationPayload {
  const priceStr = `€${currentPrice.toFixed(2)}`;

  switch (alert.type) {
    case "above":
      return {
        title: `📈 ${alert.stockName} hit €${alert.threshold.toFixed(2)}`,
        body: `${alert.stockName} is now trading at ${priceStr}, above your target of €${alert.threshold.toFixed(2)}.`,
        data: { stockId: alert.stockId, alertId: alert.id, type: "price_alert" },
      };
    case "below":
      return {
        title: `📉 ${alert.stockName} dropped to ${priceStr}`,
        body: `${alert.stockName} is now trading at ${priceStr}, below your target of €${alert.threshold.toFixed(2)}.`,
        data: { stockId: alert.stockId, alertId: alert.id, type: "price_alert" },
      };
    case "percent_change": {
      const change = previousPrice
        ? ((currentPrice - previousPrice) / previousPrice) * 100
        : 0;
      const direction = change >= 0 ? "up" : "down";
      const emoji = change >= 0 ? "🔥" : "⚠️";
      return {
        title: `${emoji} ${alert.stockName} moved ${Math.abs(change).toFixed(1)}% ${direction}`,
        body: `${alert.stockName} is now at ${priceStr} (${change >= 0 ? "+" : ""}${change.toFixed(1)}%).`,
        data: { stockId: alert.stockId, alertId: alert.id, type: "price_alert" },
      };
    }
    default:
      return {
        title: `Price Alert: ${alert.stockName}`,
        body: `${alert.stockName} is now at ${priceStr}.`,
        data: { stockId: alert.stockId, alertId: alert.id, type: "price_alert" },
      };
  }
}

/**
 * Main price check loop — called periodically.
 * Fetches current prices for all stocks that have active alerts,
 * checks conditions, and sends notifications.
 */
export async function checkPriceAlerts(): Promise<{
  checked: number;
  triggered: number;
  sent: number;
}> {
  let checked = 0;
  let triggered = 0;
  let sent = 0;

  // Collect all unique stock IDs with active alerts
  const stockIdsToCheck = new Set<string>();
  for (const device of deviceStore.values()) {
    if (!device.preferences.priceAlerts) continue;
    for (const alert of device.alerts) {
      if (alert.enabled) {
        stockIdsToCheck.add(alert.stockId);
      }
    }
  }

  if (stockIdsToCheck.size === 0) return { checked, triggered, sent };

  // Fetch current prices
  let quotes: StockQuote[];
  try {
    quotes = await getMultipleQuotes(Array.from(stockIdsToCheck));
  } catch (error) {
    console.warn("[PriceAlertService] Failed to fetch quotes:", error);
    return { checked, triggered, sent };
  }

  // Build price map
  const priceMap = new Map<string, number>();
  for (const quote of quotes) {
    priceMap.set(quote.id, quote.price);
  }

  // Check each device's alerts
  for (const device of deviceStore.values()) {
    if (!device.preferences.priceAlerts) continue;
    if (isInQuietHours(device.preferences)) continue;

    for (const alert of device.alerts) {
      const currentPrice = priceMap.get(alert.stockId);
      if (currentPrice === undefined) continue;

      checked++;
      const previousPrice = lastKnownPrices.get(alert.stockId);

      if (checkAlertCondition(alert, currentPrice, previousPrice)) {
        triggered++;
        const notification = formatAlertMessage(alert, currentPrice, previousPrice);

        const success = await sendPushNotification(
          device.pushToken,
          notification
        );

        if (success) {
          sent++;
          alert.lastTriggered = Date.now();
        }
      }
    }
  }

  // Update last known prices
  for (const [stockId, price] of priceMap) {
    lastKnownPrices.set(stockId, price);
  }

  if (triggered > 0) {
    console.log(
      `[PriceAlertService] Check complete: ${checked} checked, ${triggered} triggered, ${sent} sent`
    );
  }

  return { checked, triggered, sent };
}

// ─── Service Lifecycle ──────────────────────────────────────────────────────

export function startPriceAlertService(): void {
  if (checkInterval) {
    console.warn("[PriceAlertService] Service already running");
    return;
  }

  console.log(
    `[PriceAlertService] Starting price alert service (interval: ${CHECK_INTERVAL_MS / 1000}s)`
  );

  // Run initial check after a short delay
  setTimeout(() => {
    checkPriceAlerts().catch((err) =>
      console.warn("[PriceAlertService] Initial check failed:", err)
    );
  }, 10_000);

  // Set up periodic checks
  checkInterval = setInterval(() => {
    checkPriceAlerts().catch((err) =>
      console.warn("[PriceAlertService] Periodic check failed:", err)
    );
  }, CHECK_INTERVAL_MS);
}

export function stopPriceAlertService(): void {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
    console.log("[PriceAlertService] Service stopped");
  }
}

export function isServiceRunning(): boolean {
  return checkInterval !== null;
}

// ─── Stats ──────────────────────────────────────────────────────────────────

export function getServiceStats() {
  let totalAlerts = 0;
  let activeAlerts = 0;
  const stocksMonitored = new Set<string>();

  for (const device of deviceStore.values()) {
    for (const alert of device.alerts) {
      totalAlerts++;
      if (alert.enabled) {
        activeAlerts++;
        stocksMonitored.add(alert.stockId);
      }
    }
  }

  return {
    registeredDevices: deviceStore.size,
    totalAlerts,
    activeAlerts,
    stocksMonitored: stocksMonitored.size,
    isRunning: isServiceRunning(),
  };
}
