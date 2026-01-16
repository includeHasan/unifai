---
title: Use FutureBuilder for Async UI Updates
impact: HIGH
impactDescription: Clean async data handling
tags: async, future, builder, ui
---

## Use FutureBuilder for Async UI Updates

Use FutureBuilder to handle async data loading declaratively, with proper loading and error states.

**Incorrect (manual state management):**

```dart
class BadAsyncWidget extends StatefulWidget {
  @override
  State<BadAsyncWidget> createState() => _BadAsyncWidgetState();
}

class _BadAsyncWidgetState extends State<BadAsyncWidget> {
  String? data;
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final result = await fetchData();
      setState(() {
        data = result;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) return CircularProgressIndicator();
    if (error != null) return Text('Error: $error');
    return Text(data!);
  }
}
```

**Correct (FutureBuilder handles states):**

```dart
class GoodAsyncWidget extends StatelessWidget {
  const GoodAsyncWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<String>(
      future: fetchData(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const CircularProgressIndicator();
        }
        
        if (snapshot.hasError) {
          return Text('Error: ${snapshot.error}');
        }
        
        return Text(snapshot.data!);
      },
    );
  }
}
```

**Cache the future (avoid refetching on rebuild):**

```dart
class CachedAsyncWidget extends StatefulWidget {
  const CachedAsyncWidget({super.key});

  @override
  State<CachedAsyncWidget> createState() => _CachedAsyncWidgetState();
}

class _CachedAsyncWidgetState extends State<CachedAsyncWidget> {
  late final Future<String> _dataFuture = fetchData();

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<String>(
      future: _dataFuture, // Same instance across rebuilds
      builder: (context, snapshot) {
        // ... handle states
      },
    );
  }
}
```

**Important:** Always store Future in state or use `useMemoized` hook to prevent refetching on every build.
