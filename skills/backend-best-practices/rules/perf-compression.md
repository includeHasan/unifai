---
title: Enable Gzip Compression
impact: HIGH
impactDescription: 60-80% reduction in response size
tags: performance, compression, bandwidth
---

## Enable Gzip Compression

Enable compression middleware to reduce response sizes and improve load times.

**Correct implementation:**

```javascript
const compression = require('compression');

// Simple setup
app.use(compression());

// Advanced configuration
app.use(compression({
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

Reference: [HTTP Compression](https://betterexplained.com/articles/how-to-optimize-your-site-with-gzip-compression/)
