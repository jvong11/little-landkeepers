import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: { host: '0.0.0.0', port: 5173, strictPort: true, allowedHosts: ['terminal.local', '.app.github.dev'] },
  preview: { host: '0.0.0.0', port: 4173, strictPort: true, allowedHosts: ['terminal.local', '.app.github.dev'] },
  test: { include: ['src/**/*.test.ts'] },
});
