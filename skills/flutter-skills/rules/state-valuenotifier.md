---
title: Use ValueNotifier for Simple Reactive State
impact: CRITICAL
impactDescription: Lightweight alternative to full state management
tags: state, valuenotifier, reactive
---

## Use ValueNotifier for Simple Reactive State

For simple reactive values, use ValueNotifier instead of full state management solutions. It's built-in and lightweight.

**Incorrect (overkill for simple state):**

```dart
// Using heavy state management for a simple toggle
class ThemeProvider extends ChangeNotifier {
  bool _isDark = false;
  bool get isDark => _isDark;
  
  void toggle() {
    _isDark = !_isDark;
    notifyListeners();
  }
}

// Requires Provider setup, consumer widgets, etc.
```

**Correct (ValueNotifier for simple cases):**

```dart
class ThemeSwitcher extends StatelessWidget {
  // Simple reactive value
  static final ValueNotifier<bool> isDark = ValueNotifier(false);

  const ThemeSwitcher({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<bool>(
      valueListenable: isDark,
      builder: (context, isDarkMode, child) {
        return Switch(
          value: isDarkMode,
          onChanged: (value) => isDark.value = value,
        );
      },
    );
  }
}
```

**With disposal in StatefulWidget:**

```dart
class CounterWidget extends StatefulWidget {
  const CounterWidget({super.key});

  @override
  State<CounterWidget> createState() => _CounterWidgetState();
}

class _CounterWidgetState extends State<CounterWidget> {
  final counter = ValueNotifier<int>(0);

  @override
  void dispose() {
    counter.dispose(); // Always dispose!
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<int>(
      valueListenable: counter,
      builder: (context, count, _) => Text('$count'),
    );
  }
}
```

Use ValueNotifier when:
- State is a single value or simple object
- State doesn't need complex business logic
- You don't need features like persistence or middleware
