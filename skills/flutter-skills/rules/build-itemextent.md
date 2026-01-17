---
title: Use itemExtent for Fixed-Size List Items
impact: CRITICAL
impactDescription: 10x scroll performance improvement
tags: widgets, lists, scrolling, performance
---

## Use itemExtent for Fixed-Size List Items

When list items have a fixed height, specify `itemExtent` to skip layout calculations during scrolling.

**Incorrect (layout recalculated for each scroll):**

```dart
class BadList extends StatelessWidget {
  final List<String> items;
  
  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: items.length,
      itemBuilder: (context, index) {
        return SizedBox(
          height: 56, // Fixed height but Flutter doesn't know
          child: ListTile(title: Text(items[index])),
        );
      },
    );
  }
}
```

**Correct (itemExtent tells Flutter exact height):**

```dart
class GoodList extends StatelessWidget {
  final List<String> items;
  
  const GoodList({super.key, required this.items});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: items.length,
      itemExtent: 56, // Flutter skips layout calculations
      itemBuilder: (context, index) {
        return ListTile(title: Text(items[index]));
      },
    );
  }
}
```

**For variable item heights, use prototypeItem:**

```dart
ListView.builder(
  itemCount: items.length,
  prototypeItem: const ListTile(
    title: Text('Prototype'),
  ),
  itemBuilder: (context, index) {
    return ListTile(title: Text(items[index]));
  },
)
```

**Benefits:**
- Faster scroll position calculations
- Better jump-to-index performance
- Reduced jank during fast scrolling

Reference: [ListView.builder documentation](https://api.flutter.dev/flutter/widgets/ListView/ListView.builder.html)
