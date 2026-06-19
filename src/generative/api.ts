import { API_BASE_URL } from '../config';
import { GeneratedPayloadSchema, type GeneratedPayload } from '../../shared/uiSchema';

export async function generateFromPrompt(prompt: string): Promise<GeneratedPayload> {
  const res = await fetch(`${API_BASE_URL}/generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Server error ${res.status}`);
  }
  const json = await res.json();
  const parsed = GeneratedPayloadSchema.safeParse(json); // defense-in-depth runtime guard
  if (!parsed.success) throw new Error('Received an invalid layout from the server');
  return parsed.data;
}
