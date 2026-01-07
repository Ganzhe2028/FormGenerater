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

    console.log(`Proxying Ollama models request to: ${baseUrl}`);

    // Try to determine if we should use OpenAI-compatible endpoint or native one
    const isV1 = baseUrl.endsWith('/v1');
    const targetUrl = isV1 ? `${baseUrl}/models` : `${baseUrl}/api/tags`;

    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
          { error: `Ollama error (${response.status}): ${errorText || response.statusText}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      
      // Normalize response to OpenAI format for the frontend
      if (!isV1 && data.models) {
        return NextResponse.json({
          data: data.models.map((m: { name: string }) => ({ id: m.name }))
        });
      }

      return NextResponse.json(data);
    } catch (fetchError: unknown) {
      const msg = fetchError instanceof Error ? fetchError.message : String(fetchError);
      if (msg.includes('fetch failed')) {
        return NextResponse.json(
          { error: `Could not connect to Ollama at ${baseUrl}. Ensure Ollama is running and the URL is correct.` },
          { status: 503 }
        );
      }
      throw fetchError;
    }
  } catch (error: unknown) {
    console.error("Ollama proxy error:", error);
    const message = error instanceof Error ? error.message : 'Failed to fetch models from Ollama';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
