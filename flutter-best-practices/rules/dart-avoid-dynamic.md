---
title: Avoid Dynamic Types
impact: LOW-MEDIUM
impactDescription: Enables AOT optimization, catches errors
tags: dart, types, dynamic, safety
---

## Avoid Dynamic Types

Avoid `dynamic` type to enable compiler optimizations and catch errors at compile time.

**Incorrect (dynamic defeats type checking):**

```dart
dynamic fetchData() {
  // Caller has no idea what type to expect
  return {'name': 'John', 'age': 30};
}

void processData(dynamic data) {
  // No autocomplete, no type safety
  print(data.name); // Runtime error if wrong type
  print(data.nonExistent); // No compile-time error!
}

List<dynamic> items = [1, 'two', 3.0]; // Mixed types
```

**Correct (explicit types):**

```dart
Map<String, dynamic> fetchData() {
  return {'name': 'John', 'age': 30};
}

// Better: Use a typed model
class User {
  final String name;
  final int age;
  
  const User({required this.name, required this.age});
  
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      name: json['name'] as String,
      age: json['age'] as int,
    );
  }
}

User fetchUser() {
  final json = {'name': 'John', 'age': 30};
  return User.fromJson(json);
}
```

**For JSON handling:**

```dart
// Accept dynamic at API boundary, convert immediately
class ApiService {
  Future<User> getUser(int id) async {
    final response = await http.get('/users/$id');
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    return User.fromJson(json); // Typed from here on
  }
}
```

**When dynamic is acceptable:**
- JSON parsing at boundaries
- Reflection/mirrors (rare)
- Interop with JavaScript

**Enable strict linting:**

```yaml
# analysis_options.yaml
analyzer:
  language:
    strict-casts: true
    strict-raw-types: true
linter:
  rules:
    - avoid_dynamic_calls
```
