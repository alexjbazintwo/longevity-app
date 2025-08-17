export type Option = { key: string; label: string };

export type FieldBase = {
  id: string;
  label: string;
  required?: boolean;
  placeholder?: string;
};

export type SingleChoiceField = FieldBase & {
  type: "singleChoice";
  options: Option[];
};

export type MultiSelectField = FieldBase & {
  type: "multiSelect";
  options: Option[];
};

export type HoursPerWeekField = FieldBase & {
  type: "hoursPerWeek";
  min: number;
  max: number;
};

export type NumberField = FieldBase & {
  type: "number";
  min: number;
  max: number;
  step?: number;
};

export type TextField = FieldBase & {
  type: "text";
};

export type DateField = FieldBase & {
  type: "date";
};

export type TimeHMSField = FieldBase & {
  type: "timeHMS";
};

export type IntakeField =
  | SingleChoiceField
  | MultiSelectField
  | HoursPerWeekField
  | NumberField
  | TextField
  | DateField
  | TimeHMSField;

export type IntakeSection = {
  title: string;
  subtitle: string;
  fields: IntakeField[];
};

export type IntakeSchema = IntakeSection[];
