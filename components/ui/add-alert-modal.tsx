/**
 * Add Price Alert Modal
 *
 * Bottom sheet-style modal for creating a new price alert.
 * Shows current price, allows selecting alert type and threshold.
 */
import React, { useState, useCallback } from "react";
import {
  View,
  Modal,
  StyleSheet,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useColors } from "@/hooks/use-colors";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useNotifications } from "@/lib/notification-context";
import {
  Title3,
  Body,
  Subhead,
  Footnote,
  Caption1,
} from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
import type { AlertType } from "@/server/priceAlertService";

// ─── Types ──────────────────────────────────────────────────────────────────

interface AddAlertModalProps {
  visible: boolean;
  onClose: () => void;
  stockId: string;
  stockName: string;
  currentPrice: number;
}

const ALERT_TYPES: { type: AlertType; label: string; icon: string; description: string }[] = [
  {
    type: "above",
    label: "Price Above",
    icon: "📈",
    description: "Alert when price rises above target",
  },
  {
    type: "below",
    label: "Price Below",
    icon: "📉",
    description: "Alert when price drops below target",
  },
  {
    type: "percent_change",
    label: "% Change",
    icon: "🔔",
    description: "Alert on significant price movement",
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

export function AddAlertModal({
  visible,
  onClose,
  stockId,
  stockName,
  currentPrice,
}: AddAlertModalProps) {
  const colors = useColors();
  const { addPriceAlert, hasPermission, requestPermission } = useNotifications();

  const [selectedType, setSelectedType] = useState<AlertType>("above");
  const [threshold, setThreshold] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = useCallback(async () => {
    const value = parseFloat(threshold);
    if (isNaN(value) || value <= 0) return;

    // Request permission if not granted
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    setLoading(true);
    try {
      const alert = await addPriceAlert({
        stockId,
        stockName,
        type: selectedType,
        threshold: value,
      });

      if (alert) {
        onClose();
        setThreshold("");
        setSelectedType("above");
      }
    } finally {
      setLoading(false);
    }
  }, [
    threshold,
    selectedType,
    stockId,
    stockName,
    hasPermission,
    requestPermission,
    addPriceAlert,
    onClose,
  ]);

  const getPlaceholder = (): string => {
    switch (selectedType) {
      case "above":
        return `e.g. ${(currentPrice * 1.1).toFixed(2)}`;
      case "below":
        return `e.g. ${(currentPrice * 0.9).toFixed(2)}`;
      case "percent_change":
        return "e.g. 5.0";
      default:
        return "0.00";
    }
  };

  const getUnit = (): string => {
    return selectedType === "percent_change" ? "%" : "€";
  };

  const isValid = (): boolean => {
    const value = parseFloat(threshold);
    return !isNaN(value) && value > 0;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <AnimatedPressable variant="card" style={styles.backdrop} onPress={onClose} haptic={false} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View
              style={[styles.handle, { backgroundColor: colors.muted + "40" }]}
            />
          </View>

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Title3 style={{ fontFamily: FontFamily.bold }}>
              Set Price Alert
            </Title3>
            <Caption1 color="muted">
              {stockName} · Current: €{currentPrice.toFixed(2)}
            </Caption1>
          </View>

          {/* Alert Type Selector */}
          <View style={styles.typeSelector}>
            {ALERT_TYPES.map((opt) => {
              const isSelected = selectedType === opt.type;
              return (
                <AnimatedPressable
                  key={opt.type}
                  variant="chip"
                  onPress={() => setSelectedType(opt.type)}
                  style={[
                    styles.typeOption,
                    {
                      backgroundColor: isSelected
                        ? colors.primary + "15"
                        : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: isSelected ? 1.5 : StyleSheet.hairlineWidth,
                    },
                  ]}
                >
                  <Body style={{ fontSize: 20 }}>{opt.icon}</Body>
                  <Subhead
                    style={{
                      fontFamily: isSelected
                        ? FontFamily.semibold
                        : FontFamily.regular,
                      color: isSelected ? colors.primary : colors.foreground,
                    }}
                  >
                    {opt.label}
                  </Subhead>
                  <Caption1 color="muted" style={{ textAlign: "center" }}>
                    {opt.description}
                  </Caption1>
                </AnimatedPressable>
              );
            })}
          </View>

          {/* Threshold Input */}
          <View style={styles.inputSection}>
            <Footnote
              color="muted"
              style={{
                fontFamily: FontFamily.semibold,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                marginBottom: 8,
              }}
            >
              {selectedType === "percent_change"
                ? "Percentage Threshold"
                : "Target Price"}
            </Footnote>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Body
                style={{
                  fontFamily: FontFamily.semibold,
                  color: colors.primary,
                  marginRight: 4,
                }}
              >
                {getUnit()}
              </Body>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.foreground,
                    fontFamily: FontFamily.semibold,
                  },
                ]}
                value={threshold}
                onChangeText={setThreshold}
                placeholder={getPlaceholder()}
                placeholderTextColor={colors.muted}
                keyboardType="decimal-pad"
                returnKeyType="done"
                autoFocus
              />
            </View>
          </View>

          {/* Save Button */}
          <AnimatedPressable
            variant="button"
            onPress={handleSave}
            disabled={!isValid() || loading}
            style={[
              styles.saveButton,
              {
                backgroundColor:
                  isValid() && !loading ? colors.primary : colors.muted + "30",
              },
            ]}
          >
            <Body
              style={{
                color: isValid() && !loading ? "#FFFFFF" : colors.muted,
                fontFamily: FontFamily.semibold,
                textAlign: "center",
              }}
            >
              {loading ? "Saving..." : "Set Alert"}
            </Body>
          </AnimatedPressable>

          {/* Bottom padding for safe area */}
          <View style={{ height: 20 }} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  sheetHeader: {
    paddingVertical: 12,
    gap: 4,
  },
  typeSelector: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 12,
  },
  typeOption: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    gap: 6,
  },
  inputSection: {
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    fontSize: 18,
    padding: 0,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
});
