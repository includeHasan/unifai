---
title: Provide Meaningful Error Messages
impact: HIGH
impactDescription: Improves debugging and user experience
tags: error-handling, ux, debugging
---

## Provide Meaningful Error Messages

Return clear, actionable error messages to help clients understand and fix issues.

**Incorrect (vague errors):**

```javascript
if (!user) {
  return res.status(400).json({ error: 'Error' });
}

if (age < 18) {
  return res.status(400).json({ error: 'Invalid' });
}
```

**Correct (descriptive errors):**

```javascript
if (!user) {
  return res.status(404).json({ 
    error: 'User not found',
    code: 'USER_NOT_FOUND',
    details: `No user exists with ID: ${userId}`
  });
}

if (age < 18) {
  return res.status(400).json({
    error: 'Validation failed',
    code: 'AGE_REQUIREMENT_NOT_MET',
    details: 'User must be at least 18 years old',
    field: 'age',
    receivedValue: age,
    expectedValue: '>=18'
  });
}

// Validation errors
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(422).json({
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details: errors.array().map(err => ({
      field: err.param,
      message: err.msg,
      value: err.value
    }))
  });
}
```

Reference: [API Error Handling](https://www.baeldung.com/rest-api-error-handling-best-practices)
