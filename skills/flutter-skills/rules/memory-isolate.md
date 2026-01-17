---
title: Use Isolates for Memory-Intensive Operations
impact: HIGH
impactDescription: Prevents main isolate OOM
tags: memory, isolate, compute, heavy-operations
---

## Use Isolates for Memory-Intensive Operations

Run memory-intensive operations in separate isolates to keep the main isolate responsive and prevent OOM crashes.

**Incorrect (memory spike on main isolate):**

```dart
Future<List<ProcessedImage>> processImages(List<Uint8List> images) async {
  // All memory allocated on main isolate
  return images.map((bytes) {
    final decoded = decodeImage(bytes); // Large allocation
    final processed = applyFilters(decoded); // More allocation
    return processed;
  }).toList();
}
```

**Correct (processing in separate isolate):**

```dart
Future<List<ProcessedImage>> processImages(List<Uint8List> images) async {
  // Each image processed in its own isolate
  final results = await Future.wait(
    images.map((bytes) => compute(_processImage, bytes)),
  );
  return results;
}

// Must be top-level function
ProcessedImage _processImage(Uint8List bytes) {
  final decoded = decodeImage(bytes);
  final processed = applyFilters(decoded);
  return processed;
  // Memory freed when isolate exits
}
```

**Long-running isolate with ports:**

```dart
class ImageProcessor {
  SendPort? _sendPort;
  Isolate? _isolate;

  Future<void> start() async {
    final receivePort = ReceivePort();
    _isolate = await Isolate.spawn(
      _isolateEntryPoint,
      receivePort.sendPort,
    );
    _sendPort = await receivePort.first as SendPort;
  }

  Future<ProcessedImage> process(Uint8List bytes) async {
    final responsePort = ReceivePort();
    _sendPort!.send([bytes, responsePort.sendPort]);
    return await responsePort.first as ProcessedImage;
  }

  void dispose() {
    _isolate?.kill();
    _isolate = null;
  }
}

void _isolateEntryPoint(SendPort mainSendPort) {
  final receivePort = ReceivePort();
  mainSendPort.send(receivePort.sendPort);

  receivePort.listen((message) {
    final bytes = message[0] as Uint8List;
    final replyPort = message[1] as SendPort;
    
    final result = _processImage(bytes);
    replyPort.send(result);
  });
}
```

Use isolates when processing:
- Large images or videos
- Big JSON/XML documents
- File compression/decompression
- Any operation allocating >10MB
