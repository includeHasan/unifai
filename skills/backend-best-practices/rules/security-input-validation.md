---
title: Validate and Sanitize All User Inputs
impact: CRITICAL
impactDescription: Prevents injection attacks and data corruption
tags: security, validation, sanitization, xss
---

## Validate and Sanitize All User Inputs

Always validate and sanitize user inputs to prevent injection attacks, XSS, and invalid data.

**Incorrect (no validation):**

```javascript
app.post('/api/users', async (req, res) => {
  // Accepts ANY data - vulnerable to attacks!
  const user = await User.create(req.body);
  res.json(user);
});
```

**Correct (with validation):**

```javascript
const Joi = require('joi');

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).max(50).required(),
  age: Joi.number().integer().min(18).max(120).optional()
});

app.post('/api/users', async (req, res) => {
  // Validate input
  const { error, value } = userSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: error.details 
    });
  }
  
  const user = await User.create(value);
  res.json(user);
});
```

**Express-Validator Example:**

```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/users',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).trim(),
    body('name').trim().escape().isLength({ min: 2, max: 50 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const user = await User.create(req.body);
    res.json(user);
  }
);
```

**Sanitization:**

```javascript
const sanitizeHtml = require('sanitize-html');
const validator = require('validator');

app.post('/api/posts', async (req, res) => {
  const sanitizedData = {
    title: validator.escape(req.body.title),
    content: sanitizeHtml(req.body.content, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p'],
      allowedAttributes: {
        'a': ['href']
      }
    }),
    email: validator.normalizeEmail(req.body.authorEmail)
  };
  
  const post = await Post.create(sanitizedData);
  res.json(post);
});
```

Reference: [Input Validation Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
