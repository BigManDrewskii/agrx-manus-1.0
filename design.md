# AGRX — Mobile App Interface Design

## Design Philosophy

AGRX's design language sits at the intersection of a premium sports/entertainment app and a clean fintech platform. The goal is **Stoiximan's confidence and energy** combined with **Robinhood's cleanliness and simplicity**. Not cheap or flashy — bold and alive. Dark mode is the default, matching the conventions of both betting and crypto apps that our target audience already uses daily.

Every screen is designed for **mobile portrait orientation (9:16)** and **one-handed usage**. The primary interaction zone is the bottom 60% of the screen, where thumbs naturally rest. Critical actions (Buy, Sell, Share) are always within thumb reach.

---

## Color System

The palette uses a trust-building blue as the primary brand color, with desaturated success/error colors optimized for dark backgrounds and WCAG AA compliance.

| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| **primary** | `#0066FF` | `#0055DD` | Brand, CTAs, navigation active states, headers |
| **background** | `#0F1116` | `#F8F9FB` | Primary screen background |
| **surface** | `#1A1D26` | `#FFFFFF` | Cards, elevated surfaces |
| **surfaceSecondary** | `#242834` | `#F0F1F5` | Inputs, secondary cards, modals |
| **foreground** | `#F0F2F5` | `#111827` | Primary text |
| **muted** | `#8B919E` | `#6B7280` | Secondary text, labels |
| **border** | `#2E3342` | `#E5E7EB` | Dividers, card borders |
| **success** | `#00C48C` | `#10B981` | Gains, positive P&L, calls, celebrations |
| **error** | `#FF5C5C` | `#EF4444` | Losses, negative P&L, puts, warnings |
| **warning** | `#FFB020` | `#F59E0B` | Achievements, streaks, challenges, energy accent |

### Dynamic P&L Colors
- **Positive P&L**: Success green (`#00C48C`) with subtle glow effect behind portfolio value
- **Negative P&L**: Error red (`#FF5C5C`) with subtle glow effect
- **Flat/Neutral**: Muted text, no glow
- Always supplement green/red with **▲/▼ arrows** and **+/- prefixes** for colorblind accessibility

---

## Typography

| Use | Font | Weight | Size Range | Notes |
|-----|------|--------|------------|-------|
| Primary UI | Inter | 400-700 | 13-18px | Clean, modern, full Greek character support |
| Numbers & P&L | JetBrains Mono | 500-700 | 16-42px | Monospaced, tabular figures for aligned columns |
| Section Headers | Inter | 700 | 20-28px | Bold, clear hierarchy |
| Hero Portfolio Value | JetBrains Mono | 700 | 36-42px | Largest element on Home screen |

### Greek Localization
- Comma as decimal separator, period as thousands separator: `€1.234,56`
- Greek text is 20-30% longer than English — all UI elements use flexible widths
- "Portfolio" = "Χαρτοφυλάκιο" — design for longest string

---

## Screen List

### Tab Bar Screens (5 tabs)
1. **Home** — Portfolio hero, trending stocks, daily challenge, social feed preview
2. **Markets** — Stock/asset list with search, categories, trending on ATHEX
3. **Trade** — Central action button (opens trade flow bottom sheet)
4. **Portfolio** — Holdings, P&L breakdown, tabs (All/Stocks/Options/Copied)
5. **Social** — Community feed, leaderboard, achievements

### Secondary Screens (pushed from tabs)
6. **Asset Detail** — Price chart, news, sentiment, Buy/Sell CTAs, options tab
7. **Trade Bottom Sheet** — Quick amounts, order type, swipe-to-confirm
8. **Onboarding** — Welcome, demo/live choice, single-field signup
9. **Profile/Settings** — Account, theme toggle, language, notifications, bank partner info
10. **P&L Share Card** — Card customization, template selection, share targets
11. **Leaderboard Detail** — Full rankings, categories, time periods
12. **Achievement Collection** — Badge grid, streak counter, XP progress
13. **Demo Mode Banner** — Persistent banner indicating demo mode across all screens

---

## Primary Content and Functionality Per Screen

### 1. Home Screen
- **Portfolio Value Hero**: Large JetBrains Mono number with dynamic green/red glow, percentage change with arrow, time-period selector (1D/1W/1M/3M/1Y/ALL)
- **Mini Sparkline Chart**: Inline portfolio performance chart below the hero value
- **Daily Challenge Card**: Single card with today's challenge ("Buy your first stock!"), progress indicator, reward preview (€2 credit)
- **Trending on ATHEX**: Horizontal scroll of asset cards (icon, name, price, % change with sparkline)
- **Social Feed Preview**: 2-3 latest community posts with like counts, truncated
- **Streak Counter**: Flame icon with day count in top-right area

### 2. Markets Screen
- **Search Bar**: Sticky top, with filter chips (All, Stocks, ETFs, Options, Trending)
- **Market Status Indicator**: "ATHEX Open" / "ATHEX Closed" with live dot
- **Asset List**: FlatList with rows — each row: icon, name, ticker, price (JetBrains Mono), % change badge, mini sparkline
- **Categories**: "Blue Chips", "Most Active", "Top Gainers", "Top Losers", "Dividend Stars"
- **Investment of the Day**: Featured card with thesis summary

### 3. Trade (Tab Action)
- Tapping the center Trade tab opens a **bottom sheet** over the current screen
- **Quick Search**: Search for asset at top
- **Recent Trades**: Last 3 traded assets for quick re-entry
- **Quick Trade Buttons**: Pre-set amounts (€1, €5, €10, €25, €50, €100)

### 4. Portfolio Screen
- **Total Value**: Large hero number with P&L glow effect
- **Tab Selector**: All / Stocks / Options / Copied
- **Holdings List**: Each row — asset icon, name, shares owned, current value, P&L (€ and %), mini sparkline
- **Performance Chart**: Line chart showing portfolio growth over time
- **Dividend Tracker**: Section showing upcoming and received dividends

### 5. Social Screen
- **Feed Tab**: Posts with text, asset tags ($OPAP), likes, comments
- **Leaderboard Tab**: Weekly/Monthly rankings — Top Gainers, Most Active, Best Streak
- **Achievements Tab**: Badge collection grid, locked/unlocked states, progress bars

### 6. Asset Detail Screen
- **Price Header**: Asset name, ticker, current price (large), % change
- **Interactive Chart**: Candlestick/line chart with time-period tabs (1D/1W/1M/3M/1Y/ALL), touch-to-scrub
- **Buy/Sell CTAs**: Two prominent buttons at bottom (sticky), green Buy / red Sell
- **Sentiment Bar**: Community buy/sell ratio visualization
- **News Feed**: Latest news items related to this asset
- **Options Tab**: Expiration selector, strike list with "Bet it goes up" / "Bet it goes down" in Simple mode

### 7. Trade Bottom Sheet
- **Asset Info**: Name, current price, your position (if any)
- **Buy/Sell Toggle**: Segmented control
- **Quick Amount Buttons**: €1, €5, €10, €25, €50, €100 (betting-style stake selectors)
- **Custom Amount Input**: With numpad
- **Order Type**: Market (default) / Limit (expandable)
- **Order Preview**: Inline summary — shares you'll get, estimated cost, fee
- **Swipe to Confirm**: Slider at bottom with haptic feedback
- **Success Animation**: "You now own 2 shares of OPAP!" with confetti and share prompt

---

## Key User Flows

### Flow 1: Yiannis's First Trade (Primary — must be < 3 minutes)
1. App opens → Onboarding: "Welcome to AGRX" → "Try Demo" / "Go Live"
2. Taps "Try Demo" → Instant access with €100K virtual money
3. Home screen: sees trending stocks, daily challenge "Buy your first stock!"
4. Taps OPAP in trending → Asset Detail: price chart, "Up 4.2% today", green Buy button
5. Taps Buy → Bottom sheet: quick amounts €5, €10, €25 → taps €10
6. Swipes to confirm → Haptic → Success: "You now own €10 of OPAP!" → "Share with friends?" → confetti
7. Achievement unlocked: "First Trade" badge → Daily challenge complete: +€2 credits

### Flow 2: Stock Purchase (Returning User)
1. Home → taps asset in portfolio or searches in Markets
2. Asset Detail → taps Buy
3. Bottom sheet → selects amount → swipe to confirm
4. Success animation → optional share card generation

### Flow 3: Share P&L Card
1. Portfolio → taps share icon on a winning position
2. P&L Share Card screen → selects template, toggles data visibility
3. Taps "Share to Instagram" → card exported as 9:16 PNG with AGRX branding

### Flow 4: Leaderboard Check
1. Social tab → Leaderboard tab
2. Sees weekly rankings by category
3. Taps a leader → views their profile, performance, risk score

---

## Navigation Architecture

### Bottom Tab Bar (5 items)
```
[ Home ]  [ Markets ]  [ Trade* ]  [ Portfolio ]  [ Social ]
```
*Trade is a center action button (larger, primary-colored) that opens a bottom sheet rather than navigating to a new tab.

### Tab Icons (SF Symbols → Material Icons mapping)
- Home: `house.fill` → `home`
- Markets: `chart.line.uptrend.xyaxis` → `trending-up`
- Trade: `plus.circle.fill` → `add-circle`
- Portfolio: `briefcase.fill` → `account-balance-wallet`
- Social: `person.2.fill` → `people`

---

## Component Patterns

### Cards
- Background: `surface` color with 1px `border` color border
- Border radius: 16px (rounded-2xl)
- Padding: 16px internal
- Subtle shadow on light mode, no shadow on dark mode

### Buttons
- **Primary (Buy/CTA)**: `primary` background, white text, rounded-full, 48px height
- **Success (Buy)**: `success` background, white text
- **Destructive (Sell)**: `error` background, white text
- **Secondary**: transparent with `border` color border, `foreground` text
- All buttons: high-contrast, simple design. Scale 0.97 + haptic on press.

### Quick Amount Buttons (Betting-Style Stakes)
- Row of 6 buttons: €1, €5, €10, €25, €50, €100
- Pill-shaped, `surfaceSecondary` background, `foreground` text
- Selected state: `primary` background, white text
- Familiar muscle memory from Stoiximan stake selectors

### Bottom Sheets
- Snap points: 40%, 70%, 95% of screen height
- Dark handle bar at top
- Backdrop blur behind sheet
- Keyboard-aware for amount input

### Demo Mode Indicator
- Persistent banner at top of every screen: "DEMO MODE — €100,000 virtual money"
- Distinct color: `warning` amber background
- Tap to dismiss or "Go Live" CTA

---

## Spacing & Grid

- Base unit: 4px
- Content padding: 16px horizontal (p-4)
- Card gap: 12px (gap-3)
- Section gap: 24px (gap-6)
- Tab bar height: 56px + safe area bottom
- Bottom sheet handle: 4px height, 40px width, centered, rounded-full
