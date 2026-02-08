# AGRX React 19 Audit Findings

## CRITICAL: Hooks After Early Returns (Crash Source)

### app/_layout.tsx (lines 85-113)
Multiple hooks (useCallback, useEffect, useState, useMemo) called after a return statement.
This is the root cause of "Rendered more hooks than during the previous render" crash.

### lib/notification-context.tsx (lines 434-644)
Massive number of hooks (useEffect, useCallback, useMemo) called after return.
The NotificationProvider likely has hooks after an early return guard.

### app/notification-history.tsx (lines 140-207)
useMemo and useCallback hooks after a return statement.

### app/(tabs)/markets.tsx (lines 96-104)
useMemo and useCallback after return.

### app/(tabs)/trade.tsx (lines 71-83)
useCallback and useMemo after return.

### app/(tabs)/portfolio.tsx (lines 94-128)
Multiple useCallback hooks after return.

## DEPRECATED: Context.Provider Usage (12 instances)

Files using deprecated `.Provider` pattern:
- app/_layout.tsx (trpc.Provider, SafeAreaFrameContext.Provider, SafeAreaInsetsContext.Provider)
- lib/theme-provider.tsx (ThemeContext.Provider)
- lib/demo-context.tsx (DemoContext.Provider)
- lib/watchlist-context.tsx (WatchlistContext.Provider)
- lib/notification-context.tsx (NotificationContext.Provider)

Note: trpc.Provider and SafeArea providers are from libraries — cannot change those.
Our own contexts (ThemeContext, DemoContext, WatchlistContext, NotificationContext) should be updated.

## DEPRECATED: forwardRef Usage (2 components)

- components/ui/typography.tsx:39 — Typography component uses forwardRef
- components/ui/share-card.tsx:19,181 — ShareCard uses forwardRef

## CLEAN: No Violations Found

- useRef() without argument: ✅ None
- defaultProps: ✅ None
- propTypes: ✅ None

## REVIEW: Potential State Mutations (Server-side only)

Server-side .push()/.splice() on local arrays (not React state) — these are fine:
- server/priceAlertService.ts: push/splice on in-memory device alerts
- server/newsService.ts: push on local article arrays

## REVIEW: Console.log in Render

- app/oauth/callback.tsx: Extensive console.log — these are inside useEffect, so OK
- lib/notification-context.tsx: console.log inside useEffect — OK
- components/ui/live-badge.tsx: Date.now() used in render — needs review
