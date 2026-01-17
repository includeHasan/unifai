# Flutter Best Practices

**Version 1.0.0**  
Community Engineering  
January 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring Flutter and Dart codebases. Humans  
> may also find it useful, but guidance here is optimized for automation  
> and consistency by AI-assisted workflows.

---

## Abstract

Comprehensive performance optimization guide for Flutter and Dart applications, designed for AI agents and LLMs. Contains 40 rules across 8 categories, prioritized by impact from critical (widget build optimization, state management) to incremental (advanced patterns). Each rule includes detailed explanations, real-world examples comparing incorrect vs. correct implementations, and specific impact metrics to guide automated refactoring and code generation.

---

## Table of Contents

1. [Widget Build Optimization](#1-widget-build-optimization) — **CRITICAL**
   - 1.1 [Use Const Constructors](#11-use-const-constructors)
   - 1.2 [Avoid Unnecessary Rebuilds](#12-avoid-unnecessary-rebuilds)
   - 1.3 [Split Large Widgets](#13-split-large-widgets)
   - 1.4 [Use Keys Appropriately](#14-use-keys-appropriately)
   - 1.5 [Use itemExtent for Fixed-Size List Items](#15-use-itemextent-for-fixed-size-list-items)
2. [State Management](#2-state-management) — **CRITICAL**
   - 2.1 [Minimize Widget Tree Rebuilds](#21-minimize-widget-tree-rebuilds)
   - 2.2 [Lift State to Appropriate Ancestor](#22-lift-state-to-appropriate-ancestor)
   - 2.3 [Use ValueNotifier for Simple Reactive State](#23-use-valuenotifier-for-simple-reactive-state)
   - 2.4 [Use Selector Patterns](#24-use-selector-patterns)
   - 2.5 [Use late final for Lazy Initialization](#25-use-late-final-for-lazy-initialization)
3. [Async Performance](#3-async-performance) — **HIGH**
   - 3.1 [Use FutureBuilder for Async UI Updates](#31-use-futurebuilder-for-async-ui-updates)
   - 3.2 [Execute Independent Async Operations in Parallel](#32-execute-independent-async-operations-in-parallel)
   - 3.3 [Cancel Stream Subscriptions on Dispose](#33-cancel-stream-subscriptions-on-dispose)
   - 3.4 [Debounce or Throttle Expensive Operations](#34-debounce-or-throttle-expensive-operations)
   - 3.5 [Use compute() for Heavy Synchronous Work](#35-use-compute-for-heavy-synchronous-work)
4. [Memory Management](#4-memory-management) — **HIGH**
   - 4.1 [Always Dispose Controllers and Listeners](#41-always-dispose-controllers-and-listeners)
   - 4.2 [Configure Image Cache Limits](#42-configure-image-cache-limits)
   - 4.3 [Precache Images for Smooth Loading](#43-precache-images-for-smooth-loading)
   - 4.4 [Use Weak References for Large Cached Objects](#44-use-weak-references-for-large-cached-objects)
   - 4.5 [Use Isolates for Memory-Intensive Operations](#45-use-isolates-for-memory-intensive-operations)
5. [Layout Performance](#5-layout-performance) — **MEDIUM**
   - 5.1 [Use AnimatedOpacity Instead of Opacity](#51-use-animatedopacity-instead-of-opacity)
   - 5.2 [Set clipBehavior.none When Not Needed](#52-set-clipbehaviornone-when-not-needed)
   - 5.3 [Avoid Intrinsic Dimension Widgets in Scrolling](#53-avoid-intrinsic-dimension-widgets-in-scrolling)
   - 5.4 [Use Slivers for Efficient Scrollable Layouts](#54-use-slivers-for-efficient-scrollable-layouts)
   - 5.5 [Use RepaintBoundary to Isolate Repaints](#55-use-repaintboundary-to-isolate-repaints)
6. [Animation Performance](#6-animation-performance) — **MEDIUM**
   - 6.1 [Use AnimatedBuilder Over setState](#61-use-animatedbuilder-over-setstate)
   - 6.2 [Use TweenSequence for Complex Animations](#62-use-tweensequence-for-complex-animations)
   - 6.3 [Use Physics-Based Animations](#63-use-physics-based-animations)
   - 6.4 [Cache Animation Frames When Possible](#64-cache-animation-frames-when-possible)
   - 6.5 [Minimize Overdraw in Animations](#65-minimize-overdraw-in-animations)
7. [Dart Performance](#7-dart-performance) — **LOW-MEDIUM**
   - 7.1 [Use final and const Appropriately](#71-use-final-and-const-appropriately)
   - 7.2 [Use Collection-if Instead of Conditional Logic](#72-use-collection-if-instead-of-conditional-logic)
   - 7.3 [Use Spread Operator for Collection Merging](#73-use-spread-operator-for-collection-merging)
   - 7.4 [Use Cascade Notation for Multiple Operations](#74-use-cascade-notation-for-multiple-operations)
   - 7.5 [Avoid Dynamic Types](#75-avoid-dynamic-types)
   - 7.6 [Use StringBuffer for String Concatenation](#76-use-stringbuffer-for-string-concatenation)
8. [Advanced Patterns](#8-advanced-patterns) — **LOW**
   - 8.1 [Use SliverPersistentHeader for Sticky Headers](#81-use-sliverpersistentheader-for-sticky-headers)
   - 8.2 [Use LayerLink for Efficient Overlay Positioning](#82-use-layerlink-for-efficient-overlay-positioning)
   - 8.3 [Optimize CustomPainter for Complex Rendering](#83-optimize-custompainter-for-complex-rendering)
   - 8.4 [Create Custom RenderObjects for Maximum Control](#84-create-custom-renderobjects-for-maximum-control)

---

## 1. Widget Build Optimization

**Impact: CRITICAL**

Widget rebuilds are the #1 performance concern in Flutter. Each unnecessary rebuild wastes CPU cycles and can cause jank. Optimizing builds yields the largest gains.

### 1.1 Use Const Constructors

**Impact: HIGH (30-50% rebuild reduction)**

Mark widgets with `const` constructors to prevent unnecessary rebuilds. Flutter can skip rebuilding const widgets since they're guaranteed to be identical.

**Incorrect: rebuilds every time parent rebuilds**

```dart
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Hello'),
        Icon(Icons.star),
        Padding(
          padding: EdgeInsets.all(8.0),
          child: Text('World'),
        ),
      ],
    );
  }
}
```

**Correct: skips rebuild for const widgets**

```dart
class MyWidget extends StatelessWidget {
  const MyWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      children: [
        Text('Hello'),
        Icon(Icons.star),
        Padding(
          padding: EdgeInsets.all(8.0),
          child: Text('World'),
        ),
      ],
    );
  }
}
```

Enable `prefer_const_constructors` lint rule in `analysis_options.yaml` to catch missing const keywords.

### 1.2 Avoid Unnecessary Rebuilds

**Impact: CRITICAL (40-60% performance improvement)**

Extract child widgets into separate classes instead of inline definitions to prevent rebuilding unchanged parts of the widget tree.

**Incorrect: entire subtree rebuilds on setState**

```dart
class BadCounter extends StatefulWidget {
  @override
  State<BadCounter> createState() => _BadCounterState();
}

class _BadCounterState extends State<BadCounter> {
  int count = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // This expensive widget rebuilds every time count changes!
        ExpensiveWidget(),
        Text('Count: $count'),
        ElevatedButton(
          onPressed: () => setState(() => count++),
          child: Text('Increment'),
        ),
      ],
    );
  }
}
```

**Correct: expensive widget extracted and const**

```dart
class GoodCounter extends StatefulWidget {
  const GoodCounter({super.key});

  @override
  State<GoodCounter> createState() => _GoodCounterState();
}

class _GoodCounterState extends State<GoodCounter> {
  int count = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // This widget won't rebuild - it's a separate const widget
        const ExpensiveWidget(),
        Text('Count: $count'),
        ElevatedButton(
          onPressed: () => setState(() => count++),
          child: const Text('Increment'),
        ),
      ],
    );
  }
}

class ExpensiveWidget extends StatelessWidget {
  const ExpensiveWidget({super.key});

  @override
  Widget build(BuildContext context) {
    // Expensive computation here
    return const SizedBox.shrink();
  }
}
```

Use Flutter DevTools widget rebuild indicator to identify unnecessary rebuilds.

### 1.3 Split Large Widgets

**Impact: HIGH (improved maintainability and rebuild control)**

Break large build methods into smaller, focused widget classes. This improves code readability, testability, and allows Flutter to optimize rebuilds.

**Incorrect: monolithic build method**

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

**Correct: composed smaller widgets**

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
```

Rule of thumb: If a build method exceeds 40 lines, consider splitting it.

### 1.4 Use Keys Appropriately

**Impact: CRITICAL (prevents widget identity issues)**

Use keys to preserve widget state and identity, especially in dynamic lists. Keys help Flutter correctly match widgets between rebuilds.

**Incorrect: no keys, causes state issues**

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

**Correct: ValueKey for unique identifiers**

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

### 1.5 Use itemExtent for Fixed-Size List Items

**Impact: CRITICAL (10x scroll performance improvement)**

When list items have a fixed height, specify `itemExtent` to skip layout calculations during scrolling.

**Incorrect: layout recalculated for each scroll**

```dart
class BadList extends StatelessWidget {
  final List<String> items;
  
  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: items.length,
      itemBuilder: (context, index) {
        return SizedBox(
          height: 56, // Fixed height but Flutter doesn't know
          child: ListTile(title: Text(items[index])),
        );
      },
    );
  }
}
```

**Correct: itemExtent tells Flutter exact height**

```dart
class GoodList extends StatelessWidget {
  final List<String> items;
  
  const GoodList({super.key, required this.items});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: items.length,
      itemExtent: 56, // Flutter skips layout calculations
      itemBuilder: (context, index) {
        return ListTile(title: Text(items[index]));
      },
    );
  }
}
```

**For variable item heights, use prototypeItem:**

```dart
ListView.builder(
  itemCount: items.length,
  prototypeItem: const ListTile(title: Text('Prototype')),
  itemBuilder: (context, index) {
    return ListTile(title: Text(items[index]));
  },
)
```

---

## 2. State Management

**Impact: CRITICAL**

Efficient state management prevents unnecessary widget rebuilds and keeps the UI responsive.

### 2.1 Minimize Widget Tree Rebuilds

**Impact: CRITICAL (50-70% fewer rebuilds)**

Use granular state management to rebuild only the widgets that need updates, not entire subtrees.

**Incorrect: entire tree rebuilds**

```dart
class BadCounter extends StatefulWidget {
  @override
  State<BadCounter> createState() => _BadCounterState();
}

class _BadCounterState extends State<BadCounter> {
  int count = 0;

  @override
  Widget build(BuildContext context) {
    // Entire widget tree rebuilds on every increment
    return Scaffold(
      body: Column(
        children: [
          const HeavyWidget(), // Rebuilds unnecessarily!
          Text('Count: $count'),
          ElevatedButton(
            onPressed: () => setState(() => count++),
            child: const Text('Increment'),
          ),
        ],
      ),
    );
  }
}
```

**Correct with ValueListenableBuilder:**

```dart
class GoodCounter extends StatefulWidget {
  const GoodCounter({super.key});

  @override
  State<GoodCounter> createState() => _GoodCounterState();
}

class _GoodCounterState extends State<GoodCounter> {
  final ValueNotifier<int> count = ValueNotifier(0);

  @override
  void dispose() {
    count.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          const HeavyWidget(), // Does NOT rebuild!
          ValueListenableBuilder<int>(
            valueListenable: count,
            builder: (context, value, child) {
              return Text('Count: $value'); // Only this rebuilds
            },
          ),
          ElevatedButton(
            onPressed: () => count.value++,
            child: const Text('Increment'),
          ),
        ],
      ),
    );
  }
}
```

### 2.2 Lift State to Appropriate Ancestor

**Impact: HIGH (better data flow and testability)**

Keep state at the lowest common ancestor that needs it. Too high causes unnecessary rebuilds; too low causes prop drilling.

**Incorrect: state too high**

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

**Correct: state at appropriate level**

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
        children: const [FeedPage(), ProfilePage()],
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

### 2.3 Use ValueNotifier for Simple Reactive State

**Impact: HIGH (lightweight alternative to full state management)**

For simple reactive values, use ValueNotifier instead of full state management solutions.

**Incorrect: overkill for simple state**

```dart
// Using heavy state management for a simple toggle
class ThemeProvider extends ChangeNotifier {
  bool _isDark = false;
  bool get isDark => _isDark;
  
  void toggle() {
    _isDark = !_isDark;
    notifyListeners();
  }
}
```

**Correct: ValueNotifier for simple cases**

```dart
class ThemeSwitcher extends StatelessWidget {
  static final ValueNotifier<bool> isDark = ValueNotifier(false);

  const ThemeSwitcher({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<bool>(
      valueListenable: isDark,
      builder: (context, isDarkMode, child) {
        return Switch(
          value: isDarkMode,
          onChanged: (value) => isDark.value = value,
        );
      },
    );
  }
}
```

### 2.4 Use Selector Patterns

**Impact: HIGH (rebuild only affected widgets)**

Use selectors to subscribe only to specific properties, not entire objects.

**Incorrect: rebuilds on any change**

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

### 2.5 Use late final for Lazy Initialization

**Impact: MEDIUM (deferred expensive initialization)**

Use `late final` to defer expensive initialization until first access.

**Incorrect: initialized immediately**

```dart
class ExpensiveService {
  ExpensiveService() {
    _loadData(); // Heavy initialization runs on app startup
  }
}

final service = ExpensiveService(); // Initialized on import
```

**Correct: lazy initialization**

```dart
class ExpensiveService {
  ExpensiveService._();
  
  static late final ExpensiveService instance = ExpensiveService._();
}

// Usage - initialization deferred until first access
ExpensiveService.instance.doWork();
```

---

## 3. Async Performance

**Impact: HIGH**

Proper async handling prevents UI freezes and ensures smooth user experience.

### 3.1 Use FutureBuilder for Async UI Updates

**Impact: HIGH (clean async data handling)**

Use FutureBuilder to handle async data loading declaratively with proper loading and error states.

**Incorrect: manual state management**

```dart
class BadAsyncWidget extends StatefulWidget {
  @override
  State<BadAsyncWidget> createState() => _BadAsyncWidgetState();
}

class _BadAsyncWidgetState extends State<BadAsyncWidget> {
  String? data;
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final result = await fetchData();
      setState(() { data = result; isLoading = false; });
    } catch (e) {
      setState(() { error = e.toString(); isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) return CircularProgressIndicator();
    if (error != null) return Text('Error: $error');
    return Text(data!);
  }
}
```

**Correct: FutureBuilder handles states**

```dart
class GoodAsyncWidget extends StatelessWidget {
  const GoodAsyncWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<String>(
      future: fetchData(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const CircularProgressIndicator();
        }
        if (snapshot.hasError) {
          return Text('Error: ${snapshot.error}');
        }
        return Text(snapshot.data!);
      },
    );
  }
}
```

**Important:** Store Future in state to prevent refetching on every build.

### 3.2 Execute Independent Async Operations in Parallel

**Impact: CRITICAL (2-10× speed improvement)**

When async operations have no dependencies, run them concurrently with `Future.wait`.

**Incorrect: sequential, 3 round trips**

```dart
Future<UserProfile> loadProfile() async {
  final user = await fetchUser();
  final posts = await fetchPosts();       // Waits unnecessarily
  final followers = await fetchFollowers(); // Waits unnecessarily
  
  return UserProfile(user: user, posts: posts, followers: followers);
}
```

**Correct: parallel, 1 round trip**

```dart
Future<UserProfile> loadProfile() async {
  final (user, posts, followers) = await (
    fetchUser(),
    fetchPosts(),
    fetchFollowers(),
  ).wait;
  
  return UserProfile(user: user, posts: posts, followers: followers);
}
```

### 3.3 Cancel Stream Subscriptions on Dispose

**Impact: HIGH (prevents memory leaks and errors)**

Always cancel stream subscriptions in `dispose()`.

**Incorrect: subscription never cancelled**

```dart
class _BadStreamWidgetState extends State<BadStreamWidget> {
  @override
  void initState() {
    super.initState();
    myStream.listen((value) => setState(() => data = value)); // Leaks!
  }
}
```

**Correct: subscription cancelled on dispose**

```dart
class _GoodStreamWidgetState extends State<GoodStreamWidget> {
  StreamSubscription<String>? _subscription;

  @override
  void initState() {
    super.initState();
    _subscription = myStream.listen((value) => setState(() => data = value));
  }

  @override
  void dispose() {
    _subscription?.cancel(); // Critical!
    super.dispose();
  }
}
```

### 3.4 Debounce or Throttle Expensive Operations

**Impact: HIGH (reduces redundant operations by 90%+)**

Debounce rapid user input and throttle frequent events.

**Incorrect: API call on every keystroke**

```dart
TextField(
  onChanged: (query) => searchApi(query), // Called on EVERY keystroke!
)
```

**Correct: debounced search**

```dart
class _GoodSearchState extends State<GoodSearch> {
  Timer? _debounce;

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      searchApi(query); // Only calls when user stops typing
    });
  }

  @override
  Widget build(BuildContext context) {
    return TextField(onChanged: _onSearchChanged);
  }
}
```

### 3.5 Use compute() for Heavy Synchronous Work

**Impact: HIGH (prevents UI jank)**

Offload CPU-intensive work to an isolate using `compute()`.

**Incorrect: blocks UI thread**

```dart
Future<void> parseData() async {
  final response = await http.get(Uri.parse('api/data'));
  final parsed = jsonDecode(response.body); // Blocks UI!
}
```

**Correct: offload to isolate**

```dart
static Map<String, dynamic> parseJson(String json) {
  return jsonDecode(json);
}

Future<Map<String, dynamic>> parseData() async {
  final response = await http.get(Uri.parse('api/data'));
  return compute(parseJson, response.body); // UI stays responsive
}
```

---

## 4. Memory Management

**Impact: HIGH**

Proper memory management prevents crashes and ensures smooth performance.

### 4.1 Always Dispose Controllers and Listeners

**Impact: CRITICAL (prevents memory leaks)**

Every controller, animation, and listener must be disposed.

**Incorrect: memory leak**

```dart
class _BadWidgetState extends State<BadWidget> {
  final controller = TextEditingController();
  // No dispose method - memory leak!
}
```

**Correct: proper disposal**

```dart
class _GoodWidgetState extends State<GoodWidget> {
  late final TextEditingController controller;

  @override
  void initState() {
    super.initState();
    controller = TextEditingController();
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }
}
```

### 4.2 Configure Image Cache Limits

**Impact: HIGH (prevents OOM crashes)**

Configure image cache size to prevent out-of-memory crashes.

```dart
void main() {
  final imageCache = PaintingBinding.instance.imageCache;
  imageCache.maximumSize = 100; // Default is 1000
  imageCache.maximumSizeBytes = 50 << 20; // 50 MB
  runApp(const MyApp());
}
```

### 4.3 Precache Images for Smooth Loading

**Impact: MEDIUM (eliminates loading flicker)**

Precache images before navigation.

```dart
void _onItemTap(BuildContext context, String imageUrl) async {
  await precacheImage(NetworkImage(imageUrl), context);
  if (context.mounted) {
    Navigator.push(context, MaterialPageRoute(
      builder: (_) => ImageDetailPage(imageUrl: imageUrl),
    ));
  }
}
```

### 4.4 Use Weak References for Large Cached Objects

**Impact: MEDIUM (allows GC to reclaim memory)**

Use `WeakReference` for large regenerable cached objects.

```dart
class GoodCache {
  final Map<String, WeakReference<LargeObject>> _cache = {};

  LargeObject get(String key) {
    var object = _cache[key]?.target;
    if (object == null) {
      object = loadExpensive(key);
      _cache[key] = WeakReference(object);
    }
    return object;
  }
}
```

### 4.5 Use Isolates for Memory-Intensive Operations

**Impact: HIGH (prevents main isolate OOM)**

Run memory-intensive operations in separate isolates.

```dart
Future<List<ProcessedImage>> processImages(List<Uint8List> images) async {
  return Future.wait(
    images.map((bytes) => compute(_processImage, bytes)),
  );
}
```

---

## 5. Layout Performance

**Impact: MEDIUM**

Efficient layouts reduce GPU workload and improve frame rates.

### 5.1 Use AnimatedOpacity Instead of Opacity

**Impact: MEDIUM (smoother animations)**

Use `AnimatedOpacity` or `FadeTransition` instead of raw `Opacity`.

**Correct:**

```dart
AnimatedOpacity(
  opacity: _visible ? 1.0 : 0.0,
  duration: const Duration(milliseconds: 300),
  child: const ExpensiveWidget(),
)
```

### 5.2 Set clipBehavior.none When Not Needed

**Impact: MEDIUM (reduces GPU overdraw)**

Disable clipping when content doesn't overflow.

```dart
Container(
  clipBehavior: Clip.none, // Explicit - no clipping needed
  decoration: BoxDecoration(borderRadius: BorderRadius.circular(8)),
  child: content,
)
```

### 5.3 Avoid Intrinsic Dimension Widgets in Scrolling

**Impact: MEDIUM (prevents expensive layout passes)**

Avoid `IntrinsicWidth` and `IntrinsicHeight` in scrollable lists.

### 5.4 Use Slivers for Efficient Scrollable Layouts

**Impact: MEDIUM (lazy building)**

Use slivers for complex scrollable layouts with mixed content types.

```dart
CustomScrollView(
  slivers: [
    SliverAppBar(title: Text('My App')),
    SliverList.builder(
      itemCount: 100,
      itemBuilder: (context, i) => ListTile(title: Text('Item $i')),
    ),
  ],
)
```

### 5.5 Use RepaintBoundary to Isolate Repaints

**Impact: MEDIUM (reduces repaint area)**

Wrap frequently updated widgets in `RepaintBoundary`.

```dart
RepaintBoundary(
  child: AnimatedWidget(), // Isolated repaint
)
```

---

## 6. Animation Performance

**Impact: MEDIUM**

Smooth animations require efficient rendering pipelines.

### 6.1 Use AnimatedBuilder Over setState

**Impact: HIGH (more efficient animation rebuilds)**

Use `AnimatedBuilder` instead of `setState` during animations.

```dart
AnimatedBuilder(
  animation: _controller,
  child: const Icon(Icons.star), // Built once, reused
  builder: (context, child) {
    return Transform.scale(
      scale: _controller.value,
      child: child,
    );
  },
)
```

### 6.2 Use TweenSequence for Complex Animations

**Impact: MEDIUM (cleaner multi-phase animations)**

Use `TweenSequence` for multi-phase animations.

```dart
final animation = TweenSequence<double>([
  TweenSequenceItem(tween: Tween(begin: 1.0, end: 1.5), weight: 33),
  TweenSequenceItem(tween: Tween(begin: 1.5, end: 1.0), weight: 67),
]).animate(_controller);
```

### 6.3 Use Physics-Based Animations

**Impact: MEDIUM (more natural, interruptible animations)**

Use physics-based animations for natural interactions.

```dart
final simulation = SpringSimulation(
  SpringDescription(mass: 1, stiffness: 500, damping: 25),
  currentPosition,
  targetPosition,
  velocity,
);
_controller.animateWith(simulation);
```

### 6.4 Cache Animation Frames When Possible

**Impact: MEDIUM (reduces per-frame computation)**

Cache rendered content in layers for complex animations.

```dart
AnimatedBuilder(
  animation: _controller,
  child: const RepaintBoundary(child: ComplexWidget()), // Cached
  builder: (context, child) => Transform.rotate(
    angle: _controller.value * 2 * pi,
    child: child,
  ),
)
```

### 6.5 Minimize Overdraw in Animations

**Impact: MEDIUM (reduces GPU workload)**

Reduce overlapping painted areas during animations.

---

## 7. Dart Performance

**Impact: LOW-MEDIUM**

Language-level optimizations for better runtime performance.

### 7.1 Use final and const Appropriately

Use `final` for runtime constants and `const` for compile-time constants.

### 7.2 Use Collection-if Instead of Conditional Logic

```dart
// Correct
return [
  if (showHeader) const HeaderWidget(),
  const MainContent(),
  if (showFooter) const FooterWidget(),
];
```

### 7.3 Use Spread Operator for Collection Merging

```dart
return [...first, 4, ...last];
```

### 7.4 Use Cascade Notation for Multiple Operations

```dart
return TextEditingController()
  ..text = 'Initial value'
  ..addListener(onChanged);
```

### 7.5 Avoid Dynamic Types

Use explicit types for better performance and safety.

### 7.6 Use StringBuffer for String Concatenation

Use `StringBuffer` for building strings in loops (O(n) vs O(n²)).

```dart
final buffer = StringBuffer();
for (final item in items) {
  buffer.write(item);
}
return buffer.toString();
```

---

## 8. Advanced Patterns

**Impact: LOW**

Advanced techniques for maximum performance when needed.

### 8.1 Use SliverPersistentHeader for Sticky Headers

Use `SliverPersistentHeader` for efficient pinned/floating headers in scrollable content.

### 8.2 Use LayerLink for Efficient Overlay Positioning

Use `LayerLink` with `CompositedTransformTarget/Follower` for overlays that follow widgets.

### 8.3 Optimize CustomPainter for Complex Rendering

- Cache Paint objects
- Implement `shouldRepaint` correctly
- Batch similar draw calls

### 8.4 Create Custom RenderObjects for Maximum Control

For ultimate performance, create custom RenderObjects when widgets are insufficient.

**Caution:** Use only when profiling shows widget overhead is significant.

---

## Quick Reference

| Category | Priority | Key Rules |
|----------|----------|-----------|
| Widget Build | CRITICAL | const constructors, split widgets, use keys |
| State Management | CRITICAL | minimize rebuilds, use selectors, ValueNotifier |
| Async | HIGH | parallel execution, cancel subscriptions, compute() |
| Memory | HIGH | dispose everything, cache limits, isolates |
| Layout | MEDIUM | avoid opacity, slivers, RepaintBoundary |
| Animation | MEDIUM | AnimatedBuilder, TweenSequence, physics |
| Dart | LOW-MEDIUM | final/const, collection-if, StringBuffer |
| Advanced | LOW | RenderObject, CustomPainter, SliverPersistentHeader |

---

## References

- [Flutter Performance Best Practices](https://docs.flutter.dev/perf/best-practices)
- [Flutter DevTools](https://docs.flutter.dev/tools/devtools)
- [Dart Language Tour](https://dart.dev/language)
- [Effective Dart](https://dart.dev/effective-dart)
