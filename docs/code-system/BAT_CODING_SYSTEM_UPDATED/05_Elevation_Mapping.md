# Elevation Mapping
## Letter ↔ Digit Conversion

---

## Standard Elevations

| Letter | Digit | Notes |
|--------|-------|-------|
| A | 1 | Primary elevation |
| B | 2 | Secondary elevation |
| C | 3 | Tertiary elevation |
| D | 4 | Fourth elevation |
| E | 5 | Fifth elevation |
| F | 6 | Sixth elevation |
| G | 7 | Seventh elevation |
| H | 8 | Eighth elevation |
| J | 9 | Ninth elevation (I skipped) |
| K | 10 | Tenth elevation |
| ** | ALL | All elevations / Universal |

---

## Multi-Elevation Codes

| Code | Meaning |
|------|---------|
| AB | Elevations A and B |
| BC | Elevations B and C |
| BCD | Elevations B, C, and D |
| ABCD | All four elevations |
| ** | Universal (all elevations) |

---

## Holt Code Extraction

In Holt 9-digit codes, elevation is position 7:

```
PPPP-XXXEY-CCCC
         │
         └─ E = Elevation digit (1=A, 2=B, etc.)

Example: 1670-10103-4085
         Elevation digit: 1 → Elevation A
```
