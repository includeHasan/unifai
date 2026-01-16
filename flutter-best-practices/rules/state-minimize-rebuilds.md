---
title: Minimize Widget Tree Rebuilds
impact: CRITICAL
impactDescription: 50-70% fewer rebuilds
tags: state, provider, consumer, rebuild
---

## Minimize Widget Tree Rebuilds

Use granular state management to rebuild only the widgets that need updates, not entire subtrees.

**Incorrect (entire tree rebuilds):**

```dart
class BadCounter extends StatefulWidget {
  @override
  State<BadCounter> createState() => _BadCounterState();
}

class _BadCounterState extends State<BadCounter> {
  int count = 0;

  @override
  Widget build(BuildContext context) {
    // Entire widget tree rebuilds on every increment
    return Scaffold(
      body: Column(
        children: [
          const HeavyWidget(), // Rebuilds unnecessarily!
          Text('Count: $count'),
          ElevatedButton(
            onPressed: () => setState(() => count++),
            child: const Text('Increment'),
          ),
        ],
      ),
    );
  }
}
```

**Correct with ValueListenableBuilder:**

```dart
class GoodCounter extends StatefulWidget {
  const GoodCounter({super.key});

  @override
  State<GoodCounter> createState() => _GoodCounterState();
}

class _GoodCounterState extends State<GoodCounter> {
  final ValueNotifier<int> count = ValueNotifier(0);

  @override
  void dispose() {
    count.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          const HeavyWidget(), // Does NOT rebuild!
          ValueListenableBuilder<int>(
            valueListenable: count,
            builder: (context, value, child) {
              return Text('Count: $value'); // Only this rebuilds
            },
          ),
          ElevatedButton(
            onPressed: () => count.value++,
            child: const Text('Increment'),
          ),
        ],
      ),
    );
  }
}
```

**With Provider:**

```dart
// Only the Consumer widget rebuilds
Consumer<CounterModel>(
  builder: (context, counter, child) {
    return Text('Count: ${counter.value}');
  },
)
```

Use Flutter DevTools to visualize rebuild frequency.
