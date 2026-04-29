import { capitalizeFirst, fhirPathToPropertyName } from "@fhir-dsl/utils";
import type {
  BackboneElementModel,
  BindingModel,
  InvariantModel,
  PropertyModel,
  ResourceModel,
  TypeRef,
} from "../model/resource-model.js";
import type { SpecCatalog } from "../spec/catalog.js";

interface FhirTypeRef {
  code: string;
  targetProfile?: string[] | undefined;
  profile?: string[] | undefined;
}

interface FhirElementDefinitionConstraint {
  key?: string | undefined;
  severity?: string | undefined;
  human?: string | undefined;
  expression?: string | undefined;
}

interface FhirElementDefinition {
  id?: string | undefined;
  path: string;
  min?: number | undefined;
  max?: string | undefined;
  type?: FhirTypeRef[] | undefined;
  short?: string | undefined;
  definition?: string | undefined;
  contentReference?: string | undefined;
  binding?: { strength?: string | undefined; valueSet?: string | undefined } | undefined;
  constraint?: FhirElementDefinitionConstraint[] | undefined;
}

interface FhirStructureDefinition {
  resourceType: "StructureDefinition";
  id?: string | undefined;
  url: string;
  name: string;
  kind: string;
  abstract: boolean;
  type: string;
  baseDefinition?: string | undefined;
  snapshot?: { element: FhirElementDefinition[] } | undefined;
  differential?: { element: FhirElementDefinition[] } | undefined;
}

export function parseStructureDefinition(sd: FhirStructureDefinition, catalog: SpecCatalog): ResourceModel {
  const elements = sd.snapshot?.element ?? sd.differential?.element ?? [];
  const rootPath = sd.type;

  const rootElement = elements.find((el) => el.path === rootPath);
  const rootInvariants = extractInvariants(rootElement?.constraint);

  const directChildren = elements.filter((el) => {
    const path = el.path;
    if (path === rootPath) return false;
    const suffix = path.slice(rootPath.length + 1);
    return !suffix.includes(".");
  });

  const baseType = sd.baseDefinition ? extractTypeName(sd.baseDefinition) : undefined;

  const skipProps = resolveBaseProps(catalog, baseType);

  const backboneElements: BackboneElementModel[] = [];
  const properties: PropertyModel[] = [];

  for (const element of directChildren) {
    const propName = fhirPathToPropertyName(element.path);

    if (skipProps.has(propName)) continue;

    const types = element.type ?? [];
    const isChoiceType = element.path.endsWith("[x]");

    if (isChoiceType) {
      const choiceProps = expandChoiceType(element, catalog);
      properties.push(...choiceProps);
      continue;
    }

    const isBackbone = types.some((t) => t.code === "BackboneElement");
    if (isBackbone) {
      const bbModel = parseBackboneElement(element, elements, sd.name, backboneElements, catalog);
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

    properties.push(elementToProperty(element, sd.name, catalog));
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
    invariants: rootInvariants,
  };
}

function resolveBaseProps(catalog: SpecCatalog, baseType: string | undefined): Set<string> {
  if (baseType === "DomainResource") {
    return catalog.baseProperties.get("DomainResource") ?? new Set();
  }
  if (baseType === "Resource") {
    return catalog.baseProperties.get("Resource") ?? new Set();
  }
  return new Set();
}

function elementToProperty(
  element: FhirElementDefinition,
  resourceName: string | undefined,
  catalog: SpecCatalog,
): PropertyModel {
  const name = fhirPathToPropertyName(element.path);

  if (element.contentReference && resourceName) {
    const refPath = element.contentReference.replace(/^#/, "");
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

  const types: TypeRef[] = (element.type ?? []).map((t) => fhirTypeRefToTypeRef(t, catalog));
  const binding = extractBinding(element);

  return {
    name,
    types,
    isRequired: (element.min ?? 0) > 0,
    isArray: element.max === "*",
    isChoiceType: false,
    description: element.short,
    binding,
  };
}

function expandChoiceType(element: FhirElementDefinition, catalog: SpecCatalog): PropertyModel[] {
  const baseName = fhirPathToPropertyName(element.path).replace("[x]", "");
  const types = element.type ?? [];
  const binding = extractBinding(element);

  return types.map((type) => ({
    name: baseName + capitalizeFirst(resolveFhirPathType(type.code, catalog)),
    types: [fhirTypeRefToTypeRef(type, catalog)],
    isRequired: false,
    isArray: element.max === "*",
    isChoiceType: true,
    description: element.short,
    binding,
  }));
}

function parseBackboneElement(
  element: FhirElementDefinition,
  allElements: FhirElementDefinition[],
  resourceName: string,
  allBackboneElements: BackboneElementModel[],
  catalog: SpecCatalog,
): BackboneElementModel {
  const bbPath = element.path;
  const children = allElements.filter((el) => {
    if (el.path === bbPath) return false;
    if (!el.path.startsWith(`${bbPath}.`)) return false;
    const suffix = el.path.slice(bbPath.length + 1);
    return !suffix.includes(".");
  });

  const pathSuffix = bbPath.slice(resourceName.length + 1);
  const name = resourceName + pathSuffix.split(".").map(capitalizeFirst).join("");

  const invariants = extractInvariants(element.constraint);
  const backboneBaseProps = catalog.baseProperties.get("BackboneElement") ?? new Set<string>();
  const properties: PropertyModel[] = [];
  for (const child of children) {
    const childPropName = fhirPathToPropertyName(child.path);
    if (backboneBaseProps.has(childPropName)) continue;

    const isChoice = child.path.endsWith("[x]");
    if (isChoice) {
      properties.push(...expandChoiceType(child, catalog));
      continue;
    }

    const childTypes = child.type ?? [];
    const isChildBackbone = childTypes.some((t) => t.code === "BackboneElement");
    if (isChildBackbone) {
      const nestedBb = parseBackboneElement(child, allElements, resourceName, allBackboneElements, catalog);
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

    properties.push(elementToProperty(child, resourceName, catalog));
  }

  return { name, path: bbPath, properties, invariants };
}

function extractInvariants(constraints: FhirElementDefinitionConstraint[] | undefined): InvariantModel[] | undefined {
  if (!constraints?.length) return undefined;
  const out: InvariantModel[] = [];
  for (const c of constraints) {
    if (!c.key || !c.expression || !c.human) continue;
    if (c.severity !== "error" && c.severity !== "warning") continue;
    out.push({ key: c.key, severity: c.severity, human: c.human, expression: c.expression });
  }
  return out.length > 0 ? out : undefined;
}

function fhirTypeRefToTypeRef(fhirType: FhirTypeRef, catalog: SpecCatalog): TypeRef {
  const targets = fhirType.targetProfile?.map(extractTypeName);
  const code = resolveFhirPathType(fhirType.code, catalog);
  return {
    code,
    targetProfiles: targets?.length ? targets : undefined,
  };
}

function resolveFhirPathType(code: string, catalog: SpecCatalog): string {
  return catalog.fhirpathSystemTypes.get(code) ?? code;
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

const VALID_BINDING_STRENGTHS = new Set(["required", "extensible", "preferred", "example"]);

function extractBinding(element: FhirElementDefinition): BindingModel | undefined {
  const b = element.binding;
  if (!b?.strength || !b.valueSet) return undefined;
  if (!VALID_BINDING_STRENGTHS.has(b.strength)) return undefined;
  return {
    strength: b.strength as BindingModel["strength"],
    valueSet: b.valueSet,
  };
}
