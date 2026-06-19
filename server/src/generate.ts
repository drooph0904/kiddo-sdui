import OpenAI from 'openai';
import { GeneratedPayloadSchema, type GeneratedPayload } from '../../shared/uiSchema.ts';
import { SYSTEM_PROMPT } from './prompt.ts';

export interface GenerateDeps {
  callModel: (prompt: string) => Promise<string>;
}

export function makeOpenAIDeps(): GenerateDeps {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  return {
    callModel: async (prompt) => {
      const res = await client.chat.completions.create({
        model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
      });
      return res.choices[0]?.message?.content ?? '';
    },
  };
}

export async function generatePayload(prompt: string, deps: GenerateDeps): Promise<GeneratedPayload> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await deps.callModel(prompt);
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      continue;
    }
    const parsed = GeneratedPayloadSchema.safeParse(json);
    if (parsed.success) return parsed.data;
  }
  throw new Error('Model did not return a valid UI payload');
}
