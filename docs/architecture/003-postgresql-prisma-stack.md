# ADR-003: PostgreSQL + Prisma Stack

**Date:** 2025-11-09
**Status:** Implemented

---

## Context

MindFlow needs a database solution that can handle:
- Complex relational data (plans with elevations, materials with pricing tiers)
- ACID transactions (financial data integrity)
- Full-text search (plan names, materials)
- JSON flexibility (external system mappings)
- Good TypeScript integration

## Decision

Use **PostgreSQL 15** as the database with **Prisma ORM** for data access.

**Concrete setup:**
- PostgreSQL 15 via Docker for local development
- Railway PostgreSQL for production
- Prisma ORM with TypeScript client generation
- Prisma Migrate for schema migrations
- Prisma Studio for database exploration

## Rationale

1. **PostgreSQL strengths**
   - Mature, battle-tested for financial/transactional data
   - Excellent JSON support for flexible external mappings
   - Full-text search built-in
   - Strong community and tooling

2. **Prisma benefits**
   - Type-safe database access (catches errors at compile time)
   - Auto-generated TypeScript types from schema
   - Declarative schema (easy to understand and version)
   - Excellent migration tooling
   - Prisma Studio for quick data exploration

3. **Developer experience**
   - Single source of truth (schema.prisma)
   - IntelliSense for all database queries
   - Easy seeding and testing

## Alternatives Considered

### MongoDB
- Pros: Flexible schema, good for documents
- Cons: Weak transactions, relational data requires workarounds
- Why rejected: Construction data is highly relational (plans → elevations → options → materials)

### TypeORM
- Pros: Mature, decorator-based
- Cons: Type safety issues, migrations can be brittle
- Why rejected: Prisma's type generation is significantly better

### Raw SQL with pg
- Pros: Full control, no ORM overhead
- Cons: No type safety, manual migration management
- Why rejected: Too much boilerplate, error-prone

## Consequences

### Positive
- Type-safe queries catch bugs at compile time
- Schema changes are versioned and repeatable
- Easy to onboard developers (just run migrations)
- Prisma Studio enables quick data inspection

### Trade-offs
- Prisma has some performance overhead (mitigation: use raw queries for hot paths)
- Learning curve for Prisma-specific patterns (mitigation: good documentation)
- Network restrictions can block `prisma generate` (mitigation: documented workaround)

## Implementation

**Current state:**
- 22 Prisma models defined
- Connection pooling configured
- Migrations automated in setup scripts

**Key files:**
- `backend/prisma/schema.prisma` - Database schema
- `backend/prisma/migrations/` - Migration history
- `backend/prisma/seed.ts` - Seed data

## Review

**Next review:** After 6 months of production use

**Questions to answer:**
- Is Prisma performance acceptable?
- Are migrations causing deployment issues?
- Do we need raw queries for any hot paths?

---

**Created:** 2025-11-09
