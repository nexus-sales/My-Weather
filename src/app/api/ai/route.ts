import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-20241022';

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Anthropic API key not configured on server.' },
      { status: 503 }
    );
  }

  let body: { messages?: unknown; systemPrompt?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { messages, systemPrompt } = body;

  // Validate payload to prevent DoS / prompt injection
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 40) {
    return NextResponse.json({ error: 'Invalid messages array.' }, { status: 400 });
  }
  for (const msg of messages) {
    if (
      typeof msg !== 'object' || msg === null ||
      !['user', 'assistant'].includes((msg as { role?: string }).role ?? '') ||
      typeof (msg as { content?: unknown }).content !== 'string' ||
      ((msg as { content: string }).content.length > 8000)
    ) {
      return NextResponse.json({ error: 'Invalid message format.' }, { status: 400 });
    }
  }
  if (typeof systemPrompt !== 'string' || systemPrompt.length > 3000) {
    return NextResponse.json({ error: 'Invalid system prompt.' }, { status: 400 });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages as Array<{ role: string; content: string }>,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('AI Route Error:', error);
    return NextResponse.json({ error: 'Failed to communicate with AI provider' }, { status: 500 });
  }
}
