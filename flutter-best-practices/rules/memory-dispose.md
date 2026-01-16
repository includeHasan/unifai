---
title: Always Dispose Controllers and Listeners
impact: HIGH
impactDescription: Prevents memory leaks
tags: memory, dispose, controllers, lifecycle
---

## Always Dispose Controllers and Listeners

Every controller, animation, focus node, and listener must be disposed in the `dispose()` method.

**Incorrect (memory leak):**

```dart
class BadWidget extends StatefulWidget {
  @override
  State<BadWidget> createState() => _BadWidgetState();
}

class _BadWidgetState extends State<BadWidget> {
  final controller = TextEditingController();
  final scrollController = ScrollController();
  final focusNode = FocusNode();
  
  // No dispose method - memory leak!

  @override
  Widget build(BuildContext context) {
    return TextField(controller: controller, focusNode: focusNode);
  }
}
```

**Correct (proper disposal):**

```dart
class GoodWidget extends StatefulWidget {
  const GoodWidget({super.key});

  @override
  State<GoodWidget> createState() => _GoodWidgetState();
}

class _GoodWidgetState extends State<GoodWidget>
    with SingleTickerProviderStateMixin {
  late final TextEditingController controller;
  late final ScrollController scrollController;
  late final FocusNode focusNode;
  late final AnimationController animationController;

  @override
  void initState() {
    super.initState();
    controller = TextEditingController();
    scrollController = ScrollController();
    focusNode = FocusNode();
    animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
  }

  @override
  void dispose() {
    controller.dispose();
    scrollController.dispose();
    focusNode.dispose();
    animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return TextField(controller: controller, focusNode: focusNode);
  }
}
```

**Common things to dispose:**
- `TextEditingController`
- `ScrollController`
- `PageController`
- `AnimationController`
- `FocusNode`
- `TabController`
- `StreamSubscription`
- `Timer`
- Custom `ChangeNotifier` instances

Enable `close_sinks` and `cancel_subscriptions` lint rules to catch missing disposals.
