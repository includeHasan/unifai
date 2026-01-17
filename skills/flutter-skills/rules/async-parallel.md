---
title: Execute Independent Async Operations in Parallel
impact: HIGH
impactDescription: 2-10× speed improvement
tags: async, parallel, future, performance
---

## Execute Independent Async Operations in Parallel

When async operations have no dependencies on each other, run them concurrently with `Future.wait`.

**Incorrect (sequential, 3 round trips):**

```dart
Future<UserProfile> loadProfile() async {
  final user = await fetchUser();
  final posts = await fetchPosts();       // Waits for user unnecessarily
  final followers = await fetchFollowers(); // Waits for posts unnecessarily
  
  return UserProfile(user: user, posts: posts, followers: followers);
}
```

**Correct (parallel, 1 round trip):**

```dart
Future<UserProfile> loadProfile() async {
  final results = await Future.wait([
    fetchUser(),
    fetchPosts(),
    fetchFollowers(),
  ]);
  
  return UserProfile(
    user: results[0] as User,
    posts: results[1] as List<Post>,
    followers: results[2] as List<User>,
  );
}
```

**Type-safe parallel with records (Dart 3):**

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

**With error handling:**

```dart
Future<UserProfile> loadProfile() async {
  try {
    final (user, posts, followers) = await (
      fetchUser(),
      fetchPosts(),
      fetchFollowers(),
    ).wait;
    
    return UserProfile(user: user, posts: posts, followers: followers);
  } catch (e) {
    // Any failure fails all operations
    throw ProfileLoadError(e.toString());
  }
}
```

All independent async operations should run in parallel.
