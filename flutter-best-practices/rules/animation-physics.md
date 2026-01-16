---
title: Use Physics-Based Animations
impact: MEDIUM
impactDescription: More natural, interruptible animations
tags: animation, physics, spring, fling
---

## Use Physics-Based Animations

Use physics-based animations for natural feeling interactions that can be interrupted and redirected.

**Incorrect (fixed duration feels artificial):**

```dart
class BadDrag extends StatefulWidget {
  @override
  State<BadDrag> createState() => _BadDragState();
}

class _BadDragState extends State<BadDrag>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  double _offset = 0;

  void _onDragEnd(DragEndDetails details) {
    // Fixed duration regardless of velocity - unnatural
    _controller.animateTo(
      0,
      duration: const Duration(milliseconds: 300),
    );
  }
}
```

**Correct (physics-based spring):**

```dart
class GoodDrag extends StatefulWidget {
  const GoodDrag({super.key});

  @override
  State<GoodDrag> createState() => _GoodDragState();
}

class _GoodDragState extends State<GoodDrag>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  
  void _onDragEnd(DragEndDetails details) {
    // Spring simulation - natural bounce back
    final simulation = SpringSimulation(
      SpringDescription(
        mass: 1,
        stiffness: 500,
        damping: 25,
      ),
      _controller.value, // Current position
      0, // Target position
      details.velocity.pixelsPerSecond.dx / 1000, // Initial velocity
    );
    
    _controller.animateWith(simulation);
  }
}
```

**Fling animation for scrolling:**

```dart
void _onPanEnd(DragEndDetails details) {
  final velocity = details.velocity.pixelsPerSecond.dx;
  
  final simulation = FrictionSimulation(
    0.135, // Friction coefficient
    _position,
    velocity,
  );
  
  _controller.animateWith(simulation);
}
```

**Built-in spring curves:**

```dart
// Use Curves.elasticOut for spring-like effect
AnimatedContainer(
  duration: const Duration(milliseconds: 500),
  curve: Curves.elasticOut, // Spring overshoot
  transform: Matrix4.translationValues(_offset, 0, 0),
  child: content,
)

// Or SpringCurve for more control
const spring = SpringDescription(
  mass: 1,
  stiffness: 100,
  damping: 10,
);
```

Physics animations feel more natural because:
- Duration depends on distance and velocity
- Can be interrupted mid-animation
- Respect user gesture momentum
