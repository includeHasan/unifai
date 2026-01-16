---
title: Lift State to Appropriate Ancestor
impact: CRITICAL
impactDescription: Better data flow and testability
tags: state, architecture, lifting-state
---

## Lift State to Appropriate Ancestor

Keep state at the lowest common ancestor that needs it. Too high causes unnecessary rebuilds; too low causes prop drilling.

**Incorrect (state too high):**

```dart
// State in root causes entire app to rebuild
class BadApp extends StatefulWidget {
  @override
  State<BadApp> createState() => _BadAppState();
}

class _BadAppState extends State<BadApp> {
  int selectedTabIndex = 0; // All pages rebuild when tab changes!

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: HomePage(
        selectedTabIndex: selectedTabIndex,
        onTabChanged: (index) => setState(() => selectedTabIndex = index),
      ),
    );
  }
}
```

**Correct (state at appropriate level):**

```dart
// App is stateless, navigation state is localized
class GoodApp extends StatelessWidget {
  const GoodApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: HomePage(), // State managed internally
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int selectedTabIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: selectedTabIndex,
        children: const [
          FeedPage(),
          ProfilePage(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: selectedTabIndex,
        onTap: (index) => setState(() => selectedTabIndex = index),
        items: const [...],
      ),
    );
  }
}
```

**Guidelines:**
- If only one widget uses state, keep it local
- If siblings share state, lift to parent
- If distant widgets share state, consider InheritedWidget or Provider
