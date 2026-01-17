---
title: Follow RESTful Conventions
impact: CRITICAL
impactDescription: 40-60% better API clarity and maintainability
tags: api, rest, conventions, http
---

## Follow RESTful Conventions

Use standard HTTP methods and RESTful naming conventions for consistent and predictable APIs.

**Incorrect (inconsistent naming and methods):**

```javascript
// Using POST for everything
app.post('/getUserById', (req, res) => {
  const user = db.users.find(req.body.id);
  res.json(user);
});

app.post('/deleteUser', (req, res) => {
  db.users.delete(req.body.id);
  res.json({ success: true });
});

app.post('/updateUserProfile', (req, res) => {
  db.users.update(req.body.id, req.body.data);
  res.json({ success: true });
});
```

**Correct (RESTful conventions):**

```javascript
// GET for retrieving resources
app.get('/api/users/:id', (req, res) => {
  const user = db.users.find(req.params.id);
  res.json(user);
});

// DELETE for removing resources
app.delete('/api/users/:id', (req, res) => {
  db.users.delete(req.params.id);
  res.status(204).send();
});

// PUT/PATCH for updating resources
app.patch('/api/users/:id', (req, res) => {
  const updated = db.users.update(req.params.id, req.body);
  res.json(updated);
});

// POST for creating resources
app.post('/api/users', (req, res) => {
  const newUser = db.users.create(req.body);
  res.status(201).json(newUser);
});
```

**HTTP Method Guidelines:**
- `GET` - Retrieve resources (safe, idempotent)
- `POST` - Create new resources
- `PUT` - Replace entire resource (idempotent)
- `PATCH` - Partial update
- `DELETE` - Remove resource (idempotent)

Reference: [REST API Design Best Practices](https://restfulapi.net/)
