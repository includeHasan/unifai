---
title: Debounce or Throttle Expensive Operations
impact: HIGH
impactDescription: Reduces redundant operations by 90%+
tags: async, debounce, throttle, performance
---

## Debounce or Throttle Expensive Operations

Debounce rapid user input and throttle frequent events to avoid excessive API calls or computations.

**Incorrect (API call on every keystroke):**

```dart
class BadSearch extends StatefulWidget {
  @override
  State<BadSearch> createState() => _BadSearchState();
}

class _BadSearchState extends State<BadSearch> {
  @override
  Widget build(BuildContext context) {
    return TextField(
      onChanged: (query) {
        // Called on EVERY keystroke - too many API calls!
        searchApi(query);
      },
    );
  }
}
```

**Correct (debounced search):**

```dart
class GoodSearch extends StatefulWidget {
  const GoodSearch({super.key});

  @override
  State<GoodSearch> createState() => _GoodSearchState();
}

class _GoodSearchState extends State<GoodSearch> {
  Timer? _debounce;

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      searchApi(query); // Only calls when user stops typing
    });
  }

  @override
  Widget build(BuildContext context) {
    return TextField(onChanged: _onSearchChanged);
  }
}
```

**Throttle for continuous events:**

```dart
class ThrottledScroll extends StatefulWidget {
  const ThrottledScroll({super.key});

  @override
  State<ThrottledScroll> createState() => _ThrottledScrollState();
}

class _ThrottledScrollState extends State<ThrottledScroll> {
  DateTime? _lastCall;
  static const throttleDuration = Duration(milliseconds: 100);

  void _onScroll(ScrollNotification notification) {
    final now = DateTime.now();
    if (_lastCall == null || now.difference(_lastCall!) > throttleDuration) {
      _lastCall = now;
      // Perform expensive operation
      updateScrollPosition(notification.metrics.pixels);
    }
  }

  @override
  Widget build(BuildContext context) {
    return NotificationListener<ScrollNotification>(
      onNotification: (notification) {
        _onScroll(notification);
        return false;
      },
      child: ListView.builder(...),
    );
  }
}
```

**When to use:**
- **Debounce**: Search inputs, form validation, resize observers
- **Throttle**: Scroll events, mouse move, continuous gestures
