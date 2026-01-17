---
title: Use RepaintBoundary to Isolate Repaints
impact: MEDIUM
impactDescription: Reduces repaint area
tags: layout, repaint, boundary, optimization
---

## Use RepaintBoundary to Isolate Repaints

Wrap frequently updated widgets in `RepaintBoundary` to prevent repainting of static content.

**Incorrect (entire tree repaints):**

```dart
class BadAnimation extends StatefulWidget {
  @override
  State<BadAnimation> createState() => _BadAnimationState();
}

class _BadAnimationState extends State<BadAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Static content repaints on every animation frame!
        ExpensiveStaticWidget(),
        RotationTransition(
          turns: _controller,
          child: Icon(Icons.refresh),
        ),
      ],
    );
  }
}
```

**Correct (isolated repaint boundary):**

```dart
class GoodAnimation extends StatefulWidget {
  const GoodAnimation({super.key});

  @override
  State<GoodAnimation> createState() => _GoodAnimationState();
}

class _GoodAnimationState extends State<GoodAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Static content has its own layer - no repaint
        const RepaintBoundary(
          child: ExpensiveStaticWidget(),
        ),
        // Animation isolated in its own layer
        RepaintBoundary(
          child: RotationTransition(
            turns: _controller,
            child: const Icon(Icons.refresh),
          ),
        ),
      ],
    );
  }
}
```

**Identify repaint issues:**

```dart
// Enable repaint rainbow in debug mode
import 'package:flutter/rendering.dart';

void main() {
  debugRepaintRainbowEnabled = true; // Shows repaint regions
  runApp(MyApp());
}
```

**When to use RepaintBoundary:**
- Around animating widgets
- Around frequently updating content
- Around expensive static content near dynamic content
- In list items with animations

**Caution:** Too many RepaintBoundaries increase memory usage (each creates a layer). Profile before adding.
