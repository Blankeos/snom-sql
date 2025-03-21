// Icons
import solidSvg from 'vite-plugin-solid-svg';

// Vike
import vikeSolid from 'vike-solid/vite';
import vike from 'vike/plugin';

// Vite
import vikeRoutegen from '@blankeos/vike-routegen';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '.');

// Tailwindcss
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    vike({ prerender: true }),
    vikeSolid(),
    solidSvg({ defaultAsComponent: false }),
    tailwindcss(),
    vikeRoutegen(),
  ],
  resolve: {
    alias: {
      '@': resolve(root, 'src'),
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },
}));
