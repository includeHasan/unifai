---
title: Implement Rate Limiting
impact: CRITICAL
impactDescription: Prevents abuse and ensures service availability
tags: api, rate-limiting, security, dos
---

## Implement Rate Limiting

Protect your API from abuse by implementing rate limiting to control request frequency.

**Incorrect (no rate limiting):**

```javascript
app.post('/api/send-email', async (req, res) => {
  // Vulnerable to abuse - can send unlimited emails!
  await emailService.send(req.body.to, req.body.message);
  res.json({ success: true });
});
```

**Correct (with rate limiting middleware):**

```javascript
const rateLimit = require('express-rate-limit');

// Create rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to all API routes
app.use('/api/', apiLimiter);

// Stricter limit for sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 attempts per 15 minutes
  skipSuccessfulRequests: true,
});

app.post('/api/login', authLimiter, async (req, res) => {
  // Protected against brute force attacks
  const user = await authService.login(req.body);
  res.json(user);
});
```

**Advanced (Redis-based for distributed systems):**

```javascript
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const redisClient = redis.createClient();

const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate_limit:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use('/api/', limiter);
```

**Per-User Rate Limiting:**

```javascript
const userLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: async (req) => {
    // Premium users get higher limits
    const user = await getUser(req.user.id);
    return user.isPremium ? 1000 : 100;
  },
  keyGenerator: (req) => req.user.id,
});
```

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

Reference: [Rate Limiting Best Practices](https://blog.logrocket.com/rate-limiting-node-js/)
