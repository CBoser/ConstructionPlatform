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


def db_generate():
    """Generate Prisma client from schema"""
    print_header("Generate Prisma Client")

    print_info("Regenerating Prisma client from schema...")
    code, stdout, stderr = run_command("npx prisma generate", cwd=BACKEND_DIR, capture=True, check=False)

    if code == 0:
        print_success("Prisma client generated successfully!")
        print_info("Models synced with schema.prisma")
    else:
        print_error("Failed to generate Prisma client")
        if stderr:
            print(f"{Colors.RED}{stderr}{Colors.ENDC}")


def db_validate():
    """Validate Prisma schema"""
    print_header("Validate Prisma Schema")

    print_info("Validating schema.prisma...")
    code, stdout, stderr = run_command("npx prisma validate", cwd=BACKEND_DIR, capture=True, check=False)

    if code == 0:
        print_success("Schema is valid!")
    else:
        print_error("Schema validation failed")
        if stderr:
            print(f"{Colors.RED}{stderr}{Colors.ENDC}")


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


def build_backend():
    """Build backend TypeScript"""
    print_header("Build Backend")

    print_info("Compiling TypeScript...")
    code, stdout, stderr = run_command("npm run build", cwd=BACKEND_DIR, capture=True, check=False)

    if code == 0:
        print_success("Backend build successful!")
    else:
        print_error("Backend build failed")
        # Count errors
        error_count = stderr.count("error TS") if stderr else 0
        if error_count > 0:
            print_warning(f"Found {error_count} TypeScript errors")
            print()
            # Show first few errors
            lines = stderr.split('\n')[:20]
            for line in lines:
                print(f"{Colors.RED}{line}{Colors.ENDC}")
            if len(stderr.split('\n')) > 20:
                print(f"\n... and more errors")


def build_frontend():
    """Build frontend for production"""
    print_header("Build Frontend")

    print_info("Building frontend for production...")
    code, stdout, stderr = run_command("npm run build", cwd=FRONTEND_DIR, capture=True, check=False)

    if code == 0:
        print_success("Frontend build successful!")
        print_info("Output: frontend/dist/")
    else:
        print_error("Frontend build failed")
        if stderr:
            print(f"{Colors.RED}{stderr[:2000]}{Colors.ENDC}")


def build_all():
    """Build both backend and frontend"""
    print_header("Build All")

    print_info("Step 1/3: Generating Prisma client...")
    db_generate()
    print()

    print_info("Step 2/3: Building backend...")
    build_backend()
    print()

    print_info("Step 3/3: Building frontend...")
    build_frontend()
    print()

    print_success("Build process complete!")


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
        ("Dashboard", "http://localhost:3001/api/v1/dashboard/summary"),
        ("Jobs", "http://localhost:3001/api/v1/jobs"),
        ("PDSS Dashboard", "http://localhost:3001/api/v1/pdss/dashboard"),
        ("Feedback Dashboard", "http://localhost:3001/api/v1/feedback/dashboard"),
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
            elif e.code == 401:
                print_warning(f"{name} - Requires authentication (expected)")
            else:
                print_error(f"{name} - HTTP {e.code}")
        except Exception as e:
            print_error(f"{name} - {str(e)}")
        print()


# ============================================================================
# Python Scripts Integration
# ============================================================================

PYTHON_SCRIPTS_DIR = PROJECT_ROOT / "scripts" / "sto-agents"


def run_pdss_sync():
    """Run PDSS sync script"""
    print_header("PDSS Sync")

    script_path = PYTHON_SCRIPTS_DIR / "pdss_sync.py"
    if not script_path.exists():
        print_error(f"Script not found: {script_path}")
        return

    print_info("Running PDSS sync...")
    code, stdout, stderr = run_command(
        f"python3 {script_path}" if not IS_WINDOWS else f"python {script_path}",
        cwd=PROJECT_ROOT,
        capture=True,
        check=False
    )

    if code == 0:
        print_success("PDSS sync complete!")
        if stdout:
            print(stdout)
    else:
        print_error("PDSS sync failed")
        if stderr:
            print(f"{Colors.RED}{stderr}{Colors.ENDC}")


def run_teams_notify():
    """Test Teams notification"""
    print_header("Teams Notification Test")

    script_path = PYTHON_SCRIPTS_DIR / "teams_notify.py"
    if not script_path.exists():
        print_error(f"Script not found: {script_path}")
        return

    print_info("Sending test notification to Teams...")
    code, stdout, stderr = run_command(
        f"python3 {script_path} --test" if not IS_WINDOWS else f"python {script_path} --test",
        cwd=PROJECT_ROOT,
        capture=True,
        check=False
    )

    if code == 0:
        print_success("Test notification sent!")
        if stdout:
            print(stdout)
    else:
        print_error("Notification failed")
        if stderr:
            print(f"{Colors.RED}{stderr}{Colors.ENDC}")


def run_supplypro_report():
    """Run SupplyPro reporter"""
    print_header("SupplyPro Reporter")

    script_path = PYTHON_SCRIPTS_DIR / "supplypro_reporter.py"
    if not script_path.exists():
        print_error(f"Script not found: {script_path}")
        return

    print_info("Running SupplyPro reporter...")
    code, stdout, stderr = run_command(
        f"python3 {script_path}" if not IS_WINDOWS else f"python {script_path}",
        cwd=PROJECT_ROOT,
        capture=True,
        check=False
    )

    if code == 0:
        print_success("Report generated!")
        if stdout:
            print(stdout)
    else:
        print_error("Reporter failed")
        if stderr:
            print(f"{Colors.RED}{stderr}{Colors.ENDC}")


def list_python_scripts():
    """List available Python scripts"""
    print_header("Available Python Scripts")

    if PYTHON_SCRIPTS_DIR.exists():
        scripts = list(PYTHON_SCRIPTS_DIR.glob("*.py"))
        if scripts:
            for script in sorted(scripts):
                print(f"  {Colors.CYAN}•{Colors.ENDC} {script.name}")
        else:
            print_warning("No Python scripts found in sto-agents/")
    else:
        print_error(f"Scripts directory not found: {PYTHON_SCRIPTS_DIR}")

    print()
    print_info("Run scripts with: python scripts/sto-agents/<script>.py")


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


def kill_node_processes():
    """Kill all Node.js processes (useful for file locking issues)"""
    print_header("Kill Node.js Processes")

    print_warning("This will terminate ALL running Node.js processes!")
    print_info("Use this to fix EPERM errors when files are locked.")
    print()

    confirm = input(f"{Colors.YELLOW}Continue? (yes/no): {Colors.ENDC}")

    if confirm.lower() != 'yes':
        print_info("Aborted.")
        return

    if IS_WINDOWS:
        print_info("Killing Node.js processes on Windows...")
        code, stdout, stderr = run_command("taskkill /F /IM node.exe", capture=True, check=False)
        if code == 0:
            print_success("Node.js processes terminated")
        elif "not found" in stderr.lower() or "no tasks" in stderr.lower():
            print_info("No Node.js processes were running")
        else:
            print_warning("Some processes may not have been terminated")
            if stderr:
                print(stderr)
    else:
        print_info("Killing Node.js processes on Unix...")
        code, stdout, stderr = run_command("pkill -f node", capture=True, check=False)
        if code == 0:
            print_success("Node.js processes terminated")
        else:
            print_info("No Node.js processes were running")

    print()
    print_info("You can now run 'npx prisma generate' without EPERM errors")


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
# Main Menu & Submenus
# ============================================================================

def print_banner():
    """Print the application banner"""
    print(f"\n{Colors.YELLOW}    ╔═══════════════════════════════════════════════════════════╗")
    print(f"    ║  🏗️  {Colors.BOLD}MindFlow - DevOps Management Tool{Colors.ENDC}{Colors.YELLOW}                 ║")
    print(f"    ║      Construction Platform Management                      ║")
    print(f"    ╚═══════════════════════════════════════════════════════════╝{Colors.ENDC}")


def print_main_menu():
    """Print the main menu with categories"""
    print_banner()
    print()

    print(f"{Colors.YELLOW}🚀 First Time?{Colors.ENDC}")
    print(f"  F. First-Time Setup    - Complete setup wizard (recommended for new installs)")
    print()

    print(f"{Colors.CYAN}Management{Colors.ENDC}")
    print(f"  1. System & Health     - Check prerequisites, environment, services")
    print(f"  2. Database            - PostgreSQL start/stop/reset, Prisma tools")
    print(f"  3. Server Control      - Backend, frontend, full stack")
    print(f"  4. Build & Deploy      - TypeScript compile, production builds")
    print(f"  5. Testing & QA        - Security tests, API health checks")
    print(f"  6. Python Scripts      - PDSS sync, Teams notify, SupplyPro")
    print(f"  7. Utilities           - Dependencies, .env, kill processes")
    print()

    print(f"{Colors.GREEN}Quick Actions{Colors.ENDC}")
    print(f"  8. Quick Start (Everything)")
    print(f"  9. Frontend Only (Vite dev server)")
    print()

    print(f"{Colors.RED}0. Exit{Colors.ENDC}")
    print()


def submenu_system():
    """System & Health submenu"""
    while True:
        print(f"\n{Colors.CYAN}═══ System & Health ═══{Colors.ENDC}")
        print("  1. Check Prerequisites")
        print("  2. Check Environment Configuration")
        print("  3. Check Service Health")
        print(f"  {Colors.RED}0. Back{Colors.ENDC}")

        choice = input(f"\n{Colors.BOLD}Select: {Colors.ENDC}").strip()

        if choice == '1':
            check_prerequisites()
            wait_for_user()
        elif choice == '2':
            check_environment()
            wait_for_user()
        elif choice == '3':
            check_health()
            wait_for_user()
        elif choice == '0':
            break


def submenu_database():
    """Database Management submenu"""
    while True:
        print(f"\n{Colors.CYAN}═══ Database Management ═══{Colors.ENDC}")
        print("  1. Start PostgreSQL")
        print("  2. Stop PostgreSQL")
        print("  3. Reset Database (delete all)")
        print("  4. Run Migrations")
        print("  5. Seed Database")
        print("  6. Open Prisma Studio")
        print("  7. Generate Prisma Client")
        print("  8. Validate Prisma Schema")
        print(f"  {Colors.RED}0. Back{Colors.ENDC}")

        choice = input(f"\n{Colors.BOLD}Select: {Colors.ENDC}").strip()

        if choice == '1':
            db_start()
            wait_for_user()
        elif choice == '2':
            db_stop()
            wait_for_user()
        elif choice == '3':
            db_reset()
            wait_for_user()
        elif choice == '4':
            db_migrate()
            wait_for_user()
        elif choice == '5':
            db_seed()
            wait_for_user()
        elif choice == '6':
            db_studio()
            wait_for_user()
        elif choice == '7':
            db_generate()
            wait_for_user()
        elif choice == '8':
            db_validate()
            wait_for_user()
        elif choice == '0':
            break


def submenu_server():
    """Server Control submenu"""
    while True:
        print(f"\n{Colors.CYAN}═══ Server Control ═══{Colors.ENDC}")
        print("  1. Start Backend Server (port 3001)")
        print("  2. Start Frontend Server (port 5173)")
        print("  3. Start Full Stack (Both)")
        print(f"  {Colors.RED}0. Back{Colors.ENDC}")

        choice = input(f"\n{Colors.BOLD}Select: {Colors.ENDC}").strip()

        if choice == '1':
            start_backend()
            wait_for_user()
        elif choice == '2':
            start_frontend()
            wait_for_user()
        elif choice == '3':
            start_full_stack()
            wait_for_user()
        elif choice == '0':
            break


def submenu_build():
    """Build & Deploy submenu"""
    while True:
        print(f"\n{Colors.CYAN}═══ Build & Deploy ═══{Colors.ENDC}")
        print("  1. Build Backend (TypeScript)")
        print("  2. Build Frontend (Production)")
        print("  3. Build All (Prisma + Backend + Frontend)")
        print(f"  {Colors.RED}0. Back{Colors.ENDC}")

        choice = input(f"\n{Colors.BOLD}Select: {Colors.ENDC}").strip()

        if choice == '1':
            build_backend()
            wait_for_user()
        elif choice == '2':
            build_frontend()
            wait_for_user()
        elif choice == '3':
            build_all()
            wait_for_user()
        elif choice == '0':
            break


def submenu_testing():
    """Testing & QA submenu"""
    while True:
        print(f"\n{Colors.CYAN}═══ Testing & QA ═══{Colors.ENDC}")
        print("  1. Run Security Tests")
        print("  2. Test API Health")
        print(f"  {Colors.RED}0. Back{Colors.ENDC}")

        choice = input(f"\n{Colors.BOLD}Select: {Colors.ENDC}").strip()

        if choice == '1':
            run_security_tests()
            wait_for_user()
        elif choice == '2':
            test_api()
            wait_for_user()
        elif choice == '0':
            break


def submenu_python():
    """Python Scripts submenu"""
    while True:
        print(f"\n{Colors.CYAN}═══ Python Scripts (STO Agents) ═══{Colors.ENDC}")
        print("  1. List Available Scripts")
        print("  2. Run PDSS Sync")
        print("  3. Test Teams Notification")
        print("  4. Run SupplyPro Reporter")
        print(f"  {Colors.RED}0. Back{Colors.ENDC}")

        choice = input(f"\n{Colors.BOLD}Select: {Colors.ENDC}").strip()

        if choice == '1':
            list_python_scripts()
            wait_for_user()
        elif choice == '2':
            run_pdss_sync()
            wait_for_user()
        elif choice == '3':
            run_teams_notify()
            wait_for_user()
        elif choice == '4':
            run_supplypro_report()
            wait_for_user()
        elif choice == '0':
            break


def submenu_utilities():
    """Utilities submenu"""
    while True:
        print(f"\n{Colors.CYAN}═══ Utilities ═══{Colors.ENDC}")
        print("  1. Generate JWT Secret")
        print("  2. View Docker Logs")
        print("  3. Install Dependencies")
        print("  4. Create .env File")
        print("  5. Generate Project Tree")
        print(f"  6. {Colors.RED}Kill Node Processes{Colors.ENDC} (fix EPERM errors)")
        print(f"  {Colors.RED}0. Back{Colors.ENDC}")

        choice = input(f"\n{Colors.BOLD}Select: {Colors.ENDC}").strip()

        if choice == '1':
            generate_jwt_secret()
            wait_for_user()
        elif choice == '2':
            view_logs()
            wait_for_user()
        elif choice == '3':
            install_dependencies()
            wait_for_user()
        elif choice == '4':
            create_env_file()
            wait_for_user()
        elif choice == '5':
            generate_folder_tree()
            wait_for_user()
        elif choice == '6':
            kill_node_processes()
            wait_for_user()
        elif choice == '0':
            break


def first_time_setup():
    """First-time setup wizard - complete platform initialization"""
    print_header("First-Time Setup Wizard")

    print(f"{Colors.CYAN}This wizard will set up the MindFlow Platform from scratch.{Colors.ENDC}")
    print()
    print("Steps to be performed:")
    print("  1. Check prerequisites (Node.js, Docker, etc.)")
    print("  2. Create .env file from template")
    print("  3. Install backend dependencies (npm install)")
    print("  4. Generate Prisma client")
    print("  5. Start PostgreSQL database (Docker)")
    print("  6. Run database migrations")
    print("  7. Seed database with test data")
    print("  8. Install frontend dependencies")
    print("  9. Health check")
    print()

    confirm = input(f"{Colors.YELLOW}Start first-time setup? (yes/no): {Colors.ENDC}")
    if confirm.lower() != 'yes':
        print_info("Aborted.")
        return

    print()

    # Step 1: Prerequisites
    print(f"\n{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}Step 1/9: Checking Prerequisites{Colors.ENDC}")
    print(f"{Colors.BOLD}{'='*60}{Colors.ENDC}")
    if not check_prerequisites():
        print_error("Prerequisites check failed. Please install missing tools.")
        return
    print()

    # Step 2: Create .env
    print(f"\n{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}Step 2/9: Creating Environment File{Colors.ENDC}")
    print(f"{Colors.BOLD}{'='*60}{Colors.ENDC}")
    env_file = BACKEND_DIR / ".env"
    example_file = BACKEND_DIR / ".env.example"

    if env_file.exists():
        print_info(".env file already exists - skipping")
    elif example_file.exists():
        import shutil
        shutil.copy(example_file, env_file)
        print_success(f"Created .env from .env.example")

        # Generate and set JWT secret
        import secrets
        jwt_secret = secrets.token_hex(32)

        with open(env_file, 'r') as f:
            content = f.read()

        content = content.replace(
            'JWT_SECRET=your-secret-key-here-change-in-production',
            f'JWT_SECRET={jwt_secret}'
        )

        with open(env_file, 'w') as f:
            f.write(content)

        print_success("Generated secure JWT_SECRET")
    else:
        print_error(".env.example not found!")
        return
    print()

    # Step 3: Install backend dependencies
    print(f"\n{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}Step 3/9: Installing Backend Dependencies{Colors.ENDC}")
    print(f"{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print_info("Running: npm install (backend)")
    code, _, _ = run_command("npm install", cwd=BACKEND_DIR, check=False)
    if code == 0:
        print_success("Backend dependencies installed")
    else:
        print_error("Failed to install backend dependencies")
        return
    print()

    # Step 4: Generate Prisma client
    print(f"\n{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}Step 4/9: Generating Prisma Client{Colors.ENDC}")
    print(f"{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print_info("Running: npx prisma generate")
    code, stdout, stderr = run_command("npx prisma generate", cwd=BACKEND_DIR, capture=True, check=False)
    if code == 0:
        print_success("Prisma client generated")
    else:
        if "EPERM" in stderr:
            print_error("EPERM error - another process is locking files")
            print_info("Try: Close VS Code, stop any running Node processes")
            print_info("Or use Menu 7 > 'Kill Node Processes' to terminate them")
            return
        else:
            print_error("Failed to generate Prisma client")
            if stderr:
                print(stderr[:500])
            return
    print()

    # Step 5: Start PostgreSQL
    print(f"\n{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}Step 5/9: Starting PostgreSQL Database{Colors.ENDC}")
    print(f"{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print_info("Running: docker-compose up -d postgres")
    code, _, _ = run_command("docker-compose up -d postgres", cwd=PROJECT_ROOT, check=False)
    if code == 0:
        print_success("PostgreSQL container started")
        print_info("Waiting for database to be ready...")
        time.sleep(5)

        # Check if ready
        for i in range(10):
            code, _, _ = run_command(
                "docker exec mindflow-postgres pg_isready -U mindflow",
                capture=True, check=False
            )
            if code == 0:
                print_success("Database is ready!")
                break
            time.sleep(1)
        else:
            print_warning("Database may still be starting...")
    else:
        print_error("Failed to start PostgreSQL container")
        print_info("Make sure Docker Desktop is running")
        return
    print()

    # Step 6: Run migrations
    print(f"\n{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}Step 6/9: Running Database Migrations{Colors.ENDC}")
    print(f"{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print_info("Running: npx prisma migrate deploy")
    code, _, stderr = run_command("npx prisma migrate deploy", cwd=BACKEND_DIR, capture=True, check=False)
    if code == 0:
        print_success("Migrations applied successfully")
    else:
        print_error("Migration failed")
        if stderr:
            print(stderr[:500])
        return
    print()

    # Step 7: Seed database
    print(f"\n{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}Step 7/9: Seeding Database{Colors.ENDC}")
    print(f"{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print_info("Running: npx prisma db seed")
    code, stdout, stderr = run_command("npx prisma db seed", cwd=BACKEND_DIR, capture=True, check=False)
    if code == 0:
        print_success("Database seeded with test data")
        print_info("Test users created:")
        print("  - admin@mindflow.com (Admin)")
        print("  - estimator@mindflow.com (Estimator)")
        print("  - viewer@mindflow.com (Viewer)")
        print(f"  - Password: DevPassword123!")
    else:
        # Seed might fail if data exists, that's OK
        if "already exist" in stderr.lower() or "unique constraint" in stderr.lower():
            print_info("Database already has data - skipping seed")
        else:
            print_warning("Seed may have partially completed")
    print()

    # Step 8: Install frontend dependencies
    print(f"\n{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}Step 8/9: Installing Frontend Dependencies{Colors.ENDC}")
    print(f"{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print_info("Running: npm install (frontend)")
    code, _, _ = run_command("npm install", cwd=FRONTEND_DIR, check=False)
    if code == 0:
        print_success("Frontend dependencies installed")
    else:
        print_warning("Frontend dependencies installation had issues")
    print()

    # Step 9: Health check
    print(f"\n{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}Step 9/9: Final Health Check{Colors.ENDC}")
    print(f"{Colors.BOLD}{'='*60}{Colors.ENDC}")
    check_health()
    print()

    # Summary
    print_header("Setup Complete!")
    print_success("MindFlow Platform is ready!")
    print()
    print(f"{Colors.GREEN}What's next:{Colors.ENDC}")
    print()
    print("  Start the backend server:")
    print(f"    {Colors.CYAN}cd backend && npm run dev{Colors.ENDC}")
    print(f"    Server will run at: http://localhost:3001")
    print()
    print("  Start the frontend (in a new terminal):")
    print(f"    {Colors.CYAN}cd frontend && npm run dev{Colors.ENDC}")
    print(f"    Frontend will run at: http://localhost:5173")
    print()
    print("  Or start both with:")
    print(f"    {Colors.CYAN}python scripts/dev/devops.py{Colors.ENDC} -> Option 8 (Quick Start)")
    print()
    print(f"{Colors.GREEN}Test login credentials:{Colors.ENDC}")
    print(f"    Email: admin@mindflow.com")
    print(f"    Password: DevPassword123!")
    print()


def quick_start():
    """Quick start - start everything"""
    print_header("Quick Start - Full Platform Launch")

    print_info("Step 1/4: Starting PostgreSQL...")
    db_start()
    print()

    print_info("Step 2/4: Running migrations...")
    db_migrate()
    print()

    print_info("Step 3/4: Checking database...")
    # Try to seed, but don't fail if data already exists
    code, stdout, stderr = run_command("npm run prisma:seed", cwd=BACKEND_DIR, capture=True, check=False)
    if code == 0:
        print_success("Database seeded!")
    else:
        if "Existing data detected" in stdout or "Existing data detected" in stderr:
            print_success("Database already has data - skipping seed")
        else:
            print_warning("Seed skipped (run manually if needed)")
    print()

    print_info("Step 4/4: Starting servers...")
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

    while True:
        try:
            print_main_menu()
            choice = input(f"{Colors.BOLD}Select an option: {Colors.ENDC}").strip().upper()

            if choice == 'F':
                first_time_setup()
                wait_for_user()
            elif choice == '1':
                submenu_system()
            elif choice == '2':
                submenu_database()
            elif choice == '3':
                submenu_server()
            elif choice == '4':
                submenu_build()
            elif choice == '5':
                submenu_testing()
            elif choice == '6':
                submenu_python()
            elif choice == '7':
                submenu_utilities()
            elif choice == '8':
                quick_start()
                wait_for_user()
            elif choice == '9':
                start_frontend()
                wait_for_user()
            elif choice == '0':
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
