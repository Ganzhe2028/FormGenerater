"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormSchema, FormField } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormRendererProps {
  schema: FormSchema;
  onSubmit?: (data: Record<string, unknown>) => void;
  isPreview?: boolean;
}

export function FormRenderer({ schema, onSubmit, isPreview = false }: FormRendererProps) {
  const generateZodSchema = (fields: FormField[]) => {
    const shape: Record<string, z.ZodTypeAny> = {};
    fields.forEach((field) => {
      let validator: z.ZodTypeAny;

      switch (field.type) {
        case 'email':
          validator = z.string().email();
          break;
        case 'number':
          validator = z.coerce.number();
          break;
        case 'checkbox':
          validator = z.boolean().default(false);
          break;
        case 'checkbox-group':
          validator = z.array(z.string()).default([]);
          break;
        case 'rating':
          validator = z.coerce.number().min(1).max(5);
          break;
        default:
          validator = z.string();
      }

      if (field.required && field.type !== 'checkbox') {
        const stringValidator = validator as z.ZodString;
        validator = stringValidator.min(1, { message: `${field.label} is required` });
      } else if (!field.required) {
        validator = validator.optional();
      }

      shape[field.id] = validator;
    });
    return z.object(shape);
  };

  const formSchema = generateZodSchema(schema.fields);
  type FormData = Record<string, unknown>; // z.infer<typeof formSchema> can be complex with dynamic keys

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const values = watch();

  const getVisibleFields = () => {
    const visibleFields: FormField[] = [];
    let i = 0;
    while (i < schema.fields.length) {
      const field = schema.fields[i];
      visibleFields.push(field);

      const val = values[field.id];
      let jumped = false;

      if (field.logic && val) {
        for (const rule of field.logic) {
          const isMatch = rule.condition === '*' || rule.condition === '' || String(val) === rule.condition;
          if (isMatch) {
            const targetIndex = schema.fields.findIndex(f => f.id === rule.destination);
            if (targetIndex !== -1 && targetIndex > i) {
              i = targetIndex;
              jumped = true;
            }
            break;
          }
        }
      }
      
      if (!jumped) {
        i++;
      }
    }
    return visibleFields;
  };

  const visibleFields = getVisibleFields();

  const handleFormSubmit = (data: FormData) => {
    const visibleIds = new Set(visibleFields.map(f => f.id));
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([key]) => visibleIds.has(key))
    );
    
    if (onSubmit) {
      onSubmit(filteredData);
    } else {
      console.log('Form Submitted:', filteredData);
    }
  };

  return (
    <div className="w-full bg-zinc-950 p-8 md:p-12 rounded-[2rem] border border-zinc-800 shadow-2xl">
      <div className="mb-10 space-y-3">
        <h2 className="text-3xl font-extrabold tracking-tight text-white">{schema.title}</h2>
        {schema.description && (
          <p className="text-zinc-500 font-medium leading-relaxed">{schema.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {visibleFields.map((field) => (
          <div key={field.id} className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
            <Label htmlFor={field.id} className="text-sm font-bold text-zinc-400 flex items-center gap-1.5">
              {field.label} 
              {field.required && <span className="text-red-500/80 text-lg leading-none">*</span>}
            </Label>

            {field.type === 'text' && (
              <Input
                id={field.id}
                placeholder={field.placeholder}
                className="bg-zinc-900/50 border-zinc-800 text-zinc-100 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-700 transition-all placeholder:text-zinc-700"
                {...register(field.id)}
              />
            )}

            {field.type === 'email' && (
              <Input
                id={field.id}
                type="email"
                placeholder={field.placeholder}
                className="bg-zinc-900/50 border-zinc-800 text-zinc-100 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-700 transition-all placeholder:text-zinc-700"
                {...register(field.id)}
              />
            )}

            {field.type === 'number' && (
              <Input
                id={field.id}
                type="number"
                placeholder={field.placeholder}
                className="bg-zinc-900/50 border-zinc-800 text-zinc-100 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-700 transition-all placeholder:text-zinc-700"
                {...register(field.id)}
              />
            )}

            {field.type === 'textarea' && (
              <Textarea
                id={field.id}
                placeholder={field.placeholder}
                className="bg-zinc-900/50 border-zinc-800 text-zinc-100 min-h-[120px] rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-700 transition-all placeholder:text-zinc-700"
                {...register(field.id)}
              />
            )}

            {field.type === 'date' && (
              <Input
                id={field.id}
                type="date"
                className="bg-zinc-900/50 border-zinc-800 text-zinc-100 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-700 transition-all [color-scheme:dark]"
                {...register(field.id)}
              />
            )}

            {field.type === 'file' && (
              <div className="group relative">
                <Input
                  id={field.id}
                  type="file"
                  className="bg-zinc-900/50 border-zinc-800 text-zinc-100 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-700 transition-all cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white file:text-black hover:file:bg-zinc-200"
                  {...register(field.id)}
                />
              </div>
            )}

            {field.type === 'select' && (
              <Controller
                name={field.id}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select onValueChange={onChange} defaultValue={value as string}>
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-zinc-100 h-12 rounded-xl focus:ring-1 focus:ring-zinc-700 transition-all">
                      <SelectValue placeholder={field.placeholder || "Select an option"} />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                      {field.options?.map((option) => (
                        <SelectItem key={option} value={option} className="focus:bg-zinc-800 focus:text-white">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}

            {field.type === 'radio' && (
              <Controller
                name={field.id}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <RadioGroup onValueChange={onChange} defaultValue={value as string} className="gap-3">
                    {field.options?.map((option) => (
                      <div key={option} className="flex items-center space-x-3 bg-zinc-900/30 p-3 rounded-xl border border-zinc-800/50 hover:bg-zinc-900/60 transition-colors cursor-pointer" onClick={() => onChange(option)}>
                        <RadioGroupItem value={option} id={`${field.id}-${option}`} className="border-zinc-700 text-zinc-100" />
                        <Label htmlFor={`${field.id}-${option}`} className="flex-1 cursor-pointer text-zinc-300">{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
            )}

            {field.type === 'rating' && (
              <Controller
                name={field.id}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <RadioGroup 
                    onValueChange={onChange} 
                    defaultValue={value ? String(value) : undefined}
                    className="flex gap-3"
                  >
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <div key={rating} className="flex flex-col items-center flex-1">
                        <RadioGroupItem 
                          value={String(rating)} 
                          id={`${field.id}-${rating}`} 
                          className="peer sr-only"
                        />
                        <Label 
                          htmlFor={`${field.id}-${rating}`}
                          className="flex h-14 w-full cursor-pointer items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 peer-data-[state=checked]:bg-white peer-data-[state=checked]:text-black peer-data-[state=checked]:border-white font-bold transition-all text-lg"
                        >
                          {rating}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
            )}

            {field.type === 'checkbox' && (
              <Controller
                name={field.id}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <div className="flex items-center space-x-3 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50">
                    <Checkbox
                      id={field.id}
                      checked={value as boolean}
                      onCheckedChange={onChange}
                      className="border-zinc-700 data-[state=checked]:bg-white data-[state=checked]:text-black"
                    />
                    <label
                      htmlFor={field.id}
                      className="text-sm font-medium text-zinc-300 cursor-pointer"
                    >
                      {field.placeholder || "Confirm/Yes"}
                    </label>
                  </div>
                )}
              />
            )}

            {field.type === 'checkbox-group' && (
              <Controller
                name={field.id}
                control={control}
                render={({ field: { onChange, value } }) => {
                  const currentValues = Array.isArray(value) ? value : [];
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {field.options?.map((option) => (
                        <div 
                          key={option} 
                          className="flex items-center space-x-3 bg-zinc-900/30 p-3 rounded-xl border border-zinc-800/50 hover:bg-zinc-900/60 transition-colors cursor-pointer"
                          onClick={() => {
                            const nextValue = currentValues.includes(option)
                              ? currentValues.filter((v: string) => v !== option)
                              : [...currentValues, option];
                            onChange(nextValue);
                          }}
                        >
                          <Checkbox
                            id={`${field.id}-${option}`}
                            checked={currentValues.includes(option)}
                            onCheckedChange={() => {}} // Handled by div click
                            className="border-zinc-700 data-[state=checked]:bg-white data-[state=checked]:text-black"
                          />
                          <Label htmlFor={`${field.id}-${option}`} className="flex-1 cursor-pointer text-zinc-300">{option}</Label>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
            )}

            {errors[field.id] && (
              <p className="text-xs font-bold text-red-500/80 uppercase tracking-widest pl-1">
                {errors[field.id]?.message as string}
              </p>
            )}
          </div>
        ))}

        <div className="pt-6">
          <Button 
            type="submit" 
            disabled={isPreview} 
            className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-bold rounded-2xl text-lg shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all active:scale-[0.98] disabled:bg-zinc-800 disabled:text-zinc-600"
          >
            {isPreview ? "Preview Only" : "Submit response"}
          </Button>
        </div>
      </form>
    </div>
  );
}