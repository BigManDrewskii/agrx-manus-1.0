/**
 * AmountInput — Large hero amount input with MAX button
 *
 * Full-width input field with € sign and MAX pill button.
 * Border color changes based on validation state (error/active/default).
 *
 * Usage:
 *   <AmountInput
 *     value={amountText}
 *     onChange={setAmountText}
 *     validationError={error}
 *     isBuy={true}
 *     onMax={() => setAmountText(maxAmount)}
 *   />
 */
import React, { useRef, forwardRef } from "react";
import { View, TextInput, StyleSheet, Platform, type TextInputProps } from "react-native";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useColors } from "@/hooks/use-colors";
import { MonoLargeTitle, Caption1 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

interface AmountInputProps {
  value: string;
  onChange: (text: string) => void;
  validationError?: string | null;
  isBuy: boolean;
  onMax: () => void;
}

export const AmountInput = forwardRef<TextInput, AmountInputProps>(
  ({ value, onChange, validationError, isBuy, onMax }, ref) => {
    const colors = useColors();

    const borderColor = value
      ? (validationError ? colors.error : (isBuy ? colors.success : colors.error))
      : colors.border;

    return (
      <AnimatedPressable
        variant="card"
        onPress={() => (ref as any)?.current?.focus()}
        style={[
          styles.container,
          { borderColor },
        ]}
      >
        <View style={styles.inner}>
          <MonoLargeTitle
            color={value ? (validationError ? "error" : "foreground") : "muted"}
            style={styles.eurSign}
          >
            €
          </MonoLargeTitle>
          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: validationError ? colors.error : colors.foreground,
                fontFamily: FontFamily.monoBold,
              },
            ]}
            value={value}
            onChangeText={onChange}
            placeholder="0.00"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            returnKeyType="done"
            maxLength={9}
            autoFocus={false}
          />
        </View>

        {/* MAX pill */}
        <AnimatedPressable
          variant="chip"
          onPress={onMax}
          style={[
            styles.maxButton,
            { backgroundColor: colors.primaryAlpha ?? colors.primary + "20" },
          ]}
        >
          <Caption1 color="primary" style={{ fontFamily: FontFamily.bold, fontSize: 11 }}>
            MAX
          </Caption1>
        </AnimatedPressable>
      </AnimatedPressable>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inner: {
    flexDirection: "row",
    alignItems: "baseline",
    flex: 1,
  },
  eurSign: {
    fontSize: 32,
    lineHeight: 40,
  },
  input: {
    fontSize: 32,
    lineHeight: 40,
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 4,
    ...Platform.select({
      web: { outlineStyle: "none" as any },
    }),
  },
  maxButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
});
