---
title: Log Errors with Context
impact: HIGH
impactDescription: Enables effective debugging and monitoring
tags: error-handling, logging, debugging, monitoring
---

## Log Errors with Context

Log errors with sufficient context for debugging, including request details and stack traces.

**Incorrect (insufficient logging):**

```javascript
try {
  await processPayment(orderId);
} catch (error) {
  console.log('Error'); // No context!
  res.status(500).json({ error: 'Failed' });
}
```

**Correct (contextual logging):**

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

app.post('/api/payments', async (req, res) => {
  try {
    await processPayment(req.body.orderId);
    res.json({ success: true });
  } catch (error) {
    logger.error('Payment processing failed', {
      error: error.message,
      stack: error.stack,
      orderId: req.body.orderId,
      userId: req.user?.id,
      endpoint: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({ error: 'Payment failed' });
  }
});

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Request received', {
    method: req.method,
    path: req.path,
    userId: req.user?.id,
    ip: req.ip
  });
  next();
});
```

Reference: [Logging Best Practices](https://www.datadoghq.com/blog/node-logging-best-practices/)
