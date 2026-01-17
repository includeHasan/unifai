# Clean Code Principles

Universal clean code guidelines applicable to any programming language or framework. AI agents should reference this when writing, reviewing, or refactoring code.

## When to Apply

Use these guidelines when:
- Writing new code in any language
- Reviewing code for quality
- Refactoring existing codebases
- Teaching coding best practices
- Improving code readability

## Quick Reference

### SOLID Principles

| Principle | Description |
|-----------|-------------|
| **S**ingle Responsibility | One class/function = one reason to change |
| **O**pen/Closed | Open for extension, closed for modification |
| **L**iskov Substitution | Subtypes must be substitutable for base types |
| **I**nterface Segregation | Many specific interfaces > one general |
| **D**ependency Inversion | Depend on abstractions, not concretions |

---

## Core Principles

### 1. Meaningful Names

**Variables should reveal intent:**

```javascript
// ❌ Bad
const d = 86400;
const arr = users.filter(u => u.a > 18);

// ✅ Good
const SECONDS_PER_DAY = 86400;
const adultUsers = users.filter(user => user.age > 18);
```

**Functions should describe actions:**

```javascript
// ❌ Bad
function process(data) { }
function handle(event) { }

// ✅ Good
function calculateTotalPrice(orderItems) { }
function handleUserLogin(credentials) { }
```

### 2. Functions Should Do One Thing

**Keep functions focused:**

```javascript
// ❌ Bad - Does multiple things
function processOrder(order) {
  validateOrder(order);
  calculateShipping(order);
  applyDiscounts(order);
  saveToDatabase(order);
  sendConfirmationEmail(order);
}

// ✅ Good - Orchestrates single-purpose functions
function processOrder(order) {
  const validatedOrder = validateOrder(order);
  const pricedOrder = calculateOrderTotal(validatedOrder);
  const savedOrder = saveOrder(pricedOrder);
  notifyCustomer(savedOrder);
  return savedOrder;
}
```

### 3. Avoid Magic Numbers

```javascript
// ❌ Bad
if (user.age >= 18) { }
if (password.length >= 8) { }
setTimeout(fn, 86400000);

// ✅ Good
const MINIMUM_AGE = 18;
const MINIMUM_PASSWORD_LENGTH = 8;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

if (user.age >= MINIMUM_AGE) { }
if (password.length >= MINIMUM_PASSWORD_LENGTH) { }
setTimeout(fn, ONE_DAY_MS);
```

### 4. DRY (Don't Repeat Yourself)

```javascript
// ❌ Bad - Duplicated logic
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validateUserEmail(user) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(user.email);
}

// ✅ Good - Single source of truth
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return EMAIL_REGEX.test(email);
}

function validateUser(user) {
  return isValidEmail(user.email);
}
```

### 5. Early Return Pattern

```javascript
// ❌ Bad - Deep nesting
function getDiscount(user) {
  if (user) {
    if (user.isPremium) {
      if (user.yearsActive > 5) {
        return 0.30;
      } else {
        return 0.20;
      }
    } else {
      return 0.05;
    }
  } else {
    return 0;
  }
}

// ✅ Good - Early returns
function getDiscount(user) {
  if (!user) return 0;
  if (!user.isPremium) return 0.05;
  if (user.yearsActive > 5) return 0.30;
  return 0.20;
}
```

---

## Code Organization

### 6. Keep Files Focused

- One class/module per file
- Group related functions together
- Separate concerns (data, logic, UI)

### 7. Consistent Formatting

- Use consistent indentation
- Group related code blocks
- Add blank lines between sections
- Follow project style guide

### 8. Meaningful Comments

```javascript
// ❌ Bad - States the obvious
i++; // Increment i

// ❌ Bad - Outdated comment
// Calculate tax at 5%
const tax = total * 0.08; // Tax rate changed!

// ✅ Good - Explains why
// Using exponential backoff to avoid overwhelming the server
const delay = Math.pow(2, retryCount) * 1000;

// ✅ Good - Documents non-obvious behavior
// Returns null instead of throwing to support optional chaining
function findUser(id) {
  return users.find(u => u.id === id) ?? null;
}
```

---

## Error Handling

### 9. Fail Fast

```javascript
// ❌ Bad - Continues with invalid data
function processPayment(amount, card) {
  // ... lots of code ...
  if (amount <= 0) {
    return { error: 'Invalid amount' };
  }
  // More code that ran unnecessarily
}

// ✅ Good - Validate early
function processPayment(amount, card) {
  if (amount <= 0) throw new Error('Amount must be positive');
  if (!card) throw new Error('Card is required');
  
  // Proceed with valid data
}
```

### 10. Handle Errors Explicitly

```javascript
// ❌ Bad - Swallowing errors
try {
  await saveData(data);
} catch (e) {
  console.log('Error');
}

// ✅ Good - Handle appropriately
try {
  await saveData(data);
} catch (error) {
  logger.error('Failed to save data', { error, data });
  throw new DataPersistenceError('Save failed', { cause: error });
}
```

---

## Testing

### 11. Write Testable Code

- Pure functions over side effects
- Inject dependencies
- Keep functions small
- Avoid global state

### 12. Test Names Should Describe Behavior

```javascript
// ❌ Bad
test('calculatePrice test 1', () => {});

// ✅ Good
test('calculatePrice applies 20% discount for premium users', () => {});
test('calculatePrice throws error when quantity is negative', () => {});
```

---

## Detailed References

- [SOLID Principles](references/solid.md)
- [Refactoring Patterns](references/refactoring.md)
- [Code Smells](references/code-smells.md)
