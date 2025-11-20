# Quick Start Guide

Get the MindFlow Construction Platform running in 5 minutes.

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

## Setup

### 1. Clone and Install

```bash
git clone https://github.com/CBoser/ConstructionPlatform.git
cd ConstructionPlatform
```

### 2. Run Setup Script

```bash
./scripts/dev/setup.sh
```

This will:
- Check prerequisites
- Create .env files from templates
- Install all dependencies
- Start PostgreSQL via Docker
- Run database migrations

### 3. Start the Application

```bash
./scripts/launch.sh
```

Or manually:

```bash
docker-compose up -d                    # Start PostgreSQL
cd backend && npm run dev &             # Start backend
cd frontend && npm run dev              # Start frontend
```

### 4. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Prisma Studio:** http://localhost:5555 (run `npx prisma studio` in backend/)

## First Steps

1. **Login** with seeded admin account
2. **Explore the dashboard** - see platform overview
3. **Add a customer** - Foundation > Customers > Add New
4. **Import plans** - Foundation > Plans > Add Plan
5. **Create your first job** - Operations > Jobs > Create Job

## Common Commands

```bash
# Development
npm run dev                    # Start both frontend + backend
npm run dev:frontend           # Start frontend only
npm run dev:backend            # Start backend only

# Database
docker-compose up -d           # Start PostgreSQL
docker-compose down            # Stop PostgreSQL
cd backend && npm run prisma:studio    # Open Prisma Studio

# Testing
npm run test                   # Run all tests
npm run test:coverage          # Run tests with coverage

# Building
npm run build                  # Build for production
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps

# Restart PostgreSQL
docker-compose restart

# View logs
docker-compose logs postgres
```

### Fresh Database Reset

```bash
docker-compose down
docker volume rm constructionplatform_postgres_data
docker-compose up -d
sleep 15
cd backend && npm run prisma:migrate
```

### Clear and Reinstall Dependencies

```bash
rm -rf node_modules frontend/node_modules backend/node_modules
npm install
cd frontend && npm install
cd ../backend && npm install
```

## Next Steps

- **Detailed Setup:** [docs/getting-started/SETUP.md](./docs/getting-started/SETUP.md)
- **Architecture Overview:** [docs/getting-started/architecture.md](./docs/getting-started/architecture.md)
- **API Documentation:** [docs/api/](./docs/api/)
- **Contributing:** [CONTRIBUTING.md](./CONTRIBUTING.md)

---

Need help? Check [docs/guides/troubleshooting.md](./docs/guides/troubleshooting.md) or open an issue.
