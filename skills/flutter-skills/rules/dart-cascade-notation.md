---
title: Use Cascade Notation for Multiple Operations
impact: LOW-MEDIUM
impactDescription: Cleaner code, fewer intermediate variables
tags: dart, cascade, notation, chaining
---

## Use Cascade Notation for Multiple Operations

Use cascade notation (`..`) to perform multiple operations on the same object without repeating the reference.

**Incorrect (repeated object reference):**

```dart
void setupController() {
  final controller = TextEditingController();
  controller.text = 'Initial value';
  controller.selection = TextSelection.collapsed(offset: 0);
  controller.addListener(onChanged);
  return controller;
}

// Or with builder pattern feeling clunky:
void buildRequest() {
  final request = HttpRequest();
  request.method = 'POST';
  request.headers['Content-Type'] = 'application/json';
  request.body = jsonEncode(data);
  return request.send();
}
```

**Correct (cascade notation):**

```dart
TextEditingController setupController() {
  return TextEditingController()
    ..text = 'Initial value'
    ..selection = const TextSelection.collapsed(offset: 0)
    ..addListener(onChanged);
}

Future<Response> buildRequest() {
  return (HttpRequest()
        ..method = 'POST'
        ..headers['Content-Type'] = 'application/json'
        ..body = jsonEncode(data))
      .send();
}
```

**Common use cases:**

```dart
// Paint configuration
final paint = Paint()
  ..color = Colors.blue
  ..strokeWidth = 2.0
  ..style = PaintingStyle.stroke
  ..strokeCap = StrokeCap.round;

// Path building
final path = Path()
  ..moveTo(0, 0)
  ..lineTo(100, 0)
  ..lineTo(100, 100)
  ..close();

// List population
final items = <String>[]
  ..add('first')
  ..addAll(['second', 'third'])
  ..sort();
```

**Null-aware cascade (Dart 2.12+):**

```dart
// Only cascades if object is not null
paint
  ?..color = Colors.red
  ..strokeWidth = 3.0;
```

**Benefits:**
- Less repetition
- Cleaner initialization
- Returns the object (unlike method calls)
- Works great with builders
