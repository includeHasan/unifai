---
title: Document Complex Logic and APIs
impact: MEDIUM
impactDescription: Improves code understanding and maintenance
tags: code-quality, documentation, comments
---

## Document Complex Logic and APIs

Add clear documentation for complex business logic and public APIs.

**Incorrect (no documentation):**

```javascript
function calculateDiscount(price, tier, quantity) {
  const base = tier === 'gold' ? 0.2 : tier === 'silver' ? 0.1 : 0;
  const bulk = quantity > 100 ? 0.05 : quantity > 50 ? 0.03 : 0;
  return price * (1 - base - bulk);
}
```

**Correct (with documentation):**

```javascript
/**
 * Calculates the final price after applying tier and bulk discounts.
 * 
 * Discount rates:
 * - Gold tier: 20% base discount
 * - Silver tier: 10% base discount
 * - 50-100 items: 3% additional bulk discount
 * - 100+ items: 5% additional bulk discount
 * 
 * @param {number} price - Original price per item
 * @param {'gold'|'silver'|'bronze'} tier - Customer tier
 * @param {number} quantity - Number of items
 * @returns {number} Final price per item after discounts
 * 
 * @example
 * calculateDiscount(100, 'gold', 150)
 * // Returns: 75 (20% tier + 5% bulk = 25% total discount)
 */
function calculateDiscount(price, tier, quantity) {
  const baseDISCOUNT_RATES = {
    gold: 0.2,
    silver: 0.1,
    bronze: 0
  };
  
  const bulkDiscount = quantity > 100 ? 0.05
    : quantity > 50 ? 0.03
    : 0;
  
  const totalDiscount = (baseDiscountRates[tier] || 0) + bulkDiscount;
  return price * (1 - totalDiscount);
}

/**
 * @api {post} /api/users Create User
 * @apiName CreateUser
 * @apiGroup User
 * 
 * @apiParam {String} email User's email address
 * @apiParam {String} password User's password (min 8 chars)
 * @apiParam {String} name User's full name
 * 
 * @apiSuccess {String} id User's unique ID
 * @apiSuccess {String} email User's email
 * @apiSuccess {String} name User's name
 * 
 * @apiError (400) ValidationError Invalid input data
 * @apiError (409) DuplicateEmail Email already exists
 */
app.post('/api/users', createUser);
```

Reference: [JSDoc Documentation](https://jsdoc.app/)
