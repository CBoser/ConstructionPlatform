#!/bin/bash

# MindFlow Platform Stop Script
# Stops all running services

# Change to project root directory (parent of scripts/)
cd "$(dirname "$0")/.."

echo "Stopping MindFlow Platform..."

# Stop Docker containers
echo "Stopping PostgreSQL database..."
docker-compose down

echo ""
echo "✅ All services stopped"
echo ""
echo "To restart, run: ./scripts/launch.sh"
