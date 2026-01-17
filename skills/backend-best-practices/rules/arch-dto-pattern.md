---
title: Use DTOs for Data Transfer
impact: MEDIUM
impactDescription: Better data validation and API contract clarity
tags: architecture, dto, data-transfer
---

## Use DTOs for Data Transfer

Use Data Transfer Objects (DTOs) to define clear contracts for request and response data.

**Incorrect (raw objects):**

```javascript
app.post('/api/users', async (req, res) => {
  // Directly uses request body - no validation
  const user = await User.create(req.body);
  // Returns database model - exposes internal structure
  res.json(user);
});
```

**Correct (with DTOs):**

```javascript
// Request DTO
class CreateUserDTO {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
    this.name = data.name;
  }
  
  validate() {
    if (!this.email || !this.password) {
      throw new Error('Email and password required');
    }
    return true;
  }
}

// Response DTO
class UserResponseDTO {
  constructor(user) {
    this.id = user._id;
    this.email = user.email;
    this.name = user.name;
    this.createdAt = user.createdAt;
    // Excludes password and internal fields
  }
}

app.post('/api/users', async (req, res) => {
  const dto = new CreateUserDTO(req.body);
  dto.validate();
  
  const user = await userService.createUser(dto);
  const response = new UserResponseDTO(user);
  
  res.status(201).json(response);
});
```

Reference: [DTO Pattern](https://martinfowler.com/eaaCatalog/dataTransferObject.html)
