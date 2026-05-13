# https://github.com/casey/just
# https://just.systems/



tsc:
    bun run --filter scraper tsc
    bun run --filter webapp tsc

lint: tsc
    bun run lint

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
    bun update --filter scraper --interactive --minimum-release-age=86400 && bun install
    bun update --filter webapp --interactive --minimum-release-age=86400 && bun install

make-migrations:
    bun run --filter scraper make-migrations

migrate:
    bun run --filter scraper migrate

scrape:
    bun run packages/scraper/src/index.ts by-config local-config.json

export-json:
    bun run packages/scraper/src/index.ts export-json packages/webapp/public/exports

export: export-json

dev: export-json
    bun run --filter webapp dev

build:
    bun run --filter webapp build

start: build export-json
    bun run --filter webapp preview
