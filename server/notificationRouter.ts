/**
 * AGRX Notification Router
 *
 * tRPC router for push notification management:
 * - Device registration (push token)
 * - Price alert CRUD
 * - Notification preference management
 * - Service stats
 */
import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import {
  registerDevice,
  unregisterDevice,
  getDevice,
  addAlert,
  removeAlert,
  toggleAlert,
  getAlerts,
  getAlertsForStock,
  updatePreferences,
  getPreferences,
  getServiceStats,
  startPriceAlertService,
  isServiceRunning,
  type AlertType,
} from "./priceAlertService";

// ─── Input Schemas ──────────────────────────────────────────────────────────

const registerDeviceSchema = z.object({
  deviceId: z.string().min(1),
  pushToken: z.string().min(1),
  platform: z.enum(["ios", "android", "web"]),
});

const addAlertSchema = z.object({
  deviceId: z.string().min(1),
  stockId: z.string().min(1),
  stockName: z.string().min(1),
  type: z.enum(["above", "below", "percent_change"]) as z.ZodType<AlertType>,
  threshold: z.number().positive(),
  enabled: z.boolean().default(true),
});

const removeAlertSchema = z.object({
  deviceId: z.string().min(1),
  alertId: z.string().min(1),
});

const toggleAlertSchema = z.object({
  deviceId: z.string().min(1),
  alertId: z.string().min(1),
});

const getAlertsSchema = z.object({
  deviceId: z.string().min(1),
  stockId: z.string().optional(),
});

const updatePreferencesSchema = z.object({
  deviceId: z.string().min(1),
  preferences: z.object({
    priceAlerts: z.boolean().optional(),
    dailyChallenge: z.boolean().optional(),
    socialActivity: z.boolean().optional(),
    marketNews: z.boolean().optional(),
    percentThreshold: z.number().min(0.1).max(100).optional(),
    quietHoursStart: z.number().min(0).max(23).nullable().optional(),
    quietHoursEnd: z.number().min(0).max(23).nullable().optional(),
  }),
});

// ─── Router ─────────────────────────────────────────────────────────────────

export const notificationRouter = router({
  /**
   * Register a device for push notifications
   */
  registerDevice: publicProcedure
    .input(registerDeviceSchema)
    .mutation(({ input }) => {
      const device = registerDevice(input.deviceId, input.pushToken, input.platform);

      // Auto-start the price alert service when first device registers
      if (!isServiceRunning()) {
        startPriceAlertService();
      }

      return {
        success: true as const,
        data: {
          deviceId: device.deviceId,
          platform: device.platform,
          alertCount: device.alerts.length,
          preferences: device.preferences,
        },
      };
    }),

  /**
   * Unregister a device
   */
  unregisterDevice: publicProcedure
    .input(z.object({ deviceId: z.string().min(1) }))
    .mutation(({ input }) => {
      const deleted = unregisterDevice(input.deviceId);
      return { success: deleted };
    }),

  /**
   * Add a price alert
   */
  addAlert: publicProcedure
    .input(addAlertSchema)
    .mutation(({ input }) => {
      const alert = addAlert(input.deviceId, {
        stockId: input.stockId,
        stockName: input.stockName,
        type: input.type,
        threshold: input.threshold,
        enabled: input.enabled,
      });

      if (!alert) {
        return {
          success: false as const,
          error: "Failed to add alert. Device not registered or max alerts reached.",
        };
      }

      return { success: true as const, data: alert };
    }),

  /**
   * Remove a price alert
   */
  removeAlert: publicProcedure
    .input(removeAlertSchema)
    .mutation(({ input }) => {
      const removed = removeAlert(input.deviceId, input.alertId);
      return { success: removed };
    }),

  /**
   * Toggle a price alert on/off
   */
  toggleAlert: publicProcedure
    .input(toggleAlertSchema)
    .mutation(({ input }) => {
      const toggled = toggleAlert(input.deviceId, input.alertId);
      return { success: toggled };
    }),

  /**
   * Get all alerts (optionally filtered by stock)
   */
  getAlerts: publicProcedure
    .input(getAlertsSchema)
    .query(({ input }) => {
      const alerts = input.stockId
        ? getAlertsForStock(input.deviceId, input.stockId)
        : getAlerts(input.deviceId);

      return { success: true as const, data: alerts };
    }),

  /**
   * Update notification preferences
   */
  updatePreferences: publicProcedure
    .input(updatePreferencesSchema)
    .mutation(({ input }) => {
      const prefs = updatePreferences(input.deviceId, input.preferences);

      if (!prefs) {
        return {
          success: false as const,
          error: "Device not registered.",
        };
      }

      return { success: true as const, data: prefs };
    }),

  /**
   * Get notification preferences
   */
  getPreferences: publicProcedure
    .input(z.object({ deviceId: z.string().min(1) }))
    .query(({ input }) => {
      const prefs = getPreferences(input.deviceId);
      return {
        success: prefs !== null,
        data: prefs,
      };
    }),

  /**
   * Get service stats (for debugging/admin)
   */
  getStats: publicProcedure.query(() => {
    return { success: true as const, data: getServiceStats() };
  }),
});
