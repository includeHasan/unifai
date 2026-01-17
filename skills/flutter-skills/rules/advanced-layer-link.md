---
title: Use LayerLink for Efficient Overlay Positioning
impact: LOW
impactDescription: Automatic overlay repositioning
tags: advanced, overlay, layerlink, positioning
---

## Use LayerLink for Efficient Overlay Positioning

Use `LayerLink` with `CompositedTransformTarget/Follower` for overlays that follow widgets.

**Incorrect (manual positioning):**

```dart
class BadDropdown extends StatefulWidget {
  @override
  State<BadDropdown> createState() => _BadDropdownState();
}

class _BadDropdownState extends State<BadDropdown> {
  final _key = GlobalKey();
  OverlayEntry? _overlayEntry;

  void _showDropdown() {
    final renderBox = _key.currentContext!.findRenderObject() as RenderBox;
    final offset = renderBox.localToGlobal(Offset.zero);
    
    _overlayEntry = OverlayEntry(
      builder: (_) => Positioned(
        left: offset.dx,
        top: offset.dy + renderBox.size.height,
        child: DropdownMenu(),
      ),
    );
    Overlay.of(context).insert(_overlayEntry!);
  }
  // Problem: Doesn't update when widget moves (scroll, keyboard, etc.)
}
```

**Correct (LayerLink follows automatically):**

```dart
class GoodDropdown extends StatefulWidget {
  const GoodDropdown({super.key});

  @override
  State<GoodDropdown> createState() => _GoodDropdownState();
}

class _GoodDropdownState extends State<GoodDropdown> {
  final _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;

  void _showDropdown() {
    _overlayEntry = OverlayEntry(
      builder: (_) => CompositedTransformFollower(
        link: _layerLink,
        offset: const Offset(0, 40), // Below the target
        child: const Material(
          elevation: 4,
          child: DropdownMenu(),
        ),
      ),
    );
    Overlay.of(context).insert(_overlayEntry!);
  }

  void _hideDropdown() {
    _overlayEntry?.remove();
    _overlayEntry = null;
  }

  @override
  void dispose() {
    _overlayEntry?.remove();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CompositedTransformTarget(
      link: _layerLink,
      child: ElevatedButton(
        onPressed: _showDropdown,
        child: const Text('Show Dropdown'),
      ),
    );
  }
}
```

**Benefits:**
- Overlay automatically follows target during scroll
- Works correctly with keyboard appearance
- Handles transforms and clipping
- No manual position recalculation

Use for:
- Custom dropdowns
- Tooltips
- Autocomplete suggestions
- Context menus
