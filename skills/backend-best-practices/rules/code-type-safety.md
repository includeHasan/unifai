---
title: Use Strong Typing Where Available
impact: MEDIUM
impactDescription: Catches errors at compile time and improves IDE support
tags: code-quality, typescript, type-safety
---

## Use Strong Typing Where Available

Use TypeScript or type annotations to catch type-related errors early.

**Incorrect (JavaScript without types):**

```javascript
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Runtime error if items is null or price is undefined
calculateTotal(null);
```

**Correct (TypeScript with types):**

```typescript
interface CartItem {
  price: number;
  quantity: number;
  name: string;
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Compile-time error prevented
// calculateTotal(null); // Error: Argument of type 'null' is not assignable

// Type-safe API
interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
}

interface UserResponse {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

async function createUser(data: CreateUserDTO): Promise<UserResponse> {
  const user = await User.create(data);
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt
  };
}
```

Reference: [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
