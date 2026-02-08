# AGRX Animation Audit

## Current State Summary

### Animated Components (3 total)
1. **SwipeToConfirm** — Uses reanimated: withTiming, withSpring, withSequence, interpolate, Gesture.Pan. Well-animated.
2. **Skeleton** — Uses RN Animated API: loop opacity pulse (0.3→0.7, 800ms). Works but uses legacy API.
3. **ParallaxScrollView** — Uses reanimated: interpolate on scroll offset for header parallax. Not actively used.

### Press Feedback (inconsistent)
- **60+ Pressable instances** across all screens
- Opacity values vary wildly: 0.5, 0.6, 0.7, 0.8, 0.85 — no standard
- Scale values vary: 0.97, 0.98 — somewhat consistent
- No animated press feedback — all instant CSS-style opacity changes
- No spring-back or micro-bounce on any press

### Haptics (sparse)
- Used in: haptic-tab, asset-row star, portfolio share, asset detail star, view-mode-toggle, swipe-to-confirm, share-card-modal
- All use ImpactFeedbackStyle.Light except swipe milestones (Medium) and share success (NotificationFeedbackType.Success)
- Missing from: trade buy/sell toggle, quick amount chips, settings toggles, onboarding buttons, market filter chips

### Screen Transitions
- Onboarding: `animation: "fade"` ✓
- Asset Detail, Settings, Price Alerts, Notification History: `animation: "slide_from_right"` ✓
- Tab switches: default (no custom animation)
- No custom transition durations or spring configs

### What's Completely Missing
1. **List item stagger** — FlatList items appear instantly, no staggered fade-in
2. **Content mount animations** — Screens pop in fully rendered, no entrance animation
3. **Value change animations** — Portfolio value, P&L, prices change instantly with no interpolation
4. **Toggle animations** — View mode toggle, buy/sell toggle snap instantly (no sliding indicator)
5. **Progress bar animation** — XP bar width changes instantly
6. **Badge/dot pulse** — Live badge dot is static, notification badge is static
7. **Card hover/press spring** — Cards have no spring-back feel
8. **Modal entrance** — Modals use default `animationType="slide"`, no custom spring
9. **Collapsible animation** — Content appears/disappears instantly, chevron rotation is instant
10. **Tab bar indicator** — No animated underline or indicator on tab switch
11. **Pull-to-refresh animation** — Uses default, no custom
12. **Number counting animation** — Portfolio value, balance don't animate on change
13. **Chip selection animation** — Sector filter chips, quick amount chips have no selection animation
14. **Error/success state transitions** — Validation errors appear instantly

## Inconsistency Map

| Element | Current Opacity | Current Scale | Haptic |
|---------|----------------|---------------|--------|
| Primary buttons | 0.85-0.9 | 0.97 | Sometimes |
| List items/cards | 0.7 | None | No |
| Icon buttons | 0.6 | None | Sometimes |
| Filter chips | 0.6-0.7 | None | No |
| Toggle segments | 0.6 | None | Sometimes |
| Quick amount chips | 0.7 | None | No |
| Navigation links | 0.7 | None | No |
