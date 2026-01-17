---
title: Create Custom RenderObjects for Maximum Control
impact: LOW
impactDescription: Ultimate performance optimization
tags: advanced, renderobject, layout, custom
---

## Create Custom RenderObjects for Maximum Control

For maximum performance, create custom RenderObjects when widgets and CustomPaint are insufficient.

**When to use custom RenderObject:**
- Need custom layout logic
- Want fine-grained control over painting
- Building reusable low-level components
- Optimizing hot paths in your app

**Basic custom RenderObject:**

```dart
class EfficientBox extends LeafRenderObjectWidget {
  final Color color;
  final double size;

  const EfficientBox({
    super.key,
    required this.color,
    required this.size,
  });

  @override
  RenderObject createRenderObject(BuildContext context) {
    return RenderEfficientBox(color: color, size: size);
  }

  @override
  void updateRenderObject(BuildContext context, RenderEfficientBox renderObject) {
    renderObject
      ..color = color
      ..preferredSize = size;
  }
}

class RenderEfficientBox extends RenderBox {
  Color _color;
  double _preferredSize;

  RenderEfficientBox({required Color color, required double size})
      : _color = color,
        _preferredSize = size;

  Color get color => _color;
  set color(Color value) {
    if (_color == value) return;
    _color = value;
    markNeedsPaint(); // Only repaint, no layout
  }

  double get preferredSize => _preferredSize;
  set preferredSize(double value) {
    if (_preferredSize == value) return;
    _preferredSize = value;
    markNeedsLayout(); // Need layout recalculation
  }

  @override
  void performLayout() {
    size = constraints.constrain(Size.square(_preferredSize));
  }

  @override
  void paint(PaintingContext context, Offset offset) {
    final paint = Paint()..color = _color;
    context.canvas.drawRect(offset & size, paint);
  }
}
```

**Benefits over widgets:**
- Direct control over when to relayout vs repaint
- No intermediate widget rebuilds
- Optimal memory usage
- Can implement custom hit testing

**Example: Efficient list item:**

```dart
class RenderListItem extends RenderBox {
  String _title;
  
  // Only repaint text, skip layout if size unchanged
  set title(String value) {
    if (_title == value) return;
    _title = value;
    // If text width fits, only repaint
    if (_cachedTextPainter.width <= size.width) {
      markNeedsPaint();
    } else {
      markNeedsLayout();
    }
  }
}
```

**Caution:** Use only when profiling shows widget overhead is significant. Prefer widgets for most cases.
