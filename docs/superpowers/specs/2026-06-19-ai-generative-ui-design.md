# AI Generative-UI for Kiddo — Design Spec

**Date:** 2026-06-19
**Status:** Approved (design), pending spec review

## 1. Goal

Add an AI-powered "✨ Generate" mode to the Kiddo app: the user types a natural-language
prompt, a backend service asks OpenAI to compose a **UI layout tree**, and the app renders
that tree live as a fully-formed homepage. The AI decides the **shape of the screen**
(containers, grids, rows, cards) — not just products and theme.

This is **additive**: the existing 3-block SDUI app (the assignment submission) is untouched.
The generative renderer is a parallel rendering path reached from a new "✨ Generate" entry.

## 2. Decisions (locked during brainstorming)

- **End-to-end loop**: in-app GenerateScreen → backend → OpenAI → app renders the result.
- **Level B generative UI**: a recursive layout-primitive renderer; the AI composes arbitrary
  layout trees (not a fixed set of 3 blocks).
- **Products invented inline**: the AI writes each ProductCard's title/price/emoji/action
  directly into the tree (fictional products; no catalog grounding).
- **LLM provider: OpenAI** (the user has an OpenAI key, not Anthropic). Model `gpt-4o-mini`
  with Structured Outputs, configurable via env.

## 3. Architecture

```
GenerateScreen (RN)  --prompt-->  POST /generate  -->  OpenAI (Structured Outputs)
      ^                            (Node + TS server)         | returns UINode tree
      |                                   | Zod-validate       v
      +-------- { theme, tree } JSON <-----+--------------------
                          |
        Recursive UINodeRenderer walks the tree -> live screen
```

Three units:
1. **`shared/uiSchema.ts`** — one Zod schema = source of truth for the OpenAI JSON Schema,
   backend validation, and the app's types + runtime guard.
2. **`server/`** — Node + TypeScript + Fastify generate service.
3. **App additions** — recursive renderer, `SafeNode`, GenerateScreen, wiring.

## 4. The generative schema — `shared/uiSchema.ts` (Zod)

Recursive `UINode` discriminated union on `type`.

**Containers** (carry `children: UINode[]` + optional style):
- `Column` — vertical stack
- `Row` — horizontal stack
- `Grid` — `columns: 2 | 3 | 4`
- `Carousel` — horizontally scrolling

**Leaves**:
- `Text` — `content: string`, `variant: 'title' | 'subtitle' | 'body'`
- `Button` — `label: string`, `action: Action`
- `ProductCard` — `title: string`, `price: number`, `emoji: string`, `action: Action`
- `Banner` — `title: string`, `subtitle?: string`, `cta?: { label, action }`

**Shared optional style props** on every node: `padding?`, `gap?`, `background?`, `radius?`,
`align?: 'start' | 'center' | 'end'`.

**Action** (reused concept from the app): discriminated union
`ADD_TO_CART | DEEP_LINK | APPLY_MYSTERY_GIFT_COUPON | REMOVE_FROM_CART`.

**Root payload**: `{ theme: Theme, tree: UINode }`, where `Theme` is the existing 5-key
palette and `tree` is normally a `Column` of top-level sections.

TypeScript types are inferred from the Zod schema (`z.infer`) so app and server share one
definition. The OpenAI JSON Schema is derived from the same Zod object.

Recursion note: OpenAI Structured Outputs supports recursive schemas via `$ref` to the root.
The Zod→JSON-Schema step must emit a `$ref`-based recursive definition with a bounded depth
guard in the prompt (e.g. "nest at most 4 levels").

## 5. Recursive renderer (app)

- **Node registry** (`nodeRegistry.ts`): `type -> renderer component`, a hash-map (mirrors the
  existing `componentRegistry`; no switch).
- **`SafeNode.tsx`**: recursive sibling of `SafeBlock` — looks up the node type; unknown →
  drop quietly + warn; wraps render in an error boundary. Resilience extends to the tree.
- **Container renderers** recurse: `Column`→column View, `Row`→row View, `Grid`→wrap with
  `columns`, `Carousel`→nested horizontal FlashList. Each renders its children through
  `SafeNode`.
- **Leaf renderers**: `Text`, `Button`, `ProductCard` (reuse existing card visual + emoji
  tile), `Banner` (reuse gradient banner). All interactive nodes call existing `handleAction`.
- **Virtualization preserved**: the screen renders the root `Column`'s children as items of a
  single vertical `FlashList`; each item is one recursively-rendered subtree. (If the root is
  not a Column, wrap it.)
- **Theme**: the generated `theme` is provided via the existing `ThemeProvider`.

## 6. Backend — `server/` (Node + TypeScript + Fastify)

- `POST /generate` body `{ prompt: string }` → response `{ theme, tree }`.
- Calls OpenAI Chat Completions with `response_format: { type: 'json_schema', json_schema:
  { name: 'kiddo_ui', strict: true, schema: <derived from Zod> } }`.
- System prompt: instruct the model it is composing a Kiddo (kids/baby Q-commerce) homepage,
  must use only the allowed node types, invent realistic kid/baby products with INR prices and
  relevant emojis, nest at most 4 levels, and always return a root `Column`.
- Zod-validate the model's JSON before returning; on validation failure, one retry, then 422.
- **Model**: `gpt-4o-mini`, overridable via `OPENAI_MODEL` env.
- **Key**: `OPENAI_API_KEY` from `server/.env` (gitignored). Never shipped in the app.
- **CORS** enabled for local development.
- Errors: OpenAI/network failure → 502 `{ error }`; invalid output → 422 `{ error }`.

## 7. In-app wiring

- **`GenerateScreen`**: prompt `TextInput` + "✨ Generate" button + loading spinner + error
  text. On success, store `{ theme, tree }` in a Zustand `generativeStore` and show the
  rendered result.
- **Entry point**: a "✨ Generate" chip in the existing campaign picker switches App into
  generative mode; a "back" affordance returns to the normal campaigns. Existing Home and
  campaigns are unchanged.
- **Backend URL**: `src/config.ts` exports `API_BASE_URL`. Android emulator reaches the host
  Mac at `http://10.0.2.2:<port>`; documented and configurable.
- **Runtime guard**: the app re-validates the fetched payload with the shared Zod schema at
  the boundary (defense in depth); on failure it shows an error and keeps the current screen.

## 8. Build order (each step independently testable)

1. **Shared schema + generative renderer**, driven by a hardcoded sample `UINode` tree —
   prove arbitrary layouts render with no AI involved.
2. **Backend `/generate`** with OpenAI + Zod — verify via `curl`.
3. **GenerateScreen + wiring** — the full in-app loop.

## 9. Testing

- **Backend**: Zod validation accepts a good tree and rejects malformed input; a mocked OpenAI
  response is parsed and returned. (OpenAI itself is mocked — no network in tests.)
- **App**: `nodeRegistry` resolves known types and returns undefined for unknown; `SafeNode`
  renders nothing for an unknown type and isolates a throwing node.
- All existing app tests, lint, and typecheck must remain green.

## 10. Out of scope (YAGNI)

- Persistence of generated payloads (kept in memory for the session).
- Catalog grounding / real SKUs (products are invented).
- Auth, rate limiting, streaming responses, multi-user.
- Editing the generated tree by hand in-app.

## 11. Risks

- **Recursive JSON Schema in Structured Outputs**: supported via `$ref`, but needs a depth
  bound in the prompt to avoid runaway nesting. Mitigated by prompt + the renderer tolerating
  any depth.
- **Metro resolving `shared/` outside `src/`**: requires a `metro.config.js` `watchFolders`
  entry (and matching tsconfig path). Called out as an explicit task.
- **OpenAI cost/latency**: `gpt-4o-mini` keeps both low; a single request per generate.
