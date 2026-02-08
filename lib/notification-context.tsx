/**
 * AGRX Notification Context
 *
 * Manages push notification lifecycle:
 * - Permission requests (with graceful web fallback)
 * - Expo push token registration with server
 * - Local notification display and handling
 * - Notification tap routing to relevant screens
 * - Device ID generation and persistence
 * - Notification history with AsyncStorage persistence and unread badge
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Platform, AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import type { EventSubscription } from "expo-modules-core";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import type { PriceAlert, NotificationPreferences, AlertType } from "@/server/priceAlertService";

// ─── Constants ──────────────────────────────────────────────────────────────

const DEVICE_ID_KEY = "@agrx/device-id";
const PUSH_TOKEN_KEY = "@agrx/push-token";
const PERMISSION_ASKED_KEY = "@agrx/notification-permission-asked";
const NOTIFICATION_HISTORY_KEY = "@agrx/notification-history";
const MAX_HISTORY_ITEMS = 100;

// ─── Configure notification handler ────────────────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

// ─── Types ──────────────────────────────────────────────────────────────────

export type NotificationHistoryItemType =
  | "price_above"
  | "price_below"
  | "percent_change"
  | "market_news"
  | "daily_challenge"
  | "social"
  | "system";

export interface NotificationHistoryItem {
  /** Unique ID */
  id: string;
  /** Notification title */
  title: string;
  /** Notification body text */
  body: string;
  /** Type of notification for icon/color theming */
  type: NotificationHistoryItemType;
  /** Associated stock ID (if applicable) */
  stockId?: string;
  /** Associated stock ticker (if applicable) */
  stockTicker?: string;
  /** The threshold value that triggered the alert */
  threshold?: number;
  /** The actual price at the time of the alert */
  actualPrice?: number;
  /** Whether the user has read this notification */
  read: boolean;
  /** Timestamp when the notification was received */
  timestamp: number;
}

interface NotificationContextValue {
  /** Whether push notifications are supported on this device */
  isSupported: boolean;
  /** Whether the user has granted notification permission */
  hasPermission: boolean;
  /** Whether we've already asked for permission */
  permissionAsked: boolean;
  /** The device's push token (null if not registered) */
  pushToken: string | null;
  /** The device ID used for server registration */
  deviceId: string | null;
  /** Whether the notification system is initializing */
  loading: boolean;
  /** Request notification permission from the user */
  requestPermission: () => Promise<boolean>;
  /** Register a price alert for a stock */
  addPriceAlert: (params: {
    stockId: string;
    stockName: string;
    type: AlertType;
    threshold: number;
  }) => Promise<PriceAlert | null>;
  /** Remove a price alert */
  removePriceAlert: (alertId: string) => Promise<boolean>;
  /** Toggle a price alert on/off */
  togglePriceAlert: (alertId: string) => Promise<boolean>;
  /** Get all alerts for the current device */
  alerts: PriceAlert[];
  /** Get alerts for a specific stock */
  getAlertsForStock: (stockId: string) => PriceAlert[];
  /** Update notification preferences */
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  /** Current notification preferences */
  preferences: NotificationPreferences | null;
  /** Refresh alerts from server */
  refreshAlerts: () => void;

  // ── History ──
  /** All notification history items (newest first) */
  history: NotificationHistoryItem[];
  /** Count of unread notifications */
  unreadCount: number;
  /** Mark a single notification as read */
  markAsRead: (notificationId: string) => void;
  /** Mark all notifications as read */
  markAllAsRead: () => void;
  /** Remove a single notification from history */
  removeFromHistory: (notificationId: string) => void;
  /** Clear all notification history */
  clearHistory: () => void;
}

const defaultPreferences: NotificationPreferences = {
  priceAlerts: true,
  dailyChallenge: true,
  socialActivity: false,
  marketNews: true,
  percentThreshold: 5,
  quietHoursStart: null,
  quietHoursEnd: null,
};

const NotificationContext = createContext<NotificationContextValue>({
  isSupported: false,
  hasPermission: false,
  permissionAsked: false,
  pushToken: null,
  deviceId: null,
  loading: true,
  requestPermission: async () => false,
  addPriceAlert: async () => null,
  removePriceAlert: async () => false,
  togglePriceAlert: async () => false,
  alerts: [],
  getAlertsForStock: () => [],
  updatePreferences: async () => {},
  preferences: null,
  refreshAlerts: () => {},
  history: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  removeFromHistory: () => {},
  clearHistory: () => {},
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateDeviceId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "agrx-";
  for (let i = 0; i < 16; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function generateHistoryId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function getOrCreateDeviceId(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (stored) return stored;

    const newId = generateDeviceId();
    await AsyncStorage.setItem(DEVICE_ID_KEY, newId);
    return newId;
  } catch {
    return generateDeviceId();
  }
}

async function loadHistory(): Promise<NotificationHistoryItem[]> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_HISTORY_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveHistory(items: NotificationHistoryItem[]): Promise<void> {
  try {
    // Keep only the most recent MAX_HISTORY_ITEMS
    const trimmed = items.slice(0, MAX_HISTORY_ITEMS);
    await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // Silently fail
  }
}

/**
 * Map notification data to a history item type.
 */
function mapNotificationToHistoryType(data: Record<string, any> | undefined): NotificationHistoryItemType {
  if (!data) return "system";
  switch (data.type) {
    case "price_alert":
      if (data.alertType === "above") return "price_above";
      if (data.alertType === "below") return "price_below";
      if (data.alertType === "percent_change") return "percent_change";
      return "price_above";
    case "market_news":
      return "market_news";
    case "daily_challenge":
      return "daily_challenge";
    case "social":
      return "social";
    default:
      return "system";
  }
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionAsked, setPermissionAsked] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);

  const notificationListener = useRef<EventSubscription | undefined>(undefined);
  const responseListener = useRef<EventSubscription | undefined>(undefined);

  // tRPC mutations
  const registerMutation = trpc.notifications.registerDevice.useMutation();
  const addAlertMutation = trpc.notifications.addAlert.useMutation();
  const removeAlertMutation = trpc.notifications.removeAlert.useMutation();
  const toggleAlertMutation = trpc.notifications.toggleAlert.useMutation();
  const updatePrefsMutation = trpc.notifications.updatePreferences.useMutation();

  // tRPC queries (disabled until we have a deviceId)
  const alertsQuery = trpc.notifications.getAlerts.useQuery(
    { deviceId: deviceId ?? "" },
    { enabled: !!deviceId && !!pushToken }
  );

  const prefsQuery = trpc.notifications.getPreferences.useQuery(
    { deviceId: deviceId ?? "" },
    { enabled: !!deviceId && !!pushToken }
  );

  // ── Derived: unread count ──
  const unreadCount = useMemo(() => history.filter((h) => !h.read).length, [history]);

  // ── Initialize ──
  useEffect(() => {
    (async () => {
      try {
        // Get or create device ID
        const id = await getOrCreateDeviceId();
        setDeviceId(id);

        // Load notification history from storage
        const storedHistory = await loadHistory();
        setHistory(storedHistory);

        // Check if we've asked before
        const asked = await AsyncStorage.getItem(PERMISSION_ASKED_KEY);
        setPermissionAsked(asked === "true");

        // Check platform support
        if (Platform.OS === "web") {
          setIsSupported("Notification" in globalThis);
          if ("Notification" in globalThis) {
            setHasPermission(Notification.permission === "granted");
          }
          setLoading(false);
          return;
        }

        // Native: check current permission status
        setIsSupported(true);
        const { status } = await Notifications.getPermissionsAsync();
        setHasPermission(status === "granted");

        // If already granted, get the push token
        if (status === "granted") {
          const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: undefined,
          });
          const token = tokenData.data;
          setPushToken(token);
          await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
        }
      } catch (error) {
        console.warn("[Notifications] Init error:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Register with server when we have both deviceId and pushToken ──
  useEffect(() => {
    if (!deviceId || !pushToken) return;

    registerMutation.mutate(
      {
        deviceId,
        pushToken,
        platform: Platform.OS === "web" ? "web" : Platform.OS === "ios" ? "ios" : "android",
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            console.log("[Notifications] Device registered with server");
          }
        },
        onError: (error) => {
          console.warn("[Notifications] Registration failed:", error.message);
        },
      }
    );
  }, [deviceId, pushToken]);

  // ── Sync alerts from server ──
  useEffect(() => {
    if (alertsQuery.data?.success && alertsQuery.data.data) {
      setAlerts(alertsQuery.data.data);
    }
  }, [alertsQuery.data]);

  // ── Sync preferences from server ──
  useEffect(() => {
    if (prefsQuery.data?.success && prefsQuery.data.data) {
      setPreferences(prefsQuery.data.data);
    }
  }, [prefsQuery.data]);

  // ── Helper: add item to history ──
  const addToHistory = useCallback((item: NotificationHistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev].slice(0, MAX_HISTORY_ITEMS);
      // Persist async (fire-and-forget)
      saveHistory(updated);
      return updated;
    });
  }, []);

  // ── Set up notification listeners ──
  useEffect(() => {
    // Listen for incoming notifications (foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        const content = notification.request.content;
        const data = content.data as Record<string, any> | undefined;

        // Add to history
        addToHistory({
          id: generateHistoryId(),
          title: content.title ?? "AGRX Alert",
          body: content.body ?? "",
          type: mapNotificationToHistoryType(data),
          stockId: data?.stockId,
          stockTicker: data?.stockTicker,
          threshold: data?.threshold ? Number(data.threshold) : undefined,
          actualPrice: data?.actualPrice ? Number(data.actualPrice) : undefined,
          read: false,
          timestamp: Date.now(),
        });
      }
    );

    // Listen for notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const content = response.notification.request.content;
        const data = content.data as Record<string, any> | undefined;

        // Also add to history if not already there (e.g. background notification)
        addToHistory({
          id: generateHistoryId(),
          title: content.title ?? "AGRX Alert",
          body: content.body ?? "",
          type: mapNotificationToHistoryType(data),
          stockId: data?.stockId,
          stockTicker: data?.stockTicker,
          threshold: data?.threshold ? Number(data.threshold) : undefined,
          actualPrice: data?.actualPrice ? Number(data.actualPrice) : undefined,
          read: true, // Tapped = read
          timestamp: Date.now(),
        });

        if (data?.type === "price_alert" && data?.stockId) {
          router.push(`/asset/${data.stockId}` as any);
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [router, addToHistory]);

  // ── Set up Android notification channel ──
  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("price-alerts", {
        name: "Price Alerts",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#0052CC",
        sound: "default",
      });
    }
  }, []);

  // ── Request Permission ──
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(PERMISSION_ASKED_KEY, "true");
      setPermissionAsked(true);

      if (Platform.OS === "web") {
        if (!("Notification" in globalThis)) return false;
        const result = await Notification.requestPermission();
        const granted = result === "granted";
        setHasPermission(granted);
        return granted;
      }

      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === "granted";
      setHasPermission(granted);

      if (granted) {
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: undefined,
        });
        const token = tokenData.data;
        setPushToken(token);
        await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
      }

      return granted;
    } catch (error) {
      console.warn("[Notifications] Permission request error:", error);
      return false;
    }
  }, []);

  // ── Add Price Alert ──
  const addPriceAlert = useCallback(
    async (params: {
      stockId: string;
      stockName: string;
      type: AlertType;
      threshold: number;
    }): Promise<PriceAlert | null> => {
      if (!deviceId) return null;

      try {
        const result = await addAlertMutation.mutateAsync({
          deviceId,
          ...params,
          enabled: true,
        });

        if (result.success && result.data) {
          setAlerts((prev) => [...prev, result.data as PriceAlert]);

          // Add a history entry for the alert creation
          addToHistory({
            id: generateHistoryId(),
            title: "Price Alert Created",
            body: `${params.type === "above" ? "Above" : params.type === "below" ? "Below" : "±"} €${params.threshold.toFixed(2)} alert set for ${params.stockName}`,
            type: params.type === "above" ? "price_above" : params.type === "below" ? "price_below" : "percent_change",
            stockId: params.stockId,
            stockTicker: params.stockName,
            threshold: params.threshold,
            read: true, // User just created it, so it's "read"
            timestamp: Date.now(),
          });

          return result.data as PriceAlert;
        }
        return null;
      } catch (error) {
        console.warn("[Notifications] Add alert error:", error);
        return null;
      }
    },
    [deviceId, addAlertMutation, addToHistory]
  );

  // ── Remove Price Alert ──
  const removePriceAlert = useCallback(
    async (alertId: string): Promise<boolean> => {
      if (!deviceId) return false;

      try {
        const result = await removeAlertMutation.mutateAsync({
          deviceId,
          alertId,
        });

        if (result.success) {
          setAlerts((prev) => prev.filter((a) => a.id !== alertId));
        }
        return result.success;
      } catch (error) {
        console.warn("[Notifications] Remove alert error:", error);
        return false;
      }
    },
    [deviceId, removeAlertMutation]
  );

  // ── Toggle Price Alert ──
  const togglePriceAlert = useCallback(
    async (alertId: string): Promise<boolean> => {
      if (!deviceId) return false;

      try {
        const result = await toggleAlertMutation.mutateAsync({
          deviceId,
          alertId,
        });

        if (result.success) {
          setAlerts((prev) =>
            prev.map((a) =>
              a.id === alertId ? { ...a, enabled: !a.enabled } : a
            )
          );
        }
        return result.success;
      } catch (error) {
        console.warn("[Notifications] Toggle alert error:", error);
        return false;
      }
    },
    [deviceId, toggleAlertMutation]
  );

  // ── Get Alerts for Stock ──
  const getAlertsForStock = useCallback(
    (stockId: string): PriceAlert[] => {
      return alerts.filter((a) => a.stockId === stockId);
    },
    [alerts]
  );

  // ── Update Preferences ──
  const updatePreferencesHandler = useCallback(
    async (prefs: Partial<NotificationPreferences>): Promise<void> => {
      if (!deviceId) return;

      try {
        const result = await updatePrefsMutation.mutateAsync({
          deviceId,
          preferences: prefs,
        });

        if (result.success && result.data) {
          setPreferences(result.data as NotificationPreferences);
        }
      } catch (error) {
        console.warn("[Notifications] Update preferences error:", error);
      }
    },
    [deviceId, updatePrefsMutation]
  );

  // ── Refresh Alerts ──
  const refreshAlerts = useCallback(() => {
    alertsQuery.refetch();
    prefsQuery.refetch();
  }, [alertsQuery, prefsQuery]);

  // ── History: Mark as Read ──
  const markAsRead = useCallback((notificationId: string) => {
    setHistory((prev) => {
      const updated = prev.map((item) =>
        item.id === notificationId ? { ...item, read: true } : item
      );
      saveHistory(updated);
      return updated;
    });
  }, []);

  // ── History: Mark All as Read ──
  const markAllAsRead = useCallback(() => {
    setHistory((prev) => {
      const updated = prev.map((item) => ({ ...item, read: true }));
      saveHistory(updated);
      return updated;
    });
  }, []);

  // ── History: Remove from History ──
  const removeFromHistory = useCallback((notificationId: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== notificationId);
      saveHistory(updated);
      return updated;
    });
  }, []);

  // ── History: Clear All ──
  const clearHistory = useCallback(() => {
    setHistory([]);
    AsyncStorage.removeItem(NOTIFICATION_HISTORY_KEY).catch(() => {});
  }, []);

  const value = useMemo<NotificationContextValue>(
    () => ({
      isSupported,
      hasPermission,
      permissionAsked,
      pushToken,
      deviceId,
      loading,
      requestPermission,
      addPriceAlert,
      removePriceAlert,
      togglePriceAlert,
      alerts,
      getAlertsForStock,
      updatePreferences: updatePreferencesHandler,
      preferences,
      refreshAlerts,
      history,
      unreadCount,
      markAsRead,
      markAllAsRead,
      removeFromHistory,
      clearHistory,
    }),
    [
      isSupported,
      hasPermission,
      permissionAsked,
      pushToken,
      deviceId,
      loading,
      requestPermission,
      addPriceAlert,
      removePriceAlert,
      togglePriceAlert,
      alerts,
      getAlertsForStock,
      updatePreferencesHandler,
      preferences,
      refreshAlerts,
      history,
      unreadCount,
      markAsRead,
      markAllAsRead,
      removeFromHistory,
      clearHistory,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
