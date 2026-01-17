---
title: Optimize CustomPainter for Complex Rendering
impact: LOW
impactDescription: Efficient canvas operations
tags: advanced, custompainter, canvas, rendering
---

## Optimize CustomPainter for Complex Rendering

Optimize `CustomPainter` to minimize unnecessary repaints and improve rendering performance.

**Incorrect (repaints unnecessarily):**

```dart
class BadPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.blue; // Created each time
    
    for (var i = 0; i < 1000; i++) {
      canvas.drawCircle(
        Offset(i.toDouble(), i.toDouble()),
        10,
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return true; // Always repaints!
  }
}
```

**Correct (optimized painting):**

```dart
class GoodPainter extends CustomPainter {
  final List<Offset> points;
  final Color color;
  
  // Cached paint object
  late final Paint _paint = Paint()..color = color;
  
  GoodPainter({required this.points, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    // Use drawPoints for multiple points
    canvas.drawPoints(
      PointMode.points,
      points,
      _paint,
    );
  }

  @override
  bool shouldRepaint(GoodPainter oldDelegate) {
    // Only repaint when data changes
    return points != oldDelegate.points || color != oldDelegate.color;
  }
}
```

**Batch similar operations:**

```dart
class BatchedPainter extends CustomPainter {
  final List<Rect> rects;
  
  BatchedPainter(this.rects);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.blue;
    
    // Use Path for multiple shapes
    final path = Path();
    for (final rect in rects) {
      path.addRect(rect);
    }
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(BatchedPainter old) => rects != old.rects;
}
```

**Use RepaintBoundary with listenable:**

```dart
class AnimatedCustomPaint extends StatelessWidget {
  final Animation<double> animation;
  
  const AnimatedCustomPaint({super.key, required this.animation});

  @override
  Widget build(BuildContext context) {
    return RepaintBoundary(
      child: CustomPaint(
        painter: MyPainter(animation.value),
        // Tells CustomPaint when to repaint
        willChange: true, // Hint for optimization
      ),
    );
  }
}
```

**Tips:**
- Cache Paint objects when possible
- Use `shouldRepaint` correctly
- Batch similar draw calls
- Use `canvas.saveLayer` sparingly (expensive)
- Prefer `Path` operations over individual draws
