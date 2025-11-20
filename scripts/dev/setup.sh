#!/bin/bash

# MindFlow Platform Setup Script
# Run this script once to set up the development environment

set -e

# Change to project root directory (parent of scripts/)
cd "$(dirname "$0")/.."

echo "================================"
echo "  MindFlow Platform Setup"
echo "================================"
echo ""

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher (current: $(node -v))"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install dependencies
echo "Installing dependencies..."
echo "This may take a few minutes..."
echo ""

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo ""
echo "✅ All dependencies installed successfully!"
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env from example..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
fi

if [ ! -f "frontend/.env" ]; then
    echo "Creating frontend/.env from example..."
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env"
fi

echo ""
echo "================================"
echo "  Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Make sure Docker is installed and running"
echo "2. Run ./scripts/launch.sh to start the application"
echo ""
echo "Or manually:"
echo "  docker-compose up -d        # Start database"
echo "  cd backend && npm run prisma:migrate"
echo "  npm run dev                 # Start app"
echo ""
echo "See docs/LAUNCH_GUIDE.md for detailed instructions"
