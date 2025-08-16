// src/types/intake.ts
export type IntakeOption = { key: string; label: string };

export type FieldSingleChoice = {
  type: "singleChoice";
  id: string;
  label: string;
  required?: boolean;
  options: IntakeOption[];
  placeholder?: string;
};

export type FieldMultiSelect = {
  type: "multiSelect";
  id: string;
  label: string;
  required?: boolean;
  options: IntakeOption[];
  placeholder?: string;
};

export type FieldHoursPerWeek = {
  type: "hoursPerWeek";
  id: "hours";
  label: string;
  required?: boolean;
  min: number;
  max: number;
};

export type FieldNumber = {
  type: "number";
  id: string;
  label: string;
  required?: boolean;
  min: number;
  max: number;
  step?: number;
  placeholder?: string;
};

export type FieldText = {
  type: "text";
  id: string;
  label: string;
  required?: boolean;
  placeholder?: string;
};

export type IntakeField =
  | FieldSingleChoice
  | FieldMultiSelect
  | FieldHoursPerWeek
  | FieldNumber
  | FieldText;

export type IntakeSection = {
  title: string;
  subtitle: string;
  fields: IntakeField[];
};

export type IntakeSchema = IntakeSection[];
