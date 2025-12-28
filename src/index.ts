import { Command } from "commander";
// import { byTeam } from "./by-team";
import { byUsers } from "./by-user";

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
	.option("--days-back <number>", "Number of days ago to look back")
	.description("Computes all PR activity by user")
	.action((org, repo, usernames, options) => {
		wrap(
			byUsers({
				org,
				repo,
				usernames,
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
