---
title: Use Collection-if Instead of Conditional Logic
impact: LOW-MEDIUM
impactDescription: Cleaner, more performant collections
tags: dart, collection, conditional, syntax
---

## Use Collection-if Instead of Conditional Logic

Use collection-if and collection-for for cleaner dynamic lists with better performance.

**Incorrect (imperative approach):**

```dart
List<Widget> buildItems(bool showHeader, bool showFooter) {
  var items = <Widget>[];
  
  if (showHeader) {
    items.add(HeaderWidget());
  }
  
  items.add(MainContent());
  
  if (showFooter) {
    items.add(FooterWidget());
  }
  
  return items;
}
```

**Correct (collection-if):**

```dart
List<Widget> buildItems(bool showHeader, bool showFooter) {
  return [
    if (showHeader) const HeaderWidget(),
    const MainContent(),
    if (showFooter) const FooterWidget(),
  ];
}
```

**In widget trees:**

```dart
@override
Widget build(BuildContext context) {
  return Column(
    children: [
      const TitleWidget(),
      if (isLoading) const CircularProgressIndicator(),
      if (hasError) Text('Error: $errorMessage'),
      if (data != null) ...[
        DataHeader(data: data!),
        for (final item in data!.items) ItemWidget(item: item),
      ],
      if (showActions) const ActionButtons(),
    ],
  );
}
```

**Collection-for:**

```dart
// Incorrect
List<Widget> buildList(List<Item> items) {
  return items.map((item) => ItemWidget(item: item)).toList();
}

// Correct (collection-for)
List<Widget> buildList(List<Item> items) {
  return [
    for (final item in items) ItemWidget(item: item),
  ];
}
```

**Combined usage:**

```dart
final menu = [
  const MenuItem(title: 'Home'),
  if (isLoggedIn) ...[
    const MenuItem(title: 'Profile'),
    for (final bookmark in bookmarks) 
      MenuItem(title: bookmark.name),
  ],
  if (isAdmin) const MenuItem(title: 'Admin'),
];
```
