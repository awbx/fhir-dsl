import type { FhirBoolean, FhirCode, FhirString } from "../primitives.js";
import type { BackboneElement, CodeableConcept, DomainResource, Duration, Identifier, Quantity, Range, Reference } from "../datatypes.js";

export interface SpecimenDefinitionTypeTestedContainerAdditive extends BackboneElement {
  additiveCodeableConcept?: CodeableConcept;
  additiveReference?: Reference<"Substance">;
}

export interface SpecimenDefinitionTypeTestedContainer extends BackboneElement {
  material?: CodeableConcept;
  type?: CodeableConcept;
  cap?: CodeableConcept;
  description?: FhirString;
  capacity?: Quantity;
  minimumVolumeQuantity?: Quantity;
  minimumVolumeString?: FhirString;
  additive?: SpecimenDefinitionTypeTestedContainerAdditive[];
  preparation?: FhirString;
}

export interface SpecimenDefinitionTypeTestedHandling extends BackboneElement {
  temperatureQualifier?: CodeableConcept;
  temperatureRange?: Range;
  maxDuration?: Duration;
  instruction?: FhirString;
}

export interface SpecimenDefinitionTypeTested extends BackboneElement {
  isDerived?: FhirBoolean;
  type?: CodeableConcept;
  preference: FhirCode;
  container?: SpecimenDefinitionTypeTestedContainer;
  requirement?: FhirString;
  retentionTime?: Duration;
  rejectionCriterion?: CodeableConcept[];
  handling?: SpecimenDefinitionTypeTestedHandling[];
}

export interface SpecimenDefinition extends DomainResource {
  resourceType: "SpecimenDefinition";
  identifier?: Identifier;
  typeCollected?: CodeableConcept;
  patientPreparation?: CodeableConcept[];
  timeAspect?: FhirString;
  collection?: CodeableConcept[];
  typeTested?: SpecimenDefinitionTypeTested[];
}
