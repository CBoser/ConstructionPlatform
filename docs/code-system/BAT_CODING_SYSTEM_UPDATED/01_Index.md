# Central Material Database
## BAT Unified Coding System v2.0

**Generated:** 2025-12-13 22:00:08
**Total SKUs:** 516
**Phase Codes:** 53

---

## Document Index

| Document | Description |
|----------|-------------|
| [01_Index.md](01_Index.md) | This file - overview and navigation |
| [02_Item_Type_CrossRef.md](02_Item_Type_CrossRef.md) | Unified ↔ Holt ↔ Richmond mapping (Rosetta Stone) |
| [03_Phase_Codes.md](03_Phase_Codes.md) | Complete phase codes with fluid format |
| [04_Suffix_Codes.md](04_Suffix_Codes.md) | Single and two-digit suffix reference |
| [05_Elevation_Mapping.md](05_Elevation_Mapping.md) | Letter ↔ Digit elevation conversion |
| [06_Master_Materials.md](06_Master_Materials.md) | All 516 unique SKUs |
| [07_RICHMOND_Materials.md](07_RICHMOND_Materials.md) | RICHMOND-specific materials |
| [08_HOLT_Materials.md](08_HOLT_Materials.md) | HOLT-specific materials |
| [09_Format_Patterns.md](09_Format_Patterns.md) | Fluid phase code format explanation |

---

## Quick Reference

### Unified Code Structure
```
PPPP-PPP.XXS-EE-IIII
│    │       │   │
│    │       │   └─ Item Type (1000, 2100, etc.)
│    │       └───── Elevation (A, B, **, etc.)
│    └─────────── Phase Code (PPP.XXS fluid)
└──────────────── Plan Code (G914, 1670, etc.)
```

### Phase Code Format (Fluid)
```
PPP.XXS
│   │││
│   ││└─ S  = Single suffix (1-9) OR last digit of ZZ
│   │└── X  = Option digit OR first digit of ZZ
│   └─── X  = Option digit OR 0 (placeholder)
└─────── PPP = Major phase (010, 020, 060)
```

### Summary Statistics

| Metric | Count |
|--------|-------|
| Total Unique SKUs | 516 |
| RICHMOND Materials | 400 |
| HOLT Materials | 278 |
| Phase Codes | 53 |
| Suffix Codes | 17 |
| Item Types | 9 |
