# Suffix Codes Reference
## Single-Digit (S) and Two-Digit (ZZ)

---

## Single-Digit Suffixes (S = 1-9)

Used in `.XXS` format where option code takes first two positions.

| S | Legacy | Description | Example |
|---|--------|-------------|---------|
| 1 | rf | ReadyFrame | 010.821 = Optional Den + ReadyFrame |
| 2 | — | Reserved |  |
| 3 | lo, l | Loft variant |  |
| 4 | nl | No Loft variant |  |
| 5 | x | Extended |  |
| 6 | sr | Sunroom |  |
| 7 | pw | Post Wrap |  |
| 8 | tc | Tall Crawl |  |
| 9 | 9t | 9' Tall Walls |  |

---

## Two-Digit Suffixes (ZZ = 10-19)

Used in `.0ZZ` format where no option code is present.

| ZZ | Legacy | Description | Example |
|----|--------|-------------|---------|
| 10 | 10t | 10' Tall Walls |  |
| 11 | ec | Enhanced Corners | 060.011 = Siding + Enhanced Corners |
| 12 | er | Enhanced Rear |  |
| 13 | fw | Faux Wood |  |
| 14 | ma, m | Masonry |  |
| 15 | pr | Porch Rail |  |
| 18 | s | Exterior Stair |  |
| 19 | hw | Housewrap Options |  |

---

## Suffix Usage Examples

| Legacy Pack | Phase Code | Breakdown |
|-------------|------------|-----------|
| `\|20rf` | `020.001` | 00 + S=1 (ReadyFrame) |
| `\|34lo` | `034.003` | 00 + S=3 (Loft) |
| `\|10tc` | `010.008` | 00 + S=8 (Tall Crawl) |
| `\|60ec` | `060.011` | 0 + ZZ=11 (Enhanced Corners) |
| `\|60m` | `060.014` | 0 + ZZ=14 (Masonry) |
| `\|10.82rf` | `010.821` | XX=82 + S=1 (Optional Den + RF) |
| `\|34.61lo` | `034.613` | XX=61 + S=3 (Loft→Bed + Loft) |
