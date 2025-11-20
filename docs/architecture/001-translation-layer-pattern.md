# ADR-001: Translation Layer Pattern

**Date:** 2025-11-14
**Status:** Implemented

---

## Context

Production builders have 70+ interconnected Excel spreadsheets containing decades of pricing expertise. This "tribal knowledge" is powerful but fragile, opaque, and unscalable.

Multiple builders use different systems with different identifiers:
- Richmond American: Custom internal codes
- Holt Homes: Community-based coding
- Others will have their own systems

We need a way to preserve this knowledge while enabling multi-builder support.

## Decision

Implement MindFlow as a **Translation Layer** that:
1. Preserves external system identifiers (never force system changes)
2. Maintains unified internal schema (normalized, universal)
3. Provides bidirectional mapping (external <-> internal)
4. Translates executable knowledge (Excel) -> declarative (database + business logic)

**Key Pattern:** MindFlow is a "Rosetta Stone" - it doesn't replace external systems, it translates between them.

## Rationale

1. **Adoption** - Builders can't stop operations for system migration. Translation enables gradual adoption.
2. **Preservation** - Excel formulas encode institutional knowledge. Better to translate than dismiss.
3. **Scalability** - Unified internal schema enables cross-builder analytics and simplifies maintenance.
4. **Flexibility** - Creates portable platform that can onboard new builders without major rework.

## Alternatives Considered

### Force Single Standard
- Rejected: Kills adoption, requires operational halt for existing builders

### Builder-Specific Instances
- Rejected: No cross-builder value, maintenance nightmare at scale

### API-Only Integration
- Rejected: Doesn't preserve Excel knowledge, loses transparency of calculations

## Consequences

### Positive
- Multi-builder support from day one
- Gradual adoption path (less risk)
- Preserves institutional knowledge
- Enables cross-builder insights
- Competitive advantage (flexibility)

### Trade-offs
- Translation logic complexity (mitigation: extensive validation, audit logs)
- Must maintain mapping tables (mitigation: version mappings, detect drift)
- Performance overhead (mitigation: cache mappings, optimize queries)

## Implementation

**Phase 0-1:** Foundation with translation support
**Phase 1.5:** BAT import tool (Richmond -> Holt -> Generic)
**Phase 2:** Multi-builder operational validation

**Key files:**
- `database/schema.prisma` - Internal schema
- `docs/Migration Strategy/` - Translation logic
- `BAT Files/` - Source institutional knowledge

## Review

**Next review:** After Phase 2 completion (Feb 2026)

**Questions to answer:**
- Is translation overhead acceptable?
- Are mappings maintainable?
- Can we support 3+ builders?

---

**Created:** 2025-11-14
