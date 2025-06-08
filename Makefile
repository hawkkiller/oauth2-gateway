.PHONY: up
up:
	docker compose \
		-f deploy/docker/docker-compose.base.yml \
		-f deploy/docker/docker-compose.ory.yml \
		-f deploy/docker/docker-compose.echo.yml \
		-f deploy/docker/docker-compose.gateway.yml \
		-f deploy/docker/docker-compose.traefik.yml \
		up

.PHONY: ps
ps:
	docker compose \
		-f deploy/docker/docker-compose.base.yml \
		-f deploy/docker/docker-compose.ory.yml \
		-f deploy/docker/docker-compose.echo.yml \
		-f deploy/docker/docker-compose.gateway.yml \
		-f deploy/docker/docker-compose.traefik.yml \
		ps