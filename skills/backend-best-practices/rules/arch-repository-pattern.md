---
title: Implement Repository Pattern for Data Access
impact: MEDIUM
impactDescription: Better testability and database abstraction
tags: architecture, repository-pattern, data-access
---

## Implement Repository Pattern for Data Access

Abstract database operations behind repository interfaces for better testability and maintainability.

**Incorrect (direct database access):**

```javascript
// Service directly accesses database
class UserService {
  async createUser(userData) {
    return await User.create(userData);
  }
  
  async findUserByEmail(email) {
    return await User.findOne({ email });
  }
}
```

**Correct (repository pattern):**

```javascript
// Repository interface
class UserRepository {
  async create(userData) {
    return await User.create(userData);
  }
  
  async findByEmail(email) {
    return await User.findOne({ email });
  }
  
  async findById(id) {
    return await User.findById(id);
  }
  
  async update(id, updates) {
    return await User.findByIdAndUpdate(id, updates, { new: true });
  }
}

// Service uses repository
class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  
  async createUser(userData) {
    const existing = await this.userRepository.findByEmail(userData.email);
    if (existing) {
      throw new Error('User already exists');
    }
    
    return await this.userRepository.create(userData);
  }
}

// Easy to test with mock repository
const mockRepo = {
  findByEmail: jest.fn(),
  create: jest.fn()
};

const service = new UserService(mockRepo);
```

Reference: [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
