import Fastify from 'fastify';
import cors from '@fastify/cors';
import { generatePayload, makeOpenAIDeps } from './generate.ts';

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

const deps = makeOpenAIDeps();

app.get('/health', async () => ({ ok: true }));

app.post('/generate', async (req, reply) => {
  const prompt = (req.body as { prompt?: string })?.prompt;
  if (!prompt || typeof prompt !== 'string') return reply.code(400).send({ error: 'prompt required' });
  try {
    return await generatePayload(prompt, deps);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'generation failed';
    return reply.code(msg.includes('valid UI payload') ? 422 : 502).send({ error: msg });
  }
});

const port = Number(process.env.PORT ?? 8787);
app.listen({ port, host: '0.0.0.0' }).catch((e) => {
  app.log.error(e);
  process.exit(1);
});
