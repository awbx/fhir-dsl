export interface OperationOutcome {
  resourceType: "OperationOutcome";
  issue: OperationOutcomeIssue[];
}

export interface OperationOutcomeIssue {
  severity: "fatal" | "error" | "warning" | "information";
  code: string;
  details?: { text?: string };
  diagnostics?: string;
  location?: string[];
  expression?: string[];
}

export class FhirError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly operationOutcome?: OperationOutcome | null,
  ) {
    const message =
      operationOutcome?.issue?.[0]?.diagnostics ??
      operationOutcome?.issue?.[0]?.details?.text ??
      `${status} ${statusText}`;
    super(`FHIR Error: ${message}`);
    this.name = "FhirError";
  }

  get issues(): OperationOutcomeIssue[] {
    return this.operationOutcome?.issue ?? [];
  }
}
