---
title: Create Indexes for Frequently Queried Fields
impact: CRITICAL
impactDescription: 80-95% query performance improvement
tags: database, indexing, performance, optimization
---

## Create Indexes for Frequently Queried Fields

Index fields that are frequently used in queries, sorts, and joins to dramatically improve performance.

**Incorrect (no indexes - full table scan):**

```javascript
// MongoDB without indexes
const users = await User.find({ email: 'user@example.com' }); // Scans all documents!
const posts = await Post.find({ authorId: userId }).sort({ createdAt: -1 }); // Slow sorting
```

**Correct (with proper indexes):**

```javascript
// MongoDB - Create indexes
const userSchema = new Schema({
  email: { 
    type: String, 
    required: true,
    index: true, // Single field index
    unique: true
  },
  username: { type: String, index: true },
  createdAt: { type: Date, default: Date.now }
});

// Compound index for common query patterns
userSchema.index({ email: 1, status: 1 });

// Text index for search
userSchema.index({ name: 'text', bio: 'text' });

const postSchema = new Schema({
  authorId: { type: ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  status: String
});

// Compound index for filtering and sorting
postSchema.index({ authorId: 1, createdAt: -1 });
postSchema.index({ status: 1, createdAt: -1 });
```

**SQL Example:**

```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Compound index for common query patterns
CREATE INDEX idx_posts_author_date ON posts(author_id, created_at DESC);

-- Partial index (PostgreSQL) for active users only
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';

-- Covering index includes all columns needed
CREATE INDEX idx_users_covering ON users(email, username, status);
```

**Best Practices:**
- Index foreign keys used in joins
- Index fields used in WHERE clauses
- Create compound indexes for multi-field queries
- Monitor query performance with `explain()`
- Avoid over-indexing (slows writes)
- Use partial/filtered indexes when possible

**Check Query Performance:**

```javascript
// MongoDB
const explain = await User.find({ email: 'test@example.com' }).explain('executionStats');
console.log(explain.executionStats.totalDocsExamined); // Should equal nReturned

// SQL
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

Reference: [Database Indexing Best Practices](https://use-the-index-luke.com/)
