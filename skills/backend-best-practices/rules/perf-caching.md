---
title: Implement Caching Strategies
impact: HIGH
impactDescription: 70-95% reduction in response time for cached data
tags: performance, caching, redis, optimization
---

## Implement Caching Strategies

Use caching to reduce database load and improve response times for frequently accessed data.

**Incorrect (no caching - hits database every time):**

```javascript
app.get('/api/products/:id', async (req, res) => {
  // Queries database for every request
  const product = await Product.findById(req.params.id);
  res.json(product);
});
```

**Correct (with Redis caching):**

```javascript
const redis = require('redis');
const client = redis.createClient();

app.get('/api/products/:id', async (req, res) => {
  const cacheKey = `product:${req.params.id}`;
  
  // Try cache first
  const cached = await client.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  // If not in cache, query database
  const product = await Product.findById(req.params.id);
  
  // Store in cache with 1 hour expiration
  await client.setEx(cacheKey, 3600, JSON.stringify(product));
  
  res.json(product);
});
```

**Cache Invalidation:**

```javascript
app.put('/api/products/:id', async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  
  // Invalidate cache
  await client.del(`product:${req.params.id}`);
  
  res.json(product);
});
```

**In-Memory Caching (node-cache):**

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 min default

app.get('/api/stats', async (req, res) => {
  const cached = cache.get('stats');
  if (cached) return res.json(cached);
  
  const stats = await calculateStats(); // Expensive operation
  cache.set('stats', stats);
  
  res.json(stats);
});
```

Reference: [Caching Best Practices](https://aws.amazon.com/caching/best-practices/)
