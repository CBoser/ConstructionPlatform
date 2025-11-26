"""
Prompt Library for Spreadsheet Business Logic Extraction
Contains organized prompts for LLM-assisted analysis.
"""

from dataclasses import dataclass
from typing import List, Dict, Optional
from analyzer import AnalysisResult


@dataclass
class Prompt:
    id: str
    name: str
    prompt: str
    category: str


# ============================================================================
# PROMPT LIBRARY
# ============================================================================

PROMPT_LIBRARY: Dict[str, Dict] = {
    "discovery": {
        "name": "Discovery & Overview",
        "prompts": [
            {
                "id": "purpose",
                "name": "Spreadsheet Purpose",
                "prompt": """Analyze this spreadsheet and describe:
1. What is the primary purpose of this spreadsheet?
2. Who are the intended users?
3. What are the main inputs and outputs?
4. What business process does it support?"""
            },
            {
                "id": "inventory",
                "name": "Sheet Inventory",
                "prompt": """List all sheets/tabs in this workbook and for each one:
1. Sheet name and purpose
2. Is it for input, calculation, output, or reference data?
3. How does it relate to other sheets?
4. Is it user-facing or hidden/backend?"""
            },
        ]
    },
    "formulas": {
        "name": "Formula & Calculation Analysis",
        "prompts": [
            {
                "id": "formula-extraction",
                "name": "Formula Extraction",
                "prompt": """For this sheet/range, extract all formulas and document:
1. Cell reference and the raw formula
2. Plain English explanation of what it calculates
3. All cell dependencies (inputs it relies on)
4. The data type of the result (currency, percentage, count, etc.)
5. Any error handling (IFERROR, IFNA, etc.)"""
            },
            {
                "id": "calc-chain",
                "name": "Calculation Chains",
                "prompt": """Identify the calculation flow in this spreadsheet:
1. What are the initial input cells (no formula dependencies)?
2. What is the order of calculations (dependency chain)?
3. What are the final output cells?
4. Are there any circular references?
5. Create a flowchart or dependency diagram of the calculation logic."""
            },
            {
                "id": "complex-formula",
                "name": "Complex Formula Breakdown",
                "prompt": """Break down this complex formula into its component parts:
[PASTE FORMULA HERE]

1. Explain each nested function from innermost to outermost
2. What conditions/logic does it evaluate?
3. What are all possible output values?
4. What edge cases might cause unexpected results?
5. Rewrite the logic as pseudocode or step-by-step rules."""
            },
            {
                "id": "dynamic-array",
                "name": "Dynamic Array Analysis",
                "prompt": """For each dynamic array formula (FILTER, SORT, UNIQUE, SEQUENCE, etc.):
1. What data set does it operate on?
2. What filtering/sorting criteria are applied?
3. How does the output size vary based on input?
4. What happens when there are no matching results?
5. Express this as a database query or filter operation."""
            },
        ]
    },
    "tables": {
        "name": "Table & Data Structure",
        "prompts": [
            {
                "id": "table-doc",
                "name": "Table Documentation",
                "prompt": """For each Excel Table (ListObject) in this workbook:
1. Table name and location
2. Column names and data types
3. Primary key or unique identifier (if any)
4. Calculated columns and their formulas
5. Total row calculations
6. How is this table referenced by other formulas?"""
            },
            {
                "id": "relationships",
                "name": "Data Relationships",
                "prompt": """Identify relationships between tables/ranges:
1. What lookup relationships exist (VLOOKUP, XLOOKUP, INDEX/MATCH)?
2. Which fields are used as keys to connect data?
3. Is it one-to-one, one-to-many, or many-to-many?
4. Create an entity-relationship diagram of the data model."""
            },
            {
                "id": "named-ranges",
                "name": "Named Ranges & Constants",
                "prompt": """Document all named ranges and defined names:
1. Name and scope (workbook or sheet level)
2. What it refers to (cell, range, formula, or constant)
3. How it's used throughout the workbook
4. Business meaning of the value"""
            },
        ]
    },
    "business_rules": {
        "name": "Business Rules & Validation",
        "prompts": [
            {
                "id": "conditional-logic",
                "name": "Conditional Logic Extraction",
                "prompt": """Extract all business rules expressed through conditional logic:
1. IF statements and their conditions
2. SWITCH/IFS/CHOOSE logic
3. Conditional formatting rules and what they indicate
4. Express each as a business rule in plain English:
   "IF [condition] THEN [action/result] ELSE [alternative]" """
            },
            {
                "id": "validation",
                "name": "Data Validation Rules",
                "prompt": """Document all data validation:
1. Which cells have validation?
2. What type (list, number range, date, custom formula)?
3. What are the allowed values?
4. What error messages are shown?
5. Express as business constraints."""
            },
            {
                "id": "thresholds",
                "name": "Threshold & Tier Logic",
                "prompt": """Identify any tiered pricing, thresholds, or bracket logic:
1. What are the tier breakpoints?
2. What rates/values apply to each tier?
3. Is it marginal (each tier separately) or flat (whole amount at one rate)?
4. Document as a pricing/rate table with rules."""
            },
        ]
    },
    "lookups": {
        "name": "Lookup & Reference Data",
        "prompts": [
            {
                "id": "conversion-charts",
                "name": "Conversion Chart Analysis",
                "prompt": """For each conversion or reference table:
1. What is being converted from/to?
2. What are all the mapping pairs?
3. Is it a direct lookup or interpolated?
4. What happens for values not in the table?
5. How frequently does this reference data change?"""
            },
            {
                "id": "rate-tables",
                "name": "Rate Tables",
                "prompt": """Document all rate/pricing tables:
1. What dimensions affect the rate (size, material, location, etc.)?
2. What is the structure (simple list, matrix, multi-dimensional)?
3. What are all the rate values?
4. What units are the rates in?
5. When were rates last updated and how often do they change?"""
            },
            {
                "id": "material-lists",
                "name": "Material/Product Lists",
                "prompt": """Extract product/material master data:
1. Item codes/IDs
2. Descriptions
3. Units of measure
4. Associated pricing or cost data
5. Categories or groupings
6. Any attributes or specifications"""
            },
        ]
    },
    "pricing": {
        "name": "Pricing & Cost Calculations",
        "prompts": [
            {
                "id": "cost-buildup",
                "name": "Cost Buildup",
                "prompt": """Document the cost calculation methodology:
1. What are all the cost components?
2. How is each component calculated?
3. What markup/margin is applied and how?
4. What's the formula for final price?
5. Are there minimums, maximums, or rounding rules?"""
            },
            {
                "id": "quantity-takeoff",
                "name": "Quantity Takeoff Logic",
                "prompt": """For quantity/measurement calculations:
1. What inputs are required (dimensions, counts, etc.)?
2. What formulas convert inputs to quantities?
3. What waste factors or allowances are applied?
4. How are partial units handled (round up, exact, etc.)?"""
            },
            {
                "id": "labor-calc",
                "name": "Labor Calculations",
                "prompt": """Document labor estimating logic:
1. What productivity rates are used?
2. How are crew sizes determined?
3. How is duration calculated?
4. What factors affect labor (complexity, conditions, etc.)?
5. How are labor costs calculated from hours?"""
            },
        ]
    },
    "construction": {
        "name": "Construction & Bidding",
        "prompts": [
            {
                "id": "bid-item",
                "name": "Bid Item Analysis",
                "prompt": """For each bid item or line item in this spreadsheet:
1. What is the item code/number and description?
2. What unit of measure is used?
3. How is the quantity determined?
4. What components make up the unit price?
   - Material cost
   - Labor cost
   - Equipment cost
   - Subcontractor cost
   - Overhead allocation
   - Profit margin
5. Are there any adjustments or factors applied?"""
            },
            {
                "id": "markup",
                "name": "Markup & Burden Analysis",
                "prompt": """Document all markup, burden, and overhead calculations:
1. What is the base cost before markups?
2. What overhead rates are applied (field, home office)?
3. What burden rates are applied (labor burden, insurance)?
4. What profit margin is used?
5. Are markups applied sequentially or on the base?
6. What is the formula for total markup percentage?"""
            },
            {
                "id": "unit-price",
                "name": "Unit Price Buildup",
                "prompt": """For each priced item, document the unit price buildup:
1. Direct material cost per unit
2. Direct labor hours and cost per unit
3. Equipment hours and cost per unit
4. Production rate assumptions
5. Crew composition
6. All factors and multipliers applied
7. Final unit price calculation"""
            },
        ]
    },
    "code_conversion": {
        "name": "Code Conversion Preparation",
        "prompts": [
            {
                "id": "function-inventory",
                "name": "Function Inventory",
                "prompt": """Create an inventory of all Excel functions used:
1. List each unique function
2. How many times is it used?
3. What's the programming equivalent?
4. Are there any Excel-specific functions that need special handling?"""
            },
            {
                "id": "pseudocode",
                "name": "Pseudocode Generation",
                "prompt": """Convert this spreadsheet logic to pseudocode:
1. Define all inputs as variables
2. Define all constants and lookup tables
3. Write the calculation steps as functions
4. Show the order of operations
5. Define the outputs"""
            },
            {
                "id": "data-model",
                "name": "Data Model Design",
                "prompt": """Design a database schema to support this spreadsheet:
1. What entities/tables are needed?
2. What fields does each table need?
3. What are the relationships between tables?
4. What should be stored vs. calculated?"""
            },
            {
                "id": "api-contract",
                "name": "API Contract",
                "prompt": """If this spreadsheet were an API, define:
1. What would the input payload look like (JSON)?
2. What would the output payload look like (JSON)?
3. What validation would the API perform?
4. What error responses are possible?"""
            },
        ]
    },
    "testing": {
        "name": "Testing & Validation",
        "prompts": [
            {
                "id": "test-cases",
                "name": "Test Case Generation",
                "prompt": """Generate test cases for this spreadsheet:
1. Create test inputs that exercise normal conditions
2. Create test inputs for boundary conditions
3. Create test inputs for error conditions
4. What are the expected outputs for each test case?
5. What known examples can serve as validation?"""
            },
            {
                "id": "reasonableness",
                "name": "Reasonableness Checks",
                "prompt": """Identify reasonableness checks and validation:
1. What sanity checks exist in the spreadsheet?
2. What ranges are "reasonable" for key values?
3. What ratios or metrics indicate problems?
4. How would you validate the output is correct?"""
            },
        ]
    },
    "location": {
        "name": "Location & Regional Factors",
        "prompts": [
            {
                "id": "location-adj",
                "name": "Location Adjustments",
                "prompt": """Document location-based adjustments:
1. What geographic areas/regions are defined?
2. What location factors are applied to costs?
3. Are factors different for labor, material, equipment?
4. How are factors determined or sourced?
5. How do users select or input location?"""
            },
            {
                "id": "tax-fees",
                "name": "Tax & Fee Calculations",
                "prompt": """Document tax and fee logic:
1. What taxes are calculated (sales tax, use tax)?
2. What are the tax rates and what are they applied to?
3. Are there exemptions or special rules?
4. What permits or fees are included?
5. How are rates determined by location?"""
            },
        ]
    },
}


def get_all_prompts() -> List[Prompt]:
    """Get all prompts as a flat list."""
    prompts = []
    for category_id, category in PROMPT_LIBRARY.items():
        for p in category["prompts"]:
            prompts.append(Prompt(
                id=p["id"],
                name=p["name"],
                prompt=p["prompt"],
                category=category["name"]
            ))
    return prompts


def get_prompts_by_category(category_id: str) -> List[Prompt]:
    """Get prompts for a specific category."""
    if category_id not in PROMPT_LIBRARY:
        return []

    category = PROMPT_LIBRARY[category_id]
    return [
        Prompt(
            id=p["id"],
            name=p["name"],
            prompt=p["prompt"],
            category=category["name"]
        )
        for p in category["prompts"]
    ]


def get_prompt_by_id(prompt_id: str) -> Optional[Prompt]:
    """Get a specific prompt by ID."""
    for category_id, category in PROMPT_LIBRARY.items():
        for p in category["prompts"]:
            if p["id"] == prompt_id:
                return Prompt(
                    id=p["id"],
                    name=p["name"],
                    prompt=p["prompt"],
                    category=category["name"]
                )
    return None


def generate_contextual_prompt(prompt: Prompt, analysis: Optional[AnalysisResult] = None,
                                custom_context: str = "") -> str:
    """Generate a prompt with spreadsheet context added."""
    result = ""

    if analysis:
        # Add spreadsheet context header
        result += f"""## Spreadsheet Context
- **File:** {analysis.file_name}
- **Size:** {analysis.file_size / 1024:.2f} KB
- **Sheets:** {len(analysis.sheets)}
- **Formulas:** {len(analysis.formulas)}
- **Complexity:** {analysis.complexity}
- **Functions Used:** {', '.join(sorted(analysis.function_stats.keys())[:15]) or 'None detected'}

## Analysis Task
"""

    result += prompt.prompt

    if custom_context:
        result += f"\n\n## Additional Context\n{custom_context}"

    return result


def generate_contextual_prompts(analysis: AnalysisResult) -> List[str]:
    """Generate contextual prompts based on spreadsheet analysis."""
    prompts = []

    # Basic overview
    prompts.append(
        f'This spreadsheet "{analysis.file_name}" has {len(analysis.sheets)} sheets, '
        f'{len(analysis.formulas)} formulas, and is rated as "{analysis.complexity}" complexity. '
        f'Please provide an overview of its purpose and structure.'
    )

    # Sheet-specific prompts
    for sheet in analysis.sheets:
        if sheet.formula_count > 0:
            prompts.append(
                f'Analyze sheet "{sheet.name}" which contains {sheet.formula_count} formulas '
                f'across {sheet.cell_count} cells. What calculations are being performed?'
            )

    # Function-specific prompts
    top_functions = sorted(analysis.function_stats.items(), key=lambda x: -x[1])[:5]
    if top_functions:
        func_list = ', '.join(f'{f} ({c}x)' for f, c in top_functions)
        prompts.append(
            f'The most used Excel functions are: {func_list}. '
            f'Explain what business logic these functions are implementing.'
        )

    # Named ranges
    if analysis.named_ranges:
        prompts.append(
            f'There are {len(analysis.named_ranges)} named ranges/defined names. '
            f'List each one and explain its business purpose.'
        )

    # Complex formulas
    complex_formulas = [f for f in analysis.formulas
                        if len(f.functions) > 3 or f.is_array_formula or len(f.formula) > 100]
    for formula in complex_formulas[:5]:
        prompts.append(
            f'Break down this complex formula at {formula.sheet}!{formula.address}: ={formula.formula}'
        )

    return prompts


def export_analysis_markdown(analysis: AnalysisResult) -> str:
    """Export analysis as markdown documentation."""
    md = f"""# Spreadsheet Analysis: {analysis.file_name}

## Summary
- **File Size:** {analysis.file_size / 1024:.2f} KB
- **Sheets:** {len(analysis.sheets)}
- **Formulas:** {len(analysis.formulas)}
- **Named Ranges:** {len(analysis.named_ranges)}
- **Tables:** {len(analysis.tables)}
- **Complexity:** {analysis.complexity}

## Sheets

| Sheet Name | Rows | Columns | Formulas | Tables |
|------------|------|---------|----------|--------|
"""
    for sheet in analysis.sheets:
        md += f"| {sheet.name} | {sheet.row_count} | {sheet.column_count} | {sheet.formula_count} | {'Yes' if sheet.has_tables else 'No'} |\n"

    md += "\n## Excel Functions Used\n\n"
    if analysis.function_stats:
        md += "| Function | Count |\n|----------|-------|\n"
        for func, count in sorted(analysis.function_stats.items(), key=lambda x: -x[1])[:20]:
            md += f"| {func} | {count} |\n"
    else:
        md += "No functions detected.\n"

    if analysis.named_ranges:
        md += "\n## Named Ranges\n\n"
        md += "| Name | Scope | Refers To |\n|------|-------|----------|\n"
        for nr in analysis.named_ranges:
            md += f"| {nr.name} | {nr.scope} | {nr.refers_to} |\n"

    if analysis.formulas:
        md += "\n## Formulas (Sample)\n\n"
        for formula in analysis.formulas[:30]:
            md += f"### {formula.sheet}!{formula.address}\n"
            md += f"```\n={formula.formula}\n```\n"
            if formula.functions:
                md += f"- **Functions:** {', '.join(formula.functions)}\n"
            if formula.dependencies:
                md += f"- **Dependencies:** {', '.join(formula.dependencies[:5])}\n"
            if formula.is_array_formula:
                md += f"- **Array Formula:** Yes\n"
            md += "\n"

    if analysis.errors:
        md += "\n## Notes/Warnings\n\n"
        for error in analysis.errors:
            md += f"- {error}\n"

    md += "\n---\n*Generated by Spreadsheet Business Logic Extractor*\n"

    return md
