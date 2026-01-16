---
title: Avoid Unnecessary Rebuilds
impact: CRITICAL
impactDescription: 40-60% performance improvement
tags: widgets, rebuild, setState, performance
---

## Avoid Unnecessary Rebuilds

Extract child widgets into separate classes instead of inline definitions to prevent rebuilding unchanged parts of the widget tree.

**Incorrect (entire subtree rebuilds on setState):**

```dart
class BadCounter extends StatefulWidget {
  @override
  State<BadCounter> createState() => _BadCounterState();
}

class _BadCounterState extends State<BadCounter> {
  int count = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // This expensive widget rebuilds every time count changes!
        ExpensiveWidget(),
        Text('Count: $count'),
        ElevatedButton(
          onPressed: () => setState(() => count++),
          child: Text('Increment'),
        ),
      ],
    );
  }
}
```

**Correct (expensive widget extracted and const):**

```dart
class GoodCounter extends StatefulWidget {
  const GoodCounter({super.key});

  @override
  State<GoodCounter> createState() => _GoodCounterState();
}

class _GoodCounterState extends State<GoodCounter> {
  int count = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // This widget won't rebuild - it's a separate const widget
        const ExpensiveWidget(),
        Text('Count: $count'),
        ElevatedButton(
          onPressed: () => setState(() => count++),
          child: const Text('Increment'),
        ),
      ],
    );
  }
}

class ExpensiveWidget extends StatelessWidget {
  const ExpensiveWidget({super.key});

  @override
  Widget build(BuildContext context) {
    // Expensive computation here
    return const SizedBox.shrink();
  }
}
```

Use Flutter DevTools widget rebuild indicator to identify unnecessary rebuilds.
