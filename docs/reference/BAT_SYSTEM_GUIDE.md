# Customer IDs, Pricing Tiers & Contact Information
## BAT System Reference Guide

---

## 1. Key Customer Accounts

### Primary Customers

| Customer Name | Bill-To ID | Customer ID | Sales ID | Salesperson | Location |
|--------------|------------|-------------|----------|-------------|----------|
| **HERITAGE HMS OF MOLALLA OR** (Holt Homes) | 655352 | 662662 | P761647 | COREY BOSER | CLACORAD |
| **RICHMOND AMERICAN HOMES OR** | 633637 | 825812 | P761647 | COREY BOSER | CLACORAD |
| **MANOR HOMES NW** | 740180 | 987403 | - | - | - |

### Account Types
| Code | Meaning |
|------|---------|
| M | Master Account (primary billing relationship) |
| Q | Quote Account (temporary/bid pricing) |

### Customer Types
- SINGLE FAMILY (residential homebuilders)

---

## 2. Pricing Tier Structure

### Tier Range
| Tier | Description | Discount Level |
|------|-------------|----------------|
| 01 | List Price | 0% (full price) |
| 02-04 | Low Discount | ~5-15% |
| 05-07 | Medium Discount | ~15-22% |
| 08-10 | High Discount | ~22-28% |
| 11-12 | Maximum Discount | ~28-30% |
| L5 | Random Lengths Calculation | Variable (commodity-based) |

### How Tiers Work
Each product in the PriceSchedule has 12 price points (PL01-PL12). The customer's tier assignment per category determines which price column to use.

**Formula:**
```
Sell Price Column = 14 + (Tier × 3)

Example: Tier 09 → Column 14 + (9 × 3) = Column 41 (AR in Excel)
```

---

## 3. Customer Pricing Tier Assignments

### HOLT HOMES (Heritage HMS of Molalla OR)
| Category | Code | Tier | Meaning |
|----------|------|------|---------|
| Lumber | 01-Lumber | 09 | High discount |
| Structural Panels | 02-StrctP | 08 | High discount |
| Engineered Wood | 03-EngWdP | 10 | High discount |
| Trusses | 04-TrusWP | 01 | List price (special pricing) |
| Millwork | 05-MilWrk | 11 | Max discount |
| Windows | 06-Window | 12 | Max discount |
| Doors | 07-Doors | 10 | High discount |
| Cabinets/Tops | 08-CabTop | 09 | High discount |
| Siding/Masonry | 09-SidMCn | 09 | High discount |
| Insulation | 10-Insul | 08 | High discount |
| Roofing | 11-Roofing | 06 | Medium discount |
| Gypsum | 12-Gypsum | 08 | High discount |
| Hardware | 13-Hrdwr | 05 | Medium discount |
| Home Center | 14-HomeCen | 01 | List price |
| Special | special | L5 | Random Lengths calc |

### RICHMOND AMERICAN HOMES OR
*(Same tier assignments as Holt - both are major accounts)*

| Category | Tier |
|----------|------|
| 01-Lumber | 09 |
| 02-StrctP | 08 |
| 03-EngWdP | 10 |
| 04-TrusWP | 01 |
| 05-MilWrk | 11 |
| 06-Window | 12 |
| 07-Doors | 10 |
| 08-CabTop | 09 |
| 09-SidMCn | 09 |
| 10-Insul | 08 |
| 11-Roofing | 06 |
| 12-Gypsum | 08 |
| 13-Hrdwr | 05 |
| 14-HomeCen | 01 |
| special | L5 |

---

## 4. Location Codes

| Code | Location | State |
|------|----------|-------|
| CLACORAD | Clackamas OR Yard | Oregon |
| FOGRORYD | Forest Grove OR Yard | Oregon |
| TANGORYD | Tangent OR Yard | Oregon |
| VANCWAYD | Vancouver WA Yard | Washington |
| LACEWACR | Credit Location | - |

---

## 5. PriceSchedule Structure

The PriceSchedule sheet (719 rows, 27 columns) contains customer-specific pricing:

### Column Layout
| Column | Field | Description |
|--------|-------|-------------|
| A | Item ID | SKU/Product code |
| B | PC | Product Category code |
| C | Description | Product name |
| D | Location | OREGON, WASHINGTON, etc. |
| E | Customer | Bill-To ID (e.g., 655352) |
| F | Class | Item classification |
| G | Name | Customer name |
| H | UOM | Unit of measure |
| I | CurSell | Current sell price |
| J | CurMargin | Current margin % |
| K | NewSell | New/updated sell price |
| L | Margin | New margin % |
| M | ConvSell | Converted sell price |
| N | ConvUM | Converted UOM |
| O | Blend Cst | Blended cost |
| P | Avg Cost | Average cost |
| Q | Avg Marg | Average margin |
| R | Rep Cost | Replacement cost |
| S | Rep Marg | Replacement margin |
| T | PO Cost | Purchase order cost |
| U | 12M Use | 12-month usage qty |
| V | Factor | Conversion factor |
| W | Begin | Effective start date |
| X | Ending | Effective end date |
| Y | Changed | Last change date |

### Sample Data
| Item ID | Description | UOM | CurSell | CurMargin | Customer |
|---------|-------------|-----|---------|-----------|----------|
| 312712DF18GL | 3-1/2X7-1/2 GLAM LF | LF | $10.69 | 18.99% | 655352 |
| 3129DF18GL | 3-1/2X9 GLAM LF | LF | $12.19 | 19.44% | 655352 |
| 3121012DF18GL | 3-1/2X10-1/2 GLAM LF | LF | $14.19 | 19.31% | 655352 |
| 3121178DF18GL | 3-1/2X11-7/8 GLAM LF | LF | $15.99 | 19.20% | 655352 |
| 31214DF18GL | 3-1/2X14 GLAM LF | LF | $20.29 | 19.32% | 655352 |

---

## 6. Quote Accounts (Temporary Pricing)

For bid/quote purposes, tiered quote accounts are available:

| Quote Account | Bill-To ID | Default Tiers |
|--------------|------------|---------------|
| QUOTE 71 | 670526 | All 12s (max discount) |
| QUOTE 72 | 667292 | Same as major accounts |
| QUOTE 73 | 667293 | Slightly lower |
| QUOTE 74 | 667294 | Medium discount |
| QUOTE 75 | 667295 | Lower discount |
| BEND QUOTE 71-75 | 825013-825018 | Regional variants |

---

## 7. DART Category Mapping

The DART categories determine how products are classified for tier pricing:

| DART Code | Category Header | Description |
|-----------|-----------------|-------------|
| 1 | 01-Lumber | Dimensional lumber, boards |
| 2 | 02-StrctP | Plywood, OSB, sheathing |
| 3 | 03-EngWdP | I-joists, LVL, glulam |
| 4 | 04-TrusWP | Floor/roof trusses |
| 5 | 05-MilWrk | Trim, molding, millwork |
| 6 | 06-Window | Windows, skylights |
| 7 | 07-Doors | Entry, interior doors |
| 8 | 08-CabTop | Cabinets, countertops |
| 9 | 09-SidMCn | Siding, masonry, concrete |
| 10 | 10-Insul | Insulation materials |
| 11 | 11-Roofing | Shingles, underlayment |
| 12 | 12-Gypsum | Drywall, joint compound |
| 13 | 13-Hrdwr | Hardware, fasteners |
| 14 | 14-HomeCen | Home center items |
| 15 | special | Special order (RL calc) |

---

## 8. Pricing Flow

```
1. Identify Customer (Bill-To ID)
         ↓
2. Look up Customer Price Levels
         ↓
3. Get Tier for Product's DART Category
         ↓
4. Find Product in PriceSchedule/Unconverted
         ↓
5. Calculate Price:
   - Fixed Tier (01-12): Use PL{tier} column
   - L5/special: Use Random Lengths calculation
         ↓
6. Apply to Takeoff Quantities
```

---

## 9. Contact Information Available

From the BAT files, limited contact info is available:

| Field | Available | Example |
|-------|-----------|---------|
| Customer Name | ✅ | HERITAGE HMS OF MOLALLA OR* |
| Bill-To ID | ✅ | 655352 |
| Customer ID | ✅ | 662662 |
| Sales ID | ✅ | P761647 |
| Salesperson Name | ✅ | COREY BOSER |
| Location Code | ✅ | CLACORAD |
| Phone | ❌ | Not in BAT |
| Email | ❌ | Not in BAT |
| Address | ❌ | Not in BAT |

*Note: Full contact details would be in the ERP/CRM system (Prism), not the BAT files.*

---

## 10. Integration Notes

### For MindFlow Integration
```prisma
model Customer {
  id              String   @id @default(cuid())
  name            String
  billToId        String   @unique  // 655352
  customerId      String?  @unique  // 662662
  salesId         String?            // P761647
  salespersonName String?
  locationCode    String?            // CLACORAD
  accountType     String?            // M, Q
  customerType    String?            // SINGLE FAMILY
  status          String   @default("Active")
  pricingTiers    CustomerPricingTier[]
}

model CustomerPricingTier {
  id           String   @id @default(cuid())
  customerId   String
  customer     Customer @relation(fields: [customerId], references: [id])
  dartCategory Int      // 1-15
  tier         String   // 01-12 or L5
}
```

---

*Reference data extracted from HOLT_BAT_DECEMBER_2025_11-21-25.xlsm, PDSS, and ST1 Prideboard files.*
