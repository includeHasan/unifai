---
title: Use final and const Appropriately
impact: LOW-MEDIUM
impactDescription: Enables compiler optimizations
tags: dart, final, const, immutability
---

## Use final and const Appropriately

Use `final` for runtime constants and `const` for compile-time constants to enable optimizations.

**Incorrect (no immutability hints):**

```dart
class BadExample {
  var name = 'John';           // Mutable - can change
  var items = <String>[];      // Mutable list
  var config = {'key': 'value'}; // Mutable map
  
  void process() {
    var result = calculateSomething(); // Not marked final
    print(result);
    // result could accidentally be reassigned
  }
}
```

**Correct (proper const/final usage):**

```dart
class GoodExample {
  final String name = 'John';  // Runtime immutable
  final List<String> items;    // Reference immutable
  
  // Compile-time constant
  static const defaultConfig = {'key': 'value'};
  
  // Const constructor enables const instances
  const GoodExample({required this.items});
  
  void process() {
    final result = calculateSomething(); // Cannot reassign
    print(result);
  }
}

// Usage
const instance = GoodExample(items: ['a', 'b']); // Compile-time constant
```

**const collections:**

```dart
// Incorrect - creates new list each time
Widget build(BuildContext context) {
  return Row(children: [Text('A'), Text('B')]);
}

// Correct - reuses same list
Widget build(BuildContext context) {
  return const Row(children: [Text('A'), Text('B')]);
}
```

**Guidelines:**
- Use `const` for values known at compile time
- Use `final` for values computed at runtime but never changed
- Prefer `const` constructors in widgets
- Use `const` for default parameter values
- Enable `prefer_const_declarations` lint
