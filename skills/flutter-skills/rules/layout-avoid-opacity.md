---
title: Use AnimatedOpacity Instead of Opacity
impact: MEDIUM
impactDescription: Smoother animations, less jank
tags: layout, opacity, animation, performance
---

## Use AnimatedOpacity Instead of Opacity

Use `AnimatedOpacity` or `FadeTransition` instead of `Opacity` widget for animated opacity changes.

**Incorrect (causes unnecessary repaints):**

```dart
class BadFade extends StatefulWidget {
  @override
  State<BadFade> createState() => _BadFadeState();
}

class _BadFadeState extends State<BadFade> {
  double _opacity = 1.0;

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: _opacity,
      child: ExpensiveWidget(),
    );
  }
  
  void fadeOut() {
    // Each setState causes full rebuild
    for (var i = 10; i >= 0; i--) {
      Future.delayed(Duration(milliseconds: i * 50), () {
        setState(() => _opacity = i / 10);
      });
    }
  }
}
```

**Correct (AnimatedOpacity handles transitions):**

```dart
class GoodFade extends StatefulWidget {
  const GoodFade({super.key});

  @override
  State<GoodFade> createState() => _GoodFadeState();
}

class _GoodFadeState extends State<GoodFade> {
  bool _visible = true;

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      opacity: _visible ? 1.0 : 0.0,
      duration: const Duration(milliseconds: 300),
      child: const ExpensiveWidget(), // Only built once
    );
  }
  
  void toggleVisibility() {
    setState(() => _visible = !_visible);
    // Animation handled internally without extra rebuilds
  }
}
```

**With FadeTransition for controller-based animations:**

```dart
class FadeWidget extends StatefulWidget {
  const FadeWidget({super.key});

  @override
  State<FadeWidget> createState() => _FadeWidgetState();
}

class _FadeWidgetState extends State<FadeWidget>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _opacity;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _opacity = CurvedAnimation(parent: _controller, curve: Curves.easeIn);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _opacity,
      child: const ExpensiveWidget(),
    );
  }
}
```
