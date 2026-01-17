---
title: Cancel Stream Subscriptions on Dispose
impact: HIGH
impactDescription: Prevents memory leaks and errors
tags: async, streams, dispose, memory
---

## Cancel Stream Subscriptions on Dispose

Always cancel stream subscriptions in `dispose()` to prevent memory leaks and errors from updates to disposed widgets.

**Incorrect (subscription never cancelled):**

```dart
class BadStreamWidget extends StatefulWidget {
  @override
  State<BadStreamWidget> createState() => _BadStreamWidgetState();
}

class _BadStreamWidgetState extends State<BadStreamWidget> {
  String data = '';

  @override
  void initState() {
    super.initState();
    // This subscription will leak!
    myStream.listen((value) {
      setState(() => data = value);
    });
  }

  @override
  Widget build(BuildContext context) => Text(data);
}
```

**Correct (subscription cancelled on dispose):**

```dart
class GoodStreamWidget extends StatefulWidget {
  const GoodStreamWidget({super.key});

  @override
  State<GoodStreamWidget> createState() => _GoodStreamWidgetState();
}

class _GoodStreamWidgetState extends State<GoodStreamWidget> {
  String data = '';
  StreamSubscription<String>? _subscription;

  @override
  void initState() {
    super.initState();
    _subscription = myStream.listen((value) {
      setState(() => data = value);
    });
  }

  @override
  void dispose() {
    _subscription?.cancel(); // Critical!
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Text(data);
}
```

**Or use StreamBuilder (handles subscription automatically):**

```dart
class BetterStreamWidget extends StatelessWidget {
  const BetterStreamWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<String>(
      stream: myStream,
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          return Text(snapshot.data!);
        }
        return const CircularProgressIndicator();
      },
    );
  }
}
```

**Multiple subscriptions pattern:**

```dart
class _MultiStreamState extends State<MultiStreamWidget> {
  final List<StreamSubscription> _subscriptions = [];

  @override
  void initState() {
    super.initState();
    _subscriptions.add(stream1.listen((_) {}));
    _subscriptions.add(stream2.listen((_) {}));
  }

  @override
  void dispose() {
    for (final sub in _subscriptions) {
      sub.cancel();
    }
    super.dispose();
  }
}
```
