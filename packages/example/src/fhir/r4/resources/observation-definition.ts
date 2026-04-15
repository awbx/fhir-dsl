import type { FhirBoolean, FhirCode, FhirDecimal, FhirInteger, FhirString } from "../primitives.js";
import type { BackboneElement, CodeableConcept, DomainResource, Identifier, Range, Reference } from "../datatypes.js";

export interface ObservationDefinitionQuantitativeDetails extends BackboneElement {
  customaryUnit?: CodeableConcept;
  unit?: CodeableConcept;
  conversionFactor?: FhirDecimal;
  decimalPrecision?: FhirInteger;
}

export interface ObservationDefinitionQualifiedInterval extends BackboneElement {
  category?: FhirCode;
  range?: Range;
  context?: CodeableConcept;
  appliesTo?: CodeableConcept[];
  gender?: FhirCode;
  age?: Range;
  gestationalAge?: Range;
  condition?: FhirString;
}

export interface ObservationDefinition extends DomainResource {
  resourceType: "ObservationDefinition";
  category?: CodeableConcept[];
  code: CodeableConcept;
  identifier?: Identifier[];
  permittedDataType?: FhirCode[];
  multipleResultsAllowed?: FhirBoolean;
  method?: CodeableConcept;
  preferredReportName?: FhirString;
  quantitativeDetails?: ObservationDefinitionQuantitativeDetails;
  qualifiedInterval?: ObservationDefinitionQualifiedInterval[];
  validCodedValueSet?: Reference<"ValueSet">;
  normalCodedValueSet?: Reference<"ValueSet">;
  abnormalCodedValueSet?: Reference<"ValueSet">;
  criticalCodedValueSet?: Reference<"ValueSet">;
}
