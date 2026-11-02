# Development and testing

## Start in Codespaces

Create a Codespace from the setup branch during review, then from dev after merging.
The container installs Node using .nvmrc and runs npm ci. Start the app with npm run dev.
Open port 5173 in the Ports panel. It stays fixed; if occupied, the command fails instead of silently switching ports.
Keep forwarded ports private for development. Use Cloudflare previews for family testing.

## Commands

- npm ci: install exact locked dependencies.
- npm run dev: immediate development preview on port 5173.
- npm run typecheck: check all TypeScript source and test configuration.
- npm test: game rule/content tests.
- npm run build: type checking and production build to dist.
- npm run preview: serve a completed build on port 4173.
- npx playwright install --with-deps chromium: first-time browser test setup.
- npm run test:e2e: desktop and tablet-sized Chromium smoke checks against dist.

Run npm run build before browser tests. Automated tablet emulation does not replace actual tablet and school laptop testing.
The first rule tests validate picnic content constraints, including the whole-request quantity limit.
The builder supports placement/editing and growing; persistence and picnics are later work.
Placement tests cover footprints, overlaps, shared terrain, reachable doors, inventory, and transactional cancellation.
Browser tests pick actual canvas cells with mouse and touch and exercise keyboard placement.

## Branches and review

main holds approved releases. dev is the integration and ongoing family-testing branch.
Create feature branches from dev and open PRs back to dev. Promote dev to main after review.
CI checks pull requests to both branches and pushes to main/dev.
Do not assume required status checks are enforced until branch protections have been configured.

## Cloudflare Pages setup

Connect jvong11/little-landkeepers through Cloudflare Pages Git integration.
Use production branch main; framework Vite; build command npm run build; build output dist.
Set NODE_VERSION to 24.22.1 if the build environment does not pick up .node-version.
Enable preview deployments for dev and feature branches. Use the stable dev branch alias for ongoing playtests.
No server runtime, database, API keys, or Cloudflare token in the repository are needed for this static build.
Check deployment logs and the actual preview URL before considering hosting verified.
Cloudflare Git integration is connected and verified. Production uses main; dev has a separate stable preview at https://dev.little-landkeepers.pages.dev/. All non-production branches deploy previews.

## First deployment verification

Open the deployed build on computer and tablet. Verify the 3D garden renders, there is no horizontal overflow,
and browser logs have no application errors. Test a PR update and the dev branch alias before using them for reviews.
Browser saves will be separate across dev, PR, production, and Codespaces origins.

## Architecture

src/game contains pure rules and configurable content. src/world renders committed game state.
src/ui owns interface and guidance. src/storage will provide the persistence adapter.
Keep movement/animation updates out of frequent React state changes. Avoid quiz gates, timers, or paid progression.
No account service or analytics is configured. Use temporary geometry until interactions are proven.

## Next milestone

Milestone 1 implements data-driven footprints and immediate tap-to-build placement, Undo for the latest new piece, immediate movement after choosing Move, Undo move, rotation, return-to-tray, obstruction feedback, and reachable doors and shared areas. The clearing starts empty with Pip’s home selected. Only one home is available; placing it opens creative building. The game fills the viewport and includes an optional Fullscreen button. Paths occupy their own layer and may run beneath structures.

Milestone 2 adds one seed per soil space, watering, six seconds of active-tab growth, harvest, and a countable basket. The permanent patch and each built bed provide two soil spaces. Crops retain stable bed/slot identity through movement, rotation, and undo. Returning a planted bed or undoing its placement is blocked until harvest. Growth pauses in hidden tabs, with no offline catch-up. There is no currency, seed limit, water limit, countdown, or quiz gate. Soil spaces offers keyboard-accessible equivalents of the same canvas actions.

Next: editable picnic plates, Pip’s lunch request, and a bell. Continue real-device testing with children.

## Building review checklist

1. Start on an empty clearing. Turn Pip’s home if desired, then tap a valid space; it must build immediately without confirmation. Other tray pieces become available.
2. Tap a placed piece or select it in the Garden pieces dialog. The map action menu must show Move and Cancel. Clicking away dismisses it. Choose Move, then cancel the preview; the original position must remain.
3. Choose Move, preview and tap a valid destination; it must move immediately. Undo move must restore its original position and rotation. Move it again, then return it to the tray; availability must increase.
4. Try overlaps, garden edges, shared spaces, and blocking a front door; invalid new taps must not build. Invalid moves must explain the problem, leave the original untouched, and keep the preview editable.
5. Try Undo placement, Help, keyboard arrows, and the optional Fullscreen control on computer and tablet. Check that the main game does not scroll and controls remain in the viewport.
6. Reload to confirm this milestone intentionally starts fresh; browser saving is not implemented yet.

Placed pieces first open an on-garden actions menu with a four-direction Move icon and Cancel. Clicking away dismisses the menu. Move starts a pointer-following preview (tap a destination on touch). A valid destination tap moves immediately. Cancel or Escape preserves the original during preview; Undo move restores the previous position and rotation after placement. Invalid taps keep the preview active.

## Growing review checklist

1. Build Pip’s home. Choose Seeds and tap either of the two brown soil spaces; exactly one seed appears. Repeated planting does not replace it.
2. Choose Water and tap the seed. Wet soil and growing leaves appear; watering twice does not restart growth. Hidden tabs do not advance crops.
3. Choose Harvest and tap a ripe orange carrot. Basket increases by exactly one; repeated taps cannot duplicate it. Empty soil can be replanted.
4. Plant a built bed, move and turn it, then undo its move. Plants and growth remain attached. Returning it and undoing its initial placement stay blocked until all plants are harvested.
5. Open Basket to count individual carrots grouped by ten; open Soil spaces to use labeled keyboard buttons for the same soil. Escape returns from growing to building.
