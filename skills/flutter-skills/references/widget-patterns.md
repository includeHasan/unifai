# Widget Patterns

Common widget patterns and best practices for Flutter.

---

## 1. Stateless vs Stateful

### Use StatelessWidget When:
- Widget only depends on constructor parameters
- No internal state changes
- Data flows down from parent

```dart
class UserCard extends StatelessWidget {
  final User user;
  
  const UserCard({required this.user, super.key});
  
  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(user.name),
        subtitle: Text(user.email),
      ),
    );
  }
}
```

### Use StatefulWidget When:
- Widget has changing internal state
- Needs lifecycle methods (initState, dispose)
- Manages animations, controllers, or streams

```dart
class SearchField extends StatefulWidget {
  final ValueChanged<String> onSearch;
  
  const SearchField({required this.onSearch, super.key});
  
  @override
  State<SearchField> createState() => _SearchFieldState();
}

class _SearchFieldState extends State<SearchField> {
  late final TextEditingController _controller;
  
  @override
  void initState() {
    super.initState();
    _controller = TextEditingController();
  }
  
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: _controller,
      onSubmitted: widget.onSearch,
    );
  }
}
```

---

## 2. Slot Pattern

Allow customization via widget slots.

```dart
class CustomCard extends StatelessWidget {
  final Widget? leading;
  final Widget title;
  final Widget? subtitle;
  final Widget? trailing;
  
  const CustomCard({
    this.leading,
    required this.title,
    this.subtitle,
    this.trailing,
    super.key,
  });
  
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            if (leading != null) ...[leading!, const SizedBox(width: 16)],
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  title,
                  if (subtitle != null) subtitle!,
                ],
              ),
            ),
            if (trailing != null) trailing!,
          ],
        ),
      ),
    );
  }
}
```

---

## 3. Builder Pattern

Defer widget creation to caller.

```dart
class DataLoader<T> extends StatelessWidget {
  final Future<T> future;
  final Widget Function(BuildContext context, T data) builder;
  final Widget? loading;
  final Widget Function(Object error)? errorBuilder;
  
  const DataLoader({
    required this.future,
    required this.builder,
    this.loading,
    this.errorBuilder,
    super.key,
  });
  
  @override
  Widget build(BuildContext context) {
    return FutureBuilder<T>(
      future: future,
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          return builder(context, snapshot.data as T);
        }
        if (snapshot.hasError) {
          return errorBuilder?.call(snapshot.error!) ?? 
            Text('Error: ${snapshot.error}');
        }
        return loading ?? const CircularProgressIndicator();
      },
    );
  }
}

// Usage
DataLoader<User>(
  future: userRepository.getUser(),
  builder: (context, user) => UserCard(user: user),
)
```

---

## 4. HookWidget Pattern (flutter_hooks)

Reduce boilerplate with hooks.

```dart
class SearchPage extends HookWidget {
  const SearchPage({super.key});
  
  @override
  Widget build(BuildContext context) {
    final controller = useTextEditingController();
    final focusNode = useFocusNode();
    final debouncer = useDebouncer(duration: const Duration(milliseconds: 300));
    
    useEffect(() {
      controller.addListener(() {
        debouncer.run(() => performSearch(controller.text));
      });
      return null;
    }, [controller]);
    
    return TextField(
      controller: controller,
      focusNode: focusNode,
    );
  }
}
```

---

## 5. Compound Widget Pattern

Create widget families that work together.

```dart
class SettingsGroup extends StatelessWidget {
  final String title;
  final List<SettingsItem> items;
  
  const SettingsGroup({
    required this.title,
    required this.items,
    super.key,
  });
  
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Text(title, style: Theme.of(context).textTheme.titleMedium),
        ),
        ...items,
      ],
    );
  }
}

class SettingsItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;
  
  const SettingsItem({
    required this.icon,
    required this.title,
    required this.onTap,
    super.key,
  });
  
  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}

// Usage
SettingsGroup(
  title: 'Account',
  items: [
    SettingsItem(icon: Icons.person, title: 'Profile', onTap: () {}),
    SettingsItem(icon: Icons.security, title: 'Security', onTap: () {}),
  ],
)
```

---

## 6. Key Usage

### When to use Keys:
- Items in a list that can reorder
- Widgets that need to preserve state
- Form fields that might swap

```dart
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    final item = items[index];
    return ItemWidget(
      key: ValueKey(item.id), // Preserve state during reorder
      item: item,
    );
  },
)
```
