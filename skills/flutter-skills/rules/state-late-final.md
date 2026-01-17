---
title: Use late final for Lazy Initialization
impact: CRITICAL
impactDescription: Deferred expensive initialization
tags: state, late, lazy, initialization
---

## Use late final for Lazy Initialization

Use `late final` to defer expensive initialization until first access, avoiding startup cost.

**Incorrect (initialized immediately):**

```dart
class ExpensiveService {
  ExpensiveService() {
    // Heavy initialization runs on app startup
    _loadData();
  }
  
  void _loadData() {
    // Expensive operation
  }
}

// Global instance initialized immediately on import
final service = ExpensiveService();
```

**Correct (lazy initialization):**

```dart
class ExpensiveService {
  ExpensiveService._();
  
  static late final ExpensiveService instance = ExpensiveService._();
  
  void doWork() {
    // Now initialization happens only when first called
  }
}

// Usage - initialization deferred until first access
ExpensiveService.instance.doWork();
```

**In widgets:**

```dart
class MyWidget extends StatefulWidget {
  const MyWidget({super.key});

  @override
  State<MyWidget> createState() => _MyWidgetState();
}

class _MyWidgetState extends State<MyWidget> {
  // Initialized lazily when first accessed
  late final TextEditingController controller = TextEditingController();
  late final FocusNode focusNode = FocusNode();
  
  // Can depend on widget properties
  late final String processedData = _processExpensive(widget.rawData);

  String _processExpensive(String data) {
    // Heavy computation only runs once
    return data.toUpperCase();
  }

  @override
  void dispose() {
    controller.dispose();
    focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      focusNode: focusNode,
    );
  }
}
```

**Benefits:**
- Faster app startup
- Memory not allocated until needed
- Works with `final` immutability guarantees
