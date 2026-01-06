import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { FormSchema } from '@/types';

// Define the schema for validation
const FormSchemaZod = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      type: z.enum(['text', 'textarea', 'number', 'email', 'select', 'checkbox', 'radio']),
      placeholder: z.string().optional(),
      required: z.boolean(),
      options: z.array(z.string()).optional(),
    })
  ),
  createdAt: z.number(),
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Mock response if no API key is present
    if (!apiKey) {
      console.warn("No OpenAI API Key found. Returning mock data.");
      const mockData: FormSchema = {
        id: crypto.randomUUID(),
        title: "Mock Registration Form",
        description: "This is a mock form generated because no API key was provided.",
        createdAt: Date.now(),
        fields: [
          {
            id: "name",
            label: "Full Name",
            type: "text",
            placeholder: "John Doe",
            required: true,
          },
          {
            id: "email",
            label: "Email Address",
            type: "email",
            placeholder: "john@example.com",
            required: true,
          },
          {
            id: "experience",
            label: "Years of Experience",
            type: "select",
            required: true,
            options: ["0-1 years", "1-3 years", "3-5 years", "5+ years"],
          },
          {
            id: "bio",
            label: "Short Bio",
            type: "textarea",
            placeholder: "Tell us about yourself...",
            required: false,
          },
        ],
      };
      return NextResponse.json(mockData);
    }

    const openai = new OpenAI({ apiKey });

    const systemPrompt = `You are a form generation assistant. Output ONLY valid JSON matching the following TypeScript schema:
    
    type FieldType = 'text' | 'textarea' | 'number' | 'email' | 'select' | 'checkbox' | 'radio';
    
    interface FormField {
      id: string; // unique camelCase identifier
      label: string;
      type: FieldType;
      placeholder?: string;
      required: boolean;
      options?: string[]; // Only for select, checkbox, radio
    }
    
    interface FormSchema {
      id: string; // use a UUID or random string
      title: string;
      description?: string;
      fields: FormField[];
      createdAt: number; // current timestamp
    }
    
    Do not include markdown code blocks. Return just the JSON object.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // or gpt-3.5-turbo
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Create a form based on this user request: ${prompt}` },
      ],
    });

    const content = completion.choices[0].message.content;
    
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    // Clean up potential markdown formatting
    const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(cleanedContent);
    
    // Validate with Zod
    const validatedData = FormSchemaZod.parse(parsedData);

    return NextResponse.json(validatedData);

  } catch (error) {
    console.error("Error generating form:", error);
    return NextResponse.json(
      { error: 'Failed to generate form' },
      { status: 500 }
    );
  }
}
