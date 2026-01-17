---
title: Minimize Overdraw in Animations
impact: MEDIUM
impactDescription: Reduces GPU workload
tags: animation, overdraw, gpu, performance
---

## Minimize Overdraw in Animations

Reduce overlapping painted areas during animations to decrease GPU workload.

**Incorrect (multiple overlapping layers):**

```dart
class BadOverdraw extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Background painted everywhere
        Container(color: Colors.blue),
        // Card overlaps background
        Center(
          child: Container(
            width: 200,
            height: 200,
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  blurRadius: 20,
                  color: Colors.black26,
                ),
              ],
            ),
            // Icon overlaps card
            child: Icon(Icons.star, size: 100, color: Colors.yellow),
          ),
        ),
      ],
    );
  }
}
```

**Correct (minimize overlap):**

```dart
class GoodOverdraw extends StatelessWidget {
  const GoodOverdraw({super.key});

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: Colors.blue,
      child: Center(
        child: PhysicalModel(
          color: Colors.white,
          elevation: 8, // Uses GPU shadow, more efficient
          borderRadius: BorderRadius.circular(8),
          child: const SizedBox(
            width: 200,
            height: 200,
            child: Icon(Icons.star, size: 100, color: Colors.yellow),
          ),
        ),
      ),
    );
  }
}
```

**Debug overdraw:**

```dart
void main() {
  // Shows overdraw with colors
  // Green = 1x, Light green = 2x, Yellow = 3x, Red = 4x+
  debugPaintLayerBordersEnabled = true;
  runApp(MyApp());
}

// Or use DevTools Performance Overlay
MaterialApp(
  showPerformanceOverlay: true,
  home: MyHomePage(),
)
```

**Tips to reduce overdraw:**
- Use `ColoredBox` instead of `Container(color: ...)`
- Use `PhysicalModel` for shadows instead of `BoxShadow`
- Avoid stacking opaque widgets
- Use `saveLayer` sparingly (opacity, clips with antialiasing)
- Prefer solid backgrounds over gradients where possible

**For animated opacity:**

```dart
// Bad - saveLayer on every frame
Opacity(
  opacity: animation.value,
  child: ComplexWidget(),
)

// Better - use FadeTransition
FadeTransition(
  opacity: animation,
  child: const ComplexWidget(),
)
```
