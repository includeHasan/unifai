---
title: Use SliverPersistentHeader for Sticky Headers
impact: LOW
impactDescription: Efficient pinned/floating headers
tags: advanced, sliver, header, sticky
---

## Use SliverPersistentHeader for Sticky Headers

Use `SliverPersistentHeader` for sticky/collapsible headers in scrollable content.

**Incorrect (hacky scroll listener approach):**

```dart
class BadStickyHeader extends StatefulWidget {
  @override
  State<BadStickyHeader> createState() => _BadStickyHeaderState();
}

class _BadStickyHeaderState extends State<BadStickyHeader> {
  bool _isSticky = false;
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(() {
      setState(() {
        _isSticky = _scrollController.offset > 100;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        ListView(...),
        if (_isSticky) Positioned(top: 0, child: Header()),
      ],
    );
  }
}
```

**Correct (SliverPersistentHeader):**

```dart
class GoodStickyHeader extends StatelessWidget {
  const GoodStickyHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverPersistentHeader(
          pinned: true, // Stays at top when scrolled
          delegate: _StickyHeaderDelegate(
            minHeight: 60,
            maxHeight: 120,
            child: const Header(),
          ),
        ),
        SliverList.builder(
          itemCount: 100,
          itemBuilder: (context, i) => ListTile(title: Text('Item $i')),
        ),
      ],
    );
  }
}

class _StickyHeaderDelegate extends SliverPersistentHeaderDelegate {
  final double minHeight;
  final double maxHeight;
  final Widget child;

  _StickyHeaderDelegate({
    required this.minHeight,
    required this.maxHeight,
    required this.child,
  });

  @override
  double get minExtent => minHeight;

  @override
  double get maxExtent => maxHeight;

  @override
  Widget build(context, double shrinkOffset, bool overlapsContent) {
    final progress = shrinkOffset / (maxExtent - minExtent);
    return Container(
      color: Colors.white,
      child: child,
    );
  }

  @override
  bool shouldRebuild(_StickyHeaderDelegate oldDelegate) {
    return maxHeight != oldDelegate.maxHeight ||
        minHeight != oldDelegate.minHeight ||
        child != oldDelegate.child;
  }
}
```

**Options:**
- `pinned: true` - Header stays at top
- `floating: true` - Header reappears on scroll up
- Use both for floating pinned headers
