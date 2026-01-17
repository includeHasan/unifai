---
title: Use Transactions for Data Consistency
impact: CRITICAL
impactDescription: Ensures data integrity and prevents corruption
tags: database, transactions, acid, consistency
---

## Use Transactions for Data Consistency

Use database transactions to ensure data consistency when performing multiple related operations.

**Incorrect (no transaction - data can become inconsistent):**

```javascript
// Transfer money between accounts - DANGEROUS!
app.post('/api/transfer', async (req, res) => {
  const { fromAccount, toAccount, amount } = req.body;
  
  // What if this succeeds but next fails? Money disappears!
  await Account.updateOne(
    { _id: fromAccount },
    { $inc: { balance: -amount } }
  );
  
  // If this fails, fromAccount lost money but toAccount didn't receive it!
  await Account.updateOne(
    { _id: toAccount },
    { $inc: { balance: amount } }
  );
  
  res.json({ success: true });
});
```

**Correct (with transaction - all or nothing):**

```javascript
// MongoDB Transaction
app.post('/api/transfer', async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { fromAccount, toAccount, amount } = req.body;
      
      // Both operations succeed or both fail
      await Account.updateOne(
        { _id: fromAccount },
        { $inc: { balance: -amount } },
        { session }
      );
      
      await Account.updateOne(
        { _id: toAccount },
        { $inc: { balance: amount } },
        { session }
      );
    });
    
    res.json({ success: true });
  } catch (error) {
    // Transaction automatically rolled back
    res.status(500).json({ error: 'Transfer failed' });
  } finally {
    session.endSession();
  }
});
```

**PostgreSQL/MySQL Example:**

```javascript
app.post('/api/transfer', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN'); // Start transaction
    
    const { fromAccount, toAccount, amount } = req.body;
    
    await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
      [amount, fromAccount]
    );
    
    await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
      [amount, toAccount]
    );
    
    await client.query('COMMIT'); // Commit transaction
    res.json({ success: true });
    
  } catch (error) {
    await client.query('ROLLBACK'); // Rollback on error
    res.status(500).json({ error: 'Transfer failed' });
  } finally {
    client.release();
  }
});
```

**Sequelize (ORM) Transaction:**

```javascript
app.post('/api/transfer', async (req, res) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      const { fromAccount, toAccount, amount } = req.body;
      
      await Account.decrement(
        { balance: amount },
        { where: { id: fromAccount }, transaction: t }
      );
      
      await Account.increment(
        { balance: amount },
        { where: { id: toAccount }, transaction: t }
      );
      
      return { success: true };
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Transfer failed' });
  }
});
```

**Complex Multi-Step Transaction:**

```javascript
async function createOrder(orderData) {
  const session = await mongoose.startSession();
  
  try {
    return await session.withTransaction(async () => {
      // 1. Create order
      const order = await Order.create([orderData], { session });
      
      // 2. Decrement inventory
      await Product.updateMany(
        { _id: { $in: orderData.productIds } },
        { $inc: { stock: -1 } },
        { session }
      );
      
      // 3. Create payment record
      await Payment.create([{
        orderId: order[0]._id,
        amount: orderData.total
      }], { session });
      
      // 4. Send notification (outside transaction if not critical)
      
      return order[0];
    });
  } finally {
    session.endSession();
  }
}
```

**When to Use Transactions:**
- Money transfers or financial operations
- Multi-step operations that must all succeed
- Inventory management
- Creating related records (order + line items)
- Updating multiple collections/tables

**Best Practices:**
- Keep transactions short
- Don't include external API calls in transactions
- Use appropriate isolation levels
- Handle deadlocks with retry logic

Reference: [Database Transactions Best Practices](https://www.mongodb.com/docs/manual/core/transactions/)
