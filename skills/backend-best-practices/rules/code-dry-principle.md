---
title: Follow DRY (Don't Repeat Yourself)
impact: MEDIUM
impactDescription: Reduces code duplication and maintenance burden
tags: code-quality, dry, refactoring, best-practices
---

## Follow DRY (Don't Repeat Yourself)

Eliminate code duplication by extracting common logic into reusable functions.

**Incorrect (repetitive code):**

```javascript
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

app.get('/api/products/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});
```

**Correct (DRY - reusable function):**

```javascript
// Generic get-by-id handler
const getResourceById = (Model, resourceName) => 
  asyncHandler(async (req, res) => {
    const resource = await Model.findById(req.params.id);
    if (!resource) {
      throw new AppError(`${resourceName} not found`, 404);
    }
    res.json(resource);
  });

app.get('/api/users/:id', getResourceById(User, 'User'));
app.get('/api/products/:id', getResourceById(Product, 'Product'));
```

Reference: [DRY Principle](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
