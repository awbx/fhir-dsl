import { toKebabCase } from "@fhir-dsl/utils";
import type { ProfileModel } from "../model/profile-model.js";
import type {
  BackboneElementModel,
  PropertyModel,
  ResourceModel,
  ResourceSearchParams,
  SearchParamModel,
  TypeRef,
} from "../model/resource-model.js";

export function emitResourceSpec(model: ResourceModel, searchParams?: ResourceSearchParams): string {
  const lines: string[] = [];

  lines.push(`# ${model.name}`);
  lines.push("");
  lines.push(`- **URL:** ${model.url}`);
  lines.push(`- **Kind:** ${model.kind}`);
  if (model.baseType) lines.push(`- **Base:** ${model.baseType}`);
  lines.push("");

  if (model.description) {
    lines.push(normalizeBlock(model.description));
    lines.push("");
  }

  if (model.properties.length > 0) {
    lines.push("## Properties");
    lines.push("");
    lines.push(...renderPropertyTable(model.properties));
    lines.push("");
  }

  if (model.backboneElements.length > 0) {
    lines.push("## Backbone elements");
    lines.push("");
    for (const bb of model.backboneElements) {
      lines.push(...renderBackbone(bb));
    }
  }

  if (searchParams && searchParams.params.length > 0) {
    lines.push("## Search parameters");
    lines.push("");
    lines.push(...renderSearchParamTable(searchParams.params));
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

export function emitProfileSpec(profile: ProfileModel): string {
  const lines: string[] = [];

  lines.push(`# ${profile.name}`);
  lines.push("");
  lines.push(`- **URL:** ${profile.url}`);
  lines.push(`- **Base resource:** ${profile.baseResourceType}`);
  lines.push(`- **IG:** ${profile.igName}`);
  lines.push("");

  if (profile.description) {
    lines.push(normalizeBlock(profile.description));
    lines.push("");
  }

  if (profile.constrainedProperties.length > 0) {
    lines.push("## Constrained properties");
    lines.push("");
    lines.push(
      `Only properties that are narrowed relative to \`${profile.baseResourceType}\` are shown. All other properties from the base resource still apply.`,
    );
    lines.push("");
    lines.push(...renderPropertyTable(profile.constrainedProperties));
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

export function emitSpecIndex(version: string, resources: ResourceModel[], profiles: ProfileModel[]): string {
  const lines: string[] = [];

  lines.push(`# FHIR ${version.toUpperCase()} spec`);
  lines.push("");
  lines.push(
    "Generated markdown summary of the FHIR resources and profiles included in this build. Intended as context for AI assistants working against the generated TypeScript types.",
  );
  lines.push("");

  if (resources.length > 0) {
    lines.push("## Resources");
    lines.push("");
    const sortedResources = [...resources].sort((a, b) => a.name.localeCompare(b.name));
    for (const r of sortedResources) {
      const summary = r.description ? ` — ${oneLine(r.description)}` : "";
      lines.push(`- [${r.name}](./resources/${toKebabCase(r.name)}.md)${summary}`);
    }
    lines.push("");
  }

  if (profiles.length > 0) {
    lines.push("## Profiles");
    lines.push("");
    const sortedProfiles = [...profiles].sort((a, b) => a.name.localeCompare(b.name));
    for (const p of sortedProfiles) {
      const summary = p.description ? ` — ${oneLine(p.description)}` : "";
      lines.push(`- [${p.name}](./profiles/${toKebabCase(p.name)}.md) _(${p.baseResourceType})_${summary}`);
    }
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

function renderBackbone(bb: BackboneElementModel): string[] {
  const lines: string[] = [];
  lines.push(`### ${bb.name}`);
  lines.push("");
  lines.push(`Path: \`${bb.path}\``);
  lines.push("");
  if (bb.properties.length > 0) {
    lines.push(...renderPropertyTable(bb.properties));
    lines.push("");
  }
  return lines;
}

function renderPropertyTable(properties: PropertyModel[]): string[] {
  const lines: string[] = [];
  lines.push("| Name | Card | Type | Binding | Description |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const prop of properties) {
    lines.push(
      `| ${escapeCell(prop.name)} | ${cardinality(prop)} | ${escapeCell(formatTypes(prop.types))} | ${escapeCell(formatBinding(prop))} | ${escapeCell(prop.description ?? "")} |`,
    );
  }
  return lines;
}

function renderSearchParamTable(params: SearchParamModel[]): string[] {
  const lines: string[] = [];
  lines.push("| Name | Type | Expression | Description |");
  lines.push("| --- | --- | --- | --- |");
  const sorted = [...params].sort((a, b) => a.code.localeCompare(b.code));
  for (const sp of sorted) {
    lines.push(
      `| ${escapeCell(sp.code)} | ${escapeCell(sp.type)} | ${escapeCell(sp.expression ?? "")} | ${escapeCell(sp.description ?? "")} |`,
    );
  }
  return lines;
}

function cardinality(prop: PropertyModel): string {
  const min = prop.isRequired ? "1" : "0";
  const max = prop.isArray ? "*" : "1";
  return `${min}..${max}`;
}

function formatTypes(types: TypeRef[]): string {
  if (types.length === 0) return "unknown";
  return types
    .map((t) => {
      if (t.code === "Reference" && t.targetProfiles?.length) {
        return `Reference(${t.targetProfiles.join(" | ")})`;
      }
      return t.code;
    })
    .join(" | ");
}

function formatBinding(prop: PropertyModel): string {
  if (!prop.binding) return "";
  return `${prop.binding.strength} @ ${prop.binding.valueSet}`;
}

function escapeCell(text: string): string {
  return text
    .replace(/\r?\n+/g, " ")
    .replace(/\|/g, "\\|")
    .trim();
}

function normalizeBlock(text: string): string {
  return text.trim();
}

function oneLine(text: string): string {
  const first = text.split(/\r?\n/)[0] ?? "";
  return first.replace(/\|/g, "\\|").trim();
}
