---
title: Implement Lazy Loading for Heavy Resources
impact: HIGH
impactDescription: Reduces initial load time and memory usage
tags: performance, lazy-loading, optimization
---

## Implement Lazy Loading for Heavy Resources

Load heavy resources only when needed to improve startup time and reduce memory footprint.

**Incorrect (loads everything upfront):**

```javascript
const heavyModule = require('./heavy-module');
const allUsers = await User.find(); // Loads all users!

app.get('/api/reports', async (req, res) => {
  const report = await heavyModule.generateReport();
  res.json(report);
});
```

**Correct (lazy loading):**

```javascript
let heavyModule = null;

app.get('/api/reports', async (req, res) => {
  // Load only when endpoint is called
  if (!heavyModule) {
    heavyModule = require('./heavy-module');
  }
  
  const report = await heavyModule.generateReport();
  res.json(report);
});

// Or with dynamic imports
app.get('/api/reports', async (req, res) => {
  const { generateReport } = await import('./heavy-module.js');
  const report = await generateReport();
  res.json(report);
});
```

Reference: [Lazy Loading Patterns](https://www.patterns.dev/posts/import-on-interaction)
