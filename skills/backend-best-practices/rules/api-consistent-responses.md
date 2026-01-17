---
title: Use Consistent Response Structures
impact: CRITICAL
impactDescription: 50% easier API consumption and error handling
tags: api, response, consistency, dto
---

## Use Consistent Response Structures

Maintain consistent response structures across all endpoints for predictable client-side handling.

**Incorrect (inconsistent responses):**

```javascript
// Success returns just data
app.get('/api/users/:id', (req, res) => {
  const user = db.users.find(req.params.id);
  res.json(user);
});

// Error returns different structure
app.get('/api/posts/:id', (req, res) => {
  try {
    const post = db.posts.find(req.params.id);
    res.json({ post }); // Wrapped differently!
  } catch (error) {
    res.status(500).json({ error: error.message }); // Different structure
  }
});
```

**Correct (consistent envelope pattern):**

```javascript
// Standardized response wrapper
class ApiResponse {
  static success(data, message = 'Success') {
    return {
      success: true,
      message,
      data,
      error: null
    };
  }
  
  static error(message, code = 'INTERNAL_ERROR', details = null) {
    return {
      success: false,
      message,
      data: null,
      error: {
        code,
        details
      }
    };
  }
}

// Consistent success responses
app.get('/api/users/:id', (req, res) => {
  const user = db.users.find(req.params.id);
  res.json(ApiResponse.success(user));
});

app.get('/api/posts/:id', (req, res) => {
  const post = db.posts.find(req.params.id);
  res.json(ApiResponse.success(post));
});

// Consistent error responses
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json(
    ApiResponse.error(
      err.message,
      err.code,
      process.env.NODE_ENV === 'development' ? err.stack : null
    )
  );
});
```

**With Pagination:**

```javascript
class ApiResponse {
  static paginated(data, pagination) {
    return {
      success: true,
      message: 'Success',
      data,
      pagination,
      error: null
    };
  }
}

app.get('/api/users', async (req, res) => {
  const { users, pagination } = await getUsersWithPagination(req.query);
  res.json(ApiResponse.paginated(users, pagination));
});
```

**Example Responses:**

```json
// Success
{
  "success": true,
  "message": "User retrieved successfully",
  "data": { "id": 1, "name": "John" },
  "error": null
}

// Error
{
  "success": false,
  "message": "User not found",
  "data": null,
  "error": {
    "code": "USER_NOT_FOUND",
    "details": null
  }
}
```

Reference: [API Response Structure Best Practices](https://medium.com/geekculture/rest-api-best-practices-decouple-long-running-tasks-from-http-request-processing-9fab2921ace8)
