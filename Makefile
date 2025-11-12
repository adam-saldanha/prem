# Premier League Analytics Dashboard - Makefile

.PHONY: help build up down restart logs clean test deploy

# Default target
help:
	@echo "Premier League Analytics Dashboard - Available Commands:"
	@echo ""
	@echo "  make build      - Build all Docker images"
	@echo "  make up         - Start all services"
	@echo "  make down       - Stop all services"
	@echo "  make restart    - Restart all services"
	@echo "  make logs       - View logs from all services"
	@echo "  make clean      - Clean up Docker resources"
	@echo "  make test       - Run tests"
	@echo "  make deploy     - Deploy to production"
	@echo "  make backup     - Backup database"
	@echo "  make restore    - Restore database from backup"
	@echo "  make dev        - Start in development mode"
	@echo "  make prod       - Start in production mode"
	@echo ""

# Build Docker images
build:
	@echo "Building Docker images..."
	docker-compose build

# Start all services
up:
	@echo "Starting all services..."
	docker-compose up -d
	@echo "Services started successfully!"
	@echo "Frontend: http://localhost"
	@echo "Backend: http://localhost:8080/api"

# Stop all services
down:
	@echo "Stopping all services..."
	docker-compose down

# Restart all services
restart:
	@echo "Restarting all services..."
	docker-compose restart

# View logs
logs:
	docker-compose logs -f

# Clean up Docker resources
clean:
	@echo "Cleaning up Docker resources..."
	docker-compose down -v
	docker system prune -af

# Run tests
test:
	@echo "Running backend tests..."
	cd backend && mvn test
	@echo "Running frontend tests..."
	cd frontend && npm test

# Deploy to production
deploy:
	@echo "Deploying to production..."
	./deploy.sh

# Backup database
backup:
	@echo "Backing up database..."
	@mkdir -p backups
	docker-compose exec -T postgres pg_dump -U postgres premierleague > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Backup completed!"

# Restore database
restore:
	@echo "Restoring database from latest backup..."
	@LATEST_BACKUP=$$(ls -t backups/*.sql | head -1); \
	if [ -z "$$LATEST_BACKUP" ]; then \
		echo "No backup found!"; \
		exit 1; \
	fi; \
	echo "Restoring from $$LATEST_BACKUP..."; \
	docker-compose exec -T postgres psql -U postgres premierleague < $$LATEST_BACKUP
	@echo "Restore completed!"

# Development mode
dev:
	@echo "Starting in development mode..."
	docker-compose -f docker-compose.yml up

# Production mode
prod:
	@echo "Starting in production mode..."
	docker-compose -f docker-compose.yml up -d

# Service-specific commands
backend-logs:
	docker-compose logs -f backend

frontend-logs:
	docker-compose logs -f frontend

db-logs:
	docker-compose logs -f postgres

backend-shell:
	docker-compose exec backend /bin/sh

frontend-shell:
	docker-compose exec frontend /bin/sh

db-shell:
	docker-compose exec postgres psql -U postgres -d premierleague

# Health check
health:
	@echo "Checking service health..."
	@curl -f http://localhost:8080/api/clubs > /dev/null 2>&1 && echo "✓ Backend is healthy" || echo "✗ Backend is down"
	@curl -f http://localhost > /dev/null 2>&1 && echo "✓ Frontend is healthy" || echo "✗ Frontend is down"
	@docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1 && echo "✓ Database is healthy" || echo "✗ Database is down"
