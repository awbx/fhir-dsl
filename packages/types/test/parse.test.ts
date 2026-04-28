import { describe, expect, it } from "vitest";
import {
  parseBase64Binary,
  parseCanonical,
  parseDate,
  parseDateTime,
  parseId,
  parseInstant,
  parseOid,
  parsePositiveInt,
  parseTime,
  parseUnsignedInt,
  parseUri,
  parseUrl,
  parseUuid,
} from "../src/parse.js";

describe("parseDate", () => {
  it("accepts year, year-month, year-month-day", () => {
    expect(parseDate("1990")).toBe("1990");
    expect(parseDate("1990-05")).toBe("1990-05");
    expect(parseDate("1990-05-15")).toBe("1990-05-15");
  });

  it("rejects bad shapes", () => {
    expect(parseDate("abc")).toBeUndefined();
    expect(parseDate("1990-5-15")).toBeUndefined();
    expect(parseDate("1990-13-01")).toBeUndefined();
    expect(parseDate("1990-05-32")).toBeUndefined();
    expect(parseDate("1990-00-01")).toBeUndefined();
  });
});

describe("parseDateTime", () => {
  it("accepts partial dates and full instants", () => {
    expect(parseDateTime("1990")).toBeDefined();
    expect(parseDateTime("1990-05-15T10:30:00Z")).toBeDefined();
    expect(parseDateTime("1990-05-15T10:30:00.123+05:00")).toBeDefined();
  });

  it("rejects bad shapes", () => {
    expect(parseDateTime("1990-05-15T10:30")).toBeUndefined();
    expect(parseDateTime("not-a-date")).toBeUndefined();
  });
});

describe("parseInstant", () => {
  it("requires full datetime with timezone", () => {
    expect(parseInstant("1990-05-15T10:30:00Z")).toBeDefined();
    expect(parseInstant("1990-05-15T10:30:00+05:00")).toBeDefined();
    expect(parseInstant("1990-05-15T10:30:00")).toBeUndefined();
    expect(parseInstant("1990-05-15")).toBeUndefined();
  });
});

describe("parseTime", () => {
  it("accepts hh:mm:ss and fractional seconds", () => {
    expect(parseTime("10:30:00")).toBe("10:30:00");
    expect(parseTime("10:30:00.123")).toBe("10:30:00.123");
  });

  it("rejects bad shapes", () => {
    expect(parseTime("25:00:00")).toBeUndefined();
    expect(parseTime("10:60:00")).toBeUndefined();
  });
});

describe("parseId", () => {
  it("accepts FHIR ids up to 64 chars", () => {
    expect(parseId("abc-123")).toBe("abc-123");
    expect(parseId("a".repeat(64))).toBeDefined();
  });

  it("rejects too long, empty, or invalid chars", () => {
    expect(parseId("")).toBeUndefined();
    expect(parseId("a".repeat(65))).toBeUndefined();
    expect(parseId("has space")).toBeUndefined();
    expect(parseId("has/slash")).toBeUndefined();
  });
});

describe("parseOid", () => {
  it("requires urn:oid: prefix and dotted-decimal arc", () => {
    expect(parseOid("urn:oid:1.2.3")).toBeDefined();
    expect(parseOid("urn:oid:2.16.840.1.113883.6.96")).toBeDefined();
    expect(parseOid("1.2.3")).toBeUndefined();
    expect(parseOid("urn:oid:3.0")).toBeUndefined(); // first arc must be 0,1,2
  });
});

describe("parseUuid", () => {
  it("requires urn:uuid: prefix and 8-4-4-4-12 hex", () => {
    expect(parseUuid("urn:uuid:c757873d-ec9a-4326-a141-556f43239520")).toBeDefined();
  });

  it("rejects bare or malformed uuids", () => {
    expect(parseUuid("c757873d-ec9a-4326-a141-556f43239520")).toBeUndefined();
    expect(parseUuid("urn:uuid:not-a-uuid")).toBeUndefined();
  });
});

describe("parseUri", () => {
  it("accepts anything with a scheme", () => {
    expect(parseUri("http://example.com/Patient/123")).toBeDefined();
    expect(parseUri("urn:oid:1.2.3")).toBeDefined();
  });

  it("rejects scheme-less strings", () => {
    expect(parseUri("Patient/123")).toBeUndefined();
    expect(parseUri("")).toBeUndefined();
  });
});

describe("parseUrl", () => {
  it("requires :// authority form", () => {
    expect(parseUrl("https://example.com")).toBeDefined();
    expect(parseUrl("urn:oid:1.2.3")).toBeUndefined();
  });
});

describe("parseCanonical", () => {
  it("accepts URI plus optional |version", () => {
    expect(parseCanonical("http://hl7.org/fhir/StructureDefinition/Patient")).toBeDefined();
    expect(parseCanonical("http://hl7.org/fhir/StructureDefinition/Patient|4.0.1")).toBeDefined();
  });
});

describe("parseBase64Binary", () => {
  it("accepts valid base64 with optional whitespace and padding", () => {
    expect(parseBase64Binary("SGVsbG8=")).toBeDefined();
    expect(parseBase64Binary("SGVs bG8=")).toBeDefined();
  });

  it("rejects strings whose stripped length isn't a multiple of 4", () => {
    expect(parseBase64Binary("SGVs")).toBeDefined();
    expect(parseBase64Binary("SGV")).toBeUndefined();
  });
});

describe("parsePositiveInt", () => {
  it("accepts positive integers", () => {
    expect(parsePositiveInt(1)).toBe(1);
    expect(parsePositiveInt(1000)).toBe(1000);
  });

  it("rejects zero, negatives, and floats", () => {
    expect(parsePositiveInt(0)).toBeUndefined();
    expect(parsePositiveInt(-1)).toBeUndefined();
    expect(parsePositiveInt(1.5)).toBeUndefined();
  });
});

describe("parseUnsignedInt", () => {
  it("accepts zero and positives", () => {
    expect(parseUnsignedInt(0)).toBe(0);
    expect(parseUnsignedInt(7)).toBe(7);
  });

  it("rejects negatives and floats", () => {
    expect(parseUnsignedInt(-1)).toBeUndefined();
    expect(parseUnsignedInt(1.5)).toBeUndefined();
  });
});
