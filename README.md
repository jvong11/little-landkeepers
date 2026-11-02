# Little Landkeepers

A browser garden game where children learn through caring, building, and experimenting.

## Current milestone

Garden building: choose homes, beds, paths, flowers, lanterns, and benches; turn and tap to build immediately, or move existing pieces immediately after choosing Move, with Undo move available. Shared growing/picnic spaces and reachable home doors are protected. Choose Seeds, Water, and Harvest to grow carrots in the permanent patch or built beds; each plant yields one countable carrot.

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

Placed pieces first open an on-garden actions menu with a four-direction Move icon and Cancel. Clicking away dismisses the menu. Move starts a pointer-following preview (tap a destination on touch). A valid destination tap moves immediately. Cancel or Escape preserves the original during preview; Undo move restores the previous position and rotation after placement. Invalid taps keep the preview active.

Growing milestone: unlimited seeds and water, two soil spaces per bed, short active-tab growth, repeatable harvesting, and a countable basket. Crops are keyed to stable bed IDs and local slots, so moving or turning a bed and undoing its move preserves its plants. Planted beds cannot return to the tray or be removed by placement undo until harvested. Soil spaces provides a labeled keyboard alternative to canvas interaction. Saving and picnics are not implemented yet.
