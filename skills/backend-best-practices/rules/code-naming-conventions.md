---
title: Use Clear and Consistent Naming Conventions
impact: MEDIUM
impactDescription: Improves code readability and maintainability
tags: code-quality, naming, clean-code
---

## Use Clear and Consistent Naming Conventions

Follow consistent naming conventions for variables, functions, and classes.

**Incorrect (inconsistent naming):**

```javascript
const u = await User.find();
const GetProduct = async (id) => {};
const user_service = new UserService();
const CONST = 'value';
```

**Correct (consistent naming):**

```javascript
// Variables and functions: camelCase
const users = await User.find();
const getProduct = async (id) => {};
const userService = new UserService();

// Classes: PascalCase
class UserService {}
class ApiResponse {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const API_BASE_URL = 'https://api.example.com';

// Booleans: is/has prefix
const isActive = true;
const hasPermission = false;

// Functions: verb + noun
async function createUser(data) {}
async function fetchUserById(id) {}
function validateEmail(email) {}
```

Reference: [JavaScript Naming Conventions](https://www.robinwieruch.de/javascript-naming-conventions/)
