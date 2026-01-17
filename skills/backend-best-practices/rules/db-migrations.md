---
title: Use Migrations for Schema Changes
impact: CRITICAL
impactDescription: Prevents data loss and ensures consistent schemas across environments
tags: database, migrations, schema, versioning
---

## Use Migrations for Schema Changes

Always use migrations to manage database schema changes in a versioned, repeatable, and reversible way.

**Incorrect (manual schema changes):**

```javascript
// Manually running SQL in production - DANGEROUS!
// No version control, no rollback, no tracking
db.execute(`
  ALTER TABLE users ADD COLUMN phone VARCHAR(20);
`);

// Different developers run different changes
// Schema drifts between environments
// No way to track what changed when
```

**Correct (using migrations):**

```javascript
// Knex.js Migration
exports.up = function(knex) {
  return knex.schema.table('users', (table) => {
    table.string('phone', 20).nullable();
    table.index('phone');
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('phone');
  });
};
```

**Sequelize Migration:**

```javascript
// migrations/20240118-add-phone-to-users.js
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'phone', {
      type: Sequelize.STRING(20),
      allowNull: true
    });
    
    await queryInterface.addIndex('users', ['phone']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'phone');
  }
};
```

**TypeORM Migration:**

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPhoneToUsers1640000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn("users", new TableColumn({
      name: "phone",
      type: "varchar",
      length: "20",
      isNullable: true
    }));
    
    await queryRunner.createIndex("users", {
      name: "IDX_USER_PHONE",
      columnNames: ["phone"]
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("users", "phone");
  }
}
```

**MongoDB Migration (migrate-mongo):**

```javascript
// migrations/20240118-add-email-index.js
module.exports = {
  async up(db, client) {
    await db.collection('users').createIndex(
      { email: 1 },
      { unique: true }
    );
    
    // Data migration
    await db.collection('users').updateMany(
      { status: { $exists: false } },
      { $set: { status: 'active' } }
    );
  },

  async down(db, client) {
    await db.collection('users').dropIndex('email_1');
    await db.collection('users').updateMany(
      {},
      { $unset: { status: '' } }
    );
  }
};
```

**Running Migrations:**

```bash
# Create new migration
npx knex migrate:make add_phone_to_users

# Run pending migrations
npx knex migrate:latest

# Rollback last migration
npx knex migrate:rollback

# Check migration status
npx knex migrate:status
```

**Complex Data Migration:**

```javascript
// Migration with data transformation
exports.up = async function(knex) {
  // 1. Add new column
  await knex.schema.table('users', (table) => {
    table.jsonb('address').nullable();
  });
  
  // 2. Migrate data from old format
  const users = await knex('users').select('id', 'street', 'city', 'zip');
  
  for (const user of users) {
    await knex('users')
      .where('id', user.id)
      .update({
        address: {
          street: user.street,
          city: user.city,
          zip: user.zip
        }
      });
  }
  
  // 3. Drop old columns
  await knex.schema.table('users', (table) => {
    table.dropColumn('street');
    table.dropColumn('city');
    table.dropColumn('zip');
  });
};
```

**Best Practices:**
- Never modify existing migrations - create new ones
- Test migrations on staging before production
- Include both `up` and `down` methods
- Use descriptive migration names with timestamps
- Keep migrations small and focused
- Run migrations as part of deployment pipeline
- Backup database before running migrations
- Document breaking changes in migration comments

**CI/CD Integration:**

```yaml
# .github/workflows/deploy.yml
- name: Run database migrations
  run: npm run migrate:latest
  
- name: Deploy application
  run: npm run deploy
```

Reference: [Database Migration Best Practices](https://www.prisma.io/dataguide/types/relational/migration-best-practices)
