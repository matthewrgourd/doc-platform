.PHONY: help dev build serve docker-build docker-run docker-stop clean typecheck colima-start colima-stop colima-status monitoring-up monitoring-down monitoring-logs

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Start local dev server
	npm start

colima-start: ## Start Colima container runtime
	colima start --cpu 2 --memory 4

colima-stop: ## Stop Colima container runtime
	colima stop

colima-status: ## Check Colima status
	colima status

build: ## Build static site
	npm run build

serve: build ## Build and serve locally
	npm run serve

typecheck: ## Run TypeScript type checking
	npm run typecheck

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

clean: ## Remove build artifacts and caches
	rm -rf build .docusaurus .cache-loader node_modules
