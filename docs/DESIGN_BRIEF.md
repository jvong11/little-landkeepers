# Little Landkeepers Design Brief and Development Roadmap

Version 1 • October 30, 2026

Little Landkeepers is a free browser game where children grow food, care for creatures, and build a garden of their own. Mathematical thinking helps them accomplish things they care about. The first playable experience, Pip’s First Picnic, tests whether caring, creating, and planning form an enjoyable foundation for further learning.

## Product direction

Build and test individual games before creating the broader game library website. The eventual collection can support browsing by interest, skill, grade, and age, with optional adult-facing donations. The first game focuses on early number skills. Initial family playtesters do not define the audience; testing should eventually include children at different skill levels.

Learning belongs inside actions and consequences. Avoid unrelated quizzes that grant permission to play. Creative activity remains available between requests. Reading support is independent of mathematical challenge; this prototype is not a complete reading curriculum.

## Visual direction and devices

Use a miniature stylized 3D world with an elevated, fixed orthographic camera. Match the approved concepts: warm wood, cream, sage greens, terracotta, rounded cottages, expressive creatures, and clear planting beds. Preserve countable objects and generous space around interactive targets. The concept images establish art direction rather than production-ready models.

Design for mouse and touch on computers and tablets. Rotation of the world is outside prototype scope. Object rotation is supported. Keep the garden small, with simple geometry and restrained shadows; verify performance on an actual school-class laptop and tablet before expanding the scene.

Approved garden and asset concept images are retained separately by the project owner.

## Player actions

The game fills the browser viewport with floating controls and a building tray. The player acts directly as caretaker. Creatures move around the garden; controlling a walking player avatar is outside scope. Tap to select and tap to place is the primary interaction. Dragging may be added as an optional shortcut.

| Action | Interaction and result |
| --- | --- |
| Build | Select an item, turn it if desired, and tap a valid ground space to build immediately. Undo reverses the latest new placement. Invalid placement explains the obstruction without building. |
| Plant | Select carrot seeds and an empty soil cell. One seed produces one carrot. |
| Water | Select the can and a planted cell. One watering starts growth; show wet soil and a visible growth state. |
| Harvest | Select a ripe carrot. Transfer exactly one carrot to the basket and clear that cell for replanting. |
| Prepare food | Select a carrot from the basket and a plate. Transfer one carrot. Food can also move between plates or back into the basket. |
| Ring the picnic bell | Guests inspect their meals. If every plate meets its request, the picnic begins; otherwise the arrangement remains editable. |
| Rearrange | Select an object to move, rotate, or return to the building tray. Tapping a destination for an existing item opens a confirmation over the garden. Confirm commits the move; cancellation preserves the original placement. |

Plates accept extra food rather than rejecting incorrect placements. Keep inventory and plate contents visible and countable. Do not highlight the correct mathematical destination after each action. Consume requested portions only when the picnic succeeds; return extras to the basket. Food is never lost on an unsuccessful attempt.

Moving a planted bed preserves its crops and growth. Before returning a bed to the tray, its planted cells must be cleared or harvested; explain this with pictures and narration so removal never silently destroys work. Homes, beds, and decorations cannot overlap; paths use their own ground layer. Reserve access to the picnic and essential growing space.

## Learning and challenge settings

Start with counting, quantity matching, comparing distributions, and finding missing amounts. Use pictures plus numerals, with optional narration. No countdowns, penalties, or forced progression.

| Opening situation | Standard example | Purpose |
| --- | --- | --- |
| Pip’s lunch | One guest requests three carrots. | Match a quantity. |
| Friends visit | Pip and two friends each request one carrot. | Distribute one serving per guest. |
| Unfinished picnic | Two guests request two carrots each; one carrot is already on a plate. | Complete partly filled groups. |

The starting setting limits the total requested food to five; the expanded setting allows totals up to ten. This limit applies to the whole picnic, not ten per guest. Include prefilled food in the total and keep every generated request feasible. Initial values are content configuration and may change after playtesting.

Adults choose the starting setting and can change it without losing the garden. Apply changes to the next request to preserve an in-progress arrangement. Tutorial completion, challenge experience, and discoveries are saved separately. Successful play is not treated as proof of mastery, and response speed does not determine difficulty. Automatic adaptation comes later.

Too little food prompts a creature to show its request alongside its plate. Extra food stays available for redistribution. Success produces a shared picnic animation and story progress. Accept any strategy that results in a valid arrangement.

## Building freedom and discoveries

Supply reusable basic homes, beds, paths, and decorations from the beginning, within the clearing’s capacity. Moving costs nothing and removed items return to the tray. Seeds and water remain available; short crop cycles run during active play while children can build. There is no currency or energy system in the prototype.

Helping creatures introduces new creative options through the story, including a flower decoration. Discovery rewards remain accessible at either challenge setting. After three opening picnics, leave the garden open and offer optional repeatable picnics with varied guests, quantities, and prefilled plates. Repeated picnics do not repeatedly grant the same discovery. Children may decline or pause requests and continue decorating.

## Guidance and opening session

Introduce one control at a time through short picture-supported instructions and optional spoken guidance. Help is always available to replay instructions. Control guidance can highlight tools and valid interaction targets. Mathematical help is requested and progresses from inspecting requests, to comparing requests with plates, to counting together.

The opening targets approximately ten minutes, without enforcing a duration:

1. Choose a garden slot and meet Pip.
2. Begin with an empty clearing and Pip waiting by the entrance. Tap a space to place Pip’s one available home immediately. Other building options become available.
3. Learn to plant, water, and harvest carrots.
4. Prepare Pip’s lunch and ring the bell; revise if needed.
5. Build or decorate freely, then accept visiting friends’ picnic request.
6. Try the partly prepared picnic and discover a new decoration.
7. Continue gardening, redesign, or accept another picnic.

No mandatory typing is required. Essential instructions must remain understandable with audio off. Narration needs mute and replay controls, and must not be the only feedback channel.

## Saving

Provide three browser-local garden slots with creature icons and optional nicknames. Autosave meaningful completed actions and retain the last valid save if a write fails. Show a save issue instead of claiming success. Save layout, crop states, food, current request, tutorial stage, discoveries, challenge setting, and preferences.

Use a versioned save format and a storage interface that can later support accounts. Local saves belong to the current browser origin and device; clearing browser data can remove them. Preview and production origins have separate saves. Resetting a slot requires an explicit confirmation. Accounts and cross-device synchronization are deferred.

## Technical stack and architecture

| Layer | Choice |
| --- | --- |
| Language and build | TypeScript and Vite |
| Interface | React and CSS |
| World rendering | Three.js with React Three Fiber; orthographic camera |
| Application state | Zustand |
| Local persistence | IndexedDB |
| Assets | Optimized GLB models, textures, and animation clips |
| Verification | Vitest for rules; Playwright for key browser flows |
| Source and development | GitHub and Codespaces |
| Deployment | Cloudflare Pages |

Separate game rules from rendering and interface. Use serializable world state, stable object IDs, explicit actions, and data-driven object footprints, crop yields, requests, hints, and discoveries. Animation reflects committed state and does not control inventory arithmetic. Keep frame-by-frame animation outside frequent React state updates. A full physics engine is unnecessary for grid placement and simple creature movement.

Suggested repository layout: src/game for rules and content, src/world for rendering and movement, src/ui for controls and guidance, src/storage for saves, public/assets for models and audio, and docs for this brief. Pin compatible stable package versions when scaffolding, commit the lockfile, and use the same supported Node version in Codespaces, CI, and deployment.

## Development and review workflow

Work on feature branches, review previews, merge approved work to dev, and promote tested milestones to main. Cloudflare deploys main to production and dev to a consistent branch preview address. PR previews support focused review. Use the dev address for ongoing family testing to keep the browser save origin consistent.

Codespaces uses one fixed Vite port bound to 0.0.0.0, declared in the devcontainer configuration with strict port selection. Forwarding is useful for immediate checks; Cloudflare previews remain the fallback. The static deployment builds with npm run build and publishes dist. CI runs type checking, relevant tests, and the production build. Run checks against actual rendered interactions where canvas input is involved.

## Implementation milestones

| Milestone | Deliverable | Acceptance |
| --- | --- | --- |
| 0 Setup | Repository, pinned dependencies, Codespaces configuration, CI, Cloudflare previews, and project documentation. | A minimal build loads from a deployed preview; dev and production routing are verified. |
| 1 Garden building | Orthographic clearing, grid, basic home, bed, paths, decorations, immediate new placement, Undo, movement with on-world confirmation, rotation, cancellation. | Mouse and touch placement work; overlap rules hold; cancellation preserves objects; scenes stay readable. |
| 2 Growing | Plant, water, grow, harvest, and countable basket. | Each plant yields one carrot; repeated clicks cannot duplicate harvest; moving a bed preserves its crops. |
| 3 Picnics | Three opening situations, editable plates, bell, creature feedback, and success. | Transfers conserve food; insufficient and extra servings remain editable; successful consumption happens once. |
| 4 Guided progression | Replayable onboarding, optional hints, two quantity settings, discoveries, and repeatable requests. | Guidance explains controls; all requests are feasible; decoration remains available; difficulty changes preserve progress. |
| 5 Persistence and playtest | Three slots, versioned autosaves, reload recovery, device checks, sound controls, and visual polish. | Slots stay separate; in-progress play restores; save failure is visible; children can complete and revisit a session. |

Build milestones incrementally; integrate saving earlier if needed to validate state design. Use simple temporary models first, then replace them with finished art after interactions are validated.

## Playtesting and completion criteria

Observe whether children can plant, harvest, place objects, and prepare food without repeated adult intervention. Record confusing controls separately from mathematical uncertainty. Change a request to see whether they adjust their plan; do not infer understanding from one completed picnic. Watch whether they voluntarily rearrange the garden or express a next goal.

Verify reloads during planting and picnic preparation, repeated taps during animations, switching slots, changing difficulty, and removing or moving objects. Check both mouse and real touch input, audio-off play, text readability, and rendering on representative devices. Capture initial frame-rate and load-size measurements before setting firm performance budgets.

The prototype is ready for family testing when all opening situations are playable, editing is reversible, saving works, no action can strand the player, and the garden remains usable after the opening sequence. Wider educational effectiveness requires broader playtesting.

## Future learning progression

| Garden system | Concepts |
| --- | --- |
| Growing and food requests | Counting, comparing, addition, subtraction, missing quantities |
| Storage bundles | Groups of five and ten; foundations for place value |
| Sharing harvests | Equal sharing, division, leftovers |
| Planting rows | Arrays, repeated addition, multiplication |
| Building habitats | Shapes, measurement, area, perimeter |
| Recipes | Fractions and measurement |
| Garden market | Prices, decimals, ratios, proportional reasoning |

These are expansion directions, not prototype requirements or a fixed curriculum sequence. Care, building, and growing can become separate challenge branches. New tools should make new mathematical strategies useful. Dedicated reading mechanics, more crops and creatures, additional clearings, automatic adaptation, accounts, donations, and the multi-game catalog are later work.

## Implementation handoff

Begin with milestone 0, then milestone 1. The source repository is jvong11/little-landkeepers. Cloudflare Pages integration is connected and verified, with main for production and a separate dev preview. The first reviewable gameplay milestone is a browser scene where a child can place, move, rotate, and remove building pieces with clear feedback.

Placed pieces first open an on-garden actions menu with a four-direction Move icon and Cancel. Clicking away dismisses the menu. Move starts a pointer-following preview (tap a destination on touch), then the destination uses Move here / Cancel confirmation. The original remains in place until confirmed.
