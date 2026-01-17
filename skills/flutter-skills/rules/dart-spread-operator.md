---
title: Use Spread Operator for Collection Merging
impact: LOW-MEDIUM
impactDescription: More efficient collection operations
tags: dart, spread, collections, merge
---

## Use Spread Operator for Collection Merging

Use the spread operator (`...`) for efficient collection merging instead of addAll or concatenation.

**Incorrect (multiple operations):**

```dart
List<int> combineNumbers() {
  var result = <int>[];
  result.addAll([1, 2, 3]);
  result.add(4);
  result.addAll([5, 6, 7]);
  return result;
}

// Or inefficient concatenation
List<int> combineNumbers() {
  return [1, 2, 3] + [4] + [5, 6, 7]; // Creates intermediate lists
}
```

**Correct (spread operator):**

```dart
List<int> combineNumbers() {
  return [...[1, 2, 3], 4, ...[5, 6, 7]];
}

// Or more readable:
List<int> combineNumbers() {
  const first = [1, 2, 3];
  const last = [5, 6, 7];
  return [...first, 4, ...last];
}
```

**Null-aware spread:**

```dart
List<Widget> buildWidgets(List<Widget>? extraWidgets) {
  return [
    const Header(),
    ...?extraWidgets, // Only spreads if not null
    const Footer(),
  ];
}
```

**With maps:**

```dart
Map<String, dynamic> mergeConfig(Map<String, dynamic> overrides) {
  return {
    'theme': 'dark',
    'fontSize': 14,
    ...overrides, // Overrides default values
  };
}
```

**In widget builders:**

```dart
@override
Widget build(BuildContext context) {
  return Row(
    children: [
      const LeadingIcon(),
      ...items.map((item) => ItemWidget(item: item)),
      if (showTrailing) ...[
        const Spacer(),
        const TrailingIcon(),
      ],
    ],
  );
}
```

Benefits:
- Single list creation
- More readable
- Works with const
- Null-safety with `...?`
