import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FormSchema } from '@/types';

interface FormState {
  forms: FormSchema[];
  addForm: (form: FormSchema) => void;
  getForm: (id: string) => FormSchema | undefined;
}

export const useFormStore = create<FormState>()(
  persist(
    (set, get) => ({
      forms: [],
      addForm: (form) =>
        set((state) => ({
          forms: [...state.forms, form],
        })),
      getForm: (id) => get().forms.find((f) => f.id === id),
    }),
    {
      name: 'form-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
