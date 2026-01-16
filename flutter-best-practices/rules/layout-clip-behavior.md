---
title: Set clipBehavior.none When Not Needed
impact: MEDIUM
impactDescription: Reduces GPU overdraw
tags: layout, clip, performance, rendering
---

## Set clipBehavior.none When Not Needed

Disable clipping on containers and stacks when content doesn't overflow.

**Incorrect (unnecessary clipping):**

```dart
class BadLayout extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      // Default clipBehavior may clip unnecessarily
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(Icons.star),
          Text('Rating'),
        ],
      ),
    );
  }
}
```

**Correct (explicit no clipping):**

```dart
class GoodLayout extends StatelessWidget {
  const GoodLayout({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      clipBehavior: Clip.none, // Explicit - no clipping needed
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Row(
        children: [
          Icon(Icons.star),
          Text('Rating'),
        ],
      ),
    );
  }
}
```

**Stack with overflow:**

```dart
// When children intentionally overflow
Stack(
  clipBehavior: Clip.none, // Allow overflow
  children: [
    Container(width: 100, height: 100, color: Colors.blue),
    Positioned(
      top: -20, // Overflows parent - needs Clip.none
      child: Icon(Icons.star),
    ),
  ],
)
```

**Clip options:**

```dart
// Clip.none - No clipping, best performance
// Clip.hardEdge - Fastest clipping if needed
// Clip.antiAlias - Smooth edges, slower
// Clip.antiAliasWithSaveLayer - Smoothest, slowest

// For rounded containers that need clipping:
Container(
  clipBehavior: Clip.hardEdge, // Use simplest clip that works
  decoration: BoxDecoration(
    borderRadius: BorderRadius.circular(8),
  ),
  child: Image.network(url), // Image must be clipped
)
```

Use `Clip.none` as default, only enable clipping when content overflows.
