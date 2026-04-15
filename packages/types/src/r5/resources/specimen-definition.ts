import type {
  BackboneElement,
  CodeableConcept,
  Coding,
  ContactDetail,
  DomainResource,
  Duration,
  Identifier,
  Period,
  Quantity,
  Range,
  Reference,
  UsageContext,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDate,
  FhirDateTime,
  FhirMarkdown,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface SpecimenDefinitionTypeTestedContainerAdditive extends BackboneElement {
  additiveCodeableConcept?: CodeableConcept;
  additiveReference?: Reference<"SubstanceDefinition">;
}

export interface SpecimenDefinitionTypeTestedContainer extends BackboneElement {
  material?: CodeableConcept;
  type?: CodeableConcept;
  cap?: CodeableConcept;
  description?: FhirMarkdown;
  capacity?: Quantity;
  minimumVolumeQuantity?: Quantity;
  minimumVolumeString?: FhirString;
  additive?: SpecimenDefinitionTypeTestedContainerAdditive[];
  preparation?: FhirMarkdown;
}

export interface SpecimenDefinitionTypeTestedHandling extends BackboneElement {
  temperatureQualifier?: CodeableConcept;
  temperatureRange?: Range;
  maxDuration?: Duration;
  instruction?: FhirMarkdown;
}

export interface SpecimenDefinitionTypeTested extends BackboneElement {
  isDerived?: FhirBoolean;
  type?: CodeableConcept;
  preference: FhirCode;
  container?: SpecimenDefinitionTypeTestedContainer;
  requirement?: FhirMarkdown;
  retentionTime?: Duration;
  singleUse?: FhirBoolean;
  rejectionCriterion?: CodeableConcept[];
  handling?: SpecimenDefinitionTypeTestedHandling[];
  testingDestination?: CodeableConcept[];
}

export interface SpecimenDefinition extends DomainResource {
  resourceType: "SpecimenDefinition";
  url?: FhirUri;
  identifier?: Identifier;
  version?: FhirString;
  versionAlgorithmString?: FhirString;
  versionAlgorithmCoding?: Coding;
  name?: FhirString;
  title?: FhirString;
  derivedFromCanonical?: FhirCanonical[];
  derivedFromUri?: FhirUri[];
  status: FhirCode;
  experimental?: FhirBoolean;
  subjectCodeableConcept?: CodeableConcept;
  subjectReference?: Reference<"Group">;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  purpose?: FhirMarkdown;
  copyright?: FhirMarkdown;
  copyrightLabel?: FhirString;
  approvalDate?: FhirDate;
  lastReviewDate?: FhirDate;
  effectivePeriod?: Period;
  typeCollected?: CodeableConcept;
  patientPreparation?: CodeableConcept[];
  timeAspect?: FhirString;
  collection?: CodeableConcept[];
  typeTested?: SpecimenDefinitionTypeTested[];
}
