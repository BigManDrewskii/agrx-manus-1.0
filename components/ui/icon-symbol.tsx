// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Human-readable labels for icons (for accessibility)
 */
const ICON_LABELS: Partial<Record<IconSymbolName, string>> = {
  "house.fill": "Home",
  "chart.line.uptrend.xyaxis": "Trending up",
  "plus.circle.fill": "Add",
  "briefcase.fill": "Portfolio",
  "person.2.fill": "People",
  "paperplane.fill": "Send",
  "chevron.left.forwardslash.chevron.right": "Code",
  "chevron.right": "Chevron right",
  "magnifyingglass": "Search",
  "bell.fill": "Notifications",
  "bell.badge.fill": "Notifications with badge",
  "gearshape.fill": "Settings",
  "star.fill": "Star",
  "flame.fill": "Flame",
  "trophy.fill": "Trophy",
  "square.and.arrow.up": "Share",
  "arrow.up.right": "External link",
  "arrow.down.right": "Arrow down right",
  "xmark": "Close",
  "xmark.circle.fill": "Cancel",
  "checkmark": "Checkmark",
  "info.circle": "Info",
  "exclamationmark.triangle": "Warning",
  "trash": "Delete",
  "clock": "Clock",
  "newspaper": "News",
  "chart.bar.fill": "Bar chart",
  "person.fill": "Person",
  "bolt.fill": "Bolt",
  "arrow.up": "Arrow up",
  "arrow.down": "Arrow down",
  "percent": "Percent",
  "line.3.horizontal.decrease": "Filter",
  "arrow.up.arrow.down": "Swap",
};

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "chart.line.uptrend.xyaxis": "trending-up",
  "plus.circle.fill": "add-circle",
  "briefcase.fill": "account-balance-wallet",
  "person.2.fill": "people",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "magnifyingglass": "search",
  "bell.fill": "notifications",
  "bell.badge.fill": "notifications-active",
  "gearshape.fill": "settings",
  "star.fill": "star",
  "flame.fill": "local-fire-department",
  "trophy.fill": "emoji-events",
  "square.and.arrow.up": "share",
  "arrow.up.right": "call-made",
  "arrow.down.right": "call-received",
  "xmark": "close",
  "xmark.circle.fill": "cancel",
  "checkmark": "check",
  "info.circle": "info",
  "exclamationmark.triangle": "warning",
  "trash": "delete",
  "clock": "schedule",
  "newspaper": "article",
  "chart.bar.fill": "bar-chart",
  "person.fill": "person",
  "bolt.fill": "bolt",
  "arrow.up": "arrow-upward",
  "arrow.down": "arrow-downward",
  "percent": "percent",
  "line.3.horizontal.decrease": "filter-list",
  "arrow.up.arrow.down": "swap-vert",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const label = ICON_LABELS[name] || name.replace(/\./g, " ");
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
      accessible={true}
      accessibilityLabel={label}
      accessibilityRole="image"
      accessibilityElementsHidden={false}
    />
  );
}
