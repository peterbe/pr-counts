# https://github.com/casey/just
# https://just.systems/



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
    cd packages/scraper && bunx drizzle-kit generate

migrate:
    cd packages/scraper &&bunx drizzle-kit migrate

scrape:
    bun run packages/scraper/src/index.ts by-config peterbe-config.json

export-db:
    bun run packages/scraper/src/index.ts export-json packages/webapp/public/exports

export: export-db

dev: export-db
    bun run --filter webapp dev

build:
    bun run --filter webapp build

start: build export-db
    bun run --filter webapp preview
