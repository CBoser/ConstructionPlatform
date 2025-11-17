# Richmond American - Lumber Lock Monthly Pricing Workbook
## Complete System Documentation

**File**: ORE_-_Lumber_Lock_Template_Vendor.xlsm  
**Size**: 21MB  
**Purpose**: Monthly lumber pricing validation, vendor updates, and cost summary distribution

---

## WORKBOOK STRUCTURE (27 Sheets)

### Setup & Configuration
1. Lumber Lock Setup
2. Contact List
3. Checklist (K26:K31 = email distribution)

### Data Input
4. Takeoff Upload Sheet
5. Item Generation
6. Item Cost Upload- Existing
7. Item Cost Upload- New Items
8. Item Conversion
9. Item Duplicates

### Validation & Analysis
10. **Lumber Lock - Validation Tool** (PRIMARY - columns J & AK)
11. Takeoff Revisions
12. Current Lock vs Prev Lock
13. Plan Cost Variance Summary

### Vendor Communication
14. Vendor Update (Commodity)
15. Vendor Update (Non-Commodity)

### Summary & Reporting
16. Pricing Summary
17. Takeoff Summary
18-25. LbrRpt/PnlRpt (4 versions each)

### Archive & History
26. Previous Lumber Lock (archived J & AK)
27. Previous Cost Summary
28. Consolidated Data

---

## VBA MODULES

### Module 1: Export Tool
Creates vendor-ready export file with selected sheets, converts formulas to values (except Validation Tool), protects sheet with password.

**Action Required**: Change password "YourPassword"

### Module 2 & 5: Email Distribution (DUPLICATES)
Creates Outlook email with screenshots to recipients from Checklist K26:K31.

**Action Required**: 
- Update SharePoint URL placeholder
- Delete duplicate module

### Module 3: Archive Previous Lock
Copies current Validation Tool (columns J & AK) to Previous Lumber Lock, archives Pricing Summary.

**Use**: Run at END of month before starting next lock.

### Module 4: BLANK
Available for future functionality.

---

## MONTHLY WORKFLOW

**Week 1**: Data Collection (upload takeoffs, costs)
**Week 2**: Validation (check variances, compare to previous)
**Week 3**: Vendor Communication (generate reports, export)
**Week 4**: Distribution (email, SharePoint, archive)

---

## KEY IMPROVEMENTS NEEDED

1. Remove duplicate email module (2 & 5 identical)
2. Update SharePoint URL placeholder
3. Change visible password in code
4. Add error handling/logging
5. Consolidate 8 similar report sheets?

