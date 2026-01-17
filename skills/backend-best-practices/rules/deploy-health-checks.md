---
title: Implement Health Check Endpoints
impact: LOW-MEDIUM
impactDescription: Enables monitoring and load balancer integration
tags: deployment, health-checks, monitoring, devops
---

## Implement Health Check Endpoints

Provide health check endpoints for monitoring and orchestration tools.

**Correct implementation:**

```javascript
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await mongoose.connection.db.admin().ping();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Detailed health check
app.get('/health/detailed', async (req, res) => {
  const checks = {
    database: 'unknown',
    redis: 'unknown',
    memory: 'unknown'
  };
  
  try {
    await mongoose.connection.db.admin().ping();
    checks.database = 'healthy';
  } catch (err) {
    checks.database = 'unhealthy';
  }
  
  try {
    await redisClient.ping();
    checks.redis = 'healthy';
  } catch (err) {
    checks.redis = 'unhealthy';
  }
  
  const memUsage = process.memoryUsage();
  checks.memory = memUsage.heapUsed < memUsage.heapTotal * 0.9 
    ? 'healthy' 
    : 'warning';
  
  const allHealthy = Object.values(checks).every(v => v === 'healthy');
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'degraded',
    checks
  });
});
```

Reference: [Health Check Patterns](https://microservices.io/patterns/observability/health-check-api.html)
