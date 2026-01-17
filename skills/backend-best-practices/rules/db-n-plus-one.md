---
title: Avoid N+1 Query Problems
impact: CRITICAL
impactDescription: 90-99% reduction in database queries
tags: database, n+1, performance, joins
---

## Avoid N+1 Query Problems

Eliminate N+1 query problems by using proper joins, eager loading, or batching to reduce database round trips.

**Incorrect (N+1 queries - 1 + N queries):**

```javascript
// Fetches posts: 1 query
const posts = await Post.find().limit(10);

// Fetches author for EACH post: N queries
for (const post of posts) {
  post.author = await User.findById(post.authorId); // N separate queries!
}

// Total: 1 + 10 = 11 queries
```

**Correct (using populate/join - 1 or 2 queries):**

```javascript
// MongoDB with Mongoose - single query with join
const posts = await Post.find()
  .limit(10)
  .populate('authorId'); // Joins in 1-2 queries

// Or manually with aggregation
const posts = await Post.aggregate([
  { $limit: 10 },
  {
    $lookup: {
      from: 'users',
      localField: 'authorId',
      foreignField: '_id',
      as: 'author'
    }
  },
  { $unwind: '$author' }
]);

// Total: 1-2 queries instead of 11
```

**SQL Example:**

```sql
-- Incorrect: N+1 queries
SELECT * FROM posts LIMIT 10;
-- Then in loop:
-- SELECT * FROM users WHERE id = ? (run 10 times)

-- Correct: Single query with JOIN
SELECT 
  posts.*,
  users.name as author_name,
  users.email as author_email
FROM posts
LEFT JOIN users ON posts.author_id = users.id
LIMIT 10;
```

**Sequelize (ORM) Example:**

```javascript
// Incorrect
const posts = await Post.findAll({ limit: 10 });
for (const post of posts) {
  post.author = await User.findByPk(post.authorId);
}

// Correct - eager loading
const posts = await Post.findAll({
  limit: 10,
  include: [
    {
      model: User,
      as: 'author',
      attributes: ['id', 'name', 'email'] // Select only needed fields
    }
  ]
});
```

**DataLoader Pattern (GraphQL/Node.js):**

```javascript
const DataLoader = require('dataloader');

// Batch and cache user lookups
const userLoader = new DataLoader(async (userIds) => {
  const users = await User.find({ _id: { $in: userIds } });
  return userIds.map(id => users.find(u => u.id === id));
});

// Use in loop - automatically batches
const posts = await Post.find().limit(10);
const postsWithAuthors = await Promise.all(
  posts.map(async post => ({
    ...post,
    author: await userLoader.load(post.authorId) // Batched!
  }))
);
```

**Detecting N+1 Problems:**
- Enable query logging in development
- Use monitoring tools (New Relic, Datadog)
- Check for loops with database calls
- Use ORM query counters

Reference: [The N+1 Query Problem](https://www.sitepoint.com/silver-bullet-n1-problem/)
