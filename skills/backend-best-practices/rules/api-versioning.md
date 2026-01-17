---
title: Implement API Versioning
impact: CRITICAL
impactDescription: Prevents breaking changes for existing clients
tags: api, versioning, backward-compatibility
---

## Implement API Versioning

Version your APIs from the start to allow evolution without breaking existing clients.

**Incorrect (no versioning):**

```javascript
// Breaking change affects all clients
app.get('/api/users/:id', (req, res) => {
  // Changed response structure - breaks existing clients!
  const user = db.users.find(req.params.id);
  res.json({
    userData: user, // Previously just returned user object
    metadata: { timestamp: Date.now() }
  });
});
```

**Correct (URL path versioning):**

```javascript
// v1 - original version
app.get('/api/v1/users/:id', (req, res) => {
  const user = db.users.find(req.params.id);
  res.json(user);
});

// v2 - new version with enhanced response
app.get('/api/v2/users/:id', (req, res) => {
  const user = db.users.find(req.params.id);
  res.json({
    userData: user,
    metadata: { timestamp: Date.now() }
  });
});
```

**Alternative (Header versioning):**

```javascript
app.get('/api/users/:id', (req, res) => {
  const version = req.get('API-Version') || 'v1';
  const user = db.users.find(req.params.id);
  
  if (version === 'v2') {
    res.json({
      userData: user,
      metadata: { timestamp: Date.now() }
    });
  } else {
    res.json(user);
  }
});
```

**Best Practices:**
- Use URL versioning (`/api/v1/`) for simplicity and discoverability
- Maintain at least 2 versions during deprecation
- Document deprecation timeline clearly
- Use semantic versioning principles

Reference: [API Versioning Strategies](https://www.freecodecamp.org/news/how-to-version-a-rest-api/)
