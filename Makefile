.PHONY: up
up:
	docker compose \
		-f deploy/docker/docker-compose.base.yml \
		-f deploy/docker/docker-compose.ory.yml \
		-f deploy/docker/docker-compose.echo.yml \
		-f deploy/docker/docker-compose.gateway.yml \
		-f deploy/docker/docker-compose.traefik.yml \
		up

.PHONY: upd
upd:
	docker compose \
		-f deploy/docker/docker-compose.base.yml \
		-f deploy/docker/docker-compose.ory.yml \
		-f deploy/docker/docker-compose.echo.yml \
		-f deploy/docker/docker-compose.gateway.yml \
		-f deploy/docker/docker-compose.traefik.yml \
		up -d --build

.PHONY: watch
watch:
	docker compose \
		-f deploy/docker/docker-compose.base.yml \
		-f deploy/docker/docker-compose.ory.yml \
		-f deploy/docker/docker-compose.echo.yml \
		-f deploy/docker/docker-compose.gateway.yml \
		-f deploy/docker/docker-compose.traefik.yml \
		up --watch

.PHONY: ps
ps:
	docker compose \
		-f deploy/docker/docker-compose.base.yml \
		-f deploy/docker/docker-compose.ory.yml \
		-f deploy/docker/docker-compose.echo.yml \
		-f deploy/docker/docker-compose.gateway.yml \
		-f deploy/docker/docker-compose.traefik.yml \
		ps