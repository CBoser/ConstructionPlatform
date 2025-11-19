"""
BAT System CLI - Plan Commands

Commands for managing construction plans (create, list, show, calculate)
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
def plan():
    """
    Plan management (create, list, show, calculate)

    \b
    Plans contain materials needed for construction projects.
    Each plan has phases (foundation, walls, roof, etc.) and materials.

    \b
    Examples:
      bat plan list
      bat plan create --name "Smith Residence"
      bat plan show 123
      bat plan calculate 123
    """
    pass


@plan.command()
@click.option('--limit', '-l', default=20, help='Number of plans to show')
@click.option('--status', '-s', help='Filter by status (active/inactive)')
def list(limit, status):
    """
    List all plans

    \b
    Examples:
      bat plan list
      bat plan list --limit 50
      bat plan list --status active

    Shows plan number, name, customer, and status
    """
    console.print()
    console.print(f"[cyan]Loading plans...[/cyan] (limit: {limit})")

    if status:
        console.print(f"[dim]Filter: status={status}[/dim]")

    console.print()

    # Example plans list
    table = Table(title="Construction Plans", box=box.ROUNDED, border_style="cyan")
    table.add_column("Plan #", style="cyan", no_wrap=True)
    table.add_column("Name", style="white")
    table.add_column("Customer", style="dim")
    table.add_column("Materials", justify="right")
    table.add_column("Total", justify="right")
    table.add_column("Status", style="green")

    # Example data (would query database)
    example_plans = [
        ("1670", "Smith Residence", "John Smith", "279", "$45,230", "Active"),
        ("2336", "Johnson Home", "Sarah Johnson", "308", "$52,100", "Active"),
        ("1890", "Williams Build", "Mike Williams", "283", "$41,500", "Draft"),
    ]

    for plan_num, name, customer, materials, total, status in example_plans:
        table.add_row(plan_num, name, customer, materials, total, status)

    console.print(table)
    console.print()
    console.print(f"[dim]Showing {len(example_plans)} of {len(example_plans)} plans[/dim]")
    console.print()
    console.print("[yellow]⚠️  Database connection required[/yellow]")
    console.print()


@plan.command()
@click.option('--name', '-n', required=True, help='Plan name')
@click.option('--customer', '-c', help='Customer name')
@click.option('--plan-number', '-p', help='Plan number (e.g., 1670)')
def create(name, customer, plan_number):
    """
    Create a new plan

    \b
    Examples:
      bat plan create --name "Smith Residence"
      bat plan create -n "Jones Home" -c "Bob Jones" -p 1670

    Creates an empty plan that you can add materials to
    """
    console.print()
    console.print("[bold cyan]Creating New Plan[/bold cyan]")
    console.print()

    # Show plan details
    table = Table(box=box.SIMPLE, show_header=False)
    table.add_column("Field", style="cyan")
    table.add_column("Value", style="white")

    table.add_row("Name", name)
    if customer:
        table.add_row("Customer", customer)
    if plan_number:
        table.add_row("Plan Number", plan_number)
    table.add_row("Status", "Draft")

    console.print(table)
    console.print()

    if click.confirm("Create this plan?", default=True):
        console.print("[yellow]⚠️  Database connection required[/yellow]")
        console.print("[dim]PlanService.create() method needs to be implemented[/dim]")
        console.print()
        console.print("[green]✅ Plan would be created with ID: 123 (example)[/green]")
        console.print()
        console.print("[dim]Next steps:[/dim]")
        console.print("  1. bat plan add-item 123 --sku '2X4-8' --qty 100")
        console.print("  2. bat plan calculate 123")
        console.print("  3. bat plan export 123 --output plan.xlsx")
    else:
        console.print("[yellow]Cancelled[/yellow]")

    console.print()


@plan.command()
@click.argument('plan_id')
def show(plan_id):
    """
    Show detailed information about a plan

    \b
    Examples:
      bat plan show 123
      bat plan show 1670

    Displays plan details, materials, and totals

    PLAN_ID: Plan ID or number
    """
    console.print()
    console.print(f"[cyan]Loading plan:[/cyan] {plan_id}")
    console.print()

    # Example plan details
    content = f"""[bold]Plan #:[/bold] {plan_id}
[bold]Name:[/bold] Smith Residence
[bold]Customer:[/bold] John Smith
[bold]Status:[/bold] Active

[bold cyan]Summary:[/bold cyan]
  Materials: 279 items
  Total Sell: $45,230.00
  Total Cost: $34,180.00
  Margin: $11,050.00 (24.4%)

[bold cyan]Phases:[/bold cyan]
  Foundation (101):    45 items, $8,500
  Main Walls (200):    120 items, $18,200
  Roof Framing (300):  85 items, $14,100
  Other:               29 items, $4,430

[bold]Created:[/bold] 2025-11-01
[bold]Updated:[/bold] 2025-11-16"""

    panel = Panel(
        content,
        title=f"[bold blue]Plan Details: {plan_id}[/bold blue]",
        border_style="blue",
        box=box.ROUNDED
    )

    console.print(panel)
    console.print()
    console.print("[dim]Commands:[/dim]")
    console.print(f"  bat plan calculate {plan_id}     - Recalculate totals")
    console.print(f"  bat plan export {plan_id}        - Export to Excel")
    console.print(f"  bat plan materials {plan_id}     - List all materials")
    console.print()
    console.print("[yellow]⚠️  Database connection required[/yellow]")
    console.print()


@plan.command()
@click.argument('plan_id')
def calculate(plan_id):
    """
    Calculate totals for a plan

    \b
    Examples:
      bat plan calculate 123
      bat plan calculate 1670

    Sums all materials and shows total sell, cost, and margin

    PLAN_ID: Plan ID or number
    """
    console.print()
    console.print(f"[cyan]Calculating totals for plan:[/cyan] {plan_id}")
    console.print()

    # Example calculation (would query database and sum)
    table = Table(title=f"Plan {plan_id}: Totals", box=box.ROUNDED, border_style="green")
    table.add_column("Metric", style="cyan")
    table.add_column("Value", style="white", justify="right")

    table.add_row("Total Items", "279")
    table.add_row("", "")
    table.add_row("[bold]Total Sell[/bold]", "[bold green]$45,230.00[/bold green]")
    table.add_row("[bold]Total Cost[/bold]", "[bold yellow]$34,180.00[/bold yellow]")
    table.add_row("", "")
    table.add_row("[bold]Margin ($)[/bold]", "[bold blue]$11,050.00[/bold blue]")
    table.add_row("[bold]Margin (%)[/bold]", "[bold blue]24.4%[/bold blue]")

    console.print(table)
    console.print()
    console.print("[dim]Breakdown by phase:[/dim]")

    # Phase breakdown
    phase_table = Table(box=box.SIMPLE)
    phase_table.add_column("Phase", style="cyan")
    phase_table.add_column("Items", justify="right")
    phase_table.add_column("Total", justify="right", style="green")

    phases = [
        ("Foundation (101)", "45", "$8,500.00"),
        ("Main Walls (200)", "120", "$18,200.00"),
        ("Roof Framing (300)", "85", "$14,100.00"),
        ("Exterior Trim (400)", "20", "$3,200.00"),
        ("Other", "9", "$1,230.00"),
    ]

    for phase, items, total in phases:
        phase_table.add_row(phase, items, total)

    console.print(phase_table)
    console.print()
    console.print("[yellow]⚠️  Database connection required[/yellow]")
    console.print()


@plan.command()
@click.argument('plan_id')
def materials(plan_id):
    """
    List all materials in a plan

    \b
    Examples:
      bat plan materials 123
      bat plan materials 1670

    Shows all materials with quantities and totals

    PLAN_ID: Plan ID or number
    """
    console.print()
    console.print(f"[cyan]Materials in plan:[/cyan] {plan_id}")
    console.print()

    # Example materials list
    table = Table(title=f"Plan {plan_id}: Materials", box=box.ROUNDED, border_style="cyan")
    table.add_column("SKU", style="cyan", no_wrap=True)
    table.add_column("Description", style="white")
    table.add_column("Qty", justify="right")
    table.add_column("Price", justify="right")
    table.add_column("Total", justify="right", style="green")
    table.add_column("Phase", style="dim")

    # Example data
    materials = [
        ("2X4-8", "2x4 Stud 8ft", "100", "$4.99", "$499.00", "Foundation"),
        ("2X6-8", "2x6 Stud 8ft", "50", "$7.99", "$399.50", "Main Walls"),
        ("PLY-4X8", "Plywood 4x8", "25", "$35.50", "$887.50", "Roof"),
        ("NAIL-16D", "16d Nails 50lb", "5", "$45.00", "$225.00", "General"),
    ]

    for sku, desc, qty, price, total, phase in materials:
        table.add_row(sku, desc, qty, price, total, phase)

    console.print(table)
    console.print()
    console.print(f"[dim]Showing 4 of 279 materials[/dim]")
    console.print()
    console.print("[yellow]⚠️  Database connection required[/yellow]")
    console.print()


@plan.command()
@click.argument('plan_id')
@click.option('--output', '-o', help='Output file path')
@click.option('--format', '-f', type=click.Choice(['xlsx', 'pdf', 'csv']), default='xlsx', help='Export format')
def export(plan_id, output, format):
    """
    Export plan to Excel, PDF, or CSV

    \b
    Examples:
      bat plan export 123 --output smith_plan.xlsx
      bat plan export 1670 -o plan.pdf -f pdf
      bat plan export 123 -o materials.csv -f csv

    \b
    Arguments:
      PLAN_ID: Plan ID or number

    \b
    Formats:
      xlsx - Excel workbook (default)
      pdf  - PDF report
      csv  - CSV file (materials list)
    """
    console.print()
    console.print(f"[cyan]Exporting plan:[/cyan] {plan_id}")
    console.print(f"[cyan]Format:[/cyan] {format.upper()}")

    if output:
        console.print(f"[cyan]Output:[/cyan] {output}")
    else:
        output = f"plan_{plan_id}.{format}"
        console.print(f"[cyan]Output:[/cyan] {output} (auto-generated)")

    console.print()
    console.print("[yellow]⚠️  Export functionality not yet implemented[/yellow]")
    console.print()
    console.print("[dim]Would create:[/dim]")

    if format == 'xlsx':
        console.print("  📄 Excel workbook with:")
        console.print("     - Summary sheet (plan details, totals)")
        console.print("     - Materials sheet (all items)")
        console.print("     - Phase breakdown sheets")
        console.print("     - Cost analysis")
    elif format == 'pdf':
        console.print("  📄 PDF report with:")
        console.print("     - Cover page (plan info)")
        console.print("     - Materials list")
        console.print("     - Cost breakdown")
        console.print("     - Charts and graphs")
    else:  # csv
        console.print("  📄 CSV file with:")
        console.print("     - SKU, Description, Qty, Price, Total")
        console.print("     - One row per material")

    console.print()


if __name__ == "__main__":
    plan()
