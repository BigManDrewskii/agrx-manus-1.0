# AGRX App Audit & Recommendations Report

**Date:** February 8, 2026  
**Scope:** Full codebase audit — 12 screens, 25+ components, 5 context providers, server-side services  
**Test Suite:** 250 tests passing, 0 TypeScript errors

---

## Executive Summary

AGRX has a strong foundation: live ATHEX data for 135 stocks, a polished design system with WCAG AA compliance, a working theme engine, and several differentiated features (P&L share cards, price alerts, notification history). However, the app currently has a **data consistency gap** — trades don't flow through to the portfolio, the home screen shows hardcoded values, and several interactive elements are non-functional. There is also a **runtime hooks error** that needs immediate attention.

This report organizes findings into three tiers: **critical bugs** that break the experience, **high-impact features** that close the gap between what's built and what users expect, and **polish items** that elevate AGRX from "functional prototype" to "feels like a real app."

---

## 1. Critical Bugs (Fix Immediately)

These issues cause crashes, broken state, or fundamentally misleading UI.

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| **B1** | **React hooks ordering violation** — `Rendered more hooks than during the previous render` | `app/_layout.tsx` (line ~85) | App crash on certain navigation paths. Likely caused by a conditional hook call or a component that conditionally renders hooks. |
| **B2** | **Trades don't update portfolio** — `executeTrade()` is called in DemoContext but `PORTFOLIO_HOLDINGS` is a static import from mock-data. After buying €10 of OPAP, the Portfolio screen still shows the same hardcoded holdings. | `app/(tabs)/trade.tsx` → `lib/demo-context.tsx` → `app/(tabs)/portfolio.tsx` | Core loop is broken. Users trade but see no result. |
| **B3** | **Home portfolio value is hardcoded** — `PORTFOLIO_TOTAL_VALUE` from mock-data, never derived from actual holdings or trades. | `app/(tabs)/index.tsx` | The hero number — the most prominent element on the Home screen — is a lie. |
| **B4** | **Yahoo Finance API quota exhausted** — server logs show `usage exhausted` errors for multiple symbols. Falls back to mock data gracefully, but all "LIVE DATA" badges are misleading when running on stale mock prices. | `server/stockService.ts` | Users see "LIVE DATA" label but get demo prices. The LiveBadge should reflect actual data freshness. |

---

## 2. Data Flow & State Architecture (High Priority)

The fundamental issue is that AGRX has **two disconnected data worlds**: the DemoContext (which tracks trades and balance) and the mock-data module (which provides static holdings and portfolio values). These need to be unified.

### Recommended Architecture

The DemoContext should become the **single source of truth** for all user-facing financial data. When a trade executes, it should update a holdings map. The Portfolio screen should derive its display from that holdings map. The Home screen portfolio hero should read from the same source.

| Current State | Target State |
|--------------|-------------|
| `PORTFOLIO_HOLDINGS` — static array in mock-data.ts | `DemoContext.holdings` — derived from executed trades |
| `PORTFOLIO_TOTAL_VALUE` — hardcoded number | Computed: `sum(holdings × livePrice)` |
| `DemoContext.trades` — array of trade records, never displayed | Trade History screen + Portfolio derivation |
| Balance deducted on buy, but no shares added to portfolio | Full round-trip: balance → shares → portfolio value |

This is the single highest-impact change. Without it, the app is a collection of beautiful screens that don't connect.

---

## 3. Feature Gap Analysis

Comparing the current build against the original design.md specification and competitive benchmarks (Robinhood, eToro, Trading 212).

### 3a. Missing from Design Spec

| Feature | Design Spec Section | Current Status | Priority |
|---------|-------------------|----------------|----------|
| **Watchlist on Home screen** | "Trending stocks" area should include watchlisted items | Not implemented (todo.md unchecked) | High |
| **Custom amount input** on Trade | "Custom Amount Input: With numpad" | Only preset amounts (€5–€100) | High |
| **Swipe-to-confirm** on Trade | "Slider at bottom with haptic feedback" | Simple button tap | Medium |
| **Recent trades** in Trade flow | "Last 3 traded assets for quick re-entry" | Not implemented | Medium |
| **Trade history screen** | Trades tracked in DemoContext but never displayed | Not implemented | High |
| **Confetti animation** on trade success | "Success animation with confetti" | Static success screen | Low |
| **Options tab** on Asset Detail | "Expiration selector, strike list" | Not implemented | Low (niche) |
| **Investment of the Day** on Markets | "Featured card with thesis summary" | Not implemented | Medium |
| **Simple/Advanced mode toggle** | Referenced in todo.md | Not implemented | Medium |
| **Center Trade tab button** | "Larger, primary-colored action button" | Same style as other tabs | Medium |

### 3b. Interactive Elements That Don't Work

| Element | Screen | What Happens | What Should Happen |
|---------|--------|-------------|-------------------|
| Time period selector (1D/1W/1M/3M/1Y/ALL) | Home | Only "1D" is visually active, no state change | Switch portfolio chart data and P&L calculation to selected period |
| Like/Comment buttons on social posts | Social | No response | Increment count, haptic feedback, persist state |
| "See All" on Market News | Home | No navigation | Navigate to a full news list or Markets screen |
| Achievement progress bars | Social | Static mock data | Update based on actual user activity |
| Daily challenge progress | Home | Always shows 1/3 | Track real completion (e.g., "Buy your first stock" → mark complete after first trade) |
| Portfolio tabs (All/Stocks/Options/Copied) | Portfolio | Tab switches but no filtering logic | Filter holdings by category |

---

## 4. UX & Polish Recommendations

### 4a. High-Impact UX Improvements

**Trade Flow Improvements.** The trade flow is the core monetization path. Currently it's functional but lacks the dopamine feedback loop that makes trading apps sticky. Adding a brief processing animation (1–2 seconds with a spinner), followed by confetti and a success sound, would make each trade feel consequential. The swipe-to-confirm gesture from the design spec adds friction in a good way — it prevents accidental trades and creates a satisfying physical interaction.

**Insufficient Balance Handling.** Currently there is no guard against trading more than the available balance. If a user has €50 left and taps the €100 button, the trade goes through and the balance goes negative. This needs a disabled state on amount buttons that exceed the balance, plus a clear inline message.

**Keyboard Dismissal.** Search inputs on Markets and Trade screens don't dismiss the keyboard when the user scrolls the list. Adding `keyboardDismissMode="on-drag"` to the ScrollView/FlatList components would fix this.

**Username Personalization.** "Andreas" is hardcoded. Even without full auth, allowing the user to set their display name in Settings (persisted to AsyncStorage) would make the app feel personal.

### 4b. Visual Polish

**Tab Bar Trade Button.** The design spec calls for the Trade tab to be a larger, primary-colored center button — the "action button" pattern used by Instagram (create), Robinhood (trade), and Cash App (pay). This is a strong visual differentiator and makes the primary action unmissable.

**Portfolio Allocation Chart.** A donut/pie chart showing sector distribution of holdings would add visual richness to the Portfolio screen and help users understand their exposure at a glance.

**Pull-to-Refresh Everywhere.** Home screen currently doesn't have pull-to-refresh. Markets and Portfolio do. Consistency matters.

**Empty States.** When the watchlist is empty, when there are no trades, when notification history is clear — each of these should have a purposeful empty state with an illustration and a CTA, not just blank space.

---

## 5. Prioritized Implementation Roadmap

Based on impact, effort, and dependencies, here is the recommended order of work:

### Phase 1: Fix Critical Bugs (Estimated: 1 session)

1. **Fix the React hooks ordering error** — trace the conditional hook call in `_layout.tsx` and ensure all hooks are called unconditionally
2. **Fix LiveBadge accuracy** — show "DEMO DATA" when using mock fallback, "LIVE" only when Yahoo Finance data is fresh

### Phase 2: Unify Data Flow (Estimated: 1–2 sessions)

3. **Upgrade DemoContext** to track holdings (not just trades) — when a buy executes, add shares to a holdings map; when a sell executes, remove them
4. **Derive Portfolio screen from DemoContext holdings** — replace `PORTFOLIO_HOLDINGS` import with live computed data
5. **Derive Home portfolio value from DemoContext** — replace `PORTFOLIO_TOTAL_VALUE` with computed sum
6. **Build Trade History screen** — FlatList of all executed trades with date, ticker, amount, type

### Phase 3: Complete Core Interactions (Estimated: 1–2 sessions)

7. **Make time period selector functional** on Home — switch chart data and P&L based on selected period
8. **Add custom amount input** to Trade — numpad or text input for arbitrary amounts
9. **Add watchlist section to Home** — horizontal scroll of watchlisted stocks below trending
10. **Make social interactions work** — like/comment with local state persistence
11. **Wire daily challenge completion** to actual trade activity

### Phase 4: Polish & Differentiation (Estimated: 1–2 sessions)

12. **Center Trade tab button** — larger, primary-colored, elevated from tab bar
13. **Swipe-to-confirm** on Trade — gesture handler with haptic feedback
14. **Trade success animation** — confetti + sound
15. **Insufficient balance guard** — disable amounts > balance, show inline message
16. **Username personalization** — editable in Settings, persisted to AsyncStorage
17. **Portfolio allocation donut chart**

### Phase 5: Advanced Features (Estimated: 2+ sessions)

18. **Simple/Advanced mode toggle** — simplified UI for beginners, full order types for power users
19. **Investment of the Day** on Markets — AI-generated thesis card
20. **Recent trades** in Trade flow — quick re-entry for last 3 traded assets
21. **Pull-to-refresh on Home**
22. **Keyboard dismiss on scroll** across all search screens

---

## 6. Technical Health Summary

| Metric | Status |
|--------|--------|
| TypeScript errors | 0 |
| Test suite | 250 tests passing |
| Runtime errors | 1 critical (hooks ordering) |
| API health | Yahoo Finance quota exhausted (graceful fallback active) |
| Theme system | Functional with key-based re-render fix |
| Bundle size | Not measured (recommend auditing before production) |
| Accessibility | WCAG AA color contrast, arrow indicators for colorblind — good foundation, needs screen reader audit |

---

## 7. Competitive Positioning

AGRX's strongest differentiators against Robinhood/eToro/Trading 212 are:

1. **ATHEX focus** — no competitor offers a mobile-first Greek stock trading experience with this level of polish
2. **Social + gamification** — the achievement/challenge/leaderboard system is unique in the Greek market
3. **P&L share cards** — Instagram-ready share cards are a viral growth mechanism that competitors lack
4. **Price alerts with notification history** — full pipeline from threshold to push to in-app history

The weakest link is the **broken data flow** — the app looks premium but the core trade-to-portfolio loop doesn't work. Fixing Phase 2 above transforms AGRX from a demo into a functional product.
