up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose down
	docker compose up -d

logs:
	docker compose logs -f

build:
	docker compose build

dev-up:
	docker compose -f docker-compose.dev.yml up -d

dev-down:
	docker compose -f docker-compose.dev.yml down

dev-build:
	docker compose -f docker-compose.dev.yml up -d --build

re:
	docker compose down
	docker compose up -d --build

prune:
	docker system prune -a

logging-setup:
	ELASTICSEARCH_URL=http://localhost:9200 bash logging/scripts/setup-ilm.sh

clean:
	rm -rf apps/*/dist apps/*/data apps/*/node_modules
