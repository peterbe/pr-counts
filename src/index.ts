import { Command } from "commander";
import { byUsers } from "./by-user";
import { byUsersByConfig } from "./by-user-by-config";

const program = new Command();
program
	.name("pr-counts")
	.description("CLI tool to figure out which PRs need reviews");
//   .version(version)

program
	.command("by-user")
	.argument("[org]", "Org name")
	.argument("[repo]", "Repo name")
	.argument("[username]", "User name")
	.option("--debug", "Debug mode (shows traceback)")
	.option("--days-ago <number>", "Number of days ago to look back")
	.option("--date <date>", "Specific date to process")
	.description("Computes all PR activity by user")
	.action((org, repo, username, options) => {
		wrap(
			byUsers({
				org,
				repo,
				usernames: [username],
				...options,
			}),
			options.debug,
		);
	});

program
	.command("by-users")
	.argument("[org]", "Org name")
	.argument("[repo]", "Repo name")
	.argument("[usernames...]", "User names")
	.option("--debug", "Debug mode (shows traceback)")
	.option("--force-refresh", "Ignore any previously stored data")
	.option("--days-back <number>", "Number of days ago to look back")
	.option("--date <date>", "Specific date to process")
	.option(
		"--sleep-seconds <number>",
		"Number of seconds to sleep between requests",
	)
	.description("Computes all PR activity by user")
	.action((org, repo, users, options) => {
		wrap(
			byUsers({
				org,
				repo,
				users,
				...options,
			}),
			options.debug,
		);
	});

program
	.command("by-config")
	.argument("[configfile]", "Config file (e.g. config.json)")
	.option("--debug", "Debug mode (shows traceback)")
	.option("--force-refresh", "Ignore any previously stored data")
	.option("--days-back <number>", "Number of days ago to look back")
	.option("--date <date>", "Specific date to process")
	.option(
		"--sleep-seconds <number>",
		"Number of seconds to sleep between requests",
	)
	.description("Computes all PR activity by users in config file")
	.action((configfile, options) => {
		wrap(
			byUsersByConfig({
				configfile,
				...options,
			}),
			options.debug,
		);
	});

program.parse();

function wrap(promise: Promise<void>, debug: boolean) {
	promise
		.then(() => {
			process.exit(0);
		})
		.catch((err) => {
			if (err instanceof Error && err.name === "ExitPromptError") {
				// Ctrl-C
				process.exit(0);
			}

			if (debug) {
				throw err;
			}
			console.error(err.message);
			process.exit(1);
		});
}
