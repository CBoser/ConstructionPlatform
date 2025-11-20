#!/bin/bash
#
# MindFlow Platform - Development Launch Script
# Sprint 1 - Security Foundation
#
# This script helps you launch the platform for development and testing
#

set -e  # Exit on error

# Change to project root directory (parent of scripts/)
cd "$(dirname "$0")/.."

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  🚀 MindFlow Platform - Development Launcher"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️ ${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️ ${NC} $1"
}

# Check prerequisites
echo "📋 Checking prerequisites..."
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js v18 or higher."
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "npm installed: $NPM_VERSION"
else
    print_error "npm not found. Please install npm."
    exit 1
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    print_status "PostgreSQL client installed"
else
    print_warning "PostgreSQL client not found. Database operations may not work."
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  🔧 Setup Options"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "What would you like to do?"
echo ""
echo "  1) 🚀 Quick Start (Backend only)"
echo "  2) 🌐 Full Start (Backend + Frontend)"
echo "  3) 🔄 Reset Database"
echo "  4) 🧪 Run Security Tests"
echo "  5) 📊 View Database (Prisma Studio)"
echo "  6) 🏥 Health Check"
echo "  7) ❌ Exit"
echo ""
read -p "Enter your choice [1-7]: " choice

case $choice in
    1)
        echo ""
        print_info "Starting backend server..."
        echo ""
        cd backend

        # Check if .env exists
        if [ ! -f .env ]; then
            print_warning ".env file not found. Copying from .env.example..."
            cp .env.example .env
            print_warning "Please edit backend/.env and set JWT_SECRET!"
            echo ""
            echo "Generate a secure secret with:"
            echo "  node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
            echo ""
            read -p "Press Enter when ready..."
        fi

        # Check if node_modules exists
        if [ ! -d node_modules ]; then
            print_info "Installing backend dependencies..."
            npm install
        fi

        # Generate Prisma client
        print_info "Generating Prisma client..."
        PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate

        # Start server
        print_status "Starting backend on http://localhost:3001"
        npm run dev
        ;;

    2)
        echo ""
        print_info "Starting backend and frontend..."
        echo ""

        # Start backend in background
        cd backend
        if [ ! -f .env ]; then
            cp .env.example .env
            print_warning "Created backend/.env - please set JWT_SECRET!"
        fi

        if [ ! -d node_modules ]; then
            print_info "Installing backend dependencies..."
            npm install
        fi

        PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
        npm run dev &
        BACKEND_PID=$!
        print_status "Backend started (PID: $BACKEND_PID)"

        # Start frontend
        cd ../frontend
        if [ ! -d node_modules ]; then
            print_info "Installing frontend dependencies..."
            npm install
        fi

        print_status "Starting frontend on http://localhost:5173"
        npm run dev
        ;;

    3)
        echo ""
        print_warning "This will DELETE ALL DATA in the database!"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" == "yes" ]; then
            cd backend
            print_info "Resetting database..."
            npx prisma migrate reset --force
            print_status "Database reset complete!"

            print_info "Seeding database..."
            npm run prisma:seed
            print_status "Database seeded with test data!"
        else
            print_info "Database reset cancelled."
        fi
        ;;

    4)
        echo ""
        print_info "Running security tests..."
        echo ""
        cd backend

        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "  Test 1: JWT_SECRET Validation"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        node test-jwt-validation.js

        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "  Test 2: Seed Data Security"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        node test-seed-security.js

        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "  Test 3: Security Headers"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        node test-security-headers.js

        echo ""
        print_status "All security tests complete!"
        ;;

    5)
        echo ""
        print_info "Opening Prisma Studio..."
        echo ""
        print_info "Prisma Studio will open at http://localhost:5555"
        print_info "Press Ctrl+C to stop"
        echo ""
        cd backend
        npx prisma studio
        ;;

    6)
        echo ""
        print_info "Running health checks..."
        echo ""

        # Check backend
        if curl -s http://localhost:3001/health > /dev/null 2>&1; then
            print_status "Backend is running at http://localhost:3001"
            curl -s http://localhost:3001/health | python3 -m json.tool || cat
        else
            print_error "Backend is not running at http://localhost:3001"
        fi

        echo ""

        # Check frontend
        if curl -s http://localhost:5173 > /dev/null 2>&1; then
            print_status "Frontend is running at http://localhost:5173"
        else
            print_error "Frontend is not running at http://localhost:5173"
        fi

        echo ""

        # Check database
        cd backend
        if pg_isready -h localhost -p 5433 > /dev/null 2>&1; then
            print_status "Database is running on port 5433"
        elif pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
            print_status "Database is running on port 5432"
        else
            print_error "Database is not running"
        fi
        ;;

    7)
        echo ""
        print_info "Exiting..."
        exit 0
        ;;

    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
