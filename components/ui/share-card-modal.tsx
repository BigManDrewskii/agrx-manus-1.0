/**
 * Share Card Modal — Full-screen overlay with the P&L share card preview,
 * time frame selector, and share/close buttons.
 *
 * This modal renders the ShareCard component inside a ViewShot-compatible
 * container, lets the user pick a time frame, then captures and shares.
 */

import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Modal,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  ShareCard,
  type ShareCardData,
  type ShareTimeFrame,
} from "@/components/ui/share-card";
import { captureAndShare } from "@/lib/share-service";
import { FontFamily } from "@/constants/typography";
import {
  Title3,
  Callout,
  Caption1,
  Subhead,
} from "@/components/ui/typography";
import * as Haptics from "expo-haptics";

const TIME_FRAMES: ShareTimeFrame[] = ["Today", "This Week", "This Month", "All Time"];

interface ShareCardModalProps {
  visible: boolean;
  onClose: () => void;
  data: ShareCardData;
  /** Called when time frame changes (parent can update P&L data) */
  onTimeFrameChange?: (timeFrame: ShareTimeFrame) => void;
}

export function ShareCardModal({
  visible,
  onClose,
  data,
  onTimeFrameChange,
}: ShareCardModalProps) {
  const colors = useColors();
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<ShareTimeFrame>(data.timeFrame);

  const handleTimeFrameChange = useCallback(
    (tf: ShareTimeFrame) => {
      setSelectedTimeFrame(tf);
      onTimeFrameChange?.(tf);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [onTimeFrameChange]
  );

  const handleShare = useCallback(async () => {
    setIsSharing(true);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const message = `Check out my ${data.ticker} gains on AGRX!`;
    await captureAndShare(cardRef, message);
    setIsSharing(false);
  }, [data.ticker]);

  const cardData: ShareCardData = {
    ...data,
    timeFrame: selectedTimeFrame,
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.85)" }]}>
        {/* Close button */}
        <View style={styles.header}>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: colors.surface },
              pressed && { opacity: 0.6 },
            ]}
            accessibilityLabel="Close modal"
            accessibilityRole="button"
          >
            <IconSymbol name="xmark" size={20} color={colors.foreground} />
          </Pressable>
          <Title3 style={{ color: "#FFFFFF" }}>Share Your Gains</Title3>
          <View style={{ width: 40 }} />
        </View>

        {/* Card Preview */}
        <View style={styles.cardWrapper}>
          <ShareCard ref={cardRef} data={cardData} />
        </View>

        {/* Time Frame Selector */}
        <View style={styles.timeFrameRow} accessibilityRole="radiogroup">
          {TIME_FRAMES.map((tf) => {
            const isActive = tf === selectedTimeFrame;
            return (
              <Pressable
                key={tf}
                onPress={() => handleTimeFrameChange(tf)}
                style={({ pressed }) => [
                  styles.timeFrameButton,
                  {
                    backgroundColor: isActive
                      ? "rgba(87,139,250,0.20)"
                      : "rgba(255,255,255,0.06)",
                  },
                  pressed && { opacity: 0.6 },
                ]}
                accessibilityLabel={tf}
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive }}
              >
                <Caption1
                  style={{
                    fontFamily: isActive ? FontFamily.bold : FontFamily.medium,
                    color: isActive ? "#578BFA" : "#89909E",
                    fontSize: 11,
                  }}
                >
                  {tf}
                </Caption1>
                {isActive && (
                  <IconSymbol
                    name="checkmark"
                    size={10}
                    color="#578BFA"
                    style={{ position: "absolute", top: 4, right: 4 }}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Share Button */}
        <View style={styles.bottomActions}>
          <Pressable
            onPress={handleShare}
            disabled={isSharing}
            style={({ pressed }) => [
              styles.shareButton,
              { backgroundColor: colors.primary },
              pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
              isSharing && { opacity: 0.6 },
            ]}
            accessibilityLabel="Share card"
            accessibilityRole="button"
            accessibilityState={{ disabled: isSharing }}
          >
            {isSharing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <IconSymbol name="square.and.arrow.up" size={20} color="#FFFFFF" />
                <Callout
                  style={{
                    fontFamily: FontFamily.bold,
                    color: "#FFFFFF",
                    marginLeft: 8,
                  }}
                >
                  Share
                </Callout>
              </>
            )}
          </Pressable>

          <Subhead
            style={{
              color: "#5B616E",
              textAlign: "center",
              marginTop: 12,
              fontFamily: FontFamily.medium,
            }}
          >
            Optimized for Instagram Stories & TikTok
          </Subhead>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingTop: 60,
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardWrapper: {
    alignItems: "center",
    // Slight shadow for the card preview
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  timeFrameRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
    marginBottom: 24,
  },
  timeFrameButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bottomActions: {
    width: "100%",
    paddingHorizontal: 16,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 16,
  },
});
