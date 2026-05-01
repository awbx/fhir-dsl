import { FhirDslError } from "@fhir-dsl/utils";

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

export interface FhirErrorContext {
  readonly status: number;
  readonly statusText: string;
  readonly operationOutcome?: OperationOutcome | null;
  readonly responseText?: string;
}

export class FhirError extends FhirDslError<"runtime.fhir", FhirErrorContext> {
  readonly kind = "runtime.fhir" as const;
  readonly status: number;
  readonly statusText: string;
  readonly operationOutcome?: OperationOutcome | null;
  // BUG-022: gateways and auth proxies commonly return text/html on failure.
  // Losing that body leaves the caller with just a status code, so carry
  // the raw text whenever we couldn't parse it as JSON.
  readonly responseText?: string;

  constructor(status: number, statusText: string, operationOutcome?: OperationOutcome | null, responseText?: string) {
    const message =
      operationOutcome?.issue?.[0]?.diagnostics ??
      operationOutcome?.issue?.[0]?.details?.text ??
      `${status} ${statusText}`;
    super(`FHIR Error: ${message}`, {
      status,
      statusText,
      ...(operationOutcome !== undefined ? { operationOutcome } : {}),
      ...(responseText !== undefined ? { responseText } : {}),
    });
    this.status = status;
    this.statusText = statusText;
    if (operationOutcome !== undefined) this.operationOutcome = operationOutcome;
    if (responseText !== undefined) this.responseText = responseText;
  }

  get issues(): OperationOutcomeIssue[] {
    return this.operationOutcome?.issue ?? [];
  }
}
