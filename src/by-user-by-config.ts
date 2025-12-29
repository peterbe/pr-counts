import * as v from "valibot";
import { byUsers } from "./by-user";

const UserSchema = v.object({
	username: v.string(),
	startDate: v.optional(v.string()),
});

const ConfigSchema = v.object({
	org: v.string(),
	repo: v.string(),
	users: v.array(UserSchema),
});

type ConfigData = v.InferOutput<typeof ConfigSchema>;

export async function byUsersByConfig({
	configfile,
	includeDrafts = false,
	daysBack = 1,
	forceRefresh = false,
	sleepSeconds = 0,
}: {
	configfile: string;
	includeDrafts?: boolean;
	daysBack?: number | string;
	forceRefresh?: boolean;
	sleepSeconds?: number | string;
}) {
	sleepSeconds = Number(sleepSeconds);
	daysBack = Number(daysBack);

	const configfileFile = Bun.file(configfile);
	console.log(`Loading config from ${configfile}`);
	if (!(await configfileFile.exists())) {
		throw new Error(`Config file ${configfile} does not exist`);
	}
	const raw = await configfileFile.json();
	const config = getConfigFromRaw(raw);
	const { org, repo, users } = config;

	await byUsers({
		org,
		repo,
		users,
		includeDrafts,
		daysBack,
		forceRefresh,
		sleepSeconds,
	});
	// }
}

function getConfigFromRaw(raw: unknown): ConfigData {
	const result = v.safeParse(ConfigSchema, raw);
	if (result.success) {
		return result.output;
	} else {
		console.error(result.issues);
		throw new Error("Invalid config file");
	}
}
