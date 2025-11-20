# MindFlow DevOps Management Tool

**Interactive Python CLI for managing all development operations**

## Quick Start

```bash
# Make executable (Linux/Mac)
chmod +x devops.py

# Run the tool
python devops.py

# or on Linux/Mac
./devops.py
```

## Features

### 📊 System & Health Checks
- **Check Prerequisites** - Verify Node.js, npm, Docker, Git, Python
- **Check Environment** - Validate .env configuration
- **Check Service Health** - Test backend, frontend, database status

### 🗄️ Database Management
- **Start PostgreSQL** - Launch Docker container
- **Stop PostgreSQL** - Stop Docker container
- **Reset Database** - Complete wipe and fresh seed
- **Run Migrations** - Apply Prisma migrations
- **Seed Database** - Load test data
- **Open Prisma Studio** - Visual database browser

### 🚀 Server Management
- **Start Backend** - Launch backend server (port 3001)
- **Start Frontend** - Launch frontend server (port 5173)
- **Start Full Stack** - Launch both servers concurrently

### 🧪 Testing
- **Run Security Tests** - Execute all Sprint 1 security tests
  - JWT validation test
  - Seed security test
  - Security headers test
- **Test API Health** - Verify API endpoints responding

### 🔧 Utilities
- **Generate JWT Secret** - Create secure 64-character secret
- **View Docker Logs** - Stream PostgreSQL container logs
- **Install Dependencies** - npm install for backend + frontend
- **Create .env File** - Copy from .env.example

### 📖 Quick Actions
- **Quick Start (Q)** - One-click setup (DB + Servers)
  1. Start PostgreSQL
  2. Run migrations
  3. Seed database
  4. Install dependencies
  5. Start both servers

- **Full Reset (R)** - Complete platform reset
  1. Reset database
  2. Remove all node_modules
  3. Reinstall dependencies
  4. Fresh seed data

## Menu Options

```
📊 System & Health
  1. Check Prerequisites
  2. Check Environment Configuration
  3. Check Service Health

🗄️  Database Management
  4. Start PostgreSQL
  5. Stop PostgreSQL
  6. Reset Database (delete all data)
  7. Run Migrations
  8. Seed Database
  9. Open Prisma Studio

🚀 Server Management
  B. Start Backend Server
  F. Start Frontend Server
  A. Start Full Stack (Both)

🧪 Testing
  T. Run Security Tests
  H. Test API Health

🔧 Utilities
  J. Generate JWT Secret
  L. View Docker Logs
  I. Install Dependencies
  E. Create .env File

📖 Quick Actions
  Q. Quick Start (DB + Backend + Frontend)
  R. Full Reset (DB + Dependencies)

X. Exit
```

## Common Workflows

### First Time Setup

```bash
python devops.py
# Select: E - Create .env File
# Select: I - Install Dependencies
# Select: 4 - Start PostgreSQL
# Select: 7 - Run Migrations
# Select: 8 - Seed Database
# Select: A - Start Full Stack
```

Or just use:
```bash
python devops.py
# Select: Q - Quick Start
```

### Daily Development

```bash
python devops.py
# Select: 4 - Start PostgreSQL
# Select: A - Start Full Stack
```

### Reset Everything

```bash
python devops.py
# Select: R - Full Reset
```

### Run Tests

```bash
python devops.py
# Select: T - Run Security Tests
# Select: H - Test API Health
```

## Platform Detection

The tool automatically detects your platform:
- ✅ **Windows** - Full support with ANSI colors
- ✅ **WSL** - Detects WSL environment
- ✅ **Linux/Mac** - Native support

## Requirements

**Built-in Python Libraries (no installation needed):**
- `os`, `sys`, `subprocess`, `platform`, `pathlib`, `json`, `time`, `urllib`

**External Dependencies:**
- Python 3.6+ (for f-strings)
- No pip packages required!

## Color Output

The tool uses ANSI color codes for better readability:
- 🟢 **Green** - Success messages
- 🔴 **Red** - Error messages
- 🟡 **Yellow** - Warning messages
- 🔵 **Cyan** - Info messages
- 🟣 **Purple** - Headers

Colors work on:
- Windows 10+ (with ANSI support enabled)
- All modern terminals on Linux/Mac
- Windows Terminal
- WSL terminals

## Troubleshooting

### "Command not found" errors

**Problem:** Tool can't find `docker`, `npm`, etc.

**Solution:** Run option `1` to check prerequisites. Install missing tools.

### Docker not running

**Problem:** "Docker is installed but not running"

**Solution:**
- Windows: Start Docker Desktop
- Linux: `sudo service docker start`
- WSL: Enable Docker Desktop WSL integration

### Port already in use

**Problem:** Port 3001 or 5173 already in use

**Solution:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3001
kill -9 <PID>
```

### Database connection failed

**Problem:** Can't connect to PostgreSQL

**Solutions:**
1. Check Docker is running: `docker ps`
2. Check port 5433 is not blocked
3. Reset database: Option `6`
4. View logs: Option `L`

## Advanced Usage

### Running specific commands

The tool is designed for interactive use, but you can also use it as a library:

```python
from devops import db_start, check_health, run_security_tests

# Start database
db_start()

# Check health
check_health()

# Run tests
run_security_tests()
```

### Custom scripts

You can extend the tool by adding your own functions:

```python
def my_custom_task():
    """My custom DevOps task"""
    print_header("My Custom Task")
    print_info("Running custom task...")
    # Your code here
    print_success("Task complete!")
```

## Sprint 1 Integration

This tool integrates with Sprint 1 security features:

✅ **JWT Secret Validation** - Generate secure secrets (option J)
✅ **Seed Security** - No hardcoded passwords, uses env vars
✅ **Security Headers** - Test with option T
✅ **Environment Management** - Check and create .env (options 2, E)

## Files Created by Tool

The tool may create/modify:
- `backend/.env` - Environment configuration (option E)
- `backend/node_modules/` - Backend dependencies (option I)
- `frontend/node_modules/` - Frontend dependencies (option I)

The tool will **never** delete your code or modify:
- Source files (.ts, .tsx, .js, .jsx)
- Configuration files (except .env when explicitly requested)
- Git repository

## Exit and Cleanup

**During operations:**
- Press `Ctrl+C` to cancel current operation
- Tool will return to main menu

**To exit:**
- Select `X` from main menu
- Or press `Ctrl+C` at menu and confirm exit

## Support

For issues or questions:
1. Check this documentation
2. Run option `1` to verify prerequisites
3. Run option `3` to check service health
4. View logs with option `L`

## License

Part of the MindFlow Construction Management Platform.
