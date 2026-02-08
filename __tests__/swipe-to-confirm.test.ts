import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");

function readFile(filePath: string): string {
  return fs.readFileSync(path.join(ROOT, filePath), "utf-8");
}

describe("SwipeToConfirm Component", () => {
  const component = readFile("components/ui/swipe-to-confirm.tsx");

  describe("Core Structure", () => {
    it("should export SwipeToConfirm as a named export", () => {
      expect(component).toMatch(/export function SwipeToConfirm/);
    });

    it("should accept required props: label, onConfirm", () => {
      expect(component).toMatch(/label:\s*string/);
      expect(component).toMatch(/onConfirm:\s*\(\)\s*=>\s*void/);
    });

    it("should accept optional props: enabled, variant, disabledLabel", () => {
      expect(component).toMatch(/enabled\?:\s*boolean/);
      expect(component).toMatch(/variant\?:\s*["']buy["']\s*\|\s*["']sell["']/);
      expect(component).toMatch(/disabledLabel\?:\s*string/);
    });

    it("should default enabled to true", () => {
      expect(component).toMatch(/enabled\s*=\s*true/);
    });

    it("should default variant to 'buy'", () => {
      expect(component).toMatch(/variant\s*=\s*["']buy["']/);
    });
  });

  describe("Gesture Handler Integration", () => {
    it("should import Gesture and GestureDetector from react-native-gesture-handler", () => {
      expect(component).toMatch(/import\s*\{.*Gesture.*GestureDetector.*\}\s*from\s*["']react-native-gesture-handler["']/);
    });

    it("should use Gesture.Pan() for the swipe gesture", () => {
      expect(component).toMatch(/Gesture\.Pan\(\)/);
    });

    it("should wrap the thumb in a GestureDetector", () => {
      expect(component).toMatch(/<GestureDetector\s+gesture=\{panGesture\}/);
    });

    it("should enable/disable the gesture based on enabled prop", () => {
      expect(component).toMatch(/\.enabled\(enabled\)/);
    });

    it("should handle onBegin event", () => {
      expect(component).toMatch(/\.onBegin\(/);
    });

    it("should handle onChange event for tracking drag position", () => {
      expect(component).toMatch(/\.onChange\(/);
    });

    it("should handle onEnd event for completion/reset logic", () => {
      expect(component).toMatch(/\.onEnd\(/);
    });

    it("should handle onFinalize event for cleanup", () => {
      expect(component).toMatch(/\.onFinalize\(/);
    });
  });

  describe("Reanimated Animations", () => {
    it("should import reanimated hooks and functions", () => {
      expect(component).toMatch(/useSharedValue/);
      expect(component).toMatch(/useAnimatedStyle/);
      expect(component).toMatch(/withTiming/);
      expect(component).toMatch(/withSpring/);
    });

    it("should use shared values for translateX, trackWidth, and completion state", () => {
      expect(component).toMatch(/useSharedValue.*0/);
      expect(component).toMatch(/translateX/);
      expect(component).toMatch(/trackWidth/);
      expect(component).toMatch(/isCompleted/);
    });

    it("should clamp translateX within valid range", () => {
      expect(component).toMatch(/clamp\(.*translationX.*0.*maxX/);
    });

    it("should have animated thumb style with translateX and scale", () => {
      expect(component).toMatch(/thumbStyle.*=.*useAnimatedStyle/);
      expect(component).toMatch(/translateX:\s*translateX\.value/);
      expect(component).toMatch(/scale:\s*thumbScale\.value/);
    });

    it("should have animated fill style that tracks thumb position", () => {
      expect(component).toMatch(/fillStyle.*=.*useAnimatedStyle/);
      expect(component).toMatch(/width:\s*translateX\.value/);
    });

    it("should fade label as thumb moves", () => {
      expect(component).toMatch(/labelStyle.*=.*useAnimatedStyle/);
      expect(component).toMatch(/opacity.*interpolate/);
    });

    it("should spring back to start when not completed", () => {
      expect(component).toMatch(/withSpring\(0/);
    });

    it("should snap to end when completed", () => {
      expect(component).toMatch(/withTiming\(maxX/);
    });
  });

  describe("Completion Logic", () => {
    it("should have a completion threshold (85%)", () => {
      expect(component).toMatch(/COMPLETION_THRESHOLD\s*=\s*0\.85/);
    });

    it("should call onConfirm via runOnJS when threshold is reached", () => {
      expect(component).toMatch(/runOnJS\(handleConfirm\)/);
    });

    it("should set isCompleted to true on successful swipe", () => {
      expect(component).toMatch(/isCompleted\.value\s*=\s*true/);
    });

    it("should reset translateX when enabled/label changes", () => {
      expect(component).toMatch(/useEffect\(/);
      expect(component).toMatch(/translateX\.value\s*=\s*withTiming\(0/);
    });
  });

  describe("Haptic Feedback", () => {
    it("should import expo-haptics", () => {
      expect(component).toMatch(/import\s*\*\s*as\s*Haptics\s*from\s*["']expo-haptics["']/);
    });

    it("should have milestone haptic feedback points", () => {
      expect(component).toMatch(/HAPTIC_MILESTONES/);
      expect(component).toMatch(/0\.25.*0\.5.*0\.75/);
    });

    it("should trigger light haptic on gesture begin", () => {
      expect(component).toMatch(/triggerLightHaptic/);
      expect(component).toMatch(/ImpactFeedbackStyle\.Light/);
    });

    it("should trigger medium haptic on spring back", () => {
      expect(component).toMatch(/triggerMediumHaptic/);
      expect(component).toMatch(/ImpactFeedbackStyle\.Medium/);
    });

    it("should trigger success haptic on completion", () => {
      expect(component).toMatch(/triggerSuccessHaptic/);
      expect(component).toMatch(/NotificationFeedbackType\.Success/);
    });

    it("should skip haptics on web platform", () => {
      expect(component).toMatch(/Platform\.OS\s*!==\s*["']web["']/);
    });
  });

  describe("Visual Design", () => {
    it("should have a track with rounded corners", () => {
      expect(component).toMatch(/TRACK_HEIGHT/);
      expect(component).toMatch(/borderRadius:\s*TRACK_HEIGHT\s*\/\s*2/);
    });

    it("should have a circular thumb", () => {
      expect(component).toMatch(/THUMB_SIZE/);
      expect(component).toMatch(/borderRadius:\s*THUMB_SIZE\s*\/\s*2/);
    });

    it("should use success color for buy variant", () => {
      expect(component).toMatch(/variant\s*===\s*["']buy["']\s*\?\s*colors\.success/);
    });

    it("should use error color for sell variant", () => {
      expect(component).toMatch(/colors\.error/);
    });

    it("should have a progress fill behind the thumb", () => {
      expect(component).toMatch(/fill/);
      expect(component).toMatch(/position:\s*["']absolute["']/);
    });

    it("should show chevron hints on the track", () => {
      expect(component).toMatch(/chevron\.right/);
      expect(component).toMatch(/chevronContainer/);
    });

    it("should show a checkmark on completion", () => {
      expect(component).toMatch(/checkmark/);
      expect(component).toMatch(/completionCheck|checkmarkStyle/);
    });

    it("should have shadow on the thumb for elevation", () => {
      expect(component).toMatch(/shadowColor/);
      expect(component).toMatch(/shadowOffset/);
      expect(component).toMatch(/elevation/);
    });

    it("should use semibold font for the label", () => {
      expect(component).toMatch(/FontFamily\.semibold/);
    });
  });

  describe("Disabled State", () => {
    it("should render a different UI when disabled", () => {
      expect(component).toMatch(/if\s*\(!enabled\)/);
    });

    it("should show disabledLabel text when disabled", () => {
      expect(component).toMatch(/disabledLabel/);
    });

    it("should use surfaceSecondary background when disabled", () => {
      expect(component).toMatch(/colors\.surfaceSecondary/);
    });
  });

  describe("Layout", () => {
    it("should measure track width on layout", () => {
      expect(component).toMatch(/onLayout=\{onTrackLayout\}/);
      expect(component).toMatch(/trackWidth\.value\s*=\s*event\.nativeEvent\.layout\.width/);
    });

    it("should have proper container padding", () => {
      expect(component).toMatch(/paddingHorizontal:\s*16/);
      expect(component).toMatch(/paddingBottom:\s*24/);
    });
  });
});

describe("Trade Screen — SwipeToConfirm Integration", () => {
  const trade = readFile("app/(tabs)/trade.tsx");

  it("should import SwipeToConfirm component", () => {
    expect(trade).toMatch(/import\s*\{.*SwipeToConfirm.*\}\s*from\s*["']@\/components\/ui\/swipe-to-confirm["']/);
  });

  it("should render SwipeToConfirm instead of a Pressable confirm button", () => {
    expect(trade).toMatch(/<SwipeToConfirm/);
    // Should NOT have the old confirmButton style
    expect(trade).not.toMatch(/styles\.confirmButton/);
    expect(trade).not.toMatch(/styles\.confirmContainer/);
  });

  it("should pass label with trade action and amount", () => {
    expect(trade).toMatch(/label=\{isValidAmount/);
    expect(trade).toMatch(/Slide to.*Buy.*Sell/);
  });

  it("should pass enabled based on isValidAmount", () => {
    expect(trade).toMatch(/enabled=\{isValidAmount\}/);
  });

  it("should pass handleConfirm as onConfirm", () => {
    expect(trade).toMatch(/onConfirm=\{handleConfirm\}/);
  });

  it("should pass variant based on isBuy state", () => {
    expect(trade).toMatch(/variant=\{isBuy\s*\?\s*["']buy["']\s*:\s*["']sell["']\}/);
  });

  it("should pass disabledLabel for empty/invalid states", () => {
    expect(trade).toMatch(/disabledLabel=\{/);
    expect(trade).toMatch(/Fix amount to continue/);
    expect(trade).toMatch(/Enter an amount/);
  });

  it("should still have the handleConfirm function for trade execution", () => {
    expect(trade).toMatch(/const handleConfirm\s*=\s*useCallback/);
    expect(trade).toMatch(/executeTrade\(/);
  });

  it("should not have old confirm button styles in StyleSheet", () => {
    expect(trade).not.toMatch(/confirmContainer:\s*\{/);
    expect(trade).not.toMatch(/confirmButton:\s*\{/);
  });
});
