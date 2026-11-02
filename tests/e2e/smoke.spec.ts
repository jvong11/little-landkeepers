import { expect, test, type Page } from '@playwright/test';
import { OrthographicCamera, Vector3 } from 'three';
import { CAMERA_POSITION, gardenZoom } from '../../src/world/camera';

async function chooseCell(page: Page, x: number, z: number, touch: boolean, hover = false) {
  const bounds = await page.locator('canvas').boundingBox();
  if (!bounds) throw new Error('Garden canvas is missing');
  const camera = new OrthographicCamera(-bounds.width / 2, bounds.width / 2, bounds.height / 2, -bounds.height / 2, .1, 100);
  camera.position.set(...CAMERA_POSITION);
  camera.zoom = gardenZoom(bounds.width, bounds.height);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  const point = new Vector3(x + .5 - 5, .005, z + .5 - 4).project(camera);
  const screenX = bounds.x + (point.x + 1) * bounds.width / 2;
  const screenY = bounds.y + (1 - point.y) * bounds.height / 2;
  if (hover) await page.mouse.move(screenX, screenY);
  else if (touch) await page.touchscreen.tap(screenX, screenY);
  else await page.mouse.click(screenX, screenY);
}
async function openGarden(page: Page) {
  await page.goto('/');
  await expect(page.getByTestId('garden-world')).toHaveAttribute('data-render-status', 'ready');
}
async function openPieces(page: Page) { await page.getByRole('button', { name: 'Garden pieces', exact: true }).click(); }
async function selectPiece(page: Page, name: RegExp) {
  await openPieces(page);
  await page.getByRole('button', { name }).click();
}
test('starts empty, fills the browser, and builds Pip’s home immediately', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', (error) => errors.push(error.message));
  await openGarden(page);
  await expect(page).toHaveTitle('Little Landkeepers');
  await expect(page.getByRole('button', { name: 'Build Bench', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: /Place here/ })).toHaveCount(0);
  await openPieces(page);
  await expect(page.getByRole('dialog', { name: 'Garden pieces' })).toContainText('Your clearing is ready');
  await expect(page.getByRole('button', { name: /^Move / })).toHaveCount(0);
  await page.getByRole('button', { name: 'Close Garden pieces', exact: true }).click();
  await chooseCell(page, 1, 1, info.project.name === 'tablet-chromium');
  await expect(page.getByRole('button', { name: 'Build Home', exact: true })).toContainText('0 in tray');
  await expect(page.getByRole('button', { name: 'Build Bench', exact: true })).toBeEnabled();
  await expect(page.getByRole('dialog', { name: 'Confirm move' })).toHaveCount(0);
  await openPieces(page);
  await expect(page.getByRole('button', { name: /^Move Home / })).toHaveCount(1);
  await page.getByRole('button', { name: 'Close Garden pieces', exact: true }).click();
  expect(await page.evaluate(() => ({ horizontal: document.documentElement.scrollWidth <= innerWidth, vertical: document.documentElement.scrollHeight <= innerHeight }))).toEqual({ horizontal: true, vertical: true });
  expect(errors).toEqual([]);
});
test('turns new pieces before tapping and confirms moves in an on-world pop-up', async ({ page }, info) => {
  const touch = info.project.name === 'tablet-chromium';
  await openGarden(page);
  await chooseCell(page, 1, 1, touch);
  await page.getByRole('button', { name: 'Build Bench', exact: true }).click();
  await page.getByRole('button', { name: 'Turn', exact: false }).click();
  await chooseCell(page, 3, 3, touch);
  await expect(page.getByRole('button', { name: 'Build Bench', exact: true })).toContainText('3 in tray');
  await selectPiece(page, /^Move Bench /);
  await expect(page.getByRole('dialog', { name: 'Confirm move' })).toHaveCount(0);
  await chooseCell(page, 6, 3, touch);
  const confirmation = page.getByRole('dialog', { name: 'Confirm move' });
  await expect(confirmation).toBeVisible();
  await confirmation.getByRole('button', { name: 'Cancel', exact: false }).click();
  await expect(confirmation).toHaveCount(0);
  await selectPiece(page, /^Move Bench /);
  // The original bench still occupies 3,3 after cancellation; another solid cannot use its cell.
  await page.getByRole('button', { name: 'Cancel', exact: false }).click();
  await page.getByRole('button', { name: 'Build Flowers', exact: true }).click();
  await chooseCell(page, 3, 3, touch);
  await expect(page.getByTestId('placement-feedback')).toContainText('already here');
  await page.getByRole('button', { name: 'Cancel', exact: false }).click();
  await selectPiece(page, /^Move Bench /);
  await chooseCell(page, 6, 3, touch);
  await confirmation.getByRole('button', { name: 'Move here', exact: false }).click();
  await page.getByRole('button', { name: 'Build Flowers', exact: true }).click();
  await chooseCell(page, 3, 3, touch);
  await expect(page.getByRole('button', { name: 'Build Flowers', exact: true })).toContainText('11 in tray');
  await selectPiece(page, /^Move Bench /);
  await page.getByRole('button', { name: 'Return to tray', exact: false }).click();
  await expect(page.getByRole('button', { name: 'Build Bench', exact: true })).toContainText('4 in tray');
});
test('rejects invalid taps and supports undo without a placement confirmation', async ({ page }, info) => {
  const touch = info.project.name === 'tablet-chromium';
  await openGarden(page);
  await chooseCell(page, 8, 6, touch);
  await expect(page.getByTestId('placement-feedback')).toContainText('shared space');
  await expect(page.getByRole('button', { name: 'Build Home', exact: true })).toContainText('1 in tray');
  await chooseCell(page, 1, 1, touch);
  await page.getByRole('button', { name: 'Undo placement', exact: false }).click();
  await expect(page.getByRole('button', { name: 'Build Home', exact: true })).toContainText('1 in tray');
  await expect(page.getByRole('button', { name: 'Build Bench', exact: true })).toBeDisabled();
});
test('offers replayable help and keyboard placement', async ({ page }) => {
  await openGarden(page);
  await page.getByRole('button', { name: 'Help', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Let’s build together' })).toContainText('It builds right away');
  await page.getByRole('button', { name: 'Close Let’s build together', exact: true }).click();
  const garden = page.getByTestId('garden-world');
  await garden.focus(); await garden.press('ArrowRight'); await garden.press('Enter');
  await expect(page.getByRole('button', { name: 'Build Home', exact: true })).toContainText('0 in tray');
  await expect(page.getByRole('button', { name: 'Enter fullscreen', exact: true })).toBeVisible();
});

test('placed pieces open an actions menu before moving, with dismissal and hover preview', async ({ page }, info) => {
  const touch = info.project.name === 'tablet-chromium';
  await openGarden(page);
  await chooseCell(page, 1, 1, touch);
  await chooseCell(page, 1, 1, touch);
  const actions = page.getByRole('dialog', { name: 'Piece actions' });
  await expect(actions).toBeVisible();
  await expect(page.getByLabel('Placement tools')).toHaveCount(0);
  await actions.getByRole('button', { name: 'Cancel' }).click();
  await expect(actions).toHaveCount(0);
  await chooseCell(page, 1, 1, touch);
  await chooseCell(page, 6, 3, touch);
  await expect(actions).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: 'Confirm move' })).toHaveCount(0);
  await chooseCell(page, 1, 1, touch);
  await actions.getByRole('button', { name: 'Move', exact: true }).click();
  await expect(actions).toHaveCount(0);
  await expect(page.getByLabel('Placement tools')).toBeVisible();
  if (!touch) {
    await chooseCell(page, 7, 5, false, true);
    await expect(page.getByTestId('placement-feedback')).toContainText('shared space');
    await chooseCell(page, 4, 2, false, true);
    await expect(page.getByTestId('placement-feedback')).toContainText('preview');
    await expect(page.getByRole('dialog', { name: 'Confirm move' })).toHaveCount(0);
  }
  await chooseCell(page, 4, 2, touch);
  const confirmation = page.getByRole('dialog', { name: 'Confirm move' });
  await expect(confirmation).toBeVisible();
  await confirmation.getByRole('button', { name: 'Cancel', exact: false }).click();
  await chooseCell(page, 1, 1, touch);
  await expect(actions).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(actions).toHaveCount(0);
});
