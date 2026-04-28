import { assertType, describe, it } from "vitest";
import type {
  Address,
  Annotation,
  Attachment,
  CodeableConcept,
  Coding,
  ContactPoint,
  Dosage,
  Extension,
  HumanName,
  Identifier,
  Meta,
  Money,
  Period,
  Quantity,
  Range,
  Ratio,
  Reference,
  RelatedArtifact,
  SampledData,
  Signature,
  Timing,
  UsageContext,
} from "../src/datatypes.js";

// Phase 1.4 — Extension covers every spec-defined value[x] variant.
// Type-only assertions: each branch is reachable through the optional union.

describe("Extension value[x] coverage", () => {
  it("accepts every primitive variant", () => {
    const ext: Extension = {
      url: "http://example.com/ext",
      valueString: "hello",
      valueBoolean: true,
      valueInteger: 1,
      valueDecimal: 1.5,
      valueBase64Binary: "AAAA",
      valueCanonical: "http://canon",
      valueCode: "active",
      valueDate: "1990-01-01",
      valueDateTime: "1990-01-01T00:00:00Z",
      valueId: "abc-123",
      valueInstant: "1990-01-01T00:00:00Z",
      valueMarkdown: "# h",
      valueOid: "urn:oid:1.2",
      valuePositiveInt: 1,
      valueTime: "10:30:00",
      valueUnsignedInt: 0,
      valueUri: "urn:any:thing",
      valueUrl: "http://x.test",
      valueUuid: "urn:uuid:c757873d-ec9a-4326-a141-556f43239520",
    };
    assertType<Extension>(ext);
  });

  it("accepts every complex variant", () => {
    const ext: Extension = {
      url: "http://example.com/ext",
      valueAddress: {} as Address,
      valueAnnotation: {} as Annotation,
      valueAttachment: {} as Attachment,
      valueCodeableConcept: {} as CodeableConcept,
      valueCoding: {} as Coding,
      valueContactPoint: {} as ContactPoint,
      valueDosage: {} as Dosage,
      valueHumanName: {} as HumanName,
      valueIdentifier: {} as Identifier,
      valueMeta: {} as Meta,
      valueMoney: {} as Money,
      valuePeriod: {} as Period,
      valueQuantity: {} as Quantity,
      valueRange: {} as Range,
      valueRatio: {} as Ratio,
      valueReference: {} as Reference,
      valueRelatedArtifact: {} as RelatedArtifact,
      valueSampledData: {} as SampledData,
      valueSignature: {} as Signature,
      valueTiming: {} as Timing,
      valueUsageContext: {} as UsageContext,
    };
    assertType<Extension>(ext);
  });
});
