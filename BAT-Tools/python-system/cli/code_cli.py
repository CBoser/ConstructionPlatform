"""
BAT System CLI - Code Commands

Commands for working with unified codes (PPPP-PPP.000-EE-IIII format)
"""

import click
import sys
sys.path.insert(0, '/home/user/ConstructionPlatform')

from bat_system_v2.services.unified_code_parser import UnifiedCodeParser
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich import box


console = Console()
parser = UnifiedCodeParser()


@click.group()
def code():
    """
    Unified code operations (parse, build, validate)

    \b
    Unified Code Format: PPPP-PPP.000-EE-IIII
    Example: 1670-101.000-AB-4085

    \b
    Components:
      PPPP = Plan number (1670)
      PPP  = Phase code (101 = Foundation)
      000  = Padding (reserved)
      EE   = Elevation (AB = A & B sides)
      IIII = Item type (4085 = Hardware)
    """
    pass


@code.command()
@click.argument('raw_code')
def parse(raw_code):
    """
    Parse a unified code (raw or standard format)

    \b
    Examples:
      bat code parse "167010100-4085"
      bat code parse "1670-101.000-AB-4085"
      bat code parse "233620070"

    RAW_CODE: The code to parse (with or without formatting)
    """
    console.print()

    # Parse the code
    parsed = parser.parse(raw_code)

    if not parsed.is_valid:
        console.print(f"[red]❌ Invalid code:[/red] {raw_code}")
        console.print("[yellow]Expected format:[/yellow] PPPP-PPP.000-EE-IIII")
        console.print("[yellow]Example:[/yellow] 1670-101.000-AB-4085")
        sys.exit(1)

    # Create display panel
    pack_name = parser.get_pack_name(parsed.phase)
    pack_info = f"{parsed.phase} ({pack_name})" if pack_name else parsed.phase

    item_category = parser.get_item_category(parsed.item_type)
    item_info = f"{parsed.item_type} ({item_category})"

    # Build content
    content = f"""[bold cyan]Unified Code:[/bold cyan] [green]{parsed.full_code}[/green]

[bold]Components:[/bold]
  [cyan]Plan:[/cyan]      {parsed.plan}
  [cyan]Phase:[/cyan]     {pack_info}
  [cyan]Elevation:[/cyan] {parsed.elevation}
  [cyan]Item Type:[/cyan] {item_info}

[bold]Status:[/bold] [green]✅ Valid[/green]"""

    panel = Panel(
        content,
        title="[bold blue]Parsed Unified Code[/bold blue]",
        border_style="blue",
        box=box.ROUNDED
    )

    console.print(panel)
    console.print()


@code.command()
@click.option('--plan', '-p', required=True, type=int, help='Plan number (e.g., 1670)')
@click.option('--phase', '-ph', required=True, type=int, help='Phase code (e.g., 101 for Foundation)')
@click.option('--elevation', '-e', default='00', help='Elevation code (e.g., AB, CD, 00)')
@click.option('--item', '-i', default=9000, type=int, help='Item type code (e.g., 4085)')
def build(plan, phase, elevation, item):
    """
    Build a unified code from components

    \b
    Examples:
      bat code build --plan 1670 --phase 101
      bat code build -p 1670 -ph 101 -e AB -i 4085
      bat code build --plan 2336 --phase 200 --elevation CD --item 2085

    Builds a unified code in format: PPPP-PPP.000-EE-IIII
    """
    console.print()

    # Build the code
    built_code = parser.build(
        plan=plan,
        phase=phase,
        elevation=elevation,
        item_type=item
    )

    # Get metadata
    pack_name = parser.get_pack_name(str(phase).zfill(3))
    pack_info = f"{phase:03d} ({pack_name})" if pack_name else f"{phase:03d}"

    item_category = parser.get_item_category(str(item).zfill(4))

    # Create display table
    table = Table(title="Built Unified Code", box=box.ROUNDED, border_style="green")
    table.add_column("Component", style="cyan", no_wrap=True)
    table.add_column("Value", style="white")
    table.add_column("Description", style="dim")

    table.add_row("Plan", str(plan).zfill(4), "Plan number")
    table.add_row("Phase", pack_info, "Phase/pack code")
    table.add_row("Elevation", elevation, "Elevation code")
    table.add_row("Item Type", f"{item:04d} ({item_category})", "Item category")
    table.add_row("", "", "")
    table.add_row("[bold]Generated Code[/bold]", f"[bold green]{built_code}[/bold green]", "")

    console.print(table)
    console.print()

    # Show copyable version
    console.print(f"[dim]Copyable:[/dim] {built_code}")
    console.print()


@code.command()
@click.argument('code_to_validate')
def validate(code_to_validate):
    """
    Validate a unified code format

    \b
    Examples:
      bat code validate "1670-101.000-AB-4085"
      bat code validate "invalid-code"

    CODE_TO_VALIDATE: The code to validate
    """
    console.print()

    is_valid = parser.validate(code_to_validate)

    if is_valid:
        console.print(f"[green]✅ Valid:[/green] {code_to_validate}")
        console.print("[dim]Format: PPPP-PPP.000-EE-IIII[/dim]")

        # Parse and show components
        parsed = parser.parse(code_to_validate)
        console.print()
        console.print(f"[cyan]Plan:[/cyan]      {parsed.plan}")
        console.print(f"[cyan]Phase:[/cyan]     {parsed.phase}")
        console.print(f"[cyan]Elevation:[/cyan] {parsed.elevation}")
        console.print(f"[cyan]Item Type:[/cyan] {parsed.item_type}")
    else:
        console.print(f"[red]❌ Invalid:[/red] {code_to_validate}")
        console.print()
        console.print("[yellow]Expected format:[/yellow] PPPP-PPP.000-EE-IIII")
        console.print("[yellow]Example:[/yellow] 1670-101.000-AB-4085")
        console.print()
        console.print("[dim]Components:[/dim]")
        console.print("  [dim]PPPP[/dim] - 4 digit plan number")
        console.print("  [dim]PPP[/dim]  - 3 digit phase code")
        console.print("  [dim]000[/dim]  - Padding (always 000)")
        console.print("  [dim]EE[/dim]   - 2 character elevation")
        console.print("  [dim]IIII[/dim] - 4 digit item type")
        sys.exit(1)

    console.print()


@code.command()
def packs():
    """
    List all pack/phase codes

    Shows available pack codes for use in unified codes
    """
    console.print()

    # Create table
    table = Table(title="Pack/Phase Codes", box=box.ROUNDED, border_style="cyan")
    table.add_column("Code", style="cyan", no_wrap=True)
    table.add_column("Pack Name", style="white")
    table.add_column("Example", style="dim")

    # Add all pack codes
    for code, name in sorted(parser.PACK_CODES.items()):
        example = parser.build(plan=1670, phase=int(code), elevation="AB", item_type=4085)
        table.add_row(code, name, example)

    console.print(table)
    console.print()
    console.print(f"[dim]Total packs:[/dim] {len(parser.PACK_CODES)}")
    console.print()


@code.command()
def categories():
    """
    List all item type categories

    Shows item type ranges and their categories
    """
    console.print()

    # Create table
    table = Table(title="Item Type Categories", box=box.ROUNDED, border_style="cyan")
    table.add_column("Range", style="cyan", no_wrap=True)
    table.add_column("Category", style="white")
    table.add_column("Example", style="dim")

    # Add categories
    categories_data = [
        ("1000-1999", "Lumber (structural)", "Beams, headers, joists"),
        ("2000-2999", "Lumber (framing)", "Studs, plates"),
        ("3000-3999", "Lumber (trim)", "Trim boards, molding"),
        ("4000-4999", "Hardware/Fasteners", "Nails, bolts, anchors"),
        ("5000-5999", "Panels/Sheathing", "Plywood, OSB"),
        ("6000-6999", "Doors/Windows", "Entry doors, windows"),
        ("7000-7999", "Roofing", "Shingles, felt, vents"),
        ("8000-8999", "Misc Materials", "Insulation, caulk"),
        ("9000-9999", "Unclassified", "Default category"),
    ]

    for range_str, category, example in categories_data:
        table.add_row(range_str, category, example)

    console.print(table)
    console.print()
    console.print("[dim]Tip:[/dim] Use first digit to identify category (e.g., 4085 = 4xxx = Hardware)")
    console.print()


if __name__ == "__main__":
    code()
