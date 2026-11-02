# Little Landkeepers

A browser garden game where children learn through caring, building, and experimenting.

## Current milestone

Project foundation: React, TypeScript, Vite, Three.js / React Three Fiber, and a temporary orthographic garden scene.
The preview is an initial rendering check; building, growing, picnics, and browser saves are subsequent milestones.

## Run locally or in Codespaces

Use the Node version in .nvmrc (24.22.1), then:

```sh
npm ci
npm run dev
```

Open port 5173. The repository configures Codespaces forwarding automatically.

## Validate

```sh
npm run typecheck
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

See [Development and deployment](docs/DEVELOPMENT.md) for Cloudflare setup and the main/dev review workflow.
See [Design brief](docs/DESIGN_BRIEF.md) for the agreed game design and milestone acceptance criteria.

## Stack

React and CSS for UI; Three.js with React Three Fiber for the 3D world; Zustand for upcoming game state;
IndexedDB planned for browser-local saves. No backend or accounts in the prototype.
Cloudflare Pages publishes dist after npm run build. Git integration must be connected separately.

All rights reserved pending an explicit project license. Public source visibility does not grant reuse rights.
