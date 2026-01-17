---
title: Use Pagination for List Endpoints
impact: CRITICAL
impactDescription: 70-90% reduction in response size and load time
tags: api, pagination, performance
---

## Use Pagination for List Endpoints

Always paginate list endpoints to prevent overwhelming responses and improve performance.

**Incorrect (returns all records):**

```javascript
app.get('/api/users', async (req, res) => {
  // Returns ALL users - could be millions!
  const users = await db.users.findAll();
  res.json(users);
});
```

**Correct (offset-based pagination):**

```javascript
app.get('/api/users', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  
  const [users, total] = await Promise.all([
    db.users.find().skip(offset).limit(limit),
    db.users.countDocuments()
  ]);
  
  res.json({
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + users.length < total
    }
  });
});
```

**Better (cursor-based pagination for real-time data):**

```javascript
app.get('/api/users', async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const cursor = req.query.cursor;
  
  const query = cursor 
    ? { _id: { $gt: cursor } }
    : {};
  
  const users = await db.users
    .find(query)
    .sort({ _id: 1 })
    .limit(limit + 1);
  
  const hasMore = users.length > limit;
  const data = hasMore ? users.slice(0, -1) : users;
  
  res.json({
    data,
    pagination: {
      nextCursor: hasMore ? data[data.length - 1]._id : null,
      hasMore
    }
  });
});
```

**Best Practices:**
- Use cursor-based pagination for real-time feeds
- Use offset-based for traditional page-based navigation
- Set reasonable default limits (10-50 items)
- Include pagination metadata in responses

Reference: [Pagination Best Practices](https://www.moesif.com/blog/technical/api-design/REST-API-Design-Filtering-Sorting-and-Pagination/)
