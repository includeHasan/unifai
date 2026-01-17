---
title: Use compute() for Heavy Synchronous Work
impact: HIGH
impactDescription: Prevents UI jank
tags: async, compute, isolate, performance
---

## Use compute() for Heavy Synchronous Work

Offload CPU-intensive synchronous work to an isolate using `compute()` to prevent UI jank.

**Incorrect (blocks UI thread):**

```dart
class BadJsonParser extends StatelessWidget {
  Future<void> parseData() async {
    final response = await http.get(Uri.parse('api/data'));
    
    // This blocks the UI thread!
    final parsed = jsonDecode(response.body);
    final processed = heavyProcessing(parsed);
  }
}
```

**Correct (offload to isolate):**

```dart
class GoodJsonParser extends StatelessWidget {
  const GoodJsonParser({super.key});

  // Must be top-level or static function
  static Map<String, dynamic> parseJson(String json) {
    final parsed = jsonDecode(json);
    return heavyProcessing(parsed);
  }

  Future<Map<String, dynamic>> parseData() async {
    final response = await http.get(Uri.parse('api/data'));
    
    // Runs in separate isolate, UI stays responsive
    return compute(parseJson, response.body);
  }
}
```

**For multiple heavy operations:**

```dart
Future<ProcessedData> processAll(RawData raw) async {
  // Run heavy computations in parallel on separate isolates
  final results = await Future.wait([
    compute(parseImages, raw.images),
    compute(parseVideos, raw.videos),
    compute(parseDocuments, raw.documents),
  ]);
  
  return ProcessedData(
    images: results[0],
    videos: results[1],
    documents: results[2],
  );
}
```

**When to use compute():**
- JSON parsing of large payloads (>100KB)
- Image processing or compression
- Cryptographic operations
- Complex data transformations
- Any operation taking >16ms

**Limitations:**
- Function must be top-level or static
- Arguments must be serializable (no closures)
- Has isolate spawn overhead (~5-20ms)

For very frequent operations, consider using `Isolate.spawn` with ports for persistent workers.
