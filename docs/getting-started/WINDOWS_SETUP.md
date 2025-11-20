# MindFlow - Windows Setup Guide

Quick start guide for Windows developers using the provided batch scripts.

## Prerequisites

Before running the setup, ensure you have:

1. **Node.js 20+** - Download from [nodejs.org](https://nodejs.org)
2. **Docker Desktop** - Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
3. **Git** - Download from [git-scm.com](https://git-scm.com)

## Initial Setup (First Time Only)

### 1. Clone the Repository

```bash
git clone https://github.com/CBoser/ConstructionPlatform.git
cd ConstructionPlatform
```

### 2. Run Setup Script

Double-click `setup.bat` or run from Command Prompt:

```bash
setup.bat
```

This will:
- ✓ Check Node.js and Docker installation
- ✓ Install all dependencies (frontend + backend)
- ✓ Start PostgreSQL in Docker
- ✓ Generate Prisma Client
- ✓ Run database migrations

**Note:** The first run may take 5-10 minutes while downloading dependencies and Docker images.

---

## Daily Development

### Starting the Platform

Double-click `launch.bat` or run:

```bash
launch.bat
```

This starts:
- **PostgreSQL** (if not already running)
- **Frontend** at http://localhost:5173
- **Backend** at http://localhost:3001

**Keep this window open** while developing. Press `Ctrl+C` to stop all servers.

### Stopping Everything

Double-click `stop.bat` or run:

```bash
stop.bat
```

This stops:
- Development servers (if running)
- PostgreSQL database

---

## Useful Scripts

### Prisma Setup (Database Client & Migrations)

```bash
prisma-setup.bat
```

Generates Prisma Client and runs database migrations. Use this when:
- You skipped setup.bat but need database access
- Prisma generation failed during setup
- Backend fails to start with "Prisma Client not initialized" error
- You've updated the database schema (backend/prisma/schema.prisma)

This script:
- ✓ Starts PostgreSQL if needed
- ✓ Generates Prisma Client
- ✓ Runs database migrations

### Check System Status

```bash
status.bat
```

Shows status of:
- Node.js installation
- Docker installation
- PostgreSQL container
- Frontend server (port 5173)
- Backend server (port 3001)
- Backend health check

### Explore Database (Prisma Studio)

```bash
db-studio.bat
```

Opens Prisma Studio at http://localhost:5555

Use this to:
- Browse all database tables
- View and edit data
- Test queries
- Inspect relationships

### Reset Database (DESTRUCTIVE)

```bash
reset-db.bat
```

**WARNING:** This deletes all data!

Use when you need a fresh database:
- Testing migrations
- Clearing bad data
- Starting over

---

## Troubleshooting

### "EPERM: operation not permitted" or "npm install failed"

**Issue:** Windows file locking prevents npm from removing/updating node_modules files. This is the most common Windows setup issue.

**Solutions:**

**Quick Fix - Use the cleanup script:**
```bash
cleanup.bat
# Then run setup.bat again
```

**Manual Fix:**
1. Close ALL IDEs (VS Code, WebStorm, etc.)
2. Close ALL Command Prompt/PowerShell windows
3. Wait 10 seconds for file locks to release
4. Run `cleanup.bat`
5. Run `setup.bat`

**If still failing:**
```bash
# Stop all Node.js processes
taskkill /F /IM node.exe

# Manually remove node_modules
rmdir /s /q node_modules
rmdir /s /q frontend\node_modules
rmdir /s /q backend\node_modules

# If rmdir fails, restart Windows and try again
```

**Root Cause:** Windows locks files that are:
- Open in an IDE (VS Code, WebStorm)
- Being used by ESLint/TypeScript server
- In use by a running dev server
- Scanned by antivirus software

**Prevention:**
- Always run `stop.bat` before running `setup.bat` again
- Close IDEs before running setup
- Exclude `node_modules` from Windows Defender real-time scanning

---

### "Docker is not running"

**Solution:** Start Docker Desktop from the Windows Start menu and wait for it to fully start (icon turns green in system tray).

### "Port 3001 already in use"

**Solution:** Another application is using port 3001.

```bash
# Find what's using the port
netstat -ano | findstr :3001

# Kill the process (replace <PID> with the number from above)
taskkill /PID <PID> /F
```

### "Port 5173 already in use"

**Solution:** Same as above, but for port 5173:

```bash
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### "npm command not found"

**Solution:** Node.js not installed or not in PATH.

1. Reinstall Node.js from [nodejs.org](https://nodejs.org)
2. Make sure to check "Add to PATH" during installation
3. Restart Command Prompt

### "Prisma Client did not initialize yet" or "Backend crashes on startup"

**Issue:** Backend fails to start with error:
```
Error: @prisma/client did not initialize yet. Please run "prisma generate"
```

**Root Cause:** You ran `launch.bat` without running `setup.bat` first, or Prisma Client generation failed during setup.

**Solution - Quick Fix:**
```bash
prisma-setup.bat
```

**Solution - Manual:**
```bash
cd backend
set PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
npx prisma generate
npm run prisma:migrate
cd ..
launch.bat
```

**Prevention:** Always run `setup.bat` first before running `launch.bat` for the first time. The `launch.bat` script now checks for this and will warn you.

---

### "Prisma Client generation failed"

**Issue:** During setup, Prisma Client generation fails with timeout or network errors.

**Solution:**
```bash
cd backend
set PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
npx prisma generate
cd ..
```

If this fails repeatedly:
1. Check internet connection (Prisma downloads binaries)
2. Try running setup.bat again
3. Check firewall/antivirus isn't blocking downloads

---

### "Cannot connect to database"

**Solution:** PostgreSQL might not be ready yet.

```bash
# Check if container is running
docker ps

# Restart the container
docker compose restart

# View logs
docker compose logs postgres
```

---

## Development Workflow

### Typical Day

1. **Start development:**
   ```bash
   launch.bat
   ```

2. **Make code changes** in your editor (VS Code, etc.)

3. **View changes** in browser (auto-reloads)

4. **Check database** with `db-studio.bat` if needed

5. **Stop when done:**
   - Press `Ctrl+C` in launch window
   - Or run `stop.bat`

### After Pulling New Code

```bash
# Update dependencies
npm install

# Run new migrations
cd backend
npm run prisma:migrate
cd ..

# Restart servers
launch.bat
```

### Database Schema Changes

If you modify `backend/prisma/schema.prisma`:

```bash
# Generate new Prisma Client
cd backend
npm run prisma:generate

# Create migration
npm run prisma:migrate

# View changes in Prisma Studio
npm run prisma:studio
cd ..
```

---

## File Structure

```
MindFlow/
├── setup.bat           # Initial setup (run once)
├── launch.bat          # Start dev servers (daily use)
├── stop.bat            # Stop all services
├── status.bat          # Check system status
├── db-studio.bat       # Open Prisma Studio
├── reset-db.bat        # Reset database (WARNING: destructive)
│
├── frontend/           # React + TypeScript + Vite
├── backend/            # Express + Prisma + PostgreSQL
├── shared/             # Shared TypeScript types
├── docker-compose.yml  # PostgreSQL configuration
│
├── README.md           # Full platform documentation
├── SETUP.md            # Detailed setup guide (all platforms)
└── WINDOWS_SETUP.md    # This file
```

---

## Common Tasks

### View Logs

**Frontend logs:**
- Already visible in the launch window

**Backend logs:**
- Already visible in the launch window

**Database logs:**
```bash
docker compose logs postgres
```

### Update Database Schema

1. Edit `backend/prisma/schema.prisma`
2. Run migration:
   ```bash
   cd backend
   npm run prisma:migrate
   cd ..
   ```

### Backup Database

```bash
# Create backup
docker exec -t mindflow-postgres pg_dump -U mindflow mindflow_dev > backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%.sql
```

### Restore Database

```bash
# Restore from backup
docker exec -i mindflow-postgres psql -U mindflow mindflow_dev < backup.sql
```

---

## Performance Tips

### Speed Up npm install

Use a faster package manager:

```bash
# Install pnpm globally
npm install -g pnpm

# Use pnpm instead of npm
pnpm install
```

### Speed Up Docker

1. Open Docker Desktop
2. Settings → Resources
3. Increase Memory to 4GB+
4. Increase CPU to 4+ cores

### Speed Up TypeScript Compilation

1. Install WSL2 (Windows Subsystem for Linux)
2. Run development inside WSL2 for 2-3x faster builds

---

## IDE Setup (VS Code Recommended)

### Required Extensions

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Prisma** - Schema highlighting and intellisense
- **TypeScript Vue Plugin (Volar)** - TypeScript support

### Recommended Extensions

- **Docker** - Manage containers
- **GitLens** - Enhanced Git integration
- **Thunder Client** - API testing
- **Error Lens** - Inline error messages

### VS Code Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## Getting Help

### Documentation

- **README.md** - Platform vision and architecture
- **SETUP.md** - Detailed setup for all platforms
- **EDUCATIONAL_UI_STRATEGY.md** - UI/UX guidelines
- **CLAUDE_ANALYSIS_PROMPT.md** - Learning system analysis

### Support

- Check `status.bat` to diagnose issues
- Review Docker Desktop logs
- Check browser console (F12) for frontend errors
- Check terminal output for backend errors

---

## Next Steps

After setup is complete:

1. ✅ Verify everything works:
   ```bash
   status.bat
   ```

2. ✅ Explore the database:
   ```bash
   db-studio.bat
   ```

3. ✅ Open the application:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001
   - Health: http://localhost:3001/health

4. 📚 Read the full documentation:
   - See README.md for platform vision
   - See SETUP.md for detailed information

5. 🚀 Start building!

---

**Happy coding!** 🎉
