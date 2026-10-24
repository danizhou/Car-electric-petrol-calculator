# PHEV Trip Calculator

Web app that compares the cost of a plug-in hybrid trip started with a full battery against the same trip on petrol only, and shows the electricity break-even price.

Built with Next.js (App Router) and TypeScript. Installable as a PWA and usable offline.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # unit tests for the calculation logic
npm run build && npm start
```

The service worker is only registered in production builds (`npm run build && npm start`).

## Structure

```
app/          layout, page, PWA manifest, global styles
components/   UI: trip inputs, car presets, results
lib/
  calculator.ts   pure calculation logic (scenario A, scenario B, break-even)
  cars.ts         built-in car presets + custom cars in localStorage
  format.ts       Italian number/currency formatting and parsing
public/       icons and service worker
```

## Adding a car preset

Add an entry to `BUILT_IN_CARS` in `lib/cars.ts`. Cars saved from the UI are stored in the browser only.
