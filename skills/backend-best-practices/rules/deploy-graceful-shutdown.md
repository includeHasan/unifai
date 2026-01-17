---
title: Handle Graceful Shutdowns
impact: LOW-MEDIUM
impactDescription: Prevents data loss and connection leaks during shutdown
tags: deployment, shutdown, process-management
---

## Handle Graceful Shutdowns

Implement graceful shutdown to close connections and finish processing before exit.

**Incorrect (abrupt shutdown):**

```javascript
app.listen(3000);

// Server killed abruptly
// Active connections terminated
// In-progress requests lost
```

**Correct (graceful shutdown):**

```javascript
const server = app.listen(3000);

let isShuttingDown = false;

// Graceful shutdown handler
async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log(`${signal} received, starting graceful shutdown...`);
  
  // Stop accepting new connections
  server.close(() => {
    console.log('HTTP server closed');
  });
  
  // Close database connections
  try {
    await mongoose.connection.close();
    console.log('Database connection closed');
    
    await redisClient.quit();
    console.log('Redis connection closed');
    
    // Give ongoing requests time to finish
    setTimeout(() => {
      console.log('Graceful shutdown complete');
      process.exit(0);
    }, 5000);
    
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});
```

Reference: [Graceful Shutdown](https://expressjs.com/en/advanced/healthcheck-graceful-shutdown.html)
