# Richmond Code Catalog

## Overview
Richmond uses 288 different mnemonic prefix patterns. This document catalogs the most common prefixes and their meanings.

## Prefix Categories

### Foundation & Concrete (10.xx)
- **CONC** - Concrete materials
- **FOUND** - Foundation specific
- **REBAR** - Reinforcing steel
- **CONC** variants: concrete forms, mix, accessories

**Item Count**: ~3,500 items
**Examples**: CONC1234, FOUND567, REBAR890

### Framing & Structure (20.xx)
- **FRAM** / **FRM** - Framing lumber
- **LMBR** - Lumber general
- **TRUSS** - Roof trusses
- **BEAM** - Structural beams
- **JOIST** - Floor/ceiling joists

**Item Count**: ~8,200 items
**Examples**: FRAM2345, LMBR678, TRUSS901

### Electrical (30.xx)
- **ELEC** - Electrical general
- **WIRE** - Wiring/cable
- **PANEL** - Electrical panels
- **LIGHT** - Lighting fixtures
- **SWITCH** - Switches/outlets

**Item Count**: ~6,100 items
**Examples**: ELEC3456, WIRE789, PANEL012

### Plumbing (40.xx)
- **PLMB** - Plumbing general
- **PIPE** - Pipes/fittings
- **FIXT** - Fixtures
- **VALVE** - Valves/controls

**Item Count**: ~5,800 items
**Examples**: PLMB4567, PIPE890, FIXT123

### HVAC (50.xx)
- **HVAC** - HVAC general
- **DUCT** - Ductwork
- **VENT** - Ventilation
- **FURN** - Furnaces
- **AC** - Air conditioning

**Item Count**: ~3,200 items
**Examples**: HVAC5678, DUCT901, VENT234

### Finishes (60.xx)
- **DRYWALL** / **DRY** - Drywall/gypsum
- **PAINT** - Paint/primer
- **FLOOR** - Flooring
- **TILE** - Tile/stone
- **CARPET** - Carpet/pad
- **TRIM** - Trim/molding

**Item Count**: ~12,400 items
**Examples**: DRY6789, PAINT012, FLOOR345

### Fixtures & Appliances (70.xx)
- **CAB** - Cabinets
- **APPL** - Appliances
- **VANITY** - Bathroom vanities
- **COUNTER** - Countertops

**Item Count**: ~4,200 items
**Examples**: CAB7890, APPL123, VANITY456

### Doors & Windows (80.xx)
- **DOOR** - Doors
- **WIND** - Windows
- **GLASS** - Glazing
- **GARAGE** - Garage doors
- **HARDWARE** - Door hardware

**Item Count**: ~4,800 items
**Examples**: DOOR8901, WIND234, GLASS567

### Roofing (90.xx)
- **ROOF** - Roofing materials
- **SHINGLE** - Shingles
- **GUTTER** - Gutters/downspouts
- **FLASHING** - Flashing

**Item Count**: ~2,600 items
**Examples**: ROOF9012, SHINGLE345, GUTTER678

### Insulation & Waterproofing (100.xx)
- **INSUL** - Insulation
- **BATT** - Batt insulation
- **FOAM** - Foam insulation
- **VAPOR** - Vapor barriers
- **WATERPROOF** - Waterproofing

**Item Count**: ~1,800 items

## Prefix Variants & Aliases

Many categories have multiple prefixes for the same material:

### Framing Variants
- FRM, FRAM, FRAME → All framing
- LMBR, LUMBER → Both lumber

### Drywall Variants
- DRY, DRYWALL, GYPS → All drywall

### Electrical Variants
- ELEC, ELECTRICAL → Both electrical

## Vendor SKU Passthrough

Richmond codes follow pattern: **PREFIX** + **VENDOR_SKU**

**Example**:
- Richmond Code: CONC123456
- Prefix: CONC (concrete)
- Vendor SKU: 123456 (original vendor number)

**Advantage**: Easy vendor ordering
**Disadvantage**: No systematic structure

## Common Patterns

### Numeric Suffixes
Most Richmond codes use vendor SKU numbers:
- 4-6 digit numbers
- Sometimes include letters (CONC123A)
- No inherent meaning in numbers

### Prefix Length
- Most prefixes: 3-6 characters
- Shortest: AC (2 chars)
- Longest: WATERPROOF (10 chars)

### Abbreviation Style
- All caps
- Phonetic abbreviations
- First letters of words
- Sometimes vowel-dropped (LMBR from LUMBER)

## Migration Challenges

### Inconsistent Abbreviations
- FRAM vs FRM vs FRAME
- Need standardization

### Overlapping Meanings
- FIXT could be plumbing or electrical fixtures
- Context-dependent

### Missing Hierarchy
- All codes at same level
- No parent-child relationships
- Hard to organize systematically

## Recommended Mapping

For hybrid approach, map Richmond prefixes to numeric categories:

**10.CONC** ← CONC
**20.FRAM** ← FRAM, FRM, FRAME
**30.ELEC** ← ELEC, ELECTRICAL
**40.PLMB** ← PLMB, PLUMBING
**50.HVAC** ← HVAC
**60.DRYWALL** ← DRY, DRYWALL, GYPS
**70.APPL** ← APPL, APPLIANCE
**80.DOOR** ← DOOR
**90.ROOF** ← ROOF, ROOFING

## Preservation Strategy

**Institutional Knowledge to Preserve**:
- Prefix meanings (what CONC means)
- Common abbreviations
- Vendor relationships
- Category groupings

**Implementation**:
- Document all 288 patterns
- Create prefix → category mapping
- Maintain lookup table
- Train new hires with reference

## Usage Frequency

**Top 20 Prefixes** (by item count):
1. DRY (Drywall) - ~4,200 items
2. FRAM (Framing) - ~3,800 items
3. ELEC (Electrical) - ~3,600 items
4. PLMB (Plumbing) - ~3,100 items
5. PAINT - ~2,900 items
... (continues)

**Long Tail**: 180+ prefixes with <100 items each

## Quality Issues

**Duplicate Prefixes**:
- Some materials coded under multiple prefixes
- Inconsistent categorization

**Orphaned Items**:
- ~500 items with unclear prefix meaning
- Need manual review and recategorization

**Data Cleanup Needed**:
- Standardize variants
- Remove duplicates
- Assign orphans to categories
