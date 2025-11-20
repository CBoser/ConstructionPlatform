#!/usr/bin/env python3
"""
ReadyFrame Material Calculator

Calculates precise material quantities for ReadyFrame panelized wall framing systems.

Usage:
    # Basic wall (no openings)
    python calculate_materials.py --wall-length 84.5 --wall-height 104.625 \\
        --stud-size 2x6 --spacing 16

    # Wall with openings
    python calculate_materials.py --wall-length 84.5 --wall-height 104.625 \\
        --stud-size 2x6 --spacing 16 \\
        --openings '{"type": "window", "width": 36, "height": 48, "count": 2}'

    # JSON input file
    python calculate_materials.py --input wall_data.json

    # Output formats
    python calculate_materials.py --input wall_data.json --output json
    python calculate_materials.py --input wall_data.json --output summary
"""

import argparse
import json
import math
import sys
from typing import Dict, List, Optional, Tuple


class ReadyFrameCalculator:
    """Calculate ReadyFrame materials following system specifications."""
    
    # Standard stud heights by floor
    STUD_HEIGHTS = {
        'main': 104.625,  # 104-5/8"
        'upper': 92.625,   # 92-5/8"
    }
    
    # Board feet per linear foot by size
    BF_PER_LF = {
        '2x4': 0.667,
        '2x6': 1.000,
        '2x8': 1.333,
        '2x10': 1.667,
        '2x12': 2.000,
    }
    
    # Weight per board foot (Douglas Fir, KD)
    WEIGHT_PER_BF = 2.67  # lbs
    
    def __init__(self, wall_length: float, wall_height: float, 
                 stud_size: str = '2x6', stud_spacing: int = 16,
                 floor: str = 'main'):
        """
        Initialize calculator with wall specifications.
        
        Args:
            wall_length: Wall length in feet
            wall_height: Wall height in inches
            stud_size: Lumber size (2x4, 2x6, 2x8)
            stud_spacing: Stud spacing in inches (16 or 24)
            floor: Floor level ('main' or 'upper')
        """
        self.wall_length = wall_length
        self.wall_height = wall_height
        self.stud_size = stud_size
        self.stud_spacing = stud_spacing
        self.floor = floor
        self.openings = []
        
    def add_opening(self, type: str = None, opening_type: str = None, 
                   width: float = 0, height: float = 0,
                   count: int = 1, sill_height: float = 36.0):
        """
        Add an opening to the wall.
        
        Args:
            type: Type of opening (alias for opening_type, for JSON compatibility)
            opening_type: Type of opening (window, door, mulled, bay, etc.)
            width: Opening width in inches
            height: Opening height in inches
            count: Number of this opening type
            sill_height: Height from floor to sill (for windows)
        """
        # Handle both 'type' and 'opening_type' for flexibility
        final_type = opening_type if opening_type else type
        if not final_type:
            raise ValueError("Must specify either 'type' or 'opening_type'")
            
        self.openings.append({
            'type': final_type,
            'width': width,
            'height': height,
            'count': count,
            'sill_height': sill_height
        })
    
    def calculate_plates(self) -> Dict[str, float]:
        """
        Calculate plate quantities using 2/3 rule.
        
        Returns:
            Dictionary with ReadyFrame and Loose plate quantities
        """
        # ReadyFrame: Bottom + First Top = 2 × Wall LF
        rf_plates_lf = 2 * self.wall_length
        
        # Loose: Third Top = 1 × Wall LF
        loose_plate_lf = 1 * self.wall_length
        
        # Convert Loose to 16' stick count
        loose_plate_sticks = math.ceil(loose_plate_lf / 16)
        
        return {
            'readyframe_plates_lf': rf_plates_lf,
            'loose_plate_lf': loose_plate_lf,
            'loose_plate_sticks': loose_plate_sticks,
            'total_plates_lf': rf_plates_lf + loose_plate_lf
        }
    
    def calculate_studs(self) -> Dict[str, int]:
        """
        Calculate stud quantities.
        
        Returns:
            Dictionary with stud counts by type
        """
        # Base stud count (0.75 per LF for 16" O.C.)
        spacing_factor = 0.75 if self.stud_spacing == 16 else 0.5
        base_stud_count = math.ceil(spacing_factor * self.wall_length)
        
        # Adjust for openings
        opening_reduction = 0
        king_stud_count = 0
        
        for opening in self.openings:
            opening_width_ft = opening['width'] / 12
            count = opening['count']
            
            # Reduction: ~1 stud per 4' of opening
            reduction_per_opening = math.floor(opening_width_ft / 4)
            opening_reduction += reduction_per_opening * count
            
            # Kings: 2 per opening
            king_stud_count += 2 * count
        
        # Net stud count
        common_stud_count = base_stud_count - opening_reduction
        total_studs = common_stud_count + king_stud_count
        
        return {
            'base_count': base_stud_count,
            'common_studs': common_stud_count,
            'king_studs': king_stud_count,
            'total_studs': total_studs,
            'stud_height': self.STUD_HEIGHTS[self.floor]
        }
    
    def calculate_trimmers(self, opening: Dict) -> int:
        """
        Calculate trimmer count for an opening.
        
        Args:
            opening: Opening specification dictionary
            
        Returns:
            Number of trimmers required
        """
        width_ft = opening['width'] / 12
        opening_type = opening['type']
        
        if opening_type == 'standard_window' or opening_type == 'window':
            if width_ft <= 5:
                return 2
            else:
                # Wide window formula
                return 2 + 2 * math.floor((width_ft - 5) / 5)
        
        elif opening_type == 'mulled':
            # Mulled formula: units + 1
            unit_count = opening.get('unit_count', 2)
            return unit_count + 1
        
        elif opening_type == 'bay':
            # Bay formula: 2 + 2 × (sections - 1)
            sections = opening.get('sections', 3)
            return 2 + 2 * (sections - 1)
        
        elif opening_type == 'door':
            if width_ft > 6:
                return 4  # Wide door, doubled
            else:
                return 2  # Standard door
        
        else:
            # Default: 2 trimmers
            return 2
    
    def calculate_opening_components(self) -> Dict:
        """
        Calculate all opening components.
        
        Returns:
            Dictionary with opening component quantities
        """
        if not self.openings:
            return {
                'trimmers': 0,
                'headers': 0,
                'sills': 0,
                'sill_cripples': 0,
                'header_cripples': 0
            }
        
        total_trimmers = 0
        total_headers = 0
        total_sills = 0
        total_sill_cripples = 0
        total_header_cripples = 0
        
        for opening in self.openings:
            count = opening['count']
            opening_type = opening['type']
            width_inches = opening['width']
            
            # Trimmers
            trimmers_per_opening = self.calculate_trimmers(opening)
            total_trimmers += trimmers_per_opening * count
            
            # Headers (1 per opening)
            total_headers += 1 * count
            
            # Sills (if window)
            if 'window' in opening_type or 'bay' in opening_type:
                total_sills += 1 * count
                
                # Cripples based on opening width and stud spacing
                cripples_per_opening = math.floor(width_inches / self.stud_spacing) + 1
                total_sill_cripples += cripples_per_opening * count
                total_header_cripples += cripples_per_opening * count
        
        return {
            'trimmers': total_trimmers,
            'headers': total_headers,
            'sills': total_sills,
            'sill_cripples': total_sill_cripples,
            'header_cripples': total_header_cripples
        }
    
    def calculate_board_feet(self, components: Dict) -> float:
        """
        Calculate total board feet for all components.
        
        Args:
            components: Dictionary of all calculated components
            
        Returns:
            Total board feet
        """
        bf_per_lf = self.BF_PER_LF[self.stud_size]
        
        # Plates
        total_plates_lf = components['plates']['total_plates_lf']
        plate_bf = total_plates_lf * bf_per_lf
        
        # Studs
        stud_height_ft = components['studs']['stud_height'] / 12
        stud_count = components['studs']['total_studs']
        stud_bf = stud_count * stud_height_ft * bf_per_lf
        
        # Opening components (approximate)
        trimmer_height_ft = 5  # Average trimmer height
        trimmer_bf = components['openings']['trimmers'] * trimmer_height_ft * bf_per_lf
        
        header_width_ft = 4  # Average header width
        header_bf = components['openings']['headers'] * header_width_ft * bf_per_lf * 2  # 2-ply
        
        cripple_height_ft = 2  # Average cripple height
        total_cripples = (components['openings']['sill_cripples'] + 
                         components['openings']['header_cripples'])
        cripple_bf = total_cripples * cripple_height_ft * bf_per_lf
        
        total_bf = plate_bf + stud_bf + trimmer_bf + header_bf + cripple_bf
        
        return round(total_bf, 2)
    
    def calculate_weight(self, board_feet: float) -> float:
        """
        Estimate total weight based on board feet.
        
        Args:
            board_feet: Total board feet
            
        Returns:
            Estimated weight in pounds
        """
        return round(board_feet * self.WEIGHT_PER_BF, 2)
    
    def validate_results(self, components: Dict) -> Tuple[bool, List[str]]:
        """
        Validate calculated results against ReadyFrame rules.
        
        Args:
            components: Dictionary of calculated components
            
        Returns:
            Tuple of (is_valid, list of warnings)
        """
        warnings = []
        
        # Check plate ratio (should be ~2:1)
        rf_plates = components['plates']['readyframe_plates_lf']
        loose_plates = components['plates']['loose_plate_lf']
        
        if loose_plates > 0:
            plate_ratio = rf_plates / loose_plates
            if not (1.8 <= plate_ratio <= 2.2):
                warnings.append(
                    f"Plate ratio {plate_ratio:.2f} outside expected range 1.8-2.2"
                )
        
        # Check stud density (should be ~0.75 per LF for 16" O.C.)
        stud_count = components['studs']['total_studs']
        stud_density = stud_count / self.wall_length
        expected_density = 0.75 if self.stud_spacing == 16 else 0.5
        
        if not (expected_density - 0.1 <= stud_density <= expected_density + 0.1):
            warnings.append(
                f"Stud density {stud_density:.2f}/LF outside expected range "
                f"{expected_density - 0.1:.2f}-{expected_density + 0.1:.2f}"
            )
        
        # Check for openings without components
        if self.openings and components['openings']['trimmers'] == 0:
            warnings.append("Openings specified but no trimmers calculated")
        
        is_valid = len(warnings) == 0
        return is_valid, warnings
    
    def calculate_all(self) -> Dict:
        """
        Calculate all materials and return comprehensive results.
        
        Returns:
            Dictionary containing all calculated materials
        """
        # Calculate each component type
        plates = self.calculate_plates()
        studs = self.calculate_studs()
        openings = self.calculate_opening_components()
        
        # Package results
        components = {
            'plates': plates,
            'studs': studs,
            'openings': openings
        }
        
        # Calculate totals
        board_feet = self.calculate_board_feet(components)
        weight = self.calculate_weight(board_feet)
        
        # Validate
        is_valid, warnings = self.validate_results(components)
        
        # Return complete results
        return {
            'specifications': {
                'wall_length': self.wall_length,
                'wall_height': self.wall_height,
                'stud_size': self.stud_size,
                'stud_spacing': self.stud_spacing,
                'floor': self.floor
            },
            'materials': {
                'readyframe': {
                    'plates_lf': plates['readyframe_plates_lf'],
                    'trimmers': openings['trimmers'],
                    'headers': openings['headers'],
                    'sills': openings['sills'],
                    'sill_cripples': openings['sill_cripples'],
                    'header_cripples': openings['header_cripples']
                },
                'loose': {
                    'top_plate_lf': plates['loose_plate_lf'],
                    'top_plate_sticks': plates['loose_plate_sticks'],
                    'common_studs': studs['common_studs'],
                    'king_studs': studs['king_studs'],
                    'total_studs': studs['total_studs'],
                    'stud_height': studs['stud_height']
                }
            },
            'totals': {
                'board_feet': board_feet,
                'weight_lbs': weight
            },
            'validation': {
                'is_valid': is_valid,
                'warnings': warnings
            }
        }


def format_output(results: Dict, format_type: str = 'summary') -> str:
    """Format calculation results for display."""
    
    if format_type == 'json':
        return json.dumps(results, indent=2)
    
    elif format_type == 'summary':
        specs = results['specifications']
        rf = results['materials']['readyframe']
        loose = results['materials']['loose']
        totals = results['totals']
        validation = results['validation']
        
        output = []
        output.append("=" * 60)
        output.append("READYFRAME MATERIAL CALCULATOR - RESULTS")
        output.append("=" * 60)
        output.append("")
        
        # Specifications
        output.append("WALL SPECIFICATIONS:")
        output.append(f"  Length: {specs['wall_length']:.2f} LF")
        output.append(f"  Height: {specs['wall_height']:.3f}\" ({specs['floor']} floor)")
        output.append(f"  Stud Size: {specs['stud_size']}")
        output.append(f"  Spacing: {specs['stud_spacing']}\" O.C.")
        output.append("")
        
        # ReadyFrame Materials
        output.append("READYFRAME MATERIALS (Precut - No.2 Grade):")
        output.append(f"  Plates: {rf['plates_lf']:.2f} LF")
        output.append(f"  Trimmers: {rf['trimmers']} EA")
        output.append(f"  Headers: {rf['headers']} EA")
        output.append(f"  Sills: {rf['sills']} EA")
        output.append(f"  Sill Cripples: {rf['sill_cripples']} EA")
        output.append(f"  Header Cripples: {rf['header_cripples']} EA")
        output.append("")
        
        # Loose Materials
        output.append("LOOSE MATERIALS (Field Cut - DF Stud Grade):")
        output.append(f"  Top Plate: {loose['top_plate_lf']:.2f} LF " +
                     f"({loose['top_plate_sticks']} sticks @ 16')")
        output.append(f"  Common Studs: {loose['common_studs']} EA @ " +
                     f"{loose['stud_height']:.3f}\"")
        output.append(f"  King Studs: {loose['king_studs']} EA @ " +
                     f"{loose['stud_height']:.3f}\"")
        output.append(f"  TOTAL STUDS: {loose['total_studs']} EA")
        output.append("")
        
        # Totals
        output.append("TOTALS:")
        output.append(f"  Board Feet: {totals['board_feet']:.2f} BF")
        output.append(f"  Estimated Weight: {totals['weight_lbs']:.2f} lbs")
        output.append("")
        
        # Validation
        output.append("VALIDATION:")
        if validation['is_valid']:
            output.append("  ✓ All checks passed")
        else:
            output.append("  ⚠ Warnings detected:")
            for warning in validation['warnings']:
                output.append(f"    - {warning}")
        
        output.append("=" * 60)
        
        return "\n".join(output)
    
    else:
        return "Invalid format type"


def main():
    parser = argparse.ArgumentParser(
        description='Calculate ReadyFrame material quantities'
    )
    
    # Input methods
    parser.add_argument('--input', help='JSON input file')
    parser.add_argument('--wall-length', type=float, help='Wall length (feet)')
    parser.add_argument('--wall-height', type=float, help='Wall height (inches)')
    parser.add_argument('--stud-size', default='2x6', help='Stud size (2x4, 2x6, 2x8)')
    parser.add_argument('--spacing', type=int, default=16, help='Stud spacing (16 or 24)')
    parser.add_argument('--floor', default='main', help='Floor level (main or upper)')
    parser.add_argument('--openings', help='Openings JSON string')
    
    # Output format
    parser.add_argument('--output', default='summary', 
                       choices=['summary', 'json'],
                       help='Output format')
    
    args = parser.parse_args()
    
    # Load data from input file or arguments
    if args.input:
        with open(args.input, 'r') as f:
            data = json.load(f)
        calc = ReadyFrameCalculator(
            data['wall_length'],
            data['wall_height'],
            data.get('stud_size', '2x6'),
            data.get('spacing', 16),
            data.get('floor', 'main')
        )
        for opening in data.get('openings', []):
            calc.add_opening(**opening)
    else:
        if not args.wall_length or not args.wall_height:
            parser.error('--wall-length and --wall-height required if not using --input')
        
        calc = ReadyFrameCalculator(
            args.wall_length,
            args.wall_height,
            args.stud_size,
            args.spacing,
            args.floor
        )
        
        if args.openings:
            opening_data = json.loads(args.openings)
            calc.add_opening(**opening_data)
    
    # Calculate and display results
    results = calc.calculate_all()
    print(format_output(results, args.output))
    
    # Exit with appropriate code
    sys.exit(0 if results['validation']['is_valid'] else 1)


if __name__ == "__main__":
    main()

