# https://github.com/casey/just
# https://just.systems/

dev-with-proxy:
    VITE_API_TARGET=https://admin.peterbe.com bun run dev -- --port 4001

dev-for-testing:
    NODE_ENV=test bun run dev -- --port 4001

build:
    bun run build

start: build
    bun  run preview -- --port 4001

start-with-proxy: build
    VITE_API_TARGET=https://admin.peterbe.com bun run preview -- --port 4001

start-for-testing:
    NODE_ENV=test bun run build
    NODE_ENV=test bun run preview -- --port 3000

tsc:
    bun run tsc

lint:
    bun run lint
    bun run tsc

lintfix:
    bun run lint:fix

format: lintfix

install:
    bun install

outdated:
    bun outdated

test-manifest:
    bun run test-manifest -- http://localhost:3000

test:
    bun run test

upgrade:
    bun update --interactive
    bun install


make-migrations:
    bunx drizzle-kit generate

migrate:
    bunx drizzle-kit migrate

scrape:
    bun run packages/scraper/src/index.ts by-config peterbe-config.json

dev:
    bun run --filter webapp dev
