---
title: Use Parameterized Queries to Prevent SQL Injection
impact: CRITICAL
impactDescription: Prevents SQL injection attacks
tags: security, sql-injection, database, queries
---

## Use Parameterized Queries to Prevent SQL Injection

Always use parameterized queries or prepared statements to prevent SQL injection attacks.

**Incorrect (vulnerable to SQL injection):**

```javascript
// DANGEROUS - SQL injection vulnerability!
app.get('/api/users', async (req, res) => {
  const name = req.query.name;
  const query = `SELECT * FROM users WHERE name = '${name}'`;
  const users = await db.execute(query);
  res.json(users);
});

// Attacker can use: ?name=' OR '1'='1
// Query becomes: SELECT * FROM users WHERE name = '' OR '1'='1'
// Returns ALL users!
```

**Correct (parameterized queries):**

```javascript
// PostgreSQL/MySQL with placeholders
app.get('/api/users', async (req, res) => {
  const name = req.query.name;
  const query = 'SELECT * FROM users WHERE name = ?';
  const users = await db.execute(query, [name]);
  res.json(users);
});

// PostgreSQL with numbered placeholders
const query = 'SELECT * FROM users WHERE name = $1 AND status = $2';
const users = await client.query(query, [name, 'active']);
```

**ORM Examples (automatically parameterized):**

```javascript
// Sequelize
const users = await User.findAll({
  where: { name: req.query.name }
});

// TypeORM
const users = await userRepository.find({
  where: { name: req.query.name }
});

// Mongoose
const users = await User.find({ name: req.query.name });
```

**Prepared Statements:**

```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({...});

app.get('/api/users', async (req, res) => {
  const [users] = await pool.execute(
    'SELECT * FROM users WHERE name = ? AND age > ?',
    [req.query.name, req.query.minAge]
  );
  res.json(users);
});
```

Reference: [SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
