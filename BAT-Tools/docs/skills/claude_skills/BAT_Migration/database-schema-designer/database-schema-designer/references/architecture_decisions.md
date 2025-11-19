# Architecture Decision Framework

## Three Critical Decisions

Your Week 2 architecture decisions determine the entire database schema design. Each decision has significant implications.

## Decision 1: Plan-Pack Relationships

**Question**: Are packs universal or plan-specific?

### Universal Packs Approach
**Model**: Single pack library shared across all plans

**When to Choose**:
- Same pack appears in multiple plans with identical contents
- High pack reuse ratio (>10x)
- Want centralized pack management
- Pack changes should affect all plans using them

**Schema Impact**:
- Single `packs` table (no plan_id)
- Pack changes ripple to all plans automatically
- Easier to maintain pack standards
- Better for standardization across companies

**Evidence Needed**:
- Pack reuse analysis
- Content comparison across plans
- Update frequency patterns

### Plan-Specific Packs Approach
**Model**: Packs defined per plan

**When to Choose**:
- Same pack name has different contents per plan
- Low pack reuse ratio (<3x)
- Plans need independent pack customization
- Pack changes should not affect other plans

**Schema Impact**:
- `packs` table includes plan_id foreign key
- Each plan has its own pack definitions
- More flexibility, less standardization
- Larger pack table (duplicates allowed)

**Evidence Needed**:
- Low reuse metrics
- Conflicting pack contents
- Plan-specific requirements

## Decision 2: Plan-Elevation Modeling

**Question**: Is elevation a variant of plan or a separate dimension?

### Dimension Approach (RECOMMENDED)
**Model**: Elevation as dimensional attribute

**When to Choose**:
- Elevations can't exist without parent plan
- Same materials used across elevations (just different quantities)
- Plan Index shows elevation as attribute
- Richmond's triple-encoding causes problems

**Schema Impact**:
- Separate `elevations` table with plan_id FK
- Single-encoding (one location for elevation data)
- Clean relationships: plan → elevations → materials
- Elevation is relationship, not identity

**Evidence**:
- Richmond Plan Index structure (plans primary, elevations attributes)
- Holt's single-encoding best practice
- Material reuse across elevations

**Benefits**:
- Fixes Richmond's triple-encoding problem
- No synchronization issues
- Clear hierarchical structure
- Matches domain model

### Variant Approach
**Model**: Elevations as plan variants

**When to Choose**:
- Elevations are fundamentally different plans
- Low material overlap between elevations
- Elevation can be described independently

**Schema Impact**:
- `plan_variants` table
- Variants treated as plan subtypes
- More complex relationships

**Trade-offs**:
- More abstract model
- Less intuitive for domain experts

## Decision 3: Internal Option Code Philosophy

**Question**: Systematic, mnemonic, or hybrid codes?

### Systematic (Holt-Style)
**Model**: Hierarchical numeric codes (10.20.30.040)

**When to Choose**:
- Want programmatic validation
- Need expandable hierarchy
- Prefer machine-readable structure
- Long-term maintainability priority

**Benefits**:
- Easy to add new categories
- Programmatically enforceable
- Clear hierarchy
- No ambiguity

**Trade-offs**:
- Less human-readable
- Requires reference documentation
- Learning curve for users

### Mnemonic (Richmond-Style)
**Model**: Letter prefixes (CONC1234, ELEC5678)

**When to Choose**:
- Human-readability is critical
- Users prefer intuitive codes
- Existing Richmond knowledge valuable
- Short-term adoption priority

**Benefits**:
- Instantly recognizable
- No training needed
- Preserves institutional knowledge

**Trade-offs**:
- 288 different patterns hard to manage
- Difficult to enforce programmatically
- Risk of prefix proliferation

### Hybrid (RECOMMENDED)
**Model**: Combine both approaches

**Implementation**:
- Use systematic internal codes
- Maintain mapping to mnemonic codes
- Support both for queries
- Best of both worlds

**Schema Impact**:
- `code_mappings` table
- unified_code, richmond_code, holt_code columns
- Support legacy references
- Enable gradual migration

**Benefits**:
- Systematic structure for new system
- Preserve Richmond institutional knowledge
- Support Holt hierarchical approach
- Smooth transition path

**Trade-offs**:
- More complex initially
- Mapping table overhead
- Need to maintain synchronization

## Decision-Making Process

1. **Gather Evidence** (use BAT Migration Analyzer skill)
   - Analyze actual data files
   - Calculate reuse ratios
   - Check for conflicts
   - Document patterns

2. **Validate with Experts**
   - William Hatley (Richmond)
   - Alicia Vandehey (Holt)
   - Confirm interpretation
   - Check business rules

3. **Consider Long-Term Impact**
   - Technical debt implications
   - Maintenance burden
   - Scalability
   - Learning curve

4. **Document Decision**
   - Record rationale
   - Note evidence used
   - Explain trade-offs
   - Set decision date

## Recommended Decisions

Based on Week 1 analysis:

1. **Plan-Pack**: Likely universal (pending reuse analysis)
2. **Elevation**: Dimension approach (strong evidence from Plan Index)
3. **Codes**: Hybrid approach (best of both worlds)

## Implementation Order

1. **Lock in elevation decision first** - affects most relationships
2. **Then pack relationship** - affects pack table structure
3. **Finally code philosophy** - can be added after core schema

## Warning

These decisions are foundational. Changing them after migration begins requires significant rework. Take time to get them right in Week 2.
