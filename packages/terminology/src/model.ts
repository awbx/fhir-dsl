export interface ResolvedCode {
  code: string;
  display?: string | undefined;
  system?: string | undefined;
}

export interface ResolvedValueSet {
  url: string;
  name: string;
  version?: string | undefined;
  codes: ResolvedCode[];
  /** true if all includes were resolved offline; false if some were skipped */
  isComplete: boolean;
}

export interface CodeSystemModel {
  url: string;
  name: string;
  content: "complete" | "not-present" | "example" | "fragment" | "supplement";
  concepts: ResolvedCode[];
}
