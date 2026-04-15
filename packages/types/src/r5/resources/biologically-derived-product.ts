import type {
  Attachment,
  BackboneElement,
  CodeableConcept,
  Coding,
  DomainResource,
  Identifier,
  Period,
  Quantity,
  Range,
  Ratio,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirDateTime, FhirInteger, FhirString } from "../primitives.js";

export interface BiologicallyDerivedProductCollection extends BackboneElement {
  collector?: Reference<"Practitioner" | "PractitionerRole">;
  source?: Reference<"Patient" | "Organization">;
  collectedDateTime?: FhirDateTime;
  collectedPeriod?: Period;
}

export interface BiologicallyDerivedProductProperty extends BackboneElement {
  type: CodeableConcept;
  valueBoolean?: FhirBoolean;
  valueInteger?: FhirInteger;
  valueCodeableConcept?: CodeableConcept;
  valuePeriod?: Period;
  valueQuantity?: Quantity;
  valueRange?: Range;
  valueRatio?: Ratio;
  valueString?: FhirString;
  valueAttachment?: Attachment;
}

export interface BiologicallyDerivedProduct extends DomainResource {
  resourceType: "BiologicallyDerivedProduct";
  productCategory?: Coding;
  productCode?: CodeableConcept;
  parent?: Reference<"BiologicallyDerivedProduct">[];
  request?: Reference<"ServiceRequest">[];
  identifier?: Identifier[];
  biologicalSourceEvent?: Identifier;
  processingFacility?: Reference<"Organization">[];
  division?: FhirString;
  productStatus?: Coding;
  expirationDate?: FhirDateTime;
  collection?: BiologicallyDerivedProductCollection;
  storageTempRequirements?: Range;
  property?: BiologicallyDerivedProductProperty[];
}
