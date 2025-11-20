"""
BAT System CLI Setup

Install the bat command-line tool:
    pip install -e .

Usage after install:
    bat --help
    bat code parse "167010100-4085"
    bat material list
    bat pricing lookup "2X4-8" "01"
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="bat-system",
    version="2.0.0",
    author="Construction Platform Team",
    description="BAT (Build-A-Truss) System - Material, pricing, and plan management",
    long_description=long_description,
    long_description_content_type="text/markdown",
    packages=find_packages(),
    python_requires=">=3.9",
    install_requires=[
        "click>=8.1.7",
        "rich>=13.7.0",
        "sqlalchemy>=2.0.0",
        "pydantic>=2.5.0",
        "psycopg2-binary>=2.9.9",
        "openpyxl>=3.1.2",
    ],
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "pytest-cov>=4.1.0",
            "black>=23.12.0",
            "mypy>=1.7.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "bat=bat_system_v2.cli.main:cli",
        ],
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Build Tools",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
)
