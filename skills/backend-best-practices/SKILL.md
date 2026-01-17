---
name: backend-best-practices
description: Universal backend development best practices and performance optimization guidelines. This skill should be used when writing, reviewing, or refactoring backend code to ensure optimal patterns, security, and performance. Triggers on tasks involving API development, database design, authentication, error handling, or backend optimization.
license: MIT
metadata:
  author: community
  version: "1.0.0"
---

# Backend Best Practices

Comprehensive best practices guide for universal backend development. Contains 39 rules across 8 categories, prioritized by impact to guide automated refactoring and code generation.

## When to Apply

Reference these guidelines when:
- Writing new backend APIs or services
- Implementing authentication and authorization
- Designing database schemas and queries
- Reviewing code for security or performance issues
- Refactoring existing backend code
- Deploying or optimizing backend services

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | API Design | CRITICAL | `api-` |
| 2 | Database Optimization | CRITICAL | `db-` |
| 3 | Security | CRITICAL | `security-` |
| 4 | Performance | HIGH | `perf-` |
| 5 | Error Handling | HIGH | `error-` |
| 6 | Architecture | MEDIUM | `arch-` |
| 7 | Code Quality | MEDIUM | `code-` |
| 8 | Deployment | LOW-MEDIUM | `deploy-` |

## Quick Reference

### 1. API Design (CRITICAL)

- `api-restful-conventions` - Follow RESTful naming and HTTP method conventions
- `api-versioning` - Implement API versioning from the start
- `api-pagination` - Use pagination for list endpoints
- `api-rate-limiting` - Implement rate limiting to prevent abuse
- `api-consistent-responses` - Use consistent response structures

### 2. Database Optimization (CRITICAL)

- `db-indexing` - Create indexes for frequently queried fields
- `db-n-plus-one` - Avoid N+1 query problems
- `db-connection-pooling` - Use connection pooling
- `db-transactions` - Use transactions for data consistency
- `db-migrations` - Use migrations for schema changes

### 3. Security (CRITICAL)

- `security-input-validation` - Validate and sanitize all user inputs
- `security-sql-injection` - Use parameterized queries to prevent SQL injection
- `security-jwt-best-practices` - Follow JWT best practices
- `security-https-only` - Enforce HTTPS in production

### 4. Performance (HIGH)

- `perf-caching` - Implement caching strategies
- `perf-async-operations` - Use async/await for I/O operations
- `perf-lazy-loading` - Implement lazy loading for heavy resources
- `perf-compression` - Enable gzip compression
- `perf-database-queries` - Optimize database queries

### 5. Error Handling (HIGH)

- `error-global-handler` - Implement global error handling
- `error-meaningful-messages` - Provide meaningful error messages
- `error-logging` - Log errors with context
- `error-http-status-codes` - Use appropriate HTTP status codes
- `error-graceful-degradation` - Implement graceful degradation

### 6. Architecture (MEDIUM)

- `arch-separation-concerns` - Separate business logic from routes
- `arch-dependency-injection` - Use dependency injection
- `arch-repository-pattern` - Implement repository pattern for data access
- `arch-service-layer` - Create service layers for business logic
- `arch-dto-pattern` - Use DTOs for data transfer

### 7. Code Quality (MEDIUM)

- `code-dry-principle` - Follow DRY (Don't Repeat Yourself)
- `code-naming-conventions` - Use clear and consistent naming
- `code-single-responsibility` - Follow single responsibility principle
- `code-type-safety` - Use strong typing where available
- `code-documentation` - Document complex logic and APIs

### 8. Deployment (LOW-MEDIUM)

- `deploy-environment-variables` - Use environment variables for configuration
- `deploy-health-checks` - Implement health check endpoints
- `deploy-graceful-shutdown` - Handle graceful shutdowns
- `deploy-monitoring` - Set up monitoring and alerts
- `deploy-zero-downtime` - Implement zero-downtime deployments

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/api-restful-conventions.md
rules/db-indexing.md
rules/security-input-validation.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and references
