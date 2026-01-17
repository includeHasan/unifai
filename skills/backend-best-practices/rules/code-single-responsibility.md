---
title: Follow Single Responsibility Principle
impact: MEDIUM
impactDescription: Improves code maintainability and testability
tags: code-quality, solid, srp, clean-code
---

## Follow Single Responsibility Principle

Each function or class should have one clear responsibility.

**Incorrect (multiple responsibilities):**

```javascript
class UserController {
  async createUser(req, res) {
    // Validation
    if (!req.body.email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    // Database operation
    const user = await User.create(req.body);
    
    // Email sending
    await sendEmail(user.email, 'Welcome');
    
    // Logging
    console.log(`User created: ${user.id}`);
    
    // Response
    res.json(user);
  }
}
```

**Correct (single responsibility):**

```javascript
class UserValidator {
  validate(userData) {
    if (!userData.email) {
      throw new ValidationError('Email required');
    }
  }
}

class UserRepository {
  async create(userData) {
    return await User.create(userData);
  }
}

class EmailService {
  async sendWelcome(email) {
    await sendEmail(email, 'Welcome');
  }
}

class UserService {
  constructor(validator, repository, emailService, logger) {
    this.validator = validator;
    this.repository = repository;
    this.emailService = emailService;
    this.logger = logger;
  }
  
  async createUser(userData) {
    this.validator.validate(userData);
    const user = await this.repository.create(userData);
await this.emailService.sendWelcome(user.email);
    this.logger.info(`User created: ${user.id}`);
    return user;
  }
}
```

Reference: [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
