import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { cookies } from 'next/headers';

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
      const apiKey = apiKeyCookie || process.env.OPENAI_API_KEY;
      if (apiKey) {
        openai = new OpenAI({ apiKey });
        model = modelCookie || 'gpt-4o';
      } else {
        console.log("No OpenAI API Key found. Falling back to local Ollama.");
        openai = new OpenAI({
          baseURL: 'http://127.0.0.1:11434/v1',
          apiKey: 'ollama',
        });
        model = 'llama3';
      }
    }
    
    console.log(`Stream-Generating form using ${provider || 'auto'} (${model})...`);

    const systemPrompt = `You are a form generation assistant. Output ONLY valid JSON matching the following TypeScript schema:
    interface FormSchema {
      id: string; // Generate a unique UUID
      title: string;
      description?: string;
      fields: Array<{
        id: string; // camelCase
        label: string;
        type: 'text' | 'textarea' | 'number' | 'email' | 'select' | 'checkbox' | 'radio' | 'rating';
        placeholder?: string;
        required: boolean;
        options?: string[]; // For select/radio/checkbox
        logic?: Array<{
          condition: string; // The option value that triggers the jump
          destination: string; // The target field ID to jump to
        }>;
      }>;
      createdAt: number; // Current timestamp
    }
    Do not include markdown formatting (like \`\`\`json). Just the raw JSON string.`;

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      stream: true, // Enable streaming
      temperature: 0.7, // Add temperature to control creativity/randomness
      frequency_penalty: 0.1, // Slight penalty to prevent repetition
    });

    // Create a ReadableStream from the OpenAI async iterator
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content || '';
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        } finally {
          // Standard cleanup (handled by finally or cancel)
          await unloadModel();
        }
      },
      async cancel() {
        console.log("Stream cancelled by client.");
        await unloadModel();
      }
    });

    async function unloadModel() {
      if (provider === 'ollama') {
        try {
          const currentBaseUrl = baseUrlCookie || 'http://127.0.0.1:11434/v1';
          const nativeBaseUrl = currentBaseUrl.replace(/\/v1\/?$/, '');
          
          console.log(`Unloading Ollama model ${model} (keep_alive: 0)...`);
          
          await fetch(`${nativeBaseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: model, keep_alive: 0 })
          });
        } catch (unloadError) {
          console.error("Failed to unload Ollama model:", unloadError);
        }
      }
    }

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error: unknown) {
    console.error("Generation error:", error);
    const message = error instanceof Error ? error.message : 'Failed to generate form';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
