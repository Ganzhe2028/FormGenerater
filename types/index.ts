export type FieldType = 'text' | 'textarea' | 'number' | 'email' | 'select' | 'checkbox' | 'radio' | 'rating';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required: boolean;
  options?: string[]; // Only for select, checkbox, radio
  logic?: Array<{
    condition: string; // The option value that triggers the jump
    destination: string; // The target field ID to jump to
  }>;
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  createdAt: number;
}

export interface Submission {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  submittedAt: string;
}
