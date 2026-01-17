---
title: Use TweenSequence for Complex Animations
impact: MEDIUM
impactDescription: Cleaner multi-phase animations
tags: animation, tween, sequence, multi-step
---

## Use TweenSequence for Complex Animations

Use `TweenSequence` for multi-phase animations instead of chaining or complex state logic.

**Incorrect (manual phase management):**

```dart
class BadMultiPhase extends StatefulWidget {
  @override
  State<BadMultiPhase> createState() => _BadMultiPhaseState();
}

class _BadMultiPhaseState extends State<BadMultiPhase>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  int _phase = 0;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 1),
      vsync: this,
    )..addStatusListener((status) {
        if (status == AnimationStatus.completed) {
          _phase++;
          if (_phase < 3) _controller.forward(from: 0);
        }
      });
  }

  double get _scale {
    switch (_phase) {
      case 0: return 1.0 + _controller.value * 0.5; // 1.0 -> 1.5
      case 1: return 1.5 - _controller.value * 0.3; // 1.5 -> 1.2
      case 2: return 1.2 - _controller.value * 0.2; // 1.2 -> 1.0
      default: return 1.0;
    }
  }
}
```

**Correct (TweenSequence):**

```dart
class GoodMultiPhase extends StatefulWidget {
  const GoodMultiPhase({super.key});

  @override
  State<GoodMultiPhase> createState() => _GoodMultiPhaseState();
}

class _GoodMultiPhaseState extends State<GoodMultiPhase>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    );

    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween(begin: 1.0, end: 1.5)
            .chain(CurveTween(curve: Curves.easeOut)),
        weight: 33,
      ),
      TweenSequenceItem(
        tween: Tween(begin: 1.5, end: 1.2)
            .chain(CurveTween(curve: Curves.easeInOut)),
        weight: 33,
      ),
      TweenSequenceItem(
        tween: Tween(begin: 1.2, end: 1.0)
            .chain(CurveTween(curve: Curves.easeIn)),
        weight: 34,
      ),
    ]).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _scaleAnimation,
      child: const Icon(Icons.favorite, size: 50),
    );
  }
}
```

**Benefits:**
- Single animation controller
- Declarative phase definitions
- Each phase can have its own curve
- Weight controls relative duration
