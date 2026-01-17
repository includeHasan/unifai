---
title: Cache Animation Frames When Possible
impact: MEDIUM
impactDescription: Reduces per-frame computation
tags: animation, cache, frames, performance
---

## Cache Animation Frames When Possible

For complex animations that repeat, consider caching rendered frames or using simpler representations during motion.

**Incorrect (complex rendering every frame):**

```dart
class BadComplexAnim extends StatefulWidget {
  @override
  State<BadComplexAnim> createState() => _BadComplexAnimState();
}

class _BadComplexAnimState extends State<BadComplexAnim>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        // Complex widget rebuilt 60 times per second
        return Transform.rotate(
          angle: _controller.value * 2 * pi,
          child: ComplexShadowedWidget(), // Expensive!
        );
      },
    );
  }
}
```

**Correct (cache animated content in layer):**

```dart
class GoodComplexAnim extends StatefulWidget {
  const GoodComplexAnim({super.key});

  @override
  State<GoodComplexAnim> createState() => _GoodComplexAnimState();
}

class _GoodComplexAnimState extends State<GoodComplexAnim>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      // Child is built ONCE and cached
      child: const RepaintBoundary(
        child: ComplexShadowedWidget(),
      ),
      builder: (context, child) {
        // Only transform is applied per-frame
        return Transform.rotate(
          angle: _controller.value * 2 * pi,
          child: child, // Reused cached child
        );
      },
    );
  }
}
```

**For repeated sprite animations:**

```dart
class SpriteAnimation extends StatelessWidget {
  final List<ui.Image> frames; // Pre-rendered frames
  final int currentFrame;
  
  const SpriteAnimation({
    super.key,
    required this.frames,
    required this.currentFrame,
  });

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: SpritePainter(frames[currentFrame]),
    );
  }
}

class SpritePainter extends CustomPainter {
  final ui.Image frame;
  SpritePainter(this.frame);

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawImage(frame, Offset.zero, Paint());
  }

  @override
  bool shouldRepaint(SpritePainter old) => frame != old.frame;
}
```

**When to cache:**
- Rotating complex widgets with shadows
- Scaling elaborate UI
- Looping animations with static content
