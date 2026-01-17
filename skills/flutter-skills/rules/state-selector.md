---
title: Use Selector Patterns
impact: CRITICAL
impactDescription: Rebuild only affected widgets
tags: state, selector, provider, rebuild
---

## Use Selector Patterns

Use selectors to subscribe only to specific properties, not entire objects. This prevents rebuilds when unrelated properties change.

**Incorrect (rebuilds on any change):**

```dart
class UserProfile extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // Rebuilds when ANY user property changes
    final user = context.watch<UserModel>();
    
    return Text(user.name); // Only uses name!
  }
}
```

**Correct with Selector:**

```dart
class UserProfile extends StatelessWidget {
  const UserProfile({super.key});

  @override
  Widget build(BuildContext context) {
    // Only rebuilds when name changes
    final name = context.select<UserModel, String>((user) => user.name);
    
    return Text(name);
  }
}
```

**With Provider Selector widget:**

```dart
Selector<UserModel, String>(
  selector: (context, user) => user.name,
  builder: (context, name, child) {
    return Text(name);
  },
)
```

**Multiple selections:**

```dart
Selector<UserModel, ({String name, String email})>(
  selector: (context, user) => (name: user.name, email: user.email),
  builder: (context, data, child) {
    return Column(
      children: [
        Text(data.name),
        Text(data.email),
      ],
    );
  },
)
```

**With Riverpod:**

```dart
// Define a provider that selects only what you need
final userNameProvider = Provider<String>((ref) {
  return ref.watch(userProvider).name;
});

// Widget only rebuilds when name changes
class UserNameWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final name = ref.watch(userNameProvider);
    return Text(name);
  }
}
```

Always use selectors when a widget only needs a subset of a model's data.
