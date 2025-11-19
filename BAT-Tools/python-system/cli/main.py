"""
BAT System CLI - Main Entry Point

Usage:
    bat --help              Show all commands
    bat code --help         Code operations
    bat material --help     Material management
    bat pricing --help      Pricing operations
    bat plan --help         Plan management
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

import click

__version__ = "2.0.0"


@click.group()
@click.version_option(version=__version__, prog_name="BAT System CLI")
@click.pass_context
def cli(ctx):
    """
    BAT System - Command Line Interface

    Build-A-Truss material, pricing, and plan management system.

    \b
    Common Commands:
      bat code parse <code>              Parse a unified code
      bat material list                  List all materials
      bat pricing lookup <sku> <level>   Look up a price
      bat plan list                      List all plans

    \b
    Examples:
      bat code parse "167010100-4085"
      bat material search "2x4"
      bat pricing lookup "2X4-8" "01"
      bat plan create --name "Smith Residence"

    For more information on a command, use:
      bat <command> --help
    """
    # Ensure context object exists
    ctx.ensure_object(dict)


# Import and register subcommands
from bat_system_v2.cli.code_cli import code
from bat_system_v2.cli.material_cli import material
from bat_system_v2.cli.pricing_cli import pricing
from bat_system_v2.cli.plan_cli import plan

cli.add_command(code)
cli.add_command(material)
cli.add_command(pricing)
cli.add_command(plan)


if __name__ == "__main__":
    cli(obj={})
