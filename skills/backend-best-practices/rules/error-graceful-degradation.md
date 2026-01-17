---
title: Implement Graceful Degradation
impact: HIGH
impactDescription: Maintains service availability during partial failures
tags: error-handling, resilience, fault-tolerance
---

## Implement Graceful Degradation

Design systems to degrade gracefully when dependencies fail, maintaining core functionality.

**Incorrect (complete failure):**

```javascript
app.get('/api/dashboard', async (req, res) => {
  // If recommendations fail, entire endpoint fails
  const userData = await getUserData(req.user.id);
  const recommendations = await getRecommendations(req.user.id); 
  const analytics = await getAnalytics(req.user.id);
  
  res.json({ userData, recommendations, analytics });
});
```

**Correct (graceful degradation):**

```javascript
app.get('/api/dashboard', async (req, res) => {
  const results = await Promise.allSettled([
    getUserData(req.user.id),
    getRecommendations(req.user.id),
    getAnalytics(req.user.id)
  ]);
  
  const [userData, recommendations, analytics] = results;
  
  res.json({
    userData: userData.status === 'fulfilled' 
      ? userData.value 
      : null,
    recommendations: recommendations.status === 'fulfilled'
      ? recommendations.value
      : [], // Fallback to empty array
    analytics: analytics.status === 'fulfilled'
      ? analytics.value
      : { message: 'Analytics temporarily unavailable' },
    warnings: results
      .filter(r => r.status === 'rejected')
      .map(r => r.reason.message)
  });
});

// With circuit breaker pattern
const CircuitBreaker = require('opossum');

const breaker = new CircuitBreaker(getRecommendations, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
});

breaker.fallback(() => []);

app.get('/api/dashboard', async (req, res) => {
  const recommendations = await breaker.fire(req.user.id);
  // Returns fallback if service is down
});
```

Reference: [Fault Tolerance Patterns](https://martinfowler.com/articles/patterns-of-distributed-systems/)
