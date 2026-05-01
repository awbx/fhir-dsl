import { formatError } from "#/lib/error-toast";

/**
 * Inline error surface used by query-result panels. For toast-style
 * notifications use the Sonner integration; this component is for embedded
 * "the data didn't load" panels.
 */
export function ErrorBlock({ err }: { err: unknown }) {
	const f = formatError(err);
	return (
		<div className="space-y-1 rounded border border-destructive/40 bg-destructive/5 p-4">
			<div className="font-medium text-destructive">{f.title}</div>
			<div className="text-sm text-muted-foreground">{f.description}</div>
			{f.kind ? <code className="font-mono text-xs text-muted-foreground">kind={f.kind}</code> : null}
		</div>
	);
}
