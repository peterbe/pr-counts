# pr-counts

## Get started

You need [Bun](https://bun.com) and [`just`](https://github.com/casey/just) installed.
You also need a PostgreSQL server. The default `DATABASE_URL` is `postgres://localhost:5432/pr-counts`.

So, first you need to create a postgres database called `pr-counts`

Run:

```bash
just install
```

To set up the postgresql table(s), run:

```bash
just migrate
```

Next you need to create a config file called `local-config.json` that is tailored for
your needs. Here's what mine looks like:

```jsonc
{
	"org": "capitalrx",
	"repo": "code.capitalrx.com",
	"users": [
		{ "username": "peterbe" },
		{ "username": "tom", "startDate": "2025-12-15" },
		{ "username": "dick" },
		{ "username": "harry" }
	],
	"sleep-seconds": 2,
	"days-back": 10
}
```

Lastly, you need a Personal Access Token that can be used for the org/repo
you put into your config file.
For enterprise accounts where you need to Authorize for SSO, you can use a classic
PAT. Put the PAT to a file called `.env`. Here's mine looks like:

```text
# Generated as classic here https://github.com/settings/tokens/1234567789
GITHUB_TOKEN=ghp_deadbeef00000000000000011111111222222
```

Now, to start scraping you can use:

```bash
just scrape
```

It takes a long time because it queries for each user for each day. It's retroactive
so if you add a user to the config file, it can backfill (see the `days-back` setting).

To view it all in your browser run:

```bash
just dev
```

