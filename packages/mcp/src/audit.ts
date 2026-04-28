import type { AuditEvent, AuditSink } from "./types.js";

// Default audit sink — writes one JSON object per event to stderr. The
// shape mirrors common log-aggregation expectations (timestamp, level,
// payload); production deployments swap this for whatever ingests their
// observability stack.

export class JsonLogAuditSink implements AuditSink {
  constructor(private readonly write: (line: string) => void = (line) => process.stderr.write(`${line}\n`)) {}

  record(event: AuditEvent): void {
    const level = event.result.ok ? "info" : "warn";
    const payload = {
      ts: event.ts,
      level,
      kind: "fhir-mcp.audit",
      id: event.id,
      verb: event.call.verb,
      resourceType: event.call.resourceType,
      resourceId: event.call.id,
      ok: event.result.ok,
      latencyMs: event.result.latencyMs,
      actor: event.actor,
      correlationId: event.correlationId,
    };
    this.write(JSON.stringify(payload));
  }
}

/** Discard-all sink — useful for tests. */
export class NullAuditSink implements AuditSink {
  record(): void {}
}

/** In-memory sink with a `.events` array — the canonical test sink. */
export class MemoryAuditSink implements AuditSink {
  readonly events: AuditEvent[] = [];
  record(event: AuditEvent): void {
    this.events.push(event);
  }
}
