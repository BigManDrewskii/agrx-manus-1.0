/**
 * OrderPreview — Trade order preview card (Pro mode)
 *
 * Displays estimated shares, price, commission, and balance after trade.
 * Only shown in Pro mode when amount is valid.
 *
 * Usage:
 *   <OrderPreview
 *     amount={100}
 *     price={25.50}
 *     balanceAfter={4500}
 *   />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { Footnote, MonoSubhead } from "@/components/ui/typography";

interface OrderPreviewProps {
  amount: number;
  price: number;
  balanceAfter: number;
}

export function OrderPreview({ amount, price, balanceAfter }: OrderPreviewProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Row label="Est. shares" value={(amount / price).toFixed(4)} />
      <Row label="Price (live)" value={`€${price.toFixed(2)}`} />
      <Row label="Commission" value="€0.00" valueColor="success" />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <Row
        label="Balance after"
        value={`€${balanceAfter.toFixed(2)}`}
        valueColor={balanceAfter >= 0 ? "foreground" : "error"}
      />
    </View>
  );
}

interface RowProps {
  label: string;
  value: string;
  valueColor?: "foreground" | "success" | "error";
}

function Row({ label, value, valueColor = "foreground" }: RowProps) {
  const colors = useColors();
  const color = valueColor === "success" ? colors.success :
                valueColor === "error" ? colors.error :
                colors.foreground;

  return (
    <View style={styles.row}>
      <Footnote color="muted">{label}</Footnote>
      <MonoSubhead
        color={valueColor}
        style={{ fontSize: 13, color }}
      >
        {value}
      </MonoSubhead>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
});
