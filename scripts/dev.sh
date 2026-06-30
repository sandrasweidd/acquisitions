#!/usr/bin/env bash
set -euo pipefail
# Development startup script for Acquisition App with Neon Local
# This script starts the application in development mode with Neon Local

echo "Starting Acquisition App in Development Mode"
echo "================================================"

# Check if .env.development exists
if [ ! -f .env.development ]; then
  echo "X Error: .env.development file not found!"
  echo "Please copy .env.development from the template and update with your Neon credentials."
  exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>/dev/null; then
  echo "X Error: Docker is not running!"
  echo "Please start Docker Desktop and try again."
  exit 1
fi

# Create .neon_local directory if it doesn't exist
mkdir -p .neon_local

# Add .neon_local to .gitignore if not already present
if ! grep -q ".neon_local/" .gitignore 2>/dev/null; then
  echo ".neon_local/" >> .gitignore
  echo "Added .neon_local/ to .gitignore"
fi

echo "Building and starting development containers ..."
echo "- Neon Local proxy will create an ephemeral database branch"
echo "- Application will run with hot reload enabled"
echo ""

# Set development environment for local startup
export NODE_ENV=development

# Start Neon Local before applying migrations
echo "Starting Docker Compose in detached mode ..."
docker compose -f docker-compose.dev.yml up --build -d

echo "Waiting for Neon Local to be ready ..."
ready=false
timeout=120
count=0
while [ "$ready" = false ] && [ $count -lt $timeout ]; do
  if docker compose -f docker-compose.dev.yml logs --no-color --tail 20 neon-local | grep -q "Neon Local is ready"; then
    ready=true
    break
  fi
  echo "Waiting for Neon Local to report readiness... ($count/$timeout)"
  sleep 2
  count=$((count + 1))
done

if [ "$ready" != true ]; then
  echo "X Error: Neon Local did not become ready within $timeout checks."
  docker compose -f docker-compose.dev.yml ps
  docker compose -f docker-compose.dev.yml logs --no-color --tail 50 neon-local
  exit 1
fi

echo "■ Applying latest schema with Drizzle ..."
npm run db:migrate

if [ "$ready" != true ]; then
  echo "X Error: Neon Local did not become ready within $timeout checks."
  docker compose -f docker-compose.dev.yml ps
  docker compose -f docker-compose.dev.yml logs --no-color --tail 50 neon-local
  exit 1
fi

echo "Neon Local is ready."

echo ""
echo "Development environment started!"
echo "Application: http://localhost:5173"
echo "Database: postgres://neon:npg@localhost:5432/neondb"
echo ""
echo "To stop the environment, run: docker compose -f docker-compose.dev.yml down"
