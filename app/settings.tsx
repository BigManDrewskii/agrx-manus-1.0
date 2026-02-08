import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Switch,
  Platform,
  Linking,
} from "react-native";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext, type ThemePreference } from "@/lib/theme-provider";
import { useDemo } from "@/lib/demo-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  LargeTitle,
  Title3,
  Body,
  Subhead,
  Footnote,
  Caption1,
} from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

// ─── Storage Keys ────────────────────────────────────────────────────────────

const NOTIF_KEYS = {
  priceAlerts: "@agrx/notif-price-alerts",
  dailyChallenge: "@agrx/notif-daily-challenge",
  socialActivity: "@agrx/notif-social-activity",
  marketNews: "@agrx/notif-market-news",
};

// ─── Types ───────────────────────────────────────────────────────────────────

type NotifState = {
  priceAlerts: boolean;
  dailyChallenge: boolean;
  socialActivity: boolean;
  marketNews: boolean;
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { preference, setPreference, isDark } = useThemeContext();
  const { state: demoState, resetDemo } = useDemo();

  const [notifs, setNotifs] = useState<NotifState>({
    priceAlerts: true,
    dailyChallenge: true,
    socialActivity: false,
    marketNews: true,
  });

  // ── Hydrate notification preferences ──
  useEffect(() => {
    (async () => {
      try {
        const entries = await AsyncStorage.multiGet(Object.values(NOTIF_KEYS));
        const hydrated: Partial<NotifState> = {};
        const keyMap = Object.entries(NOTIF_KEYS);
        entries.forEach(([storageKey, value]) => {
          const match = keyMap.find(([, sk]) => sk === storageKey);
          if (match && value !== null) {
            (hydrated as any)[match[0]] = value === "true";
          }
        });
        setNotifs((prev) => ({ ...prev, ...hydrated }));
      } catch {}
    })();
  }, []);

  const toggleNotif = useCallback(
    (key: keyof NotifState) => {
      setNotifs((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        AsyncStorage.setItem(NOTIF_KEYS[key], String(next[key])).catch(() => {});
        return next;
      });
    },
    [],
  );

  // ── Theme options ──
  const themeOptions: { label: string; value: ThemePreference; icon: string }[] = [
    { label: "System", value: "system", icon: "📱" },
    { label: "Light", value: "light", icon: "☀️" },
    { label: "Dark", value: "dark", icon: "🌙" },
  ];

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: colors.surfaceSecondary },
              pressed && { opacity: 0.7 },
            ]}
          >
            <IconSymbol name="chevron.right" size={20} color={colors.foreground} style={{ transform: [{ scaleX: -1 }] }} />
          </Pressable>
          <LargeTitle style={{ letterSpacing: -0.5 }}>Settings</LargeTitle>
        </View>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION: Appearance
            ═══════════════════════════════════════════════════════════════════ */}
        <SectionLabel text="Appearance" />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {themeOptions.map((opt, i) => {
            const isSelected = preference === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setPreference(opt.value)}
                style={({ pressed }) => [
                  styles.row,
                  i < themeOptions.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={styles.rowLeft}>
                  <Body>{opt.icon}</Body>
                  <Subhead style={{ fontFamily: FontFamily.medium, marginLeft: 12 }}>
                    {opt.label}
                  </Subhead>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    {
                      borderColor: isSelected ? colors.primary : colors.muted,
                      borderWidth: isSelected ? 2 : 1.5,
                    },
                  ]}
                >
                  {isSelected && (
                    <View
                      style={[styles.radioInner, { backgroundColor: colors.primary }]}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION: Notifications
            ═══════════════════════════════════════════════════════════════════ */}
        <SectionLabel text="Notifications" />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <NotifRow
            label="Price Alerts"
            description="Get notified when stocks hit your target price"
            value={notifs.priceAlerts}
            onToggle={() => toggleNotif("priceAlerts")}
            colors={colors}
            isLast={false}
          />
          <Pressable
            onPress={() => router.push("/price-alerts" as any)}
            style={({ pressed }) => [
              styles.row,
              {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.rowLeft}>
              <View>
                <Subhead style={{ fontFamily: FontFamily.medium, color: colors.primary }}>Manage Price Alerts</Subhead>
                <Caption1 color="muted" style={{ marginTop: 2 }}>View and edit your active price alerts</Caption1>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.muted} />
          </Pressable>
          <NotifRow
            label="Daily Challenge"
            description="Reminder to complete your daily trading challenge"
            value={notifs.dailyChallenge}
            onToggle={() => toggleNotif("dailyChallenge")}
            colors={colors}
            isLast={false}
          />
          <NotifRow
            label="Social Activity"
            description="When someone copies your trade or mentions you"
            value={notifs.socialActivity}
            onToggle={() => toggleNotif("socialActivity")}
            colors={colors}
            isLast={false}
          />
          <NotifRow
            label="Market News"
            description="Breaking ATHEX news and market-moving events"
            value={notifs.marketNews}
            onToggle={() => toggleNotif("marketNews")}
            colors={colors}
            isLast={true}
          />
        </View>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION: Account
            ═══════════════════════════════════════════════════════════════════ */}
        <SectionLabel text="Account" />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingsRow
            label="Demo Mode"
            value={demoState.isDemo ? "Active" : "Inactive"}
            valueColor={demoState.isDemo ? colors.warning : colors.muted}
            colors={colors}
            isLast={false}
          />
          <SettingsRow
            label="Reset Demo Balance"
            value={`€${demoState.balance.toLocaleString()}`}
            valueColor={colors.muted}
            onPress={() => {
              resetDemo();
            }}
            colors={colors}
            isLast={true}
          />
        </View>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION: About
            ═══════════════════════════════════════════════════════════════════ */}
        <SectionLabel text="About" />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingsRow
            label="Version"
            value="1.0.0 (MVP)"
            valueColor={colors.muted}
            colors={colors}
            isLast={false}
          />
          <SettingsRow
            label="Terms of Service"
            value=""
            chevron
            onPress={() => {}}
            colors={colors}
            isLast={false}
          />
          <SettingsRow
            label="Privacy Policy"
            value=""
            chevron
            onPress={() => {}}
            colors={colors}
            isLast={false}
          />
          <SettingsRow
            label="Open Source Licenses"
            value=""
            chevron
            onPress={() => {}}
            colors={colors}
            isLast={true}
          />
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Caption1 color="muted" style={{ textAlign: "center" }}>
            AGRX — Agora Greek Exchange
          </Caption1>
          <Caption1 color="muted" style={{ textAlign: "center", marginTop: 2 }}>
            Making investing social for Greece 🇬🇷
          </Caption1>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return (
    <View style={styles.sectionLabel}>
      <Footnote
        color="muted"
        style={{
          fontFamily: FontFamily.semibold,
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}
      >
        {text}
      </Footnote>
    </View>
  );
}

function NotifRow({
  label,
  description,
  value,
  onToggle,
  colors,
  isLast,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  colors: any;
  isLast: boolean;
}) {
  return (
    <View
      style={[
        styles.row,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={[styles.rowLeft, { flex: 1, marginRight: 12 }]}>
        <View>
          <Subhead style={{ fontFamily: FontFamily.medium }}>{label}</Subhead>
          <Caption1 color="muted" style={{ marginTop: 2 }}>
            {description}
          </Caption1>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{
          false: colors.surfaceSecondary,
          true: colors.primary,
        }}
        thumbColor={Platform.OS === "android" ? colors.onPrimary : undefined}
        ios_backgroundColor={colors.surfaceSecondary}
      />
    </View>
  );
}

function SettingsRow({
  label,
  value,
  valueColor,
  chevron,
  onPress,
  colors,
  isLast,
}: {
  label: string;
  value: string;
  valueColor?: string;
  chevron?: boolean;
  onPress?: () => void;
  colors: any;
  isLast: boolean;
}) {
  const content = (
    <View
      style={[
        styles.row,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Subhead style={{ fontFamily: FontFamily.medium }}>{label}</Subhead>
      <View style={styles.rowRight}>
        {value ? (
          <Caption1 style={{ color: valueColor || colors.muted }}>{value}</Caption1>
        ) : null}
        {chevron && (
          <IconSymbol
            name="chevron.right"
            size={16}
            color={colors.muted}
            style={{ marginLeft: 4 }}
          />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed && { opacity: 0.7 }]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 50,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  footer: {
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
});
