---
title: Create Service Layers for Business Logic
impact: MEDIUM
impactDescription: Better code organization and reusability
tags: architecture, service-layer, separation-of-concerns
---

## Create Service Layers for Business Logic

Encapsulate business logic in dedicated service layers separate from controllers and repositories.

**Correct implementation:**

```javascript
// Service layer
class OrderService {
  constructor(orderRepository, inventoryService, paymentService) {
    this.orderRepository = orderRepository;
    this.inventoryService = inventoryService;
    this.paymentService = paymentService;
  }
  
  async createOrder(orderData) {
    // Business logic here
    await this.inventoryService.reserveItems(orderData.items);
    
    const order = await this.orderRepository.create(orderData);
    
    try {
      await this.paymentService.charge(orderData.payment);
      await this.orderRepository.markAsPaid(order.id);
    } catch (error) {
      await this.inventoryService.releaseItems(orderData.items);
      throw error;
    }
    
    return order;
  }
}

// Controller uses service
app.post('/api/orders', async (req, res) => {
  const order = await orderService.createOrder(req.body);
  res.status(201).json(order);
});
```

Reference: [Service Layer Pattern](https://martinfowler.com/eaaCatalog/serviceLayer.html)
