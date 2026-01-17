---
title: Use Const Constructors
impact: CRITICAL
impactDescription: 30-50% rebuild reduction
tags: widgets, const, rebuild, performance
---

## Use Const Constructors

Mark widgets with `const` constructors to prevent unnecessary rebuilds. Flutter can skip rebuilding const widgets since they're guaranteed to be identical.

**Incorrect (rebuilds every time parent rebuilds):**

```dart
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Hello'),
        Icon(Icons.star),
        Padding(
          padding: EdgeInsets.all(8.0),
          child: Text('World'),
        ),
      ],
    );
  }
}
```

**Correct (skips rebuild for const widgets):**

```dart
class MyWidget extends StatelessWidget {
  const MyWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      children: [
        Text('Hello'),
        Icon(Icons.star),
        Padding(
          padding: EdgeInsets.all(8.0),
          child: Text('World'),
        ),
      ],
    );
  }
}
```

Enable `prefer_const_constructors` lint rule in `analysis_options.yaml` to catch missing const keywords.

Reference: [Flutter Performance Best Practices](https://docs.flutter.dev/perf/best-practices)
