---
title: Separate Business Logic from Routes
impact: MEDIUM
impactDescription: Better testability, maintainability, and code organization
tags: architecture, separation-of-concerns, clean-code
---

## Separate Business Logic from Routes

Keep route handlers thin by extracting business logic into service layers.

**Incorrect (fat controllers):**

```javascript
app.post('/api/users', async (req, res) => {
  // All logic in route handler - hard to test and reuse
  const { email, password, name } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ error: 'User exists' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    password: hashedPassword,
    name
  });
  
  await sendWelcomeEmail(email);
  
  res.status(201).json(user);
});
```

**Correct (service layer):**

```javascript
// services/userService.js
class UserService {
  async createUser(userData) {
    const { email, password, name } = userData;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User already exists', 409);
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      name
    });
    
    await this.sendWelcomeEmail(email);
    
    return user;
  }
  
  async sendWelcomeEmail(email) {
    // Email logic
  }
}

// routes/userRoutes.js
const userService = new UserService();

app.post('/api/users', asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json(user);
}));
```

Reference: [Layered Architecture](https://www.oreilly.com/library/view/software-architecture-patterns/9781491971437/ch01.html)
