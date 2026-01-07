import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawBaseUrl = searchParams.get('baseUrl');

    if (!rawBaseUrl) {
      return NextResponse.json({ error: 'baseUrl is required' }, { status: 400 });
    }

    // Normalize baseUrl: remove trailing slash if present
    const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

    console.log(`Proxying Ollama models request to: ${baseUrl}/models`);

    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Set a reasonable timeout
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Ollama returned ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Ollama proxy error:", error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch models from Ollama' },
      { status: 500 }
    );
  }
}
