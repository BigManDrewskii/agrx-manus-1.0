# Animation Research Notes

## Apple HIG Motion Principles
- Add motion purposefully, supporting the experience without overshadowing it
- Aim for brevity and precision in feedback animations
- Let people cancel motion — don't make people wait for animation to complete
- Avoid adding motion to UI interactions that occur frequently
- Make motion optional (respect reduce-motion)

## Reanimated v4 API Reference

### withTiming
- Default duration: 300ms
- Default easing: Easing.inOut(Easing.quad)
- Available easings: back, bezier, bounce, circle, cubic, ease, elastic, exp, linear, poly, quad, sin
- Modifiers: in(), inOut(), out()

### withSpring — Physics-based (default)
- Default damping: 120 (how quickly spring slows down)
- Default stiffness: 900 (how bouncy)
- Default mass: 4 (weight — lower = faster)
- overshootClamping: false
- energyThreshold: 6e-9

### withSpring — Duration-based
- Default duration: 550ms (perceptual; actual = 1.5x = 825ms)
- Default dampingRatio: 1 (critically damped — no bounce)
- dampingRatio < 1 = underdamped (bouncy)
- dampingRatio > 1 = overdamped (sluggish)

### Entering/Exiting Layout Animations
- Fade: FadeIn, FadeInRight, FadeInLeft, FadeInUp, FadeInDown
- Slide: SlideInRight, SlideInLeft, SlideInUp, SlideInDown
- Bounce: BounceIn, BounceInDown, etc.
- Modifiers: .duration(ms), .delay(ms), .springify(), .damping(), .mass(), .stiffness()
- .springify() enables spring-based layout animations (iOS/Android only, not web)
- Default duration: 300ms for most, 600ms for Bounce

## Ideal Timing Ranges (Industry Research)
- Micro-interactions: 80-200ms (press feedback, toggles, chips)
- UI transitions: 200-350ms (screen transitions, modals, content reveals)
- Complex animations: 300-500ms (success states, celebrations)
- Never exceed 500ms for UI feedback

## iOS Native Spring Presets
- "Snappy" feel: response ~0.3s, dampingFraction ~0.7 (slight bounce)
- "Responsive" feel: response ~0.2s, dampingFraction ~0.85 (almost no bounce)
- "Interactive" feel: response ~0.15s, dampingFraction ~1.0 (no bounce, very fast)

## Reanimated Spring Configs for iOS Feel
- Snappy: { damping: 15, stiffness: 400, mass: 0.8 } — fast with tiny overshoot
- Responsive: { damping: 20, stiffness: 300, mass: 1 } — smooth, no overshoot
- Bouncy: { damping: 10, stiffness: 200, mass: 1 } — visible bounce
- Gentle: { damping: 20, stiffness: 150, mass: 1 } — slow, smooth
