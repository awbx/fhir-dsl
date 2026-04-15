import type {
  Attachment,
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Duration,
  Identifier,
  Quantity,
  Ratio,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirDate, FhirMarkdown, FhirString } from "../primitives.js";

export interface AdministrableProductDefinitionProperty extends BackboneElement {
  type: CodeableConcept;
  valueCodeableConcept?: CodeableConcept;
  valueQuantity?: Quantity;
  valueDate?: FhirDate;
  valueBoolean?: FhirBoolean;
  valueMarkdown?: FhirMarkdown;
  valueAttachment?: Attachment;
  valueReference?: Reference<"Binary">;
  status?: CodeableConcept;
}

export interface AdministrableProductDefinitionRouteOfAdministrationTargetSpeciesWithdrawalPeriod
  extends BackboneElement {
  tissue: CodeableConcept;
  value: Quantity;
  supportingInformation?: FhirString;
}

export interface AdministrableProductDefinitionRouteOfAdministrationTargetSpecies extends BackboneElement {
  code: CodeableConcept;
  withdrawalPeriod?: AdministrableProductDefinitionRouteOfAdministrationTargetSpeciesWithdrawalPeriod[];
}

export interface AdministrableProductDefinitionRouteOfAdministration extends BackboneElement {
  code: CodeableConcept;
  firstDose?: Quantity;
  maxSingleDose?: Quantity;
  maxDosePerDay?: Quantity;
  maxDosePerTreatmentPeriod?: Ratio;
  maxTreatmentPeriod?: Duration;
  targetSpecies?: AdministrableProductDefinitionRouteOfAdministrationTargetSpecies[];
}

export interface AdministrableProductDefinition extends DomainResource {
  resourceType: "AdministrableProductDefinition";
  identifier?: Identifier[];
  status: FhirCode;
  formOf?: Reference<"MedicinalProductDefinition">[];
  administrableDoseForm?: CodeableConcept;
  unitOfPresentation?: CodeableConcept;
  producedFrom?: Reference<"ManufacturedItemDefinition">[];
  ingredient?: CodeableConcept[];
  device?: Reference<"DeviceDefinition">;
  description?: FhirMarkdown;
  property?: AdministrableProductDefinitionProperty[];
  routeOfAdministration: AdministrableProductDefinitionRouteOfAdministration[];
}
