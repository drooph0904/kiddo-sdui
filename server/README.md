# kiddo-sdui-server

Fastify backend that powers the AI Generative UI feature. It accepts a free-form prompt, calls OpenAI in JSON mode, validates the response against a shared Zod schema, and returns a `{ theme, tree }` payload that the React Native app renders recursively.

Stack: **Fastify 5** · **TypeScript** (ESM) · **OpenAI SDK** · **Zod 4** · run with `tsx`.

---

## Setup

1. Copy the environment template and fill in your key:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env`:

   | Variable | Required | Default | Notes |
   |---|---|---|---|
   | `OPENAI_API_KEY` | yes | — | Your OpenAI secret key |
   | `OPENAI_MODEL` | no | `gpt-4o-mini` | Any chat model that supports JSON mode |
   | `PORT` | no | `8787` | Port the server listens on |

   `.env` is gitignored and never committed.

3. Install dependencies:

   ```bash
   npm install
   ```

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start with `tsx watch` — restarts on file changes (development) |
| `npm start` | Start once with `tsx` (production-like) |
| `npm test` | Run Node's built-in test runner against `src/**/*.test.ts` |

The server binds to `0.0.0.0:8787` (or `$PORT`). The Android emulator reaches the host at `10.0.2.2:8787`; iOS simulator and web use `localhost:8787`.

---

## API

### `GET /health`

Liveness check.

**Response `200`**

```json
{ "ok": true }
```

---

### `POST /generate`

Generate a complete UI payload from a free-form prompt.

**Request body** (`Content-Type: application/json`)

```json
{ "prompt": "rainy day indoor play for toddlers" }
```

| Field | Type | Required |
|---|---|---|
| `prompt` | string | yes |

**Success `200`**

```json
{
  "theme": {
    "primary": "#...",
    "background": "#...",
    "surface": "#...",
    "text": "#...",
    "accent": "#..."
  },
  "tree": { "type": "Column", "children": [ ... ] }
}
```

The `tree` is a recursive `UINode` tree. Node types: `Column`, `Row`, `Grid`, `Carousel`, `Text`, `Button`, `ProductCard`, `Banner`. The full schema is defined in `../shared/uiSchema.ts`.

Products in the tree are invented by the model; they are not drawn from a real catalogue.

**Error responses**

| Code | Condition |
|---|---|
| `400` | `prompt` field is missing or not a string |
| `422` | OpenAI returned a response that failed Zod validation after retries |
| `502` | OpenAI API call failed (network error, quota, etc.) |

Error body:

```json
{ "error": "<human-readable message>" }
```

---

## Shared schema

`../shared/uiSchema.ts` is the single source of truth for `UINode`, `GeneratedPayload`, and `ThemeSchema`. Both the server (validation) and the app (types + runtime guard) import from it. Changes to the schema take effect on both sides simultaneously.
