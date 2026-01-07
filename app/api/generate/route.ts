import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { FormSchema } from '@/types';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

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
    const cookieStore = await cookies();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Read settings from cookies
    const provider = cookieStore.get('ai_provider')?.value;
    const apiKeyCookie = cookieStore.get('ai_api_key')?.value;
    const baseUrlCookie = cookieStore.get('ai_base_url')?.value;
    const modelCookie = cookieStore.get('ai_model')?.value;

    let openai: OpenAI;
    let model: string;

    // Determine configuration
    if (provider === 'ollama') {
      openai = new OpenAI({
        baseURL: baseUrlCookie || 'http://127.0.0.1:11434/v1',
        apiKey: 'ollama',
      });
      model = modelCookie || 'llama3';
    } else {
      // Default to OpenAI (or explicit 'openai')
      const apiKey = apiKeyCookie || process.env.OPENAI_API_KEY;
      
      if (apiKey) {
        openai = new OpenAI({ apiKey });
        model = modelCookie || 'gpt-4o';
      } else {
        // Fallback: No OpenAI key found anywhere, try default local Ollama
        console.log("No OpenAI API Key found in cookies or env. Falling back to local Ollama.");
        openai = new OpenAI({
          baseURL: 'http://127.0.0.1:11434/v1',
          apiKey: 'ollama',
        });
        model = 'llama3';
      }
    }
    
    console.log(`Generating form using ${provider || 'auto'} (${model})...`);

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

    try {
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create a form based on this user request: ${prompt}` },
        ],
        response_format: { type: "json_object" }, // Helps with JSON mode if supported
      });

      const content = completion.choices[0].message.content;
      
      if (!content) {
        throw new Error("No content received from AI provider");
      }

      // Clean up potential markdown formatting (in case json_object mode isn't fully supported by local model)
      const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedData = JSON.parse(cleanedContent);
      
      // Validate with Zod
      const validatedData = FormSchemaZod.parse(parsedData);

      db.saveForm(validatedData);

      return NextResponse.json(validatedData);

    } catch (aiError) {
      console.error("AI Generation Error:", aiError);
      // Fallback to mock data if AI fails (e.g. Ollama not running)
      console.warn("Falling back to mock data due to AI error.");
      const mockData: FormSchema = {
        id: crypto.randomUUID(),
        title: "Mock Registration Form (Fallback)",
        description: "This form was generated because the AI provider was unavailable.",
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
        ],
      };
      db.saveForm(mockData);
      return NextResponse.json(mockData);
    }
  } catch (error) {
    console.error("Critical error in generate route:", error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
