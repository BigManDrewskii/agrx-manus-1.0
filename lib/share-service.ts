/**
 * Share Service — Captures the P&L Share Card as an image and opens the native share sheet.
 *
 * Uses react-native-view-shot for image capture and expo-sharing for the native share sheet.
 * On web, falls back to the Web Share API or downloads the image.
 */

import { Platform, Alert } from "react-native";
import type { RefObject } from "react";
import type { View } from "react-native";

// ─── Capture the card as an image ───────────────────────────────────────────

/**
 * Captures a React Native View as a PNG image using react-native-view-shot.
 * Returns the local file URI of the captured image.
 */
export async function captureShareCard(viewRef: RefObject<View | null>): Promise<string | null> {
  try {
    if (!viewRef.current) {
      console.warn("[ShareService] View ref is null");
      return null;
    }

    // react-native-view-shot exports captureRef as a named export
    // and also as a static on the default ViewShot class
    const ViewShotModule = await import("react-native-view-shot");
    // The named export `captureRef` is the function we need
    const captureRef =
      (ViewShotModule as any).captureRef ??
      (ViewShotModule as any).default?.captureRef;

    if (!captureRef) {
      console.warn("[ShareService] captureRef not available from react-native-view-shot");
      return null;
    }

    const uri: string = await captureRef(viewRef.current, {
      format: "png",
      quality: 1,
      result: "tmpfile",
    });

    return uri;
  } catch (error) {
    console.error("[ShareService] Failed to capture share card:", error);
    return null;
  }
}

// ─── Share the captured image ───────────────────────────────────────────────

/**
 * Opens the native share sheet with the captured image.
 * Falls back to web share API or alert on unsupported platforms.
 */
export async function shareImage(
  imageUri: string,
  message?: string
): Promise<boolean> {
  try {
    if (Platform.OS === "web") {
      return await shareOnWeb(imageUri, message);
    }

    // Native sharing via expo-sharing
    const Sharing = await import("expo-sharing");
    const isAvailable = await Sharing.isAvailableAsync();

    if (!isAvailable) {
      Alert.alert(
        "Sharing not available",
        "Sharing is not available on this device."
      );
      return false;
    }

    await Sharing.shareAsync(imageUri, {
      mimeType: "image/png",
      dialogTitle: message ?? "Share your AGRX gains",
      UTI: "public.png",
    });

    return true;
  } catch (error) {
    console.error("[ShareService] Failed to share image:", error);
    return false;
  }
}

/**
 * Web fallback: uses the Web Share API if available, otherwise downloads the image.
 */
async function shareOnWeb(imageUri: string, message?: string): Promise<boolean> {
  try {
    // Try Web Share API with file support
    if (typeof navigator !== "undefined" && navigator.share) {
      // Convert the URI to a blob for web sharing
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const file = new File([blob], "agrx-gains.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "My AGRX Gains",
          text: message ?? "Check out my gains on AGRX!",
          files: [file],
        });
        return true;
      }

      // Fallback: share without file
      await navigator.share({
        title: "My AGRX Gains",
        text: message ?? "Check out my gains on AGRX!",
      });
      return true;
    }

    // Final fallback: download the image
    if (typeof document !== "undefined") {
      const link = document.createElement("a");
      link.href = imageUri;
      link.download = "agrx-gains.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    return true;
  } catch (error) {
    console.error("[ShareService] Web share failed:", error);
    return false;
  }
}

// ─── Full share flow (capture + share) ──────────────────────────────────────

/**
 * Complete share flow: captures the card view as an image and opens the share sheet.
 * Returns true if sharing was successful.
 */
export async function captureAndShare(
  viewRef: RefObject<View | null>,
  message?: string
): Promise<boolean> {
  const uri = await captureShareCard(viewRef);
  if (!uri) {
    if (Platform.OS !== "web") {
      Alert.alert("Error", "Could not capture the share card. Please try again.");
    }
    return false;
  }
  return shareImage(uri, message);
}
