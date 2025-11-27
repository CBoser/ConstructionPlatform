# Data Import Directory

Place your CSV files in this directory for importing into the Construction Platform database.

## Expected Files

### Plans.csv
Plan index file with floor plan information.

**Expected Columns:**
- `code` or `Code` or `Plan` - Plan code (e.g., "1670", "G21D")
- `name` or `Name` - Plan name
- `type` or `Type` or `Stories` - Plan type (single, two, three, duplex, townhome)
- `sqft` or `SqFt` or `SquareFootage` - Square footage
- `bedrooms` or `Bedrooms` - Number of bedrooms
- `bathrooms` or `Bathrooms` - Number of bathrooms
- `garage` or `Garage` - Garage type (e.g., "2-Car", "3-Car")
- `style` or `Style` - Architectural style

### SH_Unconverted.csv (Primary pricing source)
Materials with pricing data from the BAT system.

**Expected Columns:**
- `Sku` - Material SKU
- `Description` - Material description
- `Price` - Vendor cost
- `Pack` - Pack name for DART category inference
- `Category` - Material category (optional)
- `UnitOfMeasure` or `UOM` - Unit of measure

### MaterialDatabase.csv (Optional)
Current materials list with additional metadata.

## Usage

From the `backend` directory, run:

```bash
# Import all data (plans and materials)
npm run import:data

# Import only plans
npm run import:plans

# Import only materials
npm run import:materials
```

## Notes

- The import script will skip existing records (by code/sku)
- For materials, if the same SKU appears multiple times, the highest price is used
- DART categories are inferred from Pack names when available
- RL (Random Lengths) linking is auto-detected for lumber items
