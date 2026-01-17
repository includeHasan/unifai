---
title: Use Async/Await for I/O Operations
impact: HIGH
impactDescription: Prevents blocking and improves concurrency
tags: performance, async, promises, nodejs
---

## Use Async/Await for I/O Operations

Always use async/await for I/O operations to avoid blocking the event loop and improve performance.

**Incorrect (blocking synchronous code):**

```javascript
const fs = require('fs');

app.get('/api/file', (req, res) => {
  // Blocks the entire server!
  const data = fs.readFileSync('/large-file.json', 'utf8');
  res.json(JSON.parse(data));
});
```

**Correct (non-blocking async):**

```javascript
const fs = require('fs').promises;

app.get('/api/file', async (req, res) => {
  try {
    const data = await fs.readFile('/large-file.json', 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Parallel Async Operations:**

```javascript
// Incorrect (sequential - slower)
const user = await User.findById(id);
const posts = await Post.find({ authorId: id });
const comments = await Comment.find({ userId: id });

// Correct (parallel - faster)
const [user, posts, comments] = await Promise.all([
  User.findById(id),
  Post.find({ authorId: id }),
  Comment.find({ userId: id })
]);
```

Reference: [Async/Await Best Practices](https://javascript.info/async-await)
