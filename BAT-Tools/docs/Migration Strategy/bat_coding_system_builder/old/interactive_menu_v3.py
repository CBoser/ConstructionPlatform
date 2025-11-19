#!/usr/bin/env python3
"""
BAT Coding System - Interactive Menu
Interactive interface for reviewing and revising the unified material database

Features:
- View and search materials
- Edit material details
- Add new materials
- Delete materials
- Validate database
- Generate reports
- Manage phases and item types
"""

import sqlite3
import pandas as pd
from pathlib import Path
from datetime import datetime
from bat_coding_system_builder import BATCodingSystemBuilder
import os
import sys


class InteractiveMenu:
    """Interactive menu system for database management"""
    
    def __init__(self, builder: BATCodingSystemBuilder):
        """
        Initialize interactive menu
        
        Args:
            builder: BATCodingSystemBuilder instance
        """
        self.builder = builder
        self.running = True
        
    def clear_screen(self):
        """Clear the terminal screen"""
        os.system('clear' if os.name == 'posix' else 'cls')
    
    def pause(self):
        """Pause for user to read output"""
        input("\nPress Enter to continue...")
    
    def print_header(self, title: str):
        """Print section header"""
        self.clear_screen()
        print("=" * 80)
        print(f"  {title}")
        print("=" * 80)
        print()
    
    def display_main_menu(self):
        """Display main menu and get user choice"""
        self.print_header("BAT UNIFIED CODING SYSTEM - MAIN MENU")
        
        print("1.  View Materials")
        print("2.  Search Materials")
        print("3.  Add New Material")
        print("4.  Edit Material")
        print("5.  Delete Material")
        print()
        print("6.  View Product Phases")
        print("7.  Add/Edit Phase")
        print("8.  View Item Types")
        print("9.  Add/Edit Item Type")
        print()
        print("10. View Plans")
        print("11. Add/Edit Plan")
        print()
        print("12. Translate Customer Code")
        print("13. Import Customer Database (with review)")
        print()
        print("14. Database Statistics")
        print("15. Validate Database")
        print("16. Export Reports")
        print()
        print("17. Backup Database")
        print("18. View Audit Trail")
        print()
        print("0.  Exit")
        print()
        
        choice = input("Enter your choice: ").strip()
        return choice
    
    def view_materials_menu(self):
        """Submenu for viewing materials"""
        while True:
            self.print_header("VIEW MATERIALS")
            
            print("1. View all materials (paginated)")
            print("2. View materials by plan")
            print("3. View materials by phase")
            print("4. View materials by elevation")
            print("5. View materials by item type")
            print("6. View recent materials (last 20)")
            print()
            print("0. Back to main menu")
            print()
            
            choice = input("Enter your choice: ").strip()
            
            if choice == '0':
                break
            elif choice == '1':
                self.view_all_materials()
            elif choice == '2':
                self.view_materials_by_plan()
            elif choice == '3':
                self.view_materials_by_phase()
            elif choice == '4':
                self.view_materials_by_elevation()
            elif choice == '5':
                self.view_materials_by_item_type()
            elif choice == '6':
                self.view_recent_materials()
    
    def view_all_materials(self):
        """View all materials with pagination"""
        self.print_header("ALL MATERIALS")
        
        page_size = 20
        offset = 0
        
        cursor = self.builder.conn.cursor()
        total_count = cursor.execute("SELECT COUNT(*) FROM materials").fetchone()[0]
        
        if total_count == 0:
            print("No materials in database.")
            self.pause()
            return
        
        print(f"Total materials: {total_count:,d}")
        print()
        
        while True:
            query = """
                SELECT 
                    material_id,
                    full_code,
                    vendor_sku,
                    description,
                    quantity,
                    unit
                FROM materials
                ORDER BY material_id
                LIMIT ? OFFSET ?
            """
            
            results = cursor.execute(query, (page_size, offset)).fetchall()
            
            if not results:
                print("\nNo more materials to display.")
                break
            
            # Display results
            print(f"\nShowing {offset + 1}-{offset + len(results)} of {total_count}")
            print("-" * 80)
            print(f"{'ID':<6} {'Full Code':<25} {'SKU':<15} {'Qty':<8} {'Description'}")
            print("-" * 80)
            
            for row in results:
                mat_id, full_code, sku, desc, qty, unit = row
                desc_short = (desc[:35] + '...') if desc and len(desc) > 35 else desc
                print(f"{mat_id:<6} {full_code:<25} {sku:<15} {qty:>6.1f} {unit:<2} {desc_short}")
            
            print()
            print("Commands: [N]ext page, [P]revious page, [V]iew detail, [Q]uit")
            cmd = input("Enter command: ").strip().upper()
            
            if cmd == 'N' and offset + page_size < total_count:
                offset += page_size
            elif cmd == 'P' and offset > 0:
                offset -= page_size
            elif cmd == 'V':
                mat_id = input("Enter material ID to view: ").strip()
                self.view_material_detail(mat_id)
            elif cmd == 'Q':
                break
    
    def view_materials_by_plan(self):
        """View materials filtered by plan"""
        self.print_header("MATERIALS BY PLAN")
        
        # Show available plans
        cursor = self.builder.conn.cursor()
        plans = cursor.execute("""
            SELECT plan_code, COUNT(*) as material_count
            FROM materials
            GROUP BY plan_code
            ORDER BY plan_code
        """).fetchall()
        
        if not plans:
            print("No materials in database.")
            self.pause()
            return
        
        print("Available plans:")
        for plan_code, count in plans:
            print(f"  {plan_code}: {count:,d} materials")
        
        print()
        plan_code = input("Enter plan code (or 'q' to quit): ").strip()
        
        if plan_code.lower() == 'q':
            return
        
        materials = self.builder.get_materials_by_plan(plan_code)
        
        if len(materials) == 0:
            print(f"\nNo materials found for plan {plan_code}")
            self.pause()
            return
        
        print(f"\n{len(materials):,d} materials for plan {plan_code}:")
        print("-" * 80)
        print(materials.to_string(index=False))
        
        self.pause()
    
    def view_materials_by_phase(self):
        """View materials filtered by phase"""
        self.print_header("MATERIALS BY PHASE")
        
        # Show available phases
        cursor = self.builder.conn.cursor()
        phases = cursor.execute("""
            SELECT 
                m.phase_code,
                p.phase_name,
                COUNT(*) as material_count
            FROM materials m
            LEFT JOIN product_phases p ON m.phase_code = p.phase_code
            GROUP BY m.phase_code, p.phase_name
            ORDER BY m.phase_code
            LIMIT 20
        """).fetchall()
        
        print("Top 20 phases (by material count):")
        for phase_code, phase_name, count in phases:
            phase_name_display = phase_name[:40] if phase_name else "Unknown"
            print(f"  {phase_code:<12} {phase_name_display:<40} {count:>6,d} materials")
        
        print()
        phase_code = input("Enter phase code (or 'q' to quit): ").strip()
        
        if phase_code.lower() == 'q':
            return
        
        materials = self.builder.get_materials_by_phase(phase_code)
        
        if len(materials) == 0:
            print(f"\nNo materials found for phase {phase_code}")
            self.pause()
            return
        
        print(f"\n{len(materials):,d} materials for phase {phase_code}:")
        print("-" * 80)
        print(materials.to_string(index=False))
        
        self.pause()
    
    def view_materials_by_elevation(self):
        """View materials filtered by elevation"""
        self.print_header("MATERIALS BY ELEVATION")
        
        print("Common elevation codes: A, B, C, D, AB, ABC, BCD, ABCD, **, etc.")
        print()
        
        plan_code = input("Enter plan code: ").strip()
        elevation = input("Enter elevation letter (e.g., B): ").strip().upper()
        
        if not plan_code or not elevation:
            return
        
        materials = self.builder.get_materials_by_elevation(plan_code, elevation)
        
        if len(materials) == 0:
            print(f"\nNo materials found for plan {plan_code}, elevation {elevation}")
            self.pause()
            return
        
        print(f"\n{len(materials):,d} materials for plan {plan_code}, elevation {elevation}:")
        print("-" * 80)
        print(materials.to_string(index=False))
        
        self.pause()
    
    def view_materials_by_item_type(self):
        """View materials filtered by item type"""
        self.print_header("MATERIALS BY ITEM TYPE")
        
        # Show available item types
        cursor = self.builder.conn.cursor()
        item_types = cursor.execute("""
            SELECT 
                i.type_code,
                i.type_name,
                COUNT(*) as material_count
            FROM materials m
            LEFT JOIN item_types i ON m.item_type_code = i.type_code
            GROUP BY i.type_code, i.type_name
            ORDER BY material_count DESC
        """).fetchall()
        
        print("Available item types:")
        for type_code, type_name, count in item_types:
            type_name_display = type_name if type_name else "Unknown"
            print(f"  {type_code:<10} {type_name_display:<30} {count:>6,d} materials")
        
        print()
        type_code = input("Enter item type code (or 'q' to quit): ").strip()
        
        if type_code.lower() == 'q':
            return
        
        cursor = self.builder.conn.cursor()
        results = cursor.execute("""
            SELECT 
                material_id,
                full_code,
                plan_code,
                vendor_sku,
                description,
                quantity,
                unit
            FROM materials
            WHERE item_type_code = ?
            ORDER BY plan_code, full_code
        """, (type_code,)).fetchall()
        
        if not results:
            print(f"\nNo materials found for item type {type_code}")
            self.pause()
            return
        
        print(f"\n{len(results):,d} materials for item type {type_code}:")
        print("-" * 80)
        print(f"{'ID':<6} {'Full Code':<25} {'Plan':<8} {'SKU':<15} {'Qty':<8} {'Description'}")
        print("-" * 80)
        
        for row in results[:50]:  # Limit to first 50
            mat_id, full_code, plan, sku, desc, qty, unit = row
            desc_short = (desc[:30] + '...') if desc and len(desc) > 30 else desc
            print(f"{mat_id:<6} {full_code:<25} {plan:<8} {sku:<15} {qty:>6.1f} {unit:<2} {desc_short}")
        
        if len(results) > 50:
            print(f"\n... and {len(results) - 50:,d} more")
        
        self.pause()
    
    def view_recent_materials(self):
        """View most recently added materials"""
        self.print_header("RECENT MATERIALS (Last 20)")
        
        cursor = self.builder.conn.cursor()
        results = cursor.execute("""
            SELECT 
                material_id,
                full_code,
                vendor_sku,
                description,
                quantity,
                unit,
                created_date
            FROM materials
            ORDER BY material_id DESC
            LIMIT 20
        """).fetchall()
        
        if not results:
            print("No materials in database.")
            self.pause()
            return
        
        print(f"{'ID':<6} {'Full Code':<25} {'SKU':<15} {'Qty':<8} {'Date':<12} {'Description'}")
        print("-" * 80)
        
        for row in results:
            mat_id, full_code, sku, desc, qty, unit, date = row
            desc_short = (desc[:25] + '...') if desc and len(desc) > 25 else desc
            print(f"{mat_id:<6} {full_code:<25} {sku:<15} {qty:>6.1f} {unit:<2} {date:<12} {desc_short}")
        
        self.pause()
    
    def view_material_detail(self, material_id: str):
        """View detailed information for a specific material"""
        self.print_header(f"MATERIAL DETAIL - ID {material_id}")
        
        cursor = self.builder.conn.cursor()
        result = cursor.execute("""
            SELECT 
                m.*,
                p.phase_name,
                i.type_name
            FROM materials m
            LEFT JOIN product_phases p ON m.phase_code = p.phase_code
            LEFT JOIN item_types i ON m.item_type_code = i.type_code
            WHERE m.material_id = ?
        """, (material_id,)).fetchone()
        
        if not result:
            print(f"Material ID {material_id} not found.")
            self.pause()
            return
        
        # Display all fields
        columns = [desc[0] for desc in cursor.description]
        
        print("Material Details:")
        print("-" * 80)
        for i, col in enumerate(columns):
            value = result[i] if result[i] is not None else "(null)"
            print(f"{col:25s}: {value}")
        
        print()
        print("Commands: [E]dit, [D]elete, [B]ack")
        cmd = input("Enter command: ").strip().upper()
        
        if cmd == 'E':
            self.edit_material(material_id)
        elif cmd == 'D':
            self.delete_material(material_id)
    
    def search_materials(self):
        """Search materials by various criteria"""
        self.print_header("SEARCH MATERIALS")
        
        print("Search by:")
        print("1. Vendor SKU (partial match)")
        print("2. Description (partial match)")
        print("3. Full code (exact match)")
        print("4. Richmond pack ID")
        print()
        print("0. Cancel")
        print()
        
        choice = input("Enter choice: ").strip()
        
        if choice == '0':
            return
        
        search_term = input("Enter search term: ").strip()
        
        if not search_term:
            return
        
        cursor = self.builder.conn.cursor()
        
        if choice == '1':
            query = "SELECT * FROM materials WHERE vendor_sku LIKE ? ORDER BY material_id"
            params = (f"%{search_term}%",)
        elif choice == '2':
            query = "SELECT * FROM materials WHERE description LIKE ? ORDER BY material_id"
            params = (f"%{search_term}%",)
        elif choice == '3':
            query = "SELECT * FROM materials WHERE full_code = ? ORDER BY material_id"
            params = (search_term,)
        elif choice == '4':
            query = "SELECT * FROM materials WHERE richmond_pack_id LIKE ? ORDER BY material_id"
            params = (f"%{search_term}%",)
        else:
            return
        
        results = cursor.execute(query, params).fetchall()
        
        if not results:
            print(f"\nNo materials found matching '{search_term}'")
            self.pause()
            return
        
        print(f"\nFound {len(results):,d} materials:")
        print("-" * 80)
        print(f"{'ID':<6} {'Full Code':<25} {'SKU':<15} {'Qty':<8} {'Description'}")
        print("-" * 80)
        
        for row in results[:50]:  # Limit to first 50
            mat_id = row[0]
            full_code = row[5]
            sku = row[6]
            desc = row[7]
            qty = row[8]
            unit = row[9]
            
            desc_short = (desc[:30] + '...') if desc and len(desc) > 30 else desc
            print(f"{mat_id:<6} {full_code:<25} {sku:<15} {qty:>6.1f} {unit:<2} {desc_short}")
        
        if len(results) > 50:
            print(f"\n... and {len(results) - 50:,d} more")
        
        print()
        mat_id = input("Enter material ID to view detail (or Enter to continue): ").strip()
        if mat_id:
            self.view_material_detail(mat_id)
        else:
            self.pause()
    
    def add_material(self):
        """Add a new material interactively"""
        self.print_header("ADD NEW MATERIAL")
        
        print("Enter material details (or 'q' to cancel at any time):\n")
        
        # Get plan code
        plan_code = input("Plan code (e.g., 1670, G603, 153e): ").strip()
        if plan_code.lower() == 'q':
            return
        
        # Offer to translate from customer code
        translate = input("Translate from customer code? [y/N]: ").strip().lower()
        
        if translate == 'y':
            print("\nCustomer code examples:")
            print("  Richmond: |10.82, elevation 'B, C, D', type 'Framing'")
            print("  Holt:     Activity 10, community 'Arbor Creek'\n")
            
            customer_pack = input("Pack/Activity ID: ").strip()
            elevation_str = input("Elevation/Community (or blank): ").strip()
            item_type = input("Item type (Framing/Siding): ").strip()
            
            try:
                unified_code = self.builder.translate_richmond_code(
                    plan_code, customer_pack, elevation_str, item_type
                )
                parts = unified_code.split('-')
                phase_code = parts[1]
                elevation_code = parts[2]
                item_type_code = parts[3]
                
                print(f"\n✓ Translated to: {unified_code}")
                print(f"  Phase: {phase_code}")
                print(f"  Elevation: {elevation_code}")
                print(f"  Item type: {item_type_code}")
                print()
                
            except ValueError as e:
                print(f"\n✗ Translation error: {e}")
                print("Please enter codes manually.")
                phase_code = input("Phase code (e.g., 010.820): ").strip()
                elevation_code = input("Elevation code (e.g., BCD or **): ").strip()
                item_type_code = input("Item type code (e.g., 1000): ").strip()
                customer_pack = None
        else:
            phase_code = input("Phase code (e.g., 010.820): ").strip()
            elevation_code = input("Elevation code (e.g., BCD or **): ").strip()
            item_type_code = input("Item type code (e.g., 1000): ").strip()
            customer_pack = None
        
        # Get material details
        vendor_sku = input("Vendor SKU: ").strip()
        description = input("Description: ").strip()
        quantity = input("Quantity: ").strip()
        unit = input("Unit (EA/LF/SF/etc.): ").strip() or "EA"
        notes = input("Notes (optional): ").strip()
        
        # Confirm
        print("\n" + "="*80)
        print("CONFIRM NEW MATERIAL")
        print("="*80)
        print(f"Full code: {plan_code}-{phase_code}-{elevation_code}-{item_type_code}")
        print(f"SKU: {vendor_sku}")
        print(f"Description: {description}")
        print(f"Quantity: {quantity} {unit}")
        if notes:
            print(f"Notes: {notes}")
        print()
        
        confirm = input("Add this material? [y/N]: ").strip().lower()
        
        if confirm == 'y':
            try:
                material_id = self.builder.add_material(
                    plan_code=plan_code,
                    phase_code=phase_code,
                    elevation_code=elevation_code,
                    item_type_code=item_type_code,
                    vendor_sku=vendor_sku,
                    description=description,
                    quantity=float(quantity),
                    unit=unit,
                    richmond_pack_id=customer_pack,
                    notes=notes
                )
                
                print(f"\n✓ Material added successfully!")
                print(f"  Material ID: {material_id}")
                print(f"  Full code: {plan_code}-{phase_code}-{elevation_code}-{item_type_code}")
                
            except Exception as e:
                print(f"\n✗ Error adding material: {e}")
        else:
            print("\nMaterial not added.")
        
        self.pause()
    
    def edit_material(self, material_id: str):
        """Edit an existing material"""
        self.print_header(f"EDIT MATERIAL - ID {material_id}")
        
        cursor = self.builder.conn.cursor()
        result = cursor.execute("""
            SELECT * FROM materials WHERE material_id = ?
        """, (material_id,)).fetchone()
        
        if not result:
            print(f"Material ID {material_id} not found.")
            self.pause()
            return
        
        # Show current values
        columns = [desc[0] for desc in cursor.description]
        current = dict(zip(columns, result))
        
        print("Current values (press Enter to keep current value):\n")
        
        # Editable fields
        vendor_sku = input(f"Vendor SKU [{current['vendor_sku']}]: ").strip() or current['vendor_sku']
        description = input(f"Description [{current['description'][:30]}...]: ").strip() or current['description']
        quantity = input(f"Quantity [{current['quantity']}]: ").strip() or str(current['quantity'])
        unit = input(f"Unit [{current['unit']}]: ").strip() or current['unit']
        notes = input(f"Notes [{current.get('notes', '')}]: ").strip() or current.get('notes')
        
        # Confirm
        print("\n" + "="*80)
        print("CONFIRM CHANGES")
        print("="*80)
        print(f"Vendor SKU: {current['vendor_sku']} → {vendor_sku}")
        print(f"Description: {current['description'][:40]} → {description[:40]}")
        print(f"Quantity: {current['quantity']} {current['unit']} → {quantity} {unit}")
        print()
        
        confirm = input("Save changes? [y/N]: ").strip().lower()
        
        if confirm == 'y':
            try:
                cursor.execute("""
                    UPDATE materials
                    SET vendor_sku = ?,
                        description = ?,
                        quantity = ?,
                        unit = ?,
                        notes = ?,
                        modified_date = CURRENT_DATE
                    WHERE material_id = ?
                """, (vendor_sku, description, float(quantity), unit, notes, material_id))
                
                self.builder.conn.commit()
                
                print("\n✓ Material updated successfully!")
                
            except Exception as e:
                print(f"\n✗ Error updating material: {e}")
                self.builder.conn.rollback()
        else:
            print("\nChanges not saved.")
        
        self.pause()
    
    def delete_material(self, material_id: str):
        """Delete a material"""
        self.print_header(f"DELETE MATERIAL - ID {material_id}")
        
        cursor = self.builder.conn.cursor()
        result = cursor.execute("""
            SELECT material_id, full_code, vendor_sku, description
            FROM materials
            WHERE material_id = ?
        """, (material_id,)).fetchone()
        
        if not result:
            print(f"Material ID {material_id} not found.")
            self.pause()
            return
        
        mat_id, full_code, sku, desc = result
        
        print("WARNING: This will permanently delete the material!")
        print()
        print(f"Material ID: {mat_id}")
        print(f"Full code: {full_code}")
        print(f"SKU: {sku}")
        print(f"Description: {desc}")
        print()
        
        confirm = input("Type 'DELETE' to confirm: ").strip()
        
        if confirm == 'DELETE':
            try:
                cursor.execute("DELETE FROM materials WHERE material_id = ?", (material_id,))
                self.builder.conn.commit()
                print("\n✓ Material deleted successfully!")
            except Exception as e:
                print(f"\n✗ Error deleting material: {e}")
                self.builder.conn.rollback()
        else:
            print("\nDeletion cancelled.")
        
        self.pause()
    
    def view_phases(self):
        """View all product phases"""
        self.print_header("PRODUCT PHASES")
        
        cursor = self.builder.conn.cursor()
        results = cursor.execute("""
            SELECT 
                p.phase_code,
                p.phase_name,
                p.richmond_pack_id,
                p.construction_sequence,
                COUNT(m.material_id) as material_count
            FROM product_phases p
            LEFT JOIN materials m ON p.phase_code = m.phase_code
            GROUP BY p.phase_code, p.phase_name, p.richmond_pack_id, p.construction_sequence
            ORDER BY p.phase_code
        """).fetchall()
        
        print(f"Total phases: {len(results):,d}\n")
        print(f"{'Phase Code':<12} {'Richmond':<15} {'Phase Name':<40} {'Seq':<5} {'Mtls'}")
        print("-" * 80)
        
        for row in results[:50]:  # Show first 50
            phase_code, phase_name, richmond, seq, count = row
            phase_name_display = (phase_name[:37] + '...') if phase_name and len(phase_name) > 40 else phase_name
            richmond_display = richmond if richmond else ""
            print(f"{phase_code:<12} {richmond_display:<15} {phase_name_display:<40} {seq:<5} {count:>5,d}")
        
        if len(results) > 50:
            print(f"\n... and {len(results) - 50:,d} more")
        
        self.pause()
    
    def view_item_types(self):
        """View all item types"""
        self.print_header("ITEM TYPES")
        
        cursor = self.builder.conn.cursor()
        results = cursor.execute("""
            SELECT 
                i.type_code,
                i.type_name,
                i.category_name,
                i.description,
                COUNT(m.material_id) as material_count
            FROM item_types i
            LEFT JOIN materials m ON i.type_code = m.item_type_code
            GROUP BY i.type_code, i.type_name, i.category_name, i.description
            ORDER BY i.type_code
        """).fetchall()
        
        print(f"Total item types: {len(results):,d}\n")
        print(f"{'Code':<10} {'Type Name':<30} {'Category':<20} {'Materials'}")
        print("-" * 80)
        
        for row in results:
            code, name, category, desc, count = row
            print(f"{code:<10} {name:<30} {category:<20} {count:>9,d}")
        
        self.pause()
    
    def view_plans(self):
        """View all plans"""
        self.print_header("PLANS")
        
        cursor = self.builder.conn.cursor()
        results = cursor.execute("""
            SELECT 
                p.plan_code,
                p.plan_name,
                p.builder,
                COUNT(m.material_id) as material_count,
                SUM(m.quantity) as total_quantity
            FROM plans p
            LEFT JOIN materials m ON p.plan_code = m.plan_code
            GROUP BY p.plan_code, p.plan_name, p.builder
            ORDER BY p.plan_code
        """).fetchall()
        
        print(f"Total plans: {len(results):,d}\n")
        print(f"{'Plan Code':<12} {'Plan Name':<40} {'Builder':<12} {'Materials':>10} {'Total Qty':>12}")
        print("-" * 90)
        
        for row in results:
            plan_code, plan_name, builder, mat_count, total_qty = row
            plan_name_display = (plan_name[:37] + '...') if plan_name and len(plan_name) > 40 else plan_name
            total_qty_display = f"{total_qty:,.1f}" if total_qty else "0"
            print(f"{plan_code:<12} {plan_name_display:<40} {builder:<12} {mat_count:>10,d} {total_qty_display:>12}")
        
        self.pause()
    
    def translate_code_interactive(self):
        """Interactive customer code translation"""
        self.print_header("TRANSLATE CUSTOMER CODE")
        
        print("Enter customer code details:\n")
        print("Examples:")
        print("  Richmond: Plan G603, Pack |10.82, Elevation 'B, C, D'")
        print("  Holt:     Plan 153e, Activity 10, Community 'Arbor Creek'")
        print()
        
        plan_code = input("Plan code (e.g., 1670, G603, 153e): ").strip()
        customer_pack = input("Pack/Activity ID (e.g., |10.82 or Activity 10): ").strip()
        elevation_str = input("Elevation/Community (e.g., 'B, C, D' or blank): ").strip()
        item_type = input("Item type (Framing/Siding): ").strip()
        
        try:
            unified_code = self.builder.translate_richmond_code(
                plan_code, customer_pack, elevation_str, item_type
            )
            
            parts = unified_code.split('-')
            
            print("\n" + "="*80)
            print("TRANSLATION RESULT")
            print("="*80)
            print(f"Customer Code: {customer_pack} + {elevation_str}")
            print(f"Unified Code:  {unified_code}")
            print()
            print(f"  Plan:      {parts[0]}")
            print(f"  Phase:     {parts[1]}")
            print(f"  Elevation: {parts[2]}")
            print(f"  Item Type: {parts[3]}")
            
        except ValueError as e:
            print(f"\n✗ Translation error: {e}")
        
        self.pause()
    
    def database_statistics(self):
        """Show database statistics"""
        self.print_header("DATABASE STATISTICS")
        
        cursor = self.builder.conn.cursor()
        
        # Material counts
        total_materials = cursor.execute("SELECT COUNT(*) FROM materials").fetchone()[0]
        total_plans = cursor.execute("SELECT COUNT(*) FROM plans").fetchone()[0]
        total_phases = cursor.execute("SELECT COUNT(*) FROM product_phases").fetchone()[0]
        total_item_types = cursor.execute("SELECT COUNT(*) FROM item_types").fetchone()[0]
        
        # Unique values
        unique_elevations = cursor.execute("SELECT COUNT(DISTINCT elevation_code) FROM materials").fetchone()[0]
        unique_skus = cursor.execute("SELECT COUNT(DISTINCT vendor_sku) FROM materials").fetchone()[0]
        
        # Total quantities
        total_quantity = cursor.execute("SELECT SUM(quantity) FROM materials").fetchone()[0] or 0
        
        print("Database Overview:")
        print("-" * 40)
        print(f"Total Materials:      {total_materials:>10,d}")
        print(f"Total Plans:          {total_plans:>10,d}")
        print(f"Total Phases:         {total_phases:>10,d}")
        print(f"Total Item Types:     {total_item_types:>10,d}")
        print(f"Unique Elevations:    {unique_elevations:>10,d}")
        print(f"Unique SKUs:          {unique_skus:>10,d}")
        print(f"Total Quantity:       {total_quantity:>10,.1f}")
        
        print("\n\nTop 5 Plans by Material Count:")
        print("-" * 40)
        top_plans = cursor.execute("""
            SELECT plan_code, COUNT(*) as count
            FROM materials
            GROUP BY plan_code
            ORDER BY count DESC
            LIMIT 5
        """).fetchall()
        
        for plan, count in top_plans:
            print(f"  {plan:<12} {count:>8,d} materials")
        
        print("\n\nTop 5 Phases by Material Count:")
        print("-" * 40)
        top_phases = cursor.execute("""
            SELECT m.phase_code, p.phase_name, COUNT(*) as count
            FROM materials m
            LEFT JOIN product_phases p ON m.phase_code = p.phase_code
            GROUP BY m.phase_code, p.phase_name
            ORDER BY count DESC
            LIMIT 5
        """).fetchall()
        
        for phase, name, count in top_phases:
            name_display = (name[:25] + '...') if name and len(name) > 28 else name
            print(f"  {phase:<12} {name_display:<28} {count:>8,d}")
        
        self.pause()
    
    def validate_database_interactive(self):
        """Run database validation"""
        self.print_header("VALIDATE DATABASE")
        
        print("Running validation checks...\n")
        
        results = self.builder.validate_database()
        
        print("\n\nRecommendations:")
        print("-" * 40)
        
        if results['orphaned_materials'] > 0:
            print(f"⚠ {results['orphaned_materials']} orphaned materials found")
            print("  Recommendation: Review and assign to valid plans")
        
        if results['missing_phases'] > 0:
            print(f"⚠ {results['missing_phases']} materials with missing phase definitions")
            print("  Recommendation: Add phase definitions to product_phases table")
        
        if results['missing_item_types'] > 0:
            print(f"⚠ {results['missing_item_types']} materials with missing item type definitions")
            print("  Recommendation: Add item type definitions to item_types table")
        
        if results['duplicate_codes'] > 0:
            print(f"⚠ {results['duplicate_codes']} duplicate full codes found")
            print("  Recommendation: Review and consolidate duplicates")
        
        if (results['orphaned_materials'] == 0 and results['missing_phases'] == 0 and 
            results['missing_item_types'] == 0 and results['duplicate_codes'] == 0):
            print("✓ No issues found! Database is healthy.")
        
        self.pause()
    
    def export_reports_menu(self):
        """Export reports submenu"""
        self.print_header("EXPORT REPORTS")
        
        print("1. Export all materials to CSV")
        print("2. Export materials by plan")
        print("3. Export materials by phase")
        print("4. Generate summary report")
        print()
        print("0. Back to main menu")
        print()
        
        choice = input("Enter choice: ").strip()
        
        if choice == '0':
            return
        elif choice == '1':
            filename = f"all_materials_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            self.builder.export_materials_report(filename)
            print(f"\n✓ Exported to: {filename}")
            self.pause()
        elif choice == '2':
            plan_code = input("Enter plan code: ").strip()
            filename = f"materials_{plan_code}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            self.builder.export_materials_report(filename, plan_code=plan_code)
            print(f"\n✓ Exported to: {filename}")
            self.pause()
        elif choice == '3':
            phase_code = input("Enter phase code: ").strip()
            # Export phase materials
            materials = self.builder.get_materials_by_phase(phase_code)
            filename = f"materials_phase_{phase_code.replace('.', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            materials.to_csv(filename, index=False)
            print(f"\n✓ Exported {len(materials)} materials to: {filename}")
            self.pause()
        elif choice == '4':
            filename = f"summary_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
            summary = self.builder.generate_summary_report()
            with open(filename, 'w') as f:
                f.write(summary)
            print(f"\n✓ Summary report saved to: {filename}")
            print("\nPreview:")
            print(summary[:1000])
            self.pause()
    
    def import_customer_database(self):
        """Import customer database with human-in-the-loop review"""
        self.print_header("IMPORT CUSTOMER DATABASE")
        
        print("This wizard will help you import materials from a customer database.")
        print("You'll review and approve all translations before importing.\n")
        
        # Step 1: Select file
        print("Step 1: Select source file")
        print("-" * 80)
        print("Supported formats: Excel (.xlsx, .xlsm), CSV (.csv)")
        print()
        
        file_path = input("Enter file path (or 'q' to cancel): ").strip()
        
        if file_path.lower() == 'q':
            return
        
        file_path_obj = Path(file_path)
        if not file_path_obj.exists():
            print(f"\n✗ File not found: {file_path}")
            self.pause()
            return
        
        # Step 2: Identify customer system
        print("\n" + "="*80)
        print("Step 2: Identify customer system")
        print("-" * 80)
        print("1. Richmond American Homes (uses |XX.XX pack format)")
        print("2. Holt Homes (uses Activity XX format)")
        print("3. Other (custom mapping)")
        print()
        
        customer_type = input("Select customer type [1-3]: ").strip()
        
        customer_name_map = {
            '1': 'Richmond',
            '2': 'Holt',
            '3': 'Custom'
        }
        customer_name = customer_name_map.get(customer_type, 'Unknown')
        
        # Step 3: Load and preview data
        print("\n" + "="*80)
        print("Step 3: Load and preview data")
        print("-" * 80)
        
        try:
            if file_path.endswith('.csv'):
                df = pd.read_csv(file_path)
            else:
                # Try to read Excel
                sheet_name = input("Enter sheet name (or press Enter for first sheet): ").strip()
                if sheet_name:
                    df = pd.read_excel(file_path, sheet_name=sheet_name)
                else:
                    df = pd.read_excel(file_path)
            
            print(f"\n✓ Loaded {len(df):,d} rows")
            print(f"\nColumns found: {', '.join(df.columns)}")
            print("\nFirst 5 rows:")
            print(df.head().to_string())
            
        except Exception as e:
            print(f"\n✗ Error loading file: {e}")
            self.pause()
            return
        
        # Step 4: Map columns
        print("\n" + "="*80)
        print("Step 4: Map columns to unified system")
        print("-" * 80)
        print("\nEnter the column name for each field (or press Enter to skip):\n")
        
        column_map = {}
        column_map['plan_code'] = input("  Plan code column (e.g., 'Plan', 'Plan_Code'): ").strip()
        column_map['pack_id'] = input("  Pack/Activity ID column (e.g., 'Pack_ID', 'Activity'): ").strip()
        column_map['elevation'] = input("  Elevation column (optional): ").strip()
        column_map['vendor_sku'] = input("  Vendor SKU column (e.g., 'SKU', 'Item_Code'): ").strip()
        column_map['description'] = input("  Description column: ").strip()
        column_map['quantity'] = input("  Quantity column: ").strip()
        column_map['unit'] = input("  Unit column (optional): ").strip()
        column_map['item_type'] = input("  Item type column (e.g., 'Type', 'Category'): ").strip()
        
        # Validate required columns
        required = ['plan_code', 'pack_id', 'vendor_sku', 'description', 'quantity']
        missing = [k for k in required if not column_map.get(k)]
        
        if missing:
            print(f"\n✗ Missing required columns: {', '.join(missing)}")
            self.pause()
            return
        
        # Step 5: Process and preview translations
        print("\n" + "="*80)
        print("Step 5: Process translations (sample)")
        print("-" * 80)
        
        sample_size = min(10, len(df))
        print(f"\nProcessing first {sample_size} rows as sample...\n")
        
        translations = []
        errors = []
        
        for idx, row in df.head(sample_size).iterrows():
            try:
                plan_code = str(row[column_map['plan_code']]) if pd.notna(row[column_map['plan_code']]) else ""
                pack_id = str(row[column_map['pack_id']]) if pd.notna(row[column_map['pack_id']]) else ""
                elevation = str(row[column_map['elevation']]) if column_map.get('elevation') and pd.notna(row[column_map.get('elevation', '')]) else ""
                vendor_sku = str(row[column_map['vendor_sku']]) if pd.notna(row[column_map['vendor_sku']]) else ""
                description = str(row[column_map['description']]) if pd.notna(row[column_map['description']]) else ""
                quantity = float(row[column_map['quantity']]) if pd.notna(row[column_map['quantity']]) else 0
                unit = str(row[column_map['unit']]) if column_map.get('unit') and pd.notna(row[column_map.get('unit', '')]) else "EA"
                item_type = str(row[column_map['item_type']]) if pd.notna(row[column_map['item_type']]) else "Framing"
                
                # Try translation
                try:
                    unified_code = self.builder.translate_richmond_code(
                        plan_code, pack_id, elevation, item_type
                    )
                    
                    translations.append({
                        'row': idx,
                        'customer_code': f"{pack_id} + {elevation}",
                        'unified_code': unified_code,
                        'sku': vendor_sku,
                        'description': description[:40],
                        'quantity': quantity,
                        'unit': unit,
                        'success': True
                    })
                    
                except ValueError as e:
                    errors.append({
                        'row': idx,
                        'customer_code': f"{pack_id} + {elevation}",
                        'error': str(e),
                        'sku': vendor_sku
                    })
            
            except Exception as e:
                errors.append({
                    'row': idx,
                    'error': f"Data error: {str(e)}"
                })
        
        # Display sample translations
        if translations:
            print("SAMPLE TRANSLATIONS:")
            print("-" * 80)
            print(f"{'Row':<5} {'Customer Code':<20} {'Unified Code':<25} {'SKU':<15} {'Qty':<8}")
            print("-" * 80)
            
            for t in translations:
                print(f"{t['row']:<5} {t['customer_code']:<20} {t['unified_code']:<25} {t['sku']:<15} {t['quantity']:>6.1f} {t['unit']}")
        
        if errors:
            print("\n\nERRORS IN SAMPLE:")
            print("-" * 80)
            for e in errors:
                print(f"Row {e['row']}: {e.get('error', 'Unknown error')}")
        
        # Step 6: Review and decide
        print("\n" + "="*80)
        print("Step 6: Review sample translations")
        print("-" * 80)
        
        success_rate = len(translations) / sample_size * 100 if sample_size > 0 else 0
        
        print(f"\nSample Results:")
        print(f"  Successful: {len(translations)}/{sample_size} ({success_rate:.1f}%)")
        print(f"  Errors:     {len(errors)}/{sample_size}")
        print()
        
        if success_rate < 50:
            print("⚠ Warning: Less than 50% success rate on sample.")
            print("  Recommendation: Review column mappings and translation table.")
            print()
        
        print("Options:")
        print("  [C] Continue with full import")
        print("  [A] Adjust column mappings")
        print("  [E] Export errors to review")
        print("  [Q] Quit without importing")
        print()
        
        choice = input("Enter choice: ").strip().upper()
        
        if choice == 'Q':
            print("\nImport cancelled.")
            self.pause()
            return
        
        elif choice == 'E':
            error_file = f"import_errors_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            error_df = pd.DataFrame(errors)
            error_df.to_csv(error_file, index=False)
            print(f"\n✓ Errors exported to: {error_file}")
            self.pause()
            return
        
        elif choice == 'A':
            print("\nRestart and adjust column mappings.")
            self.pause()
            return
        
        elif choice == 'C':
            # Step 7: Full import with progress
            print("\n" + "="*80)
            print("Step 7: Full import")
            print("-" * 80)
            
            confirm = input(f"\nImport ALL {len(df):,d} rows? Type 'IMPORT' to confirm: ").strip()
            
            if confirm != 'IMPORT':
                print("\nImport cancelled.")
                self.pause()
                return
            
            print(f"\nProcessing {len(df):,d} rows...")
            
            imported = 0
            failed = 0
            error_list = []
            
            for idx, row in df.iterrows():
                try:
                    plan_code = str(row[column_map['plan_code']]) if pd.notna(row[column_map['plan_code']]) else ""
                    pack_id = str(row[column_map['pack_id']]) if pd.notna(row[column_map['pack_id']]) else ""
                    elevation = str(row[column_map['elevation']]) if column_map.get('elevation') and pd.notna(row[column_map.get('elevation', '')]) else ""
                    vendor_sku = str(row[column_map['vendor_sku']]) if pd.notna(row[column_map['vendor_sku']]) else ""
                    description = str(row[column_map['description']]) if pd.notna(row[column_map['description']]) else ""
                    quantity = float(row[column_map['quantity']]) if pd.notna(row[column_map['quantity']]) else 0
                    unit = str(row[column_map['unit']]) if column_map.get('unit') and pd.notna(row[column_map.get('unit', '')]) else "EA"
                    item_type = str(row[column_map['item_type']]) if pd.notna(row[column_map['item_type']]) else "Framing"
                    
                    # Translate
                    unified_code = self.builder.translate_richmond_code(
                        plan_code, pack_id, elevation, item_type
                    )
                    parts = unified_code.split('-')
                    
                    # Add to database
                    self.builder.add_material(
                        plan_code=parts[0],
                        phase_code=parts[1],
                        elevation_code=parts[2],
                        item_type_code=parts[3],
                        vendor_sku=vendor_sku,
                        description=description,
                        quantity=quantity,
                        unit=unit,
                        richmond_pack_id=pack_id,
                        notes=f"Imported from {customer_name} database: {file_path_obj.name}"
                    )
                    
                    imported += 1
                    
                    if imported % 100 == 0:
                        print(f"  Processed {imported:,d} rows...")
                
                except Exception as e:
                    failed += 1
                    error_list.append({
                        'row': idx,
                        'pack_id': pack_id,
                        'error': str(e)
                    })
            
            # Final results
            print("\n" + "="*80)
            print("IMPORT COMPLETE")
            print("="*80)
            print(f"  Successfully imported: {imported:,d}")
            print(f"  Failed:                {failed:,d}")
            print(f"  Success rate:          {imported/(imported+failed)*100:.1f}%")
            
            if error_list:
                error_file = f"import_errors_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                error_df = pd.DataFrame(error_list)
                error_df.to_csv(error_file, index=False)
                print(f"\n  Errors exported to: {error_file}")
            
            print(f"\n✓ Import complete! Added {imported:,d} materials to database.")
            
        self.pause()
    
    def backup_database(self):
        """Create database backup"""
        self.print_header("BACKUP DATABASE")
        
        backup_name = f"bat_unified_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
        
        print(f"Creating backup: {backup_name}")
        print()
        
        try:
            import shutil
            shutil.copy2(self.builder.db_path, backup_name)
            print(f"✓ Backup created successfully!")
            print(f"  File: {backup_name}")
            print(f"  Size: {Path(backup_name).stat().st_size:,d} bytes")
        except Exception as e:
            print(f"✗ Error creating backup: {e}")
        
        self.pause()
    
    def view_audit_trail(self):
        """View audit trail"""
        self.print_header("AUDIT TRAIL")
        
        cursor = self.builder.conn.cursor()
        results = cursor.execute("""
            SELECT 
                audit_id,
                table_name,
                record_id,
                action,
                changed_by,
                changed_date,
                reason
            FROM audit_trail
            ORDER BY audit_id DESC
            LIMIT 50
        """).fetchall()
        
        if not results:
            print("No audit trail entries found.")
            self.pause()
            return
        
        print(f"Showing last 50 audit entries:\n")
        print(f"{'ID':<6} {'Table':<15} {'Record':<10} {'Action':<8} {'Date':<20} {'By':<15}")
        print("-" * 80)
        
        for row in results:
            audit_id, table, record, action, by, date, reason = row
            by_display = by if by else "System"
            print(f"{audit_id:<6} {table:<15} {record:<10} {action:<8} {date:<20} {by_display:<15}")
        
        self.pause()
    
    def run(self):
        """Run the interactive menu"""
        while self.running:
            choice = self.display_main_menu()
            
            if choice == '0':
                self.running = False
                print("\nGoodbye!")
            elif choice == '1':
                self.view_materials_menu()
            elif choice == '2':
                self.search_materials()
            elif choice == '3':
                self.add_material()
            elif choice == '4':
                mat_id = input("Enter material ID to edit: ").strip()
                if mat_id:
                    self.edit_material(mat_id)
            elif choice == '5':
                mat_id = input("Enter material ID to delete: ").strip()
                if mat_id:
                    self.delete_material(mat_id)
            elif choice == '6':
                self.view_phases()
            elif choice == '7':
                print("\nPhase editing not yet implemented.")
                self.pause()
            elif choice == '8':
                self.view_item_types()
            elif choice == '9':
                print("\nItem type editing not yet implemented.")
                self.pause()
            elif choice == '10':
                self.view_plans()
            elif choice == '11':
                print("\nPlan editing not yet implemented.")
                self.pause()
            elif choice == '12':
                self.translate_code_interactive()
            elif choice == '13':
                self.import_customer_database()
            elif choice == '14':
                self.database_statistics()
            elif choice == '15':
                self.validate_database_interactive()
            elif choice == '16':
                self.export_reports_menu()
            elif choice == '17':
                self.backup_database()
            elif choice == '18':
                self.view_audit_trail()
            else:
                print("\nInvalid choice. Please try again.")
                self.pause()


def main():
    """Main entry point"""
    print("=" * 80)
    print("BAT UNIFIED CODING SYSTEM - INTERACTIVE MENU")
    print("=" * 80)
    print()
    
    # Check if database exists
    db_path = "bat_unified.db"
    
    if not Path(db_path).exists():
        print("Database not found. Creating new database...")
        builder = BATCodingSystemBuilder(db_path)
        builder.connect()
        builder.create_schema()
        
        # Load translation table if available
        if Path("coding_schema_translation_v2.csv").exists():
            builder.load_translation_table("coding_schema_translation_v2.csv")
        
        print("\n✓ Database created successfully!")
        print()
    else:
        print(f"✓ Found existing database: {db_path}")
        print()
        builder = BATCodingSystemBuilder(db_path)
        builder.connect()
    
    try:
        # Run interactive menu
        menu = InteractiveMenu(builder)
        menu.run()
    finally:
        builder.close()


if __name__ == "__main__":
    main()
