import { expect, test, type Page } from '@playwright/test';
import { OrthographicCamera, Vector3 } from 'three';
import { CAMERA_POSITION, gardenZoom } from '../../src/world/camera';

async function chooseCell(page: Page, x: number, z: number, touch: boolean) {
  const canvas = page.locator('canvas');
  await canvas.scrollIntoViewIfNeeded();
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error('Garden canvas is missing');
  const camera = new OrthographicCamera(-bounds.width / 2, bounds.width / 2, bounds.height / 2, -bounds.height / 2, .1, 100);
  camera.position.set(...CAMERA_POSITION);
  camera.zoom = gardenZoom(bounds.width, bounds.height);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  const point = new Vector3(x + .5 - 5, .005, z + .5 - 4).project(camera);
  const screenX = bounds.x + (point.x + 1) * bounds.width / 2;
  const screenY = bounds.y + (1 - point.y) * bounds.height / 2;
  if (touch) await page.touchscreen.tap(screenX, screenY);
  else await page.mouse.click(screenX, screenY);
}
async function openGarden(page: Page) {
  await page.goto('/');
  await expect(page.getByTestId('garden-world')).toHaveAttribute('data-render-status', 'ready');
}
test('loads the builder without runtime errors or horizontal overflow', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openGarden(page);
  await expect(page).toHaveTitle('Little Landkeepers');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Build Home', exact: true })).toBeEnabled();
  await expect(page.locator('canvas')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
test('places, turns, moves, cancels, and returns a bench through real world picking', async ({ page }, info) => {
  const touch = info.project.name === 'tablet-chromium';
  await openGarden(page);
  await page.getByRole('button', { name: 'Build Bench', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Place here' })).toBeDisabled();
  await chooseCell(page, 3, 3, touch);
  await expect(page.getByTestId('placement-feedback')).toContainText('This spot works');
  await page.getByRole('button', { name: 'Turn piece' }).click();
  await expect(page.getByText('1 × 2 garden spaces', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Place here' }).click();
  await expect(page.getByText('Garden pieces (5)', { exact: true })).toBeVisible();
  await page.getByText('Garden pieces (5)', { exact: true }).click();
  await page.getByRole('button', { name: /^Move Bench / }).click();
  await chooseCell(page, 6, 3, touch);
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: /^Move Bench / }).click();
  await page.getByText('Placement arrows', { exact: true }).click();
  await expect(page.getByText('Column 4, row 4', { exact: true })).toBeVisible();
  await chooseCell(page, 6, 3, touch);
  await page.getByRole('button', { name: 'Keep this spot' }).click();
  await page.getByRole('button', { name: /^Move Bench / }).click();
  await page.getByText('Placement arrows', { exact: true }).click();
  await expect(page.getByText('Column 7, row 4', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Return to tray' }).click();
  await expect(page.getByText('Garden pieces (4)', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Build Bench', exact: true })).toContainText('4 in tray');
});
test('explains collisions and reserved spaces without committing', async ({ page }, info) => {
  await openGarden(page);
  await page.getByRole('button', { name: 'Build Flowers', exact: true }).click();
  await chooseCell(page, 1, 1, info.project.name === 'tablet-chromium');
  await expect(page.getByTestId('placement-feedback')).toContainText('already here');
  await expect(page.getByRole('button', { name: 'Place here' })).toBeDisabled();
  await chooseCell(page, 8, 6, info.project.name === 'tablet-chromium');
  await expect(page.getByTestId('placement-feedback')).toContainText('shared space');
  await expect(page.getByRole('button', { name: 'Place here' })).toBeDisabled();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByText('Garden pieces (4)', { exact: true })).toBeVisible();
});
test('supports keyboard placement and replayable control guidance', async ({ page }) => {
  await openGarden(page);
  await page.getByRole('button', { name: 'Help', exact: false }).click();
  await expect(page.getByRole('heading', { name: 'Let’s build together' })).toBeVisible();
  await page.getByRole('button', { name: 'Build Flowers', exact: true }).click();
  const garden = page.getByTestId('garden-world');
  await garden.focus();
  await garden.press('ArrowRight');
  await garden.press('Enter');
  await expect(page.getByText('Garden pieces (5)', { exact: true })).toBeVisible();
});
