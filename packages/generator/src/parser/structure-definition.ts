import { capitalizeFirst, fhirPathToPropertyName } from "@fhir-dsl/utils";
import type { BackboneElementModel, PropertyModel, ResourceModel, TypeRef } from "../model/resource-model.js";

// --- FHIR StructureDefinition types (minimal for parsing) ---

interface FhirTypeRef {
  code: string;
  targetProfile?: string[];
  profile?: string[];
}

interface FhirElementDefinition {
  id?: string;
  path: string;
  min?: number;
  max?: string;
  type?: FhirTypeRef[];
  short?: string;
  definition?: string;
  contentReference?: string;
}

interface FhirStructureDefinition {
  resourceType: "StructureDefinition";
  id?: string;
  url: string;
  name: string;
  kind: string;
  abstract: boolean;
  type: string;
  baseDefinition?: string;
  snapshot?: {
    element: FhirElementDefinition[];
  };
  differential?: {
    element: FhirElementDefinition[];
  };
}

// Properties defined on Resource and DomainResource base types.
// These are inherited and should not be re-emitted on concrete resources.
const RESOURCE_BASE_PROPS = new Set(["id", "meta", "implicitRules", "language"]);
const DOMAIN_RESOURCE_BASE_PROPS = new Set([
  ...RESOURCE_BASE_PROPS,
  "text",
  "contained",
  "extension",
  "modifierExtension",
]);

// Properties on BackboneElement that are inherited
const BACKBONE_BASE_PROPS = new Set(["id", "extension", "modifierExtension"]);

// FHIRPath system type URLs that appear as type codes in StructureDefinitions
const FHIRPATH_SYSTEM_TYPES: Record<string, string> = {
  "http://hl7.org/fhirpath/System.String": "string",
  "http://hl7.org/fhirpath/System.Boolean": "boolean",
  "http://hl7.org/fhirpath/System.Date": "date",
  "http://hl7.org/fhirpath/System.DateTime": "dateTime",
  "http://hl7.org/fhirpath/System.Decimal": "decimal",
  "http://hl7.org/fhirpath/System.Integer": "integer",
  "http://hl7.org/fhirpath/System.Time": "time",
};

// --- Parser ---

export function parseStructureDefinition(sd: FhirStructureDefinition): ResourceModel {
  const elements = sd.snapshot?.element ?? sd.differential?.element ?? [];
  const rootPath = sd.type;

  const directChildren = elements.filter((el) => {
    const path = el.path;
    if (path === rootPath) return false;
    const suffix = path.slice(rootPath.length + 1);
    return !suffix.includes(".");
  });

  const baseType = sd.baseDefinition ? extractTypeName(sd.baseDefinition) : undefined;

  // Determine which properties to skip (inherited from base)
  const skipProps =
    baseType === "DomainResource"
      ? DOMAIN_RESOURCE_BASE_PROPS
      : baseType === "Resource"
        ? RESOURCE_BASE_PROPS
        : new Set<string>();

  const backboneElements: BackboneElementModel[] = [];
  const properties: PropertyModel[] = [];

  for (const element of directChildren) {
    const propName = fhirPathToPropertyName(element.path);

    // Skip inherited properties
    if (skipProps.has(propName)) continue;

    const types = element.type ?? [];
    const isChoiceType = element.path.endsWith("[x]");

    if (isChoiceType) {
      const choiceProps = expandChoiceType(element);
      properties.push(...choiceProps);
      continue;
    }

    const isBackbone = types.some((t) => t.code === "BackboneElement");
    if (isBackbone) {
      const bbModel = parseBackboneElement(element, elements, sd.name, backboneElements);
      backboneElements.push(bbModel);
      properties.push({
        name: propName,
        types: [{ code: bbModel.name }],
        isRequired: (element.min ?? 0) > 0,
        isArray: element.max === "*",
        isChoiceType: false,
        description: element.short,
      });
      continue;
    }

    properties.push(elementToProperty(element, sd.name));
  }

  return {
    name: sd.name,
    url: sd.url,
    kind: normalizeKind(sd.kind),
    isAbstract: sd.abstract,
    baseType,
    properties,
    backboneElements,
    description: elements[0]?.definition,
  };
}

function elementToProperty(element: FhirElementDefinition, resourceName?: string): PropertyModel {
  const name = fhirPathToPropertyName(element.path);

  // Handle contentReference (e.g., "#Observation.referenceRange")
  if (element.contentReference && resourceName) {
    const refPath = element.contentReference.replace(/^#/, "");
    // Build backbone name from full path (e.g., "ClaimResponse.item.adjudication" → "ClaimResponseItemAdjudication")
    const pathSuffix = refPath.slice(resourceName.length + 1);
    const bbName = resourceName + pathSuffix.split(".").map(capitalizeFirst).join("");
    return {
      name,
      types: [{ code: bbName }],
      isRequired: (element.min ?? 0) > 0,
      isArray: element.max === "*",
      isChoiceType: false,
      description: element.short,
    };
  }

  const types: TypeRef[] = (element.type ?? []).map(fhirTypeRefToTypeRef);

  return {
    name,
    types,
    isRequired: (element.min ?? 0) > 0,
    isArray: element.max === "*",
    isChoiceType: false,
    description: element.short,
  };
}

function expandChoiceType(element: FhirElementDefinition): PropertyModel[] {
  const baseName = fhirPathToPropertyName(element.path).replace("[x]", "");
  const types = element.type ?? [];

  return types.map((type) => ({
    name: baseName + capitalizeFirst(resolveFhirPathType(type.code)),
    types: [fhirTypeRefToTypeRef(type)],
    isRequired: false,
    isArray: element.max === "*",
    isChoiceType: true,
    description: element.short,
  }));
}

function parseBackboneElement(
  element: FhirElementDefinition,
  allElements: FhirElementDefinition[],
  resourceName: string,
  allBackboneElements: BackboneElementModel[],
): BackboneElementModel {
  const bbPath = element.path;
  const children = allElements.filter((el) => {
    if (el.path === bbPath) return false;
    if (!el.path.startsWith(`${bbPath}.`)) return false;
    const suffix = el.path.slice(bbPath.length + 1);
    return !suffix.includes(".");
  });

  // Build name from full path to avoid collisions (e.g., ClaimResponse.item.detail vs ClaimResponse.addItem.detail)
  const pathSuffix = bbPath.slice(resourceName.length + 1); // e.g., "item.detail"
  const name = resourceName + pathSuffix.split(".").map(capitalizeFirst).join("");

  const properties: PropertyModel[] = [];
  for (const child of children) {
    const childPropName = fhirPathToPropertyName(child.path);
    // Skip inherited BackboneElement properties
    if (BACKBONE_BASE_PROPS.has(childPropName)) continue;

    const isChoice = child.path.endsWith("[x]");
    if (isChoice) {
      properties.push(...expandChoiceType(child));
      continue;
    }

    // Recursively handle nested backbone elements
    const childTypes = child.type ?? [];
    const isChildBackbone = childTypes.some((t) => t.code === "BackboneElement");
    if (isChildBackbone) {
      const nestedBb = parseBackboneElement(child, allElements, resourceName, allBackboneElements);
      allBackboneElements.push(nestedBb);
      properties.push({
        name: childPropName,
        types: [{ code: nestedBb.name }],
        isRequired: (child.min ?? 0) > 0,
        isArray: child.max === "*",
        isChoiceType: false,
        description: child.short,
      });
      continue;
    }

    properties.push(elementToProperty(child, resourceName));
  }

  return { name, path: bbPath, properties };
}

function fhirTypeRefToTypeRef(fhirType: FhirTypeRef): TypeRef {
  const targets = fhirType.targetProfile?.map(extractTypeName);
  const code = resolveFhirPathType(fhirType.code);
  return {
    code,
    targetProfiles: targets?.length ? targets : undefined,
  };
}

function resolveFhirPathType(code: string): string {
  return FHIRPATH_SYSTEM_TYPES[code] ?? code;
}

function extractTypeName(url: string): string {
  const parts = url.split("/");
  return parts[parts.length - 1]!;
}

function normalizeKind(kind: string): "resource" | "complex-type" | "primitive-type" {
  if (kind === "resource") return "resource";
  if (kind === "complex-type") return "complex-type";
  if (kind === "primitive-type") return "primitive-type";
  return "resource";
}
