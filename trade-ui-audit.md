# Trade Screen UI Audit

## Issues Identified from Screenshot

1. **Quick amount chips are stacked vertically** — The €5, €10, €25, €50, €100, €250 chips appear to be rendering in a vertical column layout instead of a clean horizontal row. They look like tall vertical rectangles instead of compact horizontal pills.

2. **Chips have excessive height** — Each chip appears to be very tall (like a card), taking up too much vertical space. They should be compact horizontal pills.

3. **The ScrollView horizontal layout isn't working properly on web** — The chips are wrapped in a horizontal ScrollView but they're rendering vertically, suggesting the horizontal scroll isn't applying correctly.

4. **Too much empty space** — The middle of the screen between chips and the swipe-to-confirm is mostly empty.

5. **Available balance text is small and hard to read** — "Available: €98925.10" is tiny.

6. **The swipe-to-confirm thumb (blue circle) is floating in the middle** — It seems disconnected from the track.

7. **Overall the page feels sparse** — Needs better visual hierarchy and grouping.

## Design Goals (Robinhood/Coinbase Reference)
- Clean centered amount display
- Compact pill-shaped preset amounts in a single row
- Clear visual hierarchy: stock info → amount → presets → confirm
- Tight vertical rhythm, no wasted space
- The order preview should be visible when amount is entered
