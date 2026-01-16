---
title: Precache Images for Smooth Loading
impact: HIGH
impactDescription: Eliminates loading flicker
tags: memory, images, precache, performance
---

## Precache Images for Smooth Loading

Precache images that will be displayed soon to avoid loading flicker.

**Incorrect (image loads when displayed):**

```dart
class BadImagePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Image.network(
      'https://example.com/large-image.jpg',
      // Shows placeholder/flicker while loading
    );
  }
}
```

**Correct (precache before navigation):**

```dart
class ImageListPage extends StatelessWidget {
  const ImageListPage({super.key});

  void _onItemTap(BuildContext context, String imageUrl) async {
    // Precache before navigation
    await precacheImage(
      NetworkImage(imageUrl),
      context,
    );
    
    if (context.mounted) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => ImageDetailPage(imageUrl: imageUrl),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemBuilder: (context, index) {
        return GestureDetector(
          onTap: () => _onItemTap(context, imageUrls[index]),
          child: Text('View image $index'),
        );
      },
    );
  }
}
```

**Precache assets on app startup:**

```dart
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _precacheImages();
  }

  Future<void> _precacheImages() async {
    await Future.wait([
      precacheImage(const AssetImage('assets/logo.png'), context),
      precacheImage(const AssetImage('assets/background.jpg'), context),
      precacheImage(const AssetImage('assets/icons/menu.png'), context),
    ]);
    
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const HomePage()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Center(child: CircularProgressIndicator());
  }
}
```

**Precache with hover intent:**

```dart
MouseRegion(
  onEnter: (_) {
    precacheImage(NetworkImage(imageUrl), context);
  },
  child: ElevatedButton(
    onPressed: () => navigateToDetail(imageUrl),
    child: const Text('View Details'),
  ),
)
```
