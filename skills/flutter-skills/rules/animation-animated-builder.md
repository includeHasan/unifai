---
title: Use AnimatedBuilder Over setState
impact: MEDIUM
impactDescription: More efficient animation rebuilds
tags: animation, builder, performance, rebuild
---

## Use AnimatedBuilder Over setState

Use `AnimatedBuilder` or specific transition widgets instead of `setState` during animations.

**Incorrect (rebuilds entire widget tree):**

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
      duration: const Duration(seconds: 1),
      vsync: this,
    )..addListener(() {
        setState(() {}); // Rebuilds EVERYTHING on every frame
      });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ExpensiveWidget(), // Rebuilds 60 times per second!
        Transform.scale(
          scale: _controller.value,
          child: Icon(Icons.star),
        ),
      ],
    );
  }
}
```

**Correct (AnimatedBuilder rebuilds only needed parts):**

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
      duration: const Duration(seconds: 1),
      vsync: this,
    );
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
        const ExpensiveWidget(), // Built only once!
        AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Transform.scale(
              scale: _controller.value,
              child: child, // Reuses cached child
            );
          },
          child: const Icon(Icons.star), // Built once, reused
        ),
      ],
    );
  }
}
```

**Use specific transition widgets when available:**

```dart
// ScaleTransition, FadeTransition, SlideTransition, etc.
ScaleTransition(
  scale: _controller,
  child: const Icon(Icons.star), // Built once
)

// TweenAnimationBuilder for declarative animations
TweenAnimationBuilder<double>(
  tween: Tween(begin: 0, end: 1),
  duration: const Duration(seconds: 1),
  builder: (context, value, child) {
    return Opacity(opacity: value, child: child);
  },
  child: const ExpensiveWidget(), // Cached
)
```
