# SOLID Principles

Detailed explanation of SOLID principles with examples.

---

## S - Single Responsibility Principle

**A class should have only one reason to change.**

### Problem

```javascript
// ❌ Bad - Multiple responsibilities
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
  
  save() {
    // Database logic
  }
  
  sendEmail(message) {
    // Email sending logic
  }
  
  generateReport() {
    // Report generation logic
  }
}
```

### Solution

```javascript
// ✅ Good - Single responsibility each
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}

class UserRepository {
  save(user) { /* Database logic */ }
  findById(id) { /* Query logic */ }
}

class EmailService {
  send(to, message) { /* Email logic */ }
}

class UserReportGenerator {
  generate(user) { /* Report logic */ }
}
```

---

## O - Open/Closed Principle

**Open for extension, closed for modification.**

### Problem

```javascript
// ❌ Bad - Must modify class for new shapes
class AreaCalculator {
  calculate(shape) {
    if (shape.type === 'circle') {
      return Math.PI * shape.radius ** 2;
    } else if (shape.type === 'rectangle') {
      return shape.width * shape.height;
    } else if (shape.type === 'triangle') {
      // Adding new shapes requires modifying this class
    }
  }
}
```

### Solution

```javascript
// ✅ Good - Extend without modification
class Shape {
  area() {
    throw new Error('Must implement area()');
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }
  
  area() {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }
  
  area() {
    return this.width * this.height;
  }
}

// Adding new shapes = add new class, no modification
class Triangle extends Shape {
  constructor(base, height) {
    super();
    this.base = base;
    this.height = height;
  }
  
  area() {
    return 0.5 * this.base * this.height;
  }
}
```

---

## L - Liskov Substitution Principle

**Subtypes must be substitutable for their base types.**

### Problem

```javascript
// ❌ Bad - Square breaks rectangle behavior
class Rectangle {
  setWidth(width) { this.width = width; }
  setHeight(height) { this.height = height; }
  area() { return this.width * this.height; }
}

class Square extends Rectangle {
  setWidth(width) {
    this.width = width;
    this.height = width; // Violates expected behavior!
  }
  setHeight(height) {
    this.width = height;
    this.height = height;
  }
}

// This breaks:
function resize(rectangle) {
  rectangle.setWidth(5);
  rectangle.setHeight(10);
  // Expected area: 50, but Square gives 100!
}
```

### Solution

```javascript
// ✅ Good - Separate abstractions
class Shape {
  area() { throw new Error('Implement area()'); }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }
  area() { return this.width * this.height; }
}

class Square extends Shape {
  constructor(side) {
    super();
    this.side = side;
  }
  area() { return this.side ** 2; }
}
```

---

## I - Interface Segregation Principle

**Many specific interfaces are better than one general interface.**

### Problem

```javascript
// ❌ Bad - Fat interface
class Worker {
  work() { }
  eat() { }
  sleep() { }
}

class Robot extends Worker {
  work() { /* OK */ }
  eat() { throw new Error('Robots dont eat'); } // Forced to implement
  sleep() { throw new Error('Robots dont sleep'); }
}
```

### Solution

```javascript
// ✅ Good - Segregated interfaces
class Workable {
  work() { }
}

class Eatable {
  eat() { }
}

class Sleepable {
  sleep() { }
}

class Human {
  work() { /* ... */ }
  eat() { /* ... */ }
  sleep() { /* ... */ }
}

class Robot {
  work() { /* ... */ }
  // Only implements what it needs
}
```

---

## D - Dependency Inversion Principle

**Depend on abstractions, not concretions.**

### Problem

```javascript
// ❌ Bad - Depends on concrete implementation
class UserService {
  constructor() {
    this.database = new MySQLDatabase(); // Tight coupling
  }
  
  getUser(id) {
    return this.database.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}
```

### Solution

```javascript
// ✅ Good - Depends on abstraction
class Database {
  query(sql) { throw new Error('Implement query()'); }
}

class MySQLDatabase extends Database {
  query(sql) { /* MySQL specific */ }
}

class PostgresDatabase extends Database {
  query(sql) { /* Postgres specific */ }
}

class UserService {
  constructor(database) {
    this.database = database; // Injected dependency
  }
  
  getUser(id) {
    return this.database.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

// Usage - easy to swap implementations
const db = new PostgresDatabase();
const userService = new UserService(db);
```

---

## Summary

| Principle | Key Question |
|-----------|--------------|
| SRP | Does this class have only one reason to change? |
| OCP | Can I extend behavior without modifying existing code? |
| LSP | Can subtypes replace base types without breaking? |
| ISP | Am I forcing classes to implement unused methods? |
| DIP | Am I depending on abstractions or concretions? |
