# Database Migration Architecture Analysis & Implementation Prompt

Perform a complete analysis of the existing project architecture, database structure, backend implementation, ORM/query patterns, migration strategy, deployment workflow, and environment configuration.

## Objective

Design and implement a unified database migration system that supports multiple database providers:

* PostgreSQL Migration
* Supabase Migration
* MySQL Migration

The goal is to create a centralized and maintainable migration architecture where all database-related operations can be managed from a single location while maintaining compatibility across multiple database engines.

---

## Analysis Requirements

Before writing any code:

### 1. Project Architecture Analysis

Analyze:

* Project folder structure
* Backend framework
* ORM or query builder being used
* Existing database configuration
* Existing migration implementation
* Environment management
* Database connection handling
* CI/CD deployment process
* Multi-environment support (Development, Staging, Production)

Generate a detailed report containing:

* Current database architecture
* Current migration workflow
* Existing limitations
* Potential risks
* Required refactoring
* Recommended architecture improvements

---

### 2. Database Analysis

Inspect and document:

#### Tables

For every table:

* Table name
* Columns
* Data types
* Constraints
* Default values
* Relationships
* Indexes
* Triggers

#### Relationships

Analyze:

* One-to-One
* One-to-Many
* Many-to-Many

Generate an ERD-style structure summary.

---

### 3. Migration Strategy Design

Design a migration architecture supporting:

```text
database/
├── migrations/
│   ├── postgres/
│   ├── supabase/
│   └── mysql/
│
├── schema/
│   ├── users/
│   ├── products/
│   ├── orders/
│   └── ...
│
├── seeds/
│
├── scripts/
│
└── migration_runner/
```

Requirements:

* Version-controlled migrations
* Rollback support
* Migration history tracking
* Environment-specific execution
* Idempotent migrations
* Transaction support
* Seed support
* Automatic migration validation

---

### 4. Unified Migration Manager

Create a centralized migration manager capable of:

#### Commands

```bash
npm run migrate:postgres
npm run migrate:mysql
npm run migrate:supabase

npm run migrate:up
npm run migrate:down

npm run migrate:status

npm run seed

npm run db:reset
```

The migration manager should:

* Detect database type automatically
* Execute correct migration files
* Track migration versions
* Generate migration logs
* Handle failures safely
* Support dry-run mode

---

### 5. Migration Code Generation

Generate production-ready code for:

#### PostgreSQL

* Migration runner
* Migration templates
* Rollback templates
* Schema synchronization

#### Supabase

* Migration runner
* SQL migration files
* Supabase CLI integration
* Environment configuration

#### MySQL

* Migration runner
* SQL migration files
* Rollback support
* Schema synchronization

---

### 6. Configuration Management

Create:

```env
DB_PROVIDER=postgres

POSTGRES_HOST=
POSTGRES_PORT=
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=

MYSQL_HOST=
MYSQL_PORT=
MYSQL_DB=
MYSQL_USER=
MYSQL_PASSWORD=

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Provide validation logic for all configurations.

---

### 7. Migration Tracking

Design migration tracking table:

```sql
migration_history
```

Fields:

* id
* migration_name
* version
* executed_at
* execution_time
* database_provider
* status
* checksum

Support:

* Rollback history
* Failure tracking
* Re-execution protection

---

### 8. Developer Experience

Provide:

* Migration creation command
* Rollback command
* Status command
* Seed command
* Database reset command

Include examples for each.

---

### 9. Production Readiness

Analyze and implement:

* Backup strategy before migration
* Transaction safety
* Migration locking
* Concurrent deployment handling
* Data integrity validation
* Rollback recovery plan

---

### 10. Deliverables

Generate:

1. Detailed architecture analysis
2. Migration strategy documentation
3. Folder structure recommendation
4. PostgreSQL migration code
5. Supabase migration code
6. MySQL migration code
7. Migration manager implementation
8. Configuration files
9. Environment examples
10. Rollback implementation
11. Seed implementation
12. Deployment workflow
13. CI/CD integration examples
14. Best practices document
15. Risk assessment report

---

## Critical Instructions

* First analyze the existing project completely.
* Do not make assumptions.
* Inspect actual code before proposing changes.
* Explain every architectural decision.
* Identify missing information and blockers.
* If any ambiguity, uncertainty, missing file, missing configuration, missing schema, or missing implementation detail exists:

STOP.

List all missing information.

Ask precise questions before generating migration code.

Do not continue implementation until all required information is available.
