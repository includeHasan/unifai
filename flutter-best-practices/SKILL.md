---
name: flutter-best-practices
description: Flutter and Dart performance optimization guidelines. This skill should be used when writing, reviewing, or refactoring Flutter/Dart code to ensure optimal performance patterns. Triggers on tasks involving Flutter widgets, state management, build optimization, async operations, or performance improvements.
license: MIT
metadata:
  author: community
  version: "1.0.0"
---

# Flutter Best Practices

Comprehensive performance optimization guide for Flutter and Dart applications. Contains 40+ rules across 8 categories, prioritized by impact to guide automated refactoring and code generation.

## When to Apply

Reference these guidelines when:
- Writing new Flutter widgets or Dart code
- Implementing state management solutions
- Reviewing code for performance issues
- Refactoring existing Flutter/Dart code
- Optimizing build times or app performance

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Widget Build Optimization | CRITICAL | `build-` |
| 2 | State Management | CRITICAL | `state-` |
| 3 | Async Performance | HIGH | `async-` |
| 4 | Memory Management | HIGH | `memory-` |
| 5 | Layout Performance | MEDIUM | `layout-` |
| 6 | Animation Performance | MEDIUM | `animation-` |
| 7 | Dart Performance | LOW-MEDIUM | `dart-` |
| 8 | Advanced Patterns | LOW | `advanced-` |

## Quick Reference

### 1. Widget Build Optimization (CRITICAL)

- `build-const-constructors` - Use const constructors to prevent rebuilds
- `build-avoid-rebuild` - Extract widgets to prevent unnecessary rebuilds
- `build-split-widgets` - Split large widgets into smaller components
- `build-keys` - Use keys appropriately for widget identity
- `build-itemextent` - Use itemExtent for fixed-size list items

### 2. State Management (CRITICAL)

- `state-minimize-rebuilds` - Minimize widget tree rebuilds with selective updates
- `state-lift-state-up` - Lift state to the appropriate ancestor
- `state-valuenotifier` - Use ValueNotifier for simple reactive state
- `state-selector` - Use selector patterns to rebuild only affected widgets
- `state-late-final` - Use late final for lazy initialization

### 3. Async Performance (HIGH)

- `async-future-builder` - Use FutureBuilder for async UI updates
- `async-parallel` - Execute independent async operations in parallel
- `async-cancel-subscriptions` - Cancel stream subscriptions on dispose
- `async-debounce-throttle` - Debounce or throttle expensive operations
- `async-compute` - Use compute() for heavy synchronous work

### 4. Memory Management (HIGH)

- `memory-dispose` - Always dispose controllers and listeners
- `memory-image-cache` - Configure image cache limits appropriately
- `memory-precache` - Precache images for smooth loading
- `memory-weak-references` - Use weak references for large cached objects
- `memory-isolate` - Use isolates for memory-intensive operations

### 5. Layout Performance (MEDIUM)

- `layout-avoid-opacity` - Use AnimatedOpacity instead of Opacity
- `layout-clip-behavior` - Set clipBehavior.none when not needed
- `layout-intrinsic-dimensions` - Avoid intrinsic dimension widgets in scrolling
- `layout-slivers` - Use slivers for efficient scrollable layouts
- `layout-repaint-boundary` - Use RepaintBoundary to isolate repaints

### 6. Animation Performance (MEDIUM)

- `animation-animated-builder` - Use AnimatedBuilder over setState
- `animation-tween-sequence` - Use TweenSequence for complex animations
- `animation-physics` - Use physics-based animations for natural feel
- `animation-cached-images` - Cache animation frames when possible
- `animation-reduce-overdraw` - Minimize overdraw in animations

### 7. Dart Performance (LOW-MEDIUM)

- `dart-final-const` - Use final and const appropriately
- `dart-collection-if` - Use collection-if instead of conditional logic
- `dart-spread-operator` - Use spread operator for efficient collection merging
- `dart-cascade-notation` - Use cascade notation for multiple operations
- `dart-avoid-dynamic` - Avoid dynamic types for better performance
- `dart-string-buffer` - Use StringBuffer for string concatenation

### 8. Advanced Patterns (LOW)

- `advanced-sliver-persistent` - Use SliverPersistentHeader for sticky headers
- `advanced-layer-link` - Use LayerLink for efficient overlay positioning
- `advanced-custom-painter` - Optimize CustomPainter for complex rendering
- `advanced-render-object` - Create custom RenderObjects for maximum control

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/build-const-constructors.md
rules/state-minimize-rebuilds.md
rules/async-parallel.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and references
