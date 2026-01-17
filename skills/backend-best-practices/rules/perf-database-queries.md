---
title: Optimize Database Queries
impact: HIGH
impactDescription: 60-90% query performance improvement
tags: performance, database, queries, optimization
---

## Optimize Database Queries

Select only needed fields, use projection, and avoid fetching unnecessary data.

**Incorrect (fetches all fields):**

```javascript
// MongoDB - fetches entire document
const users = await User.find(); // Gets all fields!

// SQL
SELECT * FROM users; // Gets all columns!
```

**Correct (select specific fields):**

```javascript
// MongoDB - projection
const users = await User.find()
  .select('name email') // Only these fields
  .lean(); // Return plain objects, not Mongoose documents

// SQL
SELECT id, name, email FROM users;

// Sequelize
const users = await User.findAll({
  attributes: ['id', 'name', 'email']
});
```

**Other Optimizations:**

```javascript
// Use lean() for read-only queries
const posts = await Post.find().lean();

// Limit results
const recentUsers = await User.find()
  .sort({ createdAt: -1 })
  .limit(10);

// Use explain to analyze queries
const explain = await User.find({ email: 'test@test.com' }).explain();
```

Reference: [Query Optimization](https://mongoosejs.com/docs/tutorials/query_casting.html)
