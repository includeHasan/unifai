# State Management Patterns

Detailed guide to state management in Flutter applications.

---

## Decision Guide

```
Is state local to one widget?
├── Yes → Use setState or ValueNotifier
└── No → Is it shared between few widgets?
    ├── Yes → Use InheritedWidget or Provider
    └── No → Is it app-wide state?
        ├── Yes → Use Riverpod, Bloc, or GetX
        └── Depends → Consider feature-based providers
```

---

## 1. Local State (setState)

**Use for:** Simple UI state within a single widget.

```dart
class Counter extends StatefulWidget {
  const Counter({super.key});
  
  @override
  State<Counter> createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int _count = 0;
  
  void _increment() {
    setState(() {
      _count++;
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: _increment,
      child: Text('Count: $_count'),
    );
  }
}
```

---

## 2. ValueNotifier + ValueListenableBuilder

**Use for:** Single value that multiple widgets observe.

```dart
// In a controller or service
final counter = ValueNotifier<int>(0);

// In widget
ValueListenableBuilder<int>(
  valueListenable: counter,
  builder: (context, value, child) {
    return Text('Count: $value');
  },
)

// Update
counter.value++;
```

---

## 3. Riverpod Patterns

### Simple Provider

```dart
final counterProvider = StateProvider<int>((ref) => 0);

// Read
final count = ref.watch(counterProvider);

// Update
ref.read(counterProvider.notifier).state++;
```

### Notifier Pattern (Recommended)

```dart
class CounterNotifier extends Notifier<int> {
  @override
  int build() => 0;
  
  void increment() => state++;
  void decrement() => state--;
}

final counterProvider = NotifierProvider<CounterNotifier, int>(
  CounterNotifier.new,
);
```

### Async Data

```dart
final userProvider = FutureProvider<User>((ref) async {
  final repository = ref.watch(userRepositoryProvider);
  return repository.getCurrentUser();
});

// In widget
ref.watch(userProvider).when(
  data: (user) => Text(user.name),
  loading: () => CircularProgressIndicator(),
  error: (e, st) => Text('Error: $e'),
);
```

---

## 4. Bloc Pattern

### Event and State

```dart
// Events
abstract class CounterEvent {}
class Increment extends CounterEvent {}
class Decrement extends CounterEvent {}

// State
class CounterState {
  final int count;
  const CounterState(this.count);
}

// Bloc
class CounterBloc extends Bloc<CounterEvent, CounterState> {
  CounterBloc() : super(const CounterState(0)) {
    on<Increment>((event, emit) => emit(CounterState(state.count + 1)));
    on<Decrement>((event, emit) => emit(CounterState(state.count - 1)));
  }
}
```

### Usage

```dart
BlocBuilder<CounterBloc, CounterState>(
  builder: (context, state) {
    return Text('Count: ${state.count}');
  },
)

// Dispatch
context.read<CounterBloc>().add(Increment());
```

---

## 5. GetX Pattern

### Reactive State

```dart
class CounterController extends GetxController {
  final count = 0.obs;
  
  void increment() => count++;
  void decrement() => count--;
}

// Usage
final controller = Get.put(CounterController());

Obx(() => Text('Count: ${controller.count}'));
```

---

## Best Practices

1. **Start simple** - Use setState until you need more
2. **Lift state up** - Move state to common ancestor when shared
3. **Keep providers focused** - One responsibility per provider
4. **Avoid global state** - Prefer scoped providers
5. **Test state logic** - Keep business logic testable
