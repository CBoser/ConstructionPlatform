# ADR-002: Four-Layer Architecture

**Date:** 2025-11-09
**Status:** Implemented

---

## Context

MindFlow needs a system architecture that can handle complex construction workflows while remaining maintainable and scalable. The platform must support:
- Core business data (customers, plans, materials)
- Active construction operations (jobs, takeoffs)
- Financial transactions (POs, scheduling)
- Analytics and communication

We needed to organize these concerns in a way that's intuitive for construction professionals and technically sound for developers.

## Decision

Implement a **Four-Layer Architecture**:

```
┌─────────────────────────────────────┐
│ INTELLIGENCE LAYER                   │
│ Communications | Analytics           │
└─────────────────────────────────────┘
                 ↑
┌─────────────────────────────────────┐
│ TRANSACTION LAYER                    │
│ Purchase Orders | Scheduling         │
└─────────────────────────────────────┘
                 ↑
┌─────────────────────────────────────┐
│ OPERATIONAL CORE                     │
│ Communities | Jobs | Takeoffs        │
└─────────────────────────────────────┘
                 ↑
┌─────────────────────────────────────┐
│ FOUNDATION LAYER                     │
│ Customers | Plans | Materials        │
└─────────────────────────────────────┘
```

Each layer depends only on layers below it. Data flows up, actions flow down.

## Rationale

1. **Domain alignment** - Layers match how construction professionals think about their work (setup → operations → transactions → insights)
2. **Clear dependencies** - Each layer has well-defined responsibilities and dependencies
3. **Phased implementation** - Can build and deploy layers incrementally (Foundation first, Intelligence last)
4. **Testing isolation** - Each layer can be tested independently

## Alternatives Considered

### Flat/Feature-Based Architecture
- Pros: Simpler initial structure
- Cons: Dependencies become tangled as system grows
- Why rejected: Construction workflows have natural hierarchy that flat structure ignores

### Microservices Per Feature
- Pros: Independent deployment, technology flexibility
- Cons: Operational complexity, network latency, distributed transactions
- Why rejected: Premature optimization - monolith with clear layers is sufficient for current scale

## Consequences

### Positive
- Clear mental model for developers and stakeholders
- Natural implementation order (Foundation → Intelligence)
- Easy to explain system to new team members
- Supports incremental delivery

### Trade-offs
- Some features span layers (mitigation: clear interface contracts)
- Can feel rigid for features that don't fit neatly (mitigation: evaluate case-by-case)

## Implementation

**Phase 0:** Security foundation (complete)
**Phase 1:** Foundation Layer (customers, plans, materials)
**Phase 2:** Operational Core (jobs, takeoffs)
**Phase 3:** Transaction Layer (POs, scheduling)
**Phase 4:** Intelligence Layer (analytics, communications)

**Key files:**
- `README.md` - Architecture diagram
- `backend/src/routes/` - Routes organized by layer
- `database/schema.prisma` - Models organized by layer

## Review

**Next review:** After Phase 2 completion

**Questions to answer:**
- Are layer boundaries clear in practice?
- Do cross-layer features cause problems?

---

**Created:** 2025-11-09
