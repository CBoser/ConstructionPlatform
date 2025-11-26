#!/usr/bin/env python3
"""
Launcher script for Spreadsheet Business Logic Extractor.
Run this file to start the application.
"""

import sys
import os

# Add the tool directory to path
tool_dir = os.path.dirname(os.path.abspath(__file__))
if tool_dir not in sys.path:
    sys.path.insert(0, tool_dir)

# Check dependencies
def check_dependencies():
    """Check if required packages are installed."""
    missing = []

    try:
        import openpyxl
    except ImportError:
        missing.append("openpyxl")

    try:
        import tkinter
    except ImportError:
        missing.append("tkinter (python3-tk)")

    if missing:
        print("Missing dependencies:")
        for pkg in missing:
            print(f"  - {pkg}")
        print("\nInstall with: pip install openpyxl")
        if "tkinter" in str(missing):
            print("For tkinter on Linux: sudo apt-get install python3-tk")
        sys.exit(1)


if __name__ == "__main__":
    check_dependencies()

    from gui import main
    main()
