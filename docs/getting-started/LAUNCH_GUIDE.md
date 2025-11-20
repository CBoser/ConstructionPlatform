# MindFlow Platform - Launch Guide

## Overview
This guide provides instructions for launching the MindFlow construction management platform on Linux systems.

## Prerequisites

### Required Software
- **Node.js** v18+ and npm
- **Docker** and Docker Compose (for PostgreSQL database)
- **Git** (for version control)

### System Requirements
- Linux, macOS, or Windows with WSL2
- Minimum 4GB RAM
- 2GB free disk space

## Quick Start

### 1. Install Dependencies

All dependencies have been installed. If you need to reinstall:

```bash
# Install root dependencies (concurrently for running multiple services)
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd frontend && npm install
```

### 2. Configure Environment

Environment files have been created from examples:
- `backend/.env` - Backend configuration
- `frontend/.env` - Frontend configuration

**Default Configuration:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5433 (Docker)

### 3. Start the Database

```bash
# Start PostgreSQL using Docker Compose
docker-compose up -d

# Verify database is running
docker ps | grep mindflow-postgres
```

### 4. Initialize Prisma

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Seed database with sample data
npm run prisma:seed
```

### 5. Launch the Application

From the project root:

```bash
# Start both frontend and backend concurrently
npm run dev

# OR start them separately:
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

## Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Prisma Studio:** `cd backend && npm run prisma:studio` (http://localhost:5555)

## Default Login Credentials

After seeding the database, you can log in with:
- **Email:** admin@example.com
- **Password:** (check backend/prisma/seed.ts)

## Troubleshooting

### Prisma Engine Download Issues

If you encounter "403 Forbidden" errors when generating Prisma client:

```bash
# Set environment variable to skip checksum validation
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
cd backend && npm run prisma:generate
```

### Port Already in Use

If ports 5173, 3001, or 5433 are already in use:

1. **Find and stop the conflicting process:**
   ```bash
   # Find process on port 3001
   lsof -i :3001
   kill -9 <PID>
   ```

2. **Or change ports in .env files**

### Database Connection Issues

```bash
# Check if PostgreSQL container is running
docker ps

# View container logs
docker logs mindflow-postgres

# Restart the database
docker-compose down
docker-compose up -d
```

### Frontend Build Errors

The frontend has been fixed and builds successfully:
```bash
cd frontend && npm run build
```

### Backend TypeScript Errors

The backend requires a properly generated Prisma client. If you see type errors:

1. Ensure PostgreSQL is running
2. Run `npm run prisma:generate` in the backend directory
3. Verify `backend/node_modules/.prisma/client` exists

## Development Scripts

### Root Package Scripts
- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start frontend only
- `npm run dev:backend` - Start backend only
- `npm run build` - Build both frontend and backend
- `npm run setup-deps` - Install all dependencies

### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run compiled backend
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with sample data
- `npm run prisma:studio` - Open Prisma Studio GUI

### Frontend Scripts
- `npm run dev` - Start Vite development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
ConstructionPlatform/
├── backend/           # Express + Prisma API
│   ├── prisma/       # Database schema and migrations
│   ├── src/          # TypeScript source code
│   └── .env          # Backend configuration
├── frontend/         # React + Vite SPA
│   ├── src/          # React components and pages
│   └── .env          # Frontend configuration
├── shared/           # Shared types between frontend and backend
├── docs/             # Project documentation
└── docker-compose.yml # PostgreSQL database setup
```

## Clean Slate

The project has been cleaned up and organized:
- ✅ All Windows .bat files removed (Linux environment)
- ✅ Duplicate documentation consolidated in `docs/` folder
- ✅ Old project reports removed
- ✅ Dependencies installed
- ✅ Environment files created
- ✅ Frontend builds successfully
- ⚠️  Backend requires Docker + Prisma setup

## Next Steps

1. **Install Docker** if not already available
2. **Start the database:** `docker-compose up -d`
3. **Generate Prisma client:** `cd backend && npm run prisma:generate`
4. **Run migrations:** `npm run prisma:migrate`
5. **Launch the app:** `npm run dev` (from project root)

## Support

For issues or questions:
- Check the documentation in `docs/`
- Review the README.md
- Check backend logs and frontend console for errors
