---
title: Set Up Monitoring and Alerts
impact: LOW-MEDIUM
impactDescription: Enables proactive issue detection and resolution
tags: deployment, monitoring, observability, alerts
---

## Set Up Monitoring and Alerts

Implement monitoring and alerting to detect issues before they impact users.

**Correct implementation:**

```javascript
// Application Performance Monitoring (APM)
const newrelic = require('newrelic'); // or DataDog, AppDynamics, etc.

// Custom metrics
const promClient = require('prom-client');

// Create metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

// Middleware to track metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  
  next();
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// Error tracking
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());

// Custom alerts
const alertSlack = async (message) => {
  if (process.env.NODE_ENV === 'production') {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify({ text: message })
    });
  }
};

// Monitor critical operations
app.post('/api/payments', async (req, res) => {
  try {
    const payment = await processPayment(req.body);
    res.json(payment);
  } catch (error) {
    await alertSlack(`Payment failed: ${error.message}`);
    throw error;
  }
});
```

Reference: [Monitoring Best Practices](https://www.datadoghq.com/blog/monitoring-101-collecting-data/)
