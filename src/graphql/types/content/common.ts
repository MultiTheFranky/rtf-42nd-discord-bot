export interface FieldErrorItem {
  message?: string;
  field?: string;
  code?: string;
}

export interface ErrorMessage {
  serverError?: string;
  fieldErrors?: Array<FieldErrorItem>;
}
