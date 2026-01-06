export type FieldType = 'text' | 'textarea' | 'number' | 'email' | 'select' | 'checkbox' | 'radio';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required: boolean;
  options?: string[]; // Only for select, checkbox, radio
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  createdAt: number;
}
