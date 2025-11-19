"""
BAT System CLI - Material Commands

Commands for managing materials (SKUs, descriptions, categories)
"""

import click
import sys
sys.path.insert(0, '/home/user/ConstructionPlatform')

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich import box
from decimal import Decimal


console = Console()


@click.group()
def material():
    """
    Material management (list, search, add, update)

    \b
    Materials are the building blocks of plans - lumber, hardware,
    panels, etc. Each material has a SKU, description, and category.

    \b
    Examples:
      bat material list
      bat material search "2x4"
      bat material add --sku "2X4-8" --description "2x4 Stud 8ft"
    """
    pass


@material.command()
@click.option('--limit', '-l', default=20, help='Number of materials to show')
@click.option('--offset', '-o', default=0, help='Number of materials to skip')
@click.option('--category', '-c', help='Filter by category')
def list(limit, offset, category):
    """
    List all materials

    \b
    Examples:
      bat material list
      bat material list --limit 50
      bat material list --category "Lumber"

    Shows SKU, description, category, and supplier for each material
    """
    console.print()
    console.print("[yellow]⚠️  Database connection required[/yellow]")
    console.print("[dim]This command will connect to PostgreSQL database[/dim]")
    console.print()

    try:
        # Import database dependencies
        from bat_system_v2.bat_system_v2.database.connection import SessionLocal
        from bat_system_v2.bat_system_v2.services.material_service import MaterialService

        # Create session
        db = SessionLocal()

        try:
            service = MaterialService(db)

            # Get materials
            console.print(f"[cyan]Fetching materials...[/cyan] (limit: {limit}, offset: {offset})")

            # This will be implemented when MaterialService has list method
            console.print()
            console.print("[yellow]Note:[/yellow] MaterialService.list() method needs to be implemented")
            console.print("[dim]See: bat_system_v2/services/material_service.py[/dim]")

        finally:
            db.close()

    except ImportError as e:
        console.print(f"[red]❌ Error:[/red] {e}")
        console.print("[yellow]Make sure database is configured[/yellow]")
        sys.exit(1)
    except Exception as e:
        console.print(f"[red]❌ Error:[/red] {e}")
        sys.exit(1)

    console.print()


@material.command()
@click.argument('search_term')
@click.option('--exact', '-e', is_flag=True, help='Exact match only')
def search(search_term, exact):
    """
    Search for materials by SKU or description

    \b
    Examples:
      bat material search "2x4"
      bat material search "stud" --exact
      bat material search "2X4-8"

    SEARCH_TERM: Text to search for in SKU or description
    """
    console.print()
    console.print(f"[cyan]Searching for:[/cyan] {search_term}")

    if exact:
        console.print("[dim]Mode: Exact match[/dim]")
    else:
        console.print("[dim]Mode: Partial match (contains)[/dim]")

    console.print()
    console.print("[yellow]⚠️  Database connection required[/yellow]")
    console.print("[dim]MaterialService.search() method needs to be implemented[/dim]")
    console.print()


@material.command()
@click.option('--sku', '-s', required=True, help='Material SKU (e.g., 2X4-8)')
@click.option('--description', '-d', required=True, help='Material description')
@click.option('--category', '-c', default='General', help='Category')
@click.option('--supplier', '-sup', help='Supplier name')
def add(sku, description, category, supplier):
    """
    Add a new material

    \b
    Examples:
      bat material add --sku "2X4-8" --description "2x4 Stud 8ft"
      bat material add -s "PLY-4X8" -d "Plywood 4x8" -c "Panels"

    Creates a new material in the database
    """
    console.print()
    console.print("[bold cyan]Adding New Material[/bold cyan]")
    console.print()

    # Create display table
    table = Table(box=box.SIMPLE, show_header=False)
    table.add_column("Field", style="cyan")
    table.add_column("Value", style="white")

    table.add_row("SKU", sku)
    table.add_row("Description", description)
    table.add_row("Category", category)
    if supplier:
        table.add_row("Supplier", supplier)

    console.print(table)
    console.print()

    # Confirm
    if click.confirm("Add this material?", default=True):
        console.print("[yellow]⚠️  Database connection required[/yellow]")
        console.print("[dim]MaterialService.create() method needs to be implemented[/dim]")
        console.print()
    else:
        console.print("[yellow]Cancelled[/yellow]")

    console.print()


@material.command()
@click.argument('sku')
@click.option('--description', '-d', help='New description')
@click.option('--category', '-c', help='New category')
def update(sku, description, category):
    """
    Update an existing material

    \b
    Examples:
      bat material update "2X4-8" --description "2x4 Stud 8ft Premium"
      bat material update "PLY-4X8" --category "Sheathing"

    SKU: Material SKU to update
    """
    console.print()
    console.print(f"[bold cyan]Updating Material:[/bold cyan] {sku}")
    console.print()

    if not description and not category:
        console.print("[red]❌ Error:[/red] Must specify at least one field to update")
        console.print("[dim]Use --description or --category[/dim]")
        sys.exit(1)

    # Show changes
    table = Table(title="Changes", box=box.SIMPLE)
    table.add_column("Field", style="cyan")
    table.add_column("New Value", style="green")

    if description:
        table.add_row("Description", description)
    if category:
        table.add_row("Category", category)

    console.print(table)
    console.print()

    if click.confirm("Apply these changes?", default=True):
        console.print("[yellow]⚠️  Database connection required[/yellow]")
        console.print("[dim]MaterialService.update() method needs to be implemented[/dim]")
    else:
        console.print("[yellow]Cancelled[/yellow]")

    console.print()


@material.command()
@click.argument('sku')
def show(sku):
    """
    Show detailed information about a material

    \b
    Examples:
      bat material show "2X4-8"
      bat material show "PLY-4X8"

    SKU: Material SKU to display
    """
    console.print()
    console.print(f"[cyan]Loading material:[/cyan] {sku}")
    console.print()

    # Example display (would be populated from database)
    content = f"""[bold]SKU:[/bold] {sku}
[bold]Description:[/bold] 2x4 Stud 8ft (example)
[bold]Category:[/bold] Lumber
[bold]Supplier:[/bold] Holt Lumber

[bold]Pricing (example):[/bold]
  Level 01: $4.99
  Level 02: $4.75
  Level 03: $4.50
  Level L5: $4.25

[bold]Last Updated:[/bold] 2025-11-16"""

    panel = Panel(
        content,
        title=f"[bold blue]Material Details: {sku}[/bold blue]",
        border_style="blue",
        box=box.ROUNDED
    )

    console.print(panel)
    console.print()
    console.print("[yellow]⚠️  Database connection required[/yellow]")
    console.print("[dim]MaterialService.get_by_sku() method needs to be implemented[/dim]")
    console.print()


@material.command()
def stats():
    """
    Show material database statistics

    Displays counts by category, supplier, etc.
    """
    console.print()

    # Example stats
    table = Table(title="Material Database Statistics", box=box.ROUNDED, border_style="cyan")
    table.add_column("Metric", style="cyan")
    table.add_column("Count", style="white", justify="right")

    table.add_row("Total Materials", "0")
    table.add_row("Categories", "0")
    table.add_row("Suppliers", "0")
    table.add_row("With Pricing", "0")

    console.print(table)
    console.print()
    console.print("[yellow]⚠️  Database connection required[/yellow]")
    console.print()


if __name__ == "__main__":
    material()
