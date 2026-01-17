---
title: Use Appropriate HTTP Status Codes
impact: HIGH
impactDescription: Better API clarity and client-side error handling
tags: error-handling, http, status-codes, api
---

## Use Appropriate HTTP Status Codes

Return correct HTTP status codes to communicate the result of API requests clearly.

**Incorrect (always returns 200):**

```javascript
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.json({ error: 'User not found' }); // Still 200!
  }
  res.json(user);
});

app.post('/api/users', async (req, res) => {
  const user = await User.create(req.body);
  res.json(user); // Should be 201!
});
```

**Correct (proper status codes):**

```javascript
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json(user);
});

app.post('/api/users', async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user); // Created
});

app.put('/api/users/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body);
  res.status(200).json(user); // OK
});

app.delete('/api/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).send(); // No Content
});
```

**Common Status Codes:**

```javascript
// Success
200 OK - Request succeeded
201 Created - Resource created
204 No Content - Success but no response body

// Client Errors
400 Bad Request - Invalid input
401 Unauthorized - Authentication required
403 Forbidden - Not authorized
404 Not Found - Resource doesn't exist
409 Conflict - Duplicate/conflict
422 Unprocessable Entity - Validation failed

// Server Errors
500 Internal Server Error - Unexpected error
503 Service Unavailable - Server overloaded
```

Reference: [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
