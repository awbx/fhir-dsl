export const AdministrativeGender = {
  Male: "male" as const,
  Female: "female" as const,
  Other: "other" as const,
  Unknown: "unknown" as const,
} as const;

export const ClinicalCodes = {
  Active: "active" as const,
  Recurrence: "recurrence" as const,
  Relapse: "relapse" as const,
  Inactive: "inactive" as const,
  Remission: "remission" as const,
  Resolved: "resolved" as const,
} as const;

export const EncounterPriority = {
  Stat: "stat" as const,
  Emergency: "emergency" as const,
  Urgent: "urgent" as const,
  Routine: "routine" as const,
} as const;

export const ObservationCategoryCodes = {
  VitalSigns: "vital-signs" as const,
  Imaging: "imaging" as const,
  Laboratory: "laboratory" as const,
} as const;

export const ObservationStatus = {
  Registered: "registered" as const,
  Preliminary: "preliminary" as const,
  Final: "final" as const,
  Amended: "amended" as const,
} as const;

export const SpecimenType = {
  Blood: "blood" as const,
  Urine: "urine" as const,
  Serum: "serum" as const,
} as const;

