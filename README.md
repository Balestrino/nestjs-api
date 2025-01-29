# Develop

## Start stack

- docker compose -f compose.dev.yaml up -d
- docker compose -f compose.dev.yaml up -d --build
- docker compose -f compose.dev.yaml down

## Install a new library

- npm install class-transformer
- docker compose -f compose.dev.yaml exec api npm install class-transformer
