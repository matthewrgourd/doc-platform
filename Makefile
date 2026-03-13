.PHONY: help dev build serve typecheck clean docker-build docker-run docker-stop docker-compose-up docker-compose-dev docker-compose-down colima-start colima-stop colima-status monitoring-up monitoring-down monitoring-logs

help: ## Show this help
	@echo "Core (no Docker required):"
	@grep -E '^(dev|build|serve|typecheck|clean):.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Optional (Docker / self-hosted):"
	@grep -E '^(docker-|colima-|monitoring-)[a-z-]+:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

dev: ## Start local dev server
	npm start

build: ## Build static site
	npm run build

serve: build ## Build and serve locally
	npm run serve

typecheck: ## Run TypeScript type checking
	npm run typecheck

clean: ## Remove build artifacts and caches
	rm -rf build .docusaurus .cache-loader node_modules

colima-start: ## Start Colima container runtime
	colima start --cpu 2 --memory 4

colima-stop: ## Stop Colima container runtime
	colima stop

colima-status: ## Check Colima status
	colima status

docker-build: ## Build Docker image
	docker build -t devdocify:latest .

docker-run: docker-build ## Build and run in Docker
	docker run --rm -p 8080:80 --name devdocify devdocify:latest

docker-stop: ## Stop Docker container
	docker stop devdocify 2>/dev/null || true

docker-compose-up: ## Run production build via docker compose
	docker compose up --build -d docs

docker-compose-dev: ## Run dev server via docker compose (hot reload)
	docker compose --profile dev up --build docs-dev

docker-compose-down: ## Stop all docker compose services
	docker compose --profile dev --profile monitoring down

monitoring-up: ## Start docs + Prometheus + Grafana monitoring stack
	docker compose --profile monitoring up --build -d

monitoring-down: ## Stop monitoring stack
	docker compose --profile monitoring down

monitoring-logs: ## Tail logs from monitoring stack
	docker compose --profile monitoring logs -f
