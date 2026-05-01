import type { StoredToken, TokenStore } from "@fhir-dsl/smart";

/**
 * Browser-side `TokenStore` backed by `localStorage`. SmartClient persists
 * the token set here so it survives page reloads. The schema is plain JSON;
 * production deployments should encrypt at rest.
 */
export class LocalStorageTokenStore implements TokenStore {
	readonly #prefix: string;

	constructor(prefix = "fhir-dsl:smart:") {
		this.#prefix = prefix;
	}

	async get(key: string): Promise<StoredToken | undefined> {
		if (typeof localStorage === "undefined") return undefined;
		const raw = localStorage.getItem(this.#prefix + key);
		if (raw === null) return undefined;
		try {
			return JSON.parse(raw) as StoredToken;
		} catch {
			return undefined;
		}
	}

	async set(key: string, value: StoredToken): Promise<void> {
		if (typeof localStorage === "undefined") return;
		localStorage.setItem(this.#prefix + key, JSON.stringify(value));
	}

	async delete(key: string): Promise<void> {
		if (typeof localStorage === "undefined") return;
		localStorage.removeItem(this.#prefix + key);
	}

	/** Synchronous read — used by route loaders that need to short-circuit on missing tokens. */
	getSync(key: string): StoredToken | undefined {
		if (typeof localStorage === "undefined") return undefined;
		const raw = localStorage.getItem(this.#prefix + key);
		if (raw === null) return undefined;
		try {
			return JSON.parse(raw) as StoredToken;
		} catch {
			return undefined;
		}
	}
}

export const tokenStore = new LocalStorageTokenStore();
