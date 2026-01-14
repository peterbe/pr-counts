import { resolve } from "node:path";
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
	"sleep-seconds": v.optional(v.number()),
	"days-back": v.optional(v.number()),
});

type ConfigData = v.InferOutput<typeof ConfigSchema>;

const DEFAULT_SLEEP_SECONDS = 0;
const DEFAULT_DAYS_BACK = 1;

export async function byUsersByConfig({
	configfile,
	includeDrafts = false,
	daysBack = null,
	forceRefresh = false,
	sleepSeconds = null,
	date = "",
}: {
	configfile: string;
	includeDrafts?: boolean;
	daysBack?: number | string | null;
	forceRefresh?: boolean;
	sleepSeconds?: number | string | null;
	date?: string;
}) {
	const configfileFile = Bun.file(configfile);
	console.log(`Loading config from ${resolve(configfile)}`);
	if (!(await configfileFile.exists())) {
		throw new Error(`Config file ${configfile} does not exist`);
	}
	const raw = await configfileFile.json();
	const config = getConfigFromRaw(raw);
	const { org, repo, users } = config;

	sleepSeconds =
		"sleep-seconds" in config
			? (config["sleep-seconds"] as number)
			: Number(sleepSeconds ?? DEFAULT_SLEEP_SECONDS);
	daysBack =
		"days-back" in config
			? (config["days-back"] as number)
			: Number(daysBack ?? DEFAULT_DAYS_BACK);

	await byUsers({
		org,
		repo,
		users,
		includeDrafts,
		daysBack,
		forceRefresh,
		sleepSeconds,
		date,
	});
}

function getConfigFromRaw(raw: object): ConfigData {
	const result = v.safeParse(ConfigSchema, raw);
	if (result.success) {
		const suppliedKeys = new Set(Object.keys(raw));
		const schemaKeys = new Set(Object.keys(result.output));
		const excessKeys = [...suppliedKeys].filter((x) => !schemaKeys.has(x));
		if (excessKeys.length > 0) {
			console.warn(
				`Warning: Excess keys in config file not recognized by schema: ${excessKeys.join(", ")}`,
			);
		}
		return result.output;
	} else {
		console.error(result.issues);
		throw new Error("Invalid config file");
	}
}
