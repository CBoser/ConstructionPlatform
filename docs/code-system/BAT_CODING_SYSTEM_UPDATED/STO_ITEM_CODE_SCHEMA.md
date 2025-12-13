# STO Item Code Schema
## Sales Team One - Descriptive Material Codes

**Version:** 1.0  
**Updated:** December 2025  
**Purpose:** Human-readable item codes that describe the material at a glance

---

## Code Format Overview

```
PREFIX-DIMENSION-SPEC[-VARIANT][-SEQ]

Examples:
  2X4-8-SPF           → 2x4 x 8' SPF #2
  2X6-92-5/8-DF       → 2x6 x 92-5/8" DF Stud Grade
  OSB-7/16-4X8-TG     → 7/16" OSB 4x8 Tongue & Groove
  HANGER-LUS28        → Simpson LUS28 Joist Hanger
  GLB-5X18            → Glulam Beam 5" x 18"
```

---

## Category Prefixes

### Dimensional Lumber

| Prefix | Description | Format | Examples |
|--------|-------------|--------|----------|
| `2X4` | 2x4 Lumber | `2X4-LENGTH-SPECIES` | `2X4-8-SPF`, `2X4-92-5/8-DF` |
| `2X6` | 2x6 Lumber | `2X6-LENGTH-SPECIES` | `2X6-16-SPF`, `2X6-104-5/8-DF` |
| `2X8` | 2x8 Lumber | `2X8-LENGTH-SPECIES` | `2X8-12-DF` |
| `2X10` | 2x10 Lumber | `2X10-LENGTH-SPECIES` | `2X10-20-DF` |
| `2X12` | 2x12 Lumber | `2X12-LENGTH-SPECIES` | `2X12-16-DF` |
| `4X4` | 4x4 Post | `4X4-LENGTH-SPECIES` | `4X4-8-DF-PT-GC` |
| `4X6` | 4x6 Beam | `4X6-LENGTH-SPECIES` | `4X6-16-DF` |
| `6X6` | 6x6 Post | `6X6-LENGTH-SPECIES` | `6X6-12-DF` |
| `6X8` | 6x8 Beam | `6X8-LENGTH-SPECIES` | `6X8-20-DF` |

**Species Codes:**
| Code | Species |
|------|---------|
| `DF` | Douglas Fir |
| `SPF` | Spruce-Pine-Fir |
| `HF` | Hem-Fir |
| `SYP` | Southern Yellow Pine |
| `CED` | Cedar |
| `CYP` | Cypress |
| `RW` | Redwood |

**Length Codes:**
- Standard: `8`, `10`, `12`, `14`, `16`, `18`, `20`
- Stud: `92-5/8` (8' walls), `104-5/8` (9' walls)
- Random Length: `RL`

---

### Engineered Lumber

| Prefix | Description | Format | Examples |
|--------|-------------|--------|----------|
| `IJT` | I-Joist | `IJT-DEPTH-MODEL` | `IJT-9-1/2-TJI110`, `IJT-11-7/8-TJI110` |
| `LVL` | Laminated Veneer Lumber | `LVL-THKxDEPTH` | `LVL-1-3/4X11-7/8` |
| `LSL` | Laminated Strand Lumber | `LSL-THKxDEPTH` | `LSL-1-1/2X9-1/2` |
| `RIM` | Rim Board | `RIM-THKxDEPTH` | `RIM-1-1/8X9-1/2` |
| `GLB` | Glulam Beam | `GLB-WIDTHxDEPTH` | `GLB-5-1/2X18`, `GLB-3-1/2X10-1/2` |
| `PSL` | Parallel Strand Lumber | `PSL-THKxDEPTH` | `PSL-3-1/2X11-7/8` |

---

### Sheathing & Panels

| Prefix | Description | Format | Examples |
|--------|-------------|--------|----------|
| `OSB` | Oriented Strand Board | `OSB-THK-SIZE[-VARIANT]` | `OSB-7/16-4X8`, `OSB-23/32-4X8-TG` |
| `PLY` | Plywood | `PLY-THK-GRADE-SIZE` | `PLY-1/2-CDX-4X8`, `PLY-3/4-RTD-4X8` |

**Variants:**
| Code | Meaning |
|------|---------|
| `-TG` | Tongue & Groove |
| `-RAD` | Radiant Barrier |
| `-PT` | Pressure Treated |

---

### Hardware - Simpson Strong-Tie

| Prefix | Description | Format | Examples |
|--------|-------------|--------|----------|
| `HANGER` | Joist Hanger | `HANGER-MODEL` | `HANGER-LUS28`, `HANGER-LUS210`, `HANGER-HUS210` |
| `ANCHOR` | Hold-Down/Anchor | `ANCHOR-MODEL` | `ANCHOR-HD5A`, `ANCHOR-ABA` |
| `BASE` | Post Base/Cap | `BASE-MODEL` | `BASE-ABU44Z`, `BASE-AC6Z` |
| `STRAP` | Strap Tie | `STRAP-MODEL` | `STRAP-LSTA21`, `STRAP-MST48` |
| `CLIP` | Clip/Angle | `CLIP-MODEL` | `CLIP-A35`, `CLIP-H2.5A` |
| `HDW` | General Hardware | `HDW-MODEL` | `HDW-A34`, `HDW-CNW7` |

---

### Siding & Exterior

| Prefix | Description | Format | Examples |
|--------|-------------|--------|----------|
| `SID` | Siding | `SID-BRAND-PROFILE` | `SID-HZ-LAP`, `SID-HZ-PANEL` |
| `TRIM` | Exterior Trim | `TRIM-SIZE-TYPE` or `TRIM-HZ-THKxWIDTH` | `TRIM-1X4-WW`, `TRIM-HZ-5/4X6` |
| `WRAP` | Housewrap | `WRAP-TYPE` | `WRAP-TYVEK` |

**Hardie Products (HZ):**
- `SID-HZ-LAP` = HardiePlank Lap Siding
- `SID-HZ-PANEL` = HardiePanel Vertical Siding
- `TRIM-HZ-5/4X6` = HardieTrim 5/4" x 6"

---

### Specialty Items

| Prefix | Description | Format | Examples |
|--------|-------------|--------|----------|
| `TRUSS` | Trusses | `TRUSS-TYPE-PLAN` | `TRUSS-FLR-1670`, `TRUSS-ROOF` |
| `VENT` | Vents | `VENT-WxH` | `VENT-12X18`, `VENT-18X24` |
| `STL` | Steel Framing | `STL-TYPE` | `STL-STUD`, `STL-RUNNER`, `STL-TRACK` |

---

## Suffix Codes

### Treatment Suffixes

| Suffix | Meaning |
|--------|---------|
| `-PT` | Pressure Treated (general) |
| `-PT-GC` | Pressure Treated Ground Contact (.40) |
| `-PT-AG` | Pressure Treated Above Ground (.15) |

### Variant Suffixes

| Suffix | Meaning |
|--------|---------|
| `-TG` | Tongue & Groove |
| `-FR` | Fire Rated |
| `-MR` | Moisture Resistant |

### Sequence Suffixes

When multiple items have the same base code, a sequence number is appended:
- `-01`, `-02`, `-03`, etc.

---

## Complete Examples

| STO Code | Description | Category |
|----------|-------------|----------|
| `2X4-8-SPF` | 2x4 x 8' SPF #2 | Dimensional Lumber |
| `2X4-92-5/8-DF` | 2x4 x 92-5/8" DF Stud Grade | Dimensional Lumber |
| `2X6-12-PT-GC` | 2x6 x 12' Pressure Treated Ground Contact | Pressure Treated |
| `4X4-8-DF-PT-GC` | 4x4 x 8' DF Pressure Treated Ground Contact | Pressure Treated |
| `IJT-11-7/8-TJI110` | TJI 110 I-Joist 11-7/8" | Engineered Lumber |
| `LVL-1-3/4X14` | LVL 1-3/4" x 14" Beam | Engineered Lumber |
| `GLB-5-1/2X18` | Glulam Beam 5-1/2" x 18" | Engineered Lumber |
| `RIM-1-1/8X9-1/2` | Rim Board 1-1/8" x 9-1/2" | Engineered Lumber |
| `OSB-7/16-4X8` | 7/16" OSB 4x8 Wall Sheathing | Sheathing |
| `OSB-23/32-4X8-TG` | 23/32" OSB 4x8 T&G Floor Sheathing | Sheathing |
| `PLY-1/2-CDX-4X8` | 1/2" CDX Plywood 4x8 | Sheathing |
| `HANGER-LUS28` | Simpson LUS28 Joist Hanger | Hardware |
| `HANGER-LUS210` | Simpson LUS210 Joist Hanger | Hardware |
| `ANCHOR-HD5A` | Simpson HD5A Hold-Down | Hardware |
| `STRAP-LSTA21` | Simpson LSTA21 Strap Tie | Hardware |
| `CLIP-A35` | Simpson A35 Framing Angle | Hardware |
| `SID-HZ-LAP` | HardiePlank Lap Siding | Siding |
| `SID-HZ-PANEL` | HardiePanel Vertical Siding | Siding |
| `TRIM-HZ-5/4X6` | HardieTrim 5/4" x 6" | Exterior Trim |
| `TRUSS-FLR-1670` | Floor Truss for Plan 1670 | Trusses |
| `VENT-18X24` | 18" x 24" Gable Vent | Accessories |

---

## Code Structure Summary

```
CATEGORY-DIMENSION-MATERIAL[-TREATMENT][-SEQUENCE]

Where:
  CATEGORY   = Product type (2X4, OSB, HANGER, etc.)
  DIMENSION  = Size/model (8, 92-5/8, LUS28, etc.)
  MATERIAL   = Species/grade when applicable (DF, SPF, CDX)
  TREATMENT  = Optional treatment suffix (-PT-GC, -TG, -FR)
  SEQUENCE   = Disambiguation number when needed (-01, -02)
```

---

## Cross-Reference to Unified Codes

| STO Code | BFS SKU | Unified Item Type |
|----------|---------|-------------------|
| `2X4-8-SPF` | 248SPF2 | 1000 (Framing) |
| `HANGER-LUS28` | LUS28 | 1000 (Framing) |
| `OSB-7/16-4X8` | 716OSB | 1000 (Framing) |
| `SID-HZ-LAP` | HZ1048 | 2100 (Siding) |
| `TRIM-HZ-5/4X6` | HZU54612 | 2100 (Siding) |

---

*Schema Version 1.0 - December 2025*  
*Sales Team One PDX - Builder's FirstSource*
