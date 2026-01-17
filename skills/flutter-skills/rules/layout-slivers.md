---
title: Use Slivers for Efficient Scrollable Layouts
impact: MEDIUM
impactDescription: Lazy building and better scroll performance
tags: layout, slivers, scrolling, lazy-loading
---

## Use Slivers for Efficient Scrollable Layouts

Use slivers for complex scrollable layouts with mixed content types.

**Incorrect (nested ListViews):**

```dart
class BadScrollable extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        children: [
          // All items built at once, poor performance
          ...List.generate(100, (i) => ListTile(title: Text('Item $i'))),
          GridView.count(
            shrinkWrap: true, // Expensive!
            physics: NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            children: List.generate(50, (i) => Card(child: Text('Grid $i'))),
          ),
        ],
      ),
    );
  }
}
```

**Correct (Slivers for mixed content):**

```dart
class GoodScrollable extends StatelessWidget {
  const GoodScrollable({super.key});

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        // Header
        const SliverAppBar(
          title: Text('My App'),
          floating: true,
        ),
        
        // List items - built lazily
        SliverList.builder(
          itemCount: 100,
          itemBuilder: (context, i) => ListTile(title: Text('Item $i')),
        ),
        
        // Section header
        const SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Text('Grid Section'),
          ),
        ),
        
        // Grid items - built lazily
        SliverGrid.count(
          crossAxisCount: 2,
          children: List.generate(50, (i) => Card(child: Text('Grid $i'))),
        ),
      ],
    );
  }
}
```

**Common sliver widgets:**

```dart
// SliverList.builder - Lazy list
// SliverList.separated - List with separators
// SliverGrid.count - Fixed column grid
// SliverGrid.extent - Max extent grid
// SliverToBoxAdapter - Single non-sliver widget
// SliverAppBar - Collapsible app bar
// SliverPersistentHeader - Sticky headers
// SliverFillRemaining - Fill remaining space
```

Use slivers when you have:
- Mixed lists and grids
- Pinned/floating headers
- Complex scroll effects
- Large amounts of scrollable content
