---
title: Configure Image Cache Limits
impact: HIGH
impactDescription: Prevents OOM crashes
tags: memory, images, cache, configuration
---

## Configure Image Cache Limits

Configure image cache size based on app needs to prevent out-of-memory crashes on low-end devices.

**Incorrect (default unbounded cache):**

```dart
void main() {
  runApp(MyApp());
  // Uses default cache - can grow unbounded!
}
```

**Correct (configured cache limits):**

```dart
void main() {
  // Configure before runApp
  final imageCache = PaintingBinding.instance.imageCache;
  
  // Limit number of images in memory
  imageCache.maximumSize = 100; // Default is 1000
  
  // Limit total bytes in cache
  imageCache.maximumSizeBytes = 50 << 20; // 50 MB (default is 100 MB)
  
  runApp(const MyApp());
}
```

**Clear cache when memory pressure:**

```dart
class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didHaveMemoryPressure() {
    // System is low on memory - clear image cache
    PaintingBinding.instance.imageCache.clear();
    PaintingBinding.instance.imageCache.clearLiveImages();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(...);
  }
}
```

**For image-heavy apps:**

```dart
// Use cached_network_image with disk caching
CachedNetworkImage(
  imageUrl: url,
  memCacheWidth: 300, // Resize in memory
  maxWidthDiskCache: 600, // Resize on disk
)
```

Reference: [Handling images in Flutter](https://docs.flutter.dev/perf/image-optimization)
