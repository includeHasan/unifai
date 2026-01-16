---
title: Use Weak References for Large Cached Objects
impact: HIGH
impactDescription: Allows GC to reclaim memory
tags: memory, weak-reference, cache, gc
---

## Use Weak References for Large Cached Objects

For large cached objects that can be regenerated, use `WeakReference` or `Expando` to allow garbage collection under memory pressure.

**Incorrect (strong reference prevents GC):**

```dart
class BadCache {
  final Map<String, LargeObject> _cache = {};

  LargeObject get(String key) {
    if (!_cache.containsKey(key)) {
      _cache[key] = loadExpensive(key);
    }
    return _cache[key]!;
  }
  
  // Cache grows indefinitely, no way to free memory
}
```

**Correct (weak reference allows GC):**

```dart
class GoodCache {
  final Map<String, WeakReference<LargeObject>> _cache = {};

  LargeObject get(String key) {
    final ref = _cache[key];
    var object = ref?.target;
    
    if (object == null) {
      // Either not cached or GC'd - reload
      object = loadExpensive(key);
      _cache[key] = WeakReference(object);
    }
    
    return object;
  }
  
  // Clean up stale entries periodically
  void cleanup() {
    _cache.removeWhere((key, ref) => ref.target == null);
  }
}
```

**With Expando for object-to-object mapping:**

```dart
class ComputedPropertyCache {
  // Maps Widget -> ComputedData without preventing Widget GC
  static final _cache = Expando<ComputedData>();

  static ComputedData getFor(Widget widget) {
    var data = _cache[widget];
    if (data == null) {
      data = computeExpensive(widget);
      _cache[widget] = data;
    }
    return data;
  }
}
```

**When to use:**
- Image thumbnail caches
- Computed derived data
- Parsed document caches
- Any large regenerable data

**Note:** Always have a way to regenerate the data when the weak reference is cleared.
