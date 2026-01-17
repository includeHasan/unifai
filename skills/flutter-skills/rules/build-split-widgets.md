---
title: Split Large Widgets
impact: CRITICAL
impactDescription: Improved maintainability and rebuild control
tags: widgets, composition, rebuild, architecture
---

## Split Large Widgets

Break large build methods into smaller, focused widget classes. This improves code readability, testability, and allows Flutter to optimize rebuilds.

**Incorrect (monolithic build method):**

```dart
class BadProfilePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Profile')),
      body: Column(
        children: [
          Container(
            padding: EdgeInsets.all(16),
            child: Row(
              children: [
                CircleAvatar(radius: 50, backgroundImage: NetworkImage('...')),
                SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('John Doe', style: TextStyle(fontSize: 24)),
                    Text('john@example.com'),
                    // ... 50 more lines of UI code
                  ],
                ),
              ],
            ),
          ),
          // ... hundreds more lines
        ],
      ),
    );
  }
}
```

**Correct (composed smaller widgets):**

```dart
class GoodProfilePage extends StatelessWidget {
  const GoodProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: ProfileAppBar(),
      body: Column(
        children: [
          ProfileHeader(),
          ProfileStats(),
          ProfileActions(),
        ],
      ),
    );
  }
}

class ProfileHeader extends StatelessWidget {
  const ProfileHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.all(16),
      child: Row(
        children: [
          ProfileAvatar(),
          SizedBox(width: 16),
          ProfileInfo(),
        ],
      ),
    );
  }
}

class ProfileAvatar extends StatelessWidget {
  const ProfileAvatar({super.key});

  @override
  Widget build(BuildContext context) {
    return const CircleAvatar(
      radius: 50,
      backgroundImage: NetworkImage('...'),
    );
  }
}
```

Rule of thumb: If a build method exceeds 40 lines, consider splitting it.
