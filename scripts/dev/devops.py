#!/usr/bin/env python3
"""
MindFlow Platform - DevOps Management Tool
==========================================
Interactive CLI tool for managing development operations

Features:
- Database management (start/stop/reset)
- Server management (backend/frontend)
- Testing and health checks
- Security utilities
- Log viewing
- Environment management

Usage:
    python devops.py
    # or make executable: chmod +x devops.py && ./devops.py
"""

import os
import sys
import subprocess
import time
import json
import platform
from pathlib import Path
from typing import Optional, List, Tuple

# ============================================================================
# Configuration
# ============================================================================

# Detect if running on Windows or Unix
IS_WINDOWS = platform.system() == "Windows"
IS_WSL = "microsoft" in platform.uname().release.lower()

# Project paths (devops.py is in scripts/dev/ subdirectory)
PROJECT_ROOT = Path(__file__).parent.parent.parent  # Go up two levels from scripts/dev/
BACKEND_DIR = PROJECT_ROOT / "backend"
FRONTEND_DIR = PROJECT_ROOT / "frontend"
DOCKER_COMPOSE_FILE = PROJECT_ROOT / "docker-compose.yml"

# Color codes (ANSI)
class Colors:
    if IS_WINDOWS:
        # Enable ANSI colors on Windows
        os.system("")

    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

    @staticmethod
    def disable():
        Colors.HEADER = ''
        Colors.BLUE = ''
        Colors.CYAN = ''
        Colors.GREEN = ''
        Colors.YELLOW = ''
        Colors.RED = ''
        Colors.ENDC = ''
        Colors.BOLD = ''
        Colors.UNDERLINE = ''


# ============================================================================
# Utility Functions
# ============================================================================

def print_header(text: str):
    """Print a styled header"""
    print(f"\n{Colors.HEADER}{'=' * 70}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(70)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{'=' * 70}{Colors.ENDC}\n")


def print_success(text: str):
    """Print success message"""
    print(f"{Colors.GREEN}✅ {text}{Colors.ENDC}")


def print_error(text: str):
    """Print error message"""
    print(f"{Colors.RED}❌ {text}{Colors.ENDC}")


def print_warning(text: str):
    """Print warning message"""
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.ENDC}")


def print_info(text: str):
    """Print info message"""
    print(f"{Colors.CYAN}ℹ️  {text}{Colors.ENDC}")


def run_command(cmd: str, cwd: Optional[Path] = None, shell: bool = True,
                capture: bool = False, check: bool = True) -> Tuple[int, str, str]:
    """
    Run a shell command

    Args:
        cmd: Command to run
        cwd: Working directory
        shell: Use shell
        capture: Capture output
        check: Raise error on failure

    Returns:
        Tuple of (returncode, stdout, stderr)
    """
    try:
        if capture:
            result = subprocess.run(
                cmd,
                cwd=cwd,
                shell=shell,
                capture_output=True,
                text=True,
                check=check
            )
            return result.returncode, result.stdout, result.stderr
        else:
            result = subprocess.run(
                cmd,
                cwd=cwd,
                shell=shell,
                check=check
            )
            return result.returncode, "", ""
    except subprocess.CalledProcessError as e:
        if not check:
            return e.returncode, e.stdout if hasattr(e, 'stdout') else "", e.stderr if hasattr(e, 'stderr') else ""
        raise


def is_command_available(command: str) -> bool:
    """Check if a command is available"""
    try:
        if IS_WINDOWS:
            run_command(f"where {command}", capture=True, check=False)
        else:
            run_command(f"which {command}", capture=True, check=False)
        return True
    except:
        return False


def is_port_in_use(port: int) -> bool:
    """Check if a port is in use"""
    try:
        if IS_WINDOWS:
            code, stdout, _ = run_command(f"netstat -an | findstr :{port}", capture=True, check=False)
        else:
            code, stdout, _ = run_command(f"lsof -i :{port}", capture=True, check=False)
        return code == 0 and len(stdout.strip()) > 0
    except:
        return False


def wait_for_user():
    """Wait for user to press Enter"""
    input(f"\n{Colors.CYAN}Press Enter to continue...{Colors.ENDC}")


# ============================================================================
# System Checks
# ============================================================================

def check_prerequisites():
    """Check if all required tools are installed"""
    print_header("System Prerequisites Check")

    checks = {
        "Node.js": "node",
        "npm": "npm",
        "Docker": "docker",
        "Git": "git",
        "Python": "python" if IS_WINDOWS else "python3",
    }

    all_good = True
    for name, cmd in checks.items():
        if is_command_available(cmd):
            code, stdout, _ = run_command(f"{cmd} --version", capture=True, check=False)
            version = stdout.strip().split('\n')[0] if stdout else "installed"
            print_success(f"{name}: {version}")
        else:
            print_error(f"{name}: Not found")
            all_good = False

    print()

    # Check Docker is running
    if is_command_available("docker"):
        code, _, _ = run_command("docker ps", capture=True, check=False)
        if code == 0:
            print_success("Docker is running")
        else:
            print_warning("Docker is installed but not running")
            all_good = False

    return all_good


def check_environment():
    """Check environment configuration"""
    print_header("Environment Configuration Check")

    env_file = BACKEND_DIR / ".env"

    if env_file.exists():
        print_success(f".env file exists: {env_file}")

        # Check important env vars
        with open(env_file) as f:
            content = f.read()

        checks = {
            "DATABASE_URL": "postgresql://",
            "JWT_SECRET": "your-secret-key-here-change-in-production",
            "SEED_USER_PASSWORD": "DevPassword123!",
        }

        for var, expected in checks.items():
            if var in content:
                if expected in content:
                    print_warning(f"{var} is using default value (OK for development)")
                else:
                    print_success(f"{var} is configured")
            else:
                print_error(f"{var} is missing")
    else:
        print_error(f".env file not found: {env_file}")
        print_info("Run option 'E' to create from .env.example")


def check_health():
    """Check service health"""
    print_header("Service Health Check")

    # Check Docker containers
    if is_command_available("docker"):
        print_info("Checking Docker containers...")
        code, stdout, _ = run_command("docker ps --filter name=mindflow", capture=True, check=False)
        if "mindflow-postgres" in stdout:
            print_success("PostgreSQL container is running")
        else:
            print_warning("PostgreSQL container is not running")
        print()

    # Check backend
    print_info("Checking backend server (port 3001)...")
    if is_port_in_use(3001):
        print_success("Backend server is running on port 3001")

        # Try to hit health endpoint
        try:
            import urllib.request
            response = urllib.request.urlopen("http://localhost:3001/health", timeout=2)
            data = json.loads(response.read())
            print_success(f"Health check: {data.get('status', 'unknown')}")
            print_info(f"Database: {data.get('database', 'unknown')}")
        except:
            print_warning("Backend is running but health check failed")
    else:
        print_warning("Backend server is not running")
    print()

    # Check frontend
    print_info("Checking frontend (port 5173)...")
    if is_port_in_use(5173):
        print_success("Frontend is running on port 5173")
    else:
        print_warning("Frontend is not running")


# ============================================================================
# Database Management
# ============================================================================

def db_start():
    """Start PostgreSQL database"""
    print_header("Starting PostgreSQL Database")

    if not DOCKER_COMPOSE_FILE.exists():
        print_error(f"docker-compose.yml not found: {DOCKER_COMPOSE_FILE}")
        return

    print_info("Starting postgres container...")
    code, _, _ = run_command("docker-compose up -d postgres", cwd=PROJECT_ROOT, check=False)

    if code == 0:
        print_success("PostgreSQL container started")
        print_info("Waiting for database to be ready...")
        time.sleep(3)

        # Check if ready
        code, _, _ = run_command(
            "docker exec mindflow-postgres pg_isready -U mindflow",
            capture=True, check=False
        )

        if code == 0:
            print_success("Database is ready!")
            print_info("Connection: postgresql://mindflow:mindflow_dev_password@localhost:5433/mindflow_dev")
        else:
            print_warning("Database started but not ready yet. Please wait a few seconds.")
    else:
        print_error("Failed to start PostgreSQL container")


def db_stop():
    """Stop PostgreSQL database"""
    print_header("Stopping PostgreSQL Database")

    print_info("Stopping postgres container...")
    code, _, _ = run_command("docker-compose stop postgres", cwd=PROJECT_ROOT, check=False)

    if code == 0:
        print_success("PostgreSQL container stopped")
    else:
        print_error("Failed to stop PostgreSQL container")


def db_reset():
    """Reset database (destroy and recreate)"""
    print_header("Reset Database")

    print_warning("This will DELETE all data in the database!")
    confirm = input(f"{Colors.YELLOW}Are you sure? Type 'yes' to confirm: {Colors.ENDC}")

    if confirm.lower() != 'yes':
        print_info("Aborted.")
        return

    print_info("Stopping and removing postgres container...")
    run_command("docker-compose down postgres", cwd=PROJECT_ROOT, check=False)

    print_info("Starting fresh postgres container...")
    run_command("docker-compose up -d postgres", cwd=PROJECT_ROOT, check=False)

    print_info("Waiting for database to be ready...")
    time.sleep(3)

    print_info("Running migrations...")
    run_command("npx prisma migrate deploy", cwd=BACKEND_DIR)

    print_info("Seeding database...")
    run_command("npm run prisma:seed", cwd=BACKEND_DIR)

    print_success("Database reset complete!")


def db_migrate():
    """Run database migrations"""
    print_header("Database Migrations")

    print_info("Running Prisma migrations...")
    run_command("npx prisma migrate deploy", cwd=BACKEND_DIR)
    print_success("Migrations complete!")


def db_seed():
    """Seed database with test data"""
    print_header("Seed Database")

    print_info("Seeding database...")
    run_command("npm run prisma:seed", cwd=BACKEND_DIR)
    print_success("Database seeded!")


def db_studio():
    """Open Prisma Studio"""
    print_header("Prisma Studio")

    print_info("Opening Prisma Studio...")
    print_info("Prisma Studio will open at: http://localhost:5555")
    print_warning("Press Ctrl+C to stop Prisma Studio")

    run_command("npx prisma studio", cwd=BACKEND_DIR, check=False)


# ============================================================================
# Server Management
# ============================================================================

def start_backend():
    """Start backend server"""
    print_header("Starting Backend Server")

    print_info("Checking if backend dependencies are installed...")
    if not (BACKEND_DIR / "node_modules").exists():
        print_warning("Dependencies not found. Installing...")
        run_command("npm install", cwd=BACKEND_DIR)

    print_info("Starting backend server...")
    print_info("Backend will run at: http://localhost:3001")
    print_warning("Press Ctrl+C to stop the server")
    print()

    run_command("npm run dev", cwd=BACKEND_DIR, check=False)


def start_frontend():
    """Start frontend server"""
    print_header("Starting Frontend Server")

    print_info("Checking if frontend dependencies are installed...")
    if not (FRONTEND_DIR / "node_modules").exists():
        print_warning("Dependencies not found. Installing...")
        run_command("npm install", cwd=FRONTEND_DIR)

    print_info("Starting frontend server...")
    print_info("Frontend will run at: http://localhost:5173")
    print_warning("Press Ctrl+C to stop the server")
    print()

    run_command("npm run dev", cwd=FRONTEND_DIR, check=False)


def start_full_stack():
    """Start both backend and frontend"""
    print_header("Starting Full Stack")

    print_info("This will start both backend and frontend servers")
    print_info("Backend: http://localhost:3001")
    print_info("Frontend: http://localhost:5173")
    print_warning("Press Ctrl+C to stop all servers")
    print()

    # Start in root directory which has script for both
    run_command("npm run dev", cwd=PROJECT_ROOT, check=False)


# ============================================================================
# Testing
# ============================================================================

def run_security_tests():
    """Run security tests"""
    print_header("Running Security Tests")

    tests = [
        ("JWT Validation Test", "node test-jwt-validation.js"),
        ("Seed Security Test", "node test-seed-security.js"),
        ("Security Headers Test", "node test-security-headers.js"),
    ]

    for name, cmd in tests:
        print_info(f"Running: {name}")
        code, _, _ = run_command(cmd, cwd=BACKEND_DIR, check=False)
        if code == 0:
            print_success(f"{name} passed!")
        else:
            print_error(f"{name} failed!")
        print()


def test_api():
    """Test API endpoints"""
    print_header("Testing API Endpoints")

    endpoints = [
        ("Health Check", "http://localhost:3001/health"),
        ("Auth Login", "http://localhost:3001/api/auth/login"),
    ]

    import urllib.request
    import urllib.error

    for name, url in endpoints:
        print_info(f"Testing: {name}")
        try:
            response = urllib.request.urlopen(url, timeout=2)
            print_success(f"{name} - Status: {response.status}")
        except urllib.error.HTTPError as e:
            if e.code == 405:
                print_warning(f"{name} - Endpoint exists but method not allowed (expected)")
            else:
                print_error(f"{name} - HTTP {e.code}")
        except Exception as e:
            print_error(f"{name} - {str(e)}")
        print()


# ============================================================================
# Utilities
# ============================================================================

def generate_jwt_secret():
    """Generate a secure JWT secret"""
    print_header("Generate JWT Secret")

    import secrets

    secret = secrets.token_hex(32)

    print_success("Generated secure JWT secret (64 characters):")
    print(f"\n{Colors.GREEN}{secret}{Colors.ENDC}\n")
    print_info("Add this to your .env file:")
    print(f"JWT_SECRET={secret}")
    print()


def view_logs():
    """View Docker logs"""
    print_header("Docker Logs")

    print_info("Viewing logs for mindflow-postgres container...")
    print_warning("Press Ctrl+C to stop viewing logs")
    print()

    run_command("docker logs -f mindflow-postgres", check=False)


def install_dependencies():
    """Install all dependencies"""
    print_header("Installing Dependencies")

    print_info("Installing backend dependencies...")
    run_command("npm install", cwd=BACKEND_DIR)
    print_success("Backend dependencies installed")
    print()

    print_info("Installing frontend dependencies...")
    run_command("npm install", cwd=FRONTEND_DIR)
    print_success("Frontend dependencies installed")
    print()


def create_env_file():
    """Create .env file from .env.example"""
    print_header("Create Environment File")

    env_file = BACKEND_DIR / ".env"
    example_file = BACKEND_DIR / ".env.example"

    if env_file.exists():
        print_warning(".env file already exists")
        overwrite = input(f"{Colors.YELLOW}Overwrite? (yes/no): {Colors.ENDC}")
        if overwrite.lower() != 'yes':
            print_info("Aborted.")
            return

    if example_file.exists():
        import shutil
        shutil.copy(example_file, env_file)
        print_success(f"Created .env file: {env_file}")
        print_info("Default values from .env.example have been copied")
        print_warning("Remember to update JWT_SECRET for production!")
    else:
        print_error(f".env.example not found: {example_file}")


def generate_folder_tree():
    """Generate a folder tree of the project structure"""
    print_header("Generate Folder Tree")

    output_file = PROJECT_ROOT / "archive" / "snapshots" / f"FolderTree_{time.strftime('%Y%m%d_%H%M%S')}.txt"

    print_info(f"Generating folder tree...")
    print_info(f"Output: {output_file.relative_to(PROJECT_ROOT)}")

    # Directories and files to exclude
    exclude_dirs = {
        'node_modules', '.git', 'dist', 'build', '__pycache__',
        '.next', '.vscode', '.idea', 'coverage', '.pytest_cache'
    }

    def should_exclude(path):
        """Check if path should be excluded"""
        parts = Path(path).parts
        return any(excluded in parts for excluded in exclude_dirs)

    def generate_tree(directory, prefix="", is_last=True, output_lines=None):
        """Recursively generate tree structure"""
        if output_lines is None:
            output_lines = []

        directory = Path(directory)
        if should_exclude(directory):
            return output_lines

        # Get directory name
        dir_name = directory.name if directory != PROJECT_ROOT else "ConstructionPlatform"

        # Add current directory
        connector = "└── " if is_last else "├── "
        output_lines.append(f"{prefix}{connector}{dir_name}/")

        # Prepare prefix for children
        extension = "    " if is_last else "│   "
        new_prefix = prefix + extension

        try:
            # Get all items (directories first, then files)
            items = sorted(directory.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower()))
            items = [item for item in items if not should_exclude(item)]

            # Process directories
            dirs = [item for item in items if item.is_dir()]
            files = [item for item in items if item.is_file()]

            # Render directories
            for i, item in enumerate(dirs):
                is_last_item = (i == len(dirs) - 1) and len(files) == 0
                generate_tree(item, new_prefix, is_last_item, output_lines)

            # Render files
            for i, item in enumerate(files):
                is_last_item = i == len(files) - 1
                connector = "└── " if is_last_item else "├── "
                output_lines.append(f"{new_prefix}{connector}{item.name}")

        except PermissionError:
            output_lines.append(f"{new_prefix}[Permission Denied]")

        return output_lines

    try:
        # Generate tree
        lines = ["# MindFlow Platform - Folder Structure"]
        lines.append(f"# Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        lines.append(f"# Excludes: {', '.join(sorted(exclude_dirs))}")
        lines.append("")
        lines.extend(generate_tree(PROJECT_ROOT))

        # Create output directory if needed
        output_file.parent.mkdir(parents=True, exist_ok=True)

        # Write to file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))

        print_success(f"Folder tree generated: {len(lines)} lines")
        print_info(f"Saved to: {output_file.relative_to(PROJECT_ROOT)}")
        print()

        # Show preview (first 30 lines)
        print_info("Preview (first 30 lines):")
        print(f"{Colors.CYAN}", end='')
        for line in lines[:30]:
            print(line)
        if len(lines) > 30:
            print(f"... ({len(lines) - 30} more lines)")
        print(f"{Colors.ENDC}")

    except Exception as e:
        print_error(f"Failed to generate folder tree: {e}")


# ============================================================================
# Main Menu
# ============================================================================

def print_menu():
    """Print the main menu"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}")
    print("╔════════════════════════════════════════════════════════════════════╗")
    print("║         MindFlow Platform - DevOps Management Tool                 ║")
    print("╚════════════════════════════════════════════════════════════════════╝")
    print(f"{Colors.ENDC}")

    print(f"{Colors.CYAN}📊 System & Health{Colors.ENDC}")
    print("  1. Check Prerequisites")
    print("  2. Check Environment Configuration")
    print("  3. Check Service Health")

    print(f"\n{Colors.CYAN}🗄️  Database Management{Colors.ENDC}")
    print("  4. Start PostgreSQL")
    print("  5. Stop PostgreSQL")
    print("  6. Reset Database (delete all data)")
    print("  7. Run Migrations")
    print("  8. Seed Database")
    print("  9. Open Prisma Studio")

    print(f"\n{Colors.CYAN}🚀 Server Management{Colors.ENDC}")
    print("  B. Start Backend Server")
    print("  F. Start Frontend Server")
    print("  A. Start Full Stack (Both)")

    print(f"\n{Colors.CYAN}🧪 Testing{Colors.ENDC}")
    print("  T. Run Security Tests")
    print("  H. Test API Health")

    print(f"\n{Colors.CYAN}🔧 Utilities{Colors.ENDC}")
    print("  J. Generate JWT Secret")
    print("  L. View Docker Logs")
    print("  I. Install Dependencies")
    print("  E. Create .env File")
    print("  P. Generate Project Tree")

    print(f"\n{Colors.CYAN}📖 Quick Actions{Colors.ENDC}")
    print("  Q. Quick Start (DB + Backend + Frontend)")
    print("  R. Full Reset (DB + Dependencies)")

    print(f"\n{Colors.RED}X. Exit{Colors.ENDC}\n")


def quick_start():
    """Quick start - start everything"""
    print_header("Quick Start - Full Platform Launch")

    print_info("Step 1/5: Starting PostgreSQL...")
    db_start()
    print()

    print_info("Step 2/5: Running migrations...")
    db_migrate()
    print()

    print_info("Step 3/5: Seeding database...")
    db_seed()
    print()

    print_info("Step 4/5: Installing dependencies...")
    install_dependencies()
    print()

    print_info("Step 5/5: Starting servers...")
    print_success("Quick start setup complete!")
    print()
    print_info("Now starting full stack...")
    print_warning("Press Ctrl+C to stop all servers")
    print()
    time.sleep(2)

    start_full_stack()


def full_reset():
    """Full reset - reset everything"""
    print_header("Full Reset - Complete Platform Reset")

    print_warning("This will:")
    print("  - Delete all database data")
    print("  - Remove all node_modules")
    print("  - Reinstall all dependencies")
    print("  - Reset database with fresh seed data")
    print()

    confirm = input(f"{Colors.YELLOW}Are you sure? Type 'yes' to confirm: {Colors.ENDC}")

    if confirm.lower() != 'yes':
        print_info("Aborted.")
        return

    print_info("Step 1/5: Resetting database...")
    db_reset()
    print()

    print_info("Step 2/5: Removing backend node_modules...")
    if (BACKEND_DIR / "node_modules").exists():
        import shutil
        shutil.rmtree(BACKEND_DIR / "node_modules")
        print_success("Removed backend node_modules")
    print()

    print_info("Step 3/5: Removing frontend node_modules...")
    if (FRONTEND_DIR / "node_modules").exists():
        import shutil
        shutil.rmtree(FRONTEND_DIR / "node_modules")
        print_success("Removed frontend node_modules")
    print()

    print_info("Step 4/5: Installing dependencies...")
    install_dependencies()
    print()

    print_success("Full reset complete!")


def main():
    """Main menu loop"""

    # Initial greeting
    print_header("Welcome to MindFlow DevOps Tool")
    print_info("Sprint 1 - Security Foundation")
    print_info(f"Platform: {platform.system()} ({platform.machine()})")
    print_info(f"Python: {sys.version.split()[0]}")

    while True:
        try:
            print_menu()
            choice = input(f"{Colors.BOLD}Select an option: {Colors.ENDC}").strip().upper()

            if choice == '1':
                check_prerequisites()
                wait_for_user()
            elif choice == '2':
                check_environment()
                wait_for_user()
            elif choice == '3':
                check_health()
                wait_for_user()
            elif choice == '4':
                db_start()
                wait_for_user()
            elif choice == '5':
                db_stop()
                wait_for_user()
            elif choice == '6':
                db_reset()
                wait_for_user()
            elif choice == '7':
                db_migrate()
                wait_for_user()
            elif choice == '8':
                db_seed()
                wait_for_user()
            elif choice == '9':
                db_studio()
                wait_for_user()
            elif choice == 'B':
                start_backend()
                wait_for_user()
            elif choice == 'F':
                start_frontend()
                wait_for_user()
            elif choice == 'A':
                start_full_stack()
                wait_for_user()
            elif choice == 'T':
                run_security_tests()
                wait_for_user()
            elif choice == 'H':
                test_api()
                wait_for_user()
            elif choice == 'J':
                generate_jwt_secret()
                wait_for_user()
            elif choice == 'L':
                view_logs()
                wait_for_user()
            elif choice == 'I':
                install_dependencies()
                wait_for_user()
            elif choice == 'E':
                create_env_file()
                wait_for_user()
            elif choice == 'P':
                generate_folder_tree()
                wait_for_user()
            elif choice == 'Q':
                quick_start()
                wait_for_user()
            elif choice == 'R':
                full_reset()
                wait_for_user()
            elif choice == 'X':
                print_info("Goodbye!")
                break
            else:
                print_error("Invalid option. Please try again.")
                time.sleep(1)

        except KeyboardInterrupt:
            print(f"\n\n{Colors.YELLOW}Operation cancelled by user{Colors.ENDC}")
            wait_for_user()
        except Exception as e:
            print_error(f"Error: {str(e)}")
            import traceback
            traceback.print_exc()
            wait_for_user()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Exiting...{Colors.ENDC}")
        sys.exit(0)
