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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FormRendererProps {
  schema: FormSchema;
  onSubmit?: (data: any) => void;
  isPreview?: boolean;
}

export function FormRenderer({ schema, onSubmit, isPreview = false }: FormRendererProps) {
  // Dynamically generate Zod schema
  const generateZodSchema = (fields: FormField[]) => {
    const shape: any = {};
    fields.forEach((field) => {
      let validator: any;

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
        default:
          validator = z.string();
      }

      if (field.required && field.type !== 'checkbox') {
        validator = validator.min(1, { message: `${field.label} is required` });
      } else if (!field.required) {
        validator = validator.optional();
      }

      shape[field.id] = validator;
    });
    return z.object(shape);
  };

  const formSchema = generateZodSchema(schema.fields);
  type FormData = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleFormSubmit = (data: FormData) => {
    if (onSubmit) {
      onSubmit(data);
    } else {
      console.log('Form Submitted:', data);
      // MVP: Log to console
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-md">
      <CardHeader>
        <CardTitle>{schema.title}</CardTitle>
        {schema.description && <CardDescription>{schema.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {schema.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>

              {field.type === 'text' && (
                <Input
                  id={field.id}
                  placeholder={field.placeholder}
                  {...register(field.id)}
                />
              )}

              {field.type === 'email' && (
                <Input
                  id={field.id}
                  type="email"
                  placeholder={field.placeholder}
                  {...register(field.id)}
                />
              )}

              {field.type === 'number' && (
                <Input
                  id={field.id}
                  type="number"
                  placeholder={field.placeholder}
                  {...register(field.id)}
                />
              )}

              {field.type === 'textarea' && (
                <Textarea
                  id={field.id}
                  placeholder={field.placeholder}
                  {...register(field.id)}
                />
              )}

              {field.type === 'select' && (
                <Controller
                  name={field.id}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Select onValueChange={onChange} defaultValue={value as string}>
                      <SelectTrigger>
                        <SelectValue placeholder={field.placeholder || "Select an option"} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option} value={option}>
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
                    <RadioGroup onValueChange={onChange} defaultValue={value as string}>
                      {field.options?.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                          <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
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
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={field.id}
                        checked={value as boolean}
                        onCheckedChange={onChange}
                      />
                      <label
                        htmlFor={field.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {field.placeholder || "Yes"}
                      </label>
                    </div>
                  )}
                />
              )}

              {errors[field.id] && (
                <p className="text-sm text-red-500">
                  {errors[field.id]?.message as string}
                </p>
              )}
            </div>
          ))}

          <Button type="submit" disabled={isPreview} className="w-full">
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
