---
title: Use Connection Pooling
impact: CRITICAL
impactDescription: 60-80% better database performance under load
tags: database, connection-pooling, scalability
---

## Use Connection Pooling

Use connection pooling to reuse database connections and avoid the overhead of creating new connections for each request.

**Incorrect (creates new connection each time):**

```javascript
// Creates new connection for every request - SLOW!
app.get('/api/users/:id', async (req, res) => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'myapp'
  });
  
  const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [req.params.id]);
  await connection.end(); // Closes connection
  
  res.json(rows[0]);
});
```

**Correct (connection pooling):**

```javascript
// MySQL with connection pool
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'myapp',
  waitForConnections: true,
  connectionLimit: 10, // Max 10 concurrent connections
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

app.get('/api/users/:id', async (req, res) => {
  // Reuses connection from pool
  const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
  // Connection automatically returned to pool
});
```

**PostgreSQL Example:**

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'myapp',
  user: 'postgres',
  password: 'password',
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000, // Close idle clients after 30s
  connectionTimeoutMillis: 2000, // Return error after 2s if no connection available
});

app.get('/api/users/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } finally {
    client.release(); // Return to pool
  }
});
```

**MongoDB (Mongoose) - Built-in Pooling:**

```javascript
const mongoose = require('mongoose');

await mongoose.connect('mongodb://localhost/myapp', {
  maxPoolSize: 10, // Default: 100
  minPoolSize: 2,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  family: 4 // Use IPv4
});

// Connections are automatically pooled
const user = await User.findById(id);
```

**Sequelize ORM:**

```javascript
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'postgres',
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000
  }
});
```

**Pool Configuration Guidelines:**
- `max`: CPU cores × 2-4 (for optimal performance)
- `min`: Keep warm connections (typically 2-5)
- Monitor pool exhaustion in production
- Adjust based on connection duration
- Consider read replicas for scaling reads

**Health Check:**

```javascript
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', pool: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});
```

Reference: [Connection Pool Best Practices](https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing)
