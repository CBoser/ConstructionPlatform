# MindFlow Platform - Project Manager

A comprehensive Python-based project management tool for database operations, dependency management, and project organization.

## 📋 Table of Contents

- [Overview](#overview)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Operations](#operations)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The Project Manager provides a unified interface for common development tasks:

- **Database Management**: Reset, migrate, seed, and browse database
- **Dependency Cleanup**: Clean node_modules and package-lock files
- **Project Organization**: Analyze structure and organize documentation
- **Status Reports**: Generate comprehensive project reports

## ⚙️ Requirements

- Python 3.7 or higher
- Node.js 18+ and npm
- Docker and Docker Compose (for database)
- Windows, macOS, or Linux

## 🚀 Quick Start

### Windows (Interactive Menu)

```batch
manage.bat
```

This opens an interactive menu with all available operations.

### Windows (Command Line)

```batch
REM Reset database
manage.bat --reset-db

REM Clean dependencies
manage.bat --clean

REM Install dependencies
manage.bat --install

REM Full reset
manage.bat --all
```

### Linux/Mac (Command Line)

```bash
# Make script executable
chmod +x project_manager.py

# Reset database
python3 project_manager.py --reset-db

# Clean dependencies
python3 project_manager.py --clean

# Install dependencies
python3 project_manager.py --install

# Full reset
python3 project_manager.py --all
```

## 📖 Usage

### Interactive Menu (Windows Only)

Run `manage.bat` without arguments to see the interactive menu:

```
========================================
 MindFlow Platform - Project Manager
========================================

 DATABASE OPERATIONS:
  1. Reset Database (drop + migrate + seed)
  2. Reset Database (no seed)
  3. Seed Database Only
  4. Open Prisma Studio

 DEPENDENCY MANAGEMENT:
  5. Clean node_modules
  6. Full Clean (node_modules + package-lock)
  7. Install Dependencies

 PROJECT ORGANIZATION:
  8. Analyze Project Structure
  9. Organize Documentation
  10. Generate Project Report

 COMPLETE OPERATIONS:
  11. Full Reset (clean + install + reset-db)

  0. Exit
```

### Command Line Options

```bash
python project_manager.py [OPTIONS]

Options:
  --reset-db          Reset database (drop, migrate, seed)
  --no-seed           Skip seeding when resetting database
  --seed              Seed database only
  --clean             Clean node_modules folders
  --full              Full clean (includes package-lock files)
  --install           Install all dependencies
  --analyze           Analyze project structure
  --organize-docs     Organize documentation files
  --report            Generate project status report
  --studio            Open Prisma Studio
  --all               Full reset: clean + install + reset-db
  -h, --help          Show help message
```

## 🔧 Operations

### Database Operations

#### Reset Database

Completely resets the database: drops all data, runs migrations, and seeds with sample data.

```bash
# With seed data
python project_manager.py --reset-db

# Without seed data
python project_manager.py --reset-db --no-seed
```

**What it does:**
1. Stops the database container
2. Deletes the PostgreSQL volume
3. Starts a fresh database
4. Runs Prisma migrations
5. Seeds with sample data (unless `--no-seed`)

**Sample data includes:**
- 3 customers (Richmond American, Holt Homes, Mountain View Custom)
- Multiple contacts per customer
- Pricing tiers
- External system mappings

#### Seed Database Only

Seeds the database with sample data without resetting:

```bash
python project_manager.py --seed
```

#### Open Prisma Studio

Open the Prisma Studio database viewer in your browser:

```bash
python project_manager.py --studio
```

Access at: http://localhost:5555

### Dependency Management

#### Clean node_modules

Removes all `node_modules` folders to fix locked file issues:

```bash
# Clean node_modules only
python project_manager.py --clean

# Clean node_modules and package-lock files
python project_manager.py --clean --full
```

**What it cleans:**
- `/node_modules`
- `/frontend/node_modules`
- `/backend/node_modules`
- `package-lock.json` files (with `--full`)

#### Install Dependencies

Installs all project dependencies:

```bash
python project_manager.py --install
```

**Installs in order:**
1. Root dependencies
2. Backend dependencies
3. Frontend dependencies

### Project Organization

#### Analyze Project Structure

Generates a detailed analysis of your project:

```bash
python project_manager.py --analyze
```

**Shows:**
- Total files and directories
- Code files by language
- Documentation files
- Configuration files
- Large files (>1MB)

#### Organize Documentation

Moves documentation files into organized folders:

```bash
python project_manager.py --organize-docs
```

**Creates structure:**
```
docs/
├── backend/
│   ├── CUSTOMER_API_DOCUMENTATION.md
│   ├── CUSTOMER_MIGRATION_INSTRUCTIONS.md
│   └── SERVICE_LAYER_README.md
├── AUTH_TESTING_GUIDE.md
├── SETUP.md
└── WINDOWS_SETUP.md
```

#### Generate Project Report

Creates a comprehensive project status report:

```bash
python project_manager.py --report
```

**Report includes:**
- Project structure
- Technology stack
- Features implemented
- Database schema
- API endpoints
- Next steps
- Maintenance notes

Output: `PROJECT_REPORT_YYYYMMDD_HHMMSS.md`

### Complete Operations

#### Full Reset

Performs a complete project reset:

```bash
python project_manager.py --all
```

**Equivalent to:**
```bash
python project_manager.py --clean --full
python project_manager.py --install
python project_manager.py --reset-db
```

**Use when:**
- Starting fresh after git pull
- Fixing dependency conflicts
- Cleaning up after failed setup
- Preparing for deployment

## 📚 Examples

### Example 1: Fresh Development Setup

```bash
# Clone repository
git clone <repo-url>
cd salesteamone

# Complete setup
python project_manager.py --all

# Start development servers
npm run dev  # Or use launch.bat
```

### Example 2: Fix Dependency Issues

```bash
# Clean everything
python project_manager.py --clean --full

# Reinstall
python project_manager.py --install
```

### Example 3: Reset Database with Custom Data

```bash
# Reset without seed
python project_manager.py --reset-db --no-seed

# Add your custom seed data
cd backend
npm run prisma:studio
# Add data through Prisma Studio
```

### Example 4: Project Maintenance

```bash
# Analyze current state
python project_manager.py --analyze

# Organize documentation
python project_manager.py --organize-docs

# Generate status report
python project_manager.py --report
```

### Example 5: Testing Database Changes

```bash
# Reset database to test migration
python project_manager.py --reset-db

# View database in Prisma Studio
python project_manager.py --studio
```

## 🐛 Troubleshooting

### Issue: "Python is not installed or not in PATH"

**Solution:**
1. Download Python from [python.org](https://www.python.org/downloads/)
2. During installation, check "Add Python to PATH"
3. Restart terminal/command prompt

### Issue: "Docker is not running"

**Solution:**
```bash
# Windows
# Start Docker Desktop

# Linux
sudo systemctl start docker

# Verify
docker ps
```

### Issue: "node_modules cannot be deleted"

**Solution:**
1. Close all IDEs and terminals
2. Run the clean operation again:
   ```bash
   python project_manager.py --clean --full
   ```
3. If still fails, restart your computer

### Issue: "Database connection failed"

**Solution:**
```bash
# Check database is running
docker compose ps

# Restart database
docker compose down
docker compose up -d

# Wait 5 seconds and try again
```

### Issue: "Prisma migration failed"

**Solution:**
```bash
# Complete database reset
python project_manager.py --reset-db

# Or manual reset
docker compose down
docker volume rm salesteamone_postgres_data
docker compose up -d
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### Issue: "Permission denied" (Linux/Mac)

**Solution:**
```bash
# Make script executable
chmod +x project_manager.py

# Or run with python3
python3 project_manager.py --help
```

### Issue: "Module not found" errors

**Solution:**
```bash
# Reinstall dependencies
python project_manager.py --clean --full
python project_manager.py --install

# If specific module missing
cd backend  # or frontend
npm install <missing-module>
```

## 📝 Additional Notes

### Safety Features

- All destructive operations require confirmation
- Database volume is backed up before deletion
- Color-coded output for clarity
- Detailed error messages

### Environment Variables

The script respects these environment variables:
- `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` - For Prisma operations
- `DATABASE_URL` - Database connection string (from `.env`)

### Best Practices

1. **Always stop servers before cleanup:**
   ```bash
   npm run stop  # Or stop.bat
   python project_manager.py --clean
   ```

2. **Regular maintenance:**
   ```bash
   # Weekly: Analyze project
   python project_manager.py --analyze

   # Monthly: Generate report
   python project_manager.py --report
   ```

3. **Before major changes:**
   ```bash
   # Create checkpoint
   python project_manager.py --report
   git commit -am "checkpoint before changes"
   ```

4. **After git pull:**
   ```bash
   # Update dependencies
   python project_manager.py --install

   # If database changed
   python project_manager.py --reset-db
   ```

## 🔗 Related Scripts

- `setup.bat` - Initial project setup (Windows)
- `launch.bat` - Start development servers (Windows)
- `stop.bat` - Stop all services (Windows)
- `reset-db.bat` - Quick database reset (Windows)
- `cleanup.bat` - Clean node_modules (Windows)

## 📞 Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the main [README.md](README.md)
3. Check specific documentation in `docs/` folder
4. Review error logs in terminal output

## 🎓 Learn More

- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Node.js Documentation](https://nodejs.org/docs)
- [Python Documentation](https://docs.python.org/3/)

---

**MindFlow Platform** - Construction Management Made Simple
