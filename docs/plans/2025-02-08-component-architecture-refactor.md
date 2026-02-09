# Component Architecture Refactor

**Date:** 2025-02-08
**Status:** Approved
**Scope:** All 5 tab screens (Home, Markets, Trade, Portfolio, Social)

## Overview

Aggressive component architecture refactor to eliminate duplication, improve maintainability, and establish atomic design patterns across all tab screens.

## Current Problems

- Repeated header patterns across all 5 screens
- Duplicated card styling (listCard, newsCard, socialCard, challengeCard)
- P&L display logic repeated in 4+ locations
- 3 different implementations of "stock row" patterns
- Scattered skeleton/loading states
- Inconsistent empty state patterns

## Architecture Strategy

### Three-Layer Component Model

```
components/
├── layouts/           # Structural wrappers
│   ├── ScreenHeader.tsx
│   ├── SectionContainer.tsx
│   └── CardList.tsx
├── features/          # Business logic widgets
│   ├── portfolio/
│   ├── trading/
│   ├── social/
│   └── news/
└── ui/                # Design primitives (existing, enhance)
```

### Component Extraction by Screen

#### Home (index.tsx)
- GreetingHeader
- PortfolioSummaryCard (shared with Portfolio)
- QuickActionsRow
- DailyChallengeCard
- SocialPostPreview
- NewsCard

#### Markets (markets.tsx)
- MarketsHeader
- SearchBarWithClear
- SectorFilterChips
- SortOptionChips

#### Trade (trade.tsx)
- BuySellToggle
- AmountInput
- QuickAmountChips
- OrderPreviewCard
- TradeSuccessScreen

#### Portfolio (portfolio.tsx)
- PortfolioHeader
- HoldingCard
- BalanceInfoCard
- SectorAllocationBar
- EmptyPortfolioState

#### Social (social.tsx)
- TabSelector
- PostCard
- LeaderboardRow
- AchievementCard

### Shared Components

- CardList - Grouped card container with hairline dividers
- EmptyStateCard - Icon + title + description + CTA
- Badge - Notification, rank, reward variants
- Avatar - Size variants

## Execution Plan

### Phase 1: Foundation
Create layout components (non-breaking additions)

### Phase 2: Extract & Replace
One screen at a time, incrementally:
1. Social (cleanest isolation)
2. Markets (reusable patterns)
3. Trade (complex but self-contained)
4. Portfolio (shares with Home)
5. Home (orchestrator)

### Phase 3: Consolidate
Merge similar components, create variant system

### Phase 4: Verify
Type check, test, cleanup

## Principles

- Extract without changing behavior
- Explicit types for all components
- Preserve animations and haptics
- Test after each screen
- Git commits per screen (easy rollback)

## Success Criteria

- [ ] Zero duplicated card/pattern implementations
- [ ] All screens use shared layout components
- [ ] Type safety maintained (pnpm check passes)
- [ ] All tests pass (pnpm test passes)
- [ ] No visual or behavioral regressions
