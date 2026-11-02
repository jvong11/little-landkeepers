# Little Landkeepers

A browser garden game where children learn through caring, building, and experimenting.

## Current milestone

Garden building: choose homes, beds, paths, flowers, lanterns, and benches; turn and tap to build immediately, or move existing pieces with an on-world confirmation. Shared growing/picnic spaces and reachable home doors are protected.

Use the Help button for controls. Tap-to-place, mouse, keyboard arrows, and placement buttons are supported. The game fills the browser, starts with an empty clearing and one home for Pip, and offers optional browser fullscreen. New placements have Undo. This build uses temporary models and resets on reload. Growing, picnics, and browser saves are later milestones.

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

## Live environments

- Production from main: https://little-landkeepers.pages.dev/
- Integration testing from dev: https://dev.little-landkeepers.pages.dev/
- Feature branches receive Cloudflare previews; review these before merging.

Placed pieces first open an on-garden actions menu with a four-direction Move icon and Cancel. Clicking away dismisses the menu. Move starts a pointer-following preview (tap a destination on touch), then the destination uses Move here / Cancel confirmation. The original remains in place until confirmed.
