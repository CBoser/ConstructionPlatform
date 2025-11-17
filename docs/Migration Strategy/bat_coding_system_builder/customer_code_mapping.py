"""
Customer Code Mapping Configuration
This file defines how to convert customer-specific codes to unified BAT codes

Usage:
1. Define mappings for each customer system
2. Import wizard uses these mappings automatically
3. Translation tool references these mappings
"""

# Holt Homes Code Mapping
HOLT_MAPPING = {
    'system_name': 'Holt Homes',
    'code_format': 'PPPPPCCCSS-AAAA',
    
    # How to parse the Option/Phase Number
    'parse_rules': {
        'option_phase_number': {
            'format': 'PPPPPCCCSS - AAAA',
            'plan_position': [0, 4],      # Characters 0-4 = plan base (1670)
            'elevation_position': [4, 5],  # Character 4 = elevation digit
            'phase_position': [5, 8],      # Characters 5-8 = phase (010)
            'sequence_position': [8, 10],  # Characters 8-10 = sequence (00)
            'activity_position': 'after_dash'  # After " - " = activity (4085)
        }
    },
    
    # Elevation digit to letter mapping
    'elevation_map': {
        '0': '**',  # Universal
        '1': 'A',   # Elevation 1 = A
        '2': 'B',   # Elevation 2 = B
        '3': 'C',   # Elevation 3 = C
        '4': 'D'    # Elevation 4 = D
    },
    
    # Activity code to item type mapping
    'activity_to_item_type': {
        '4085': '1000',  # Framing/Lumber
        '4155': '2100',  # Siding
        '4215': '2200',  # Roofing
        '4125': '2300',  # Windows/Doors
        'default': '1000'  # Default to framing if unknown
    },
    
    # Phase to phase code mapping
    'phase_map': {
        '010': '010.000',  # Foundation
        '020': '020.000',  # Main floor walls
        '030': '030.000',  # Upper floor walls
        '040': '040.000',  # Roof trusses
        '050': '050.000',  # Roofing
        '060': '060.000',  # Housewrap
        '070': '070.000',  # Siding
    },
    
    # Column mappings for import
    'default_columns': {
        'holt_code': 'Option/Phase Number',
        'pack_id': 'Pack ID / Elevation(s) / Pack-Option Name',
        'vendor_sku': 'Sku',
        'description': 'OnlineDescription',
        'quantity': 'Qty',
        'unit': 'UOM'
    }
}


# Richmond American Homes Code Mapping
RICHMOND_MAPPING = {
    'system_name': 'Richmond American Homes',
    'code_format': '|XX.XX with optional elevation suffix',
    
    # How to parse pack IDs
    'parse_rules': {
        'pack_id': {
            'format': '|XX.XX[ELEVATION]',
            'starts_with': '|',
            'elevation_pattern': '[A-Z]+$',  # Letters at end = elevation
        }
    },
    
    # Pack number to phase mapping (from translation table)
    'uses_translation_table': True,
    'translation_table_file': 'coding_schema_translation_v2.csv',
    
    # Column mappings for import
    'default_columns': {
        'plan_code': 'Plan',
        'pack_id': 'Pack ID / Elevation(s) / Pack-Option Name',
        'elevation': 'Elevation Letter Combined',
        'vendor_sku': 'Sku',
        'description': 'Description',
        'quantity': 'QTY',
        'unit': 'Unit',
        'item_type': 'Type'
    }
}


# Custom mapping template
CUSTOM_MAPPING_TEMPLATE = {
    'system_name': 'Custom System Name',
    'code_format': 'Description of code format',
    
    'parse_rules': {
        # Define how to extract information from codes
    },
    
    'default_columns': {
        # Define expected column names
    }
}


def get_customer_mapping(customer_type: str) -> dict:
    """
    Get mapping configuration for customer type
    
    Args:
        customer_type: '1' = Richmond, '2' = Holt, '3' = Custom
    
    Returns:
        Mapping configuration dict
    """
    if customer_type == '1':
        return RICHMOND_MAPPING
    elif customer_type == '2':
        return HOLT_MAPPING
    else:
        return CUSTOM_MAPPING_TEMPLATE


def parse_holt_code(code: str, mapping: dict = HOLT_MAPPING) -> dict:
    """
    Parse Holt code using mapping configuration
    
    Args:
        code: Holt code like "167010100 - 4085"
        mapping: Mapping configuration
    
    Returns:
        dict with plan_code, phase_code, elevation_code, item_type_code
    """
    try:
        # Split on dash
        parts = code.strip().split('-')
        main_code = parts[0].strip()
        activity = parts[1].strip() if len(parts) > 1 else ""
        
        # Get parse rules
        rules = mapping['parse_rules']['option_phase_number']
        
        # Extract plan
        plan_start, plan_end = rules['plan_position']
        plan_base = main_code[plan_start:plan_end]
        
        # Extract elevation digit
        elev_start, elev_end = rules['elevation_position']
        elevation_digit = main_code[elev_start:elev_end]
        elevation_code = mapping['elevation_map'].get(elevation_digit, '**')
        
        # Extract phase
        phase_start, phase_end = rules['phase_position']
        phase_raw = main_code[phase_start:phase_end]
        
        # Extract sequence
        seq_start, seq_end = rules['sequence_position']
        sequence = main_code[seq_start:seq_end]
        
        # Build phase code
        phase_code = mapping['phase_map'].get(phase_raw, f"{phase_raw}.{sequence}0")
        
        # Get item type from activity
        item_type_code = mapping['activity_to_item_type'].get(
            activity, 
            mapping['activity_to_item_type']['default']
        )
        
        return {
            'plan_code': plan_base,
            'phase_code': phase_code,
            'elevation_code': elevation_code,
            'item_type_code': item_type_code,
            'activity': activity,
            'success': True
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


# ============================================================================
# PHASE 1: ITEM TYPE MAPPER
# ============================================================================

def map_item_type(customer_term: str, customer_type: str = 'holt') -> str:
    """
    Map customer terminology to unified item type codes.

    Handles various customer-specific terms and activity codes,
    maps them to standardized item type codes with fuzzy matching.

    Args:
        customer_term: Customer's term for item type
            - Holt: Activity codes like "4085", "4155"
            - Richmond: Terms like "Framing", "Siding", "Lumber"
            - Custom: Any text description
        customer_type: 'holt', 'richmond', or 'custom'

    Returns:
        Item type code (e.g., "1000", "2100", "9999" for unknown)

    Examples:
        >>> map_item_type("4085", "holt")
        '1000'
        >>> map_item_type("Framing", "richmond")
        '1000'
        >>> map_item_type("lumber", "custom")
        '1000'
        >>> map_item_type("siding", "custom")
        '2100'
    """
    if not customer_term:
        return "9999"  # Unknown

    # Convert to lowercase for matching
    term_lower = str(customer_term).lower().strip()

    # Holt activity code mapping
    if customer_type == 'holt':
        holt_activity_map = HOLT_MAPPING['activity_to_item_type']
        return holt_activity_map.get(customer_term, holt_activity_map['default'])

    # General taxonomy mapping (works for Richmond and Custom)
    taxonomy = {
        # Framing / Structural (1000 series)
        '1000': ['framing', 'lumber', 'wood', 'dimensional', 'stud', 'joist', 'beam', 'post'],
        '1100': ['engineered', 'tji', 'lvl', 'lsl', 'glulam', 'i-joist'],
        '1200': ['hardware', 'connector', 'hanger', 'fastener', 'nail', 'screw', 'bolt'],
        '1300': ['concrete', 'foundation', 'rebar', 'cement', 'form'],

        # Exterior Envelope (2000 series)
        '2000': ['sheathing', 'osb', 'plywood', 'housewrap', 'tyvek', 'wrap'],
        '2100': ['siding', 'cladding', 'lap', 'panel', 'shake', 'shingle exterior'],
        '2200': ['roofing', 'shingle', 'underlayment', 'flashing', 'ridge', 'starter'],
        '2300': ['window', 'door', 'entry', 'glass', 'patio door', 'sliding door'],
        '2400': ['trim exterior', 'fascia', 'soffit', 'frieze', 'corner'],

        # Rough Mechanicals (3000 series)
        '3000': ['plumbing', 'pipe', 'pex', 'copper', 'drain', 'vent'],
        '3100': ['electrical', 'wire', 'romex', 'box', 'outlet', 'switch'],
        '3200': ['hvac', 'duct', 'furnace', 'ac', 'air conditioning', 'vent'],

        # Interior Finish (4000 series)
        '4000': ['drywall', 'gypsum', 'sheetrock', 'mud', 'tape', 'compound'],
        '4100': ['trim interior', 'baseboard', 'casing', 'crown', 'molding', 'moulding'],
        '4200': ['flooring', 'carpet', 'tile', 'hardwood', 'laminate', 'vinyl'],
        '4300': ['cabinet', 'vanity', 'countertop', 'counter top'],

        # Final / Appliances (5000 series)
        '5000': ['fixture', 'light fixture', 'faucet', 'sink', 'toilet', 'shower'],
        '5100': ['appliance', 'refrigerator', 'stove', 'dishwasher', 'microwave'],
        '5200': ['hardware finish', 'doorknob', 'handle', 'hinge', 'lockset'],
    }

    # Search taxonomy for matches
    for item_code, keywords in taxonomy.items():
        for keyword in keywords:
            if keyword in term_lower:
                return item_code

    # No match found
    return "9999"


def test_map_item_type():
    """Unit tests for map_item_type function"""
    print("\n" + "="*80)
    print("Testing map_item_type()")
    print("="*80)

    tests = [
        # Holt codes
        ("4085", "holt", "1000"),
        ("4155", "holt", "2100"),
        ("4215", "holt", "2200"),

        # Richmond/Custom terms
        ("Framing", "richmond", "1000"),
        ("Lumber", "custom", "1000"),
        ("lumber", "custom", "1000"),
        ("Siding", "richmond", "2100"),
        ("siding", "custom", "2100"),
        ("Roofing", "custom", "2200"),
        ("Windows", "custom", "2300"),
        ("Drywall", "custom", "4000"),
        ("Cabinets", "custom", "4300"),
        ("Unknown Item", "custom", "9999"),
        ("", "custom", "9999"),
    ]

    passed = 0
    failed = 0

    for term, cust_type, expected in tests:
        result = map_item_type(term, cust_type)
        if result == expected:
            print(f"  ✓ map_item_type('{term}', '{cust_type}') = '{result}'")
            passed += 1
        else:
            print(f"  ✗ map_item_type('{term}', '{cust_type}') = '{result}' (expected '{expected}')")
            failed += 1

    print("-"*80)
    print(f"Tests passed: {passed}/{len(tests)}")
    if failed > 0:
        print(f"Tests FAILED: {failed}")
        return False
    else:
        print("✓ All item type mapper tests PASSED")
        return True


# Example usage and testing
if __name__ == "__main__":
    # Test Holt parsing
    test_codes = [
        "167010100 - 4085",  # Plan 1670, Elev 1 (A), Phase 010, Activity 4085
        "167020200 - 4155",  # Plan 1670, Elev 2 (B), Phase 020, Activity 4155
        "153010300 - 4085",  # Plan 1530, Elev 3 (C), Phase 010, Activity 4085
    ]
    
    print("Testing Holt Code Parser")
    print("=" * 80)
    
    for code in test_codes:
        result = parse_holt_code(code)
        if result['success']:
            unified = f"{result['plan_code']}-{result['phase_code']}-{result['elevation_code']}-{result['item_type_code']}"
            print(f"\nInput:  {code}")
            print(f"Output: {unified}")
            print(f"  Plan: {result['plan_code']}")
            print(f"  Phase: {result['phase_code']}")
            print(f"  Elevation: {result['elevation_code']}")
            print(f"  Item Type: {result['item_type_code']}")
            print(f"  Activity: {result['activity']}")
        else:
            print(f"\nInput:  {code}")
            print(f"Error:  {result['error']}")
