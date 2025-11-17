#!/usr/bin/env python3
"""
Interactive menu wrapper for the Engineering Change Impact Report tool.

This script provides a simple command‑line menu that allows users to
generate Engineering Change Impact Reports without specifying
command‑line arguments. It is designed to be run in a terminal or
PowerShell session where a user prefers a prompt‑driven workflow.

The menu offers options to generate a report by entering the paths to
the "before" and "after" CSV files and specifying an output Excel file.
It also allows the user to exit the program. The actual report
generation is performed by calling the `generate_report` function from
`ecir_tool.py`.

Usage:
    python ecir_menu.py

Note: This script assumes that `ecir_tool.py` is located in the same
directory or is available on the Python module search path.
"""

import os
import sys

try:
    # Import the generate_report function from ecir_tool
    from ecir_tool import generate_report  # type: ignore
except ImportError as exc:
    print(
        "Error: Could not import generate_report from ecir_tool.\n"
        "Ensure that ecir_tool.py is in the same directory or on the PYTHONPATH.\n",
        file=sys.stderr,
    )
    raise


def prompt_path(prompt: str) -> str:
    """Prompt the user for a file path and return the trimmed input."""
    return input(prompt).strip().strip('"').strip("'")


def main() -> None:
    """Run the interactive menu loop."""
    print("Engineering Change Impact Report (ECIR) Menu")
    while True:
        print("\nPlease select an option:")
        print("1. Generate ECIR report from CSV files")
        print("2. Exit")
        choice = input("Enter choice (1/2): ").strip()

        if choice == "1":
            # Prompt user for file paths
            before_path = prompt_path("Enter path to BEFORE CSV file: ")
            after_path = prompt_path("Enter path to AFTER CSV file: ")
            output_path = prompt_path(
                "Enter path for output Excel file (e.g., report.xlsx): "
            )
            # Expand environment variables and user tilde if present
            before_path = os.path.expanduser(os.path.expandvars(before_path))
            after_path = os.path.expanduser(os.path.expandvars(after_path))
            output_path = os.path.expanduser(os.path.expandvars(output_path))
            try:
                generate_report(before_path, after_path, output_path)
            except Exception as e:
                print(f"Error: {e}")
        elif choice == "2":
            print("Exiting ECIR tool. Goodbye!")
            break
        else:
            print("Invalid choice. Please enter 1 or 2.")


if __name__ == "__main__":
    main()