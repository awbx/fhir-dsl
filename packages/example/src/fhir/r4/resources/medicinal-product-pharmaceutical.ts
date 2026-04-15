import type {
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Duration,
  Identifier,
  Quantity,
  Ratio,
  Reference,
} from "../datatypes.js";
import type { FhirString } from "../primitives.js";

export interface MedicinalProductPharmaceuticalCharacteristics extends BackboneElement {
  code: CodeableConcept;
  status?: CodeableConcept;
}

export interface MedicinalProductPharmaceuticalRouteOfAdministrationTargetSpeciesWithdrawalPeriod
  extends BackboneElement {
  tissue: CodeableConcept;
  value: Quantity;
  supportingInformation?: FhirString;
}

export interface MedicinalProductPharmaceuticalRouteOfAdministrationTargetSpecies extends BackboneElement {
  code: CodeableConcept;
  withdrawalPeriod?: MedicinalProductPharmaceuticalRouteOfAdministrationTargetSpeciesWithdrawalPeriod[];
}

export interface MedicinalProductPharmaceuticalRouteOfAdministration extends BackboneElement {
  code: CodeableConcept;
  firstDose?: Quantity;
  maxSingleDose?: Quantity;
  maxDosePerDay?: Quantity;
  maxDosePerTreatmentPeriod?: Ratio;
  maxTreatmentPeriod?: Duration;
  targetSpecies?: MedicinalProductPharmaceuticalRouteOfAdministrationTargetSpecies[];
}

export interface MedicinalProductPharmaceutical extends DomainResource {
  resourceType: "MedicinalProductPharmaceutical";
  identifier?: Identifier[];
  administrableDoseForm: CodeableConcept;
  unitOfPresentation?: CodeableConcept;
  ingredient?: Reference<"MedicinalProductIngredient">[];
  device?: Reference<"DeviceDefinition">[];
  characteristics?: MedicinalProductPharmaceuticalCharacteristics[];
  routeOfAdministration: MedicinalProductPharmaceuticalRouteOfAdministration[];
}
