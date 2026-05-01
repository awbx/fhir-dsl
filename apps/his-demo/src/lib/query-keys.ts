export const queryKeys = {
	patients: {
		all: ["patients"] as const,
		list: (filters: { q?: string; gender?: string; from?: string }) =>
			["patients", "list", filters] as const,
		detail: (id: string) => ["patients", "detail", id] as const,
		vitals: (id: string) => ["patients", "vitals", id] as const,
		conditions: (id: string) => ["patients", "conditions", id] as const,
	},
	smart: {
		session: ["smart", "session"] as const,
	},
	mcp: {
		audit: ["mcp", "audit"] as const,
	},
};
