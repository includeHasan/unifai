# Flutter Best Practices

Comprehensive patterns and guidelines for Flutter/Dart development. AI agents should reference this when writing, reviewing, or refactoring Flutter code.

## When to Apply

Use these guidelines when:
- Writing new Flutter widgets or Dart code
- Reviewing Flutter code for best practices
- Refactoring existing Flutter applications
- Implementing state management
- Optimizing Flutter performance

## Quick Reference

### Widget Patterns

| Pattern | Use When |
|---------|----------|
| StatelessWidget | No internal state, pure UI |
| StatefulWidget | Has internal state that changes |
| ConsumerWidget (Riverpod) | Needs to watch providers |
| const constructors | Widget tree optimization |

### State Management Priority

1. **Local state** → `setState`, `ValueNotifier`
2. **Feature state** → Riverpod, Bloc, GetX
3. **App state** → Inherited widgets, global providers

---

## Core Principles

### 1. Prefer Composition Over Inheritance

**Incorrect:**
```dart
class CustomButton extends ElevatedButton {
  // Don't extend framework widgets
}
```

**Correct:**
```dart
class CustomButton extends StatelessWidget {
  final VoidCallback onPressed;
  final String text;
  
  const CustomButton({
    required this.onPressed,
    required this.text,
    super.key,
  });
  
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      child: Text(text),
    );
  }
}
```

### 2. Use const Constructors

**Incorrect:**
```dart
Container(
  padding: EdgeInsets.all(16), // Creates new instance each build
  child: Text('Hello'),
)
```

**Correct:**
```dart
Container(
  padding: const EdgeInsets.all(16), // Reuses instance
  child: const Text('Hello'),
)
```

### 3. Extract Widgets, Not Methods

**Incorrect:**
```dart
class MyPage extends StatelessWidget {
  Widget _buildHeader() {
    return Container(...); // Method, rebuilds every time
  }
}
```

**Correct:**
```dart
class _Header extends StatelessWidget {
  const _Header();
  
  @override
  Widget build(BuildContext context) {
    return Container(...); // Separate widget, optimized
  }
}
```

### 4. Avoid BuildContext Across Async Gaps

**Incorrect:**
```dart
onPressed: () async {
  await someAsyncOperation();
  Navigator.of(context).pop(); // Context may be invalid
}
```

**Correct:**
```dart
onPressed: () async {
  await someAsyncOperation();
  if (!context.mounted) return;
  Navigator.of(context).pop();
}
```

---

## Performance Patterns

### ListView Optimization

**Use `ListView.builder` for large lists:**
```dart
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ItemWidget(item: items[index]),
)
```

**Add `itemExtent` for fixed-height items:**
```dart
ListView.builder(
  itemCount: items.length,
  itemExtent: 72.0, // Known height = faster scrolling
  itemBuilder: (context, index) => ItemWidget(item: items[index]),
)
```

### Image Optimization

```dart
Image.network(
  url,
  cacheWidth: 200,  // Resize in memory
  cacheHeight: 200,
  fit: BoxFit.cover,
)
```

### RepaintBoundary for Complex Widgets

```dart
RepaintBoundary(
  child: ComplexAnimatedWidget(), // Isolated repaint
)
```

---

## Project Structure

```
lib/
├── main.dart
├── app/
│   ├── app.dart           # MaterialApp configuration
│   └── routes.dart        # Route definitions
├── core/
│   ├── constants/
│   ├── theme/
│   └── utils/
├── features/
│   └── feature_name/
│       ├── data/          # Repositories, data sources
│       ├── domain/        # Entities, use cases
│       └── presentation/  # Widgets, controllers
└── shared/
    └── widgets/           # Reusable widgets
```

---

## Detailed References

- [State Management Patterns](references/state-management.md)
- [Widget Patterns](references/widget-patterns.md)
- [Performance Optimization](references/performance.md)
- [Testing Strategies](references/testing.md)
