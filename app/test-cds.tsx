import { View, ScrollView, StyleSheet, Text as RNText } from "react-native";
import { useState } from "react";
import { Stack } from "expo-router";
import { CDSButton } from "@/components/ui/cds-button";
import { CDSChip } from "@/components/ui/cds-chip";
import { CDSSparkline } from "@/components/ui/cds-sparkline";
import { CDSLineChart } from "@/components/ui/cds-line-chart";
import { CDSBarChart } from "@/components/ui/cds-bar-chart";
import { CDSSegmentedTabs } from "@/components/ui/cds-segmented-tabs";
import { CDSNumpad } from "@/components/ui/cds-numpad";
import { CDSStepper } from "@/components/ui/cds-stepper";
import { useColors } from "@/hooks/use-colors";

export default function TestCDSScreen() {
  const colors = useColors();
  const [buySellIndex, setBuySellIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [numpadValue, setNumpadValue] = useState("0");

  const handleNumpadKeyPress = (key: string) => {
    if (key === ".") {
      if (!numpadValue.includes(".")) {
        setNumpadValue(numpadValue + ".");
      }
    } else {
      setNumpadValue(numpadValue + key);
    }
  };

  const handleNumpadDelete = () => {
    setNumpadValue(numpadValue.slice(0, -1) || "0");
  };

  return (
    <>
      <Stack.Screen options={{ title: "CDS Test Screen" }} />

      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.section}>
          <RNText style={[styles.title, { color: colors.foreground }]}>
            Coinbase Design System
          </RNText>
          <RNText style={[styles.subtitle, { color: colors.muted }]}>
            Testing @coinbase/cds-mobile integration
          </RNText>
        </View>

        {/* Buttons Section */}
        <View style={styles.section}>
          <RNText style={[styles.sectionTitle, { color: colors.foreground }]}>
            CDS Buttons (with AGRX haptics)
          </RNText>
          <CDSButton variant="primary" onPress={() => {}}>
            Primary Button
          </CDSButton>
          <CDSButton variant="secondary" onPress={() => {}}>
            Secondary Button
          </CDSButton>
          <CDSButton variant="tertiary" onPress={() => {}} disabled>
            Disabled Button
          </CDSButton>
        </View>

        {/* Chips Section */}
        <View style={styles.section}>
          <RNText style={[styles.sectionTitle, { color: colors.foreground }]}>
            CDS Chips (with AGRX haptics)
          </RNText>
          <View style={styles.chipRow}>
            <CDSChip label="Unselected" selected={false} />
            <CDSChip label="Selected" selected />
            <CDSChip label="With Count" count={42} selected={false} />
          </View>
        </View>

        {/* Sparklines Section */}
        <View style={styles.section}>
          <RNText style={[styles.sectionTitle, { color: colors.foreground }]}>
            CDS Sparklines (Area Charts)
          </RNText>
          <View style={styles.chartRow}>
            <View style={styles.chartContainer}>
              <RNText style={styles.chartLabel}>Positive (Green)</RNText>
              <CDSSparkline
                data={[10, 12, 11, 14, 13, 16, 15, 18]}
                width={120}
                height={60}
                positive={true}
                showGradient={true}
                smooth={true}
              />
            </View>
            <View style={styles.chartContainer}>
              <RNText style={styles.chartLabel}>Negative (Red)</RNText>
              <CDSSparkline
                data={[18, 16, 17, 14, 15, 12, 13, 10]}
                width={120}
                height={60}
                positive={false}
                showGradient={true}
                smooth={true}
              />
            </View>
          </View>
        </View>

        {/* Line Chart Section */}
        <View style={styles.section}>
          <RNText style={[styles.sectionTitle, { color: colors.foreground }]}>
            CDS Line Chart
          </RNText>
          <CDSLineChart
            data={[10, 12, 11, 14, 13, 16, 15, 18, 17, 20, 19, 22]}
            width={320}
            height={180}
            positive={true}
            showGradient={true}
            smooth={true}
            showDots={true}
            showGrid={false}
          />
        </View>

        {/* Bar Chart Section */}
        <View style={styles.section}>
          <RNText style={[styles.sectionTitle, { color: colors.foreground }]}>
            CDS Bar Chart
          </RNText>
          <CDSBarChart
            data={[100, 150, 80, 200, 120, 180, 90, 160]}
            width={320}
            height={180}
            color="primary"
            showGradient={true}
          />
          <View style={styles.chartRow}>
            <View style={styles.chartContainer}>
              <RNText style={styles.chartLabel}>Volume</RNText>
              <CDSBarChart
                data={[100, 150, 80, 200, 120]}
                width={150}
                height={100}
                color="success"
              />
            </View>
            <View style={styles.chartContainer}>
              <RNText style={styles.chartLabel}>Portfolio</RNText>
              <CDSBarChart
                data={[200, 120, 180, 90, 160]}
                width={150}
                height={100}
                color="gold"
              />
            </View>
          </View>
        </View>

        {/* Trading Components Section */}
        <View style={styles.section}>
          <RNText style={[styles.sectionTitle, { color: colors.foreground }]}>
            CDS Trading Components
          </RNText>

          {/* Segmented Tabs */}
          <RNText style={[styles.chartLabel, { marginBottom: 8 }]}>Buy/Sell Toggle</RNText>
          <CDSSegmentedTabs
            options={["Buy", "Sell"]}
            selected={buySellIndex}
            onChange={setBuySellIndex}
            colorType={buySellIndex === 0 ? "success" : "error"}
          />

          {/* Stepper */}
          <RNText style={[styles.chartLabel, { marginBottom: 8, marginTop: 16 }]}>
            Quantity Stepper
          </RNText>
          <CDSStepper
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={100}
            step={1}
            size="lg"
          />
          <RNText style={[styles.chartLabel, { marginTop: 8, textAlign: "center" }]}>
            Quantity: {quantity}
          </RNText>
        </View>

        {/* Numpad Section */}
        <View style={styles.section}>
          <RNText style={[styles.sectionTitle, { color: colors.foreground }]}>
            CDS Numpad
          </RNText>
          <RNText style={[styles.chartLabel, { marginBottom: 8 }]}>
            Amount: €{numpadValue}
          </RNText>
          <CDSNumpad
            onKeyPress={handleNumpadKeyPress}
            onDelete={handleNumpadDelete}
          />
        </View>

        {/* Colors Section */}
        <View style={styles.section}>
          <RNText style={[styles.sectionTitle, { color: colors.foreground }]}>
            AGRX Brand Colors (Preserved)
          </RNText>
          <View style={[styles.colorBox, { backgroundColor: colors.success }]}>
            <RNText style={styles.colorText}>
              Success: {colors.success}
            </RNText>
          </View>
          <View style={[styles.colorBox, { backgroundColor: colors.error }]}>
            <RNText style={styles.colorText}>
              Error: {colors.error}
            </RNText>
          </View>
          <View style={[styles.colorBox, { backgroundColor: colors.gold }]}>
            <RNText style={styles.colorText}>
              Gold: {colors.gold}
            </RNText>
          </View>
        </View>

        {/* CDS Colors Section */}
        <View style={styles.section}>
          <RNText style={[styles.sectionTitle, { color: colors.foreground }]}>
            CDS Semantic Colors
          </RNText>
          <View style={[styles.colorBox, { backgroundColor: colors.primary }]}>
            <RNText style={styles.colorText}>
              Primary: {colors.primary}
            </RNText>
          </View>
          <View style={[styles.colorBox, { backgroundColor: colors.muted }]}>
            <RNText style={styles.colorText}>
              Muted: {colors.muted}
            </RNText>
          </View>
          <View style={[styles.colorBox, { backgroundColor: colors.border }]}>
            <RNText style={styles.colorText}>
              Border: {colors.border}
            </RNText>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chartRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chartContainer: {
    alignItems: "center",
    gap: 8,
  },
  chartLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  colorBox: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
    minHeight: 60,
    justifyContent: "center",
  },
  colorText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
});
