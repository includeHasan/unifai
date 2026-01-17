---
title: Avoid Intrinsic Dimension Widgets in Scrolling
impact: MEDIUM
impactDescription: Prevents expensive layout passes
tags: layout, intrinsic, scrolling, performance
---

## Avoid Intrinsic Dimension Widgets in Scrolling

Avoid `IntrinsicWidth` and `IntrinsicHeight` in scrollable lists as they require expensive speculative layout passes.

**Incorrect (double layout pass):**

```dart
class BadList extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: 100,
      itemBuilder: (context, index) {
        // IntrinsicHeight causes speculative layout for EVERY item
        return IntrinsicHeight(
          child: Row(
            children: [
              Container(color: Colors.blue, width: 50),
              Expanded(child: Text('Variable height content $index')),
            ],
          ),
        );
      },
    );
  }
}
```

**Correct (fixed dimensions or CrossAxisAlignment):**

```dart
class GoodList extends StatelessWidget {
  const GoodList({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: 100,
      itemBuilder: (context, index) {
        return Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(
              width: 50,
              child: ColoredBox(color: Colors.blue),
            ),
            Expanded(
              child: Text('Variable height content $index'),
            ),
          ],
        );
      },
    );
  }
}
```

**Alternative: Use Table for equal-height rows:**

```dart
Table(
  columnWidths: const {
    0: FixedColumnWidth(50),
    1: FlexColumnWidth(),
  },
  children: items.map((item) {
    return TableRow(
      children: [
        Container(color: Colors.blue),
        Text(item.text),
      ],
    );
  }).toList(),
)
```

**When IntrinsicWidth/Height is acceptable:**
- Static content outside scrolling regions
- Dialog content with fixed items
- Overlay/popup menus

Never use in `ListView`, `GridView`, or any scrollable builder.
