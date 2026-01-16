---
title: Use StringBuffer for String Concatenation
impact: LOW-MEDIUM
impactDescription: O(n) vs O(n²) for large strings
tags: dart, string, buffer, performance
---

## Use StringBuffer for String Concatenation

Use `StringBuffer` for building strings in loops to avoid O(n²) performance.

**Incorrect (quadratic time complexity):**

```dart
String buildHtml(List<Item> items) {
  var html = '<ul>';
  for (final item in items) {
    html += '<li>${item.name}</li>'; // Creates new string each iteration!
  }
  html += '</ul>';
  return html;
}
// For 1000 items: ~500,000 character copies
```

**Correct (linear time complexity):**

```dart
String buildHtml(List<Item> items) {
  final buffer = StringBuffer('<ul>');
  for (final item in items) {
    buffer.write('<li>${item.name}</li>'); // Efficient append
  }
  buffer.write('</ul>');
  return buffer.toString();
}
// For 1000 items: ~10,000 character copies
```

**Common patterns:**

```dart
// Building log messages
String formatLog(List<LogEntry> entries) {
  final buffer = StringBuffer();
  for (final entry in entries) {
    buffer
      ..write('[${entry.timestamp}] ')
      ..write(entry.level.name.toUpperCase())
      ..write(': ')
      ..writeln(entry.message);
  }
  return buffer.toString();
}

// With writeAll for simple cases
String joinItems(List<String> items) {
  final buffer = StringBuffer();
  buffer.writeAll(items, ', '); // Adds separator
  return buffer.toString();
}
```

**When += is fine:**
- Fixed number of concatenations (not in loop)
- Small strings
- Readability matters more than performance

```dart
// This is fine - constant number of operations
final message = 'Hello, ' + name + '! Welcome to ' + appName + '.';

// Or use interpolation (preferred)
final message = 'Hello, $name! Welcome to $appName.';
```

Rule of thumb: Use StringBuffer when concatenating in loops or building strings from many parts.
