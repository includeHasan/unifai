---
title: Use Keys Appropriately
impact: CRITICAL
impactDescription: Prevents widget identity issues
tags: widgets, keys, lists, rebuild
---

## Use Keys Appropriately

Use keys to preserve widget state and identity, especially in dynamic lists. Keys help Flutter correctly match widgets between rebuilds.

**Incorrect (no keys, causes state issues):**

```dart
class BadTodoList extends StatelessWidget {
  final List<Todo> todos;
  
  @override
  Widget build(BuildContext context) {
    return ListView(
      children: todos.map((todo) {
        // Without keys, Flutter may reuse wrong widgets
        return TodoItem(todo: todo);
      }).toList(),
    );
  }
}
```

**Correct (ValueKey for unique identifiers):**

```dart
class GoodTodoList extends StatelessWidget {
  final List<Todo> todos;
  
  const GoodTodoList({super.key, required this.todos});

  @override
  Widget build(BuildContext context) {
    return ListView(
      children: todos.map((todo) {
        // ValueKey ensures correct widget identity
        return TodoItem(
          key: ValueKey(todo.id),
          todo: todo,
        );
      }).toList(),
    );
  }
}
```

**Key Types:**

```dart
// ValueKey - for unique values
ValueKey(item.id)

// ObjectKey - for unique object instances
ObjectKey(item)

// UniqueKey - creates new identity each build (use sparingly)
UniqueKey()

// GlobalKey - for accessing state across tree (expensive, use rarely)
final GlobalKey<FormState> formKey = GlobalKey<FormState>();
```

Always use keys when:
- Items in a list can be reordered, added, or removed
- Widget state should be preserved during tree modifications
- Animating list items with AnimatedList

Reference: [When to Use Keys](https://medium.com/flutter/keys-what-are-they-good-for-13cb51742e7d)
