# SPEC.md — chatogpt

## Project Overview

**chatogpt** is a static, client-side chat UI that runs a large language model entirely in the browser using [WebLLM](https://github.com/mlc-ai/web-llm). There is no backend, no API key, and no server cost. The model runs on the user's GPU via WebGPU. The project is a lean, portable toy intended to be shared with family.

---

## Goals & Non-Goals

### Goals

- Run LLM inference locally in the browser, zero server involvement
- Fast first-load experience with clear progress feedback during model download
- Clean, mobile-responsive chat UI
- Deployable as a fully static site on free hosting

### Non-Goals

- Multi-model selection or model switching UI
- Backend, API proxy, or any server-side logic
- User accounts, chat history persistence, or server-side state
- Mobile browser optimization or fallbacks
- Fine-tuning or custom model hosting
- Safari or Firefox support

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Build tool | Vite | No SSR; client-only output |
| Framework | React + TypeScript | |
| Styling | Tailwind CSS | Mobile-first defaults |
| UI components | shadcn/ui | Source-copied, not a runtime dependency |
| Inference | `@mlc-ai/web-llm` | In-browser inference via WebGPU |
| Backend | None | 100% static |
| Deployment | Vercel (primary) / Cloudflare Pages | Free tier; standard `dist/` output |

---

## Application Architecture

The app is a single-page application with no routing. All state is in-memory and resets on page refresh.

```
┌─────────────────────────────────────────────┐
│                  Browser                    │
│                                             │
│   ┌─────────────┐     ┌─────────────────┐   │
│   │  React UI   │────▶│  WebLLM Engine  │   │
│   │  (Vite/TS)  │◀────│  (@mlc-ai/      │   │
│   │             │     │   web-llm)      │   │
│   └─────────────┘     └────────┬────────┘   │
│                                │            │
│                    ┌───────────▼──────────┐ │
│                    │  WebGPU (GPU driver) │ │
│                    └──────────────────────┘ │
│                                             │
│   Model weights cached in:                  │
│   Cache API / IndexedDB (managed by WebLLM) │
└─────────────────────────────────────────────┘
```

### State

| State | Location | Lifetime |
|---|---|---|
| Chat messages | React state (`useState`) | Session only |
| Model load status / progress | React state | Session only |
| Model weights | Browser Cache API / IndexedDB | Persistent across sessions |

There are no environment variables, no `.env` files, and no build-time secrets.

---

## Model

A single model is hardcoded — there is no user-facing model selection.

**Selection criteria:** small footprint, fast first inference, runs comfortably on a mid-range GPU.

**Candidates (pick one at implementation time):**

- `Llama-3.2-1B-Instruct`
- `Phi-3.5-mini-instruct`
- `SmolLM2-1.7B-Instruct`

**Caching behavior:** On first visit, WebLLM downloads the model weights and caches them via the browser's Cache API and/or IndexedDB. Subsequent visits load the model from cache — no re-download.

---

## UI Specification

The app has three distinct states:

### 1. Unsupported Browser

Shown when `navigator.gpu` is unavailable (i.e., not Chrome/Edge on desktop).

- Friendly, non-technical message explaining the limitation
- Suggest switching to Chrome or Edge desktop
- No spinner, no crash — just a clean static message

### 2. Model Loading Screen

Shown on first visit (or if cache is cleared) while the model downloads and initializes.

- This is the most important UX moment in the app
- Display a progress indicator — percentage or progress bar tied to WebLLM's load callbacks
- Descriptive status text (e.g., "Downloading model weights… 42%", "Initializing…")
- Optionally note that this only happens once (model is cached)

### 3. Chat Interface

Active once the model is ready.

**Message list**
- Scrollable list of user and assistant message bubbles
- Visually distinct alignment or color per role
- Auto-scrolls to latest message

**Input area**
- Single-line or multi-line text input
- Submit on `Enter` (desktop); explicit send button for touch
- Input disabled while a response is streaming

**Streaming output**
- Tokens rendered incrementally as WebLLM emits them via async iterator
- No submit button / input activity while streaming

---

## Browser Support

| Browser | Support |
|---|---|
| Chrome desktop | Full support |
| Edge desktop | Full support |
| Firefox | Not supported (WebGPU unavailable) |
| Safari | Not supported (WebGPU unavailable or behind flags) |
| Mobile Chrome | Layout works; inference untested, no special handling |
| Mobile Safari | Not supported |

Detection: check `navigator.gpu` at startup. If absent, render the unsupported browser screen.

---

## Deployment

- Build command: `vite build`
- Output directory: `dist/`
- No server-side rendering, no API routes, no environment variables
- Deploy as a static site to **Vercel** (primary) or **Cloudflare Pages**
- No special headers or redirects required beyond a standard SPA fallback (all routes → `index.html`)

---

## Open Technical Notes

**WebGPU availability**
WebGPU is a relatively new API. As of mid-2025, it is enabled by default in Chrome 113+ and Edge 113+. Firefox and Safari support is partial or behind flags. This project does not attempt to polyfill or work around missing WebGPU.

**Model weight size**
Depending on the chosen model, initial download is 500 MB–2 GB. Users on slow connections will wait. The loading screen must communicate this clearly. After first load, the browser cache eliminates the wait.

**WebLLM version pinning**
`@mlc-ai/web-llm` is under active development. Pin to a specific version at project init to avoid breaking changes to the model registry or API surface.

**COOP/COEP headers**
WebLLM may require `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers for `SharedArrayBuffer` support. Vercel and Cloudflare Pages support custom response headers via config files (`vercel.json` / `_headers`). Verify at integration time.
