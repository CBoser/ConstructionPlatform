"""
Unified Code Parser Service

Handles parsing, building, and validating unified codes in the format:
PPPP-PPP.000-EE-IIII

Example: 1670-101.000-AB-4085
  - PPPP: Plan number (1670)
  - PPP: Phase/pack code (101 = Foundation)
  - 000: Padding (reserved)
  - EE: Elevation code (AB)
  - IIII: Item type (4085 = Fasteners)
"""

import re
from typing import Optional, Dict, Any
from dataclasses import dataclass
from decimal import Decimal


@dataclass
class UnifiedCode:
    """Represents a parsed unified code"""
    plan: str  # 4 digits: "1670"
    phase: str  # 3 digits: "101"
    padding: str  # 3 digits: "000" (always)
    elevation: str  # 2 chars: "AB", "00", etc.
    item_type: str  # 4 digits: "4085"
    full_code: str  # Complete: "1670-101.000-AB-4085"
    is_valid: bool  # Validation status

    def __str__(self) -> str:
        return self.full_code

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'plan': self.plan,
            'phase': self.phase,
            'padding': self.padding,
            'elevation': self.elevation,
            'item_type': self.item_type,
            'full_code': self.full_code,
            'is_valid': self.is_valid
        }


class UnifiedCodeParser:
    """
    Parse, build, and validate unified codes

    Examples:
        >>> parser = UnifiedCodeParser()

        # Parse a code
        >>> code = parser.parse("1670-101.000-AB-4085")
        >>> print(code.plan)
        '1670'

        # Build a code
        >>> new_code = parser.build(plan=1670, phase=101, elevation="AB", item_type=4085)
        >>> print(new_code)
        '1670-101.000-AB-4085'

        # Validate a code
        >>> is_valid = parser.validate("1670-101.000-AB-4085")
        >>> print(is_valid)
        True
    """

    # Standard format regex: PPPP-PPP.000-EE-IIII
    STANDARD_FORMAT = re.compile(r'^(\d{4})-(\d{3})\.(\d{3})-([A-Z0-9]{2})-(\d{4})$')

    # Phase/Pack names for reference
    PACK_CODES = {
        '05': 'UNDERFLOOR',
        '10': 'FOUNDATION',
        '20': 'MAIN WALLS',
        '30': 'ROOF FRAMING',
        '40': 'EXTERIOR TRIM',
        '50': 'INTERIOR TRIM',
        '60': 'STAIRS',
        '70': 'MISC',
        '80': 'GARAGE',
        '82': 'PORCH',
        '85': 'DECK',
        '90': 'HARDWARE',
        '101': 'FOUNDATION',
        '102': 'MAIN FLOOR SYSTEM',
        '200': 'MAIN WALLS',
        '201': 'PARTITION WALLS',
        '300': 'ROOF FRAMING',
        '400': 'EXTERIOR TRIM',
        '500': 'INTERIOR TRIM'
    }

    # Item type categories
    ITEM_TYPE_CATEGORIES = {
        '1': 'Lumber (structural)',
        '2': 'Lumber (framing)',
        '3': 'Lumber (trim)',
        '4': 'Hardware/fasteners',
        '5': 'Panels/sheathing',
        '6': 'Doors/windows',
        '7': 'Roofing',
        '8': 'Misc materials',
        '9': 'Unclassified'
    }

    def parse(self, code: str) -> UnifiedCode:
        """
        Parse a unified code (standard or raw format)

        Args:
            code: Code to parse
                Standard: "1670-101.000-AB-4085"
                Raw: "167010100-4085" or "167010100 - 4085"

        Returns:
            UnifiedCode object with parsed components

        Examples:
            >>> parser = UnifiedCodeParser()
            >>> code = parser.parse("1670-101.000-AB-4085")
            >>> print(code.plan, code.phase, code.elevation)
            '1670' '101' 'AB'

            >>> raw_code = parser.parse("167010100 - 4085")
            >>> print(raw_code.full_code)
            '1670-101.000-00-4085'
        """
        # Remove whitespace
        code = code.strip()

        # Try standard format first
        match = self.STANDARD_FORMAT.match(code)
        if match:
            plan, phase, padding, elevation, item_type = match.groups()
            is_valid = True
        else:
            # Try parsing raw format
            parsed = self._parse_raw_code(code)
            if parsed:
                plan = parsed['plan']
                phase = parsed['phase']
                padding = '000'
                elevation = parsed['elevation']
                item_type = parsed['item_type']
                is_valid = True
            else:
                # Invalid format - return placeholder
                return UnifiedCode(
                    plan='0000',
                    phase='000',
                    padding='000',
                    elevation='00',
                    item_type='9000',
                    full_code=code,
                    is_valid=False
                )

        # Build full code
        full_code = f"{plan}-{phase}.{padding}-{elevation}-{item_type}"

        return UnifiedCode(
            plan=plan,
            phase=phase,
            padding=padding,
            elevation=elevation,
            item_type=item_type,
            full_code=full_code,
            is_valid=is_valid
        )

    def _parse_raw_code(self, raw_code: str) -> Optional[Dict[str, str]]:
        """
        Parse raw Excel code format

        Formats supported:
        - "167010100 - 4085" → plan=1670, phase=101, elev=00, item=4085
        - "233620070" → plan=2336, phase=200, elev=70, item=9000
        - "38310105 - 4085 - 4085" → plan=0383, phase=101, elev=05, item=4085

        Args:
            raw_code: Raw code from Excel

        Returns:
            Dict with components or None if invalid
        """
        # Remove all spaces
        cleaned = raw_code.replace(' ', '')

        # Split on ' - ' or '-' to separate main code from item type
        if ' - ' in raw_code:
            parts = raw_code.split(' - ')
        else:
            parts = raw_code.split('-')

        # Get main part (before separator)
        main_part = parts[0].replace(' ', '')

        # Get item type (after separator, or default to 9000)
        if len(parts) >= 2:
            # Take last part (handles duplicate separators)
            item_type_str = parts[-1].strip()
            # Extract just the digits
            item_type_clean = ''.join(c for c in item_type_str if c.isdigit())
            if len(item_type_clean) >= 4:
                item_type_clean = item_type_clean[:4]
            elif len(item_type_clean) > 0:
                item_type_clean = item_type_clean.zfill(4)
            else:
                item_type_clean = "9000"
        else:
            item_type_clean = "9000"

        # Parse main part based on length
        if len(main_part) == 8:
            # 8-digit format: PPPPPPEE (need to pad plan to 4 digits)
            # Example: "38310105" → plan="0383", phase="101", elevation="05"
            plan = main_part[0:4].zfill(4)  # Pad to 4 digits
            phase = main_part[4:7]
            elevation = main_part[7:9] if len(main_part) >= 9 else main_part[6:8]
        elif len(main_part) == 9:
            # 9-digit format: PPPPPPPPE
            # Example: "167010100" → plan="1670", phase="101", elevation="00"
            plan = main_part[0:4]
            phase = main_part[4:7]
            elevation = main_part[7:9]
        elif len(main_part) == 10:
            # 10-digit format: PPPPPPPPEE
            # Example: "2336200070" → plan="2336", phase="200", elevation="70"
            plan = main_part[0:4]
            phase = main_part[4:7]
            elevation = main_part[8:10] if len(main_part) >= 10 else "00"
        else:
            # Unknown format
            return None

        # Validate extracted components
        if not (plan.isdigit() and phase.isdigit() and item_type_clean.isdigit()):
            return None

        # Build unified code: PPPP-PPP.000-EE-IIII
        return {
            'plan': plan,
            'phase': phase,
            'elevation': elevation,
            'item_type': item_type_clean
        }

    def build(
        self,
        plan: int | str,
        phase: int | str,
        elevation: str = "00",
        item_type: int | str = 9000,
        padding: str = "000"
    ) -> str:
        """
        Build a unified code from components

        Args:
            plan: Plan number (will be padded to 4 digits)
            phase: Phase code (will be padded to 3 digits)
            elevation: Elevation code (2 characters)
            item_type: Item type code (will be padded to 4 digits)
            padding: Padding (default "000")

        Returns:
            Formatted unified code

        Examples:
            >>> parser = UnifiedCodeParser()
            >>> code = parser.build(1670, 101, "AB", 4085)
            >>> print(code)
            '1670-101.000-AB-4085'

            >>> code = parser.build(383, 101, "CD", 4085)
            >>> print(code)
            '0383-101.000-CD-4085'
        """
        # Convert to strings and pad
        plan_str = str(plan).zfill(4)
        phase_str = str(phase).zfill(3)
        item_type_str = str(item_type).zfill(4)

        # Ensure elevation is 2 characters
        elevation_str = str(elevation).ljust(2)[:2]

        # Build code
        return f"{plan_str}-{phase_str}.{padding}-{elevation_str}-{item_type_str}"

    def validate(self, code: str) -> bool:
        """
        Validate unified code format

        Args:
            code: Code to validate

        Returns:
            True if valid, False otherwise

        Examples:
            >>> parser = UnifiedCodeParser()
            >>> parser.validate("1670-101.000-AB-4085")
            True
            >>> parser.validate("invalid-code")
            False
        """
        return bool(self.STANDARD_FORMAT.match(code))

    def get_pack_name(self, phase_code: str) -> Optional[str]:
        """
        Get pack name from phase code

        Args:
            phase_code: Phase code (e.g., "101")

        Returns:
            Pack name or None if unknown

        Examples:
            >>> parser = UnifiedCodeParser()
            >>> parser.get_pack_name("101")
            'FOUNDATION'
            >>> parser.get_pack_name("200")
            'MAIN WALLS'
        """
        return self.PACK_CODES.get(phase_code.lstrip('0') if phase_code else None)

    def get_item_category(self, item_type: str) -> str:
        """
        Get item category from item type code

        Args:
            item_type: Item type code (e.g., "4085")

        Returns:
            Category name

        Examples:
            >>> parser = UnifiedCodeParser()
            >>> parser.get_item_category("4085")
            'Hardware/fasteners'
            >>> parser.get_item_category("2085")
            'Lumber (framing)'
        """
        if not item_type or len(item_type) < 1:
            return 'Unknown'

        first_digit = item_type[0]
        return self.ITEM_TYPE_CATEGORIES.get(first_digit, 'Unknown')

    def format_code_info(self, code: str) -> str:
        """
        Format code information for display

        Args:
            code: Unified code to format

        Returns:
            Formatted string with code breakdown

        Examples:
            >>> parser = UnifiedCodeParser()
            >>> info = parser.format_code_info("1670-101.000-AB-4085")
            >>> print(info)
            Unified Code: 1670-101.000-AB-4085
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            Plan:      1670
            Phase:     101 (FOUNDATION)
            Elevation: AB
            Item Type: 4085 (Hardware/fasteners)
            Valid:     ✅ Yes
        """
        parsed = self.parse(code)

        pack_name = self.get_pack_name(parsed.phase)
        pack_info = f"{parsed.phase} ({pack_name})" if pack_name else parsed.phase

        item_category = self.get_item_category(parsed.item_type)
        item_info = f"{parsed.item_type} ({item_category})"

        valid_icon = "✅ Yes" if parsed.is_valid else "❌ No"

        return f"""Unified Code: {parsed.full_code}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Plan:      {parsed.plan}
Phase:     {pack_info}
Elevation: {parsed.elevation}
Item Type: {item_info}
Valid:     {valid_icon}"""

    def extract_plan_number(self, code: str) -> Optional[str]:
        """Extract just the plan number from a code"""
        parsed = self.parse(code)
        return parsed.plan if parsed.is_valid else None

    def extract_phase_code(self, code: str) -> Optional[str]:
        """Extract just the phase code from a code"""
        parsed = self.parse(code)
        return parsed.phase if parsed.is_valid else None

    def extract_elevation(self, code: str) -> Optional[str]:
        """Extract just the elevation from a code"""
        parsed = self.parse(code)
        return parsed.elevation if parsed.is_valid else None

    def extract_item_type(self, code: str) -> Optional[str]:
        """Extract just the item type from a code"""
        parsed = self.parse(code)
        return parsed.item_type if parsed.is_valid else None


# Convenience functions for quick usage

def parse_code(code: str) -> UnifiedCode:
    """Quick parse function"""
    parser = UnifiedCodeParser()
    return parser.parse(code)


def build_code(plan: int | str, phase: int | str, elevation: str = "00", item_type: int | str = 9000) -> str:
    """Quick build function"""
    parser = UnifiedCodeParser()
    return parser.build(plan, phase, elevation, item_type)


def validate_code(code: str) -> bool:
    """Quick validate function"""
    parser = UnifiedCodeParser()
    return parser.validate(code)


# Example usage and testing
if __name__ == "__main__":
    parser = UnifiedCodeParser()

    print("=" * 70)
    print("UNIFIED CODE PARSER - Examples")
    print("=" * 70)

    # Example 1: Parse standard format
    print("\n1. Parse standard format:")
    code1 = parser.parse("1670-101.000-AB-4085")
    print(f"   Input: 1670-101.000-AB-4085")
    print(f"   Plan: {code1.plan}")
    print(f"   Phase: {code1.phase}")
    print(f"   Elevation: {code1.elevation}")
    print(f"   Item Type: {code1.item_type}")
    print(f"   Valid: {code1.is_valid}")

    # Example 2: Parse raw format
    print("\n2. Parse raw format:")
    code2 = parser.parse("167010100 - 4085")
    print(f"   Input: 167010100 - 4085")
    print(f"   Parsed: {code2.full_code}")

    # Example 3: Build a code
    print("\n3. Build a code:")
    built_code = parser.build(plan=1670, phase=101, elevation="AB", item_type=4085)
    print(f"   Components: plan=1670, phase=101, elevation=AB, item=4085")
    print(f"   Built: {built_code}")

    # Example 4: Validate codes
    print("\n4. Validate codes:")
    print(f"   '1670-101.000-AB-4085' → {parser.validate('1670-101.000-AB-4085')}")
    print(f"   'invalid-code' → {parser.validate('invalid-code')}")

    # Example 5: Format info
    print("\n5. Format code information:")
    print(parser.format_code_info("1670-101.000-AB-4085"))

    # Example 6: Parse problematic codes
    print("\n6. Parse problematic codes:")
    test_codes = [
        "167010100 - 4085",
        "233620070",
        "38310105 - 4085 - 4085",
        "1670-101.000-AB-4085"
    ]

    for test_code in test_codes:
        parsed = parser.parse(test_code)
        print(f"   {test_code:30} → {parsed.full_code}")

    print("\n" + "=" * 70)
