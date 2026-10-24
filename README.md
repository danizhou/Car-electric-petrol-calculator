# PHEV Trip Calculator

Web app that compares the cost of a plug-in hybrid trip started with a full battery against the same trip on petrol only, and shows the electricity break-even price.

**Live: https://danizhou.github.io/Car-electric-petrol-calculator/**

Built with Next.js (App Router) and TypeScript. Installable as a PWA and usable offline.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # unit tests for the calculation logic
npm run build && npm start
```

The service worker is only registered in production builds (`npm run build && npm start`).

## GitHub Pages

Every push to `main` builds a static export and publishes it with GitHub Actions (`.github/workflows/deploy-pages.yml`). The footer of the live site shows the commit it was built from. Pages has no server, so the AI assistant route is left out of that build.

To reproduce the Pages build locally (move `app/api` aside first):

```bash
STATIC_EXPORT=true NEXT_PUBLIC_BASE_PATH=/Car-electric-petrol-calculator npm run build   # output in out/
```

## AI assistant (disabled by default)

The app includes an assistant that answers questions about the trip using Claude (`claude-opus-5-5`) and the same calculation logic, via a `calculate_trip` tool. It is switched off: the section is hidden and `/api/assistant` returns 404.

To enable it, copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_ASSISTANT_ENABLED=true
ANTHROPIC_API_KEY=sk-ant-...
```

The flag is read at build time, so rebuild after changing it. The endpoint has no authentication or rate limiting, so add some before exposing it publicly.

## Structure

```
app/          layout, page, PWA manifest, global styles, api/assistant route
components/   UI: trip inputs, car presets, results
lib/
  calculator.ts   pure calculation logic (scenario A, scenario B, break-even)
  assistant.ts    AI assistant: system prompt, calculate_trip tool, streaming
  features.ts     feature flags
  cars.ts         built-in car presets + custom cars in localStorage
  format.ts       Italian number/currency formatting and parsing
public/       icons and service worker
```

## Adding a car preset

Add an entry to `BUILT_IN_CARS` in `lib/cars.ts`. Cars saved from the UI are stored in the browser only.
