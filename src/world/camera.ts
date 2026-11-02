export const CAMERA_POSITION: [number, number, number] = [11, 13, 14];
// Fit the whole board on narrow and wide devices; no camera rotation is needed.
export const gardenZoom = (width: number, height: number) => Math.min(width / 15, height / 12);
