---
title: Use Dependency Injection
impact: MEDIUM
impactDescription: Better testability and loose coupling
tags: architecture, dependency-injection, testing, solid
---

## Use Dependency Injection

Use dependency injection to improve testability and reduce coupling between components.

**Incorrect (tight coupling):**

```javascript
const db = require('./db');
const emailService = require('./emailService');

class UserService {
  async createUser(userData) {
    // Directly depends on specific implementations
    const user = await db.users.create(userData);
    await emailService.send(user.email, 'Welcome');
    return user;
  }
}
```

**Correct (dependency injection):**

```javascript
class UserService {
  constructor(userRepository, emailService) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }
  
  async createUser(userData) {
    const user = await this.userRepository.create(userData);
    await this.emailService.sendWelcome(user.email);
    return user;
  }
}

// Dependency injection container
const userRepository = new UserRepository(db);
const emailService = new EmailService();
const userService = new UserService(userRepository, emailService);

// Easy to test with mocks
const mockRepo = { create: jest.fn() };
const mockEmail = { sendWelcome: jest.fn() };
const testService = new UserService(mockRepo, mockEmail);
```

Reference: [Dependency Injection Patterns](https://martinfowler.com/articles/injection.html)
