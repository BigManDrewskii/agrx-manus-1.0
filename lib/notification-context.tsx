/**
 * AGRX Notification Context
 *
 * Manages push notification lifecycle:
 * - Permission requests (with graceful web fallback)
 * - Expo push token registration with server
 * - Local notification display and handling
 * - Notification tap routing to relevant screens
 * - Device ID generation and persistence
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

  // ── Initialize ──
  useEffect(() => {
    (async () => {
      try {
        // Get or create device ID
        const id = await getOrCreateDeviceId();
        setDeviceId(id);

        // Check if we've asked before
        const asked = await AsyncStorage.getItem(PERMISSION_ASKED_KEY);
        setPermissionAsked(asked === "true");

        // Check platform support
        if (Platform.OS === "web") {
          // Web push is limited — mark as supported but handle gracefully
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
            projectId: undefined, // Uses the project from app.config
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

  // ── Set up notification listeners ──
  useEffect(() => {
    // Listen for incoming notifications (foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("[Notifications] Received:", notification.request.content.title);
      }
    );

    // Listen for notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?.type === "price_alert" && data?.stockId) {
          // Navigate to the stock detail screen
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
  }, [router]);

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
          return result.data as PriceAlert;
        }
        return null;
      } catch (error) {
        console.warn("[Notifications] Add alert error:", error);
        return null;
      }
    },
    [deviceId, addAlertMutation]
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
