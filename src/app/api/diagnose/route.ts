import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const SYSTEM_PROMPT = `You are an automotive diagnostic assistant for AutoLens, a car marketplace.

A user describes their car and a symptom. Your job:
1. Ask AT MOST 1-2 short clarifying questions before diagnosing — prioritise:
   transmission (automatic or manual), any other dashboard warning lights,
   and when the symptom happens (cold start, highway, under load, etc.).
2. Once you have enough to reason, return ONLY a fenced json block, nothing
   else around it, in exactly this shape:

\`\`\`json
{
  "diagnosis": [
    {
      "cause": "short name of the likely cause",
      "likelihood": "high",
      "why": "one or two sentences on why this fits the symptoms",
      "checkYourself": "something the owner can check or observe",
      "tellMechanic": "what to ask the mechanic to inspect or test"
    }
  ],
  "scanNote": "short note telling them to get an OBD2 scan; mention many faults store codes without lighting the dash",
  "disclaimer": "short safety disclaimer that this is general guidance, not a definitive diagnosis"
}
\`\`\`

Rules:
- "likelihood" must be one of: "high", "medium", "low".
- Rank the diagnosis array most-likely first.
- Give 3-4 causes.
- Frame everything as possibilities, never a guaranteed fix.
- Keep each field concise.
- While you are still asking clarifying questions, reply in plain text (no json
  block). Only output the json block once you are ready to diagnose.`

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is missing from .env.local' },
        { status: 500 }
      )
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 3000,
        system: SYSTEM_PROMPT,
        messages,
      }),
    })

    // Surface the real Anthropic error instead of a vague one
    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json(
        { error: `Anthropic API error (${res.status}): ${errText}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
