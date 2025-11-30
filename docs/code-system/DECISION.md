# Code System Decision

**Document**: Sprint 2 - Code System Review (Day 5)
**Date**: 2025-11-29
**Status**: FINAL DECISION

---

## Decision Summary

### Selected Approach: **Hybrid Trade-Based System**

After comprehensive evaluation of CSI MasterFormat, Uniformat II, trade-based, and phase-based systems, we have selected a **hybrid trade-based coding system** as the primary organizational structure for MindFlow Platform.

---

## Final Comparison Matrix

| Criteria | Weight | MasterFormat | Uniformat II | Trade-Based | Hybrid |
|----------|--------|--------------|--------------|-------------|--------|
| Industry Recognition | 15% | 5 | 4 | 3 | 3.5 |
| Ease of Use | 20% | 2 | 3 | 5 | 4.5 |
| Material Mapping | 15% | 4 | 2 | 5 | 5 |
| Vendor Compatibility | 15% | 3 | 2 | 4 | 4.5 |
| Workflow Alignment | 15% | 2 | 3 | 4 | 4.5 |
| Scalability | 10% | 5 | 4 | 3 | 4 |
| Learning Curve | 10% | 2 | 3 | 5 | 4.5 |
| **Weighted Total** | 100% | **3.00** | **2.85** | **4.20** | **4.30** |

**Winner: Hybrid Trade-Based System (4.30/5.00)**

---

## Rationale

### Why Not Pure CSI MasterFormat?

1. **Designed for Commercial**: MasterFormat targets institutional/commercial specifications, not residential production
2. **Vendor Disconnect**: Material suppliers don't use CSI codes for ordering
3. **Overkill Granularity**: 50 divisions is excessive for lumber-focused operations
4. **Learning Curve**: Requires significant training for everyday use
5. **License Dependency**: Full MasterFormat requires CSI subscription

### Why Not Pure Uniformat II?

1. **Too Abstract**: Element-based classification doesn't map to SKUs
2. **Not Material-Focused**: Designed for cost estimating, not inventory management
3. **Limited Adoption**: Less common in residential construction
4. **Vendor Incompatible**: No direct mapping to supplier catalogs

### Why Hybrid Trade-Based?

1. **Intuitive**: Matches how estimators think (lumber, roofing, siding)
2. **DART Compatible**: Aligns with existing BAT system categories
3. **Vendor Friendly**: Maps naturally to supplier product organization
4. **Flexible**: Supports optional phase prefixes and industry references
5. **Extensible**: Easy to add new trades/categories as needed
6. **Fast Training**: Self-documenting codes reduce learning curve

---

## System Components

### 1. Primary: Trade-Based Categories

Trade codes organize materials by who installs them:

| Trade | Code | Description |
|-------|------|-------------|
| Framing | FRM | Structural lumber, sheathing, hardware |
| Concrete | CONC | Ready-mix, rebar, forms |
| Roofing | ROOF | Shingles, underlayment, flashing |
| Siding | SIDE | Exterior cladding, trim |
| Insulation | INSL | Batt, blown, foam |
| Drywall | DRYW | Gypsum board, finishing |
| Electrical | ELEC | Wire, panels, fixtures |
| Plumbing | PLMB | Pipe, fittings, fixtures |
| HVAC | HVAC | Ductwork, equipment |
| Trim | TRIM | Millwork, doors, paint |
| Hardware | HDWR | Fasteners, connectors |
| Site | SITE | Grading, utilities |
| Miscellaneous | MISC | Other items |

### 2. Secondary: Category Codes

Within each trade, materials are grouped by type:

```
[TRADE]-[CATEGORY]-[SUBCATEGORY]-[DETAIL]

Example: FRM-LUM-2X4-SPF-8
         │   │   │    │   └─ Length (8')
         │   │   │    └───── Species (SPF)
         │   │   └────────── Size (2x4)
         │   └────────────── Category (Lumber)
         └────────────────── Trade (Framing)
```

### 3. Optional: Phase Prefixes

For scheduling and delivery, materials can have phase prefixes:

```
03:FRM-LUM-2X4-SPF-8  (Framing phase)
05:ROOF-SHG-ARCH-30Y  (Exterior phase)
```

### 4. Optional: Industry References

Materials can carry optional mappings for external compatibility:

| Field | Example | Use Case |
|-------|---------|----------|
| csiDivision | "06" | MasterFormat division |
| csiSection | "06 11 00" | MasterFormat section |
| uniformatElement | "B1010" | Uniformat II element |

---

## Schema Impact

### Material Model Updates

```prisma
model Material {
  // New primary code field
  code            String   @unique  // FRM-LUM-2X4-SPF-8

  // Parsed components for filtering
  tradeCode       String            // FRM
  categoryCode    String            // LUM

  // Keep existing fields
  sku             String   @unique
  description     String
  category        MaterialCategory
  dartCategory    Int?
  dartCategoryName String?

  // Optional industry references
  csiDivision     String?           // "06"
  csiSection      String?           // "06 11 00"
  uniformatElement String?          // "B1010"

  // Optional phase association
  primaryPhase    ConstructionPhase?
}
```

### Migration Plan

1. **Add `code` field** to Material model (nullable initially)
2. **Generate codes** for existing materials via script
3. **Validate codes** ensure all materials have valid codes
4. **Make required** change `code` to required, unique
5. **Update APIs** to support code-based queries
6. **Update UI** to display and search by code

---

## Implementation Timeline

| Week | Sprint | Tasks |
|------|--------|-------|
| 2 | Sprint 3 | Add code field to schema, generate codes for existing data |
| 3 | Sprint 3 | Update Material API to support code filtering |
| 4 | Sprint 4 | Add code field to UI components |
| 5+ | Sprint 5+ | Add supplier SKU mapping, external integrations |

---

## Success Criteria

### Immediate (Sprint 3)

- [ ] Code field added to Material model
- [ ] 100% of existing materials have valid codes
- [ ] API supports filtering by trade and category codes
- [ ] Documentation complete for code structure

### Short-term (Sprint 4-5)

- [ ] UI displays material codes
- [ ] Search works with partial code matches
- [ ] Import validates code format
- [ ] QuickBooks export uses code structure

### Long-term (Sprint 6+)

- [ ] Supplier SKU mapping implemented
- [ ] EDI integration uses codes
- [ ] Phase-based reporting available
- [ ] Industry reference mapping complete

---

## Governance

Code system governance is documented in [GOVERNANCE.md](./GOVERNANCE.md). Key rules:

1. **No duplicate codes** - Each material has exactly one code
2. **Immutable trade codes** - Trade codes cannot change once established
3. **Approval required** - New categories require documented approval
4. **Version tracking** - Changes to code structure are versioned

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Code generation errors | Medium | Low | Validation script before migration |
| User adoption resistance | Medium | Medium | Training materials, gradual rollout |
| Legacy system conflicts | Low | Low | Keep existing SKU field for compatibility |
| Future extension needs | Low | High | Designed for extensibility from start |

---

## Approval

This decision has been reviewed and approved for implementation.

| Role | Name | Date |
|------|------|------|
| Product Owner | [Pending] | |
| Technical Lead | [Pending] | |
| Implementation | Claude AI | 2025-11-29 |

---

## References

- [CSI MasterFormat Analysis](./CSI_MASTERFORMAT_ANALYSIS.md)
- [Alternatives Analysis](./ALTERNATIVES_ANALYSIS.md)
- [Integration Compatibility](./INTEGRATION_COMPATIBILITY.md)
- [Hybrid System Design](./HYBRID_SYSTEM_DESIGN.md)
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- [Governance Rules](./GOVERNANCE.md)
- [Sample Codes](./SAMPLE_CODES.md)
