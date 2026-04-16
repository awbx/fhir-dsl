export const AdministrativeGender = {
  Male: "male" as const,
  Female: "female" as const,
  Other: "other" as const,
  Unknown: "unknown" as const,
} as const;

export const ConditionClinicalStatusCodes = {
  Active: "active" as const,
  Recurrence: "recurrence" as const,
  Relapse: "relapse" as const,
  Inactive: "inactive" as const,
  Remission: "remission" as const,
  Resolved: "resolved" as const,
} as const;

export const ObservationCategoryCodes = {
  SocialHistory: "social-history" as const,
  VitalSigns: "vital-signs" as const,
  Imaging: "imaging" as const,
  Laboratory: "laboratory" as const,
  Procedure: "procedure" as const,
  Survey: "survey" as const,
  Exam: "exam" as const,
  Therapy: "therapy" as const,
  Activity: "activity" as const,
} as const;

export const ObservationStatus = {
  Registered: "registered" as const,
  Preliminary: "preliminary" as const,
  Final: "final" as const,
  Amended: "amended" as const,
  Corrected: "corrected" as const,
  Cancelled: "cancelled" as const,
  EnteredInError: "entered-in-error" as const,
  Unknown: "unknown" as const,
} as const;

